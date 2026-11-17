"""Rebuild the documentary data and trace map from the preserved DOE extraction.

Run with the bundled Python from any directory. No network, no source correction.
Numeric row indexes are zero based; DOE table row numbers retain the extractor's
one-based counting. The hierarchy is expressly in Resolution SGGD 33/2026 art.1 III.
"""
from collections import defaultdict
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / 'evidence/orgaos-2026-09-24'
OUTPUT = Path(__file__).resolve().parent
data = json.loads((EVIDENCE / 'sggd-70755-cotejo-doe.json').read_text())
alesp = json.loads((EVIDENCE / 'sggd-70755-quadros.json').read_text())
rows = data['quadro_rows']
assert len(rows) == 407

class FirstTable(HTMLParser):
    def __init__(self):
        super().__init__()
        self.table_count = 0
        self.active = False
        self.rows = []
        self.row = None
        self.cell = None

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.table_count += 1
            self.active = self.table_count == 1
        if self.active and tag == 'tr':
            self.row = []
        if self.active and tag in ['td', 'th']:
            self.cell = ''

    def handle_data(self, value):
        if self.active and self.cell is not None:
            self.cell += value

    def handle_endtag(self, tag):
        if self.active and tag in ['td', 'th'] and self.cell is not None:
            self.row.append(' '.join(self.cell.split()))
            self.cell = None
        if self.active and tag == 'tr':
            self.rows.append(self.row)
            self.row = None
        if tag == 'table':
            self.active = False

table = FirstTable()
table.feed((EVIDENCE / 'doe-70755-content.html').read_text())
assert sum(len(row) == 4 and row[1].isdigit() for row in table.rows) == 407
for row in rows:
    original_cells = table.rows[row['source_table_row'] - 1]
    assert original_cells[1] == str(row['quantity'])
    assert original_cells[2] == row['denomination']
    assert original_cells[3] == row['raw_code']

for original, duplicate in zip(rows, alesp['quadro_rows'], strict=True):
    for field in ['unit', 'quantity', 'denomination', 'code']:
        assert original[field] == duplicate[field], (field, original, duplicate)

live = json.loads((OUTPUT / 'doe-publicacao-reconsulta.json').read_text())
live_hash = sha256(live['content'].encode()).hexdigest()
original_publication = json.loads((EVIDENCE / 'doe-70755-publicacao.json').read_text())
assert live['content'] == original_publication['content'], 'Public content changed: recheck extraction'
assert sha256((EVIDENCE / 'doe-70755-content.html').read_text().encode()).hexdigest() == data['doe_content_sha256']
factors = {row['code']: row['unitHundredths'] for row in data['summary_rows']}

