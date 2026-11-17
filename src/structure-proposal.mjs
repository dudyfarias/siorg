import { calculateScenario, catalogue } from './calculator.mjs';
import { getScope } from './organization-profiles.mjs';
import { calculateAgencyAvailability, calculateQuotaAvailability } from './quota-availability.mjs';
import { sggdStructure } from './data/sggd-structure.mjs';
import { getSimulatorBase } from './data/simulator-bases.mjs';
import { positionCodesFor } from './structure-codes.mjs';

const GROUPS = ['CCESP', 'FCESP'];
const TEMPLATE_FIELDS = ['code', 'group', 'category', 'level', 'denomination', 'coefficientCents'];
const clone = value => structuredClone(value);
const list = value => Array.isArray(value) ? value : [];
const text = value => typeof value === 'string' && value.trim().length > 0;
const sameNumber = (a, b) => typeof a === 'string' && typeof b === 'string'
  && /^\d+$/u.test(a) && /^\d+$/u.test(b) && BigInt(a) === BigInt(b);
const has = (value, key) => Object.hasOwn(value || {}, key);
const unitDraft = unit => ({ ...clone(unit), origin: 'base', removed: false });
const cleanName = value => typeof value === 'string' ? value.replace(/\s+/gu, ' ').trim() : '';

function problem(code, field, message, scope, extra = {}) {
  return { code, field, message, severity: 'error', scope, ...extra };
}

function requireItem(items, id, label) {
  const found = list(items).find(item => item?.id === id);
  if (!found) throw new RangeError(`${label} não encontrado.`);
  return found;
}

function activeUnit(proposal, id) {
  const unit = requireItem(proposal?.units, id, 'Unidade');
  if (unit.removed) throw new RangeError('Restaure a unidade retirada antes de editá-la.');
  return unit;
}

/** External names come only from an explicit source link outside the unit table. */
export function getExternalParentNames(base = sggdStructure) {
  return [...new Set(list(base?.units).filter(unit => unit?.parentUnitId === null
    && unit.hierarchyStatus === 'model-parent-outside-units').map(unit => cleanName(unit.parentName)).filter(Boolean))];
}

function resolveParent(proposal, parentUnitId, parentName, movingId, base = sggdStructure) {
  if (parentUnitId === null) {
    const name = cleanName(parentName);
    if (!getExternalParentNames(base).includes(name)) throw new RangeError('Escolha um vínculo externo identificado no modelo documental.');
    return { parentUnitId: null, parentName: name };
  }
  const parent = activeUnit(proposal, parentUnitId);
  const visited = new Set();
  for (let cursor = parent; cursor; cursor = list(proposal.units).find(unit => unit.id === cursor.parentUnitId)) {
    if (cursor.id === movingId || visited.has(cursor.id)) throw new RangeError('A vinculação não pode criar um ciclo na estrutura.');
    visited.add(cursor.id);
  }
  return { parentUnitId: parent.id, parentName: parent.name };
}

function descendants(proposal, unitId, { activeOnly = false } = {}) {
  const found = new Set([unitId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const unit of list(proposal.units)) if (!found.has(unit.id) && found.has(unit.parentUnitId)
      && (!activeOnly || !unit.removed)) { found.add(unit.id); changed = true; }
  }
  found.delete(unitId);
  return [...found];
}

function parseProposedCode(value, base, templateCode) {
  if (base?.positionCodeFormat === 'level') {
    const code = typeof value === 'string' ? value.trim() : '';
    const match = /^CCESP nível (\d{2})$/u.exec(code);
    const level = Number(match?.[1]);
    const entry = catalogue.groups.CCESP.find(item => item.level === level);
    if (!entry || !base.positionCodes.includes(code)) throw new RangeError('Escolha um nível CCESP do quadro de referência.');
    return { code, group: 'CCESP', category: null, level, coefficientCents: entry.quotaCents };
  }
  const match = typeof value === 'string' && /^(CCESP|FCESP)\s*([1-5])\.(\d{2})$/u.exec(value.trim());
  const group = match?.[1], category = Number(match?.[2]), level = Number(match?.[3]);
  const entry = catalogue.groups[group]?.find(item => item.level === level);
  const code = `${group} ${category}.${String(level).padStart(2, '0')}`;
  if (!match || !entry || (!positionCodesFor(base, templateCode).includes(code)
    && !(base?.organizationId === 'sggd' && group === 'FCESP' && category === 1 && level === 18))) {
    throw new RangeError('Escolha um código disponível no quadro de referência deste órgão.');
  }
  return { code, group, category, level, coefficientCents: entry.quotaCents };
}

