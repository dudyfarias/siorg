import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { annexLabel } from './data/simulator-bases.mjs';
import { deriveProposalOutputs, annexUnitLabel } from './proposal-outputs.mjs';

const MARGIN = 14;
const BODY_FONT_SIZE = 9;
const COLUMN_WIDTHS = [70, 18, 64, 30];
// Helvetica's WinAnsi repertoire covers the documentary Portuguese names.
// Reject other characters explicitly instead of producing an unreadable glyph.
const PRINTABLE_TEXT = /^[\u0020-\u007e\u00a0-\u00ff\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013\u2014\u2018\u2019\u201a\u201c\u201d\u201e\u2020-\u2022\u2026\u2030\u2039\u203a\u20ac\t\n\r]*$/u;

function exportError(code, message, issues = []) {
  const error = new Error(message);
  error.name = 'AnnexPdfError';
  error.code = code;
  error.issues = issues;
  return error;
}

function ensurePrintable(value) {
  if (typeof value !== 'string' || !PRINTABLE_TEXT.test(value)) {
    throw exportError('unsupported_pdf_character', 'Um texto contém caracteres que a fonte do PDF não representa. Revise o nome da unidade antes de gerar o arquivo.');
  }
  return value;
}

function generationDate(value) {
  const date = value === undefined ? new Date() : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError('Informe uma data válida para gerar o Anexo II.');
  return date;
}

/**
 * Create a clean, whole-organization Annex II from the current proposal.
 * No UI filter, caller-supplied calculation or previously derived output is used.
 * The returned jsPDF document can be saved by the UI or inspected in tests.
 */
export function createAnnexPdf(proposal, base, { generatedAt } = {}) {
  const outputs = deriveProposalOutputs(proposal, base);
  const documentName = annexLabel(base);
  if (!outputs.canGenerateAnnex) {
    throw exportError('incomplete_proposal', `Conclua as informações da proposta em todas as unidades antes de gerar o ${documentName}.`, outputs.issues);
  }
  if (!outputs.canDownloadAnnex) throw exportError('structural_rule_block', `Confira os alertas de bloqueio da proposta antes de gerar o ${documentName}.`, outputs.ruleBlockers);

  const date = generationDate(generatedAt);
  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo',
  }).format(date);
  const organization = ensurePrintable(base.name);
  const body = outputs.annex.rows.map(row => [annexUnitLabel(row), row.quantity, row.denomination, row.code].map(ensurePrintable));
  const subtitle = `Quadro Demonstrativo dos Cargos em Comissão e das Funções de Confiança - ${organization}`;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
  doc.setLanguage('pt-BR');
  doc.setCreationDate(date);
  doc.setProperties({
    title: `${documentName} - Estrutura proposta - ${organization}`,
    subject: 'Minuta para revisão técnica',
    creator: 'Protótipo SIORG',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tableWidth = pageWidth - MARGIN * 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const subtitleLines = doc.splitTextToSize(subtitle, tableWidth);
  const subtitleHeight = subtitleLines.length * 4.2;
  const proposalLabelY = 26 + subtitleHeight;
  const allocation = base.allocationSource;
  const sourceLine = allocation ? ensurePrintable(`Base: ${allocation.label.split(' · ')[0]}`) : null;
  const tableTop = proposalLabelY + (sourceLine ? 13 : 8);

  function drawPageHeader() {
    doc.setTextColor(25, 25, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(documentName.toUpperCase(), MARGIN, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(subtitleLines, MARGIN, 25, { lineHeightFactor: 1.19 });
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('Estrutura proposta - minuta para revisão técnica', MARGIN, proposalLabelY);
    if (sourceLine) doc.textWithLink(sourceLine, MARGIN, proposalLabelY + 5, { url: allocation.url });
  }

  autoTable(doc, {
    head: [outputs.annex.columns],
    body,
    startY: tableTop,
    margin: { top: tableTop, left: MARGIN, right: MARGIN, bottom: 18 },
    tableWidth,
    theme: 'grid',
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    styles: {
      font: 'helvetica', fontStyle: 'normal', fontSize: BODY_FONT_SIZE,
      cellPadding: { top: 1.8, right: 1.8, bottom: 1.8, left: 1.8 },
      overflow: 'linebreak', valign: 'middle', textColor: [25, 25, 25],
      lineColor: [175, 175, 175], lineWidth: 0.1,
    },
    headStyles: {
      fontSize: BODY_FONT_SIZE, fontStyle: 'bold', fillColor: [235, 235, 235],
      textColor: [25, 25, 25], lineColor: [135, 135, 135],
    },
    columnStyles: Object.fromEntries(COLUMN_WIDTHS.map((width, index) => [index, {
      cellWidth: width, ...(index === 1 ? { halign: 'center' } : {}),
    }])),
    willDrawPage: drawPageHeader,
    didParseCell: ({ section, row, cell }) => {
      if (section !== 'body') return;
      // Unit identity controls grouping, including different units sharing a name.
      const current = outputs.annex.rows[row.index];
      const previous = outputs.annex.rows[row.index - 1];
      if (!previous || previous.unitId !== current.unitId) {
        cell.styles.lineWidth = { top: 0.3, right: 0.1, bottom: 0.1, left: 0.1 };
      }
    },
  });

  // autoTable must split a row taller than an entire page even with "avoid".
  // Refuse that output rather than silently break one documentary record.
  if (doc.lastAutoTable.body.some(row => row.spansMultiplePages)) {
    throw exportError('pdf_row_too_tall', 'Um nome de unidade é extenso demais para uma linha completa do quadro. Reduza o texto antes de gerar o PDF.');
  }
  if (body.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Proposta sem cargos ou funções', MARGIN, doc.lastAutoTable.finalY + 8);
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(190, 190, 190);
    doc.setLineWidth(0.15);
    doc.line(MARGIN, pageHeight - 14, pageWidth - MARGIN, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Minuta para revisão técnica | Gerado em ${dateLabel}`, MARGIN, pageHeight - 9);
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - MARGIN, pageHeight - 9, { align: 'right' });
  }
  doc.setPage(1);
  return doc;
}
