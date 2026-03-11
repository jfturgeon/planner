/**
 * PLANNER - MAIN APPLICATION BOOTSTRAPPER
 * Imports and initializes all modules, manages view switching,
 * and coordinates event communication between components
 */

// ── IMPORTS ──────────────────────────────────────────────────────────────
// Core modules
import { MONTHS_FR, MONTHS_SH, DAYS_FULL, DAYS_SUN, DAY_COLORS, STORAGE_KEYS, DEFAULTS } from './core/constants.js';
import {
  dkey, dkDow, dim, isToday, formatDateShort, formatDateRange,
  getWeekStart, getWeekDates, weekKey, monthOffset, isSameDay
} from './core/helpers.js';
import { loadData, saveData, getYear, setYear } from './core/persistence.js';
import { showSuccess, showError, showInfo } from './core/notifications.js';

// View modules
import { renderAnnualView } from './views/annual/view.js';
import { renderMonthView } from './views/month/view.js';
import { renderHabitsTracker } from './views/habits/view.js';
import { renderTracker } from './views/tracker/view.js';
import { renderKanban } from './views/kanban/view.js';
import { ctInitView, ctBuildBirthdayLabel, ctGetBirthdaysForDay } from './views/contacts/view.js';

// ── APPLICATION STATE ──────────────────────────────────────────────────────
const appState = {
  currentView: 'month',
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  appData: {}, // Loaded from localStorage
  shows: [], // Loaded from shows.json
  contacts: [], // Loaded from localStorage
  habits: [], // Loaded from localStorage
  trackerData: {}, // Loaded from localStorage
  kanbanData: { statuses: [], cards: [] }, // Loaded from localStorage
};

// ── INITIALIZATION ──────────────────────────────────────────────────────────
/**
 * Initialize application on DOM ready
 */
export async function initApp() {
  try {
    // Load data from storage and external sources
    await loadApplicationData();

    // Set up event listeners
    setupViewSwitching();
    setupNavigationControls();
    setupViewCallbacks();

    // Initialize view visibility and render initial view
    updateViewVisibility();
    renderCurrentView();

    showSuccess('Application démarrée');
  } catch (error) {
    console.error('App initialization failed:', error);
    showError('Erreur au démarrage de l\'application');
  }
}

/**
 * Load all application data
 */
async function loadApplicationData() {
  // Load from localStorage
  appState.appData = loadData() || {};
  appState.year = getYear();
  appState.currentMonth = new Date().getMonth();

  // Load shows data
  try {
    const response = await fetch('./src/data/shows.json');
    appState.shows = await response.json();
  } catch (error) {
    console.error('Failed to load shows:', error);
    appState.shows = [];
  }

  // Load contacts from localStorage
  appState.contacts = appState.appData.contacts || [];

  // Load habits
  appState.habits = appState.appData.habits || [];

  // Load tracker data
  appState.trackerData = {
    watched: appState.appData.trackerWatched || {}
  };

  // Load kanban data
  appState.kanbanData = {
    statuses: appState.appData.kanbanStatuses || [
      { id: 'todo', label: 'À faire', color: '#3498db' },
      { id: 'inprogress', label: 'En cours', color: '#f39c12' },
      { id: 'review', label: 'Révision', color: '#9b59b6' },
      { id: 'done', label: 'Complété', color: '#2ecc71' }
    ],
    cards: appState.appData.kanbanCards || []
  };
}

/**
 * Set up view switching buttons
 */
function setupViewSwitching() {
  const viewButtons = document.querySelectorAll('[data-view]');

  viewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const viewName = btn.dataset.view;
      switchToView(viewName);
    });
  });

  // Mark initial view as active
  updateActiveViewButton();
}

/**
 * Set up navigation controls (date navigation)
 */
function setupNavigationControls() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const todayBtn = document.getElementById('todayBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      navigatePrevious();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      navigateNext();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      navigateToToday();
    });
  }
}

/**
 * Set up view-specific event callbacks
 */
function setupViewCallbacks() {
  // These will be registered when each view is rendered
  // See renderCurrentView() and individual view rendering functions
}

/**
 * Switch to a different view
 */
function switchToView(viewName) {
  appState.currentView = viewName;
  updateViewVisibility();
  renderCurrentView();
  updateActiveViewButton();
  updateNavigationLabel();
}

