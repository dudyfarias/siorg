import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScenario } from '../src/calculator.mjs';
import { evaluateReferenceBalance, buildReferenceBalanceSummary } from '../src/reference-balance.mjs';

function fixture() {
  return {
    comparisonBasis: 'arithmetic',
    rows: [
      { id: 'cc', group: 'CCESP', level: '2', quantity: '3' },
      { id: 'fc', group: 'FCESP', level: '4', quantity: '2' },
    ],
    current: { mode: 'group', groups: {
      CCESP: { quantity: '3', quotas: '3.75' },
      FCESP: { quantity: '2', quotas: '2.10' },
    } },
  };
}

function evaluate(input = fixture()) {
  return evaluateReferenceBalance(calculateScenario(input));
}

test('equality gives complete comparisons with exact zero balance and excess', () => {
  const result = evaluate();
  assert.equal(result.status, 'within');
  assert.equal(result.complete, true);
  assert.deepEqual(result.groups.CCESP.quotas, {
    status: 'available', reason: null, baseline: '375', proposed: '375',
    delta: '0', balance: '0', excess: '0', relation: 'equal',
  });
  for (const group of ['CCESP', 'FCESP']) {
    assert.equal(result.groups[group].status, 'within');
    assert.equal(result.groups[group].complete, true);
    assert.equal(result.groups[group].quantity.relation, 'equal');
  }
  assert.doesNotThrow(() => JSON.stringify(result));
});

test('below-base measures retain negative variation and positive numerical balance', () => {
  const input = fixture();
  input.current.groups = { CCESP: { quantity: '4', quotas: '5' }, FCESP: { quantity: '3', quotas: '3.15' } };
  const result = evaluate(input);
  assert.equal(result.status, 'within');
  assert.equal(result.complete, true);
  assert.equal(result.groups.CCESP.quantity.delta, '-1');
  assert.equal(result.groups.CCESP.quantity.balance, '1');
  assert.equal(result.groups.CCESP.quotas.delta, '-125');
  assert.equal(result.groups.CCESP.quotas.balance, '125');
  assert.equal(result.groups.FCESP.quotas.balance, '105');
  for (const group of Object.values(result.groups)) {
    for (const metric of [group.quantity, group.quotas]) {
      assert.equal(metric.relation, 'below');
      assert.equal(metric.excess, '0');
    }
  }
});

test('quantity alone can exceed while quota balance remains positive', () => {
  const input = fixture();
  input.current.groups.CCESP = { quantity: '2', quotas: '4' };
  const result = evaluate(input);
  assert.equal(result.status, 'exceeded');
  assert.equal(result.complete, true);
  assert.equal(result.groups.CCESP.status, 'exceeded');
  assert.equal(result.groups.CCESP.quantity.excess, '1');
  assert.equal(result.groups.CCESP.quantity.balance, '-1');
  assert.equal(result.groups.CCESP.quotas.balance, '25');
  assert.equal(result.groups.CCESP.quotas.relation, 'below');
  assert.equal(result.groups.FCESP.status, 'within');
});

test('quotas alone can exceed while quantity balance remains positive', () => {
  const input = fixture();
  input.current.groups.CCESP = { quantity: '4', quotas: '3' };
  const result = evaluate(input);
  assert.equal(result.status, 'exceeded');
  assert.equal(result.groups.CCESP.quantity.balance, '1');
  assert.equal(result.groups.CCESP.quantity.relation, 'below');
  assert.equal(result.groups.CCESP.quotas.delta, '75');
  assert.equal(result.groups.CCESP.quotas.balance, '-75');
  assert.equal(result.groups.CCESP.quotas.excess, '75');
});

test('opposite species differences never cancel even when both aggregate variations are zero', () => {
  const input = fixture();
  input.rows = [
    { id: 'cc', group: 'CCESP', level: '3', quantity: '2' },
    { id: 'fc', group: 'FCESP', level: '7', quantity: '2' },
  ];
  input.current.groups = { CCESP: { quantity: '1', quotas: '1.50' }, FCESP: { quantity: '3', quotas: '4.50' } };
  const snapshot = calculateScenario(input);
  assert.equal(snapshot.aggregate.quantity, '4');
  assert.equal(snapshot.aggregate.quotaCents, '600');
  const result = evaluateReferenceBalance(snapshot);
  assert.equal(result.status, 'exceeded');
  assert.equal(result.groups.CCESP.quantity.excess, '1');
  assert.equal(result.groups.CCESP.quotas.excess, '150');
  assert.equal(result.groups.FCESP.quantity.balance, '1');
  assert.equal(result.groups.FCESP.quotas.balance, '150');
  assert.equal(Object.hasOwn(result, 'aggregate'), false);
});

test('explicit zero is available while a missing measure has no invented balance', () => {
  const input = fixture();
  input.rows.forEach((row) => { row.quantity = '0'; });
  input.current.groups = { CCESP: { quantity: '0', quotas: '0' }, FCESP: { quantity: '0', quotas: '0' } };
  const zero = evaluate(input);
  assert.equal(zero.status, 'within');
  assert.equal(zero.complete, true);
  assert.equal(zero.groups.FCESP.quotas.baseline, '0');
  assert.equal(zero.groups.FCESP.quotas.balance, '0');
  input.current.groups.FCESP.quotas = '';
  const missing = evaluate(input);
  assert.equal(missing.status, 'pending');
  assert.equal(missing.complete, false);
  assert.equal(missing.groups.CCESP.status, 'within');
  assert.equal(missing.groups.FCESP.status, 'pending');
  assert.deepEqual(missing.groups.FCESP.quotas, {
    status: 'pending', reason: 'missing_current', baseline: null, proposed: null,
    delta: null, balance: null, excess: null, relation: null,
  });
});

