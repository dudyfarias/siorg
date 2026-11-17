/** SGGD structural review only. These alerts never alter the proposal or its totals. */
const GENERAL_URL = 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-68742-05.08.2024.html';
const AMENDMENT_URL = 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-69286-30.12.2024.html';
const source = (provision, amended = false) => ({
  title: amended ? 'Decreto 69.286/2024' : 'Decreto 68.742/2024',
  url: amended ? AMENDMENT_URL : GENERAL_URL, provision, checkedAt: '2026-10-22',
});
const SOURCES = Object.freeze({
  head: source('arts. 6º, § 2º, e 7º, §§ 1º e 2º'),
  hierarchy: source('art. 6º, §§ 3º e 4º'),
  assessmentHead: source('art. 7º, § 4º, item 2'),
  classification: source('art. 1º, V, a: Anexo III, tabela A, do Decreto 68.742/2024', true),
  annexVIII: source('art. 16, § 4º, e Anexo VIII, tabela A: SGGD'),
  directorate: source('art. 18, parágrafo único'),
  generalDirectorate: source('art. 18, incisos I e II'),
  subsecretariat: source('art. 17, incisos I e II'),
  corporateSubsecretariat: source('art. 17, parágrafo único'),
});

// Exact documentary denominations, not substring guesses about who is a chief.
// The amended table contains vertically merged cells: e.g. Departamento spans 11–12.
const ROLE_RULES = new Map([
  ['Secretário Executivo', 18, 18, 1], ['Subsecretário', 17, 17, 1],
  ['Chefe de Assessoria', 10, 17, 1], ['Chefe de Gabinete', 16, 16, 1],
  ['Diretor Geral', 16, 16, 1], ['Diretor', 15, 15, 1],
  ['Coordenador Geral', 14, 14, 1], ['Coordenador', 13, 13, 1],
  ['Chefe de Departamento', 11, 12, 1], ['Chefe de Divisão', 9, 10, 1],
  ['Chefe de Serviço', 7, 8, 1], ['Chefe de Seção', 5, 6, 1],
  ['Chefe de Setor', 4, 4, 1], ['Chefe de Núcleo', 3, 3, 1],
  ['Assessor Especial V', 17, 17, 2], ['Assessor Especial IV', 16, 16, 2],
  ['Assessor Especial III', 15, 15, 2], ['Assessor Especial II', 14, 14, 2],
  ['Assessor Especial I', 13, 13, 2], ['Assessor IV', 12, 12, 2],
  ['Assessor III', 11, 11, 2], ['Assessor II', 10, 10, 2], ['Assessor I', 9, 9, 2],
  ['Assistente Técnico IV', 8, 8, 2], ['Assistente Técnico III', 7, 7, 2],
  ['Assistente Técnico II', 6, 6, 2], ['Assistente Técnico I', 5, 5, 2],
  ['Assistente IV', 4, 4, 2], ['Assistente III', 3, 3, 2],
  ['Assistente II', 2, 2, 2], ['Assistente I', 1, 1, 2],
].map(([name, min, max, category]) => [normalize(name), { min, max, category }]));

