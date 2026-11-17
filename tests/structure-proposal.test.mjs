import test from 'node:test';
import assert from 'node:assert/strict';
import { sggdStructure as base } from '../src/data/sggd-structure.mjs';
import {
  createStructureProposal, setPositionQuantity, renameUnit, addPosition, removePosition,
  resetUnit, calculateStructureProposal, createUnit, moveUnit, removeUnit, setPositionCode, getExternalParentNames,
} from '../src/structure-proposal.mjs';

const calculate = proposal => calculateStructureProposal(proposal, base);
const rowA = base.positions.find(position => position.group === 'CCESP');
const rowB = base.positions.find(position => position.group === 'FCESP' && position.unitId !== rowA.unitId);
const increase = (proposal, row, amount = 1n) => setPositionQuantity(proposal, row.id, (BigInt(row.quantity) + amount).toString());

test('the complete documentary structure reproduces II and compares with III independently', () => {
  const proposal = createStructureProposal(base), value = calculate(proposal);
  assert.equal(proposal.positions.length, 407);
  assert.equal(proposal.units.length, 221);
  assert.equal(value.status, 'complete');
  assert.equal(value.baselineValid, true);
  assert.deepEqual(value.issues, []);
  assert.deepEqual(value.changes, []);
  assert.equal(value.result.aggregate.quantity, '500');
  assert.equal(value.result.aggregate.quotaCents, '141825');
  assert.equal(value.availability.status, 'available');
  assert.equal(value.availability.limits.aggregate.quantity, '499');
  assert.equal(value.availability.allocated.aggregate.quantity, '500');
  assert.equal(value.availability.currentBalance.groups.CCESP.quantity.balance, '-1');
  assert.equal(value.availability.currentBalance.groups.CCESP.quotas.balance, '-350');
  assert.equal(value.availability.currentBalance.groups.FCESP.quantity.balance, '0');
  assert.equal(value.availability.currentBalance.groups.FCESP.quotas.balance, '60');
  assert.equal(Object.hasOwn(value.availability.currentBalance, 'aggregate'), false);
});

test('edits in two different units accumulate into one complete proposal', () => {
  let proposal = createStructureProposal(base);
  proposal = increase(proposal, rowA, 2n);
  proposal = increase(proposal, rowB, 3n);
  const value = calculate(proposal);
  assert.equal(value.result.groups.CCESP.quantity, '301');
  assert.equal(value.result.groups.FCESP.quantity, '204');
  assert.equal(value.result.aggregate.quantity, '505');
  assert.equal(value.result.groups.CCESP.quotaCents, (106950n + 2n * BigInt(rowA.coefficientCents)).toString());
  assert.equal(value.result.groups.FCESP.quotaCents, (34875n + 3n * BigInt(rowB.coefficientCents)).toString());
  assert.equal(value.changes.length, 2);
  assert.equal(value.availability.projected.aggregate.quantity, '505');
  assert.deepEqual(value.availability.allocated.groups, base.totals.groups);
});

test('direct unit totals count every position once even with nested and unresolved parents', () => {
  const value = calculate(createStructureProposal(base));
  assert.ok(base.units.some(unit => unit.parentUnitId));
  assert.ok(base.units.some(unit => unit.parentUnitId === null));
  for (const group of ['CCESP', 'FCESP']) {
    assert.equal(value.unitResults.reduce((sum, unit) => sum + BigInt(unit.groups[group].quantity), 0n).toString(), value.result.groups[group].quantity);
    assert.equal(value.unitResults.reduce((sum, unit) => sum + BigInt(unit.groups[group].quotaCents), 0n).toString(), value.result.groups[group].quotaCents);
  }
});

test('duplicate species and levels are aggregated only for arithmetic, retaining full positions', () => {
  const proposal = createStructureProposal(base), value = calculate(proposal);
  const rows = value.result.aggregate.rows;
  assert.equal(new Set(rows.map(row => `${row.group}:${row.level}`)).size, rows.length);
  assert.ok(rows.length < proposal.positions.length);
  assert.equal(value.positionResults.length, proposal.positions.length);
  assert.deepEqual(value.positionResults.map(row => row.code), proposal.positions.map(row => row.code));
  assert.equal(value.positionResults.reduce((sum, row) => sum + BigInt(row.quotaCents), 0n).toString(), value.result.aggregate.quotaCents);
});

