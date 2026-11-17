import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { SiorgShell } from './SiorgShell.jsx';
import { calculateScenario, buildSummary, formatInteger, formatCents, catalogue } from './calculator.mjs';

const GROUPS = ['CCESP', 'FCESP'];
const names = { CCESP: 'Cargos em comissão', FCESP: 'Funções de confiança' };
const emptyCurrent = () => ({ mode: 'aggregate', groups: { CCESP: { quantity: '', quotas: '' }, FCESP: { quantity: '', quotas: '' } }, aggregate: { quantity: '', quotas: '' } });
const Icon = ({ name }) => <i className={`fa fa-${name}`} aria-hidden="true" />;

function InfoHelp({ text, label }) {
  const id = useId(), ref = useRef(null), closeTimer = useRef(null);
  const [open, setOpen] = useState(false), [position, setPosition] = useState({});
  function show() {
    clearTimeout(closeTimer.current);
    const rect = ref.current.getBoundingClientRect(), width = Math.min(270, window.innerWidth - 32);
    setPosition({ width, left: Math.max(16, Math.min(rect.left, window.innerWidth - width - 16)), ...(rect.bottom + 160 > window.innerHeight ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }) });
    setOpen(true);
  }
  useEffect(() => {
    const dismiss = () => setOpen(false);
    window.addEventListener('scroll', dismiss, true); window.addEventListener('resize', dismiss);
    return () => { window.removeEventListener('scroll', dismiss, true); window.removeEventListener('resize', dismiss); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const escape = event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); } };
    document.addEventListener('keydown', escape, true);
    return () => document.removeEventListener('keydown', escape, true);
  }, [open]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  return <span className="info-help" onMouseEnter={show} onMouseLeave={() => { if (document.activeElement !== ref.current) closeTimer.current = setTimeout(() => setOpen(false), 180); }}><button ref={ref} type="button" className="info-trigger" aria-label={`Ajuda: ${label}`} aria-describedby={id} onFocus={show} onBlur={() => setOpen(false)} onClick={show} onKeyDown={e => { if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); setOpen(false); } }}><Icon name="circle-info" /></button><span id={id} role="tooltip" className="help-tooltip" hidden={!open} style={position}>{text}</span></span>;
}

const fieldHelp = { 'Quantidade': 'Informe quantos cargos ou funções deste tipo e nível entram na proposta. Exemplo: 3. Use um número inteiro.' };
function Field({ label, help, error, id: givenId, ...props }) {
  const generated = useId(), id = givenId || generated;
  const explanation = help || fieldHelp[label] || (label.startsWith('Quantidade atual') ? 'Quantidade de cargos ou funções na referência atual. Deixe em branco se não souber. Zero indica ausência confirmada.' : label.startsWith('Cotas atuais') ? 'Total de cotas na referência atual, não o valor em reais. Exemplo: 1250,50. Use até duas casas decimais e deixe em branco se não souber.' : null);
  return <div className="field"><div className="field-label"><label htmlFor={id}>{label}</label>{explanation && <InfoHelp label={label} text={explanation} />}</div><input id={id} {...props} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} />{error && <span className="field-error" id={`${id}-error`}>{error}</span>}</div>;
}

function Modal({ title, children, onClose, actions }) {
  const ref = useRef(null), titleId = useId();
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog className="modal" ref={ref} aria-labelledby={titleId} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) onClose(); }}><div className="modal-head"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label="Fechar janela" onClick={onClose}><Icon name="xmark" /></button></div><div className="modal-content">{children}</div>{actions && <div className="modal-actions">{actions}</div>}</dialog>;
}

