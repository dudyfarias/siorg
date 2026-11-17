import ExcelJS from 'exceljs';
import { activeGroups, annexLabel, isSecretariat, organizationAcronym } from './data/simulator-bases.mjs';
import { formatCents, formatInteger } from './calculator.mjs';
import { deriveProposalOutputs, sortProposalPositions, annexUnitLabel } from './proposal-outputs.mjs';

// Runtime exception: this export is a browser feature. The Node-only authoring
// runtime cannot run there; ExcelJS 4.4.0 provides a document workbook/writeBuffer.
// Primary API: https://github.com/exceljs/exceljs/tree/v4.4.0#browser
// This is a protected snapshot, not the original Excel simulator or a live model.
const HEADER_ROW = 8;
const INTEGER_FORMAT = '#,##0;[Red]-#,##0';
const QUOTA_FORMAT = '#,##0.00;[Red]-#,##0.00';
const TEXT_FORMAT = '@';
const COLORS = { heading: '17344A', line: 'D9E1E7', stripe: 'F4F7F9', ink: '17232B' };
const ACTIONS = { quantity: 'Quantidade alterada', added: 'Cargo/função incluído', removed: 'Cargo/função retirado',
  code: 'Código alterado', 'unit-created': 'Unidade criada', 'unit-removed': 'Unidade retirada',
  'unit-renamed': 'Unidade renomeada', 'unit-moved': 'Unidade transferida' };

function text(value) {
  const result = value == null ? '' : String(value).split(/\r?\n/u).map(line => line.replace(/\s+/gu, ' ').trim()).join('\n').trim();
  if (result.length > 32767 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(result)) {
    throw new RangeError('Há um texto que não pode ser gravado com segurança no Excel. Revise seu tamanho e caracteres.');
  }
  return result;
}

function decimalFromCents(value) {
  const number = BigInt(value), magnitude = number < 0n ? -number : number;
  return `${number < 0n ? '-' : ''}${magnitude / 100n}.${String(magnitude % 100n).padStart(2, '0')}`;
}

// Excel preserves 15 significant decimal digits. Values beyond that boundary
// remain exact TEXT instead of silently truncating an exact BigInt calculation.
function numeric(value, cents = false) {
  if (typeof value !== 'string' || !/^-?\d+$/u.test(value)) throw new TypeError('O valor numérico da proposta está pendente ou inválido.');
  const integer = BigInt(value).toString();
  const decimal = cents ? decimalFromCents(integer) : integer;
  const asNumber = Number(decimal), magnitude = integer.replace('-', '');
  const safe = magnitude.length <= 15 && (cents ? asNumber.toFixed(2) === decimal : Number.isSafeInteger(asNumber));
  return { value: safe ? asNumber : decimal, numFmt: safe ? cents ? QUOTA_FORMAT : INTEGER_FORMAT : TEXT_FORMAT };
}

function setValue(cell, value) {
  if (value && typeof value === 'object' && Object.hasOwn(value, 'numFmt')) {
    cell.value = value.value;
    cell.numFmt = value.numFmt;
    cell.alignment = { horizontal: 'right', vertical: 'middle' };
  } else {
    // A leading =,+,-,@ stays a string. Never pass user input as a formula object.
    cell.value = value == null ? null : text(value);
    cell.numFmt = TEXT_FORMAT;
    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  }
}

function appendRow(sheet, values, { band = false } = {}) {
  const row = sheet.getRow(sheet.rowCount + 1);
  values.forEach((value, index) => setValue(row.getCell(index + 1), value));
  row.height = 30;
  row.font = { name: 'Arial', size: 10, color: { argb: COLORS.ink } };
  // Fit wrapped documentary names; no shrinking to hide clipped labels.
  const lines = values.reduce((maximum, value, index) => {
    if (value == null || typeof value === 'object') return maximum;
    return Math.max(maximum, text(value).split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / Math.max(8, (sheet.getColumn(index + 1).width || 20) - 3))), 0));
  }, 1);
  row.height = Math.max(24, Math.min(180, lines * 13 + 7));
  if (band) row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.stripe } }; });
  return row;
}

