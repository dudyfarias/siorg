import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScenario, buildSummary, formatInteger, formatCents, catalogue } from '../src/calculator.mjs';

const context = {
  organization: 'Órgão fictício', scope: 'Estrutura completa', nature: 'Estrutura autorizada',
  date: '2026-04-30', source: 'Referência fictícia para testes', equivalent: true,
};
function fixture() {
  return {
    rows: [
      { id: 'cc2', group: 'CCESP', level: 2, quantity: '3' },
      { id: 'fc4', group: 'FCESP', level: 4, quantity: '2' },
    ],
    current: { mode: 'group', groups: { CCESP: { quantity: '4', quotas: '5,00' }, FCESP: { quantity: '1', quotas: '1,05' } } },
    context: { ...context },
  };
}

function arithmeticFixture() {
  const input = fixture();
  delete input.context;
  input.comparisonBasis = 'arithmetic';
  input.current = { mode: 'aggregate', aggregate: { quantity: '4', quotas: '5,00' } };
  return input;
}

function arithmeticGroupFixture() {
  const input = fixture();
  delete input.context;
  input.comparisonBasis = 'arithmetic';
  return input;
}

test('arithmetic group mode compares each species and derives both aggregate measures without context', () => {
  const input = arithmeticGroupFixture();
  const before = structuredClone(input);
  const result = calculateScenario(input);
  assert.equal(result.comparisons.mode, 'group');
  assert.equal(result.comparisons.groups.CCESP.quantity.delta, '-1');
  assert.equal(result.comparisons.groups.CCESP.quotas.delta, '-125');
  assert.equal(result.comparisons.groups.FCESP.quantity.delta, '1');
  assert.equal(result.comparisons.groups.FCESP.quotas.delta, '105');
  assert.deepEqual(result.current.aggregate, { derived: true,
    quantity: { status: 'valid', value: '5', enteredValue: null },
    quotas: { status: 'valid', value: '605', enteredValue: null } });
  assert.equal(result.comparisons.aggregate.quantity.delta, '0');
  assert.equal(result.comparisons.aggregate.quotas.delta, '-20');
  assert.equal(result.comparisons.aggregate.quotas.direction, 'decrease');
  assert.equal(result.context.equivalent, null);
  assert.ok(!result.issues.some(({ field }) => field.startsWith('context.')));
  assert.deepEqual(input, before);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
});

test('opposite species differences retain their signs when both aggregate differences are zero', () => {
  const input = arithmeticGroupFixture();
  input.rows = [{ id: 'cc', group: 'CCESP', level: 3, quantity: '3' },
    { id: 'fc', group: 'FCESP', level: 7, quantity: '1' }];
  input.current.groups = { CCESP: { quantity: '2', quotas: '3' }, FCESP: { quantity: '2', quotas: '3' } };
  const result = calculateScenario(input);
  for (const [group, quantity, quotas, direction] of [
    ['CCESP', '1', '150', 'increase'], ['FCESP', '-1', '-150', 'decrease'],
  ]) {
    assert.equal(result.comparisons.groups[group].quantity.delta, quantity);
    assert.equal(result.comparisons.groups[group].quotas.delta, quotas);
    assert.equal(result.comparisons.groups[group].quantity.direction, direction);
    assert.equal(result.comparisons.groups[group].quotas.direction, direction);
  }
  for (const key of ['quantity', 'quotas']) {
    assert.equal(result.comparisons.aggregate[key].delta, '0');
    assert.equal(result.comparisons.aggregate[key].direction, 'unchanged');
  }
});

test('partial or invalid group bases block only their own comparisons and matching aggregate measure', () => {
  for (const [group, key, value, reason] of [
    ['CCESP', 'quantity', '', 'missing_current'], ['FCESP', 'quotas', undefined, 'missing_current'],
    ['FCESP', 'quantity', '2,5', 'invalid_current'], ['CCESP', 'quotas', '5,000', 'invalid_current'],
  ]) {
    const input = arithmeticGroupFixture();
    input.current.groups[group][key] = value;
    const result = calculateScenario(input);
    const otherGroup = group === 'CCESP' ? 'FCESP' : 'CCESP', otherKey = key === 'quantity' ? 'quotas' : 'quantity';
    assert.equal(result.status, 'complete');
    assert.equal(result.comparisons.groups[group][key].reason, reason);
    assert.equal(result.comparisons.groups[group][otherKey].status, 'available');
    assert.equal(result.comparisons.groups[otherGroup][key].status, 'available');
    assert.equal(result.comparisons.aggregate[key].reason, reason);
    assert.equal(result.comparisons.aggregate[key].delta, null);
    assert.equal(result.current.aggregate[key].value, null);
    assert.equal(result.comparisons.aggregate[otherKey].status, 'available');
  }
  const input = arithmeticGroupFixture();
  input.current.groups.CCESP.quantity = '';
  input.current.groups.FCESP.quantity = '-1';
  const result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quantity.reason, 'invalid_current');
  assert.equal(result.current.aggregate.quantity.value, null);
  assert.equal(result.comparisons.aggregate.quotas.delta, '-20');
});

