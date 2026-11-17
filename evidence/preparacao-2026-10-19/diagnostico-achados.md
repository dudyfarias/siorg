# Achados dos diagnósticos locais para preparação da revisão de conteúdo do SIORG

Preparado em 19/10/2026 e atualizado após a leitura da cópia obtida do SharePoint nessa data. Leitura documental, sem alteração dos originais, nova navegação nos portais ou nova validação normativa. O conteúdo abaixo transforma registros dos diagnósticos em pedidos verificáveis à área técnica. Não afirma que as pendências continuem publicadas em 19/10 nem que alguma redação esteja aprovada.

## Atualização após receber a cópia do SharePoint

**Base principal para a origem dos seis itens do Word:** `/Users/eduardofariascappia/Downloads/OneDrive_1_19-10-2026/Diagnostico_SIORG_BR.docx`, abreviado **SP19**. A cópia foi obtida do SharePoint em 19/10/2026 no fluxo autorizado conduzido pelo agente principal. Seus metadados Word registram revisão **6**, último modificador **Marina Alves Passafaro**, modificação **10/09/2026 20:15:10 UTC**, equivalente a **17:15:10 em São Paulo** e compatível com a data/hora relatada na interface. Não significa que o conteúdo tenha sido revisto em outubro.

**Não houve equivalência:** SP19 tem 1.400 parágrafos XML e 21 comentários; difere substancialmente tanto de R10 quanto de C3. Foram comparados os textos dos parágrafos, os textos/autores/datas dos comentários e suas âncoras, além dos metadados. A diferença persiste ao desconsiderar parágrafos vazios, variações de espaços e marcadores de referências numéricas. Não é apenas regravação do OOXML ou mudança de hash.

- Em relação a C3, SP19 preserva **19 comentários com o mesmo texto, autor e data**, deixa de conter seis comentários e acrescenta dois de Eduardo: **1725438176** sobre a ressalva jurídica de cookies e **1114662891** sobre o uso do Search Console. As âncoras de vários comentários mudam de posição acompanhando as alterações de texto.
- Os seis comentários que não estão no pacote SP19 são **750917781**, **887987198**, **1444534827**, **23709037** e os dois de Lina, **634257690** e **568189757**. A ausência não comprova aprovação nem que tenham sido resolvidos formalmente. Os 21 registros presentes em `commentsExtended.xml` têm `done=0`.
- SP19 incorpora trechos importantes da revisão, incluindo as definições CCESP/FCESP, o apontamento da FAQ 3.4 e as orientações de consulta por órgão. Contudo, conserva outras afirmações antigas: P276 menciona “três quartos”, P374 ainda afirma “67 perguntas” e P426 afirma “45% do conteúdo visual ... inacessível”. Essas afirmações não devem ser transportadas como fatos atuais; R10 é apoio crítico útil para preservar suas limitações.
- Não foi encontrada, em SP19, a seção de tratamento dos comentários ou a lista de fontes que constituem os Anexos E/F de R10. Não foram encontrados hiperlinks externos para SIORG no pacote SP19; as URLs deste levantamento continuam explicitamente oriundas de R10 e não foram abertas nesta tarefa.

**Decisão de uso:** redigir o Word dos seis pedidos a partir de **SP19**, citando seus trechos e seções; utilizar **R10 como apoio de revisão**, identificado como arquivo distinto, e **C3 para o histórico dos comentários ausentes**. A correspondência dos seis itens com a cópia obtida em 19/10 foi confirmada, mas não a equivalência dos arquivos nem a aprovação do conteúdo.