function setupSheet(workbook, name, headers, widths, metadata, generatedAt) {
  const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: HEADER_ROW, xSplit: ['Anexo II', 'Quadro demonstrativo'].includes(name) ? 0 : 1, showGridLines: false }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
  widths.forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
  const notices = [
    [2, `${name} — Exportação da proposta`],
    [3, metadata.organizationName],
    [4, `Registro de consulta gerado em ${generatedAt}. Edite no simulador e exporte novamente; este arquivo não é o modelo original.`],
    [5, `Base: ${metadata.baseVersion}. Tabela de cotas: ${metadata.catalogueVersion}.`],
    [6, metadata.notice],
    [7, 'Quantidades e cotas com mais de 15 algarismos são preservadas como texto exato. Fontes e referências na aba Calculadora.'],
  ];
  for (const [number, content] of notices) {
    sheet.mergeCells(number, 1, number, headers.length);
    const cell = sheet.getCell(number, 1);
    setValue(cell, content);
    cell.font = { name: 'Arial', size: number === 2 ? 14 : 10, bold: number === 2, color: { argb: COLORS.ink } };
    sheet.getRow(number).height = number === 2 ? 25 : 29;
  }
  const heading = sheet.getRow(HEADER_ROW);
  headers.forEach((label, index) => {
    const cell = heading.getCell(index + 1);
    cell.value = label;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.heading } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });
  heading.height = 34;
  sheet.pageSetup.printTitlesRow = `1:${HEADER_ROW}`;
  sheet.headerFooter.oddFooter = '&LExportação da proposta — em validação técnica&R&P / &N';
  return sheet;
}

function sourceRows(sheet, metadata) {
  const first = sheet.rowCount + 3;
  sheet.getCell(first, 1).value = 'Fontes públicas';
  sheet.getCell(first, 1).font = { name: 'Arial', size: 10, bold: true };
  for (const source of metadata.sources) {
    const row = appendRow(sheet, [`${source.label} — ${source.url}`]);
    sheet.mergeCells(row.number, 1, row.number, sheet.columnCount);
    row.height = 31;
  }
}

function fillRestructuring(sheet, proposal, base, outputs) {
  const originals = new Map(base.positions.map(position => [position.id, position]));
  const current = new Map(proposal.units.map(unit => [unit.id, unit]));
  const changesByUnit = new Map(outputs.summary.units.map(unit => [unit.unitId, new Set(unit.changes.map(change => change.type))]));
  const units = [...base.units.map(unit => current.get(unit.id)), ...proposal.units.filter(unit => !base.units.some(original => original.id === unit.id))];
  for (const [index, unit] of units.entries()) {
    const parentName = current.get(unit.parentUnitId)?.name || unit.parentName || '';
    const positions = sortProposalPositions(outputs.calculation.positionResults.filter(position => position.unitId === unit.id));
    const changes = changesByUnit.get(unit.id) || new Set();
    const description = [changes.has('unit-renamed') && 'Renomeada', changes.has('unit-moved') && 'Transferida',
      ['quantity', 'code', 'added', 'removed'].some(type => changes.has(type)) && 'Cargos/funções alterados'].filter(Boolean).join('; ');
    const situation = unit.removed ? 'Retirada' : unit.origin === 'added' ? 'Nova na proposta' : description || 'Mantida na proposta';
    for (const position of positions) {
      const original = originals.get(position.id), before = original?.quantity ?? '0';
      const beforeCents = original ? (BigInt(original.quantity) * BigInt(original.coefficientCents)).toString() : '0';
      appendRow(sheet, [unit.name, parentName, situation,
        position.denomination, original?.code ?? '', position.code, numeric(before), numeric(position.quantity),
        numeric(position.coefficientCents, true), numeric(beforeCents, true), numeric(position.quotaCents, true)], { band: index % 2 === 1 });
    }
    if (!positions.length) appendRow(sheet, [unit.name, parentName, situation,
      '', '', '', numeric('0'), numeric('0'), null, numeric('0', true), numeric('0', true)], { band: index % 2 === 1 });
  }
  sheet.autoFilter = { from: { row: HEADER_ROW, column: 1 }, to: { row: sheet.rowCount, column: 11 } };
}

