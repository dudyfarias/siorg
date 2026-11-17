import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScenario, catalogue } from '../src/calculator.mjs';
import { calculateOrganizationImpact, buildScopedSummary } from '../src/scenario.mjs';
import { getCalculatorOrganization, getCalculatorScope, freshCalculatorReferenceRows } from '../src/organization-profiles.mjs';

// Synthetic, non-institutional fixtures. No totals here describe a real secretariat.
function fixture() {
  const version = 'synthetic-v1';
  const reference = (quantity, quotas, ccQuantity, ccQuotas, fcQuantity, fcQuotas) => ({
    version, nature: 'authorized', quantity, quotas,
    groups: { CCESP: { quantity: ccQuantity, quotas: ccQuotas }, FCESP: { quantity: fcQuantity, quotas: fcQuotas } },
    rows: [],
  });
  const whole = { id: 'all', organizationId: 'synthetic', name: 'Toda a secretaria', scopeLabel: 'Toda a estrutura da secretaria fictícia',
    status: 'verified', version, coverage: 'whole', parentScopeId: null,
    sourceLabel: 'Quadro sintético A', sourceUrl: 'https://example.invalid/a', checkedAt: '2026-09-24',
    reference: reference('15', '15.50', '10', '12.50', '5', '3.00') };
  const scope = { ...whole, id: 'unit', name: 'Unidade fictícia', scopeLabel: 'Somente postos diretos da unidade fictícia',
    coverage: 'unit', parentScopeId: 'all', sourceLabel: 'Quadro sintético B',
    reference: reference('3', '3.10', '2', '2.50', '1', '0.60') };
  const organization = { id: 'synthetic', name: 'Secretaria fictícia', shortName: 'Fictícia', status: 'verified',
    notice: '', version, units: [whole, scope], sourceLabel: 'Quadro sintético A', sourceUrl: whole.sourceUrl, checkedAt: '2026-09-24' };
  const input = { rows: [{ id: 'cc', group: 'CCESP', level: 2, quantity: '3' }, { id: 'fc', group: 'FCESP', level: 1, quantity: '2' }],
    current: { mode: 'aggregate', aggregate: { quantity: '3', quotas: '3.10' } }, comparisonBasis: 'arithmetic' };
  return { organization, scope, input, result: calculateScenario(input), baselineOrigin: 'reference' };
}

function documentaryFixture() {
  const data = fixture();
  data.baselineOrigin = 'documentary';
  data.organization.status = 'conflict';
  data.organization.notice = 'Divergência sintética entre os Anexos II e III.';
  for (const scope of data.organization.units) {
    scope.status = 'conflict';
    scope.sourceLabel = 'Decreto sintético — Anexo II';
    scope.sourceUrl = `https://example.invalid/annex-ii/${scope.id}`;
    Object.assign(scope.reference, { nature: 'published-distribution', sourceAnnex: 'II',
      conflictingAnnex: 'III', reconciliationStatus: 'conflict' });
  }
  return data;
}

test('verified unit replacement preserves the rest and calculates exact totals per species', () => {
  const result = calculateOrganizationImpact(fixture());
  assert.equal(result.status, 'available');
  assert.equal(result.groups.CCESP.quantity, '11');
  assert.equal(result.groups.CCESP.quotaCents, '1375');
  assert.equal(result.groups.CCESP.remainingQuantity, '8');
  assert.equal(result.groups.CCESP.remainingQuotaCents, '1000');
  assert.equal(result.groups.FCESP.quantity, '6');
  assert.equal(result.groups.FCESP.quotaCents, '360');
  assert.equal(result.aggregate.quantity, '17');
  assert.equal(result.aggregate.quotaCents, '1735');
  assert.equal(result.aggregate.deltaQuantity, '2');
  assert.equal(result.aggregate.deltaQuotaCents, '185');
  assert.doesNotThrow(() => JSON.stringify(result));
});

