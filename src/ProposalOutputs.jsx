import { useEffect, useRef, useState } from 'react';
import { formatCents, formatInteger } from './calculator.mjs';
import { buildProposalSummaryText } from './proposal-outputs.mjs';
import { activeGroups, annexLabel, isSecretariat, organizationAcronym, scopeLabel } from './data/simulator-bases.mjs';
import './proposal-outputs.css';

const display = (value, quotas = false, signed = false) => value == null ? 'Pendente' : (quotas ? formatCents : formatInteger)(value, { signed });
const labels = { quantity: 'Quantidade alterada', added: 'Inclusão', removed: 'Retirada', code: 'Código alterado' };
const countLabel = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;
const dateStamp = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const normalizeSearch = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\b(ccesp|fcesp)\s*(?=\d)/g, '$1 ').trim();
const isUnitChange = change => change.type.startsWith('unit-');

function BeforeAfter({ before, after, delta, quotas = false, numeric = false }) {
  return <dl className="output-context">
    <div><dt>De <span>· base</span></dt><dd>{numeric ? display(before, quotas) : before || 'Não informado'}</dd></div>
    <div><dt>Para <span>· proposta</span></dt><dd>{numeric ? display(after, quotas) : after || 'Não informado'}</dd></div>
    {delta != null && <div><dt>Variação</dt><dd>{display(delta, quotas, true)}</dd></div>}
  </dl>;
}

function SummaryChange({ change, unit }) {
  if (change.type === 'unit-renamed') return <>
    <p className="output-change-heading"><strong>Nome da unidade alterado</strong></p>
    <BeforeAfter before={change.beforeName} after={change.afterName || 'Nome pendente'} />
  </>;
  if (change.type === 'unit-created') return <>
    <p className="output-change-heading"><strong>Unidade criada na proposta</strong></p>
    <p className="output-change-note"><strong>Vinculada a:</strong> {unit.afterParentName || 'Vínculo não informado'}.</p>
  </>;
  if (change.type === 'unit-removed') return <>
    <p className="output-change-heading"><strong>Unidade retirada da proposta</strong></p>
    <p className="output-change-note">Os cargos e funções diretamente alocados nesta unidade foram zerados na proposta.</p>
    <p className="output-change-note"><strong>Vínculo na base:</strong> {unit.beforeParentName || 'Vínculo não informado'}.</p>
  </>;
  if (change.type === 'unit-moved') return <>
    <p className="output-change-heading"><strong>Transferência de unidade</strong></p>
    <p className="output-measure-label">Unidade superior</p>
    <BeforeAfter before={change.beforeParentName} after={change.afterParentName} />
  </>;
  return <>
    <p className="output-change-heading"><strong>{labels[change.type] || 'Alteração de cargo ou função'}</strong><span>{change.denomination}</span></p>
    {change.beforeCode ? <><p className="output-measure-label">Código</p><BeforeAfter before={change.beforeCode} after={change.afterCode} /></> : <p className="output-code">{change.code}</p>}
    <p className="output-measure-label">Quantidade</p>
    <BeforeAfter before={change.before} after={change.after} delta={change.delta} numeric />
    <p className="output-measure-label">Cotas</p>
    <BeforeAfter before={change.quotas.before} after={change.quotas.after} delta={change.quotas.delta} numeric quotas />
    {change.status === 'pending' && <p className="field-error">Confira a quantidade informada no simulador.</p>}
  </>;
}