test('an invalid quantity in any unit keeps the whole proposal pending, even when a different unit is selected', () => {
  const proposal = setPositionQuantity(createStructureProposal(base), rowB.id, '');
  proposal.selectedUnitId = rowA.unitId;
  const value = calculate(proposal);
  assert.equal(value.status, 'incomplete');
  assert.equal(value.result.aggregate.quantity, null);
  assert.equal(value.availability.status, 'available');
  assert.equal(value.availability.proposalStatus, 'pending');
  assert.equal(value.availability.projected, null);
  assert.equal(value.availability.currentBalance.groups.CCESP.quotas.balance, '-350');
  assert.ok(value.issues.some(issue => issue.rowId === rowB.id && issue.unitId === rowB.unitId && issue.code === 'missing_quantity'));
  assert.equal(value.unitResults.find(unit => unit.unitId === rowB.unitId).status, 'incomplete');
  assert.equal(value.unitResults.find(unit => unit.unitId === rowA.unitId).status, 'complete');
});

test('blank, malformed and zero quantities remain distinct with exact large integers', () => {
  for (const quantity of ['', ' ', '-1', '+1', '1.5', '1,5', '1e3', '3x', true, '9'.repeat(129)]) {
    const value = calculate(setPositionQuantity(createStructureProposal(base), rowA.id, quantity));
    assert.equal(value.status, 'incomplete', String(quantity));
    assert.equal(value.availability.projected, null);
    assert.equal(value.positionResults.find(row => row.id === rowA.id).quotaCents, null);
  }
  let value = calculate(setPositionQuantity(createStructureProposal(base), rowA.id, '0'));
  assert.equal(value.status, 'complete');
  assert.equal(value.result.aggregate.quantity, (500n - BigInt(rowA.quantity)).toString());
  value = calculate(setPositionQuantity(createStructureProposal(base), rowA.id, '9007199254740993'));
  assert.equal(value.status, 'complete');
  assert.equal(value.positionResults.find(row => row.id === rowA.id).quotaCents, (9007199254740993n * BigInt(rowA.coefficientCents)).toString());
});

test('removing a base row retains a zero while removing an added row removes only the addition', () => {
  let proposal = removePosition(createStructureProposal(base), rowA.id);
  assert.equal(proposal.positions.length, base.positions.length);
  assert.equal(proposal.positions.find(row => row.id === rowA.id).quantity, '0');
  assert.equal(calculate(proposal).changes[0].type, 'removed');
  proposal = addPosition(proposal, { unitId: rowB.unitId, templateId: rowA.id, quantity: '2' }, base);
  const added = proposal.positions.at(-1);
  assert.equal(added.origin, 'added');
  assert.equal(added.code, rowA.code);
  assert.equal(added.denomination, rowA.denomination);
  assert.equal(added.documentaryRow, null);
  assert.equal(added.unitId, rowB.unitId);
  assert.equal(calculate(proposal).status, 'complete');
  const without = removePosition(proposal, added.id);
  assert.equal(without.positions.length, base.positions.length);
  assert.equal(without.positions.find(row => row.id === rowA.id).quantity, '0');
});

test('reset restores the selected direct unit and name, preserving edits in its descendant', () => {
  const child = base.units.find(unit => unit.parentUnitId && base.positions.some(row => row.unitId === unit.id)
    && base.positions.some(row => row.unitId === unit.parentUnitId));
  const parent = base.units.find(unit => unit.id === child.parentUnitId);
  const parentRow = base.positions.find(row => row.unitId === parent.id);
  const childRow = base.positions.find(row => row.unitId === child.id);
  let proposal = increase(increase(createStructureProposal(base), parentRow), childRow, 2n);
  proposal = renameUnit(proposal, parent.id, 'Nova denominação proposta');
  proposal = addPosition(proposal, { unitId: parent.id, templateId: childRow.id, quantity: '3' }, base);
  proposal = resetUnit(proposal, parent.id, base);
  assert.equal(proposal.units.find(unit => unit.id === parent.id).name, parent.name);
  assert.deepEqual(proposal.positions.filter(row => row.unitId === parent.id), createStructureProposal(base).positions.filter(row => row.unitId === parent.id));
  assert.equal(proposal.positions.find(row => row.id === childRow.id).quantity, (BigInt(childRow.quantity) + 2n).toString());
  assert.equal(calculate(proposal).changes.length, 1);
});

