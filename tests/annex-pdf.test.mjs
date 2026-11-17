import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnnexPdf } from '../src/annex-pdf.mjs';
import { deriveProposalOutputs, annexUnitLabel } from '../src/proposal-outputs.mjs';
import { sggdStructure as base } from '../src/data/sggd-structure.mjs';
import {
  createStructureProposal, setPositionQuantity, renameUnit, addPosition, removePosition, createUnit, moveUnit,
} from '../src/structure-proposal.mjs';

const generatedAt = '2026-10-21T15:00:00.000Z';
const create = proposal => createAnnexPdf(proposal, base, { generatedAt });
const cells = doc => doc.lastAutoTable.body.map(row => row.raw);
const expectedCells = proposal => deriveProposalOutputs(proposal, base).annex.rows
  .map(row => [annexUnitLabel(row), row.quantity, row.denomination, row.code]);

test('new and moved unit links stay visible inside UNIDADE and proposed levels descend in PDF', () => {
  const parent = base.units.find(unit => unit.name === 'SUBSECRETARIA DE GESTÃO CORPORATIVA');
  let proposal = createUnit(createStructureProposal(base), {name:'Assessoria de Órgãos de Controle',parentUnitId:parent.id,unitType:'assessoria'},base);
  const unit = proposal.units.at(-1);
  for(const code of ['CCESP 1.15','CCESP 2.11','FCESP 2.10','CCESP 2.13','CCESP 2.14']) {
    proposal = addPosition(proposal,{unitId:unit.id,templateId:base.positions.find(row=>row.code===code).id,quantity:'1'},base);
  }
  const moved = base.units.at(-1);
  proposal = moveUnit(proposal,moved.id,parent.id,{},base);
  const doc = create(proposal), rows = cells(doc);
  assert.equal(doc.lastAutoTable.columns.length,4);
  assert.deepEqual(rows.filter(row=>row[0].startsWith(unit.name)).map(row=>row[3]),['CCESP 1.15','CCESP 2.14','CCESP 2.13','CCESP 2.11','FCESP 2.10']);
  assert.ok(rows.some(row=>row[0]===`${moved.name}\nVinculada a: ${parent.name}`));
  for(const row of doc.lastAutoTable.body.filter(row=>row.raw[0].includes('Vinculada a:'))) {
    assert.equal(row.spansMultiplePages,false);
    assert.ok(row.cells[0].text.some(line=>line.includes('Vinculada a:')));
  }
});

test('PDF contains all positive documentary positions in exactly four columns with repeated headings and readable pages', () => {
  const proposal = createStructureProposal(base);
  proposal.selectedUnitId = base.units[0].id;
  proposal.collapsedUnitIds = base.units.map(unit => unit.id);
  const doc = create(proposal);
  assert.deepEqual(cells(doc), expectedCells(proposal));
  assert.equal(cells(doc).length, 407);
  assert.equal(doc.lastAutoTable.columns.length, 4);
  assert.deepEqual(doc.lastAutoTable.head[0].raw, ['UNIDADE', 'QTD', 'DENOMINAÇÃO CARGO/FUNÇÃO', 'CCESP/FCESP']);
  assert.equal(doc.lastAutoTable.settings.showHead, 'everyPage');
  assert.equal(doc.lastAutoTable.settings.rowPageBreak, 'avoid');
  assert.ok(Math.abs(doc.internal.pageSize.getWidth() - 210) < 0.01);
  assert.ok(Math.abs(doc.internal.pageSize.getHeight() - 297) < 0.01);
  assert.ok(doc.getNumberOfPages() > 1);
  for (const row of doc.lastAutoTable.body) {
    assert.equal(row.spansMultiplePages, false);
    assert.equal(Object.keys(row.cells).length, 4);
    for (const cell of Object.values(row.cells)) assert.ok(cell.styles.fontSize >= 9);
  }
  const streams = doc.internal.pages.slice(1).map(page => page.join('\n'));
  for (const [index, stream] of streams.entries()) {
    assert.ok(stream.includes('(ANEXO II)'), `Title missing on page ${index + 1}`);
    assert.ok(stream.includes('(UNIDADE)'), `Heading missing on page ${index + 1}`);
    assert.ok(stream.includes('(QTD)'), `Quantity heading missing on page ${index + 1}`);
    assert.ok(stream.includes('21/10/2026'), `Date missing on page ${index + 1}`);
    assert.ok(stream.includes(`de ${streams.length}`), `Page total missing on page ${index + 1}`);
    assert.doesNotMatch(stream, /sharepoint|sourceRow|quotaCents|Restaurar|Limite do Anexo III/u);
  }
});

