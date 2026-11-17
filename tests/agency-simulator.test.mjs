import { test } from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { getSimulatorBase } from '../src/data/simulator-bases.mjs';
import { createStructureProposal, setPositionQuantity, setPositionCode, createUnit, addPosition } from '../src/structure-proposal.mjs';
import { deriveProposalOutputs, buildProposalSummaryText } from '../src/proposal-outputs.mjs';
import { createAnnexPdf } from '../src/annex-pdf.mjs';
import { createProposalXlsx } from '../src/proposal-xlsx.mjs';
import { decodeProposal, encodeProposal, getProposalStorageKey } from '../src/proposal-storage.mjs';

const cases = [
  { id: 'sp-aguas', allocated: ['342', '97225'], limits: ['373', '97430'], rows: 199 },
  { id: 'arsesp', allocated: ['90', '42550'], limits: ['90', '42550'], original: '76', rows: 73 },
  { id: 'artesp', allocated: ['154', '58000'], limits: ['154', '58000'], original: '106', rows: 134 },
];
const fields = totals => [totals.quantity, totals.quotaCents];

for (const fixture of cases) {
  test(`${fixture.id} loads official unit distribution and comparison totals independently of the original law`, () => {
    const base = getSimulatorBase(fixture.id);
    const draft = createStructureProposal(base);
    const outputs = deriveProposalOutputs(draft, base);
    const { calculation, annex, summary } = outputs;
    assert.equal(outputs.canDownloadAnnex, true);
    assert.deepEqual(calculation.issues, []);
    assert.deepEqual(fields(calculation.result.aggregate), fixture.allocated);
    assert.deepEqual(fields(calculation.availability.limits.aggregate), fixture.limits);
    assert.equal(base.originalReference?.quantity, fixture.original);
    assert.equal(annex.rowCount, fixture.rows);
    assert.equal(summary.counts.total, 0);
  });

  test(`${fixture.id} sends one edit through calculation, summary, exports and resumable draft`, async () => {
    const base = getSimulatorBase(fixture.id);
    const original = base.positions[0];
    const nextQuantity = String(Number(original.quantity) + 1);
    const draft = setPositionQuantity(createStructureProposal(base), original.id, nextQuantity);
    const outputs = deriveProposalOutputs(draft, base);
    const { calculation, annex, summary } = outputs;
    assert.equal(calculation.result.aggregate.quantity, String(Number(fixture.allocated[0]) + 1));
    assert.equal(calculation.result.aggregate.quotaCents, String(Number(fixture.allocated[1]) + Number(original.coefficientCents)));
    assert.equal(calculation.availability.proposedBalance.groups.CCESP.status, 'exceeded');
    assert.equal(summary.comparisons.groups.CCESP.quantity.delta, '1');
    assert.equal(annex.rows.find(row => row.positionId === original.id).quantity, nextQuantity);
    assert.match(buildProposalSummaryText(draft, base), /Quadro demonstrativo da proposta/);
    assert.equal(createAnnexPdf(draft, base).getNumberOfPages() > 0, true);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await createProposalXlsx(draft, base));
    assert.equal(workbook.getWorksheet('Quadro demonstrativo').getCell('B9').value, Number(nextQuantity));
    assert.equal(workbook.getWorksheet('Calculadora').getCell('E9').value, Number(fixture.allocated[0]) - (fixture.id === 'sp-aguas' ? 89 : 0) + 1);
    const encoded = encodeProposal(draft, base);
    assert.equal(decodeProposal(encoded, base).positions[0].quantity, nextQuantity);
    const sggd = getSimulatorBase('sggd');
    assert.notEqual(getProposalStorageKey(base), getProposalStorageKey(sggd));
    assert.throws(() => decodeProposal(encoded, sggd));
  });
}

test('SP-Águas calculates CCESP and FCESP balances independently and retains verified links', () => {
  const base = getSimulatorBase('sp-aguas');
  const draft = createStructureProposal(base);
  const { calculation } = deriveProposalOutputs(draft, base);
  const { groups } = calculation.availability.proposedBalance;
  assert.equal(groups.CCESP.quantity.balance, '2');
  assert.equal(groups.CCESP.quotas.balance, '175');
  assert.equal(groups.FCESP.quantity.balance, '29');
  assert.equal(groups.FCESP.quotas.balance, '30');
  assert.equal(draft.units.filter(unit => unit.parentUnitId).length, 47);
});

test('ARTESP keeps published levels without creating full CCESP codes and handles new units', () => {
  const base = getSimulatorBase('artesp');
  const original = base.positions[0];
  assert.equal(original.code, 'CCESP nível 15');
  const draft = createStructureProposal(base);
  assert.throws(() => setPositionCode(draft, original.id, 'CCESP 1.15', base));
  const renamed = setPositionCode(draft, original.id, 'CCESP nível 16', base);
  const withUnit = createUnit(renamed, { name: 'Unidade em simulação', parentUnitId: base.units[0].id }, base);
  const added = addPosition(withUnit, { unitId: withUnit.units.at(-1).id, templateId: original.id, quantity: '1' }, base);
  const complete = deriveProposalOutputs(added, base);
  assert.equal(complete.canDownloadAnnex, true);
  assert.equal(complete.calculation.result.aggregate.quotaCents, '58700');
  assert.equal(complete.annex.rowCount, 135);
  const pending = deriveProposalOutputs(setPositionQuantity(added, original.id, '-1'), base);
  assert.equal(pending.canDownloadAnnex, false);
  assert.equal(pending.calculation.availability.proposalStatus, 'pending');
});
