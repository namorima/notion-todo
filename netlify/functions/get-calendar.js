import fetch from 'node-fetch';
import { requireAuth, createResponse, handleCORS } from './utils/auth.js';
import { createClient } from '@supabase/supabase-js';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const CALENDAR_DATABASE_ID = process.env.CALENDAR_DATABASE_ID;
const SUPABASE_URL = 'https://fgvzzeaygassjvicxgli.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

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

    // Load Malaysia Holidays from Supabase
    let holidays = [];
    try {
      if (!SUPABASE_KEY) {
        console.warn('⚠️ SUPABASE_KEY not configured, holidays will be empty');
      } else {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const currentYear = new Date().getFullYear();
        const holidayState = process.env.HOLIDAY_STATE || 'Kelantan';

        const { data, error } = await supabase
          .from('holidays')
          .select('id, date, name, state, year')
          .eq('year', currentYear)
          .eq('state', holidayState)
          .order('date', { ascending: true });

        if (error) {
          console.error('❌ Error fetching holidays from Supabase:', error);
        } else if (data) {
          holidays = data;
          console.log(`✅ Loaded ${holidays.length} holidays for ${holidayState} ${currentYear} from Supabase`);
        }
      }
    } catch (holidayError) {
      console.error('Error loading holidays from Supabase:', holidayError);
    }

    return createResponse(200, { calendar, holidays });

  } catch (error) {
    console.error('Error fetching calendar:', error);
    return createResponse(500, { error: 'Error fetching calendar data' });
  }
}
