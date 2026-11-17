import { catalogue } from './calculator.mjs';
import { getOrganization, getScope, getCalculatorOrganization, getCalculatorScope } from './organization-profiles.mjs';
import { evaluateReferenceBalance } from './reference-balance.mjs';

const GROUPS = ['CCESP', 'FCESP'];
const MESSAGES = {
  availability_unverified: 'A relação entre limite e alocação ainda não foi definida para esta secretaria.',
  baseline_origin_unavailable: 'A disponibilidade automática exige a base documental; valores manuais e exemplos mantêm apenas a comparação local.',
  scope_unavailable: 'O recorte não possui uma alocação documental aplicável à secretaria.',
  reference_unavailable: 'As referências de limite e alocação estão ausentes ou não correspondem às versões esperadas.',
  invalid_reference: 'Os totais das referências não conferem por espécie.',
  scope_not_contained: 'A alocação da unidade não pode superar a alocação total da mesma espécie.',
  baseline_mismatch: 'A base do cálculo deve corresponder à alocação do Anexo II deste recorte, separada por espécie.',
};

const integer = (value) => typeof value === 'string' && /^\d+$/u.test(value) ? BigInt(value) : null;
function cents(value) {
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/u.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}

function totals(source, reference = false) {
  const read = (entry) => ({ quantity: integer(entry?.quantity), quotaCents: reference ? cents(entry?.quotas) : integer(entry?.quotaCents) });
  const groups = Object.fromEntries(GROUPS.map((group) => [group, read(source?.groups?.[group])]));
  const aggregate = read(reference ? source : source?.aggregate);
  if ([aggregate, ...Object.values(groups)].some((entry) => entry.quantity === null || entry.quotaCents === null)) return null;
  if (aggregate.quantity !== groups.CCESP.quantity + groups.FCESP.quantity ||
      aggregate.quotaCents !== groups.CCESP.quotaCents + groups.FCESP.quotaCents) return null;
  return { groups, aggregate };
}

function serializeTotals(value) {
  const serialize = (entry) => ({ quantity: entry.quantity.toString(), quotaCents: entry.quotaCents.toString() });
  return { groups: Object.fromEntries(GROUPS.map((group) => [group, serialize(value.groups[group])])), aggregate: serialize(value.aggregate) };
}

function sourceInfo(scope) {
  return { label: scope.sourceLabel, url: scope.sourceUrl, version: scope.version, annex: scope.reference.sourceAnnex };
}

function unavailable(reason, scopeKind = null) {
  return { status: 'unavailable', reason, message: MESSAGES[reason], scopeKind,
    limits: null, allocated: null, projected: null, proposalStatus: 'pending',
    currentBalance: null, proposedBalance: null, comparisonResult: null, sourceLabels: null };
}

function referenceIs(scope, organizationId, version, nature, annex) {
  return scope?.organizationId === organizationId && ['conflict', 'verified'].includes(scope.status)
    && scope.version === version && scope.reference?.version === version
    && scope.reference.nature === nature && scope.reference.sourceAnnex === annex
    && typeof scope.sourceLabel === 'string' && !!scope.sourceLabel.trim()
    && typeof scope.sourceUrl === 'string' && !!scope.sourceUrl.trim();
}

function baselineMatches(result, scope) {
  if (result?.current?.mode !== 'group') return false;
  return GROUPS.every((group) => ['quantity', 'quotas'].every((measure) => {
    const field = result.current.groups?.[group]?.[measure];
    return field?.status === 'valid' && integer(field.value) === scope.groups[group][measure === 'quotas' ? 'quotaCents' : 'quantity'];
  }));
}

function comparison(current, proposed, reason) {
  if (reason) return { status: 'unavailable', reason, current, proposed: null, delta: null, direction: null };
  const delta = BigInt(proposed) - BigInt(current);
  return { status: 'available', reason: null, current, proposed, delta: delta.toString(),
    direction: delta > 0n ? 'increase' : delta < 0n ? 'decrease' : 'unchanged' };
}

// A minimal calculator-compatible snapshot. No aggregate balance is created:
// evaluateReferenceBalance reads only the four independent group comparisons.
function comparisonSnapshot(limits, projected, reason = null) {
  const status = projected ? 'complete' : reason === 'empty_proposal' ? 'empty' : 'incomplete';
  const groupResult = (entry) => ({ status, quantity: entry?.quantity ?? null, quotaCents: entry?.quotaCents ?? null, rows: [] });
  const compare = (base, target) => ({
    quantity: comparison(base.quantity, target?.quantity, reason),
    quotas: comparison(base.quotaCents, target?.quotaCents, reason),
  });
  return { status, comparisonBasis: 'arithmetic',
    groups: Object.fromEntries(GROUPS.map((group) => [group, groupResult(projected?.groups[group])])),
    aggregate: groupResult(projected?.aggregate),
    comparisons: { mode: 'group',
      groups: Object.fromEntries(GROUPS.map((group) => [group, compare(limits.groups[group], projected?.groups[group])])),
      aggregate: compare(limits.aggregate, projected?.aggregate),
    },
  };
}