/** A serializable draft. Source objects remain untouched, including nested metadata. */
export function createStructureProposal(base) {
  return {
    schemaVersion: 1,
    organizationId: base?.organizationId,
    baseVersion: base?.version,
    units: list(base?.units).map(unitDraft),
    positions: list(base?.positions).map(position => ({ ...clone(position), origin: 'base', templateId: position.id })),
    nextPositionNumber: 1,
    nextUnitNumber: 1,
  };
}

export function setPositionQuantity(proposal, id, value) {
  const row = requireItem(proposal?.positions, id, 'Cargo ou função');
  activeUnit(proposal, row.unitId);
  return { ...proposal, positions: proposal.positions.map(position => position.id === id ? { ...position, quantity: value } : position) };
}

export function renameUnit(proposal, id, name) {
  activeUnit(proposal, id);
  return { ...proposal, units: proposal.units.map(unit => unit.id === id
    ? { ...unit, name, mutation: { ...unit.mutation, name } }
    : unit.parentUnitId === id && has(unit.mutation, 'parentUnitId') ? { ...unit, parentName: name } : unit) };
}

export function createUnit(proposal, { name, parentUnitId, parentName, unitType } = {}, base = sggdStructure) {
  const parent = resolveParent(proposal, parentUnitId, parentName, undefined, base);
  const ids = new Set(list(proposal.units).map(unit => unit.id));
  let serial = Number.isSafeInteger(proposal.nextUnitNumber) && proposal.nextUnitNumber > 0 ? proposal.nextUnitNumber : 1;
  while (ids.has(`proposal-unit-${serial}`)) serial += 1;
  const unit = { id: `proposal-unit-${serial}`, name: name ?? '', ...parent,
    origin: 'added', removed: false, order: proposal.units.length, sourceRow: null,
    hierarchyStatus: 'proposal-explicit', ...(unitType ? { unitType } : {}),
    mutation: { created: true, parentUnitId: parent.parentUnitId } };
  return { ...proposal, units: [...proposal.units, unit], nextUnitNumber: serial + 1 };
}

export function moveUnit(proposal, id, parentId, { parentName } = {}, base = sggdStructure) {
  activeUnit(proposal, id);
  const parent = resolveParent(proposal, parentId, parentName, id, base);
  return { ...proposal, units: proposal.units.map(unit => unit.id === id
    ? { ...unit, ...parent, mutation: { ...unit.mutation, parentUnitId: parent.parentUnitId } } : unit) };
}

/** Removing descendants is explicit. Otherwise transfer them before removing their parent. */
export function removeUnit(proposal, id, { includeDescendants } = {}) {
  activeUnit(proposal, id);
  const children = descendants(proposal, id, { activeOnly: true });
  if (children.length && includeDescendants !== true) throw new RangeError('A unidade tem subordinadas: escolha retirar o conjunto ou transfira as subordinadas antes de retirar só esta unidade.');
  const selected = new Set([id, ...(includeDescendants === true ? children : [])]);
  const ambiguous = proposal.units.some(unit => !unit.removed && !selected.has(unit.id)
    && !has(unit.mutation, 'parentUnitId') && unit.hierarchyStatus === 'model-parent-ambiguous'
    && list(unit.parentCandidates).some(candidate => selected.has(candidate)));
  if (ambiguous) throw new RangeError('Há vínculos ambíguos associados à unidade: defina explicitamente essas vinculações antes da retirada.');
  return { ...proposal,
    units: proposal.units.map(unit => selected.has(unit.id)
      ? { ...unit, removed: true, mutation: { ...unit.mutation, removed: true, removalRootId: id } } : unit),
    positions: proposal.positions.map(position => selected.has(position.unitId) ? { ...position, quantity: '0' } : position),
  };
}

export function setPositionCode(proposal, id, code, base) {
  const row = requireItem(proposal?.positions, id, 'Cargo ou função');
  activeUnit(proposal, row.unitId);
  const template = requireItem(base?.positions, row.templateId, 'Modelo documental');
  const parsed = parseProposedCode(code, base, template.code);
  return { ...proposal, positions: proposal.positions.map(position => {
    if (position.id !== id) return position;
    const changed = { ...position, ...parsed };
    if (TEMPLATE_FIELDS.every(field => changed[field] === template[field])) delete changed.codeOverride;
    else changed.codeOverride = { code: parsed.code, templateId: template.id, catalogueVersion: catalogue.version };
    return changed;
  }) };
}

