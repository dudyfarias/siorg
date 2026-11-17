import { timelineCategories, timelines } from '../../src/data/timeline-catalog.mjs';

// Script Application entry: no portal framework, external scripts or storage.
const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const alphabet = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });
const organizations = timelineCategories.flatMap(category => category.organizations.map(org => ({
  ...org,
  context: [org.acronym, category.label].filter(Boolean).join(' · '),
  search: normalize([org.name, org.acronym, category.label].join(' ')),
}))).sort((a, b) => alphabet.compare(a.name, b.name) || alphabet.compare(a.id, b.id));

function el(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== undefined) element.setAttribute(key, value);
  }
  element.append(...children.filter(child => child != null));
  return element;
}

function dateText(date) {
  return date ? date.split('-').reverse().join('/') : 'Data em conferência';
}

function dateNode(date) {
  return date ? el('time', { datetime: date }, dateText(date)) : el('span', {}, dateText(date));
}

function publications(act) {
  return [
    act.publicationDate && el('p', { class: 'siorg-tl-publication' },
      act.republicationDate ? 'Publicação original em ' : 'Publicado em ', dateNode(act.publicationDate)),
    act.republicationDate && el('p', { class: 'siorg-tl-publication' },
      'Republicado em ', dateNode(act.republicationDate)),
  ];
}

function actBody(act) {
  const links = (act.sources || []).filter(({ url }) => url.startsWith('https://'));
  return [
    ...publications(act),
    act.summary && el('p', {}, act.summary),
    (act.statusLabel || act.statusDetail) && el('p', { class: 'siorg-tl-status' },
      act.statusLabel && el('strong', {}, act.statusLabel), act.statusDetail),
    links.length && el('div', { class: 'siorg-tl-sources' },
      ...links.map(source => el('a', {
        href: source.url, target: '_blank', rel: 'noopener noreferrer',
        'aria-label': source.label + ' — abre em nova aba',
      }, source.label))),
  ].filter(Boolean);
}

function relatedAct(act, heading) {
  return el('li', { class: 'siorg-tl-related-act' },
    el('p', { class: 'siorg-tl-meta' }, act.relationLabel || 'Ato relacionado'),
    el(heading, {}, act.title),
    el('p', { class: 'siorg-tl-meta' }, 'Data do ato: ', dateNode(act.actDate)),
    ...actBody(act));
}

function timelineGroup(group, prefix, expanded) {
  const article = el('article', { 'aria-labelledby': prefix + '-' + group.id },
    el('h4', { id: prefix + '-' + group.id }, group.title), ...actBody(group));
  if (group.related?.length) {
    const details = el('details', { 'data-group': group.id, class: 'siorg-tl-related' },
      el('summary', {}, group.related.length + (group.related.length === 1 ? ' ato relacionado' : ' atos relacionados')),
      el('ol', {}, ...group.related.map(act => relatedAct(act, 'h5'))));
    details.open = expanded.has(group.id);
    article.append(details);
  }
  return el('li', { class: 'siorg-tl-item' },
    el('div', { class: 'siorg-tl-date' }, el('span', {}, 'Data do ato'), dateNode(group.actDate)),
    article);
}

