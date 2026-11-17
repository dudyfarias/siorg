import { buildSummary, catalogue, formatCents, formatInteger } from './calculator.mjs';
import { getOrganization, getScope } from './organization-profiles.mjs';
import { calculateQuotaAvailability } from './quota-availability.mjs';

const GROUPS = ['CCESP', 'FCESP'];
const MESSAGES = {
  manual_baseline: 'O impacto na secretaria exige uma base de referência; valores manuais não são consolidados automaticamente.',
  documentary_conflict: 'Há divergência entre o Anexo II e o Anexo III; o total da secretaria não está reconciliado. A base documental não permite calcular o impacto consolidado.',
  documentary_unverified: 'A origem documental e os dados do recorte não têm correspondência verificada com o quadro publicado.',
  organization_unverified: 'A base completa da secretaria está pendente ou apresenta conflito entre fontes.',
  scope_unverified: 'O recorte selecionado não tem uma base verificada para consolidação.',
  scope_mismatch: 'O recorte não pertence à secretaria e à versão selecionadas.',
  version_mismatch: 'A secretaria, o recorte e suas bases precisam usar a mesma versão conferida.',
  missing_reference: 'Faltam valores da base da secretaria ou da unidade.',
  invalid_reference: 'Os valores da referência estão inválidos ou não reconciliam por espécie.',
  scope_not_contained: 'A base do recorte não pode ser subtraída da base da secretaria sem gerar valores negativos.',
  incomplete_proposal: 'Complete a composição proposta para calcular o impacto na secretaria.',
  invalid_proposal: 'Os totais propostos estão inválidos ou não reconciliam por espécie.',
  catalogue_mismatch: 'A proposta foi calculada com uma versão diferente do catálogo usado por esta referência.',
  baseline_mismatch: 'Os valores usados na comparação não correspondem à referência do recorte selecionado.',
};

function plain(value, fallback = 'não informado') {
  return typeof value === 'string' && value.trim() ? value.replace(/\s+/gu, ' ').trim() : fallback;
}

function integer(value) {
  return typeof value === 'string' && /^\d+$/u.test(value) ? BigInt(value) : null;
}

function decimalCents(value) {
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/u.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}

function sameTotals(a, b) {
  return a && b && a.quantity === b.quantity && a.quotaCents === b.quotaCents;
}

function readTotals(source, decimal = false) {
  const groups = {};
  let missing = false;
  for (const group of GROUPS) {
    const entry = source?.groups?.[group];
    const quota = decimal ? entry?.quotas : entry?.quotaCents;
    if (entry?.quantity == null || quota == null || entry.quantity === '' || quota === '') missing = true;
    groups[group] = {
      quantity: integer(entry?.quantity),
      quotaCents: decimal ? decimalCents(quota) : integer(quota),
    };
  }
  const aggregateSource = decimal ? source : source?.aggregate;
  const aggregateQuota = decimal ? aggregateSource?.quotas : aggregateSource?.quotaCents;
  if (aggregateSource?.quantity == null || aggregateQuota == null || aggregateSource.quantity === '' || aggregateQuota === '') missing = true;
  const aggregate = {
    quantity: integer(aggregateSource?.quantity),
    quotaCents: decimal ? decimalCents(aggregateQuota) : integer(aggregateQuota),
  };
  if (missing) return { error: 'missing_reference' };
  if ([aggregate, ...Object.values(groups)].some((totals) => totals.quantity === null || totals.quotaCents === null)) {
    return { error: 'invalid_reference' };
  }
  const sum = {
    quantity: groups.CCESP.quantity + groups.FCESP.quantity,
    quotaCents: groups.CCESP.quotaCents + groups.FCESP.quotaCents,
  };
  return sameTotals(aggregate, sum) ? { groups, aggregate } : { error: 'invalid_reference' };
}