test('whole-secretariat replacement returns the proposal with no unchanged remainder', () => {
  const data = fixture();
  data.scope = data.organization.units[0];
  data.input.current.aggregate = { quantity: '15', quotas: '15.50' };
  data.result = calculateScenario(data.input);
  const result = calculateOrganizationImpact(data);
  assert.equal(result.status, 'available');
  assert.equal(result.aggregate.quantity, '5');
  assert.equal(result.aggregate.quotaCents, '495');
  assert.equal(result.aggregate.remainingQuantity, '0');
  assert.equal(result.aggregate.remainingQuotaCents, '0');
  assert.equal(result.aggregate.deltaQuantity, '-10');
  assert.equal(result.aggregate.deltaQuotaCents, '-1055');
});

test('manual origins, custom or partial scopes, and unverified/conflicting organizations never produce impact', () => {
  for (const baselineOrigin of ['manual', 'manual-from-reference', undefined]) {
    const result = calculateOrganizationImpact({ ...fixture(), baselineOrigin });
    assert.equal(result.reason, 'manual_baseline');
    assert.equal(result.aggregate, null);
  }
  for (const status of ['pending', 'conflict', 'partial', undefined]) {
    const data = fixture();
    data.organization.status = status;
    assert.equal(calculateOrganizationImpact(data).reason, 'organization_unverified');
  }
  for (const change of [{ coverage: 'custom' }, { status: 'partial' }, { status: 'pending' }, { status: 'conflict' }]) {
    const data = fixture();
    Object.assign(data.scope, change);
    const impact = calculateOrganizationImpact(data);
    assert.equal(impact.status, 'unavailable');
    assert.equal(impact.groups, null);
  }
});

test('scope membership and profile/reference version are checked independently of matching totals', () => {
  for (const mutate of [
    (data) => { data.scope = { ...data.scope, organizationId: 'another-secretariat' }; },
    (data) => { data.scope = { ...data.scope, id: 'unknown' }; },
    (data) => { data.scope.parentScopeId = 'other-unit'; },
    (data) => { data.organization.units.push({ ...data.scope }); },
    (data) => { data.scope.version = 'old'; },
    (data) => { data.scope.reference.version = 'old'; },
    (data) => { data.organization.units[0].reference.version = 'old'; },
    (data) => { data.organization.units[0].status = 'pending'; },
  ]) {
    const data = fixture(); mutate(data);
    assert.equal(calculateOrganizationImpact(data).status, 'unavailable');
  }
  const data = fixture();
  data.scope = structuredClone(data.scope);
  assert.equal(calculateOrganizationImpact(data).status, 'available');
  data.scope.reference.groups.CCESP.quantity = '3';
  data.scope.reference.quantity = '4';
  assert.equal(calculateOrganizationImpact(data).reason, 'scope_mismatch');
});

test('missing/negative reference values and unreconciled totals do not become zero or an impact', () => {
  for (const mutate of [
    (data) => { data.scope.reference = null; },
    (data) => { data.scope.reference.groups.FCESP.quotas = null; },
    (data) => { data.scope.reference.groups.CCESP.quantity = ''; },
    (data) => { data.scope.reference.groups.CCESP.quotas = '-1.00'; },
    (data) => { data.scope.reference.groups.CCESP.quantity = '-1'; },
    (data) => { data.scope.reference.quotas = '3.11'; },
    (data) => { data.scope.reference.nature = 'occupied'; },
  ]) {
    const data = fixture(); mutate(data);
    const result = calculateOrganizationImpact(data);
    assert.equal(result.status, 'unavailable');
    assert.equal(result.aggregate, null);
  }
});

test('scope cannot exceed the whole in one species, even when the aggregate could offset it', () => {
  const data = fixture();
  data.scope.reference.groups.CCESP = { quantity: '11', quotas: '13.75' };
  data.scope.reference.groups.FCESP = { quantity: '0', quotas: '0.00' };
  data.scope.reference.quantity = '11';
  data.scope.reference.quotas = '13.75';
  assert.equal(calculateOrganizationImpact(data).reason, 'scope_not_contained');
});

