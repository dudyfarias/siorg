# SIORG — preparação da linha do tempo para 21/10/2026

Preparação em 19/10/2026, atualizada após recebimento do modelo correto e do levantamento baixados do SharePoint pelo agente principal. Entrega: leitura estática do modelo e da planilha, proposta de estrutura dos dados, regras de apresentação e teste mínimo. Não foi construída interface nem pesquisado o histórico completo dos órgãos. Esta frente não operou SharePoint/navegador, não executou os scripts do HTML, não publicou nem alterou o aplicativo ou a planilha.

## Decisão que esta preparação apoia

Definir como transformar o levantamento histórico em uma consulta simples por **órgão ou entidade**, com o decreto-base e os atos relacionados, fontes oficiais e cronologia compreensível. O piloto tem **três participantes; somente SGGD está definida**. Os outros dois dependem da indicação de Tatiana. Educação e Saúde, presentes na calculadora, não estão automaticamente escolhidas para a linha do tempo.

O alinhamento local de 24/09 prevê levantamento histórico estruturado por Rafael, revisão da área técnica e implementação de Eduardo no CMS após validação. Esta preparação atende ao novo recorte solicitado para 21/10; não implica que a implementação da linha do tempo já exista. O documento anterior descreve a Linha Histórica como consulta posterior às frentes de calculadora e distribuição.

## Verificação do arquivo indicado e das fontes disponíveis

