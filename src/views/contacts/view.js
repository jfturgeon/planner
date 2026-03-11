/**
 * CONTACTS VIEW - Complete rewrite with enhanced UI
 * - Pills with colors and count
 * - Birthday format: DD/MM/YYYY (age ans) with dynamic age calculation
 * - Pagination with page numbers
 * - Tags filter with color dots
 * - Modal for add/edit with tag picker
 * - Groups/tags management modal
 */

const CONTACTS_KEY = 'ap_contacts';
const GROUPS_KEY = 'ap_contact_groups';
const CT_PAGE_SIZE = 15;
const CT_TAG_COLORS = [
  '#7cb9e8','#8dd4a0','#e8a87c','#c4a8e8',
  '#e8d47c','#e889b8','#7ce8d4','#a8b8e8',
  '#e88888','#b8e88d','#e8c47c','#8ab8e8',
];

// View state
let ctCurrentPage = 1;
let ctTextFilter = '';
let ctTagFilter = '';
let ctSortField = 'ln';
let ctSortAsc = true;

function ctLoadContacts() {
  const data = localStorage.getItem(CONTACTS_KEY);
  return data ? JSON.parse(data) : [];
}

function ctSaveContacts(contacts) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

function ctLoadGroups() {
  const data = localStorage.getItem(GROUPS_KEY);
  if (data) return JSON.parse(data);
  // Auto-generate from contact tags
  const allTags = new Set();
  ctLoadContacts().forEach(c => {
    if (c.tags) (Array.isArray(c.tags) ? c.tags : []).forEach(t => allTags.add(t));
  });
  return Array.from(allTags).sort();
}

function ctSaveGroups(groups) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

function ctTagColor(tag, groups) {
  const idx = groups.indexOf(tag);
  return CT_TAG_COLORS[idx >= 0 ? idx % CT_TAG_COLORS.length : (tag.charCodeAt(0) % CT_TAG_COLORS.length)];
}

function ctTagBg(tag, groups) {
  const col = ctTagColor(tag, groups);
  return col + '28'; // ~16% opacity
}

function ctKey(c) {
  return `${c.fn}|${c.ln}|${c.bm}|${c.bd}|${c.by}`;
}

/**
 * Format birthday with age calculation
 * @returns {string} Example: "12/10/1977 (47 ans)"
 */
function ctFormatBirthday(bm, bd, by) {
  if (!bm || !bd) return null;
  
  let display = `${String(bd).padStart(2, '0')}/${String(bm).padStart(2, '0')}`;
  
  if (by) {
    display += `/${by}`;
    // Calculate age based on if birthday has passed this year
    const today = new Date();
    const thisYear = today.getFullYear();
    let age = thisYear - by;
    const birthDate = new Date(thisYear, bm - 1, bd);
    if (birthDate > today) {
      age--;
    }
    display += ` (${age} ans)`;
  }
  
  return display;
}