# Each interval describes a named unit, not a subtree inferred from table order.
# Descendants below level 14 are explicitly listed in Resolution 33 art.1 III.
nodes = [
    ('subsecretaria', 103, 103, 'SUBSECRETARIA DE GESTÃO', 'III'),
    ('dg', 104, 104, 'DIRETORIA GERAL DE DESENVOLVIMENTO E CAPACIDADE INSTITUCIONAL', 'III(a)'),
    ('assessoria', 105, 107, 'Assessoria Técnica', 'III(a)(1)'),
    ('apoio', 108, 110, 'Seção de Apoio Administrativo', 'III(a)(2)'),
    ('dmo', 111, 115, 'DIRETORIA DE MODERNIZAÇÃO ORGANIZACIONAL', 'III(a)(3)'),
    ('modelos', 116, 118, 'Coordenadoria de Modelos Organizacionais', 'III(a)(3.1)'),
    ('desenvolvimento', 119, 119, 'Divisão de Desenvolvimento Organizacional', 'III(a)(3.1.1)'),
    ('estruturas', 120, 121, 'Divisão Central de Estruturas Organizacionais', 'III(a)(3.1.2)'),
    ('politicas', 122, 125, 'Coordenadoria de Gestão de Políticas Públicas', 'III(a)(3.2)'),
    ('articulacao', 126, 127, 'Divisão de Articulação e Parcerias Estratégicas', 'III(a)(3.2.1)'),
    ('desempenho', 128, 130, 'Divisão de Desempenho Institucional', 'III(a)(3.2.2)'),
    ('digp', 131, 132, 'DIRETORIA DE INOVAÇÃO EM GESTÃO PÚBLICA', 'III(a)(4)'),
    ('inteligencia', 133, 136, 'Coordenadoria de Inteligência em Gestão', 'III(a)(4.1)'),
    ('laboratorio', 137, 140, 'Laboratório de Logística Pública', 'III(a)(4.2)'),
    ('logistica', 141, 145, 'DIRETORIA DE NORMAS E SISTEMAS DE LOGÍSTICA', 'III(b)'),
    ('normas', 146, 146, 'Coordenadoria de Normas e Procedimentos', 'III(b)(1)'),
    ('atos', 147, 147, 'Divisão de Elaboração de Atos Normativos', 'III(b)(1.1)'),
    ('orientacao', 148, 148, 'Divisão de Orientação Normativa e Atendimento Órgãos Controle', 'III(b)(1.2)'),
    ('sistemas', 149, 149, 'Coordenadoria de Sistemas de Logística', 'III(b)(2)'),
    ('gestao-sistemas', 150, 150, 'Divisão de Gestão de Sistemas de Logística', 'III(b)(2.1)'),
    ('suporte', 151, 151, 'Divisão de Suporte ao Usuário', 'III(b)(2.2)'),
    ('capacitacao', 152, 152, 'Divisão de Capacitação e Gestão do Conhecimento', 'III(b)(2.3)'),
    ('central-compras', 153, 154, 'Coordenadoria da Central de Compras', 'III(b)(3)'),
    ('licitacoes', 155, 156, 'Divisão de Licitações e Contratações', 'III(b)(3.1)'),
    ('compartilhados', 157, 158, 'Divisão de Serviços Compartilhados', 'III(b)(3.2)'),
]
node_map = {}
for node_id, start, end, name, clause in nodes:
    indices = list(range(start, end + 1))
    assert all(rows[index]['unit'] == name for index in indices), node_id
    node_map[node_id] = {
        'id': node_id, 'publishedUnit': name, 'numericRowIndices': indices,
        'hierarchySource': f'Resolução SGGD 33/2026, art. 1º, {clause}',
    }

dg_nodes = [item[0] for item in nodes if 104 <= item[1] <= 140]
scopes = {
    'all': {'indices': list(range(407)), 'nodes': [], 'coverage': 'whole'},
    'subsecretaria-gestao': {'nodes': [item[0] for item in nodes], 'coverage': 'unit-with-descendants'},
    'diretoria-geral-desenvolvimento-capacidade-institucional': {'nodes': dg_nodes, 'coverage': 'unit-with-descendants'},
    'diretoria-modernizacao-organizacional': {'nodes': ['dmo'], 'coverage': 'direct-posts'},
    'diretoria-inovacao-gestao-publica': {'nodes': ['digp'], 'coverage': 'direct-posts'},
    'diretoria-normas-sistemas-logistica': {'nodes': ['logistica'], 'coverage': 'direct-posts'},
}
source_url = data['source_page']
version = 'sggd-decreto-70755-2026-08-01-anexo-II'
notice = 'Dados do Anexo II; há divergência com o Anexo III. As somas do quadro não constituem um total oficial reconciliado nem informam a ocupação atual.'

def decimal(cents):
    return f'{cents // 100}.{cents % 100:02d}'

