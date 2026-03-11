/**
 * MONTH VIEW - Day calendar grid + day list panel
 * Displays calendar grid and clickable day row list for a single month
 */

/**
 * Render single month view with calendar and day list
 * @param {Object} opts - Configuration options
 * @param {number} opts.month - Month index (0-11)
 * @param {number} opts.year - Year number
 * @param {number} opts.weekStart - Week start day (0=Sunday, 1=Monday)
 * @param {Object} opts.appData - Application data object with day entries
 * @param {Function} opts.onDayClick - Callback when day is clicked
 */
export function renderMonthView(opts = {}) {
  const {
    month = new Date().getMonth(),
    year = new Date().getFullYear(),
    weekStart = 0,
    appData = {},
    onDayClick = null
  } = opts;

  const mv = document.getElementById('monthView');
  if (!mv) return;

  const ws = weekStart;
  const m = month;
  const y = year;
  const days = new Date(y, m + 1, 0).getDate();
  const fd = new Date(y, m, 1).getDay();
  const off = ws === 0 ? fd : (fd === 0 ? 6 : fd - 1);
  const DAYS_SUN = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  mv.innerHTML = `
    <div class="mv-body">
      <div class="mv-cal-wrap" id="mvCal"></div>
      <div class="mv-list-wrap" id="mvList">
        <div class="mv-list-hd">Journées de ${MONTHS_FR[m]}</div>
      </div>
    </div>`;

  // Big calendar
  const cal = document.getElementById('mvCal');

  // DOW header
  const dhr = document.createElement('div');
  dhr.className = 'mv-dow-row';
  for (let i = 0; i < 7; i++) {
    const dow = ws === 0 ? i : (i + 1) % 7;
    const lbl = document.createElement('div');
    lbl.className = 'mv-dow-lbl' + (dow === 0 || dow === 6 ? ' we' : '');
    lbl.textContent = DAYS_SUN[dow];
    dhr.appendChild(lbl);
  }
  cal.appendChild(dhr);

  // Calendar grid
  const grid = document.createElement('div');
  grid.className = 'mv-cal-grid';

  for (let i = 0; i < off; i++) {
    const e = document.createElement('div');
    e.className = 'mv-dc mv-empty';
    grid.appendChild(e);
  }

  for (let d = 1; d <= days; d++) {
    const dow = new Date(y, m, d).getDay();
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const entry = appData[key];
    const hasData = !!(entry && ((entry.notes && entry.notes.trim()) || (entry.tasks && entry.tasks.length)));
    const isTod = new Date().getFullYear() === y && new Date().getMonth() === m && new Date().getDate() === d;

    const dc = document.createElement('div');
    dc.className = 'mv-dc' + (dow === 0 || dow === 6 ? ' mv-we' : '') + (isTod ? ' mv-today' : '') + (hasData ? ' mv-has-data' : '');

    const num = document.createElement('div');
    num.className = 'mv-dc-num';
    num.textContent = d;
    dc.appendChild(num);

    if (hasData) {
      const taskBox = document.createElement('div');
      taskBox.className = 'mv-dc-tasks';

      if (entry.notes && entry.notes.trim()) {
        const n = document.createElement('div');
        n.className = 'mv-dc-note';
        n.textContent = '📝 ' + entry.notes.trim().substring(0, 30);
        taskBox.appendChild(n);
      }

      const tasks = entry.tasks || [];
      tasks.slice(0, 3).forEach(t => {
        const tEl = document.createElement('div');
        tEl.className = 'mv-dc-task' + (t.done ? ' done' : '') + (t.priority === 'urgent' ? ' urgent' : '');
        tEl.textContent = t.text;
        taskBox.appendChild(tEl);
      });

      if (tasks.length > 3) {
        const more = document.createElement('div');
        more.className = 'mv-dc-more';
        more.textContent = `+${tasks.length - 3} autre${tasks.length - 3 > 1 ? 's' : ''}`;
        taskBox.appendChild(more);
      }

      dc.appendChild(taskBox);
    }

    dc.addEventListener('click', () => {
      if (onDayClick) onDayClick(m, d, y);
    });

    grid.appendChild(dc);
  }

  // Pad to 42 cells
  const rem = 42 - (off + days);
  for (let i = 0; i < rem; i++) {
    const e = document.createElement('div');
    e.className = 'mv-dc mv-empty';
    grid.appendChild(e);
  }

  cal.appendChild(grid);

  // Day list panel
  const list = document.getElementById('mvList');
  for (let d = 1; d <= days; d++) {
    const dow = new Date(y, m, d).getDay();
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const entry = appData[key];
    const hasData = !!(entry && ((entry.notes && entry.notes.trim()) || (entry.tasks && entry.tasks.length)));
    const isTod = new Date().getFullYear() === y && new Date().getMonth() === m && new Date().getDate() === d;

    const row = document.createElement('div');
    row.className = 'mv-list-row' + (dow === 0 || dow === 6 ? ' mv-lr-we' : '') + (isTod ? ' mv-lr-today' : '') + (hasData ? ' mv-lr-data' : '');

    let cont = '';
    if (entry && entry.notes && entry.notes.trim())
      cont += `<div class="mv-lr-note">📝 ${escapeHtml(entry.notes.trim().substring(0, 45))}${entry.notes.trim().length > 45 ? '…' : ''}</div>`;
    if (entry && entry.tasks && entry.tasks.length)
      entry.tasks.forEach(t => {
        cont += `<div class="mv-lr-task ${t.done ? 'done' : ''} ${t.priority === 'urgent' ? 'urgent' : ''}">${escapeHtml(t.text)}</div>`;
      });
    else if (!hasData)
      cont = `<div class="mv-lr-empty">Cliquer pour ajouter…</div>`;

    row.innerHTML = `<div class="mv-lr-left"><span class="mv-lr-dname">${DAYS_SUN[dow]}</span><span class="mv-lr-dnum">${d}</span></div><div class="mv-lr-content">${cont}</div>`;

    row.addEventListener('click', () => {
      if (onDayClick) onDayClick(m, d, y);
    });

    list.appendChild(row);
  }
}

/**
 * Helper: escape HTML special characters
 */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
