import test from 'node:test';
import assert from 'node:assert/strict';
import { sggdStructure as base } from '../src/data/sggd-structure.mjs';
import { createStructureProposal, setPositionQuantity, renameUnit, addPosition, removePosition, resetUnit, createUnit, moveUnit, setPositionCode } from '../src/structure-proposal.mjs';
import { deriveProposalOutputs, buildProposalSummaryText, sortProposalPositions, annexUnitLabel } from '../src/proposal-outputs.mjs';

const create = () => createStructureProposal(base);
const derive = proposal => deriveProposalOutputs(proposal, base);
const rowA = base.positions.find(row => row.group === 'CCESP');
const rowB = base.positions.find(row => row.group === 'FCESP' && row.unitId !== rowA.unitId);
const increase = (proposal, row, amount) => setPositionQuantity(proposal, row.id, (BigInt(row.quantity) + amount).toString());

test('level sorting is stable, handles level-only agency codes, and never changes the source array or data', () => {
  const positions = [
    { id: 'a', level: 11, quantity: '9007199254740993' },
    { id: 'b', code: 'CCESP 14', quantity: '2' },
    { id: 'c', code: 'FCESP 2.11', quantity: '0' },
    { id: 'd', level: 15, quantity: '1' },
    { id: 'e', level: '11', quantity: '' },
  ];
  const before = structuredClone(positions), sorted = sortProposalPositions(positions);
  assert.deepEqual(sorted.map(row => row.id), ['d', 'b', 'a', 'c', 'e']);
  assert.deepEqual(positions, before);
  assert.equal(sorted[2], positions[0]);
});

test('CMO quota movements reconcile by unit and species in TXT even when the CCESP net effect is zero', () => {
  const unitId = 'sggd-unit-ii-56';
  let proposal = create();
  for (const [code, quantity] of [['CCESP 2.11','3'], ['CCESP 2.09','1'], ['CCESP 2.06','0']]) {
    const row = base.positions.find(item => item.unitId === unitId && item.code === code);
    proposal = setPositionQuantity(proposal, row.id, quantity);
  }
  proposal = addPosition(proposal, { unitId, templateId: base.positions.find(row => row.code === 'CCESP 2.04').id, quantity: '1' }, base);
  proposal = addPosition(proposal, { unitId, templateId: base.positions.find(row => row.code === 'FCESP 2.01').id, quantity: '1' }, base);
  const output = derive(proposal), unit = output.summary.units.find(row => row.unitId === unitId);
  assert.deepEqual(unit.changes.slice(0,4).map(change => change.quotas.delta), ['350', '-300', '-225', '175']);
  assert.equal(unit.comparisons.groups.CCESP.quotaCents.delta, '0');
  assert.equal(unit.comparisons.groups.FCESP.quotaCents.delta, '60');
  assert.equal(unit.comparisons.groups.CCESP.quotaCents.delta, output.summary.comparisons.groups.CCESP.quotaCents.delta);
  assert.equal(unit.comparisons.groups.FCESP.quotaCents.delta, output.summary.comparisons.groups.FCESP.quotaCents.delta);
  const txt = buildProposalSummaryText(proposal, base).split('ALTERAÇÕES POR UNIDADE')[1];
  for (const value of ['+3,50', '−3,00', '−2,25', '+1,75']) assert.ok(txt.includes(`variação ${value}.`));
  assert.match(txt, /Totais da unidade \(alocação direta; proposta − alocado\)/);
  assert.match(txt, /FCESP — quantitativo: 4 → 5; variação \+1\. Cotas: 10,65 → 11,25; variação \+0,60/);
  assert.match(txt, /não representa limite ou saldo disponível próprio da unidade/);
});

test('pending direct totals remain pending and a code species change is accounted in each unit species', () => {
  const row = base.positions.find(position => position.code === 'CCESP 2.11');
  const changed = setPositionCode(create(), row.id, 'FCESP 2.11', base);
  const output = derive(changed), unit = output.summary.units.find(item => item.unitId === row.unitId);
  assert.equal(unit.comparisons.groups.CCESP.quantity.delta, (-BigInt(row.quantity)).toString());
  assert.equal(unit.comparisons.groups.FCESP.quantity.delta, row.quantity);
  const pending = derive(setPositionQuantity(changed, row.id, ''));
  assert.equal(pending.summary.units[0].comparisons.groups.FCESP.quotaCents.after, null);
  assert.match(buildProposalSummaryText(setPositionQuantity(changed, row.id, ''), base), /Cotas da movimentação: [^\n]+ → pendente; variação pendente/);
});

