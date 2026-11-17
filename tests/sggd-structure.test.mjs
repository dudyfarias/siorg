import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { sggdStructure as structure } from '../src/data/sggd-structure.mjs';
import { sggdReferences } from '../src/data/sggd-reference.mjs';
import { sggdSummaryReference } from '../src/data/sggd-summary-reference.mjs';
import { calculateScenario } from '../src/calculator.mjs';

const normalize = value => value.normalize('NFKC').toLocaleLowerCase('pt-BR').trim().replace(/\s+/gu, ' ');
const cents = value => {
  const [whole, fraction = ''] = value.split('.');
  return (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))).toString();
};
function grouped(positions) {
  const pairs = new Map();
  for (const {group, level, quantity} of positions) {
    const key = `${group}-${level}`;
    const old = pairs.get(key) ?? { id: key, group, level: Number(level), quantity: '0' };
    pairs.set(key, {...old, quantity: (BigInt(old.quantity) + BigInt(quantity)).toString()});
  }
  return [...pairs.values()].sort((a, b) => a.id.localeCompare(b.id));
}

test('all 407 detailed records retain the original Annex II identity and allocation', async () => {
  const documentary = JSON.parse(await readFile(new URL('../evidence/orgaos-2026-09-24/sggd-70755-cotejo-doe.json', import.meta.url), 'utf8'));
  assert.equal(structure.positions.length, 407);
  assert.equal(new Set(structure.positions.map(row => row.id)).size, 407);
  const units = new Map(structure.units.map(unit => [unit.id, unit]));
  assert.equal(units.size, 221);
  structure.positions.forEach((row, index) => {
    const original = documentary.quadro_rows[index];
    assert.equal(row.id, `sggd-position-ii-${original.source_table_row}`);
    assert.equal(row.documentaryRow, original.source_table_row);
    assert.equal(normalize(row.unitName), normalize(original.unit));
    assert.equal(normalize(row.denomination), normalize(original.denomination));
    assert.equal(row.code, original.code);
    assert.equal(row.quantity, String(original.quantity));
    assert.equal(row.unitName, units.get(row.unitId).name);
    assert.equal(row.code, `${row.group} ${row.category}.${String(row.level).padStart(2, '0')}`);
    assert.match(row.quantity, /^[1-9]\d*$/u);
    assert.match(row.coefficientCents, /^[1-9]\d*$/u);
  });
});

test('detailed allocation aggregates exactly to the existing calculator baseline and motor', () => {
  const aggregate = grouped(structure.positions);
  const previous = grouped(sggdReferences.all.rows);
  assert.deepEqual(aggregate, previous);
  const calculation = calculateScenario({rows: aggregate, comparisonBasis: 'arithmetic'});
  assert.equal(calculation.status, 'complete');
  for (const group of ['CCESP', 'FCESP']) {
    assert.deepEqual(structure.totals.groups[group], {
      quantity: calculation.groups[group].quantity,
      quotaCents: calculation.groups[group].quotaCents,
    });
    assert.equal(structure.totals.groups[group].quantity, sggdReferences.all.groups[group].quantity);
    assert.equal(structure.totals.groups[group].quotaCents, cents(sggdReferences.all.groups[group].quotas));
  }
  assert.deepEqual(structure.totals.aggregate, {quantity: '500', quotaCents: '141825'});
});

test('direct unit allocations partition the whole without losing same-name units or codes', () => {
  const counts = new Map();
  let total = 0n;
  for (const unit of structure.units) {
    const rows = structure.positions.filter(position => position.unitId === unit.id);
    assert.ok(rows.length > 0);
    assert.equal(unit.id, `sggd-unit-ii-${rows[0].documentaryRow}`);
    counts.set(unit.name, (counts.get(unit.name) ?? 0) + 1);
    total += rows.reduce((sum, row) => sum + BigInt(row.quantity), 0n);
  }
  assert.equal(total, 500n);
  assert.ok(counts.get('Assessoria Técnica') > 1);
  assert.ok(structure.positions.filter(row => row.code === 'CCESP 1.13').length > 1);
});

test('III limits and the divergent consolidated workbook remain separate from II allocation', () => {
  for (const group of ['CCESP', 'FCESP']) {
    const limits = structure.reconciliation.annexIIILimits.groups[group];
    const allocated = structure.totals.groups[group];
    assert.equal(limits.quantity, sggdSummaryReference.groups[group].quantity);
    assert.equal(limits.quotaCents, cents(sggdSummaryReference.groups[group].quotas));
    for (const field of ['quantity', 'quotaCents']) {
      assert.equal((BigInt(limits[field]) - BigInt(allocated[field])).toString(), structure.reconciliation.initialBalance.groups[group][field]);
    }
  }
  assert.equal(structure.reconciliation.annexIIILimits.aggregate.quantity, '499');
  assert.equal(structure.reconciliation.consolidated.declaredAllocatedQuantity.aggregate, '495');
  assert.equal(structure.reconciliation.consolidated.importedAsBaseline, false);
  assert.equal(structure.reconciliation.consolidated.differenceToImportedAllocation.aggregate, '-5');
});

test('hierarchy uses only an unambiguous explicit model parent and flags ambiguous names', () => {
  const units = new Map(structure.units.map(unit => [unit.id, unit]));
  assert.equal(structure.validationStatus, 'technical-review');
  for (const unit of structure.units) {
    const possible = structure.units.filter(candidate => normalize(candidate.name) === normalize(unit.parentName));
    if (unit.parentUnitId) {
      assert.equal(possible.length, 1);
      assert.equal(unit.parentUnitId, possible[0].id);
      assert.equal(unit.hierarchyStatus, 'model-explicit-unverified');
      const visited = new Set([unit.id]);
      let parent = units.get(unit.parentUnitId);
      while (parent) {
        assert.equal(visited.has(parent.id), false, 'Cycle in model hierarchy');
        visited.add(parent.id);
        parent = units.get(parent.parentUnitId);
      }
    } else if (possible.length > 1) {
      assert.equal(unit.hierarchyStatus, 'model-parent-ambiguous');
      assert.deepEqual(unit.parentCandidates, possible.map(candidate => candidate.id));
    } else {
      assert.equal(possible.length, 0);
      assert.equal(unit.hierarchyStatus, 'model-parent-outside-units');
    }
  }
  assert.equal(structure.reconciliation.hierarchy.unresolvedParents.length, 3);
});

test('the imported snapshot is immutable and traceable to exact received source bytes', async () => {
  assert.ok(Object.isFrozen(structure));
  assert.ok(Object.isFrozen(structure.positions[0]));
  assert.ok(Object.isFrozen(structure.units[0]));
  assert.throws(() => { structure.positions[0].quantity = '999'; }, TypeError);
  for (const source of structure.sources.filter(source => source.fileName)) {
    const bytes = await readFile(new URL(`../sources/preparacao-2026-10-19/${source.fileName}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256);
  }
});
