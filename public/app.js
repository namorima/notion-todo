// Notion Manager - Client-Side Application
// Version 2.0.0 - Netlify Serverless Edition

class NotionManager {
  constructor() {
    this.token = null;
    this.todos = [];
    this.calendar = [];
    this.holidays = [];
    this.currentFilter = 'all';
    this.currentView = 'grid';
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    this.selectedDate = null;

    this.init();
  }

  // ==================== INITIALIZATION ====================

  async init() {
    // Check authentication
    if (!this.checkAuth()) {
      console.log('Not authenticated, redirecting to login');
      window.location.href = '/login.html';
      return;
    }

    console.log('Authenticated, loading application');

    // Load data
    await this.loadData();

    // Setup event listeners
    this.setupEventListeners();

    // Initial render
    this.render();

    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  checkAuth() {
    this.token = localStorage.getItem('notion_manager_token');

    if (!this.token) {
      return false;
    }

    // Check token expiry (basic validation)
    try {
      const parts = this.token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now();

      if (payload.exp && payload.exp < now) {
        localStorage.removeItem('notion_manager_token');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  async loadData() {
    try {
      // Show loading state
      this.showLoading();

      // Parallel fetch todos and calendar
      const [todosData, calendarData] = await Promise.all([
        this.apiRequest('get-todos'),
        this.apiRequest('get-calendar')
      ]);

      this.todos = todosData.todos || [];
      this.calendar = calendarData.calendar || [];
      this.holidays = calendarData.holidays || [];

      console.log('Data loaded:', {
        todos: this.todos.length,
        calendar: this.calendar.length,
        holidays: this.holidays.length
      });

    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Failed to load data. Please refresh the page.');
    }
  }

  async apiRequest(endpoint, options = {}) {
    const url = `/.netlify/functions/${endpoint}`;

    const config = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('notion_manager_token');
      window.location.href = '/login.html';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // ==================== RENDERING ====================

  render() {
    this.renderStats();
    this.renderTodos();
    this.renderCalendar();
    this.renderCalendarEvents();

    // Reinitialize Lucide icons after rendering
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  renderStats() {
    // Calculate counts for filter badges
    const all = this.todos.length;
    const completed = this.todos.filter(t => t.status === 'Done').length;
    const overdue = this.todos.filter(t => {
      if (t.status === 'Done') return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date();
    }).length;
    const pending = this.todos.filter(t => t.status === 'Not started').length;

    // Update count badges
    document.getElementById('countAll').textContent = all;
    document.getElementById('countCompleted').textContent = completed;
    document.getElementById('countOverdue').textContent = overdue;
    document.getElementById('countPending').textContent = pending;
  }

  renderTodos() {
    const container = document.getElementById('todosGrid');
    let filteredTodos = this.getFilteredTodos();

    if (filteredTodos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i data-lucide="inbox"></i>
          <p>No tasks found</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = filteredTodos.map(todo => this.createTodoCard(todo)).join('');
  }

  getFilteredTodos() {
    let filtered = [...this.todos];

    switch (this.currentFilter) {
      case 'completed':
        filtered = filtered.filter(t => t.status === 'Done');
        break;
      case 'overdue':
        filtered = filtered.filter(t => {
          if (t.status === 'Done') return false;
          const dueDate = new Date(t.dueDate);
          return dueDate < new Date();
        });
        break;
      case 'pending':
        filtered = filtered.filter(t => t.status === 'Not started');
        break;
      case 'in-progress':
        filtered = filtered.filter(t => t.status === 'In progress');
        break;
    }

    return filtered;
  }

  createTodoCard(todo) {
    const isOverdue = new Date(todo.dueDate) < new Date() && todo.status !== 'Done';
    const categoryEmoji = this.getCategoryEmoji(todo.kategori);
    const statusInfo = this.getStatusInfo(todo.status);
    const formattedDate = this.formatDate(todo.dueDate);

    return `
      <div class="todo-card ${isOverdue ? 'overdue' : ''} ${todo.status === 'Done' ? 'done' : ''}">
        <div class="todo-header">
          ${todo.kategori ? `<span class="todo-category">${categoryEmoji} ${todo.kategori}</span>` : ''}
          ${todo.status && todo.status !== 'Not started' ? `<span class="todo-status ${statusInfo.class}">${statusInfo.label}</span>` : ''}
        </div>
        <h3 class="todo-title">${this.escapeHtml(todo.name)}</h3>
        <div class="todo-footer">
          <div class="todo-date ${isOverdue ? 'overdue' : ''}">
            <i data-lucide="calendar"></i>
            <span>${formattedDate}</span>
          </div>
          ${todo.kategori ? `<span class="category-badge category-${todo.kategori}">${categoryEmoji} ${todo.kategori}</span>` : '<span class="category-badge">-</span>'}
          ${todo.status && todo.status !== 'Not started' ? `<span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>` : '<span class="status-badge status-secondary">-</span>'}
          <div class="todo-actions">
            ${todo.status !== 'Done' ? `
              <button class="todo-action-btn done" data-id="${todo.id}" title="Mark as Done">
                <i data-lucide="check-circle"></i>
              </button>
            ` : ''}
            <button class="todo-action-btn edit" data-id="${todo.id}" title="Edit">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="todo-action-btn delete" data-id="${todo.id}" title="Delete">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('currentMonthYear');

    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    monthYear.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

    // Get calendar data
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Build calendar HTML
    let html = '<div class="calendar-weekdays">';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      html += `<div class="calendar-weekday">${day}</div>`;
    });
    html += '</div><div class="calendar-days">';

    // Previous month days
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      html += this.createCalendarDay(day, true, false);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      html += this.createCalendarDay(day, false, false);
    }

    // Next month days (7x5 grid = 35 total days)
    const remainingDays = 35 - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
      html += this.createCalendarDay(day, false, true);
    }

    html += '</div>';
    grid.innerHTML = html;
  }

  createCalendarDay(day, isPrevMonth, isNextMonth) {
    let date;
    if (isPrevMonth) {
      date = new Date(this.currentYear, this.currentMonth - 1, day);
    } else if (isNextMonth) {
      date = new Date(this.currentYear, this.currentMonth + 1, day);
    } else {
      date = new Date(this.currentYear, this.currentMonth, day);
    }

    const dateStr = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const isToday = dateStr === today;
    const isWeekend = date.getDay() === 5 || date.getDay() === 6; // Friday or Saturday

    // Check for events
    const events = this.calendar.filter(event => {
      if (!event.date) return false;
      if (event.date.start === dateStr) return true;
      if (event.date.end) {
        const start = new Date(event.date.start);
        const end = new Date(event.date.end);
        return date >= start && date <= end;
      }
      return false;
    });

    // Check for holidays
    const holiday = this.holidays.find(h => h.date === dateStr);

    let classes = ['calendar-day'];
    if (isPrevMonth || isNextMonth) classes.push('other-month');
    if (isToday) classes.push('today');
    if (isWeekend) classes.push('weekend');
    if (events.length > 0) classes.push('has-event');
    if (holiday) classes.push('is-holiday');

    let tooltip = '';
    if (events.length > 0) {
      tooltip += events.map(e => e.name).join(', ');
    }
    if (holiday) {
      if (tooltip) tooltip += ' | ';
      tooltip += holiday.name;
    }

    return `
      <div class="${classes.join(' ')}" data-date="${dateStr}" title="${tooltip}">
        <span class="day-number">${day}</span>
        ${events.length > 0 ? `<span class="event-indicator">${events.length}</span>` : ''}
      </div>
    `;
  }

  renderCalendarEvents() {
    const container = document.getElementById('calendarEventsList');

    // Filter events - show events for current calendar month
    let events = [...this.calendar];

    if (this.selectedDate) {
      // Show events for selected date
      events = events.filter(event => {
        if (!event.date) return false;
        if (event.date.start === this.selectedDate) return true;
        if (event.date.end) {
          const start = new Date(event.date.start);
          const end = new Date(event.date.end);
          const selected = new Date(this.selectedDate);
          return selected >= start && selected <= end;
        }
        return false;
      });
    } else {
      // Show events for current calendar month only
      events = events.filter(event => {
        if (!event.date || !event.date.start) return false;
        const eventDate = new Date(event.date.start);
        return eventDate.getMonth() === this.currentMonth &&
               eventDate.getFullYear() === this.currentYear;
      });
    }

    // Sort by date (most recent first, then upcoming)
    const now = new Date();
    events.sort((a, b) => {
      const dateA = new Date(a.date?.start || 0);
      const dateB = new Date(b.date?.start || 0);

      // Prioritize upcoming events, then past events
      const aIsUpcoming = dateA >= now;
      const bIsUpcoming = dateB >= now;

      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      // Within same category (both upcoming or both past), sort by date
      if (aIsUpcoming && bIsUpcoming) {
        return dateA - dateB; // Upcoming: earliest first
      } else {
        return dateB - dateA; // Past: most recent first
      }
    });

    if (events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i data-lucide="calendar-x"></i>
          <p>No events</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = events.map(event => this.createEventCard(event)).join('');
  }

  createEventCard(event) {
    const startDate = this.formatDate(event.date?.start);
    const endDate = event.date?.end ? this.formatDate(event.date.end) : null;
    const tags = event.tags && event.tags.length > 0
      ? event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')
      : '';

    return `
      <div class="calendar-event-card ${event.done ? 'done' : ''}">
        <div class="event-content">
          <div class="event-title-date">
            <h3>${this.escapeHtml(event.name)}</h3>
            <div class="event-date">
              <i data-lucide="calendar"></i>
              <span>${startDate}${endDate ? ` - ${endDate}` : ''}</span>
            </div>
          </div>
          ${event.location ? `
            <div class="event-location">
              <i data-lucide="map-pin"></i>
              <span>${this.escapeHtml(event.location)}</span>
            </div>
          ` : ''}
          ${tags ? `<div class="event-tags">${tags}</div>` : ''}
        </div>
        <div class="event-actions">
          ${!event.done ? `
            <button class="event-action-btn done" data-id="${event.id}" title="Mark as Done">
              <i data-lucide="check-circle"></i>
            </button>
          ` : ''}
          <button class="event-action-btn edit" data-id="${event.id}" title="Edit">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="event-action-btn delete" data-id="${event.id}" title="Delete">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
  }

  // ==================== EVENT LISTENERS ====================

  setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('notion_manager_token');
      window.location.href = '/login.html';
    });

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // FAB button
    document.getElementById('fabButton').addEventListener('click', () => {
      const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
      if (activeTab === 'todos') {
        this.openModal('addTodoModal');
      } else {
        this.openModal('addCalendarModal');
      }
    });

    // Add event button (calendar tab)
    document.getElementById('addEventBtn').addEventListener('click', () => {
      this.openModal('addCalendarModal');
    });

    // Stat cards (clickable filters)
    document.querySelectorAll('.stat-card.clickable').forEach(card => {
      card.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.filter;
        this.setFilter(filter);
      });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.filter;
        this.setFilter(filter);
      });
    });

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.setView(view);
      });
    });

    // Calendar navigation
    document.getElementById('prevMonthBtn').addEventListener('click', () => {
      this.changeMonth(-1);
    });
    document.getElementById('nextMonthBtn').addEventListener('click', () => {
      this.changeMonth(1);
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.dataset.modal;
        if (modalId) {
          this.closeModal(modalId);
        }
      });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Form submissions
    document.getElementById('addTodoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTodo(e.target);
    });

    document.getElementById('editTodoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEditTodo(e.target);
    });

    document.getElementById('addCalendarForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddEvent(e.target);
    });

    document.getElementById('editCalendarForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEditEvent(e.target);
    });

    // Delegated event listeners for dynamic content
    document.addEventListener('click', (e) => {
      // Todo actions
      if (e.target.closest('.todo-action-btn.done')) {
        const id = e.target.closest('.todo-action-btn.done').dataset.id;
        this.markTodoDone(id);
      } else if (e.target.closest('.todo-action-btn.edit')) {
        const id = e.target.closest('.todo-action-btn.edit').dataset.id;
        this.openEditTodoModal(id);
      } else if (e.target.closest('.todo-action-btn.delete')) {
        const id = e.target.closest('.todo-action-btn.delete').dataset.id;
        this.deleteTodo(id);
      }

      // Calendar event actions
      if (e.target.closest('.event-action-btn.done')) {
        const id = e.target.closest('.event-action-btn.done').dataset.id;
        this.markEventDone(id);
      } else if (e.target.closest('.event-action-btn.edit')) {
        const id = e.target.closest('.event-action-btn.edit').dataset.id;
        this.openEditEventModal(id);
      } else if (e.target.closest('.event-action-btn.delete')) {
        const id = e.target.closest('.event-action-btn.delete').dataset.id;
        this.deleteEvent(id);
      }

      // Calendar day click
      if (e.target.closest('.calendar-day')) {
        const date = e.target.closest('.calendar-day').dataset.date;
        this.selectDate(date);
      }
    });
  }

  // ==================== UI ACTIONS ====================

  switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tab}Content`);
    });
  }

  setFilter(filter) {
    this.currentFilter = filter;

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    // Update stat cards
    document.querySelectorAll('.stat-card.clickable').forEach(card => {
      card.classList.toggle('active', card.dataset.filter === filter);
    });

    this.renderTodos();
    if (window.lucide) lucide.createIcons();
  }

  setView(view) {
    this.currentView = view;

    // Update view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update grid class
    const grid = document.getElementById('todosGrid');
    grid.classList.toggle('list-view', view === 'list');
  }

  changeMonth(delta) {
    this.currentMonth += delta;

    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }

    this.renderCalendar();
    this.renderCalendarEvents(); // Re-render events list when month changes
    if (window.lucide) lucide.createIcons();
  }

  selectDate(date) {
    this.selectedDate = date;

    // Update selected date styling
    document.querySelectorAll('.calendar-day').forEach(day => {
      day.classList.toggle('selected', day.dataset.date === date);
    });

    this.renderCalendarEvents();
    if (window.lucide) lucide.createIcons();
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Reset form
    const form = modal.querySelector('form');
    if (form) form.reset();
  }

  openEditTodoModal(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    document.getElementById('editTodoId').value = todo.id;
    document.getElementById('editTodoName').value = todo.name;
    document.getElementById('editTodoCategory').value = todo.kategori;
    document.getElementById('editTodoDueDate').value = todo.dueDate;
    document.getElementById('editTodoStatus').value = todo.status;

    this.openModal('editTodoModal');
  }

  openEditEventModal(id) {
    const event = this.calendar.find(e => e.id === id);
    if (!event) return;

    document.getElementById('editEventId').value = event.id;
    document.getElementById('editEventName').value = event.name;
    document.getElementById('editEventStartDate').value = event.date?.start || '';
    document.getElementById('editEventEndDate').value = event.date?.end || '';
    document.getElementById('editEventLocation').value = event.location || '';
    document.getElementById('editEventTags').value = event.tags ? event.tags.join(', ') : '';
    document.getElementById('editEventDone').checked = event.done || false;

    this.openModal('editCalendarModal');
  }

  // ==================== CRUD OPERATIONS ====================

  async handleAddTodo(form) {
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      kategori: formData.get('kategori'),
      dueDate: formData.get('dueDate')
    };

    try {
      await this.apiRequest('add-todo', {
        method: 'POST',
        body: data
      });

      this.closeModal('addTodoModal');
      await this.loadData();
      this.render();
      this.showSuccess('Todo added successfully!');
    } catch (error) {
      console.error('Error adding todo:', error);
      this.showError('Failed to add todo. Please try again.');
    }
  }

  async handleEditTodo(form) {
    const formData = new FormData(form);
    const data = {
      id: formData.get('id'),
      name: formData.get('name'),
      kategori: formData.get('kategori'),
      dueDate: formData.get('dueDate'),
      status: formData.get('status')
    };

    try {
      await this.apiRequest('edit-todo', {
        method: 'POST',
        body: data
      });

      this.closeModal('editTodoModal');
      await this.loadData();
      this.render();
      this.showSuccess('Todo updated successfully!');
    } catch (error) {
      console.error('Error editing todo:', error);
      this.showError('Failed to update todo. Please try again.');
    }
  }

  async markTodoDone(id) {
    if (!confirm('Mark this todo as done?')) return;

    try {
      await this.apiRequest('done-todo', {
        method: 'POST',
        body: { id }
      });

      await this.loadData();
      this.render();
      this.showSuccess('Todo marked as done!');
    } catch (error) {
      console.error('Error marking todo as done:', error);
      this.showError('Failed to mark todo as done. Please try again.');
    }
  }

  async deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      await this.apiRequest('delete-todo', {
        method: 'POST',
        body: { id }
      });

      await this.loadData();
      this.render();
      this.showSuccess('Todo deleted successfully!');
    } catch (error) {
      console.error('Error deleting todo:', error);
      this.showError('Failed to delete todo. Please try again.');
    }
  }

  async handleAddEvent(form) {
    const formData = new FormData(form);
    const tags = formData.get('tags')
      ? formData.get('tags').split(',').map(t => t.trim()).filter(t => t)
      : [];

    const data = {
      name: formData.get('name'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || formData.get('startDate'),
      location: formData.get('location'),
      tags: tags
    };

    try {
      await this.apiRequest('add-calendar', {
        method: 'POST',
        body: data
      });

      this.closeModal('addCalendarModal');
      await this.loadData();
      this.render();
      this.showSuccess('Event added successfully!');
    } catch (error) {
      console.error('Error adding event:', error);
      this.showError('Failed to add event. Please try again.');
    }
  }

  async handleEditEvent(form) {
    const formData = new FormData(form);
    const tags = formData.get('tags')
      ? formData.get('tags').split(',').map(t => t.trim()).filter(t => t)
      : [];

    const data = {
      id: formData.get('id'),
      name: formData.get('name'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || formData.get('startDate'),
      location: formData.get('location'),
      tags: tags,
      done: document.getElementById('editEventDone').checked
    };

    try {
      await this.apiRequest('edit-calendar', {
        method: 'POST',
        body: data
      });

      this.closeModal('editCalendarModal');
      await this.loadData();
      this.render();
      this.showSuccess('Event updated successfully!');
    } catch (error) {
      console.error('Error editing event:', error);
      this.showError('Failed to update event. Please try again.');
    }
  }

  async markEventDone(id) {
    if (!confirm('Mark this event as done?')) return;

    try {
      await this.apiRequest('done-calendar', {
        method: 'POST',
        body: { id }
      });

      await this.loadData();
      this.render();
      this.showSuccess('Event marked as done!');
    } catch (error) {
      console.error('Error marking event as done:', error);
      this.showError('Failed to mark event as done. Please try again.');
    }
  }

  async deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await this.apiRequest('delete-calendar', {
        method: 'POST',
        body: { id }
      });

      await this.loadData();
      this.render();
      this.showSuccess('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      this.showError('Failed to delete event. Please try again.');
    }
  }

  // ==================== HELPER FUNCTIONS ====================

  getCategoryEmoji(category) {
    const emojiMap = {
      'Penting': '🔥',
      'Segera': '⚡',
      'Pribadi': '👤'
    };
    return emojiMap[category] || '📝';
  }

  getStatusInfo(status) {
    const statusMap = {
      'Not started': { label: 'Not Started', class: 'status-pending' },
      'In progress': { label: 'In Progress', class: 'status-progress' },
      'Done': { label: 'Done', class: 'status-done' }
    };
    return statusMap[status] || { label: status, class: '' };
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-MY', options);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showLoading() {
    // Could implement a loading spinner
    console.log('Loading...');
  }

  showSuccess(message) {
    // Simple alert for now - could be improved with toast notifications
    console.log('Success:', message);
  }

  showError(message) {
    alert(message);
  }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.notionApp = new NotionManager();
  });
} else {
  window.notionApp = new NotionManager();
}
