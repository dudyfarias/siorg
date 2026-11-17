import test from 'node:test';
import assert from 'node:assert/strict';
import { sggdStructure as base } from '../src/data/sggd-structure.mjs';
import {
  createStructureProposal, setPositionQuantity, addPosition, removePosition,
  renameUnit, createUnit, moveUnit, removeUnit, setPositionCode,
} from '../src/structure-proposal.mjs';
import { deriveProposalOutputs, buildProposalSummaryText } from '../src/proposal-outputs.mjs';
import { createAnnexPdf } from '../src/annex-pdf.mjs';
import { encodeProposal, decodeProposal } from '../src/proposal-storage.mjs';

// Sixteen SGGD scenarios, inspired by the received workbook's T00–T11/R01–R04.
// These are executed portal checks, not certification of the workbook or 20 organs.
// Expected totals below are literal independent calculations in hundredths of a
// quota: II CC=299/106950, FC=201/34875; III CC=298/106600, FC=201/34935.
const date = '2026-10-22T15:00:00.000Z';
const fresh = () => createStructureProposal(base);
const firstUnit = base.units[0], cabinet = base.units.find(unit => unit.name === 'CHEFIA DE GABINETE');
const lastUnit = base.units.find(unit => unit.name === 'Divisão de Formação e Treinamento');
const template = (name, code) => {
  const row = base.positions.find(position => position.denomination === name && position.code === code);
  assert.ok(row, `Documentary template missing: ${name} / ${code}`);
  return row;
};
const direct = (unitId, code) => base.positions.find(position => position.unitId === unitId && position.code === code);
const inspect = proposal => deriveProposalOutputs(proposal, base);
const summary = proposal => buildProposalSummaryText(proposal, base, { generatedAt: date });
const pdf = proposal => createAnnexPdf(proposal, base, { generatedAt: date });
const added = (proposal, unitId, name, code, quantity = '1') => addPosition(proposal,
  { unitId, templateId: template(name, code).id, quantity }, base);
const newAlerts = outputs => outputs.rules.alerts.filter(alert => alert.origin === 'new');
const totals = (proposal, ccQty, ccQuota, fcQty, fcQuota) => {
  const outputs = inspect(proposal);
  assert.equal(outputs.status, 'complete');
  for (const [group, quantity, quotaCents] of [['CCESP', ccQty, ccQuota], ['FCESP', fcQty, fcQuota]]) {
    assert.equal(outputs.calculation.result.groups[group].quantity, quantity);
    assert.equal(outputs.calculation.result.groups[group].quotaCents, quotaCents);
    assert.equal(outputs.summary.comparisons.groups[group].quantity.after, quantity);
    assert.equal(outputs.summary.comparisons.groups[group].quotaCents.after, quotaCents);
  }
  return outputs;
};

test('T00 — untouched SGGD preserves 407 lines, 221 units and the separate II/III balances', () => {
  const before = JSON.stringify(base), proposal = fresh();
  const outputs = totals(proposal, '299', '106950', '201', '34875');
  assert.equal(outputs.annex.rowCount, 407);
  assert.equal(outputs.annex.unitCount, 221);
  assert.equal(outputs.summary.counts.total, 0);
  assert.equal(outputs.ruleBlockers.length, 0);
  assert.equal(outputs.canDownloadAnnex, true);
  assert.ok(outputs.rules.baselineAlerts.length > 0);
  const balance = outputs.summary.availability.currentBalance.groups;
  assert.equal(balance.CCESP.quantity.balance, '-1');
  assert.equal(balance.CCESP.quotas.balance, '-350');
  assert.equal(balance.FCESP.quantity.balance, '0');
  assert.equal(balance.FCESP.quotas.balance, '60');
  assert.deepEqual(outputs.annex.rows.map(row => row.positionId), base.positions.map(row => row.id));
  assert.equal(JSON.stringify(base), before);
});