| Item do Word | Evidência na cópia SP19 | Situação da evidência |
|---|---|---|
| Definições CCESP/FCESP e cotas | §4.1.2, P289–305; definições P295, P297, P299 e P301 | O conteúdo já está ampliado no diagnóstico. Pedir confirmação técnica e atualização do portal, não dizer que a definição falta no documento. Comentário de Lina 568189757 existe somente no histórico C3 |
| Referência da FAQ 3.4 | §4.3, P340: “os requisitos gerais estão no artigo 7º ... e não no artigo 9º” | Apontamento preservado. Pedir confirmação de persistência na FAQ e validação da remissão; comentário 974614953 permanece, mas questiona a avaliação de precisão, não aprova esse artigo |
| Consulta de cotas por órgão | §4.5, P387; capítulo 8, P859 | Evidência preservada; comentário 1411378379 ancorado em P387. O trecho P387 termina com “; .”, uma pendência editorial do arquivo, sem alterar o objeto do pedido |
| Guias e modelos vigentes | §4.3, P357–363 | Evidência preservada: conferir versões, finalidade, etapa e responsável antes de reorganizar |
| Painéis e fases | §4.10, P450–452; §4.11, P467; capítulo 8, P880; Anexo D, P1390 | Evidência preservada: existência dos painéis, cobertura, atualização e responsável a confirmar. Parte do detalhamento das perguntas da preparação é encaminhamento nosso, não transcrição de um comentário |
| Atendimento | §4.6, P401; §4.10, P453–455 | Evidência preservada; comentário 1505084434 ancorado em P401. P455 condiciona prazo à pactuação |

Extrações: `SharePoint_Diagnostico_SIORG_BR_2026-10-19.json` e `.txt`. Comparação detalhada: `comparacao-sharepoint-2026-10-19.json`. SHA-256 SP19: `0c485d4e78d35f58a60ca206759484ad7285113a0353cc62d793928d6a5d3523`. O arquivo recebido permanece inalterado.

## Versão de trabalho e rastreabilidade

**Base local de apoio recomendada, após priorizar SP19:** `/Users/eduardofariascappia/Downloads/Diagnostico_SIORG_BR_Revisado_2026-09-10.docx`, abreviado **R10**. A capa declara revisão de conteúdo e evidências em 10/09/2026 (P3); P80 declara conferência pública nessa data; o Anexo E registra o tratamento dos 25 comentários (P1368–1447). Foi a base inicialmente selecionada antes de receber SP19 e continua útil para distinguir observações, hipóteses, registros históricos e validações ainda necessárias. Também corrige generalizações presentes nas versões anteriores, como a ausência de painéis do SIORG e a inferência de qualidade pela contagem de palavras.

**Documento complementar para o histórico:** `/Users/eduardofariascappia/Downloads/Diagnostico_SIORG_BR-3.docx`, abreviado **C3**. Preserva os 25 comentários dessa versão anterior, suas autorias, datas e âncoras. Usar C3 especialmente para a origem dos comentários não presentes em SP19, sem apresentar o tratamento proposto como concordância da comentarista.

| Arquivo local | Informação explícita e metadados do Word | Conteúdo de revisão | Uso recomendado |
|---|---|---|---|
| Diagnostico_SIORG_BR.docx | Título “Diagnóstico Inicial dos Canais SIORG e BR”; criado em 03/09/2026 16:54 UTC; modificado em 03/09/2026 17:00 UTC; revisão 2; último modificador Eduardo Farias Cappia | 1.373 parágrafos XML, sem comentários e sem inserções/exclusões controladas | Histórico inicial; não é a base preferencial |
| Diagnostico_SIORG_BR-3.docx | Mesmo título; criado em 03/09/2026; modificado em 10/09/2026 13:48:57 UTC; revisão 5; último modificador Lina Amaral Nakata | 1.373 parágrafos XML; 25 comentários; sem inserções/exclusões controladas. O texto difere do original apenas no plural “requisito/requisitos” em P207 | Fonte dos comentários, não prova de aprovação global |
| Diagnostico_SIORG_BR_Revisado_2026-09-03.docx | Capa: versão 2.1, revisão técnica 03/09/2026 e entrega prevista 04/09; Word: modificado em 03/09/2026 16:58:12 UTC; revisão 4; último modificador “Revisão técnica” | 1.726 parágrafos XML; sem comentários. Há apontamentos que R10 depois reformula; por exemplo, R03 P529 descreve cotas como “explicada, não consultável”, enquanto R10 P377 identifica painéis existentes | Consulta histórica; não misturar seus achados com a situação atual |
| Diagnostico_SIORG_BR_Revisado_2026-09-10.docx | Capa: revisão 10/09/2026; título revisto; descrição “Revisão de 10/09/2026. Original preservado.”; arquivo local modificado em 10/09/2026 15:06:44 UTC | 1.505 parágrafos XML; sem comentários ativos; Anexo E com tratamento dos 25 comentários | Apoio de revisão, distinto de SP19 |

