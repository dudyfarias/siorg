"""Compare the supplied workbook rows with public ALESP annexes and build simulator data."""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal
from hashlib import sha256
import json
from pathlib import Path
import re
import unicodedata
from urllib.request import urlopen
from urllib.parse import urljoin

from lxml import html
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'evidence/orgaos-2026-11-16'
DECREE_INDEX = 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/'
GROUPS = ('CCESP', 'FCESP')
CODE = re.compile(r'\b(CCESP|FCESP)\s*([1-5])\s*\.\s*(\d{2})\b', re.I)
COEFFICIENT = dict(zip(range(1, 19), (100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 400, 450, 550, 600, 700, 800, 900)))


def clean(value):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', str(value or '')).replace('\u00ad', '')).strip()


def text_key(value):
    name = clean(value).replace('ª', 'a').replace('º', 'o').replace('–', '-').replace('—', '-')
    name = re.sub(r'(?:\s*\(\d+\)\s*\*?)+$', '', name)
    name = unicodedata.normalize('NFKD', name.lower())
    return ''.join(char for char in name if char.isalnum() and not unicodedata.combining(char))


def code_value(value):
    code = CODE.search(clean(value))
    if not code:
        return None
    group, category, level = code.groups()
    return f'{group.upper()} {category}.{level}'


def amount(value):
    return int(Decimal((clean(value) or '0').replace('.', '').replace(',', '.')) * 100)


def decree_url(number, date):
    year = date[-4:]
    return f'{DECREE_INDEX}{year}/decreto-{number}-{date.replace("/", ".")}.html'


def format_totals(measured):
    return {'groups': {g: {'quantity': str(measured[g][0]), 'quotaCents': str(measured[g][1])} for g in GROUPS},
            'aggregate': {'quantity': str(sum(value[0] for value in measured.values())),
                          'quotaCents': str(sum(value[1] for value in measured.values()))}}


def calculate(positions):
    measured = {g: [0, 0] for g in GROUPS}
    for position in positions:
        count = int(position['quantity'])
        measured[position['group']][0] += count
        measured[position['group']][1] += count * int(position['coefficientCents'])
    return format_totals(measured)


def fetch(url):
    cache_dir = EVIDENCE / 'atos'
    cache_dir.mkdir(exist_ok=True)
    cache = cache_dir / f'{sha256(url.encode()).hexdigest()[:14]}.html'
    if not cache.exists():
        with urlopen(url, timeout=20) as response:
            content = response.read()
        cache.write_bytes(content)
    content = cache.read_bytes()
    return html.fromstring(content), sha256(content).hexdigest()


def workbook_rows(path):
    book = load_workbook(path, read_only=True, data_only=True)
    structure, calc = book['Reestruturação'], book['Calculadora']
    source_text = clean(structure['A2'].value)
    match = re.search(r'Decreto nº\s*([\d.]+), de (\d\d/\d\d/\d{4})', source_text)
    number, date = match.group(1).replace('.', ''), match.group(2)
    organization_name = clean(calc['A1'].value).split(' · ', 1)[1]
    current, rows = '', []
    for index, (unit, parent, denomination, code, _, quantity) in enumerate(structure.iter_rows(min_row=8, max_col=6, values_only=True), 8):
        if unit and not denomination:
            current = clean(unit)
        code = code_value(code)
        if code and isinstance(quantity, int) and quantity > 0 and denomination:
            rows.append({'unit': current or clean(unit), 'denomination': clean(denomination), 'code': code,
                         'quantity': quantity, 'row': index})
    limits = {g: [calc.cell(i, 2).value, int(Decimal(str(calc.cell(i, 3).value)) * 100)]
              for i, g in enumerate(GROUPS, 13)}
    limit_text = clean(calc['A11'].value)
    book.close()
    return {'number': number, 'date': date, 'url': decree_url(number, date), 'name': organization_name,
            'text': source_text, 'rows': rows, 'limit': format_totals(limits), 'limitText': limit_text}


def tables(document):
    for table in document.xpath('//table[not(ancestor::table)]'):
        yield [[clean(cell.text_content()) for cell in row.xpath('./td|./th')]
               for row in table.xpath('./tbody/tr|./tr|./thead/tr')]