function referenceContext(organization, scope) {
  if (!organization || organization.status !== 'verified') return { error: 'organization_unverified' };
  if (!scope || scope.status !== 'verified' || !['whole', 'unit'].includes(scope.coverage)) return { error: 'scope_unverified' };
  const units = Array.isArray(organization.units) ? organization.units : [];
  const matches = units.filter((entry) => entry.id === scope.id);
  const wholeMatches = units.filter((entry) => entry.id === 'all');
  if (!organization.id || matches.length !== 1 || wholeMatches.length !== 1 || scope.organizationId !== organization.id) {
    return { error: 'scope_mismatch' };
  }
  const selected = matches[0], whole = wholeMatches[0];
  if (whole.status !== 'verified' || whole.coverage !== 'whole' || whole.organizationId !== organization.id) {
    return { error: 'organization_unverified' };
  }
  if (selected.status !== 'verified' || selected.coverage !== scope.coverage ||
      selected.organizationId !== organization.id ||
      (selected.coverage === 'whole' ? selected.id !== 'all' : selected.parentScopeId !== 'all') ||
      scope.parentScopeId !== selected.parentScopeId) {
    return { error: 'scope_mismatch' };
  }
  if (!organization.version || [whole, selected, scope].some((entry) => entry.version !== organization.version)) {
    return { error: 'version_mismatch' };
  }
  if ([whole, selected, scope].some((entry) => !entry.reference)) return { error: 'missing_reference' };
  if ([whole, selected, scope].some((entry) => entry.reference.version !== organization.version)) {
    return { error: 'version_mismatch' };
  }
  if ([whole, selected, scope].some((entry) => entry.reference.nature !== 'authorized')) {
    return { error: 'invalid_reference' };
  }
  const wholeTotals = readTotals(whole.reference, true);
  const scopeTotals = readTotals(selected.reference, true);
  const suppliedTotals = readTotals(scope.reference, true);
  const error = wholeTotals.error || scopeTotals.error || suppliedTotals.error;
  if (error) return { error };
  if (!GROUPS.every((group) => sameTotals(scopeTotals.groups[group], suppliedTotals.groups[group]))) {
    return { error: 'scope_mismatch' };
  }
  for (const group of GROUPS) {
    if (scopeTotals.groups[group].quantity > wholeTotals.groups[group].quantity ||
        scopeTotals.groups[group].quotaCents > wholeTotals.groups[group].quotaCents) {
      return { error: 'scope_not_contained' };
    }
  }
  return { selected, whole, wholeTotals, scopeTotals };
}

// A published table can identify a baseline without establishing a reconciled
// whole-secretariat reference. This context never grants consolidation rights.
function documentaryContext(organization, scope) {
  if (organization?.status !== 'conflict' || scope?.status !== 'conflict' ||
      !['whole', 'unit'].includes(scope?.coverage)) return { error: 'documentary_unverified' };
  const matches = Array.isArray(organization.units) ? organization.units.filter((entry) => entry.id === scope.id) : [];
  if (!organization.id || matches.length !== 1 || scope.organizationId !== organization.id) return { error: 'scope_mismatch' };
  const selected = matches[0];
  if (selected.status !== 'conflict' || selected.coverage !== scope.coverage ||
      selected.organizationId !== organization.id || selected.parentScopeId !== scope.parentScopeId ||
      (selected.coverage === 'whole' ? selected.id !== 'all' || selected.parentScopeId !== null : selected.parentScopeId !== 'all')) {
    return { error: 'scope_mismatch' };
  }
  // The calculator profile may name the decree while each scope names its annex.
  // Compare the supplied scope to its canonical entry, not to the common profile ID.
  if (!organization.version || !selected.version || scope.version !== selected.version) return { error: 'version_mismatch' };
  if ([selected, scope].some((entry) => !entry.reference)) return { error: 'missing_reference' };
  if ([selected, scope].some((entry) => entry.reference.version !== entry.version)) return { error: 'version_mismatch' };
  const validAnnex = (reference) => reference.nature === 'published-distribution' && reference.sourceAnnex === 'II' && reference.conflictingAnnex === 'III'
    || reference.nature === 'published-summary' && reference.sourceAnnex === 'III' && reference.conflictingAnnex === 'II';
  if ([selected, scope].some((entry) => !validAnnex(entry.reference) ||
      entry.reference.reconciliationStatus !== 'conflict' || !plain(entry.sourceLabel, '') || !plain(entry.sourceUrl, ''))) {
    return { error: 'documentary_unverified' };
  }
  if (['nature', 'sourceAnnex', 'conflictingAnnex', 'reconciliationStatus'].some((key) => selected.reference[key] !== scope.reference[key]) ||
      selected.sourceLabel !== scope.sourceLabel || selected.sourceUrl !== scope.sourceUrl) return { error: 'scope_mismatch' };
  const scopeTotals = readTotals(selected.reference, true);
  const suppliedTotals = readTotals(scope.reference, true);
  const error = scopeTotals.error || suppliedTotals.error;
  if (error) return { error };
  if (!GROUPS.every((group) => sameTotals(scopeTotals.groups[group], suppliedTotals.groups[group]))) return { error: 'scope_mismatch' };
  return { selected, scopeTotals };
}