**Cuidado com os metadados de R10:** `lastModifiedBy`, `revision`, `created` e `modified` repetem os de C3, inclusive Lina Amaral Nakata e 10/09/2026 13:48:57 UTC. São propriedades herdadas e não demonstram que Lina revisou ou aprovou a redação de R10. A comparação posterior confirmou que R10 e C3 diferem da cópia SP19.

Localizadores **P** significam a posição, a partir de 1, de cada elemento de parágrafo `w:p` no corpo de `word/document.xml`, incluindo células de tabelas. Não são páginas impressas nem numeração de parágrafos visível no Word. Cada referência abaixo também informa seção ou trecho para facilitar a localização. A extração preserva um JSON e um TXT por arquivo; `diagnostico-metadados.json` guarda datas e hashes SHA-256 completos. Não foi feita revisão visual de paginação nesta tarefa.

## Conteúdo técnico do SIORG para encaminhar à área

Responsável genérico de todos os itens desta seção: **área técnica responsável pelo SIORG**, que deverá indicar a unidade competente e, quando necessário, consultar a área jurídica ou a área detentora dos dados. A equipe editorial pode organizar e redigir a resposta depois da confirmação, sem assumir o mérito técnico.

### Seis itens prioritários para o Word solicitado

Usar CT01, CT02, CT03, CT05, CT07 e CT08 como núcleo do Word. CT04, CT06 e CT09 são contexto complementar, sem necessidade de ampliar o pedido. O bloco BR ao final é apenas uma nota separada de pesquisa e não deve entrar no Word SIORG.

As perguntas abaixo podem ser enviadas literalmente à **área técnica responsável pelo SIORG**. O enunciado deve informar que são apontamentos do diagnóstico de 10/09 e pedir confirmação de persistência antes de tratar qualquer ponto como erro atual.

1. **Definições CCESP e FCESP — CT01; SP19 §4.1.2, P289–305; apoio R10 P283–298; comentário histórico de Lina 568189757 em C3.** “Na seção ‘O que é QGCFC’ e nas respostas relacionadas, qual é a redação validada para explicar quem pode ocupar CCESP e FCESP? Podem confirmar os requisitos de vínculo, as reservas e exceções aplicáveis, as referências legais e a distinção entre quantidade de cargos/funções e cotas? O diagnóstico de 10/09 sugeriu complementar essas explicações; esse complemento já foi publicado?”
2. **Remissão da FAQ 3.4 — CT02; SP19 §4.3, P340; apoio R10 P331.** “O diagnóstico de 10/09 registrou, na pergunta 3.4 da FAQ, referência ao artigo 9º da LC nº 1.395/2023 para requisitos gerais que identificou no artigo 7º. Podem confirmar se essa remissão ainda aparece na resposta publicada e indicar o dispositivo e a redação corretos, considerando as alterações normativas aplicáveis?”
3. **Consulta de cotas por órgão — CT03; SP19 §4.5, P387, e capítulo 8, P859; apoio R10 P377/P833; comentário Marina 1411378379 preservado em SP19.** “Na pergunta 1.4 da FAQ, qual deve ser a orientação atual para consultar os quantitativos e as cotas do órgão ou entidade? Podem indicar os atos aplicáveis e suas alterações, a consulta oficial, a data da base e o significado de cada medida, separando CCESP e FCESP? Quando houver informação de disponibilidade, qual definição e fonte devem acompanhá-la?”
4. **Guias e modelos — CT05; SP19 §4.3, P357–363; apoio R10 P347–354.** “Podem indicar quais guias e modelos estão válidos hoje para cada tipo e etapa de proposta, com os respectivos arquivos, versão/data, finalidade, documentos exigidos e responsável técnico? Há materiais superados, repetidos ou que precisam de correção, e existe exemplo preenchido autorizado para orientar o usuário?”
5. **Painéis e fases — CT07; SP19 §4.10, P450–452, §4.11, P467, e capítulo 8, P880; apoio R10 P262–263/P1357.** “Quem mantém os painéis de cargos, cotas e revisão das estruturas, quais órgãos e períodos eles cobrem e com que frequência são atualizados? Podem fornecer as fontes, a definição das medidas e fases, os limites de consulta/exportação e o próximo passo correspondente a cada fase, para prepararmos uma orientação de leitura correta?”
6. **Atendimento — CT08; SP19 §4.6, P401, e §4.10, P453–455; apoio R10 P392/P444–446; comentário Marina 1505084434 preservado em SP19.** “Podem confirmar quais assuntos e públicos devem usar a FAQ, o Fale Conosco e a Ouvidoria, qual unidade responde por cada encaminhamento e quais contatos e prazos pactuados podem ser publicados? O diagnóstico propôs tornar essa distinção mais clara; essa orientação já foi atualizada?”

