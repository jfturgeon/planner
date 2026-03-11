/**
 * Persistence Layer
 * localStorage wrapper for saving and loading application data
 */

import { STORAGE_KEYS, DEFAULTS } from './constants.js';

// ────────────────────────────────────────────────────────────────────────────
// MAIN DATA PERSISTENCE
// ────────────────────────────────────────────────────────────────────────────

/**
 * Load main planner data from localStorage
 * @returns {Object} Planner data object
 */
export function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DATA) || '{}');
  } catch (e) {
    console.error('Error loading data:', e);
    return {};
  }
}

/**
 * Save main planner data to localStorage
 * @param {Object} data - Data to save
 */
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// YEAR & SETTINGS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get current year setting
 * @returns {number} Year
 */
export function getYear() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.YEAR) || DEFAULTS.YEAR);
}

/**
 * Set current year
 * @param {number} year - Year to set
 */
export function setYear(year) {
  localStorage.setItem(STORAGE_KEYS.YEAR, String(year));
}

/**
 * Get week start setting (0=Sunday, 1=Monday)
 * @returns {number} Week start
 */
export function getWeekStart() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.WEEK_START) || DEFAULTS.WEEK_START);
}

/**
 * Set week start setting
 * @param {number} ws - Week start (0 or 1)
 */
export function setWeekStart(ws) {
  localStorage.setItem(STORAGE_KEYS.WEEK_START, String(ws));
}

// ────────────────────────────────────────────────────────────────────────────
// WEEKLY DATA
// ────────────────────────────────────────────────────────────────────────────

/**
 * Load weekly data for a specific week
 * @param {string} weekKey - Week key (format: YYYY-WXX)
 * @returns {Object|null} Weekly data or null
 */
export function loadWeekly(weekKey) {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WEEKLY(weekKey)) || 'null');
  } catch (e) {
    console.error('Error loading weekly data:', e);
    return null;
  }
}

/**
 * Save weekly data for a specific week
 * @param {string} weekKey - Week key (format: YYYY-WXX)
 * @param {Object} data - Weekly data to save
 */
export function saveWeekly(weekKey, data) {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY(weekKey), JSON.stringify(data));
  } catch (e) {
    console.error('Error saving weekly data:', e);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// HABITS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Load global habits
 * @returns {Array} Habits array
 */
export function loadHabits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
  } catch (e) {
    console.error('Error loading habits:', e);
    return [];
  }
}

/**
 * Save global habits
 * @param {Array} habits - Habits array to save
 */
export function saveHabits(habits) {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits:', e);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// CALENDARS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Load calendars
 * @returns {Array} Calendars array
 */
export function loadCalendars() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CALENDARS) || '[]');
  } catch (e) {
    console.error('Error loading calendars:', e);
    return [];
  }
}

/**
 * Save calendars
 * @param {Array} calendars - Calendars array
 */
export function saveCalendars(calendars) {
  try {
    localStorage.setItem(STORAGE_KEYS.CALENDARS, JSON.stringify(calendars));
  } catch (e) {
    console.error('Error saving calendars:', e);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// EVENTS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Load events
 * @returns {Array} Events array
 */
export function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
  } catch (e) {
    console.error('Error loading events:', e);
    return [];
  }
}

/**
 * Save events
 * @param {Array} events - Events array
 */
export function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving events:', e);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// TRACKER
// ────────────────────────────────────────────────────────────────────────────

/**
 * Load watched episodes data
 * @returns {Object} Watched episodes object
 */
export function loadTrackerWatched() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRACKER_WATCHED) || '{}');
  } catch (e) {
    console.error('Error loading tracker watched:', e);
    return {};
  }
}

/**
 * Save watched episodes data
 * @param {Object} watched - Watched data
 */
export function saveTrackerWatched(watched) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRACKER_WATCHED, JSON.stringify(watched));
  } catch (e) {
    console.error('Error saving tracker watched:', e);
  }
}

/**
 * Load episode schedule
 * @returns {Object} Schedule object
 */
export function loadTrackerSchedule() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRACKER_SCHED) || '{}');
  } catch (e) {
    console.error('Error loading tracker schedule:', e);
    return {};
  }
}

