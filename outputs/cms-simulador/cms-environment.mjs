const realDocument = globalThis.document;
const realWindow = globalThis.window;
const localEvents = new EventTarget();
let shadow;
let container;
let currentHash = '';

function navigate(hash, focus = true) {
  currentHash = String(hash || '');
  localEvents.dispatchEvent(new Event('hashchange'));
  const id = decodeURIComponent(currentHash.replace(/^#/, ''));
  const target = shadow?.getElementById(id);
  if (target) {
    if (focus) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
}

const localLocation = new Proxy({}, {
  get(_, key) { return key === 'hash' ? currentHash : Reflect.get(realWindow.location, key, realWindow.location); },
  set(_, key, value) { if (key !== 'hash') throw new Error('Navegação externa não permitida pelo componente.'); navigate(value); return true; },
});

export const cmsWindow = new Proxy({}, {
  get(_, key) {
    if (key === 'location') return localLocation;
    if (key === 'addEventListener' || key === 'removeEventListener') {
      return (type, handler, options) => (type === 'hashchange' ? localEvents : realWindow)[key](type, handler, options);
    }
    if (key === 'localStorage') {
      const storage = realWindow.localStorage;
      return {
        getItem: key => storage.getItem(`siorg-cms:${key}`),
        setItem: (key, value) => storage.setItem(`siorg-cms:${key}`, value),
        removeItem: key => storage.removeItem(`siorg-cms:${key}`),
      };
    }
    const value = Reflect.get(realWindow, key, realWindow);
    return typeof value === 'function' ? value.bind(realWindow) : value;
  },
});

export const cmsDocument = new Proxy({}, {
  get(_, key) {
    if (key === 'getElementById') return id => shadow?.getElementById(id) ?? null;
    if (key === 'querySelector' || key === 'querySelectorAll') return selector => shadow[key](selector);
    if (key === 'activeElement') return shadow?.activeElement || realDocument.activeElement;
    if (key === 'body' || key === 'documentElement') return container;
    if (key === 'addEventListener' || key === 'removeEventListener') return (...args) => shadow[key](...args);
    const value = Reflect.get(realDocument, key, realDocument);
    return typeof value === 'function' ? value.bind(realDocument) : value;
  },
});

export function initializeEnvironment(root, mount, downloadModel) {
  shadow = root;
  container = mount;
  root.addEventListener('click', event => {
    const anchor = event.composedPath().find(node => node?.tagName === 'A');
    const href = anchor?.getAttribute('href');
    if (!href?.startsWith('#')) return;
    event.preventDefault();
    if (href === '#modelo-excel-sggd') { downloadModel(); return; }
    // These are component actions, never portal routes (including Ctrl-click).
    navigate(href, href !== '#dados-atuais' || !anchor.classList.contains('primary'));
  });
}
