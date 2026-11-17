import { formatInteger, formatCents } from './calculator.mjs';

const GROUPS = ['CCESP', 'FCESP'];
const MEASURES = ['quantity', 'quotas'];
const FOOTER = 'Base e regras em validação técnica; a comparação não representa aprovação administrativa.';

function pendingMetric(reason) {
  return {
    status: 'pending', reason,
    baseline: null, proposed: null, delta: null, balance: null, excess: null, relation: null,
  };
}

function evaluateMetric(comparison) {
  if (comparison?.status !== 'available') {
    return pendingMetric(comparison?.reason || 'comparison_unavailable');
  }
  // Available calculator comparisons use exact, nonnegative integer strings.
  // Quotas retain the engine's unit: hundredths, not decimal quota units.
  const valid = (value) => typeof value === 'string' && /^\d+$/u.test(value);
  if (!valid(comparison.current) || !valid(comparison.proposed)) {
    return pendingMetric('invalid_comparison');
  }
  const baseline = BigInt(comparison.current);
  const proposed = BigInt(comparison.proposed);
  const delta = proposed - baseline;
  return {
    status: 'available', reason: null,
    baseline: baseline.toString(), proposed: proposed.toString(), delta: delta.toString(),
    balance: (-delta).toString(), excess: (delta > 0n ? delta : 0n).toString(),
    relation: delta > 0n ? 'above' : delta < 0n ? 'below' : 'equal',
  };
}

function comparisonState(metrics) {
  const complete = metrics.every((metric) => metric.status === 'available');
  const exceeded = metrics.some((metric) => metric.status === 'available' && metric.relation === 'above');
  return { status: exceeded ? 'exceeded' : complete ? 'within' : 'pending', complete };
}

/**
 * Numerical comparison only. Never offsets a species or measure against another.
 * Quantity strings represent positions; quota strings represent exact hundredths.
 * A pending comparison has no inferred margin, even when aggregate totals exist.
 */
export function evaluateReferenceBalance(result) {
  const groups = {};
  const metrics = [];
  for (const group of GROUPS) {
    const quantity = evaluateMetric(result?.comparisons?.groups?.[group]?.quantity);
    const quotas = evaluateMetric(result?.comparisons?.groups?.[group]?.quotas);
    groups[group] = { ...comparisonState([quantity, quotas]), quantity, quotas };
    metrics.push(quantity, quotas);
  }
  return { ...comparisonState(metrics), groups };
}

const REASONS = {
  missing_current: 'valor da base não informado',
  invalid_current: 'valor da base inválido',
  no_base: 'base não informada',
  no_group_base: 'base por espécie não informada',
  inactive_mode: 'base por espécie não disponível neste modo',
  invalid_mode: 'modo de comparação inválido',
  empty_proposal: 'composição proposta ainda vazia',
  incomplete_proposal: 'composição proposta incompleta',
  incomplete_context: 'identificação ou equivalência da base pendente',
  incompatible_context: 'equivalência das bases não confirmada',
  comparison_unavailable: 'dados da comparação não disponíveis',
  invalid_comparison: 'valores da comparação inválidos',
};

/** Plain-text simulation receipt, derived only from the supplied result snapshot. */
export function buildReferenceBalanceSummary(result, { scopeCoverage = 'whole' } = {}) {
  const evaluated = evaluateReferenceBalance(result);
  const lines = [
    'COMPARAÇÃO NUMÉRICA — SIMULAÇÃO',
    'Comparação com a base informada no cálculo, ainda em validação.',
  ];
  for (const group of GROUPS) {
    lines.push('', group);
    for (const measure of MEASURES) {
      const metric = evaluated.groups[group][measure];
      const label = measure === 'quantity' ? 'Quantitativo' : 'Cotas';
      if (metric.status !== 'available') {
        lines.push(`${label}: comparação pendente — ${REASONS[metric.reason] ?? 'dados pendentes de conferência'}; saldo e excesso não calculados.`);
        continue;
      }
      const format = measure === 'quantity' ? formatInteger : formatCents;
      const relation = { above: 'acima da base', below: 'abaixo da base', equal: 'igual à base' }[metric.relation];
      lines.push(`${label}: base ${format(metric.baseline)}; proposta ${format(metric.proposed)}; variação ${format(metric.delta, { signed: true })}; saldo numérico (base − proposta) ${format(metric.balance)}; excesso ${format(metric.excess)} — ${relation}.`);
    }
  }
  const statusText = evaluated.status === 'exceeded'
    ? 'Há medidas acima da base.'
    : evaluated.status === 'within'
      ? 'As quatro medidas estão iguais ou abaixo da base.'
      : 'A comparação está pendente.';
  lines.push('', `Resultado numérico: ${statusText}`);
  if (!evaluated.complete) lines.push('Comparação incompleta: há medidas pendentes, identificadas acima.');
  lines.push('CCESP e FCESP são comparados separadamente, sem compensação entre espécies ou entre quantitativo e cotas.');
  if (scopeCoverage !== 'whole') {
    lines.push('O saldo numérico em relação à base da unidade não é disponibilidade da secretaria nem teto da unidade.');
  }
  lines.push(FOOTER);
  return lines.join('\n');
}
