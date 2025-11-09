import fetch from 'node-fetch';
import { requireAuth, createResponse, handleCORS } from './utils/auth.js';

const NOTION_API_KEY = process.env.NOTION_API_KEY;

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

  // Only allow POST/PUT
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PUT') {
    return createResponse(405, { error: 'Method not allowed' });
  }

  try {
    const { id, name, dateStart, dateEnd, location, tags, done } = JSON.parse(event.body);

    if (!id || !name || !dateStart) {
      return createResponse(400, { error: 'ID, name, and dateStart are required' });
    }

    const properties = {
      Name: {
        title: [{ text: { content: name } }]
      },
      Date: {
        date: dateEnd ? { start: dateStart, end: dateEnd } : { start: dateStart }
      },
      Cuti: {
        checkbox: done === true || done === 'true'
      }
    };

    if (location) {
      properties.Location = {
        rich_text: [{ text: { content: location } }]
      };
    } else {
      properties.Location = {
        rich_text: []
      };
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagArray.length > 0) {
        properties.Tags = {
          multi_select: tagArray.map(tag => ({ name: tag }))
        };
      }
    } else {
      properties.Tags = {
        multi_select: []
      };
    }

    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties })
    });

    const data = await response.json();

    if (!response.ok) {
      return createResponse(response.status, { error: 'Failed to edit calendar event', details: data });
    }

    return createResponse(200, { success: true, data });

  } catch (error) {
    console.error('Error editing calendar event:', error);
    return createResponse(500, { error: 'Error editing calendar event' });
  }
}
