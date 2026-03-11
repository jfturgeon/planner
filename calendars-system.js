// ═══════════════════════════════════════════════════════════════════════════
// CALENDARS SYSTEM — Advanced calendar and event management
// ═══════════════════════════════════════════════════════════════════════════

const CALENDARS_KEY = 'ap_calendars';
const EVENTS_KEY = 'ap_events';
const NOTIFICATIONS_KEY = 'ap_notifications';

// Default calendars
const DEFAULT_CALENDARS = [
  { id: 'default', name: 'Mon Calendrier', color: '#2d6bbf', visible: true },
];

// Load calendars
function loadCalendars() {
  try {
    const stored = JSON.parse(localStorage.getItem(CALENDARS_KEY));
    return stored || DEFAULT_CALENDARS;
  } catch (e) {
    return DEFAULT_CALENDARS;
  }
}

// Save calendars
function saveCalendars(calendars) {
  localStorage.setItem(CALENDARS_KEY, JSON.stringify(calendars));
}

// Load events
function loadEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem(EVENTS_KEY));
    return stored || [];
  } catch (e) {
    return [];
  }
}

// Save events
function saveEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

// Create event object
function createEvent(data) {
  return {
    id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    calendarId: data.calendarId || 'default',
    title: data.title || '',
    description: data.description || '',
    type: data.type || 'event', // 'event' or 'task'
    allDay: data.allDay !== false,
    date: data.date || new Date().toISOString().split('T')[0],
    time: data.time || '09:00',
    endTime: data.endTime || '10:00',
    endDate: data.endDate || null,
    deadline: data.deadline || null,
    repeat: data.repeat || 'never', // never, daily, weekly, monthly, annually, custom
    repeatConfig: data.repeatConfig || {},
    notifications: data.notifications || [
      { type: 'minutes', value: 15 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate time options (15-minute intervals)
function generateTimeOptions() {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hStr = String(h).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? 'am' : 'pm';
      const label = `${String(hour12).padStart(2, '0')}:${mStr}${ampm}`;
      options.push({ value: `${hStr}:${mStr}`, label });
    }
  }
  return options;
}

// Show event creation modal
function showEventModal(initialData = {}) {
  const modal = document.createElement('div');
  modal.className = 'event-modal';
  modal.id = 'eventModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: var(--surface);
    border-radius: 12px;
    width: min(600px, 95vw);
    max-height: 90vh;
    overflow-y: auto;
    padding: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  `;

  const title = document.createElement('h2');
  title.style.cssText = `
    margin: 0 0 20px 0;
    font-family: 'DM Serif Display', serif;
    font-size: 1.3rem;
    color: var(--text);
  `;
  title.textContent = 'Ajouter un événement';
  content.appendChild(title);

  // Form fields
  const fields = {
    title: createField('title', 'Titre', 'text', initialData.title || ''),
    type: createField('type', 'Type', 'select', initialData.type || 'event', [
      ['event', '📅 Événement'],
      ['task', '✓ Tâche'],
    ]),
    date: createField('date', 'Date', 'date', initialData.date || new Date().toISOString().split('T')[0]),
    timeStart: createField('timeStart', 'Heure de début', 'time-dropdown', initialData.time || '09:00'),
    timeEnd: createField('timeEnd', 'Heure de fin', 'time-dropdown', initialData.endTime || '10:00'),
    allDay: createField('allDay', 'Journée entière', 'checkbox', initialData.allDay !== false),
    endDate: createField('endDate', 'Date de fin', 'date', initialData.endDate || ''),
    repeat: createField('repeat', 'Répétition', 'select', initialData.repeat || 'never', [
      ['never', 'Ne se répète pas'],
      ['daily', 'Quotidien'],
      ['weekly', 'Hebdomadaire'],
      ['monthly', 'Mensuel'],
      ['annually', 'Annuel'],
      ['custom', 'Personnalisé'],
    ]),
    deadline: createField('deadline', 'Échéance', 'date', initialData.deadline || ''),
    description: createField('description', 'Description', 'textarea', initialData.description || ''),
    calendar: createField('calendar', 'Calendrier', 'select', initialData.calendarId || 'default', 
      loadCalendars().map(c => [c.id, c.name])
    ),
  };

  // Add all fields to content
  Object.values(fields).forEach(field => content.appendChild(field));
  
  // Setup all-day toggle
  const allDayCheck = fields.allDay.querySelector('input');
  const timeStartField = fields.timeStart;
  const timeEndField = fields.timeEnd;
  const endDateField = fields.endDate;
  
  // Show/hide fields based on all-day status
  function updateFieldsVisibility() {
    if (allDayCheck.checked) {
      timeStartField.style.display = 'none';
      timeEndField.style.display = 'none';
      endDateField.style.display = 'block';
    } else {
      timeStartField.style.display = 'block';
      timeEndField.style.display = 'block';
      endDateField.style.display = 'none';
    }
  }
  
  // Set initial visibility
  updateFieldsVisibility();
  
  // Listen to all-day checkbox changes
  allDayCheck.addEventListener('change', updateFieldsVisibility);

  // Notifications section
  const notifSection = document.createElement('div');
  notifSection.style.marginTop = '20px';
  const notifTitle = document.createElement('h3');
  notifTitle.textContent = 'Notifications';
  notifTitle.style.cssText = 'margin: 0 0 12px 0; font-size: 0.95rem; color: var(--muted);';
  notifSection.appendChild(notifTitle);

  const notifContainer = document.createElement('div');
  notifContainer.id = 'notif-container';
  notifContainer.style.display = 'flex';
  notifContainer.style.flexDirection = 'column';
  notifContainer.style.gap = '8px';

  const defaultNotif = document.createElement('select');
  defaultNotif.style.cssText = `
    padding: 8px 12px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.85rem;
  `;
  defaultNotif.innerHTML = `
    <option value="0">Quand l'événement commence</option>
    <option value="5">5 minutes avant</option>
    <option value="10" selected>10 minutes avant</option>
    <option value="15">15 minutes avant</option>
    <option value="30">30 minutes avant</option>
    <option value="60">1 heure avant</option>
    <option value="1440">1 jour avant</option>
    <option value="custom">Personnalisé</option>
  `;
  notifContainer.appendChild(defaultNotif);

  const addNotifBtn = document.createElement('button');
  addNotifBtn.textContent = '+ Ajouter une notification';
  addNotifBtn.style.cssText = `
    padding: 8px 12px;
    background: var(--border);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
  `;
  addNotifBtn.addEventListener('click', () => {
    const newNotif = document.createElement('select');
    newNotif.style.cssText = defaultNotif.style.cssText;
    newNotif.innerHTML = defaultNotif.innerHTML;
    notifContainer.insertBefore(newNotif, addNotifBtn);
  });

  notifSection.appendChild(notifContainer);
  notifSection.appendChild(addNotifBtn);
  content.appendChild(notifSection);

  // Buttons
  const buttons = document.createElement('div');
  buttons.style.cssText = `
    display: flex;
    gap: 12px;
    margin-top: 24px;
    justify-content: flex-end;
  `;

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Annuler';
  cancelBtn.style.cssText = `
    padding: 10px 16px;
    background: var(--border);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  `;
  cancelBtn.addEventListener('click', () => modal.remove());

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Enregistrer';
  saveBtn.style.cssText = `
    padding: 10px 16px;
    background: var(--accent2);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  `;
  saveBtn.addEventListener('click', () => {
    const title = fields.title.querySelector('input').value;
    const type = fields.type.querySelector('select').value;
    const date = fields.date.querySelector('input').value;
    const allDay = fields.allDay.querySelector('input').checked;
    
    if (!title || !date) {
      alert('⚠️ Veuillez remplir le titre et la date');
      return;
    }
    
    let eventData = {
      title,
      type,
      date,
      allDay,
      repeat: fields.repeat.querySelector('select').value,
      deadline: fields.deadline.querySelector('input').value || null,
      description: fields.description.querySelector('textarea').value,
      calendarId: fields.calendar.querySelector('select').value,
      notifications: Array.from(notifContainer.querySelectorAll('select')).map(s => {
        const val = s.value;
        if (val === 'custom') return { type: 'custom' };
        if (val === '0') return { type: 'start' };
        return { type: 'minutes', value: parseInt(val) };
      }),
    };
    
    if (allDay) {
      eventData.endDate = fields.endDate.querySelector('input').value || date;
      eventData.time = '00:00';
    } else {
      eventData.time = fields.timeStart.querySelector('select').value;
      eventData.endTime = fields.timeEnd.querySelector('select').value;
    }

    const event = createEvent(eventData);
    const events = loadEvents();
    events.push(event);
    saveEvents(events);

    // Schedule notifications
    scheduleNotifications(event);

    console.log('✅ Événement créé:', event);
    alert('✅ Événement créé avec succès!');
    modal.remove();
    renderCalendarsView();
  });

  buttons.appendChild(cancelBtn);
  buttons.appendChild(saveBtn);
  content.appendChild(buttons);

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Helper to create form field
function createField(name, label, type, value, options = []) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'margin-bottom: 16px;';

  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  labelEl.style.cssText = `
    display: block;
    margin-bottom: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
  `;
  wrapper.appendChild(labelEl);

  let input;
  
  if (type === 'time-dropdown') {
    // Create dropdown with 15-minute intervals
    input = document.createElement('select');
    const timeOptions = generateTimeOptions();
    timeOptions.forEach(opt => {
      const optEl = document.createElement('option');
      optEl.value = opt.value;
      optEl.textContent = opt.label;
      if (opt.value === value) optEl.selected = true;
      input.appendChild(optEl);
    });
  } else if (type === 'select') {
    input = document.createElement('select');
    options.forEach(([val, text]) => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = text;
      if (val === value) opt.selected = true;
      input.appendChild(opt);
    });
  } else if (type === 'textarea') {
    input = document.createElement('textarea');
    input.value = value;
    input.style.height = '100px';
  } else if (type === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value;
  } else {
    input = document.createElement('input');
    input.type = type;
    if (type !== 'checkbox') input.value = value;
  }

  input.style.cssText = `
    width: 100%;
    padding: 8px 12px;
    background: #fafaf8;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.85rem;
    color: var(--text);
    font-family: inherit;
    box-sizing: border-box;
  `;
  if (type === 'checkbox') {
    input.style.width = 'auto';
    input.style.marginRight = '8px';
  }

  wrapper.appendChild(input);
  return wrapper;
}

// Render calendars list and events
function renderCalendarsView() {
  const view = document.getElementById('calendarsView');
  if (!view) return;

  const listContainer = view.querySelector('#gc-calendars-list');
  const eventsContainer = view.querySelector('#gc-events-container');
  const toggleBtn = view.querySelector('#gcToggleList');
  
  if (!listContainer || !eventsContainer) return;

  const calendars = loadCalendars();
  const events = loadEvents();

  // Render calendars list in sidebar
  listContainer.innerHTML = '';

  calendars.forEach(cal => {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      background: var(--bg);
      border-radius: 6px;
      border: 1px solid var(--border);
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = cal.visible !== false;
    checkbox.addEventListener('change', () => {
      cal.visible = checkbox.checked;
      const allCals = loadCalendars();
      const idx = allCals.findIndex(c => c.id === cal.id);
      if (idx >= 0) {
        allCals[idx].visible = checkbox.checked;
        saveCalendars(allCals);
        renderCalendarsView(); // Refresh view
      }
    });
    item.appendChild(checkbox);

    const colorBox = document.createElement('div');
    colorBox.style.cssText = `
      width: 12px;
      height: 12px;
      background: ${cal.color || '#3b82f6'};
      border-radius: 2px;
      flex-shrink: 0;
    `;
    item.appendChild(colorBox);

    const label = document.createElement('span');
    label.textContent = cal.name;
    label.style.cssText = `
      flex: 1;
      font-size: 0.85rem;
      color: var(--text);
      font-weight: 500;
    `;
    item.appendChild(label);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.style.cssText = `
      background: none;
      border: none;
      color: var(--muted);
      cursor: pointer;
      padding: 0;
      font-size: 0.9rem;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    deleteBtn.addEventListener('click', () => {
      const allCals = loadCalendars();
      const filtered = allCals.filter(c => c.id !== cal.id);
      saveCalendars(filtered);
      renderCalendarsView();
    });
    item.appendChild(deleteBtn);

    listContainer.appendChild(item);
  });

  // Render events in main area
  eventsContainer.innerHTML = '';

  const visibleCalIds = calendars.filter(c => c.visible !== false).map(c => c.id);
  const visibleEvents = events.filter(e => visibleCalIds.includes(e.calendarId));

  if (visibleEvents.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.cssText = `
      color: var(--muted);
      text-align: center;
      padding: 40px 20px;
      font-size: 0.95rem;
    `;
    emptyMsg.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 12px;">📭</div>
      <div>Aucun événement</div>
      <div style="font-size: 0.85rem; margin-top: 8px;">Cliquez sur "+ Événement" pour en ajouter</div>
    `;
    eventsContainer.appendChild(emptyMsg);
  } else {
    // Group events by calendar
    const eventsByCalendar = {};
    visibleEvents.forEach(e => {
      if (!eventsByCalendar[e.calendarId]) {
        eventsByCalendar[e.calendarId] = [];
      }
      eventsByCalendar[e.calendarId].push(e);
    });

    // Render each calendar's events
    Object.entries(eventsByCalendar).forEach(([calId, calEvents]) => {
      const cal = calendars.find(c => c.id === calId);
      if (!cal) return;

      // Calendar section header
      const section = document.createElement('div');
      section.style.cssText = `
        margin-bottom: 20px;
      `;

      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        padding: 8px 0;
        border-bottom: 2px solid ${cal.color || '#3b82f6'};
      `;

      const colorDot = document.createElement('div');
      colorDot.style.cssText = `
        width: 10px;
        height: 10px;
        background: ${cal.color || '#3b82f6'};
        border-radius: 50%;
      `;
      header.appendChild(colorDot);

      const headerText = document.createElement('span');
      headerText.textContent = cal.name;
      headerText.style.cssText = `
        font-weight: 600;
        color: var(--text);
        font-size: 0.9rem;
      `;
      header.appendChild(headerText);

      const eventCount = document.createElement('span');
      eventCount.textContent = `(${calEvents.length})`;
      eventCount.style.cssText = `
        font-size: 0.8rem;
        color: var(--muted);
      `;
      header.appendChild(eventCount);

      section.appendChild(header);

      // Events
      const eventsList = document.createElement('div');
      eventsList.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
      `;

      calEvents.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.style.cssText = `
          padding: 10px;
          background: var(--surface);
          border-left: 3px solid ${cal.color || '#3b82f6'};
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        `;
        eventEl.addEventListener('mouseover', () => {
          eventEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        eventEl.addEventListener('mouseout', () => {
          eventEl.style.boxShadow = 'none';
        });

        const typeIcon = event.type === 'task' ? '✓' : '📅';
        const typeLabel = event.type === 'task' ? 'Tâche' : 'Événement';

        eventEl.innerHTML = `
          <div style="font-weight: 500; color: var(--text); margin-bottom: 4px;">
            <span style="font-size: 0.9rem; margin-right: 6px;">${typeIcon}</span>
            ${event.title}
          </div>
          <div style="font-size: 0.8rem; color: var(--muted);">
            ${event.allDay ? '📅 Journée entière' : `🕐 ${event.time || '00:00'}`}
            ${event.date ? ` • ${event.date}` : ''}
          </div>
          ${event.description ? `<div style="font-size: 0.8rem; color: var(--text); margin-top: 6px; opacity: 0.8;">${event.description}</div>` : ''}
        `;

        eventEl.addEventListener('click', () => {
          // Edit event (optional - could open modal with event details)
          console.log('Edit event:', event);
        });

        eventsList.appendChild(eventEl);
      });

      section.appendChild(eventsList);
      eventsContainer.appendChild(section);
    });
  }

  // Setup toggle button for sidebar
  const listControlContainer = view.querySelector('#gcListContainer');
  if (toggleBtn && listControlContainer) {
    let isVisible = localStorage.getItem('ap_gc_left_panel') !== '0';
    
    const updateToggleState = () => {
      if (isVisible) {
        listControlContainer.style.display = 'block';
        toggleBtn.textContent = '▼';
      } else {
        listControlContainer.style.display = 'none';
        toggleBtn.textContent = '▶';
      }
    };
    
    updateToggleState();
    
    toggleBtn.addEventListener('click', () => {
      isVisible = !isVisible;
      localStorage.setItem('ap_gc_left_panel', isVisible ? '1' : '0');
      updateToggleState();
    });
  }
}

// Schedule notifications for event
function scheduleNotifications(event) {
  event.notifications.forEach(notif => {
    const eventDate = new Date(event.date + 'T' + event.time);
    let notifTime;

    if (notif.type === 'start') {
      notifTime = eventDate;
    } else if (notif.type === 'minutes') {
      notifTime = new Date(eventDate.getTime() - notif.value * 60000);
    } else {
      return;
    }

    const now = new Date();
    const delay = notifTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(() => {
        showNotification(event);
      }, delay);
      console.log(`⏰ Notification planifiée pour ${event.title} dans ${(delay / 1000 / 60).toFixed(1)} minutes`);
    }
  });
}

// Show notification
function showNotification(event) {
  // Browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`📆 ${event.title}`, {
      body: event.date + ' ' + event.time,
      icon: '📆',
    });
  }

  // In-app notification
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--accent2);
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  notif.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">📆 ${event.title}</div>
    <div style="font-size: 0.85rem; opacity: 0.9;">${event.date} ${event.time}</div>
  `;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 5000);
}