function activeBaselineMatches(result, reference) {
  const current = result?.current;
  const fieldValue = (entry) => entry?.status === 'valid' ? integer(entry.value) : null;
  if (current?.mode === 'aggregate') {
    return sameTotals({ quantity: fieldValue(current.aggregate?.quantity), quotaCents: fieldValue(current.aggregate?.quotas) }, reference.aggregate);
  }
  if (current?.mode === 'group') {
    return GROUPS.every((group) => sameTotals({
      quantity: fieldValue(current.groups?.[group]?.quantity),
      quotaCents: fieldValue(current.groups?.[group]?.quotas),
    }, reference.groups[group]));
  }
  return false;
}

function unavailable(reason, organization, scope) {
  return {
    status: 'unavailable', reason, message: MESSAGES[reason],
    organizationId: organization?.id ?? null, scopeId: scope?.id ?? null,
    version: organization?.version ?? null, groups: null, aggregate: null,
  };
}

function impactTotals(whole, scope, proposal) {
  const remainingQuantity = whole.quantity - scope.quantity;
  const remainingQuotaCents = whole.quotaCents - scope.quotaCents;
  return Object.fromEntries(Object.entries({
    quantity: remainingQuantity + proposal.quantity,
    quotaCents: remainingQuotaCents + proposal.quotaCents,
    baselineQuantity: whole.quantity, baselineQuotaCents: whole.quotaCents,
    scopeQuantity: scope.quantity, scopeQuotaCents: scope.quotaCents,
    proposalQuantity: proposal.quantity, proposalQuotaCents: proposal.quotaCents,
    remainingQuantity, remainingQuotaCents,
    deltaQuantity: proposal.quantity - scope.quantity,
    deltaQuotaCents: proposal.quotaCents - scope.quotaCents,
  }).map(([key, value]) => [key, value.toString()]));
}

/**
 * Pure, exact replacement of a verified scope. The proposed rows represent the
 * COMPLETE final scope, not a list of additions. Profile verification owns its
 * membership/coverage evidence; this function never infers a hierarchy.
 */
export function calculateOrganizationImpact({ organization, scope, baselineOrigin, result } = {}) {
  const reject = (reason) => unavailable(reason, organization, scope);
  if (baselineOrigin === 'documentary') {
    const checked = documentaryContext(organization, scope);
    if (checked.error) return reject(checked.error);
    if (!activeBaselineMatches(result, checked.scopeTotals)) return reject('baseline_mismatch');
    return reject('documentary_conflict');
  }
  if (baselineOrigin !== 'reference') return reject('manual_baseline');
  const checked = referenceContext(organization, scope);
  if (checked.error) return reject(checked.error);
  if (result?.status !== 'complete' || result?.aggregate?.status !== 'complete' ||
      GROUPS.some((group) => result?.groups?.[group]?.status !== 'complete')) return reject('incomplete_proposal');
  if (result.catalogueVersion !== catalogue.version) return reject('catalogue_mismatch');
  const proposal = readTotals(result);
  if (proposal.error) return reject('invalid_proposal');
  if (!activeBaselineMatches(result, checked.scopeTotals)) return reject('baseline_mismatch');
  const groups = Object.fromEntries(GROUPS.map((group) => [group,
    impactTotals(checked.wholeTotals.groups[group], checked.scopeTotals.groups[group], proposal.groups[group]),
  ]));
  return {
    status: 'available', reason: null,
    message: checked.selected.coverage === 'whole'
      ? 'A composição proposta representa toda a secretaria.'
      : 'Estimativa aritmética com substituição completa do recorte e preservação do restante da secretaria.',
    organizationId: organization.id, scopeId: checked.selected.id, version: organization.version,
    groups, aggregate: impactTotals(checked.wholeTotals.aggregate, checked.scopeTotals.aggregate, proposal.aggregate),
  };
}

