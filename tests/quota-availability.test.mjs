import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScenario } from '../src/calculator.mjs';
import { getScope, freshReferenceRows, getCalculatorScope, freshCalculatorReferenceRows, getOrganization } from '../src/organization-profiles.mjs';
import { calculateQuotaAvailability } from '../src/quota-availability.mjs';
import { buildScopedSummary } from '../src/scenario.mjs';

function fixture(scopeId = 'all') {
  const scope = getScope('sggd', scopeId);
  const input = { comparisonBasis: 'arithmetic', rows: freshReferenceRows(scope),
    current: { mode: 'group', groups: structuredClone(scope.reference.groups) } };
  return { organizationId: 'sggd', scopeId, baselineOrigin: 'documentary', input, result: calculateScenario(input) };
}

function recalculate(data) { data.result = calculateScenario(data.input); return calculateQuotaAvailability(data); }
function summary(data) {
  return buildScopedSummary({ organization: getOrganization('sggd'), scope: getScope('sggd', data.scopeId),
    baselineOrigin: data.baselineOrigin, input: data.input, result: data.result });
}

test('Annex III minus Annex II keeps the four initial SGGD balances distinct', () => {
  const value = calculateQuotaAvailability(fixture());
  assert.equal(value.status, 'available');
  assert.equal(value.scopeKind, 'whole');
  assert.equal(value.proposalStatus, 'complete');
  assert.deepEqual(value.limits.groups, { CCESP: { quantity: '298', quotaCents: '106600' }, FCESP: { quantity: '201', quotaCents: '34935' } });
  assert.deepEqual(value.allocated.groups, { CCESP: { quantity: '299', quotaCents: '106950' }, FCESP: { quantity: '201', quotaCents: '34875' } });
  assert.deepEqual(value.projected, value.allocated);
  assert.deepEqual(value.proposedBalance, value.currentBalance);
  const groups = value.currentBalance.groups;
  assert.equal(groups.CCESP.quantity.balance, '-1');
  assert.equal(groups.CCESP.quantity.excess, '1');
  assert.equal(groups.CCESP.quotas.balance, '-350');
  assert.equal(groups.CCESP.quotas.excess, '350');
  assert.equal(groups.FCESP.quantity.balance, '0');
  assert.equal(groups.FCESP.quotas.balance, '60');
  assert.equal(groups.FCESP.quotas.excess, '0');
  assert.equal(value.currentBalance.status, 'exceeded');
  assert.equal(value.currentBalance.groups.FCESP.status, 'within');
  assert.equal(Object.hasOwn(value.currentBalance, 'aggregate'), false);
  assert.equal(Object.hasOwn(value.proposedBalance, 'aggregate'), false);
  assert.equal(value.sourceLabels.limits.annex, 'III');
  assert.equal(value.sourceLabels.allocated.annex, 'II');
  assert.notEqual(value.sourceLabels.limits.version, value.sourceLabels.allocated.version);
});

test('whole-secretariat proposal is compared directly to the limit, retaining the original allocation', () => {
  const data = fixture();
  data.input.rows = freshCalculatorReferenceRows(getCalculatorScope('sggd', 'all'));
  const value = recalculate(data);
  assert.equal(value.status, 'available');
  assert.deepEqual(value.projected, value.limits);
  assert.equal(value.allocated.aggregate.quantity, '500');
  assert.equal(value.proposedBalance.status, 'within');
  for (const group of ['CCESP', 'FCESP']) for (const key of ['quantity', 'quotas']) {
    assert.equal(value.proposedBalance.groups[group][key].balance, '0');
    assert.equal(value.proposedBalance.groups[group][key].relation, 'equal');
  }
});

