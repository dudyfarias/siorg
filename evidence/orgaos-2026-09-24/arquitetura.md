# Perfis por órgão — proposta de arquitetura

24/09/2026. Proposta técnica, sem implementação. Foram lidos `src/calculator.mjs`, `src/App.jsx`, `AGENTS.md`, `evidence/auditoria-planilha.md` e `evidence/contrato-motor-mvp.md`. A skill de qualidade de dados foi aplicada como verificação focada de unidade dos registros, origem, completude e versionamento. A pesquisa normativa de Educação, Saúde e SGGD está em frentes independentes; números, fatores, hierarquias e escopos ainda não encerrados permanecem pendentes neste documento.

## Decisão recomendada

Adicionar dois seletores dependentes, **Secretaria → Unidade**, com **“Toda a secretaria”** como unidade padrão. A seleção escolhe uma referência versionada e seu recorte, preservando a tela simples: os mesmos dois totais de base, tipo/nível/quantidade, uma tabela da proposta e diferenças imediatas. Atual, proposta e diferença sempre acompanham o recorte selecionado; não criar outro formulário para cada nível hierárquico. Separar três objetos que hoje poderiam ser confundidos:

| Objeto | O que representa | O que não determina sozinho |
| --- | --- | --- |
| Catálogo de coeficientes | Cotas por espécie e nível, com sua fonte e versão | Quantidade autorizada, ocupação, saldo ou aplicabilidade a qualquer estrutura |
| Base autorizada do perfil | Quadro ou distribuição fixada por ato para órgão/entidade, escopo e período definidos | Quantidade atualmente ocupada ou cotas disponíveis para livre uso |
| Situação atual informada | Os dois totais digitados pelo usuário, como B2/C2 da planilha | Origem normativa ou equivalência administrativa automaticamente comprovada |

Selecionar um órgão não é evidência de que seu coeficiente seja diferente. Também não autoriza preencher “atual ocupado” com o quadro de um decreto. A diferenciação precisa existir tanto nos dados quanto nos rótulos da tela e no resumo.

## 1. O que já existe e deve ser preservado

O motor 1.1.0 mantém um catálogo congelado de 36 coeficientes em centésimos, calcula parcelas e totais por CCESP/FCESP e trata ausência de modo distinto de zero. A página usa `comparisonBasis: 'arithmetic'` e base agregada; portanto, as diferenças não dependem de metadados administrativos. Essa decisão atende ao pedido de operar como a planilha.

O catálogo é consultado diretamente no cálculo, no seletor de níveis, na dica do valor unitário e nas referências. Qualquer evolução de catálogo deve usar **a mesma referência resolvida nesses quatro pontos**. Atualizar apenas o coeficiente no cálculo deixaria a interface ou a exportação mostrando outra tabela.

Na planilha, B2/C2 são a situação atual informada; E/G contêm coeficientes e D/F subsídios. A auditoria registrou que D/F não alimentam as cotas. Não se deve derivar um coeficiente de quota reduzido de regra remuneratória ou jornada sem dispositivo que altere essa medida.

O contrato de 14/09 é histórico: sua exigência geral de equivalência para comparar foi ampliada em 17/09 pelo modo aritmético. O perfil novo deve preservar o comportamento atual, sem reintroduzir formulário obrigatório de metadados para os dois deltas numéricos.

## 2. Modelo enxuto dos dados

Arquivos locais de referência, revisados antes de publicação, bastam para o primeiro recorte. Não é necessária API ou busca de atos durante o cálculo.

### Catálogo

Identidade e versão imutáveis; fonte/dispositivo; data de conferência; registros únicos por espécie/nível; coeficiente exato e unidade. A versão geral pode ser compartilhada por vários órgãos. Não duplicar os 36 valores em cada perfil quando a tabela é a mesma.

### Perfil normativo

