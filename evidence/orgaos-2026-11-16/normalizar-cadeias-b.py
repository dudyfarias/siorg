"""Normalize already downloaded official evidence. Does not modify application or workbooks."""
from pathlib import Path
from html.parser import HTMLParser
from decimal import Decimal
import json, re, hashlib

P = Path(__file__).parent

class Tables(HTMLParser):
    def __init__(self):
        super().__init__(); self.rows=[]; self.row=None; self.cell=None
    def handle_starttag(self, tag, attrs):
        if tag == 'tr': self.row=[]
        if tag in ('td', 'th'): self.cell=[]
    def handle_data(self, data):
        if self.cell is not None: self.cell.append(data)
    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.cell is not None:
            if self.row is not None: self.row.append(' '.join(' '.join(self.cell).split()))
            self.cell=None
        if tag == 'tr' and self.row is not None:
            self.rows.append(self.row); self.row=None

def dump(name, obj):
    (P/name).write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n')

def moves(rows, source, code_first=False):
    result=[]
    for i, row in enumerate(rows):
        if len(row) < 6 or not re.fullmatch(r'\d+', row[0]): continue
        m=re.search(r'(CCESP|FCESP)\s*([12]\.\d{2})', row[3]); assert m, row[3]
        label=row[3]
        denomination=re.sub(r'^\s*(CCESP|FCESP)\s*[12]\.\d{2}\s*[-–—]\s*', '', label) if code_first else label[:m.start()].strip(' –—-')
        result.append({'sourceUnitCode':row[0], 'sourceUnit':row[1], 'sourceVacancyId':row[2],
                       'destinationUnitCode':row[4], 'destinationUnit':row[5],
                       'code':m.group(1)+' '+m.group(2), 'denomination':denomination,
                       'sourcePositionLabel':label, 'quantity':'1', 'sourceUrl':source,
                       'sourceRow':i+1})
    return result

spm=[]
for item in json.loads((P/'spm-cadeia-extracted.json').read_text()):
    if not item['tables'] or 'Origem' not in ' '.join(item['tables'][0]): continue
    raw=json.loads((P/item['file']).read_text())
    m=re.search(r'(?:de|DE)\s+(\d{1,2})\s+(?:de|DE)\s+([A-Za-zÇç]+)\s+(?:de|DE)\s+(20\d{2})',raw['title'])
    months={'janeiro':'01','março':'03','maio':'05','junho':'06','julho':'07','setembro':'09','outubro':'10','novembro':'11','dezembro':'12'}
    actdate=f'{m[3]}-{months[m[2].lower()]}-{int(m[1]):02}' if m else None
    act={'id':'spm-mov-'+raw['date'], 'title':raw['title'], 'actDate':actdate,
         'publicationDate':raw['date'], 'sourceUrl':item['url'], 'rawFile':item['file'],
         'sha256':hashlib.sha256((P/item['file']).read_bytes()).hexdigest(),
         'classification':'allocation-transfer', 'changes':moves(item['tables'],item['url'],True),
         'aggregateQuantityChange':'0', 'aggregateQuotaChangeCents':'0',
         'status':'explicit-transfers-extracted', 'limitations':[]}
    if '10 (dez) dias úteis' in item['text']:
        act['effectiveRule']='10 dias úteis após publicação; data final não inferida sem calendário aplicável.'
    else: act['effectiveDate']=raw['date']
    if raw['date']=='2025-11-07':
        act['classification']='duplicate-publication'
        act['duplicateMovementSetOf']='spm-mov-2025-11-05'
        act['limitations'].append('As cinco movimentações repetem integralmente a publicação de 05/11; não aplicar duas vezes. Relação editorial não identificada expressamente no texto.')
    if raw['date']=='2025-12-10':
        bad=next(x for x in act['changes'] if x['sourceVacancyId']=='2412660')
        bad['documentaryConflict']={'printedCode':'CCESP 2.09','printedDenomination':'ASSESSOR II',
          'sameVacancyEarlierCode':'CCESP 2.10','sameVacancyLaterCode':'CCESP 2.10',
          'earlierSource':'https://doe.sp.gov.br/executivo/secretaria-de-politicas-para-a-mulher/resolucao-spm-n-033-de-5-de-novembro-de-2025-20251106113512201451061',
          'laterSource':'https://doe.sp.gov.br/executivo/secretaria-de-politicas-para-a-mulher/resolucao-n-10-de-20-de-marco-de-2026-20260320113612201723401',
          'handling':'Preservar o código impresso como evidência. O ato transfere a vaga; não explicita conversão de nível. A conciliação da vaga 2412660 deve ser registrada, não corrigida silenciosamente.'}
        act['status']='explicit-transfers-extracted-with-code-conflict'
        act['limitations'].append('Vaga 2412660 impressa CCESP 2.09/Assessor II; atos anterior e posterior identificam a mesma vaga como CCESP 2.10/Assessor II.')
    spm.append(act)