test('unit projection replaces only its own Annex II allocation and preserves the rest by species', () => {
  const data = fixture('diretoria-modernizacao-organizacional');
  const row = data.input.rows.find((entry) => entry.group === 'CCESP' && entry.level === '8');
  assert.ok(row); row.quantity = (BigInt(row.quantity) + 1n).toString();
  const value = recalculate(data);
  assert.equal(value.status, 'available');
  assert.equal(value.scopeKind, 'unit');
  assert.equal(value.projected.groups.CCESP.quantity, '300');
  assert.equal(value.projected.groups.CCESP.quotaCents, '107225');
  assert.deepEqual(value.projected.groups.FCESP, value.allocated.groups.FCESP);
  assert.equal(value.proposedBalance.groups.CCESP.quantity.balance, '-2');
  assert.equal(value.proposedBalance.groups.CCESP.quotas.balance, '-625');
  assert.equal(value.proposedBalance.groups.FCESP.quotas.balance, '60');
  assert.match(value.message, /restante da alocação é mantido/u);
  assert.equal(value.comparisonResult.comparisons.groups.CCESP.quotas.current, '106600');
  assert.equal(value.comparisonResult.comparisons.groups.CCESP.quotas.proposed, '107225');
});

test('all supported unit scopes reproduce the same whole allocation when left unchanged', () => {
  for (const scope of getOrganization('sggd').units.filter((scope) => scope.coverage === 'unit')) {
    const value = calculateQuotaAvailability(fixture(scope.id));
    assert.equal(value.status, 'available', scope.id);
    assert.deepEqual(value.projected, value.allocated, scope.id);
    assert.equal(value.proposedBalance.groups.CCESP.quotas.balance, '-350', scope.id);
  }
});

test('incomplete and empty proposals preserve current availability without inventing a projected balance', () => {
  for (const empty of [false, true]) {
    const data = fixture('diretoria-modernizacao-organizacional');
    if (empty) data.input.rows = []; else data.input.rows[0].quantity = '';
    const value = recalculate(data);
    assert.equal(value.status, 'available');
    assert.equal(value.proposalStatus, 'pending');
    assert.equal(value.projected, null);
    assert.equal(value.currentBalance.complete, true);
    assert.equal(value.currentBalance.groups.CCESP.quotas.balance, '-350');
    assert.equal(value.proposedBalance.status, 'pending');
    for (const group of ['CCESP', 'FCESP']) for (const key of ['quantity', 'quotas']) {
      assert.equal(value.proposedBalance.groups[group][key].reason, empty ? 'empty_proposal' : 'incomplete_proposal');
      assert.equal(value.proposedBalance.groups[group][key].balance, null);
      assert.equal(value.comparisonResult.comparisons.groups[group][key].proposed, null);
      assert.notEqual(value.comparisonResult.comparisons.groups[group][key].current, null);
    }
  }
});

test('manual, example, unknown, custom and other organizations do not apply automatic SGGD availability', () => {
  for (const baselineOrigin of ['manual', 'manual-from-reference', 'example', 'reference', undefined]) {
    const value = calculateQuotaAvailability({ ...fixture(), baselineOrigin });
    assert.equal(value.status, 'unavailable');
    assert.equal(value.reason, 'baseline_origin_unavailable');
    assert.equal(value.currentBalance, null);
  }
  for (const scopeId of ['custom', 'unknown', undefined]) assert.equal(calculateQuotaAvailability({ ...fixture(), scopeId }).reason, 'scope_unavailable');
  for (const organizationId of ['educacao', 'saude', 'unknown', undefined]) assert.equal(calculateQuotaAvailability({ ...fixture(), organizationId }).reason, 'availability_unverified');
});

test('the active baseline must match the canonical allocation in all four group fields', () => {
  for (const [group, measure, entered] of [['CCESP', 'quantity', '298'], ['CCESP', 'quotas', '1066'], ['FCESP', 'quantity', ''], ['FCESP', 'quotas', '349.35'], ['CCESP', 'quantity', '-1']]) {
    const data = fixture(); data.input.current.groups[group][measure] = entered;
    assert.equal(recalculate(data).reason, 'baseline_mismatch');
  }
  const data = fixture();
  data.input.current = { mode: 'aggregate', aggregate: { quantity: '500', quotas: '1418.25' } };
  assert.equal(recalculate(data).reason, 'baseline_mismatch');
});