export function ctInitView(opts = {}) {
  const allContacts = ctLoadContacts();
  const groups = ctLoadGroups();
  console.log('📦 Contacts:', allContacts.length, 'Groups:', groups.length);

  const contactView = document.getElementById('contactsView');
  if (!contactView) {
    console.error('❌ contactsView not found');
    return;
  }

  contactView.innerHTML = '';

  // Main wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'ct-view';

  // ───────────────────────────────────────────────────────
  // TOOLBAR
  // ───────────────────────────────────────────────────────
  const toolbar = document.createElement('div');
  toolbar.className = 'ct-toolbar';

  const title = document.createElement('div');
  title.className = 'ct-view-title';
  title.textContent = '👥 Contacts';
  toolbar.appendChild(title);

  // Search box
  const searchWrap = document.createElement('div');
  searchWrap.className = 'ct-search-wrap';
  if (ctTextFilter) searchWrap.classList.add('has-value');
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'ct-search-input';
  searchInput.placeholder = 'Rechercher…';
  searchInput.value = ctTextFilter;
  
  const clearBtn = document.createElement('button');
  clearBtn.className = 'ct-search-clear';
  clearBtn.textContent = '✕';
  clearBtn.title = 'Effacer';
  clearBtn.addEventListener('click', (e) => {
    e.preventDefault();
    ctTextFilter = '';
    searchInput.value = '';
    searchWrap.classList.remove('has-value');
    ctCurrentPage = 1;
    ctRenderPills(wrapper, allContacts);
    ctRenderTable(wrapper, allContacts);
    searchInput.focus();
  });

  searchInput.addEventListener('input', (e) => {
    ctTextFilter = e.target.value;
    searchWrap.classList.toggle('has-value', !!ctTextFilter);
    ctCurrentPage = 1;
    ctRenderPills(wrapper, allContacts);
    ctRenderTable(wrapper, allContacts);
  });

  searchWrap.appendChild(searchInput);
  searchWrap.appendChild(clearBtn);
  toolbar.appendChild(searchWrap);

  // Spacer
  const spacer = document.createElement('div');
  spacer.style.flex = '1';
  toolbar.appendChild(spacer);

  // Add button
  const addBtn = document.createElement('button');
  addBtn.className = 'ct-add-btn';
  addBtn.textContent = '+ Nouveau';
  addBtn.style.cssText = 'padding:7px 14px;border-radius:8px;border:1px solid var(--border);background:var(--accent);color:white;font-family:"DM Sans",sans-serif;font-size:.82rem;cursor:pointer;font-weight:500;';
  addBtn.addEventListener('click', () => {
    ctShowContactModal(null, allContacts);
  });
  toolbar.appendChild(addBtn);

  // Groups button
  const grpBtn = document.createElement('button');
  grpBtn.className = 'ct-groups-btn';
  grpBtn.style.cssText = 'padding:7px 14px;border-radius:8px;border:1px solid var(--border);background:var(--surface);font-family:"DM Sans",sans-serif;font-size:.82rem;cursor:pointer;white-space:nowrap;';
  grpBtn.textContent = '⚙ Tags';
  grpBtn.addEventListener('click', ctShowGroupsModal);
  toolbar.appendChild(grpBtn);

  wrapper.appendChild(toolbar);

  // ───────────────────────────────────────────────────────
  // TAG PILLS (with colors and dots)
  // ───────────────────────────────────────────────────────
  ctRenderPills(wrapper, allContacts);

  // ───────────────────────────────────────────────────────
  // TABLE
  // ───────────────────────────────────────────────────────
  ctRenderTable(wrapper, allContacts);

  contactView.appendChild(wrapper);
  console.log('✅ ctInitView() complete');
}

/**
 * Render colored tag filter pills with dots
 */
function ctRenderPills(container, allContacts) {
  const groups = ctLoadGroups();
  
  // Remove old pills
  const oldPills = container.querySelector('.ct-group-pills');
  if (oldPills) oldPills.remove();

  const pillsDiv = document.createElement('div');
  pillsDiv.id = 'ctGroupPills';
  pillsDiv.className = 'ct-group-pills';

  const mkPill = (label, filterVal, count, color) => {
    const pill = document.createElement('button');
    pill.className = 'ct-group-pill' + (ctTagFilter === filterVal ? ' active' : '');
    
    if (color && ctTagFilter !== filterVal) {
      pill.style.borderColor = color;
      pill.style.color = color;
    }
    if (color && ctTagFilter === filterVal) {
      pill.style.background = color;
      pill.style.borderColor = color;
    }

    if (color) {
      const dot = document.createElement('span');
      dot.className = 'ct-pill-dot';
      dot.style.background = color;
      pill.appendChild(dot);
    }
    
    const span = document.createElement('span');
    span.textContent = `${label} (${count})`;
    pill.appendChild(span);

    pill.addEventListener('click', () => {
      ctTagFilter = ctTagFilter === filterVal ? '' : filterVal;
      ctCurrentPage = 1;
      ctRenderPills(container, allContacts);
      ctRenderTable(container, allContacts);
    });
    pillsDiv.appendChild(pill);
  };

  // "All" pill
  mkPill('Tous', '', allContacts.length, null);

  // Tag pills with colors
  groups.forEach(g => {
    const count = allContacts.filter(c => c.tags && c.tags.includes(g)).length;
    mkPill(g, g, count, ctTagColor(g, groups));
  });

  // No-tag pill
  const noTag = allContacts.filter(c => !c.tags || c.tags.length === 0).length;
  if (noTag > 0) mkPill('Sans tag', '__none__', noTag, '#bbb');

  container.appendChild(pillsDiv);
}