test('empty/incomplete proposals and inconsistent result totals remain unavailable', () => {
  for (const quantity of ['', '-1', '1,5']) {
    const data = fixture();
    data.input.rows[0].quantity = quantity;
    data.result = calculateScenario(data.input);
    assert.equal(calculateOrganizationImpact(data).reason, 'incomplete_proposal');
  }
  const data = fixture();
  data.result.aggregate.quantity = '999';
  assert.equal(calculateOrganizationImpact(data).reason, 'invalid_proposal');
  data.result = calculateScenario({ ...data.input, rows: [] });
  assert.equal(calculateOrganizationImpact(data).reason, 'incomplete_proposal');
  data.result = calculateScenario(data.input);
  data.result.catalogueVersion = `${catalogue.version}-other`;
  assert.equal(calculateOrganizationImpact(data).reason, 'catalogue_mismatch');
});

test('active baseline must match the selected reference, including grouped inputs', () => {
  for (const aggregate of [{ quantity: '4', quotas: '3.10' }, { quantity: '3', quotas: '' }, { quantity: '3', quotas: '3.11' }]) {
    const data = fixture();
    data.input.current.aggregate = aggregate;
    data.result = calculateScenario(data.input);
    assert.equal(calculateOrganizationImpact(data).reason, 'baseline_mismatch');
  }
  const data = fixture();
  data.input.current = { mode: 'group', groups: { CCESP: { quantity: '2', quotas: '2.50' }, FCESP: { quantity: '1', quotas: '0.60' } } };
  data.result = calculateScenario(data.input);
  assert.equal(calculateOrganizationImpact(data).status, 'available');
  data.input.current.groups.FCESP.quantity = '';
  data.result = calculateScenario(data.input);
  assert.equal(calculateOrganizationImpact(data).reason, 'baseline_mismatch');
});

test('explicit zero replacement is valid and quantities above Number precision remain exact', () => {
  const data = fixture();
  data.input.rows.forEach((row) => { row.quantity = '0'; });
  data.result = calculateScenario(data.input);
  let impact = calculateOrganizationImpact(data);
  assert.equal(impact.aggregate.quantity, '12');
  assert.equal(impact.aggregate.quotaCents, '1240');
  data.input.rows[0].quantity = '9007199254740993';
  data.result = calculateScenario(data.input);
  impact = calculateOrganizationImpact(data);
  assert.equal(impact.groups.CCESP.quantity, '9007199254741001');
  assert.equal(impact.groups.CCESP.quotaCents, '1125899906842625125');
});

test('calculating and exporting does not mutate profile, scope, input or result', () => {
  const data = fixture();
  const before = structuredClone(data);
  const impact = calculateOrganizationImpact(data);
  buildScopedSummary({ ...data, impact });
  assert.deepEqual(data, before);
  assert.deepEqual(calculateOrganizationImpact(data), impact);
});

test('reference summary identifies scope, decree/version and labels base as authorized', () => {
  const data = fixture();
  const summary = buildScopedSummary({ ...data, isExample: true, generatedAt: '24/09/2026 12:00' });
  assert.match(summary, /Secretaria: Secretaria fictícia/u);
  assert.match(summary, /Unidade: Unidade fictícia/u);
  assert.match(summary, /Abrangência: Somente postos diretos/u);
  assert.match(summary, /Origem da base: referência autorizada do recorte/u);
  assert.match(summary, /Decreto\/quadro da base: Quadro sintético B/u);
  assert.match(summary, /Versão do perfil: synthetic-v1/u);
  assert.match(summary, /EXEMPLO FICTÍCIO/u);
  assert.match(summary, /VARIAÇÃO EM RELAÇÃO À BASE AUTORIZADA DO RECORTE/u);
  assert.match(summary, /Postos agregados: base autorizada 3; proposta 5; variação \+2/u);
  assert.match(summary, /CCESP — quantidade: 10 − 2 \+ 3 = 11/u);
  assert.match(summary, /Total estimado descritivo: 17 postos; 17,35 cotas/u);
  assert.match(summary, /não informam, por si, a ocupação atual/u);
  assert.doesNotMatch(summary, /SITUAÇÃO ATUAL INFORMADA|: atual |confirmada pelo usuário/u);
});