test('T01 — removing Secretário Executivo subtracts 1/900 but exposes the missing commander', () => {
  const proposal = removePosition(fresh(), base.positions[0].id);
  const outputs = totals(proposal, '298', '106050', '201', '34875');
  assert.equal(outputs.annex.rowCount, 406);
  assert.equal(outputs.annex.rows.some(row => row.positionId === base.positions[0].id), false);
  assert.ok(outputs.ruleBlockers.some(alert => alert.unitId === firstUnit.id && alert.code === 'missing_commander'));
  assert.throws(() => pdf(proposal), error => error.code === 'structural_rule_block');
});

test('T02 — adding two Assessor I in Chefia adds 2/600 once across outputs', () => {
  const proposal = added(fresh(), cabinet.id, 'Assessor I', 'CCESP 2.09', '2');
  const outputs = totals(proposal, '301', '107550', '201', '34875');
  const position = proposal.positions.at(-1);
  assert.equal(outputs.annex.rows.filter(row => row.positionId === position.id).length, 1);
  assert.equal(outputs.annex.rows.find(row => row.positionId === position.id).quantity, '2');
  assert.equal(outputs.summary.counts.added, 1);
  assert.match(summary(proposal), /CCESP 2\.09 — Assessor I: 0 → 2/u);
  assert.equal(outputs.ruleBlockers.length, 0);
});

test('T03 — removing a whole unit zeros preserved rows and omits it from the Annex', () => {
  const proposal = removeUnit(fresh(), lastUnit.id);
  const outputs = totals(proposal, '299', '106950', '200', '34680');
  assert.equal(outputs.summary.structureCounts['unit-removed'], 1);
  assert.equal(outputs.annex.rows.some(row => row.unitId === lastUnit.id), false);
  assert.ok(proposal.positions.filter(row => row.unitId === lastUnit.id).every(row => row.quantity === '0'));
  assert.equal(outputs.ruleBlockers.length, 0);
  assert.match(summary(proposal), /Unidade retirada da proposta/u);
  // Independent cross-check supplied for the first unit: five CC / 3350 and one FC / 60.
  const firstRemoved = removeUnit(fresh(), firstUnit.id);
  const firstOutputs = totals(firstRemoved, '294', '103600', '200', '34815');
  assert.equal(firstOutputs.annex.rowCount, 402);
  assert.equal(firstOutputs.annex.unitCount, 220);
  assert.equal(pdf(firstRemoved).lastAutoTable.body.some(row => row.raw[0] === firstUnit.name), false);
});

test('T04 — renaming a unit changes summary and PDF names without changing amounts', () => {
  const name = 'Chefia de Gabinete proposta';
  const proposal = renameUnit(fresh(), cabinet.id, name);
  const outputs = totals(proposal, '299', '106950', '201', '34875');
  assert.equal(outputs.summary.counts.renamed, 1);
  assert.ok(outputs.annex.rows.filter(row => row.unitId === cabinet.id).every(row => row.unitName === name));
  assert.match(summary(proposal), /“CHEFIA DE GABINETE” → “Chefia de Gabinete proposta”/u);
  const cells = pdf(proposal).lastAutoTable.body.map(row => row.raw);
  assert.ok(cells.some(row => row[0] === name));
  assert.equal(cells.some(row => row[0] === cabinet.name), false);
});