function referenceLabels(summary, documentaryReference = null, allocationModel = false) {
  const baseLabel = allocationModel ? 'alocação do Anexo II' : documentaryReference ? 'base do quadro' : 'base autorizada';
  // Replace only generated labels, never arbitrary occurrences in user text.
  return summary.split('\n').map((line) => {
    if (line === 'VARIAÇÃO EM RELAÇÃO À SITUAÇÃO ATUAL INFORMADA') {
      if (allocationModel) return 'VARIAÇÃO LOCAL EM RELAÇÃO À ALOCAÇÃO DO ANEXO II';
      return documentaryReference ? `VARIAÇÃO EM RELAÇÃO À BASE DO QUADRO — ANEXO ${documentaryReference.sourceAnnex}` : 'VARIAÇÃO EM RELAÇÃO À BASE AUTORIZADA DO RECORTE';
    }
    if (line === 'Diferenças aritméticas sobre os totais informados. Natureza e abrangência dos dados não foram validadas.') {
      if (allocationModel) return 'Comparação local com a alocação do Anexo II. O limite da secretaria é identificado separadamente no Anexo III; base e regras permanecem em validação técnica.';
      return documentaryReference
        ? `Diferenças aritméticas em relação à base do quadro publicado no Anexo ${documentaryReference.sourceAnnex}. A divergência com o Anexo ${documentaryReference.conflictingAnnex} permanece; a conta não concilia os anexos nem valida administrativamente a proposta.`
        : 'Diferenças aritméticas em relação à referência autorizada identificada. A conta não valida administrativamente a proposta.';
    }
    if (/^(?:Modo|Natureza|Data|Origem) da base atual:/u.test(line)) {
      return line.replace('da base atual:', `da ${baseLabel}:`);
    }
    if (/^(?:Postos agregados|Cotas agregadas|Cargos CCESP|Funções FCESP|Cotas CCESP|Cotas FCESP):/u.test(line)) {
      return line.replace(': atual ', `: ${baseLabel} `)
        .replace('; atual informado:', `; ${baseLabel}:`)
        .replace('; entrada atual inválida:', '; entrada de referência inválida:')
        .replace('base atual não informada', `${baseLabel} não informada`)
        .replace('base atual inválida', 'base de referência inválida');
    }
    if (line === 'Comparações por grupo: sem base atual por grupo. O agregado é apenas descritivo.') {
      return documentaryReference
        ? 'O quadro comparativo acima é agregado e descritivo; não permite compensação entre espécies nem consolidação do impacto na secretaria.'
        : 'O quadro comparativo acima é agregado e descritivo; as espécies permanecem separadas no cálculo do impacto.';
    }
    return line;
  }).join('\n');
}

