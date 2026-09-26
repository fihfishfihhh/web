const state = { data: null, adminView: 'levels' };
const levelList = document.querySelector('#level-list');
const memberGrid = document.querySelector('#member-grid');
const onboarding = document.querySelector('#onboarding');
const levelModal = document.querySelector('#level-modal');
const adminPanel = document.querySelector('#admin-panel');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function appendDetail(parent, label, value) {
  const detail = element('div', 'detail');
  detail.append(element('p', 'detail-label', label), element('p', 'detail-value', value || '—'));
  parent.append(detail);
}

function renderLevels() {
  levelList.replaceChildren();
  state.data.levels.forEach(level => {
    const card = element('button', 'level-card');
    card.type = 'button';
    card.append(element('span', 'level-rank', String(level.rank).padStart(2, '0')));
    const identity = element('div');
    identity.append(element('div', 'level-name', level.name), element('span', 'mono', `ID ${level.id}`));
    card.append(identity);
    appendDetail(card, 'Verifier', level.verifier);
    appendDetail(card, level.reward ? 'Reward' : 'List note', level.reward || level.note);
    card.append(element('span', 'play', '↗'));
    card.addEventListener('click', () => openLevel(level));
    levelList.append(card);
  });
}

function renderMembers() {
  memberGrid.replaceChildren();
  state.data.players.forEach(player => {
    const tone = player.role === 'Admin' ? 'admin' : player.role === 'Moderator' ? 'mod' : '';
    const card = element('article', `member ${tone}`);
    card.append(element('span', 'member-role', player.role), element('h3', '', player.name), element('p', '', player.gameUsername));
    if (player.profileLabel) card.append(element('p', '', player.profileLabel));
    memberGrid.append(card);
  });
}

function openLevel(level) {
  const content = document.querySelector('#level-modal-content');
  content.replaceChildren();
  const rank = element('p', 'eyebrow', `Official Fish List · Top ${level.rank}`);
  const title = element('h2', '', level.name);
  const id = element('p', 'modal-id', `LEVEL ID ${level.id}`);
  const records = element('div', 'modal-records');
  [['Verifier', level.verifier], [level.reward ? 'Reward role' : 'List note', level.reward || level.note || '—']].forEach(([label, value]) => {
    const record = element('div'); record.append(element('span', '', label), element('strong', '', value)); records.append(record);
  });
  const video = element('a', 'modal-video', 'Watch verification ↗');
  video.href = level.video; video.target = '_blank'; video.rel = 'noreferrer';
  content.append(rank, title, id, records, video);
  levelModal.showModal();
}

function adminRows(items, fields) {
  const table = element('div', 'admin-rows');
  items.forEach(item => {
    const row = element('div', 'admin-row');
    fields.forEach(field => row.append(element('span', '', item[field] || '—')));
    const actions = element('span', 'admin-actions');
    ['Edit', 'Delete'].forEach(label => { const action = element('button', '', label); action.type = 'button'; actions.append(action); });
    row.append(actions); table.append(row);
  });
  return table;
}

function renderAdmin() {
  const content = document.querySelector('#admin-content');
  content.replaceChildren();
  if (state.adminView === 'levels') {
    content.append(element('p', 'admin-description', 'Manage rank, level ID, verification ownership, reward roles, and custom video thumbnails.'), adminRows(state.data.levels, ['rank', 'name', 'id', 'verifier']));
  } else if (state.adminView === 'players') {
    content.append(element('p', 'admin-description', 'Manage player roles, permissions, profile records, and manual Fish List points.'), adminRows(state.data.players, ['name', 'role', 'gameUsername', 'hardest']));
  } else {
    content.append(element('p', 'admin-description', 'Collaboration controls are reserved for the next connected admin service.'), element('div', 'empty-state', 'No collab records are loaded.'));
  }
  const create = element('button', 'admin-create', `Create ${state.adminView.slice(0, -1)} +`);
  create.type = 'button'; content.append(create);
}

function setAdminView(view) {
  state.adminView = view;
  document.querySelectorAll('[data-admin-view]').forEach(tab => tab.classList.toggle('active', tab.dataset.adminView === view));
  renderAdmin();
}

document.querySelectorAll('[data-open-form]').forEach(button => button.addEventListener('click', () => onboarding.showModal()));
document.querySelector('[data-close-form]').addEventListener('click', () => onboarding.close());
document.querySelector('[data-close-level]').addEventListener('click', () => levelModal.close());
document.querySelector('#open-admin').addEventListener('click', () => { renderAdmin(); adminPanel.showModal(); });
document.querySelector('[data-close-admin]').addEventListener('click', () => adminPanel.close());
document.querySelectorAll('[data-admin-view]').forEach(tab => tab.addEventListener('click', () => setAdminView(tab.dataset.adminView)));
[onboarding, levelModal, adminPanel].forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));
document.querySelector('#profile-form').addEventListener('submit', event => { event.preventDefault(); const email = new FormData(event.currentTarget).get('email'); document.querySelector('#form-status').textContent = `Verification email prepared for ${email}.`; event.currentTarget.reset(); });

fetch('data/fih-community.json').then(response => {
  if (!response.ok) throw new Error('Data request failed');
  return response.json();
}).then(data => { state.data = data; renderLevels(); renderMembers(); }).catch(() => { levelList.textContent = 'Unable to load the official Fish List data.'; });
