/**
 * CONTACTS VIEW
 * Displays searchable contact table with birthday highlighting
 */

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

  const contactView = document.getElementById('contactsView');
  if (!contactView) return;

  contactView.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'ct-header';
  const title = document.createElement('div');
  title.className = 'ct-title';
  title.textContent = '👥 Contacts';
  header.appendChild(title);

  const addBtn = document.createElement('button');
  addBtn.className = 'ct-add-btn';
  addBtn.textContent = '+ Nouveau';
  addBtn.addEventListener('click', () => {
    if (onContactAdd) onContactAdd();
  });
  header.appendChild(addBtn);
  contactView.appendChild(header);

  // Content
  const content = document.createElement('div');
  content.className = 'ct-content';

  // Filters (group pills)
  ctRenderPills(content, contacts, selectedGroup, onGroupFilter);

  // Table
  ctRenderBody(content, contacts, selectedGroup, onContactSelect);

  // Pager
  ctRenderPager(content, contacts, selectedGroup);

  contactView.appendChild(content);
}

/**
 * Render group filter pills
 */
function ctRenderPills(container, contacts, selectedGroup, onGroupFilter) {
  const pillsDiv = document.createElement('div');
  pillsDiv.className = 'ct-pills';

  const groups = getGroupsFromContacts(contacts);

  // "All" pill
  const allPill = document.createElement('button');
  allPill.className = 'ct-pill' + (selectedGroup === 'all' ? ' active' : '');
  allPill.textContent = `Tous (${contacts.length})`;
  allPill.addEventListener('click', () => {
    if (onGroupFilter) onGroupFilter('all');
  });
  pillsDiv.appendChild(allPill);

  // Group pills
  groups.forEach(group => {
    const count = contacts.filter(c => c.group === group).length;
    const pill = document.createElement('button');
    pill.className = 'ct-pill' + (selectedGroup === group ? ' active' : '');
    pill.textContent = `${group} (${count})`;
    pill.addEventListener('click', () => {
      if (onGroupFilter) onGroupFilter(group);
    });
    pillsDiv.appendChild(pill);
  });

  container.appendChild(pillsDiv);
}

/**
 * Render contacts table
 */
function ctRenderBody(container, contacts, selectedGroup, onContactSelect) {
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'ct-body';

  // Search box
  const searchDiv = document.createElement('div');
  searchDiv.className = 'ct-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = '🔍 Rechercher...';
  searchInput.className = 'ct-search-input';
  searchDiv.appendChild(searchInput);
  bodyDiv.appendChild(searchDiv);

  // Filtered contacts
  let filtered = contacts;
  if (selectedGroup !== 'all') {
    filtered = filtered.filter(c => c.group === selectedGroup);
  }

  // Sort by last name
  filtered = filtered.sort((a, b) => {
    const aLast = (a.name || '').split(' ').pop();
    const bLast = (b.name || '').split(' ').pop();
    return aLast.localeCompare(bLast);
  });

  // Search filter
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    Array.from(bodyDiv.querySelectorAll('.ct-row')).forEach(row => {
      const name = row.querySelector('.ct-name').textContent.toLowerCase();
      const email = row.querySelector('.ct-email').textContent.toLowerCase();
      const show = name.includes(term) || email.includes(term);
      row.style.display = show ? '' : 'none';
    });
  });

  // Table
  const table = document.createElement('div');
  table.className = 'ct-table';

  filtered.forEach(contact => {
    const row = document.createElement('div');
    row.className = 'ct-row';
    row.addEventListener('click', () => {
      if (onContactSelect) onContactSelect(contact);
    });

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'ct-avatar';
    avatar.textContent = getInitials(contact.name);
    avatar.style.background = getAvatarColor(contact.name);
    row.appendChild(avatar);

    // Info
    const info = document.createElement('div');
    info.className = 'ct-info';

    const name = document.createElement('div');
    name.className = 'ct-name';
    name.textContent = contact.name;
    info.appendChild(name);

    const email = document.createElement('div');
    email.className = 'ct-email';
    email.textContent = contact.email || 'N/A';
    info.appendChild(email);

    // Birthday badge
    if (contact.birthday) {
      const label = ctBuildBirthdayLabel(contact, new Date().getFullYear());
      if (label) {
        const badge = document.createElement('span');
        badge.className = 'ct-birthday-badge';
        badge.textContent = label;
        info.appendChild(badge);
      }
    }

    row.appendChild(info);
    table.appendChild(row);
  });

  bodyDiv.appendChild(table);
  container.appendChild(bodyDiv);
}

/**
 * Render pagination controls
 */
function ctRenderPager(container, contacts, selectedGroup) {
  const pagerDiv = document.createElement('div');
  pagerDiv.className = 'ct-pager';

  let filtered = contacts;
  if (selectedGroup !== 'all') {
    filtered = filtered.filter(c => c.group === selectedGroup);
  }

  const pages = Math.ceil(filtered.length / 10);
  pagerDiv.innerHTML = `<span>Page 1 / ${pages}</span>`;

  container.appendChild(pagerDiv);
}

/**
 * Build birthday label
 */
export function ctBuildBirthdayLabel(contact, year) {
  if (!contact.birthday) return null;

  const [day, month] = contact.birthday.split('/').map(Number);
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);

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
  return contacts.filter(c => {
    if (!c.birthday) return false;
    const [d, m] = c.birthday.split('/').map(Number);
    return d === day && m === month;
  });
}

/**
 * Helper: Get groups from contacts
 */
function getGroupsFromContacts(contacts) {
  const groups = new Set();
  contacts.forEach(c => {
    if (c.group) groups.add(c.group);
  });
  return Array.from(groups).sort();
}

/**
 * Helper: Get initials from name
 */
function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Helper: Get avatar background color from name
 */
function getAvatarColor(name) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  const hash = name.split('').reduce((h, c) => h + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