function buildAvailabilitySummary({ organization, scope, input, result, isExample, generatedAt }, availability) {
  const canonicalOrganization = getOrganization(organization.id), canonicalScope = getScope(organization.id, scope.id);
  const sources = availability.sourceLabels;
  const lines = [
    'RECORTE DA PROPOSTA',
    `Secretaria: ${plain(canonicalOrganization.name)}`,
    `Unidade: ${plain(canonicalScope.name)}`,
    `Abrangência: ${plain(canonicalScope.scopeLabel)}`,
    'Origem da base local: alocação documental do Anexo II.',
    `Limite da secretaria: ${sources.limits.label}. Fonte: ${sources.limits.url}. Versão: ${sources.limits.version}.`,
    `Alocado na secretaria: ${sources.allocated.label}. Fonte: ${sources.allocated.url}. Versão: ${sources.allocated.version}.`,
    `Alocado no recorte: ${sources.scope.label}. Fonte: ${sources.scope.url}. Versão: ${sources.scope.version}.`,
    'Regra adotada nesta simulação: Anexo III = limite; Anexo II = alocação. Saldo disponível = limite − alocação, separadamente por espécie e medida.',
    'Os valores dos anexos são preservados. Base e regras permanecem em validação técnica; os quadros não informam, por si, a ocupação atual.',
    '',
    referenceLabels(buildSummary(input, result, { isExample, generatedAt }), canonicalScope.reference, true),
    '',
    'DISPONIBILIDADE ATUAL NA SECRETARIA — LIMITE III MENOS ALOCADO II',
  ];
  const appendBalances = (balance, proposedLabel) => {
    for (const group of GROUPS) {
      lines.push('', group);
      for (const measure of ['quantity', 'quotas']) {
        const metric = balance.groups[group][measure], format = measure === 'quantity' ? formatInteger : formatCents;
        const label = measure === 'quantity' ? 'Quantitativo' : 'Cotas';
        if (metric.status !== 'available') {
          const limit = availability.limits.groups[group][measure === 'quantity' ? 'quantity' : 'quotaCents'];
          lines.push(`${label}: limite ${format(limit)}; proposta, saldo disponível e extrapolação pendentes — ${metric.reason === 'empty_proposal' ? 'proposta vazia' : 'complete ou corrija a proposta'}.`);
        } else {
          lines.push(`${label}: limite ${format(metric.baseline)}; ${proposedLabel} ${format(metric.proposed)}; saldo disponível ${format(metric.balance, { signed: true })}; extrapolação ${format(metric.excess)}.`);
        }
      }
    }
  };
  appendBalances(availability.currentBalance, 'alocado');
  lines.push('', 'DISPONIBILIDADE APÓS A PROPOSTA — SECRETARIA', availability.message);
  if (availability.scopeKind === 'unit') {
    lines.push('Hipótese: alocado total no Anexo II − alocado no recorte do Anexo II + composição final proposta para o recorte. O restante da estrutura fica mantido.');
  }
  appendBalances(availability.proposedBalance, 'alocação projetada');
  lines.push('', 'Não há soma nem compensação de saldos entre CCESP e FCESP ou entre quantitativo e cotas.',
    'Base e regras em validação técnica; os saldos aritméticos não representam homologação ou aprovação administrativa.');
  return lines.join('\n');
}

/**
 * Extend the calculator's snapshot export with provenance and scope. Optional
 * isExample/generatedAt match buildSummary. An optional UI `impact` cache is
 * accepted in the argument object but recomputed from result to avoid stale export.
 */
