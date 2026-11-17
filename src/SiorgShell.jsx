import { useEffect, useRef, useState } from 'react';
import './siorg-shell.css';

const PORTAL = 'https://www.siorg.sp.gov.br';
const official = (path) => `${PORTAL}${path}`;
const navigation = [
  { label: 'Início', href: official('/siorg') },
  { label: 'Institucional', children: [
    { label: 'Sobre o SIORG', href: official('/siorg/siorg/Sobre%20o%20Siorg') },
    { label: 'QGCFC', href: official('/siorg/siorg/qgcfc') },
    { label: 'Edital de seleção', href: official('/siorg/siorg/edital-de-sele%C3%A7%C3%A3o') },
  ] },
  { label: 'Legislação', href: official('/siorg/legislacao') },
  { label: 'Novas Estruturas', href: '/novas-estruturas', local: true, section: 'estruturas' },
  { label: 'Produtos', section: 'produtos', children: [
    { label: 'Material instrucional', href: official('/siorg/produtos/materail%20Instrucional') },
    { label: 'Modelos de documentos', href: official('/siorg/produtos/Modelos%20de%20Documentos') },
    { label: 'Simulador de Reestruturação', href: '#calculadora', local: true },
    { label: 'Calculadora de Cotas', href: '#resultados', local: true },
  ] },
  { label: 'Transparência', href: official('/siorg/transparencia') },
  { label: 'Canais de comunicação', children: [
    { label: 'Fale conosco', href: official('/siorg/Canais%20de%20comunica%C3%A7%C3%A3o/fale%20conosco') },
    { label: 'Perguntas frequentes', href: official('/siorg/Canais%20de%20comunica%C3%A7%C3%A3o/perguntas%20frequentes%20-%20faq') },
    { label: 'Ouvidoria', href: 'https://www.ouvidoria.sp.gov.br/Portal/Default.aspx' },
    { label: 'Fale com o SIORG', href: official('/siorg/Canais%20de%20comunica%C3%A7%C3%A3o/fale-conosco-siorg') },
  ] },
];

function Icon({ code, className = '' }) {
  return <i className={`fa ${className}`} aria-hidden="true">{String.fromCodePoint(code)}</i>;
}

function PortalLink({ item, onClick, className, current = false }) {
  return <a
    href={item.href}
    className={className}
    target={item.local ? undefined : '_blank'}
    rel={item.local ? undefined : 'noopener noreferrer'}
    aria-current={current ? 'page' : undefined}
    onClick={onClick}
  >{item.label}</a>;
}

