import fetch from "node-fetch";
import { select, input, confirm, checkbox } from "@inquirer/prompts";
import chalk from "chalk";
import boxen from "boxen";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Handle process signals for graceful exit
process.on('SIGINT', () => {
  console.log(chalk.yellow("\n\n👋 Goodbye!"));
  process.exit(0);
});

// Helper function to check if error is due to ESC key press
function isEscapeKeyPressed(error) {
  return error.name === 'ExitPromptError' ||
         error.message === 'User force closed the prompt with 0 null' ||
         error.message.includes('force closed') ||
         error.message.includes('canceled') ||
         error.code === 'ESCAPE';
}

// ==== SETTING ====
const notion_api_key = process.env.NOTION_API_KEY;
const database_id = process.env.DATABASE_ID;

// Validate environment variables
if (!notion_api_key || !database_id) {
  console.log(chalk.red("❌ Error: Missing environment variables!"));
  console.log(chalk.yellow("Please create a .env file with:"));
  console.log(chalk.cyan("NOTION_API_KEY=your_notion_api_key"));
  console.log(chalk.cyan("DATABASE_ID=your_database_id"));
  process.exit(1);
}


// Pagination variables
let currentPage = 0;
const itemsPerPage = 20;
let allTodos = [];

// Helper function to get formatted dates
function getDateOptions() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return {
    today: formatDate(today),
    tomorrow: formatDate(tomorrow),
    nextWeek: formatDate(nextWeek),
    nextMonth: formatDate(nextMonth)
  };
}

// Simple progress bar class using console
class ProgressBar {
  constructor(message) {
    this.message = message;
    this.dots = "";
    this.isRunning = false;
    this.interval = null;
    this.currentLine = "";
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Clear any existing line
    process.stdout.write("\x1b[2K\r");

    this.interval = setInterval(() => {
      this.dots = this.dots.length >= 3 ? "" : this.dots + ".";
      this.currentLine = chalk.cyan(`🔄 ${this.message}${this.dots}`);
      process.stdout.write(`\x1b[2K\r${this.currentLine}`);
    }, 500);
  }

  update(newMessage) {
    this.message = newMessage;
    if (this.isRunning) {
      this.dots = "";
      this.currentLine = chalk.cyan(`🔄 ${this.message}${this.dots}`);
      process.stdout.write(`\x1b[2K\r${this.currentLine}`);
    }
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // Clear the progress line
    process.stdout.write("\x1b[2K\r");
  }
}

// Show progress bar helper function
function showProgress(message) {
  const progressBar = new ProgressBar(message);
  progressBar.start();

  return {
    update: (newMessage) => {
      progressBar.update(newMessage);
    },
    stop: () => {
      progressBar.stop();
    }
  };
}

