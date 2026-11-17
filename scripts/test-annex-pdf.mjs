import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createAnnexPdf } from '../src/annex-pdf.mjs';
import { deriveProposalOutputs } from '../src/proposal-outputs.mjs';
import { sggdStructure as base } from '../src/data/sggd-structure.mjs';
import { createStructureProposal, renameUnit, setPositionQuantity, removePosition, addPosition } from '../src/structure-proposal.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'evidence/simulador-saidas-2026-10-21');
const first = base.positions[0], last = base.positions.at(-1);
let proposal = createStructureProposal(base);
proposal = renameUnit(proposal, first.unitId, 'Secretaria Executiva - proposta de revisão');
proposal = setPositionQuantity(proposal, first.id, (BigInt(first.quantity) + 1n).toString());
proposal = removePosition(proposal, base.positions[1].id);
proposal = setPositionQuantity(proposal, last.id, (BigInt(last.quantity) + 2n).toString());
proposal = addPosition(proposal, { unitId: last.unitId, templateId: first.id, quantity: '2' }, base);
const outputs = deriveProposalOutputs(proposal, base);
const pdf = createAnnexPdf(proposal, base, { generatedAt: '2026-10-21T15:00:00.000Z' });
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, 'anexo-ii-amostra.pdf'), new Uint8Array(pdf.output('arraybuffer')));
await writeFile(path.join(outputDirectory, 'anexo-ii-amostra-esperado.json'), JSON.stringify({
  purpose: 'Amostra de QA com alterações fictícias explícitas; não é proposta oficial nem arquivo publicado.',
  generatedAt: '2026-10-21T15:00:00.000Z',
  pages: pdf.getNumberOfPages(),
  rowCount: outputs.annex.rowCount,
  unitCount: outputs.annex.unitCount,
  columns: outputs.annex.columns,
  rows: outputs.annex.rows,
}, null, 2) + '\n');
console.log(JSON.stringify({ pages: pdf.getNumberOfPages(), rows: outputs.annex.rowCount, units: outputs.annex.unitCount, sample: 'evidence/simulador-saidas-2026-10-21/anexo-ii-amostra.pdf' }));
