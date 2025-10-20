import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import session from 'express-session';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID;
const CALENDAR_DATABASE_ID = process.env.CALENDAR_DATABASE_ID;
const HOLIDAY_STATE = process.env.HOLIDAY_STATE || 'Kelantan';
const APP_PASSWORD = process.env.APP_PASSWORD || 'akmal';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'notion-manager-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
app.set('view engine', 'ejs');
app.set('views', __dirname); // Views now in root folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check authentication
function requireAuth(req, res, next) {
  console.log('🔒 Auth check - authenticated:', req.session.authenticated);
  if (req.session.authenticated) {
    next();
  } else {
    console.log('⛔ Not authenticated, redirecting to /login');
    res.redirect('/login');
  }
}

// Helper function to get category emoji
function getCategoryEmoji(category) {
  const emojiMap = {
    'Penting': '🔥',
    'Segera': '⚡',
    'Pribadi': '👤',
    'Tiada kategori': '📝'
  };
  return emojiMap[category] || '📝';
}

// Helper function to get status icon and color
function getStatusInfo(status, dueDate) {
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
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Format created time
function formatCreatedTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Login page
app.get('/login', (req, res) => {
  console.log('📋 Login page accessed');
  if (req.session.authenticated) {
    console.log('✅ User already authenticated, redirecting to /');
    return res.redirect('/');
  }
  console.log('🔐 Showing login page');
  res.render('login', { error: null });
});

// Login authentication
app.post('/login', (req, res) => {
  const { password } = req.body;
  console.log('🔑 Login attempt');

  if (password === APP_PASSWORD) {
    req.session.authenticated = true;
    console.log('✅ Login successful');
    res.redirect('/');
  } else {
    console.log('❌ Login failed - wrong password');
    res.render('login', { error: 'Password salah! Sila cuba lagi.' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  console.log('🚪 Logout requested');
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error destroying session:', err);
    } else {
      console.log('✅ Session destroyed, redirecting to login');
    }
    res.redirect('/login');
  });
});

// Get all todos and calendar events
app.get('/', requireAuth, async (req, res) => {
  try {
    // Fetch Todos
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

    // Fetch Calendar Events
    let calendar = [];
    try {
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

      calendar = calendarData.results.map(page => {
        const name = page.properties.Name?.title?.[0]?.plain_text || 'Untitled';
        const dateObj = page.properties.Date?.date;
        const dateStart = dateObj?.start || null;
        const dateEnd = dateObj?.end || null;
        const location = page.properties.Location?.rich_text?.[0]?.plain_text || '';
        const tags = page.properties.Tags?.multi_select?.map(t => t.name) || [];
        const selesai = page.properties.Selesai?.checkbox || false;

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
          date: dateStart, // Keep for calendar grid compatibility
          dateStart,
          dateEnd,
          dateFormatted,
          location,
          tags,
          selesai
        };
      });
    } catch (calendarError) {
      console.error('Error fetching calendar:', calendarError);
      // Calendar will remain empty array
    }

    // Load Malaysia Holidays from JSON file
    let holidays = [];
    try {
      const currentYear = new Date().getFullYear();
      const holidaysFile = path.join(__dirname, 'holidays.json');

      if (fs.existsSync(holidaysFile)) {
        const holidayFileContent = fs.readFileSync(holidaysFile, 'utf-8');
        const holidayData = JSON.parse(holidayFileContent);

        // Check if the year matches current year
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

    res.render('index', { todos, calendar, holidays });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Add new todo
app.post('/add', requireAuth, async (req, res) => {
  try {
    const { name, category, dueDate } = req.body;

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

    await fetch('https://api.notion.com/v1/pages', {
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

    res.redirect('/');
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).send('Error adding todo');
  }
});

// Edit todo
app.post('/edit', requireAuth, async (req, res) => {
  try {
    const { id, name, category, dueDate } = req.body;

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

    await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties })
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error editing todo:', error);
    res.status(500).send('Error editing todo');
  }
});

// Mark as done
app.post('/done/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await fetch(`https://api.notion.com/v1/pages/${id}`, {
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

    res.redirect('/');
  } catch (error) {
    console.error('Error marking todo as done:', error);
    res.status(500).send('Error updating todo');
  }
});

// Delete todo
app.post('/delete/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        archived: true
      })
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).send('Error deleting todo');
  }
});

// Add new calendar event
app.post('/calendar/add', requireAuth, async (req, res) => {
  try {
    const { name, dateStart, dateEnd, location, tags } = req.body;

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
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagArray.length > 0) {
        properties.Tags = {
          multi_select: tagArray.map(tag => ({ name: tag }))
        };
      }
    }

    await fetch('https://api.notion.com/v1/pages', {
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

    res.redirect('/');
  } catch (error) {
    console.error('Error adding calendar event:', error);
    res.status(500).send('Error adding calendar event');
  }
});

// Edit calendar event
app.post('/calendar/edit', requireAuth, async (req, res) => {
  try {
    const { id, name, dateStart, dateEnd, location, tags } = req.body;

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
    } else {
      properties.Location = {
        rich_text: []
      };
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
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

    await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties })
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error editing calendar event:', error);
    res.status(500).send('Error editing calendar event');
  }
});

// Mark calendar event as done
app.post('/calendar/done/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          Selesai: {
            checkbox: true
          }
        }
      })
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error marking calendar event as done:', error);
    res.status(500).send('Error updating calendar event');
  }
});

// Delete calendar event
app.post('/calendar/delete/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        archived: true
      })
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).send('Error deleting calendar event');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Notion TODO List - Web Interface`);
});
