"""Read TESTE1 without recalculation or edits; reconcile its fixed Annex II rows.

Run with the bundled Python runtime. Only rows with positive fixed quantity,
literal code and action Manter are admitted; proposed/creation cells are ignored.
Hierarchy is imported as explicit model evidence, never inferred from row order.
"""
from collections import Counter, defaultdict
from decimal import Decimal
from hashlib import sha256
import json
from pathlib import Path
import re
import unicodedata

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'sources/preparacao-2026-10-19/SGGD- TESTE1.xlsx'
DOCUMENTARY = ROOT / 'evidence/orgaos-2026-09-24/sggd-70755-cotejo-doe.json'
CONSOLIDATED = ROOT / 'sources/preparacao-2026-10-19/Quadro_consolidado_cargos_cotas_siorg_estrutura_dentro_de_cada_orgao.xlsx'
OUTPUT = ROOT / 'src/data/sggd-structure.mjs'
REPORT = ROOT / 'evidence/preparacao-2026-10-19/importacao-estrutura-sggd.json'


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def normalize(value):
    return ' '.join(unicodedata.normalize('NFKC', value).casefold().split())


def integer(value):
    number = Decimal(str(value))
    assert number >= 0 and number == number.to_integral_value(), value
    return str(int(number))


def cents(value):
    return integer(Decimal(str(value)) * 100)


def totals(positions):
    groups = {}
    for group in ['CCESP', 'FCESP']:
        rows = [row for row in positions if row['group'] == group]
        groups[group] = {
            'quantity': str(sum(int(row['quantity']) for row in rows)),
            'quotaCents': str(sum(int(row['quantity']) * int(row['coefficientCents']) for row in rows)),
        }
    return {'groups': groups, 'aggregate': {
        field: str(sum(int(group[field]) for group in groups.values()))
        for field in ['quantity', 'quotaCents']
    }}


workbook = load_workbook(SOURCE, read_only=True, data_only=False)
sheet = workbook['Reestruturação']
documentary = json.loads(DOCUMENTARY.read_text())
official_rows = documentary['quadro_rows']
weights = {}
for row in sheet.iter_rows(min_row=4, max_row=72, min_col=21, max_col=24):
    code, weight, _, _ = [cell.value for cell in row]
    if isinstance(code, str) and re.fullmatch(r'(CCESP|FCESP) (?:[12]\.\d{2}|NES)', code):
        code = code.replace(' NES', ' 1.18')
        value = cents(weight)
        assert code not in weights or weights[code] == value
        weights[code] = value

units = []
positions = []
current = None
comparison_differences = []
display_differences = []
for row in sheet.iter_rows(min_row=9, max_col=14):
    source_row = row[0].row
    a, b, denomination, code, _, quantity, _, action = [cell.value for cell in row[:8]]
    if isinstance(a, str) and not a.startswith('=') and action == 'Manter unidade':
        current = {'name': a, 'parentName': b, 'sourceRow': source_row, 'positions': []}
        units.append(current)
    if not isinstance(quantity, (int, float)) or quantity <= 0:
        continue
    assert current is not None, ('position without unit', source_row)
    match = re.fullmatch(r'(CCESP|FCESP) ([12])\.(\d{2})', str(code))
    assert match and action == 'Manter' and isinstance(denomination, str), source_row
    index = len(positions)
    assert index < len(official_rows), 'More workbook records than documentary records'
    official = official_rows[index]
    checks = {
        'unit': (current['name'], official['unit']),
        'denomination': (denomination, official['denomination']),
        'code': (code, official['code']),
        'quantity': (integer(quantity), integer(official['quantity'])),
    }
    for field, (value, original) in checks.items():
        if normalize(value) != normalize(original):
            comparison_differences.append({'sourceRow': source_row, 'documentaryRow': official['source_table_row'], 'field': field, 'workbook': value, 'documentary': original})
        elif value != original:
            display_differences.append({'sourceRow': source_row, 'field': field, 'workbook': value, 'documentary': original})
    position = {
        'id': f"sggd-position-ii-{official['source_table_row']}",
        'unitName': current['name'], 'denomination': denomination, 'code': code,
        'group': match[1], 'category': int(match[2]), 'level': int(match[3]),
        'quantity': integer(quantity), 'coefficientCents': weights[code],
        'sourceRow': source_row, 'documentaryRow': official['source_table_row'],
    }
    positions.append(position)
    current['positions'].append(position)

assert len(positions) == len(official_rows) == 407, 'Incomplete documentary match'
assert not comparison_differences, comparison_differences
assert all(unit['positions'] for unit in units), 'Empty unit imported'

# A unit identity is pinned to its first original Annex II record, not its name,
# mutable proposal label, or a spreadsheet row which can move during formatting.
by_name = defaultdict(list)
for order, unit in enumerate(units):
    unit.update({'id': f"sggd-unit-ii-{unit['positions'][0]['documentaryRow']}", 'order': order})
    by_name[normalize(unit['name'])].append(unit)
    for position in unit.pop('positions'):
        position['unitId'] = unit['id']

hierarchy_issues = []
for unit in units:
    candidates = by_name[normalize(unit['parentName'])] if isinstance(unit['parentName'], str) else []
    unit['parentUnitId'] = candidates[0]['id'] if len(candidates) == 1 and candidates[0] is not unit else None
    unit['hierarchyStatus'] = 'model-explicit-unverified' if unit['parentUnitId'] else 'model-parent-outside-units' if not candidates else 'model-parent-ambiguous'
    if len(candidates) > 1:
        unit['parentCandidates'] = [candidate['id'] for candidate in candidates]
        hierarchy_issues.append({'unitId': unit['id'], 'sourceRow': unit['sourceRow'], 'parentName': unit['parentName'], 'candidateIds': unit['parentCandidates']})