def allocation_rank(table):
    return sum(len(row) in (3, 4) and bool(code_value(row[-1])) and row[-3].replace('.', '').isdigit() for row in table)


def readable_text(value):
    return clean(value).replace('\u2011', '-').replace('\u2212', '-').replace('\u200b', '')


def parse_allocation(rows, prefix):
    units, positions, ignored = [], [], []
    current = None
    for index, row in enumerate(rows, 1):
        if len(row) == 3 and row[0].replace('.', '').isdigit():
            row = ['', *row]
        if len(row) == 2 and row[0] and not row[1]:
            row = [row[0], '', '', '']
        if len(row) != 4:
            continue
        unit, quantity, denomination, source_code = row
        code = code_value(source_code)
        if unit and (quantity.replace('.', '').isdigit() or not any(row[1:])) and text_key(unit) not in {'unidade'}:
            current = {'id': f'{prefix}-unit-{index}', 'name': readable_text(unit), 'parentUnitId': None,
                       'parentName': None, 'sourceRow': index, 'order': len(units), 'hierarchyStatus': 'not-provided'}
            units.append(current)
        if not code:
            if quantity.replace('.', '').isdigit() and denomination:
                ignored.append({'row': index, 'values': row})
            continue
        if not current or not quantity.replace('.', '').isdigit() or not denomination:
            raise ValueError(f'Linha incompleta do quadro em {prefix}: {row}')
        count = int(quantity.replace('.', ''))
        if not count:
            continue
        group, band = code.split()
        category, level = map(int, band.split('.'))
        factor = COEFFICIENT[level]
        if group == 'FCESP':
            factor = factor * 3 // 5
        positions.append({'id': f'{prefix}-row-{index}', 'unitId': current['id'], 'unitName': current['name'],
                          'code': code, 'group': group, 'category': category, 'level': level,
                          'denomination': readable_text(denomination), 'quantity': str(count),
                          'coefficientCents': str(factor), 'sourceRow': index, 'documentaryRow': index})
    return units, positions, ignored


def quota_table_rank(table):
    return sum(len(row) == 4 and (code_value(row[0]) or re.fullmatch(r'(CCESP|FCESP) NES', row[0], re.I)) is not None
               and bool(re.fullmatch(r'\d+(?:,\d+)?', row[1])) and row[2].replace('.', '').isdigit() for row in table)


def parse_quota_table(rows):
    by_code, printed_groups = {}, {}
    series = None
    for row in rows:
        label = text_key(row[0]) if row else ''
        if len(row) == 4 and row[2].replace('.', '').isdigit():
            match = code_value(row[0]) or re.fullmatch(r'(CCESP|FCESP) NES', row[0], re.I)
            if match:
                code = match if isinstance(match, str) else f'{match.group(1).upper()} 1.18'
                series = code.split()[0]
                by_code[code] = [int(row[2].replace('.', '')), amount(row[3])]
        label = text_key(next((cell for cell in row[:-2] if cell), ''))
        if len(row) >= 3 and row[-2].replace('.', '').isdigit():
            if (label in {'cargos', 'funcoes'} or label.startswith('subtotal')) and series:
                group = 'CCESP' if label in {'cargos', 'subtotal1'} or 'ccesp' in label else (
                    'FCESP' if label in {'funcoes', 'subtotal2'} or 'fcesp' in label else series)
                printed_groups[group] = [int(row[-2].replace('.', '')), amount(row[-1])]
            if label.startswith('total'):
                printed_groups['TOTAL'] = [int(row[-2].replace('.', '')), amount(row[-1])]
    groups = {g: [sum(value[index] for code, value in by_code.items() if code.startswith(g)) for index in (0, 1)]
              for g in GROUPS}
    arithmetic = format_totals(groups)
    for group in GROUPS:
        groups[group] = printed_groups.get(group, groups[group])
    printed = format_totals(groups)
    return printed, arithmetic, printed_groups, by_code


