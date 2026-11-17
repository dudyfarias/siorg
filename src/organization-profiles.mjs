import { educationWholeReference, educationBauruReference } from './data/education-reference.mjs';
import { sggdReferences } from './data/sggd-reference.mjs';
import { sggdSummaryReference } from './data/sggd-summary-reference.mjs';

/**
 * Documentary references checked on 2026-09-24, not institutional approval.
 * Unknown data stays null. Conflicting published distributions retain their status
 * and explicit provenance; they cannot establish a reconciled official total.
 * No linked entity is aggregated here.
 * All public quantities, levels and quota values are exact strings.
 */
const CHECKED_AT = '2026-09-24';
const EDUCATION_SOURCE = 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-70042-30.10.2025.html';
const SGGD_SOURCE = 'https://www.doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002';
const SGGD_STRUCTURE_SOURCE = 'https://www.doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-33-de-22-07-2026-20260723112912201999213';
const HEALTH_SOURCE = 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-68742-05.08.2024.html';
const SGGD_NOTICE = 'Dados do Anexo II; há divergência com o Anexo III. As somas do quadro não constituem um total oficial reconciliado nem informam a ocupação atual.';
const HEALTH_NOTICE = 'A referência atual da Secretaria da Saúde ainda precisa ser confirmada. Preencha os dados que deseja estudar.';

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function scope(organization, values) {
  return {
    organizationId: organization.id,
    version: organization.version,
    checkedAt: CHECKED_AT,
    sourceLabel: organization.sourceLabel,
    sourceUrl: organization.sourceUrl,
    status: organization.status,
    notice: organization.notice,
    parentScopeId: 'all',
    reference: null,
    ...values,
  };
}

function wholeScope(organization, scopeLabel, reference = null) {
  return scope(organization, {
    id: 'all',
    name: 'Toda a secretaria',
    scopeLabel,
    coverage: 'whole',
    parentScopeId: null,
    reference,
  });
}

function customScope(organization) {
  return scope(organization, {
    id: 'custom',
    name: 'Outra unidade',
    scopeLabel: 'Unidade informada por você',
    coverage: 'custom',
    parentScopeId: null,
    status: 'pending',
    notice: 'Informe o nome da unidade e os dados do recorte que deseja estudar.',
    sourceLabel: '',
    sourceUrl: '',
  });
}

const sggd = {
  id: 'sggd',
  name: 'Secretaria de Gestão e Governo Digital',
  shortName: 'SGGD',
  status: 'conflict',
  notice: SGGD_NOTICE,
  sourceLabel: 'Decreto 70.755/2026 — Anexo II (quadro distribuído)',
  sourceUrl: SGGD_SOURCE,
  checkedAt: CHECKED_AT,
  version: sggdReferences.all.version,
  effectiveFrom: '2026-08-01',
};

// Hierarchy: Annex I art. 2, III, supplemented by Resolution 33/2026 art. 1, III.
// Inclusive scopes use that explicit hierarchy, never table order alone.
sggd.units = [
  wholeScope(sggd, 'SGGD: quadro do Anexo II da administração direta, sem as entidades vinculadas', sggdReferences.all),
  scope(sggd, {
    id: 'subsecretaria-gestao',
    name: 'Subsecretaria de Gestão',
    scopeLabel: 'Subsecretaria de Gestão, incluindo a Diretoria Geral e a Diretoria de Normas e Sistemas de Logística, com suas unidades subordinadas',
    coverage: 'unit',
    hierarchy: ['Secretaria de Gestão e Governo Digital', 'Subsecretaria de Gestão'],
    structureSourceLabel: 'Decreto 70.755/2026 — Anexo I, art. 2º, III; Resolução SGGD 33/2026 — art. 1º, III',
    structureSourceUrl: SGGD_STRUCTURE_SOURCE,
    reference: sggdReferences['subsecretaria-gestao'],
  }),
  scope(sggd, {
    id: 'diretoria-geral-desenvolvimento-capacidade-institucional',
    name: 'Diretoria Geral de Desenvolvimento e Capacidade Institucional',
    scopeLabel: 'Diretoria Geral, incluindo Assessoria Técnica, Seção de Apoio Administrativo, Modernização Organizacional e Inovação em Gestão Pública, com suas unidades subordinadas',
    coverage: 'unit',
    hierarchy: ['Subsecretaria de Gestão', 'Diretoria Geral de Desenvolvimento e Capacidade Institucional'],
    structureSourceLabel: 'Decreto 70.755/2026 — Anexo I, art. 2º, III, a; Resolução SGGD 33/2026 — art. 1º, III, a',
    structureSourceUrl: SGGD_STRUCTURE_SOURCE,
    reference: sggdReferences['diretoria-geral-desenvolvimento-capacidade-institucional'],
  }),
  scope(sggd, {
    id: 'diretoria-modernizacao-organizacional',
    name: 'Diretoria de Modernização Organizacional',
    scopeLabel: 'Postos diretos da Diretoria de Modernização Organizacional, sem as unidades subordinadas',
    coverage: 'unit',
    hierarchy: ['Subsecretaria de Gestão', 'Diretoria Geral de Desenvolvimento e Capacidade Institucional', 'Diretoria de Modernização Organizacional'],
    structureSourceLabel: 'Decreto 70.755/2026 — Anexo I, art. 2º, III, a, 2',
    reference: sggdReferences['diretoria-modernizacao-organizacional'],
  }),
  scope(sggd, {
    id: 'diretoria-inovacao-gestao-publica',
    name: 'Diretoria de Inovação em Gestão Pública',
    scopeLabel: 'Postos diretos da Diretoria de Inovação em Gestão Pública, sem as unidades subordinadas',
    coverage: 'unit',
    hierarchy: ['Subsecretaria de Gestão', 'Diretoria Geral de Desenvolvimento e Capacidade Institucional', 'Diretoria de Inovação em Gestão Pública'],
    structureSourceLabel: 'Decreto 70.755/2026 — Anexo I, art. 2º, III, a, 3',
    reference: sggdReferences['diretoria-inovacao-gestao-publica'],
  }),
  scope(sggd, {
    id: 'diretoria-normas-sistemas-logistica',
    name: 'Diretoria de Normas e Sistemas de Logística',
    scopeLabel: 'Postos diretos da Diretoria de Normas e Sistemas de Logística, sem as unidades subordinadas',
    coverage: 'unit',
    hierarchy: ['Subsecretaria de Gestão', 'Diretoria de Normas e Sistemas de Logística'],
    structureSourceLabel: 'Decreto 70.755/2026 — Anexo I, art. 2º, III, b',
    reference: sggdReferences['diretoria-normas-sistemas-logistica'],
  }),
  customScope(sggd),
];