test('manual and pending summaries preserve entered values without falsely labeling them normative', () => {
  const data = fixture();
  data.baselineOrigin = 'manual';
  data.organization.status = 'conflict';
  data.organization.notice = 'Divergência entre os quadros sintéticos.';
  data.scope = { ...data.scope, id: 'custom', status: 'pending', coverage: 'custom', reference: null };
  const summary = buildScopedSummary({ ...data, scopeName: 'Unidade <informada> & teste' });
  assert.match(summary, /Unidade: Unidade <informada> & teste/u);
  assert.match(summary, /Origem da base: valores informados manualmente/u);
  assert.match(summary, /Divergência entre os quadros sintéticos/u);
  assert.match(summary, /Postos agregados: atual 3; proposta 5; variação \+2/u);
  assert.match(summary, /Não calculado:/u);
  assert.doesNotMatch(summary, /Origem da base: referência autorizada|Total estimado descritivo:/u);
});

test('summary discards a stale impact cache and does not relabel a mismatching manual value as authorized', () => {
  const data = fixture();
  const impact = calculateOrganizationImpact(data);
  data.input.current.aggregate.quantity = '999';
  data.result = calculateScenario(data.input);
  const summary = buildScopedSummary({ ...data, impact });
  assert.match(summary, /referência solicitada, sem correspondência verificada/u);
  assert.match(summary, /Não calculado: Os valores usados na comparação não correspondem/u);
  assert.doesNotMatch(summary, /Total estimado descritivo: 17|Postos agregados: base autorizada/u);
});

test('example origin remains explicitly fictitious and never creates official-reference impact', () => {
  const data = { ...fixture(), baselineOrigin: 'example' };
  const summary = buildScopedSummary({ ...data, generatedAt: '24/09/2026 12:00' });
  assert.equal(calculateOrganizationImpact(data).status, 'unavailable');
  assert.match(summary, /Origem da base: exemplo fictício, sem base oficial/u);
  assert.match(summary, /EXEMPLO FICTÍCIO/u);
  assert.match(summary, /24\/09\/2026 12:00/u);
  assert.doesNotMatch(summary, /Total estimado descritivo:|Origem da base: referência autorizada/u);
});

test('documentary baseline is identified by its own source and never permits consolidated impact', () => {
  const data = documentaryFixture();
  const before = structuredClone(data);
  const impact = calculateOrganizationImpact(data);
  assert.equal(impact.status, 'unavailable');
  assert.equal(impact.reason, 'documentary_conflict');
  assert.equal(impact.groups, null);
  assert.equal(impact.aggregate, null);
  const summary = buildScopedSummary({ ...data, impact });
  assert.match(summary, /Origem da base: base documental do Anexo II/u);
  assert.match(summary, /Decreto\/quadro da base: Decreto sintético — Anexo II/u);
  assert.match(summary, /Fonte do perfil: https:\/\/example\.invalid\/annex-ii\/unit/u);
  assert.match(summary, /Modo da base do quadro: agregado/u);
  assert.match(summary, /Postos agregados: base do quadro 3; proposta 5; variação \+2/u);
  assert.match(summary, /Cotas agregadas: base do quadro 3,10; proposta 4,95; variação \+1,85/u);
  assert.match(summary, /divergência entre o Anexo II e o Anexo III; o total da secretaria não está reconciliado/u);
  assert.doesNotMatch(summary, /valores manuais|informados manualmente|base autorizada|Total estimado descritivo:|: atual /u);
  assert.deepEqual(data, before);

  data.scope = data.organization.units[0];
  data.input.current.aggregate = { quantity: '15', quotas: '15.50' };
  data.result = calculateScenario(data.input);
  assert.equal(calculateOrganizationImpact(data).reason, 'documentary_conflict');
});