### CT01 Definições de QGCFC CCESP FCESP e cotas

- **Local:** Institucional → O que é QGCFC; glossário e respostas correlatas da FAQ. No diagnóstico, seção 4.1.2.
- **Problema registrado:** as definições introdutórias não explicavam quem pode ocupar CCESP/FCESP. A revisão também distingue quantidade de postos de valores de cotas.
- **Informação exata a pedir:** confirmar a definição pública de QGCFC; requisitos de vínculo para FCESP; possibilidades, requisitos, reserva mínima e hipóteses privativas de CCESP; referência normativa de cada afirmação. Confirmar a explicação de que cotas não são quantidade de cargos nem remuneração individual. Solicitar uma redação curta validada e a data da revisão.
- **Sugestão editorial:** glossário com termo, explicação, regra aplicável e link para a norma. Não usar apenas “concursado” se isso confundir cargo efetivo e emprego público.
- **Evidência:** R10 P283–298, especialmente P288, P290, P292 e P294. C3 comentário **568189757**, Lina, 10/09/2026 10:39:04, ancorado em P295: “Sugiro informar tb que FCESP, cabe a servidor público estatutário concursado. E CCESP pode ser qualquer pessoa que atenda os requisitos do cargo.” R10 registra o tratamento em P1445–1447. Trata-se de sugestão de complemento, não de aprovação de todas as ressalvas acrescentadas posteriormente.

### CT02 Conferir a referência legal da FAQ 3.4

- **Local:** FAQ do SIORG, pergunta 3.4, tema Quadro Geral. URL registrada: https://www.siorg.sp.gov.br/siorg/Canais%20de%20comunica%C3%A7%C3%A3o/perguntas%20frequentes%20-%20faq
- **Problema registrado:** R10 afirma que a resposta remetia ao artigo 9º da LC nº 1.395/2023, mas que os requisitos gerais mencionados estão no artigo 7º.
- **Informação exata a pedir:** enviar o texto atualmente publicado da pergunta e da resposta; confirmar qual dispositivo sustenta cada requisito; confirmar se basta corrigir a remissão ou se há outros requisitos, exceções ou atos posteriores a incluir.
- **Sugestão para o Word:** “Conferir e corrigir, se ainda presente, a remissão legal da pergunta 3.4. O diagnóstico de 10/09 registrou artigo 9º onde identificou requisitos gerais no artigo 7º.” Não apresentar como erro ainda existente sem nova conferência.
- **Evidência:** R10 P331, seção 4.3. Não há comentário específico de chefia aprovando essa correção; o comentário C3 **974614953**, P335, questiona a fundamentação da avaliação geral de precisão, não valida o artigo indicado por R10.

### CT03 Resposta sobre cotas por órgão ou entidade

- **Local:** FAQ 1.4 “Como saberei qual a quantidade de cotas que foram destinadas ao meu órgão ou entidade?” e Transparência: https://www.siorg.sp.gov.br/siorg/transparencia
- **Problema registrado:** a resposta remetia ao Anexo VII do Decreto nº 68.742/2024. Há painéis de cargos, cotas e reestruturações já publicados; a recomendação anterior de responder com um número único era insuficiente.
- **Informação exata a pedir:** quais atos e alterações sustentam o quantitativo de cada órgão/entidade; como o público consulta seu recorte; o que cada medida significa; separação entre CCESP e FCESP, quantidade e cotas; data de referência; conceito e fonte de eventual disponibilidade. Confirmar qual base deve prevalecer quando um ato posterior altera o quadro.
- **Sugestão editorial:** resposta curta com orientação para selecionar o órgão, link para a consulta, descrição das medidas e data da informação. Não prometer saldo em tempo real nem equiparar estrutura autorizada a ocupação de pessoas.
- **Evidência:** R10 P377, P426–428, P833, P839–842. C3 comentário **1411378379**, Marina, 04/09/2026 10:29:05, P380, questiona o “único número” e pergunta se seria consulta individualizada ou tabela por órgão. Tratamento em R10 P1400–1402.
- **Limite temporal:** esta é uma demanda registrada no diagnóstico de setembro. O diagnóstico, isoladamente, não prova o estado de ferramentas desenvolvidas depois nem substitui a definição de negócio atual da calculadora/simulador.