// Fungsi untuk tambah todo baru
async function addTodo(taskName, kategori = null) {
  const progress = showProgress("Menambah todo baru");

  const url = `https://api.notion.com/v1/pages`;

  const headers = {
    "Authorization": `Bearer ${notion_api_key}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
  };

  const properties = {
    name: {
      title: [{ text: { content: taskName } }]
    },
    status: {
      status: { name: "Not started" }
    }
  };

  // Tambah kategori jika ada
  if (kategori) {
    properties.kategori = {
      select: { name: kategori }
    };
  }

  const body = {
    parent: { database_id: database_id },
    properties: properties
  };

  try {
    progress.update("Menghantar data ke Notion");
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    progress.update("Memproses respons");
    if (res.ok) {
      progress.stop();
      console.log(chalk.green(`✅ Todo "${taskName}" berjaya ditambah!`));
    } else {
      const error = await res.json();
      progress.stop();
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }
  } catch (err) {
    progress.stop();
    console.log(chalk.red(`❌ Error: ${err.message}`));
  }
}

// Fungsi untuk tambah todo dengan due date
async function addTodoWithDueDate(taskName, kategori = null, dueDate = null) {
  const progress = showProgress("Menambah todo dengan due date");

  const url = `https://api.notion.com/v1/pages`;

  const headers = {
    "Authorization": `Bearer ${notion_api_key}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
  };

  const properties = {
    name: {
      title: [{ text: { content: taskName } }]
    },
    status: {
      status: { name: "Not started" }
    }
  };

  // Tambah kategori jika ada
  if (kategori) {
    properties.kategori = {
      select: { name: kategori }
    };
  }

  // Tambah due date jika ada
  if (dueDate) {
    properties["due date"] = {
      date: { start: dueDate }
    };
  }

  const body = {
    parent: { database_id: database_id },
    properties: properties
  };

  try {
    progress.update("Menghantar data ke Notion");
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    progress.update("Memproses respons");
    if (res.ok) {
      progress.stop();
      console.log(chalk.green(`✅ Todo "${taskName}" dengan due date berjaya ditambah!`));
    } else {
      const error = await res.json();
      progress.stop();
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }
  } catch (err) {
    progress.stop();
    console.log(chalk.red(`❌ Error: ${err.message}`));
  }
}

// Fungsi untuk update status todo
async function updateTodoStatus(pageId, status) {
  const progress = showProgress("Mengemas kini status todo");

  const url = `https://api.notion.com/v1/pages/${pageId}`;

  const headers = {
    "Authorization": `Bearer ${notion_api_key}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
  };

  const body = {
    properties: {
      status: {
        status: { name: status }
      }
    }
  };

  try {
    progress.update("Menghantar kemaskini ke Notion");
    const res = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body)
    });

    progress.update("Memproses respons");
    if (res.ok) {
      progress.stop();
      return { success: true, message: `✅ Todo #${allTodos.findIndex(todo => todo.id === pageId) + 1} status updated to "${status}"!` };
    } else {
      const error = await res.json();
      progress.stop();
      return { success: false, message: `❌ Error: ${error.message}` };
    }
  } catch (err) {
    progress.stop();
    return { success: false, message: `❌ Error: ${err.message}` };
  }
}

// Fungsi untuk bulk update multiple todos status
async function bulkUpdateTodoStatus(pageIds, status) {
  const progress = showProgress(`Mengemas kini ${pageIds.length} todos secara bulk`);
  const results = [];

  const headers = {
    "Authorization": `Bearer ${notion_api_key}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
  };

  const body = {
    properties: {
      status: {
        status: { name: status }
      }
    }
  };

  let successCount = 0;
  let failCount = 0;

  try {
    for (let i = 0; i < pageIds.length; i++) {
      const pageId = pageIds[i];
      progress.update(`Mengemas kini todo ${i + 1} dari ${pageIds.length}`);

      const url = `https://api.notion.com/v1/pages/${pageId}`;

      try {
        const res = await fetch(url, {
          method: "PATCH",
          headers,
          body: JSON.stringify(body)
        });

        if (res.ok) {
          successCount++;
          results.push({ pageId, success: true });
        } else {
          const error = await res.json();
          failCount++;
          results.push({ pageId, success: false, error: error.message });
        }
      } catch (err) {
        failCount++;
        results.push({ pageId, success: false, error: err.message });
      }

      // Small delay to avoid rate limiting
      if (i < pageIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    progress.stop();

    if (failCount === 0) {
      return {
        success: true,
        message: `✅ Semua ${successCount} todos berjaya dikemas kini ke "${status}"!`,
        results
      };
    } else if (successCount > 0) {
      return {
        success: true,
        message: `⚠️ ${successCount} todos berjaya, ${failCount} gagal dikemas kini`,
        results
      };
    } else {
      return {
        success: false,
        message: `❌ Semua ${failCount} todos gagal dikemas kini`,
        results
      };
    }
  } catch (err) {
    progress.stop();
    return { success: false, message: `❌ Error: ${err.message}`, results };
  }
}

// Fungsi untuk check reminder (due date hari ini atau overdue)
function checkReminders(data) {
  const today = new Date().toISOString().split('T')[0];
  const reminders = [];

  data.results.forEach(page => {
    const name = page.properties["name"]?.title?.[0]?.plain_text || "Untitled";
    const status = page.properties["status"]?.status?.name || "Unknown";
    const dueDate = page.properties["due date"]?.date?.start;

    if (dueDate && status !== "Done") {
      const due = new Date(dueDate);
      const todayDate = new Date(today);
      
      if (due <= todayDate) {
        const kategori = page.properties["kategori"]?.select?.name || "";
        let kategoriText = "";
        if (kategori) {
          if (kategori === "Penting") {
            kategoriText = ` 🔥[${kategori}]`;
          } else if (kategori === "Segera") {
            kategoriText = ` ⚡[${kategori}]`;
          } else {
            kategoriText = ` [${kategori}]`;
          }
        }
        
        if (due.getTime() === todayDate.getTime()) {
          reminders.push(chalk.yellow(`⏰ ${name}${kategoriText}`));
        } else {
          reminders.push(chalk.red(`🚨 ${name}${kategoriText} (Due: ${dueDate})`));
        }
      }
    }
  });

  return reminders;
}

// Fungsi untuk clear console
function clearConsole() {
  console.clear();
}

// Fungsi untuk load data
async function loadTodos() {
  const progress = showProgress("Memuat data todos");

  const url = `https://api.notion.com/v1/databases/${database_id}/query`;

  const headers = {
    "Authorization": `Bearer ${notion_api_key}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
  };

  try {
    progress.update("Menyambung ke Notion");
    // Query database
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        sorts: [
          {
            property: "status",
            direction: "ascending" // "Not started" akan atas, "Done" bawah
          }
        ]
      })
    });

    progress.update("Memproses data");
    const data = await res.json();
    allTodos = data.results;
    progress.stop();
  } catch (error) {
    progress.stop();
    console.log(chalk.red(`❌ Error loading todos: ${error.message}`));
  }
}

// Fungsi untuk papar todos dengan pagination
function displayTodos() {
  clearConsole();
  
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, allTodos.length);
  const currentTodos = allTodos.slice(startIndex, endIndex);
  
  // Header tanpa border, hanya warna
  console.log(chalk.bold.cyan("\n📋 TODO LIST"));
  console.log(chalk.cyan("=".repeat(30)));
  
  if (allTodos.length === 0) {
    console.log(chalk.yellow("Tiada todos untuk dipaparkan."));
  } else {
    currentTodos.forEach((page, index) => {
      let name = page.properties["name"]?.title?.[0]?.plain_text || "Untitled";
      let status = page.properties["status"]?.status?.name || "Unknown";
      let kategori = page.properties["kategori"]?.select?.name || "";
      let dueDate = page.properties["due date"]?.date?.start;

      // Determine icon based on status and due date
      let icon;
      if (status === "Done") {
        icon = chalk.green("✅");
      } else {
        // Check due date for non-completed items
        if (!dueDate) {
          // No due date
          icon = chalk.yellow("❓");
        } else {
          // Has due date - check if overdue
          const today = new Date().toISOString().split('T')[0];
          const due = new Date(dueDate);
          const todayDate = new Date(today);
          
          if (due < todayDate) {
            // Overdue
            icon = chalk.red("❌");
          } else if (status === "Not started") {
            icon = chalk.red("✖️");
          } else {
            icon = chalk.yellow("➖");
          }
        }
      }
      
      // Format kategori dengan simbol khusus untuk "Penting" dan "Segera"
      let kategoriText = "";
      if (kategori) {
        if (kategori === "Penting") {
          kategoriText = ` ${chalk.red.bold("🔥[" + kategori + "]")}`; // Fire emoji untuk penting
        } else if (kategori === "Segera") {
          kategoriText = ` ${chalk.yellow.bold("⚡[" + kategori + "]")}`; // Lightning emoji untuk segera
        } else {
          kategoriText = ` ${chalk.blue("[" + kategori + "]")}`;
        }
      }
      
      const itemNumber = chalk.gray(`[${String(startIndex + index + 1).padStart(2, '0')}]`);
      const taskName = status === "Done" ? chalk.strikethrough.gray(name) : chalk.white(name);
      console.log(`${itemNumber} ${icon} ${taskName}${kategoriText}`);
    });
    
    // Papar pagination info dengan styling
    const totalPages = Math.ceil(allTodos.length / itemsPerPage);
    const paginationInfo = chalk.cyan(`\n📄 Page ${chalk.bold(currentPage + 1)} of ${chalk.bold(totalPages)} (${chalk.bold(allTodos.length)} total items)`);
    console.log(paginationInfo);
  }
}

async function main() {
  await loadTodos();
  displayTodos();
}

// Function untuk menu selepas papar todos
async function showOptions() {
  const totalPages = Math.ceil(allTodos.length / itemsPerPage);

  // Build options array dynamically
  const choices = [
    { name: "➕ Tambah todo baru", value: "add" },
    { name: "📅 Tambah todo dengan due date", value: "addWithDate" },
    { name: "✅ Mark todo as Done", value: "markDone" },
    { name: "☑️  Bulk mark as Done", value: "bulkMarkDone" },
    { name: "🔄 Restart application", value: "restart" }
  ];

  // Add pagination options if needed
  if (totalPages > 1) {
    if (currentPage < totalPages - 1) {
      choices.push({ name: "▶️  Next page", value: "next" });
    }
    if (currentPage > 0) {
      choices.push({ name: "◀️  Previous page", value: "previous" });
    }
  }

  choices.push({ name: "❌ Exit", value: "exit" });

  try {
    const choice = await select({
      message: chalk.bold.yellow("⚙️  Select an option:"),
      choices: choices
    });

    switch (choice) {
      case "add":
        await handleAddTodo();
        break;
      case "addWithDate":
        await handleAddTodoWithDueDate();
        break;
      case "markDone":
        await handleMarkDone();
        break;
      case "bulkMarkDone":
        await handleBulkMarkDone();
        break;
      case "restart":
        console.log(chalk.yellow("🔄 Restarting application..."));
        currentPage = 0;
        await loadTodos();
        displayTodos();
        await showOptions();
        break;
      case "next":
        if (currentPage < totalPages - 1) {
          currentPage++;
          await loadTodos();
          displayTodos();
          await showOptions();
        }
        break;
      case "previous":
        if (currentPage > 0) {
          currentPage--;
          await loadTodos();
          displayTodos();
          await showOptions();
        }
        break;
      case "exit":
        const goodbyeBox = boxen(chalk.green.bold("👋 Goodbye!"), {
          padding: 1,
          margin: 1,
          borderStyle: "double",
          borderColor: "green"
        });
        console.log(goodbyeBox);
        process.exit(0);
        break;
    }
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      await showOptions();
    } else {
      console.log(chalk.red("❌ Error occurred:", error.message));
      await showOptions();
    }
  }
}

// Function untuk handle mark todo as done
async function handleMarkDone() {
  console.log(chalk.bold.yellow("\n✅ MARK TODO AS DONE"));
  console.log(chalk.gray("(Tekan ESC untuk kembali ke menu utama)\n"));

  if (allTodos.length === 0) {
    console.log(chalk.red("❌ Tiada todos untuk di-mark!"));
    await showOptions();
    return;
  }

  // Create choices from current todos with better formatting
  const choices = allTodos.map((todo, index) => {
    const name = todo.properties["name"]?.title?.[0]?.plain_text || "Untitled";
    const status = todo.properties["status"]?.status?.name || "Unknown";
    const kategori = todo.properties["kategori"]?.select?.name || "";

    let statusIcon = status === "Done" ? "✅" : "⏳";
    let kategoriText = "";
    if (kategori) {
      if (kategori === "Penting") {
        kategoriText = ` 🔥[${kategori}]`;
      } else if (kategori === "Segera") {
        kategoriText = ` ⚡[${kategori}]`;
      } else if (kategori === "Pribadi") {
        kategoriText = ` 👤[${kategori}]`;
      } else {
        kategoriText = ` [${kategori}]`;
      }
    }

    return {
      name: `${statusIcon} ${name}${kategoriText}`,
      value: todo.id,
      disabled: status === "Done" ? "Already completed" : false
    };
  });

  try {
    const selectedTodoId = await select({
      message: chalk.blue("🎯 Select todo to mark as done:"),
      choices: choices,
      pageSize: 15
    });

    const result = await updateTodoStatus(selectedTodoId, "Done");

    if (result.success) {
      await loadTodos();
      displayTodos();
      console.log(chalk.green(result.message));
    } else {
      console.log(chalk.red(result.message));
    }

    await showOptions();
  } catch (error) {
    if (isEscapeKeyPressed(error)) {
      console.log(chalk.yellow("\n🔙 Kembali ke menu utama..."));
      await showOptions();
    } else {
      console.log(chalk.red("❌ Error:", error.message));
      await showOptions();
    }
  }
}

// Function untuk handle bulk mark todos as done
async function handleBulkMarkDone() {
  console.log(chalk.bold.yellow("\n☑️  BULK MARK TODOS AS DONE"));
  console.log(chalk.gray("(Use SPACE to select, ENTER to confirm, ESC to return to main menu)\n"));

  if (allTodos.length === 0) {
    console.log(chalk.red("❌ Tiada todos untuk di-mark!"));
    await showOptions();
    return;
  }

  // Filter only non-completed todos for selection
  const incompleteTodos = allTodos.filter(todo => {
    const status = todo.properties["status"]?.status?.name || "Unknown";
    return status !== "Done";
  });

  if (incompleteTodos.length === 0) {
    console.log(chalk.yellow("✅ Semua todos sudah selesai!"));
    await showOptions();
    return;
  }

  // Create checkbox choices from incomplete todos
  const choices = incompleteTodos.map((todo, index) => {
    const name = todo.properties["name"]?.title?.[0]?.plain_text || "Untitled";
    const kategori = todo.properties["kategori"]?.select?.name || "";
    const dueDate = todo.properties["due date"]?.date?.start;

    let kategoriText = "";
    if (kategori) {
      if (kategori === "Penting") {
        kategoriText = ` 🔥[${kategori}]`;
      } else if (kategori === "Segera") {
        kategoriText = ` ⚡[${kategori}]`;
      } else if (kategori === "Pribadi") {
        kategoriText = ` 👤[${kategori}]`;
      } else {
        kategoriText = ` [${kategori}]`;
      }
    }

    // Add due date info if exists
    let dueDateText = "";
    if (dueDate) {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date(dueDate);
      const todayDate = new Date(today);

      if (due < todayDate) {
        dueDateText = chalk.red(` (Overdue: ${dueDate})`);
      } else if (due.getTime() === todayDate.getTime()) {
        dueDateText = chalk.yellow(` (Due today)`);
      } else {
        dueDateText = chalk.cyan(` (Due: ${dueDate})`);
      }
    }

    return {
      name: `⏳ ${name}${kategoriText}${dueDateText}`,
      value: todo.id
    };
  });

  try {
    const selectedTodoIds = await checkbox({
      message: chalk.blue("🎯 Select todos to mark as done (Space to select, Enter to confirm):"),
      choices: choices,
      pageSize: 15
    });

    if (selectedTodoIds.length === 0) {
      console.log(chalk.yellow("❌ Tiada todos dipilih!"));
      await showOptions();
      return;
    }

    // Confirmation
    const confirmResult = await confirm({
      message: chalk.red(`⚠️  Confirm mark ${selectedTodoIds.length} todos as Done?`),
      default: false
    });

    if (!confirmResult) {
      console.log(chalk.yellow("❌ Operasi dibatalkan"));
      await showOptions();
      return;
    }

    const result = await bulkUpdateTodoStatus(selectedTodoIds, "Done");

    if (result.success) {
      await loadTodos();
      displayTodos();
      console.log(chalk.green(result.message));
    } else {
      console.log(chalk.red(result.message));
    }

    await showOptions();
  } catch (error) {
    if (isEscapeKeyPressed(error)) {
      console.log(chalk.yellow("\n🔙 Kembali ke menu utama..."));
      await showOptions();
    } else {
      console.log(chalk.red("❌ Error:", error.message));
      await showOptions();
    }
  }
}

// Function untuk handle add todo
async function handleAddTodo() {
  console.log(chalk.bold.green("\n➕ TAMBAH TODO BARU"));
  console.log(chalk.gray("(Tekan ESC untuk kembali ke menu utama)\n"));

  try {
    const taskName = await input({
      message: chalk.blue("📝 Masukkan nama task:")
    });

    if (!taskName.trim()) {
      console.log(chalk.red("❌ Nama task tidak boleh kosong!"));
      await showOptions();
      return;
    }

    const kategori = await select({
      message: chalk.blue("🏷️  Pilih kategori:"),
      choices: [
        { name: "⚡ Segera", value: "Segera" },
        { name: "🔥 Penting", value: "Penting" },
        { name: "👤 Pribadi", value: "Pribadi" },
        { name: "📝 Tiada kategori", value: null }
      ]
    });

    await addTodo(taskName.trim(), kategori);
    await loadTodos();
    displayTodos();
    await showOptions();
  } catch (error) {
    if (isEscapeKeyPressed(error)) {
      console.log(chalk.yellow("\n🔙 Kembali ke menu utama..."));
      await showOptions();
    } else {
      console.log(chalk.red("❌ Error:", error.message));
      await showOptions();
    }
  }
}

// Function untuk handle add todo with due date
async function handleAddTodoWithDueDate() {
  console.log(chalk.bold.blue("\n📅 TAMBAH TODO DENGAN DUE DATE"));
  console.log(chalk.gray("(Tekan ESC untuk kembali ke menu utama)\n"));

  try {
    const taskName = await input({
      message: chalk.blue("📝 Masukkan nama task:")
    });

    if (!taskName.trim()) {
      console.log(chalk.red("❌ Nama task tidak boleh kosong!"));
      await showOptions();
      return;
    }

    const kategori = await select({
      message: chalk.blue("🏷️  Pilih kategori:"),
      choices: [
        { name: "⚡ Segera", value: "Segera" },
        { name: "🔥 Penting", value: "Penting" },
        { name: "👤 Pribadi", value: "Pribadi" },
        { name: "📝 Tiada kategori", value: null }
      ]
    });

    // Get date options
    const dates = getDateOptions();

    const dateChoice = await select({
      message: chalk.blue("📅 Pilih due date:"),
      choices: [
        { name: `📅 Hari ini (${dates.today})`, value: dates.today },
        { name: `🌅 Esok (${dates.tomorrow})`, value: dates.tomorrow },
        { name: `📆 Minggu depan (${dates.nextWeek})`, value: dates.nextWeek },
        { name: `🗓️  Bulan depan (${dates.nextMonth})`, value: dates.nextMonth },
        { name: "✏️  Masukkan tarikh custom", value: "custom" },
        { name: "🚫 Tiada due date", value: null }
      ]
    });

    let dueDate = dateChoice;

    // If custom date is selected, ask for manual input
    if (dateChoice === "custom") {
      dueDate = await input({
        message: chalk.blue("📅 Masukkan due date (YYYY-MM-DD, contoh: 2025-09-15):"),
        default: dates.today
      });
    }

    // Validate date format only for custom input
    if (dateChoice === "custom" && dueDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dueDate.trim() && !dateRegex.test(dueDate.trim())) {
        console.log(chalk.red("❌ Format tarikh tidak betul! Gunakan YYYY-MM-DD"));
        await showOptions();
        return;
      }
      dueDate = dueDate.trim() || null;
    }

    const due = dueDate;
    await addTodoWithDueDate(taskName.trim(), kategori, due);
    await loadTodos();
    displayTodos();
    await showOptions();
  } catch (error) {
    if (isEscapeKeyPressed(error)) {
      console.log(chalk.yellow("\n🔙 Kembali ke menu utama..."));
      await showOptions();
    } else {
      console.log(chalk.red("❌ Error:", error.message));
      await showOptions();
    }
  }
}

// Mulakan aplikasi - papar todos dulu, kemudian tunjuk options
async function startApp() {
  await main();
  await showOptions();
}

startApp();
