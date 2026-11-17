import { useEffect, useState } from 'react';

export function SimulatorGuide({ annex, hasExcelModel }) {
  const [section, setSection] = useState(() => window.location.hash.slice(1));

  useEffect(() => {
    const updateSection = () => setSection(window.location.hash.slice(1));
    window.addEventListener('hashchange', updateSection);
    return () => window.removeEventListener('hashchange', updateSection);
  }, []);

  const steps = [
    { id: 'dados-atuais', title: 'Estrutura', description: 'Escolha a unidade e edite a proposta' },
    { id: 'resultados', title: 'Cotas', description: 'Confira os quantitativos e o saldo' },
    { id: 'resumo-alteracoes', title: 'Resumo das alterações', description: 'Confira o que mudou em cada unidade' },
    { id: 'anexo-ii', title: annex, description: 'Confira e baixe o quadro da proposta' },
  ];
  const active = section === 'consulta-cargos' ? 'dados-atuais' : section;

  function startSimulation() {
    document.getElementById('sim-organization')?.focus({ preventScroll: true });
  }

  return <>
    <div className="sim-guide-intro">
      <p>Simule mudanças na estrutura de um órgão, confira o impacto nos cargos e nas cotas e gere um quadro para revisão técnica.</p>
      <a className="button primary" href="#dados-atuais" onClick={startSimulation}>Iniciar simulação</a>
    </div>
    <nav className="sim-output-nav sim-flow-nav" aria-label="Etapas da proposta">
      {steps.map(step => <a key={step.id} href={`#${step.id}`}
        aria-current={active === step.id ? 'location' : undefined}>
        <strong>{step.title}</strong>
        <span>{step.description}</span>
      </a>)}
    </nav>
    <details className="sim-orientations">
      <summary>Como preencher a proposta e calcular as cotas</summary>
      <ol>
        <li>Escolha o órgão e a unidade em <strong>Estrutura</strong>.</li>
        <li>Informe a quantidade final de cada cargo ou função. Para aumentar de 2 para 3, digite 3. Para retirar, digite 0.</li>
        <li>Use <strong>Ações de unidades</strong> para criar, transferir ou retirar uma unidade e confira os avisos exibidos.</li>
        <li>Confira o saldo em <strong>Cotas</strong>, revise o <strong>Resumo das alterações</strong> e baixe o {annex} da proposta.</li>
      </ol>
      <p>As cotas de cada linha são a quantidade multiplicada pela cota unitária do nível. O saldo compara o total da proposta com a referência, separadamente para CCESP e FCESP.</p>
      {hasExcelModel && <p>Para simular fora do portal, use o <a href="/modelos/SGGD-modelo-v3.xlsx" download>modelo da SGGD em Excel</a>.</p>}
    </details>
  </>;
}