### CT04 Base legal apresentação e atos de novas estruturas

- **Local:** Sobre o SIORG; Legislação; Novas Estruturas. As seções estão identificadas em R10, mas o anexo de fontes não fornece URLs individuais para todas elas; não inventar rotas. Página inicial registrada: https://www.siorg.sp.gov.br/siorg
- **Problema registrado:** finalidade do sistema, competência dos atores e atualização dos atos precisam estar coerentes. Percentuais de avanço da reestruturação exigem fonte, data e universo.
- **Informação exata a pedir:** texto institucional vigente sobre finalidade e competências; relação de atos aplicáveis e suas alterações; critério para considerar uma estrutura publicada/implantada; fonte e data de qualquer percentual ou quantidade de órgãos; responsável por atualizar esses registros.
- **Sugestão editorial:** distinguir o SIORG administrativo do portal público; vincular as estruturas aos atos e informar a data dos indicadores. Não reutilizar o antigo percentual de “três quartos” como situação atual.
- **Evidência:** R10 P268–270; quadro da seção 4.3, P335–346; P964. São necessidades documentadas, sem comentário individual de Lina aprovando conteúdo específico.

### CT05 Guias materiais instrucionais e modelos vigentes

- **Local:** Produtos → Material Instrucional e Modelo de Documentos. URL de Material Instrucional registrada no arquivo, com a grafia original da rota: https://www.siorg.sp.gov.br/siorg/produtos/materail%20Instrucional
- **Problema registrado:** materiais e modelos existem e podem aparecer na mesma página. É necessário identificar versões válidas, eventuais repetições e correspondência com etapas; não afirmar ausência de integração entre guia e modelo em todo o portal.
- **Informação exata a pedir:** para cada arquivo, título oficial, finalidade, público, etapa de uso, versão/data, ato ou orientação de origem, arquivo que substitui, responsável técnico e exemplo preenchido publicável, se existente. Solicitar a lista dos documentos exigidos em cada tipo de proposta e quais campos são obrigatórios.
- **Sugestão editorial:** organizar uma relação “etapa → orientação → documento exigido → modelo vigente → próximo passo”, preservando histórico identificável dos modelos superados.
- **Evidência:** R10 P347–354, P843–846 e P885. O diagnóstico não demonstra que todos os modelos tenham sido auditados; o pedido é de conferência e inventário técnico.

### CT06 Revisão técnica das demais respostas da FAQ

- **Local:** quatro temas da FAQ: Dúvidas Gerais; Regras e Procedimentos; Quadro Geral; Instrução e Fluxo das Propostas.
- **Problema registrado:** a organização temática existe, mas a contagem anterior de 67 perguntas incluía potencialmente versões e blocos não publicados. Organização e quantidade não demonstram precisão integral.
- **Informação exata a pedir:** relação das perguntas efetivamente publicadas; data da última revisão; respostas com mudança normativa pendente; referência de cada regra; dúvidas recorrentes do atendimento ainda não cobertas. Priorizar requisitos, jornadas, nomeação, substituição e instrução/encaminhamento conforme a frequência e o risco confirmados pela área.
- **Sugestão editorial:** planilha de revisão com pergunta, resposta atual, fonte, alteração necessária, texto técnico confirmado e data. Evitar apresentar todas as respostas como aprovadas ou usar o número 67 sem inventário.
- **Evidência:** R10 P364–376, P1352–1354 e P974–976. C3 comentários **777727735** (P330) e **887987198** (P331) pedem evidência de tarefas e métricas; não validam prioridade estatística das perguntas.

