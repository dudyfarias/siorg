import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScenario } from '../src/calculator.mjs';
import { organizations, getOrganization, getScope, freshReferenceRows,
  getCalculatorOrganization, getCalculatorScope, freshCalculatorReferenceRows } from '../src/organization-profiles.mjs';

function quotaCents(value) {
  assert.match(value, /^\d+(?:\.\d{1,2})?$/);
  const [whole, fraction = ''] = value.split('.');
  return (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))).toString();
}

function calculateReference(scope) {
  return calculateScenario({ rows: freshReferenceRows(scope), current: { mode: 'none' } });
}

// Documentary totals checked in Decreto 70.042/2025, not current occupancy.
// These literals deliberately remain independent of the imported reference totals.
for (const [scopeId, expected] of [
  ['all', {
    aggregate: { quantity: '2066', quotaCents: '428485' },
    CCESP: { quantity: '1246', quotaCents: '308950' },
    FCESP: { quantity: '820', quotaCents: '119535' },
  }],
  ['ure-bauru', {
    aggregate: { quantity: '16', quotaCents: '3130' },
    CCESP: { quantity: '10', quotaCents: '2200' },
    FCESP: { quantity: '6', quotaCents: '930' },
  }],
]) {
  test(`Education ${scopeId} rows reproduce the documented totals exactly in the engine`, () => {
    const scope = getScope('educacao', scopeId);
    const result = calculateReference(scope);
    assert.equal(result.status, 'complete');
    for (const group of ['aggregate', 'CCESP', 'FCESP']) {
      const actual = group === 'aggregate' ? result.aggregate : result.groups[group];
      const reference = group === 'aggregate' ? scope.reference : scope.reference.groups[group];
      assert.equal(actual.quantity, expected[group].quantity, `${group} quantity`);
      assert.equal(actual.quotaCents, expected[group].quotaCents, `${group} quotas`);
      assert.equal(reference.quantity, expected[group].quantity, `${group} stored quantity`);
      assert.equal(quotaCents(reference.quotas), expected[group].quotaCents, `${group} stored quotas`);
    }
  });
}

test('Bauru is a compatible subset of the Education reference at every species and level', () => {
  const whole = getScope('educacao', 'all');
  const bauru = getScope('educacao', 'ure-bauru');
  assert.equal(whole.coverage, 'whole');
  assert.equal(bauru.coverage, 'unit');
  assert.equal(bauru.parentScopeId, whole.id);
  assert.equal(bauru.organizationId, whole.organizationId);
  assert.equal(bauru.version, whole.version);
  const wholeRows = new Map(whole.reference.rows.map((row) => [`${row.group}:${row.level}`, row]));
  for (const row of bauru.reference.rows) {
    const parentRow = wholeRows.get(`${row.group}:${row.level}`);
    assert.ok(parentRow, `${row.group} level ${row.level} exists in the whole reference`);
    assert.ok(BigInt(row.quantity) <= BigInt(parentRow.quantity));
  }
  for (const group of ['CCESP', 'FCESP']) {
    assert.ok(BigInt(bauru.reference.groups[group].quantity) <= BigInt(whole.reference.groups[group].quantity));
    assert.ok(BigInt(quotaCents(bauru.reference.groups[group].quotas)) <= BigInt(quotaCents(whole.reference.groups[group].quotas)));
  }
});

test('pending and custom scopes never supply an automatic reference', () => {
  assert.equal(getOrganization('sggd').status, 'conflict');
  assert.equal(getOrganization('saude').status, 'pending');
  for (const organization of organizations) {
    const custom = getScope(organization.id, 'custom');
    assert.equal(custom.coverage, 'custom');
    assert.equal(custom.status, 'pending');
    for (const scope of organization.units) {
      if (organization.status === 'pending' || scope.coverage === 'custom') {
        assert.equal(scope.reference, null, `${organization.id}/${scope.id}`);
        assert.deepEqual(freshReferenceRows(scope), [], `${organization.id}/${scope.id}`);
      }
    }
  }
});