references = {}
trace_scopes = {}
for scope_id, config in scopes.items():
    indices = config.get('indices', [index for node_id in config['nodes'] for index in node_map[node_id]['numericRowIndices']])
    assert len(indices) == len(set(indices)), scope_id
    grouped = defaultdict(int)
    totals = {group: {'quantity': 0, 'quotaCents': 0} for group in ['CCESP', 'FCESP']}
    traced_rows = []
    for index in indices:
        row = rows[index]
        group, code = row['code'].split()
        level = int(code.split('.')[1])
        quantity = row['quantity']
        factor = factors[row['code']]
        grouped[(group, level)] += quantity
        totals[group]['quantity'] += quantity
        totals[group]['quotaCents'] += quantity * factor
        traced_rows.append({'numericRowIndex': index, **row, 'factorCents': factor, 'quotaCents': quantity * factor})
    reference = {
        'version': version, 'nature': 'published-distribution', 'sourceAnnex': 'II',
        'reconciliationStatus': 'conflict', 'conflictingAnnex': 'III', 'notice': notice,
        'quantity': str(sum(group['quantity'] for group in totals.values())),
        'quotas': decimal(sum(group['quotaCents'] for group in totals.values())),
        'groups': {name: {'quantity': str(group['quantity']), 'quotas': decimal(group['quotaCents'])} for name, group in totals.items()},
        'rows': [{'group': group, 'level': str(level), 'quantity': str(quantity)} for (group, level), quantity in sorted(grouped.items())],
    }
    references[scope_id] = reference
    trace_scopes[scope_id] = {
        'coverage': config['coverage'], 'nodes': [node_map[node_id] for node_id in config['nodes']],
        'numericRowIndices': indices, 'records': traced_rows, 'computed': totals,
        'reference': reference,
    }

assert references['all']['quantity'] == '500'
assert references['all']['quotas'] == '1418.25'
assert references['subsecretaria-gestao']['quantity'] == '66'
assert references['diretoria-geral-desenvolvimento-capacidade-institucional']['quantity'] == '44'

resolution = json.loads((OUTPUT / 'resolucao33-doe.json').read_text())
trace = {
    'checkedAt': '2026-09-24', 'version': version, 'sourceUrl': source_url,
    'sourceLabel': 'Decreto 70.755/2026 — Anexo II (quadro distribuído)',
    'structureSourceUrl': 'https://www.doe.sp.gov.br/' + resolution['slug'],
    'structureSourceLabel': 'Resolução SGGD 33/2026 — art. 1º, III',
    'sourceExtraction': 'evidence/orgaos-2026-09-24/sggd-70755-cotejo-doe.json',
    'extractedHtmlNormalizedNewlinesSha256': data['doe_content_sha256'], 'liveRawContentSha256': live_hash,
    'liveContentEqualsOriginalPublicationContent': True,
    'all407RecordsRecheckedAgainstOriginalHtmlTable': True,
    'numericRows': len(rows), 'zeroBasedNumericRowIndices': True,
    'tableRowMeaning': 'source_table_row preserva a contagem de linhas da primeira tabela HTML no extrator original, incluindo cabeçalhos.',
    'calculation': 'Quantidade de cada registro × fator de sua espécie/nível, em centésimos exatos. Depois agrupar espécie/nível; categorias de comando/assessoramento não são novas posições.',
    'hierarchyRule': 'Recortes inclusivos só usam as unidades explicitadas no art. 1º, III da Resolução SGGD 33/2026. Os três recortes diretos excluem todas as subordinadas.',
    'nameCorrespondence': 'O quadro abrevia Divisão de Orientação Normativa e Atendimento Órgãos Controle; corresponde ao item III(b)(1.2), que contém aos Órgãos de Controle. Não é unidade adicional.',
    'limitations': [notice, 'Não corrige a publicação nem determina a prevalência entre anexos.', 'Não agrega quadros das entidades vinculadas.', 'Consulta de 24/09/2026; não garante exaustividade de retificações posteriores ou não indexadas.'],
    'scopes': trace_scopes,
}
(OUTPUT / 'mapeamento-e-somas.json').write_text(json.dumps(trace, ensure_ascii=False, indent=2) + '\n')
header = '''/**
 * SGGD documentary distribution: Decreto 70.755/2026, Annex II.
 * These derived sums conflict with Annex III; they are not reconciled official limits.
 * Hierarchy: Resolution SGGD 33/2026, art. 1, III. Direct scopes exclude descendants.
 * Source and every contributing record: evidence/sggd-autofill-2026-09-24/mapeamento-e-somas.json
 * Rebuild: evidence/sggd-autofill-2026-09-24/build-sggd-references.py
 * Exact decimal strings in quota units; not occupancy or remuneration.
 */
'''
(ROOT / 'src/data/sggd-reference.mjs').write_text(header + 'export const sggdReferences = ' + json.dumps(references, ensure_ascii=False, indent=2) + ';\n')
for scope_id, reference in references.items():
    print(scope_id, reference['quantity'], reference['quotas'], reference['groups'])
