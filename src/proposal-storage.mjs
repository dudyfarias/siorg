import { calculateStructureProposal } from './structure-proposal.mjs';

export const PROPOSAL_FILE_FORMAT = 'siorg-structure-proposal';
export const PROPOSAL_FILE_VERSION = 1;
export const MAX_PROPOSAL_BYTES = 4 * 1024 * 1024;
export const MAX_PROPOSAL_UNITS = 2000;
export const MAX_PROPOSAL_POSITIONS = 10000;

const DRAFT_QUANTITY_ERRORS = new Set(['missing_quantity', 'invalid_number', 'input_too_long']);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

export class ProposalStorageError extends Error {
  constructor(code, message, { issues = [], cause } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'ProposalStorageError';
    this.code = code;
    this.issues = issues;
  }
}

function fail(code, message, options) {
  throw new ProposalStorageError(code, message, options);
}

function baseIdentity(base) {
  if (!record(base) || !nonempty(base.organizationId) || !nonempty(base.version)) {
    fail('invalid_base', 'A base precisa identificar o órgão e a versão da estrutura.');
  }
  return { organizationId: base.organizationId, version: base.version };
}

function inspectContainers(proposal) {
  if (!record(proposal) || proposal.schemaVersion !== 1 || !Array.isArray(proposal.units)
      || !Array.isArray(proposal.positions)) {
    fail('invalid_proposal', 'O arquivo precisa conter uma proposta de estrutura no formato esperado.');
  }
  if (proposal.units.length > MAX_PROPOSAL_UNITS) {
    fail('too_many_units', `A proposta excede o limite de ${MAX_PROPOSAL_UNITS} unidades por arquivo.`);
  }
  if (proposal.positions.length > MAX_PROPOSAL_POSITIONS) {
    fail('too_many_positions', `A proposta excede o limite de ${MAX_PROPOSAL_POSITIONS} linhas de cargos e funções por arquivo.`);
  }
  if (!proposal.units.every(record) || !proposal.positions.every(record)) {
    fail('invalid_proposal', 'As unidades e os cargos precisam ser registros de uma estrutura válida.');
  }
  if (proposal.positions.some(position => typeof position.quantity !== 'string')) {
    fail('invalid_quantity_type', 'As quantidades da proposta precisam ser campos de texto, inclusive quando ainda não foram preenchidas.');
  }
  if (proposal.units.some(unit => unit.origin === 'added'
      && (typeof unit.name !== 'string' || !unit.name.replace(/\s+/gu, ' ').trim()
        || unit.name.replace(/\s+/gu, ' ').trim().length > 180))) {
    fail('invalid_unit_name', 'O nome de cada nova unidade precisa conter entre 1 e 180 caracteres.');
  }
}

function parseBounded(text) {
  if (typeof text !== 'string') fail('invalid_file', 'Selecione um arquivo JSON de proposta.');
  // UTF-8 byte count also covers multibyte names. The first guard avoids allocating
  // an encoded buffer for a string already larger than the limit in code units.
  if (text.length > MAX_PROPOSAL_BYTES || new TextEncoder().encode(text).byteLength > MAX_PROPOSAL_BYTES) {
    fail('file_too_large', 'O arquivo de proposta excede o limite de 4 MB.');
  }
  try { return JSON.parse(text); }
  catch (cause) { fail('invalid_json', 'Não foi possível ler o JSON da proposta.', { cause }); }
}

function validateWithEngine(proposal, base) {
  inspectContainers(proposal);
  let evaluation;
  try { evaluation = calculateStructureProposal(proposal, base); }
  catch (cause) {
    fail('invalid_proposal', 'A estrutura do arquivo não pôde ser conferida com a base selecionada.', { cause });
  }
  if (!evaluation?.baselineValid) {
    fail('invalid_base', 'A base não corresponde à estrutura documental usada pelo simulador.', { issues: evaluation?.issues || [] });
  }
  // A draft may preserve unfinished numeric input verbatim. Every structural,
  // identity, catalogue and source error remains grounds for rejecting the file.
  const rejected = (evaluation.issues || []).filter(issue => issue.severity === 'error'
    && !(issue.scope === 'proposal' && DRAFT_QUANTITY_ERRORS.has(issue.code)
      && typeof issue.field === 'string' && issue.field.startsWith('positions.') && issue.field.endsWith('.quantity')));
  if (rejected.length) {
    fail('invalid_proposal', 'A proposta contém dados incompatíveis com a base ou alterações de estrutura não reconhecidas.', { issues: rejected });
  }
}