/**
 * Save episode schedule
 * @param {Object} schedule - Schedule data
 */
export function saveTrackerSchedule(schedule) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRACKER_SCHED, JSON.stringify(schedule));
  } catch (e) {
    console.error('Error saving tracker schedule:', e);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// KANBAN
// ────────────────────────────────────────────────────────────────────────────

/**
 * Load kanban statuses
 * @returns {Array} Statuses array
 */
export function loadKanbanStatuses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.KANBAN_STATUSES) || '[]');
  } catch (e) {
    console.error('Error loading kanban statuses:', e);
    return [];
  }
}

/**
 * Save kanban statuses
 * @param {Array} statuses - Statuses array
 */
export function saveKanbanStatuses(statuses) {
  try {
    localStorage.setItem(STORAGE_KEYS.KANBAN_STATUSES, JSON.stringify(statuses));
  } catch (e) {
    console.error('Error saving kanban statuses:', e);
  }
}

/**
 * Load kanban cards
 * @returns {Array} Cards array
 */
export function loadKanbanCards() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.KANBAN_CARDS) || '[]');
  } catch (e) {
    console.error('Error loading kanban cards:', e);
    return [];
  }
}

/**
 * Save kanban cards
 * @param {Array} cards - Cards array
 */
export function saveKanbanCards(cards) {
  try {
    localStorage.setItem(STORAGE_KEYS.KANBAN_CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error('Error saving kanban cards:', e);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// VIEWS & UI STATE
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get left panel visibility state
 * @returns {boolean}
 */
export function isLeftPanelVisible() {
  return localStorage.getItem(STORAGE_KEYS.LEFT_PANEL) !== '0';
}

/**
 * Set left panel visibility
 * @param {boolean} visible
 */
export function setLeftPanelVisible(visible) {
  localStorage.setItem(STORAGE_KEYS.LEFT_PANEL, visible ? '1' : '0');
}

/**
 * Get filter state for item type
 * @param {string} filterName - Filter name (tasks, events, birthdays, episodes)
 * @returns {boolean}
 */
export function getFilter(filterName) {
  return localStorage.getItem(STORAGE_KEYS.FILTER(filterName)) !== '0';
}

/**
 * Set filter state
 * @param {string} filterName - Filter name
 * @param {boolean} enabled
 */
export function setFilter(filterName, enabled) {
  localStorage.setItem(STORAGE_KEYS.FILTER(filterName), enabled ? '1' : '0');
}

// ────────────────────────────────────────────────────────────────────────────
// UTILITY
// ────────────────────────────────────────────────────────────────────────────

/**
 * Clear all application data
 * @warning This will delete all user data!
 */
export function clearAll() {
  Object.values(STORAGE_KEYS).forEach(key => {
    if (typeof key === 'string') {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Export all data for backup
 * @returns {Object} Complete data export
 */
export function exportData() {
  return {
    data: loadData(),
    year: getYear(),
    weekStart: getWeekStart(),
    habits: loadHabits(),
    calendars: loadCalendars(),
    events: loadEvents(),
    trackerWatched: loadTrackerWatched(),
    trackerSchedule: loadTrackerSchedule(),
    kanbanStatuses: loadKanbanStatuses(),
    kanbanCards: loadKanbanCards(),
  };
}

/**
 * Import data from backup
 * @param {Object} backup - Data backup object
 */
export function importData(backup) {
  if (backup.data) saveData(backup.data);
  if (backup.year) setYear(backup.year);
  if (backup.weekStart !== undefined) setWeekStart(backup.weekStart);
  if (backup.habits) saveHabits(backup.habits);
  if (backup.calendars) saveCalendars(backup.calendars);
  if (backup.events) saveEvents(backup.events);
  if (backup.trackerWatched) saveTrackerWatched(backup.trackerWatched);
  if (backup.trackerSchedule) saveTrackerSchedule(backup.trackerSchedule);
  if (backup.kanbanStatuses) saveKanbanStatuses(backup.kanbanStatuses);
  if (backup.kanbanCards) saveKanbanCards(backup.kanbanCards);
}