test('missing group bases never become zero, while explicit zeros and equality remain valid', () => {
  const input = arithmeticGroupFixture();
  input.current.groups = {};
  let result = calculateScenario(input);
  for (const key of ['quantity', 'quotas']) {
    assert.equal(result.current.aggregate[key].status, 'missing');
    assert.equal(result.comparisons.aggregate[key].reason, 'missing_current');
    assert.equal(result.comparisons.aggregate[key].delta, null);
  }
  input.current.groups = { CCESP: { quantity: '0', quotas: '0,00' }, FCESP: { quantity: '0', quotas: '0' } };
  result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quantity.delta, '5');
  assert.equal(result.comparisons.aggregate.quotas.delta, '585');
  assert.equal(result.comparisons.groups.CCESP.quotas.delta, '375');
  input.current.groups = { CCESP: { quantity: '3', quotas: '3,75' }, FCESP: { quantity: '2', quotas: '2.10' } };
  result = calculateScenario(input);
  for (const comparison of [result.comparisons.groups.CCESP, result.comparisons.groups.FCESP, result.comparisons.aggregate]) {
    for (const key of ['quantity', 'quotas']) {
      assert.equal(comparison[key].delta, '0');
      assert.equal(comparison[key].direction, 'unchanged');
    }
  }
});

test('an incomplete group proposal leaves the other species valid and never creates a partial aggregate comparison', () => {
  const input = arithmeticGroupFixture();
  input.rows[0].quantity = '';
  let result = calculateScenario(input);
  assert.equal(result.comparisons.groups.CCESP.quotas.reason, 'incomplete_proposal');
  assert.equal(result.comparisons.groups.FCESP.quotas.delta, '105');
  assert.equal(result.comparisons.aggregate.quantity.reason, 'incomplete_proposal');
  assert.equal(result.comparisons.aggregate.quotas.delta, null);
  assert.equal(result.current.aggregate.quotas.value, '605');
  input.rows = [];
  result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quantity.reason, 'empty_proposal');
  assert.equal(result.comparisons.groups.FCESP.quantity.reason, 'empty_proposal');
  input.rows = [{ id: 'zero', group: 'CCESP', level: 1, quantity: '0' }];
  result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quantity.delta, '-5');
  assert.equal(result.comparisons.aggregate.quotas.delta, '-605');
});

test('derived group aggregate ignores stale aggregate input and preserves exact large integers', () => {
  const input = arithmeticGroupFixture();
  input.current.aggregate = { quantity: '99999', quotas: 'INVALID' };
  input.current.groups.CCESP.quantity = '9007199254740993';
  input.current.groups.FCESP.quantity = '1';
  input.current.groups.CCESP.quotas = '9007199254740993.01';
  input.current.groups.FCESP.quotas = '0.09';
  const result = calculateScenario(input);
  assert.equal(result.current.aggregate.quantity.value, '9007199254740994');
  assert.equal(result.current.aggregate.quotas.value, '900719925474099310');
  assert.equal(result.comparisons.aggregate.quantity.delta, '-9007199254740989');
  assert.equal(result.comparisons.aggregate.quotas.delta, '-900719925474098725');
  assert.ok(!result.issues.some(({ field }) => field.startsWith('current.aggregate')));
  assert.doesNotMatch(buildSummary(input, result), /INVALID|99\.999/u);
});

test('the contextual group mode keeps its previous metadata requirement and inactive aggregate', () => {
  for (const comparisonBasis of [undefined, 'declared-equivalence', 'arithmetic-typo']) {
    const input = arithmeticGroupFixture(); input.comparisonBasis = comparisonBasis;
    let result = calculateScenario(input);
    assert.equal(result.comparisons.groups.CCESP.quantity.reason, 'incomplete_context');
    assert.equal(result.current.aggregate, null);
    assert.equal(result.comparisons.aggregate.quantity.reason, 'inactive_mode');
    input.context = { ...context };
    result = calculateScenario(input);
    assert.equal(result.comparisons.groups.CCESP.quantity.delta, '-1');
    assert.equal(result.current.aggregate, null);
    assert.equal(result.comparisons.aggregate.quantity.reason, 'inactive_mode');
  }
});