test('malformed or stale proposed totals stay pending while valid current balances remain visible', () => {
  for (const mutate of [
    (result) => { result.groups.CCESP.quantity = null; },
    (result) => { result.groups.CCESP.quotaCents = '-1'; },
    (result) => { result.aggregate.quantity = '999'; },
    (result) => { result.catalogueVersion = 'old'; },
  ]) {
    const data = fixture(); mutate(data.result);
    const value = calculateQuotaAvailability(data);
    assert.equal(value.status, 'available');
    assert.equal(value.proposalStatus, 'pending');
    assert.equal(value.projected, null);
    assert.equal(value.currentBalance.complete, true);
    assert.equal(value.proposedBalance.groups.CCESP.quantity.balance, null);
  }
});

test('explicit zero and quantities beyond Number precision stay exact and do not mutate the input or sources', () => {
  const data = fixture('diretoria-inovacao-gestao-publica');
  data.input.rows.forEach((row) => { row.quantity = '0'; });
  let value = recalculate(data);
  assert.equal(value.status, 'available');
  assert.equal(value.projected.groups.CCESP.quantity, '297');
  assert.equal(value.projected.groups.CCESP.quotaCents, '105950');
  assert.equal(value.proposedBalance.groups.CCESP.quantity.balance, '1');
  data.input.rows[0].quantity = '9007199254740993';
  data.result = calculateScenario(data.input);
  const before = structuredClone(data), sourceBefore = structuredClone(getOrganization('sggd'));
  value = calculateQuotaAvailability(data);
  assert.equal(value.projected.groups.CCESP.quantity, '9007199254741290');
  assert.equal(value.proposedBalance.groups.CCESP.quantity.balance, '-9007199254740992');
  assert.deepEqual(data, before);
  assert.deepEqual(getOrganization('sggd'), sourceBefore);
  assert.deepEqual(JSON.parse(JSON.stringify(value)), value);
});

test('scoped summary shows distinct limit/allocation sources and both balances without the obsolete cross-annex block', () => {
  const data = fixture('diretoria-modernizacao-organizacional');
  let text = summary(data);
  assert.match(text, /Limite da secretaria: .*Anexo III/u);
  assert.match(text, /Alocado na secretaria: .*Anexo II/u);
  assert.match(text, /DISPONIBILIDADE ATUAL NA SECRETARIA/u);
  assert.match(text, /Quantitativo: limite 298; alocado 299; saldo disponível −1; extrapolação 1/u);
  assert.match(text, /Cotas: limite 1\.066,00; alocado 1\.069,50; saldo disponível −3,50; extrapolação 3,50/u);
  assert.match(text, /Cotas: limite 349,35; alocado 348,75; saldo disponível \+0,60; extrapolação 0,00/u);
  assert.match(text, /restante da estrutura fica mantido/u);
  assert.match(text, /Base e regras em validação técnica/u);
  assert.doesNotMatch(text, /IMPACTO ARITMÉTICO NA SECRETARIA|não permite calcular o impacto|impede a consolidação cruzada|Pendência de conciliação|não demonstra saldo disponível/u);
  data.input.rows[0].quantity = ''; recalculate(data); text = summary(data);
  assert.match(text, /saldo disponível −3,50/u);
  assert.match(text, /proposta, saldo disponível e extrapolação pendentes/u);
  assert.doesNotMatch(text, /alocação projetada 0/u);
});

test('availability summary does not bypass the supplied scope provenance checks', () => {
  const data = fixture('diretoria-modernizacao-organizacional');
  for (const mutate of [
    (scope) => { scope.version = 'stale'; },
    (scope) => { scope.reference.version = 'stale'; },
    (scope) => { scope.sourceUrl = 'https://example.invalid/other-source'; },
    (scope) => { scope.reference.nature = 'authorized'; },
    (scope) => { scope.reference.groups.CCESP.quantity = '999'; },
  ]) {
    const scope = structuredClone(getScope('sggd', data.scopeId)); mutate(scope);
    const text = buildScopedSummary({ ...data, organization: getOrganization('sggd'), scope });
    assert.match(text, /base documental solicitada, sem correspondência verificada/u);
    assert.doesNotMatch(text, /DISPONIBILIDADE ATUAL NA SECRETARIA|Origem da base local: alocação documental/u);
  }
});
