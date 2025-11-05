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
    const { id, name, category, dueDate } = JSON.parse(event.body);

    if (!id || !name) {
      return createResponse(400, { error: 'ID and name are required' });
    }

    const properties = {
      name: {
        title: [{ text: { content: name } }]
      }
    };

    if (category && category !== 'Tiada kategori') {
      properties.kategori = {
        select: { name: category }
      };
    } else {
      properties.kategori = {
        select: null
      };
    }

    if (dueDate) {
      properties['due date'] = {
        date: { start: dueDate }
      };
    } else {
      properties['due date'] = {
        date: null
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
      return createResponse(response.status, { error: 'Failed to edit todo', details: data });
    }

    return createResponse(200, { success: true, data });

  } catch (error) {
    console.error('Error editing todo:', error);
    return createResponse(500, { error: 'Error editing todo' });
  }
}
