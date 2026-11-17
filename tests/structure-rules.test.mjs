import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStructureRules } from '../src/structure-rules.mjs';
import { sggdStructure as base } from '../src/data/sggd-structure.mjs';

const initial = () => ({ organizationId: 'sggd', units: structuredClone(base.units), positions: structuredClone(base.positions) });
const check = proposal => evaluateStructureRules(proposal, base);
const unitAlerts = (proposal, id) => check(proposal).alerts.filter(alert => alert.unitId === id);
const has = (alerts, code) => alerts.find(alert => alert.code === code);
function addUnit(proposal, { id = 'test-unit', name = 'Unidade de teste', unitType = 'other', parentUnitId = null } = {}) {
  proposal.units.push({ id, name, unitType, parentUnitId, origin: 'added', removed: false });
  return id;
}
function addPosition(proposal, unitId, { id = `${unitId}-position`, denomination = 'Chefe de Setor', code = 'CCESP 1.04', quantity = '1' } = {}) {
  proposal.positions.push({ id, unitId, denomination, code, quantity, origin: 'added' });
  return id;
}

test('the documentary baseline is reviewed openly and does not produce new user-caused errors', () => {
  const proposal = initial(), before = JSON.stringify(proposal), baseBefore = JSON.stringify(base);
  const result = check(proposal);
  assert.ok(result.baselineAlerts.length > 0);
  assert.deepEqual(result.alerts, result.baselineAlerts);
  assert.ok(result.alerts.every(alert => alert.origin === 'baseline' && alert.severity === 'warning' && alert.status === 'model-review'));
  const chiefConflict = result.baselineAlerts.find(alert => alert.code === 'category_incompatible');
  assert.ok(chiefConflict);
  assert.ok(chiefConflict.message.includes('Chefe de Assessoria'));
  assert.equal(chiefConflict.ruleStatus, 'verified');
  assert.ok(result.baselineAlerts.some(alert => alert.code === 'reference_head_unconfirmed'));
  assert.equal(JSON.stringify(proposal), before);
  assert.equal(JSON.stringify(base), baseBefore);
});

test('T09 removing the explicit category-1 commander of Chefia de Gabinete triggers a new error', () => {
  const proposal = initial(), unit = base.units.find(unit => unit.name === 'CHEFIA DE GABINETE');
  const chief = proposal.positions.find(row => row.unitId === unit.id && row.code === 'CCESP 1.16');
  chief.quantity = '0';
  const alert = has(unitAlerts(proposal, unit.id), 'missing_commander');
  assert.equal(alert.severity, 'error');
  assert.equal(alert.status, 'verified');
  assert.equal(alert.origin, 'new');
  assert.ok(alert.source.url.startsWith('https://www.al.sp.gov.br/'));
});

test('titular classification uses code category, not a name resembling a chief', () => {
  const proposal = initial(), id = addUnit(proposal);
  addPosition(proposal, id, { denomination: 'Chefe de Setor', code: 'CCESP 2.04' });
  const alerts = unitAlerts(proposal, id);
  assert.equal(has(alerts, 'missing_commander').severity, 'error');
  assert.equal(has(alerts, 'category_incompatible').severity, 'error');
});

test('pending quantity does not become zero or an alleged absent commander', () => {
  const proposal = initial(), unit = base.units[0];
  proposal.positions.find(row => row.unitId === unit.id && row.category === 1).quantity = '';
  const result = check(proposal);
  assert.ok(result.coverage.pendingUnits.includes(unit.id));
  assert.equal(has(result.alerts.filter(alert => alert.unitId === unit.id), 'missing_commander'), undefined);
  assert.equal(has(result.alerts.filter(alert => alert.unitId === unit.id), 'unit_without_positions'), undefined);
});

