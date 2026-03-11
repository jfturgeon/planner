/**
 * TRACKER VIEW - TV Shows episode tracker
 * Displays show tabs, seasons with progress, and episode grid
 */

/**
 * Render TV shows tracker view
 * @param {Object} opts - Configuration options
 * @param {Array} opts.shows - Array of show data
 * @param {Object} opts.watched - Watched episodes tracking data
 * @param {Function} opts.onEpisodeToggle - Callback when episode is checked
 * @param {Function} opts.onShowChange - Callback when show tab is clicked
 */
export function renderTracker(opts = {}) {
  const {
    shows = [],
    watched = {},
    onEpisodeToggle = null,
    onShowChange = null,
    activeShow = null
  } = opts;

  const trackerView = document.getElementById('trackerView');
  if (!trackerView) return;

  trackerView.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'tr-header';

  const title = document.createElement('div');
  title.className = 'tr-title';
  title.textContent = '📺 Suivi des Épisodes';
  header.appendChild(title);

  trackerView.appendChild(header);

  // Show tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'tr-show-tabs';
  header.appendChild(tabsContainer);

  shows.forEach(show => {
    const tab = document.createElement('button');
    tab.className = 'tr-tab' + (show.id === activeShow ? ' active' : '');
    tab.style.borderColor = show.color;
    tab.style.background = show.id === activeShow ? show.color : 'white';
    tab.style.color = show.id === activeShow ? 'white' : 'inherit';
    tab.textContent = show.name;
    tab.addEventListener('click', () => {
      if (onShowChange) onShowChange(show.id);
    });
    tabsContainer.appendChild(tab);
  });

  // Stats bar
  const statsBar = document.createElement('div');
  statsBar.className = 'tr-stats-bar';

  const stat = document.createElement('div');
  stat.className = 'tr-stat';
  stat.innerHTML = `
    <div class="tr-stat-num">${getTotalWatchedCount(watched)}</div>
    <div class="tr-stat-lbl">Épisodes Regardés</div>`;
  statsBar.appendChild(stat);

  trackerView.appendChild(statsBar);

  // Content
  const content = document.createElement('div');
  content.className = 'tr-content';

  // Series list (left)
  const seriesList = document.createElement('div');
  seriesList.className = 'tr-series-list';

  shows.forEach(show => {
    const btn = document.createElement('button');
    btn.className = 'tr-series-btn' + (show.id === activeShow ? ' active' : '');
    const watchedCount = getShowWatchedCount(watched, show.id);
    const totalCount = getTotalShowEpisodes(show);
    const pct = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
    btn.innerHTML = `<span>${show.name}</span><span class="tr-sb-pct">${pct}%</span>`;
    btn.addEventListener('click', () => {
      if (onShowChange) onShowChange(show.id);
    });
    seriesList.appendChild(btn);
  });

  content.appendChild(seriesList);

  // Seasons (right)
  const seasons = document.createElement('div');
  seasons.className = 'tr-seasons';

  const activeShowData = shows.find(s => s.id === activeShow);
  if (activeShowData && activeShowData.series && activeShowData.series[0]) {
    const series = activeShowData.series[0];
    series.seasons.forEach((season, si) => {
      const seasonDiv = document.createElement('div');
      seasonDiv.className = 'tr-season open';

      const hd = document.createElement('div');
      hd.className = 'tr-season-hd';
      hd.addEventListener('click', () => {
        seasonDiv.classList.toggle('open');
      });

      const title = document.createElement('div');
      title.className = 'tr-season-title';
      title.textContent = `Saison ${season.n}`;
      hd.appendChild(title);

      const meta = document.createElement('div');
      meta.className = 'tr-season-meta';

      const watched_count = getSeasonWatchedCount(watched, activeShow, season.n);
      const prog = document.createElement('div');
      prog.className = 'tr-season-prog';
      prog.textContent = `${watched_count}/${season.episodeCount}`;
      meta.appendChild(prog);

      const pct = season.episodeCount > 0 ? Math.round((watched_count / season.episodeCount) * 100) : 0;
      const barWrap = document.createElement('div');
      barWrap.className = 'tr-season-bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'tr-season-bar';
      bar.style.width = pct + '%';
      barWrap.appendChild(bar);
      meta.appendChild(barWrap);

      const chevron = document.createElement('div');
      chevron.className = 'tr-season-chevron';
      chevron.textContent = '▼';
      meta.appendChild(chevron);

      hd.appendChild(meta);
      seasonDiv.appendChild(hd);

      // Episodes
      const episodes = document.createElement('div');
      episodes.className = 'tr-episodes';

      const epGrid = document.createElement('div');
      epGrid.className = 'tr-ep-grid';

      for (let ep = 1; ep <= season.episodeCount; ep++) {
        const epKey = `${activeShow}:s${String(season.n).padStart(2, '0')}e${String(ep).padStart(2, '0')}`;
        const isWatched = watched[epKey] || false;

        const epDiv = document.createElement('div');
        epDiv.className = 'tr-ep' + (isWatched ? ' watched' : '');

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = isWatched;
        cb.addEventListener('change', () => {
          if (onEpisodeToggle) {
            onEpisodeToggle(epKey, cb.checked);
          }
        });
        epDiv.appendChild(cb);

        const num = document.createElement('div');
        num.className = 'tr-ep-num';
        num.textContent = `${season.n}x${String(ep).padStart(2, '0')}`;
        epDiv.appendChild(num);

        const title = document.createElement('div');
        title.className = 'tr-ep-title';
        title.textContent = `Episode ${ep}`;
        epDiv.appendChild(title);

        epGrid.appendChild(epDiv);
      }

      episodes.appendChild(epGrid);
      seasonDiv.appendChild(episodes);
      seasons.appendChild(seasonDiv);
    });
  }

  content.appendChild(seasons);
  trackerView.appendChild(content);
}

/**
 * Helper: Get total watched episodes
 */
function getTotalWatchedCount(watched) {
  return Object.values(watched).filter(v => v).length;
}

/**
 * Helper: Get watched count for a show
 */
function getShowWatchedCount(watched, showId) {
  return Object.entries(watched)
    .filter(([key, v]) => v && key.startsWith(showId + ':'))
    .length;
}

/**
 * Helper: Get watched count for a season
 */
function getSeasonWatchedCount(watched, showId, seasonNum) {
  const prefix = `${showId}:s${String(seasonNum).padStart(2, '0')}e`;
  return Object.entries(watched)
    .filter(([key, v]) => v && key.startsWith(prefix))
    .length;
}

/**
 * Helper: Get total episodes for a show
 */
function getTotalShowEpisodes(show) {
  if (!show.series || !show.series[0]) return 0;
  return show.series[0].seasons.reduce((sum, s) => sum + s.episodeCount, 0);
}
