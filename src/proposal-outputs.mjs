import { activeGroups, annexLabel, isSecretariat } from './data/simulator-bases.mjs';
import { calculateStructureProposal } from './structure-proposal.mjs';
import { formatInteger, formatCents } from './calculator.mjs';
import { evaluateStructureRules } from './structure-rules.mjs';

const GROUPS = ['CCESP', 'FCESP'];
const COLUMNS = ['UNIDADE', 'QTD', 'DENOMINAÇÃO CARGO/FUNÇÃO', 'CCESP/FCESP'];
const list = value => Array.isArray(value) ? value : [];
const cleanText = value => typeof value === 'string' ? value.replace(/\s+/gu, ' ').trim() : '';
const integer = value => typeof value === 'string' && /^\d+$/u.test(value) ? BigInt(value).toString() : null;
const difference = (after, before) => after !== null && before !== null ? (BigInt(after) - BigInt(before)).toString() : null;

/** Display order only: never mutate the proposal or use quantities as sort keys. */
export function sortProposalPositions(positions) {
  const level = position => {
    const value = position?.level;
    if ((typeof value === 'number' || typeof value === 'string') && /^\d{1,2}$/u.test(String(value))) return Number(value);
    const match = /(?:[12]\.|\s)(\d{1,2})$/u.exec(position?.code ?? '');
    return match ? Number(match[1]) : -1;
  };
  return list(positions).map((position, index) => ({ position, index, level: level(position) }))
    .sort((a, b) => b.level - a.level || a.index - b.index).map(item => item.position);
}

/** Parent context stays inside UNIDADE; the official four columns are unchanged. */
export function annexUnitLabel(row) {
  const name = cleanText(row.unitName);
  return row.hierarchyChanged ? `${name}\nVinculada a: ${cleanText(row.parentName) || 'Vínculo não informado'}` : name;
}

function metric(before, after) {
  return { status: before !== null && after !== null ? 'complete' : 'pending', before, after, delta: difference(after, before) };
}

function publicSource(source) {
  if (!source || typeof source.url !== 'string') return null;
  try {
    const url = new URL(source.url);
    if (url.protocol !== 'https:' || !['www.doe.sp.gov.br', 'doe.sp.gov.br', 'www.al.sp.gov.br', 'al.sp.gov.br', 'www.spaguas.sp.gov.br', 'www.arsesp.sp.gov.br'].includes(url.hostname)) return null;
    return { label: cleanText(source.label || source.title), url: url.href,
      ...(source.annex ? { annex: source.annex } : {}), ...(source.version ? { version: source.version } : {}) };
  } catch { return null; }
}

function collectMetadata(base, calculation) {
  const labels = calculation?.availability?.sourceLabels;
  const sources = [...new Map([
    ...Object.values(labels || {}), ...list(base?.sources),
  ].map(publicSource).filter(Boolean).map(source => [`${source.url}|${source.label}`, source])).values()];
  return {
    organizationId: base?.organizationId ?? null, organizationName: cleanText(base?.name),
    baseVersion: base?.version ?? null, catalogueVersion: calculation?.result?.catalogueVersion ?? null,
    sourceAnnex: base?.sourceAnnex ?? null, validationStatus: base?.validationStatus ?? 'technical-review',
    scope: 'whole-organization', sources,
    notice: !isSecretariat(base) && base?.notice ? `${base.notice} Minuta em validação técnica.` : 'Base e regras em validação técnica. A proposta não representa aprovação administrativa, ocupação atual ou confirmação de atos posteriores.',
  };
}

// Resolve only the documentary ID, never a guessed match by name or table order.
function parentNameFor(originalUnit, units) {
  const candidates = originalUnit?.parentUnitId
    ? list(units).filter(unit => unit?.id === originalUnit.parentUnitId) : [];
  return candidates.length === 1 && cleanText(candidates[0].name)
    ? cleanText(candidates[0].name) : cleanText(originalUnit?.parentName);
}