/** New rows retain a documentary template; they do not authorize its organizational use. */
export function addPosition(proposal, { unitId, templateId, quantity, code } = {}, base) {
  const unit = activeUnit(proposal, unitId);
  const template = requireItem(base?.positions, templateId, 'Modelo documental');
  const ids = new Set(proposal.positions.map(position => position.id));
  let serial = Number.isSafeInteger(proposal.nextPositionNumber) && proposal.nextPositionNumber > 0 ? proposal.nextPositionNumber : 1;
  while (ids.has(`proposal-position-${serial}`)) serial += 1;
  const added = {
    ...clone(template), id: `proposal-position-${serial}`, unitId, unitName: unit.name,
    quantity: quantity === undefined ? '' : quantity, origin: 'added', templateId,
    sourceRow: null, documentaryRow: null,
  };
  const next = { ...proposal, positions: [...proposal.positions, added], nextPositionNumber: serial + 1 };
  return code === undefined ? next : setPositionCode(next, added.id, code, base);
}

/** Documentary rows remain explicitly zero for audit and restoration; added rows disappear. */
export function removePosition(proposal, id) {
  const row = requireItem(proposal?.positions, id, 'Cargo ou função');
  return row.origin === 'added'
    ? { ...proposal, positions: proposal.positions.filter(position => position.id !== id) }
    : setPositionQuantity(proposal, id, '0');
}

/** Reset only direct positions and the name of this unit; descendants are independent. */
export function resetUnit(proposal, unitId, base, { includeDescendants = false } = {}) {
  if (includeDescendants) {
    const ids = [unitId, ...descendants(proposal, unitId)];
    if (ids.some(id => !base.units.some(unit => unit.id === id))) throw new RangeError('O conjunto contém unidade nova sem base original; retire ou transfira essa unidade explicitamente antes de restaurar o conjunto.');
    let next = proposal;
    for (const id of ids) next = resetUnit(next, id, base);
    return next;
  }
  const unit = requireItem(base?.units, unitId, 'Unidade da base');
  requireItem(proposal?.units, unitId, 'Unidade');
  if (unit.parentUnitId && proposal.units.find(item => item.id === unit.parentUnitId)?.removed) throw new RangeError('Restaure a unidade superior antes de restaurar esta unidade.');
  const baseIds = new Set(base.positions.filter(position => position.unitId === unitId).map(position => position.id));
  const originals = new Map(base.positions.filter(position => position.unitId === unitId).map(position => [position.id,
    { ...clone(position), origin: 'base', templateId: position.id }]));
  const positions = [];
  for (const position of proposal.positions) {
    if (baseIds.has(position.id)) {
      if (originals.has(position.id)) positions.push(originals.get(position.id));
      originals.delete(position.id);
    } else if (position.unitId !== unitId) positions.push(position);
  }
  positions.push(...originals.values());
  const next = { ...proposal, units: proposal.units.map(item => item.id === unitId ? unitDraft(unit) : item), positions };
  const graphIssue = inspectUnitGraph(next.units).find(issue => issue.code === 'hierarchy_cycle');
  if (graphIssue) throw new RangeError('Restaurar o vínculo original criaria um ciclo; ajuste a vinculação proposta antes de restaurar.');
  return next;
}

function inspectUnits(units, scope) {
  const issues = [];
  if (!Array.isArray(units)) issues.push(problem('invalid_units', 'units', 'A estrutura deve conter uma lista de unidades.', scope));
  const ids = new Set();
  for (const [index, unit] of list(units).entries()) {
    const unitId = unit?.id;
    if (!text(unitId) || ids.has(unitId)) issues.push(problem('invalid_unit_id', `units.${index}.id`, 'Cada unidade precisa de um identificador único.', scope, { unitId }));
    ids.add(unitId);
    if (!text(unit?.name)) issues.push(problem('missing_unit_name', `units.${unitId}.name`, 'Informe o nome da unidade.', scope, { unitId }));
  }
  return issues;
}