test('renaming a unit changes its identity label without moving positions or changing totals', () => {
  let proposal = renameUnit(createStructureProposal(base), rowA.unitId, 'Unidade proposta');
  const value = calculate(proposal);
  assert.equal(value.result.aggregate.quantity, '500');
  assert.equal(value.unitResults.find(unit => unit.unitId === rowA.unitId).name, 'Unidade proposta');
  assert.equal(value.changes[0].type, 'unit-renamed');
  assert.equal(proposal.positions.find(row => row.id === rowA.id).unitName, rowA.unitName);
  proposal = renameUnit(proposal, rowA.unitId, ' ');
  assert.equal(calculate(proposal).status, 'incomplete');
  assert.ok(calculate(proposal).issues.some(issue => issue.code === 'missing_unit_name' && issue.unitId === rowA.unitId));
});

test('duplicate ids, altered metadata, missing original rows and hierarchy edits cannot produce a conclusive total', () => {
  const alterations = [
    proposal => proposal.positions.push({ ...proposal.positions[0] }),
    proposal => { proposal.positions[0].code = 'FCESP 1.18'; },
    proposal => { proposal.positions[0].denomination = 'Outra denominação'; },
    proposal => { proposal.positions[0].group = 'UNKNOWN'; },
    proposal => { proposal.positions[0].unitId = 'unknown'; },
    proposal => proposal.positions.shift(),
    proposal => { proposal.units[0].parentUnitId = 'invented-parent'; },
    proposal => proposal.units.push({ ...proposal.units[0] }),
  ];
  for (const alter of alterations) {
    const proposal = createStructureProposal(base); alter(proposal);
    const value = calculate(proposal);
    assert.equal(value.status, 'incomplete');
    assert.equal(value.result.aggregate.quantity, null);
    assert.equal(value.availability.projected, null);
    assert.ok(value.issues.length > 0);
  }
});

test('automatic availability rejects source totals, source quantities, coefficients or proposal versions that do not match', () => {
  const invalidBases = [
    source => { source.totals.groups.CCESP.quantity = '298'; },
    source => { source.positions[0].quantity = '2'; },
    source => { source.positions[0].coefficientCents = '899'; },
    source => { source.sourceAnnex = 'III'; },
  ];
  for (const alter of invalidBases) {
    const source = structuredClone(base); alter(source);
    const value = calculateStructureProposal(createStructureProposal(source), source);
    assert.equal(value.baselineValid, false);
    assert.equal(value.availability.status, 'unavailable');
    assert.equal(value.availability.reason, 'structure_baseline_unverified');
  }
  const proposal = createStructureProposal(base); proposal.baseVersion = 'other-version';
  const value = calculate(proposal);
  assert.equal(value.availability.status, 'unavailable');
  assert.equal(value.availability.reason, 'structure_proposal_version_mismatch');
});

test('add uses unique ids for repeated templates and leaves a missing quantity pending', () => {
  let proposal = createStructureProposal(base);
  proposal = addPosition(proposal, { unitId: rowA.unitId, templateId: rowA.id, quantity: '2' }, base);
  proposal = addPosition(proposal, { unitId: rowA.unitId, templateId: rowA.id }, base);
  assert.notEqual(proposal.positions.at(-1).id, proposal.positions.at(-2).id);
  assert.equal(proposal.positions.at(-1).quantity, '');
  assert.equal(calculate(proposal).status, 'incomplete');
  assert.throws(() => addPosition(proposal, { unitId: 'not-found', templateId: rowA.id, quantity: '1' }, base), RangeError);
  assert.throws(() => addPosition(proposal, { unitId: rowA.unitId, templateId: 'not-found', quantity: '1' }, base), RangeError);
});