| Campo lógico | Conteúdo mínimo |
| --- | --- |
| Identidade | Identificador interno estável, nome oficial confirmado e, somente se verificado, código institucional/SIORG |
| Natureza institucional | Órgão da administração direta, autarquia, fundação ou outra classificação conferida; vínculo não significa identidade |
| Escopo | Secretaria inteira ou unidade identificada; postos diretos ou conjunto que inclui subunidades explicitamente identificado; inclusões/exclusões relevantes |
| Hierarquia | Identificadores estáveis de secretaria e unidade, vínculo pai-filho e fonte/dispositivo que o fundamenta; estado de cobertura e relação de registros abrangidos |
| Versão | Identificador imutável do conjunto consolidado e versão anterior substituída, quando conhecida |
| Período | Data de referência da consolidação e intervalos de efeito conhecidos; não confundir publicação, vigência e data de consulta |
| Catálogo associado | Identificador/versão e política explícita: tabela geral conferida, tabela específica conferida ou aplicabilidade ainda não encerrada |
| Base autorizada | Quantidade e cotas por CCESP/FCESP quando documentadas, cada medida com estado, valor e fonte; agregado somente como resultado descritivo reconciliado |
| Aplicabilidade | Espécies/níveis/condições apenas quando o ato permite afirmar a regra; ausência de uma linha no quadro não vira proibição geral de recomposição |
| Regras específicas | Lista tipada e fundamentada, quando existir; não incluir multiplicador genérico presumido por órgão |
| Fontes e revisão | Atos e alterações considerados, dispositivos/quadros, data de conferência, responsável pela revisão a designar, conflitos e pendências |

**Unidade mínima de um valor autorizado:** órgão ou entidade + escopo + versão/período + espécie + medida. Quando houver detalhamento, preservar o código completo publicado, categoria de comando/assessoria, nível e unidade organizacional. A chave da fonte não deve ser reduzida a espécie/nível. Não juntar registros de órgãos diferentes nem tratar uma linha de total do anexo como mais uma unidade a somar.

Cada medida da base deve ter `valor` exato ou nulo; `estado` como conferido/ausente/conflitante/fora do escopo; unidade; referência de evidência; e indicação de valor transcrito ou derivado. Derivar uma soma e reproduzir um total declarado são operações distintas: se ambos existirem, reconciliar e registrar divergências. Só declarar o agregado de uma medida se seus componentes necessários estiverem completos e não sobrepostos.

Os valores continuam serializados como textos inteiros: quantidade em postos e cotas em centésimos, desde que a escala aplicável seja confirmada. Nulo não vira zero. Uma medida pode estar utilizável enquanto outra permanece sem base.

### Hierarquia e bases por recorte

Cada unidade precisa de identidade própria, vínculo com a secretaria e, quando conhecido, unidade superior. Nomes iguais não identificam a mesma unidade. O vínculo pai-filho deve ser fundamentado no ato de estrutura ou detalhamento; não pode ser deduzido apenas da ordem, da indentação, da proximidade das linhas ou do nome no quadro de cargos. Uma árvore precisa ter raiz definida, ausência de ciclos e vínculos temporalmente compatíveis.

A coordenação apontou que, na Educação, o art. 3º remete parte do detalhamento abaixo do nível 14 a resolução; a referência à Resolução SEDUC 108/2025 ainda não foi auditada nesta tarefa. Portanto, a reconciliação do quadro geral não comprova, sozinha, a hierarquia e os subtotais de cada unidade. A estrutura e o detalhamento da SGGD exigem a mesma verificação. Enquanto faltar fundamento, manter a relação ou cobertura como pendente; não gerar uma árvore presumida.

Cada recorte registra uma das coberturas: **“somente postos diretos”**, **“inclui subunidades identificadas”** ou **“abrangência ainda não confirmada”**. A cobertura aparece no título curto da base e no resumo. Se o recorte incluir subunidades, manter os identificadores dos descendentes ou dos registros-fonte abrangidos; se abranger apenas os postos diretos, os registros dos filhos ficam fora do subtotal. Quando a abrangência for desconhecida, não calcular subtotal automático atribuído à unidade.

A base da secretaria e as bases das unidades são retratos separados com origem, versão, período, natureza e cobertura próprios. Uma linha de subtotal de unidade não é somada novamente aos postos detalhados que já contém. Na soma da secretaria, usar uma única partição não sobreposta: por exemplo, postos diretos atribuídos às unidades, contados uma vez cada, e não soma de totais de pais com totais de filhos. A quantidade autorizada de qualquer desses recortes continua distinta da ocupação.

