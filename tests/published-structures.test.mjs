import { test } from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { simulatorBases, getSimulatorBase, annexLabel } from '../src/data/simulator-bases.mjs';
import { createStructureProposal, setPositionQuantity } from '../src/structure-proposal.mjs';
import { deriveProposalOutputs } from '../src/proposal-outputs.mjs';
import { createAnnexPdf } from '../src/annex-pdf.mjs';
import { createProposalXlsx } from '../src/proposal-xlsx.mjs';
import { getProposalStorageKey } from '../src/proposal-storage.mjs';

const expectations = {
  pge: [312, 59250], scti: [36, 15750], sde: [197, 59325], sduh: [145, 47220],
  secom: [105, 46100], sedpcd: [55, 16310], semil: [381, 123990], sesp: [89, 21685],
  sggd: [500, 141825], sgri: [200, 67690], sjc: [146, 38970], spi: [100, 39000],
  spm: [49, 17850], stm: [60, 21350], stur: [56, 15750], cbpm: [21, 5640],
  iamspe: [433, 77890], imesc: [36, 9105], ipem: [151, 46270], jucesp: [172, 47275],
};

test('the existing agencies and 20 supplied organizations have separate draft keys', () => {
  assert.equal(simulatorBases.length, 23);
  assert.equal(new Set(simulatorBases.map(getProposalStorageKey)).size, 23);
  assert.equal(simulatorBases[0].organizationId, 'sggd');
});

for (const [id, [quantity, quotaCents]] of Object.entries(expectations)) {
  test(`${id}: published allocation loads, edits, recalculates and produces the full Annex II PDF`, () => {
    const base = getSimulatorBase(id);
    const initial = createStructureProposal(base);
    const original = base.positions[0];
    const nextQuantity = String(Number(original.quantity) + 1);
    const updated = setPositionQuantity(initial, original.id, nextQuantity);
    const before = deriveProposalOutputs(initial, base);
    const after = deriveProposalOutputs(updated, base);
    assert.deepEqual(before.issues, []);
    assert.equal(annexLabel(base), 'Anexo II');
    assert.equal(before.calculation.availability.status, 'available');
    assert.equal(before.calculation.result.aggregate.quantity, String(quantity));
    assert.equal(before.calculation.result.aggregate.quotaCents, String(quotaCents));
    assert.equal(before.annex.rowCount, base.positions.length);
    assert.equal(after.calculation.result.aggregate.quantity, String(quantity + 1));
    assert.equal(after.calculation.result.aggregate.quotaCents, String(quotaCents + Number(original.coefficientCents)));
    assert.equal(after.summary.comparisons.groups[original.group].quantity.delta, '1');
    assert.equal(after.annex.rows.find(row => row.positionId === original.id)?.quantity, nextQuantity);
    assert.ok(createAnnexPdf(updated, base).getNumberOfPages());
  });
}

test('act amendments and different published reference numbers stay visible in the proposal export', async () => {
  const jucesp = getSimulatorBase('jucesp');
  assert.equal(jucesp.positions.find(row => row.unitName === 'Secretaria Geral').denomination, 'Secretário-Geral');
  assert.equal(jucesp.limits.totals.groups.CCESP.quantity, '172');
  assert.equal(jucesp.legacyReference.totals.groups.CCESP.quantity, '111');
  const stm = getSimulatorBase('stm');
  assert.ok(stm.positions.some(row => row.unitName === 'Coordenadoria de Desenvolvimento e Dados de Mobilidade Metropolitana'));
  const spm = getSimulatorBase('spm');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await createProposalXlsx(createStructureProposal(spm), spm));
  assert.equal(workbook.getWorksheet('Calculadora').getCell('C10').value, 178.75);
  assert.equal(workbook.getWorksheet('Calculadora').getCell('D10').value, 178.5);
  assert.ok(workbook.getWorksheet('Anexo II'));
});
