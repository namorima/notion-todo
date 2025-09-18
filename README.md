# 📋 Notion TODO Manager (2025 Edition)

A modern, interactive command-line TODO application with advanced UI features, seamless Notion integration, and intelligent date picker functionality. Built with Node.js and enhanced with cutting-edge user interface elements.

![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)
![Notion API](https://img.shields.io/badge/Notion-API-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Inquirer](https://img.shields.io/badge/Inquirer-Prompts-purple.svg)

## ✨ Features

### 🎯 Core Functionality
- **Modern Interactive Interface** - Arrow-key navigation with @inquirer/prompts
- **Real-time Progress Indicators** - Visual feedback during API operations
- **ESC Key Navigation** - Universal escape key support for intuitive navigation
- **Smart Category Selection** - Interactive dropdown with emoji indicators
- **Advanced Date Picker** - Quick date selection with smart defaults

### 🎨 Visual Elements
- **Consistent Color Scheme** - Blue-themed interface for all prompts
- **Animated Progress Bars** - Real-time loading indicators with dots animation
- **Clean Headers** - Borderless design for modern appearance
- **Status-based Icons**:
  - ✅ **Done** - Completed tasks (green, strikethrough)
  - ❌ **Overdue** - Past due date (red)
  - ❓ **No Due Date** - Tasks without deadlines (yellow)
  - ✖️ **Not Started** - Pending tasks with valid due dates (red)
  - ➖ **In Progress** - Currently working (yellow)

### 📅 Advanced Date Picker
- **📅 Hari ini** - Select today's date instantly
- **🌅 Esok** - Choose tomorrow with one click
- **📆 Minggu depan** - Next week option (7 days ahead)
- **🗓️ Bulan depan** - Next month selection
- **✏️ Custom Input** - Manual date entry with smart defaults
- **🚫 No Due Date** - Option to skip due dates entirely

### 🏷️ Enhanced Category System
- **⚡ Segera** (Urgent) - Lightning bolt indicator
- **🔥 Penting** (Important) - Fire emoji for high priority
- **👤 Pribadi** (Personal) - Personal tasks marker
- **📝 Tiada kategori** - No category option
- **Visual Display** - Categories shown with emojis in todo list

### 🚀 Performance & UX
- **Environment Variables** - Secure credential management with dotenv
- **Progress Feedback** - Loading indicators for all API operations
- **Error Handling** - Graceful error recovery with user-friendly messages
- **Descriptive Code** - Meaningful variable names for maintainability

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- Notion account with API access
- Notion database with proper schema

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notion-todo-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your credentials:
   ```env
   NOTION_API_KEY=your_notion_api_key_here
   DATABASE_ID=your_database_id_here
   ```

4. **Run the application**
   ```bash
   node todo.js
   # or use the batch file (Windows)
   todo2.bat
   ```

## ⚙️ Configuration

### Notion Database Schema
Your Notion database should have these properties:
- `name` (Title) - Task names
- `status` (Status) - Task status (Not started, In Progress, Done)
- `kategori` (Select) - Categories for organization
- `due date` (Date) - Task deadlines

### Getting Your Credentials

1. **Notion API Key**:
   - Go to [Notion Integrations](https://www.notion.so/my-integrations)
   - Create new integration
   - Copy the "Internal Integration Token"

2. **Database ID**:
   - Open your Notion database
   - Copy the ID from the URL: `notion.so/[workspace]/[DATABASE_ID]?v=...`

## 🎮 Usage

### Modern Interactive Menu System
The application now features arrow-key navigation with visual indicators:

```
⚙️ Select an option:
❯ ➕ Tambah todo baru              # Add new todo with category selection
  📅 Tambah todo dengan due date   # Add todo with advanced date picker
  ✅ Mark todo as Done            # Interactive todo selection
  🔄 Restart application          # Refresh data and return to page 1
  ▶️ Next page                    # Navigate forward (when available)
  ◀️ Previous page                # Navigate backward (when available)
  ❌ Exit                          # Clean application termination
```

### Enhanced User Experience
- **Arrow Key Navigation** - Use ↑↓ keys to navigate all menus
- **ESC Key Support** - Press ESC at any prompt to return to main menu
- **Progress Indicators** - Visual feedback during all API operations
- **Smart Validation** - Real-time input validation with helpful error messages

### Date Selection Workflow
When adding todos with due dates:
1. **Quick Options**: Choose from preset dates (Today, Tomorrow, Next Week, Next Month)
2. **Custom Input**: Select "Masukkan tarikh custom" for specific dates
3. **Smart Defaults**: Custom input pre-filled with today's date
4. **No Due Date**: Option to skip due dates entirely

### Category Selection Process
Interactive category dropdown with visual indicators:
- **⚡ Segera** - For urgent tasks requiring immediate attention
- **🔥 Penting** - For important tasks with high priority
- **👤 Pribadi** - For personal tasks and private matters
- **📝 Tiada kategori** - For uncategorized general tasks

### Example Modern Workflow
1. **Launch** - Run `node todo.js` to start the application
2. **View Progress** - Watch loading indicators during data fetch
3. **Navigate** - Use arrow keys to select menu options
4. **Add Tasks** - Choose category from dropdown, select dates from picker
5. **Mark Complete** - Select todos from interactive list
6. **ESC Navigation** - Press ESC anytime to go back to main menu

## 📁 Project Structure

```
📦 notion-todo-manager/
├── 📜 todo.js           # Main application file
├── 📜 todo2.bat         # Windows batch launcher
├── 📜 package.json      # Node.js dependencies
├── 📜 .env             # Environment variables (git-ignored)
├── 📜 .env.example     # Environment template
├── 📜 .gitignore       # Git ignore rules
├── 📜 CLAUDE.md        # Development instructions
└── 📜 README.md        # This documentation
```

## 🛠️ Dependencies

### Modern UI Dependencies
- **@inquirer/prompts** - Modern interactive command-line prompts with arrow-key navigation
- **chalk** `^5.6.2` - Terminal colors and styling for beautiful output
- **boxen** `^8.0.1` - Terminal boxes (legacy support, removed from headers)
- **dotenv** `^17.2.2` - Secure environment variable management

### Core Functionality
- **node-fetch** `^3.0.0` - HTTP client for Notion API requests
- **react** - Required for progress bar components (internal use)
- **ink** - Terminal UI framework for progress indicators (internal use)

### Built-in Node.js Modules
- **process** - Environment and system process management
- **fs** - File system operations for environment variables

### Latest Package Additions (2025)
- Replaced `readline` with `@inquirer/prompts` for modern UX
- Added progress bar functionality with custom console implementation
- Enhanced error handling with graceful recovery mechanisms

## 🆕 What's New in 2025 Edition

### Major Upgrades
| Feature | Old Version | New Version |
|---------|-------------|-------------|
| **Navigation** | Text input with numbers | Arrow-key navigation |
| **Category Selection** | Manual text input | Interactive dropdown with emojis |
| **Date Input** | Manual YYYY-MM-DD entry | Smart date picker with presets |
| **Progress Feedback** | No visual feedback | Animated progress bars |
| **Color Scheme** | Mixed colors | Consistent blue theme |
| **Headers** | Boxed borders | Clean borderless design |
| **Error Recovery** | Basic error messages | ESC key navigation |

### Technical Improvements
- **Descriptive Variables** - All variables use meaningful names for better code readability
- **Modern Async/Await** - Proper promise handling throughout the application
- **Environment Security** - All credentials moved to `.env` files
- **Progress Indicators** - Real-time feedback for all API operations

## 🔧 Development

### Environment Setup
```bash
# Install all modern dependencies
npm install

# Copy environment template (if available)
cp .env.example .env

# Create .env file manually if template doesn't exist
echo "NOTION_API_KEY=your_api_key_here" > .env
echo "DATABASE_ID=your_database_id_here" >> .env
```

### Code Architecture (2025)
- **Modern UI Components** - `@inquirer/prompts` for all user interactions
- **Progress Management** - Custom progress bar class with console animations
- **Date Utilities** - Helper functions for smart date generation
- **Error Handling** - Comprehensive try-catch blocks with graceful recovery
- **Modular Design** - Separated concerns with descriptive function names

### Development Best Practices
- **Descriptive Naming** - All variables use clear, meaningful names
- **Consistent Styling** - Blue color theme across all user prompts
- **Progress Feedback** - Visual indicators for all async operations
- **ESC Navigation** - Universal escape key support in all prompts

## 🚢 Deployment

### Local Development
```bash
node todo.js
```

### Windows Quick Launch
```batch
todo2.bat
```

### Environment Variables
Ensure your `.env` file contains:
```env
NOTION_API_KEY=ntn_your_key_here
DATABASE_ID=your_database_id_here
```

## 🛡️ Security

- **Environment Variables** - Sensitive data stored in `.env` (git-ignored)
- **Input Validation** - All user inputs are validated
- **API Error Handling** - Graceful handling of API failures
- **Safe Deployment** - Credentials never committed to repository

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Notion API](https://developers.notion.com/) for excellent documentation
- [Chalk](https://github.com/chalk/chalk) for beautiful terminal colors
- [Boxen](https://github.com/sindresorhus/boxen) for terminal box styling

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed description
3. Include your environment details and error messages

---

**Made with ❤️ for productivity enthusiasts**