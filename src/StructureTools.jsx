import { useMemo, useState } from 'react';
import { Modal } from './App.jsx';
import { positionCodesFor } from './structure-codes.mjs';
import { annexLabel, isSecretariat } from './data/simulator-bases.mjs';
import { createUnit, moveUnit, removeUnit, getExternalParentNames, setPositionCode } from './structure-proposal.mjs';
import { SearchPicker, normalizePickerText, pickerAlphabet } from './SearchPicker.jsx';
import './structure-tools.css';

const TYPES = [['other','Outra unidade'],['assessoria','Assessoria'],['diretoria','Diretoria'],['diretoria-geral','Diretoria Geral'],['coordenadoria','Coordenadoria'],['coordenadoria-geral','Coordenadoria Geral'],['divisao','Divisão'],['servico','Serviço'],['secao','Seção'],['subsecretaria','Subsecretaria'],['ouvidoria','Ouvidoria'],['integridade','Integridade']];
export const proposedParentName = (unit, proposal) => proposal.units.find(parent => parent.id === unit.parentUnitId)?.name || unit.parentName || 'Vínculo não informado';

function descendants(proposal, id) {
  const ids = new Set([id]);
  for (let index=0; index<proposal.units.length; index++) for (const unit of proposal.units) if (ids.has(unit.parentUnitId)) ids.add(unit.id);
  return ids;
}

/** Follow identified links only. A matching name never establishes a parent. */
export function getUnitPath(proposal, unitId) {
  const units = new Map((proposal?.units || []).map(unit => [unit.id, unit]));
  const segments = [], notices = [], visited = new Set();
  let current = units.get(unitId);
  if (!current) return { segments: [{ id: 'missing', name: 'Unidade não identificada', kind: 'open' }], notices };
  while (current) {
    if (visited.has(current.id)) {
      segments.unshift({ id: 'cycle', name: 'Vínculo circular — caminho interrompido', kind: 'open' });
      break;
    }
    visited.add(current.id);
    segments.unshift({ id: current.id, name: current.name || 'Nome da unidade pendente', kind: 'unit', removed: !!current.removed });
    if (current.parentUnitId) {
      const parent = units.get(current.parentUnitId);
      if (!parent) {
        segments.unshift({ id: `open:${current.id}`, name: current.parentName || 'Unidade superior não identificada', kind: 'open' });
        notices.push('Vínculo em aberto: a unidade superior indicada não foi identificada no quadro.');
        break;
      }
      current = parent;
      continue;
    }
    const external = current.hierarchyStatus === 'model-parent-outside-units'
      || (Object.hasOwn(current.mutation || {}, 'parentUnitId') && current.mutation.parentUnitId === null);
    if (external && current.parentName) {
      segments.unshift({ id: `external:${current.id}`, name: current.parentName, kind: 'external' });
      notices.push('O primeiro vínculo é informado no modelo e fica fora deste quadro.');
    } else {
      segments.unshift({ id: `open:${current.id}`, name: current.parentName || 'Unidade superior não identificada', kind: 'open' });
      notices.push(current.hierarchyStatus === 'model-parent-ambiguous'
        ? 'Vínculo em aberto: o nome do superior corresponde a mais de uma unidade; nenhuma foi presumida.'
        : 'Vínculo em aberto: não há identificação da unidade superior para continuar o caminho.');
    }
    break;
  }
  return { segments, notices };
}

export function UnitPath({ proposal, unitId, label = 'Caminho da unidade', className = '' }) {
  const path = getUnitPath(proposal, unitId);
  return <div className={`sim-unit-path ${className}`.trim()}>
    <p className="sim-unit-path-label">{label}</p>
    <ol aria-label={label}>{path.segments.map(segment => <li key={segment.id}
      className={segment.kind === 'open' ? 'sim-unit-path-open' : undefined}
      aria-current={segment.id === unitId ? 'location' : undefined}>
      {segment.name}{segment.kind === 'open' && <span> (vínculo em aberto)</span>}
      {segment.kind === 'external' && <span> (fora do quadro)</span>}
      {segment.removed && <span> (retirada da proposta)</span>}
    </li>)}</ol>
    {path.notices.map(notice => <p className="sim-unit-path-note" key={notice}>{notice}</p>)}
  </div>;
}