function downloadText(text, filename) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ProposalOutputs({ proposal, base, outputs, onEditUnit }) {
  const latestProposal = useRef(proposal);
  latestProposal.current = proposal;
  const [exporting, setExporting] = useState(null);
  const [exportMessage, setExportMessage] = useState('');
  const [exportError, setExportError] = useState(false);
  const [summaryQuery, setSummaryQuery] = useState('');
  const summarySearch = useRef(null);
  const { summary, annex, canGenerateAnnex, canDownloadAnnex } = outputs;
  const counts = summary.counts;
  const organization = organizationAcronym(base);
  const documentName = annexLabel(base);
  const secretariat = isSecretariat(base);
  const searchTerms = normalizeSearch(summaryQuery).split(/\s+/).filter(Boolean);
  const searching = searchTerms.length > 0;
  let matchingChanges = 0;
  const visibleUnits = searching ? summary.units.flatMap(unit => {
    const matches = unit.changes.filter(change => !isUnitChange(change) && searchTerms.every(term =>
      normalizeSearch([change.denomination, change.code, change.beforeCode, change.afterCode].filter(Boolean).join(' ')).includes(term)));
    matchingChanges += matches.length;
    return matches.length ? [{ ...unit, changes: unit.changes.filter(change => isUnitChange(change) || matches.includes(change)) }] : [];
  }) : summary.units;
  const active = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  useEffect(() => { setExportMessage(''); setExportError(false); }, [proposal]);

  async function downloadAnnex() {
    if (exporting || !canDownloadAnnex) return;
    const snapshot = proposal;
    setExporting('pdf'); setExportMessage(''); setExportError(false);
    try {
      const { createAnnexPdf } = await import('./annex-pdf.mjs');
      if (!active.current) return;
      if (latestProposal.current !== snapshot) throw new Error('A proposta mudou durante a preparação. Confira os dados e clique novamente para baixar.');
      const pdf = createAnnexPdf(snapshot, base);
      pdf.save(`${organization}-${documentName === "Anexo II" ? "Anexo-II" : "Quadro-demonstrativo"}-proposta-${dateStamp()}.pdf`);
      setExportMessage('PDF gerado com a proposta completa. Confira o arquivo nos downloads do navegador.');
    } catch (error) {
      setExportError(true);
      setExportMessage(error.message || 'Não foi possível gerar o PDF. Tente novamente.');
    } finally { setExporting(null); }
  }

  async function downloadExcel() {
    if (exporting || !canDownloadAnnex) return;
    const snapshot=proposal;
    setExporting('xlsx');setExportMessage('');setExportError(false);
    try {
      const {createProposalXlsx}=await import('./proposal-xlsx.mjs');
      if (!active.current) return;
      if(latestProposal.current!==snapshot)throw new Error('A proposta mudou. Confira os dados e clique novamente para baixar.');
      const bytes=await createProposalXlsx(snapshot,base);
      if (!active.current) return;
      if(latestProposal.current!==snapshot)throw new Error('A proposta mudou durante a geração. Confira os dados e clique novamente para baixar.');
      const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})),link=document.createElement('a');
      link.href=url;link.download=`${organization}-proposta-${dateStamp()}.xlsx`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      setExportMessage(`Excel gerado com a estrutura, os cálculos, o resumo e o ${documentName} desta proposta.`);
    } catch(error) {setExportError(true);setExportMessage(error.message || 'Não foi possível gerar o Excel. Tente novamente.');}
    finally {setExporting(null);}
  }

  return <>
    <section className="card proposal-summary" id="resumo-alteracoes" aria-labelledby="summary-title">
      <div className="worksheet-heading"><h2 id="summary-title">Resumo das alterações</h2><span className="output-scope">{scopeLabel(base)}</span></div>
      <p className="proposal-hint output-introduction">Este resumo compara a base publicada com a proposta atual. Mostra o resultado das alterações, sem registrar a sequência de cada ação. Para corrigir um valor, use “Editar esta unidade”.</p>
      <div className="output-table-scroll"><table className="output-comparison">
        <caption className="sr-only">Comparação entre a alocação de referência e a proposta de todas as unidades</caption>
        <thead><tr><th scope="col">Medida</th><th scope="col">Alocado<small>{secretariat ? "Anexo II" : "Quadro publicado"}</small></th><th scope="col">Proposta</th><th scope="col">Variação<small>Proposta − alocado</small></th></tr></thead>
        <tbody>{activeGroups(base).flatMap(group => ['quantity', 'quotaCents'].map(key => {
          const metric = summary.comparisons.groups[group][key], quotas = key === 'quotaCents';
          return <tr key={`${group}-${key}`}><th scope="row">{group} · {quotas ? 'Cotas' : 'Quantidade'}</th><td>{display(metric.before, quotas)}</td><td>{display(metric.after, quotas)}</td><td data-testid={`summary-${group}-${key}-delta`}>{display(metric.delta, quotas, true)}</td></tr>;
        }))}</tbody>
      </table></div>
      {!canGenerateAnnex && <p className="output-warning">Há informações pendentes na proposta. Os valores válidos continuam visíveis para conferência, mas o {documentName} só será liberado quando todas as pendências forem resolvidas.</p>}
      {counts.total === 0 ? <p className="output-empty">Nenhuma alteração em relação à base.</p> : <>
        <p className="output-counts"><strong>{countLabel(counts.units, 'unidade', 'unidades')} com alterações</strong><span>{[counts.quantityChanges && countLabel(counts.quantityChanges, 'ajuste de quantidade', 'ajustes de quantidade'), counts.added && countLabel(counts.added, 'inclusão de cargo/função', 'inclusões de cargos/funções'), counts.removed && countLabel(counts.removed, 'retirada de cargo/função', 'retiradas de cargos/funções'), counts.renamed && countLabel(counts.renamed, 'nome alterado', 'nomes alterados'), summary.structureCounts['unit-created'] && countLabel(summary.structureCounts['unit-created'],'unidade criada','unidades criadas'), summary.structureCounts['unit-removed'] && countLabel(summary.structureCounts['unit-removed'],'unidade retirada','unidades retiradas'), summary.structureCounts['unit-moved'] && countLabel(summary.structureCounts['unit-moved'],'transferência','transferências'), summary.structureCounts.code && countLabel(summary.structureCounts.code,'código alterado','códigos alterados')].filter(Boolean).join(' · ')}</span></p>
        <div className="summary-search" role="search" aria-label="Buscar nas alterações da proposta">
          <label htmlFor="summary-search">Buscar cargo, função ou código nas alterações</label>
          <div className="summary-search-control"><input id="summary-search" ref={summarySearch} type="search" value={summaryQuery} onChange={event => setSummaryQuery(event.target.value)} placeholder="Ex.: Assessor ou CCESP 2.06" aria-describedby="summary-search-help summary-search-results" aria-controls="summary-unit-list" />
            {summaryQuery && <button type="button" className="button secondary" onClick={() => { setSummaryQuery(''); summarySearch.current?.focus(); }}>Limpar busca</button>}</div>
          <p id="summary-search-help">A busca filtra somente as alterações exibidas. Totais e arquivos continuam incluindo a proposta inteira. Alterações da própria unidade aparecem junto dos cargos encontrados.</p>
          <p id="summary-search-results" role="status" aria-live="polite" aria-atomic="true">{searching ? matchingChanges ? `${countLabel(matchingChanges, 'alteração de cargo ou função encontrada', 'alterações de cargos ou funções encontradas')} em ${countLabel(visibleUnits.length, 'unidade', 'unidades')}.` : 'Nenhuma alteração de cargo ou função corresponde à busca.' : `Exibindo todas as alterações de ${countLabel(summary.units.length, 'unidade', 'unidades')}.`}</p>
        </div>
        <div className="output-unit-list" id="summary-unit-list">{visibleUnits.map(unit => <details className="output-unit" key={unit.unitId} open={searching || undefined}>
          <summary><strong>{unit.afterName || unit.beforeName || 'Unidade pendente'}</strong><span className="output-unit-meta">{unit.afterParentName && `Vínculo na proposta: ${unit.afterParentName} · `}{countLabel(unit.changes.length, 'alteração exibida', 'alterações exibidas')}{proposal.units.filter(other => other.name === unit.afterName && (proposal.units.find(parent => parent.id === other.parentUnitId)?.name || other.parentName) === unit.afterParentName).length > 1 ? ` · ${unit.sourceRow ? `linha ${unit.sourceRow} do modelo` : 'unidade criada ' + unit.unitId}` : ''}</span></summary>
          <div className="output-unit-content">{unit.hierarchyStatus === 'model-parent-ambiguous' && <p className="output-change-note">Vínculo informado no modelo; a identificação da unidade superior depende de conferência.</p>}<ul>{unit.changes.map(change => <li key={`${change.type}:${change.positionId || 'unit'}`}><SummaryChange change={change} unit={unit} /></li>)}</ul><button type="button" className="button secondary output-edit-unit" onClick={() => onEditUnit(unit.unitId)} aria-label={`Editar ${unit.afterName || unit.beforeName || 'esta unidade'}${unit.afterParentName ? `, vinculada a ${unit.afterParentName}` : ''}`}>Editar esta unidade</button></div>
        </details>)}</div>
      </>}
      <div className="output-actions"><button className="button secondary" onClick={() => downloadText(buildProposalSummaryText(proposal, base, { generatedAt: new Date() }), `${organization}-resumo-proposta-${dateStamp()}.txt`)}>Baixar resumo em texto</button><span>Inclui alterações, quantitativos, cotas e saldos.</span></div>
    </section>

    <section className="card proposal-annex" id="anexo-ii" aria-labelledby="annex-title">
      <div className="worksheet-heading"><h2 id="annex-title">{documentName} · Estrutura proposta</h2><span className="output-scope">Gerado automaticamente</span></div>
      <p className="proposal-hint">O quadro reúne a proposta inteira, com os nomes e as quantidades que você informou. Linhas com quantidade zero ficam fora do quadro.</p>
      {documentName === 'Anexo II' && <p className="proposal-hint output-introduction">Este Anexo II é uma minuta para compor a proposta de novo decreto de estrutura. O art. 16, § 1º, do <a href="https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-68742-05.08.2024.html" target="_blank" rel="noreferrer">Decreto nº 68.742/2024</a> remete ao Modelo de Quadro Demonstrativo do Anexo IV. O arquivo deve passar pela revisão técnica; sua geração não aprova a reestruturação.</p>}
      {canGenerateAnnex ? <>
        <p className="annex-total" data-testid="annex-size"><strong>{annex.rowCount} linhas de cargos e funções</strong> em {annex.unitCount} unidades com quantitativo positivo.</p>
        <details className="annex-preview"><summary>Conferir o quadro completo</summary><div className="annex-table-scroll" tabIndex={0} role="region" aria-label={`${documentName} completo da proposta`}>
          <table className="annex-table"><caption>{documentName.toUpperCase()}<br /><span>Quadro Demonstrativo dos Cargos em Comissão e das Funções de Confiança · {base.name}</span></caption><thead><tr>{annex.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{annex.rows.map((row, index) => <tr key={row.positionId} className={index === 0 || annex.rows[index - 1].unitId !== row.unitId ? 'annex-unit-start' : ''}><th scope="row">{row.unitName}{row.hierarchyChanged && <span className="annex-unit-parent">Vinculada a: {row.parentName || 'Vínculo não informado'}</span>}</th><td>{row.quantity}</td><td>{row.denomination}</td><td>{row.code}</td></tr>)}</tbody></table>
          {annex.rowCount === 0 && <p className="output-empty">Proposta sem cargos ou funções.</p>}
        </div></details>
      </> : <p className="output-warning" id="annex-pending">Complete as informações de todas as unidades para conferir e baixar o {documentName}. Nenhum quadro parcial será gerado.</p>}
      {canGenerateAnnex && !canDownloadAnnex && <p className="output-warning" id="annex-rule-pending">Corrija os alertas em vermelho da proposta para liberar o PDF. Os quantitativos e as cotas continuam disponíveis para conferência.</p>}
      <div className="output-actions"><button className="button primary" disabled={!canDownloadAnnex || !!exporting} aria-describedby={!canGenerateAnnex ? 'annex-pending' : !canDownloadAnnex ? 'annex-rule-pending' : undefined} onClick={downloadAnnex}>{exporting==='pdf' ? 'Preparando PDF…' : `Baixar ${documentName} em PDF`}</button><button className="button secondary" disabled={!canDownloadAnnex || !!exporting} onClick={downloadExcel}>{exporting==='xlsx'?'Preparando Excel…':'Baixar proposta em Excel'}</button><span>Minutas para revisão técnica. O Excel registra esta simulação; use a cópia da proposta para retomá-la no portal.</span></div>
      {exportMessage && <p className={`output-message ${exportError ? 'field-error' : ''}`} role={exportError ? 'alert' : 'status'}>{exportMessage}</p>}
    </section>
  </>;
}