### CT07 Explicação dos painéis e das fases da reestruturação

- **Local:** Transparência; painel de cargos/cotas e Painel de Revisão das Estruturas de Secretarias e Autarquias. URL: https://www.siorg.sp.gov.br/siorg/transparencia
- **Problema registrado:** os painéis já existem, mas cobertura, atualização, fonte e nível de detalhe não foram auditados. O diagnóstico não sustenta afirmar que não há acompanhamento.
- **Informação exata a pedir:** responsável pelo dado; órgãos e períodos cobertos; frequência efetiva de atualização; fonte normativa/administrativa; definição de cada fase e medida; se o painel acompanha órgão, estrutura ou processo; limitações de consulta/exportação; explicação do próximo passo correspondente a cada fase.
- **Sugestão editorial:** inserir orientação breve sobre como ler cada painel, sua data e limites. Se o dado não for atualizado em tempo real, dizer isso claramente.
- **Evidência:** R10 P262–263, P441–443, P459, P851–854 e P1357. A falta de auditoria da base é explicitada, não uma prova de erro no painel.

### CT08 Regras e instruções para atendimento

- **Local:** Fale Conosco, FAQ e Ouvidoria. URL registrada: https://www.siorg.sp.gov.br/siorg/Canais%20de%20comunica%C3%A7%C3%A3o/fale%20conosco
- **Problema registrado:** o Fale Conosco já descreve seu público/finalidade; a orientação conjunta sobre quando usar cada canal pode ser mais clara. Responsáveis e prazos só podem ser publicados quando confirmados.
- **Informação exata a pedir:** assuntos e públicos atendidos por cada canal; unidade responsável; meio oficial de retorno; prazo pactuado, se houver; encaminhamento de assuntos fora do escopo. Solicitar dados agregados de dúvidas recorrentes, sem dados pessoais dos solicitantes.
- **Sugestão editorial:** texto curto diferenciando orientação geral da FAQ, dúvida operacional no Fale Conosco e manifestação na Ouvidoria. Não afirmar que um canal responde mais rápido ou recebe demandas indevidas sem dados.
- **Evidência:** R10 P392, P444–446 e P1348–1349. C3 comentário **1505084434**, Marina, 04/09/2026 10:42:12, P394, pergunta explicitamente se a proposta é explicar a finalidade de cada canal.

### CT09 Regras e materiais para eventual apoio à elaboração de propostas

- **Local:** capítulo 8 do diagnóstico; futura consulta, simulador ou preenchimento de modelos. Não é apontamento de uma página defeituosa já comprovada.
- **Problema registrado:** propostas de ferramentas dependem de regras, fontes, modelos e fluxo de atendimento. O capítulo é de hipóteses de evolução, não de funções já homologadas.
- **Informação exata a pedir:** regras que uma ferramenta pode conferir automaticamente; situações que exigem análise humana; modelos oficiais e campos; quais dados podem ser consultados/exportados; fluxo formal de encaminhamento; exemplos e casos para conferir resultados; responsáveis por atualização de cada regra.
- **Sugestão editorial:** manter esse item como levantamento de requisitos, separado da correção de conteúdo existente. A documentação das funcionalidades e decisões posteriores precisa ser incorporada por quem conduz a preparação atual; o diagnóstico de 10/09 não descreve sua situação em outubro.
- **Evidência:** R10 P832–858, P865–882 e P888. C3 comentário **124073338**, Marina, P462, “também acho”, manifesta concordância com a direção geral de apoio ao trabalho, não aprova escopo, prazo ou regras de uma ferramenta.

## Organização navegação e apresentação em frente separada

Estes itens podem integrar outro bloco do Word. Não são correções de regra de cargos/cotas. Responsável genérico: equipe editorial/experiência, com participação da área técnica para nomenclatura e finalidade; CMS/Comunicação quando o componente exigir.