test('source and prior states remain untouched and results are deterministic and serializable', () => {
  const before = JSON.stringify(base), initial = createStructureProposal(base), originalDraft = JSON.stringify(initial);
  let proposal = increase(initial, rowA);
  proposal = renameUnit(proposal, rowB.unitId, 'Unidade em estudo');
  proposal = addPosition(proposal, { unitId: rowA.unitId, templateId: rowB.id, quantity: '2' }, base);
  const first = calculate(proposal);
  assert.deepEqual(calculate(proposal), first);
  assert.equal(JSON.stringify(base), before);
  assert.equal(JSON.stringify(initial), originalDraft);
  assert.deepEqual(JSON.parse(JSON.stringify(first)), first);
  assert.notEqual(initial.units, base.units);
  assert.notEqual(initial.positions[0], base.positions[0]);
  assert.throws(() => setPositionQuantity(proposal, 'not-found', '0'), RangeError);
});

test('new units hold independent documentary-template positions and reproduce the two-position creation case', () => {
  const initial = createStructureProposal(base);
  let proposal = createUnit(initial, { name: 'Unidade proposta', parentUnitId: rowA.unitId, unitType: 'diretoria' }, base);
  const unit = proposal.units.at(-1);
  assert.equal(unit.id, 'proposal-unit-1');
  assert.equal(unit.origin, 'added');
  assert.equal(unit.removed, false);
  assert.equal(unit.sourceRow, null);
  assert.equal(unit.hierarchyStatus, 'proposal-explicit');
  assert.equal(unit.unitType, 'diretoria');
  proposal = addPosition(proposal, { unitId: unit.id, templateId: rowA.id, code: 'CCESP 1.13', quantity: '1' }, base);
  proposal = addPosition(proposal, { unitId: unit.id, templateId: rowB.id, code: 'FCESP 2.01', quantity: '1' }, base);
  const value = calculate(proposal);
  assert.equal(value.status, 'complete');
  assert.equal(value.result.groups.CCESP.quantity, '300');
  assert.equal(value.result.groups.CCESP.quotaCents, '107400');
  assert.equal(value.result.groups.FCESP.quantity, '202');
  assert.equal(value.result.groups.FCESP.quotaCents, '34935');
  assert.equal(value.unitResults.find(item => item.unitId === unit.id).aggregate.quantity, '2');
  assert.equal(value.unitResults.find(item => item.unitId === unit.id).aggregate.quotaCents, '510');
  assert.equal(value.availability.projected.aggregate.quantity, '502');
  assert.ok(value.changes.some(change => change.type === 'unit-added' && change.unitId === unit.id));
  assert.equal(initial.units.length, 221);
  const second = createUnit(proposal, { name: 'Unidade proposta', parentUnitId: unit.id });
  assert.equal(second.units.at(-1).id, 'proposal-unit-2');
  assert.notEqual(second.units.at(-1).id, unit.id, 'names do not identify a unit');
});

test('external parents use only explicit documentary names; missing and ambiguous names are never inferred', () => {
  const names = getExternalParentNames(base);
  assert.ok(names.includes('GABINETE DO SECRETÁRIO'));
  assert.equal(names.includes('Divisão de Gestão Documental'), false);
  let proposal = createUnit(createStructureProposal(base), { name: 'Nova', parentUnitId: null, parentName: 'GABINETE DO SECRETÁRIO' }, base);
  assert.equal(calculate(proposal).status, 'complete');
  assert.equal(proposal.units.at(-1).parentUnitId, null);
  proposal = moveUnit(proposal, rowB.unitId, null, { parentName: 'GABINETE DO SECRETÁRIO' }, base);
  assert.equal(calculate(proposal).status, 'complete');
  assert.equal(proposal.units.find(unit => unit.id === rowB.unitId).parentName, 'GABINETE DO SECRETÁRIO');
  for (const parentName of [undefined, '', 'SGGD', 'Divisão de Gestão Documental', 'Superior inventado']) {
    assert.throws(() => createUnit(createStructureProposal(base), { name: 'Nova', parentUnitId: null, parentName }, base), RangeError);
  }
  assert.throws(() => moveUnit(proposal, rowB.unitId, 'not-found'), RangeError);
});