function inspectUnitGraph(units) {
  const issues = [], index = new Map(list(units).filter(Boolean).map(unit => [unit.id, unit]));
  for (const unit of index.values()) {
    if (unit.removed) continue;
    if (unit.parentUnitId !== null && (!index.has(unit.parentUnitId) || index.get(unit.parentUnitId).removed)) {
      issues.push(problem('invalid_parent_unit', `units.${unit.id}.parentUnitId`, 'A unidade superior precisa existir e permanecer ativa na proposta.', 'proposal', { unitId: unit.id }));
      continue;
    }
    const visited = new Set([unit.id]);
    let next = index.get(unit.parentUnitId);
    while (next) {
      if (visited.has(next.id)) {
        issues.push(problem('hierarchy_cycle', `units.${unit.id}.parentUnitId`, 'A vinculação proposta forma um ciclo entre unidades.', 'proposal', { unitId: unit.id }));
        break;
      }
      visited.add(next.id);
      next = index.get(next.parentUnitId);
    }
  }
  return issues;
}

function sourceMatchesCanonical(base) {
  const canonical = getSimulatorBase(base?.organizationId);
  if (!canonical || base.version !== canonical.version || base.sourceAnnex !== canonical.sourceAnnex) return false;
  if (base === canonical) return true;
  const matches = (rows, expected, fields) => Array.isArray(rows) && rows.length === expected.length
    && expected.every(original => {
      const found = rows.filter(row => row?.id === original.id);
      return found.length === 1 && fields.every(field => JSON.stringify(found[0][field]) === JSON.stringify(original[field]));
    });
  return matches(base.units, canonical.units, ['id', 'name', 'parentName', 'parentUnitId', 'order', 'sourceRow', 'hierarchyStatus', 'parentCandidates', 'unitType', 'documentGroup'])
    && matches(base.positions, canonical.positions, ['id', 'unitId', 'unitName', ...TEMPLATE_FIELDS, 'quantity', 'sourceRow', 'documentaryRow'])
    && ['groups', 'positionCodes', 'positionCodeFormat', 'limits', 'allocationSource', 'originalReference'].every(field => JSON.stringify(base[field]) === JSON.stringify(canonical[field]));
}

function inspectPositions(positions, units, scope, base) {
  const issues = [], unitIds = new Set(list(units).map(unit => unit?.id)), counts = new Map();
  if (!Array.isArray(positions)) issues.push(problem('invalid_positions', 'positions', 'A estrutura deve conter uma lista de cargos e funções.', scope));
  for (const position of list(positions)) counts.set(position?.id, (counts.get(position?.id) || 0) + 1);
  const positionResults = list(positions).map((raw, index) => {
    const position = raw && typeof raw === 'object' ? raw : {};
    const { id, unitId, group, level } = position;
    const single = calculateScenario({ rows: [{ id: `position-${index}`, group, level, quantity: position.quantity }] });
    const computed = single.aggregate.rows[0];
    const rowIssues = single.issues.map(item => problem(item.code, `positions.${id ?? index}.quantity`, item.message, scope, { rowId: id, unitId }));
    const append = (code, field, message) => rowIssues.push(problem(code, `positions.${id ?? index}.${field}`, message, scope, { rowId: id, unitId }));
    if (!text(id) || counts.get(id) !== 1) append('invalid_position_id', 'id', 'Cada linha precisa de um identificador único.');
    if (!unitIds.has(unitId)) append('unknown_unit', 'unitId', 'O cargo ou função precisa pertencer a uma unidade da proposta.');
    const code = typeof position.code === 'string' ? position.code.replace(/\s+/gu, '') : '';
    const match = /^(CCESP|FCESP)([1-5])\.(\d{2})$/u.exec(code);
    const codeMatches = base?.positionCodeFormat === 'level'
      ? group === 'CCESP' && position.category === null && position.code === `CCESP nível ${String(level).padStart(2, '0')}`
      : match && match[1] === group && Number(match[2]) === position.category && Number(match[3]) === Number(level);
    if (!codeMatches) {
      append('invalid_position_code', 'code', 'Código, espécie, categoria e nível precisam corresponder ao modelo documental.');
    }
    if (!text(position.denomination)) append('missing_denomination', 'denomination', 'Informe a denominação documental do cargo ou função.');
    if (!sameNumber(position.coefficientCents, computed.coefficientCents)) append('coefficient_mismatch', 'coefficientCents', 'O valor unitário não corresponde à tabela de cotas usada pelo cálculo.');
    issues.push(...rowIssues);
    return { ...position, quantity: computed.quantity, enteredQuantity: computed.enteredQuantity,
      coefficientCents: computed.coefficientCents, quotaCents: rowIssues.length ? null : computed.quotaCents,
      status: rowIssues.length ? 'incomplete' : 'complete', issues: rowIssues };
  });
  return { positionResults, issues };
}

