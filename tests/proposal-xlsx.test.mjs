import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { sggdStructure as base } from '../src/data/sggd-structure.mjs';
import { createStructureProposal, setPositionQuantity, addPosition, removePosition, renameUnit, createUnit, moveUnit, removeUnit, setPositionCode } from '../src/structure-proposal.mjs';
import { deriveProposalOutputs, annexUnitLabel } from '../src/proposal-outputs.mjs';
import { createProposalXlsx } from '../src/proposal-xlsx.mjs';

const generatedAt = '2026-10-22T15:00:00.000Z';
const initial = () => createStructureProposal(base);
const template = (denomination, code) => base.positions.find(row => row.denomination === denomination && row.code === code);
const assessor = template('Assessor Especial III', 'CCESP 2.15');
const lastUnit = base.units.find(unit => unit.name === 'Divisão de Formação e Treinamento');
const firstUnit = base.units[0];
const load = async bytes => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes);
  return workbook;
};
const exportBook = async proposal => load(await createProposalXlsx(proposal, base, { generatedAt }));
const allText = workbook => {
  const values = [];
  for (const sheet of workbook.worksheets) sheet.eachRow(row => row.eachCell(cell => { if (typeof cell.value === 'string') values.push(cell.value); }));
  return values.join('\n');
};

test('unit situation distinguishes rename, changed positions and transfer while preserving new and removed states', async () => {
  let proposal = renameUnit(initial(), firstUnit.id, 'Secretaria Executiva renomeada');
  proposal = setPositionQuantity(proposal, assessor.id, (BigInt(assessor.quantity) + 1n).toString());
  proposal = moveUnit(proposal, lastUnit.id, firstUnit.id, {}, base);
  const removed = base.units.find(unit => unit.id !== firstUnit.id && unit.id !== lastUnit.id && !base.units.some(child => child.parentUnitId === unit.id));
  proposal = removeUnit(proposal, removed.id);
  proposal = createUnit(proposal, { name:'Unidade nova', parentUnitId:firstUnit.id, unitType:'other' }, base);
  const added = proposal.units.at(-1);
  proposal = addPosition(proposal, {unitId:added.id,templateId:template('Coordenador','CCESP 1.13').id,quantity:'1'},base);
  proposal = addPosition(proposal, {unitId:added.id,templateId:assessor.id,quantity:'0'},base);
  const workbook = await exportBook(proposal), structure = workbook.getWorksheet('Reestruturação');
  const situations = new Map();
  structure.eachRow((row, index) => { if(index > 8) situations.set(row.getCell(1).value,row.getCell(3).value); });
  assert.match(situations.get('Secretaria Executiva renomeada'), /Renomeada/);
  assert.match(situations.get(proposal.units.find(unit => unit.id === assessor.unitId).name), /Cargos\/funções alterados/);
  assert.equal(situations.get(lastUnit.name),'Transferida');
  assert.equal(situations.get(removed.name),'Retirada');
  assert.equal(situations.get(added.name),'Nova na proposta');
  const rows=[];
  structure.eachRow((row,index)=>{if(index>8&&row.getCell(1).value===added.name) rows.push(row.getCell(6).value);});
  assert.deepEqual(rows,['CCESP 2.15','CCESP 1.13']);
});

test('browser export produces four protected snapshot sheets with exact complete baseline rows and independent II/III figures', async () => {
  const bytes = await createProposalXlsx(initial(), base, { generatedAt });
  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.byteLength > 10000);
  const workbook = await load(bytes);
  assert.deepEqual(workbook.worksheets.map(sheet => sheet.name), ['Reestruturação', 'Calculadora', 'Resumo', 'Anexo II']);
  assert.equal(workbook.created.toISOString(), generatedAt);
  for (const sheet of workbook.worksheets) {
    assert.match(sheet.getCell('A2').value, /Exportação da proposta/);
    assert.match(sheet.getCell('A4').value, /não é o modelo original/);
    assert.equal(sheet.sheetProtection.sheet, true);
    assert.equal(sheet.views[0].state, 'frozen');
    sheet.eachRow(row => row.eachCell(cell => assert.notEqual(cell.type, ExcelJS.ValueType.Formula)));
  }
  const structure = workbook.getWorksheet('Reestruturação'), annex = workbook.getWorksheet('Anexo II');
  assert.equal(structure.rowCount, 415);
  assert.equal(annex.rowCount, 415);
  assert.equal(annex.columnCount, 4);
  assert.deepEqual(annex.getRow(8).values.slice(1), ['UNIDADE', 'QTD', 'DENOMINAÇÃO CARGO/FUNÇÃO', 'CCESP/FCESP']);
  let count = 0;
  for (let row = 9; row <= annex.rowCount; row += 1) {
    assert.equal(typeof annex.getCell(row, 2).value, 'number');
    count += annex.getCell(row, 2).value;
  }
  assert.equal(count, 500);
  assert.equal(annex.getCell(415, 1).value, lastUnit.name);
  assert.equal(annex.getCell(415, 4).value, base.positions.at(-1).code);
  const calculator = workbook.getWorksheet('Calculadora');
  assert.deepEqual(calculator.getRow(9).values.slice(1), ['CCESP', 'Quantitativo', 298, 299, 299, 0, -1, -1]);
  assert.deepEqual(calculator.getRow(10).values.slice(1), ['CCESP', 'Cotas', 1066, 1069.5, 1069.5, 0, -3.5, -3.5]);
  assert.deepEqual(calculator.getRow(11).values.slice(1), ['FCESP', 'Quantitativo', 201, 201, 201, 0, 0, 0]);
  assert.deepEqual(calculator.getRow(12).values.slice(1), ['FCESP', 'Cotas', 349.35, 348.75, 348.75, 0, 0.6, 0.6]);
  assert.match(allText(workbook), /www\.doe\.sp\.gov\.br/);
  assert.match(allText(workbook), /não representa aprovação administrativa/);
  assert.doesNotMatch(allText(workbook), /sharepoint|sha256|\/Users\//i);
});

