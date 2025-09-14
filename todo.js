import fetch from "node-fetch";
import readline from "readline";
import chalk from "chalk";
import boxen from "boxen";
import prompts from "prompts";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

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

// Setup readline untuk input
let rl;

// Pagination variables
let currentPage = 0;
const itemsPerPage = 20;
let allTodos = [];

// Fungsi untuk tambah todo baru
async function addTodo(taskName, kategori = null) {
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
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (res.ok) {
      console.log(chalk.green(`✅ Todo "${taskName}" berjaya ditambah!`));
    } else {
      const error = await res.json();
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }
  } catch (err) {
    console.log(chalk.red(`❌ Error: ${err.message}`));
  }
}

// Fungsi untuk tambah todo dengan due date
async function addTodoWithDueDate(taskName, kategori = null, dueDate = null) {
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
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (res.ok) {
      console.log(chalk.green(`✅ Todo "${taskName}" dengan due date berjaya ditambah!`));
    } else {
      const error = await res.json();
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }
  } catch (err) {
    console.log(chalk.red(`❌ Error: ${err.message}`));
  }
}

// Fungsi untuk update status todo
async function updateTodoStatus(pageId, status) {
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
    const res = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body)
    });

    if (res.ok) {
      console.log(chalk.green(`✅ Todo #${allTodos.findIndex(todo => todo.id === pageId) + 1} status updated to "${status}"!`));
      return true;
    } else {
      const error = await res.json();
      console.log(chalk.red(`❌ Error: ${error.message}`));
      return false;
    }
  } catch (err) {
    console.log(chalk.red(`❌ Error: ${err.message}`));
    return false;
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
  const url = `https://api.notion.com/v1/databases/${database_id}/query`;

  const headers = {
    "Authorization": `Bearer ${notion_api_key}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
  };

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

  const data = await res.json();
  allTodos = data.results;
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
      
      // Format kategori dengan simbol khusus untuk "Penting"
      let kategoriText = "";
      if (kategori) {
        if (kategori === "Penting") {
          kategoriText = ` ${chalk.red.bold("🔥[" + kategori + "]")}`; // Fire emoji untuk penting
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
function showOptions() {
  // Options menu tanpa border
  console.log(chalk.white.bold("\nOptions:"));
  
  const totalPages = Math.ceil(allTodos.length / itemsPerPage);
  console.log(chalk.blue("2. Tambah todo baru"));
  console.log(chalk.blue("3. Tambah todo dengan due date"));
  console.log(chalk.green("#done <number>. Mark todo as Done"));
  
  if (totalPages > 1) {
    if (currentPage < totalPages - 1) {
      console.log(chalk.blue("> Next page"));
    }
    if (currentPage > 0) {
      console.log(chalk.blue("< Previous page"));
    }
  }
  console.log(chalk.red("6. Exit"));
  
  // Create readline interface for single key navigation
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const promptText = chalk.bold.yellow("Select option (or #done <number>): ");
  rl.question(promptText, async (choice) => {
    const input = choice.trim();
    
    // Check for #done command
    if (input.startsWith('#done ')) {
      const todoNumber = parseInt(input.split(' ')[1]);
      if (isNaN(todoNumber) || todoNumber < 1 || todoNumber > allTodos.length) {
        console.log(chalk.red(`❌ Invalid todo number! Please use a number between 1-${allTodos.length}`));
        rl.close();
        showOptions();
        return;
      }
      
      // Get the actual todo index considering pagination
      const todoIndex = todoNumber - 1;
      const todoToUpdate = allTodos[todoIndex];
      
      rl.close();
      const success = await updateTodoStatus(todoToUpdate.id, "Done");
      if (success) {
        await loadTodos(); // Reload data
        clearConsole(); // Clear console for clean display
        displayTodos(); // Refresh display
      }
      showOptions();
      return;
    }
    
    switch (input) {
      case '2':
        rl.close();
        await handleAddTodo();
        break;
      case '3':
        rl.close();
        await handleAddTodoWithDueDate();
        break;
      case '>':
        rl.close();
        // Next page
        if (currentPage < totalPages - 1) {
          currentPage++;
          displayTodos();
          showOptions();
        } else {
          console.log(chalk.red("❌ Sudah di halaman terakhir!"));
          setTimeout(() => {
            showOptions();
          }, 1000);
        }
        break;
      case '<':
        rl.close();
        // Previous page
        if (currentPage > 0) {
          currentPage--;
          displayTodos();
          showOptions();
        } else {
          console.log(chalk.red("❌ Sudah di halaman pertama!"));
          setTimeout(() => {
            showOptions();
          }, 1000);
        }
        break;
      case '6':
        const goodbyeBox = boxen(chalk.green.bold("👋 Goodbye!"), {
          padding: 1,
          margin: 1,
          borderStyle: "double",
          borderColor: "green"
        });
        console.log(goodbyeBox);
        rl.close();
        process.exit(0);
        break;
      default:
        console.log(chalk.red("❌ Pilihan tidak sah!"));
        rl.close();
        showOptions();
        break;
    }
  });
}

// Function untuk handle add todo
async function handleAddTodo() {
  const addTodoHeader = boxen(chalk.bold.green("➕ TAMBAH TODO BARU"), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "green"
  });
  console.log(addTodoHeader);

  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(chalk.cyan("📝 Masukkan nama task: "), (taskName) => {
    if (!taskName.trim()) {
      console.log(chalk.red("❌ Nama task tidak boleh kosong!"));
      rl.close();
      showOptions();
      return;
    }
    
    rl.question(chalk.blue("🏷️  Masukkan kategori (kosongkan jika tiada): "), async (kategori) => {
      const kat = kategori.trim() || null;
      await addTodo(taskName.trim(), kat);
      await loadTodos();
      displayTodos();
      rl.close();
      showOptions();
    });
  });
}

// Function untuk handle add todo with due date
async function handleAddTodoWithDueDate() {
  const addTodoHeader = boxen(chalk.bold.blue("📅 TAMBAH TODO DENGAN DUE DATE"), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "blue"
  });
  console.log(addTodoHeader);

  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(chalk.cyan("📝 Masukkan nama task: "), (taskName) => {
    if (!taskName.trim()) {
      console.log(chalk.red("❌ Nama task tidak boleh kosong!"));
      rl.close();
      showOptions();
      return;
    }
    
    rl.question(chalk.blue("🏷️  Masukkan kategori (kosongkan jika tiada): "), (kategori) => {
      rl.question(chalk.yellow("📅 Masukkan due date (YYYY-MM-DD, contoh: 2025-09-15): "), async (dueDate) => {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dueDate.trim() && !dateRegex.test(dueDate.trim())) {
          console.log(chalk.red("❌ Format tarikh tidak betul! Gunakan YYYY-MM-DD"));
          rl.close();
          showOptions();
          return;
        }
        
        const kat = kategori.trim() || null;
        const due = dueDate.trim() || null;
        await addTodoWithDueDate(taskName.trim(), kat, due);
        await loadTodos();
        displayTodos();
        rl.close();
        showOptions();
      });
    });
  });
}

// Mulakan aplikasi - papar todos dulu, kemudian tunjuk options
async function startApp() {
  await main();
  showOptions();
}

startApp();
