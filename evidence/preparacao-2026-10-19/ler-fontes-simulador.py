from pathlib import Path
import json
from zipfile import ZipFile
from lxml import etree
from openpyxl import load_workbook

base = Path('/Users/eduardofariascappia/Downloads/OneDrive_1_19-10-2026')
out = Path(__file__).parent
doc = base / 'Orientacoes_simulador_cotas.docx'
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
with ZipFile(doc) as z:
    root = etree.fromstring(z.read('word/document.xml'))
    paragraphs = [''.join(p.itertext()) for p in []]
    paragraphs = [''.join(p.xpath('.//w:t/text()', namespaces=ns)) for p in root.xpath('//w:body//w:p', namespaces=ns)]
    paras = [{'p': i + 1, 'text': p} for i, p in enumerate(paragraphs) if p.strip()]
    comments = []
    if 'word/comments.xml' in z.namelist():
        croot = etree.fromstring(z.read('word/comments.xml'))
        comments = [{'id': c.get('{%s}id' % ns['w']), 'text': ''.join(c.xpath('.//w:t/text()', namespaces=ns))} for c in croot]
    doc_data = {'path': str(doc), 'paragraphs': paras, 'comments': comments, 'insertions': len(root.xpath('//w:ins', namespaces=ns)), 'deletions': len(root.xpath('//w:del', namespaces=ns))}
(out / 'orientacoes-simulador-extraidas.json').write_text(json.dumps(doc_data, ensure_ascii=False, indent=2))
print('ORIENTACOES')
for p in paras:
    print(f"P{p['p']}: {p['text']}")
print('COMMENTS', json.dumps(comments, ensure_ascii=False))
for fname in ['mapeamento_CCESP_FCESP_SP_2026 (1.2).xlsx', 'Quadro_consolidado_cargos_cotas_siorg_estrutura_dentro_de_cada_orgao.xlsx']:
    book = load_workbook(base/fname, read_only=True, data_only=False)
    sheets = []
    for ws in book:
        rows = []
        for row in ws.iter_rows():
            cells = [{'cell': c.coordinate, 'value': c.value} for c in row if c.value is not None]
            if cells:
                rows.append(cells)
        sheets.append({'sheet': ws.title, 'max_row': ws.max_row, 'max_column': ws.max_column, 'rows': rows})
    target = out / ('cobertura-mapeamento.json' if fname.startswith('mapeamento') else 'cobertura-quadro.json')
    target.write_text(json.dumps({'path': str(base/fname), 'sheets': sheets}, ensure_ascii=False, indent=2, default=str))
    print('WORKBOOK', fname, len(sheets), 'sheets')
    for sheet in sheets:
        print(json.dumps({k:v for k,v in sheet.items() if k != 'rows'},ensure_ascii=False))
    book.close()

path = Path('/Users/eduardofariascappia/Downloads/SGGD- TESTE1.xlsx')
book = load_workbook(path, read_only=True, data_only=False)
sheets = []
for ws in book:
    rows = []
    for row in ws.iter_rows():
        cells = [{'cell': c.coordinate, 'value': c.value} for c in row if c.value is not None]
        if cells:
            rows.append(cells)
    sheets.append({'sheet': ws.title, 'max_row': ws.max_row, 'max_column': ws.max_column, 'rows': rows})
(out / 'cobertura-teste1.json').write_text(json.dumps({'path': str(path), 'sheets': sheets}, ensure_ascii=False, indent=2, default=str))
print('TESTE1',json.dumps([{k:v for k,v in s.items() if k != 'rows'} for s in sheets],ensure_ascii=False))
book.close()
