/**
 * HABITS TRACKER VIEW
 * Displays habit history grid with completion checks and charts
 */

/**
 * Render habits tracker view
 * @param {Object} opts - Configuration options
 * @param {Array} opts.habits - Array of habits
 * @param {Object} opts.weekly - Weekly tracking data
 * @param {Object} opts.appData - App data (for date info)
 * @param {Function} opts.onHabitToggle - Callback when habit checkbox toggled
 */
export function renderHabitsTracker(opts = {}) {
  const {
    habits = [],
    weekly = {},
    appData = {},
    onHabitToggle = null,
    selectedDate = new Date()
  } = opts;

  const habitView = document.getElementById('habitsView');
  if (!habitView) return;

  habitView.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'ht-header';
  const title = document.createElement('div');
  title.className = 'ht-title';
  title.textContent = '✅ Habitudes';
  header.appendChild(title);
  habitView.appendChild(header);

  // Container
  const container = document.createElement('div');
  container.className = 'ht-container';

  // Left panel - goals
  const left = document.createElement('div');
  left.className = 'ht-left';
  htBuildLeft(left, habits, weekly, selectedDate);
  container.appendChild(left);

  // Right panel - habit grid
  const right = document.createElement('div');
  right.className = 'ht-right';
  htBuildGrid(right, habits, weekly, selectedDate, onHabitToggle);
  container.appendChild(right);

  habitView.appendChild(container);
}

/**
 * Build left panel with goal info and chart
 */
function htBuildLeft(container, habits, weekly, selectedDate) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Goal badge
  const goalBadge = document.createElement('div');
  goalBadge.className = 'ht-goal-badge';

  const checks = htGetChecks(habits.length, year, month);
  const total = 30; // days in month roughly
  const achieved = htGoalAchievedCount(checks, total);

  goalBadge.innerHTML = `
    <div class="ht-goal-num">${achieved}</div>
    <div class="ht-goal-lbl">Jours<br>Parfaits</div>
  `;
  container.appendChild(goalBadge);

  // Chart
  const chartDiv = document.createElement('div');
  chartDiv.className = 'ht-chart';
  const canvas = document.createElement('canvas');
  canvas.width = 150;
  canvas.height = 100;
  chartDiv.appendChild(canvas);
  container.appendChild(chartDiv);

  // Chart data
  const pctComplete = achieved > 0 ? Math.round((achieved / total) * 100) : 0;
  htDrawChart(canvas, pctComplete, 30);

  // Stats
  const stats = document.createElement('div');
  stats.className = 'ht-stats';
  stats.innerHTML = `
    <div class="ht-stat">
      <span class="ht-stat-n">${pctComplete}%</span>
      <span>Complé</span>
    </div>
    <div class="ht-stat">
      <span class="ht-stat-n">${habits.length}</span>
      <span>Habitudes</span>
    </div>
  `;
  container.appendChild(stats);
}

/**
 * Build right panel with habit grid
 */
function htBuildGrid(container, habits, weekly, selectedDate, onHabitToggle) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Header
  const header = document.createElement('div');
  header.className = 'ht-grid-header';
  header.innerHTML = `
    <div class="ht-gh-date">${months[month]} ${year}</div>
    <div class="ht-gh-dates">
      ${Array.from({length: 31}, (_, i) => {
        const d = i + 1;
        const date = new Date(year, month, d);
        if (date.getMonth() !== month) return '';
        return `<div class="ht-gh-d">${d}</div>`;
      }).join('')}
    </div>
  `;
  container.appendChild(header);

  // Habits
  const grid = document.createElement('div');
  grid.className = 'ht-grid';

  habits.forEach((habit, hi) => {
    const row = document.createElement('div');
    row.className = 'ht-row';

    const name = document.createElement('div');
    name.className = 'ht-row-name';
    name.textContent = habit.name;
    row.appendChild(name);

    const checks = document.createElement('div');
    checks.className = 'ht-row-checks';

    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getMonth() !== month) break;

      const key = htWeekKey(year, month, day);
      const checked = weekly[key] && weekly[key][hi] ? 1 : 0;

      const cell = document.createElement('div');
      cell.className = 'ht-cell' + (checked ? ' done' : '');

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = checked;
      cb.addEventListener('change', () => {
        if (onHabitToggle) {
          onHabitToggle({
            habitIndex: hi,
            key: key,
            checked: cb.checked
          });
        }
      });
      cell.appendChild(cb);

      checks.appendChild(cell);
    }

    row.appendChild(checks);
    grid.appendChild(row);
  });

  container.appendChild(grid);
}

/**
 * Get habit checks for a month
 */
function htGetChecks(habitCount, year, month) {
  const result = [];
  for (let day = 1; day <= 31; day++) {
    const date = new Date(year, month, day);
    if (date.getMonth() !== month) break;
    result.push([]);
  }
  return result;
}

/**
 * Calculate week key from date
 */
function htWeekKey(year, month, day) {
  const date = new Date(year, month, day);
  const weekNum = Math.ceil((date.getDate() + new Date(year, month, 1).getDay()) / 7);
  return `${year}w${weekNum}`;
}

/**
 * Count days with all habits done
 */
function htGoalAchievedCount(checks, total) {
  return Math.min(checks.length, 10); // placeholder
}

/**
 * Draw progress chart on canvas
 */
function htDrawChart(canvas, percent, days) {
  const ctx = canvas.getContext('2d');
  
  // Clear
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background bars
  ctx.fillStyle = '#f0f0f0';
  for (let i = 0; i < days; i++) {
    const x = (i / days) * canvas.width;
    const w = canvas.width / days;
    ctx.fillRect(x, 60, w - 1, 30);
  }

  // Progress bar
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 60, (percent / 100) * canvas.width, 30);

  // Label
  ctx.fillStyle = '#333';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(percent + '%', canvas.width / 2, 30);

  // Border
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 60, canvas.width, 30);
}

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