function commandContext(proposal, unitId) {
  const rows = proposal.positions.filter(row => row.unitId === unitId);
  if (rows.some(row => typeof row.quantity !== 'string' || !/^\d{1,128}$/.test(row.quantity.trim()))) {
    return 'Quantidades pendentes; nível de comando a conferir';
  }
  const levels = [...new Set(rows.filter(row => BigInt(row.quantity.trim()) > 0n)
    .map(row => /^(?:CCESP|FCESP) 1\.(\d{2})$/.exec(row.code)?.[1]).filter(Boolean).map(Number))].sort((a, b) => a - b);
  return levels.length ? `Código de comando: ${levels.map(level => `nível ${level}`).join(', ')}` : 'Código de comando não identificado';
}

export function getDestinationOptions(proposal, base, movingUnitId = null) {
  const blockedIds = movingUnitId ? descendants(proposal, movingUnitId) : new Set();
  const available = getExternalParentNames(base).map(name => ({
    id: `external:${encodeURIComponent(name)}`, name,
    description: 'Vínculo externo informado no modelo · fora do quadro de unidades',
    search: normalizePickerText(`${name} vínculo externo fora do quadro`),
    selectedLabel: `${name} · fora do quadro`, external: true,
  }));
  const blocked = [];
  const contexts = new Map();
  const contextKey = unit => JSON.stringify([normalizePickerText(unit.name || ''),
    unit.parentUnitId || normalizePickerText(unit.parentName || '')]);
  for (const unit of proposal.units) {
    const key = contextKey(unit);
    contexts.set(key, (contexts.get(key) || 0) + 1);
  }
  for (const unit of proposal.units) {
    const path = getUnitPath(proposal, unit.id);
    const superior = path.segments.slice(0, -1).map(segment => `${segment.name}${segment.kind === 'open' ? ' (vínculo em aberto)' : segment.kind === 'external' ? ' (fora do quadro)' : ''}`).join(' → ');
    const command = commandContext(proposal, unit.id);
    const homonym = contexts.get(contextKey(unit)) > 1;
    const location = homonym ? unit.sourceRow ? `Linha ${unit.sourceRow} do modelo` : `Unidade criada ${unit.order + 1}` : '';
    const reason = unit.removed ? 'Unidade retirada da proposta'
      : unit.id === movingUnitId ? 'A própria unidade não pode ser seu destino'
        : blockedIds.has(unit.id) ? 'Unidade subordinada: este vínculo criaria um ciclo' : '';
    const option = { id: unit.id, name: unit.name || 'Nome da unidade pendente',
      description: [`Superior: ${superior}`, command, location].filter(Boolean).join(' · '),
      search: normalizePickerText([unit.name, superior, command, location].join(' ')),
      selectedLabel: [unit.name, proposedParentName(unit, proposal), location].filter(Boolean).join(' · '), reason };
    (reason ? blocked : available).push(option);
  }
  const sort = (a, b) => pickerAlphabet.compare(a.name, b.name) || pickerAlphabet.compare(a.description, b.description);
  return { available: available.sort(sort), blocked: blocked.sort(sort) };
}

const destinationLabels = {
  placeholder: 'Nome, unidade superior ou nível do comando',
  hint: 'Pesquise pelo nome, por um superior ou por “nível 15”, por exemplo. Confirme uma opção para selecionar.',
  list: 'Destinos disponíveis, com caminho hierárquico',
  show: 'Mostrar destinos disponíveis', hide: 'Recolher destinos',
  empty: 'Nenhum destino disponível corresponde à busca. Confira também os destinos indisponíveis abaixo.',
  count: count => `${count} ${count === 1 ? 'destino disponível' : 'destinos disponíveis'}`,
};

