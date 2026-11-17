import { useEffect, useMemo, useRef, useState } from 'react';
import { SiorgShell } from './SiorgShell.jsx';
import { InfoHelp, Modal, References } from './App.jsx';
import { formatCents, formatInteger } from './calculator.mjs';
import { activeGroups, annexLabel, getSimulatorBase, isSecretariat, organizationAcronym, scopeLabel, simulatorBases } from './data/simulator-bases.mjs';
import { positionCodesFor } from './structure-codes.mjs';
import { setPositionQuantity, renameUnit, addPosition, removePosition, resetUnit, setPositionCode } from './structure-proposal.mjs';
import { deriveProposalOutputs, sortProposalPositions } from './proposal-outputs.mjs';
import { ProposalOutputs } from './ProposalOutputs.jsx';
import { StructureAlerts } from './StructureAlerts.jsx';
import { ProposalSession, initialProposal } from './ProposalSession.jsx';
import { UnitActions, CodeEditor, StructureTree, UnitPath } from './StructureTools.jsx';
import { SimulatorGuide } from './SimulatorGuide.jsx';
import { PositionConsult } from './PositionConsult.jsx';
import { UnitPicker } from './UnitPicker.jsx';
import { SearchPicker, normalizePickerText, pickerAlphabet } from './SearchPicker.jsx';
import './simulator.css';

const organizations = simulatorBases.map(base => {
  const acronym = organizationAcronym(base);
  return { id: base.organizationId, name: base.name, description: acronym, selectedLabel: acronym,
    search: normalizePickerText(`${base.name} ${acronym} ${base.organizationKind || ''}`) };
}).sort((a, b) => pickerAlphabet.compare(a.name, b.name));
const organizationLabels = {
  placeholder: 'Nome ou sigla',
  hint: 'Digite o nome ou a sigla.',
  list: 'Órgãos e entidades em ordem alfabética',
  show: 'Mostrar órgãos e entidades',
  hide: 'Recolher órgãos e entidades',
  empty: 'Nenhum órgão ou entidade encontrado.',
  count: count => `${count} ${count === 1 ? 'opção encontrada' : 'opções encontradas'}`,
};
const defaultUnit = base => base.positions[0].unitId;

const Icon = ({ name }) => <i className={`fa fa-${name}`} aria-hidden="true" />;
const amount = (value, quotas = false) => value == null ? '—' : (quotas ? formatCents(value) : formatInteger(value));
const quantityLabel = (value, group) => {
  const singular = value != null && /^-?1$/.test(value);
  return group === 'CCESP' ? singular ? 'cargo' : 'cargos' : singular ? 'função' : 'funções';
};

function UnitName({ unit, original }) {
  return <><span>{unit.name || 'Nome da unidade pendente'}</span>{original && unit.name !== original.name && <small>Nome na base: {original.name}</small>}{!original && <small>Unidade criada na proposta</small>}{unit.removed && <span className="sim-unit-removed-label">Retirada da proposta</span>}</>;
}

