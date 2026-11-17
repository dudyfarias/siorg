import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { SiorgShell } from './SiorgShell.jsx';
import { calculateScenario, formatInteger, formatCents, catalogue } from './calculator.mjs';
import { organizations, getOrganization, getScope, freshReferenceRows } from './organization-profiles.mjs';
import { calculateOrganizationImpact, buildScopedSummary } from './scenario.mjs';
import { evaluateReferenceBalance, buildReferenceBalanceSummary } from './reference-balance.mjs';
import { calculateQuotaAvailability } from './quota-availability.mjs';

const GROUPS = ['CCESP', 'FCESP'];
const names = { CCESP: 'Cargos em comissão', FCESP: 'Funções de confiança' };
const emptyCurrent = () => ({ mode: 'group', groups: { CCESP: { quantity: '', quotas: '' }, FCESP: { quantity: '', quotas: '' } }, aggregate: { quantity: '', quotas: '' } });
function referencePreset(scope) {
  const rows = freshReferenceRows(scope).map(row => ({ ...row, level: Number(row.level) }));
  if (!rows.length) return { rows: [], current: emptyCurrent(), origin: 'manual' };
  const reference = scope.reference;
  return {
    rows,
    current: { ...emptyCurrent(), groups: Object.fromEntries(GROUPS.map(group => [group, { quantity: reference.groups[group].quantity, quotas: reference.groups[group].quotas.replace('.', ',') }])) },
    origin: ['published-distribution', 'published-summary'].includes(reference.nature) ? 'documentary' : 'reference',
  };
}
const Icon = ({ name }) => <i className={`fa fa-${name}`} aria-hidden="true" />;

export function InfoHelp({ text, label }) {
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

export function Modal({ title, children, onClose, actions }) {
  const ref = useRef(null), titleId = useId();
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog className="modal" ref={ref} aria-labelledby={titleId} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) onClose(); }}><div className="modal-head"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label="Fechar janela" onClick={onClose}><Icon name="xmark" /></button></div><div className="modal-content">{children}</div>{actions && <div className="modal-actions">{actions}</div>}</dialog>;
}

function inputError(value, quota) {
  if (!value.trim()) return '';
  if (value.trim().length > 128) return 'Use até 128 caracteres numéricos.';
  return (quota ? /^\d+(?:[,.]\d{1,2})?$/ : /^\d+$/).test(value.trim()) ? '' : quota ? 'Use até duas casas decimais, sem separador de milhar.' : 'Informe um número inteiro igual ou maior que zero.';
}
const reasonLabel = { empty_proposal: 'Inclua itens na proposta.', incomplete_proposal: 'Confira as quantidades da proposta.', missing_current: 'Base não informada', invalid_current: 'Confira a base.', incompatible_context: 'Confirme a equivalência dos dados.', incomplete_context: 'Complete a referência.', no_group_baseline: 'Sem dados por grupo.', not_requested: 'Comparação não solicitada.' };
function Difference({ value, quota = false }) {
  if (value.status !== 'available') return <span className="pending-value">{reasonLabel[value.reason] || 'Comparação pendente'}</span>;
  return <span className="difference"><strong>{quota ? formatCents(value.delta, { signed: true }) : formatInteger(value.delta, { signed: true })}</strong><span>{value.direction === 'increase' ? 'Aumento' : value.direction === 'decrease' ? 'Redução' : 'Sem alteração'}</span></span>;
}

function balanceStatusText(balance, limitMode = false) {
  const reference = limitMode ? 'do limite' : 'da base';
  if (balance.status === 'exceeded') return balance.complete ? `Acima ${reference}` : `Acima ${reference} · há pendências`;
  if (balance.status === 'pending') return 'Comparação pendente';
  return [balance.quantity, balance.quotas].every(metric => metric.relation === 'equal') ? (limitMode ? 'No limite' : 'Igual à base') : `Dentro ${reference}`;
}

function BalanceValue({ metric, quota, isUnit, limitMode = false }) {
  if (metric.status !== 'available') return <span className="pending-value">{reasonLabel[metric.reason] || 'Comparação pendente'}</span>;
  const format = quota ? formatCents : formatInteger;
  const above = metric.relation === 'above';
  return <span className={`balance-value ${above ? 'above' : metric.relation}`}>
    <strong>{metric.relation === 'equal' ? (quota ? '0,00' : '0') : format(limitMode ? metric.balance : above ? metric.excess : metric.balance)}</strong>
    <small>{limitMode ? (metric.relation === 'equal' ? 'Sem saldo' : above ? 'Excede o limite' : 'Disponível') : metric.relation === 'equal' ? 'Igual à base' : above ? (isUnit ? 'Acima da base' : 'Excede a base') : (isUnit ? 'Abaixo da base' : 'Restam na base')}</small>
  </span>;
}

