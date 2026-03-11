/**
 * Constants & Configuration
 * Global constants used throughout the planner application
 */

// ────────────────────────────────────────────────────────────────────────────
// MONTHS & DAYS
// ────────────────────────────────────────────────────────────────────────────
export const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const MONTHS_SH = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
];

export const DAYS_FULL = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi',
  'Jeudi', 'Vendredi', 'Samedi'
];

export const DAYS_SUN = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// Google Calendar specific
export const GC_DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
export const GC_DAYS_LONG = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi',
  'Jeudi', 'Vendredi', 'Samedi'
];

export const GC_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const GC_MONTHS_SH = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
];

// ────────────────────────────────────────────────────────────────────────────
// COLORS & STYLING
// ────────────────────────────────────────────────────────────────────────────

// Day colors for weekly view
export const DAY_COLORS = [
  '#e8a87c', // Sun - orange
  '#7cb9e8', // Mon - blue
  '#8dd4a0', // Tue - green
  '#c4a8e8', // Wed - purple
  '#e8d47c', // Thu - yellow
  '#e889b8', // Fri - pink
  '#7ce8d4'  // Sat - teal
];

// Column width for annual view
export const COL_W = 220;

// Month color palettes (softer):
// [rowBg, rowText, rowWeBg, rowWeText, calBg, calText, calWeBg, calWeText, calDataBg, calWeDataBg]
export const MONTH_PALETTE = [
  ['#edf4fe', '#3b62a8', '#dce8fc', '#2952a3', '#edf4fe', '#3b62a8', '#dce8fc', '#2952a3', '#c8d9f5', '#b8c9e8'], // Jan — blue
  ['#fdf0f8', '#a0306a', '#fbe2f2', '#8f2060', '#fdf0f8', '#a0306a', '#fbe2f2', '#8f2060', '#f5c8e4', '#edbadc'], // Feb — pink
  ['#edf8f2', '#2e7a54', '#d8f2e4', '#246843', '#edf8f2', '#2e7a54', '#d8f2e4', '#246843', '#b8e8cc', '#a8d8bc'], // Mar — green
  ['#fefdf0', '#7a5c14', '#fdf8d0', '#6a4c0a', '#fefdf0', '#7a5c14', '#fdf8d0', '#6a4c0a', '#f4e898', '#ead888'], // Apr — yellow
  ['#fef5ec', '#8c4018', '#feecd8', '#7a3010', '#fef5ec', '#8c4018', '#feecd8', '#7a3010', '#f8d4b0', '#f0c4a0'], // May — orange
  ['#ecf7fe', '#1a5c84', '#d4eefb', '#144c74', '#ecf7fe', '#1a5c84', '#d4eefb', '#144c74', '#b0dcf4', '#9cccec'], // Jun — sky
  ['#f4f0fe', '#5024a0', '#e8e0fc', '#401890', '#f4f0fe', '#5024a0', '#e8e0fc', '#401890', '#d0c0f4', '#c0b0e8'], // Jul — purple
  ['#fef0f0', '#8c2020', '#fde0e0', '#7c1818', '#fef0f0', '#8c2020', '#fde0e0', '#7c1818', '#f8c0c0', '#f0b0b0'], // Aug — red
  ['#ecfcf8', '#186854', '#d4f8f0', '#106048', '#ecfcf8', '#186854', '#d4f8f0', '#106048', '#a8ecd8', '#98dcc8'], // Sep — teal
  ['#fefdf0', '#6c4010', '#fdf8d0', '#5c3008', '#fefdf0', '#6c4010', '#fdf8d0', '#5c3008', '#f4dc90', '#e8cc80'], // Oct — amber
  ['#fdf0f5', '#8c2050', '#fbe0ec', '#7c1840', '#fdf0f5', '#8c2050', '#fbe0ec', '#7c1840', '#f4c0d8', '#e8b0c8'], // Nov — rose
  ['#edf2fe', '#263c88', '#dce8fc', '#1c2c78', '#edf2fe', '#263c88', '#dce8fc', '#1c2c78', '#c4d0f4', '#b4c0e8'], // Dec — indigo
];

// ────────────────────────────────────────────────────────────────────────────
// STORAGE KEYS
// ────────────────────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  // Main data
  DATA: 'ap_data',
  YEAR: 'ap_year',
  WEEK_START: 'ap_ws',
  
  // Weekly data
  WEEKLY: (key) => `ap_w_${key}`,
  
  // Global habits
  HABITS: 'ap_global_habits',
  
  // Calendars
  CALENDARS: 'ap_calendars',
  EVENTS: 'ap_events',
  
  // Views
  LEFT_PANEL: 'ap_left_panel',
  CALENDARS_VISIBLE: 'ap_wv_calendars_visible',
  FILTERS_VISIBLE: 'ap_wv_filters_visible',
  FILTER: (name) => `ap_wv_filter_${name}`,
  
  // Tracker
  TRACKER_WATCHED: 'ap_tracker_watched',
  TRACKER_SCHED: 'ap_tracker_sched',
  
  // Kanban
  KANBAN_STATUSES: 'kb_statuses',
  KANBAN_CARDS: 'kb_cards',
  
  // Oscars
  OSCARS_WATCHED: 'ap_oscars_watched',
};

// ────────────────────────────────────────────────────────────────────────────
// API & EXTERNAL
// ────────────────────────────────────────────────────────────────────────────
export const API_CONFIG = {
  SUPABASE_URL: 'https://mjkwzbvqpfmjqjqdlkix.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qa3d6YnZxcGZtanFqcWRsa2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2NzM1NzcsImV4cCI6MTcyNzI0Nzk3N30.CxHNJaNjYP6YXRjfkrn-Eo8K3Bs_M7C8yNLEV_zfLwc',
};

// ────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ────────────────────────────────────────────────────────────────────────────
export const DEFAULTS = {
  WEEK_START: 0, // 0 = Sunday, 1 = Monday
  TOAST_DURATION: 1800, // ms
  YEAR: new Date().getFullYear(),
};