test('new and moved unit parent metadata is explicit and new positions are exported by descending level', () => {
  const parent = base.units.find(unit => unit.name === 'SUBSECRETARIA DE GESTÃO CORPORATIVA');
  let proposal = createUnit(create(), { name: 'Assessoria de Órgãos de Controle', parentUnitId: parent.id, unitType: 'assessoria' }, base);
  const unit = proposal.units.at(-1);
  for (const code of ['CCESP 1.15', 'CCESP 2.11', 'FCESP 2.10', 'CCESP 2.13', 'CCESP 2.14']) {
    const row = base.positions.find(item => item.code === code);
    proposal = addPosition(proposal, { unitId: unit.id, templateId: row.id, quantity: '1' }, base);
  }
  const last = base.units.at(-1);
  proposal = moveUnit(proposal, last.id, parent.id, {}, base);
  const output = derive(proposal), rows = output.annex.rows.filter(row => row.unitId === unit.id);
  assert.deepEqual(rows.map(row => row.code), ['CCESP 1.15', 'CCESP 2.14', 'CCESP 2.13', 'CCESP 2.11', 'FCESP 2.10']);
  assert.ok(rows.every(row => row.parentUnitId === parent.id && row.parentName === parent.name && row.hierarchyChanged));
  assert.equal(annexUnitLabel(rows[0]), `${unit.name}\nVinculada a: ${parent.name}`);
  assert.ok(output.annex.rows.filter(row => row.unitId === last.id).every(row => row.hierarchyChanged && row.parentName === parent.name));
  const nextSubsecretariat = output.annex.rows.findIndex(row => row.unitName === 'SUBSECRETARIA DE GESTÃO');
  assert.ok(output.annex.rows.findIndex(row => row.unitId === unit.id) < nextSubsecretariat);
  assert.ok(output.annex.rows.findIndex(row => row.unitId === last.id) < nextSubsecretariat);
  assert.equal(output.annex.rows[0].hierarchyChanged, false);
  assert.equal(annexUnitLabel(output.annex.rows[0]), output.annex.rows[0].unitName);
  assert.match(buildProposalSummaryText(proposal, base), /Assessoria de Órgãos de Controle\nVínculo na proposta: SUBSECRETARIA DE GESTÃO CORPORATIVA/);
});

test('untouched structure yields all 407 documentary rows and 500 positions, not the grouped arithmetic rows', () => {
  const output = derive(create());
  assert.equal(output.status, 'complete');
  assert.equal(output.canGenerateAnnex, true);
  assert.deepEqual(output.issues, []);
  assert.deepEqual(output.summary.units, []);
  assert.deepEqual(output.summary.counts, { units: 0, quantityChanges: 0, added: 0, removed: 0, renamed: 0, pending: 0, total: 0 });
  assert.deepEqual(output.annex.columns, ['UNIDADE', 'QTD', 'DENOMINAÇÃO CARGO/FUNÇÃO', 'CCESP/FCESP']);
  assert.equal(output.annex.rowCount, 407);
  assert.equal(output.annex.unitCount, 221);
  assert.equal(output.annex.rows.reduce((sum, row) => sum + BigInt(row.quantity), 0n), 500n);
  const expected = base.units.flatMap(unit => [...base.positions.filter(row => row.unitId === unit.id)].sort((a,b) => b.level - a.level).map(row => row.id));
  assert.deepEqual(output.annex.rows.map(row => row.positionId), expected);
  for (const row of output.annex.rows) {
    const original = base.positions.find(item => item.id === row.positionId);
    assert.equal(row.denomination, original.denomination.trim().replace(/\s+/gu, ' '));
    assert.equal(row.code, original.code);
    assert.deepEqual(Object.keys(row), ['unitId', 'positionId', 'unitName', 'quantity', 'denomination', 'code', 'parentName', 'parentUnitId', 'hierarchyChanged', 'hierarchyStatus']);
  }
  assert.ok(output.calculation.result.aggregate.rows.length < output.annex.rows.length);
  assert.equal(output.summary.comparisons.aggregate.quantity.before, '500');
  assert.equal(output.summary.comparisons.aggregate.quotaCents.after, '141825');
  assert.equal(output.summary.availability.currentBalance.groups.CCESP.quotas.balance, '-350');
  assert.equal(output.summary.availability.currentBalance.groups.FCESP.quotas.balance, '60');
  assert.equal(output.canGenerateAnnex, true, 'documentary allocation exceeding III does not block a proposed annex');
});