- **Modelo correto recebido:** `/Users/eduardofariascappia/Downloads/index (1) (1).html`, baixado em 19/10 pelo agente principal após autenticação autorizada. Foi lido integralmente como texto, sem executar JavaScript. Tem 17.555 bytes, UTF-8, idioma pt-BR e título **“Linha do Tempo Horizontal - SGGD”**. O arquivo contém uma trilha horizontal de dez marcos, descrições e links oficiais; o modelo deixou de ser pendência.
- O arquivo anterior `/Users/eduardofariascappia/Downloads/index.html` é uma página de “EMC Solução em Telecomunicações”, sem relação com o modelo. Foi descartado como referência SIORG, sem alteração ou exclusão.
- O projeto possui `docs/alinhamento-tres-produtos.md`, que define data de publicação, vigência quando diferente, resumo da mudança, fonte oficial e estado de revisão para a Linha Histórica. O HTML recém-recebido acrescenta uma referência concreta de apresentação.
- Há levantamento normativo local da SGGD, conferido em **24/09/2026**, com cadeia de alterações, uma retificação e resolução de detalhamento. Serve como amostra rastreável para planejar os campos; não foi tratado como pesquisa exaustiva atualizada até 19/10.
- A tentativa de leitura pública de [SIORG — Novas Estruturas](https://www.siorg.sp.gov.br/siorg/novas_estruturas), em 19/10/2026, retornou **403**. A página não foi revalidada nesta frente. Não se conclui indisponibilidade para todas as pessoas e não houve tentativa de contornar a resposta.
- **SharePoint:** autenticação e download do modelo e do levantamento funcionaram na frente principal. Esta frente leu as cópias locais recebidas, sem acesso concorrente ao navegador. O levantamento está em `/Users/eduardofariascappia/Downloads/OneDrive_1_19-10-2026/Levantamento atos reestruturação.xlsx`. A frente principal informou que a interface do SharePoint mostra modificação em **07/10 às 09:11, por Rafael**; esse metadado foi informado pela leitura da interface, não verificado por esta frente nem tratado como certificação de atualização de todos os atos.

## O que o modelo correto contém

O cabeçalho é **“Evolução Normativa e Estrutural”**, para SGGD, com menção a **LC nº 1.395/2023** como marco inicial. A LC não aparece entre os dez registros e não tem link no HTML. São **seis decretos e quatro resoluções**, numa lista única, sem relação explícita entre pais e atos relacionados. Cada registro tem apenas `tipo`, `numero`, `data`, `descricao` e `url`.

A leitura do código mostra cartões de 260 px, rolagem horizontal e um painel compartilhado de detalhes abaixo, aberto ao clicar. O painel atribui invariavelmente o rótulo **“Publicado em”** ao campo único `data`. A ordem é a ordem manual do vetor: não há ordenação por data. Os números 1º a 10º indicam posição na lista, não ordem jurídica. Essas são observações estáticas; o funcionamento em navegador não foi testado por esta frente.

### Inventário literal dos dez marcos

Datas e rótulos abaixo são os do arquivo recebido. Os links foram extraídos; sua presença não comprova acesso bem-sucedido ou conteúdo atualizado.

| Ordem | Ato no modelo | `data` no modelo | Link DOE extraído | Ponto de atenção |
| --- | --- | --- | --- | --- |
| 1 | Decreto nº 69.052/2024 | 14/11/2024 | [DOE — 69.052](https://doe.sp.gov.br/executivo/decretos/decreto-n-69052-de-14-de-novembro-de-2024-20241114118202720092) | Ato e publicação suplementar coincidem no acervo de 24/09. |
| 2 | Decreto nº 69.230/2024 | 23/12/2024 | [DOE — 69.230](https://www.doe.sp.gov.br/executivo/decretos/decreto-n-69230-de-23-de-dezembro-de-2024-20241223118202795458) | Data do ato; publicação registrada no acervo em 26/12/2024. O rótulo “Publicado em 23/12” fica incorreto. |
| 3 | Decreto nº 69.290/2024 | 01/01/2025 | [DOE — 69.290](https://doe.sp.gov.br/executivo/decretos/decreto-n-69290-de-31-de-dezembro-de-2024-20241231118202802536) | O título indicado pela URL refere-se a 31/12/2024. Confirmar se 01/01 é publicação; não concluir pelo endereço. |
| 4 | Decreto nº 69.506/2025 | 30/04/2025 | [DOE — 69.506](https://doe.sp.gov.br/executivo/decretos/decreto-n-69506-de-30-de-abril-de-2025-202504301182021050800) | Ato e publicação suplementar coincidem no acervo; efeitos em 02/05 são informação distinta. |
| 5 | Resolução SGGD nº 25/2025 | 19/05/2025 | [DOE — Resolução 25](https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-25-de-16-05-2025-20250516112812201082990) | Ato de 16/05; confirmar a publicação de 19/05 na fonte. Sua revogação pela Resolução 33 está documentada no acervo. |
| 6 | Resolução SGGD nº 42/2025 | 08/09/2025 | [DOE — Resolução 42](https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-42-de-08-09-2025-20250908112812201325017) | Confirmar publicação e abrangência. A descrição é sobre gestão do QGCFC, não prova vínculo exclusivo com um decreto de estrutura da SGGD. |
| 7 | Decreto nº 69.873/2025 | 19/09/2025 | [DOE — 69.873](https://www.doe.sp.gov.br/executivo/decretos/decreto-n-69873-de-19-de-setembro-de-2025-202509191182021352921) | Descrição de classificação institucional. Confirmar publicação e relação normativa específica. |
| 8 | **Decreto SGGD** nº 70.755/2026 | 15/07/2026 | [DOE — 70.755](https://doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002) | É publicação, enquanto o ato é de 14/07. Padronizar a denominação como **Decreto nº 70.755/2026**, conforme a fonte, sem acrescentar SGGD ao tipo do ato. |
| 9 | Resolução SGGD nº 33/2026 | 22/07/2026 | [DOE — Resolução 33](https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-33-de-22-07-2026-20260723112912201999213) | É data do ato; o acervo registra publicação em 24/07/2026. O rótulo “Publicado em 22/07” fica incorreto. |
| 10 | Resolução SGGD nº 39/2026 | 23/09/2026 | [DOE — Resolução 39](https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-39-de-23-09-2026-20260924112912202154847) | A descrição diz que revoga **dispositivos** da Resolução 33. Conferir publicação, artigos atingidos e efeitos; não apresentar revogação integral da 33. |

Os exemplos 2, 8 e 9 demonstram a mistura de data do ato e data de publicação no mesmo campo. A comparação usa o acervo conferido em 24/09; a planilha de levantamento deve incorporar campos separados e fontes, em vez de corrigir datas só por suposição. A tentativa de ler a URL da Resolução 39 pela ferramenta web em 19/10 não recuperou o conteúdo; nenhum artigo revogado foi inferido.

### Adequações mínimas ao pedido de Laura

1. **Agrupar por decreto:** aproveitar os cartões existentes para apresentar o decreto principal e os atos relacionados abaixo, em vez dos dez eventos soltos. Cadastrar `grupo_exibicao_id` e relações normativas separadamente. Não deduzir o agrupamento apenas pela proximidade das datas ou pela posição atual.
2. **Resolver as relações com o levantamento:** preservar a cadeia 69.052 → atos alteradores; tratar os decretos de classificação institucional conforme seu objeto. A Resolução 39 precisa apontar para os dispositivos afetados da 33. A Resolução 42, de regras de QGCFC, pode ser referência transversal, dependendo da validação; não forçar subordinação a um decreto específico.
3. **Corrigir o significado das datas:** separar data do ato, publicação e efeitos e apresentar o rótulo correspondente. Só ordenar por publicação quando esse dado estiver confirmado.
4. **Adicionar o seletor de órgão/entidade:** SGGD é o primeiro piloto; os outros dois aguardam Tatiana. O título acompanha a seleção sem misturar os históricos.
5. **Manter o essencial do modelo:** tipo, identificação, resumo e botão para DOE. Mostrar o ano no cartão — o código atual usa `numero.split('/')[0]` e retira o ano da identificação resumida. Incluir a LC 1.395/2023 como referência de contexto com fonte, se mantida a chamada “marco inicial”, sem afirmar que ela seja a origem histórica da própria SGGD.
6. **Preservar acesso simples:** transformar o acionador clicável em controle que funcione com teclado e toque; hoje o código cria `div` com evento apenas de clique, sem `tabindex`/tratamento de teclado. A orientação horizontal pode ser mantida no desktop; conferir leitura dos blocos e dos atos relacionados em telas estreitas. Não houve teste visual ou de acessibilidade nesta frente.

## Levantamento recebido — estrutura e cobertura

Leitura somente de dados, fórmulas, comentários e hyperlinks, com Python empacotado e `openpyxl`, após leitura da skill Spreadsheets. Nenhuma gravação ou exportação do XLSX. O hash do original permaneceu igual antes/depois. A extração rastreável foi preservada em `levantamento-inspecao.json`, ao lado desta nota.

Todas as abas usam as sete colunas **A Órgão; B Sigla; C Tipo; D Decreto/Resolução; E Link; F Resumo; G Data de Publicação**. Não há fórmulas. A aba Base tem título na linha 1 e cabeçalhos na linha 2. As abas temáticas repetem cabeçalhos e usam linhas vazias entre grupos; suas dimensões não equivalem à quantidade de atos.

| Aba | Registros preenchidos, excluindo cabeçalhos | Siglas distintas | Composição por tipo | Observação |
| --- | ---: | ---: | --- | --- |
| Base | 162 | 31 | 74 decretos; 58 resoluções; 6 portarias; 24 deliberações | 162 registros distintos no conjunto de campos A:G; isso não é declaração de 162 atos jurídicos únicos nem de completude estadual. |
| Secretarias | 125 | 24 | 67 decretos; 58 resoluções | Inclui também CGE, PGE e Governadoria; o nome da aba não constitui classificação jurídica de todas as linhas. |
| Autarquias | 13 | 4 | 7 decretos; 6 portarias | DETRAN, SPPREV, DER e IMESC. |
| Agências | 27 | 2 | 27 deliberações | São 18 registros distintos: 9 ARSESP e 9 ARTESP; o bloco ARTESP aparece duas vezes. |

**Não somar as quatro abas.** As temáticas têm 165 linhas de registros, mas 156 registros distintos, todos presentes em Base. Os nove registros ARTESP de `Agências!A14:G22` se repetem integralmente em `A26:G34`. Os seis registros SP-Águas de `Base!A141:G146` não aparecem nas temáticas. Assim, **Base é o ponto de partida mais completo desta cópia**, sujeito à revisão dos problemas abaixo; as abas de recortes não devem ser importadas adicionalmente como atos novos.

### Contagem por órgão/entidade na Base

Siglas e nomes são os do levantamento; não se tomou a grafia ou classificação da planilha como validação institucional. Contagens representam registros fornecidos, não cobertura completa de cada órgão.

| Sigla | Registros | Sigla | Registros |
| --- | ---: | --- | ---: |
| CGE | 5 | SGRI | 3 |
| Gov | 7 | SEMIL | 5 |
| PGE | 3 | SPI | 5 |
| SAP | 10 | SPM | 4 |
| SEDUC | 6 | SSP | 2 |
| SFP | 6 | STV | 3 |
| SJC | 4 | SPcD | 5 |
| SAA | 5 | STM | 2 |
| SCTI | 4 | SCEIC | 5 |
| SECOM | 5 | DETRAN | 4 |
| SDE | 5 | SPPREV | 5 |
| SEDS | 4 | IMESC | 2 |
| SDUH | 9 | DER | 2 |
| SESP | 8 | SP-Águas | 6 |
| SGGD | 10 | ARSESP | 9 |
| ARTESP | 9 | — | — |

### Links: o texto e o destino clicável precisam ser preservados

Foram inspecionados **todos os hyperlinks das quatro abas**. Há 276 objetos de hyperlink em Base e nenhum nas outras três; nestas, as URLs aparecem como texto em E. A falta de objeto de hyperlink não significa falta de URL.

Dos 162 textos de URL de Base, 154 apontam ao domínio DOE, 3 à ALESP, 4 à página geral Novas Estruturas do SIORG e 1 ao domínio SP-Águas. Os quatro links genéricos estão em **E75, E124, E147 e E148**; precisam de destino específico do ato para cumprir o botão “Abrir publicação no Diário Oficial”. Não foram abertas todas essas URLs nesta preparação.

Em **12 linhas da Base**, o destino do hyperlink em D difere do endereço escrito em E: **27, 75, 100, 118, 119, 122, 123, 125, 126, 127, 128 e 129**. O JSON preserva os três valores, texto de E, destino de D e destino de E. Exemplo: `D27` identifica a Resolução SAP 52/2026, mas seu hyperlink aponta para a SAP 19/2026; `E27` aponta para a SAP 52. Não confiar automaticamente no clique do nome do ato e não apagar o conflito na importação. Na linha 75, D contém um candidato de ato específico e E uma página geral: é necessária conferência antes de escolher a URL.

**SGGD não integra os 12 conflitos.** Seus dez endereços de E coincidem com os hyperlinks disponíveis em D/E e com os dez URLs do HTML.

### SGGD: confronto do levantamento com o HTML

`Base!A79:G88` e `Secretarias!A4:G13` contêm os mesmos dez registros SGGD, com valores A:G iguais. O HTML reproduz **10/10 identificações, 10/10 URLs e 10/10 datas**, após normalizar espaços e converter a data textual. Há apenas diferenças de pontuação/capitalização em três resumos. Isso mostra correspondência entre os arquivos; **não é validação independente dos fatos normativos**, pois o mesmo dado pode estar reproduzido nos dois.

- **Mistura de datas já vem da Base:** `G80` e `Secretarias!G5` registram 23/12/2024 sob “Data de Publicação”, embora o acervo oficial preservado registre publicação em 26/12. `G87` e `Secretarias!G12` registram 22/07/2026, enquanto a publicação da Resolução 33 foi conferida no acervo em 24/07. O HTML herda ambas.
- `Base!G86` / `Secretarias!G11` registram 15/07/2026, data de publicação do Decreto 70.755, cujo ato é de 14/07. Esse exemplo confirma que a coluna não guarda uniformemente datas do ato.
- **Tipos de data:** nove registros SGGD são datas Excel; `Base!G88` e `Secretarias!G13` contêm texto literal **“23/09/26”**. A exibição no HTML expande para “23/09/2026”, mas isso não comprova que seja publicação. No conjunto Base há 160 datas Excel e dois textos: G88 e **G145 “Sem data”**. Ausência deve permanecer pendente.
- **Comentário existente:** G88 contém pedido para atualizar as demais abas. A Resolução 39 já está em `Secretarias!A13:G13` nesta cópia; portanto, o comentário não prova desatualização atual. Foi tratado como contexto, não como instrução para editar o arquivo.
- **Relações ausentes:** não há coluna de decreto-base, ato afetado, tipo/alcance da relação, dispositivo, data do ato, início de efeitos ou estado de validação. Menções no Resumo ajudam a localizar relações, mas não substituem sua conferência.

### Pendências normativas específicas da SGGD

1. Conferir o inteiro teor da **Resolução 39/2026**: publicação, dispositivos da Resolução 33 revogados e data dos efeitos. O modelo/planilha fornecem sua identificação e descrição, mas não o alcance. O link não foi recuperado pela ferramenta web nesta frente. Não alterar recortes da calculadora ou afirmar revogação integral com base apenas na ementa.
2. Corrigir o significado das datas de **69.230** e **Resolução 33** em uma futura base revisada, preservando os valores originais e a evidência da correção. Conferir as demais datas que ainda não têm distinção ato/publicação no levantamento, especialmente Resoluções 25, 42 e 39 e decretos de classificação.
3. Definir e conferir a atribuição dos atos aos blocos. Em particular, **Resolução 42/QGCFC** não deve ser vinculada exclusivamente a um decreto de estrutura só por proximidade cronológica; **69.290 e 69.873** tratam de classificação institucional e precisam da relação correspondente ao seu objeto.
4. O acervo anterior registra a **retificação do Decreto 69.230 publicada em 10/06/2025** e o **Decreto 70.599/2026**, com revogação de dispositivo específico do 69.506. Eles não estão entre os dez registros SGGD da planilha/HTML. Conferir com a área técnica sua inclusão no recorte escolhido, sem qualificar automaticamente o modelo como histórico completo. A LC 1.395/2023, citada no cabeçalho do HTML, também precisa de referência de contexto se mantida.

### Importação mínima proposta, sem implementação

1. Preservar o XLSX original e uma identificação de versão. Extrair registros de Base com **aba, linha e valores originais**, sem importar de novo os recortes temáticos.
2. Manter separados texto da URL e hyperlinks de D/E. Usar E como candidato inicial, sinalizar divergências e links genéricos para conferência. Não escolher automaticamente um link conflitante.
3. Normalizar apenas espaços, siglas e formatos numéricos de datas em campos derivados. Não corrigir ano, tipo jurídico, data ou efeito de um ato sem fonte. A importação também deve apontar, por exemplo, os registros CGE de 2025 com datas de 2026 em `Base!G4:G5` para conferência, sem substituir o ano por inferência.
4. Não deduplicar apenas por número/ano: atos sem número podem ter o mesmo rótulo e ser distintos. `Base!D6:D7` e as resoluções SEMIL em D94/D96 demonstram esse risco. Usar identificador estável, órgão emissor e publicação/fonte, mantendo conflitos para revisão.
5. Acrescentar os campos de relacionamento, efeitos e conferência antes de gerar os blocos. Produzir primeiro o recorte dos **três pilotos escolhidos**, começando pela SGGD; a existência de 31 siglas na planilha não amplia o escopo autorizado.
6. Na amostra de aceite, reconciliar dez registros SGGD de origem, links, datas corrigidas/pendentes e relações. Importação bem-sucedida não constitui revisão jurídica nem prova completude histórica.

## Formato de consulta proposto

1. Um seletor **Órgão ou entidade**, com nome oficial e sigla. Diferenciar secretaria da administração direta de entidade vinculada; selecionar uma secretaria não deve incorporar silenciosamente o histórico de suas autarquias ou empresas.
2. Blocos por decreto, com os atos relacionados abaixo, conforme o pedido de Laura informado nesta tarefa. O modelo horizontal recebido pode orientar a apresentação dos blocos no desktop; a disposição para telas estreitas será conferida quando houver adaptação. Cada item mantém **data de publicação**, identificação do ato e resumo curto do que mudou. Exibir data do ato e início dos efeitos em detalhe, quando diferentes.
3. Cada item identifica o **decreto-base / grupo normativo** e seus vínculos: altera, detalha, revoga, retifica ou apenas se relaciona. “Decreto pai” é uma organização da consulta, não uma conclusão de que todo ato seguinte revoga ou substitui o anterior.
4. Acesso direto **“Abrir publicação no Diário Oficial”**, acompanhado, quando disponível, de reprodução/compilação oficial complementar. Não usar o endereço interno do SharePoint como se fosse fonte pública do ato.
5. Resumo discreto de cobertura: período incluído, última conferência e estado de revisão. A ausência de um ato na coleção não comprova que ele não exista.

### Cronologia entre grupos

**Formato definido para esta preparação: blocos por decreto, com atos relacionados abaixo.** Ordenar os blocos pela publicação do decreto-base e os atos de cada bloco por sua própria publicação, do mais antigo para o mais recente. Deixar claro que a ordem é **por grupo**, pois as datas dos grupos podem se sobrepor. Uma resolução publicada depois do decreto-base de outro bloco conserva sua data, sem sugerir sequência cronológica global entre todos os itens.

Uma visualização cronológica global pode ser considerada futuramente se houver necessidade de comparar eventos entre grupos. Não é uma decisão pendente nem requisito desta entrega. O modelo correto recebido fornece a referência horizontal, a ser adaptada aos blocos solicitados por Laura.

Atos no mesmo dia não recebem precedência jurídica pela posição visual: usar ordem estável e apresentar a mesma data. Publicação desconhecida fica identificada como **“Data de publicação pendente”**, fora da ordenação afirmada; não preencher com a data do ato. Uma retificação tem sua própria data de publicação e vínculo com o ato corrigido.

## Dados mínimos — três conjuntos relacionados

O cadastro pode começar em uma planilha de levantamento, sem pressupor integração automática ao SharePoint ou ao CMS. Cada registro precisa de identificador estável para que mudanças de nome não quebrem os vínculos.

| Conjunto | Campos mínimos | Regra |
| --- | --- | --- |
| Órgãos e entidades | `id`, nome oficial, sigla, tipo (órgão/entidade), situação no piloto | SGGD definida; dois pilotos pendentes. Vinculação institucional, quando relevante, é informação separada e documentada. |
| Atos | `id`, órgão(s)/entidade(s) abrangidos, tipo, número/ano, órgão emissor, data do ato, data de publicação, título/ementa, resumo curto, URL do DOE, fonte complementar, efeitos/vigência, grupo de exibição, estado e data da conferência | Número/ano sozinho não identifica resoluções de emissores diferentes. O mesmo ato pode alcançar mais de uma entidade sem ser duplicado. Grupo editorial não define efeito jurídico. |
| Relações entre atos | ato de origem, ato de destino, tipo de relação, alcance (ato inteiro/artigo/anexo/dispositivo), dispositivo que fundamenta a relação, fonte e estado da conferência | Ato novo → ato afetado. Relação editorial de agrupamento não substitui relação normativa comprovada. Um ato pode ter mais de um destino. |

Para **efeitos/vigência**, admitir mais de uma entrada: data ou regra literal, dispositivos abrangidos e fonte. Um campo único de data não comporta atos com exceções temporais. Quando uma data resultar da aplicação de uma regra, conservar também o texto da regra e marcar a data como calculada, pendente de revisão técnica.

Estados de conferência sugeridos: **levantado**, **fonte conferida** e **revisado pela área técnica**. Separar esses estados do efeito jurídico. “Fonte conferida” significa que o registro corresponde à fonte consultada; não equivale a aprovação institucional nem a garantia de cadeia normativa completa.

## Critérios indispensáveis para relações e revogação

- Exibir revogação somente com ato revogador e dispositivo identificados. Se o dispositivo revoga apenas um artigo ou anexo, registrar **revogação parcial**, conservando o alcance exato. Não marcar todo o ato como revogado.
- “Substitui os Anexos I a III” não vira automaticamente “revoga o decreto”. Registrar o tipo de alteração literalmente compatível com a fonte.
- Não inferir revogação pelo ano, pelo surgimento de outro decreto, por nova denominação, pela posição na lista ou por ausência de resultado em busca.
- “Sem revogação expressa” em uma ficha não significa que o texto original esteja integralmente vigente. Se esse dado for mostrado, manter fonte e data da consulta.
- Uma citação no preâmbulo não comprova alteração ou revogação. Permitir **ato relacionado**, sem efeito normativo adicional atribuído.
- Histórico editorial, vigência normativa e período de existência de um órgão são conceitos distintos. Sucessão, criação, extinção ou mudança de vinculação precisam de seu próprio fundamento.

## Amostra SGGD já disponível para testar o modelo

Referências abaixo reaproveitam a conferência preservada em **24/09/2026**. São amostra de modelagem, não nova certificação da legislação em vigor em 19/10.

| Exemplo do acervo | O que testa |
| --- | --- |
| Decreto 69.052/2024 e alterações pelos Decretos 69.230/2024, 69.506/2025 e 70.755/2026 | Decreto-base preservado, múltiplos atos alteradores e substituição de anexos sem presumir revogação integral. |
| Decreto 70.599/2026, art. 9º, X, relativo a dispositivo do 69.506/2025 | Vínculo com ato intermediário e alcance parcial; não reduzir toda a cadeia a um único pai. |
| Retificação do 69.230/2024 publicada em 10/06/2025 | Data própria de publicação e efeito específico no referendo, sem inferir alteração de estrutura/cotas. |
| Decreto 70.755/2026, art. 2º | Publicação, vigência geral e exceções temporais separadas. |
| Resolução SGGD 33/2026, que detalha a organização e, no art. 183, revoga a Resolução 25/2025 | Detalhamento de decreto, revogação entre resoluções e mais de uma relação no mesmo registro. |

Fontes originais já identificadas no acervo: [ficha ALESP do Decreto 69.052](https://www.al.sp.gov.br/norma/210215), [Decreto 70.755 no DOE](https://www.doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002), [Resolução SGGD 33 no DOE](https://www.doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-33-de-22-07-2026-20260723112912201999213). A validade de cada link para uso público deverá ser rechecada antes da entrega da interface; não foi feita nova abertura de todos os atos nesta preparação.

## Lacunas a fechar para os três pilotos

| Pendência | Quem ou o que resolve | Consequência atual |
| --- | --- | --- |
| Dois outros órgãos/entidades | Indicação de Tatiana | Não escolher por conveniência os perfis da calculadora. |
| Cobertura e revisão do levantamento recebido | Definir recorte histórico e validar as pendências com Rafael/área técnica | Arquivo recebido e inspecionado; seus 162 registros não comprovam completude normativa nem atualização de todos os órgãos. |
| Datas e alcance da Resolução 39/2026 | Conferência da fonte e do levantamento pela área técnica | O novo marco está inventariado, mas os dispositivos revogados e seus efeitos não foram extraídos. |
| Relações, alcance e datas dos efeitos | Rafael estrutura; área técnica revisa, conforme alinhamento local | Dados permanecem em levantamento até confirmação. |
| Responsável por atualização contínua e periodicidade | Definição da equipe | Não prometer sincronização ou manutenção automática. |
| Componente e permissões no CMS | Confirmação técnica da implantação | O esquema é independente da tecnologia; não há integração já realizada. |

## Teste mínimo antes de desenvolver a interface

Montar uma pequena tabela de amostra da SGGD, revisada pela área técnica, contendo decreto-base, ato alterador, resolução de detalhamento, uma revogação parcial e uma retificação. Não exige cadastrar toda a legislação.

1. **Identidade e seleção:** SGGD aparece corretamente; os dois pilotos não definidos continuam pendentes. Entidade vinculada não é somada ao histórico da secretaria por inferência.
2. **Rastreabilidade:** todo item tem identificação, publicação ou pendência explícita, resumo, fonte oficial e estado de revisão. Um revisor consegue encontrar na fonte o dispositivo que sustenta cada vínculo.
3. **Datas distintas:** data do ato, publicação e efeitos diferentes são preservados. Uma exceção de vigência não muda a data de todos os dispositivos.
4. **Grupos sobrepostos:** incluir, somente na massa de teste, dois grupos e um ato relacionado ao primeiro publicado após o decreto-base do segundo. Os blocos seguem a data de seus decretos-base e os atos internos mantêm suas próprias datas; a apresentação informa ordenação por grupo, sem sugerir ordem global de todos os eventos.
5. **Alcance:** substituir anexos não marca o decreto inteiro como revogado; revogar um dispositivo não marca o ato inteiro como revogado; correlação não vira alteração.
6. **Mais de uma relação:** a resolução pode detalhar um decreto e revogar outra resolução. O mesmo ato tem um registro canônico e conserva ambos os vínculos. Se for pertinente a dois blocos, usar referência ao mesmo registro e não criar duas versões divergentes do ato.
7. **Ausências e revisão:** data/fonte pendente não vira valor inventado. Estado “revisado pela área técnica” só aparece após revisão efetiva. Cobertura parcial permanece explícita.

Critério de saída: a equipe consegue escolher um órgão, explicar a sequência de uma pequena cadeia e abrir as respectivas fontes, distinguindo alteração, detalhamento e revogação. Testes de teclado, celular, foco e abertura dos links serão necessários quando houver interface; não foram executados nesta preparação.

## Registro das fontes locais consultadas

- `AGENTS.md` e `README.md`: limites entre protótipo, produtos e validação técnica.
- `docs/alinhamento-tres-produtos.md`: escopo histórico, dados previstos e responsabilidades registradas.
- `evidence/orgaos-2026-09-24/sggd-cadeia-verificacao.md`: cadeia normativa, retificação e limites da pesquisa de 24/09.
- `evidence/sggd-autofill-2026-09-24/revisao-fontes.md`: detalhamento pela Resolução 33, dispositivos e fontes originais.
- `Downloads/index (1) (1).html`: modelo correto recebido do SharePoint em 19/10; leitura estática integral, inventário de dez registros e respectivos links, sem renderização ou execução.
- `Downloads/OneDrive_1_19-10-2026/Levantamento atos reestruturação.xlsx`: levantamento recebido do SharePoint em 19/10; quatro abas lidas somente para inspeção, incluindo hyperlinks e comentário. `levantamento-inspecao.json` preserva linhas, contagens e confronto com HTML.
- `Downloads/index.html`: arquivo anterior conferido e descartado como referência SIORG.

Observação sobre versões: trechos antigos da pesquisa da calculadora foram superados por definições posteriores da simulação. Esta nota reutiliza apenas identificação, cronologia e vínculos dos atos; não transporta para a linha do tempo as regras de cálculo ou conclusões antigas sobre disponibilidade.
