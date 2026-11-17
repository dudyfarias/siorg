from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.opc.constants import RELATIONSHIP_TYPE as RT
import json

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'outputs/preparacao-siorg-2026-10-19'
OUT.mkdir(parents=True, exist_ok=True)

def base(title):
    d = Document()
    for border in list(d.styles.element.xpath('.//w:pBdr')):
        border.getparent().remove(border)
    for border in list(d.element.xpath('.//w:pBdr')):
        border.getparent().remove(border)
    s = d.sections[0]
    s.page_width, s.page_height = Inches(8.5), Inches(11)
    s.top_margin = s.bottom_margin = Inches(.7)
    s.left_margin = s.right_margin = Inches(.8)
    s.header_distance = s.footer_distance = Inches(.3)
    for name in ['Normal', 'Title', 'Subtitle', 'Heading 1', 'Heading 2']:
        st = d.styles[name]
        st.font.name = 'Calibri'
        st.font.color.rgb = RGBColor(0,0,0)
        st.font.size = Pt(11)
        st.paragraph_format.space_after = Pt(6)
        st.paragraph_format.line_spacing = 1.08
    d.styles['Title'].font.size = Pt(23)
    d.styles['Title'].font.bold = True
    d.styles['Heading 1'].font.size = Pt(15)
    d.styles['Heading 1'].paragraph_format.space_before = Pt(12)
    d.styles['Heading 2'].font.size = Pt(12)
    d.styles['Heading 2'].paragraph_format.space_before = Pt(10)
    f=s.footer.paragraphs[0]
    f.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    r=f.add_run('SIORG  •  19/10/2026  •  '); r.font.size=Pt(9)
    field=OxmlElement('w:fldSimple'); field.set(qn('w:instr'),'PAGE'); f._p.append(field)
    d.core_properties.title=title
    d.core_properties.author='Eduardo Farias Cappia'
    d.add_paragraph(title,'Title')
    d.add_paragraph('Preparação para o teste interno de 22 de outubro de 2026','Subtitle')
    return d

def p(d,text): return d.add_paragraph(text)
def h(d,text): return d.add_paragraph(text,'Heading 1')
def b(d,text): return d.add_paragraph(text,'List Bullet')
def label(d,lead,text):
    z=d.add_paragraph(); z.add_run(lead+': ').bold=True; z.add_run(text); return z
def table(d,headers,rows,widths):
    t=d.add_table(rows=1, cols=len(headers)); t.autofit=False
    for i,w in enumerate(widths): t.columns[i].width=Inches(w)
    for i,txt in enumerate(headers): t.rows[0].cells[i].text=txt
    for row in rows:
        cells=t.add_row().cells
        for i,txt in enumerate(row): cells[i].text=txt
    pr=t._tbl.tblPr
    borders=OxmlElement('w:tblBorders')
    for edge in ['top','left','bottom','right','insideH','insideV']:
        el=OxmlElement('w:'+edge); el.set(qn('w:val'),'single'); el.set(qn('w:sz'),'4'); el.set(qn('w:color'),'D9D9D9'); borders.append(el)
    pr.append(borders)
    for ri,row in enumerate(t.rows):
        trpr=row._tr.get_or_add_trPr()
        el=OxmlElement('w:cantSplit'); trpr.append(el)
        if ri==0: trpr.append(OxmlElement('w:tblHeader'))
        for ci,c in enumerate(row.cells):
            c.width=Inches(widths[ci]); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            tcpr=c._tc.get_or_add_tcPr(); mar=OxmlElement('w:tcMar')
            for edge in ['top','left','bottom','right']:
                el=OxmlElement('w:'+edge); el.set(qn('w:w'),'95'); el.set(qn('w:type'),'dxa'); mar.append(el)
            tcpr.append(mar)
            sh=OxmlElement('w:shd'); sh.set(qn('w:fill'),'E8EEF3' if ri==0 else 'FFFFFF'); tcpr.append(sh)
            for pp in c.paragraphs:
                pp.paragraph_format.space_after=Pt(2); pp.paragraph_format.line_spacing=1.05
                for rr in pp.runs: rr.font.size=Pt(10.5); rr.bold=(ri==0)
    d.add_paragraph().paragraph_format.space_after=Pt(0)
    return t

