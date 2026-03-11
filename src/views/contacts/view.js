/**
 * CONTACTS VIEW - Complete rewrite with full functionality
 * Displays searchable contact table with pagination, sorting, and filtering
 */

const CONTACTS_KEY = 'ap_contacts';
const CONTACTS_GROUPS_KEY = 'ap_contact_groups';
const CT_PAGE_SIZE = 15;

// View state variables
let ctCurrentPage = 1;
let ctTextFilter = '';
let ctTagFilter = '';
let ctSortField = 'ln';
let ctSortAsc = true;

/**
 * Load contacts from localStorage
 */
function ctLoadContacts() {
  const data = localStorage.getItem(CONTACTS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load contacts:', e);
    return [];
  }
}

/**
 * Save contacts to localStorage
 */
function ctSaveContacts(contacts) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  console.log('✅ Contacts saved to localStorage');
}

/**
 * Initialize contacts view
 * @param {Object} opts - Configuration options
 * @param {Array} opts.contacts - Array of contacts
 * @param {Function} opts.onContactSelect - Callback when contact selected
 * @param {Function} opts.onContactAdd - Callback to add new contact
 */
export function ctInitView(opts = {}) {
  const {
    contacts = [],
    selectedGroup = 'all',
    onContactSelect = null,
    onContactAdd = null,
    onGroupFilter = null
  } = opts;

  console.log('✅ ctInitView() called - loading contacts from localStorage');

  const contactView = document.getElementById('contactsView');
  if (!contactView) {
    console.error('❌ contactsView element not found!');
    return;
  }

  // Load from localStorage
  const allContacts = ctLoadContacts();
  console.log('📦 Contacts loaded from localStorage:', allContacts.length);

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
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'ct-search-input';
  searchInput.id = 'ctSearchInput';
  searchInput.placeholder = 'Rechercher…';
  searchInput.value = ctTextFilter;
  
  const clearBtn = document.createElement('button');
  clearBtn.className = 'ct-search-clear';
  clearBtn.textContent = '✕';
  clearBtn.title = 'Effacer';
  clearBtn.addEventListener('click', () => {
    ctTextFilter = '';
    searchInput.value = '';
    searchWrap.classList.remove('has-value');
    ctCurrentPage = 1;
    ctRenderTable(contactView, allContacts);
    searchInput.focus();
  });

  searchInput.addEventListener('input', (e) => {
    ctTextFilter = e.target.value;
    searchWrap.classList.toggle('has-value', !!ctTextFilter);
    ctCurrentPage = 1;
    ctRenderTable(contactView, allContacts);
  });

  if (ctTextFilter) searchWrap.classList.add('has-value');
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
  addBtn.textContent = '+ Ajouter';
  addBtn.addEventListener('click', () => {
    console.log('➕ Add contact button clicked');
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
  // TAG PILLS
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
 * Render tag filter pills
 */
function ctRenderPills(container, allContacts) {
  const pillsDiv = document.createElement('div');
  pillsDiv.className = 'ct-group-pills';

  const mkPill = (label, filterVal, count) => {
    const pill = document.createElement('button');
    pill.className = 'ct-group-pill' + (ctTagFilter === filterVal ? ' active' : '');
    pill.textContent = `${label} (${count})`;
    pill.addEventListener('click', () => {
      ctTagFilter = ctTagFilter === filterVal ? '' : filterVal;
      ctCurrentPage = 1;
      // Re-render pills and table
      const parent = container.querySelector('.ct-group-pills')?.parentElement || container;
      const oldPills = parent.querySelector('.ct-group-pills');
      if (oldPills) oldPills.remove();
      ctRenderPills(parent, allContacts);
      const oldTable = parent.querySelector('.ct-table-wrap');
      if (oldTable) oldTable.remove();
      ctRenderTable(parent, allContacts);
    });
    pillsDiv.appendChild(pill);
  };

  // "All" pill
  mkPill('Tous', '', allContacts.length);

  // Group pills
  const groups = new Set();
  allContacts.forEach(c => {
    if (c.tags) {
      (Array.isArray(c.tags) ? c.tags : []).forEach(t => groups.add(t));
    }
  });

  groups.forEach(group => {
    const count = allContacts.filter(c => c.tags && c.tags.includes(group)).length;
    mkPill(group, group, count);
  });

  // No-tag pill
  const noTag = allContacts.filter(c => !c.tags || c.tags.length === 0).length;
  if (noTag > 0) mkPill('Sans tag', '__none__', noTag);

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

  // Pager
  const pagerDiv = document.createElement('div');
  pagerDiv.className = 'ct-pager';

  const info = document.createElement('span');
  info.className = 'ct-pager-info';
  const s = total ? start + 1 : 0;
  const e = Math.min(end, total);
  info.textContent = total ? `${s}–${e} sur ${total}` : '0 contact';
  pagerDiv.appendChild(info);

  if (pages > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'ct-pager-btn';
    prevBtn.textContent = '‹ Précédent';
    prevBtn.disabled = ctCurrentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (ctCurrentPage > 1) {
        ctCurrentPage--;
        ctRenderTable(container, allContacts);
      }
    });
    pagerDiv.appendChild(prevBtn);

    const pageInfo = document.createElement('span');
    pageInfo.textContent = ` Page ${ctCurrentPage}/${pages} `;
    pagerDiv.appendChild(pageInfo);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'ct-pager-btn';
    nextBtn.textContent = 'Suivant ›';
    nextBtn.disabled = ctCurrentPage === pages;
    nextBtn.addEventListener('click', () => {
      if (ctCurrentPage < pages) {
        ctCurrentPage++;
        ctRenderTable(container, allContacts);
      }
    });
    pagerDiv.appendChild(nextBtn);
  }

  container.appendChild(pagerDiv);
}

/**
 * Show contact modal for add/edit
 */
function ctShowContactModal(contact, allContacts) {
  console.log('📋 Showing contact modal for:', contact ? `${contact.fn} ${contact.ln}` : 'new contact');
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'ct-modal';
  modal.id = 'contactModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  const content = document.createElement('div');
  content.className = 'ct-modal-content';
  content.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  `;

  const title = document.createElement('h2');
  title.textContent = contact ? `Modifier: ${contact.fn} ${contact.ln}` : 'Nouveau Contact';
  title.style.marginBottom = '16px';
  content.appendChild(title);

  // Form
  const form = document.createElement('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fn = form.fn.value.trim();
    const ln = form.ln.value.trim();
    const bm = form.bm.value ? Number(form.bm.value) : null;
    const bd = form.bd.value ? Number(form.bd.value) : null;
    const by = form.by.value ? Number(form.by.value) : null;
    const tags = form.tags.value.split(',').map(t => t.trim()).filter(t => t);

    const newContact = { fn, ln, bm, bd, by, tags };

    if (contact) {
      // Edit
      const idx = allContacts.findIndex(c => ctKey(c) === ctKey(contact));
      if (idx >= 0) allContacts[idx] = newContact;
    } else {
      // Add
      allContacts.push(newContact);
    }
    
    ctSaveContacts(allContacts);
    modal.remove();
    ctInitView({});
  });

  // First name
  const fnGroup = document.createElement('div');
  fnGroup.style.marginBottom = '12px';
  const fnLabel = document.createElement('label');
  fnLabel.textContent = 'Prénom:';
  fnLabel.style.display = 'block';
  fnLabel.style.marginBottom = '4px';
  fnLabel.style.fontWeight = '500';
  const fnInput = document.createElement('input');
  fnInput.type = 'text';
  fnInput.name = 'fn';
  fnInput.value = contact?.fn || '';
  fnInput.style.width = '100%';
  fnInput.style.padding = '6px';
  fnInput.style.border = '1px solid var(--border)';
  fnInput.style.borderRadius = '4px';
  fnInput.style.boxSizing = 'border-box';
  fnGroup.appendChild(fnLabel);
  fnGroup.appendChild(fnInput);
  form.appendChild(fnGroup);

  // Last name
  const lnGroup = document.createElement('div');
  lnGroup.style.marginBottom = '12px';
  const lnLabel = document.createElement('label');
  lnLabel.textContent = 'Nom:';
  lnLabel.style.display = 'block';
  lnLabel.style.marginBottom = '4px';
  lnLabel.style.fontWeight = '500';
  const lnInput = document.createElement('input');
  lnInput.type = 'text';
  lnInput.name = 'ln';
  lnInput.value = contact?.ln || '';
  lnInput.style.width = '100%';
  lnInput.style.padding = '6px';
  lnInput.style.border = '1px solid var(--border)';
  lnInput.style.borderRadius = '4px';
  lnInput.style.boxSizing = 'border-box';
  lnGroup.appendChild(lnLabel);
  lnGroup.appendChild(lnInput);
  form.appendChild(lnGroup);

  // Birthday month
  const bmGroup = document.createElement('div');
  bmGroup.style.marginBottom = '12px';
  const bmLabel = document.createElement('label');
  bmLabel.textContent = 'Anniversaire - Mois (1-12):';
  bmLabel.style.display = 'block';
  bmLabel.style.marginBottom = '4px';
  bmLabel.style.fontWeight = '500';
  const bmInput = document.createElement('input');
  bmInput.type = 'number';
  bmInput.name = 'bm';
  bmInput.min = '1';
  bmInput.max = '12';
  bmInput.value = contact?.bm || '';
  bmInput.style.width = '100%';
  bmInput.style.padding = '6px';
  bmInput.style.border = '1px solid var(--border)';
  bmInput.style.borderRadius = '4px';
  bmInput.style.boxSizing = 'border-box';
  bmGroup.appendChild(bmLabel);
  bmGroup.appendChild(bmInput);
  form.appendChild(bmGroup);

  // Birthday day
  const bdGroup = document.createElement('div');
  bdGroup.style.marginBottom = '12px';
  const bdLabel = document.createElement('label');
  bdLabel.textContent = 'Anniversaire - Jour (1-31):';
  bdLabel.style.display = 'block';
  bdLabel.style.marginBottom = '4px';
  bdLabel.style.fontWeight = '500';
  const bdInput = document.createElement('input');
  bdInput.type = 'number';
  bdInput.name = 'bd';
  bdInput.min = '1';
  bdInput.max = '31';
  bdInput.value = contact?.bd || '';
  bdInput.style.width = '100%';
  bdInput.style.padding = '6px';
  bdInput.style.border = '1px solid var(--border)';
  bdInput.style.borderRadius = '4px';
  bdInput.style.boxSizing = 'border-box';
  bdGroup.appendChild(bdLabel);
  bdGroup.appendChild(bdInput);
  form.appendChild(bdGroup);

  // Birthday year
  const byGroup = document.createElement('div');
  byGroup.style.marginBottom = '12px';
  const byLabel = document.createElement('label');
  byLabel.textContent = 'Anniversaire - Année (optionnel):';
  byLabel.style.display = 'block';
  byLabel.style.marginBottom = '4px';
  byLabel.style.fontWeight = '500';
  const byInput = document.createElement('input');
  byInput.type = 'number';
  byInput.name = 'by';
  byInput.value = contact?.by || '';
  byInput.style.width = '100%';
  byInput.style.padding = '6px';
  byInput.style.border = '1px solid var(--border)';
  byInput.style.borderRadius = '4px';
  byInput.style.boxSizing = 'border-box';
  byGroup.appendChild(byLabel);
  byGroup.appendChild(byInput);
  form.appendChild(byGroup);

  // Tags
  const tagsGroup = document.createElement('div');
  tagsGroup.style.marginBottom = '16px';
  const tagsLabel = document.createElement('label');
  tagsLabel.textContent = 'Tags (séparés par des virgules):';
  tagsLabel.style.display = 'block';
  tagsLabel.style.marginBottom = '4px';
  tagsLabel.style.fontWeight = '500';
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.name = 'tags';
  tagsInput.value = (contact?.tags || []).join(', ');
  tagsInput.style.width = '100%';
  tagsInput.style.padding = '6px';
  tagsInput.style.border = '1px solid var(--border)';
  tagsInput.style.borderRadius = '4px';
  tagsInput.style.boxSizing = 'border-box';
  tagsGroup.appendChild(tagsLabel);
  tagsGroup.appendChild(tagsInput);
  form.appendChild(tagsGroup);

  // Buttons
  const btnGroup = document.createElement('div');
  btnGroup.style.display = 'flex';
  btnGroup.style.gap = '8px';
  btnGroup.style.marginTop = '16px';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.textContent = contact ? 'Mettre à jour' : 'Créer';
  saveBtn.style.flex = '1';
  saveBtn.style.padding = '8px';
  saveBtn.style.background = 'var(--accent)';
  saveBtn.style.color = 'white';
  saveBtn.style.border = 'none';
  saveBtn.style.borderRadius = '4px';
  saveBtn.style.cursor = 'pointer';
  saveBtn.style.fontWeight = '500';
  btnGroup.appendChild(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Annuler';
  cancelBtn.style.flex = '1';
  cancelBtn.style.padding = '8px';
  cancelBtn.style.background = '#ddd';
  cancelBtn.style.border = 'none';
  cancelBtn.style.borderRadius = '4px';
  cancelBtn.style.cursor = 'pointer';
  cancelBtn.addEventListener('click', () => modal.remove());
  btnGroup.appendChild(cancelBtn);

  form.appendChild(btnGroup);
  content.appendChild(form);

  // Close on background click
  modal.appendChild(content);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);
  fnInput.focus();
}

/**
 * Show groups modal
 */
function ctShowGroupsModal() {
  console.log('⚙️ Showing groups modal');
  alert('Gestion des tags - À implémenter');
}

/**
 * Helper: Generate unique key for contact
 */
function ctKey(c) {
  return `${c.fn}|${c.ln}|${c.bm}-${c.bd}`;
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

