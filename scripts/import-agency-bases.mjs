import { readFile, writeFile } from 'node:fs/promises';
import { catalogue } from '../src/calculator.mjs';

const root = new URL('../evidence/agencias-2026-11-16/', import.meta.url);
const read = async name => JSON.parse(await readFile(new URL(name, root), 'utf8'));
const [water, sanitation, transport, waterHierarchy, sanitationHierarchy, transportHierarchy] = await Promise.all([
  read('sp-aguas-deliberacao-25-2026-structure.json'),
  read('arsesp-reconciliacao-1811.json'),
  read('artesp-distribuicao-722.json'),
  read('sp-aguas-regimento-21-hierarchy.json'),
  read('arsesp-hierarquia-parcial-1649.json'),
  read('artesp-vinculos-explicitos.json'),
]);
const law = {
  label: 'Lei Complementar nº 1.413/2024 · Anexo I',
  url: 'https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2024/lei.complementar-1413-23.09.2024.html',
};
const waterDecree = {
  label: 'Decreto nº 69.486/2025 · Anexo único',
  url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-69486-14.04.2025.html',
};

function totals(ccQuantity, ccQuotas, fcQuantity = 0, fcQuotas = 0) {
  const measure = (quantity, quotaCents) => ({ quantity: String(quantity), quotaCents: String(quotaCents) });
  return {
    groups: { CCESP: measure(ccQuantity, ccQuotas), FCESP: measure(fcQuantity, fcQuotas) },
    aggregate: measure(Number(ccQuantity) + Number(fcQuantity), Number(ccQuotas) + Number(fcQuotas)),
  };
}
const levelCode = level => `CCESP nível ${String(level).padStart(2, '0')}`;
function agency(config, sourceUnits, sourcePositions, hierarchy = []) {
  const links = new Map(hierarchy.map(link => [link.unitId, link]));
  const units = sourceUnits.map(({ id, name, sourceRow, documentGroup }, order) => {
    const link = links.get(id);
    const hierarchyStatus = !link ? 'not-provided' : link.parentUnitId
      ? 'model-parent-resolved' : 'model-parent-outside-units';
    return { id, name, order, sourceRow, parentUnitId: link?.parentUnitId ?? null, parentName: link?.parentName ?? null,
      hierarchyStatus, ...(documentGroup ? { documentGroup } : {}) };
  });
  const names = new Map(units.map(unit => [unit.id, unit.name]));
  if (names.size !== units.length) throw new Error(`Unidades duplicadas em ${config.acronym}`);
  if (links.size !== hierarchy.length) throw new Error(`Vínculos duplicados em ${config.acronym}`);
  for (const link of links.values()) {
    if (!names.has(link.unitId) || !link.parentName || (link.parentUnitId !== null && names.get(link.parentUnitId) !== link.parentName)) {
      throw new Error(`Vínculo documental inválido em ${config.acronym}: ${link.unitId}`);
    }
  }
  const unitsById = new Map(units.map(unit => [unit.id, unit]));
  for (const unit of units) {
    const ancestors = new Set([unit.id]);
    let parent = unitsById.get(unit.parentUnitId);
    while (parent) {
      if (ancestors.has(parent.id)) throw new Error(`Ciclo documental em ${config.acronym}: ${unit.name}`);
      ancestors.add(parent.id);
      parent = unitsById.get(parent.parentUnitId);
    }
  }
  const measured = { CCESP: [0n, 0n], FCESP: [0n, 0n] };
  const positions = sourcePositions.map(({ id, unitId, code, denomination, quantity, group, category, level, coefficientCents, sourceRow }) => {
    const unitName = names.get(unitId);
    const catalogueQuota = catalogue.groups[group]?.find(entry => entry.level === level)?.quotaCents;
    if (!unitName || catalogueQuota !== String(coefficientCents)) {
      throw new Error(`Linha ${sourceRow} de ${config.acronym} diverge da unidade ou da tabela de cotas`);
    }
    measured[group][0] += BigInt(quantity);
    measured[group][1] += BigInt(quantity) * BigInt(coefficientCents);
    return { id, unitId, unitName, code, denomination, quantity: String(quantity), group, category, level,
      coefficientCents: String(coefficientCents), sourceRow, documentaryRow: sourceRow };
  });
  const calculated = totals(...measured.CCESP, ...measured.FCESP);
  if (JSON.stringify(calculated) !== JSON.stringify(config.totals)) throw new Error(`Total publicado não reconciliado em ${config.acronym}`);
  return { ...config, sourceAnnex: 'quadro-demonstrativo', validationStatus: 'technical-review', units, positions };
}
const waterSource = { label: 'Deliberação SP-Águas nº 25/2026 · Anexos I e II', url: water.source.url };
const sanitationSource = { label: 'Deliberação ARSESP nº 1.811/2026 · Anexos I e II', url: sanitation.sourceUrl };
const transportSource = { label: 'Deliberação ARTESP nº 722/2026 · Quadro de cargos e resumo', url: transport.source.url };
const original = (quantity, quotaCents, note) => ({ ...law, quantity, quotaCents, note });
const bases = [
  agency({
    organizationId: 'sp-aguas', acronym: 'SP-Águas', name: 'Agência de Águas do Estado de São Paulo',
    version: 'sp-aguas-deliberacao-25-2026-regimento-21', groups: ['CCESP', 'FCESP'],
    allocationSource: waterSource, sources: [law, waterDecree, waterSource, { label: 'Deliberação SP-Águas nº 21/2026 · Regimento Interno', url: waterHierarchy.source.url }], totals: water.totals,
    limits: { source: { ...waterDecree, label: 'Decreto nº 69.486/2025 + LC nº 1.413/2024' }, totals: totals(255, 80675, 118, 16755) },
    referenceCaption: 'Decreto + LC', notice: 'O quadro publicado distribui 342 cargos e funções e 972,25 cotas. A referência de saldo soma os quantitativos e cotas autorizados pela lei e pelo decreto, por espécie.',
  }, water.units, water.positions, waterHierarchy.relationships),
  agency({
    organizationId: 'arsesp', acronym: 'ARSESP', name: 'Agência Reguladora de Serviços Públicos do Estado de São Paulo',
    version: 'arsesp-deliberacao-1811-2026-regimento-1649', groups: ['CCESP'],
    allocationSource: sanitationSource, sources: [law, sanitationSource, { label: 'Deliberação ARSESP nº 1.649/2025 · Regimento Interno', url: sanitationHierarchy.sourceUrl }], totals: totals(90, 42550),
    limits: { source: sanitationSource, totals: totals(90, 42550) }, referenceCaption: 'Quadro recomposto',
    originalReference: original('76', '42550', 'A Deliberação nº 1.811/2026 distribui 90 CCESP com as mesmas 425,50 cotas.'),
    notice: 'O saldo compara a proposta com o quadro recomposto publicado, que abrange CCESP.',
  }, sanitation.units.map(unit => ({ ...unit, sourceRow: unit.sourceTableRow, documentGroup: unit.sectionLabel })),
  sanitation.positions.map(row => ({ ...row, sourceRow: row.sourceTableRow })), sanitationHierarchy.links),
  agency({
    organizationId: 'artesp', acronym: 'ARTESP', name: 'Agência Reguladora de Serviços Públicos Delegados de Transporte do Estado de São Paulo',
    version: 'artesp-deliberacao-722-2026-regimento-471', groups: ['CCESP'],
    allocationSource: transportSource, sources: [law, transportSource, { label: 'Deliberação ARTESP nº 471/2025 · Regimento Interno', url: transportHierarchy.source.hierarchy.url }], totals: totals(154, 58000),
    limits: { source: transportSource, totals: totals(154, 58000) }, referenceCaption: 'Quadro recomposto',
    originalReference: original('106', '58000', 'A Deliberação nº 722/2026 discrimina 154 CCESP com as mesmas 580,00 cotas.'),
    notice: 'O saldo compara a proposta com o quadro recomposto publicado. O ato informa os níveis CCESP; o simulador conserva esse detalhamento.',
    positionCodeFormat: 'level', positionCodes: catalogue.groups.CCESP.map(row => levelCode(row.level)),
  }, transport.documentaryUnits.map(unit => ({ id: unit.unitKey, name: unit.name, sourceRow: unit.unitRowIndex,
    documentGroup: unit.isDocumentGroupHeading ? null : unit.documentGroupLabel })),
  transport.positions.map(row => ({ id: `artesp-722-position-${row.tableRowIndex}`, unitId: row.unitKey, code: levelCode(row.level),
    group: 'CCESP', category: null, ...row, sourceRow: row.tableRowIndex })), transportHierarchy.links),
];
await writeFile(new URL('../src/data/agency-structures.mjs', import.meta.url),
  `/** Generated by scripts/import-agency-bases.mjs from public acts. */\nexport const agencyStructures = ${JSON.stringify(bases, null, 2)};\n`);