// Only the arithmetic adapter merges species/level; documentary positions are never merged.
function aggregateRows(positions) {
  const buckets = new Map();
  for (const position of positions) {
    const key = `${position.group}:${position.level}`;
    const bucket = buckets.get(key) || { id: `structure-${key}`, group: position.group, level: position.level, quantity: 0n, complete: true };
    bucket.complete &&= position.status === 'complete';
    if (position.status === 'complete') bucket.quantity += BigInt(position.quantity);
    buckets.set(key, bucket);
  }
  return [...buckets.values()].map(({ complete, quantity, ...row }) => ({ ...row, quantity: complete ? quantity.toString() : '' }));
}

function totalsMatch(calculation, totals) {
  return calculation.status === 'complete' && ['aggregate', ...GROUPS].every(key => {
    const actual = key === 'aggregate' ? calculation.aggregate : calculation.groups[key];
    const declared = key === 'aggregate' ? totals?.aggregate : totals?.groups?.[key];
    return sameNumber(actual.quantity, declared?.quantity) && sameNumber(actual.quotaCents, declared?.quotaCents);
  });
}

function referenceMatches(rows, canonical) {
  const normalize = values => new Map(values.map(row => [`${row.group}:${Number(row.level)}`, BigInt(row.quantity)]));
  const actual = normalize(rows), expected = normalize(canonical.rows);
  return [...new Set([...actual.keys(), ...expected.keys()])].every(key => (actual.get(key) ?? 0n) === (expected.get(key) ?? 0n));
}

function proposalMetadataIssues(proposal, base) {
  const issues = [], append = (code, field, message, extra) => issues.push(problem(code, field, message, 'proposal', extra));
  if (proposal?.schemaVersion !== 1 || proposal?.organizationId !== base?.organizationId || proposal?.baseVersion !== base?.version) {
    append('proposal_version_mismatch', 'baseVersion', 'A proposta precisa usar a organização e a versão da estrutura selecionada.');
  }
  const baseUnits = new Map(list(base?.units).filter(Boolean).map(unit => [unit.id, unit]));
  const proposalUnits = list(proposal?.units);
  for (const original of baseUnits.values()) if (!proposalUnits.some(unit => unit?.id === original.id)) {
    append('missing_base_unit', `units.${original.id}`, 'Preserve a unidade documental e use a ação de retirada para alterar a proposta.', { unitId: original.id });
  }
  for (const unit of proposalUnits) {
    const original = baseUnits.get(unit?.id), mutation = unit?.mutation || {};
    const addUnitIssue = message => append('unit_metadata_mismatch', `units.${unit?.id}`, message, { unitId: unit?.id });
    if (!unit || typeof unit.removed !== 'boolean' || (original ? unit.origin !== 'base' : unit.origin !== 'added')) addUnitIssue('A origem e a situação da unidade precisam corresponder às operações da proposta.');
    if (original) {
      if (['sourceRow', 'order', 'hierarchyStatus', 'parentCandidates', 'unitType', 'documentGroup'].some(field => JSON.stringify(unit?.[field]) !== JSON.stringify(original[field]))
        || has(mutation, 'created')) addUnitIssue('Preserve os metadados documentais da unidade original.');
      if (unit?.name !== original.name && mutation.name !== unit?.name) addUnitIssue('Use a ação de renomear para alterar o nome da unidade.');
      if ((unit?.parentUnitId !== original.parentUnitId || unit?.parentName !== original.parentName) && !has(mutation, 'parentUnitId')) addUnitIssue('Use a ação de transferir para alterar a vinculação da unidade.');
    } else if (!/^proposal-unit-\d+$/u.test(unit?.id || '') || mutation.created !== true
      || unit?.sourceRow !== null || unit?.hierarchyStatus !== 'proposal-explicit' || !has(mutation, 'parentUnitId')) {
      addUnitIssue('A unidade nova precisa ser criada pela operação de inclusão, sem atribuir origem documental.');
    }
    if (unit?.removed !== (mutation.removed === true)) addUnitIssue('A retirada da unidade precisa estar registrada na proposta.');
    if (has(mutation, 'parentUnitId')) {
      if (mutation.parentUnitId !== unit?.parentUnitId) addUnitIssue('O vínculo da unidade não corresponde à transferência registrada.');
      if (unit?.parentUnitId === null && !getExternalParentNames(base).includes(cleanName(unit?.parentName))) addUnitIssue('O vínculo externo precisa estar identificado no modelo; nomes ambíguos não são superiores presumidos.');
      if (unit?.parentUnitId !== null && !proposalUnits.some(item => item?.id === unit.parentUnitId)) addUnitIssue('A unidade superior indicada não existe na proposta.');
    }
  }
  const templates = new Map(list(base?.positions).filter(Boolean).map(position => [position.id, position]));
  const proposedIds = new Set(list(proposal?.positions).map(position => position?.id));
  for (const original of templates.values()) if (!proposedIds.has(original.id)) {
    append('missing_base_position', `positions.${original.id}`, 'Mantenha a linha documental e use quantidade zero para representar sua retirada.', { rowId: original.id, unitId: original.unitId });
  }
  for (const position of list(proposal?.positions)) {
    const original = templates.get(position?.id);
    const template = original || templates.get(position?.templateId);
    let codeValid = false;
    if (position?.codeOverride) {
      try {
        const parsed = parseProposedCode(position.codeOverride.code, base, template?.code);
        codeValid = position.codeOverride.templateId === template?.id && position.codeOverride.catalogueVersion === catalogue.version
          && Object.keys(parsed).every(field => position[field] === parsed[field]);
      } catch { /* Invalid proposed codes remain explicit validation issues. */ }
    }
    const invalid = !template || position?.denomination !== template.denomination
      || (position?.codeOverride ? !codeValid : TEMPLATE_FIELDS.some(field => position?.[field] !== template[field]))
      || (original ? position.origin !== 'base' || position.unitId !== original.unitId || position.templateId !== original.id
        || position.sourceRow !== original.sourceRow || position.documentaryRow !== original.documentaryRow
        : position.origin !== 'added' || position.sourceRow !== null || position.documentaryRow !== null);
    if (invalid) append('position_template_mismatch', `positions.${position?.id}`, 'Preserve o código, a denominação e os valores do modelo documental; alterações de alocação devem usar as ações disponíveis.', { rowId: position?.id, unitId: position?.unitId });
    if (proposalUnits.find(unit => unit?.id === position?.unitId)?.removed && !sameNumber(position?.quantity, '0')) {
      append('removed_unit_has_positions', `positions.${position?.id}.quantity`, 'Uma unidade retirada não pode manter cargos ou funções ativos; restaure a unidade para editá-la.', { rowId: position?.id, unitId: position?.unitId });
    }
  }
  return issues;
}