function fillCalculator(sheet, outputs, base) {
  const { summary } = outputs, availability = summary.availability;
  if (availability?.status !== 'available' || availability.proposalStatus !== 'complete') throw new Error('Os limites e a alocação de referência não estão disponíveis para exportação.');
  for (const group of activeGroups(base)) for (const [key, measure, label] of [['quantity', 'quantity', 'Quantitativo'], ['quotaCents', 'quotas', 'Cotas']]) {
    const cents = key === 'quotaCents', comparison = summary.comparisons.groups[group][key];
    appendRow(sheet, [group, label, numeric(availability.limits.groups[group][key], cents), numeric(comparison.before, cents),
      numeric(comparison.after, cents), numeric(comparison.delta, cents), numeric(availability.currentBalance.groups[group][measure].balance, cents),
      numeric(availability.proposedBalance.groups[group][measure].balance, cents)]);
  }
  const noteRow = sheet.rowCount + 2;
  sheet.mergeCells(noteRow, 1, noteRow, 8);
  setValue(sheet.getCell(noteRow, 1), isSecretariat(base)
    ? 'Anexo III = limites; Anexo II = alocação documental. Saldo = limite − alocação/proposta. CCESP e FCESP não se compensam.'
    : 'Saldo = referência − alocação ou proposta, por espécie e medida.');
  if (base.originalReference) {
    const row = noteRow + 1;
    sheet.mergeCells(row, 1, row, 8);
    setValue(sheet.getCell(row, 1), `Quadro original da LC nº 1.413/2024: ${formatInteger(base.originalReference.quantity)} cargos e ${formatCents(base.originalReference.quotaCents)} cotas. ${base.originalReference.note}`);
    sheet.getRow(row).height = 31;
  }
  sheet.getRow(noteRow).height = 30;
  sourceRows(sheet, outputs.metadata);
}

function fillSummary(sheet, proposal, base, outputs) {
  const originals = new Map(base.positions.map(position => [position.id, position]));
  for (const [index, unit] of outputs.summary.units.entries()) for (const change of unit.changes) {
    const structural = change.type.startsWith('unit-'), original = originals.get(change.positionId);
    appendRow(sheet, [unit.beforeName, unit.afterName, unit.beforeParentName, unit.afterParentName, ACTIONS[change.type] || change.type,
      change.denomination || '', structural ? '' : change.beforeCode || original?.code || '', structural ? '' : change.afterCode || change.code,
      structural ? null : numeric(change.before), structural ? null : numeric(change.after), structural ? null : numeric(change.delta),
      structural ? null : numeric(change.quotas.before, true), structural ? null : numeric(change.quotas.after, true),
      structural ? null : numeric(change.quotas.delta, true), unit.sourceRow === null ? 'Unidade criada na proposta' : `Linha ${unit.sourceRow} do modelo de origem`], { band: index % 2 === 1 });
  }
  if (!outputs.summary.units.length) appendRow(sheet, ['Nenhuma alteração em relação à estrutura alocada.']);
  sheet.autoFilter = { from: { row: HEADER_ROW, column: 1 }, to: { row: sheet.rowCount, column: 15 } };
  const notes = [
    `${outputs.rules.baselineAlerts.length} apontamento(s) já presentes na base continuam para revisão técnica; não são alterações do usuário.`,
    ...outputs.rules.alerts.filter(alert => alert.origin === 'new').map(alert => `${proposal.units.find(unit => unit.id === alert.unitId)?.name || 'Proposta'}: ${alert.message}`),
  ];
  for (const note of notes) {
    const row = sheet.rowCount + 2;
    sheet.mergeCells(row, 1, row, 15);
    setValue(sheet.getCell(row, 1), note);
    sheet.getRow(row).height = 29;
  }
  sourceRows(sheet, outputs.metadata);
}