test('R01 Coordinator at level 10 warns and an advisory code for the command role errors independently', () => {
  const proposal = initial(), id = base.units[0].id;
  const lowId = addPosition(proposal, id, { id: 'coordinator-low', denomination: 'Coordenador', code: 'CCESP 1.10' });
  const wrongCategoryId = addPosition(proposal, id, { id: 'coordinator-advisory', denomination: 'Coordenador', code: 'CCESP 2.13' });
  const alerts = unitAlerts(proposal, id);
  const low = alerts.find(alert => alert.positionId === lowId && alert.code === 'level_incompatible');
  assert.equal(low.severity, 'warning'); assert.equal(low.status, 'verified');
  const category = alerts.find(alert => alert.positionId === wrongCategoryId && alert.code === 'category_incompatible');
  assert.equal(category.severity, 'error'); assert.equal(category.status, 'verified');
});

test('an advisor at the same or higher level than the explicit commander triggers a hierarchy error', () => {
  for (const code of ['CCESP 2.04', 'FCESP 2.05']) {
    const proposal = initial(), id = addUnit(proposal);
    addPosition(proposal, id);
    addPosition(proposal, id, { id: 'advisor', denomination: code.endsWith('04') ? 'Assistente IV' : 'Assistente Técnico I', code });
    const alert = has(unitAlerts(proposal, id), 'subordinate_level_not_lower');
    assert.equal(alert.severity, 'error'); assert.equal(alert.status, 'verified');
    assert.equal(alert.positionId, 'advisor');
  }
});

test('R03 explicit Ouvidoria at level 4 errors, level 5 satisfies the Annex VIII minimum', () => {
  const proposal = initial(), id = addUnit(proposal, { unitType: 'ouvidoria', name: 'Atendimento e escuta' });
  const positionId = addPosition(proposal, id);
  const alert = has(unitAlerts(proposal, id), 'control_unit_below_minimum');
  assert.equal(alert.severity, 'error'); assert.equal(alert.status, 'verified');
  assert.equal(alert.observed.minimum, 5);
  Object.assign(proposal.positions.find(row => row.id === positionId), { denomination: 'Chefe de Seção', code: 'CCESP 1.05' });
  assert.equal(has(unitAlerts(proposal, id), 'control_unit_below_minimum'), undefined);
});

test('a suggestive new unit name without an explicit type yields review, not normative enforcement', () => {
  const proposal = initial(), id = addUnit(proposal, { name: 'Nova Ouvidoria' });
  addPosition(proposal, id);
  const alerts = unitAlerts(proposal, id);
  assert.equal(has(alerts, 'unit_type_unconfirmed').status, 'model-review');
  assert.equal(has(alerts, 'control_unit_below_minimum'), undefined);
});

test('R04 a new explicit Diretoria without subordinate units warns and remains a draft-review condition', () => {
  const proposal = initial(), id = addUnit(proposal, { unitType: 'diretoria' });
  addPosition(proposal, id, { denomination: 'Diretor', code: 'CCESP 1.15' });
  const alert = has(unitAlerts(proposal, id), 'insufficient_subordinate_units');
  assert.equal(alert.severity, 'warning'); assert.equal(alert.status, 'verified');
  assert.equal(alert.observed.count, 0); assert.equal(alert.observed.minimum, 2);
  assert.ok(alert.source.provision.includes('art. 18'));
});

test('minimum counts distinct directly linked unit identities and exact titular-level ranges', () => {
  const proposal = initial(), parent = addUnit(proposal, { id: 'directorate', unitType: 'diretoria' });
  addPosition(proposal, parent, { denomination: 'Diretor', code: 'CCESP 1.15' });
  const first = addUnit(proposal, { id: 'first-child', name: 'Mesmo nome', parentUnitId: parent });
  addPosition(proposal, first, { denomination: 'Coordenador Geral', code: 'CCESP 1.14' });
  const second = addUnit(proposal, { id: 'second-child', name: 'Mesmo nome', parentUnitId: parent });
  const secondPosition = addPosition(proposal, second, { denomination: 'Coordenador', code: 'CCESP 1.13' });
  assert.equal(has(unitAlerts(proposal, parent), 'insufficient_subordinate_units'), undefined);
  proposal.positions.find(row => row.id === secondPosition).code = 'CCESP 1.12';
  assert.equal(has(unitAlerts(proposal, parent), 'insufficient_subordinate_units').observed.count, 1);
  proposal.positions.find(row => row.id === secondPosition).code = 'CCESP 1.13';
  proposal.units.find(unit => unit.id === second).removed = true;
  assert.equal(has(unitAlerts(proposal, parent), 'insufficient_subordinate_units').observed.count, 1);
  proposal.units.find(unit => unit.id === second).removed = false;
  proposal.units.find(unit => unit.id === second).parentUnitId = first;
  assert.equal(has(unitAlerts(proposal, parent), 'insufficient_subordinate_units').observed.count, 1);
});