test('one summary and annex include edits in multiple units, exact quota changes and proposed names', () => {
  let proposal = increase(increase(create(), rowA, 2n), rowB, 3n);
  proposal = renameUnit(proposal, rowA.unitId, 'Unidade com nome proposto');
  proposal.selectedUnitId = rowA.unitId;
  proposal.collapsedUnits = [rowB.unitId];
  const output = derive(proposal);
  assert.equal(output.summary.counts.units, 2);
  assert.equal(output.summary.counts.quantityChanges, 2);
  assert.equal(output.summary.counts.renamed, 1);
  const unit = output.summary.units.find(item => item.unitId === rowA.unitId);
  assert.equal(unit.beforeName, base.units.find(item => item.id === rowA.unitId).name);
  assert.equal(unit.afterName, 'Unidade com nome proposto');
  const rename = unit.changes.find(item => item.type === 'unit-renamed');
  assert.equal(rename.beforeName, unit.beforeName);
  assert.equal(rename.afterName, unit.afterName);
  assert.equal(output.summary.comparisons.groups.CCESP.quantity.delta, '2');
  assert.equal(output.summary.comparisons.groups.FCESP.quantity.delta, '3');
  assert.equal(output.summary.comparisons.groups.CCESP.quotaCents.delta, (2n * BigInt(rowA.coefficientCents)).toString());
  assert.equal(output.summary.comparisons.groups.FCESP.quotaCents.delta, (3n * BigInt(rowB.coefficientCents)).toString());
  assert.equal(output.summary.comparisons.aggregate.quantity.after, '505');
  assert.equal(output.annex.rows.find(item => item.positionId === rowB.id).quantity, (BigInt(rowB.quantity) + 3n).toString());
  assert.ok(output.annex.rows.filter(item => item.unitId === rowA.unitId).every(item => item.unitName === unit.afterName));
});

test('normalization and zero additions produce no changes or documentary output', () => {
  let proposal = setPositionQuantity(create(), rowA.id, ` 00${rowA.quantity} `);
  proposal = addPosition(proposal, { unitId: rowA.unitId, templateId: rowA.id, quantity: '000' }, base);
  const zeroId = proposal.positions.at(-1).id;
  const output = derive(proposal);
  assert.equal(output.canGenerateAnnex, true);
  assert.deepEqual(output.summary.units, []);
  assert.equal(output.summary.counts.total, 0);
  assert.equal(output.annex.rowCount, 407);
  assert.equal(output.annex.rows.some(row => row.positionId === zeroId), false);
  assert.equal(output.annex.rows.find(row => row.positionId === rowA.id).quantity, rowA.quantity);
});

test('positive additions retain equal-level insertion order inside their own unit without merging identical codes', () => {
  let proposal = addPosition(create(), { unitId: rowA.unitId, templateId: rowA.id, quantity: '2' }, base);
  proposal = addPosition(proposal, { unitId: rowA.unitId, templateId: rowA.id, quantity: '3' }, base);
  const newIds = proposal.positions.slice(-2).map(row => row.id);
  const output = derive(proposal), unitRows = output.annex.rows.filter(row => row.unitId === rowA.unitId);
  assert.deepEqual(unitRows.filter(row => row.code === rowA.code).map(row => row.positionId), [rowA.id, ...newIds]);
  assert.equal(output.annex.rowCount, 409);
  assert.equal(output.summary.counts.added, 2);
  assert.deepEqual(output.summary.units[0].changes.map(change => [change.before, change.after, change.delta]), [['0', '2', '2'], ['0', '3', '3']]);
  assert.equal(output.summary.comparisons.groups.CCESP.quantity.delta, '5');
  const firstOtherUnitIndex = output.annex.rows.findIndex(row => row.unitId !== rowA.unitId);
  assert.ok(output.annex.rows.findIndex(row => row.positionId === newIds[1]) < firstOtherUnitIndex);
});