/**
 * Navigate to previous period
 */
function navigatePrevious() {
  switch (appState.currentView) {
    case 'annual':
      appState.currentYear--;
      break;
    case 'month':
    case 'month-list':
      appState.currentMonth--;
      if (appState.currentMonth < 0) {
        appState.currentMonth = 11;
        appState.currentYear--;
      }
      break;
    case 'week':
      // Navigate to previous week
      break;
    case 'day':
      // Navigate to previous day
      break;
  }
  renderCurrentView();
  updateNavigationLabel();
}

/**
 * Navigate to next period
 */
function navigateNext() {
  switch (appState.currentView) {
    case 'annual':
      appState.currentYear++;
      break;
    case 'month':
    case 'month-list':
      appState.currentMonth++;
      if (appState.currentMonth > 11) {
        appState.currentMonth = 0;
        appState.currentYear++;
      }
      break;
    case 'week':
      // Navigate to next week
      break;
    case 'day':
      // Navigate to next day
      break;
  }
  renderCurrentView();
  updateNavigationLabel();
}

/**
 * Navigate to today
 */
function navigateToToday() {
  const now = new Date();
  appState.currentYear = now.getFullYear();
  appState.currentMonth = now.getMonth();
  renderCurrentView();
  updateNavigationLabel();
}

/**
 * Update navigation label based on current view
 */
function updateNavigationLabel() {
  const labelEl = document.getElementById('navLabel');
  if (!labelEl) return;

  switch (appState.currentView) {
    case 'annual':
      labelEl.textContent = appState.currentYear.toString();
      break;
    case 'month':
    case 'month-list':
      labelEl.textContent = `${MONTHS_FR[appState.currentMonth]} ${appState.currentYear}`;
      break;
    case 'week':
      labelEl.textContent = `Semaine ${Math.ceil((new Date(appState.currentYear, appState.currentMonth, 1).getDate() + new Date(appState.currentYear, appState.currentMonth, 1).getDay()) / 7)}`;
      break;
    default:
      labelEl.textContent = new Date().getFullYear().toString();
  }
}

/**
 * Update active button styling
 */
function updateActiveViewButton() {
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === appState.currentView) {
      btn.classList.add('active');
    }
  });
}

/**
 * Update view container visibility
 */
function updateViewVisibility() {
  const viewMap = {
    'month': 'monthView',
    'annual': 'annualView',
    'week': 'weeklyView',
    'habits': 'habitsView',
    'tracker': 'trackerView',
    'kanban': 'kanbanView',
    'contacts': 'contactsView'
  };

  // Hide all views
  Object.values(viewMap).forEach(viewId => {
    const el = document.getElementById(viewId);
    if (el) el.style.display = 'none';
  });

  // Show current view
  const currentViewId = viewMap[appState.currentView];
  if (currentViewId) {
    const el = document.getElementById(currentViewId);
    if (el) el.style.display = '';
  }
}

/**
 * Render current view based on appState
 */
function renderCurrentView() {
  switch (appState.currentView) {
    case 'annual':
      renderAnnualView({
        year: appState.currentYear,
        weekStart: 1,
        onDayClick: handleDayClick
      });
      break;

    case 'month':
      renderMonthView({
        month: appState.currentMonth,
        year: appState.currentYear,
        weekStart: 1,
        appData: appState.appData,
        onDayClick: handleDayClick
      });
      break;

    case 'week':
      // renderWeeklyView({...}) - Phase 2B (not included - 2000+ lines)
      break;

    case 'habits':
      renderHabitsTracker({
        habits: appState.habits,
        weekly: appState.appData.weekly || {},
        appData: appState.appData,
        selectedDate: new Date(appState.currentYear, appState.currentMonth, 1),
        onHabitToggle: handleHabitToggle
      });
      break;

    case 'tracker':
      renderTracker({
        shows: appState.shows,
        watched: appState.trackerData.watched,
        activeShow: appState.shows[0]?.id,
        onEpisodeToggle: handleEpisodeToggle,
        onShowChange: handleShowChange
      });
      break;

    case 'kanban':
      renderKanban({
        statuses: appState.kanbanData.statuses,
        cards: appState.kanbanData.cards,
        activeYear: appState.currentYear,
        compactView: false,
        onCardClick: handleKanbanCardClick,
        onCardDrop: handleKanbanCardDrop,
        onStatusAdd: handleKanbanStatusAdd
      });
      break;

    case 'contacts':
      ctInitView({
        contacts: appState.contacts,
        selectedGroup: 'all',
        onContactSelect: handleContactSelect,
        onContactAdd: handleContactAdd,
        onGroupFilter: handleGroupFilter
      });
      break;

    default:
      renderMonthView({
        month: appState.currentMonth,
        year: appState.currentYear,
        weekStart: 1,
        appData: appState.appData,
        onDayClick: handleDayClick
      });
  }

  // Ensure correct view visibility
  updateViewVisibility();
}