test('moving a unit preserves all its positions and totals, and records the source and destination', () => {
  const unit = base.units.find(item => item.name === 'Divisão de Formação e Treinamento');
  const initial = createStructureProposal(base);
  const proposal = moveUnit(initial, unit.id, rowA.unitId);
  assert.deepEqual(proposal.positions, initial.positions);
  const value = calculate(proposal);
  assert.equal(value.status, 'complete');
  assert.equal(value.result.aggregate.quantity, '500');
  assert.equal(value.result.aggregate.quotaCents, '141825');
  const change = value.changes.find(item => item.type === 'unit-moved');
  assert.equal(change.unitId, unit.id);
  assert.equal(change.beforeParentUnitId, unit.parentUnitId);
  assert.equal(change.afterParentUnitId, rowA.unitId);
  assert.equal(change.afterParentName, initial.units.find(item => item.id === rowA.unitId).name);
  assert.equal(initial.units.find(item => item.id === unit.id).parentUnitId, unit.parentUnitId);
  assert.deepEqual(resetUnit(proposal, unit.id, base).units.find(item => item.id === unit.id), initial.units.find(item => item.id === unit.id));
});

test('moves reject self, descendant cycles and removed targets without mutating the prior state', () => {
  const child = base.units.find(unit => unit.parentUnitId), parent = base.units.find(unit => unit.id === child.parentUnitId);
  const proposal = createStructureProposal(base), before = structuredClone(proposal);
  assert.throws(() => moveUnit(proposal, child.id, child.id), RangeError);
  assert.throws(() => moveUnit(proposal, parent.id, child.id), RangeError);
  const leaf = base.units.find(unit => !base.units.some(item => item.parentUnitId === unit.id)
    && !base.units.some(item => item.parentCandidates?.includes(unit.id)) && unit.id !== child.id);
  const removed = removeUnit(proposal, leaf.id);
  assert.throws(() => moveUnit(removed, child.id, leaf.id), RangeError);
  assert.deepEqual(proposal, before);
  const forged = structuredClone(proposal);
  const item = forged.units.find(unit => unit.id === parent.id);
  item.parentUnitId = child.id;
  item.mutation = { parentUnitId: child.id };
  const result = calculate(forged);
  assert.equal(result.status, 'incomplete');
  assert.ok(result.issues.some(issue => issue.code === 'hierarchy_cycle'));
});

test('removing the documented training unit reproduces the expected FCESP reduction and restores from source', () => {
  const unit = base.units.find(item => item.name === 'Divisão de Formação e Treinamento');
  const proposal = removeUnit(createStructureProposal(base), unit.id);
  const value = calculate(proposal);
  assert.equal(value.status, 'complete');
  assert.equal(proposal.units.find(item => item.id === unit.id).removed, true);
  assert.ok(proposal.positions.filter(row => row.unitId === unit.id).every(row => row.quantity === '0'));
  assert.equal(value.result.groups.CCESP.quantity, '299');
  assert.equal(value.result.groups.FCESP.quantity, '200');
  assert.equal(value.result.groups.FCESP.quotaCents, '34680');
  assert.ok(value.changes.some(change => change.type === 'unit-removed' && change.unitId === unit.id));
  const directRow = proposal.positions.find(row => row.unitId === unit.id);
  assert.throws(() => setPositionQuantity(proposal, directRow.id, '1'), RangeError);
  assert.throws(() => addPosition(proposal, { unitId: unit.id, templateId: rowA.id, quantity: '1' }, base), RangeError);
  assert.throws(() => renameUnit(proposal, unit.id, 'Nova'), RangeError);
  const restored = resetUnit(proposal, unit.id, base);
  assert.equal(calculate(restored).result.aggregate.quantity, '500');
  assert.deepEqual(calculate(restored).changes, []);
});