test('withdrawn rows and empty units disappear; resetting only one unit preserves other changes', () => {
  let proposal = create();
  for (const row of base.positions.filter(item => item.unitId === rowA.unitId)) proposal = removePosition(proposal, row.id);
  proposal = increase(proposal, rowB, 1n);
  let output = derive(proposal);
  assert.equal(output.annex.rows.some(row => row.unitId === rowA.unitId), false);
  assert.equal(output.annex.unitCount, 220);
  assert.equal(output.summary.counts.removed, base.positions.filter(row => row.unitId === rowA.unitId).length);
  assert.ok(output.summary.units.find(unit => unit.unitId === rowA.unitId).changes.every(change => change.after === '0' && BigInt(change.delta) < 0n));
  proposal = resetUnit(proposal, rowA.unitId, base);
  output = derive(proposal);
  assert.equal(output.annex.unitCount, 221);
  assert.equal(output.summary.units.length, 1);
  assert.equal(output.summary.units[0].unitId, rowB.unitId);
  proposal = resetUnit(proposal, rowB.unitId, base);
  assert.deepEqual(derive(proposal).summary.units, []);
});

test('a blank or malformed hidden quantity blocks the complete annex without inferred zero or stale rows', () => {
  for (const entered of ['', '-1', '1.25', '2e3', 'xyz']) {
    const proposal = setPositionQuantity(create(), rowB.id, entered);
    proposal.selectedUnitId = rowA.unitId;
    proposal.result = { status: 'complete', aggregate: { quantity: '500' } };
    const output = derive(proposal);
    assert.equal(output.status, 'incomplete');
    assert.equal(output.canGenerateAnnex, false);
    assert.deepEqual(output.annex.rows, []);
    assert.equal(output.annex.rowCount, 0);
    assert.ok(output.issues.some(issue => issue.rowId === rowB.id && issue.unitId === rowB.unitId));
    const change = output.summary.units.find(unit => unit.unitId === rowB.unitId).changes[0];
    assert.equal(change.status, 'pending');
    assert.equal(change.after, null);
    assert.equal(change.delta, null);
    assert.equal(change.enteredQuantity, entered);
    assert.equal(change.quotas.after, null);
    assert.equal(output.summary.comparisons.groups.FCESP.quantity.after, null);
    assert.equal(output.summary.comparisons.aggregate.quantity.after, null);
    assert.equal(output.summary.availability.proposalStatus, 'pending');
    assert.equal(output.summary.availability.currentBalance.groups.CCESP.quantity.balance, '-1');
  }
});

test('base discrepancies, proposal metadata, template changes and missing documentary rows block generation', () => {
  const cases = [
    [proposal => { proposal.baseVersion = 'another-version'; }, source => source],
    [proposal => { proposal.organizationId = 'another-organization'; }, source => source],
    [proposal => { proposal.units[0].name = ' '; }, source => source],
    [proposal => { proposal.positions[0].code = 'CCESP 2.18'; }, source => source],
    [proposal => { proposal.positions[0].denomination = 'Outra denominação'; }, source => source],
    [proposal => { proposal.positions[1].id = proposal.positions[0].id; }, source => source],
    [proposal => { proposal.positions.shift(); }, source => source],
    [proposal => proposal, source => { source.totals.aggregate.quantity = '499'; return source; }],
    [proposal => proposal, source => { source.sourceAnnex = 'III'; return source; }],
  ];
  for (const [mutateProposal, mutateBase] of cases) {
    const proposal = create(), source = mutateBase(structuredClone(base));
    mutateProposal(proposal);
    const output = deriveProposalOutputs(proposal, source);
    assert.equal(output.canGenerateAnnex, false);
    assert.deepEqual(output.annex.rows, []);
    assert.ok(output.issues.length);
  }
});

test('explicit zero is valid and a huge quantity retains exact integer/cents values', () => {
  const zero = derive(setPositionQuantity(create(), rowA.id, '0'));
  assert.equal(zero.canGenerateAnnex, true);
  assert.equal(zero.summary.units[0].changes[0].type, 'removed');
  const huge = '9007199254740993123456789';
  const output = derive(setPositionQuantity(create(), rowA.id, huge));
  const change = output.summary.units.find(unit => unit.unitId === rowA.unitId).changes[0];
  assert.equal(change.after, huge);
  assert.equal(change.delta, (BigInt(huge) - BigInt(rowA.quantity)).toString());
  assert.equal(change.quotas.after, (BigInt(huge) * BigInt(rowA.coefficientCents)).toString());
  assert.equal(output.annex.rows.find(row => row.positionId === rowA.id).quantity, huge);
  assert.equal(output.summary.availability.proposedBalance.groups.CCESP.quantity.balance,
    (298n - (299n - BigInt(rowA.quantity) + BigInt(huge))).toString());
});