function DestinationPicker({ proposal, base, movingUnitId, selectedId, onSelect }) {
  const options = useMemo(() => getDestinationOptions(proposal, base, movingUnitId), [proposal, base, movingUnitId]);
  const selected = options.available.find(option => option.id === selectedId);
  return <div className="sim-destination-picker">
    <SearchPicker id="unit-parent" options={options.available} selectedId={selectedId} onSelect={onSelect} labels={destinationLabels} />
    {selected && (selected.external
      ? <p className="sim-destination-selection"><strong>Destino selecionado:</strong> {selected.name} · vínculo externo informado no modelo.</p>
      : <><UnitPath proposal={proposal} unitId={selected.id} label="Destino selecionado" /><p className="sim-unit-path-note">{commandContext(proposal, selected.id)}</p></>)}
    {options.blocked.length > 0 && <details className="sim-destination-blocked"><summary>Destinos indisponíveis ({options.blocked.length})</summary>
      <p>As restrições existentes impedem selecionar unidades retiradas e, em uma transferência, a própria unidade ou suas subordinadas.</p>
      <ul>{options.blocked.map(option => <li key={option.id}><strong>{option.name}</strong><span>{option.reason}</span><small>{option.description}</small></li>)}</ul>
    </details>}
    <p className="sim-destination-note">Selecionar um destino não confirma o enquadramento da estrutura. Confira os alertas após aplicar a mudança.</p>
  </div>;
}
const parentValue = value => value.startsWith('external:') ? { parentUnitId:null, parentName:decodeURIComponent(value.slice(9)) } : {parentUnitId:value};

