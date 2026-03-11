/**
 * KANBAN VIEW - Task board with drag-drop columns
 * Displays project tasks in status columns with progress tracking
 */

/**
 * Render kanban board view
 * @param {Object} opts - Configuration options
 * @param {Array} opts.statuses - Column status configurations
 * @param {Array} opts.cards - Task cards
 * @param {Number} opts.activeYear - Currently viewed year
 * @param {Boolean} opts.compactView - Compact or full view
 * @param {Function} opts.onCardClick - Callback when card clicked
 * @param {Function} opts.onCardDrop - Callback when card dropped
 * @param {Function} opts.onStatusAdd - Callback to add new status
 */
export function renderKanban(opts = {}) {
  const {
    statuses = [],
    cards = [],
    activeYear = new Date().getFullYear(),
    compactView = false,
    onCardClick = null,
    onCardDrop = null,
    onStatusAdd = null,
    onYearChange = null
  } = opts;

  console.log('✅ renderKanban() called with cards:', cards.length);

  const kanbanView = document.getElementById('kanbanView');
  if (!kanbanView) {
    console.error('❌ kanbanView element not found!');
    return;
  }

  console.log('✅ kanbanView element found');

  kanbanView.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'kb-header';
  const title = document.createElement('div');
  title.className = 'kb-title';
  title.textContent = '🎯 Kanban';
  header.appendChild(title);
  kanbanView.appendChild(header);

  // Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'kb-toolbar';

  // Progress info
  const allCards = cards.filter(c => c.year === activeYear);
  const doneStatus = statuses.find(s => s.id === 'done' || s.label.toLowerCase().includes('complét'));
  const doneCount = doneStatus ? allCards.filter(c => c.statusId === doneStatus.id).length : 0;
  const total = allCards.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const progressWrap = document.createElement('div');
  progressWrap.className = 'kb-progress-wrap';
  const progressLabel = document.createElement('span');
  progressLabel.className = 'kb-progress-label';
  progressLabel.textContent = total ? `${activeYear} · ${doneCount}/${total} · ${pct}%` : `${activeYear} · 0 objectif`;
  const progressTrack = document.createElement('div');
  progressTrack.className = 'kb-progress-track';
  const progressFill = document.createElement('div');
  progressFill.className = 'kb-progress-fill';
  progressFill.style.width = pct + '%';
  progressFill.style.background = doneStatus?.color || '#2a7a4b';
  progressTrack.appendChild(progressFill);
  progressWrap.appendChild(progressLabel);
  progressWrap.appendChild(progressTrack);
  toolbar.appendChild(progressWrap);

  // Spacer
  const spacer = document.createElement('div');
  spacer.style.flex = '1';
  toolbar.appendChild(spacer);

  // Compact toggle
  const compactBtn = document.createElement('button');
  compactBtn.className = 'kb-manage-btn';
  compactBtn.textContent = compactView ? '☰ Complet' : '▤ Compact';
  compactBtn.addEventListener('click', () => {
    if (onCardClick) onCardClick({ type: 'toggleCompact' });
  });
  toolbar.appendChild(compactBtn);

  // Add column button
  const addColBtn = document.createElement('button');
  addColBtn.className = 'kb-manage-btn';
  addColBtn.textContent = '＋ Colonne';
  addColBtn.addEventListener('click', () => {
    if (onStatusAdd) onStatusAdd();
  });
  toolbar.appendChild(addColBtn);
  kanbanView.appendChild(toolbar);

  // Board
  const board = document.createElement('div');
  board.className = 'kb-board' + (compactView ? ' kb-board-compact' : '');

  const yearCards = allCards;
  statuses.forEach(status => {
    board.appendChild(kbBuildColumn(status, yearCards, onCardClick, onCardDrop));
  });

  kanbanView.appendChild(board);
}

/**
 * Build a single kanban column
 */