/**
 * Render table and pager
 */
function ctRenderTable(container, allContacts) {
  // Filter by tag
  let filtered = allContacts;
  if (ctTagFilter === '__none__') {
    filtered = filtered.filter(c => !c.tags || c.tags.length === 0);
  } else if (ctTagFilter) {
    filtered = filtered.filter(c => c.tags && c.tags.includes(ctTagFilter));
  }

  // Filter by text search
  if (ctTextFilter) {
    const q = ctTextFilter.toLowerCase();
    filtered = filtered.filter(c => {
      const fn = (c.fn || '').toLowerCase();
      const ln = (c.ln || '').toLowerCase();
      return fn.includes(q) || ln.includes(q);
    });
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal, bVal;
    if (ctSortField === 'fn') {
      aVal = (a.fn || '').toLowerCase();
      bVal = (b.fn || '').toLowerCase();
    } else if (ctSortField === 'ln') {
      aVal = (a.ln || '').toLowerCase();
      bVal = (b.ln || '').toLowerCase();
    } else if (ctSortField === 'bm') {
      aVal = `${a.bm || 99}-${a.bd || 99}`;
      bVal = `${b.bm || 99}-${b.bd || 99}`;
    } else {
      aVal = bVal = 0;
    }
    
    if (ctSortAsc) {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // Pagination
  const total = filtered.length;
  const pages = Math.ceil(total / CT_PAGE_SIZE) || 1;
  if (ctCurrentPage > pages) ctCurrentPage = pages;
  const start = (ctCurrentPage - 1) * CT_PAGE_SIZE;
  const end = start + CT_PAGE_SIZE;
  const pageContacts = filtered.slice(start, end);

  // Remove old table if exists
  const oldTable = container.querySelector('.ct-table-wrap');
  if (oldTable) oldTable.remove();
  const oldPager = container.querySelector('.ct-pager');
  if (oldPager) oldPager.remove();

  // Table wrapper
  const tableWrap = document.createElement('div');
  tableWrap.className = 'ct-table-wrap';

  // Table
  const table = document.createElement('table');
  table.className = 'ct-table';

  // Header
  const thead = document.createElement('thead');
  const hrow = document.createElement('tr');
  
  const mkHeaderCell = (label, field) => {
    const th = document.createElement('th');
    th.className = 'ct-th' + (field ? ' ct-th-sort' : '');
    const span = document.createElement('span');
    span.textContent = label;
    th.appendChild(span);
    
    if (field) {
      const icon = document.createElement('span');
      icon.className = 'ct-sort-icon';
      icon.textContent = ctSortField === field ? (ctSortAsc ? '▲' : '▼') : '△';
      th.appendChild(icon);
      th.addEventListener('click', () => {
        if (ctSortField === field) {
          ctSortAsc = !ctSortAsc;
        } else {
          ctSortField = field;
          ctSortAsc = true;
        }
        ctRenderTable(container, allContacts);
      });
      th.style.cursor = 'pointer';
    }
    hrow.appendChild(th);
  };

  mkHeaderCell('Prénom', 'fn');
  mkHeaderCell('Nom', 'ln');
  mkHeaderCell('Tags', null);
  mkHeaderCell('Anniversaire', 'bm');
  mkHeaderCell('Décès', null);
  mkHeaderCell('', null);

  thead.appendChild(hrow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  pageContacts.forEach(c => {
    const tr = document.createElement('tr');
    tr.addEventListener('click', () => {
      console.log('Contact clicked:', c);
    });

    // First name
    const fnTd = document.createElement('td');
    fnTd.className = 'ct-td';
    fnTd.textContent = c.fn || '';
    tr.appendChild(fnTd);

    // Last name
    const lnTd = document.createElement('td');
    lnTd.className = 'ct-td';
    lnTd.textContent = c.ln || '';
    tr.appendChild(lnTd);

    // Tags
    const tagsTd = document.createElement('td');
    tagsTd.className = 'ct-td';
    const tagsStr = (c.tags || []).join(', ');
    tagsTd.textContent = tagsStr || '—';
    tagsTd.style.color = tagsStr ? 'inherit' : '#bbb';
    tr.appendChild(tagsTd);

    // Birthday
    const bdayTd = document.createElement('td');
    bdayTd.className = 'ct-td';
    if (c.bm && c.bd) {
      bdayTd.textContent = `${String(c.bm).padStart(2, '0')}-${String(c.bd).padStart(2, '0')}${c.by ? ` (${c.by})` : ''}`;
    } else {
      bdayTd.textContent = '—';
      bdayTd.style.color = '#bbb';
    }
    tr.appendChild(bdayTd);

    // Death date
    const ddayTd = document.createElement('td');
    ddayTd.className = 'ct-td';
    if (c.dy && c.dm && c.dd) {
      ddayTd.textContent = `${c.dy}-${String(c.dm).padStart(2, '0')}-${String(c.dd).padStart(2, '0')}`;
    } else {
      ddayTd.textContent = '—';
      ddayTd.style.color = '#bbb';
    }
    tr.appendChild(ddayTd);

    // Actions
    const actTd = document.createElement('td');
    actTd.className = 'ct-td-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'ct-row-btn';
    editBtn.textContent = '✏';
    editBtn.title = 'Modifier';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ctShowContactModal(c, allContacts);
    });
    actTd.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'ct-row-btn ct-row-btn-del';
    delBtn.textContent = '✕';
    delBtn.title = 'Supprimer';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Supprimer ${c.fn || ''} ${c.ln || ''} ?`)) {
        const updated = allContacts.filter(x => ctKey(x) !== ctKey(c));
        ctSaveContacts(updated);
        ctInitView({ contacts: updated });
      }
    });
    actTd.appendChild(delBtn);

    tr.appendChild(actTd);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrap.appendChild(table);
  container.appendChild(tableWrap);

/**
 * Render table with pagination
 */
function ctRenderTable(container, allContacts) {
  const groups = ctLoadGroups();
  
  // Filter by tag
  let filtered = allContacts;
  if (ctTagFilter === '__none__') {
    filtered = filtered.filter(c => !c.tags || c.tags.length === 0);
  } else if (ctTagFilter) {
    filtered = filtered.filter(c => c.tags && c.tags.includes(ctTagFilter));
  }

  // Filter by text
  if (ctTextFilter) {
    const q = ctTextFilter.toLowerCase();
    filtered = filtered.filter(c => 
      (c.fn || '').toLowerCase().includes(q) || 
      (c.ln || '').toLowerCase().includes(q)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal, bVal;
    if (ctSortField === 'fn') {
      aVal = (a.fn || '').toLowerCase();
      bVal = (b.fn || '').toLowerCase();
    } else if (ctSortField === 'ln') {
      aVal = (a.ln || '').toLowerCase();
      bVal = (b.ln || '').toLowerCase();
    } else if (ctSortField === 'bm') {
      aVal = (a.bm || 0) * 100 + (a.bd || 0);
      bVal = (b.bm || 0) * 100 + (b.bd || 0);
    } else {
      aVal = bVal = 0;
    }
    
    if (ctSortAsc) {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // Pagination
  const total = filtered.length;
  const pages = Math.ceil(total / CT_PAGE_SIZE) || 1;
  if (ctCurrentPage > pages) ctCurrentPage = pages;
  const start = (ctCurrentPage - 1) * CT_PAGE_SIZE;
  const end = start + CT_PAGE_SIZE;
  const pageContacts = filtered.slice(start, end);

  // Remove old table and pager
  const oldTable = container.querySelector('.ct-table-wrap');
  if (oldTable) oldTable.remove();
  const oldPager = container.querySelector('.ct-pager');
  if (oldPager) oldPager.remove();

  // ───────────────────────────────────────────────────────
  // TABLE
  // ───────────────────────────────────────────────────────
  const tableWrap = document.createElement('div');
  tableWrap.className = 'ct-table-wrap';

  const table = document.createElement('table');
  table.className = 'ct-table';

  // Header
  const thead = document.createElement('thead');
  const hrow = document.createElement('tr');
  
  const mkHeaderCell = (label, field) => {
    const th = document.createElement('th');
    th.className = 'ct-th' + (field ? ' ct-th-sort' : '');
    const span = document.createElement('span');
    span.textContent = label;
    th.appendChild(span);
    
    if (field) {
      const icon = document.createElement('span');
      icon.className = 'ct-sort-icon';
      icon.textContent = ctSortField === field ? (ctSortAsc ? '▲' : '▼') : '△';
      th.appendChild(icon);
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        if (ctSortField === field) {
          ctSortAsc = !ctSortAsc;
        } else {
          ctSortField = field;
          ctSortAsc = true;
        }
        ctRenderTable(container, allContacts);
      });
    }
    hrow.appendChild(th);
  };

  mkHeaderCell('Prénom', 'fn');
  mkHeaderCell('Nom', 'ln');
  mkHeaderCell('Tags', null);
  mkHeaderCell('Anniversaire', 'bm');
  mkHeaderCell('Décès', null);
  mkHeaderCell('', null);

  thead.appendChild(hrow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  if (pageContacts.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyTd = document.createElement('td');
    emptyTd.colSpan = 6;
    emptyTd.style.cssText = 'padding:24px;text-align:center;color:#bbb;';
    emptyTd.textContent = ctTextFilter || ctTagFilter ? 'Aucun résultat.' : 'Aucun contact.';
    emptyRow.appendChild(emptyTd);
    tbody.appendChild(emptyRow);
  }

  pageContacts.forEach(c => {
    const tr = document.createElement('tr');

    // First name
    const fnTd = document.createElement('td');
    fnTd.className = 'ct-td';
    fnTd.textContent = c.fn || '';
    tr.appendChild(fnTd);

    // Last name
    const lnTd = document.createElement('td');
    lnTd.className = 'ct-td';
    lnTd.textContent = c.ln || '';
    tr.appendChild(lnTd);

    // Tags (with color badges)
    const tagsTd = document.createElement('td');
    tagsTd.className = 'ct-td ct-tags-cell';
    if (c.tags && c.tags.length > 0) {
      const cell = document.createElement('div');
      cell.style.display = 'flex';
      cell.style.flexWrap = 'wrap';
      cell.style.gap = '4px';
      c.tags.forEach(tag => {
        const badge = document.createElement('span');
        badge.className = 'ct-grp-badge';
        const col = ctTagColor(tag, groups);
        badge.style.cssText = `background:${ctTagBg(tag, groups)};color:${col};border-color:${col};border:1px solid;`;
        badge.textContent = tag;
        cell.appendChild(badge);
      });
      tagsTd.appendChild(cell);
    } else {
      tagsTd.textContent = '—';
      tagsTd.style.color = '#bbb';
    }
    tr.appendChild(tagsTd);

    // Birthday (with age)
    const bdayTd = document.createElement('td');
    bdayTd.className = 'ct-td';
    const bdayStr = ctFormatBirthday(c.bm, c.bd, c.by);
    bdayTd.textContent = bdayStr || '—';
    if (!bdayStr) bdayTd.style.color = '#bbb';
    tr.appendChild(bdayTd);

    // Death date
    const ddayTd = document.createElement('td');
    ddayTd.className = 'ct-td';
    if (c.dy && c.dm && c.dd) {
      ddayTd.textContent = `${c.dy}-${String(c.dm).padStart(2, '0')}-${String(c.dd).padStart(2, '0')}`;
    } else {
      ddayTd.textContent = '—';
      ddayTd.style.color = '#bbb';
    }
    tr.appendChild(ddayTd);

    // Actions
    const actTd = document.createElement('td');
    actTd.className = 'ct-td-actions';
    actTd.style.cssText = 'display:flex;gap:4px;';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'ct-row-btn';
    editBtn.style.cssText = 'padding:4px 8px;background:var(--surface);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:.9rem;';
    editBtn.textContent = '✏';
    editBtn.title = 'Modifier';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ctShowContactModal(c, allContacts);
    });
    actTd.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'ct-row-btn ct-row-btn-del';
    delBtn.style.cssText = 'padding:4px 8px;background:#fee;border:1px solid #f99;border-radius:4px;cursor:pointer;font-size:.9rem;color:#c33;';
    delBtn.textContent = '✕';
    delBtn.title = 'Supprimer';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Supprimer ${c.fn} ${c.ln} ?`)) {
        const updated = allContacts.filter(x => ctKey(x) !== ctKey(c));
        ctSaveContacts(updated);
        ctInitView({});
      }
    });
    actTd.appendChild(delBtn);

    tr.appendChild(actTd);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrap.appendChild(table);
  container.appendChild(tableWrap);

  // ───────────────────────────────────────────────────────
  // PAGINATION (page numbers)
  // ───────────────────────────────────────────────────────
  const pagerDiv = document.createElement('div');
  pagerDiv.className = 'ct-pager';

  const info = document.createElement('span');
  info.className = 'ct-pager-info';
  const s = total ? start + 1 : 0;
  const e = Math.min(end, total);
  info.textContent = total ? `${s}–${e} sur ${total}` : '0 contact';
  pagerDiv.appendChild(info);

  if (pages > 1) {
    const btns = document.createElement('div');
    btns.className = 'ct-pager-btns';
    btns.style.cssText = 'display:flex;gap:4px;align-items:center;';

    const mkBtn = (label, page, active = false, disabled = false) => {
      const b = document.createElement('button');
      b.className = 'ct-pager-btn' + (active ? ' active' : '');
      b.style.cssText = `
        padding:5px 10px;border-radius:4px;border:1px solid var(--border);
        background:var(--surface);cursor:pointer;font-size:.8rem;
        ${active ? 'background:var(--accent2);color:white;border-color:var(--accent2);font-weight:700;' : ''}
        ${disabled ? 'opacity:.35;cursor:default;' : ''}
      `;
      b.textContent = label;
      b.disabled = disabled;
      if (!disabled && !active) {
        b.addEventListener('click', () => {
          ctCurrentPage = page;
          ctRenderTable(container, allContacts);
        });
      }
      btns.appendChild(b);
    };

    const dots = () => {
      const d = document.createElement('span');
      d.className = 'ct-pager-dots';
      d.style.cssText = 'font-size:.8rem;color:var(--muted);padding:0 2px;';
      d.textContent = '…';
      btns.appendChild(d);
    };

    // Previous
    mkBtn('‹', ctCurrentPage - 1, false, ctCurrentPage <= 1);

    // Page numbers with ellipsis
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - ctCurrentPage) <= 1) {
        mkBtn(i, i, i === ctCurrentPage);
      } else if (i === 2 && ctCurrentPage > 4) {
        dots();
      } else if (i === pages - 1 && ctCurrentPage < pages - 3) {
        dots();
      }
    }

    // Next
    mkBtn('›', ctCurrentPage + 1, false, ctCurrentPage >= pages);

    pagerDiv.appendChild(btns);
  }

  container.appendChild(pagerDiv);
}