export function SiorgShell({ children, currentSection = 'produtos', contentId = 'calculadora' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [fontLevel, setFontLevel] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [librasOpen, setLibrasOpen] = useState(false);
  const navRef = useRef(null);
  const navButtons = useRef({});
  const mobileButtonRef = useRef(null);
  const accessibilityRef = useRef(null);
  const accessibilityButtonRef = useRef(null);
  const librasDialogRef = useRef(null);
  const librasButtonRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('siorg-font-large', fontLevel === 1);
    root.classList.toggle('siorg-font-largest', fontLevel === 2);
    root.classList.toggle('siorg-high-contrast', highContrast);
    root.classList.toggle('siorg-highlight-links', highlightLinks);
    return () => {
      root.classList.remove('siorg-font-large', 'siorg-font-largest', 'siorg-high-contrast', 'siorg-highlight-links');
    };
  }, [fontLevel, highContrast, highlightLinks]);

  useEffect(() => {
    const dismissOutside = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setOpenMenu(null);
        setMobileOpen(false);
      }
      if (!accessibilityRef.current?.contains(event.target)) setAccessibilityOpen(false);
    };
    const dismissWithEscape = (event) => {
      if (event.key !== 'Escape' || librasOpen) return;
      if (accessibilityOpen) {
        setAccessibilityOpen(false);
        accessibilityButtonRef.current?.focus();
      } else if (openMenu !== null) {
        setOpenMenu(null);
        navButtons.current[openMenu]?.focus();
      } else if (mobileOpen) {
        setMobileOpen(false);
        mobileButtonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('keydown', dismissWithEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('keydown', dismissWithEscape);
    };
  }, [openMenu, mobileOpen, accessibilityOpen, librasOpen]);

  useEffect(() => {
    const dialog = librasDialogRef.current;
    if (librasOpen && !dialog.open) dialog.showModal();
    if (!librasOpen && dialog.open) dialog.close();
  }, [librasOpen]);

  const closeNavigation = (event, item) => {
    setOpenMenu(null);
    setMobileOpen(false);
    if (!item?.local || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const focusContent = (id) => {
      const target = document.getElementById(id);
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      return Boolean(target);
    };
    if (item.href?.startsWith('#')) {
      if (focusContent(item.href.slice(1))) event.preventDefault();
      return;
    }
    // Only the two prototype pages use client-side navigation. Assets, original
    // model downloads and official portal destinations keep native navigation.
    if (!['/novas-estruturas', '/#calculadora', '/#resultados'].includes(item.href)) return;
    event.preventDefault();
    if (item.href === '/novas-estruturas' && currentSection === 'estruturas') {
      focusContent(contentId);
      return;
    }
    if (item.href.startsWith('/#') && currentSection === 'produtos') {
      focusContent(item.href.slice(2));
      return;
    }
    window.history.pushState(null, '', item.href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const enterDropdown = (event, index) => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    setOpenMenu(index);
    requestAnimationFrame(() => {
      document.getElementById(`siorg-submenu-${index}`)?.querySelector('a')?.focus();
    });
  };

  const resetAccessibility = () => {
    setFontLevel(0);
    setHighContrast(false);
    setHighlightLinks(false);
  };

  const footerLinks = [
    { label: 'Fala SP', href: 'https://fala.sp.gov.br' },
    { label: 'Transparência', href: 'http://www.transparencia.sp.gov.br/' },
    { label: 'Termo de Uso', href: 'https://www.cms.sp.gov.br/cms/termo-uso' },
    { label: 'Política de Privacidade', href: 'https://www.cms.sp.gov.br/cms/politica-privacidade' },
  ];

  return <div className="siorg-shell">
    <a className="siorg-skip-link" href={`#${contentId}`} onClick={(event) => closeNavigation(event, { local: true, href: `#${contentId}` })}>Ir para o conteúdo</a>

    <header className="siorg-header">
      <a className="siorg-mobile-government" href="https://www.saopaulo.sp.gov.br/" target="_blank" rel="noopener noreferrer">SP.GOV.BR</a>
      <div className="siorg-shell-container siorg-brand-row">
        <a className="siorg-brand" href={official('/siorg')} target="_blank" rel="noopener noreferrer" aria-label="SIORG — abrir portal oficial">
          <img className="siorg-logo" src="/assets/siorg-logo.png" width="170" height="75" alt="SIORG" />
        </a>
        <a className="siorg-government" href="https://www.saopaulo.sp.gov.br/" target="_blank" rel="noopener noreferrer" aria-label="Governo do Estado de São Paulo — abrir portal oficial">
          <img className="siorg-gov-dark" src="/assets/governo-light.svg" width="165" height="107" alt="Governo do Estado de São Paulo" />
          <img className="siorg-gov-light" src="/assets/governo-dark.svg" width="165" height="107" alt="Governo do Estado de São Paulo" />
        </a>
      </div>
      <nav className="siorg-navigation" aria-label="Navegação principal" ref={navRef}>
        <div className="siorg-shell-container siorg-nav-inner">
          <button
            className="siorg-nav-toggle"
            type="button"
            aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileOpen}
            aria-controls="siorg-navigation-list"
            ref={mobileButtonRef}
            onClick={() => { setMobileOpen(!mobileOpen); setOpenMenu(null); }}
          ><Icon code={0xf0c9} /></button>
          <ul id="siorg-navigation-list" className={`siorg-nav-list${mobileOpen ? ' is-open' : ''}`}>
            {navigation.map((item, index) => <li className="siorg-nav-item" key={item.label}>
              {item.children ? <>
                <button
                  className={`siorg-nav-link${item.section === currentSection ? ' is-current' : ''}`}
                  type="button"
                  aria-current={item.section === currentSection ? 'page' : undefined}
                  aria-expanded={openMenu === index}
                  aria-controls={`siorg-submenu-${index}`}
                  ref={(node) => { navButtons.current[index] = node; }}
                  onClick={() => setOpenMenu(openMenu === index ? null : index)}
                  onKeyDown={(event) => enterDropdown(event, index)}
                >{item.label}<Icon code={0xf078} className="siorg-chevron" /></button>
                <ul id={`siorg-submenu-${index}`} className="siorg-dropdown" hidden={openMenu !== index}>
                  {item.children.map((link) => {
                    const destination = link.local && link.href.startsWith('#') && currentSection !== 'produtos'
                      ? { ...link, href: `/${link.href}` } : link;
                    return <li key={link.label}>
                      <PortalLink item={destination} onClick={(event) => closeNavigation(event, destination)} />
                    </li>;
                  })}
                </ul>
              </> : <PortalLink item={item} className={`siorg-nav-link${item.section === currentSection ? ' is-current' : ''}`} current={item.section === currentSection} onClick={(event) => closeNavigation(event, item)} />}
            </li>)}
          </ul>
        </div>
      </nav>
    </header>

    <main id={contentId} className="siorg-main" tabIndex={-1}>{children}</main>

    <footer className="siorg-footer">
      <div className="siorg-shell-container">
        <nav aria-label="Links institucionais do rodapé">
          <ul className="siorg-footer-links">
            {footerLinks.map((link) => <li key={link.label}>
              <PortalLink item={link} />
            </li>)}
          </ul>
        </nav>
        <div className="siorg-footer-bottom">
          <a href="https://www.saopaulo.sp.gov.br/" target="_blank" rel="noopener noreferrer" aria-label="Governo do Estado de São Paulo — abrir portal oficial">
            <img className="siorg-footer-logo" src="/assets/governo-dark.svg" width="165" height="107" alt="Governo do Estado de São Paulo" />
          </a>
          <p className="siorg-footer-caption">{import.meta.env.DEV ? 'Protótipo local para validação' : 'Protótipo para avaliação'} · Layout de referência: SIORG / CMS.SP.GOV.BR</p>
          <p className="siorg-footer-reference">Esta versão usa a identidade visual do portal SIORG como referência para a avaliação {currentSection === 'estruturas' ? 'da linha do tempo de Novas Estruturas.' : 'do Simulador de Reestruturação e da Calculadora de Cotas.'}</p>
        </div>
      </div>
    </footer>

    <div className="siorg-a11y-rail" ref={accessibilityRef}>
      <button
        className="siorg-assistive-button"
        type="button"
        aria-label={accessibilityOpen ? 'Fechar opções de acessibilidade' : 'Abrir opções de acessibilidade'}
        aria-expanded={accessibilityOpen}
        aria-controls="siorg-accessibility-panel"
        ref={accessibilityButtonRef}
        onClick={() => setAccessibilityOpen(!accessibilityOpen)}
      ><img src="/assets/acessibilidade.png" width="40" height="40" alt="" /></button>
      <section id="siorg-accessibility-panel" className="siorg-a11y-panel" aria-label="Opções de acessibilidade" hidden={!accessibilityOpen}>
        <h2>Acessibilidade</h2>
        <button type="button" disabled={fontLevel === 2} onClick={() => setFontLevel((value) => Math.min(2, value + 1))}>Aumentar fonte<Icon code={0xf067} /></button>
        <button type="button" disabled={fontLevel === 0} onClick={() => setFontLevel((value) => Math.max(0, value - 1))}>Diminuir fonte<Icon code={0xf068} /></button>
        <p className="siorg-a11y-size" aria-live="polite">Tamanho do texto: {[100, 112.5, 125][fontLevel].toLocaleString('pt-BR')}%</p>
        <div className="siorg-a11y-divider">
          <button type="button" aria-pressed={highContrast} onClick={() => setHighContrast(!highContrast)}>Alto contraste{highContrast && <Icon code={0xf00c} />}</button>
          <button type="button" aria-pressed={highlightLinks} onClick={() => setHighlightLinks(!highlightLinks)}>Destacar links{highlightLinks && <Icon code={0xf00c} />}</button>
          <button type="button" onClick={resetAccessibility}>Restaurar padrão</button>
          <button type="button" onClick={() => { setAccessibilityOpen(false); accessibilityButtonRef.current?.focus(); }}>Fechar opções</button>
        </div>
      </section>
    </div>

    <button className="siorg-assistive-button siorg-libras-button" type="button" ref={librasButtonRef} aria-label="Informações sobre tradução em Libras" aria-haspopup="dialog" onClick={() => { setAccessibilityOpen(false); setLibrasOpen(true); }}>
      <img src="/assets/vlibras.svg" width="40" height="40" alt="" />
    </button>
    <dialog
      className="siorg-libras-dialog"
      ref={librasDialogRef}
      aria-labelledby="siorg-libras-title"
      onCancel={() => setLibrasOpen(false)}
      onClose={() => { setLibrasOpen(false); librasButtonRef.current?.focus(); }}
      onClick={(event) => { if (event.target === event.currentTarget) setLibrasOpen(false); }}
    >
      <button className="siorg-dialog-close" type="button" aria-label="Fechar informações de Libras" onClick={() => setLibrasOpen(false)}><Icon code={0xf00d} /></button>
      <h2 id="siorg-libras-title">Tradução em Libras</h2>
      <p>O portal oficial do SIORG oferece o recurso VLibras. A tradução ainda não está integrada a este protótipo.</p>
      <p><a href={official('/siorg')} target="_blank" rel="noopener noreferrer">Acessar o portal oficial do SIORG</a></p>
      <button className="siorg-dialog-dismiss" type="button" onClick={() => setLibrasOpen(false)}>Entendi</button>
    </dialog>
  </div>;
}

export default SiorgShell;