function mount(root) {
  let suffix = 1;
  while (document.getElementById('siorg-tl-title-' + suffix)) suffix++;
  const prefix = 'siorg-tl-' + suffix;
  const labelId = 'siorg-tl-title-' + suffix;
  let selection = organizations.find(org => org.id === 'sggd') || organizations[0];
  let query = '';
  let opened = false;
  let active = -1;
  let matches = organizations;

  const history = el('section', { 'aria-labelledby': prefix + '-org' });
  const order = el('select', { id: prefix + '-order' },
    el('option', { value: 'oldest' }, 'Mais antigos primeiro'),
    el('option', { value: 'newest' }, 'Mais recentes primeiro'));
  const input = el('input', {
    id: prefix + '-search', type: 'text', role: 'combobox',
    autocomplete: 'off', 'aria-autocomplete': 'list', 'aria-expanded': 'false',
    'aria-controls': prefix + '-list', 'aria-describedby': prefix + '-hint',
    placeholder: 'Digite o nome ou a sigla',
  });
  const toggle = el('button', {
    type: 'button', tabindex: '-1', class: 'siorg-tl-toggle', 'aria-expanded': 'false',
    'aria-controls': prefix + '-list', 'aria-label': 'Mostrar lista de órgãos e entidades',
  }, el('span', { 'aria-hidden': 'true' }, '⌄'));
  const list = el('ul', { role: 'listbox', id: prefix + '-list', 'aria-label': 'Órgãos e entidades em ordem alfabética' });
  const resultStatus = el('p', { role: 'status' });
  const popup = el('div', { class: 'siorg-tl-popup', hidden: '' }, list, resultStatus);

  function renderHistory(keepExpanded = false) {
    const data = timelines.get(selection.id);
    const restoreOrderFocus = document.activeElement === order;
    const expanded = new Set(keepExpanded
      ? Array.from(history.querySelectorAll('details[data-group][open]'), detail => detail.dataset.group)
      : []);
    const groups = [...data.groups].sort((a, b) => {
      const value = (a.actDate || a.publicationDate).localeCompare(b.actDate || b.publicationDate)
        || a.publicationDate.localeCompare(b.publicationDate) || alphabet.compare(a.title, b.title);
      return order.value === 'oldest' ? value : -value;
    });
    const groupList = el('ol', { class: 'siorg-tl-groups', 'aria-label': 'Linha do tempo: ' + selection.name },
      ...groups.map(group => timelineGroup(group, prefix, expanded)));
    const related = Array.from(groupList.querySelectorAll('details[data-group]'));
    const expand = el('button', { type: 'button', class: 'siorg-tl-expand' });
    const updateExpand = () => {
      expand.textContent = related.every(detail => detail.open)
        ? 'Recolher atos relacionados' : 'Expandir atos relacionados';
    };
    related.forEach(detail => detail.addEventListener('toggle', updateExpand));
    expand.addEventListener('click', () => {
      const openAll = !related.every(detail => detail.open);
      related.forEach(detail => { detail.open = openAll; });
      updateExpand();
    });
    updateExpand();
    const complement = data.complementaryActs?.length ? el('section', { class: 'siorg-tl-complement' },
      el('h3', {}, 'Regra geral relacionada'),
      el('ol', {}, ...data.complementaryActs.map(act => relatedAct(act, 'h4')))) : null;
    history.replaceChildren(
      el('h3', { id: prefix + '-org' }, selection.name),
      el('p', {}, 'As datas do ato e da publicação são exibidas separadamente.'),
      el('div', { class: 'siorg-tl-toolbar' }, el('p', {}, groups.length + (groups.length === 1 ? ' ato' : ' atos')),
        el('label', { for: order.id }, 'Ordenar por ', order), related.length ? expand : null),
      groupList,
      ...[complement].filter(Boolean),
      el('details', { class: 'siorg-tl-about' }, el('summary', {}, 'Sobre este levantamento'),
        el('p', {}, data.coverageNotice),
        el('p', {}, 'Fontes conferidas em ' + dateText(data.checkedAt) + '. Consulte o texto oficial para verificar os efeitos de cada ato.')));
    if (restoreOrderFocus) order.focus({ preventScroll: true });
  }

  function close() {
    opened = false;
    query = '';
    active = -1;
    input.value = selection.acronym ? selection.name + ' (' + selection.acronym + ')' : selection.name;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Mostrar lista de órgãos e entidades');
    popup.hidden = true;
  }

  function choose(org) {
    const changed = org.id !== selection.id;
    selection = org;
    close();
    if (changed) renderHistory();
  }

  function updateActive() {
    Array.from(list.children).forEach((option, index) => {
      option.classList.toggle('siorg-tl-active', index === active);
    });
    const row = list.children[active];
    if (!row) { input.removeAttribute('aria-activedescendant'); return; }
    input.setAttribute('aria-activedescendant', row.id);
    const option = row.getBoundingClientRect();
    const menu = list.getBoundingClientRect();
    if (option.top < menu.top) list.scrollTop -= menu.top - option.top;
    else if (option.bottom > menu.bottom) list.scrollTop += option.bottom - menu.bottom;
  }

  function show() {
    opened = true;
    const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
    matches = organizations.filter(org => terms.every(term => org.search.includes(term)));
    list.replaceChildren(...matches.map(org => {
      const option = el('li', {
        id: prefix + '-option-' + org.id, role: 'option', 'aria-selected': org.id === selection.id,
      }, el('span', {}, org.name), el('small', {}, org.context));
      option.addEventListener('mousedown', event => event.preventDefault());
      option.addEventListener('click', () => choose(org));
      return option;
    }));
    active = -1;
    list.scrollTop = 0;
    popup.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Recolher lista de órgãos e entidades');
    resultStatus.className = matches.length ? 'siorg-tl-sr' : 'siorg-tl-empty';
    resultStatus.textContent = matches.length
      ? matches.length + (matches.length === 1 ? ' opção encontrada' : ' opções encontradas')
      : 'Nenhum órgão ou entidade encontrado.';
    updateActive();
  }

  input.addEventListener('focus', () => input.select());
  input.addEventListener('click', () => { if (!opened) { input.select(); show(); } });
  input.addEventListener('input', () => { query = input.value; show(); });
  input.addEventListener('blur', close);
  toggle.addEventListener('mousedown', event => event.preventDefault());
  toggle.addEventListener('click', () => {
    input.focus();
    if (opened) close();
    else { input.select(); show(); }
  });
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!opened) show();
      if (!matches.length) return;
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      active = active < 0 ? (direction === 1 ? 0 : matches.length - 1)
        : (active + direction + matches.length) % matches.length;
      updateActive();
    } else if (event.key === 'Escape' && opened) {
      event.preventDefault();
      close();
    } else if (event.key === 'Enter' && opened) {
      event.preventDefault();
      const selected = matches[active] || (matches.length === 1 ? matches[0] : null);
      if (selected) choose(selected);
    }
  });
  order.addEventListener('change', () => renderHistory(true));
  close();
  renderHistory();
  root.setAttribute('aria-labelledby', labelId);
  root.replaceChildren(
    el('h2', { id: labelId }, 'Linha do tempo das reestruturações'),
    el('p', {}, 'Consulte os atos de ' + organizations.length + ' órgãos e entidades. A relação de documentos e organogramas continua disponível nesta página.'),
    el('div', { class: 'siorg-tl-selection' },
      el('label', { for: input.id }, 'Órgão ou entidade'),
      el('div', { class: 'siorg-tl-control' }, input, toggle, popup),
      el('small', { id: prefix + '-hint' }, 'Digite o nome ou a sigla do órgão ou entidade.')),
    history);
  root.dataset.siorgMounted = 'true';
}

function start() {
  document.querySelectorAll('[data-siorg-timeline]:not([data-siorg-mounted])').forEach(mount);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
