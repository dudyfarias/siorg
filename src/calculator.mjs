/** Pure calculation and plain-text export. All public numeric results are exact strings. */
const GROUPS = ['CCESP', 'FCESP'];
const MOTOR_VERSION = '1.2.0';
const MAX_NUMERIC_LENGTH = 128;
const SOURCE_URL = 'https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/compilacao-lei.complementar-1395-22.12.2023.html';
const COEFFICIENTS = {
  CCESP: [100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 400, 450, 550, 600, 700, 800, 900],
  FCESP: [60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 240, 270, 330, 360, 420, 480, 540],
};

export const catalogue = Object.freeze({
  version: 'lc1395-anexo-i-revisao-2026-09-14',
  sourceUrl: SOURCE_URL,
  sourceLabel: 'LC 1.395/2023 — Anexo I',
  checkedAt: '2026-09-14',
  groups: Object.freeze(Object.fromEntries(GROUPS.map((group) => [group,
    Object.freeze(COEFFICIENTS[group].map((quotaCents, index) => Object.freeze({
      level: index + 1,
      label: index === 17 ? 'Nível 18 (NES)' : `Nível ${index + 1}`,
      quotaCents: String(quotaCents),
    }))),
  ]))),
});

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function issue(code, field, message, options = {}) {
  return { code, field, path: field, message, severity: 'error', ...options };
}

function inputText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isSafeInteger(value)) return String(value);
  return null;
}

function parseNumeric(value, decimal = false) {
  const text = inputText(value);
  if (text === '') return { status: 'missing', value: null };
  if (text === null) return { status: 'invalid', value: null, reason: 'invalid_number' };
  if (text.length > MAX_NUMERIC_LENGTH) {
    return { status: 'invalid', value: null, reason: 'input_too_long' };
  }
  const pattern = decimal ? /^\d+(?:[.,]\d{1,2})?$/u : /^\d+$/u;
  if (!pattern.test(text)) return { status: 'invalid', value: null, reason: 'invalid_number' };
  if (!decimal) return { status: 'valid', value: BigInt(text).toString() };
  const [whole, fraction = ''] = text.split(/[.,]/u);
  return { status: 'valid', value: (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))).toString() };
}

function asInteger(value) {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return Number.isSafeInteger(value) ? BigInt(value) : null;
  if (typeof value !== 'string' || !/^-?\d+$/u.test(value)) return null;
  return BigInt(value);
}

function groupedDigits(value) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/gu, '.');
}

/** Format an exact integer string, bigint, or safe integer; absent/invalid values use an em dash. */
export function formatInteger(value, { signed = false } = {}) {
  const number = asInteger(value);
  if (number === null) return '—';
  const prefix = number < 0n ? '−' : signed && number > 0n ? '+' : '';
  return prefix + groupedDigits((number < 0n ? -number : number).toString());
}

/** The input is integer CENTESIMOS, not a decimal number of cotas. */
export function formatCents(value, { signed = false } = {}) {
  const number = asInteger(value);
  if (number === null) return '—';
  const magnitude = number < 0n ? -number : number;
  const prefix = number < 0n ? '−' : signed && number > 0n ? '+' : '';
  return `${prefix}${groupedDigits((magnitude / 100n).toString())},${(magnitude % 100n).toString().padStart(2, '0')}`;
}

function normalizeLevel(value) {
  const text = inputText(value);
  if (text === null || !/^\d{1,2}$/u.test(text)) return null;
  const level = Number(text);
  return level >= 1 && level <= 18 ? level : null;
}

