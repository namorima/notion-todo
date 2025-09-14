# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Notion API integration project for managing TODO lists. The main script provides an interactive TODO manager with full CRUD capabilities, pagination, and reminder features.

## Architecture

- **js/todo.js**: Main Node.js application with interactive menu system
- **js/todo2.bat**: Windows batch file to execute the Node.js script
- **js/package.json**: Node.js dependencies configuration
- **shell/todo.bat**: Windows batch wrapper that calls PowerShell script
- **shell/todo.ps1**: PowerShell implementation using Invoke-RestMethod

The main todo.js application features:
- Interactive menu system with readline interface
- Pagination (20 items per page)
- Add todos with/without due dates
- Category support with visual indicators (🔥 for "Penting")
- Auto-clear console for clean display
- Smart navigation options

## Common Commands

### Running the Application

**Main Interactive Version:**
```bash
node todo.js
# or
todo2.bat
```

**PowerShell version:**
```powershell
powershell -ExecutionPolicy Bypass -File "path\to\todo.ps1"
```

### Installing Dependencies
```bash
npm install
```

## Application Features

### Menu Options
- **Default**: Displays paginated TODO list (20 items per page)
- **Option 2**: Add new todo (basic)
- **Option 3**: Add todo with due date (format: YYYY-MM-DD)
- **Option 4**: Next page (when applicable)
- **Option 5**: Previous page (when applicable) 
- **Option 6**: Exit

### Display Format
- Numbered list with status icons (✅ ✖️ ➖)
- Category indicators: 🔥[Penting] for important items
- Page information: "Page X of Y (Z total items)"
- Auto-clear console for clean interface

### Data Structure
The Notion database should have these properties:
- `name`: Title field for task names
- `status`: Status field (Not started, In Progress, Done)
- `kategori`: Select field for categories
- `due date`: Date field for deadlines

## Configuration

Scripts require configuration of:
- `notion_api_key`: Notion API integration token
- `database_id`: Target Notion database ID

These are currently hardcoded in the script files.

## Dependencies

**Node.js version:**
- `node-fetch`: For API requests
- `readline`: Built-in Node.js module for user input
- Package.json configured with `"type": "module"` for ES6 imports

**PowerShell version:**
- Uses built-in `Invoke-RestMethod` cmdlet
- No external dependencies required