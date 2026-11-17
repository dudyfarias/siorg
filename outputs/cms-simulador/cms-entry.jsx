import React from 'react';
import { createRoot } from 'react-dom/client';
import { SimulatorApp } from './SimulatorApp.jsx';
import { initializeEnvironment } from './cms-environment.mjs';
import { css, fonts, excelModel } from './cms-assets.mjs';

const host = document.getElementById('siorg-simulator-__SPNS__');
const nonce = document.currentScript?.nonce;

class ComponentErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('SIORG — falha no componente de homologação:', error); }
  render() { return this.state.failed ? <p role="alert">Não foi possível abrir o simulador. Recarregue a página ou encaminhe a ocorrência à equipe responsável pela homologação.</p> : this.props.children; }
}

if (host && !host.dataset.cmsReady) {
  try {
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    if (nonce) style.nonce = nonce;
    style.textContent = css;
    const mount = document.createElement('div');
    mount.className = 'siorg-cms-document';
    mount.lang = 'pt-BR';
    shadow.append(style, mount);
    for (const font of fonts) {
      const face = new FontFace(font.family, `url(${font.url})`, { weight: font.weight, display: 'swap' });
      document.fonts.add(face);
      face.load().catch(() => console.warn('SIORG: fonte indisponível; verifique font-src na política do CMS.'));
    }
    let modelUrl;
    initializeEnvironment(shadow, mount, () => {
      if (!modelUrl) {
        const bytes = Uint8Array.from(atob(excelModel), c => c.charCodeAt(0));
        modelUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      }
      const link = document.createElement('a');
      link.href = modelUrl;
      link.download = 'SGGD-modelo-v3.xlsx';
      mount.append(link); link.click(); link.remove();
    });
    const root = createRoot(mount, { identifierPrefix: 'siorg-cms-' });
    root.render(<ComponentErrorBoundary><SimulatorApp /></ComponentErrorBoundary>);
    host.dataset.cmsReady = 'true';
    host.replaceChildren();
    const cleanup = new MutationObserver(() => {
      if (host.isConnected) return;
      root.unmount();
      if (modelUrl) URL.revokeObjectURL(modelUrl);
      cleanup.disconnect();
    });
    cleanup.observe(document.documentElement, { childList: true, subtree: true });
  } catch (error) {
    host.textContent = 'Não foi possível abrir o simulador. A equipe do CMS deve conferir os recursos e as permissões desta página de homologação.';
    console.error('SIORG — inicialização do componente:', error);
  }
}