function OrganizationResults({ calculation, base }) {
  const { availability, result } = calculation;
  const secretariat = isSecretariat(base);
  const exceededLabel = secretariat ? "Excede o limite" : "Acima da referência";
  const reference = secretariat ? 'Limite' : 'Referência';
  const referenceNote = base.notice || "O saldo usa o quadro resumo publicado.";
  const available = availability?.status === 'available';
  return <section className="card simulator-results" id="resultados" aria-labelledby="sim-results-title">
    <div className="worksheet-heading"><h2 id="sim-results-title">Calculadora de cotas · {scopeLabel(base)}</h2><InfoHelp label="Como o saldo é calculado" text="Referência menos o total proposto em todas as unidades. Quantidades e cotas são conferidas separadamente para cada espécie." /></div>
    <p className="proposal-hint">O saldo considera todas as unidades da proposta aberta neste navegador, inclusive as que você ainda não editou.</p>
    {base.originalReference && <p className="result-guidance"><strong>Quadro original da lei:</strong> {amount(base.originalReference.quantity)} cargos · {amount(base.originalReference.quotaCents, true)} cotas. {base.originalReference.note} <a href={base.originalReference.url} target="_blank" rel="noreferrer">Consultar Anexo I da LC nº 1.413/2024</a></p>}
    <div className="sim-results-scroll"><table className="sim-results-table">
      <caption className="sr-only">Referência, alocação, proposta e saldo de {organizationAcronym(base)}</caption>
      <thead><tr><th scope="col">Medida</th><th scope="col">{reference}<small>{secretariat ? "Anexo III" : base.referenceCaption}</small></th><th scope="col">Alocado<small>{secretariat ? "Anexo II" : "Quadro publicado"}</small></th><th scope="col">Proposta<small>Todas as unidades</small></th><th scope="col">Saldo<small>{reference} − proposta</small></th></tr></thead>
      {activeGroups(base).map(group => <tbody key={group}>{[{key:'quantity',label:'Quantidade'}, {key:'quotas',label:'Cotas',quotas:true}].map(({key,label,quotas}, index) => {
        const metric = available ? availability.proposedBalance.groups[group][key] : null;
        const valueKey = quotas ? 'quotaCents' : 'quantity';
        const pending = !available || availability.proposalStatus !== 'complete';
        return <tr key={key}><th scope="row">{index === 0 ? <strong>{group}</strong> : <span className="sr-only">{group} </span>}{label}</th>
          <td>{amount(availability?.limits?.groups[group]?.[valueKey], quotas)}</td>
          <td>{amount(base.totals.groups[group][valueKey], quotas)}</td>
          <td data-testid={`proposal-${group}-${key}`}>{pending ? '—' : amount(result.groups[group][valueKey], quotas)}</td>
          <td className={metric?.relation === 'above' ? 'sim-exceeded' : ''} data-testid={`sim-balance-${group}-${key}`}>
            <strong>{metric?.status === 'available' ? amount(metric.balance, quotas) : 'Pendente'}</strong>
            {metric?.status === 'available' && <small>{metric.relation === 'above' ? exceededLabel : metric.relation === 'equal' ? 'Sem saldo' : 'Disponível'}</small>}
          </td></tr>;
      })}</tbody>)}
    </table></div>
    {secretariat ? <p className="result-guidance">A base recebida já apresenta CCESP acima do limite em 1 cargo e 3,50 cotas. Essa diferença aparece mesmo antes de editar. Base e regras seguem em validação técnica; o resultado não representa aprovação.</p> : <p className="result-guidance">{referenceNote} Regras de reestruturação em validação técnica.</p>}
    {!available && <p className="field-error sim-inline-error">{availability?.message || 'A comparação com os limites depende da conferência da base.'}</p>}
  </section>;
}

export function SimulatorApp() {
  const [organizationId, setOrganizationId] = useState('sggd');
  const drafts = useRef(new Map());
  const returnFocus = useRef(false);
  useEffect(() => {
    if (returnFocus.current) document.getElementById('sim-organization')?.focus({ preventScroll: true });
  }, [organizationId]);
  const base = getSimulatorBase(organizationId);
  function selectOrganization(id, proposal) {
    if (id === organizationId) return;
    drafts.current.set(organizationId, proposal);
    returnFocus.current = true;
    setOrganizationId(id);
  }
  return <SiorgShell><OrganizationSimulator key={base.version} base={base}
    sessionDraft={drafts.current.get(organizationId)} onSelectOrganization={selectOrganization} /></SiorgShell>;
}