spm.sort(key=lambda x:x['publicationDate'])
dump('spm-cadeia-movements.json', {'organizationId':'spm','checkedAt':'2026-11-16','acts':spm,
    'actCount':len(spm),'printedMovementCount':sum(len(x['changes']) for x in spm),
    'movementCountExcludingIdenticalRepetition':sum(len(x['changes']) for x in spm if not x.get('duplicateMovementSetOf')),
    'status':'official-movements-extracted; one-code-conflict-and-one-identical-repetition-preserved',
    'scope':'Busca oficial por 69.430 (141 resultados em duas páginas), cotejada com busca exata por classificação dos CCESP. Não é certidão de completude da legislação.'})

f='sesp-res-2026-01-14-republicacao-raw.json'; raw=json.loads((P/f).read_text());t=Tables();t.feed(raw['content'])
source='https://doe.sp.gov.br/'+raw['slug']
jan={'id':'sesp-res-2026-01-14','title':'Resolução do Secretário Executivo de 14/01/2026',
     'actDate':'2026-01-14','publicationDate':'2026-01-15','completePublicationDate':'2026-01-16',
     'sourceUrl':source,'originalPublicationUrl':'https://doe.sp.gov.br/executivo/secretaria-de-esportes/resolucao-20260114122342481571529',
     'rawFile':f,'classification':'allocation-transfer','changes':moves(t.rows,source),
     'aggregateQuantityChange':'0','aggregateQuotaChangeCents':'0','status':'explicit-transfers-extracted',
     'effectiveRule':'10 dias úteis após publicação; o ato aparece em 15/01 sem anexo e em 16/01 com anexo; data de eficácia final não inferida.',
     'limitations':[],
     'documentaryTrail':{'originalEditionPdf':'sesp-doe-edicao-2026-01-15.pdf','originalPage':53,
         'originalPageVisuallyChecked':True,'originalAnnexAbsent':True,
         'corroboratingApostilaUrl':'https://doe.sp.gov.br/executivo/secretaria-de-esportes/apostila-20260114122342181571549',
         'corroboratingApostilaPages':[52,53],
         'conclusion':'As quatro linhas foram recuperadas na publicação oficial de 16/01, corroboradas pela apostila de 14/01 publicada em 15/01. Não duplicar movimentações.'}}
dump('sesp-res-2026-01-14-movements.json',{'organizationId':'sesp','act':jan})

base=json.loads((P/'revisao-secretarias-b.json').read_text())
orgs={x['sigla']:x for x in base['organizations']}
orgs['SPM']['reviewedLaterActs']=spm
orgs['SESP']['reviewedLaterActs']=[jan if x['id']=='sesp-res-2026-01-14' else x for x in orgs['SESP']['reviewedLaterActs']]