def hyperlink(par,text,url):
    rel=par.part.relate_to(url,RT.HYPERLINK,is_external=True)
    el=OxmlElement('w:hyperlink'); el.set(qn('r:id'),rel)
    run=OxmlElement('w:r'); prop=OxmlElement('w:rPr')
    col=OxmlElement('w:color'); col.set(qn('w:val'),'164F76'); prop.append(col)
    under=OxmlElement('w:u'); under.set(qn('w:val'),'single'); prop.append(under)
    run.append(prop); txt=OxmlElement('w:t'); txt.text=text; run.append(txt); el.append(run); par._p.append(el)

def technical_content():
    d=base('Conteúdos do SIORG para revisão técnica')
    p(d,'Reunimos seis pontos do diagnóstico para confirmar com a área responsável. Para cada um, indicamos onde está o conteúdo, o problema registrado e a informação necessária para preparar a melhoria. Pedimos que a área confira a situação publicada hoje e devolva os textos e referências validados.')
    pp=p(d,'Base documental: ')
    hyperlink(pp,'Diagnostico_SIORG_BR.docx no SharePoint','https://governosp.sharepoint.com/:w:/r/teams/SGGD-EquipeTransioSGGD/_layouts/15/Doc.aspx?sourcedoc=%7BA13B5FC9-28C1-47D4-9E94-703166C05D89%7D&file=Diagnostico_SIORG_BR.docx&action=default&mobileredirect=true&wdwpf=doclib-t')
    pp.add_run(', cópia obtida em 19/10/2026, com modificação indicada em 10/09/2026. Os apontamentos abaixo vêm desse diagnóstico; a permanência de cada problema no portal deve ser confirmada.')
    items=[
      ('1 Definições de CCESP e FCESP',
       'Institucional → O que é QGCFC, glossário e respostas relacionadas da FAQ.',None,
       'O diagnóstico aborda quem pode ocupar CCESP e FCESP e a diferença entre cargos, funções e cotas. Precisamos de uma explicação curta que preserve requisitos e exceções.',
       'Confirmar a redação sobre vínculo exigido, requisitos, reservas e exceções de CCESP e FCESP, com os dispositivos legais aplicáveis. Confirmar também como explicar a diferença entre quantitativo de cargos ou funções e cotas. Indicar se a explicação já foi atualizada no portal.',
       'Apresentar um glossário breve, com exemplos simples e link para a norma correspondente.',
       'Diagnóstico, seção 4.1.2, definições de QGCFC, CCESP, FCESP e cotas.'),
      ('2 Referência legal sobre requisitos',
       'Perguntas frequentes → Quadro Geral → pergunta 3.4.',
       'https://www.siorg.sp.gov.br/siorg/Canais%20de%20comunica%C3%A7%C3%A3o/perguntas%20frequentes%20-%20faq',
       'O diagnóstico registra referência ao artigo 9º da LC nº 1.395/2023 para requisitos gerais que identifica no artigo 7º. É necessário conferir a resposta atualmente publicada.',
       'Enviar a pergunta e a resposta atuais, indicar o dispositivo que fundamenta cada requisito e informar a redação correta. Confirmar se basta ajustar a remissão ou se há exceções e alterações normativas posteriores a incorporar.',
       'Corrigir a referência e o texto após a conferência da área, mantendo o link para a fonte legal.',
       'Diagnóstico, seção 4.3, trecho sobre a referência legal da pergunta 3.4.'),
      ('3 Consulta de quantitativos e cotas por órgão',
       'FAQ, pergunta 1.4, e página Transparência.',
       'https://www.siorg.sp.gov.br/siorg/transparencia',
       'O diagnóstico registra uma resposta que remete ao Anexo VII do Decreto nº 68.742/2024. A orientação precisa considerar os atos aplicáveis a cada órgão e esclarecer o que os dados representam.',
       'Indicar a consulta oficial e os atos que sustentam os quantitativos e cotas, incluindo alterações e data da base. Explicar as medidas de CCESP e FCESP e, quando houver saldo disponível, qual definição e fonte o sustentam. Confirmar como orientar o usuário diante de um ato posterior que altera o quadro.',
       'Usar uma resposta curta com o caminho de consulta, a data da informação e a distinção entre quantidade, cotas, alocação e disponibilidade.',
       'Diagnóstico, seção 4.5 e capítulo 8. Comentário de Marina sobre a consulta individualizada ou tabela por órgão.'),
      ('4 Guias e modelos vigentes',
       'Produtos → Material Instrucional e Modelo de Documentos.',
       'https://www.siorg.sp.gov.br/siorg/produtos/materail%20Instrucional',
       'Os materiais existem. Precisamos confirmar quais versões devem ser usadas e em que etapa, antes de reorganizar os links e as orientações no portal.',
       'Enviar a relação dos guias e modelos válidos com arquivo, finalidade, público, etapa, versão ou data e responsável técnico. Indicar materiais substituídos, campos e documentos obrigatórios e exemplos preenchidos que possam ser publicados. Informar se o novo simulador exige revisão desses materiais.',
       'Organizar o conteúdo por etapa, mostrando orientação, documento necessário, modelo vigente e próximo passo.',
       'Diagnóstico, seção 4.3, trechos sobre materiais instrucionais e modelos de documentos.'),
      ('5 Leitura e atualização dos painéis',
       'Transparência → painéis de cargos, cotas e revisão das estruturas.',
       'https://www.siorg.sp.gov.br/siorg/transparencia',
       'O diagnóstico reconhece os painéis existentes. A cobertura, a atualização e o significado das medidas precisam ser confirmados para orientar sua leitura; isso não demonstra erro nos dados.',
       'Informar quem mantém os painéis, quais órgãos e períodos estão cobertos, as fontes e a frequência de atualização. Explicar as medidas e fases, o que cada painel acompanha, seus limites de consulta ou exportação e o próximo passo de cada fase. Indicar a data da última atualização.',
       'Incluir uma orientação breve ao lado de cada painel, com data, fonte e limites da consulta.',
       'Diagnóstico, seções 4.10 e 4.11 e capítulo 8, acompanhamento das estruturas e painéis existentes.'),
      ('6 Finalidade dos canais de atendimento',
       'Fale Conosco, Perguntas frequentes e Ouvidoria.',
       'https://www.siorg.sp.gov.br/siorg/Canais%20de%20comunica%C3%A7%C3%A3o/fale%20conosco',
       'O Fale Conosco já apresenta público e finalidade. O diagnóstico propõe tornar mais clara a escolha entre os canais e confirmar os encaminhamentos.',
       'Confirmar quais assuntos e públicos devem usar cada canal, a unidade responsável, os contatos oficiais e os prazos pactuados que podem ser divulgados. Informar como encaminhar assuntos fora do escopo e se essa orientação já foi atualizada.',
       'Apresentar instruções curtas para escolher o canal. Publicar prazos somente quando houver confirmação do responsável.',
       'Diagnóstico, seções 4.6 e 4.10. Comentário de Marina sobre explicar a finalidade de cada canal.')
    ]
    for i,(title,where,url,issue,request,suggestion,source) in enumerate(items):
        if i in (2,4): d.add_page_break()
        h(d,title)
        pp=label(d,'Onde',where)
        if url:
            pp.add_run(' '); hyperlink(pp,'Página de referência',url)
        label(d,'Ponto a conferir',issue)
        label(d,'O que precisamos receber',request)
        label(d,'Nossa sugestão',suggestion)
        z=label(d,'Origem',source)
        for r in z.runs: r.font.size=Pt(9.5)
    h(d,'Devolutiva da área')
    p(d,'Para cada item, indicar se a situação já foi corrigida ou se precisa de atualização. Enviar a redação final, os links ou arquivos corretos, a fonte, o responsável pela validação e a data. Nossa equipe adapta a apresentação e incorpora o conteúdo validado ao ambiente de teste.')
    d.save(OUT/'Conteudos_SIORG_para_revisao_tecnica_19-10-2026.docx')