function ReferenceResults({ result, balance, isUnit, baseLabel, limitMode = false, proposedLabel = 'Proposta', balanceLabel, showDelta = true }) {
  return <div className="balance-tables">{GROUPS.map(group => <div className="balance-group" key={group}>
    <div className="balance-group-heading"><h3>{group}</h3><span className={`balance-tag ${balance.groups[group].status}`}>{balanceStatusText(balance.groups[group], limitMode)}</span></div>
    <table className="reference-comparison"><caption className="sr-only">{limitMode ? `Limites e saldo de ${group}` : `Comparação de ${group} com a base de referência`}</caption>
      <thead><tr><th scope="col">Medida</th><th scope="col">{baseLabel}</th><th scope="col">{proposedLabel}</th><th scope="col">{balanceLabel || (isUnit ? 'Diferença da base' : 'Saldo / excesso')}</th></tr></thead>
      <tbody>{[{key:'quantity', label:'Quantitativo'}, {key:'quotas', label:'Cotas', quota:true}].map(({key,label,quota}) => {
        const comparison = result.comparisons.groups[group][key], metric = balance.groups[group][key], format = quota ? formatCents : formatInteger;
        return <tr key={key}><th scope="row">{label}</th><td>{comparison.current != null ? format(comparison.current) : '—'}</td><td>{comparison.proposed != null ? format(comparison.proposed) : '—'}{showDelta && comparison.status === 'available' && <small className="proposal-delta">{comparison.direction === 'increase' ? 'Aumento ' : comparison.direction === 'decrease' ? 'Redução ' : 'Variação '}{format(comparison.delta, {signed:true})}</small>}</td><td data-testid={`balance-${group}-${key}`}><BalanceValue metric={metric} quota={quota} isUnit={isUnit} limitMode={limitMode}/></td></tr>;
      })}</tbody>
    </table>
  </div>)}</div>;
}

function AllocationOverview({ availability }) {
  const comparisons = { groups: Object.fromEntries(GROUPS.map(group => [group, Object.fromEntries(['quantity','quotas'].map(key => {
    const metric = availability.currentBalance.groups[group][key];
    return [key, { status:metric.status, current:metric.baseline, proposed:metric.proposed }];
  }))])) };
  return <div className="allocation-overview"><h3>Limites e saldo atual da Secretaria</h3><ReferenceResults result={{comparisons}} balance={availability.currentBalance} baseLabel={<>Limite <small>Anexo III</small></>} proposedLabel={<>Alocado <small>Anexo II</small></>} balanceLabel="Saldo disponível" limitMode showDelta={false}/><p>Saldo disponível = limite do Anexo III − alocado no Anexo II. Valores em vermelho indicam extrapolação.</p></div>;
}

export function References() {
  return <details className="card reference-card"><summary><Icon name="book-open" /><span>Como o cálculo funciona</span><Icon name="chevron-down" /></summary><div className="reference-content">
    <h3>Quantidade × valor-unitário = cotas</h3><p>As cotas são calculadas por nível e somadas em cada grupo. Elas não são valores em reais. CCESP e FCESP permanecem separados.</p>
    <h3>Referência dos valores</h3><p>Anexo I da Lei Complementar nº 1.395/2023, conferido em 14/09/2026. A presença de um nível na tabela não confirma sua aplicação ao órgão.</p><a href={catalogue.sourceUrl} target="_blank" rel="noreferrer">Consultar a fonte na Assembleia Legislativa <Icon name="arrow-up-right-from-square" /><span className="sr-only"> (abre em nova aba)</span></a>
    <details className="coefficient-details"><summary>Ver valores de todos os níveis</summary><table><caption className="sr-only">Cotas por nível de CCESP e FCESP</caption><thead><tr><th scope="col">Nível</th><th scope="col">CCESP</th><th scope="col">FCESP</th></tr></thead><tbody>{catalogue.groups.CCESP.map((entry, index) => <tr key={entry.level}><td>{entry.level === 18 ? '18 — NES' : entry.level}</td><td>{formatCents(entry.quotaCents)}</td><td>{formatCents(catalogue.groups.FCESP[index].quotaCents)}</td></tr>)}</tbody></table></details>
    <p className="reference-limit">O cálculo apoia a preparação e não representa aprovação da proposta. Este protótipo ainda não está integrado ao SIORG.</p>
  </div></details>;
}