function inputError(value, quota) {
  if (!value.trim()) return '';
  if (value.trim().length > 128) return 'Use até 128 caracteres numéricos.';
  return (quota ? /^\d+(?:[,.]\d{1,2})?$/ : /^\d+$/).test(value.trim()) ? '' : quota ? 'Use até duas casas decimais, sem separador de milhar.' : 'Informe um número inteiro igual ou maior que zero.';
}
const reasonLabel = { empty_proposal: 'Inclua itens na proposta.', incomplete_proposal: 'Confira as quantidades da proposta.', missing_current: 'Atual não informado', invalid_current: 'Confira o dado atual.', incompatible_context: 'Confirme a equivalência dos dados.', incomplete_context: 'Complete a referência.', no_group_baseline: 'Sem dados por grupo.', not_requested: 'Comparação não solicitada.' };
function Difference({ value, quota = false }) {
  if (value.status !== 'available') return <span className="pending-value">{reasonLabel[value.reason] || 'Comparação pendente'}</span>;
  return <span className="difference"><strong>{quota ? formatCents(value.delta, { signed: true }) : formatInteger(value.delta, { signed: true })}</strong><span>{value.direction === 'increase' ? 'Aumento' : value.direction === 'decrease' ? 'Redução' : 'Sem alteração'}</span></span>;
}

function References() {
  return <details className="card reference-card"><summary><Icon name="book-open" /><span>Como o cálculo funciona</span><Icon name="chevron-down" /></summary><div className="reference-content">
    <h3>Quantidade × valor-unitário = cotas</h3><p>As cotas são calculadas por nível e somadas em cada grupo. Elas não são valores em reais. CCESP e FCESP permanecem separados.</p>
    <h3>Referência dos valores</h3><p>Anexo I da Lei Complementar nº 1.395/2023, conferido em 14/09/2026. A presença de um nível na tabela não confirma sua aplicação ao órgão.</p><a href={catalogue.sourceUrl} target="_blank" rel="noreferrer">Consultar a fonte na Assembleia Legislativa <Icon name="arrow-up-right-from-square" /><span className="sr-only"> (abre em nova aba)</span></a>
    <details className="coefficient-details"><summary>Ver valores de todos os níveis</summary><table><caption className="sr-only">Cotas por nível de CCESP e FCESP</caption><thead><tr><th scope="col">Nível</th><th scope="col">CCESP</th><th scope="col">FCESP</th></tr></thead><tbody>{catalogue.groups.CCESP.map((entry, index) => <tr key={entry.level}><td>{entry.level === 18 ? '18 — NES' : entry.level}</td><td>{formatCents(entry.quotaCents)}</td><td>{formatCents(catalogue.groups.FCESP[index].quotaCents)}</td></tr>)}</tbody></table></details>
    <p className="reference-limit">O cálculo apoia a preparação e não representa aprovação da proposta. Este protótipo ainda não está integrado ao SIORG.</p>
  </div></details>;
}