test('known excess takes precedence over pending measures without claiming completeness', () => {
  const input = fixture();
  input.current.groups.CCESP = { quantity: '2', quotas: '' };
  input.current.groups.FCESP.quantity = '';
  const result = evaluate(input);
  assert.equal(result.status, 'exceeded');
  assert.equal(result.complete, false);
  assert.equal(result.groups.CCESP.status, 'exceeded');
  assert.equal(result.groups.CCESP.complete, false);
  assert.equal(result.groups.FCESP.status, 'pending');
  assert.equal(result.groups.FCESP.complete, false);
  assert.equal(result.groups.CCESP.quantity.excess, '1');
  assert.equal(result.groups.CCESP.quotas.excess, null);
  assert.equal(result.groups.FCESP.quotas.status, 'available');
});

test('empty or incomplete proposals preserve engine reasons for unavailable comparisons', () => {
  const input = fixture();
  input.rows[0].quantity = '';
  const incomplete = evaluate(input);
  assert.equal(incomplete.status, 'pending');
  assert.equal(incomplete.groups.CCESP.quantity.reason, 'incomplete_proposal');
  assert.equal(incomplete.groups.CCESP.quotas.balance, null);
  assert.equal(incomplete.groups.FCESP.complete, true);
  input.rows = [];
  const empty = evaluate(input);
  assert.equal(empty.status, 'pending');
  assert.equal(empty.groups.FCESP.quantity.reason, 'empty_proposal');
});

test('aggregate-only data never supplies a per-species margin', () => {
  const input = fixture();
  input.current = { mode: 'aggregate', aggregate: { quantity: '5', quotas: '5.85' } };
  const result = evaluate(input);
  assert.equal(result.status, 'pending');
  assert.equal(result.complete, false);
  for (const group of Object.values(result.groups)) {
    for (const metric of [group.quantity, group.quotas]) {
      assert.equal(metric.reason, 'no_group_base');
      assert.equal(metric.balance, null);
    }
  }
});

test('large values remain exact and evaluating a snapshot does not mutate it', () => {
  const input = fixture();
  input.rows[0] = { id: 'cc', group: 'CCESP', level: '1', quantity: '10000000000000001' };
  input.current.groups.CCESP = { quantity: '10000000000000000', quotas: '10000000000000000' };
  const snapshot = calculateScenario(input);
  const before = structuredClone(snapshot);
  const result = evaluateReferenceBalance(snapshot);
  assert.equal(result.groups.CCESP.quantity.delta, '1');
  assert.equal(result.groups.CCESP.quotas.delta, '100');
  assert.equal(result.groups.CCESP.quotas.proposed, '1000000000000000100');
  assert.deepEqual(snapshot, before);
});

test('missing or malformed snapshots cannot turn absent values into zero', () => {
  assert.equal(evaluateReferenceBalance().status, 'pending');
  assert.equal(evaluateReferenceBalance({}).groups.CCESP.quantity.balance, null);
  const snapshot = calculateScenario(fixture());
  snapshot.comparisons.groups.CCESP.quantity.current = null;
  const result = evaluateReferenceBalance(snapshot);
  assert.equal(result.status, 'pending');
  assert.equal(result.groups.CCESP.quantity.reason, 'invalid_comparison');
  assert.equal(result.groups.CCESP.quantity.balance, null);
});

test('summary shows four independent comparisons, exact formatted values and simulation limits', () => {
  const input = fixture();
  input.current.groups.CCESP = { quantity: '2', quotas: '4' };
  const snapshot = calculateScenario(input);
  const summary = buildReferenceBalanceSummary(snapshot);
  assert.match(summary, /^COMPARAÇÃO NUMÉRICA — SIMULAÇÃO/u);
  assert.equal((summary.match(/^Quantitativo:/gmu) ?? []).length, 2);
  assert.equal((summary.match(/^Cotas:/gmu) ?? []).length, 2);
  assert.match(summary, /Quantitativo: base 2; proposta 3; variação \+1; saldo numérico \(base − proposta\) −1; excesso 1 — acima da base/u);
  assert.match(summary, /Cotas: base 4,00; proposta 3,75; variação −0,25; saldo numérico \(base − proposta\) 0,25; excesso 0,00 — abaixo da base/u);
  assert.match(summary, /sem compensação entre espécies ou entre quantitativo e cotas/u);
  assert.ok(summary.endsWith('Base e regras em validação técnica; a comparação não representa aprovação administrativa.'));
  assert.doesNotMatch(summary, /saldo oficial|aprovado|disponibilidade da secretaria/u);
  assert.doesNotMatch(summary, /available|exceeded|missing_current/u);
  for (const scopeCoverage of ['unit', 'custom']) {
    assert.match(buildReferenceBalanceSummary(snapshot, { scopeCoverage }), /saldo numérico em relação à base da unidade não é disponibilidade da secretaria nem teto da unidade/u);
  }
});

test('partial summary identifies missing measures and never prints a zero margin for them', () => {
  const input = fixture();
  input.current.groups.CCESP = { quantity: '2', quotas: '' };
  const summary = buildReferenceBalanceSummary(calculateScenario(input), { scopeCoverage: 'unit' });
  assert.match(summary, /Cotas: comparação pendente — valor da base não informado; saldo e excesso não calculados/u);
  assert.match(summary, /Resultado numérico: Há medidas acima da base/u);
  assert.match(summary, /Comparação incompleta/u);
  assert.doesNotMatch(summary, /medidas estão iguais ou abaixo|missing_current/u);
});