function changesFor(proposal, base) {
  const changes = [], originalUnits = new Map(list(base?.units).filter(Boolean).map(unit => [unit.id, unit]));
  for (const unit of list(proposal?.units)) {
    const original = originalUnits.get(unit?.id);
    if (!original && !unit?.removed) changes.push({ type: 'unit-added', unitId: unit?.id, before: null, after: unit?.name,
      afterParentUnitId: unit?.parentUnitId, afterParentName: unit?.parentName });
    if (original && unit.removed) changes.push({ type: 'unit-removed', unitId: unit.id, before: original.name, after: null });
    if (original && unit.name !== original.name) changes.push({ type: 'unit-renamed', unitId: unit.id, before: original.name, after: unit.name });
    if (original && (unit.parentUnitId !== original.parentUnitId || unit.parentName !== original.parentName)) changes.push({
      type: 'unit-moved', unitId: unit.id, beforeParentUnitId: original.parentUnitId, afterParentUnitId: unit.parentUnitId,
      beforeParentName: original.parentName, afterParentName: unit.parentName,
    });
  }
  const originals = new Map(list(base?.positions).filter(Boolean).map(position => [position.id, position]));
  for (const position of list(proposal?.positions)) {
    const original = originals.get(position?.id);
    if (original && position.code !== original.code) changes.push({ type: 'code', unitId: position.unitId, positionId: position.id,
      before: original.code, after: position.code, denomination: position.denomination,
      beforeCoefficientCents: original.coefficientCents, afterCoefficientCents: position.coefficientCents });
    const entered = position?.quantity;
    const normalized = typeof entered === 'string' && entered.trim().length <= 128 && /^\d+$/u.test(entered.trim()) ? BigInt(entered.trim()).toString() : entered;
    if (original && sameNumber(normalized, original.quantity)) continue;
    changes.push({ type: !original ? 'added' : normalized === '0' ? 'removed' : 'quantity', unitId: position?.unitId,
      positionId: position?.id, code: position?.code, denomination: position?.denomination,
      before: original?.quantity ?? null, after: typeof entered === 'string' ? entered : null });
  }
  return changes;
}