function OrganizationSimulator({ base, sessionDraft, onSelectOrganization }) {
  const secretariat = isSecretariat(base);
  const annex = annexLabel(base);
  const balanceTitle = secretariat ? 'Saldo da Secretaria' : `Saldo · ${organizationAcronym(base)}`;
  const basePositions = useMemo(() => new Map(base.positions.map(position => [position.id, position])), [base]);
  const baseUnits = useMemo(() => new Map(base.units.map(unit => [unit.id, unit])), [base]);
  const templates = useMemo(() => [...new Map(base.positions.map(position => [`${position.code}:${position.denomination}`, position])).values()]
    .sort((a, b) => a.group.localeCompare(b.group) || b.level - a.level || a.denomination.localeCompare(b.denomination, 'pt-BR')), [base]);
  const [initial] = useState(() => {
    const saved = initialProposal(base);
    return sessionDraft ? { ...saved, proposal: sessionDraft } : saved;
  });
  const [proposal, setProposal] = useState(initial.proposal);
  const [unitId, setUnitId] = useState(() => defaultUnit(base));
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [modal, setModal] = useState(null);
  const [draftName, setDraftName] = useState('');
  const [draft, setDraft] = useState({ templateId:'', quantity:'1', code:'' });
  const [draftError, setDraftError] = useState('');
  const [notice, setNotice] = useState('');
  const [actionFeedback, setActionFeedback] = useState('');
  const [restoreBranch, setRestoreBranch] = useState(false);
  const outputs = useMemo(() => deriveProposalOutputs(proposal, base), [proposal, base]);
  const calculation = outputs.calculation;
  const unit = proposal.units.find(item => item.id === unitId);
  const changedIds = new Set(outputs.summary.units.map(change => change.unitId));
  const hasChanges = calculation.changes.length > 0;
  const positions = sortProposalPositions(proposal.positions.filter(position => position.unitId === unitId));
  const positionResults = useMemo(() => new Map(calculation.positionResults.map(position => [position.id, position])), [calculation]);
  const unitResult = calculation.unitResults.find(item => item.unitId === unitId);
  const unitIssues = calculation.issues.filter(issue => issue.unitId === unitId && issue.scope !== 'base');
  const proposalIssues = calculation.issues.filter(issue => issue.scope !== 'base');
  const available = calculation.availability?.status === 'available';

  function selectUnit(id, clearFeedback = true) {
    setUnitId(id);
    setDraftError('');
    if (clearFeedback) setActionFeedback('');
    setNotice('Unidade selecionada. As alterações das outras unidades foram mantidas.');
  }

  function editUnit(id) {
    selectUnit(id);
    if (window.location.hash !== '#dados-atuais') window.location.hash = '#dados-atuais';
    document.getElementById('dados-atuais')?.scrollIntoView();
    document.getElementById('sim-unit')?.focus({ preventScroll: true });
  }

  function replaceProposal(next) {
    setProposal(next);
    setUnitId(defaultUnit(base));
    setOnlyChanged(false);
    setActionFeedback('');
    setNotice('Proposta aberta. Confira as unidades antes de continuar.');
  }

  function editQuantity(id, quantity) {
    setProposal(old => setPositionQuantity(old, id, quantity));
  }
  function announce() {
    setNotice(calculation.status === 'complete' && available ? `Proposta atualizada. ${activeGroups(base).map(group => {
      const balance = calculation.availability.proposedBalance.groups[group];
      return `${group}: proposta de ${amount(calculation.result.groups[group].quantity)}. ${balanceTitle}: ${amount(balance.quantity.balance)} em quantidade e ${amount(balance.quotas.balance, true)} cotas. ${balance.status === 'exceeded' ? 'Proposta acima da referência.' : 'Sem extrapolação numérica.'}`;
    }).join(' ')}` : 'Há campos pendentes. Complete as quantidades para atualizar o saldo.');
  }
  function handleAdd(event) {
    event.preventDefault();
    if (!draft.templateId) { setDraftError('Escolha o cargo ou a função.'); return; }
    if (!/^\d{1,128}$/.test(draft.quantity.trim()) || BigInt(draft.quantity.trim()) === 0n) { setDraftError('Informe uma quantidade inteira maior que zero.'); return; }
    try { setProposal(addPosition(proposal, {unitId, ...draft, code:draft.code || undefined}, base)); }
    catch (error) { setDraftError(error.message); return; }
    setModal(null);
    setDraftError('');
    setActionFeedback('Cargo ou função incluído. Cotas atualizadas.');
  }
  function handleRename(event) {
    event.preventDefault();
    if (!draftName.trim()) { setDraftError('Informe o nome da unidade.'); return; }
    setProposal(old => renameUnit(old, unitId, draftName.trim()));
    setModal(null);
    setDraftError('');
    setActionFeedback('Nome atualizado na proposta.');
  }

  return <div className="calculator-page simple-calculator simulator-page">
    <div className="page-title-row"><h1>Simulador de reestruturação</h1><span className="prototype-tag">{import.meta.env.DEV ? 'Protótipo local' : 'Protótipo para avaliação'}</span></div>
    <SimulatorGuide annex={annex} hasExcelModel={secretariat} />
    <ProposalSession proposal={proposal} base={base} initial={initial} hasChanges={hasChanges} onReplace={replaceProposal} />

    <section className="card simulator-context" id="dados-atuais" aria-labelledby="sim-context-title">
      <div className="worksheet-heading"><h2 id="sim-context-title">Escolha onde alterar</h2><span className="sim-progress" data-testid="changed-unit-count">{changedIds.size ? `${changedIds.size} unidade${changedIds.size > 1 ? 's' : ''} com alterações` : 'Proposta igual à base'}</span></div>
      <div className="context-fields">
        <div className="field"><div className="field-label"><label htmlFor="sim-organization">Órgão</label><InfoHelp label="Órgão ou entidade" text="Escolha o quadro de referência da simulação. Cada órgão tem um rascunho separado neste navegador." /></div><SearchPicker id="sim-organization" options={organizations} selectedId={base.organizationId}
          labels={organizationLabels} onSelect={id => onSelectOrganization(id, proposal)} /></div>
        <div className="field">
          <div className="field-label"><label htmlFor="sim-unit">Unidade</label><InfoHelp label="Unidade" text="A tabela mostra apenas os cargos e funções diretamente alocados nesta unidade, sem somar as subordinadas. Trocar de unidade mantém sua proposta. O saldo considera todas as unidades do órgão." /></div>
          <UnitPicker id="sim-unit" units={proposal.units} originalUnits={baseUnits} selectedId={unitId} changedIds={changedIds} onlyChanged={onlyChanged} onSelect={selectUnit} />
        </div>
      </div>
      <UnitPath proposal={proposal} unitId={unitId} label="Caminho da unidade" className="sim-selected-path" />
      <details className="sim-search"><summary>Filtrar unidades</summary><label className="sim-checkbox"><input type="checkbox" checked={onlyChanged} onChange={event => setOnlyChanged(event.target.checked)} />Somente unidades alteradas</label></details>
      <StructureTree proposal={proposal} selectedId={unitId} onSelect={selectUnit} />
      <p className="scope-caption">{base.name} · {secretariat ? 'Decreto nº 70.755/2026' : base.allocationSource.label.split(' · ')[0]} · em validação técnica.</p>
    </section>

    <PositionConsult base={base} proposal={proposal} positionResults={positionResults}
      onEditUnit={editUnit} />

    <div className="live-balance sim-live" aria-labelledby="sim-balance-title">
      <div className="sim-balance-heading">
        <strong id="sim-balance-title">{balanceTitle}</strong>
        <div className="sim-balance-links">
          <a href="#resultados">Ver cálculo <Icon name="arrow-down" /></a>
          <a href="#resumo-alteracoes">Ver alterações <Icon name="arrow-down" /></a>
        </div>
      </div>
      <div className="sim-balance-groups">{activeGroups(base).map(group => {
        const metrics = available ? calculation.availability.proposedBalance.groups[group] : null;
        return <div className={`live-balance-group ${metrics?.status || 'pending'}`} key={group} data-testid={`live-${group}`}>
          <strong className="sim-balance-species">{group}</strong>
          {metrics?.quantity.status === 'available' && metrics?.quotas.status === 'available'
            ? <div className="sim-balance-metrics">
              <span><strong>{amount(metrics.quantity.balance)}</strong><span>{quantityLabel(metrics.quantity.balance, group)}</span></span>
              <span><strong>{amount(metrics.quotas.balance, true)}</strong><span>cotas</span></span>
            </div>
            : <span className="sim-balance-pending">Cálculo pendente</span>}
        </div>;
      })}</div>
      <p className="sim-balance-legend">
        <span><strong>Negativo</strong> acima da referência</span>
        <span><strong>Zero</strong> sem saldo</span>
        <span><strong>Positivo</strong> disponível</span>
      </p>
    </div>

    {proposalIssues.length > 0 && <div className="sim-pending" role="alert"><strong>Há {proposalIssues.length} campo(s) para conferir.</strong> O saldo fica pendente até corrigir a proposta. {[...new Set(proposalIssues.map(issue => issue.unitId).filter(Boolean))].map(id => <button key={id} className="text-button" onClick={() => selectUnit(id)}>Conferir {proposal.units.find(item => item.id === id)?.name}</button>)}</div>}

    <section className="card sim-editor" aria-labelledby="sim-unit-title">
      <div className="worksheet-heading"><div><span className="sim-eyebrow">Sua proposta · alocação direta</span><h2 id="sim-unit-title"><UnitName unit={unit} original={baseUnits.get(unit.id)} /></h2>{unit.parentName && <p className="sim-parent">Vínculo na proposta: {unit.parentUnitId ? proposal.units.find(item => item.id === unit.parentUnitId)?.name || unit.parentName : unit.parentName}</p>}{unit.documentGroup && <p className="sim-parent">Bloco no ato: {unit.documentGroup}</p>}</div><button className="text-button" disabled={unit.removed} onClick={() => { setDraftName(unit.name); setDraftError(''); setModal('rename'); }}>Renomear</button></div>
      <p className={`sim-action-feedback${actionFeedback ? ' has-message' : ''}`} role="status">{actionFeedback}</p>
      <UnitActions proposal={proposal} base={base} unit={unit}
        onChange={(next, message) => { setProposal(next); setActionFeedback(message); }}
        onSelect={id => selectUnit(id, false)} />
      <StructureAlerts outputs={outputs} proposal={proposal} unitId={unitId} onSelect={selectUnit} />
      <p className="proposal-hint">Edite a coluna <strong>Proposta</strong> com a quantidade final. O alocado na base fica preservado.</p>
      <div className="sim-position-scroll"><table className="sim-position-table">
        <caption className="sr-only">Cargos e funções diretamente alocados em {unit.name}</caption>
        <thead><tr><th scope="col">Cargo / função</th><th scope="col">Alocado<small>Base</small></th><th scope="col">Proposta<InfoHelp label="Quantidade proposta" text="Digite a quantidade final deste cargo ou função na unidade. Exemplo: se há 2 e você deseja mais 1, digite 3. Zero retira o item da proposta. Vazio deixa o cálculo pendente." /></th><th scope="col">Cotas<InfoHelp label="Cotas propostas" text="Multiplique a quantidade proposta pela cota unitária do nível indicado no código. Confira os totais e o saldo na seção Cotas." /><small>Propostas</small></th><th scope="col"><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{positions.map(position => {
          const original = basePositions.get(position.id), computed = positionResults.get(position.id);
          const changed = !original || position.quantity.trim() !== original.quantity || position.code !== original.code;
          const removed = /^0+$/.test(position.quantity.trim());
          const invalid = computed?.status !== 'complete';
          return <tr key={position.id} className={removed ? 'sim-removed' : changed ? 'sim-changed' : ''}>
            <th scope="row"><strong>{position.denomination}</strong><small>{position.code}</small><CodeEditor position={position} proposal={proposal} base={base} onChange={(next, message) => { setProposal(next); setActionFeedback(message); }} />{removed ? <span className="sim-row-tag">Retirado da proposta</span> : !original ? <span className="sim-row-tag">Incluído na proposta</span> : null}</th>
            <td>{original ? amount(original.quantity) : '0'}</td>
            <td className="sim-quantity-cell"><label className="sr-only" htmlFor={`qty-${position.id}`}>Quantidade proposta de {position.denomination}, {position.code}, linha {position.sourceRow || position.id}</label><input id={`qty-${position.id}`} disabled={unit.removed} inputMode="numeric" value={position.quantity} aria-invalid={invalid} aria-describedby={invalid ? `error-${position.id}` : undefined} onChange={event => editQuantity(position.id, event.target.value)} onBlur={announce} />{invalid && <small className="field-error" id={`error-${position.id}`}>{computed?.issues?.[0]?.message || 'Informe uma quantidade inteira, a partir de zero.'}</small>}</td>
            <td>{amount(computed?.quotaCents, true)}</td>
            <td>{!unit.removed && (changed && original ? <button className="icon-button" aria-label={`Restaurar ${position.denomination}, ${position.code}, linha ${position.sourceRow}`} onClick={() => { setProposal(old=>setPositionQuantity(setPositionCode(old,position.id,original.code,base),position.id,original.quantity)); setNotice('Quantidade e código restaurados nesta linha.'); }}><Icon name="arrow-rotate-left" /></button> : (!removed || !original) && <button className="icon-button" aria-label={`Retirar ${position.denomination}, ${position.code}, linha ${position.sourceRow || position.id}`} onClick={() => { setProposal(old => removePosition(old, position.id)); setNotice('Item retirado da proposta. A base original permanece preservada.'); }}><Icon name="trash-can" /></button>)}</td>
          </tr>;
        })}</tbody>
      </table></div>
      {positions.length === 0 && <p className="worksheet-empty">Esta unidade não tem cargos ou funções diretamente alocados na base.</p>}
      <div className="sim-unit-totals" aria-label="Totais propostos nesta unidade">{activeGroups(base).map(group => <span key={group}><strong>{group}</strong> {amount(unitResult?.groups[group]?.quantity)} {quantityLabel(unitResult?.groups[group]?.quantity, group)} · {amount(unitResult?.groups[group]?.quotaCents, true)} cotas</span>)}</div>
      {unitIssues.length > 0 && <p className="field-error sim-inline-error">Confira os campos desta unidade antes de concluir.</p>}
      <div className="worksheet-foot"><button className="button secondary" disabled={unit.removed} onClick={() => { setDraft({templateId:'',quantity:'1',code:''}); setDraftError(''); setModal('add'); }}><Icon name="plus" /> Incluir cargo ou função</button><button className="button secondary" disabled={!changedIds.has(unitId) || !baseUnits.has(unitId)} onClick={() => {setRestoreBranch(false);setDraftError('');setModal('reset-unit');}}>Restaurar esta unidade</button></div>
    </section>

    <OrganizationResults calculation={calculation} base={base} />
    <ProposalOutputs proposal={proposal} base={base} outputs={outputs} onEditUnit={editUnit} />
    <details className="card reference-card sim-sources"><summary>Base utilizada e conferência dos dados</summary><div className="reference-content">{secretariat ? <><p><strong>Estrutura:</strong> SGGD- TESTE1.xlsx, aba Reestruturação, recebida pelo SharePoint em 19/10/2026, conferida com SGGD-SGGD (1).xlsx em 22/10/2026. Os {base.positions.length} registros de cargos e funções em {base.units.length} unidades mantêm os mesmos nomes, códigos, vínculos, quantitativos e cotas nos dois modelos.</p><p><strong>Alocação do Anexo II:</strong> 500 cargos/funções, sendo 299 CCESP e 201 FCESP. Os totais foram confrontados com a base da calculadora. <strong>Limites do Anexo III:</strong> 499 cargos/funções, sendo 298 CCESP e 201 FCESP.</p><p>A conferência de 16/11/2026 reproduziu as 407 linhas publicadas. O Decreto nº 70.963/2026 trata da classificação orçamentária.</p><p><a href="https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70963-06.11.2026.html" target="_blank" rel="noreferrer">Decreto nº 70.963/2026</a></p></> : <><p>{base.notice || 'Quadro de cargos e funções conferido com o ato publicado.'}</p><p>{base.positions.length} registros oficiais em {base.units.length} unidades ou blocos. A árvore mostra os vínculos confirmados nos atos e os criados na proposta. As demais unidades ficam com o vínculo em aberto.</p>
      {base.legacyReference && <p><strong>{base.legacyReference.label}:</strong> {activeGroups(base).map(group => {
        const row = base.legacyReference.totals.groups[group];
        return `${group} ${amount(row.quantity)} · ${amount(row.quotaCents, true)} cotas`;
      }).join(' | ')}. O saldo usa a referência identificada no quadro publicado.</p>}</>}{available && (secretariat
      ? Object.entries(calculation.availability.sourceLabels).filter(([key]) => key !== 'scope')
        .map(([key, source]) => ({ ...source, label: `${key === 'limits' ? 'Limites' : 'Alocação'} · ${source.label}` }))
      : base.sources).map(source => <p key={source.label}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></p>)}<p>A troca de unidade é apenas um filtro da tela. Cada registro entra uma vez no total; as unidades subordinadas são editadas separadamente. Não há compensação entre CCESP e FCESP.</p></div></details>
    <References />
    <p className="session-note">As alterações são salvas neste navegador. Baixe uma cópia da proposta para guardar o trabalho ou continuar em outro computador.</p>
    <div className="sr-only" role="status" aria-live="polite">{notice}</div>

    {modal === 'rename' && <Modal title="Renomear unidade na proposta" onClose={() => setModal(null)}><form onSubmit={handleRename}><label className="sim-form-label" htmlFor="unit-name">Nome proposto</label><input id="unit-name" className="sim-modal-input" value={draftName} maxLength={180} onChange={event => { setDraftName(event.target.value); setDraftError(''); }} autoFocus /><p className="sim-modal-hint">Esta ação altera o nome na proposta. Os cargos, seus códigos e os vínculos são preservados. Se o novo nome indicar outro tipo ou nível de unidade, confira o enquadramento com a área técnica.</p>{draftError && <p role="alert" className="field-error">{draftError}</p>}<div className="sim-modal-actions"><button className="button secondary" type="button" onClick={() => setModal(null)}>Cancelar</button><button className="button primary" type="submit">Aplicar nome</button></div></form></Modal>}
    {modal === 'add' && <Modal title="Incluir cargo ou função" onClose={() => setModal(null)}><form onSubmit={handleAdd}><label className="sim-form-label" htmlFor="position-template">Cargo / função do modelo {organizationAcronym(base)}</label><select className="sim-modal-input" id="position-template" value={draft.templateId} onChange={event => { setDraft(old => ({...old,templateId:event.target.value,code:templates.find(item=>item.id===event.target.value)?.code || ''})); setDraftError(''); }} autoFocus><option value="">Selecione</option>{templates.map(position => <option key={position.id} value={position.id}>{position.code} · {position.denomination}</option>)}</select><label className="sim-form-label" htmlFor="position-new-code">{base.positionCodeFormat === "level" ? "Nível proposto" : "Código proposto"}</label><select id="position-new-code" className="sim-modal-input" value={draft.code} onChange={event=>setDraft(old=>({...old,code:event.target.value}))}><option value="">Código do modelo escolhido</option>{positionCodesFor(base).map(code=><option key={code}>{code}</option>)}</select><label className="sim-form-label" htmlFor="position-new-quantity">Quantidade a incluir nesta unidade</label><input className="sim-modal-input" id="position-new-quantity" inputMode="numeric" value={draft.quantity} onChange={event => { setDraft(old => ({...old,quantity:event.target.value})); setDraftError(''); }} /><p className="sim-modal-hint">A denominação vem do modelo escolhido. O código pode ser ajustado; a cota e os alertas acompanham sua seleção.</p>{draftError && <p role="alert" className="field-error">{draftError}</p>}<div className="sim-modal-actions"><button className="button secondary" type="button" onClick={() => setModal(null)}>Cancelar</button><button className="button primary" type="submit">Incluir na proposta</button></div></form></Modal>}
    {modal === 'reset-unit' && <Modal title="Restaurar esta unidade?" onClose={() => setModal(null)} actions={<><button className="button secondary" onClick={() => setModal(null)}>Manter alterações</button><button className="button primary" onClick={() => { try {setProposal(resetUnit(proposal, unitId, base, {includeDescendants:restoreBranch}));setModal(null);setActionFeedback('Unidade restaurada para os dados da base.');}catch(error){setDraftError(error.message);} }}>Restaurar unidade</button></>}><p>O nome e os quantitativos de <strong>{unit.name}</strong> voltarão à base. As alterações das outras unidades serão mantidas.</p><label className="sim-checkbox"><input type="checkbox" checked={restoreBranch} onChange={event=>setRestoreBranch(event.target.checked)} />Restaurar também as unidades subordinadas</label>{draftError&&<p className="field-error" role="alert">{draftError}</p>}</Modal>}
  </div>;
}