test('T05 — transfer preserves all amounts, names the new parent and moves its Annex block', () => {
  let proposal = moveUnit(fresh(), lastUnit.id, firstUnit.id, {}, base);
  proposal = renameUnit(proposal, firstUnit.id, 'Secretaria Executiva proposta');
  const outputs = totals(proposal, '299', '106950', '201', '34875');
  assert.equal(outputs.summary.structureCounts['unit-moved'], 1);
  assert.equal(outputs.summary.counts.added, 0);
  assert.equal(outputs.summary.counts.removed, 0);
  assert.match(summary(proposal), /Coordenadoria de Difusão de Acervos → Secretaria Executiva proposta/u);
  const ids = outputs.annex.rows.map(row => row.unitId);
  assert.ok(ids.indexOf(lastUnit.id) > ids.lastIndexOf(firstUnit.id));
  assert.ok(ids.indexOf(lastUnit.id) < ids.indexOf(cabinet.id));
  assert.equal(outputs.ruleBlockers.length, 0);
  const cells = pdf(proposal).lastAutoTable.body.map(row => row.raw);
  const movedIndex = cells.findIndex(row => row[0] === `${lastUnit.name}\nVinculada a: Secretaria Executiva proposta`);
  assert.ok(movedIndex >= 0, 'a unidade transferida informa o vínculo proposto dentro da coluna UNIDADE');
  assert.ok(movedIndex < cells.findIndex(row => row[0] === cabinet.name));
  assert.equal(cells[movedIndex].length, 4);
});

test('T06 — a new unit with command and assistant reaches the Annex and PDF with both species', () => {
  let proposal = createUnit(fresh(), { name: 'Coordenadoria proposta', parentUnitId: firstUnit.id, unitType: 'other' }, base);
  const unit = proposal.units.at(-1);
  proposal = added(proposal, unit.id, 'Coordenador', 'CCESP 1.13');
  proposal = added(proposal, unit.id, 'Assistente I', 'FCESP 2.01');
  const outputs = totals(proposal, '300', '107400', '202', '34935');
  assert.equal(outputs.annex.rowCount, 409);
  assert.equal(outputs.annex.unitCount, 222);
  assert.equal(outputs.summary.structureCounts['unit-created'], 1);
  assert.equal(outputs.ruleBlockers.length, 0);
  assert.match(summary(proposal), /Unidade criada na proposta/u);
  const unitLabel = `${unit.name}\nVinculada a: ${firstUnit.name}`;
  assert.deepEqual(pdf(proposal).lastAutoTable.body.map(row => row.raw).filter(row => row[0] === unitLabel), [
    [unitLabel, '1', 'Coordenador', 'CCESP 1.13'], [unitLabel, '1', 'Assistente I', 'FCESP 2.01'],
  ]);
});

test('T07 — editing the final quantity does not create a duplicate position', () => {
  const iv = direct(firstUnit.id, 'CCESP 2.16'), iii = direct(firstUnit.id, 'CCESP 2.15');
  const proposal = setPositionQuantity(fresh(), iv.id, '2');
  const outputs = totals(proposal, '300', '107650', '201', '34875');
  assert.equal(outputs.annex.rowCount, 407);
  assert.equal(outputs.summary.counts.quantityChanges, 1);
  assert.equal(outputs.summary.counts.added, 0);
  assert.equal(outputs.annex.rows.filter(row => row.positionId === iv.id).length, 1);
  const alternate = setPositionQuantity(fresh(), iii.id, '3');
  totals(alternate, '300', '107550', '201', '34875');
  assert.match(summary(alternate), /Assessor Especial III: 2 → 3/u);
});

test('T08 — replacing one FC assistant with one CC assistant retains independent balances', () => {
  let proposal = removePosition(fresh(), direct(firstUnit.id, 'FCESP 2.01').id);
  proposal = added(proposal, firstUnit.id, 'Assistente I', 'CCESP 2.01');
  const outputs = totals(proposal, '300', '107050', '200', '34815');
  const balance = outputs.summary.availability.proposedBalance.groups;
  assert.equal(balance.CCESP.quantity.balance, '-2');
  assert.equal(balance.CCESP.quotas.balance, '-450');
  assert.equal(balance.FCESP.quantity.balance, '1');
  assert.equal(balance.FCESP.quotas.balance, '120');
  assert.equal(outputs.summary.counts.added, 1);
  assert.equal(outputs.summary.counts.removed, 1);
  assert.equal(outputs.ruleBlockers.length, 0);
});

