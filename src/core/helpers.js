/**
 * Helper Utilities
 * Utility functions for date manipulation, formatting, and common operations
 */

import { DAYS_FULL, MONTHS_FR } from './constants.js';

// ────────────────────────────────────────────────────────────────────────────
// DATE KEY HELPERS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Create a date key in format YYYY-MM-DD
 * @param {number} y - Year
 * @param {number} m - Month (0-11)
 * @param {number} d - Day (1-31)
 * @returns {string} Date key
 */
export function dkey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * Parse day of week from date key
 * @param {string} dk - Date key (YYYY-MM-DD)
 * @returns {number} Day of week (0-6)
 */
export function dkDow(dk) {
  const [y, mo, d] = dk.split('-').map(Number);
  return new Date(y, mo - 1, d).getDay();
}

/**
 * Google Calendar date key
 * @param {Date} d - Date object
 * @returns {string} Date key
 */
export function gcDkey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ────────────────────────────────────────────────────────────────────────────
// DATE HELPERS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get days in month
 * @param {number} m - Month (0-11)
 * @param {number} year - Year
 * @returns {number} Number of days
 */
export function dim(m, year = new Date().getFullYear()) {
  return new Date(year, m + 1, 0).getDate();
}

/**
 * Check if date is today
 * @param {number} m - Month (0-11)
 * @param {number} d - Day (1-31)
 * @param {number} year - Year
 * @param {Date} today - Today's date reference
 * @returns {boolean}
 */
export function isToday(m, d, year, today = new Date()) {
  return today.getFullYear() === year &&
    today.getMonth() === m &&
    today.getDate() === d;
}

/**
 * Check if day of week is weekend
 * @param {number} dow - Day of week (0-6)
 * @returns {boolean}
 */
export function isWE(dow) {
  return dow === 0 || dow === 6;
}

/**
 * Get month offset (days to add to start)
 * @param {number} m - Month (0-11)
 * @param {number} ws - Week start (0=Sun, 1=Mon)
 * @param {number} year - Year
 * @returns {number} Offset
 */
export function monthOffset(m, ws = 0, year = new Date().getFullYear()) {
  const fd = new Date(year, m, 1).getDay();
  return ws === 0 ? fd : (fd === 0 ? 6 : fd - 1);
}

/**
 * Get ISO week number
 * @param {Date} d - Date
 * @returns {number} Week number
 */
export function getISOWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get week start date
 * @param {Date} date - Reference date
 * @param {number} ws - Week start (0=Sun, 1=Mon)
 * @returns {Date} Week start date
 */
export function getWeekStart(date, ws = 0) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = ws === 1 ? (day === 0 ? -6 : 1 - day) : -day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get week dates (7 days starting from week start)
 * @param {number} offset - Week offset (0=current, 1=next, -1=previous)
 * @param {number} ws - Week start (0=Sun, 1=Mon)
 * @returns {Date[]} Array of 7 dates
 */
export function getWeekDates(offset = 0, ws = 0) {
  const start = getWeekStart(new Date(), ws);
  start.setDate(start.getDate() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/**
 * Create week key from dates
 * @param {Date[]} dates - Array of dates
 * @returns {string} Week key
 */
export function weekKey(dates) {
  return `${dates[0].getFullYear()}-W${String(getISOWeek(dates[0])).padStart(2, '0')}`;
}

// ────────────────────────────────────────────────────────────────────────────
// STRING UTILITIES
// ────────────────────────────────────────────────────────────────────────────

/**
 * HTML escape string
 * @param {string} s - String to escape
 * @returns {string} Escaped string
 */
export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ────────────────────────────────────────────────────────────────────────────
// FORMATTING
// ────────────────────────────────────────────────────────────────────────────

/**
 * Format date as "D Mois" (e.g., "15 Mars")
 * @param {Date} d - Date to format
 * @returns {string} Formatted date
 */
export function formatDateShort(d) {
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

/**
 * Format date range as "15 Mars – 22 Mars 2024"
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string} Formatted date range
 */
export function formatDateRange(startDate, endDate) {
  const fmt = d => formatDateShort(d);
  return `${fmt(startDate)} – ${fmt(endDate)} ${endDate.getFullYear()}`;
}

/**
 * Check if two dates are the same day
 * @param {Date} d1 - First date
 * @param {Date} d2 - Second date
 * @returns {boolean}
 */
export function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

/**
 * Get days between two date keys
 * @param {string} fromDk - Start date key
 * @param {string} toDk - End date key
 * @returns {number} Number of days
 */
export function daysBetween(fromDk, toDk) {
  const [fy, fm, fd] = fromDk.split('-').map(Number);
  const [ty, tm, td] = toDk.split('-').map(Number);
  const from = new Date(fy, fm - 1, fd);
  const to = new Date(ty, tm - 1, td);
  const diff = to - from;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// ────────────────────────────────────────────────────────────────────────────
// TYPE CHECKING
// ────────────────────────────────────────────────────────────────────────────

/**
 * Check if value is weekend
 * @param {number} dow - Day of week
 * @returns {boolean}
 */
export function isWeekend(dow) {
  return isWE(dow);
}

/**
 * Check if date is in the past
 * @param {string} dateKey - Date key (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isPast(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if date is in the future
 * @param {string} dateKey - Date key (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isFuture(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}