function kbBuildColumn(status, allCards, onCardClick, onCardDrop) {
  const colCards = allCards
    .filter(c => c.statusId === status.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const col = document.createElement('div');
  col.className = 'kb-col';
  col.dataset.statusId = status.id;

  // Column drag reorder
  col.draggable = true;
  col.addEventListener('dragstart', e => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('kb-col', status.id);
    col.classList.add('kb-col-dragging');
  });
  col.addEventListener('dragend', () => {
    col.classList.remove('kb-col-dragging');
  });
  col.addEventListener('dragover', e => {
    e.preventDefault();
    col.classList.add('kb-col-drop-target');
  });
  col.addEventListener('dragleave', e => {
    if (!col.contains(e.relatedTarget)) {
      col.classList.remove('kb-col-drop-target');
    }
  });
  col.addEventListener('drop', e => {
    col.classList.remove('kb-col-drop-target');
    e.preventDefault();
    e.stopPropagation();
  });

  // Header
  const hd = document.createElement('div');
  hd.className = 'kb-col-hd';
  hd.style.borderLeft = `4px solid ${status.color}`;
  hd.style.background = `linear-gradient(90deg, ${status.color}18 0%, transparent 100%)`;

  const dot = document.createElement('span');
  dot.className = 'kb-col-dot';
  dot.style.background = status.color;
  hd.appendChild(dot);

  const lbl = document.createElement('span');
  lbl.className = 'kb-col-label';
  lbl.textContent = status.label;
  lbl.addEventListener('click', () => {
    if (onCardClick) onCardClick({ type: 'editStatus', status });
  });
  hd.appendChild(lbl);

  const cnt = document.createElement('span');
  cnt.className = 'kb-col-count';
  cnt.style.background = status.color + '33';
  cnt.style.color = status.color;
  cnt.textContent = colCards.length;
  hd.appendChild(cnt);

  const addBtn = document.createElement('button');
  addBtn.className = 'kb-col-add-btn';
  addBtn.textContent = '＋';
  addBtn.style.setProperty('--col-color', status.color);
  addBtn.addEventListener('click', () => {
    if (onCardClick) onCardClick({ type: 'addCard', statusId: status.id });
  });
  hd.appendChild(addBtn);

  const menuBtn = document.createElement('button');
  menuBtn.className = 'kb-col-menu-btn';
  menuBtn.textContent = '⋯';
  menuBtn.addEventListener('click', () => {
    if (onCardClick) onCardClick({ type: 'statusMenu', status });
  });
  hd.appendChild(menuBtn);

  col.appendChild(hd);

  // Card list
  const list = document.createElement('div');
  list.className = 'kb-list';
  list.dataset.statusId = status.id;

  list.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  list.addEventListener('drop', e => {
    e.preventDefault();
    if (onCardDrop) {
      onCardDrop({
        toStatusId: status.id,
        afterCardId: e.target.dataset?.cardId || null
      });
    }
  });

  colCards.forEach(card => {
    list.appendChild(kbBuildCard(card, status, onCardClick));
  });

  col.appendChild(list);
  return col;
}

/**
 * Build a single kanban card
 */
function kbBuildCard(card, status, onCardClick) {
  const cardEl = document.createElement('div');
  cardEl.className = 'kb-card';
  cardEl.dataset.cardId = card.id;
  cardEl.draggable = true;

  // Drag handlers
  cardEl.addEventListener('dragstart', e => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('kb-card', card.id);
    cardEl.classList.add('kb-card-dragging');
  });
  cardEl.addEventListener('dragend', () => {
    cardEl.classList.remove('kb-card-dragging');
  });

  // Click to edit
  cardEl.addEventListener('click', () => {
    if (onCardClick) onCardClick({ type: 'editCard', card });
  });

  // Header
  const hd = document.createElement('div');
  hd.className = 'kb-card-hd';
  const title = document.createElement('div');
  title.className = 'kb-card-title';
  title.textContent = card.title || 'Untitled';
  hd.appendChild(title);

  if (card.dueDate) {
    const dueSpan = document.createElement('span');
    dueSpan.className = 'kb-card-due';
    dueSpan.textContent = card.dueDate;
    hd.appendChild(dueSpan);
  }

  cardEl.appendChild(hd);

  // Description
  if (card.description) {
    const desc = document.createElement('div');
    desc.className = 'kb-card-desc';
    desc.textContent = card.description.substring(0, 60) + (card.description.length > 60 ? '...' : '');
    cardEl.appendChild(desc);
  }

  // Tags
  if (card.tags && card.tags.length > 0) {
    const tags = document.createElement('div');
    tags.className = 'kb-card-tags';
    card.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'kb-card-tag';
      tagEl.textContent = tag;
      tags.appendChild(tagEl);
    });
    cardEl.appendChild(tags);
  }

  // Priority indicator
  if (card.priority) {
    const pri = document.createElement('div');
    pri.className = 'kb-card-priority kb-priority-' + (card.priority || 'low');
    pri.title = card.priority;
    cardEl.appendChild(pri);
  }

  return cardEl;
}

/**
 * Helper: Get element after drag position
 */
function kbGetAfterElement(list, y) {
  const draggables = [
    ...list.querySelectorAll('.kb-card:not(.kb-card-dragging)')
  ];

  return draggables.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Helper: Generate unique ID
 */
export function kbUid() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
