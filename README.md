# 📋 Notion TODO Manager

A beautiful, interactive command-line TODO application that integrates seamlessly with Notion databases. Built with Node.js and enhanced with colorful UI elements.

![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)
![Notion API](https://img.shields.io/badge/Notion-API-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

### 🎯 Core Functionality
- **Interactive Menu System** - Clean, colorful interface with readline support
- **Notion Integration** - Full CRUD operations with Notion databases
- **Pagination** - Display 20 items per page with easy navigation
- **Smart Status Icons** - Visual indicators for different todo states
- **Quick Actions** - Mark todos as done with simple `#done <number>` command

### 🎨 Visual Elements
- **Colorful UI** - Beautiful terminal interface using Chalk and Boxen
- **Status-based Icons**:
  - ✅ **Done** - Completed tasks (green)
  - ❌ **Overdue** - Past due date (red)
  - ❓ **No Due Date** - Tasks without deadlines (yellow)
  - ✖️ **Not Started** - Pending tasks with valid due dates (red)
  - ➖ **In Progress** - Currently working (yellow)

### 📅 Advanced Features
- **Due Date Support** - Add tasks with specific deadlines
- **Category System** - Organize with custom categories (🔥 for "Penting"/Important)
- **Auto-refresh** - Real-time updates after modifications
- **Navigation** - Simple `>` and `<` for page navigation
- **Environment Variables** - Secure credential management

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

### Main Menu Options
```
Options:
2. Tambah todo baru              # Add new todo
3. Tambah todo dengan due date   # Add todo with due date
#done <number>. Mark todo as Done # Quick completion
> Next page                      # Navigate forward
< Previous page                  # Navigate backward
6. Exit                          # Quit application
```

### Quick Commands
- Type `2` - Add new basic todo
- Type `3` - Add todo with due date
- Type `#done 1` - Mark todo #1 as completed
- Type `>` - Go to next page
- Type `<` - Go to previous page
- Type `6` - Exit application

### Example Workflow
1. **View todos** - Application shows paginated list
2. **Add task** - Choose option 2 or 3, enter details
3. **Mark complete** - Use `#done <number>` for quick completion
4. **Navigate** - Use `>` and `<` to browse pages
5. **Categories** - Add "Penting" for important tasks (🔥 indicator)

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

### Core Dependencies
- **node-fetch** `^3.0.0` - HTTP requests to Notion API
- **chalk** `^5.6.2` - Terminal colors and styling
- **boxen** `^8.0.1` - Terminal boxes and borders
- **dotenv** `^17.2.2` - Environment variable management
- **prompts** `^2.4.2` - Interactive command line prompts

### Built-in Modules
- **readline** - User input handling
- **process** - Environment and process management

## 🔧 Development

### Environment Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit your credentials in .env file
```

### Code Structure
- **Main Application** - `todo.js` contains all core logic
- **Environment Config** - Credentials loaded via dotenv
- **Error Handling** - Comprehensive validation and user feedback
- **Modular Functions** - Separated concerns for maintainability

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