test('species changes retain independent signs even when the aggregate headcount is unchanged', () => {
  let proposal = increase(create(), rowA, 1n);
  proposal = setPositionQuantity(proposal, rowB.id, (BigInt(rowB.quantity) - 1n).toString());
  const output = derive(proposal);
  assert.equal(output.summary.comparisons.groups.CCESP.quantity.delta, '1');
  assert.equal(output.summary.comparisons.groups.FCESP.quantity.delta, '-1');
  assert.equal(output.summary.comparisons.aggregate.quantity.delta, '0');
  assert.equal(output.summary.availability.proposedBalance.groups.CCESP.quantity.balance, '-2');
  assert.equal(output.summary.availability.proposedBalance.groups.FCESP.quantity.balance, '1');
});

test('documentary order is stable and duplicate unit names keep separate identities', () => {
  let proposal = renameUnit(create(), rowA.unitId, 'Nome repetido');
  proposal = renameUnit(proposal, rowB.unitId, 'Nome repetido');
  proposal.units.reverse();
  proposal.positions.reverse();
  const output = derive(proposal);
  assert.equal(output.summary.counts.units, 2);
  assert.equal(output.summary.units[0].unitId, rowA.unitId);
  assert.equal(new Set(output.summary.units.map(unit => unit.unitId)).size, 2);
  const expected = base.units.flatMap(unit => [...base.positions.filter(row => row.unitId === unit.id)].sort((a,b) => b.level - a.level).map(row => row.id));
  assert.deepEqual(output.annex.rows.map(row => row.positionId), expected);
});

test('malformed model containers fail closed and return no partial annex', () => {
  for (const proposal of [null, {}, { units: [], positions: [null] }, { units: [null], positions: [] }]) {
    const output = derive(proposal);
    assert.equal(output.status, 'incomplete');
    assert.equal(output.canGenerateAnnex, false);
    assert.deepEqual(output.annex.rows, []);
    assert.equal(output.issues[0].code, 'invalid_structure_model');
  }
});

test('outputs are deterministic and serializable without mutating base, proposal, or nested source metadata', () => {
  const proposal = increase(create(), rowA, 1n), beforeProposal = structuredClone(proposal), beforeBase = structuredClone(base);
  const first = derive(proposal), second = derive(proposal);
  assert.deepEqual(first, second);
  assert.deepEqual(JSON.parse(JSON.stringify(first)), first);
  assert.deepEqual(proposal, beforeProposal);
  assert.deepEqual(base, beforeBase);
  assert.equal(Object.isFrozen(base), true);
  assert.equal(JSON.stringify(first.metadata).includes('sharepoint'), false);
  assert.equal(JSON.stringify(first.metadata).includes('sha256'), false);
});

