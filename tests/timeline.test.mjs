import assert from 'node:assert/strict';
import test from 'node:test';
import { sggdTimeline as timeline } from '../src/data/sggd-timeline.mjs';
import { timelineCategories, timelines } from '../src/data/timeline-catalog.mjs';

const acts = [...timeline.groups, ...timeline.groups.flatMap(group => group.related), ...timeline.complementaryActs];

test('the received SGGD selection retains ten unique acts with public official sources', () => {
  assert.equal(acts.length, 10);
  assert.equal(new Set(acts.map(act => act.id)).size, 10);
  assert.equal(timeline.groups.length, 6);
  for (const act of acts) {
    assert.ok(act.sources.some(source => new URL(source.url).hostname.endsWith('doe.sp.gov.br')), act.id);
    for (const source of act.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(['doe.sp.gov.br', 'www.doe.sp.gov.br', 'www.al.sp.gov.br'].includes(url.hostname));
    }
    assert.equal(act.date, act.actDate);
    assert.ok(act.publicationDate >= act.actDate, act.id);
  }
});

test('act dates do not silently inherit the publication dates from the old presentation', () => {
  const dates = new Map(acts.map(act => [act.id, [act.actDate, act.publicationDate]]));
  assert.deepEqual(dates.get('decreto-69290-2024'), ['2024-12-31', '2025-01-01']);
  assert.deepEqual(dates.get('resolucao-sggd-25-2025'), ['2025-05-16', '2025-05-19']);
  assert.deepEqual(dates.get('decreto-70755-2026'), ['2026-07-14', '2026-07-15']);
  assert.deepEqual(dates.get('resolucao-sggd-33-2026'), ['2026-07-22', '2026-07-24']);
  assert.deepEqual(dates.get('resolucao-sggd-39-2026'), ['2026-09-23', '2026-09-25']);
});

test('formal relations preserve the partial revocation and keep the general QGCFC rule outside exclusive groups', () => {
  const latest = timeline.groups.find(group => group.id === 'decreto-70755-2026');
  assert.deepEqual(latest.related.map(act => act.id), ['resolucao-sggd-33-2026', 'resolucao-sggd-39-2026']);
  const revocation = latest.related[1];
  assert.match(revocation.summary, /inciso XI do art\. 76.*inciso VII do art\. 77/);
  assert.match(revocation.statusDetail, /não revoga.*toda a Resolução 33/);
  assert.deepEqual(timeline.complementaryActs.map(act => act.id), ['resolucao-sggd-42-2025']);
  assert.match(timeline.coverageNotice, /não é um histórico exaustivo/i);
});