test('parent removal requires an explicit descendant decision and never removes ambiguous or unrelated units', () => {
  const child = base.units.find(unit => unit.parentUnitId && !base.units.some(item => item.parentCandidates?.includes(unit.parentUnitId)));
  const parent = base.units.find(unit => unit.id === child.parentUnitId);
  const initial = createStructureProposal(base);
  assert.throws(() => removeUnit(initial, parent.id), /subordinadas/);
  assert.throws(() => removeUnit(initial, parent.id, { includeDescendants: false }), /subordinadas/);
  const removed = removeUnit(initial, parent.id, { includeDescendants: true });
  const ids = new Set(removed.units.filter(unit => unit.removed).map(unit => unit.id));
  assert.ok(ids.has(parent.id) && ids.has(child.id));
  const removedQuantity = base.positions.filter(row => ids.has(row.unitId)).reduce((sum, row) => sum + BigInt(row.quantity), 0n);
  assert.equal(calculate(removed).result.aggregate.quantity, (500n - removedQuantity).toString());
  assert.equal(removed.positions.length, initial.positions.length);
  assert.throws(() => resetUnit(removed, child.id, base), /superior/);
  const parentOnly = resetUnit(removed, parent.id, base);
  assert.equal(parentOnly.units.find(unit => unit.id === parent.id).removed, false);
  assert.equal(parentOnly.units.find(unit => unit.id === child.id).removed, true);
  assert.equal(calculate(parentOnly).status, 'complete');
  const restored = resetUnit(removed, parent.id, base, { includeDescendants: true });
  assert.deepEqual(calculate(restored).changes, []);
  assert.equal(calculate(restored).result.aggregate.quantity, '500');
  const ambiguous = base.units.find(unit => unit.hierarchyStatus === 'model-parent-ambiguous');
  assert.throws(() => removeUnit(initial, ambiguous.parentCandidates[0], { includeDescendants: true }), /ambíguos/);
});

test('explicitly transferring children allows removing only the parent and preserves those children', () => {
  let proposal = createUnit(createStructureProposal(base), { name: 'Pai proposto', parentUnitId: rowA.unitId });
  const parent = proposal.units.at(-1);
  proposal = createUnit(proposal, { name: 'Filha proposta', parentUnitId: parent.id });
  const child = proposal.units.at(-1);
  proposal = addPosition(proposal, { unitId: child.id, templateId: rowA.id, quantity: '2' }, base);
  assert.throws(() => removeUnit(proposal, parent.id, { includeDescendants: false }), RangeError);
  proposal = moveUnit(proposal, child.id, rowA.unitId);
  proposal = removeUnit(proposal, parent.id, { includeDescendants: false });
  assert.equal(proposal.units.find(unit => unit.id === child.id).removed, false);
  assert.equal(proposal.positions.find(row => row.unitId === child.id).quantity, '2');
  assert.equal(calculate(proposal).result.aggregate.quantity, '502');
  assert.throws(() => resetUnit(proposal, parent.id, base), RangeError, 'new units have no invented documentary original');
});