test('group arithmetic export retains species signs and identifies its descriptive derived aggregate', () => {
  const input = arithmeticGroupFixture();
  let result = calculateScenario(input);
  let summary = buildSummary(input, result);
  assert.match(summary, /Cargos CCESP: atual 4; proposta 3; variação −1/u);
  assert.match(summary, /Funções FCESP: atual 1; proposta 2; variação \+1/u);
  assert.match(summary, /Agregado derivado dos dois grupos; descritivo, sem compensação/u);
  assert.match(summary, /Postos agregados: atual 5; proposta 5; variação 0/u);
  assert.match(summary, /Cotas agregadas: atual 6,05; proposta 5,85; variação −0,20/u);
  assert.doesNotMatch(summary, /Equivalência declarada|confirmada pelo usuário|aprovado/u);
  input.current.groups.CCESP.quantity = '1.000';
  result = calculateScenario(input);
  summary = buildSummary(input, result);
  assert.match(summary, /Cargos CCESP: indisponível — base atual inválida; entrada atual inválida: “1\.000”/u);
  assert.match(summary, /Postos agregados: indisponível — base atual inválida\./u);
  assert.doesNotMatch(summary, /Postos agregados:.*entrada atual inválida/u);
});

test('arithmetic basis calculates both aggregate differences without declaring a context', () => {
  const input = arithmeticFixture();
  const result = calculateScenario(input);
  assert.equal(result.comparisonBasis, 'arithmetic');
  assert.equal(result.status, 'complete');
  assert.equal(result.comparisons.aggregate.quantity.status, 'available');
  assert.equal(result.comparisons.aggregate.quantity.delta, '1');
  assert.equal(result.comparisons.aggregate.quotas.status, 'available');
  assert.equal(result.comparisons.aggregate.quotas.delta, '85');
  assert.equal(result.comparisons.aggregate.quantity.direction, 'increase');
  assert.equal(result.comparisons.aggregate.quotas.direction, 'increase');
  assert.equal(result.groups.CCESP.quotaCents, '375');
  assert.equal(result.groups.FCESP.quotaCents, '210');
  assert.equal(result.comparisons.groups.CCESP.quotas.reason, 'no_group_base');
  assert.equal(result.comparisons.groups.FCESP.quantity.delta, null);
  assert.ok(!result.issues.some(({ field }) => field.startsWith('context.')));
  assert.equal(result.context.equivalent, null);
});

test('arithmetic basis distinguishes a missing current measure from an explicit zero', () => {
  const input = arithmeticFixture();
  input.current.aggregate = { quantity: '', quotas: '0' };
  let result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quantity.reason, 'missing_current');
  assert.equal(result.comparisons.aggregate.quantity.delta, null);
  assert.equal(result.comparisons.aggregate.quotas.delta, '585');
  input.current.aggregate = { quantity: '0', quotas: ' ' };
  result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quantity.delta, '5');
  assert.equal(result.comparisons.aggregate.quotas.reason, 'missing_current');
  assert.equal(result.comparisons.aggregate.quotas.delta, null);
  input.current.aggregate = { quantity: '0', quotas: '0,00' };
  result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quantity.delta, '5');
  assert.equal(result.comparisons.aggregate.quotas.delta, '585');
  input.current.aggregate = { quantity: '', quotas: '' };
  result = calculateScenario(input);
  assert.equal(result.status, 'complete');
  assert.equal(result.aggregate.quotaCents, '585');
  assert.equal(result.comparisons.aggregate.quantity.delta, null);
  assert.equal(result.comparisons.aggregate.quotas.delta, null);
});