export function App() {
  const initial = useMemo(() => referencePreset(getScope('sggd', 'all')), []);
  const [organizationId, setOrganizationId] = useState('sggd'), [unitId, setUnitId] = useState('all');
  const [customName, setCustomName] = useState(''), [scopeError, setScopeError] = useState('');
  const [customLocked, setCustomLocked] = useState(false);
  const [baselineOrigin, setBaselineOrigin] = useState(initial.origin), [pendingContext, setPendingContext] = useState(null);
  const [rows, setRows] = useState(initial.rows), [current, setCurrent] = useState(initial.current);
  const [edited, setEdited] = useState(false);
  const [draft, setDraft] = useState({ group: 'CCESP', level: '', quantity: '' });
  const [draftError, setDraftError] = useState(''), [example, setExample] = useState(false), [modal, setModal] = useState(null), [notice, setNotice] = useState(''), [summary, setSummary] = useState('');
  const serial = useRef(0);
  const organization = getOrganization(organizationId), scope = getScope(organizationId, unitId);
  const scopeName = unitId === 'custom' ? customName.trim() || 'Unidade a informar' : scope.name;
  const isDocumentary = baselineOrigin === 'documentary';
  const sourceAnnex = scope.reference?.sourceAnnex || 'II';
  const isReference = baselineOrigin === 'reference' || isDocumentary;
  const canUseReference = referencePreset(scope).rows.length > 0;
  const input = useMemo(() => ({ rows, current, comparisonBasis: 'arithmetic' }), [rows, current]);
  const result = useMemo(() => calculateScenario(input), [input]);
  const balance = useMemo(() => evaluateReferenceBalance(result), [result]);
  const availability = useMemo(() => calculateQuotaAvailability({organizationId, scopeId:unitId, baselineOrigin, result}), [organizationId, unitId, baselineOrigin, result]);
  const hasLimits = availability.status === 'available';
  const displayedBalance = hasLimits ? availability.proposedBalance : balance;
  const impact = useMemo(() => calculateOrganizationImpact({ organization, scope, baselineOrigin, result }), [organization, scope, baselineOrigin, result]);
  const hasData = rows.length > 0 || !!draft.quantity || !!draft.level || GROUPS.some(group => Object.values(current.groups[group]).some(Boolean));
  const selectedCoefficient = catalogue.groups[draft.group].find(entry => String(entry.level) === draft.level);
  const updateDraft = (key, value) => { setDraft(old => ({ ...old, [key]: value })); setDraftError(''); setEdited(true); };
  function addItem(event) {
    event.preventDefault();
    if (unitId === 'custom' && !customName.trim()) { setScopeError('Informe o nome da unidade.'); document.getElementById('custom-unit')?.focus(); return; }
    const fail = (message, id) => { setDraftError(message); document.getElementById(id)?.focus(); };
    if (!draft.level) return fail('Selecione o nível.', 'new-level');
    if (!draft.quantity.trim() || inputError(draft.quantity, false)) return fail(inputError(draft.quantity, false) || 'Informe a quantidade.', 'new-quantity');
    const duplicate = rows.find(row => row.group === draft.group && Number(row.level) === Number(draft.level));
    if (duplicate) return fail('Este nível já está na tabela. Altere a quantidade na linha abaixo.', duplicate.id);
    if (unitId === 'custom') setCustomLocked(true);
    const id = `item-${++serial.current}`;
    setRows(old => [...old, { ...draft, id, level: Number(draft.level) }]); setEdited(true);
    setDraft(old => ({ ...old, level: '', quantity: '' })); setDraftError('');
    setNotice('Linha adicionada. Total atualizado.'); document.getElementById('new-level')?.focus();
  }
  function loadExample() {
    serial.current += 2;
    setRows([{ id: `item-${serial.current - 1}`, group: 'CCESP', level: 5, quantity: '4' }, { id: `item-${serial.current}`, group: 'FCESP', level: 7, quantity: '3' }]);
    setCurrent({ ...emptyCurrent(), groups: { CCESP: {quantity:'3', quotas:'6,00'}, FCESP: {quantity:'3', quotas:'4,50'} } }); setExample(true); setBaselineOrigin('example'); setEdited(false);
    if (unitId === 'custom') { if (!customName.trim()) setCustomName('Unidade de demonstração'); setCustomLocked(true); }
    setDraft({ group: 'CCESP', level: '', quantity: '' }); setDraftError(''); setScopeError(''); setSummary(''); setModal(null); setNotice('Exemplo fictício carregado. Edite as quantidades para experimentar.');
  }
  function resetValues() {
    setRows([]); setCurrent(emptyCurrent()); setExample(false); setBaselineOrigin('manual'); setCustomLocked(false); setEdited(false);
    setDraft({ group: 'CCESP', level: '', quantity: '' }); setDraftError(''); setScopeError(''); setSummary('');
  }
  function clear() {
    resetValues(); setModal(null); setNotice('Valores limpos. Secretaria e unidade mantidas.'); requestAnimationFrame(() => document.getElementById('base-CCESP-quantity')?.focus());
  }
  function applyContext(next) {
    resetValues(); setOrganizationId(next.organizationId); setUnitId(next.unitId); setCustomName('');
    const preset = referencePreset(getScope(next.organizationId, next.unitId));
    setRows(preset.rows); setCurrent(preset.current); setBaselineOrigin(preset.origin);
    setPendingContext(null); setModal(null); setNotice(preset.rows.length ? 'Quantidades e cotas desta estrutura carregadas. Edite a proposta para simular.' : 'Seleção atualizada. Informe os valores desta estrutura.');
  }
  function requestContext(next) {
    if (edited || customName) { setPendingContext(next); setModal('context'); }
    else applyContext(next);
  }
  function loadReference() {
    if (!canUseReference) return;
    const preset = referencePreset(scope);
    setCurrent(preset.current); setRows(preset.rows);
    setBaselineOrigin(preset.origin); setExample(false); setEdited(false); setSummary(''); setDraft({ group: 'CCESP', level: '', quantity: '' }); setDraftError(''); setModal(null);
    setNotice('Base e quantidades carregadas. A proposta começa igual à base; edite as quantidades para simular.');
  }
  function editReference() {
    setCurrent(old => ({ ...emptyCurrent(), groups: structuredClone(old.groups) })); setBaselineOrigin('manual-from-reference'); setEdited(true); setNotice('Base convertida em preenchimento manual. O impacto geral deixa de ser estimado.');
    requestAnimationFrame(() => document.getElementById('base-CCESP-quantity')?.focus());
  }
  function openSummary() {
    if (unitId === 'custom' && !customName.trim()) { setScopeError('Informe o nome da unidade para identificar o resumo.'); document.getElementById('custom-unit')?.focus(); return; }
    setNotice(''); setSummary(buildScopedSummary({ organization, scope, scopeName, baselineOrigin, input, result, impact, isExample: example, generatedAt: new Date().toLocaleString('pt-BR') }) + (hasLimits ? '' : '\n\n' + buildReferenceBalanceSummary(result, {scopeCoverage:scope.coverage}))); setModal('summary');
  }
  async function copySummary() {
    try { await navigator.clipboard.writeText(summary); setNotice('Resumo copiado.'); }
    catch { document.getElementById('summary-text')?.select(); setNotice('Selecione o texto do resumo e copie.'); }
  }
  function downloadSummary() {
    const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `resumo-siorg-${organizationId}-${unitId}.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('Resumo preparado para download.');
  }
  const comparisonRows = [{ label: 'Cotas', value: result.comparisons.aggregate.quotas, quota: true }, { label: 'Quantitativo', value: result.comparisons.aggregate.quantity }];
  const updateCurrent = (group, key, value) => { setCurrent(old => ({ ...old, groups: { ...old.groups, [group]: { ...old.groups[group], [key]: value } } })); setEdited(true); if (unitId === 'custom' && customName.trim()) setCustomLocked(true); };
  function announceGroupResult(group) {
    const message = ['quantity','quotas'].map(key => {
      const metric = displayedBalance.groups[group][key], format = key === 'quantity' ? formatInteger : formatCents;
      const label = key === 'quantity' ? 'Quantitativo' : 'Cotas';
      if (metric.status !== 'available') return `${label}: comparação pendente.`;
      const reference = hasLimits ? 'do limite' : 'da base';
      const difference = metric.relation === 'equal' ? (hasLimits ? 'no limite' : 'igual à base') : `${metric.relation === 'above' ? 'acima' : 'abaixo'} ${reference} em ${format(metric.relation === 'above' ? metric.excess : metric.balance)}`;
      return `${label}: proposta ${format(metric.proposed)}, ${difference}.`;
    }).join(' ');
    setNotice(`${group}. ${message}`);
  }
  return <SiorgShell><div className="calculator-page simple-calculator">
    <div className="page-title-row"><h1>Calculadora de Cotas</h1><span className="prototype-tag">{import.meta.env.DEV ? 'Protótipo local' : 'Protótipo para avaliação'}</span></div>
    <p className="simple-intro">Confira o limite, o que está alocado e o saldo disponível para sua proposta.</p>
    {example && <div className="example-note"><Icon name="circle-info" /><span><strong>Exemplo fictício.</strong> Você pode editar. Para começar sua proposta, limpe os dados.</span></div>}
    <section className="card current-baseline" id="dados-atuais" aria-labelledby="baseline-title">
      <div className="worksheet-heading"><h2 id="baseline-title">Estrutura e base de comparação</h2></div>
      <div className="context-fields">
        <div className="field"><div className="field-label"><label htmlFor="organization">Secretaria</label><InfoHelp label="Secretaria" text="Escolha a secretaria responsável pela estrutura. Cada secretaria tem seu próprio decreto e quadro de referência. Os dados da referência disponível são carregados ao selecionar. Se você tiver editado valores, a troca pedirá confirmação." /></div><select id="organization" value={organizationId} onChange={e => requestContext({ organizationId: e.target.value, unitId: 'all' })}>{organizations.map(item => <option value={item.id} key={item.id}>{item.shortName}</option>)}</select></div>
        <div className="field"><div className="field-label"><label htmlFor="unit">Unidade</label><InfoHelp label="Unidade" text="Escolha toda a secretaria ou uma unidade. Os valores atuais e a proposta devem abranger a mesma estrutura. Veja logo abaixo se a seleção inclui unidades subordinadas." /></div><select id="unit" value={unitId} onChange={e => requestContext({ organizationId, unitId: e.target.value })}>{organization.units.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        {unitId === 'custom' && <div className="custom-unit-field"><Field id="custom-unit" label="Nome da unidade" help="Use o nome da unidade e indique se os valores incluem suas unidades subordinadas. Essa informação também aparecerá no resumo." value={customName} readOnly={customLocked} onBlur={() => { if (hasData && customName.trim()) setCustomLocked(true); }} maxLength={160} placeholder="Ex.: Diretoria de… (inclui suas unidades)" error={scopeError} onChange={e => { setCustomName(e.target.value); setScopeError(''); }} />{customLocked && <button className="text-button" onClick={() => requestContext({ organizationId, unitId: 'custom' })}>Alterar unidade</button>}</div>}
      </div>
      <p className="scope-caption">{unitId === 'all' ? scope.scopeLabel : <><strong>{scopeName}.</strong> {scope.scopeLabel}</>}</p>
      <div className="baseline-origin"><span className="origin-label">{hasLimits ? 'Anexo III · Limites / Anexo II · Alocação' : isDocumentary ? `Base do Anexo ${sourceAnnex}` : isReference ? 'Base do decreto' : example ? 'Exemplo fictício' : 'Preenchimento manual'}</span>{canUseReference && (isReference ? <button className="text-button" onClick={editReference}>Informar valores manualmente</button> : <button className="text-button" onClick={() => edited ? setModal('reference') : loadReference()}>Carregar base e quantidades</button>)}</div>
      <details className="scope-source"><summary>{hasLimits ? 'Consultar as fontes dos limites e da estrutura' : isDocumentary ? `Anexo ${sourceAnnex} carregado; divergência com o Anexo ${scope.reference.conflictingAnnex}` : isReference ? 'Estrutura autorizada no decreto; não indica ocupação atual.' : scope.status === 'conflict' ? 'Base do decreto pendente de conciliação' : scope.status === 'verified' ? 'Referência do decreto disponível' : unitId === 'custom' ? 'Referência informada manualmente' : 'Base atual pendente de confirmação'}</summary><div><p>{hasLimits ? "O Anexo III informa os limites da Secretaria. O Anexo II informa os cargos e funções alocados na estrutura. A diferença entre eles é o saldo disponível, calculado por espécie." : scope.notice}</p>{hasLimits ? ['limits', 'allocated'].map(key => <p key={key}><a href={availability.sourceLabels[key].url} target="_blank" rel="noreferrer">{key === 'limits' ? 'Limites: ' : 'Alocação: '}{availability.sourceLabels[key].label}<span className="sr-only"> (abre em nova aba)</span></a></p>) : scope.sourceUrl && <a href={scope.sourceUrl} target="_blank" rel="noreferrer">{scope.sourceLabel}<span className="sr-only"> (abre em nova aba)</span></a>}{scope.structureSourceUrl && <p><a href={scope.structureSourceUrl} target="_blank" rel="noreferrer">Consultar a organização das unidades</a></p>}<p>Referências conferidas em 24/09/2026. Os valores por nível seguem a LC 1.395/2023.</p></div></details>
      {hasLimits ? <AllocationOverview availability={availability}/> : <div className="base-breakdown">
        <table><caption className="sr-only">Quantitativos e cotas da base por espécie</caption>
          <thead><tr><th scope="col">Referência</th><th scope="col"><span className="label-with-info">Quantitativo<InfoHelp label="Quantitativo da base" text="Informe a quantidade de cargos CCESP e de funções FCESP do quadro de referência, separadamente. Não é a quantidade de pessoas em exercício. Vazio significa não informado; zero significa ausência confirmada." /></span></th><th scope="col"><span className="label-with-info">Cotas<InfoHelp label="Cotas da base" text="Informe as cotas do quadro de referência de cada espécie. Exemplo: 1250,50. Não é um valor em reais. A referência documental da SGGD ainda depende de conciliação pela área técnica." /></span></th></tr></thead>
          <tbody>{GROUPS.map(group => <tr key={group}><th scope="row">{group}<small>{names[group]}</small></th>{['quantity','quotas'].map(key => {
            const id = `base-${group}-${key}`, error = inputError(current.groups[group][key], key === 'quotas');
            return <td key={key}><label className="sr-only" htmlFor={id}>{key === 'quantity' ? 'Quantitativo' : 'Cotas'} da base {group}</label><input id={id} inputMode={key === 'quantity' ? 'numeric' : 'decimal'} readOnly={isReference} value={current.groups[group][key]} placeholder={key === 'quantity' ? 'Ex.: 10' : 'Ex.: 25,50'} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onBlur={() => announceGroupResult(group)} onChange={e => updateCurrent(group, key, e.target.value)} />{error && <span className="field-error" id={`${id}-error`}>{error}</span>}</td>;
          })}</tr>)}</tbody>
          <tfoot><tr><th scope="row">Total da base</th><td data-testid="baseline-total-quantity">{result.current.aggregate.quantity.status === 'valid' ? formatInteger(result.current.aggregate.quantity.value) : '—'}</td><td data-testid="baseline-total-quotas">{result.current.aggregate.quotas.status === 'valid' ? formatCents(result.current.aggregate.quotas.value) : '—'}</td></tr></tfoot>
        </table>
      </div>}
      {hasLimits && unitId !== 'all' && <p className="scope-allocation"><strong>Alocado na unidade selecionada:</strong> {formatInteger(result.current.aggregate.quantity.value)} cargos e funções · {formatCents(result.current.aggregate.quotas.value)} cotas. A proposta abaixo altera apenas este recorte.</p>}
      <p className="validation-note"><Icon name="circle-info" /><span><strong>Simulação em validação.</strong> {hasLimits ? 'O saldo é calculado com os limites do Anexo III e a alocação do Anexo II. Base e regras seguem em revisão técnica.' : <>A comparação usa {isDocumentary ? `o quadro documental do Anexo ${sourceAnnex}` : isReference ? 'a referência do decreto' : example ? 'valores fictícios' : 'os valores informados'}. Os limites aplicáveis ainda dependem da revisão técnica.</>}</span></p>
    </section>
    <div className="live-balance" role="status" aria-live="polite" aria-atomic="true"><div><span className="live-balance-label">Após a proposta:</span>{GROUPS.map(group => <span key={group} className={`live-balance-group ${displayedBalance.groups[group].status}`}><Icon name={displayedBalance.groups[group].status === 'exceeded' ? 'triangle-exclamation' : 'circle-info'}/><strong>{group}</strong> {balanceStatusText(displayedBalance.groups[group], hasLimits)}</span>)}</div><a href="#resultados">Ver resultado <Icon name="arrow-down" /></a></div>
    <section className="card worksheet" aria-labelledby="composition-title">
      <div className="worksheet-heading"><h2 id="composition-title" tabIndex={-1}>Sua proposta<InfoHelp label="Sua proposta" text="Monte a composição completa que a estrutura terá ao final, incluindo os cargos e funções que serão mantidos. Não preencha apenas os acréscimos. Se carregar o decreto, a proposta começa igual à base para você editar." /></h2><button className="text-button" onClick={() => edited ? setModal('example') : loadExample()}>Ver exemplo</button></div>
      {isReference && <p className="proposal-hint">{hasLimits ? 'A proposta começa com o que está alocado no Anexo II. Edite as quantidades para simular a composição final.' : <>Quantidades preenchidas com {isDocumentary ? `o Anexo ${sourceAnnex}` : 'a base do decreto'}. Edite a tabela para simular a composição final.</>}</p>}
      <form className="simple-add" onSubmit={addItem} noValidate>
        <div className="simple-add-fields"><div className="field"><div className="field-label"><label htmlFor="new-group">Tipo</label><InfoHelp label="Tipo" text="Escolha CCESP para cargos em comissão ou FCESP para funções de confiança. Use o tipo indicado na sua proposta." /></div><select id="new-group" value={draft.group} onChange={e => updateDraft('group', e.target.value)}><option value="CCESP">CCESP · Cargo em comissão</option><option value="FCESP">FCESP · Função de confiança</option></select></div><div className="field"><div className="field-label"><label htmlFor="new-level">Nível</label><InfoHelp label="Nível" text="Selecione o nível do cargo ou função, de 1 a 18. A calculadora busca automaticamente o valor de cotas desse nível." /></div><select id="new-level" value={draft.level} onChange={e => updateDraft('level', e.target.value)} aria-invalid={!!draftError && !draft.level} aria-describedby={draftError && !draft.level ? 'add-error' : undefined}><option value="">Selecione</option>{catalogue.groups[draft.group].map(entry => <option key={entry.level} value={entry.level}>{entry.level === 18 ? '18 — NES' : entry.level}</option>)}</select></div><Field id="new-quantity" label="Quantidade" placeholder="Ex.: 3" inputMode="numeric" value={draft.quantity} error={draftError && draft.level ? inputError(draft.quantity, false) || (!draft.quantity.trim() ? 'Informe a quantidade.' : '') : undefined} onChange={e => updateDraft('quantity', e.target.value)} /><button className="button primary" type="submit"><Icon name="plus" />Adicionar</button></div>
        {selectedCoefficient && <p className="coefficient-hint">Cada {draft.group === 'CCESP' ? 'cargo' : 'função'} deste nível corresponde a {formatCents(selectedCoefficient.quotaCents)} cotas.</p>}
        {draftError && <p className="field-error" role="alert" id="add-error">{draftError}</p>}
      </form>
      {rows.length === 0 ? <p className="worksheet-empty">Adicione um nível para começar.</p> : <div className="sheet-groups">{GROUPS.filter(group => rows.some(row => row.group === group)).map(group => <div className="sheet-group" key={group}>
        <h3>{group} <span>{names[group]}</span></h3>
        <table className="sheet-table"><caption className="sr-only">Composição e total de {group}</caption><thead><tr><th scope="col">Nível</th><th scope="col"><span className="label-with-info">Quantidade<InfoHelp label="Quantidade na tabela" text="Você pode alterar a quantidade diretamente nesta coluna. Os totais são recalculados na mesma hora." /></span></th><th scope="col" className="unit-column">Valor unitário</th><th scope="col"><span className="label-with-info">Cotas<InfoHelp label="Cotas calculadas" text="Resultado da quantidade multiplicada pelo valor de cotas do nível. O total de cada grupo aparece no fim da tabela." /></span></th><th scope="col"><span className="sr-only">Remover</span></th></tr></thead><tbody>{rows.filter(row => row.group === group).map(row => { const computed = result.groups[group].rows.find(item => item.id === row.id); return <tr key={row.id}><th scope="row">{row.level === 18 ? '18 · NES' : row.level}</th><td><label className="sr-only" htmlFor={row.id}>Quantidade de {group}, nível {row.level}</label><input id={row.id} inputMode="numeric" value={row.quantity} aria-invalid={computed?.quotaCents == null} aria-describedby={computed?.quotaCents == null ? `${row.id}-error` : undefined} onBlur={() => announceGroupResult(group)} onChange={e => { setRows(old => old.map(item => item.id === row.id ? { ...item, quantity: e.target.value } : item)); setEdited(true); }} />{computed?.quotaCents == null && <span className="field-error" id={`${row.id}-error`}>{inputError(row.quantity, false) || 'Informe a quantidade.'}</span>}</td><td className="unit-column">{formatCents(computed.coefficientCents)}</td><td className="sheet-number">{computed?.quotaCents != null ? formatCents(computed.quotaCents) : '—'}</td><td><button className="icon-button" aria-label={`Remover ${group}, nível ${row.level}`} onClick={() => { setRows(old => old.filter(item => item.id !== row.id)); setEdited(true); setNotice('Linha removida. Total atualizado.'); requestAnimationFrame(() => document.getElementById('new-level')?.focus()); }}><Icon name="trash-can" /></button></td></tr>; })}</tbody><tfoot><tr><th scope="row">Total</th><td data-testid={`total-${group}-quantity`}>{result.groups[group].quantity != null ? formatInteger(result.groups[group].quantity) : '—'}</td><td className="unit-column" /><td className="sheet-number" data-testid={`total-${group}-quotas`}>{result.groups[group].quotaCents != null ? formatCents(result.groups[group].quotaCents) : '—'}</td><td /></tr></tfoot></table>
        {result.groups[group].status === 'incomplete' && <p className="field-error sheet-error">Preencha as quantidades para calcular o total deste grupo.</p>}
      </div>)}</div>}
      <div className="worksheet-foot"><p>CCESP e FCESP têm totais separados.</p><button className="text-button" disabled={!hasData} onClick={() => setModal('clear')}>Limpar dados</button></div>
    </section>
    <section className="card saved-comparison" id="resultados" aria-labelledby="comparison-title">
      <div className="worksheet-heading"><h2 id="comparison-title">{hasLimits ? 'Saldo após a proposta' : 'Resultado da simulação'}</h2><InfoHelp label="Resultado da simulação" text={hasLimits ? "Saldo após a proposta = limite do Anexo III menos a alocação projetada para a Secretaria. Ao simular uma unidade, somente sua composição muda; o restante da estrutura permanece igual. Saldos negativos indicam extrapolação. CCESP e FCESP são independentes." : "A base menos a proposta mostra a diferença em cada espécie. Uma redução em um grupo não neutraliza o aumento no outro."} /></div>
      <p className="comparison-reference">{organization.shortName} · {hasLimits && unitId !== 'all' ? `Projeção da Secretaria após alterar ${scopeName}` : scopeName}</p>
      <ReferenceResults result={hasLimits ? availability.comparisonResult : result} balance={displayedBalance} isUnit={!hasLimits && unitId !== 'all'} baseLabel={hasLimits ? 'Limite · Anexo III' : isDocumentary ? `Anexo ${sourceAnnex}` : isReference ? 'Base do decreto' : example ? 'Base fictícia' : 'Base informada'} limitMode={hasLimits} showDelta={!hasLimits} proposedLabel={hasLimits ? 'Alocação proposta' : 'Proposta'} balanceLabel={hasLimits ? 'Saldo após proposta' : undefined}/>
      <p className="result-guidance">{hasLimits ? <>{unitId !== 'all' ? 'A alocação proposta da Secretaria mantém o restante da estrutura e substitui apenas a unidade selecionada. ' : ''}Saldo após a proposta = limite − alocação proposta. CCESP e FCESP não se compensam. Base e regras em validação técnica.</> : <>{unitId === 'all' ? 'A comparação usa os valores informados; limites não foram aplicados automaticamente.' : 'A diferença mostra a mudança nesta unidade. A distribuição de referência não é um teto da unidade.'} Base e regras em validação técnica.</>}</p>

      <details className="aggregate-results"><summary>Ver a variação em relação ao que está alocado</summary><div className="comparison-table-wrap"><table className="comparison-table"><caption className="sr-only">Totais descritivos de CCESP e FCESP</caption><thead><tr><th scope="col">Medida</th><th scope="col">Alocado</th><th scope="col">Proposta</th><th scope="col">Variação</th></tr></thead><tbody>{comparisonRows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value.current != null ? (row.quota ? formatCents(row.value.current) : formatInteger(row.value.current)) : '—'}</td><td>{row.value.proposed != null ? (row.quota ? formatCents(row.value.proposed) : formatInteger(row.value.proposed)) : '—'}</td><td><Difference value={row.value} quota={row.quota}/></td></tr>)}</tbody></table></div><p>O total é descritivo. CCESP e FCESP não se compensam.</p></details>
      {!hasLimits && unitId !== 'all' && <div className="organization-impact"><h3>Total da secretaria<InfoHelp label="Total da secretaria" text="Base completa da secretaria menos a base da unidade, mais a proposta completa da unidade. O restante permanece igual. A estimativa exige referências conciliadas da mesma versão e não representa autorização para a mudança." /></h3>{impact.status === 'available' ? <><div className="impact-totals"><span><strong>{formatCents(impact.aggregate.quotaCents)}</strong> cotas <small>({formatCents(impact.aggregate.deltaQuotaCents, { signed: true })})</small></span><span><strong>{formatInteger(impact.aggregate.quantity)}</strong> cargos e funções <small>({formatInteger(impact.aggregate.deltaQuantity, { signed: true })})</small></span></div><p>Estimativa após substituir a composição da unidade. Restante da secretaria mantido.</p></> : <p>Não estimado. {impact.message}</p>}</div>}
      {hasData && <div className="worksheet-actions result-export"><button className="button primary" onClick={openSummary}><Icon name="file-lines" />Ver e copiar resumo</button></div>}
    </section>
    <References />
    <p className="session-note">Os dados ficam só nesta página. Copie o resumo antes de fechar.</p>
    <div className="sr-only" role="status" aria-live="polite">{notice}</div>
    {modal === 'context' && pendingContext && <Modal title="Trocar a estrutura?" onClose={() => { setModal(null); setPendingContext(null); }} actions={<><button className="button secondary" onClick={() => { setModal(null); setPendingContext(null); }}>Manter meus dados</button><button className="button primary" onClick={() => applyContext(pendingContext)}>{referencePreset(getScope(pendingContext.organizationId, pendingContext.unitId)).rows.length ? 'Trocar e carregar quantidades' : 'Trocar e limpar valores'}</button></>}><p>Você selecionou <strong>{getOrganization(pendingContext.organizationId).shortName} · {getScope(pendingContext.organizationId, pendingContext.unitId).name}</strong>. Suas alterações serão substituídas pelos dados disponíveis da nova estrutura. Quando não houver referência, o preenchimento começará vazio. Copie o resumo antes se quiser guardá-las.</p></Modal>}
    {modal === 'reference' && <Modal title="Carregar a base e as quantidades?" onClose={() => setModal(null)} actions={<><button className="button secondary" onClick={() => setModal(null)}>Manter meus dados</button><button className="button primary" onClick={loadReference}>Carregar base e composição</button></>}><p>A base de comparação e a proposta serão substituídas pela referência de <strong>{scopeName}</strong>. Depois, você poderá editar a composição proposta.</p></Modal>}
    {modal === 'example' && <Modal title="Substituir os dados pelo exemplo?" onClose={() => setModal(null)} actions={<><button className="button secondary" onClick={() => setModal(null)}>Manter meus dados</button><button className="button primary" onClick={loadExample}>Carregar exemplo</button></>}><p>O exemplo fictício substituirá o preenchimento desta página. Os números servem apenas para demonstrar a calculadora e não são valores oficiais de {organization.shortName}.</p></Modal>}
    {modal === 'clear' && <Modal title="Limpar os dados?" onClose={() => setModal(null)} actions={<><button className="button secondary" onClick={() => setModal(null)}>Cancelar</button><button className="button primary" onClick={clear}>Limpar proposta</button></>}><p>Os dados serão removidos. Copie o resumo se quiser guardar esta composição.</p></Modal>}
    {modal === 'summary' && <Modal title={result.status === 'incomplete' ? 'Resumo com pendências' : 'Resumo da proposta'} onClose={() => setModal(null)} actions={<><button className="button secondary" onClick={downloadSummary}><Icon name="download" />Baixar texto</button><button className="button primary" onClick={copySummary}><Icon name="copy" />Copiar resumo</button></>}><label className="sr-only" htmlFor="summary-text">Texto do resumo</label><textarea id="summary-text" readOnly value={summary} /><p className="copy-feedback" role="status">{notice}</p></Modal>}
  </div></SiorgShell>;
}