test('one full proposal including a new unit, transfer and rename drives every sheet irrespective of screen filters', async () => {
  let proposal = renameUnit(initial(), firstUnit.id, 'Secretaria Executiva proposta');
  proposal = moveUnit(proposal, lastUnit.id, firstUnit.id, {}, base);
  proposal = createUnit(proposal, { name: 'Coordenadoria proposta', parentUnitId: firstUnit.id, unitType: 'other' }, base);
  const newUnit = proposal.units.at(-1);
  proposal = addPosition(proposal, { unitId: newUnit.id, templateId: template('Coordenador', 'CCESP 1.13').id, quantity: '1' }, base);
  proposal = addPosition(proposal, { unitId: newUnit.id, templateId: template('Assistente I', 'FCESP 2.01').id, quantity: '1' }, base);
  proposal.selectedUnitId = firstUnit.id;
  proposal.search = 'SECRETARIA EXECUTIVA';
  proposal.collapsedUnits = [newUnit.id, lastUnit.id];
  const output = deriveProposalOutputs(proposal, base), workbook = await exportBook(proposal), annex = workbook.getWorksheet('Anexo II');
  const rows = [];
  for (let i = 9; i <= annex.rowCount; i += 1) rows.push(annex.getRow(i).values.slice(1));
  assert.deepEqual(rows, output.annex.rows.map(row => [annexUnitLabel(row), Number(row.quantity), row.denomination, row.code]));
  assert.equal(rows.length, 409);
  assert.equal(rows.filter(row => row[0] === `${newUnit.name}\nVinculada a: Secretaria Executiva proposta`).length, 2);
  assert.ok(rows.some(row => row[0] === `${lastUnit.name}\nVinculada a: Secretaria Executiva proposta`));
  const calculator = workbook.getWorksheet('Calculadora');
  assert.equal(calculator.getCell('E9').value, 300);
  assert.equal(calculator.getCell('E10').value, 1074);
  assert.equal(calculator.getCell('E11').value, 202);
  assert.equal(calculator.getCell('E12').value, 349.35);
  const summary = workbook.getWorksheet('Resumo');
  const moved = [];
  summary.eachRow(row => { if (row.getCell(5).value === 'Unidade transferida') moved.push(row); });
  assert.equal(moved.length, 1);
  assert.equal(moved[0].getCell(3).value, 'Coordenadoria de Difusão de Acervos');
  assert.equal(moved[0].getCell(4).value, 'Secretaria Executiva proposta');
  assert.match(allText(workbook), /Unidade criada/);
  assert.match(allText(workbook), /Unidade renomeada/);
});

test('removed units and added zero positions remain traceable but do not appear in the four-column Annex', async () => {
  let proposal = removeUnit(initial(), lastUnit.id);
  proposal = addPosition(proposal, { unitId: firstUnit.id, templateId: assessor.id, quantity: '0' }, base);
  const workbook = await exportBook(proposal), annex = workbook.getWorksheet('Anexo II'), structure = workbook.getWorksheet('Reestruturação');
  assert.equal(annex.rowCount, 414);
  assert.equal(structure.rowCount, 416);
  const removed = [];
  structure.eachRow(row => { if (row.getCell(1).value === lastUnit.name) removed.push(row); });
  assert.ok(removed.length);
  assert.ok(removed.every(row => row.getCell(3).value === 'Retirada' && row.getCell(8).value === 0));
  for (let row = 9; row <= annex.rowCount; row += 1) {
    assert.notEqual(annex.getCell(row, 1).value, lastUnit.name);
    assert.ok(annex.getCell(row, 2).value > 0);
  }
  assert.equal(workbook.getWorksheet('Calculadora').getCell('E11').value, 200);
  assert.equal(workbook.getWorksheet('Calculadora').getCell('E12').value, 346.8);
});

