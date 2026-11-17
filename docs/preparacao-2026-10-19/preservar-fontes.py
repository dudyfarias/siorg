from pathlib import Path
import shutil,hashlib,json

root=Path(__file__).resolve().parents[2]
dest=root/'sources/preparacao-2026-10-19'
dest.mkdir(parents=True,exist_ok=True)
dl=Path('/Users/eduardofariascappia/Downloads')
sources=[(dl/'index (1) (1).html','2026-10-18 11:46'),(dl/'SGGD- TESTE1.xlsx','2026-10-08 10:56')]
dates={'Diagnostico_SIORG_BR.docx':'2026-09-10 17:15','Levantamento atos reestruturação.xlsx':'2026-10-07 09:11','mapeamento_CCESP_FCESP_SP_2026 (1.2).xlsx':'2026-10-16 08:28','Orientacoes_simulador_cotas.docx':'2026-10-16 10:33','Quadro_consolidado_cargos_cotas_siorg_estrutura_dentro_de_cada_orgao.xlsx':'2026-09-24 13:33'}
sources += [(dl/'OneDrive_1_19-10-2026'/n,d) for n,d in dates.items()]
records=[]
for src,modified in sources:
    target=dest/src.name
    if target.exists() and target.read_bytes()!=src.read_bytes(): raise ValueError(f'Different existing copy: {target}')
    shutil.copy2(src,target)
    records.append({'file':src.name,'download_path':str(src),'reference_copy':str(target),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size,'sharepoint_modified_display':modified,'observed_date':'2026-10-19','method':'Download via authenticated Safari UI; user completed login','validation':'Received and inspected; not institutional approval'})
(dest/'manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
(dest/'LEIA-ME.md').write_text('''# Fontes recebidas do SharePoint

Cópias obtidas em 19/10/2026 pelo Safari, após autorização do usuário e autenticação concluída por ele. Os sete arquivos foram preservados sem edição; o manifesto registra tamanho, hash e data de modificação exibida na biblioteca. Datas da interface não comprovam aprovação técnica.

Pasta consultada: SGGD Equipe Transição / Documentos / General / DIGEP / CIGEP Coordenadoria de Inteligência em Gestão / Comunicação / SIORG. O modelo SGGD estava na subpasta Secretarias. As subpastas Autarquias e Agências reguladoras estavam vazias nessa consulta. Nenhum arquivo foi enviado, alterado ou publicado no SharePoint.

O diagnóstico baixado difere das versões locais anteriores e passou a ser a referência principal do Word de questões técnicas. O levantamento e o HTML SGGD coincidem em dez marcos, mas exigem separação das datas e conferência dos vínculos. As abas do levantamento não devem ser concatenadas sem reconciliação. O consolidado e TESTE1 têm diferenças de quantitativos que precisam ser verificadas antes da importação.

Os documentos de preparação estão em docs/preparacao-2026-10-19. As evidências detalhadas estão em evidence/preparacao-2026-10-19. Estas fontes permanecem fora das entregas públicas do protótipo.
''',encoding='utf-8')
print(f'{len(records)} fontes preservadas em {dest}')
