import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { SimulatorApp } from "./SimulatorApp.jsx";
import { TimelineApp } from "./TimelineApp.jsx";
import "./styles.css";

const readLocation = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

function RootApp() {
  const [location, setLocation] = useState(() => ({ href: readLocation(), navigated: false }));
  const url = new URL(location.href, window.location.origin);
  const isTimeline = /^\/novas-estruturas\/?$/.test(url.pathname);
  const isCalculator = url.searchParams.get('modo') === 'calculadora';

  useEffect(() => {
    const updateLocation = () => setLocation({ href: readLocation(), navigated: true });
    window.addEventListener('popstate', updateLocation);
    window.addEventListener('hashchange', updateLocation);
    return () => {
      window.removeEventListener('popstate', updateLocation);
      window.removeEventListener('hashchange', updateLocation);
    };
  }, []);

  useEffect(() => {
    document.title = `${isTimeline ? 'Novas Estruturas' : isCalculator ? 'Calculadora de Cotas' : 'Simulador de Reestruturação'} | SIORG`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = isTimeline
      ? 'Linha do tempo das novas estruturas dos órgãos e entidades, com datas dos atos, datas de publicação e links para fontes oficiais.'
      : isCalculator
        ? 'Protótipo da Calculadora de Cotas do SIORG para comparar quantitativos e cotas CCESP e FCESP.'
        : 'Protótipo do Simulador de Reestruturação da SGGD com cálculo automático de quantitativos e cotas por unidade.';
    const hash = new URL(location.href, window.location.origin).hash;
    // A direct visit without an anchor keeps the header and normal initial
    // viewport. Internal navigation/back/forward focus the mounted content.
    if (!location.navigated && !hash) return;
    const targetId = hash ? hash.slice(1) : isTimeline ? 'novas-estruturas' : 'calculadora';
    const frame = window.requestAnimationFrame(() => {
      // Runs after the destination component mounts, including back/forward and
      // a direct visit to /#resultados. No calculation or draft state is reset.
      const target = document.getElementById(targetId);
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.href, location.navigated, isTimeline, isCalculator]);

  return isTimeline ? <TimelineApp /> : isCalculator ? <App /> : <SimulatorApp />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
);
