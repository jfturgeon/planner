/**
 * ANNUAL VIEW - Render all 12 months in columns
 * Displays month strip tabs, calendar grid, and day list panels
 */

/* Helper - get number of days in month */
function dim(m) { return new Date(new Date().getFullYear(), m+1, 0).getDate(); }

/* Helper - get month offset (first day of month relative to week start) */
function monthOffset(m, ws, year) {
  const fd = new Date(year, m, 1).getDay();
  return ws === 0 ? fd : (fd === 0 ? 6 : fd - 1);
}

/**
 * Render annual view - all 12 months with strip and columns
 * @param {Object} opts - Configuration options
 * @param {number} opts.year - Current year being displayed
 * @param {number} opts.weekStart - Week start day (0=Sunday, 1=Monday)
 * @param {Function} opts.onDayClick - Callback function when day is clicked
 */
export function renderAnnualView(opts = {}) {
  const {
    year = new Date().getFullYear(),
    weekStart = 0,
    onDayClick = null
  } = opts;

  const annualView = document.getElementById('annualView');
  if (!annualView) return;

  // Set year display
  const ydEl = document.getElementById('yearDisp');
  if (ydEl) ydEl.textContent = year;

  const wsEl = document.getElementById('weekStart');
  if (wsEl) wsEl.value = weekStart;

  // Render header bar and month strip
  renderStrip(year);
  renderColumns(year, weekStart, onDayClick);
  bindScrollSync();
}

/**
 * Render month navigation strip with task badges
 */
function renderStrip(year) {
  const strip = document.getElementById('strip');
  if (!strip) return;

  strip.innerHTML = '';
  strip.style.width = `calc(${220 * 12}px + ${13} * calc(var(--col-w) / 7))`;
  const GAP = 220 / 7;

  const MONTHS_SH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let m = 0; m < 12; m++) {
    const tab = document.createElement('div');
    tab.className = `m-tab m-${m}`;
    tab.dataset.m = m;

    // Count pending tasks for this month
    let pending = 0;
    const days = dim(m);
    for (let d = 1; d <= days; d++) {
      const key = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      // Would need access to appData from parent scope
      // For now, simplified version
    }

    tab.innerHTML = `<span>${MONTHS_SH[m]}</span>${pending > 0 ? `<span class="task-badge">${pending}</span>` : ''}`;
    tab.addEventListener('click', () => {
      // Scroll to column
      const scrollX = GAP + m * (220 + GAP);
      const scrollArea = document.getElementById('scrollArea');
      if (scrollArea) scrollArea.scrollTo({ left: scrollX, behavior: 'smooth' });
    });
    strip.appendChild(tab);
  }
}

/**
 * Render 12-month column grid with mini calendars and day lists
 */
function renderColumns(year, weekStart, onDayClick) {
  const wrap = document.getElementById('colWrap');
  if (!wrap) return;

  wrap.innerHTML = '';
  wrap.style.width = `calc(${220 * 12}px + ${13} * calc(var(--col-w) / 7))`;

  const DAYS_SUN = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const dowLabels = weekStart === 0 ? DAYS_SUN : [...DAYS_SUN.slice(1), DAYS_SUN[0]];

  for (let m = 0; m < 12; m++) {
    const col = document.createElement('div');
    col.className = `month-col m-${m}`;
    col.id = `col-${m}`;

    // DOW header
    const dhr = document.createElement('div');
    dhr.className = 'dow-row';
    for (let i = 0; i < 7; i++) {
      const lbl = document.createElement('div');
      lbl.className = 'dow-lbl';
      const dow = weekStart === 0 ? i : (i + 1) % 7;
      lbl.textContent = DAYS_SUN[dow];
      if (dow === 0 || dow === 6) lbl.classList.add('we');
      dhr.appendChild(lbl);
    }
    col.appendChild(dhr);

    // Mini-calendar
    const cal = document.createElement('div');
    cal.className = 'mini-cal';
    const off = monthOffset(m, weekStart, year);
    const days = dim(m);

    // Empty cells before month
    for (let i = 0; i < off; i++) {
      const e = document.createElement('div');
      e.className = 'dc empty';
      cal.appendChild(e);
    }

    // Day cells
    for (let d = 1; d <= days; d++) {
      const dow = new Date(year, m, d).getDay();
      const dc = document.createElement('div');
      dc.className = 'dc' + (dow === 0 || dow === 6 ? ' we-day' : '');

      const num = document.createElement('div');
      num.className = 'dc-num';
      num.textContent = d;
      dc.appendChild(num);

      dc.addEventListener('click', () => {
        if (onDayClick) {
          onDayClick(m, d, year);
        }
      });
      cal.appendChild(dc);
    }

    // Pad to 42 cells (6 rows)
    const rem = 42 - (off + days);
    for (let i = 0; i < rem; i++) {
      const e = document.createElement('div');
      e.className = 'dc empty';
      cal.appendChild(e);
    }

    col.appendChild(cal);
    wrap.appendChild(col);
  }
}

/**
 * Bind scroll synchronization between strip and columns
 */
function bindScrollSync() {
  const scrollArea = document.getElementById('scrollArea');
  const strip = document.getElementById('strip');

  if (!scrollArea || !strip) return;

  scrollArea.addEventListener('scroll', () => {
    strip.scrollLeft = scrollArea.scrollLeft;
  });
}
