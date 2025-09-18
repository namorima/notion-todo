# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern Notion API integration project for managing TODO lists. The main script provides an interactive TODO manager with full CRUD capabilities, pagination, progress indicators, and advanced user interface features.

## Architecture

- **js/todo.js**: Main Node.js application with modern interactive interface
- **js/todo2.bat**: Windows batch file to execute the Node.js script
- **js/package.json**: Node.js dependencies configuration
- **js/.env**: Environment variables for API credentials
- **shell/todo.bat**: Windows batch wrapper that calls PowerShell script
- **shell/todo.ps1**: PowerShell implementation using Invoke-RestMethod

## Latest Features (2025)

### Modern Interface Enhancements
- **@inquirer/prompts**: Interactive arrow-key navigation menus
- **Progress Bars**: Visual feedback during API operations
- **ESC Key Navigation**: Universal back navigation with ESC key
- **Consistent Color Scheme**: Blue color theme for all prompts
- **Clean Headers**: Removed borders for cleaner interface

### Advanced Date Picker
- **Quick Date Selection**: Today, Tomorrow, Next Week, Next Month
- **Custom Date Input**: Manual date entry with validation
- **Smart Defaults**: Pre-filled current date for custom input
- **Visual Date Display**: Shows actual dates in selection options

### Enhanced Category System
- **Interactive Category Selection**: Dropdown with emojis
- **Visual Category Indicators**:
  - 🔥 **Penting** (Important)
  - ⚡ **Segera** (Urgent)
  - 👤 **Pribadi** (Personal)
  - 📝 **Tiada kategori** (No category)

### Improved User Experience
- **Real-time Progress**: Animated loading indicators
- **Smart Error Handling**: Graceful error recovery
- **Descriptive Variable Names**: Improved code readability
- **Environment Variables**: Secure credential management

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

### Environment Setup
Create `.env` file with:
```
NOTION_API_KEY=your_notion_api_key
DATABASE_ID=your_database_id
```

## Application Features

### Interactive Menu System
- **➕ Tambah todo baru**: Add new todo with category selection
- **📅 Tambah todo dengan due date**: Add todo with date picker
- **✅ Mark todo as Done**: Interactive todo selection
- **🔄 Restart application**: Refresh data and return to first page
- **Navigation**: Previous/Next page with dynamic options
- **❌ Exit**: Clean application termination

### Display Format
- **Smart Status Icons**: ✅ (Done), ❌ (Overdue), ✖️ (Not Started), ❓ (No Due Date)
- **Category Indicators**: Emojis and brackets for visual categorization
- **Pagination Info**: "Page X of Y (Z total items)"
- **Auto-clear Console**: Clean interface with progress indicators

### Data Structure
The Notion database should have these properties:
- `name`: Title field for task names
- `status`: Status field (Not started, In Progress, Done)
- `kategori`: Select field for categories (Penting, Segera, Pribadi)
- `due date`: Date field for deadlines

## Configuration

### Environment Variables (Recommended)
```bash
NOTION_API_KEY=your_notion_api_key
DATABASE_ID=your_database_id
```

### Legacy Configuration (Fallback)
Scripts can fall back to hardcoded values if environment variables are not available.

## Dependencies

### Node.js Dependencies
- **@inquirer/prompts**: Modern interactive prompts
- **node-fetch**: HTTP client for API requests
- **chalk**: Terminal colors and styling
- **boxen**: Terminal boxes (legacy, removed from headers)
- **dotenv**: Environment variable management
- **Package.json**: Configured with `"type": "module"` for ES6 imports

### PowerShell Dependencies
- Uses built-in `Invoke-RestMethod` cmdlet
- No external dependencies required

## Development Notes

### Code Quality Standards
- **Descriptive Variable Names**: Always use meaningful variable names
- **Consistent Error Handling**: Proper try-catch blocks with user-friendly messages
- **Progress Feedback**: Visual indicators for all API operations
- **ESC Navigation**: Universal escape key support for better UX
- **Color Consistency**: Blue theme for all user prompts

### Performance Optimizations
- **Smart Data Loading**: Progress indicators for API calls
- **Efficient Pagination**: 20 items per page with smooth navigation
- **Clean Console Management**: Automatic clearing for better readability
- Add to memory. Try "Always use descriptive variable names"