function timestamp(value) {
  if (value !== undefined && !(value instanceof Date) && typeof value !== 'string') {
    fail('invalid_saved_at', 'Informe uma data válida para salvar a proposta.');
  }
  const date = value === undefined ? new Date() : new Date(value);
  if (Number.isNaN(date.getTime())) fail('invalid_saved_at', 'Informe uma data válida para salvar a proposta.');
  return date.toISOString();
}

/** Save only the draft and its identity, never a trusted copy of calculated totals. */
export function encodeProposal(proposal, base, { savedAt } = {}) {
  const identity = baseIdentity(base);
  inspectContainers(proposal);
  let text;
  try {
    text = JSON.stringify({
      format: PROPOSAL_FILE_FORMAT,
      formatVersion: PROPOSAL_FILE_VERSION,
      savedAt: timestamp(savedAt),
      base: identity,
      proposal,
    });
  } catch (cause) {
    if (cause instanceof ProposalStorageError) throw cause;
    fail('invalid_proposal', 'A proposta precisa conter dados que possam ser salvos em JSON.', { cause });
  }
  // Validate the serialized representation, including size, so encoding cannot
  // silently discard a value and produce a file the decoder would reject.
  decodeProposal(text, base);
  return text;
}

/** Return a fresh, editable draft; all results must be recalculated by the caller. */
export function decodeProposal(text, base) {
  const identity = baseIdentity(base);
  const envelope = parseBounded(text);
  if (!record(envelope) || envelope.format !== PROPOSAL_FILE_FORMAT
      || envelope.formatVersion !== PROPOSAL_FILE_VERSION) {
    fail('unsupported_format', 'O arquivo não usa uma versão de proposta compatível com este simulador.');
  }
  if (!record(envelope.base) || envelope.base.organizationId !== identity.organizationId
      || envelope.base.version !== identity.version) {
    fail('base_version_mismatch', 'A proposta pertence a outro órgão ou a outra versão da base.');
  }
  if (typeof envelope.savedAt !== 'string' || timestamp(envelope.savedAt) !== envelope.savedAt) {
    fail('invalid_saved_at', 'A data de salvamento do arquivo é inválida.');
  }
  validateWithEngine(envelope.proposal, base);
  return envelope.proposal;
}

export function getProposalStorageKey(base) {
  const { organizationId, version } = baseIdentity(base);
  return `${PROPOSAL_FILE_FORMAT}:v${PROPOSAL_FILE_VERSION}:${encodeURIComponent(organizationId)}:${encodeURIComponent(version)}`;
}

function requireStorage(storage, method) {
  if (!storage || typeof storage[method] !== 'function') {
    fail('storage_unavailable', 'O armazenamento local não está disponível neste navegador.');
  }
}

/** Storage is injected; this module never reads window or localStorage. */
export function saveProposal(storage, proposal, base, options) {
  requireStorage(storage, 'setItem');
  const key = getProposalStorageKey(base);
  const text = encodeProposal(proposal, base, options);
  try { storage.setItem(key, text); }
  catch (cause) {
    fail('storage_write_failed', 'Não foi possível salvar neste navegador. Baixe a proposta em JSON para preservá-la.', { cause });
  }
  return key;
}

export function loadProposal(storage, base) {
  requireStorage(storage, 'getItem');
  const key = getProposalStorageKey(base);
  let text;
  try { text = storage.getItem(key); }
  catch (cause) { fail('storage_read_failed', 'Não foi possível consultar a proposta salva neste navegador.', { cause }); }
  // A corrupt or incompatible saved file is not deleted: the UI can offer
  // recovery or explicit replacement instead of losing the user's draft.
  return text === null ? null : decodeProposal(text, base);
}

export function removeSavedProposal(storage, base) {
  requireStorage(storage, 'removeItem');
  const key = getProposalStorageKey(base);
  try { storage.removeItem(key); }
  catch (cause) { fail('storage_remove_failed', 'Não foi possível remover a proposta salva neste navegador.', { cause }); }
  return key;
}