test('arithmetic basis preserves numeric validation and never compares an incomplete proposal', () => {
  const input = arithmeticFixture();
  for (const quantity of ['-1', '1,5', '1.000', '3x']) {
    input.current.aggregate = { quantity, quotas: '5,00' };
    const result = calculateScenario(input);
    assert.equal(result.comparisons.aggregate.quantity.reason, 'invalid_current', quantity);
    assert.equal(result.comparisons.aggregate.quantity.delta, null);
    assert.equal(result.comparisons.aggregate.quotas.delta, '85');
  }
  for (const quotas of ['-1', '5,850', '1.234,50', '3x']) {
    input.current.aggregate = { quantity: '4', quotas };
    const result = calculateScenario(input);
    assert.equal(result.comparisons.aggregate.quotas.reason, 'invalid_current', quotas);
    assert.equal(result.comparisons.aggregate.quotas.delta, null);
    assert.equal(result.comparisons.aggregate.quantity.delta, '1');
  }
  input.current.aggregate = { quantity: '4', quotas: '5,00' };
  for (const quantity of ['', '-1', '1,5']) {
    input.rows[1].quantity = quantity;
    const result = calculateScenario(input);
    assert.equal(result.groups.CCESP.quotaCents, '375');
    assert.equal(result.groups.FCESP.quotaCents, null);
    assert.equal(result.aggregate.quotaCents, null);
    assert.equal(result.comparisons.aggregate.quantity.reason, 'incomplete_proposal');
    assert.equal(result.comparisons.aggregate.quotas.delta, null);
  }
  input.rows = [];
  const result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quantity.reason, 'empty_proposal');
  assert.equal(result.comparisons.aggregate.quotas.delta, null);
});

test('only an explicit arithmetic basis bypasses context and never marks equivalence as confirmed', () => {
  const input = arithmeticFixture();
  for (const basis of [undefined, 'declared-equivalence', 'arithmetic-typo']) {
    input.comparisonBasis = basis;
    const result = calculateScenario(input);
    assert.equal(result.comparisonBasis, 'declared-equivalence');
    assert.equal(result.comparisons.aggregate.quantity.reason, 'incomplete_context');
    assert.equal(result.comparisons.aggregate.quotas.delta, null);
  }
  input.comparisonBasis = 'arithmetic';
  input.context = { ...context, equivalent: false, date: '2026-02-31' };
  const result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quantity.delta, '1');
  assert.equal(result.comparisons.aggregate.quotas.delta, '85');
  assert.equal(result.context.equivalent, false);
  assert.ok(!result.issues.some(({ field }) => field.startsWith('context.')));
});

test('arithmetic export identifies its limited scope, source and exact differences without asserting equivalence', () => {
  const input = arithmeticFixture();
  const result = calculateScenario(input);
  input.comparisonBasis = 'declared-equivalence';
  input.context = { ...context };
  for (const isExample of [false, true]) {
    const summary = buildSummary(input, result, { isExample, generatedAt: '17/09/2026 12:00' });
    assert.match(summary, /Diferenças aritméticas sobre os totais informados/u);
    assert.match(summary, /Natureza e abrangência dos dados não foram validadas/u);
    assert.match(summary, /Postos agregados: atual 4; proposta 5; variação \+1 \(aumento\)/u);
    assert.match(summary, /Cotas agregadas: atual 5,00; proposta 5,85; variação \+0,85 \(aumento\)/u);
    assert.match(summary, /Comparações por grupo: sem base atual por grupo/u);
    assert.match(summary, /Não autoriza compensação entre CCESP e FCESP/u);
    assert.ok(summary.includes(catalogue.sourceUrl));
    assert.ok(summary.includes(catalogue.version));
    assert.doesNotMatch(summary, /Equivalência declarada|confirmada pelo usuário|Equivalência: configuração fictícia|aprovado/u);
    assert.doesNotMatch(summary, /context\.|current\.|rows\.|Origem da base atual|Data da base atual/u);
  }
  const invalid = arithmeticFixture();
  invalid.current.aggregate.quantity = '1.000';
  invalid.current.aggregate.quotas = '';
  const summary = buildSummary(invalid, calculateScenario(invalid));
  assert.match(summary, /Postos agregados: indisponível — base atual inválida; entrada atual inválida: “1\.000”/u);
  assert.match(summary, /Cotas agregadas: indisponível — base atual não informada/u);
  assert.doesNotMatch(summary, /variação \+0|atual informado: 0/u);
});

test('catalogue preserves all 36 independently checked coefficients and FCESP NES', () => {
  assert.deepEqual(catalogue.groups.CCESP.map((item) => item.quotaCents),
    ['100', '125', '150', '175', '200', '225', '250', '275', '300', '325', '350', '400', '450', '550', '600', '700', '800', '900']);
  assert.deepEqual(catalogue.groups.FCESP.map((item) => item.quotaCents),
    ['60', '75', '90', '105', '120', '135', '150', '165', '180', '195', '210', '240', '270', '330', '360', '420', '480', '540']);
  for (const group of ['CCESP', 'FCESP']) {
    assert.deepEqual(catalogue.groups[group].map((item) => item.level), Array.from({ length: 18 }, (_, i) => i + 1));
    assert.ok(Object.isFrozen(catalogue.groups[group][0]));
  }
  assert.match(catalogue.groups.FCESP[17].label, /NES/u);
});