/**
 * Show contact modal for add/edit
 */
function ctShowContactModal(contact, allContacts) {
  const groups = ctLoadGroups();
  console.log('📋 Contact modal:', contact ? 'edit' : 'new');

  // Modal overlay
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9000;';

  // Content
  const content = document.createElement('div');
  content.style.cssText = 'background:white;padding:24px;border-radius:8px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 4px 16px rgba(0,0,0,0.15);';

  const title = document.createElement('h2');
  title.textContent = contact ? `Modifier: ${contact.fn} ${contact.ln}` : 'Nouveau Contact';
  title.style.marginBottom = '16px';
  content.appendChild(title);

  const form = document.createElement('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fn = form.fn.value.trim();
    const ln = form.ln.value.trim();
    const bm = form.bm.value ? Number(form.bm.value) : null;
    const bd = form.bd.value ? Number(form.bd.value) : null;
    const by = form.by.value ? Number(form.by.value) : null;
    
    // Get selected tags from toggles
    const selectedTags = [];
    form.querySelectorAll('.ct-tag-toggle.selected').forEach(btn => {
      selectedTags.push(btn.textContent);
    });

    const newContact = { fn, ln, bm, bd, by, tags: selectedTags };

    if (contact) {
      const idx = allContacts.findIndex(c => ctKey(c) === ctKey(contact));
      if (idx >= 0) allContacts[idx] = newContact;
    } else {
      allContacts.push(newContact);
    }

    ctSaveContacts(allContacts);
    modal.remove();
    ctInitView({});
  });

  // Field factory
  const mkField = (label, name, type = 'text', value = '') => {
    const div = document.createElement('div');
    div.style.marginBottom = '12px';
    const lbl = document.createElement('label');
    lbl.style.cssText = 'display:block;font-family:"DM Sans",sans-serif;font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;';
    lbl.textContent = label;
    div.appendChild(lbl);
    const inp = document.createElement('input');
    inp.type = type;
    inp.name = name;
    inp.value = value;
    inp.style.cssText = 'width:100%;padding:6px;border:1px solid var(--border);border-radius:4px;box-sizing:border-box;font-size:.85rem;';
    if (type === 'number') {
      inp.step = '1';
      if (name === 'bm') { inp.min = '1'; inp.max = '12'; }
      if (name === 'bd') { inp.min = '1'; inp.max = '31'; }
    }
    div.appendChild(inp);
    form.appendChild(div);
    return inp;
  };

  form.fn = mkField('Prénom', 'fn', 'text', contact?.fn || '');
  form.ln = mkField('Nom', 'ln', 'text', contact?.ln || '');
  form.bm = mkField('Anniversaire - Mois (1-12)', 'bm', 'number', contact?.bm || '');
  form.bd = mkField('Anniversaire - Jour (1-31)', 'bd', 'number', contact?.bd || '');
  form.by = mkField('Anniversaire - Année', 'by', 'number', contact?.by || '');

  // Tags picker (with toggle buttons)
  const tagsDiv = document.createElement('div');
  tagsDiv.style.cssText = 'display:flex;flex-direction:column;gap:5px;margin-bottom:16px;';
  const tagsLabel = document.createElement('label');
  tagsLabel.style.cssText = 'font-family:"DM Sans",sans-serif;font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;';
  tagsLabel.textContent = 'Tags';
  tagsDiv.appendChild(tagsLabel);

  const picker = document.createElement('div');
  picker.className = 'ct-tags-picker';
  picker.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
  
  const curTags = contact?.tags || [];
  groups.forEach(g => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ct-tag-toggle' + (curTags.includes(g) ? ' selected' : '');
    btn.textContent = g;
    btn.style.cssText = `
      padding:4px 12px;border-radius:16px;border:1.5px solid var(--border);
      background:var(--surface);color:var(--text);
      font-family:"DM Sans",sans-serif;font-size:.78rem;cursor:pointer;transition:all .12s;
      ${curTags.includes(g) ? `background:${ctTagColor(g, groups)};color:white;border-color:transparent;font-weight:600;` : ''}
    `;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('selected');
      const col = ctTagColor(g, groups);
      if (btn.classList.contains('selected')) {
        btn.style.background = col;
        btn.style.color = 'white';
        btn.style.borderColor = 'transparent';
        btn.style.fontWeight = '600';
      } else {
        btn.style.background = 'var(--surface)';
        btn.style.color = 'var(--text)';
        btn.style.borderColor = 'var(--border)';
        btn.style.fontWeight = 'normal';
      }
    });
    picker.appendChild(btn);
  });

  tagsDiv.appendChild(picker);
  form.appendChild(tagsDiv);

  // Buttons
  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display:flex;gap:8px;margin-top:16px;';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.textContent = contact ? 'Mettre à jour' : 'Créer';
  saveBtn.style.cssText = 'flex:1;padding:8px;background:var(--accent);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:500;';
  btnGroup.appendChild(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Annuler';
  cancelBtn.style.cssText = 'flex:1;padding:8px;background:#ddd;border:none;border-radius:4px;cursor:pointer';
  cancelBtn.addEventListener('click', () => modal.remove());
  btnGroup.appendChild(cancelBtn);

  form.appendChild(btnGroup);
  content.appendChild(form);
  modal.appendChild(content);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);
  form.fn.focus();
}