function unitComparisons(unitId, base, calculation) {
  const proposed = list(calculation?.unitResults).find(unit => unit.unitId === unitId);
  return { groups: Object.fromEntries(GROUPS.map(group => {
    const rows = list(base?.positions).filter(row => row?.unitId === unitId && row.group === group);
    const beforeQuantity = calculation?.baselineValid ? rows.reduce((sum, row) => sum + BigInt(row.quantity), 0n).toString() : null;
    const beforeQuotas = calculation?.baselineValid ? rows.reduce((sum, row) => sum + BigInt(row.quantity) * BigInt(row.coefficientCents), 0n).toString() : null;
    const after = proposed?.groups?.[group];
    return [group, {
      quantity: metric(beforeQuantity, after?.status === 'complete' ? integer(after.quantity) : null),
      quotaCents: metric(beforeQuotas, after?.status === 'complete' ? integer(after.quotaCents) : null),
    }];
  })) };
}

function deriveChanges(proposal, base, calculation) {
  const originals = new Map(list(base?.positions).filter(Boolean).map(row => [row.id, row]));
  const originalUnits = new Map(list(base?.units).filter(Boolean).map(unit => [unit.id, unit]));
  const proposedUnits = new Map(list(proposal?.units).filter(Boolean).map(unit => [unit.id, unit]));
  const computed = new Map(list(calculation?.positionResults).map(row => [row.id, row]));
  const byUnit = new Map();
  const add = change => {
    if (!byUnit.has(change.unitId)) byUnit.set(change.unitId, []);
    byUnit.get(change.unitId).push(change);
  };
  for (const unit of proposedUnits.values()) {
    const original = originalUnits.get(unit.id);
    if (!original && !unit.removed) add({ type: 'unit-created', unitId: unit.id, status: 'complete', afterName: cleanText(unit.name) });
    if (original && unit.removed) add({ type: 'unit-removed', unitId: unit.id, status: 'complete', beforeName: cleanText(original.name) });
    if (original && !unit.removed && cleanText(unit.name) !== cleanText(original.name)) add({
      type: 'unit-renamed', unitId: unit.id,
      status: cleanText(unit.name) ? 'complete' : 'pending',
      beforeName: cleanText(original.name), afterName: cleanText(unit.name),
    });
    if (original && !unit.removed && (unit.parentUnitId !== original.parentUnitId || cleanText(unit.parentName) !== cleanText(original.parentName))) add({
      type: 'unit-moved', unitId: unit.id, status: 'complete',
      beforeParentName: parentNameFor(original, base.units), afterParentName: parentNameFor(unit, proposal.units),
    });
  }
  for (const position of list(proposal?.positions).filter(Boolean)) {
    const original = originals.get(position.id), row = computed.get(position.id);
    const before = original ? integer(original.quantity) : '0';
    const after = row?.status === 'complete' ? integer(row.quantity) : null;
    // A normalized equality is unchanged, including a new, explicit zero row.
    const codeChanged = original && position.code !== original.code;
    if (after !== null && after === before && !codeChanged) continue;
    const coefficient = integer(original?.coefficientCents ?? row?.coefficientCents);
    const beforeQuotas = before !== null && coefficient !== null ? (BigInt(before) * BigInt(coefficient)).toString() : null;
    const afterQuotas = after !== null ? integer(row?.quotaCents) : null;
    add({
      type: !original ? 'added' : after === '0' ? 'removed' : codeChanged ? 'code' : 'quantity',
      unitId: position.unitId, positionId: position.id, group: position.group,
      code: cleanText(position.code), denomination: cleanText(position.denomination),
      ...(codeChanged ? { beforeCode: cleanText(original.code), afterCode: cleanText(position.code) } : {}),
      status: after !== null && before !== null ? 'complete' : 'pending',
      before, after, delta: difference(after, before), enteredQuantity: position.quantity ?? null,
      quotas: metric(beforeQuotas, afterQuotas),
    });
  }
  // A missing documentary row is invalid, never silently interpreted as removal.
  const proposedIds = new Set(list(proposal?.positions).filter(Boolean).map(row => row.id));
  for (const original of originals.values()) if (!proposedIds.has(original.id)) add({
    type: 'quantity', unitId: original.unitId, positionId: original.id, group: original.group,
    code: cleanText(original.code), denomination: cleanText(original.denomination), status: 'pending',
    before: integer(original.quantity), after: null, delta: null, enteredQuantity: null,
    quotas: metric(null, null),
  });
  const order = [...originalUnits.keys(), ...[...proposedUnits.keys()].filter(id => !originalUnits.has(id))];
  // Preserve invalid unknown units in the summary so their pending rows stay visible.
  for (const id of byUnit.keys()) if (!order.includes(id)) order.push(id);
  return order.filter(id => byUnit.has(id)).map(unitId => ({
    unitId, beforeName: cleanText(originalUnits.get(unitId)?.name), afterName: cleanText(proposedUnits.get(unitId)?.name),
    beforeParentName: parentNameFor(originalUnits.get(unitId), base?.units),
    afterParentName: parentNameFor(proposedUnits.get(unitId), proposal?.units),
    hierarchyStatus: proposedUnits.get(unitId)?.hierarchyStatus ?? originalUnits.get(unitId)?.hierarchyStatus ?? null,
    sourceRow: originalUnits.get(unitId)?.sourceRow ?? null,
    changes: byUnit.get(unitId),
    comparisons: unitComparisons(unitId, base, calculation),
  }));
}