test('exact reference arithmetic and differences preserve species and units', () => {
  const result = calculateScenario(fixture());
  assert.equal(result.status, 'complete');
  assert.equal(result.groups.CCESP.quantity, '3');
  assert.equal(result.groups.CCESP.quotaCents, '375');
  assert.equal(result.groups.FCESP.quantity, '2');
  assert.equal(result.groups.FCESP.quotaCents, '210');
  assert.equal(result.aggregate.quantity, '5');
  assert.equal(result.aggregate.quotaCents, '585');
  assert.equal(result.comparisons.groups.CCESP.quantity.delta, '-1');
  assert.equal(result.comparisons.groups.CCESP.quotas.delta, '-125');
  assert.equal(result.comparisons.groups.FCESP.quantity.delta, '1');
  assert.equal(result.comparisons.groups.FCESP.quotas.delta, '105');
  assert.equal(result.comparisons.groups.CCESP.quotas.direction, 'decrease');
  assert.equal(result.comparisons.groups.FCESP.quotas.direction, 'increase');
  assert.doesNotThrow(() => JSON.stringify(result));
});

test('aggregate comparison has the correct zero, positive and negative signs', () => {
  for (const [quantity, quotas, deltaQuantity, deltaCents] of [
    ['5', '5,85', '0', '0'], ['4', '5,00', '1', '85'], ['6', '7,00', '-1', '-115'],
  ]) {
    const input = fixture();
    input.current = { mode: 'aggregate', aggregate: { quantity, quotas } };
    const result = calculateScenario(input);
    assert.equal(result.comparisons.aggregate.quantity.delta, deltaQuantity);
    assert.equal(result.comparisons.aggregate.quotas.delta, deltaCents);
    assert.equal(result.comparisons.groups.CCESP.quantity.reason, 'no_group_base');
    assert.equal(result.comparisons.groups.FCESP.quotas.delta, null);
  }
});

test('an absent current value is distinct from zero and affects only its measure', () => {
  const input = fixture();
  input.current.groups.CCESP.quotas = '  ';
  let result = calculateScenario(input);
  assert.equal(result.status, 'complete');
  assert.equal(result.comparisons.groups.CCESP.quotas.reason, 'missing_current');
  assert.equal(result.comparisons.groups.CCESP.quotas.delta, null);
  assert.equal(result.comparisons.groups.CCESP.quantity.delta, '-1');
  assert.equal(result.comparisons.groups.FCESP.quotas.delta, '105');
  input.current.groups.CCESP.quotas = '0';
  result = calculateScenario(input);
  assert.equal(result.comparisons.groups.CCESP.quotas.delta, '375');
});

test('invalid current quantity does not invalidate proposal or other comparisons', () => {
  const input = fixture();
  input.current.groups.FCESP.quantity = '2,5';
  const result = calculateScenario(input);
  assert.equal(result.status, 'complete');
  assert.equal(result.comparisons.groups.FCESP.quantity.reason, 'invalid_current');
  assert.equal(result.comparisons.groups.FCESP.quotas.status, 'available');
  assert.equal(result.comparisons.groups.CCESP.quantity.status, 'available');
  assert.ok(result.issues.some((item) => item.field === 'current.groups.FCESP.quantity'));
});

test('context and real date are required only for comparisons', () => {
  for (const replacement of [{ source: '' }, { equivalent: null }, { equivalent: false }, { date: '2026-02-31' }, { date: '0000-01-01' }]) {
    const input = fixture();
    Object.assign(input.context, replacement);
    const result = calculateScenario(input);
    assert.equal(result.status, 'complete');
    assert.equal(result.aggregate.quotaCents, '585');
    assert.equal(result.comparisons.groups.CCESP.quantity.status, 'unavailable');
  }
  const input = fixture();
  input.context.date = '2024-02-29';
  assert.equal(calculateScenario(input).comparisons.groups.CCESP.quantity.status, 'available');
  input.context.date = '2100-02-29';
  assert.equal(calculateScenario(input).comparisons.groups.CCESP.quantity.status, 'unavailable');
  input.current.mode = 'none';
  input.context = {};
  const result = calculateScenario(input);
  assert.equal(result.status, 'complete');
  assert.equal(result.comparisons.groups.CCESP.quantity.reason, 'no_base');
  assert.equal(result.issues.length, 0);
});