O piloto pode começar com **recortes documentados** ou com os **dois totais manuais de uma unidade identificada**, sem inventar seu subtotal a partir do quadro geral. O vínculo da unidade com a secretaria e o sentido do recorte ainda devem estar explícitos. A ausência de um mapa completo não impede a diferença aritmética do recorte informado; impede atribuir-lhe consolidação normativa ou impacto automático na secretaria.

### Adaptação da fonte detalhada para o motor atual

O motor rejeita linhas repetidas de uma mesma espécie/nível. Isso não significa que as categorias administrativas da fonte sejam duplicatas. O registro normativo deve manter cada código completo; um adaptador separado agrupa as quantidades de comando/assessoria de igual espécie/nível **somente para a aritmética**, após conferir que usam o mesmo coeficiente. Cada linha agrupada guarda os identificadores das linhas-fonte para permitir voltar ao detalhamento.

A conferência realizada pela coordenação do [Decreto 70.042/2025, Anexo II](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-70042-30.10.2025.html) da Secretaria da Educação reconciliou **50 códigos publicados**, transformados em **32 linhas** para o motor. A evidência `educacao-validacao-motor.json`, nesta pasta, registra resultado completo, zero divergências de coeficientes e zero divergências nos produtos por linha:

| Medida | Quantidade | Cotas |
| --- | ---: | ---: |
| CCESP | 1.246 | 3.089,50 |
| FCESP | 820 | 1.195,35 |
| Agregado descritivo | 2.066 | 4.284,85 |

Os coeficientes desse quadro coincidem com o catálogo atual `lc1395-anexo-i-revisao-2026-09-14`; a distribuição conferida não requer um fator novo. O agrupamento não autoriza equivalência administrativa, transformação entre comando/assessoria, compensação entre espécies ou validação do provimento. A execução confirma a conta do quadro publicado com o motor existente; não comprova ocupação, consolidação exaustiva de vigência, homologação nem execução no Excel.

### Fonte rastreável

Registrar URL oficial, identificação do ato, artigo/anexo/quadro e localização da linha ou célula; datas de publicação/efeito quando estabelecidas; data da consulta; vínculo com o valor ou regra extraída. Uma cópia de evidência local pode registrar hash para reprodução. Um link genérico ao órgão não sustenta um número.

A cadeia de atos deve indicar o que substitui, acrescenta ou revoga cada parcela. A regra não pode ser “o decreto de maior número vence”. Se a cobertura de alterações estiver pendente, o perfil não é apresentado como base normativa atual completa. “Conferido em” informa a pesquisa realizada, sem prometer atualização automática após essa data.

### Situação atual e seleção no cenário

O cenário guarda o perfil/versão e catálogo/versão escolhidos, mais a origem da base: **manual**, **referência autorizada** ou **manual a partir de referência**. A base copiada conserva um retrato da versão usada. Alterar números não pode continuar atribuindo o resultado editado ao decreto.

Órgão, escopo e data de referência permanecem fixos durante um cálculo. Uma atualização de dados do aplicativo não deve recalcular silenciosamente uma sessão aberta com outra versão. Não são necessários nomes de ocupantes, CPF, autenticação ou persistência de propostas para essa etapa.

## 3. Dois seletores e um único cálculo visível