function comparisonsFor(base, calculation) {
  const compare = (baseline, proposed) => Object.fromEntries(['quantity', 'quotaCents'].map(key => [key,
    metric(calculation?.baselineValid ? integer(baseline?.[key]) : null,
      proposed?.status === 'complete' ? integer(proposed[key]) : null),
  ]));
  return {
    groups: Object.fromEntries(GROUPS.map(group => [group, compare(base?.totals?.groups?.[group], calculation?.result?.groups?.[group])])),
    aggregate: compare(base?.totals?.aggregate, calculation?.result?.aggregate),
  };
}

// Untouched units retain documentary order. Explicitly moved/created branches
// follow their proposed parent without inferring any ambiguous source links.
function orderedAnnexUnits(proposal, base) {
  const byId = new Map(proposal.units.map(unit => [unit.id, unit]));
  const documentaryOrder = [...base.units.map(unit => byId.get(unit.id)).filter(Boolean), ...proposal.units.filter(unit => !base.units.some(original => original.id === unit.id))];
  const branchOf = id => {
    const ids = new Set([id]);
    for (let pass=0; pass<proposal.units.length; pass++) for (const unit of proposal.units) if (ids.has(unit.parentUnitId)) ids.add(unit.id);
    return ids;
  };
  const changed = proposal.units.filter(unit => {
    const original = base.units.find(item => item.id === unit.id);
    return !unit.removed && (!original || unit.parentUnitId !== original.parentUnitId || unit.parentName !== original.parentName);
  });
  const depth = unit => {
    let count = 0, parent = byId.get(unit.parentUnitId);
    const seen = new Set([unit.id]);
    while (parent && !seen.has(parent.id)) { seen.add(parent.id); count += 1; parent = byId.get(parent.parentUnitId); }
    return count;
  };
  // Remove all displaced branches first so an unplaced new sibling cannot become
  // an anchor at the end of the document. Place parents before their changed children.
  const displaced = new Set(changed.flatMap(unit => [...branchOf(unit.id)]));
  let order = documentaryOrder.filter(unit => !displaced.has(unit.id));
  for (const unit of changed.sort((a, b) => depth(a) - depth(b))) {
    const branch = branchOf(unit.id);
    const placed = order.filter(item => branch.has(item.id));
    const block = placed.length ? placed : documentaryOrder.filter(item => branch.has(item.id));
    order = order.filter(item => !branch.has(item.id));
    const parentBranch = unit.parentUnitId ? branchOf(unit.parentUnitId) : null;
    let anchor = -1;
    for (let index=0; index<order.length; index++) {
      const candidate = order[index];
      if (parentBranch ? parentBranch.has(candidate.id) : (!candidate.parentUnitId && candidate.parentName === unit.parentName)) anchor=index;
    }
    order.splice(anchor < 0 ? order.length : anchor + 1, 0, ...block);
  }
  return order;
}