test('T09 — removing the only Chefia commander produces a new verified blocker and stops PDF', () => {
  const proposal = removePosition(fresh(), direct(cabinet.id, 'CCESP 1.16').id);
  const outputs = totals(proposal, '298', '106250', '201', '34875');
  const alert = outputs.ruleBlockers.find(item => item.unitId === cabinet.id && item.code === 'missing_commander');
  assert.equal(alert.status, 'verified');
  assert.equal(alert.origin, 'new');
  assert.equal(outputs.canGenerateAnnex, true);
  assert.equal(outputs.canDownloadAnnex, false);
  assert.throws(() => pdf(proposal), error => error.code === 'structural_rule_block');
});

test('T10 — invalid quantity remains pending and survives a draft round-trip instead of becoming zero', () => {
  for (const quantity of ['-1', '', 'abc']) {
    const proposal = added(fresh(), firstUnit.id, 'Assistente I', 'CCESP 2.01', quantity);
    const restored = decodeProposal(encodeProposal(proposal, base, { savedAt: date }), base);
    assert.equal(restored.positions.at(-1).quantity, quantity);
    const outputs = inspect(restored);
    assert.equal(outputs.status, 'incomplete');
    assert.equal(outputs.summary.comparisons.groups.CCESP.quantity.after, null);
    assert.equal(outputs.annex.rowCount, 0);
    assert.equal(outputs.canDownloadAnnex, false);
    assert.throws(() => pdf(restored), error => error.code === 'incomplete_proposal');
  }
});

test('T11 — combined edits round-trip with full names, structural events and independent totals', () => {
  // Reproducible combination of our own: +one Assessor III (+600 CC), -one FC
  // assistant (-60 FC), +a new Diretor (+600 CC), plus rename and transfer.
  let proposal = setPositionQuantity(fresh(), direct(firstUnit.id, 'CCESP 2.15').id, '3');
  proposal = removePosition(proposal, direct(firstUnit.id, 'FCESP 2.01').id);
  proposal = renameUnit(proposal, cabinet.id, 'Gabinete proposto');
  proposal = moveUnit(proposal, lastUnit.id, cabinet.id, {}, base);
  proposal = createUnit(proposal, { name: 'Diretoria de teste integrado', parentUnitId: firstUnit.id, unitType: 'diretoria' }, base);
  const unit = proposal.units.at(-1);
  proposal = added(proposal, unit.id, 'Diretor', 'CCESP 1.15');
  const restored = decodeProposal(encodeProposal(proposal, base, { savedAt: date }), base);
  assert.deepEqual(restored, proposal);
  const outputs = totals(restored, '301', '108150', '200', '34815');
  assert.equal(outputs.summary.structureCounts['unit-created'], 1);
  assert.equal(outputs.summary.structureCounts['unit-moved'], 1);
  assert.equal(outputs.summary.counts.renamed, 1);
  assert.equal(outputs.summary.counts.removed, 1);
  assert.equal(outputs.summary.counts.quantityChanges, 1);
  assert.match(summary(restored), /Coordenadoria de Difusão de Acervos → Gabinete proposto/u);
  assert.equal(outputs.ruleBlockers.length, 0);
  assert.equal(pdf(restored).lastAutoTable.body.length, 407);
});