1. **Secretaria:** seleciona a referência institucional; continua disponível a alternativa manual sem perfil normativo. Educação, Saúde e SGGD têm estados de dados próprios. Uma autarquia vinculada não aparece como se fosse unidade interna da secretaria nem entra implicitamente em seus totais; eventual perfil da autarquia permanece separado.
2. **Unidade:** depende da secretaria selecionada e começa em **“Toda a secretaria”**. Lista somente unidades identificadas e vinculadas por fonte conferida, podendo indicar recortes cuja base numérica ainda será manual. A listagem pode ser plana e pesquisável; não é necessário introduzir navegação em árvore ou vários seletores para subníveis. A opção escolhida informa se inclui subunidades ou apenas postos diretos.
3. A escolha apresenta uma linha curta com recorte, origem, data de referência e fonte. Os mesmos campos de cotas e quantitativo, a tabela da proposta e o quadro **Atual / Proposta / Diferença** passam a referir-se integralmente ao recorte escolhido. Os valores da secretaria não permanecem nos campos ao selecionar uma unidade. Explicações ficam no `i` e em “Ver referência”; a origem e a abrangência essenciais ficam visíveis.
4. Quando houver base normativa utilizável do recorte, oferecer **“Usar base do decreto”**. A ação preenche os mesmos dois campos, identificados como **“Cotas autorizadas — referência”** e **“Quantitativo autorizado — referência”**. O resultado passa a dizer **“Diferença em relação à referência autorizada — [recorte]”**. Não chamar esses números de ocupação.
5. **“Informar valores atuais”** mantém os dois campos manuais, agora referentes à secretaria ou unidade escolhida. Se valores copiados forem editados, mudar a origem da base para manual e preservar “a partir da referência X”. Não exigir também os mesmos valores da unidade em outro formulário.
6. Se faltar uma medida, mantê-la vazia com “Não disponível na referência”. O cálculo válido da proposta continua; somente a diferença sem base fica indisponível. Ausência de detalhamento de unidades não invalida automaticamente um total geral já reconciliado, mas não permite distribuí-lo ou rateá-lo entre unidades.

Recomenda-se separar “escolher recorte” de “usar base do decreto” para não sobrescrever valores manuais nem sugerir que o autorizado é ocupado. Se a seleção de um cenário vazio aplicar a base automaticamente, a origem e os rótulos devem mudar no mesmo ato. Para histórico, versão/data pode ficar em opção avançada; a versão padrão identifica sua referência temporal sem usar o dia corrente como prova de vigência.

### Impacto no total da secretaria

A comparação principal é sempre a do recorte selecionado. Quando a pessoa trabalha numa unidade, um detalhamento opcional pode mostrar a **estimativa aritmética do total da secretaria após substituir essa unidade**:

**Total proposto da secretaria = base da secretaria − base do recorte da unidade + proposta completa desse mesmo recorte.**

A fórmula é aplicada separadamente a quantidade e cotas de CCESP e FCESP, quando essas medidas estiverem disponíveis. O agregado continua descritivo e não autoriza compensação. Ela exige:

- Base da secretaria e base da unidade da mesma estrutura, natureza, período e versão, ou compatibilidade expressamente documentada; nunca total autorizado da secretaria menos ocupação informada da unidade.
- Unidade identificada como subconjunto da secretaria, com cobertura explícita. Se a base da unidade inclui subunidades, a proposta também cobre esse conjunto; se contém só postos diretos, a proposta substitui só esses postos.
- Dados completos e reconciliados para a medida calculada, com registros não sobrepostos. O restante da secretaria deve ser preservado; não pode haver transferência, supressão ou alteração de hierarquia externa ao recorte sem modelagem própria.
- A proposta representa a **composição final completa** da unidade, não apenas os acréscimos. Substituir a base inteira por uma lista apenas de novos postos subestimaria o total.

Não aplicar a fórmula se existir conflito entre quadro por unidade e resumo da secretaria, falta de cobertura ou sobreposição entre pai e filho. Mostrar “Impacto na secretaria não calculado — base consolidada ou abrangência pendente”, mantendo a conta local quando ela for possível. Valores manuais sem estrutura de referência suficiente permitem a diferença local, mas não sustentam consolidação automática.

Com “Toda a secretaria” selecionada, a proposta já representa o total escolhido e não precisa de outro painel idêntico. No primeiro recorte, trabalhar com uma unidade por vez; múltiplas propostas de unidades sobrepostas não podem ser somadas. O detalhamento de impacto usa as bases registradas e não pede entradas duplicadas ou novos campos obrigatórios na tela principal.

## 4. Troca de órgão, escopo ou versão