test('one child with several command positions cannot satisfy a minimum of two units', () => {
  const proposal = initial(), parent = addUnit(proposal, { id: 'directorate', unitType: 'diretoria' });
  addPosition(proposal, parent, { denomination: 'Diretor', code: 'CCESP 1.15' });
  const child = addUnit(proposal, { id: 'child', parentUnitId: parent });
  addPosition(proposal, child, { denomination: 'Coordenador', code: 'CCESP 1.13', quantity: '9007199254740993' });
  assert.equal(has(unitAlerts(proposal, parent), 'insufficient_subordinate_units').observed.count, 1);
  assert.equal(has(unitAlerts(proposal, child), 'multiple_command_positions').observed.commandQuantity, '9007199254740993');
});

test('the express corporate subsecretariat exception is not replaced by the generic three-unit threshold', () => {
  const proposal = initial();
  const corporate = base.units.find(unit => unit.name === 'SUBSECRETARIA DE GESTÃO CORPORATIVA');
  assert.equal(has(unitAlerts(proposal, corporate.id), 'insufficient_subordinate_units'), undefined);
  const parent = addUnit(proposal, { id: 'corporate', unitType: 'subsecretaria-gestao-corporativa' });
  addPosition(proposal, parent, { denomination: 'Subsecretário', code: 'CCESP 1.17' });
  for (let index = 1; index <= 2; index += 1) {
    const child = addUnit(proposal, { id: `corporate-child-${index}`, parentUnitId: parent });
    addPosition(proposal, child, { denomination: 'Coordenador', code: 'CCESP 1.13' });
  }
  assert.equal(has(unitAlerts(proposal, parent), 'insufficient_subordinate_units'), undefined);
});

test('retired units are excluded while an active empty unit remains a review problem', () => {
  const proposal = initial(), id = addUnit(proposal);
  assert.equal(has(unitAlerts(proposal, id), 'unit_without_positions').severity, 'error');
  proposal.units.find(unit => unit.id === id).removed = true;
  assert.deepEqual(unitAlerts(proposal, id), []);
});

test('inherited source discrepancies stay separate while new errors elsewhere are identified', () => {
  const proposal = initial(), before = check(proposal);
  const id = addUnit(proposal, { unitType: 'ouvidoria' }); addPosition(proposal, id);
  const after = check(proposal);
  assert.deepEqual(after.baselineAlerts, before.baselineAlerts);
  assert.ok(after.alerts.some(alert => alert.origin === 'baseline'));
  assert.ok(after.alerts.some(alert => alert.unitId === id && alert.origin === 'new' && alert.severity === 'error'));
});

test('rules are not silently applied to a different organization or inherited browser scope', () => {
  const proposal = initial();
  proposal.selectedUnitId = 'non-existent'; proposal.search = 'hidden'; proposal.collapsedUnitIds = base.units.map(unit => unit.id);
  assert.deepEqual(check(proposal), check(initial()));
  const unsupported = evaluateStructureRules({ ...proposal, organizationId: 'autarchy' }, { ...base, organizationId: 'autarchy' });
  assert.equal(unsupported.coverage.supported, false); assert.deepEqual(unsupported.alerts, []);
});