test('documentary labels require coherent provenance, membership, versions and internally reconciled totals', () => {
  for (const mutate of [
    (data) => { data.scope.reference.nature = 'authorized'; },
    (data) => { delete data.scope.reference.sourceAnnex; },
    (data) => { data.scope.reference.sourceAnnex = 'III'; },
    (data) => { data.scope.reference.conflictingAnnex = ''; },
    (data) => { data.scope.reference.reconciliationStatus = 'verified'; },
    (data) => { data.scope.reference.version = 'old'; },
    (data) => { data.scope.version = 'old'; },
    (data) => { data.scope.reference.groups.FCESP.quantity = null; },
    (data) => { data.scope.reference.quotas = '3.11'; },
    (data) => { data.scope.reference.groups.CCESP.quotas = '-2.50'; },
    (data) => { data.scope.sourceUrl = ''; },
    (data) => { data.scope = { ...data.scope, id: 'unknown' }; },
    (data) => { data.scope = { ...data.scope, organizationId: 'another' }; },
    (data) => { data.organization.status = 'verified'; },
    (data) => { data.scope.status = 'pending'; },
    (data) => { data.scope.coverage = 'custom'; },
  ]) {
    const data = documentaryFixture(); mutate(data);
    assert.equal(calculateOrganizationImpact(data).status, 'unavailable');
    const summary = buildScopedSummary(data);
    assert.match(summary, /base documental solicitada, sem correspondência verificada/u);
    assert.doesNotMatch(summary, /Postos agregados: base do quadro|Total estimado descritivo:|base autorizada/u);
  }
});

test('edited, absent or zero documentary inputs are not mislabeled as values from the table', () => {
  for (const aggregate of [{ quantity: '4', quotas: '3.10' }, { quantity: '', quotas: '3.10' },
    { quantity: '3', quotas: '' }, { quantity: '0', quotas: '0' }]) {
    const data = documentaryFixture();
    data.input.current.aggregate = aggregate;
    data.result = calculateScenario(data.input);
    assert.equal(calculateOrganizationImpact(data).reason, 'baseline_mismatch');
    const summary = buildScopedSummary(data);
    assert.match(summary, /base documental solicitada, sem correspondência verificada/u);
    assert.doesNotMatch(summary, /Postos agregados: base do quadro|Origem da base: base documental do Anexo II/u);
  }
  const data = documentaryFixture();
  data.baselineOrigin = 'manual';
  assert.equal(calculateOrganizationImpact(data).reason, 'manual_baseline');
  assert.match(buildScopedSummary(data), /Origem da base: valores informados manualmente/u);
});

test('a matching documentary baseline survives incomplete proposal and grouped comparisons without granting impact', () => {
  const data = documentaryFixture();
  data.input.current = { mode: 'group', groups: { CCESP: { quantity: '2', quotas: '2.50' }, FCESP: { quantity: '1', quotas: '0.60' } } };
  data.input.rows[0].quantity = '';
  data.result = calculateScenario(data.input);
  assert.equal(calculateOrganizationImpact(data).reason, 'documentary_conflict');
  const summary = buildScopedSummary(data);
  assert.match(summary, /RASCUNHO INCOMPLETO/u);
  assert.match(summary, /Cargos CCESP: indisponível[^\n]+; base do quadro: 2/u);
  assert.match(summary, /Funções FCESP: base do quadro 1; proposta 2/u);
  assert.doesNotMatch(summary, /Total estimado descritivo:|: atual |base autorizada/u);
});

function calculatorDocumentaryFixture(scopeId) {
  const organization = getCalculatorOrganization('sggd'), scope = getCalculatorScope('sggd', scopeId);
  const input = { rows: freshCalculatorReferenceRows(scope), comparisonBasis: 'arithmetic',
    current: { mode: 'group', groups: structuredClone(scope.reference.groups) } };
  return { organization, scope, input, result: calculateScenario(input), baselineOrigin: 'documentary' };
}