A troca deve ser uma transação única. Em cenário sem preenchimento, muda a seleção e limpa qualquer origem anterior. Com proposta, base ou rascunho já preenchidos, apresentar confirmação curta: trocar inicia outro cenário, com opção de cancelar e copiar o resumo antes. Ao confirmar, limpar linhas, base, rascunho de inclusão, indicação de exemplo e resumo/cópia anteriores; aplicar a nova seleção e referência de modo conjunto. Ao cancelar, nenhum dado nem seletor efetivo muda.

Ao trocar a secretaria, redefinir a unidade para “Toda a secretaria” e invalidar qualquer unidade do perfil anterior. Trocar somente a unidade também troca o recorte da base e da proposta; não carregar a base de um filho mantendo uma proposta preparada para o pai. A transição é uma mudança de cenário, não uma aprovação administrativa.

Não manter ocultamente as cotas da Educação enquanto o título passa a Saúde. A mesma regra vale para órgão inteiro versus unidade e para direta versus autarquia. Reutilizar uma proposta em outro órgão pode ser uma futura ação explícita de duplicação com revalidação; não deve ser o efeito padrão da troca de seletor.

## 5. Fatores ou tabelas realmente específicos

O modelo comporta uma regra específica, mas somente após definir **o que ela altera**: coeficiente unitário, quantidade/cota autorizada, limiar para uma comparação específica, ou remuneração. Regra exclusivamente remuneratória permanece fora deste motor de cotas.

Uma regra precisa ter alvo e unidade; base da operação; espécies, níveis e escopo atingidos; vigência; condições; ordem de aplicação; combinação ou exclusão de outras regras; expressão exata; fonte; e eventual arredondamento previsto. O fator pode ser guardado como razão de inteiros. Não assumir fator 1,10, redução por jornada, aplicação sobre todas as cotas ou equivalência entre espécies apenas por pertencer a determinado órgão.

O motor atual usa centésimos. Se uma regra legítima produzir frações menores, a representação deverá ser ampliada com exatidão ou o resultado específico ficará pendente até definir a regra aplicável. Não arredondar automaticamente para acomodar o formato atual. Antes de implementar um fator, exigir um caso numérico conferido independentemente com a frente normativa.

**Estado nesta entrega:** a Educação tem o quadro do Decreto 70.042/2025 reconciliado com o motor, conforme a evidência acima, sem divergência frente aos coeficientes atuais. A pesquisa identificou a distribuição anterior no Decreto 69.665/2025; a cadeia e os limites da busca constam da frente específica de Educação. Isso sustenta a separação entre catálogo geral e distribuição autorizada, sem afirmar que todas as alterações posteriores foram exaustivamente consolidadas.

**Saúde permanece pendente de confirmação do quadro aplicável.** A frente normativa não localizou um decreto geral de implantação que permita apresentar a base da Secretaria como atual confirmada. O Anexo VII original do Decreto 68.742/2024 pode ser registrado como evidência histórica, sem ativar seus totais como perfil atual. HCFAMEMA, HCFMB e HCFMRP possuem atos próprios e não devem ser incorporados por vínculo ao perfil da Secretaria. A LC 1.395/2023, art. 10, parágrafo único, foi apontada pela frente normativa como regra de jornada/retribuição proporcional para postos identificados privativos da área da saúde; não demonstra fator de cotas por órgão. Nenhum fator particular de Saúde foi confirmado.

**SGGD permanece pendente de reconciliação entre anexos.** A frente normativa registrou divergências em **11 códigos** do Decreto 70.755/2026: o quadro distribuído por unidades do Anexo II totaliza **500 posições/1.418,25 cotas** por cálculo da pesquisa, enquanto o resumo publicado no Anexo III informa **499 posições/1.415,35 cotas**. O total recalculado não substitui o autorizado, e a diferença global de uma posição/2,90 cotas não resolve os desvios por código ou espécie. Conservar as duas bases e suas fontes separadas, com estado conflitante; não carregar o quadro por unidades como decomposição reconciliada do resumo nem calcular o impacto consolidado da secretaria por subtração e substituição enquanto persistir a divergência. O perfil não recebe selo de base consolidada confirmada. A descrição documental de um anexo, quando necessária, deve identificá-lo explicitamente e manter a pendência visível. Evidências: `sggd.md`, `sggd-cadeia-verificacao.md` e `sggd-70755-quadros.json`, nesta pasta.