/** Whole-organization comparison against a separately labelled agency reference. */
export function calculateAgencyAvailability(base, result, eligible) {
  const cap = totals(base?.limits?.totals);
  const baseline = totals(base?.totals);
  if (!eligible || !cap || !baseline) return unavailable('invalid_reference', 'whole');
  const limits = serializeTotals(cap), allocated = serializeTotals(baseline);
  const proposed = result.status === 'complete' && result.aggregate?.status === 'complete' ? totals(result) : null;
  const projected = proposed ? serializeTotals(proposed) : null;
  const comparisonResult = comparisonSnapshot(limits, projected, projected ? null : 'incomplete_proposal');
  return {
    status: 'available', reason: null, message: 'Saldo = referência do órgão menos proposta, por espécie e medida.',
    scopeKind: 'whole', limits, allocated, projected, proposalStatus: projected ? 'complete' : 'pending',
    currentBalance: evaluateReferenceBalance(comparisonSnapshot(limits, allocated)),
    proposedBalance: evaluateReferenceBalance(comparisonResult), comparisonResult,
    sourceLabels: { limits: base.limits.source, allocated: base.allocationSource },
  };
}

/**
 * Business definition supplied for this prototype: SGGD Annex III is the limit;
 * Annex II is the allocated structure. Their difference is availability, per species.
 * Source numbers remain unchanged. This arithmetic does not imply technical homologation.
 */
export function calculateQuotaAvailability({ organizationId, scopeId, baselineOrigin, result } = {}) {
  if (organizationId !== 'sggd') return unavailable('availability_unverified');
  if (baselineOrigin !== 'documentary') return unavailable('baseline_origin_unavailable');
  const organization = getOrganization(organizationId), calculatorOrganization = getCalculatorOrganization(organizationId);
  const limitScope = getCalculatorScope(organizationId, 'all');
  const allocatedScope = getScope(organizationId, 'all'), selected = getScope(organizationId, scopeId);
  if (!selected || !organization?.units.includes(selected) || !['whole', 'unit'].includes(selected.coverage)
      || selected.id === 'all' && (selected.coverage !== 'whole' || selected.parentScopeId !== null)
      || selected.id !== 'all' && (selected.coverage !== 'unit' || selected.parentScopeId !== 'all')) return unavailable('scope_unavailable');
  const scopeKind = selected.coverage;
  const decreeVersion = calculatorOrganization?.version;
  if (!decreeVersion || !referenceIs(limitScope, organizationId, `${decreeVersion}-anexo-III`, 'published-summary', 'III')
      || !referenceIs(allocatedScope, organizationId, `${decreeVersion}-anexo-II`, 'published-distribution', 'II')
      || !referenceIs(selected, organizationId, allocatedScope.version, 'published-distribution', 'II')
      || limitScope.coverage !== 'whole' || allocatedScope.coverage !== 'whole'
      || organization.version !== allocatedScope.version) return unavailable('reference_unavailable', scopeKind);
  const limitTotals = totals(limitScope.reference, true), allocatedTotals = totals(allocatedScope.reference, true), scopeTotals = totals(selected.reference, true);
  if (!limitTotals || !allocatedTotals || !scopeTotals) return unavailable('invalid_reference', scopeKind);
  if (GROUPS.some((group) => scopeTotals.groups[group].quantity > allocatedTotals.groups[group].quantity
      || scopeTotals.groups[group].quotaCents > allocatedTotals.groups[group].quotaCents)) return unavailable('scope_not_contained', scopeKind);
  if (!baselineMatches(result, scopeTotals)) return unavailable('baseline_mismatch', scopeKind);

  const limits = serializeTotals(limitTotals), allocated = serializeTotals(allocatedTotals);
  const currentBalance = evaluateReferenceBalance(comparisonSnapshot(limits, allocated));
  let proposalReason = result.catalogueVersion !== catalogue.version ? 'catalogue_mismatch'
    : result.status === 'empty' ? 'empty_proposal'
      : result.status !== 'complete' || result.aggregate?.status !== 'complete'
        || GROUPS.some((group) => result.groups?.[group]?.status !== 'complete') ? 'incomplete_proposal' : null;
  const proposal = proposalReason ? null : totals(result);
  if (!proposalReason && !proposal) proposalReason = 'invalid_proposal';
  let projected = null;
  if (proposal) {
    const groups = Object.fromEntries(GROUPS.map((group) => [group, {
      quantity: allocatedTotals.groups[group].quantity - scopeTotals.groups[group].quantity + proposal.groups[group].quantity,
      quotaCents: allocatedTotals.groups[group].quotaCents - scopeTotals.groups[group].quotaCents + proposal.groups[group].quotaCents,
    }]));
    projected = serializeTotals({ groups, aggregate: {
      quantity: groups.CCESP.quantity + groups.FCESP.quantity,
      quotaCents: groups.CCESP.quotaCents + groups.FCESP.quotaCents,
    } });
  }
  const comparisonResult = comparisonSnapshot(limits, projected, proposalReason);
  return { status: 'available', reason: null,
    message: scopeKind === 'whole'
      ? 'Anexo III: limite da secretaria. Anexo II: estrutura alocada. A proposta substitui a composição completa da secretaria.'
      : 'Anexo III: limite da secretaria. A projeção substitui somente a unidade do Anexo II pela proposta; o restante da alocação é mantido.',
    scopeKind, limits, allocated, projected, proposalStatus: projected ? 'complete' : 'pending',
    currentBalance, proposedBalance: evaluateReferenceBalance(comparisonResult), comparisonResult,
    sourceLabels: { limits: sourceInfo(limitScope), allocated: sourceInfo(allocatedScope), scope: sourceInfo(selected) },
  };
}