| Item | Proposta ou informação a confirmar | Evidência |
|---|---|---|
| Menu e atalhos | Testar “Guias e modelos”, acesso direto à FAQ e nomes por tarefa; identificar termos compreendidos pelo público antes de trocar rótulos | R10 P85–86, P326–329; C3 comentários 750917781 e 634257690, ambos em P87 |
| Linguagem simples | Títulos informativos, explicação de siglas, resposta direta e hierarquia visual; trabalhar o texto e a apresentação | Lina, comentário 634257690, 10/09/2026 10:00:35: “tente pensar nos princípios da Linguagem Simples. Seja no texto como na apresentação visual do conteúdo.” R10 P1439–1441. É uma orientação geral, não aprovação de cada alteração |
| Campanhas e avisos | Confirmar regra, vigência, público e margem de edição; verificar exposição real antes de pedir retirada. Não generalizar o banner da home a todas as internas | R10 P359–360; C3 comentário 1056487337, P363, pergunta sobre obrigatoriedade de campanhas |
| Ligação entre materiais | Facilitar a descoberta do guia/modelo por etapa depois de a área técnica confirmar a versão correta | R10 P354 e P458; depende de CT05, mas a posição dos links é uma decisão de organização |
| Acesso aos painéis | Link direto e instruções de leitura, aproveitando recursos existentes | R10 P377, P427–428 e P457; depende da confirmação de medidas e fontes em CT03/CT07 |
| Rotina editorial | Definir responsáveis, substitutos, registro de revisão e gatilhos por mudança normativa | R10 P963–979; C3 comentário 1611436264, Marina, P961: “isto ficará com nós”. Refere-se à manutenção, não transfere à equipe editorial a responsabilidade de validar o mérito técnico |

## Plataforma e medição em frente separada

Não misturar problemas de conteúdo de negócio com configurações técnicas. Os registros abaixo são de setembro e dependem de nova verificação para abrir correções atuais.

- **Acessibilidade e desempenho:** recuperar relatórios ou reproduzir ocorrências no conteúdo real; não reutilizar notas, 33 alertas ou “45% inacessível” como resultado atual. Responsável genérico: equipe técnica do CMS/acessibilidade, com conteúdo para alternativas textuais. R10 P231, P396–418 e P741–755; C3 comentário 1052835044, P404–406, pergunta se os valores vêm do Lighthouse.
- **Cookies e privacidade:** confirmar rastreadores, finalidades, base legal, aviso e canal do encarregado; não concluir infração apenas pela ausência de escolha ou presença de analytics. Responsável genérico: gestão de privacidade e plataforma. R10 P770–785; C3 comentários 1071617300 e 1139632304. Este último é relato de Eduardo, não validação jurídica da chefia.
- **Dados de uso:** identificar proprietário das propriedades do Search Console, cadastro, escopo, relatórios disponíveis e responsáveis por métricas internas/atendimento. Responsável genérico: mensuração/publicação. R10 P123, P420 e P1359; C3 comentário 1349745428, P124. Não afirmar qual conteúdo é mais acessado sem dados.

## Conteúdo da BR somente se o Word também abranger esse canal

Estes itens não devem ser transportados para o escopo SIORG como se fossem seus conteúdos. URL da FAQ registrada: https://www.sggd.sp.gov.br/br/canais_de_comunicacao/perguntas_frequentes

| Item de conteúdo | Problema registrado e informação a pedir | Responsável genérico | Evidência |
|---|---|---|---|
| Tributação e contribuição previdenciária | Separar IR, RPPS/SPPREV, RGPS/INSS, comissionado exclusivo e empregado público. Pedir material conjunto já validado, regra aplicável à rubrica e redação por vínculo; não concluir ilegalidade da folha | Área técnica da BR e área de pagamento, com apoio jurídico conforme o ponto | R10 P585–622; C3 comentários 722321532 (P588) e 369275438 (P601–602) |
| Aposentados e pensionistas | Distinguir condição de aposentado de valores relativos a atividade anterior ou novo vínculo. Pedir orientação oficial para cada situação | Área técnica da BR e pagamento | R10 P594–595; comentário 722321532 |
| Elegibilidade e remissão ao art. 11 | O diagnóstico registra requisitos atribuídos ao artigo que não constam dele nesses termos. Pedir base de eventual ato complementar ou redação corrigida | Área técnica da BR | R10 P640; R03 P703–705. Não confundir com a pergunta de cronograma que cita artigo 11 de outro ato |
| Calendário do ciclo | FAQ registrava prazos de 2024/2025, enquanto havia ato do ciclo de 2026. Pedir etapas, situação/prazo, ano de referência, responsável, fonte e atualização; não presumir calendário de outubro | Área técnica da BR | R10 P498 e P627–629; C3 comentário 23709037, P725 |
| Terceirizados e consulta individual | Validar resposta direta sobre empregados de empresa contratada e contato correto de RH/pagamento para análise individual | Área técnica da BR e pagamento | R10 P630–635; C3 comentário 439052898, P631–632 |
| Atendimento e erro textual | Confirmar finalidade e vigência do e-mail institucional já encontrado; corrigir “Depatamento” se persistir, com denominação atual do destino | Área técnica da BR e equipe editorial | R10 P637–638 e P1430–1432; C3 comentários 503441252 e 669279907 |