/**
 * Show groups/tags management modal
 */
function ctShowGroupsModal() {
  console.log('⚙️ Groups modal');
  const groups = ctLoadGroups();

  const modal = document.createElement('div');
  modal.id = 'ctGrpModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:center;justify-content:center;';

  const content = document.createElement('div');
  content.style.cssText = 'background:white;padding:24px;border-radius:8px;max-width:400px;width:90%;max-height:70vh;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,.15);';

  const title = document.createElement('h2');
  title.textContent = 'Gérer les Tags';
  title.style.marginBottom = '16px';
  content.appendChild(title);

  const list = document.createElement('div');
  list.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:16px;';

  groups.forEach((g, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;align-items:center;';

    const badge = document.createElement('span');
    badge.style.cssText = `width:12px;height:12px;border-radius:50%;background:${ctTagColor(g, groups)};flex-shrink:0;`;
    row.appendChild(badge);

    const name = document.createElement('span');
    name.textContent = g;
    name.style.flex = '1';
    row.appendChild(name);

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.style.cssText = 'padding:4px 8px;background:#fee;border:1px solid #f99;border-radius:4px;cursor:pointer;color:#c33;font-size:.85rem;';
    delBtn.addEventListener('click', () => {
      if (confirm(`Supprimer le tag "${g}" ?`)) {
        const updated = groups.filter((x, i) => i !== idx);
        ctSaveGroups(updated);
        modal.remove();
        ctShowGroupsModal();
      }
    });
    row.appendChild(delBtn);

    list.appendChild(row);
  });

  content.appendChild(list);

  // Add new tag
  const addForm = document.createElement('form');
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTag = addForm.newTag.value.trim();
    if (newTag && !groups.includes(newTag)) {
      groups.push(newTag);
      groups.sort();
      ctSaveGroups(groups);
      modal.remove();
      ctShowGroupsModal();
    }
  });

  const addLabel = document.createElement('label');
  addLabel.style.cssText = 'display:block;font-size:.75rem;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:4px;';
  addLabel.textContent = 'Ajouter un tag';
  addForm.appendChild(addLabel);

  const addInput = document.createElement('input');
  addInput.type = 'text';
  addInput.name = 'newTag';
  addInput.placeholder = 'Nouveau tag…';
  addInput.style.cssText = 'width:100%;padding:6px;border:1px solid var(--border);border-radius:4px;box-sizing:border-box;margin-bottom:8px;';
  addForm.appendChild(addInput);

  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = 'Ajouter';
  addBtn.style.cssText = 'width:100%;padding:8px;background:var(--accent);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:500;';
  addForm.appendChild(addBtn);

  content.appendChild(addForm);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Fermer';
  closeBtn.style.cssText = 'width:100%;padding:8px;background:#ddd;border:none;border-radius:4px;cursor:pointer;margin-top:8px;';
  closeBtn.addEventListener('click', () => modal.remove());
  content.appendChild(closeBtn);

  modal.appendChild(content);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);
  addInput.focus();
}

/**
 * Export birthday building function
 */
export function ctBuildBirthdayLabel(contact, year) {
  if (!contact.bm || !contact.bd) return null;

  const today = new Date();
  const birthDate = new Date(year, contact.bm - 1, contact.bd);

  if (birthDate < today) {
    birthDate.setFullYear(year + 1);
  }

  const daysUntil = Math.ceil((birthDate - today) / (1000 * 60 * 60 * 24));

  if (daysUntil === 0) {
    return '🎂 Aujourd\'hui!';
  } else if (daysUntil === 1) {
    return '🎂 Demain!';
  } else if (daysUntil <= 7) {
    return `🎂 Dans ${daysUntil}j`;
  }

  return null;
}

/**
 * Get birthdays for a specific day
 */
export function ctGetBirthdaysForDay(contacts, month, day) {
  return contacts.filter(c => c.bm === month && c.bd === day);
}