test('empty composition is different from an included zero and from an excluded group', () => {
  const empty = calculateScenario({ rows: [] });
  assert.equal(empty.status, 'empty');
  assert.equal(empty.aggregate.quantity, null);
  assert.equal(empty.groups.CCESP.quotaCents, null);
  const zero = calculateScenario({ rows: [{ id: 'z', group: 'CCESP', level: 2, quantity: '0' }] });
  assert.equal(zero.status, 'complete');
  assert.equal(zero.aggregate.quotaCents, '0');
  assert.equal(zero.groups.FCESP.quantity, '0');
  assert.equal(zero.groups.CCESP.rows.length, 1);
});

test('an invalid included row blocks its group and aggregate, but not the other group', () => {
  const input = fixture();
  input.rows[1].quantity = '';
  let result = calculateScenario(input);
  assert.equal(result.status, 'incomplete');
  assert.equal(result.groups.FCESP.quantity, null);
  assert.equal(result.groups.FCESP.quotaCents, null);
  assert.equal(result.aggregate.quotaCents, null);
  assert.equal(result.groups.CCESP.quotaCents, '375');
  assert.equal(result.comparisons.groups.CCESP.quotas.delta, '-125');
  assert.equal(result.comparisons.groups.FCESP.quotas.reason, 'incomplete_proposal');
  input.current = { mode: 'aggregate', aggregate: { quantity: '5', quotas: '5.85' } };
  result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quotas.reason, 'incomplete_proposal');
  input.rows[1].quantity = '2';
  assert.equal(calculateScenario(input).aggregate.quotaCents, '585');
});