test('calculator whole SGGD summary names Annex III, uses its exact baseline and never consolidates the conflict', () => {
  const data = calculatorDocumentaryFixture('all');
  assert.notEqual(data.organization.version, data.scope.version);
  assert.equal(data.result.aggregate.quantity, '499');
  assert.equal(data.result.aggregate.quotaCents, '141535');
  const impact = calculateOrganizationImpact(data);
  assert.equal(impact.reason, 'documentary_conflict');
  assert.equal(impact.aggregate, null);
  const summary = buildScopedSummary(data);
  assert.match(summary, /Origem da base: base documental do Anexo III/u);
  assert.match(summary, /VARIAÇÃO EM RELAÇÃO À BASE DO QUADRO — ANEXO III/u);
  assert.match(summary, /base do quadro publicado no Anexo III\. A divergência com o Anexo II permanece/u);
  assert.match(summary, /Postos agregados: base do quadro 499; proposta 499; variação 0/u);
  assert.match(summary, /Cotas agregadas: base do quadro 1\.415,35; proposta 1\.415,35; variação 0,00/u);
  assert.ok(summary.includes(`Fonte do perfil: ${data.scope.sourceUrl}`));
  assert.ok(summary.includes(`Versão do recorte: ${data.scope.reference.version}`));
  assert.doesNotMatch(summary, /Origem da base: base documental do Anexo II,|base do quadro publicado no Anexo II\.|Total estimado descritivo:|base autorizada/u);
});

test('calculator units retain Annex II allocation provenance and compare projected availability with Annex III limits', () => {
  const data = calculatorDocumentaryFixture('diretoria-modernizacao-organizacional');
  assert.notEqual(data.organization.version, data.scope.version);
  assert.equal(data.result.aggregate.quantity, '7');
  assert.equal(data.result.aggregate.quotaCents, '2470');
  assert.equal(calculateOrganizationImpact(data).reason, 'documentary_conflict');
  const summary = buildScopedSummary(data);
  assert.match(summary, /Origem da base local: alocação documental do Anexo II/u);
  assert.match(summary, /Comparação local com a alocação do Anexo II\. O limite da secretaria é identificado separadamente no Anexo III/u);
  assert.match(summary, /Postos agregados: alocação do Anexo II 7; proposta 7; variação 0/u);
  assert.match(summary, /DISPONIBILIDADE APÓS A PROPOSTA — SECRETARIA/u);
  assert.doesNotMatch(summary, /Origem da base: base documental do Anexo III|Total estimado descritivo:|IMPACTO ARITMÉTICO NA SECRETARIA/u);
});

test('documentary scenario rejects supplied annex/version substitutions even when totals still match', () => {
  for (const mutate of [
    (scope) => { scope.version += '-stale'; scope.reference.version = scope.version; },
    (scope) => { scope.reference.version += '-stale'; },
    (scope) => { scope.reference.nature = 'published-distribution'; scope.reference.sourceAnnex = 'II'; scope.reference.conflictingAnnex = 'III'; },
    (scope) => { scope.reference.sourceAnnex = 'II'; },
    (scope) => { scope.reference.nature = 'authorized'; },
    (scope) => { scope.sourceUrl = 'https://example.invalid/other-source'; },
    (scope) => { scope.sourceLabel = 'Outro quadro'; },
  ]) {
    const data = calculatorDocumentaryFixture('all');
    data.scope = structuredClone(data.scope); mutate(data.scope);
    const impact = calculateOrganizationImpact(data);
    assert.equal(impact.status, 'unavailable');
    assert.notEqual(impact.reason, 'documentary_conflict', 'the supplied reference is not a verified documentary match');
    const summary = buildScopedSummary(data);
    assert.match(summary, /base documental solicitada, sem correspondência verificada/u);
    assert.doesNotMatch(summary, /Postos agregados: base do quadro|Total estimado descritivo:/u);
  }
  const data = calculatorDocumentaryFixture('all');
  data.scope = structuredClone(data.scope);
  assert.equal(calculateOrganizationImpact(data).reason, 'documentary_conflict');
});