function cleanContext(input) {
  const context = record(input);
  const clean = {};
  for (const key of ['organization', 'scope', 'nature', 'date', 'source']) {
    clean[key] = typeof context[key] === 'string' ? context[key].trim() : '';
  }
  clean.equivalent = typeof context.equivalent === 'boolean' ? context.equivalent : null;
  return clean;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

function contextIssues(context) {
  const labels = {
    organization: 'Informe o órgão ou a entidade da base atual.',
    scope: 'Informe a abrangência da base atual.',
    nature: 'Informe a natureza da base atual.',
    date: 'Informe a data da base atual.',
    source: 'Informe a origem da base atual.',
  };
  const issues = [];
  for (const [key, message] of Object.entries(labels)) {
    if (!context[key]) issues.push(issue('missing_context', `context.${key}`, message, { severity: 'warning' }));
  }
  if (context.date && !validDate(context.date)) {
    issues.push(issue('invalid_date', 'context.date', 'Informe uma data real no formato ano-mês-dia.'));
  }
  if (context.equivalent !== true) {
    issues.push(issue(context.equivalent === false ? 'incompatible_context' : 'missing_equivalence',
      'context.equivalent', 'A comparação exige confirmação de natureza e abrangência equivalentes.', { severity: 'warning' }));
  }
  return issues;
}

function parseCurrentField(value, field, decimal, issues) {
  const parsed = parseNumeric(value, decimal);
  if (parsed.status !== 'valid') {
    const missing = parsed.status === 'missing';
    issues.push(issue(missing ? 'missing_current' : parsed.reason, field,
      missing ? 'Base atual não informada: esta comparação ficará indisponível.'
        : decimal ? 'Informe cotas não negativas, sem milhar e com até duas casas decimais.'
          : 'Informe uma quantidade inteira não negativa, sem separador de milhar.',
      { severity: missing ? 'warning' : 'error' }));
  }
  return { ...parsed, enteredValue: typeof value === 'string' || typeof value === 'number' ? String(value) : null };
}

function deriveCurrentField(groups, key) {
  const fields = GROUPS.map((group) => groups[group][key]);
  const status = fields.some((field) => field.status === 'invalid') ? 'invalid'
    : fields.some((field) => field.status !== 'valid') ? 'missing' : 'valid';
  return {
    status,
    value: status === 'valid' ? fields.reduce((sum, field) => sum + BigInt(field.value), 0n).toString() : null,
    enteredValue: null,
  };
}

function unavailable(reason, proposed = null, current = null) {
  return { status: 'unavailable', reason, current, proposed, delta: null, direction: null };
}

function comparison(proposal, key, current, contextProblems) {
  const proposed = proposal[key];
  if (proposal.status !== 'complete') {
    return unavailable(proposal.status === 'empty' ? 'empty_proposal' : 'incomplete_proposal', proposed, current.value);
  }
  if (current.status !== 'valid') {
    return unavailable(current.status === 'missing' ? 'missing_current' : 'invalid_current', proposed, current.value);
  }
  if (contextProblems.length) {
    return unavailable(contextProblems.some(({ code }) => code === 'incompatible_context')
      ? 'incompatible_context' : 'incomplete_context', proposed, current.value);
  }
  const delta = BigInt(proposed) - BigInt(current.value);
  return {
    status: 'available', reason: null, current: current.value, proposed,
    delta: delta.toString(), direction: delta > 0n ? 'increase' : delta < 0n ? 'decrease' : 'unchanged',
  };
}

/**
 * @param {object} input
 * @param {{id:string,group:'CCESP'|'FCESP',level:number|string,quantity:string}[]} input.rows
 * @param {{mode:'none'|'group'|'aggregate',groups?:object,aggregate?:object}} input.current
 * @param {{organization:string,scope:string,nature:string,date:string,source:string,equivalent:boolean}} input.context
 * @param {'arithmetic'|'declared-equivalence'} [input.comparisonBasis] Arithmetic reports only numerical differences, with no assertion that contexts match.
 * @returns {object} Serializable snapshot: quantity/quotaCents/delta are exact integer strings or null.
 * Arithmetic group mode also derives current.aggregate and its comparisons, per measure,
 * only from the two active group inputs. Its descriptive total never offsets group signs.
 */
export function calculateScenario(input = {}) {
  const source = record(input);
  const issues = [];
  const context = cleanContext(source.context);
  const comparisonBasis = source.comparisonBasis === 'arithmetic' ? 'arithmetic' : 'declared-equivalence';
  const malformedRows = source.rows !== undefined && !Array.isArray(source.rows);
  const rawRows = Array.isArray(source.rows) ? source.rows : [];
  const idCounts = new Map();
  const pairCounts = new Map();
  for (const raw of rawRows) {
    const row = record(raw);
    if (typeof row.id === 'string' && row.id.trim()) idCounts.set(row.id, (idCounts.get(row.id) ?? 0) + 1);
    const level = normalizeLevel(row.level);
    if (GROUPS.includes(row.group) && level !== null) {
      const pair = `${row.group}:${level}`;
      pairCounts.set(pair, (pairCounts.get(pair) ?? 0) + 1);
    }
  }

  let globalError = malformedRows;
  if (malformedRows) issues.push(issue('invalid_rows', 'rows', 'A composição deve ser uma lista de itens.'));
  const rows = rawRows.map((raw, index) => {
    const row = record(raw);
    const id = typeof row.id === 'string' ? row.id : '';
    const field = `rows.${id || index}`;
    const group = GROUPS.includes(row.group) ? row.group : null;
    const level = normalizeLevel(row.level);
    const rowIssues = [];
    const rowIssue = (code, suffix, message) => rowIssues.push(issue(code, `${field}.${suffix}`, message,
      { ...(group ? { group } : {}), rowId: id }));
    if (!id.trim()) rowIssue('missing_row_id', 'id', 'O item precisa de um identificador único.');
    else if (idCounts.get(id) > 1) rowIssue('duplicate_row_id', 'id', 'Há itens com o mesmo identificador.');
    if (!group) {
      rowIssue('invalid_group', 'group', 'Selecione CCESP ou FCESP.');
      globalError = true;
    }
    if (level === null) rowIssue('invalid_level', 'level', 'Selecione um nível de 1 a 18.');
    if (group && level !== null && pairCounts.get(`${group}:${level}`) > 1) {
      rowIssue('duplicate_item', 'level', 'Este grupo e nível já estão incluídos. Ajuste a quantidade do item existente.');
    }
    const quantity = parseNumeric(row.quantity);
    if (quantity.status !== 'valid') {
      rowIssue(quantity.status === 'missing' ? 'missing_quantity' : quantity.reason, 'quantity',
        quantity.status === 'missing' ? 'Informe a quantidade deste item ou remova-o da composição.'
          : quantity.reason === 'input_too_long' ? `A entrada excede o limite técnico de ${MAX_NUMERIC_LENGTH} caracteres.`
            : 'Informe uma quantidade inteira não negativa, sem separador de milhar.');
    }
    const coefficient = group && level !== null ? catalogue.groups[group].find((item) => item.level === level) : null;
    if (group && level !== null && (!coefficient || !/^[1-9]\d*$/u.test(coefficient.quotaCents))) {
      rowIssue('missing_coefficient', 'level', 'Não há coeficiente válido na versão da tabela para este item.');
    }
    const complete = rowIssues.length === 0;
    issues.push(...rowIssues);
    return {
      id, group, level, quantity: quantity.value,
      enteredQuantity: typeof row.quantity === 'string' ? row.quantity : inputText(row.quantity),
      coefficientCents: coefficient?.quotaCents ?? null,
      quotaCents: complete ? (BigInt(quantity.value) * BigInt(coefficient.quotaCents)).toString() : null,
      status: complete ? 'complete' : 'incomplete', issues: rowIssues,
    };
  });

  const empty = rawRows.length === 0 && !malformedRows;
  if (empty) issues.push(issue('empty_scenario', 'rows', 'Inclua ao menos um item para compor a proposta.', { severity: 'warning' }));
  const groups = Object.fromEntries(GROUPS.map((group) => {
    const groupRows = rows.filter((row) => row.group === group);
    const status = globalError || groupRows.some((row) => row.status !== 'complete') ? 'incomplete' : empty ? 'empty' : 'complete';
    return [group, {
      status,
      quantity: status === 'complete' ? groupRows.reduce((sum, row) => sum + BigInt(row.quantity), 0n).toString() : null,
      quotaCents: status === 'complete' ? groupRows.reduce((sum, row) => sum + BigInt(row.quotaCents), 0n).toString() : null,
      rows: groupRows,
    }];
  }));
  const status = GROUPS.some((group) => groups[group].status === 'incomplete') ? 'incomplete' : empty ? 'empty' : 'complete';
  const aggregate = {
    status,
    quantity: status === 'complete' ? GROUPS.reduce((sum, group) => sum + BigInt(groups[group].quantity), 0n).toString() : null,
    quotaCents: status === 'complete' ? GROUPS.reduce((sum, group) => sum + BigInt(groups[group].quotaCents), 0n).toString() : null,
    rows,
  };

  const currentInput = record(source.current);
  const rawMode = currentInput.mode ?? 'none';
  const modeValid = ['none', 'group', 'aggregate'].includes(rawMode);
  const mode = modeValid ? rawMode : 'none';
  if (!modeValid) issues.push(issue('invalid_mode', 'current.mode', 'Selecione o modo da situação atual.'));
  const current = { mode, groups: {}, aggregate: null };
  const contextProblems = mode !== 'none' && comparisonBasis !== 'arithmetic' ? contextIssues(context) : [];
  issues.push(...contextProblems);
  if (mode === 'group') {
    for (const group of GROUPS) {
      const base = record(record(currentInput.groups)[group]);
      current.groups[group] = {
        quantity: parseCurrentField(base.quantity, `current.groups.${group}.quantity`, false, issues),
        quotas: parseCurrentField(base.quotas, `current.groups.${group}.quotas`, true, issues),
      };
    }
    if (comparisonBasis === 'arithmetic') {
      current.aggregate = {
        derived: true,
        quantity: deriveCurrentField(current.groups, 'quantity'),
        quotas: deriveCurrentField(current.groups, 'quotas'),
      };
    }
  } else if (mode === 'aggregate') {
    const base = record(currentInput.aggregate);
    current.aggregate = {
      quantity: parseCurrentField(base.quantity, 'current.aggregate.quantity', false, issues),
      quotas: parseCurrentField(base.quotas, 'current.aggregate.quotas', true, issues),
    };
  }
  const inactiveReason = !modeValid ? 'invalid_mode' : mode === 'none' ? 'no_base' : 'inactive_mode';
  const comparisons = {
    mode,
    groups: Object.fromEntries(GROUPS.map((group) => [group, {
      quantity: mode === 'group' ? comparison(groups[group], 'quantity', current.groups[group].quantity, contextProblems)
        : unavailable(mode === 'aggregate' ? 'no_group_base' : inactiveReason, groups[group].quantity),
      quotas: mode === 'group' ? comparison(groups[group], 'quotaCents', current.groups[group].quotas, contextProblems)
        : unavailable(mode === 'aggregate' ? 'no_group_base' : inactiveReason, groups[group].quotaCents),
    }])),
    aggregate: {
      quantity: current.aggregate ? comparison(aggregate, 'quantity', current.aggregate.quantity, contextProblems)
        : unavailable(inactiveReason, aggregate.quantity),
      quotas: current.aggregate ? comparison(aggregate, 'quotaCents', current.aggregate.quotas, contextProblems)
        : unavailable(inactiveReason, aggregate.quotaCents),
    },
  };
  return { status, groups, aggregate, comparisons, issues, context, current, comparisonBasis,
    catalogueVersion: catalogue.version, motorVersion: MOTOR_VERSION,
    catalogueSource: catalogue.sourceUrl, catalogueCheckedAt: catalogue.checkedAt };
}

function plain(value) {
  return typeof value === 'string' && value.trim() ? value.replace(/\s+/gu, ' ').trim() : 'não informado';
}

function readableDate(value) {
  return validDate(value) ? value.split('-').reverse().join('/') : plain(value);
}

const REASONS = {
  no_base: 'sem situação atual informada',
  no_group_base: 'sem base atual por grupo',
  inactive_mode: 'comparação não utilizada neste modo',
  invalid_mode: 'modo de base atual inválido',
  missing_current: 'base atual não informada',
  invalid_current: 'base atual inválida',
  empty_proposal: 'composição ainda vazia',
  incomplete_proposal: 'composição incompleta',
  incomplete_context: 'identificação ou equivalência da base pendente',
  incompatible_context: 'bases sem equivalência confirmada',
};

function summaryIssueLabel(item, snapshot) {
  const labels = {
    'current.groups.CCESP.quantity': 'Quantidade atual de cargos CCESP',
    'current.groups.CCESP.quotas': 'Cotas atuais CCESP',
    'current.groups.FCESP.quantity': 'Quantidade atual de funções FCESP',
    'current.groups.FCESP.quotas': 'Cotas atuais FCESP',
    'current.aggregate.quantity': 'Quantidade atual agregada',
    'current.aggregate.quotas': 'Cotas atuais agregadas',
  };
  if (labels[item.field]) return labels[item.field];
  if (item.rowId !== undefined) {
    const row = snapshot.aggregate.rows.find((entry) => entry.id === item.rowId);
    return [item.group, row?.level ? `nível ${row.level}${row.level === 18 ? ' (NES)' : ''}` : null]
      .filter(Boolean).join(', ') || 'Item da composição';
  }
  return '';
}

/** Export the exact result snapshot used by the screen; no HTML and no clock/network/storage. */
export function buildSummary(input, result, { isExample = false, generatedAt } = {}) {
  const snapshot = result ?? calculateScenario(input);
  const mode = snapshot.current.mode;
  const lines = ['CALCULADORA DE COTAS — SIORG'];
  if (isExample) lines.push('EXEMPLO FICTÍCIO — dados demonstrativos, sem vínculo com órgão real.');
  if (snapshot.status !== 'complete') lines.push('RASCUNHO INCOMPLETO — não contém todos os totais.');
  else lines.push('Composição calculada — conferência aritmética.');
  if (generatedAt) lines.push(`Gerado em: ${plain(generatedAt)}`);
  if (snapshot.comparisonBasis !== 'arithmetic' || snapshot.context.organization || snapshot.context.scope) {
    lines.push('', `Órgão ou entidade: ${plain(snapshot.context.organization)}`,
      `Abrangência da proposta: ${plain(snapshot.context.scope)}`);
  }
  if (snapshot.comparisonBasis === 'arithmetic' && mode !== 'none') {
    lines.push('Diferenças aritméticas sobre os totais informados. Natureza e abrangência dos dados não foram validadas.');
  } else if (mode !== 'none') {
    lines.push(`Natureza da base atual: ${plain(snapshot.context.nature)}`,
      `Data da base atual: ${readableDate(snapshot.context.date)}`,
      `Origem da base atual: ${plain(snapshot.context.source)}`,
      isExample ? 'Equivalência: configuração fictícia de demonstração.'
        : `Equivalência declarada: ${snapshot.context.equivalent === true ? 'confirmada pelo usuário' : 'não confirmada'}`);
  }
  lines.push('', 'COMPOSIÇÃO PROPOSTA');
  for (const group of GROUPS) {
    const proposal = snapshot.groups[group];
    lines.push('', group);
    if (!proposal.rows.length) lines.push(snapshot.status === 'empty' ? 'Nenhum item incluído; cenário vazio.' : 'Nenhum item incluído neste grupo.');
    for (const row of proposal.rows) {
      const label = row.level === 18 ? 'Nível 18 (NES)' : row.level === null ? 'Nível não identificado' : `Nível ${row.level}`;
      if (row.status === 'complete') {
        lines.push(`${label}: ${formatInteger(row.quantity)} × ${formatCents(row.coefficientCents)} = ${formatCents(row.quotaCents)} cotas.`);
      } else {
        lines.push(`${label}: entrada de quantidade “${plain(row.enteredQuantity)}”; item incompleto.`);
      }
    }
    if (proposal.status === 'complete') {
      lines.push(`Total ${group}: ${formatInteger(proposal.quantity)} ${group === 'CCESP' ? 'cargos' : 'funções'}; ${formatCents(proposal.quotaCents)} cotas.`);
    } else lines.push(`Total ${group}: indisponível (${proposal.status === 'empty' ? 'cenário vazio' : 'composição incompleta'}).`);
  }
  if (snapshot.aggregate.status === 'complete') {
    lines.push('', `Total geral descritivo: ${formatInteger(snapshot.aggregate.quantity)} postos; ${formatCents(snapshot.aggregate.quotaCents)} cotas.`);
  }
  lines.push('', 'VARIAÇÃO EM RELAÇÃO À SITUAÇÃO ATUAL INFORMADA');
  lines.push(`Modo da base atual: ${mode === 'group' ? 'por grupo' : mode === 'aggregate' ? 'agregado' : 'sem comparação'}.`);
  const appendComparison = (label, value, isQuota, currentField, derived = false) => {
    const format = isQuota ? formatCents : formatInteger;
    if (value.status !== 'available') {
      const entered = currentField.status === 'invalid' && !derived
        ? `; entrada atual inválida: “${plain(currentField.enteredValue)}”`
        : value.current !== null ? `; atual informado: ${format(value.current)}` : '';
      lines.push(`${label}: indisponível — ${REASONS[value.reason] ?? 'pendência de conferência'}${entered}.`);
      return;
    }
    const direction = value.direction === 'increase' ? 'aumento' : value.direction === 'decrease' ? 'redução' : 'sem alteração nessa medida';
    lines.push(`${label}: atual ${format(value.current)}; proposta ${format(value.proposed)}; variação ${format(value.delta, { signed: true })} (${direction}).`);
  };
  if (mode === 'group') {
    for (const group of GROUPS) {
      appendComparison(`${group === 'CCESP' ? 'Cargos' : 'Funções'} ${group}`, snapshot.comparisons.groups[group].quantity, false, snapshot.current.groups[group].quantity);
      appendComparison(`Cotas ${group}`, snapshot.comparisons.groups[group].quotas, true, snapshot.current.groups[group].quotas);
    }
    if (snapshot.current.aggregate?.derived) {
      lines.push('Agregado derivado dos dois grupos; descritivo, sem compensação entre CCESP e FCESP.');
      appendComparison('Postos agregados', snapshot.comparisons.aggregate.quantity, false, snapshot.current.aggregate.quantity, true);
      appendComparison('Cotas agregadas', snapshot.comparisons.aggregate.quotas, true, snapshot.current.aggregate.quotas, true);
    }
  } else if (mode === 'aggregate') {
    appendComparison('Postos agregados', snapshot.comparisons.aggregate.quantity, false, snapshot.current.aggregate.quantity);
    appendComparison('Cotas agregadas', snapshot.comparisons.aggregate.quotas, true, snapshot.current.aggregate.quotas);
    lines.push('Comparações por grupo: sem base atual por grupo. O agregado é apenas descritivo.');
  } else lines.push('A proposta foi calculada sem comparação com uma situação atual.');
  if (snapshot.issues.length) {
    lines.push('', 'PENDÊNCIAS');
    for (const item of snapshot.issues) {
      const label = summaryIssueLabel(item, snapshot);
      lines.push(`- ${label ? `${label}: ` : ''}${item.message}`);
    }
  }
  lines.push('', `Referência: ${catalogue.sourceLabel}.`,
    `Fonte: ${snapshot.catalogueSource}`,
    `Versão da tabela: ${snapshot.catalogueVersion}. Conferência: ${readableDate(snapshot.catalogueCheckedAt)}.`,
    'O resultado descreve quantidades, cotas e diferenças aritméticas. Não constitui saldo oficial, autorização administrativa ou validação de aplicabilidade dos níveis. Não autoriza compensação entre CCESP e FCESP.');
  return lines.join('\n');
}