export function buildScopedSummary({ organization, scope, scopeName, baselineOrigin, input, result,
  isExample = false, generatedAt } = {}) {
  const checked = baselineOrigin === 'documentary' ? documentaryContext(organization, scope) : referenceContext(organization, scope);
  const availability = calculateQuotaAvailability({ organizationId: organization?.id, scopeId: scope?.id, baselineOrigin, result });
  if (!checked.error && availability.status === 'available') {
    return buildAvailabilitySummary({ organization, scope, input, result, isExample, generatedAt }, availability);
  }
  const referenceUsed = baselineOrigin === 'reference' && !checked.error && activeBaselineMatches(result, checked.scopeTotals);
  const documentaryUsed = baselineOrigin === 'documentary' && !checked.error && activeBaselineMatches(result, checked.scopeTotals);
  const impact = calculateOrganizationImpact({ organization, scope, baselineOrigin, result });
  const selected = !checked.error ? checked.selected : scope;
  const sourceLabel = selected?.sourceLabel || organization?.sourceLabel;
  const sourceUrl = selected?.sourceUrl || organization?.sourceUrl;
  const scopeTitle = scope?.coverage === 'custom' ? plain(scopeName, plain(scope?.name)) : plain(selected?.name, plain(scopeName));
  const lines = [
    'RECORTE DA PROPOSTA',
    `Secretaria: ${plain(organization?.name)}`,
    `Unidade: ${scopeTitle}`,
    `Abrangência: ${plain(selected?.scopeLabel, 'abrangência não confirmada')}`,
    `Origem da base: ${referenceUsed ? 'referência autorizada do recorte'
      : documentaryUsed ? `base documental do Anexo ${selected.reference.sourceAnnex}, com divergência de conciliação entre anexos`
      : baselineOrigin === 'documentary' ? 'base documental solicitada, sem correspondência verificada com os valores usados'
      : baselineOrigin === 'reference'
      ? 'referência solicitada, sem correspondência verificada com os valores usados'
      : baselineOrigin === 'example' ? 'exemplo fictício, sem base oficial'
      : baselineOrigin === 'manual-from-reference' ? 'valores informados manualmente a partir de uma referência' : 'valores informados manualmente'}.`,
    `${referenceUsed || documentaryUsed ? 'Decreto/quadro da base' : baselineOrigin === 'documentary'
      ? 'Referência institucional (não atesta os valores usados)' : 'Referência institucional (não atesta os valores manuais)'}: ${plain(sourceLabel)}`,
    `Fonte do perfil: ${plain(sourceUrl)}`,
    `Versão do perfil: ${plain(organization?.version)}`,
    `Versão do recorte: ${plain(selected?.version)}`,
    `Conferência da referência: ${plain(selected?.checkedAt || organization?.checkedAt)}`,
  ];
  if (organization?.notice) lines.push(`Observação da secretaria: ${plain(organization.notice)}`);
  if (selected?.notice && selected.notice !== organization?.notice) lines.push(`Observação do recorte: ${plain(selected.notice)}`);
  if (documentaryUsed) lines.push(`Pendência de conciliação: ${MESSAGES.documentary_conflict}`);
  lines.push(baselineOrigin === 'documentary'
    ? documentaryUsed ? `O quadro publicado no Anexo ${selected.reference.sourceAnnex} não informa, por si, a ocupação atual.`
      : 'Os quadros publicados não informam, por si, a ocupação atual.'
    : 'Os quadros autorizados não informam, por si, a ocupação atual.', '');
  const summary = buildSummary(input, result, { isExample: isExample || baselineOrigin === 'example', generatedAt });
  lines.push(referenceUsed || documentaryUsed ? referenceLabels(summary, documentaryUsed ? selected.reference : null) : summary, '', 'IMPACTO ARITMÉTICO NA SECRETARIA');
  if (impact.status !== 'available') {
    lines.push(`Não calculado: ${impact.message}`);
  } else {
    lines.push(impact.message,
      'Hipótese: a proposta substitui a composição completa do recorte; nenhuma parcela fora dele é alterada.',
      'Conta: base da secretaria − base do recorte + proposta do recorte.');
    for (const group of GROUPS) {
      const totals = impact.groups[group];
      lines.push(`${group} — quantidade: ${formatInteger(totals.baselineQuantity)} − ${formatInteger(totals.scopeQuantity)} + ${formatInteger(totals.proposalQuantity)} = ${formatInteger(totals.quantity)}.`,
        `${group} — cotas: ${formatCents(totals.baselineQuotaCents)} − ${formatCents(totals.scopeQuotaCents)} + ${formatCents(totals.proposalQuotaCents)} = ${formatCents(totals.quotaCents)}.`);
    }
    lines.push(`Total estimado descritivo: ${formatInteger(impact.aggregate.quantity)} postos; ${formatCents(impact.aggregate.quotaCents)} cotas.`);
  }
  lines.push('A estimativa não demonstra saldo disponível, aprovação administrativa ou compensação entre CCESP e FCESP.');
  return lines.join('\n');
}