def extract_act(url, prefix, issue=None):
    if issue:
        doc = html.fromstring(issue['content'])
        digest = sha256(issue['content'].encode()).hexdigest()
    else:
        doc, digest = fetch(url)
    all_tables = list(tables(doc))
    if not all_tables:
        raise ValueError(f'{prefix} sem tabelas no HTML: {url}')
    allocation = max(all_tables, key=allocation_rank)
    quota_table = max(all_tables, key=quota_table_rank)
    units, positions, ignored = parse_allocation(allocation, prefix) if allocation_rank(allocation) else ([], [], [])
    printed, arithmetic, printed_groups, by_code = parse_quota_table(quota_table) if quota_table_rank(quota_table) else (None, None, None, None)
    ficha = next((urljoin(url, a.get('href')) for a in doc.xpath('//a[@href]') if 'Ficha informativa' in clean(a.text_content())), None)
    return {'sha256': digest, 'ficha': ficha, 'positions': positions, 'units': units, 'ignored': ignored,
            'printedTotals': printed, 'summedTotals': arithmetic, 'printedRows': printed_groups, 'byCode': by_code}


def comparison(rows, positions):
    def grouped(items, unit_field):
        result = Counter()
        for row in items:
            key = (text_key(row[unit_field]), text_key(row['denomination']), row['code'])
            result[key] += int(row['quantity'])
        return result
    sheet = grouped(rows, 'unit')
    official = grouped(positions, 'unitName')
    return {
        'matches': sheet == official,
        'workbookRows': len(rows),
        'officialRows': len(positions),
        'onlyOrExcessInWorkbook': [(*key, value) for key, value in (sheet - official).items()],
        'onlyOrExcessInAct': [(*key, value) for key, value in (official - sheet).items()],
    }


def doe_content(org, number):
    for path in (EVIDENCE / f'{org}-doe-referencia.json', EVIDENCE / f'{org}-doe.json'):
        if path.exists():
            payload = json.loads(path.read_text())
            return payload.get('data', payload)
    search = EVIDENCE / f'{org}-decreto-busca-doe.json'
    if not search.exists():
        return None
    matches = [item for item in json.loads(search.read_text()).get('items', [])
               if item.get('slug', '').startswith(f'executivo/decretos/decreto-n-{number}-')]
    if len(matches) != 1:
        return None
    endpoint = f"https://do-api-web-search.doe.sp.gov.br/v2/publications/{matches[0]['slug']}"
    with urlopen(endpoint, timeout=20) as response:
        issue = json.load(response)
    (EVIDENCE / f'{org}-doe.json').write_text(json.dumps(issue, ensure_ascii=False))
    return issue


def review(path):
    org = path.stem.removeprefix('SGGD-').lower()
    sheet = workbook_rows(path)
    prefix = f'{org}-{sheet["number"]}'
    act = extract_act(sheet['url'], prefix)
    issue = doe_content(org, sheet['number'])
    if issue:
        official = extract_act(sheet['url'], prefix, issue)
        if (len(official['positions']) != len(act['positions']) or not official['printedTotals']):
            raise ValueError(f'Edições ALESP e DOE com contagem divergente: {org}')
        result = comparison(sheet['rows'], official['positions'])
        result['doeCrosscheck'] = comparison([{'unit': r['unitName'], **r} for r in act['positions']], official['positions'])
        official['ficha'] = act['ficha']
        official['doeUrl'] = 'https://doe.sp.gov.br/' + issue['slug'].lstrip('/')
        act = official
    else:
        result = comparison(sheet['rows'], act['positions'])
    return org, {'sheet': {key: value for key, value in sheet.items() if key != 'rows'}, 'act': act,
                 'comparison': result, 'allocated': calculate(act['positions'])}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('paths', nargs=2, type=Path)
    opts = parser.parse_args()
    all_paths = [p for folder in opts.paths for p in sorted(folder.glob('SGGD-*.xlsx'))]
    with ThreadPoolExecutor(max_workers=6) as pool:
        result = dict(pool.map(review, all_paths))
    (EVIDENCE / 'reconciliacao-base.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    for org, record in result.items():
        match = record['comparison']
        print(org, match['workbookRows'], match['officialRows'], 'ok' if match['matches'] else
              f'{len(match["onlyOrExcessInWorkbook"])}/{len(match["onlyOrExcessInAct"])}',
              record['allocated']['aggregate'], record['act']['printedTotals'], 'ignorado', len(record['act']['ignored']))


if __name__ == '__main__':
    main()