function annexRows(proposal, base, calculation) {
  const computed = new Map(calculation.positionResults.map(row => [row.id, row]));
  const originalIds = new Set(base.positions.map(row => row.id));
  const units = new Map(proposal.units.map(unit => [unit.id, unit]));
  const rows = [];
  // Preserve unit identities and documentary tie order; show levels descending.
  for (const unit of orderedAnnexUnits(proposal, base)) {
    if (unit.removed) continue;
    const originalUnit = base.units.find(original => original.id === unit.id);
    const hierarchyChanged = !originalUnit || unit.parentUnitId !== originalUnit.parentUnitId
      || cleanText(unit.parentName) !== cleanText(originalUnit.parentName);
    const positions = sortProposalPositions([
      ...base.positions.filter(row => row.unitId === unit.id).map(row => computed.get(row.id)),
      ...proposal.positions.filter(row => row.unitId === unit.id && !originalIds.has(row.id)).map(row => computed.get(row.id)),
    ]);
    for (const position of positions) if (BigInt(position.quantity) > 0n) rows.push({
      unitId: unit.id, positionId: position.id, unitName: cleanText(units.get(unit.id).name),
      quantity: position.quantity, denomination: cleanText(position.denomination), code: cleanText(position.code),
      parentName: parentNameFor(unit, proposal.units), parentUnitId: unit.parentUnitId ?? null,
      hierarchyChanged, hierarchyStatus: unit.hierarchyStatus ?? null,
    });
  }
  return rows;
}

/** One fresh calculation drives both outputs; screen filters and supplied snapshots are ignored. */
export function deriveProposalOutputs(proposal, base) {
  let calculation = null;
  const issues = [];
  // Fail closed for malformed containers before the detailed calculation dereferences a row.
  const malformed = [proposal, base].some(model => !model || !Array.isArray(model.units) || !Array.isArray(model.positions)
    || [...model.units, ...model.positions].some(row => !row || typeof row !== 'object' || Array.isArray(row)));
  if (malformed) issues.push({ code: 'invalid_structure_model', field: 'structure', severity: 'error', scope: 'proposal',
    message: 'A proposta e a base precisam conter unidades e linhas documentais válidas.' });
  else {
    calculation = calculateStructureProposal(proposal, base);
    issues.push(...calculation.issues);
  }
  const canGenerateAnnex = !!calculation?.baselineValid && calculation.status === 'complete'
    && calculation.result.aggregate.status === 'complete' && issues.every(issue => issue.severity !== 'error');
  const units = deriveChanges(proposal, base, calculation), changes = units.flatMap(unit => unit.changes);
  const counts = { units: units.length, quantityChanges: changes.filter(change => change.type === 'quantity').length,
    added: changes.filter(change => change.type === 'added').length, removed: changes.filter(change => change.type === 'removed').length,
    renamed: changes.filter(change => change.type === 'unit-renamed').length,
    pending: changes.filter(change => change.status === 'pending').length, total: changes.length };
  // Keep existing count fields stable; structural events have their own explicit counts.
  const structureCounts = Object.fromEntries(['unit-created', 'unit-removed', 'unit-moved', 'code'].map(type => [type, changes.filter(change => change.type === type).length]));
  const rows = canGenerateAnnex ? annexRows(proposal, base, calculation) : [];
  const rules = evaluateStructureRules(proposal, base);
  const ruleBlockers = rules.alerts.filter(alert => alert.origin === 'new' && alert.severity === 'error' && alert.status === 'verified');
  return {
    status: canGenerateAnnex ? 'complete' : 'incomplete', canGenerateAnnex,
    canDownloadAnnex: canGenerateAnnex && ruleBlockers.length === 0, rules, ruleBlockers, issues, calculation,
    summary: { units, counts, structureCounts, comparisons: comparisonsFor(base, calculation), availability: calculation?.availability ?? null },
    annex: { columns: [...COLUMNS], rows, rowCount: rows.length, unitCount: new Set(rows.map(row => row.unitId)).size },
    metadata: collectMetadata(base, calculation),
  };
}

const signed = (value, format) => value === null ? 'pendente' : format(value, { signed: true });
const displayed = (value, format) => value === null ? 'pendente' : format(value);