test('code changes preserve old and new codes and quota variation in the snapshot', async () => {
  const proposal = setPositionCode(initial(), assessor.id, 'CCESP 2.14', base);
  const output = deriveProposalOutputs(proposal, base);
  assert.equal(output.canDownloadAnnex, true);
  const workbook = await exportBook(proposal), summary = workbook.getWorksheet('Resumo');
  const changes = [];
  summary.eachRow(row => { if (row.getCell(5).value === 'Código alterado') changes.push(row); });
  assert.equal(changes.length, 1);
  assert.equal(changes[0].getCell(7).value, 'CCESP 2.15');
  assert.equal(changes[0].getCell(8).value, 'CCESP 2.14');
  assert.equal(changes[0].getCell(11).value, 0);
  assert.equal(changes[0].getCell(14).value, -1);
});

test('pending inputs anywhere, inconsistent metadata and new verified rule blockers reject the whole file', async () => {
  for (const quantity of ['', '-1', '1.5', 'abc']) {
    const proposal = setPositionQuantity(initial(), base.positions.at(-1).id, quantity);
    proposal.selectedUnitId = firstUnit.id;
    await assert.rejects(createProposalXlsx(proposal, base, { generatedAt }), error => error.code === 'proposal_incomplete');
  }
  const mismatch = initial(); mismatch.baseVersion = 'other-version';
  await assert.rejects(createProposalXlsx(mismatch, base, { generatedAt }), error => error.code === 'proposal_incomplete');
  await assert.rejects(createProposalXlsx(removePosition(initial(), base.positions[0].id), base, { generatedAt }),
    error => error.code === 'proposal_rule_blocked');
  await assert.rejects(createProposalXlsx(initial(), base, { generatedAt: 'not-a-date' }), /data de geração/);
});

test('formula-like names are literal strings, not executable Excel formulas', async () => {
  for (const name of ['=HYPERLINK("https://example.invalid","click")', '+SUM(1,2)', '@SUM(1,2)', '-2+3']) {
    const workbook = await exportBook(renameUnit(initial(), firstUnit.id, name));
    const cell = workbook.getWorksheet('Anexo II').getCell('A9');
    assert.equal(cell.value, name);
    assert.equal(cell.type, ExcelJS.ValueType.String);
    for (const sheet of workbook.worksheets) sheet.eachRow(row => row.eachCell(value => assert.notEqual(value.type, ExcelJS.ValueType.Formula)));
  }
});

test('large integers and exact hundredths survive without Excel precision loss', async () => {
  const quantity = '9007199254740993123456789';
  const proposal = setPositionQuantity(initial(), assessor.id, quantity), output = deriveProposalOutputs(proposal, base);
  assert.equal(output.canDownloadAnnex, true);
  const workbook = await exportBook(proposal), annex = workbook.getWorksheet('Anexo II');
  const positionIndex = output.annex.rows.findIndex(row => row.positionId === assessor.id);
  const cell = annex.getCell(positionIndex + 9, 2);
  assert.equal(cell.value, quantity);
  assert.equal(cell.type, ExcelJS.ValueType.String);
  assert.equal(cell.numFmt, '@');
  const quotaCents = BigInt(output.calculation.result.groups.CCESP.quotaCents);
  const expectedQuotas = `${quotaCents / 100n}.${String(quotaCents % 100n).padStart(2, '0')}`;
  assert.equal(workbook.getWorksheet('Calculadora').getCell('E10').value, expectedQuotas);
  assert.equal(workbook.getWorksheet('Calculadora').getCell('E10').type, ExcelJS.ValueType.String);
  assert.match(workbook.getWorksheet('Anexo II').getCell('A7').value, /preservadas como texto exato/);
  const ordinary = await exportBook(setPositionQuantity(initial(), assessor.id, '999999999999999'));
  const ordinaryCell = ordinary.getWorksheet('Anexo II').getCell(positionIndex + 9, 2);
  assert.equal(typeof ordinaryCell.value, 'number');
  assert.equal(ordinaryCell.value, 999999999999999);
});

test('snapshot export does not mutate source or proposal and remains coherent across asynchronous preparation', async () => {
  const proposal = initial(), before = structuredClone(proposal), sourceBefore = JSON.stringify(base);
  const first = await exportBook(proposal);
  assert.deepEqual(proposal, before);
  assert.equal(JSON.stringify(base), sourceBefore);
  assert.equal(first.getWorksheet('Anexo II').getCell('B9').value, 1);
  const pending = createProposalXlsx(proposal, base, { generatedAt });
  proposal.positions[0].quantity = '100';
  const workbook = await load(await pending);
  assert.equal(workbook.getWorksheet('Anexo II').getCell('B9').value, 1);
  assert.equal(workbook.getWorksheet('Calculadora').getCell('E9').value, 299);
});