## 6. Integração proposta, sem alterar o motor agora

Manter o núcleo aritmético determinístico. Preparar futuramente uma etapa de resolução de perfil que devolve catálogo, base e fontes **já selecionados e versionados**, com razões de indisponibilidade. Ela não consulta a internet durante a conta e não escolhe uma versão pelo relógio ocultamente.

Na primeira evolução, se os órgãos compartilham o catálogo geral confirmado, o motor de multiplicação não precisa mudar: adicionam-se dados de base e origem, e o mesmo catálogo é usado por todas as camadas. Atribuir um decreto de distribuição ao perfil não exige criar novo algoritmo.

Se existir catálogo específico real, permitir injeção explícita da referência resolvida no motor, com padrão compatível para o cálculo manual existente. A UI deve ler desse mesmo objeto. Não espalhar condições do tipo “se órgão é Educação” pelas fórmulas ou componentes. O contrato definitivo das assinaturas depende do resultado normativo; não há razão para criar agora uma API genérica de fórmulas arbitrárias.

O resultado e `buildSummary` precisam guardar: secretaria/entidade, unidade ou “Toda a secretaria”, inclusão ou exclusão de subunidades, referência temporal, catálogo e versão, origem manual ou autorizada, atos de cada base, valores efetivamente usados, regras aplicadas e pendências. A saída mantém **proposta menos base do recorte**; o agregado continua descritivo. Se houver estimativa do total da secretaria, registrar sua fórmula, as três parcelas e a preservação do restante da estrutura; ausência dessa estimativa deve ter motivo explícito. Se a comparação autorizada exigir medidas por espécie, exibi-las em detalhamento sem transformar o delta agregado em saldo ou aprovação.

O `comparisonBasis: 'arithmetic'` pode continuar para contas imediatas; carregar um perfil normativo não o converte automaticamente em equivalência declarada. Não criar mensagem de “dentro da lei” por sinal ou total zero.

## 7. Critérios de aceite antes de disponibilizar perfis

- Identidade e escopo: Educação não carrega Saúde; secretaria não inclui autarquia por vínculo; unidade não herda total do órgão.
- Hierarquia: dois seletores dependentes; trocar secretaria redefine unidade. Vínculos pai-filho têm fonte de estrutura/detalhamento e não são inferidos da ordem das linhas; unidade direta e unidade com descendentes têm coberturas distintas e explícitas.
- Temporalidade: uma versão por cenário; efeitos de alteração não são aplicados antes da data pertinente; perfil com conflitos ou cobertura pendente não é rotulado atual e completo.
- Reconciliação: totais declarados e somas derivadas conferem; linhas de subtotal/total e unidades sobrepostas não são somadas duas vezes.
- Impacto na secretaria: base secretaria − base unidade + proposta unidade é exercitada por medida e espécie, apenas com o mesmo conjunto substituído e resto preservado. Proposta parcial de acréscimos, cobertura desconhecida, bases de naturezas diferentes ou conflito entre anexos deixam a consolidação indisponível.
- Pendências institucionais: SGGD mantém a divergência de 11 códigos sem escolher silenciosamente entre 500/1.418,25 e 499/1.415,35; Saúde não recebe base presumida. A Educação reconciliada no geral só oferece subtotais de unidades cuja atribuição/cobertura for documentada.
- Adaptação: códigos completos da fonte permanecem recuperáveis; agrupar por espécie/nível para o motor não elimina comando/assessoria do registro normativo nem cria equivalência administrativa. A Educação deve reproduzir as 50 linhas-fonte em 32 parcelas agrupadas e os totais reconciliados acima.
- Semântica: base autorizada, valores manuais e ocupação não recebem o mesmo rótulo de origem. Editar valores copiados muda a origem.
- Completude: ausência de uma medida não vira zero nem impede o cálculo válido de outra; falta de coeficiente necessário impede a parcela correspondente.
- Consistência: seletor, dica, motor e exportação usam a mesma versão dos coeficientes e da base.
- Transição: cancelar troca mantém o cenário; confirmar limpa o que pertence ao cenário anterior. O resumo não reaproveita órgão ou fonte antiga.
- Exatidão: regra especial, se houver, tem resultado independente conferido; nenhuma perda por arredondamento implícito.
- Limites de conclusão: os 27 casos existentes continuam válidos; novos testes de perfis não substituem homologação institucional nem comprovam execução equivalente no Excel.