function unitContextLines(unit, proposal, base) {
  const key = value => cleanText(value).toLocaleLowerCase('pt-BR');
  const originalUnits = new Map(list(base?.units).filter(Boolean).map(item => [item.id, item]));
  const matches = (units, name, parentName) => list(units).filter(item => item && item.id !== unit.unitId
    && key(item.name) === key(name)).map(item => ({
    sameParent: key(parentNameFor(item, units)) === key(parentName),
  }));
  const homonyms = [
    ...matches(base?.units, unit.beforeName, unit.beforeParentName),
    ...matches(proposal?.units, unit.afterName, unit.afterParentName),
  ];
  const ambiguous = unit.hierarchyStatus === 'model-parent-ambiguous';
  const renamedParent = unit.beforeParentName !== unit.afterParentName;
  const lines = [];
  if (unit.changes.some(change => change.type === 'unit-created')) {
    lines.push(`Vínculo na proposta: ${unit.afterParentName || '(não informado)'}.`);
  } else if (homonyms.length || ambiguous || renamedParent) {
    const label = ambiguous ? 'Vínculo informado no modelo' : 'Vínculo no modelo';
    lines.push(renamedParent
      ? `${label} (nome anterior → proposto): ${unit.beforeParentName || '(não informado)'} → ${unit.afterParentName || '(não informado)'}.`
      : `${label}: ${unit.afterParentName || unit.beforeParentName || '(não informado)'}.`);
  }
  if (homonyms.some(item => item.sameParent)) lines.push(unit.sourceRow !== null
    ? `Localização no modelo de origem: linha ${unit.sourceRow}.`
    : `Identificação documental da unidade: ${cleanText(unit.unitId)}.`);
  if (ambiguous) lines.push('Pendência de hierarquia: o nome do vínculo corresponde a mais de uma unidade no modelo; a unidade superior não foi determinada.');
  return lines;
}