test('R01 — changing a command code distinguishes level warning from category blocker', () => {
  let proposal = added(fresh(), firstUnit.id, 'Coordenador', 'CCESP 1.13');
  const firstId = proposal.positions.at(-1).id;
  proposal = setPositionCode(proposal, firstId, 'CCESP 1.10', base);
  proposal = added(proposal, firstUnit.id, 'Coordenador', 'CCESP 1.13');
  const secondId = proposal.positions.at(-1).id;
  proposal = setPositionCode(proposal, secondId, 'CCESP 2.13', base);
  const outputs = totals(proposal, '301', '107725', '201', '34875');
  const alerts = newAlerts(outputs);
  assert.equal(alerts.find(item => item.positionId === firstId && item.code === 'level_incompatible').severity, 'warning');
  assert.equal(alerts.find(item => item.positionId === secondId && item.code === 'category_incompatible').severity, 'error');
  assert.equal(outputs.canDownloadAnnex, false);
  const restored = decodeProposal(encodeProposal(proposal, base, { savedAt: date }), base);
  assert.equal(restored.positions.find(row => row.id === firstId).code, 'CCESP 1.10');
  assert.equal(restored.positions.find(row => row.id === secondId).code, 'CCESP 2.13');
  assert.throws(() => pdf(proposal), error => error.code === 'structural_rule_block');
});

test('R02 — quota/quantity excess remains visible but does not silently block a numeric draft', () => {
  const proposal = added(fresh(), firstUnit.id, 'Assistente I', 'CCESP 2.01');
  const outputs = totals(proposal, '300', '107050', '201', '34875');
  const balance = outputs.summary.availability.proposedBalance.groups;
  assert.equal(balance.CCESP.quantity.balance, '-2');
  assert.equal(balance.CCESP.quotas.balance, '-450');
  assert.equal(balance.FCESP.quantity.balance, '0');
  assert.equal(balance.FCESP.quotas.balance, '60');
  assert.equal(outputs.canDownloadAnnex, true);
  assert.match(summary(proposal), /CCESP e FCESP são avaliados separadamente/u);
});

test('R03 — an explicit new Ouvidoria at level 4 triggers the verified minimum-level blocker', () => {
  let proposal = createUnit(fresh(), { name: 'Ouvidoria proposta', parentUnitId: firstUnit.id, unitType: 'ouvidoria' }, base);
  const unit = proposal.units.at(-1);
  proposal = added(proposal, unit.id, 'Chefe de Seção', 'CCESP 1.05');
  proposal = setPositionCode(proposal, proposal.positions.at(-1).id, 'CCESP 1.04', base);
  const outputs = totals(proposal, '300', '107125', '201', '34875');
  const alert = outputs.ruleBlockers.find(item => item.unitId === unit.id && item.code === 'control_unit_below_minimum');
  assert.equal(alert.status, 'verified');
  assert.equal(alert.observed.minimum, 5);
  assert.equal(outputs.canDownloadAnnex, false);
  assert.throws(() => pdf(proposal), error => error.code === 'structural_rule_block');
});

test('R04 — new Diretoria without subunits warns, then two eligible direct identities satisfy the count', () => {
  let proposal = createUnit(fresh(), { name: 'Diretoria proposta', parentUnitId: firstUnit.id, unitType: 'diretoria' }, base);
  const directorate = proposal.units.at(-1);
  proposal = added(proposal, directorate.id, 'Diretor', 'CCESP 1.15');
  const initial = totals(proposal, '300', '107550', '201', '34875');
  const alert = newAlerts(initial).find(item => item.unitId === directorate.id && item.code === 'insufficient_subordinate_units');
  assert.equal(alert.severity, 'warning');
  assert.equal(alert.observed.count, 0);
  assert.equal(alert.observed.minimum, 2);
  assert.equal(initial.canDownloadAnnex, true);
  for (const name of ['Coordenadoria A', 'Coordenadoria B']) {
    proposal = createUnit(proposal, { name, parentUnitId: directorate.id, unitType: 'other' }, base);
    proposal = added(proposal, proposal.units.at(-1).id, 'Coordenador', 'CCESP 1.13');
  }
  const complete = totals(proposal, '302', '108450', '201', '34875');
  assert.equal(newAlerts(complete).some(item => item.unitId === directorate.id && item.code === 'insufficient_subordinate_units'), false);
  assert.equal(complete.annex.unitCount, 224);
  assert.equal(complete.ruleBlockers.length, 0);
});
