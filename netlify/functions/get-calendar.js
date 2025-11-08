import fetch from 'node-fetch';
import { requireAuth, createResponse, handleCORS } from './utils/auth.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const CALENDAR_DATABASE_ID = process.env.CALENDAR_DATABASE_ID;

export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  // Verify authentication
  const auth = requireAuth(event.headers);
  if (!auth.authenticated) {
    return createResponse(401, { error: auth.error });
  }

  try {
    // Fetch Calendar Events from Notion
    const calendarResponse = await fetch(`https://api.notion.com/v1/databases/${CALENDAR_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sorts: [{ property: 'Date', direction: 'descending' }]
      })
    });

    const calendarData = await calendarResponse.json();

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const calendar = calendarData.results.map(page => {
      const name = page.properties.Name?.title?.[0]?.plain_text || 'Untitled';
      const dateObj = page.properties.Date?.date;
      const dateStart = dateObj?.start || null;
      const dateEnd = dateObj?.end || null;
      const location = page.properties.Location?.rich_text?.[0]?.plain_text || '';
      const tags = page.properties.Tags?.multi_select?.map(t => t.name) || [];
      const cuti = page.properties.Cuti?.checkbox || false;

      // Format date: if both start and end exist, show "start → end"
      let dateFormatted = '-';
      if (dateStart && dateEnd) {
        dateFormatted = `${formatDate(dateStart)} → ${formatDate(dateEnd)}`;
      } else if (dateStart) {
        dateFormatted = formatDate(dateStart);
      }

      return {
        id: page.id,
        name,
        date: {
          start: dateStart,
          end: dateEnd
        },
        dateFormatted,
        location,
        tags,
        done: cuti
      };
    });

    // Load Malaysia Holidays from JSON file
    let holidays = [];
    try {
      const currentYear = new Date().getFullYear();
      // Use path from project root - Netlify Functions run from project root
      const holidaysFile = join(process.cwd(), 'public', 'holidays.json');

      if (existsSync(holidaysFile)) {
        const holidayFileContent = readFileSync(holidaysFile, 'utf-8');
        const holidayData = JSON.parse(holidayFileContent);

        if (holidayData.year === currentYear) {
          holidays = holidayData.holidays;
          console.log(`✅ Loaded ${holidays.length} holidays for ${holidayData.state} ${currentYear}`);
        } else {
          console.log(`⚠️ Holiday data is for ${holidayData.year}, but current year is ${currentYear}`);
        }
      }
    } catch (holidayError) {
      console.error('Error loading holidays:', holidayError);
    }

    return createResponse(200, { calendar, holidays });

  } catch (error) {
    console.error('Error fetching calendar:', error);
    return createResponse(500, { error: 'Error fetching calendar data' });
  }
}
