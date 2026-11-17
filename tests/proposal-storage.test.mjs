import test from 'node:test';
import assert from 'node:assert/strict';
import { sggdStructure as base } from '../src/data/sggd-structure.mjs';
import { createStructureProposal, setPositionQuantity, renameUnit, addPosition, createUnit } from '../src/structure-proposal.mjs';
import {
  encodeProposal, decodeProposal, getProposalStorageKey, saveProposal, loadProposal, removeSavedProposal,
  MAX_PROPOSAL_BYTES, MAX_PROPOSAL_UNITS, MAX_PROPOSAL_POSITIONS, PROPOSAL_FILE_FORMAT,
} from '../src/proposal-storage.mjs';

const date = '2026-10-22T14:00:00.000Z';
const create = () => createStructureProposal(base);
const encode = proposal => encodeProposal(proposal, base, { savedAt: date });
const code = expected => error => error.name === 'ProposalStorageError' && error.code === expected;
const alteredFile = change => {
  const envelope = JSON.parse(encode(create()));
  change(envelope);
  return JSON.stringify(envelope);
};
function memoryStorage() {
  const entries = new Map();
  return { entries, getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
}

test('JSON round-trip preserves one complete multi-unit draft without mutating the baseline', () => {
  const before = JSON.stringify(base);
  let proposal = setPositionQuantity(create(), base.positions[0].id, '3');
  proposal = renameUnit(proposal, base.units[1].id, 'Chefia de Gabinete proposta');
  proposal = addPosition(proposal, { unitId: base.units[1].id, templateId: base.positions[0].id, quantity: '2' }, base);
  const saved = encode(proposal), envelope = JSON.parse(saved), restored = decodeProposal(saved, base);
  assert.equal(envelope.format, PROPOSAL_FILE_FORMAT);
  assert.equal(envelope.formatVersion, 1);
  assert.equal(envelope.savedAt, date);
  assert.deepEqual(envelope.base, { organizationId: base.organizationId, version: base.version });
  assert.deepEqual(restored, proposal);
  assert.notEqual(restored, proposal);
  assert.notEqual(restored.positions, proposal.positions);
  assert.equal(JSON.stringify(base), before);
  assert.equal(Object.hasOwn(envelope, 'calculation'), false);
});

test('blank, invalid and excessively long numeric inputs survive saving as drafts verbatim', () => {
  for (const input of ['', '   ', '-1', '1.25', 'abc', '9'.repeat(129)]) {
    const proposal = setPositionQuantity(create(), base.positions.at(-1).id, input);
    const restored = decodeProposal(encode(proposal), base);
    assert.equal(restored.positions.at(-1).quantity, input);
  }
});

test('non-string quantities are rejected explicitly instead of converted or accepted as drafts', () => {
  for (const quantity of [1, 0, null, true, {}, [], undefined]) {
    const proposal = create();
    proposal.positions[0].quantity = quantity;
    assert.throws(() => encode(proposal), code('invalid_quantity_type'));
    assert.throws(() => decodeProposal(alteredFile(e => { e.proposal.positions[0].quantity = quantity; }), base), code('invalid_quantity_type'));
  }
});

test('new unit names are bounded by their normalized length without rewriting imported text', () => {
  for (const name of ['', ' \n ', null, 123, 'x'.repeat(181)]) {
    const proposal = createUnit(create(), { name, parentUnitId: base.units[0].id }, base);
    assert.throws(() => encode(proposal), code('invalid_unit_name'));
    assert.throws(() => decodeProposal(alteredFile(e => { e.proposal = proposal; }), base), code('invalid_unit_name'));
  }
  const proposal = createUnit(create(), { name: `  ${'x'.repeat(180)}  `, parentUnitId: base.units[0].id }, base);
  assert.deepEqual(decodeProposal(encode(proposal), base), proposal);
  // Documentary names remain checked against the frozen base, not truncated.
  assert.deepEqual(decodeProposal(encode(create()), base).units.map(unit => unit.name), base.units.map(unit => unit.name));
});

test('another format, file version, organization or base version is rejected', () => {
  for (const change of [e => { e.format = 'other'; }, e => { e.formatVersion = 2; }]) {
    assert.throws(() => decodeProposal(alteredFile(change), base), code('unsupported_format'));
  }
  for (const change of [e => { e.base.version = 'older'; }, e => { e.base.organizationId = 'other'; }]) {
    assert.throws(() => decodeProposal(alteredFile(change), base), code('base_version_mismatch'));
  }
  assert.throws(() => decodeProposal(alteredFile(e => { e.proposal.baseVersion = 'older'; }), base), code('invalid_proposal'));
});

test('changed code, denomination, coefficient and documentary identity cannot be imported', () => {
  for (const change of [
    p => { p.positions[0].code = 'CCESP 1.01'; },
    p => { p.positions[0].denomination = 'Cargo alterado sem ação'; },
    p => { p.positions[0].coefficientCents = '1'; },
    p => { p.positions[0].id = 'unrecognized-documentary-row'; },
    p => { p.positions.splice(0, 1); },
    p => { p.units[0].parentUnitId = p.units[1].id; },
  ]) {
    assert.throws(() => decodeProposal(alteredFile(e => change(e.proposal)), base), code('invalid_proposal'));
  }
});

test('the selected baseline is independently checked instead of trusted from the envelope', () => {
  const forgedBase = structuredClone(base);
  forgedBase.positions[0].quantity = '999';
  assert.throws(() => decodeProposal(encode(create()), forgedBase), code('invalid_base'));
});

test('malformed JSON, missing records and invalid timestamps produce explicit errors', () => {
  assert.throws(() => decodeProposal('{bad', base), code('invalid_json'));
  assert.throws(() => decodeProposal(null, base), code('invalid_file'));
  assert.throws(() => decodeProposal(alteredFile(e => { e.proposal = null; }), base), code('invalid_proposal'));
  assert.throws(() => decodeProposal(alteredFile(e => { e.proposal.units[0] = null; }), base), code('invalid_proposal'));
  assert.throws(() => decodeProposal(alteredFile(e => { e.savedAt = 'invalid'; }), base), code('invalid_saved_at'));
  assert.throws(() => encodeProposal(create(), base, { savedAt: null }), code('invalid_saved_at'));
});

test('payload limit counts UTF-8 bytes, not only characters', () => {
  assert.throws(() => decodeProposal(' '.repeat(MAX_PROPOSAL_BYTES + 1), base), code('file_too_large'));
  assert.throws(() => decodeProposal('ç'.repeat(MAX_PROPOSAL_BYTES / 2 + 1), base), code('file_too_large'));
  const proposal = create();
  proposal.extra = 'x'.repeat(MAX_PROPOSAL_BYTES);
  assert.throws(() => encode(proposal), code('file_too_large'));
});

test('collection limits reject excessive units and positions before evaluating the engine', () => {
  const units = create();
  units.units = Array.from({ length: MAX_PROPOSAL_UNITS + 1 }, () => ({ id: 'x', name: 'x' }));
  assert.throws(() => encode(units), code('too_many_units'));
  const positions = create();
  positions.positions = Array.from({ length: MAX_PROPOSAL_POSITIONS + 1 }, () => ({ id: 'x' }));
  assert.throws(() => encode(positions), code('too_many_positions'));
  assert.throws(() => decodeProposal(alteredFile(e => { e.proposal.positions = positions.positions; }), base), code('too_many_positions'));
});

test('storage is injected and keys separate organizations and base versions', () => {
  const storage = memoryStorage();
  assert.equal(loadProposal(storage, base), null);
  const draft = setPositionQuantity(create(), base.positions[0].id, '');
  const key = saveProposal(storage, draft, base, { savedAt: date });
  assert.equal(key, getProposalStorageKey(base));
  assert.deepEqual(loadProposal(storage, base), draft);
  assert.equal(loadProposal(storage, { ...base, version: 'next-version' }), null);
  assert.notEqual(key, getProposalStorageKey({ ...base, organizationId: 'another' }));
  assert.equal(removeSavedProposal(storage, base), key);
  assert.equal(loadProposal(storage, base), null);
});

test('corrupt saved data is reported and retained; rejected saves do not overwrite the old draft', () => {
  const storage = memoryStorage(), key = getProposalStorageKey(base);
  storage.setItem(key, '{broken');
  assert.throws(() => loadProposal(storage, base), code('invalid_json'));
  assert.equal(storage.getItem(key), '{broken');
  saveProposal(storage, create(), base, { savedAt: date });
  const original = storage.getItem(key), invalid = create();
  invalid.positions[0].code = 'FCESP 1.01';
  assert.throws(() => saveProposal(storage, invalid, base), code('invalid_proposal'));
  assert.equal(storage.getItem(key), original);
});

test('unavailable storage and read/write/remove failures are surfaced, never reported as saved', () => {
  assert.throws(() => loadProposal(undefined, base), code('storage_unavailable'));
  const broken = { getItem() { throw new Error('disabled'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('denied'); } };
  assert.throws(() => loadProposal(broken, base), code('storage_read_failed'));
  assert.throws(() => saveProposal(broken, create(), base), code('storage_write_failed'));
  assert.throws(() => removeSavedProposal(broken, base), code('storage_remove_failed'));
});