export function App() {
  const [rows, setRows] = useState([]), [current, setCurrent] = useState(emptyCurrent);
  const [draft, setDraft] = useState({ group: 'CCESP', level: '', quantity: '' });
  const [draftError, setDraftError] = useState(''), [example, setExample] = useState(false), [modal, setModal] = useState(null), [notice, setNotice] = useState(''), [summary, setSummary] = useState('');
  const serial = useRef(0);
  const input = useMemo(() => ({ rows, current, comparisonBasis: 'arithmetic' }), [rows, current]);
  const result = useMemo(() => calculateScenario(input), [input]);
  const hasData = rows.length > 0 || draft.quantity || draft.level || current.aggregate.quantity || current.aggregate.quotas;
  const selectedCoefficient = catalogue.groups[draft.group].find(entry => String(entry.level) === draft.level);
  const updateDraft = (key, value) => { setDraft(old => ({ ...old, [key]: value })); setDraftError(''); };
  function addItem(event) {
    event.preventDefault();
    const fail = (message, id) => { setDraftError(message); document.getElementById(id)?.focus(); };
    if (!draft.level) return fail('Selecione o nível.', 'new-level');
    if (!draft.quantity.trim() || inputError(draft.quantity, false)) return fail(inputError(draft.quantity, false) || 'Informe a quantidade.', 'new-quantity');
    const duplicate = rows.find(row => row.group === draft.group && row.level === Number(draft.level));
    if (duplicate) return fail('Este nível já está na tabela. Altere a quantidade na linha abaixo.', duplicate.id);
    const id = `item-${++serial.current}`;
    setRows(old => [...old, { ...draft, id, level: Number(draft.level) }]);
    setDraft(old => ({ ...old, level: '', quantity: '' })); setDraftError('');
    setNotice('Linha adicionada. Total atualizado.'); document.getElementById('new-level')?.focus();
  }
  function loadExample() {
    serial.current += 2;
    setRows([{ id: `item-${serial.current - 1}`, group: 'CCESP', level: 2, quantity: '3' }, { id: `item-${serial.current}`, group: 'FCESP', level: 4, quantity: '2' }]);
    setCurrent({ ...emptyCurrent(), aggregate: { quantity: '4', quotas: '3,00' } }); setExample(true);
    setDraft({ group: 'CCESP', level: '', quantity: '' }); setDraftError(''); setModal(null); setNotice('Exemplo fictício carregado. Edite as quantidades para experimentar.');
  }
  function clear() {
    setRows([]); setCurrent(emptyCurrent()); setExample(false); setDraft({ group: 'CCESP', level: '', quantity: '' }); setDraftError(''); setModal(null); setSummary(''); setNotice('Preenchimento limpo.'); requestAnimationFrame(() => document.getElementById('new-group')?.focus());
  }
  function openSummary() {
    setNotice(''); setSummary(buildSummary(input, result, { isExample: example, generatedAt: new Date().toLocaleString('pt-BR') })); setModal('summary');
  }
  async function copySummary() {
    try { await navigator.clipboard.writeText(summary); setNotice('Resumo copiado.'); }
    catch { document.getElementById('summary-text')?.select(); setNotice('Selecione o texto do resumo e copie.'); }
  }
  function downloadSummary() {
    const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'resumo-calculadora-siorg.txt'; a.click(); URL.revokeObjectURL(url); setNotice('Resumo preparado para download.');
  }
  const comparisonRows = [{ label: 'Cotas', value: result.comparisons.aggregate.quotas, quota: true }, { label: 'Quantitativo', value: result.comparisons.aggregate.quantity }];
  const updateCurrent = (key, value) => setCurrent(old => ({ ...old, aggregate: { ...old.aggregate, [key]: value } }));
  return <SiorgShell><div className="calculator-page simple-calculator">
    <div className="page-title-row"><h1>Calculadora de Cotas</h1><span className="prototype-tag">Protótipo local</span></div>
    <p className="simple-intro">Informe os totais atuais e monte a proposta para ver a diferença.</p>
    {example && <div className="example-note"><Icon name="circle-info" /><span><strong>Exemplo fictício.</strong> Você pode editar. Para começar sua proposta, limpe os dados.</span></div>}
    <section className="card current-baseline" id="dados-atuais" aria-labelledby="baseline-title">
      <div className="worksheet-heading"><h2 id="baseline-title">Situação atual</h2><InfoHelp label="Situação atual" text="Informe os totais atuais de CCESP e FCESP somados, como na planilha. A diferença será calculada em relação à sua proposta. Use dados da mesma estrutura e referência." /></div>
      <div className="baseline-fields"><Field label="Cotas atuais" help="Total de cotas da estrutura atual, somando CCESP e FCESP. Ex.: 1250,50. Não é um valor em reais. Deixe em branco se não souber." inputMode="decimal" placeholder="Ex.: 1250,50" value={current.aggregate.quotas} error={inputError(current.aggregate.quotas, true)} onChange={e => updateCurrent('quotas', e.target.value)} /><Field label="Quantitativo atual" help="Quantidade total de cargos CCESP e funções FCESP na situação atual. Ex.: 100. Use um número inteiro. Zero indica ausência confirmada; vazio é não informado." inputMode="numeric" placeholder="Ex.: 100" value={current.aggregate.quantity} error={inputError(current.aggregate.quantity, false)} onChange={e => updateCurrent('quantity', e.target.value)} /></div>
    </section>
    <section className="card worksheet" aria-labelledby="composition-title">
      <div className="worksheet-heading"><h2 id="composition-title" tabIndex={-1}>Sua proposta</h2><button className="text-button" onClick={() => hasData ? setModal('example') : loadExample()}>Ver exemplo</button></div>
      <form className="simple-add" onSubmit={addItem} noValidate>
        <div className="simple-add-fields"><div className="field"><div className="field-label"><label htmlFor="new-group">Tipo</label><InfoHelp label="Tipo" text="Escolha CCESP para cargos em comissão ou FCESP para funções de confiança. Use o tipo indicado na sua proposta." /></div><select id="new-group" value={draft.group} onChange={e => updateDraft('group', e.target.value)}><option value="CCESP">CCESP · Cargo em comissão</option><option value="FCESP">FCESP · Função de confiança</option></select></div><div className="field"><div className="field-label"><label htmlFor="new-level">Nível</label><InfoHelp label="Nível" text="Selecione o nível do cargo ou função, de 1 a 18. A calculadora busca automaticamente o valor de cotas desse nível." /></div><select id="new-level" value={draft.level} onChange={e => updateDraft('level', e.target.value)} aria-invalid={!!draftError && !draft.level} aria-describedby={draftError && !draft.level ? 'add-error' : undefined}><option value="">Selecione</option>{catalogue.groups[draft.group].map(entry => <option key={entry.level} value={entry.level}>{entry.level === 18 ? '18 — NES' : entry.level}</option>)}</select></div><Field id="new-quantity" label="Quantidade" placeholder="Ex.: 3" inputMode="numeric" value={draft.quantity} error={draftError && draft.level ? inputError(draft.quantity, false) || (!draft.quantity.trim() ? 'Informe a quantidade.' : '') : undefined} onChange={e => updateDraft('quantity', e.target.value)} /><button className="button primary" type="submit"><Icon name="plus" />Adicionar</button></div>
        {selectedCoefficient && <p className="coefficient-hint">Cada {draft.group === 'CCESP' ? 'cargo' : 'função'} deste nível corresponde a {formatCents(selectedCoefficient.quotaCents)} cotas.</p>}
        {draftError && <p className="field-error" role="alert" id="add-error">{draftError}</p>}
      </form>
      {rows.length === 0 ? <p className="worksheet-empty">Adicione um nível para começar.</p> : <div className="sheet-groups">{GROUPS.filter(group => rows.some(row => row.group === group)).map(group => <div className="sheet-group" key={group}>
        <h3>{group} <span>{names[group]}</span></h3>
        <table className="sheet-table"><caption className="sr-only">Composição e total de {group}</caption><thead><tr><th scope="col">Nível</th><th scope="col"><span className="label-with-info">Quantidade<InfoHelp label="Quantidade na tabela" text="Você pode alterar a quantidade diretamente nesta coluna. Os totais são recalculados na mesma hora." /></span></th><th scope="col" className="unit-column">Cotas por unidade</th><th scope="col"><span className="label-with-info">Cotas<InfoHelp label="Cotas calculadas" text="Resultado da quantidade multiplicada pelo valor de cotas do nível. O total de cada grupo aparece no fim da tabela." /></span></th><th scope="col"><span className="sr-only">Remover</span></th></tr></thead><tbody>{rows.filter(row => row.group === group).map(row => { const computed = result.groups[group].rows.find(item => item.id === row.id); return <tr key={row.id}><th scope="row">{row.level === 18 ? '18 · NES' : row.level}</th><td><label className="sr-only" htmlFor={row.id}>Quantidade de {group}, nível {row.level}</label><input id={row.id} inputMode="numeric" value={row.quantity} aria-invalid={computed?.quotaCents == null} aria-describedby={computed?.quotaCents == null ? `${row.id}-error` : undefined} onChange={e => setRows(old => old.map(item => item.id === row.id ? { ...item, quantity: e.target.value } : item))} />{computed?.quotaCents == null && <span className="field-error" id={`${row.id}-error`}>{inputError(row.quantity, false) || 'Informe a quantidade.'}</span>}</td><td className="unit-column">{formatCents(computed.coefficientCents)}</td><td className="sheet-number">{computed?.quotaCents != null ? formatCents(computed.quotaCents) : '—'}</td><td><button className="icon-button" aria-label={`Remover ${group}, nível ${row.level}`} onClick={() => { setRows(old => old.filter(item => item.id !== row.id)); setNotice('Linha removida. Total atualizado.'); requestAnimationFrame(() => document.getElementById('new-level')?.focus()); }}><Icon name="trash-can" /></button></td></tr>; })}</tbody><tfoot><tr><th scope="row">Total</th><td data-testid={`total-${group}-quantity`}>{result.groups[group].quantity != null ? formatInteger(result.groups[group].quantity) : '—'}</td><td className="unit-column" /><td className="sheet-number" data-testid={`total-${group}-quotas`}>{result.groups[group].quotaCents != null ? formatCents(result.groups[group].quotaCents) : '—'}</td><td /></tr></tfoot></table>
        {result.groups[group].status === 'incomplete' && <p className="field-error sheet-error">Preencha as quantidades para calcular o total deste grupo.</p>}
      </div>)}</div>}
      <div className="worksheet-foot"><p>CCESP e FCESP têm totais separados.</p><button className="text-button" disabled={!hasData} onClick={() => setModal('clear')}>Limpar dados</button></div>
    </section>
    <section className="card saved-comparison" id="resultados" aria-labelledby="comparison-title"><div className="worksheet-heading"><h2 id="comparison-title">Resultado</h2><InfoHelp label="Diferença" text="Proposta menos situação atual. Valor positivo indica aumento; negativo indica redução. São diferenças aritméticas dos totais, sem validar limites ou compensação entre os grupos." /></div><div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th scope="col">Medida</th><th scope="col">Atual</th><th scope="col">Proposta</th><th scope="col">Diferença</th></tr></thead><tbody>{comparisonRows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value.current != null ? (row.quota ? formatCents(row.value.current) : formatInteger(row.value.current)) : '—'}</td><td>{row.value.proposed != null ? (row.quota ? formatCents(row.value.proposed) : formatInteger(row.value.proposed)) : '—'}</td><td>{row.value.reason === 'empty_proposal' ? '—' : <Difference value={row.value} quota={row.quota} />}</td></tr>)}</tbody></table></div><div className="worksheet-foot"><p>Diferença = proposta − atual. Totais de CCESP + FCESP.</p></div>{rows.length > 0 && <div className="worksheet-actions result-export"><button className="button primary" onClick={openSummary}><Icon name="file-lines" />Ver e copiar resumo</button></div>}</section>
    <References />
    <p className="session-note">Os dados ficam só nesta página. Copie o resumo antes de fechar.</p>
    <div className="sr-only" role="status" aria-live="polite">{notice}</div>
    {modal === 'example' && <Modal title="Substituir os dados pelo exemplo?" onClose={() => setModal(null)} actions={<><button className="button secondary" onClick={() => setModal(null)}>Manter meus dados</button><button className="button primary" onClick={loadExample}>Carregar exemplo</button></>}><p>O exemplo fictício substituirá o preenchimento desta página.</p></Modal>}
    {modal === 'clear' && <Modal title="Limpar os dados?" onClose={() => setModal(null)} actions={<><button className="button secondary" onClick={() => setModal(null)}>Cancelar</button><button className="button primary" onClick={clear}>Limpar proposta</button></>}><p>Os dados serão removidos. Copie o resumo se quiser guardar esta composição.</p></Modal>}
    {modal === 'summary' && <Modal title={result.status === 'incomplete' ? 'Resumo com pendências' : 'Resumo da proposta'} onClose={() => setModal(null)} actions={<><button className="button secondary" onClick={downloadSummary}><Icon name="download" />Baixar texto</button><button className="button primary" onClick={copySummary}><Icon name="copy" />Copiar resumo</button></>}><label className="sr-only" htmlFor="summary-text">Texto do resumo</label><textarea id="summary-text" readOnly value={summary} /><p className="copy-feedback" role="status">{notice}</p></Modal>}
  </div></SiorgShell>;
}