// ── EVENT HANDLERS ───────────────────────────────────────────────────────
/**
 * Handle day click in calendar views
 */
function handleDayClick(day) {
  console.log('Day clicked:', day);
  // Open day modal to add/edit tasks/notes
}

/**
 * Handle habit checkbox toggle
 */
function handleHabitToggle(data) {
  const { habitIndex, key, checked } = data;
  if (!appState.appData.weekly) appState.appData.weekly = {};
  if (!appState.appData.weekly[key]) appState.appData.weekly[key] = [];

  appState.appData.weekly[key][habitIndex] = checked ? 1 : 0;
  saveData(appState.appData);
  showSuccess(`Habitude ${checked ? 'marquée' : 'non marquée'}`);
}

/**
 * Handle episode checkbox toggle
 */
function handleEpisodeToggle(episodeKey, isWatched) {
  appState.trackerData.watched[episodeKey] = isWatched;
  appState.appData.trackerWatched = appState.trackerData.watched;
  saveData(appState.appData);
  showSuccess(`Épisode ${isWatched ? 'regardé' : 'non marqué'}`);
}

/**
 * Handle show tab switch in tracker
 */
function handleShowChange(showId) {
  renderTracker({
    shows: appState.shows,
    watched: appState.trackerData.watched,
    activeShow: showId,
    onEpisodeToggle: handleEpisodeToggle,
    onShowChange: handleShowChange
  });
}

/**
 * Handle kanban card interactions
 */
function handleKanbanCardClick(action) {
  console.log('Kanban action:', action);
  // Handle card editing, status menu, etc.
}

/**
 * Handle kanban card drop
 */
function handleKanbanCardDrop(data) {
  const { toStatusId, afterCardId } = data;
  // Reorder card in new status
  appState.appData.kanbanCards = appState.kanbanData.cards;
  saveData(appState.appData);
}

/**
 * Handle kanban status addition
 */
function handleKanbanStatusAdd() {
  const newStatus = {
    id: '_' + Math.random().toString(36).substr(2, 9),
    label: 'Nouveau',
    color: '#888888'
  };
  appState.kanbanData.statuses.push(newStatus);
  appState.appData.kanbanStatuses = appState.kanbanData.statuses;
  saveData(appState.appData);
  renderCurrentView();
}

/**
 * Handle contact selection
 */
function handleContactSelect(contact) {
  console.log('Contact selected:', contact);
  // Open contact detail view
}

/**
 * Handle contact addition
 */
function handleContactAdd() {
  // Open contact creation modal
  console.log('Add new contact');
}

/**
 * Handle contact group filter
 */
function handleGroupFilter(group) {
  ctInitView({
    contacts: appState.contacts,
    selectedGroup: group,
    onContactSelect: handleContactSelect,
    onContactAdd: handleContactAdd,
    onGroupFilter: handleGroupFilter
  });
}

// ── DOM READY INITIALIZATION ──────────────────────────────────────────────
// ── INITIALIZATION ON APP START ──────────────────────────────────────────
// Wait for fragments to be loaded before initializing the app
document.addEventListener('fragmentsLoaded', () => {
  initApp();
});

// Fallback: Also initialize on DOMContentLoaded in case fragments are already loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only init if not already initialized (check if appView is present)
  if (document.getElementById('appView') && appState.currentView === 'month') {
    initApp();
  }
});

// Export for testing and external access
export {
  appState,
  switchToView,
  renderCurrentView,
  navigatePrevious,
  navigateNext,
  navigateToToday
};