export function UnitActions({ proposal, base, unit, onChange, onSelect }) {
  const [modal,setModal] = useState(null), [name,setName] = useState(''), [type,setType] = useState('other'), [parent,setParent] = useState(''), [wholeBranch,setWholeBranch] = useState(false), [error,setError] = useState('');
  const branch = descendants(proposal,unit.id);
  const activeChildren = proposal.units.filter(item => item.id !== unit.id && branch.has(item.id) && !item.removed);
  const directQuantity = proposal.positions.filter(row => row.unitId === unit.id && typeof row.quantity === 'string' && /^\d{1,128}$/.test(row.quantity.trim())).reduce((sum,row)=>sum+BigInt(row.quantity.trim()),0n).toString();
  function open(mode) {setModal(mode);setError('');setName('');setType('other');setWholeBranch(false);setParent(mode === 'create' ? unit.removed ? '' : unit.id : '');}
  function submit(event) {
    event.preventDefault();setError('');
    try {
      if (modal === 'create') {
        if (!name.trim() || !parent) throw new Error('Informe o nome e a unidade superior.');
        const next = createUnit(proposal,{name:name.trim(),unitType:type,...parentValue(parent)},base);
        onChange(next,'Unidade criada. Inclua os cargos e funções para completar a proposta.');onSelect(next.units.at(-1).id);
      } else if (modal === 'move') {
        if (!parent) throw new Error('Escolha a nova unidade superior.');
        const {parentUnitId,parentName} = parentValue(parent);
        onChange(moveUnit(proposal,unit.id,parentUnitId,{parentName},base),'Vínculo atualizado. As quantidades e cotas foram mantidas.');
      } else onChange(removeUnit(proposal,unit.id,{includeDescendants:wholeBranch}),'Unidade retirada da proposta. A alocação original permanece disponível para comparação.');
      setModal(null);
    } catch (reason) {setError(reason.message);}
  }
  return <><details className="sim-unit-actions"><summary>Ações de unidades</summary><div><button className="text-button" onClick={()=>open('create')}>Criar unidade</button><button className="text-button" disabled={unit.removed} onClick={()=>open('move')}>Transferir unidade</button><button className="text-button danger-text" disabled={unit.removed} onClick={()=>open('remove')}>Retirar unidade</button></div></details>
    {modal && <Modal title={modal === 'create' ? 'Criar unidade na proposta' : modal === 'move' ? 'Transferir unidade' : 'Retirar unidade da proposta?'} onClose={()=>setModal(null)}><form onSubmit={submit}>
      {modal === 'create' ? <><label className="sim-form-label" htmlFor="new-unit-name">Nome da nova unidade</label><input id="new-unit-name" className="sim-modal-input" value={name} maxLength={180} onChange={event=>setName(event.target.value)} autoFocus /><label className="sim-form-label" htmlFor="new-unit-type">Tipo de unidade</label><select id="new-unit-type" className="sim-modal-input" value={type} onChange={event=>setType(event.target.value)}>{TYPES.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></> : <p className="sim-modal-hint"><strong>{unit.name}</strong>{modal === 'move' && <><br />Vínculo atual: {proposedParentName(unit,proposal)}. Os cargos e as unidades subordinadas acompanham a transferência.</>}</p>}
      {modal !== 'remove' ? <><label className="sim-form-label" htmlFor="unit-parent">{modal === 'move' ? 'Nova unidade superior' : 'Unidade superior'}</label><DestinationPicker proposal={proposal} base={base} movingUnitId={modal === 'move' ? unit.id : null} selectedId={parent} onSelect={id=>{setParent(id);setError('');}} />{modal === 'create' && <p className="sim-modal-hint">Depois de criar, use “Incluir cargo ou função”. {isSecretariat(base) && "O tipo orienta os avisos estruturais."}</p>}</> : <><p className="sim-modal-hint">A retirada deixará a quantidade de cargos/funções desta unidade em zero. Eles sairão do {annexLabel(base)}. Quantidade atual na proposta: {directQuantity}.</p>{activeChildren.length > 0 && <><label className="sim-checkbox"><input type="checkbox" checked={wholeBranch} onChange={event=>setWholeBranch(event.target.checked)} />Retirar também {activeChildren.length === 1 ? 'a unidade subordinada e seus cargos/funções' : `as ${activeChildren.length} unidades subordinadas e seus cargos/funções`}</label><p className="sim-modal-hint">Para manter as subordinadas, cancele e transfira-as antes de retirar esta unidade.</p></>}</>}
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="sim-modal-actions"><button type="button" className="button secondary" onClick={()=>setModal(null)}>Cancelar</button><button className="button primary" type="submit" disabled={modal === 'remove' && activeChildren.length > 0 && !wholeBranch}>{modal === 'create' ? 'Criar unidade' : modal === 'move' ? 'Aplicar transferência' : 'Confirmar retirada'}</button></div>
    </form></Modal>}
  </>;
}

export function CodeEditor({ position,proposal,base,onChange }) {
  const [open,setOpen] = useState(false), [code,setCode] = useState(position.code), [error,setError] = useState('');
  return <><button className="sim-code-edit" disabled={proposal.units.find(unit=>unit.id===position.unitId)?.removed} onClick={()=>{setCode(position.code);setError('');setOpen(true);}} aria-label={`Alterar código de ${position.denomination}, ${position.code}, linha ${position.sourceRow || position.id}`}>{base.positionCodeFormat === "level" ? "Alterar nível" : "Alterar código"}</button>{open && <Modal title="Alterar código na proposta" onClose={()=>setOpen(false)}><form onSubmit={event=>{event.preventDefault();try{onChange(setPositionCode(proposal,position.id,code,base),'Código atualizado. Confira os alertas da unidade.');setOpen(false);}catch(reason){setError(reason.message);}}}><p className="sim-modal-hint"><strong>{position.denomination}</strong><br />A denominação permanece a mesma. A espécie, o nível e a cota unitária acompanham o código escolhido. O simulador pode sinalizar incompatibilidade. Se aparecer um aviso, revise o código ou confirme o enquadramento com a área técnica antes de usar a minuta.</p><label className="sim-form-label" htmlFor="proposed-position-code">Código proposto</label><select className="sim-modal-input" id="proposed-position-code" value={code} onChange={event=>setCode(event.target.value)}>{positionCodesFor(base, position.code).map(value=><option key={value}>{value}</option>)}</select>{error&&<p className="field-error" role="alert">{error}</p>}<div className="sim-modal-actions"><button className="button secondary" type="button" onClick={()=>setOpen(false)}>Cancelar</button><button className="button primary" type="submit">Aplicar código</button></div></form></Modal>}</>;
}

export function StructureTree({ proposal,selectedId,onSelect }) {
  const units=proposal.units.filter(unit=>!unit.removed), ids=new Set(units.map(unit=>unit.id));
  function render(unit,trail=new Set()) {
    if(trail.has(unit.id))return null;
    const next=new Set([...trail,unit.id]), children=units.filter(other=>other.parentUnitId===unit.id);
    return <li key={unit.id}><button aria-current={unit.id===selectedId?'true':undefined} onClick={()=>onSelect(unit.id)}>{unit.name}</button>{!ids.has(unit.parentUnitId)&&<small>{unit.parentName || 'Vínculo não informado'}</small>}{children.length>0&&<ul>{children.map(child=>render(child,next))}</ul>}</li>;
  }
  return <details className="sim-tree"><summary>Ver estrutura em árvore</summary><p>Escolha uma unidade na árvore para editar. Vínculos ainda ambíguos no modelo aparecem sem subordinação presumida.</p><div className="sim-tree-scroll"><ul>{units.filter(unit=>!ids.has(unit.parentUnitId)).map(unit=>render(unit))}</ul></div></details>;
}
