# 📝 Notion Manager

A modern serverless web application for managing Notion TODO lists and calendar events with Malaysian public holiday integration.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Notion API](https://img.shields.io/badge/Notion-API-blue.svg)
![Netlify](https://img.shields.io/badge/Netlify-Serverless-00C7B7.svg)
![JWT](https://img.shields.io/badge/Auth-JWT-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

> **Version 2.0** - Now powered by Netlify Functions with JWT authentication

## ✨ Features

### 🌐 Web Interface

- **JWT Authentication** - Secure login with token-based auth (24-hour expiry)
- **Serverless Backend** - Netlify Functions for auto-scaling
- **Dual View System** - Todo list and calendar in one application
- **Malaysian Holidays** - Automatic integration of public holidays
- **Interactive Calendar** - Visual grid with event indicators
- **Responsive Design** - Mobile-first, works on all devices
- **Grid/List View** - Toggle between card and list layouts (desktop only)
- **CSS Variables** - Consistent design system with standardized styling

### 📅 Calendar Features

- **Event Management** - Add, edit, delete calendar events
- **Date Ranges** - Support for multi-day events
- **Visual Indicators** - Blue circles for events, red borders for holidays
- **Weekend Highlighting** - Friday and Saturday displayed in blue (30% opacity)
- **Event Tooltips** - Hover over dates to see event names
- **Holiday Display** - Previous month holidays shown with transparent styling

### ✅ Todo Management

- **Category System** - Organize with emojis (🔥 Penting, ⚡ Segera, 👤 Pribadi)
- **Status Tracking** - Not Started, In Progress, Done
- **Due Date Management** - Visual indicators for overdue tasks
- **Filtering** - Quick filters by status (All, Completed, Overdue, Pending)
- **Real-time Updates** - Changes reflected immediately

### 🖥️ CLI Interface (Legacy)

- Interactive command-line todo manager
- Arrow-key navigation
- Advanced date picker
- Progress indicators

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- Notion account with API access
- Two Notion databases (TODO and Calendar)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd notion-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your credentials:

   ```env
   NOTION_API_KEY=your_notion_api_key_here
   DATABASE_ID=your_todo_database_id_here
   CALENDAR_DATABASE_ID=your_calendar_database_id_here
   APP_PASSWORD=akmal
   HOLIDAY_STATE=Kelantan
   ```

4. **Fetch holiday data (optional)**

   ```bash
   node fetch-holidays.js
   ```

5. **Run the application**

   **Option A: Netlify Dev (Recommended)**
   ```bash
   npm run dev
   ```
   Open browser: `http://localhost:8888`

   **Option B: Legacy Express Server**
   ```bash
   npm start
   ```
   Open browser: `http://localhost:3000`

## ⚙️ Configuration

### Notion Database Schemas

**TODO Database** requires:

- `name` (Title) - Task names
- `status` (Status) - Task status (Not started, In Progress, Done)
- `kategori` (Select) - Categories (Penting, Segera, Pribadi)
- `due date` (Date) - Task deadlines

**Calendar Database** requires:

- `Name` (Title) - Event names
- `Date` (Date) - Event date/date range
- `Location` (Text) - Event location
- `Tags` (Multi-select) - Event tags
- `Selesai` (Checkbox) - Completion status

### Getting Your Credentials

1. **Notion API Key**:

   - Go to [Notion Integrations](https://www.notion.so/my-integrations)
   - Create new integration
   - Copy the "Internal Integration Token"
   - Share your databases with the integration

2. **Database IDs**:
   - Open your Notion database
   - Copy the ID from the URL: `notion.so/[workspace]/[DATABASE_ID]?v=...`

## 🎮 Usage

### Web Interface

1. **Login**

   - Navigate to `http://localhost:3000`
   - Enter password (default: `akmal`)
   - Session valid for 24 hours

2. **Managing Todos**

   - Click `+` button to add new todo
   - Select category and set due date
   - Mark complete with `✅ Mark Done` button
   - Edit or delete using icons

3. **Managing Calendar**

   - Switch to `📅 Calendar` tab
   - Click `+ Tambah Event` to add events
   - Set start/end dates for multi-day events
   - Add location and tags
   - Mark events as done with checkbox

4. **Calendar Grid**

   - Click dates to filter events
   - Hover over dates to see event tooltips
   - Navigate months with `‹` and `›` buttons
   - Blue circles = events
   - Red borders = holidays

5. **Logout**
   - Click `🚪 Logout` button (top right)

### CLI Interface

```bash
npm run cli
```

Features:

- Arrow-key navigation
- Interactive date picker
- Progress indicators
- Category selection with emojis

## 📁 Project Structure

```
notion-manager/
├── netlify/
│   └── functions/          # Serverless backend (PRIMARY)
│       ├── utils/
│       │   └── auth.js     # JWT authentication helpers
│       ├── login.js        # Login endpoint
│       ├── get-todos.js    # Fetch todos
│       ├── add-todo.js     # Create todo
│       ├── edit-todo.js    # Update todo
│       ├── done-todo.js    # Mark todo done
│       ├── delete-todo.js  # Delete todo
│       ├── get-calendar.js # Fetch calendar
│       ├── add-calendar.js # Create event
│       ├── edit-calendar.js # Update event
│       ├── done-calendar.js # Mark event done
│       └── delete-calendar.js # Delete event
├── public/                 # Static frontend (PRIMARY)
│   ├── login.html          # Login page ✅
│   ├── index.html          # Main app ✅
│   ├── styles.css          # Main stylesheet ✅
│   ├── calendar.css        # Calendar styles ✅
│   ├── app.js              # Client-side logic ✅
│   └── holidays.json       # Malaysian holidays
├── server.js               # Express server (LEGACY)
├── index.ejs               # Server-rendered UI (LEGACY)
├── login.ejs               # Server-rendered auth (LEGACY)
├── todo.js                 # CLI interface (LEGACY)
├── fetch-holidays.js       # Holiday data fetcher
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies
├── .env                    # Environment variables (git-ignored)
├── .env.example            # Environment template
├── CLAUDE.md               # Development instructions
└── README.md               # This file
```

## 🛠️ Development

### Running Locally

```bash
# Web server (development)
npm start

# CLI tool
npm run cli

# Fetch latest holidays
node fetch-holidays.js
```

### Environment Variables

| Variable               | Description                  | Default       |
| ---------------------- | ---------------------------- | ------------- |
| `PORT`                 | Server port                  | `3000`        |
| `NOTION_API_KEY`       | Notion integration token     | Required      |
| `DATABASE_ID`          | TODO database ID             | Required      |
| `CALENDAR_DATABASE_ID` | Calendar database ID         | Required      |
| `APP_PASSWORD`         | Login password               | [edit in env] |
| `HOLIDAY_STATE`        | Malaysian state for holidays | `Kelantan`    |

## 🚢 Deployment

### Option 1: Deploy to Netlify (Recommended)

Serverless deployment with auto-scaling and zero cold starts.

**Quick steps:**

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Initialize: `netlify init`
4. Set environment variables in Netlify Dashboard:
   - `NOTION_API_KEY`
   - `DATABASE_ID`
   - `CALENDAR_DATABASE_ID`
   - `APP_PASSWORD`
   - `JWT_SECRET`
   - `HOLIDAY_STATE`
5. Deploy: `netlify deploy --prod`

**Advantages:**
- ✅ Auto-scaling
- ✅ No cold starts
- ✅ Free tier: 125k requests/month
- ✅ Always-on (no sleep)
- ✅ Automatic HTTPS
- ✅ Global CDN

### Option 2: Deploy to Render (Legacy)

Traditional server deployment using Express.js.

See detailed guide: [DEPLOY_RENDER.md](DEPLOY_RENDER.md)

**Note:** This uses the legacy Express server. Netlify deployment is recommended for production.

**Key Deployment Settings:**

```
Build Command: npm install
Start Command: npm start (or netlify dev for local)
Node Version: >=18.0.0
```

## 🎨 Customization

### Changing Password

Edit `.env`:

```env
APP_PASSWORD=your_new_password
```

### Changing Holiday State

Supported Malaysian states:

- Johor, Kedah, Kelantan, Melaka, Negeri Sembilan
- Pahang, Penang, Perak, Perlis, Sabah, Sarawak
- Selangor, Terengganu, W.P. Kuala Lumpur, W.P. Labuan, W.P. Putrajaya

Edit `.env`:

```env
HOLIDAY_STATE=Selangor
```

Then run:

```bash
node fetch-holidays.js
```

### Modifying Calendar Colors

Edit `index.ejs`:

- Event circles: `.calendar-day.has-event` (line 957-965)
- Holiday borders: `.calendar-day.is-holiday` (line 968-976)
- Weekend colors: `.calendar-day.weekend` (line 947-949)

## 🔧 Troubleshooting

### Login Page Not Showing

**Solution:**

1. Clear browser cookies/cache
2. Try incognito mode
3. Check server logs for errors
4. Verify `login.ejs` exists in root directory

### Holidays Not Displaying

**Solution:**

```bash
# Regenerate holidays.json
node fetch-holidays.js

# Check holidays.json year matches current year
cat holidays.json
```

### Calendar Events Not Loading

**Solution:**

1. Verify `CALENDAR_DATABASE_ID` is correct
2. Check Notion database has required properties:
   - Name (Title)
   - Date (Date)
   - Location (Text)
   - Tags (Multi-select)
   - Selesai (Checkbox)
3. Ensure integration has access to calendar database

### Session Not Persisting

**Issue:** Free tier Render restarts after 15min idle

**Solution:**

- Sessions stored in memory (reset on restart)
- For production: use external session store (Redis)
- Or upgrade to paid tier for always-on service

## 📚 API Documentation

### Authentication Endpoints

- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /logout` - Destroy session and redirect

### Todo Endpoints

- `GET /` - Main page (requires auth)
- `POST /add` - Add new todo
- `POST /edit` - Edit existing todo
- `POST /done/:id` - Mark todo as done
- `POST /delete/:id` - Delete todo

### Calendar Endpoints

- `POST /calendar/add` - Add calendar event
- `POST /calendar/edit` - Edit calendar event
- `POST /calendar/done/:id` - Mark event as done
- `POST /calendar/delete/:id` - Delete calendar event

## 🛡️ Security

- **JWT Authentication** - Token-based auth with 24-hour expiry
- **Serverless Functions** - Isolated execution environment
- **Environment variables** - Credentials in `.env` (git-ignored)
- **Input validation** - All user inputs validated
- **API error handling** - Graceful error recovery
- **HTTPS ready** - Automatic HTTPS with Netlify
- **CORS configured** - Proper cross-origin handling
- **No session storage** - Stateless authentication (no session vulnerabilities)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Notion API](https://developers.notion.com/) - Excellent API documentation
- [Express.js](https://expressjs.com/) - Fast web framework
- [EJS](https://ejs.co/) - Embedded JavaScript templating
- [Office Holidays](http://www.officeholidays.com/) - Malaysian holiday data

## 📞 Support

If you encounter issues:

1. Check [Issues](../../issues) page
2. Review [CLAUDE.md](CLAUDE.md) for development guidance
3. Read [DEPLOY_RENDER.md](DEPLOY_RENDER.md) for deployment help
4. Create new issue with details

---

**Made with ❤️ for productivity enthusiasts**

**Version:** 2.0.0 (Netlify Serverless Edition)

---

## 🚀 Migration Status

**Current Progress: 100% Complete ✅**

✅ **Complete:**
- Backend (Netlify Functions) - 100%
- JWT Authentication - 100%
- Login Page - 100%
- Main Application (index.html + app.js) - 100%
- CSS Styling - 100%
- Configuration - 100%
- Documentation - 100%

🎉 **Status:** Production Ready!

See [FINAL_STATUS.md](FINAL_STATUS.md) for detailed migration information.