stm={'id':'decreto-70705-2026','title':'Decreto 70.705/2026','actDate':'2026-06-22','publicationDate':'2026-06-23',
     'sourceUrl':'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70705-22.06.2026.html',
     'rawFile':'stm-posterior-70705-alesp.html','classification':'unit-rename-only',
     'quantityOrQuotaChange':False,'effectiveDate':'2026-06-23',
     'changes':[{'type':'unit-rename','before':'Coordenadoria de Gestão de Empreendimentos, Investimentos e Orçamento',
                 'after':'Coordenadoria de Desenvolvimento e Dados de Mobilidade Metropolitana','provision':'Artigo 1º'}],
     'workbookAlreadyApplied':True,'workbookEvidence':['Instruções!B7','Reestruturação!A150','Resumo!A28']}
orgs['STM']['reviewedLaterActs']=[stm]
dump('stm-decreto-70705-rename.json',stm)

t=Tables();t.feed((P/'spm-decreto-base-alesp.html').read_text());rows=[x for x in t.rows if len(x)==4 and x[0].startswith('CCESP')]
totalq=sum(int(x[2]) for x in rows); totalc=sum(Decimal(x[3].replace('.','').replace(',','.')) for x in rows)
orgs['SPM']['numericDiscrepancy']={'sourceUrl':orgs['SPM']['baseUrl'],'sourceFile':'spm-decreto-base-alesp.html',
    'annex':'III','printedQuantity':'49','summedQuantity':str(totalq),
    'printedQuotaCents':'17875','summedQuotaCents':str(int(totalc*100)),
    'allocationAnnexIIQuotaCents':'17850','rows':[{'code':x[0],'unitQuota':x[1],'quantity':x[2],'printedTotalQuota':x[3]} for x in rows],
    'verification':'Conferência independente no HTML oficial original ALESP; quantidade e soma das linhas calculadas com Decimal; total impresso mantido separado.'}

for sigla,org in orgs.items():
    reviewed=org.setdefault('reviewedLaterActs',[])
    for act in org.get('laterDecreesFetched',[]):
        n=re.search(r'(?:Decreto|DECRETO).*?([67][09]\.?\d{3})',act['title'])
        number=n[1].replace('.','') if n else None
        if number in ('70705','70963'):continue
        cls='old-extinguished-positions-annex-v-a-only' if number in ('69505','69501') else 'budget-classification-only'
        entry={'title':act['title'],'sourceUrl':act['url'],'rawFile':act['file'],
               'publicationDateSource':act['publicationDate'],'classification':cls,
               'quantityOrQuotaChange':False,'changes':[],
               'conclusion':'Altera somente o Anexo V-A de cargos antigos extintos; não recompõe CCESP/FCESP dos Anexos II/III.' if cls.startswith('old-') else 'Altera classificação institucional financeira/orçamentária; não recompõe nem remaneja CCESP/FCESP dos Anexos II/III.'}
        if number=='69717':entry['metadataConflict']='A ementa na anotação de correlação da API ALESP diz Pessoa com Deficiência; o decreto original trata da Secretaria de Políticas para a Mulher. O original prevalece como evidência.'
        if not any(x.get('sourceUrl')==entry['sourceUrl'] for x in reviewed):reviewed.append(entry)
    org['reviewScopeNote']='Decreto-base e ficha de alterações/correlações ALESP verificados em 16/11/2026; fichas não garantem a captura de todas as resoluções posteriores. Atos identificados foram classificados pelo conteúdo original.'
base['status']='base-acts-and-known-later-acts-reviewed; spm-code-conflict-preserved'
base['coverageNote']='Oito secretarias; SGGD-70963 é registro suplementar do ato pesquisado, não um nono órgão. Evidência documental para teste, sem certificar aprovação técnica ou completude absoluta.'
dump('revisao-secretarias-b.json',base)
print('SPM',len(spm),'acts',sum(len(x['changes']) for x in spm),'printed movements')
print('SESP January',len(jan['changes']),'recovered movements')