test('the review covers the 16 requested organizations without duplicates or ambiguous dates presented as confirmed', () => {
  const ids = timelineCategories.flatMap(category => category.organizations.map(({ id }) => id));
  assert.deepEqual(ids.toSorted(), [
    'arsesp', 'artesp', 'der', 'governadoria', 'imesc', 'sap', 'sceic', 'sduh',
    'secom', 'sesp', 'sfp', 'sggd', 'sgri', 'spm', 'spprev', 'stv',
  ]);
  const allActs = [...acts, ...[...timelines].filter(([id]) => id !== 'sggd').flatMap(([, data]) => data.groups)];
  assert.equal(new Set(allActs.map(({ id }) => id)).size, allActs.length);
  for (const act of allActs) {
    assert.match(act.id, /^[a-z0-9-]+$/);
    assert.match(act.publicationDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(act.actDate === null || act.actDate <= act.publicationDate, act.id);
    assert.ok(act.sources.some(({ url }) => ['doe.sp.gov.br', 'www.doe.sp.gov.br'].includes(new URL(url).hostname)), act.id);
  }
  assert.deepEqual(allActs.filter(act => act.actDate === null).map(act => act.id).toSorted(), [
    'artesp-deliberacao-3-2025', 'der-portaria-1-2025', 'sgri-resolucao-4-2025',
  ]);
});

test('publication dates requested in the TXT match the checked DOE editions and keep original and republication separate', () => {
  const expected = {
    'decreto-69052-2024': '2024-11-14',
    'decreto-69230-2024': '2024-12-26',
    'decreto-69290-2024': '2025-01-01',
    'decreto-69506-2025': '2025-04-30',
    'resolucao-sggd-25-2025': '2025-05-19',
    'resolucao-sggd-42-2025': '2025-09-09',
    'decreto-69873-2025': '2025-09-22',
    'decreto-70755-2026': '2026-07-15',
    'resolucao-sggd-33-2026': '2026-07-24',
    'resolucao-sggd-39-2026': '2026-09-25',
    'sfp-decreto-69182-2024': '2024-12-19',
    'sfp-resolucao-3-2025': '2025-01-31',
    'sfp-decreto-69362-2025': '2025-02-20',
    'sfp-decreto-70332-2026': '2026-01-08',
    'sfp-decreto-70756-2026': '2026-07-15',
    'sfp-resolucao-30-2026': '2026-09-28',
    'sfp-decreto-70956-2026': '2026-11-04',
    'stv-resolucao-9-2025': '2025-03-14',
    'spm-resolucao-24-2026': '2026-10-15',
    'sesp-resolucao-sem-numero-2025-12-08': '2025-12-10',
    'sceic-resolucao-34-2025': '2025-05-13',
    'sap-resolucao-52-2026': '2026-09-30',
    'sgri-decreto-70066-2025': '2025-11-10',
    'secom-decreto-70065-2025': '2025-11-10',
    'sduh-resolucao-49-2026': '2026-09-18',
    'governadoria-decreto-70843-2026': '2026-09-04',
    'spprev-portaria-137-2026': '2026-04-01',
    'der-decreto-69322-2025': '2025-01-23',
    'imesc-portaria-11-2025': '2025-08-25',
    'imesc-decreto-69590-2025': '2025-06-10',
    'artesp-deliberacao-27-2026': '2026-01-14',
    'artesp-deliberacao-722-2026': '2026-09-23',
    'arsesp-deliberacao-1672-2025': '2025-03-14',
    'arsesp-deliberacao-1650-2025': '2025-02-13',
    'arsesp-deliberacao-1649-2025': '2025-02-13',
    'arsesp-deliberacao-1683-2025': '2025-05-09',
    'arsesp-deliberacao-1702-2025': '2025-08-22',
    'arsesp-deliberacao-1719-2025': '2025-10-02',
    'arsesp-deliberacao-1774-2026': '2026-02-12',
    'arsesp-deliberacao-1801-2026': '2026-05-20',
    'arsesp-deliberacao-1811-2026': '2026-06-11',
  };
  const byId = new Map([...acts, ...[...timelines.values()].flatMap(data => data.groups)].map(act => [act.id, act]));
  for (const [id, publication] of Object.entries(expected)) {
    assert.equal(byId.get(id)?.publicationDate, publication, id);
  }
  const arsesp = byId.get('arsesp-deliberacao-1649-2025');
  assert.equal(arsesp.republicationDate, '2025-02-17');
  assert.equal(new Set(arsesp.sources.map(({ url }) => url)).size, 2);
  assert.match(byId.get('sap-resolucao-52-2026').sources[0].url, /resolucao-sap-52-de-29-09-2026/);
  assert.match(byId.get('sceic-resolucao-34-2025').sources[0].url, /resolucao-sceic-n-34-de-12-maio-de-2025/);
  assert.match(byId.get('arsesp-deliberacao-1801-2026').sources[0].url, /deliberacao-arsesp-n-1801-de-19-de-maio-de-2026/);
  assert.match(byId.get('arsesp-deliberacao-1811-2026').sources[0].url, /deliberacao-arsesp-n-1811-de-10-de-junho-de-2026/);
});