test('quantity parser rejects fractions, signs, partial text and exponent without coercion', () => {
  for (const quantity of ['-1', '+1', '1,5', '1.0', '3x', '1e3', 'Infinity', 'NaN', 'Preencher', '1 000', true, {}, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    const input = fixture();
    input.rows[0].quantity = quantity;
    const result = calculateScenario(input);
    assert.equal(result.groups.CCESP.status, 'incomplete', String(quantity));
    assert.equal(result.groups.CCESP.quotaCents, null);
  }
  const input = fixture();
  input.rows[0].quantity = ' 003 ';
  const result = calculateScenario(input);
  assert.equal(result.groups.CCESP.quantity, '3');
  assert.equal(result.groups.CCESP.quotaCents, '375');
});

test('quota input has a deliberate exact grammar with no thousands separator', () => {
  for (const [quotas, expected] of [['1,5', '150'], ['1.50', '150'], ['0', '0'], ['0001,05', '105']]) {
    const input = fixture();
    input.current.groups.CCESP.quotas = quotas;
    assert.equal(calculateScenario(input).comparisons.groups.CCESP.quotas.current, expected);
  }
  for (const quotas of ['1.000', '1.234,50', '1,234.50', ',5', '1,', '1e3', '-1', '+1', '0.001', 1.05]) {
    const input = fixture();
    input.current.groups.CCESP.quotas = quotas;
    assert.equal(calculateScenario(input).comparisons.groups.CCESP.quotas.reason, 'invalid_current', String(quotas));
  }
});

test('invalid levels, duplicate entries and IDs never become a silent sum', () => {
  for (const level of [0, 19, null, '', '2x', 1.5]) {
    const input = fixture();
    input.rows[0].level = level;
    assert.equal(calculateScenario(input).groups.CCESP.quotaCents, null);
  }
  const duplicate = fixture();
  duplicate.rows.push({ id: 'cc2b', group: 'CCESP', level: '02', quantity: '4' });
  let result = calculateScenario(duplicate);
  assert.equal(result.groups.CCESP.quantity, null);
  assert.equal(result.groups.CCESP.rows.filter((row) => row.issues.some(({ code }) => code === 'duplicate_item')).length, 2);
  const sameId = fixture();
  sameId.rows[1].id = sameId.rows[0].id;
  result = calculateScenario(sameId);
  assert.equal(result.groups.CCESP.status, 'incomplete');
  assert.equal(result.groups.FCESP.status, 'incomplete');
});

test('unknown group or malformed row collection blocks all conclusive totals', () => {
  const input = fixture();
  input.rows[1].group = 'UNKNOWN';
  assert.equal(calculateScenario(input).groups.CCESP.quantity, null);
  const result = calculateScenario({ rows: {} });
  assert.equal(result.status, 'incomplete');
  assert.equal(result.aggregate.quotaCents, null);
  assert.ok(result.issues.some(({ code }) => code === 'invalid_rows'));
});

test('the same aggregate does not conceal different group compositions', () => {
  const a = calculateScenario({ rows: [{ id: 'a', group: 'CCESP', level: 3, quantity: '2' }],
    current: { mode: 'aggregate', aggregate: { quantity: '2', quotas: '3' } }, context });
  const b = calculateScenario({ rows: [{ id: 'b', group: 'FCESP', level: 7, quantity: '2' }],
    current: { mode: 'aggregate', aggregate: { quantity: '2', quotas: '3' } }, context });
  assert.equal(a.comparisons.aggregate.quotas.delta, '0');
  assert.equal(b.comparisons.aggregate.quotas.delta, '0');
  assert.equal(a.groups.CCESP.quotaCents, '300');
  assert.equal(b.groups.CCESP.quotaCents, '0');
  assert.equal(a.groups.FCESP.quotaCents, '0');
  assert.equal(b.groups.FCESP.quotaCents, '300');
  assert.equal(a.comparisons.groups.CCESP.quotas.delta, null);
});

test('mode switching ignores inactive values in calculations, issues, and summary', () => {
  const input = fixture();
  input.current.aggregate = { quantity: '99999', quotas: '99999' };
  let result = calculateScenario(input);
  assert.equal(result.comparisons.groups.CCESP.quantity.delta, '-1');
  assert.equal(result.current.aggregate, null);
  assert.doesNotMatch(buildSummary(input, result), /99\.999/u);
  input.current.mode = 'aggregate';
  input.current.aggregate = { quantity: '5', quotas: '5,85' };
  input.current.groups.CCESP.quantity = 'INVALID';
  result = calculateScenario(input);
  assert.equal(result.comparisons.aggregate.quantity.delta, '0');
  assert.deepEqual(result.current.groups, {});
  assert.ok(!result.issues.some(({ field }) => field.includes('current.groups')));
  assert.doesNotMatch(buildSummary(input, result), /INVALID/u);
});

test('no-comparison summary keeps proposal identification and omits inactive base metadata', () => {
  const input = fixture();
  input.current.mode = 'none';
  input.context.nature = 'Ocupação histórica';
  input.context.source = 'Origem anterior desativada';
  input.current.groups.CCESP.quantity = '99999';
  const result = calculateScenario(input);
  for (const isExample of [false, true]) {
    const summary = buildSummary(input, result, { isExample });
    assert.match(summary, /Órgão ou entidade: Órgão fictício/u);
    assert.match(summary, /Abrangência da proposta: Estrutura completa/u);
    assert.match(summary, /Modo da base atual: sem comparação/u);
    assert.doesNotMatch(summary, /Natureza da base atual|Data da base atual|Origem da base atual|Equivalência/u);
    assert.doesNotMatch(summary, /Ocupação histórica|Origem anterior desativada|30\/04\/2026|99\.999/u);
  }
});

test('invalid current text stays in its snapshot and export, with no inferred numeric value', () => {
  const input = fixture();
  input.current.groups.CCESP.quantity = '1.000';
  input.current.groups.FCESP.quotas = '1,234';
  let result = calculateScenario(input);
  input.current.groups.CCESP.quantity = '1000';
  let summary = buildSummary(input, result);
  assert.equal(result.current.groups.CCESP.quantity.enteredValue, '1.000');
  assert.equal(result.current.groups.CCESP.quantity.value, null);
  assert.equal(result.comparisons.groups.CCESP.quantity.delta, null);
  assert.match(summary, /Cargos CCESP: indisponível — base atual inválida; entrada atual inválida: “1\.000”/u);
  assert.match(summary, /Cotas FCESP: indisponível — base atual inválida; entrada atual inválida: “1,234”/u);
  assert.doesNotMatch(summary, /current\.|atual informado: 0/u);
  input.current = { mode: 'aggregate', aggregate: { quantity: '2x', quotas: '5,850' } };
  input.rows[0].quantity = '';
  result = calculateScenario(input);
  summary = buildSummary(input, result);
  assert.match(summary, /Postos agregados: indisponível — composição incompleta; entrada atual inválida: “2x”/u);
  assert.match(summary, /Cotas agregadas: indisponível — composição incompleta; entrada atual inválida: “5,850”/u);
  assert.equal(result.comparisons.aggregate.quotas.delta, null);
});

test('BigInt multiplication and formatting preserve quantities beyond Number safe precision', () => {
  const input = fixture();
  input.rows[0].quantity = '9007199254740993';
  input.rows[1].quantity = '3';
  const result = calculateScenario(input);
  assert.equal(result.groups.CCESP.quantity, '9007199254740993');
  assert.equal(result.groups.CCESP.quotaCents, '1125899906842624125');
  assert.equal(result.aggregate.quotaCents, '1125899906842624440');
  assert.equal(formatInteger(result.groups.CCESP.quantity), '9.007.199.254.740.993');
  assert.equal(formatCents(result.aggregate.quotaCents), '11.258.999.068.426.244,40');
  input.rows[0].quantity = '9'.repeat(128);
  assert.equal(calculateScenario(input).groups.CCESP.status, 'complete');
  input.rows[0].quantity = '9'.repeat(129);
  assert.ok(calculateScenario(input).issues.some(({ code }) => code === 'input_too_long'));
});

test('results are deterministic, serializable, do not mutate input and sum independently of row order', () => {
  const input = fixture();
  const before = structuredClone(input);
  const first = calculateScenario(input);
  assert.deepEqual(calculateScenario(input), first);
  assert.deepEqual(input, before);
  input.rows.reverse();
  const reverse = calculateScenario(input);
  assert.equal(first.aggregate.quotaCents, reverse.aggregate.quotaCents);
  assert.deepEqual(first.comparisons, reverse.comparisons);
  assert.deepEqual(JSON.parse(JSON.stringify(first)), first);
});

test('display formatting preserves minus, positive signs, cents, zero and absence', () => {
  assert.equal(formatInteger('-1', { signed: true }), '−1');
  assert.equal(formatInteger('1', { signed: true }), '+1');
  assert.equal(formatCents('-125', { signed: true }), '−1,25');
  assert.equal(formatCents('105', { signed: true }), '+1,05');
  assert.equal(formatCents('0', { signed: true }), '0,00');
  assert.equal(formatCents('-0'), '0,00');
  assert.equal(formatCents(null), '—');
  assert.equal(formatCents(1.5), '—');
  assert.equal(formatInteger('1x'), '—');
});

test('summary uses the screen snapshot, correct units, version, example flag and supplied generation time', () => {
  const input = fixture();
  input.context.organization = 'Órgão <piloto> & teste';
  const result = calculateScenario(input);
  input.rows[0].quantity = '999';
  input.context.organization = 'changed later';
  const summary = buildSummary(input, result, { isExample: true, generatedAt: '14/09/2026 15:00' });
  assert.match(summary, /EXEMPLO FICTÍCIO/u);
  assert.match(summary, /Equivalência: configuração fictícia de demonstração/u);
  assert.doesNotMatch(summary, /confirmada pelo usuário|Versão do motor/u);
  assert.match(summary, /Gerado em: 14\/09\/2026 15:00/u);
  assert.match(summary, /Órgão <piloto> & teste/u);
  assert.match(summary, /Nível 2: 3 × 1,25 = 3,75 cotas/u);
  assert.match(summary, /Cargos CCESP: atual 4; proposta 3; variação −1/u);
  assert.match(summary, /Cotas FCESP: atual 1,05; proposta 2,10; variação \+1,05/u);
  assert.ok(summary.includes(catalogue.version));
  assert.ok(summary.includes(catalogue.sourceUrl));
  assert.doesNotMatch(summary, /999|changed later|aprovado/u);
  assert.match(buildSummary(input, result), /Equivalência declarada: confirmada pelo usuário/u);
});

test('incomplete summary retains pending entries and never labels a partial subtotal as complete', () => {
  const input = fixture();
  input.rows[1].quantity = '';
  input.context.organization = '';
  input.current.groups.CCESP.quotas = '';
  const result = calculateScenario(input);
  const summary = buildSummary(input, result);
  assert.match(summary, /RASCUNHO INCOMPLETO/u);
  assert.match(summary, /Total FCESP: indisponível/u);
  assert.match(summary, /Total CCESP: 3 cargos; 3,75 cotas/u);
  assert.match(summary, /FCESP, nível 4: Informe a quantidade deste item/u);
  assert.match(summary, /Informe o órgão ou a entidade da base atual/u);
  assert.match(summary, /Cotas atuais CCESP: Base atual não informada/u);
  assert.doesNotMatch(summary, /rows\.|context\.|current\.|Versão do motor/u);
  assert.doesNotMatch(summary, /Total geral descritivo/u);
});

test('invalid comparison mode cannot accidentally activate a stored base', () => {
  const input = fixture();
  input.current.mode = 'something_else';
  const result = calculateScenario(input);
  assert.equal(result.status, 'complete');
  assert.equal(result.comparisons.groups.CCESP.quantity.reason, 'invalid_mode');
  assert.equal(result.comparisons.groups.CCESP.quantity.delta, null);
  assert.ok(result.issues.some(({ code }) => code === 'invalid_mode'));
});
