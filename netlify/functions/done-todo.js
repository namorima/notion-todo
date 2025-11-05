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

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return createResponse(405, { error: 'Method not allowed' });
  }

  try {
    const { id } = JSON.parse(event.body);

    if (!id) {
      return createResponse(400, { error: 'ID is required' });
    }

    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          status: {
            status: { name: 'Done' }
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return createResponse(response.status, { error: 'Failed to mark todo as done', details: data });
    }

    return createResponse(200, { success: true, data });

  } catch (error) {
    console.error('Error marking todo as done:', error);
    return createResponse(500, { error: 'Error updating todo' });
  }
}