def plan():
    d=base('Plano de trabalho do SIORG')
    p(d,'Vamos preparar as linhas do tempo, o novo percurso do simulador e os ajustes do diagnóstico para o teste da equipe. O piloto será SGGD, uma autarquia e uma agência reguladora. Os nomes das duas últimas serão indicados pela Tatiana.')
    h(d,'O que queremos entregar')
    table(d,['Frente','Resultado para o usuário'],[
        ['Novas estruturas','Escolher o órgão ou a entidade e consultar os decretos, com resoluções, alterações e revogações vinculadas.'],
        ['Produtos','Ler as orientações, baixar o Excel ou montar uma proposta no portal, com cotas, resumo e Anexo II derivados dos mesmos dados.'],
        ['Diagnóstico','Navegação e apresentação ajustadas no teste. Questões de conteúdo organizadas em Word para a área responsável responder.']],[1.35,5.55])
    h(d,'Agenda proposta')
    table(d,['Dia','Trabalho'],[
        ['19/10 • segunda','Conferir materiais, separar pendências e preparar o desenho das informações e dos testes.'],
        ['20/10 • terça','Montar a linha da SGGD e o percurso de Produtos; incorporar os modelos recebidos e os ajustes visuais autorizados.'],
        ['21/10 • quarta','Completar as linhas dos pilotos definidos, conferir fontes, cálculos e navegação e preparar a versão de teste.'],
        ['22/10 • quinta','Testar com a equipe e registrar erros, dúvidas e mudanças necessárias.'],
        ['23/10 • sexta','Alinhar ajustes e encaminhamento às áreas, se a reunião semanal for transferida.']],[1.35,5.55])
    p(d,'Essa agenda depende da chegada dos modelos e das condições do ambiente de teste. O prazo do simulador completo, com salvamento e exportações, precisa ser fechado após essas conferências. Telas demonstrativas devem ser identificadas como demonstração.')
    d.add_page_break()
    h(d,'Como organizar as linhas do tempo')
    p(d,'Escolher órgão ou entidade → ver os grupos de decretos → abrir os atos relacionados e suas fontes oficiais.')
    p(d,'Cada grupo começa pelo decreto. Abaixo ficam a resolução correspondente e os atos que o alteram ou revogam, quando documentados. Os grupos são ordenados pela publicação do decreto; cada ato vinculado mostra sua própria data. Assim atendemos ao agrupamento pedido pela Laura sem esconder datas diferentes.')
    p(d,'Usar uma lista vertical com títulos curtos, resumo do que mudou e link do Diário Oficial. Os detalhes podem ser expandidos. Aplicar as cores do portal e deixar a estrutura preparada para novas informações da DMO.')
    p(d,'Não inferir revogação pela existência de um decreto mais novo. Registrar o dispositivo e distinguir alteração, revogação parcial e total. Data ou vínculo ainda não conferido fica marcado como pendente.')
    h(d,'Como organizar o simulador')
    p(d,'Orientações → órgão ou entidade → baixar Excel ou simular → estrutura proposta → cotas e resumo → Anexo II proposto.')
    p(d,'A proposta começa com uma cópia da estrutura de referência do órgão. Alterar uma unidade não apaga as alterações nas demais. Os cálculos, o resumo e os arquivos gerados usam essa mesma proposta.')
    p(d,'A Reestruturação será o único ponto de edição, com campos simples e ajuda no ícone de informação. O roteiro prevê manter, acrescentar e retirar cargos, além de criar, renomear, transferir e retirar unidades, conforme as regras e exceções de cada regime.')
    table(d,['Já podemos reaproveitar','Ainda precisa ser desenvolvido'],[
        ['Visual SIORG, seletores e ajuda contextual','Editor da estrutura completa e proposta preservada entre unidades'],
        ['Cálculo exato e comparação dos Anexos II e III da SGGD','Resumo das mudanças na estrutura e geração de Anexo II em PDF e Excel'],
        ['Alertas e identificação das fontes','Salvamento e retomada, conforme a solução autorizada no ambiente']],[3.15,3.75])
    p(d,'Na SGGD, o Anexo III fornece os limites e o Anexo II mostra o que está alocado. O saldo é a diferença entre eles. Quantidades e cotas de CCESP e FCESP continuam separadas. A área técnica valida as bases e regras de cada piloto.')
    p(d,'O Anexo II terá quatro colunas: Unidade, QTD, Denominação cargo/função e CCESP/FCESP. A saída exclui zeros, retirados e alertas internos e inclui toda a proposta. O valor mensal de referência previsto no modelo depende da conferência da tabela remuneratória e de sua vigência.')
    d.add_page_break()
    h(d,'Material já recebido')
    p(d,'Em 19/10, obtivemos pelo navegador o HTML do Rafael, o levantamento, o diagnóstico do SharePoint, as orientações do simulador, o mapeamento de regimes, o quadro consolidado e SGGD TESTE1. As pastas de autarquias e agências estavam vazias.')
    p(d,'O HTML e o levantamento têm os mesmos dez marcos SGGD. As datas e os vínculos ainda precisam de conferência. Há duplicações e links divergentes na base ampla; o consolidado e TESTE1 também trazem quantitativos diferentes para SGGD. Vamos conferir a origem antes de importar.')
    h(d,'O que precisamos confirmar')
    b(d,'Tatiana e área técnica: nomes e modelos da autarquia e da agência; base SGGD, regras, exceções e textos finais das orientações.')
    b(d,'Equipe: quais ajustes do diagnóstico já estão aprovados para aplicação no teste.')
    b(d,'Equipe técnica do CMS: endereço do teste, permissões para a ferramenta, acesso à base, geração de arquivos e forma de salvar e retomar propostas.')
    p(d,'No salvamento, definir se a retomada será também em outro computador, como identificar a pessoa e onde guardar a proposta.')
    h(d,'O que conferir no teste de quinta')
    for t in [
        'Selecionar cada piloto e conferir se a linha do tempo, a estrutura e o Excel correspondem à escolha.',
        'Abrir os links oficiais e conferir datas, vínculos e alcance de eventuais revogações.',
        'Alterar duas unidades e voltar à primeira sem perder o preenchimento nem contar posições duas vezes.',
        'Conferir se estrutura, cotas, resumo, PDF e Excel apresentam a mesma proposta. No Anexo II, excluir zeros e retirados e exportar também os blocos recolhidos.',
        'Testar limite excedido, dado inválido e base incompleta. Informação ausente não pode aparecer como zero.',
        'Fechar e reabrir uma proposta para verificar a retomada, quando o salvamento estiver disponível.',
        'Usar teclado e tela pequena para conferir seleção, ajuda, leitura e expansão dos atos.'
    ]: b(d,t)
    h(d,'Como acompanhar as pendências')
    p(d,'Registrar a entrega afetada, quem fornece a resposta e a data necessária. Conteúdos técnicos serão devolvidos pela área responsável; Eduardo incorpora os textos validados. Conferir também as fórmulas de matriz na versão de Excel usada pela equipe.')
    p(d,'Ainda não temos medição que aponte o servidor como gargalo. No teste, registrar tempo de resposta, falhas, tamanho das estruturas e acessos simultâneos. Isso permitirá avaliar a capacidade necessária com a equipe técnica.')
    d.save(OUT/'Plano_de_trabalho_SIORG_19-10-2026.docx')

if __name__=='__main__':
    plan()
    technical_content()
    print(OUT/'Plano_de_trabalho_SIORG_19-10-2026.docx')
    print(OUT/'Conteudos_SIORG_para_revisao_tecnica_19-10-2026.docx')