/** A text receipt from the same full model, never from a screen-only or stale calculation. */
export function buildProposalSummaryText(proposal, base, { generatedAt } = {}) {
  const outputs = deriveProposalOutputs(proposal, base);
  const { summary, metadata } = outputs;
  const secretariat = isSecretariat(base), documentName = annexLabel(base);
  const lines = ['RESUMO DA PROPOSTA DE REESTRUTURAÇÃO', metadata.organizationName,
    'Escopo: proposta completa do órgão; inclui todas as unidades, independentemente do filtro da tela.'];
  if (generatedAt) lines.push(`Gerado em: ${cleanText(generatedAt instanceof Date ? generatedAt.toISOString() : generatedAt)}.`);
  lines.push(`Versão da base: ${cleanText(metadata.baseVersion)}.`, `Versão da tabela de cotas: ${cleanText(metadata.catalogueVersion)}.`,
    '', secretariat ? 'Anexo II: estrutura alocada de referência. Anexo III: limites de quantitativos e cotas.'
      : 'Alocação: quadro publicado. Referência: valores indicados na fonte do saldo.',
    'Variação = proposta − alocação. Saldo = referência − alocação ou proposta.',
    'CCESP e FCESP são avaliados separadamente, sem compensação entre espécies ou entre quantitativo e cotas.');
  if (base.originalReference) lines.push(`Quadro original da LC nº 1.413/2024: ${formatInteger(base.originalReference.quantity)} cargos e ${formatCents(base.originalReference.quotaCents)} cotas. ${base.originalReference.note}`);
  for (const group of activeGroups(base)) {
    lines.push('', group);
    for (const key of ['quantity', 'quotaCents']) {
      const label = key === 'quantity' ? 'Quantitativo' : 'Cotas', format = key === 'quantity' ? formatInteger : formatCents;
      const comparison = summary.comparisons.groups[group][key];
      lines.push(`${label}: alocado ${displayed(comparison.before, format)}; proposta ${displayed(comparison.after, format)}; variação ${signed(comparison.delta, format)}.`);
      const availability = summary.availability, measure = key === 'quantity' ? 'quantity' : 'quotas';
      if (availability?.status === 'available') {
        const balance = availability.currentBalance.groups[group][measure], proposed = availability.proposedBalance.groups[group][measure];
        lines.push(`${secretariat ? 'Limite (Anexo III)' : 'Referência'}: ${format(availability.limits.groups[group][key])}; saldo da alocação${secretariat ? " (III − II)" : ""}: ${format(balance.balance)}; saldo da proposta: ${proposed.status === 'available' ? format(proposed.balance) : 'pendente'}.`);
      } else lines.push('Limites e saldos: indisponíveis; a correspondência da base precisa ser conferida.');
    }
  }
  lines.push('', 'ALTERAÇÕES POR UNIDADE');
  if (!summary.units.length) lines.push('Nenhuma alteração em relação à estrutura alocada.');
  for (const unit of summary.units) {
    lines.push('', unit.afterName || unit.beforeName || 'Unidade com identificação pendente');
    lines.push(...unitContextLines(unit, proposal, base));
    for (const change of unit.changes) {
      if (change.type === 'unit-renamed') {
        lines.push(`Unidade renomeada: “${change.beforeName}” → “${change.afterName || '(nome pendente)'}”.`);
        continue;
      }
      if (change.type.startsWith('unit-')) {
        lines.push(change.type === 'unit-created' ? 'Unidade criada na proposta.' : change.type === 'unit-removed' ? 'Unidade retirada da proposta, com seus cargos/funções diretos.' : `Unidade transferida: ${change.beforeParentName || '(não informado)'} → ${change.afterParentName || '(não informado)'}.`);
        continue;
      }
      const label = { added: 'Inclusão', removed: 'Retirada', quantity: 'Quantidade alterada', code: `Código alterado (${change.beforeCode} → ${change.afterCode})` }[change.type];
      const after = change.status === 'complete' ? formatInteger(change.after)
        : `pendente (entrada: “${cleanText(String(change.enteredQuantity ?? '')) || '(vazia)'}”)`;
      lines.push(`${label} — ${change.code} — ${change.denomination}: ${displayed(change.before, formatInteger)} → ${after}; variação ${signed(change.delta, formatInteger)}.`);
      lines.push(`Cotas da movimentação: ${displayed(change.quotas.before, formatCents)} → ${displayed(change.quotas.after, formatCents)}; variação ${signed(change.quotas.delta, formatCents)}.`);
    }
    lines.push('Totais da unidade (alocação direta; proposta − alocado):');
    for (const group of activeGroups(base)) {
      const comparison = unit.comparisons.groups[group];
      lines.push(`${group} — quantitativo: ${displayed(comparison.quantity.before, formatInteger)} → ${displayed(comparison.quantity.after, formatInteger)}; variação ${signed(comparison.quantity.delta, formatInteger)}. Cotas: ${displayed(comparison.quotaCents.before, formatCents)} → ${displayed(comparison.quotaCents.after, formatCents)}; variação ${signed(comparison.quotaCents.delta, formatCents)}.`);
    }
    lines.push('A variação da unidade integra o resultado do órgão; não representa limite ou saldo disponível próprio da unidade.');
  }
  lines.push('', `Alterações: ${summary.counts.units} unidade(s); ${summary.counts.quantityChanges} ajuste(s) de quantidade; ${summary.counts.added} inclusão(ões); ${summary.counts.removed} retirada(s); ${summary.counts.renamed} renomeação(ões).`);
  if (!outputs.canGenerateAnnex) {
    lines.push('', `PROPOSTA INCOMPLETA — geração do ${documentName} bloqueada. Nenhum anexo parcial foi liberado.`);
    for (const issue of outputs.issues) lines.push(`Pendência: ${cleanText(issue.message)}`);
  } else lines.push('', `${documentName} da proposta: ${outputs.annex.rowCount} linha(s) de cargos e funções em ${outputs.annex.unitCount} unidade(s) com quantitativo positivo.`);
  lines.push('', 'FONTES');
  for (const source of metadata.sources) lines.push(`${source.label}: ${source.url}`);
  const newAlerts = outputs.rules.alerts.filter(alert => alert.origin === 'new');
  if (newAlerts.length) {
    lines.push('', 'ALERTAS DA PROPOSTA');
    for (const alert of newAlerts) lines.push(`${alert.severity === 'error' ? 'Conferir antes de gerar o Anexo II' : 'Atenção'} — ${cleanText(proposal.units.find(unit => unit.id === alert.unitId)?.name)}: ${alert.message} ${alert.source?.title || ''} ${alert.source?.provision || ''}`);
  }
  if (outputs.rules.baselineAlerts.length) lines.push('', `${outputs.rules.baselineAlerts.length} apontamento(s) identificado(s) na base de origem permanecem para revisão técnica; não são apresentados como alterações do usuário.`);
  lines.push('', metadata.notice);
  return lines.join('\n');
}
