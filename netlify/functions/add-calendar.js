import fetch from 'node-fetch';
import { requireAuth, createResponse, handleCORS } from './utils/auth.js';

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

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return createResponse(405, { error: 'Method not allowed' });
  }

  try {
    const { name, dateStart, dateEnd, location, tags } = JSON.parse(event.body);

    if (!name || !dateStart) {
      return createResponse(400, { error: 'Name and dateStart are required' });
    }

    const properties = {
      Name: {
        title: [{ text: { content: name } }]
      },
      Date: {
        date: dateEnd ? { start: dateStart, end: dateEnd } : { start: dateStart }
      }
    };

    if (location) {
      properties.Location = {
        rich_text: [{ text: { content: location } }]
      };
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagArray.length > 0) {
        properties.Tags = {
          multi_select: tagArray.map(tag => ({ name: tag }))
        };
      }
    }

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: CALENDAR_DATABASE_ID },
        properties
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return createResponse(response.status, { error: 'Failed to add calendar event', details: data });
    }

    return createResponse(200, { success: true, data });

  } catch (error) {
    console.error('Error adding calendar event:', error);
    return createResponse(500, { error: 'Error adding calendar event' });
  }
}