/** Calculate the complete organization, independent of screen selection or collapsed units. */
export function calculateStructureProposal(proposal, base) {
  const baseUnitsIssues = inspectUnits(base?.units, 'base');
  const baseInspection = inspectPositions(base?.positions, base?.units, 'base', base);
  const baseRows = aggregateRows(baseInspection.positionResults);
  const baseCalculation = calculateScenario({ rows: baseRows });
  const isSggd = base?.organizationId === 'sggd';
  const canonical = isSggd ? getScope('sggd', 'all')?.reference : null;
  const baseIssues = [...baseUnitsIssues, ...baseInspection.issues];
  if (!text(base?.version) || !totalsMatch(baseCalculation, base?.totals)
      || (isSggd && (!canonical || !referenceMatches(baseRows, canonical))) || !sourceMatchesCanonical(base)) {
    baseIssues.push(problem('baseline_mismatch', 'base', 'A estrutura de origem precisa corresponder aos quantitativos e cotas documentais do órgão selecionado.', 'base'));
  }
  const baselineValid = baseIssues.length === 0;
  const unitIssues = [...inspectUnits(proposal?.units, 'proposal'), ...inspectUnitGraph(proposal?.units)];
  const inspection = inspectPositions(proposal?.positions, proposal?.units, 'proposal', base);
  const metadataIssues = proposalMetadataIssues(proposal, base);
  const proposalIssues = [...unitIssues, ...inspection.issues, ...metadataIssues];
  const positionResults = inspection.positionResults.map(position => {
    const extra = metadataIssues.filter(issue => issue.rowId === position.id);
    return extra.length ? { ...position, status: 'incomplete', quotaCents: null, issues: [...position.issues, ...extra] } : position;
  });
  // Structural inconsistencies cannot be concealed by valid arithmetic or a screen filter.
  const structuralError = [...unitIssues, ...metadataIssues, ...inspection.issues.filter(issue => !['missing_quantity', 'invalid_number', 'input_too_long'].includes(issue.code))].length > 0;
  const rows = aggregateRows(positionResults);
  const input = { comparisonBasis: 'arithmetic', rows: structuralError ? {} : rows,
    current: baselineValid && isSggd ? { mode: 'group', groups: clone(canonical.groups) } : { mode: 'none' } };
  const result = calculateScenario(input);
  const versionMatches = !metadataIssues.some(issue => issue.code === 'proposal_version_mismatch');
  const availability = isSggd ? calculateQuotaAvailability({ organizationId: base?.organizationId, scopeId: 'all',
    baselineOrigin: baselineValid && versionMatches ? 'documentary' : 'manual', result })
    : calculateAgencyAvailability(base, result, baselineValid && versionMatches);
  if (!baselineValid) {
    availability.reason = 'structure_baseline_unverified';
    availability.message = 'A estrutura documental não corresponde à base aplicável; a disponibilidade automática permanece indisponível.';
  } else if (!versionMatches) {
    availability.reason = 'structure_proposal_version_mismatch';
    availability.message = 'A proposta usa outra organização ou versão da base; a disponibilidade automática permanece indisponível.';
  }
  const unitResults = list(proposal?.units).map(unit => {
    const direct = positionResults.filter(position => position.unitId === unit.id);
    const issues = proposalIssues.filter(issue => issue.unitId === unit.id);
    const calculation = calculateScenario({ rows: issues.length ? {} : direct.length ? aggregateRows(direct)
      : [{ id: 'empty-direct-unit', group: 'CCESP', level: 1, quantity: '0' }] });
    const selectTotals = ({ status, quantity, quotaCents }) => ({ status, quantity, quotaCents });
    return { unitId: unit.id, name: unit.name, status: calculation.status,
      groups: Object.fromEntries(GROUPS.map(group => [group, selectTotals(calculation.groups[group])])),
      aggregate: selectTotals(calculation.aggregate), issues };
  });
  return { status: result.status, result, availability, issues: [...baseIssues, ...proposalIssues],
    positionResults, unitResults, changes: changesFor(proposal, base), baselineValid };
}