São critérios propostos, não testes executados nesta rodada. Nenhum arquivo de aplicação, catálogo ou planilha foi modificado.

## 8. Pendências a encerrar com a pesquisa e a integração

| Pendência | Dado necessário |
| --- | --- |
| Educação | Quadro da Secretaria/administração direta no Decreto 70.042/2025, Anexo II, reconciliado: 50 códigos, 32 linhas aritméticas, 2.066 postos/4.284,85 cotas. Preservar códigos completos e fontes; encerrar a indicação de período e cobertura de atos posteriores sem confundir a conferência aritmética com consolidação jurídica exaustiva |
| Saúde | Perfil pendente até confirmar o quadro aplicável da Secretaria. Não ativar os totais originais de 68.742/2024 como atuais nem incluir as autarquias vinculadas. Separar jornada/retribuição de qualquer regra de cotas |
| SGGD | Reconciliar 11 códigos entre Anexo II distribuído (500 posições/1.418,25 cotas calculadas) e Anexo III resumido (499 posições/1.415,35 cotas publicadas). Manter as fontes separadas e o perfil pendente; não habilitar impacto consolidado por unidade |
| Hierarquia e unidades | Documentar vínculos pai-filho, cobertura de postos diretos/subunidades e partição sem sobreposição. Na Educação, verificar o detalhamento referido no art. 3º e a referência ainda não auditada à Resolução SEDUC 108/2025; verificar atos correspondentes da SGGD. O piloto pode iniciar com recortes documentados ou base manual da unidade |
| Eventual fator | Dispositivo, alvo, fórmula/base, condições, vigência e arredondamento; sem evidência, não existe fator implementável |
| Base padrão da interface | Confirmar uso explícito da referência autorizada ou apenas associação de fontes ao órgão, preservando o preenchimento manual |
| Responsabilidade da referência | Quem confere/publica atualização e qual recorte temporal o perfil pode afirmar |

A frente normativa recebeu essas perguntas. O próximo passo é consolidar os perfis com valores e lacunas documentados, fechar a assinatura de integração e planejar implementação com as lacunas explícitas.

## Fontes deste parecer

- Código local consultado em 24/09/2026: `src/calculator.mjs` e `src/App.jsx`; regras de UX em `AGENTS.md`.
- Auditoria da planilha em `evidence/auditoria-planilha.md`, especialmente B2/C2, E/G, D/F, L3/M3 e distinção entre base atual e limite.
- Contrato histórico em `evidence/contrato-motor-mvp.md`; suas regras de comparação devem ser lidas com a evolução aritmética de 17/09 presente no código.
- Conferência da Educação executada pela coordenação em 24/09/2026: `educacao-validacao-motor.json`, nesta pasta, com fonte no Decreto 70.042/2025, Anexo II, códigos agrupados para a aritmética, catálogo usado e totais por espécie. Esta atualização consultou a evidência; não repetiu a execução.
- Conferência da SGGD: `sggd.md`, `sggd-cadeia-verificacao.md` e `sggd-70755-quadros.json`, nesta pasta; divergência entre quadro por unidades e resumo do Decreto 70.755/2026. A arquitetura preserva esse conflito, sem arbitrar qual anexo corrige o outro.
- Fonte do catálogo já registrada no motor: [LC 1.395/2023 — texto compilado e anexos na ALESP](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/compilacao-lei.complementar-1395-22.12.2023.html), conferência do catálogo em 14/09/2026. A pesquisa normativa atual por órgão é responsabilidade das frentes paralelas; este parecer não a substitui.