test('explicit code changes derive coefficient and species exactly while preserving documentary identity', () => {
  const initial = createStructureProposal(base);
  let proposal = setPositionCode(initial, rowA.id, 'CCESP 1.04', base);
  let row = proposal.positions.find(position => position.id === rowA.id);
  assert.equal(row.level, 4);
  assert.equal(row.category, 1);
  assert.equal(row.coefficientCents, '175');
  assert.equal(row.templateId, rowA.id);
  assert.equal(row.denomination, rowA.denomination);
  assert.equal(row.sourceRow, rowA.sourceRow);
  assert.equal(row.codeOverride.code, 'CCESP 1.04');
  let value = calculate(proposal);
  assert.equal(value.status, 'complete');
  assert.equal(value.result.groups.CCESP.quotaCents, (106950n + BigInt(rowA.quantity) * (175n - BigInt(rowA.coefficientCents))).toString());
  assert.ok(value.changes.some(change => change.type === 'code' && change.before === rowA.code && change.after === row.code));
  proposal = setPositionCode(proposal, rowA.id, 'FCESP 2.10', base);
  value = calculate(proposal);
  assert.equal(value.result.groups.CCESP.quantity, (299n - BigInt(rowA.quantity)).toString());
  assert.equal(value.result.groups.FCESP.quantity, (201n + BigInt(rowA.quantity)).toString());
  assert.equal(proposal.positions.find(position => position.id === rowA.id).coefficientCents, '195');
  proposal = setPositionCode(proposal, rowA.id, rowA.code, base);
  row = proposal.positions.find(position => position.id === rowA.id);
  assert.equal(Object.hasOwn(row, 'codeOverride'), false);
  assert.deepEqual(calculate(proposal).changes, []);
  assert.deepEqual(initial.positions.find(position => position.id === rowA.id).code, rowA.code);
});

test('new Ouvidoria and deliberately mismatched template codes reach the separate rules module as exact valid arithmetic', () => {
  const coordinator = base.positions.find(row => row.denomination === 'Coordenador');
  assert.ok(coordinator);
  let proposal = createUnit(createStructureProposal(base), { name: 'Ouvidoria proposta', unitType: 'ouvidoria', parentUnitId: rowA.unitId });
  const unitId = proposal.units.at(-1).id;
  proposal = addPosition(proposal, { unitId, templateId: coordinator.id, quantity: '1', code: 'CCESP 1.04' }, base);
  let value = calculate(proposal);
  assert.equal(value.status, 'complete');
  assert.equal(value.result.groups.CCESP.quotaCents, '107125');
  assert.equal(value.result.groups.CCESP.quantity, '300');
  assert.equal(value.unitResults.find(item => item.unitId === unitId).groups.CCESP.quotaCents, '175');
  proposal = addPosition(proposal, { unitId, templateId: coordinator.id, quantity: '1', code: 'CCESP 2.10' }, base);
  value = calculate(proposal);
  assert.equal(value.status, 'complete');
  assert.equal(value.positionResults.at(-1).category, 2);
  assert.equal(value.positionResults.at(-1).denomination, 'Coordenador');
  assert.equal(value.positionResults.at(-1).coefficientCents, '325');
});

test('invalid or untracked codes and altered source metadata fail closed', () => {
  for (const code of ['CCESP 2.18', 'FCESP 2.18', 'CCESP 3.10', 'CCESP 1.00', 'CCESP 1.19', 'CCESP 1.1', 'UNKNOWN 1.10', '']) {
    assert.throws(() => setPositionCode(createStructureProposal(base), rowA.id, code, base), RangeError);
  }
  const explicit = setPositionCode(createStructureProposal(base), rowA.id, 'CCESP 1.04', base);
  const alterations = [
    proposal => { delete proposal.positions[0].codeOverride; },
    proposal => { proposal.positions[0].codeOverride.catalogueVersion = 'invented'; },
    proposal => { proposal.positions[0].coefficientCents = '0'; },
    proposal => { proposal.positions[0].denomination = 'Invented'; },
    proposal => { proposal.positions[0].sourceRow = -1; },
    proposal => { proposal.units[0].sourceRow = -1; },
    proposal => { proposal.units[0].unitType = 'other'; },
    proposal => { proposal.units[0].removed = true; },
    proposal => { proposal.units.shift(); },
  ];
  for (const alter of alterations) {
    const proposal = structuredClone(explicit); alter(proposal);
    assert.equal(calculate(proposal).status, 'incomplete');
  }
  for (const mutate of [
    source => { source.units[0].name = 'Altered source name'; },
    source => { source.positions[0].denomination = 'Altered source denomination'; },
    source => { source.version = 'another-version-with-same-totals'; },
  ]) {
    const source = structuredClone(base); mutate(source);
    const value = calculateStructureProposal(createStructureProposal(source), source);
    assert.equal(value.baselineValid, false);
    assert.equal(value.availability.status, 'unavailable');
  }
});