// Button handlers
// Migrate events/tasks without calendarId to default calendar
function migrateEventsToDefaultCalendar() {
  const events = loadEvents();
  let updated = false;
  
  events.forEach(event => {
    if (!event.calendarId || event.calendarId === '') {
      event.calendarId = 'default';
      updated = true;
    }
  });
  
  if (updated) {
    saveEvents(events);
    console.log('✅ Events migrated to default calendar');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  // Migrate events without calendar assignment
  migrateEventsToDefaultCalendar();

  const btnAddCalendar = document.getElementById('btnAddCalendar');
  if (btnAddCalendar) {
    btnAddCalendar.addEventListener('click', () => {
      const name = prompt('Nom du calendrier:');
      if (name) {
        const calendars = loadCalendars();
        const colors = ['#2d6bbf', '#d32f2f', '#f57c00', '#fbc02d', '#689f38'];
        calendars.push({
          id: 'cal_' + Date.now(),
          name: name,
          color: colors[Math.floor(Math.random() * colors.length)],
          visible: true,
        });
        saveCalendars(calendars);
        renderCalendarsView();
      }
    });
  }

  const btnAddEvent = document.getElementById('btnAddEventCalendar');
  if (btnAddEvent) {
    btnAddEvent.addEventListener('click', () => {
      showEventModal();
    });
  }


});