const education = {
  id: 'educacao',
  name: 'Secretaria da Educação',
  shortName: 'Educação',
  status: 'verified',
  notice: 'Referência conferida nos anexos do decreto. Os valores são da estrutura autorizada e não informam a ocupação atual.',
  sourceLabel: 'Decreto 70.042/2025 — Anexos I e II',
  sourceUrl: EDUCATION_SOURCE,
  checkedAt: CHECKED_AT,
  version: educationWholeReference.version,
  effectiveFrom: '2025-10-31',
};
education.units = [
  wholeScope(education, 'Quadro CCESP/FCESP da Secretaria da Educação: unidades centrais e regionais constantes do decreto', educationWholeReference),
  scope(education, {
    id: 'ure-bauru',
    name: 'Unidade Regional de Ensino de Bauru',
    scopeLabel: 'URE Bauru e seus serviços e seções, apenas os cargos CCESP/FCESP do decreto',
    coverage: 'unit',
    hierarchy: ['Secretaria da Educação', 'Unidade Regional de Ensino de Bauru'],
    notice: 'Inclui a direção, os postos de apoio e os cinco serviços com suas seções. Não inclui o pessoal das escolas nem os cargos de outras carreiras.',
    structureSourceLabel: 'Decreto 69.665/2025 — Anexo I, art. 2º, VII, e Anexo VI; Resolução SEDUC 108/2025 — arts. 1º, VII; 133; 149–150',
    structureSourceUrl: 'https://www.doe.sp.gov.br/executivo/secretaria-da-educacao/resolucao-seduc-n-108-de-28-de-julho-de-2025-20250728112312201228596',
    sourceReferences: [
      { label: 'Composição: Decreto 70.042/2025 — Anexo I, URE Bauru', url: EDUCATION_SOURCE },
      { label: 'Vínculo com a Secretaria: Decreto 69.665/2025 — Anexo I, art. 2º, VII, e Anexo VI', url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-69665-30.06.2025.html' },
      { label: 'Hierarquia: Resolução SEDUC 108/2025 — arts. 1º, VII; 133; 149–150', url: 'https://www.doe.sp.gov.br/executivo/secretaria-da-educacao/resolucao-seduc-n-108-de-28-de-julho-de-2025-20250728112312201228596' },
    ],
    includedSubunits: [
      { name: 'Serviço de Informações Educacionais e Tecnologia', children: ['Seção de Tecnologia'] },
      { name: 'Serviço de Gestão da Rede Escolar', children: ['Seção de Vida Escolar', 'Seção de Matrícula'] },
      { name: 'Serviço de Pessoas', children: ['Seção de Frequência e Pagamento', 'Seção de Administração de Pessoal'] },
      { name: 'Serviço de Administração e Finanças', children: ['Seção de Finanças', 'Seção de Compras e Serviços'] },
      { name: 'Serviço de Obras e Manutenção Escolar', children: ['Seção de Fiscalização'] },
    ],
    reference: educationBauruReference,
  }),
  customScope(education),
];

const health = {
  id: 'saude',
  name: 'Secretaria da Saúde',
  shortName: 'Saúde',
  status: 'pending',
  notice: HEALTH_NOTICE,
  sourceLabel: 'Decreto 68.742/2024 — referência histórica; atualização pendente',
  sourceUrl: HEALTH_SOURCE,
  checkedAt: CHECKED_AT,
  version: 'saude-pesquisa-2026-09-24-pendente',
};
health.units = [
  wholeScope(health, 'Secretaria da Saúde: administração direta, sem os quadros dos hospitais autárquicos'),
  customScope(health),
];

export const organizations = deepFreeze([sggd, education, health]);

export function getOrganization(id) {
  return organizations.find((organization) => organization.id === id);
}

export function getScope(organizationId, unitId) {
  return getOrganization(organizationId)?.units.find((unit) => unit.id === unitId);
}

/** Return editable rows with the canonical reference's provenance/status left intact. */
export function freshReferenceRows(selectedScope) {
  const currentScope = getScope(selectedScope?.organizationId, selectedScope?.id);
  if (!currentScope || currentScope.version !== selectedScope.version
      || !currentScope.reference || currentScope.reference.version !== currentScope.version) return [];
  const reference = currentScope.reference;
  const authorized = currentScope.status === 'verified' && reference.nature === 'authorized';
  const documentary = currentScope.status === 'conflict'
    && reference.nature === 'published-distribution'
    && reference.sourceAnnex === 'II'
    && reference.reconciliationStatus === 'conflict'
    && reference.conflictingAnnex === 'III'
    && Boolean(reference.notice && currentScope.sourceLabel && currentScope.sourceUrl);
  if (!authorized && !documentary) return [];
  return reference.rows.map(({ group, level, quantity }) => ({
    id: `${currentScope.organizationId}-${currentScope.id}-${group}-${level}`,
    group,
    level,
    quantity,
  }));
}

// Calculator references deliberately differ from the distribution profile:
// the whole SGGD uses Annex III, while its individual scopes keep Annex II.
// A common decree version identifies the profile, not a reconciliation of annexes.
const calculatorSggd = deepFreeze({
  ...sggd,
  version: 'sggd-decreto-70755-2026-08-01',
  sourceLabel: 'Decreto 70.755/2026 — Anexo III (resumo) e Anexo II (unidades)',
  notice: 'Toda a secretaria usa o resumo do Anexo III; as unidades usam a distribuição do Anexo II. A divergência entre os anexos permanece e impede a consolidação cruzada. Os quadros não informam a ocupação atual.',
  units: sggd.units.map((unit) => unit.id === 'all' ? {
    ...unit,
    version: sggdSummaryReference.version,
    scopeLabel: 'SGGD: resumo do Anexo III da administração direta, sem as entidades vinculadas',
    sourceLabel: 'Decreto 70.755/2026 — Anexo III (resumo)',
    notice: sggdSummaryReference.notice,
    reference: sggdSummaryReference,
  } : unit),
});

export function getCalculatorOrganization(id) {
  return id === 'sggd' ? calculatorSggd : getOrganization(id);
}

export function getCalculatorScope(organizationId, scopeId) {
  return getCalculatorOrganization(organizationId)?.units.find((unit) => unit.id === scopeId);
}

function sameReference(supplied, canonical) {
  if (!supplied || !canonical) return false;
  const metadata = ['version', 'nature', 'sourceAnnex', 'conflictingAnnex', 'reconciliationStatus', 'notice', 'quantity', 'quotas'];
  if (!metadata.every((key) => supplied[key] === canonical[key])) return false;
  if (!['CCESP', 'FCESP'].every((group) => supplied.groups?.[group]?.quantity === canonical.groups?.[group]?.quantity
    && supplied.groups?.[group]?.quotas === canonical.groups?.[group]?.quotas)) return false;
  return Array.isArray(supplied.rows) && supplied.rows.length === canonical.rows.length
    && canonical.rows.every((row, index) => ['group', 'level', 'quantity'].every((key) => supplied.rows[index]?.[key] === row[key]));
}

/** Load only an unchanged canonical calculator reference; return editable copies. */
export function freshCalculatorReferenceRows(selectedScope) {
  const canonical = getCalculatorScope(selectedScope?.organizationId, selectedScope?.id);
  if (!canonical || !canonical.reference || !selectedScope.reference ||
      ['version', 'status', 'coverage', 'parentScopeId', 'sourceLabel', 'sourceUrl'].some((key) => selectedScope[key] !== canonical[key]) ||
      canonical.reference.version !== canonical.version || !sameReference(selectedScope.reference, canonical.reference)) return [];
  const reference = canonical.reference;
  const authorized = canonical.status === 'verified' && reference.nature === 'authorized';
  const documentaryPair = reference.nature === 'published-distribution' && reference.sourceAnnex === 'II' && reference.conflictingAnnex === 'III'
    || reference.nature === 'published-summary' && reference.sourceAnnex === 'III' && reference.conflictingAnnex === 'II';
  const documentary = canonical.status === 'conflict' && documentaryPair
    && reference.reconciliationStatus === 'conflict'
    && Boolean(reference.notice && canonical.sourceLabel && canonical.sourceUrl);
  if (!authorized && !documentary) return [];
  return reference.rows.map(({ group, level, quantity }) => ({
    id: `${canonical.organizationId}-${canonical.id}-${group}-${level}`,
    group, level, quantity,
  }));
}