test('renaming, removing and adding across units are reflected from the current snapshot without mutating the proposal or source', () => {
  const first = base.positions[0], other = base.positions.find(row => row.unitId !== first.unitId);
  let proposal = createStructureProposal(base);
  proposal = renameUnit(proposal, first.unitId, 'Gestão, ação, informação e relações públicas');
  proposal = setPositionQuantity(proposal, first.id, '9007199254740993');
  proposal = removePosition(proposal, other.id);
  proposal = addPosition(proposal, { unitId: other.unitId, templateId: first.id, quantity: '3' }, base);
  const before = JSON.stringify(proposal), baseBefore = JSON.stringify(base);
  const doc = create(proposal);
  assert.deepEqual(cells(doc), expectedCells(proposal));
  assert.equal(cells(doc).some(row => row[1] === '0'), false);
  assert.ok(cells(doc).some(row => row[0] === 'Gestão, ação, informação e relações públicas' && row[1] === '9007199254740993'));
  assert.equal(JSON.stringify(proposal), before);
  assert.equal(JSON.stringify(base), baseBefore);
});

test('equal unit names preserve distinct documentary groups and additions remain inside their target unit', () => {
  const first = base.positions[0], last = base.positions.at(-1);
  let proposal = renameUnit(createStructureProposal(base), first.unitId, 'Unidade de Teste');
  proposal = renameUnit(proposal, last.unitId, 'Unidade de Teste');
  proposal = addPosition(proposal, { unitId: first.unitId, templateId: last.id, quantity: '17' }, base);
  const rows = deriveProposalOutputs(proposal, base).annex.rows;
  const doc = create(proposal);
  assert.deepEqual(cells(doc), expectedCells(proposal));
  const firstRows = rows.filter(row => row.unitId === first.unitId);
  assert.equal(firstRows.find(row => row.positionId === proposal.positions.at(-1).id).quantity, '17');
  const addedIndex = rows.findIndex(row => row.positionId === proposal.positions.at(-1).id);
  assert.ok(addedIndex < rows.length - 1);
  const startIndexes = rows.map((row, index) => !index || row.unitId !== rows[index - 1].unitId ? index : null).filter(index => index !== null);
  for (const index of startIndexes) assert.equal(doc.lastAutoTable.body[index].cells[0].styles.lineWidth.top, 0.3);
  assert.ok(rows.some(row => row.unitId === first.unitId && row.unitName === 'Unidade de Teste'));
  assert.ok(rows.some(row => row.unitId === last.unitId && row.unitName === 'Unidade de Teste'));
});

test('all 128 quantity digits are retained and wrapped at a legible size without splitting the row across pages', () => {
  const quantity = '1234567890'.repeat(12) + '12345678';
  const proposal = setPositionQuantity(createStructureProposal(base), base.positions[0].id, quantity);
  const doc = create(proposal), first = doc.lastAutoTable.body[0];
  assert.equal(first.cells[1].raw, quantity);
  assert.equal(first.cells[1].text.join(''), quantity);
  assert.ok(first.cells[1].text.length > 1);
  assert.ok(first.cells[1].styles.fontSize >= 9);
  assert.equal(first.spansMultiplePages, false);
  assert.equal(first.cells[1].width, 18);
});

test('pending quantities anywhere and modified documentary codes reject export even when caller supplies stale successful output', () => {
  const initial = createStructureProposal(base);
  const stale = deriveProposalOutputs(initial, base);
  for (const quantity of ['', '-1', '1e3', '9'.repeat(129)]) {
    const invalid = setPositionQuantity(initial, base.positions.at(-1).id, quantity);
    invalid.selectedUnitId = base.units[0].id;
    assert.throws(() => createAnnexPdf(invalid, base, { generatedAt, outputs: stale }), error => error.code === 'incomplete_proposal');
  }
  const invalidCode = createStructureProposal(base);
  invalidCode.positions[0].code = 'CCESP 18';
  assert.throws(() => create(invalidCode), error => error.code === 'incomplete_proposal');
});

test('the existing negative balance does not prohibit a complete proposed Annex II', () => {
  const proposal = createStructureProposal(base), outputs = deriveProposalOutputs(proposal, base);
  assert.equal(outputs.calculation.availability.currentBalance.groups.CCESP.quantity.balance, '-1');
  assert.equal(create(proposal).lastAutoTable.body.length, 407);
});

test('only explicit withdrawal of all units releases an empty table; active units without commanders block export', () => {
  const proposal = createStructureProposal(base);
  proposal.positions = proposal.positions.map(row => ({ ...row, quantity: '0' }));
  assert.throws(() => create(proposal), error => error.code === 'structural_rule_block');
  proposal.units = proposal.units.map(unit => ({...unit, removed:true, mutation:{...unit.mutation,removed:true,removalRootId:unit.id}}));
  const doc = create(proposal);
  assert.equal(doc.getNumberOfPages(), 1);
  assert.deepEqual(cells(doc), []);
  assert.equal(doc.lastAutoTable.columns.length, 4);
  assert.ok(doc.internal.pages[1].join('\n').includes('Proposta sem cargos ou'));
});

test('unrepresentable text and invalid generated dates fail explicitly instead of producing corrupt text or metadata', () => {
  const proposal = createStructureProposal(base);
  assert.throws(() => create(renameUnit(proposal, base.units[0].id, 'Unidade 🏛️')), error => error.code === 'unsupported_pdf_character');
  assert.throws(() => createAnnexPdf(proposal, base, { generatedAt: 'not-a-date' }), TypeError);
});