test('plain text describes all four measures, distinct annexes, changes, public sources and technical limits', () => {
  let proposal = increase(create(), rowA, 1n);
  proposal = renameUnit(proposal, rowA.unitId, 'Unidade\n com   novo nome');
  const text = buildProposalSummaryText(proposal, base, { generatedAt: '2026-10-21T15:00:00-03:00' });
  assert.match(text, /Gerado em: 2026-10-21T15:00:00-03:00/);
  assert.match(text, /Anexo II: estrutura alocada de referência\. Anexo III: limites/);
  assert.match(text, /Quantitativo: alocado 299; proposta 300; variação \+1/);
  assert.match(text, /Quantitativo: alocado 201; proposta 201; variação 0/);
  assert.match(text, /saldo da alocação \(III − II\): −3,50/);
  assert.match(text, /Unidade com novo nome/);
  assert.doesNotMatch(text, /Unidade\n com/);
  assert.match(text, /https:\/\/www\.doe\.sp\.gov\.br\//);
  assert.doesNotMatch(text, /sharepoint|sha256|ea6d9f74|\/Users\//i);
  assert.match(text, /Base e regras em validação técnica/);
  assert.match(text, /não representa aprovação administrativa/);
});

test('pending text preserves invalid input and does not describe a partial annex as generated', () => {
  const proposal = setPositionQuantity(create(), rowB.id, '1,5');
  const text = buildProposalSummaryText(proposal, base);
  assert.match(text, /PROPOSTA INCOMPLETA — geração do Anexo II bloqueada/);
  assert.match(text, /Nenhum anexo parcial foi liberado/);
  assert.match(text, /pendente \(entrada: “1,5”\)/);
  assert.match(text, /saldo da proposta: pendente/);
  assert.doesNotMatch(text, /Anexo II proposto: \d/);
});

test('homonymous Assessoria Técnica units retain their documentary parents and stay distinct in text', () => {
  const ids = ['sggd-unit-ii-56', 'sggd-unit-ii-127'];
  let proposal = create();
  for (const id of ids) proposal = increase(proposal, base.positions.find(row => row.unitId === id), 1n);
  const output = derive(proposal), units = output.summary.units;
  assert.deepEqual(units.map(unit => unit.unitId), ids);
  assert.ok(units.every(unit => unit.beforeName === 'Assessoria Técnica' && unit.afterName === 'Assessoria Técnica'));
  assert.equal(units[0].beforeParentName, 'SUBSECRETARIA DE GESTÃO CORPORATIVA');
  assert.equal(units[1].beforeParentName, 'DIRETORIA GERAL DE DESENVOLVIMENTO E CAPACIDADE INSTITUCIONAL');
  assert.equal(units[0].afterParentName, units[0].beforeParentName);
  assert.equal(units[1].afterParentName, units[1].beforeParentName);
  assert.deepEqual(units.map(unit => unit.sourceRow), [90, 235]);
  assert.ok(units.every(unit => unit.hierarchyStatus === 'model-explicit-unverified'));
  const text = buildProposalSummaryText(proposal, base);
  for (const unit of units) assert.ok(text.includes(`Assessoria Técnica\nVínculo no modelo: ${unit.afterParentName}.`));
  assert.doesNotMatch(text, /Localização no modelo de origem/);
  const oneOnly = increase(create(), base.positions.find(row => row.unitId === ids[0]), 1n);
  assert.match(buildProposalSummaryText(oneOnly, base), /Assessoria Técnica\nVínculo no modelo: SUBSECRETARIA DE GESTÃO CORPORATIVA/);
});

test('proposed parent names resolve by unique documentary ID and source rows disambiguate equal labels', () => {
  const ids = ['sggd-unit-ii-56', 'sggd-unit-ii-127'];
  let proposal = create();
  for (const id of ids) {
    const unit = base.units.find(item => item.id === id);
    proposal = renameUnit(proposal, unit.parentUnitId, 'Vínculo com mesmo nome');
    proposal = increase(proposal, base.positions.find(row => row.unitId === id), 1n);
  }
  const output = derive(proposal);
  const units = output.summary.units.filter(unit => ids.includes(unit.unitId));
  assert.ok(units.every(unit => unit.afterParentName === 'Vínculo com mesmo nome'));
  assert.notEqual(units[0].beforeParentName, units[1].beforeParentName);
  const text = buildProposalSummaryText(proposal, base);
  assert.match(text, /Localização no modelo de origem: linha 90\./);
  assert.match(text, /Localização no modelo de origem: linha 235\./);
  assert.equal(output.canGenerateAnnex, true);
});

test('ambiguous parent remains documentary text with an explicit hierarchy pending notice', () => {
  const unit = base.units.find(item => item.hierarchyStatus === 'model-parent-ambiguous');
  const position = base.positions.find(row => row.unitId === unit.id);
  const proposal = increase(create(), position, 1n);
  const output = derive(proposal), summary = output.summary.units[0];
  assert.equal(unit.parentUnitId, null);
  assert.equal(summary.beforeParentName, 'Divisão de Gestão Documental');
  assert.equal(summary.afterParentName, 'Divisão de Gestão Documental');
  assert.equal(summary.hierarchyStatus, 'model-parent-ambiguous');
  assert.equal(summary.sourceRow, 825);
  assert.equal(output.canGenerateAnnex, true, 'an unasserted parent does not affect direct-unit arithmetic');
  const text = buildProposalSummaryText(proposal, base);
  assert.match(text, /Vínculo informado no modelo: Divisão de Gestão Documental\./);
  assert.match(text, /Pendência de hierarquia: .*mais de uma unidade.*unidade superior não foi determinada/);
  assert.doesNotMatch(text, /Localização no modelo de origem/);
});