const TYPE_RULES = Object.freeze({
  diretoria: { minChildren: 2, levelGap: 2, source: SOURCES.directorate },
  'diretoria-geral': { minChildren: 2, levelGap: 1, source: SOURCES.generalDirectorate },
  'coordenadoria-geral': { minChildren: 2, levelGap: 1, source: SOURCES.generalDirectorate },
  subsecretaria: { minChildren: 3, levelGap: 2, source: SOURCES.subsecretariat },
  'subsecretaria-gestao-corporativa': { minChildren: 2, levelGap: 4, source: SOURCES.corporateSubsecretariat },
});
const KNOWN_TYPES = new Set(['other', 'ouvidoria', 'integridade', 'correicao', 'auditoria', ...Object.keys(TYPE_RULES)]);
const COMMAND_TYPES = new Map([
  ['Diretor', 'diretoria'], ['Diretor Geral', 'diretoria-geral'],
  ['Coordenador Geral', 'coordenadoria-geral'], ['Subsecretário', 'subsecretaria'],
].map(([role, type]) => [normalize(role), type]));
const array = value => Array.isArray(value) ? value : [];
function normalize(value) { return typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ').toLocaleLowerCase('pt-BR') : ''; }

function parsePosition(position) {
  const match = typeof position?.code === 'string' && /^(CCESP|FCESP) ([12])\.(\d{2})$/u.exec(position.code);
  const value = typeof position?.quantity === 'string' ? position.quantity.trim() : '';
  if (!match || !/^\d{1,128}$/u.test(value)) return null;
  const level = Number(match[3]);
  if (level < 1 || level > 18) return null;
  return { ...position, parsedCategory: Number(match[2]), parsedLevel: level, parsedQuantity: BigInt(value) };
}

function unitClassification(unit, head, original) {
  if (KNOWN_TYPES.has(unit.unitType) && unit.unitType !== 'other') return { type: unit.unitType, explicit: true };
  // A verified code/role pair suggests a type for review; it is not legal classification.
  const expected = head && ROLE_RULES.get(normalize(head.denomination));
  const commandType = head && COMMAND_TYPES.get(normalize(head.denomination));
  if (commandType && expected && head.parsedLevel >= expected.min && head.parsedLevel <= expected.max) {
    if (commandType === 'subsecretaria' && normalize(original?.name) === 'subsecretaria de gestão corporativa') {
      return { type: 'subsecretaria-gestao-corporativa', explicit: false };
    }
    return { type: commandType, explicit: false };
  }
  // For existing units only, the documentary label can locate an area to review.
  // New units require an explicit type to activate an Annex VIII rule.
  const name = normalize(original?.name);
  if (name.startsWith('ouvidoria')) return { type: 'ouvidoria', explicit: false };
  if (name.startsWith('unidade de integridade') || name.startsWith('integridade')) return { type: 'integridade', explicit: false };
  return { type: null, explicit: false };
}

function inspect(snapshot, base) {
  const alerts = [], pendingUnits = new Set(), inferredUnitTypes = [];
  const originals = new Map(array(base?.units).map(unit => [unit.id, unit]));
  const baseHasCommand = new Set(array(base?.positions).filter(row => {
    const parsed = parsePosition(row); return parsed?.parsedCategory === 1 && parsed.parsedQuantity > 0n;
  }).map(row => row.unitId));
  const units = array(snapshot?.units).filter(unit => unit && unit.removed !== true);
  const unitMap = new Map(units.map(unit => [unit.id, unit]));
  const rowsByUnit = new Map(units.map(unit => [unit.id, []]));
  for (const position of array(snapshot?.positions)) {
    if (!unitMap.has(position?.unitId)) continue;
    const parsed = parsePosition(position);
    if (!parsed) pendingUnits.add(position.unitId);
    else if (parsed.parsedQuantity > 0n) rowsByUnit.get(position.unitId).push(parsed);
  }
  const headByUnit = new Map();
  for (const unit of units) {
    const commands = rowsByUnit.get(unit.id).filter(row => row.parsedCategory === 1);
    const head = commands.reduce((highest, row) => !highest || row.parsedLevel > highest.parsedLevel ? row : highest, null);
    if (head) headByUnit.set(unit.id, head);
  }
  function push(unit, code, message, source, details = {}) {
    alerts.push({ severity: 'warning', status: 'model-review', unitId: unit.id, code, message, source, ...details });
  }

  for (const unit of units) {
    const rows = rowsByUnit.get(unit.id), head = headByUnit.get(unit.id);
    for (const row of rows) {
      const rule = ROLE_RULES.get(normalize(row.denomination));
      if (!rule) {
        push(unit, 'denomination_unmapped', `Confira o enquadramento de “${row.denomination}”; a denominação não consta da tabela de referência implementada.`, SOURCES.classification, { positionId: row.id });
        continue;
      }
      if (row.parsedCategory !== rule.category) {
        const kind = rule.category === 1 ? 'comando (1)' : 'assessoramento (2)';
        push(unit, 'category_incompatible', `“${row.denomination}” está associado a ${row.code}; a referência prevê código de ${kind}.`, normalize(row.denomination) === normalize('Chefe de Assessoria') ? SOURCES.assessmentHead : SOURCES.classification,
          { severity: 'error', status: 'verified', positionId: row.id, observed: { code: row.code, expectedCategory: rule.category } });
      }
      if (row.parsedLevel < rule.min || row.parsedLevel > rule.max) {
        const range = rule.min === rule.max ? `${rule.min}` : `${rule.min} a ${rule.max}`;
        push(unit, 'level_incompatible', `“${row.denomination}” está no nível ${row.parsedLevel}; a tabela do regime prevê ${range}. Confira o enquadramento e eventual exceção específica.`, SOURCES.classification,
          { status: 'verified', positionId: row.id, observed: { level: row.parsedLevel, min: rule.min, max: rule.max } });
      }
    }
    // A missing/invalid input may conceal the commander. Do not turn it into absence.
    if (pendingUnits.has(unit.id)) continue;
    if (!head) {
      const previouslyHadCommand = baseHasCommand.has(unit.id);
      if (previouslyHadCommand || unit.origin === 'added' || !originals.has(unit.id)) {
        push(unit, rows.length ? 'missing_commander' : 'unit_without_positions', rows.length
          ? 'A unidade está sem cargo ou função de comando (código 1). Defina seu titular.'
          : 'A unidade continua ativa, mas está sem cargos ou funções. Defina o titular ou retire a unidade.', SOURCES.head,
        { severity: 'error', status: 'verified' });
      } else {
        push(unit, 'reference_head_unconfirmed', 'O quadro de origem desta unidade não identifica um código de comando. Confira a titularidade e eventual regime específico com a área técnica.', SOURCES.head);
      }
    } else {
      const commandQuantity = rows.filter(row => row.parsedCategory === 1).reduce((sum, row) => sum + row.parsedQuantity, 0n);
      if (commandQuantity > 1n) {
        push(unit, 'multiple_command_positions', `Há ${commandQuantity} cargos ou funções de comando na mesma unidade. Confira a titularidade e a distribuição.`, SOURCES.head,
          { observed: { commandQuantity: commandQuantity.toString() } });
      }
      for (const row of rows.filter(row => row.parsedCategory === 2 && row.parsedLevel >= head.parsedLevel)) {
        push(unit, 'subordinate_level_not_lower', `O nível ${row.parsedLevel} de “${row.denomination}” deve ser inferior ao nível ${head.parsedLevel} do titular da unidade.`, SOURCES.hierarchy,
          { severity: 'error', status: 'verified', positionId: row.id, observed: { level: row.parsedLevel, headLevel: head.parsedLevel } });
      }
      const parent = unitMap.get(unit.parentUnitId), parentHead = headByUnit.get(unit.parentUnitId);
      if (parent && parentHead && !pendingUnits.has(parent.id) && head.parsedLevel >= parentHead.parsedLevel) {
        push(unit, 'unit_head_level_not_lower', `O titular desta unidade está no nível ${head.parsedLevel}, igual ou superior ao nível ${parentHead.parsedLevel} do titular de “${parent.name}”. Confira a vinculação.`, SOURCES.hierarchy,
          { observed: { level: head.parsedLevel, parentLevel: parentHead.parsedLevel, parentUnitId: parent.id } });
      }
    }

    const classification = unitClassification(unit, head, originals.get(unit.id));
    if (classification.type && !classification.explicit) inferredUnitTypes.push({ unitId: unit.id, type: classification.type });
    if (!classification.explicit && !originals.has(unit.id) && /ouvidoria|integridade|correição|corregedoria|auditoria/iu.test(unit.name ?? '')) {
      push(unit, 'unit_type_unconfirmed', 'O nome sugere uma área de controle. Informe o tipo da unidade para conferir o parâmetro aplicável do Anexo VIII.', SOURCES.annexVIII);
    }
    if (head && ['ouvidoria', 'integridade'].includes(classification.type) && head.parsedLevel < 5) {
      push(unit, 'control_unit_below_minimum', `O titular de ${classification.type === 'ouvidoria' ? 'Ouvidoria' : 'Integridade'} está no nível ${head.parsedLevel}; o Anexo VIII prevê mínimo 5 para a SGGD.`, SOURCES.annexVIII,
        { severity: classification.explicit ? 'error' : 'warning', status: classification.explicit ? 'verified' : 'model-review', positionId: head.id, observed: { level: head.parsedLevel, minimum: 5, unitType: classification.type } });
    }
    if (['correicao', 'auditoria'].includes(classification.type)) {
      push(unit, 'control_unit_not_applicable', 'O Anexo VIII marca esta área como não aplicável à SGGD. Confira o enquadramento e eventual ato específico antes de mantê-la na proposta.', SOURCES.annexVIII,
        { observed: { unitType: classification.type } });
    }
    const typeRule = TYPE_RULES[classification.type];
    if (head && typeRule) {
      const children = units.filter(child => child.parentUnitId === unit.id);
      const eligible = children.filter(child => {
        const childHead = headByUnit.get(child.id);
        return !pendingUnits.has(child.id) && childHead && childHead.parsedLevel < head.parsedLevel && childHead.parsedLevel >= head.parsedLevel - typeRule.levelGap;
      });
      if (eligible.length < typeRule.minChildren) {
        const exception = classification.type === 'subsecretaria' ? ' Confira também a hipótese alternativa do art. 17, II.' : '';
        push(unit, 'insufficient_subordinate_units', `Foram identificadas ${eligible.length} unidades diretamente vinculadas com titular até ${typeRule.levelGap} nível(is) abaixo; a regra prevê mínimo ${typeRule.minChildren}.${exception} Confirme as vinculações e os demais requisitos com a área técnica.`, typeRule.source,
          { status: classification.explicit && !children.some(child => pendingUnits.has(child.id)) ? 'verified' : 'model-review',
            observed: { count: eligible.length, minimum: typeRule.minChildren, levelGap: typeRule.levelGap, unitType: classification.type } });
      }
    }
  }
  return { alerts, pendingUnits: [...pendingUnits], inferredUnitTypes };
}

const signature = alert => JSON.stringify([alert.unitId, alert.positionId ?? null, alert.code, alert.observed ?? null]);
const inherited = alert => ({ ...alert, severity: 'warning', status: 'model-review', ruleStatus: alert.status, origin: 'baseline' });

/**
 * Pure review of the complete SGGD proposal, independent of screen filters.
 * `verified` means the cited rule was checked, not that the proposal is approved.
 * Alerts inherited unchanged from the source remain separate review findings.
 * Numerical validation, quota limits and export decisions belong to their owners.
 */
export function evaluateStructureRules(proposal, base) {
  if (base?.organizationId !== 'sggd' || proposal?.organizationId !== 'sggd') {
    return { alerts: [], baselineAlerts: [], coverage: { supported: false, scope: 'sggd', reason: 'organization_not_supported' } };
  }
  const reference = inspect(base, base), current = inspect(proposal, base);
  const baselineSignatures = new Set(reference.alerts.map(signature));
  return {
    alerts: current.alerts.map(alert => baselineSignatures.has(signature(alert)) ? inherited(alert) : { ...alert, origin: 'new' }),
    baselineAlerts: reference.alerts.map(inherited),
    coverage: {
      supported: true, scope: 'sggd', checkedAt: '2026-10-22',
      pendingUnits: current.pendingUnits, inferredUnitTypes: current.inferredUnitTypes,
      limitations: [
        'Tipos inferidos do quadro e vínculos de origem ainda dependem de conferência técnica.',
        'A contagem usa vínculos diretos por identidade; não resolve pais ambíguos por nome.',
        'Não avalia atribuições, justificativas, regimes próprios ou aprovação administrativa.',
      ],
    },
  };
}