base_totals = totals(positions)
assert base_totals == {'groups': {'CCESP': {'quantity': '299', 'quotaCents': '106950'}, 'FCESP': {'quantity': '201', 'quotaCents': '34875'}}, 'aggregate': {'quantity': '500', 'quotaCents': '141825'}}
workbook.close()

consolidated = load_workbook(CONSOLIDATED, read_only=True, data_only=False)
broad = consolidated['SGGD']
consolidated_comparison = {
    'importedAsBaseline': False,
    'quantityCells': {'CCESP': 'SGGD!C6', 'FCESP': 'SGGD!C7', 'aggregate': 'SGGD!C8'},
    'declaredAllocatedQuantity': {'CCESP': integer(broad['C6'].value), 'FCESP': integer(broad['C7'].value), 'aggregate': integer(broad['C8'].value)},
    'differenceToImportedAllocation': {'CCESP': str(int(broad['C6'].value) - 299), 'FCESP': str(int(broad['C7'].value) - 201), 'aggregate': str(int(broad['C8'].value) - 500)},
    'note': 'O consolidado declara 495 alocados; não substitui os 500 postos transcritos no TESTE1 e no Anexo II documental.',
}
consolidated.close()

data = {
    'organizationId': 'sggd',
    'version': 'sggd-decreto-70755-anexo-II-teste1-2026-10-19',
    'name': 'Secretaria de Gestão e Governo Digital',
    'validationStatus': 'technical-review',
    'sourceAnnex': 'II',
    'notice': 'Estrutura transcrita do modelo SGGD — TESTE1, cotejada com a extração documental do Anexo II de 24/09/2026. Base e vínculos em validação técnica; não informa ocupação atual nem confirma atos posteriores.',
    'sources': [
        {'id': 'teste1', 'role': 'structure-model', 'title': 'SGGD — TESTE1', 'fileName': SOURCE.name, 'sha256': digest(SOURCE), 'sheet': 'Reestruturação', 'baselineColumns': ['A', 'B', 'C', 'D', 'F'], 'readAt': '2026-10-19'},
        {'id': 'annex-ii-documentary', 'role': 'documentary-crosscheck', 'title': 'Decreto 70.755/2026 — Anexo II', 'url': documentary['source_page'], 'checkedAt': documentary['consultation_date'], 'extractionSha256': digest(DOCUMENTARY), 'contentSha256': documentary['doe_content_sha256']},
        {'id': 'consolidated', 'role': 'comparison-only', 'title': 'Quadro consolidado de cargos e cotas', 'fileName': CONSOLIDATED.name, 'sha256': digest(CONSOLIDATED), 'readAt': '2026-10-19'},
    ],
    'units': units, 'positions': positions, 'totals': base_totals,
    'reconciliation': {
        'documentaryRecordCount': len(official_rows), 'importedRecordCount': len(positions),
        'unitCount': len(units), 'matchesDocumentaryRecords': True,
        'matchingFields': ['unit', 'denomination', 'code', 'quantity'],
        'matchingNormalization': 'Unicode NFKC, caixa e espaços; dados exibidos preservados do TESTE1.',
        'displayDifferenceCount': len(display_differences),
        'annexIIAllocated': base_totals,
        'annexIIILimits': {'groups': {'CCESP': {'quantity': '298', 'quotaCents': '106600'}, 'FCESP': {'quantity': '201', 'quotaCents': '34935'}}, 'aggregate': {'quantity': '499', 'quotaCents': '141535'}},
        'initialBalance': {'groups': {'CCESP': {'quantity': '-1', 'quotaCents': '-350'}, 'FCESP': {'quantity': '0', 'quotaCents': '60'}}},
        'consolidated': consolidated_comparison,
        'hierarchy': {'status': 'model-explicit-unverified', 'unresolvedParents': hierarchy_issues, 'note': 'Somente vínculos explícitos da coluna B com nome unívoco recebem parentUnitId. Pais externos à lista e nomes ambíguos permanecem sem ligação. Não usar esta base como hierarquia homologada.'},
    },
}
OUTPUT.write_text('/** Generated by scripts/import-sggd-structure.py; do not edit documentary rows by hand. */\nfunction deepFreeze(value) {\n  if (value && typeof value === "object" && !Object.isFrozen(value)) {\n    for (const child of Object.values(value)) deepFreeze(child);\n    Object.freeze(value);\n  }\n  return value;\n}\n\nexport const sggdStructure = deepFreeze(' + json.dumps(data, ensure_ascii=False, indent=2) + ');\n')
REPORT.parent.mkdir(parents=True, exist_ok=True)
REPORT.write_text(json.dumps({'source': str(SOURCE.relative_to(ROOT)), 'sourceSha256': digest(SOURCE), 'output': str(OUTPUT.relative_to(ROOT)), 'outputSha256': digest(OUTPUT), 'reconciliation': data['reconciliation'], 'displayDifferences': display_differences, 'excluded': 'Campos de proposta, áreas de criação, valores mensais, fórmulas e resumo de 495 do consolidado não foram importados como base.'}, ensure_ascii=False, indent=2))
print(json.dumps({'positions': len(positions), 'units': len(units), 'totals': base_totals, 'hierarchyAmbiguities': hierarchy_issues, 'output': str(OUTPUT)}, ensure_ascii=False))