test('every scope keeps its organization and reference version with exact string data', () => {
  assert.equal(new Set(organizations.map(({ id }) => id)).size, organizations.length);
  for (const organization of organizations) {
    assert.ok(organization.version);
    assert.equal(new Set(organization.units.map(({ id }) => id)).size, organization.units.length);
    assert.equal(organization.units.filter(({ id }) => id === 'all').length, 1);
    assert.equal(organization.units.filter(({ id }) => id === 'custom').length, 1);
    for (const scope of organization.units) {
      assert.equal(scope.organizationId, organization.id);
      assert.equal(scope.version, organization.version);
      if (!scope.reference) continue;
      assert.equal(scope.reference.version, organization.version);
      if (scope.reference.nature === 'published-distribution') {
        assert.equal(scope.status, 'conflict');
        assert.equal(scope.reference.sourceAnnex, 'II');
        assert.equal(scope.reference.reconciliationStatus, 'conflict');
        assert.equal(scope.reference.conflictingAnnex, 'III');
        assert.ok(scope.reference.notice);
      } else {
        assert.equal(scope.status, 'verified');
        assert.equal(scope.reference.nature, 'authorized');
      }
      assert.match(scope.sourceUrl, /^https:\/\//);
      const rows = scope.reference.rows;
      assert.ok(rows.length > 0);
      assert.equal(new Set(rows.map(({ group, level }) => `${group}:${level}`)).size, rows.length);
      for (const row of rows) {
        assert.ok(['CCESP', 'FCESP'].includes(row.group));
        assert.equal(typeof row.level, 'string');
        assert.match(row.level, /^\d+$/);
        assert.equal(typeof row.quantity, 'string');
        assert.match(row.quantity, /^\d+$/);
      }
    }
  }
});

// Derived exclusively from the distribution in Annex II, not the conflicting Annex III.
// Inclusive units use the explicit hierarchy in Resolution SGGD 33/2026, art. 1, III.
for (const [scopeId, quantity, cents, ccQuantity, ccCents, fcQuantity, fcCents] of [
  ['all', '500', '141825', '299', '106950', '201', '34875'],
  ['subsecretaria-gestao', '66', '20375', '43', '16025', '23', '4350'],
  ['diretoria-geral-desenvolvimento-capacidade-institucional', '44', '12830', '27', '9650', '17', '3180'],
  ['diretoria-modernizacao-organizacional', '7', '2470', '6', '2275', '1', '195'],
  ['diretoria-inovacao-gestao-publica', '2', '1000', '2', '1000', '0', '0'],
  ['diretoria-normas-sistemas-logistica', '5', '1640', '3', '1250', '2', '390'],
]) {
  test(`SGGD ${scopeId} loads the exact documentary distribution without clearing its conflict`, () => {
    const scope = getScope('sggd', scopeId);
    const result = calculateReference(scope);
    assert.equal(result.status, 'complete');
    assert.equal(scope.status, 'conflict');
    assert.equal(scope.reference.nature, 'published-distribution');
    assert.equal(scope.reference.sourceAnnex, 'II');
    assert.equal(scope.reference.reconciliationStatus, 'conflict');
    assert.equal(scope.reference.conflictingAnnex, 'III');
    for (const [group, expectedQuantity, expectedCents] of [
      ['aggregate', quantity, cents], ['CCESP', ccQuantity, ccCents], ['FCESP', fcQuantity, fcCents],
    ]) {
      const actual = group === 'aggregate' ? result.aggregate : result.groups[group];
      const stored = group === 'aggregate' ? scope.reference : scope.reference.groups[group];
      assert.equal(actual.quantity, expectedQuantity, `${group} quantity`);
      assert.equal(actual.quotaCents, expectedCents, `${group} quotas`);
      assert.equal(stored.quantity, expectedQuantity, `${group} stored quantity`);
      assert.equal(quotaCents(stored.quotas), expectedCents, `${group} stored quotas`);
    }
  });
}

test('SGGD direct and inclusive scopes remain distinct and retain explicit structural provenance', () => {
  const directIds = ['diretoria-modernizacao-organizacional', 'diretoria-inovacao-gestao-publica', 'diretoria-normas-sistemas-logistica'];
  const sub = getScope('sggd', 'subsecretaria-gestao');
  const dg = getScope('sggd', 'diretoria-geral-desenvolvimento-capacidade-institucional');
  for (const scope of [sub, dg]) {
    assert.match(scope.structureSourceLabel, /Resolução SGGD 33\/2026/);
    assert.match(scope.structureSourceUrl, /doe\.sp\.gov\.br/);
    assert.match(scope.scopeLabel, /unidades subordinadas/);
  }
  assert.match(dg.scopeLabel, /Seção de Apoio Administrativo/);
  for (const id of directIds) {
    assert.match(getScope('sggd', id).scopeLabel, /Postos diretos.*sem as unidades subordinadas/);
  }
  const wholeRows = new Map(getScope('sggd', 'all').reference.rows.map((row) => [`${row.group}:${row.level}`, row]));
  for (const scope of [sub, dg, ...directIds.map((id) => getScope('sggd', id))]) {
    for (const row of scope.reference.rows) {
      const parentRow = wholeRows.get(`${row.group}:${row.level}`);
      assert.ok(parentRow);
      assert.ok(BigInt(row.quantity) <= BigInt(parentRow.quantity));
    }
  }
  assert.notEqual(getScope('sggd', 'all').reference.quantity, '499', 'do not substitute Annex III total');
  assert.notEqual(getScope('sggd', 'all').reference.quotas, '1415.35', 'do not silently reconcile conflicting annexes');
  assert.deepEqual(freshReferenceRows({ ...dg, version: 'sggd-decreto-70755-2026-08-01' }), []);
});

test('editable reference copies stay isolated, with stable and globally unique row IDs', () => {
  const allIds = new Set();
  for (const organization of organizations) {
    for (const scope of organization.units.filter(({ reference }) => reference)) {
      const original = structuredClone(scope.reference.rows);
      const first = freshReferenceRows(scope);
      const second = freshReferenceRows(scope);
      assert.notEqual(first, second);
      assert.deepEqual(first, second);
      assert.ok(Object.isFrozen(scope.reference.rows));
      for (let index = 0; index < first.length; index += 1) {
        assert.notEqual(first[index], second[index]);
        assert.ok(Object.isFrozen(scope.reference.rows[index]));
        assert.ok(!allIds.has(first[index].id), `unique ID: ${first[index].id}`);
        allIds.add(first[index].id);
      }
      first[0].quantity = '999999';
      first.pop();
      assert.deepEqual(scope.reference.rows, original);
      assert.deepEqual(freshReferenceRows(scope), second);
    }
  }
});

test('unknown scopes and stale versions cannot silently load another reference', () => {
  const whole = getScope('educacao', 'all');
  assert.equal(getOrganization('unknown'), undefined);
  assert.equal(getScope('unknown', 'all'), undefined);
  assert.equal(getScope('educacao', 'unknown'), undefined);
  for (const scope of [
    undefined,
    null,
    { ...whole, organizationId: 'unknown' },
    { ...whole, id: 'unknown' },
    { ...whole, version: `${whole.version}-stale` },
    { ...whole, version: undefined },
  ]) {
    assert.deepEqual(freshReferenceRows(scope), []);
  }
  assert.deepEqual(freshReferenceRows(structuredClone(whole)), freshReferenceRows(whole));
});

test('calculator SGGD summary reproduces Annex III while legacy distribution retains Annex II', () => {
  const organization = getCalculatorOrganization('sggd');
  const scope = getCalculatorScope('sggd', 'all');
  assert.equal(organization.status, 'conflict');
  assert.equal(organization.version, 'sggd-decreto-70755-2026-08-01');
  assert.equal(scope.version, 'sggd-decreto-70755-2026-08-01-anexo-III');
  assert.equal(scope.reference.version, scope.version);
  assert.equal(scope.reference.nature, 'published-summary');
  assert.equal(scope.reference.sourceAnnex, 'III');
  assert.equal(scope.reference.conflictingAnnex, 'II');
  assert.equal(scope.reference.reconciliationStatus, 'conflict');
  assert.match(scope.sourceLabel, /Anexo III \(resumo\)/u);
  assert.match(scope.notice, /Anexo III.*Anexo II/u);
  const result = calculateScenario({ rows: freshCalculatorReferenceRows(scope), current: { mode: 'none' } });
  assert.equal(result.status, 'complete');
  for (const [group, quantity, cents] of [['aggregate', '499', '141535'], ['CCESP', '298', '106600'], ['FCESP', '201', '34935']]) {
    const actual = group === 'aggregate' ? result.aggregate : result.groups[group];
    const stored = group === 'aggregate' ? scope.reference : scope.reference.groups[group];
    assert.equal(actual.quantity, quantity);
    assert.equal(actual.quotaCents, cents);
    assert.equal(stored.quantity, quantity);
    assert.equal(quotaCents(stored.quotas), cents);
  }
  assert.equal(scope.reference.rows.length, 34);
  for (const [group, level, quantity] of [['CCESP', '9', '15'], ['CCESP', '10', '51'], ['FCESP', '6', '24'], ['FCESP', '10', '53']]) {
    assert.equal(scope.reference.rows.find((row) => row.group === group && row.level === level)?.quantity, quantity);
  }
  const legacy = getScope('sggd', 'all');
  assert.equal(legacy.reference.nature, 'published-distribution');
  assert.equal(legacy.reference.quantity, '500');
  assert.equal(legacy.reference.quotas, '1418.25');
  assert.deepEqual(freshCalculatorReferenceRows(legacy), [], 'Annex II whole is not the calculator canonical scope');
  assert.deepEqual(freshReferenceRows(scope), [], 'Annex III does not replace the legacy whole reference');
});

test('calculator scope references retain their own annex version and reuse unaffected original profiles', () => {
  const calculator = getCalculatorOrganization('sggd');
  assert.notEqual(calculator, getOrganization('sggd'));
  assert.match(calculator.notice, /Anexo III.*Anexo II.*consolidação cruzada/u);
  for (const original of getOrganization('sggd').units.filter(({ id }) => id !== 'all')) {
    const scope = getCalculatorScope('sggd', original.id);
    assert.equal(scope, original);
    assert.equal(scope.version, original.version);
    assert.deepEqual(freshCalculatorReferenceRows(scope), freshReferenceRows(original));
    if (scope.reference) assert.equal(scope.reference.sourceAnnex, 'II');
  }
  for (const id of ['educacao', 'saude']) {
    assert.equal(getCalculatorOrganization(id), getOrganization(id));
    for (const scope of getOrganization(id).units) {
      assert.equal(getCalculatorScope(id, scope.id), scope);
      assert.deepEqual(freshCalculatorReferenceRows(scope), freshReferenceRows(scope));
    }
  }
  assert.equal(getCalculatorOrganization('unknown'), undefined);
  assert.equal(getCalculatorScope('unknown', 'all'), undefined);
  assert.equal(getCalculatorScope('sggd', 'unknown'), undefined);
});

test('calculator reference loading rejects forged metadata, versions, totals, rows and provenance', () => {
  for (const id of ['all', 'diretoria-modernizacao-organizacional']) {
    const original = getCalculatorScope('sggd', id);
    for (const mutate of [
      (scope) => { scope.version += '-stale'; },
      (scope) => { scope.reference.version += '-stale'; },
      (scope) => { scope.reference.nature = 'authorized'; },
      (scope) => { scope.reference.sourceAnnex = 'I'; },
      (scope) => { scope.reference.conflictingAnnex = ''; },
      (scope) => { scope.reference.reconciliationStatus = 'verified'; },
      (scope) => { scope.reference.quantity = '1'; },
      (scope) => { scope.reference.groups.CCESP.quotas = '0'; },
      (scope) => { scope.reference.rows[0].quantity = '1'; scope.reference.rows.pop(); },
      (scope) => { scope.reference.notice = 'Referência reconciliada'; },
      (scope) => { scope.status = 'verified'; },
      (scope) => { scope.sourceUrl = 'https://example.invalid/forged'; },
      (scope) => { scope.organizationId = 'unknown'; },
      (scope) => { scope.id = 'unknown'; },
    ]) {
      const forged = structuredClone(original); mutate(forged);
      assert.deepEqual(freshCalculatorReferenceRows(forged), [], `${id}: ${mutate.toString()}`);
    }
    assert.deepEqual(freshCalculatorReferenceRows(structuredClone(original)), freshCalculatorReferenceRows(original));
  }
  for (const scope of [undefined, null, {}, getCalculatorScope('sggd', 'custom'), getCalculatorScope('saude', 'all')]) {
    assert.deepEqual(freshCalculatorReferenceRows(scope), []);
  }
});

test('calculator editable copies cannot mutate either annex or the original distribution profile', () => {
  const originalDistribution = structuredClone(getOrganization('sggd'));
  const summary = getCalculatorScope('sggd', 'all');
  const originalRows = structuredClone(summary.reference.rows);
  const first = freshCalculatorReferenceRows(summary);
  const second = freshCalculatorReferenceRows(summary);
  assert.ok(Object.isFrozen(summary.reference.rows));
  assert.ok(Object.isFrozen(summary.reference.rows[0]));
  assert.notEqual(first[0], second[0]);
  first[0].quantity = '999'; first.pop();
  assert.deepEqual(summary.reference.rows, originalRows);
  assert.deepEqual(freshCalculatorReferenceRows(summary), second);
  assert.deepEqual(getOrganization('sggd'), originalDistribution);
});