/** Produce a browser-downloadable, full-proposal XLSX snapshot. No file I/O or stale result input. */
export async function createProposalXlsx(proposal, base, { generatedAt } = {}) {
  const draft = structuredClone(proposal), source = structuredClone(base);
  const outputs = deriveProposalOutputs(draft, source);
  if (!outputs.canGenerateAnnex) {
    const error = new Error('A proposta está incompleta ou inconsistente. Corrija as pendências antes de gerar o Excel completo.');
    error.code = 'proposal_incomplete';
    throw error;
  }
  if (!outputs.canDownloadAnnex) {
    const error = new Error('Há uma regra verificada pendente na proposta. Resolva os bloqueios antes de gerar o Excel com o Anexo II.');
    error.code = 'proposal_rule_blocked';
    throw error;
  }
  const date = generatedAt === undefined ? new Date() : new Date(generatedAt);
  if (Number.isNaN(date.getTime())) throw new RangeError('A data de geração do Excel é inválida.');
  const timestamp = date.toISOString(), workbook = new ExcelJS.Workbook();
  workbook.creator = 'Simulador SIORG';
  workbook.title = `Exportação da proposta — ${organizationAcronym(source)}`;
  const secretariat = isSecretariat(source);
  workbook.subject = 'Proposta completa em validação técnica; registro para consulta';
  workbook.created = date;
  workbook.modified = date;
  const structure = setupSheet(workbook, 'Reestruturação', ['UNIDADE', 'VÍNCULO NA PROPOSTA', 'SITUAÇÃO DA UNIDADE', 'DENOMINAÇÃO CARGO/FUNÇÃO',
    secretariat ? 'CÓDIGO ALOCADO (II)' : 'CÓDIGO ALOCADO', 'CÓDIGO PROPOSTO', secretariat ? 'QTD ALOCADA (II)' : 'QTD ALOCADA', 'QTD PROPOSTA', 'COTA UNITÁRIA PROPOSTA', secretariat ? 'COTAS ALOCADAS (II)' : 'COTAS ALOCADAS', 'COTAS PROPOSTAS'],
  [39, 39, 23, 35, 19, 19, 17, 17, 20, 20, 20], outputs.metadata, timestamp);
  fillRestructuring(structure, draft, source, outputs);
  const calculator = setupSheet(workbook, 'Calculadora', ['ESPÉCIE', 'MEDIDA', secretariat ? 'LIMITE (III)' : 'REFERÊNCIA', secretariat ? 'ALOCADO (II)' : 'ALOCADO', 'PROPOSTA', 'VARIAÇÃO', 'SALDO ALOCADO', 'SALDO PROPOSTO'],
    [15, 18, 20, 20, 20, 22, 24, 24], outputs.metadata, timestamp);
  fillCalculator(calculator, outputs, source);
  const summary = setupSheet(workbook, 'Resumo', ['UNIDADE DE ORIGEM', 'UNIDADE NA PROPOSTA', 'VÍNCULO DE ORIGEM', 'VÍNCULO NA PROPOSTA', 'ALTERAÇÃO', 'CARGO/FUNÇÃO',
    'CÓDIGO DE ORIGEM', 'CÓDIGO PROPOSTO', 'QTD ORIGEM', 'QTD PROPOSTA', 'VARIAÇÃO QTD', 'COTAS ORIGEM', 'COTAS PROPOSTA', 'VARIAÇÃO COTAS', 'LOCALIZAÇÃO NO MODELO'],
  [35, 35, 35, 35, 24, 32, 18, 18, 15, 15, 17, 18, 18, 18, 28], outputs.metadata, timestamp);
  fillSummary(summary, draft, source, outputs);
  const annex = setupSheet(workbook, annexLabel(source), outputs.annex.columns, [60, 12, 45, 20], outputs.metadata, timestamp);
  let previousUnit = null, band = false;
  for (const row of outputs.annex.rows) {
    if (previousUnit !== row.unitId) { band = !band; previousUnit = row.unitId; }
    appendRow(annex, [annexUnitLabel(row), numeric(row.quantity), row.denomination, row.code], { band });
  }
  // Empty password is an editing guard, not confidentiality or tamper evidence.
  for (const sheet of workbook.worksheets) await sheet.protect('', { selectLockedCells: true, autoFilter: true, spinCount: 1 });
  return new Uint8Array(await workbook.xlsx.writeBuffer());
}
