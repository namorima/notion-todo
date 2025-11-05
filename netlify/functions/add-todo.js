import fetch from 'node-fetch';
import { requireAuth, createResponse, handleCORS } from './utils/auth.js';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID;

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
    const { name, category, dueDate } = JSON.parse(event.body);

    if (!name) {
      return createResponse(400, { error: 'Name is required' });
    }

    const properties = {
      name: {
        title: [{ text: { content: name } }]
      },
      status: {
        status: { name: 'Not started' }
      }
    };

    if (category && category !== 'Tiada kategori') {
      properties.kategori = {
        select: { name: category }
      };
    }

    if (dueDate) {
      properties['due date'] = {
        date: { start: dueDate }
      };
    }

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return createResponse(response.status, { error: 'Failed to add todo', details: data });
    }

    return createResponse(200, { success: true, data });

  } catch (error) {
    console.error('Error adding todo:', error);
    return createResponse(500, { error: 'Error adding todo' });
  }
}
