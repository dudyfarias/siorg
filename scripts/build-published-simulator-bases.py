"""Apply identified official acts to the annex-based reference, preserving an audit trail."""
from collections import defaultdict
from copy import deepcopy
from hashlib import sha256
import json
import re

from import_published_structures import (
    EVIDENCE, ROOT, calculate, clean, decree_url, fetch, text_key,
)

GROUP_LIMIT_URL = decree_url('68742', '05/08/2024')
AUTARCHY_LIMIT_URL = decree_url('69486', '14/04/2025')


def read(name):
    return json.loads((EVIDENCE / name).read_text())


def write(name, data):
    (EVIDENCE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def official_movements():
    acts = defaultdict(list)
    for act in read('revisao-secretarias-a-movimentacoes.json')['acts']:
        org = act['id'].split('-')[0]
        if act['futureAsOfCheckedAt'] or act.get('superseded'):
            continue
        acts[org].append({
            'id': act['id'], 'title': act['sourceTitle'], 'date': act['publicationDate'], 'url': act['url'],
            'moves': [(c['fromUnitName'], c['toUnitName'], c['code'], c['denomination'], int(c['quantity']), c['rowIndex'])
                      for c in act['changes']],
        })
    for p in sorted(EVIDENCE.glob('*-movements.json')):
        evidence = json.loads(p.read_text())
        org = evidence['organizationId']
        for act in evidence.get('acts') or [evidence['act']]:
            if 'changes' not in act or act.get('classification') == 'duplicate-publication':
                continue
            date = act['actDate']
            acts[org].append({
                'id': act['id'], 'title': f"{act['title']} · {date[8:]}/{date[5:7]}/{date[:4]}",
                'date': act['publicationDate'], 'url': act['sourceUrl'],
                'moves': [(c['sourceUnit'], c['destinationUnit'], c['code'], c['denomination'], int(c['quantity']), c['sourceRow'])
                          for c in act['changes']],
            })
    for name in ['movimentacoes-autarquias.json', 'movimentacoes-consolidadas.json']:
        optional = EVIDENCE / name
        if optional.exists():
            for org, additions in json.loads(optional.read_text()).items():
                by_id = {act['id']: act for act in acts[org]}
                by_id.update({act['id']: act for act in additions})
                acts[org] = list(by_id.values())
    return {org: sorted(group, key=lambda act: (act['date'], act['id'])) for org, group in acts.items()}


def find_units(units, name):
    return [unit for unit in units if text_key(unit['name']) == text_key(name)]


SEMIL_BLOCK = {
    'CG': 'Chefia de Gabinete', 'SGC': 'Subsecretaria de Gestão Corporativa',
    'SMA': 'Subsecretaria de Meio Ambiente', 'SRHSB': 'Subsecretaria de Recursos Hídricos e Saneamento Básico',
    'SLT': 'Subsecretaria de Logística e Transportes',
}
SEMIL_HEADINGS = {*SEMIL_BLOCK.values(), 'Subsecretaria de Energia e Mineração'}


def movement_units(units, name, act):
    exact = find_units(units, name)
    if exact or not act['id'].startswith('semil-'):
        return exact
    alias = re.match(r'^([A-Z]+)\s*[-–]\s*(.+)$', name)
    if not alias or alias[1] not in SEMIL_BLOCK:
        return []
    bare = re.sub(r'^Divisões Técnicas Regionais', 'Divisão Técnica Regional', alias[2], flags=re.I)
    choices = find_units(units, bare)
    if len(choices) <= 1:
        return choices
    start = next((unit['order'] for unit in units if text_key(unit['name']) == text_key(SEMIL_BLOCK[alias[1]])), None)
    if start is None:
        return choices
    headings = {text_key(title) for title in SEMIL_HEADINGS}
    end = next((unit['order'] for unit in units if unit['order'] > start and text_key(unit['name']) in headings), len(units))
    scoped = [choice for choice in choices if start < choice['order'] < end]
    return scoped or choices


def apply_move_group(units, positions, act):
    working_units, working_positions = deepcopy(units), deepcopy(positions)
    by_id = {unit['id']: unit for unit in working_units}
    errors, actions = [], []
    for index, (origin, target, code, denomination, count, source_row) in enumerate(act['moves'], 1):
        if act['id'] == 'secom-resolucao-6-2026' and origin == 'Assessoria Especial de Articulação e Projetos Estratégicos':
            # Exact organizational unit confirmed in the decree; the resolution uses “e” where the decree uses “de”.
            origin = 'Assessoria Especial de Articulação de Projetos Estratégicos'
        if act['id'].startswith('sesp-'):
            aliases = {'Serviço – Lei de Incentivo ao Esporte': 'Serviço – Lei Paulista de Incentivo ao Esporte',
                       'Subsecretaria de Gestão Corporativa': 'Subsecretaria de Gestão Coorporativa'}
            origin, target = aliases.get(origin, origin), aliases.get(target, target)
            if code == 'CCESP 2.08' and denomination == 'Assistente Técnico':
                denomination = 'Assistente Técnico IV'
        if act['id'].startswith('spi-'):
            aliases = {'Coordenadoria de Gestão e Infraestrutura': 'Coordenadoria de Gestão Infraestrutura',
                       'Coordenadoria de Gestão de Parcerias em Rodovias': 'Coordenadoria de Gestão de Parceiras em Rodovias'}
            origin, target = aliases.get(origin, origin), aliases.get(target, target)
        origins = movement_units(working_units, origin, act)
        destinations = movement_units(working_units, target, act)
        origin_ids = {u['id'] for u in origins}
        eligible = [pos for pos in working_positions if pos['unitId'] in origin_ids
                    and (not code or pos['code'] == code) and int(pos['quantity']) >= count
                    and text_key(pos['denomination']) == text_key(denomination)]
        matching_codes = {pos['code'] for pos in eligible}
        if (len(origins) != 1 or len(destinations) > 1 or not eligible or len(matching_codes) != 1
            or (act['id'].startswith('semil-') and not destinations)):
            errors.append({'origin': origin, 'target': target, 'code': code, 'denomination': denomination,
                           'quantity': count, 'originCandidates': [u['name'] for u in origins],
                           'matchingRows': [p['id'] for p in eligible]})
            continue
        source = eligible[0]
        code = source['code']
        if not destinations:
            dest = {'id': f"{act['id']}-unit-{index}", 'name': target, 'parentUnitId': None, 'parentName': None,
                    'sourceRow': source_row, 'order': len(working_units), 'hierarchyStatus': 'not-provided'}
            working_units.append(dest)
            by_id[dest['id']] = dest
        else:
            dest = destinations[0]
        if dest['id'] == source['unitId']:
            continue
        source['quantity'] = str(int(source['quantity']) - count)
        merged = next((p for p in working_positions if p['unitId'] == dest['id'] and p['code'] == code
                       and text_key(p['denomination']) == text_key(denomination)), None)
        if merged:
            merged['quantity'] = str(int(merged['quantity']) + count)
        else:
            working_positions.append({**source, 'id': f"{act['id']}-row-{index}", 'unitId': dest['id'],
                                      'unitName': dest['name'], 'quantity': str(count),
                                      'sourceRow': source_row, 'documentaryRow': source_row})
        actions.append([by_id[source['unitId']]['name'], dest['name'], code, denomination, count])
    return working_units, [p for p in working_positions if int(p['quantity']) > 0], actions, errors


def normalized_name(value):
    name = clean(value).rstrip(' ;:.')
    return re.sub(r',\s*(?:com|integrada por|composta por|constituída por)\s*$', '', name, flags=re.I)


def published_links(url, units):
    doc, _ = fetch(url)
    lines = [clean(p.text_content()) for p in doc.xpath('//p[not(ancestor::table)]')]
    enumerators = [(1, re.compile(r'^[IVXLCDM]+\s*[-–]\s*(.+)$')),
                   (2, re.compile(r'^[a-z]\)\s*(.+)$')),
                   (3, re.compile(r'^\d+\.\s*(.+)$')),
                   (4, re.compile(r'^[a-z]\.\d+\.?(?:\)|\s)\s*(.+)$'))]
    stack, found = {}, defaultdict(set)
    reading = False
    for line in lines:
        if re.search(r'^Artigo\s+\d+', line, flags=re.I):
            stack.clear()
            reading = bool(re.search(r'(?:tem|terá)\s+a seguinte estrutura(?:\s+básica|\s+organizacional)?\s*:', line, flags=re.I))
            continue
        if not reading:
            continue
        match = next(((level, regex.match(line)) for level, regex in enumerators if regex.match(line)), None)
        if not match:
            if line and re.match(r'^[§(]|^Parágrafo|^CAPÍTULO|^SEÇÃO', line):
                reading = False
            continue
        level, token = match
        label = normalized_name(token.group(1))
        stack = {n: unit for n, unit in stack.items() if n < level}
        if stack and label:
            parent = stack[max(stack)]
            if text_key(label) != text_key(parent):
                found[text_key(label)].add(parent)
        stack[level] = label
    index = defaultdict(list)
    for unit in units:
        index[text_key(unit['name'])].append(unit)
    for key, choices in found.items():
        child = index[key]
        if len(child) != 1 or len(choices) != 1:
            continue
        proposed_parent = choices.pop()
        parents = index[text_key(proposed_parent)]
        if len(parents) > 1:
            continue
        if parents:
            child[0].update(parentUnitId=parents[0]['id'], parentName=parents[0]['name'], hierarchyStatus='model-parent-resolved')
        else:
            child[0].update(parentName=proposed_parent, hierarchyStatus='model-parent-outside-units')
    return sum(bool(unit['parentName']) for unit in units)


def show_cents(value):
    whole, fraction = divmod(int(value), 100)
    return f'{whole:,}'.replace(',', '.') + f',{fraction:02d}'


def totals_label(value):
    return ' · '.join(f'{group} {v["quantity"]} / {show_cents(v["quotaCents"])} cotas'
                      for group, v in value['groups'].items())


NOTES = {
    'ipem': 'As Portarias nº 163 e 227/2026 foram conferidas. A íntegra da revisão mais recente do regimento interno está em conferência.',
    'semil': 'O decreto reúne as divisões técnicas regionais em um bloco. A resolução individualiza algumas delas. A distribuição entre essas divisões está em conferência.',
    'pge': 'Duas linhas da publicação trazem a denominação “Chefe de”. O texto foi mantido como publicado.',
    'sggd': 'O Decreto nº 70.963/2026 trata de classificação orçamentária. Os Anexos II e III continuam no Decreto nº 70.755/2026.',
    'spm': 'O resumo do decreto imprime 178,75 cotas no total. As linhas publicadas somam 178,50 cotas. A referência do ato e a soma aparecem separadas.',
    'jucesp': 'O Anexo III de 2026 traz 172 CCESP e 472,75 cotas. O quadro geral de 2025 registra outros valores. A área técnica precisa confirmar o limite aplicável.',
}
STRUCTURES = {
    'pge': ('69761', '01/08/2025'),
    'scti': ('69333', '29/01/2025'),
    'sde': ('69332', '28/01/2025'),
    'sduh': ('69760', '31/07/2025'),
    'semil': ('69376', '26/02/2025'),
}


def source(label, url):
    return {'label': label, 'url': url}


def write_report(audits):
    lines = [
        '# Conferência dos 20 órgãos e entidades no simulador',
        '',
        'Conferência em 16/11/2026. A primeira coluna numérica mostra a distribuição somada pelas linhas de cargos e funções. A segunda traz a referência do quadro resumo publicado. Quantidade e cotas aparecem separadas para CCESP e FCESP.',
        '',
        '| Órgão ou entidade | Distribuição de referência | Quadro resumo para o saldo | Ato do quadro de origem |',
        '| --- | --- | --- | --- |',
    ]
    for org, audit in sorted(audits.items()):
        lines.append(f'| {org.upper()} | {totals_label(audit["allocated"])} | {totals_label(audit["reviewReference"])} | [{audit["sourceLabel"]}]({audit["source"]}) |')
    lines.extend(['', '## Conferência por órgão', ''])
    for org, audit in sorted(audits.items()):
        change = audit['sheetComparison']
        label = 'Valores e linhas conferem com o ato de origem.' if change['matches'] else (
            'Há diferenças de redação ou denominação entre a planilha e o ato de origem. O simulador segue o ato, com as atualizações listadas abaixo.')
        lines.extend([f'### {org.upper()}', '', label, f'{change["officialRows"]} linhas de cargos e funções conferidas no quadro de origem.'])
        lines.extend(audit['notices'])
        if audit['referenceDiffers']:
            lines.append(f'A planilha indica como limite {totals_label(audit["sheetReference"])}. O simulador usa o quadro resumo identificado na tabela acima como referência de simulação.')
        if audit['appliedActs']:
            lines.extend(['', 'Atos incorporados à distribuição', ''])
            for entry in audit['appliedActs']:
                moves = len(entry['moves'])
                description = f'{moves} movimentações de cargos e funções' if moves else 'Mudança de denominação'
                if entry.get('partial'):
                    description += ' conciliadas neste ato'
                lines.append(f'- {description}. [Publicação oficial]({entry["url"]})')
        if audit['pendingActs']:
            lines.extend(['', 'Atos que requerem conciliação por unidade', ''])
            for entry in audit['pendingActs']:
                lines.append(f'- Remanejamento em conferência. [Publicação oficial]({entry["url"]})')
        links = list({row['url']: row['label'] for row in audit['sourceLinks']}.items())
        lines.extend(['', 'Fontes consultadas', ''])
        for url, name in links:
            lines.append(f'- [{name}]({url})')
        lines.append('')
    lines.extend(['## Escopo da conferência', '',
                  'Foram examinados o quadro de origem, os totais por espécie e os atos posteriores identificados na pesquisa. A árvore mostra os vínculos que puderam ser identificados nos atos consultados. As regras específicas de reestruturação e os pontos indicados para conciliação dependem de revisão técnica.'])
    (EVIDENCE / 'conferencia-dos-orgaos.md').write_text('\n'.join(lines) + '\n')


def build():
    reconciliation = read('reconciliacao-base.json')
    movements = official_movements()
    base_list, audits = [], {}
    for org, record in reconciliation.items():
        sheet, act = record['sheet'], record['act']
        date = sheet['date']
        label = f'Decreto nº {sheet["number"][:2]}.{sheet["number"][2:]}/{date[-4:]}'
        url = act.get('doeUrl', sheet['url'])
        units, positions = deepcopy(act['units']), deepcopy(act['positions'])
        ref, summed = deepcopy(act['printedTotals']), act['summedTotals']
        if not ref or not positions:
            raise ValueError(f'Dados oficiais incompletos em {org}')
        if org == 'spm':
            ref['groups']['CCESP']['quotaCents'] = str(act['printedRows']['TOTAL'][1])
            ref['aggregate']['quotaCents'] = ref['groups']['CCESP']['quotaCents']
        allocation = source(label, url)
        reference = source(f'{label} · Quadro resumo', url)
        sources = [allocation, reference]
        if act.get('doeUrl'):
            sources.append(source(f'{label} · Assembleia Legislativa', sheet['url']))
        notes = [NOTES[org]] if org in NOTES else []
        applied, unresolved = [], []
        for movement in movements.get(org, []):
            sources.append(source(movement['title'], movement['url']))
            units, positions, actions, errors = apply_move_group(units, positions, movement)
            if actions:
                applied.append({'id': movement['id'], 'moves': actions, 'url': movement['url'], 'partial': bool(errors)})
            if errors or not movement['moves']:
                unresolved.append({'id': movement['id'], 'errors': errors, 'url': movement['url']})
        if org == 'stm':
            old_name = 'Coordenadoria de Gestão de Empreendimentos, Investimentos e Orçamento'
            new_name = 'Coordenadoria de Desenvolvimento e Dados de Mobilidade Metropolitana'
            targets = find_units(units, old_name)
            if len(targets) != 1:
                raise ValueError('Unidade renomeada no Decreto 70.705/2026 precisa ser única')
            targets[0]['name'] = new_name
            for row in positions:
                if row['unitId'] == targets[0]['id']:
                    row['unitName'] = new_name
            change_url = decree_url('70705', '22/06/2026')
            sources.append(source('Decreto nº 70.705/2026 · Denominação de Coordenadoria', change_url))
            applied.append({'id': 'decreto-70705-2026', 'moves': [], 'url': change_url})
        if org == 'jucesp':
            matching = [p for p in positions if text_key(p['unitName']) == 'secretariageral' and p['code'] == 'CCESP 1.15']
            if len(matching) != 1 or matching[0]['denomination'] != 'Diretor':
                raise ValueError('Linha da Secretaria Geral da JUCESP diverge do decreto-base')
            matching[0]['denomination'] = 'Secretário-Geral'
            change_url = decree_url('70484', '25/03/2026')
            sources.append(source('Decreto nº 70.484/2026 · Denominação na Secretaria Geral', change_url))
            applied.append({'id': 'decreto-70484-2026', 'moves': [], 'url': change_url})
        if unresolved:
            link_count = len(unresolved)
            notes.append(f'O quadro inclui as movimentações conciliadas. A alocação por unidade ainda tem pontos em conferência em {link_count} ato(s).')
        if org == 'sggd':
            sources.append(source('Decreto nº 70.963/2026 · Classificação orçamentária', decree_url('70963', '06/11/2026')))
        allocated = calculate(positions)
        if allocated != record['allocated']:
            raise ValueError(f'As alterações de alocação mudaram os totais em {org}')
        legacy = None
        if ref != sheet['limit']:
            legacy = {'label': 'Valores usados como limite na planilha recebida', 'totals': sheet['limit'],
                      'url': AUTARCHY_LIMIT_URL if org == 'jucesp' else GROUP_LIMIT_URL}
            sources.append(source('Decreto geral consultado para comparação', legacy['url']))
        structure_url = decree_url(*STRUCTURES[org]) if org in STRUCTURES else sheet['url']
        try:
            links = published_links(structure_url, units)
        except Exception as error:
            links = 0
            print(f'Hierarquia em conferência: {org}: {error}')
        if links and structure_url != sheet['url']:
            sources.append(source('Estrutura organizacional · Decreto-base', structure_url))
        if org == 'semil':
            sources.append(source('Decreto nº 70.962/2026 · Vinculação de fundos e classificação orçamentária', decree_url('70962', '06/11/2026')))
        if org == 'scti':
            sources.append(source('Decreto nº 70.683/2026 · Competências e conselho', decree_url('70683', '16/06/2026')))
        if org in ('secom', 'sedpcd'):
            notes.append('O decreto aprova os quantitativos e as cotas do seu Anexo III. O artigo que faz essa alteração cita o Anexo IV do Decreto nº 68.742/2024.')
        notices = ' '.join(notes)
        data = {'organizationId': org, 'acronym': org.upper(), 'name': sheet['name'].split(' — ')[0],
                'organizationKind': 'Autarquia' if 'Regime: Autarquia' in sheet['text'] else 'Administração direta',
                'sourceAnnex': 'II', 'validationStatus': 'technical-review',
                'referenceCaption': 'Quadro resumo do ato', 'allocationSource': allocation,
                'limits': {'source': reference, 'totals': ref}, 'totals': allocated, 'sources': sources,
                'notice': notices, 'units': units, 'positions': positions}
        if legacy:
            data['legacyReference'] = legacy
        payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
        data['version'] = f'{org}-{sheet["number"]}-{sha256(payload.encode()).hexdigest()[:10]}'
        audits[org] = {'source': url, 'sheetComparison': record['comparison'], 'sourceLabel': label,
                       'allocated': allocated, 'reviewReference': ref, 'referenceSumByCode': summed,
                       'sheetReference': sheet['limit'], 'referenceDiffers': ref != sheet['limit'],
                       'officialLinks': links, 'appliedActs': applied, 'pendingActs': unresolved,
                       'notices': notes, 'sourceLinks': sources}
        if org != 'sggd':
            base_list.append(data)
        print(f'{org}: {len(positions)} linhas, {links} vínculos, {len(applied)} atos aplicados, {len(unresolved)} pendentes')
        for pending in unresolved:
            print('  ', pending['id'], pending['errors'][:6])
    write('reconciliacao-final.json', audits)
    write_report(audits)
    generated = ROOT / 'src/data/published-structures.mjs'
    generated.write_text('/** Generated from reconciled official acts by scripts/build-published-simulator-bases.py. */\n'
                         'export const publishedStructures = ' + json.dumps(base_list, ensure_ascii=False, indent=2) + ';\n')
    return audits


if __name__ == '__main__':
    build()
