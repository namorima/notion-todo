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

  try {
    // Fetch Todos from Notion
    const todoResponse = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sorts: [{ property: 'due date', direction: 'ascending' }]
      })
    });

    const todoData = await todoResponse.json();

    // Helper functions
    const getCategoryEmoji = (category) => {
      const emojiMap = {
        'Penting': '🔥',
        'Segera': '⚡',
        'Pribadi': '👤',
        'Tiada kategori': '📝'
      };
      return emojiMap[category] || '📝';
    };

    const getStatusInfo = (status, dueDate) => {
      if (status === 'Done') {
        return { icon: '✅', color: 'success', text: 'Done' };
      }

      if (dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        if (due < today) {
          return { icon: '❌', color: 'danger', text: 'Overdue' };
        }
      }

      if (!dueDate) {
        return { icon: '❓', color: 'secondary', text: 'No Due Date' };
      }

      return { icon: '✖️', color: 'warning', text: 'Not Started' };
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatCreatedTime = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Transform data
    const todos = todoData.results.map(page => {
      const name = page.properties.name?.title?.[0]?.plain_text || 'Untitled';
      const status = page.properties.status?.status?.name || 'Not started';
      const category = page.properties.kategori?.select?.name || 'Tiada kategori';
      const dueDate = page.properties['due date']?.date?.start || null;
      const createdTime = page.created_time;

      const statusInfo = getStatusInfo(status, dueDate);

      return {
        id: page.id,
        name,
        status,
        category,
        categoryEmoji: getCategoryEmoji(category),
        dueDate,
        dueDateFormatted: formatDate(dueDate),
        statusIcon: statusInfo.icon,
        statusColor: statusInfo.color,
        statusText: statusInfo.text,
        createdTime,
        createdTimeFormatted: formatCreatedTime(createdTime)
      };
    });

    // Sort: Not Done (newest first) then Done (newest first)
    todos.sort((a, b) => {
      if (a.status !== 'Done' && b.status === 'Done') return -1;
      if (a.status === 'Done' && b.status !== 'Done') return 1;
      return new Date(b.createdTime) - new Date(a.createdTime);
    });

    return createResponse(200, { todos });

  } catch (error) {
    console.error('Error fetching todos:', error);
    return createResponse(500, { error: 'Error fetching todos' });
  }
}
