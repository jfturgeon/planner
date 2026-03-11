/**
 * Notifications System
 * Toast notifications for user feedback
 */

import { DEFAULTS } from './constants.js';

let _toastTimer = null;

/**
 * Show a toast notification
 * @param {string} msg - Message to display
 * @param {string} icon - Icon emoji or symbol
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(msg, icon = '✓', duration = DEFAULTS.TOAST_DURATION) {
  let el = document.getElementById('appToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'appToast';
    document.body.appendChild(el);
  }

  // Compact mode for simple icons (msg IS the icon, no label text)
  const isCompact = (msg === '✓' || msg === '○');
  if (isCompact) {
    el.classList.add('toast-compact');
    el.innerHTML = `<span class="toast-icon">${msg}</span>`;
  } else {
    el.classList.remove('toast-compact');
    el.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  }

  el.classList.remove('toast-hide');
  el.classList.add('toast-show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.classList.remove('toast-show');
    el.classList.add('toast-hide');
  }, duration);
}

/**
 * Show success toast
 * @param {string} msg - Message
 * @param {number} duration - Duration
 */
export function showSuccess(msg, duration = DEFAULTS.TOAST_DURATION) {
  showToast(msg, '✓', duration);
}

/**
 * Show error toast
 * @param {string} msg - Message
 * @param {number} duration - Duration
 */
export function showError(msg, duration = DEFAULTS.TOAST_DURATION) {
  showToast(msg, '✕', duration);
}

/**
 * Show info toast
 * @param {string} msg - Message
 * @param {number} duration - Duration
 */
export function showInfo(msg, duration = DEFAULTS.TOAST_DURATION) {
  showToast(msg, 'ℹ', duration);
}

/**
 * Show warning toast
 * @param {string} msg - Message
 * @param {number} duration - Duration
 */
export function showWarning(msg, duration = DEFAULTS.TOAST_DURATION) {
  showToast(msg, '⚠', duration);
}