O diagnóstico revisto de 10/09 é preferível ao de 03/09 especialmente neste bloco porque separa regimes previdenciários e não generaliza a não incidência a todos os vínculos. As formulações continuam sujeitas à conferência atual pelas áreas; esta leitura não é nova orientação jurídica.

## Lacunas que precisam permanecer explícitas no encaminhamento

1. A cópia obtida do SharePoint em 19/10 foi comparada e está identificada como SP19. Ela tem modificação de 10/09/2026 às 17:15, difere de R10/C3 e não comprova atualização do conteúdo em outubro. Não houve consulta ao histórico completo de versões ou a alterações posteriores à cópia recebida.
2. A presença atual de cada texto, pergunta, aviso, link ou arquivo no portal não foi testada nesta tarefa. Datas de observação precisam acompanhar os achados.
3. Nenhum arquivo oferece aprovação individual de Lina para a lista de alterações. Seus dois comentários identificados em C3 tratam de Linguagem Simples e de explicar CCESP/FCESP; ambos estão ausentes do pacote SP19. Último modificador, incorporação de texto e ausência de comentários não equivalem a aprovação.
4. Não há, nesses diagnósticos, inventário completo validado de todas as respostas, versões dos guias/modelos, atos alteradores e conteúdo restrito.
5. Integridade, cobertura, atualização e conceitos dos painéis dependem de quem mantém os dados. Os documentos explicitam que as bases não foram auditadas.
6. Relatórios brutos e a planilha externa “Anexo B” citados no original não acompanharam a revisão de 10/09; suas métricas não devem sustentar uma nova lista de defeitos confirmados.
7. O pedido à área pode usar a estrutura: **local e trecho atual → questão a confirmar → redação/informação solicitada → fonte → responsável técnico → data/versão**. Manter o status “a confirmar” até receber evidência; não criar aprovação em nome de pessoas.

## Fontes documentais desta preparação

- SP19: `/Users/eduardofariascappia/Downloads/OneDrive_1_19-10-2026/Diagnostico_SIORG_BR.docx` — SHA-256 `0c485d4e78d35f58a60ca206759484ad7285113a0353cc62d793928d6a5d3523`.
- R10: `/Users/eduardofariascappia/Downloads/Diagnostico_SIORG_BR_Revisado_2026-09-10.docx` — SHA-256 `9dc8f2617b4e19448ae98ed87e022b5dbdb725b5e287e59cce582d8a6cd037ca`.
- C3: `/Users/eduardofariascappia/Downloads/Diagnostico_SIORG_BR-3.docx` — SHA-256 `f612ae30e66e71bca9a0cbbac746cb3b00cd59e03133dad454fa82872b6e1c7d`.
- R03: `/Users/eduardofariascappia/Downloads/Diagnostico_SIORG_BR_Revisado_2026-09-03.docx` — SHA-256 `69bc6cce5462b6a8cd73f1b622702a654078007578f0d1115d30fe1941ed124c`.
- Original: `/Users/eduardofariascappia/Downloads/Diagnostico_SIORG_BR.docx` — SHA-256 `f775e87a34488406262abd058a517a8b58d29fb5febf9702ab0c8498aabfcb77`.

As URLs acima foram extraídas dos hiperlinks de R10. Não foram abertas nem revalidadas em 19/10/2026. As fontes legais citadas pelo diagnóstico servem como pistas para a conferência da área, não como verificação normativa atual realizada nesta tarefa.
