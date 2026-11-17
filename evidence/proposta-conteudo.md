Proposta e definição do MVP da Calculadora de Cotas

Versão 0.1 para discussão com as equipes usuárias e responsáveis pelo SIORG. Base de trabalho: planilha recebida em 14 de setembro de 2026.

Recomendação. Disponibilizar a Calculadora de Cotas dentro do SIORG, aproveitando a referência existente, para que a pessoa monte uma proposta, confira quantidades e cotas de CCESP e FCESP e explique a variação em relação à situação atual informada. O primeiro produto deve tornar essa tarefa verificável, com entradas claras, regras identificadas e um resumo para revisão.


### O ponto de partida

A planilha “Calculadora de Cotas - vs abril_2026.xlsx” já contém os valores unitários, calcula cotas por linha e totais por grupo e compara a proposta com dois totais atuais informados. As melhorias propostas para validar se concentram no preenchimento, na rastreabilidade e na apresentação da comparação. Ganhos de tempo e redução de erros ainda precisam ser medidos no uso real. [1]


### A primeira entrega

O MVP, ou produto mínimo viável, deve atender uma proposta de um órgão ou entidade por vez. O público principal são as pessoas que elaboram a composição; a conferência envolve quem revisa os cálculos e quem mantém a referência. O recorte inicial sugerido utiliza CCESP e FCESP e uma situação atual com significado e data confirmados pela equipe.

Identificar o órgão, a data e a origem da situação atual utilizada na comparação.

Selecionar níveis identificados e informar as quantidades propostas de cada grupo.

Calcular e conferir as parcelas, os totais e as diferenças, preservando os centésimos.

Apresentar um resumo com entradas, resultados, fonte dos coeficientes e pendências.


### Formato e resultado desta etapa

O destino definido é uma ferramenta dentro do SIORG. A proposta é uma página integrada ao portal, com orientações de preenchimento e resultados conferíveis. A estrutura técnica e a forma de acesso serão ajustadas ao ambiente mantido pela equipe responsável pelo SIORG.

Para o piloto, propõe-se cálculo no navegador, entradas manuais e tabela de coeficientes versionada. O cenário permanece na sessão, sem envio automático ou banco de propostas. A página deve avisar que recarregá-la perde o preenchimento e oferecer cópia do resumo. Integração, acesso e publicação seguem a configuração do SIORG.

A entrega atual é uma especificação baseada na referência recebida. A calculadora original foi preservada. O documento não representa um MVP já implementado ou uma validação administrativa de propostas.


## O que a referência permite afirmar

A leitura abrangeu a aba Calculadora, de A1 a M21, suas 42 fórmulas, valores salvos, campos e controles. As referências abaixo permitem localizar os achados no arquivo original. [1]

Cálculo já existente. H3:I20 recebem quantidades da proposta; J3:K20 multiplicam cada quantidade pelo respectivo valor unitário; H21:K21 totalizam as quantidades e cotas por grupo. Essa lógica útil deve ser preservada e conferida no novo suporte escolhido.

Situação atual e limite são conceitos distintos. B2 e C2 recebem, respectivamente, cotas e quantitativos atuais agregados. L3 e M3 calculam proposta menos situação atual. O arquivo não identifica esses campos como limites autorizados. A saída proposta deve dizer “Variação em relação à situação atual informada” e acomodar aumento, redução e manutenção.

Detalhamento atual sem vínculo com o cálculo. C3:C20 também solicitam quantitativos atuais, mas nenhuma fórmula usa essas células. C2 é preenchida separadamente. É preciso confirmar a finalidade desse detalhamento antes de retirá-lo ou fazê-lo alimentar o total. Há uma dependência de entendimento do processo, sem evidência de erro em um caso real.

Valores unitários e referência monetária. Os 36 coeficientes em E3:E20 e G3:G20 coincidem com o Anexo I consultado da LC 1.395/2023. Em F19 há R$ 14.457,20; o anexo traz R$ 14.236,80 para FCESP de nível 17, uma diferença de R$ 220,40. F19 não é usada nas fórmulas de cotas: K19 depende de I19 e G19. Registrar e corrigir essa informação na futura versão validada, sem atribuir a ela efeito sobre os totais de cotas. [1–2]

Estado inicial e controles. Os textos “Preencher” permanecem nas entradas do arquivo recebido e há erros #VALUE! salvos nos resultados de cotas e diferenças. Isso descreve o modelo ainda não preenchido; não prova falha com dados válidos. Não há validações de dados nem proteção ativa da folha. A evolução deve orientar o preenchimento e preservar as fórmulas contra alterações acidentais.

Identificação e atualização. As 18 linhas têm valores e agrupamentos, mas não exibem o número do nível nas células. O nome do arquivo menciona abril de 2026; as células não informam fonte normativa, vigência ou responsável pela tabela. A nova versão deve explicitar os níveis e a origem dos dados.


### Limite da avaliação

Os achados decorrem da inspeção do arquivo, da conferência de referências e de contas independentes. A visualização foi gerada a partir da planilha. Não foi realizado um teste acompanhado com usuários nem homologação no Excel ou no SIORG. A autoridade da versão enviada e sua rotina de manutenção ainda precisam ser confirmadas.


## Escopo funcional do MVP

Uma página do SIORG reúne identificação e situação atual, composição proposta e conferência dos resultados. A pessoa pode ajustar a composição sem perder o preenchimento. O cálculo da proposta funciona mesmo quando faltam dados atuais; nesse caso, a comparação permanece indisponível.

Parte | Requisito proposto

Identificação | Órgão ou entidade, natureza da base atual, data e abrangência. A comparação exige bases equivalentes, como a mesma estrutura; não misturar estrutura autorizada com ocupação.

Situação atual | Quatro totais opcionais: quantidades e cotas de CCESP, quantidades e cotas de FCESP. Registrar origem e data. Cada ausência suspende apenas a comparação correspondente.

Composição proposta | Selecionar os níveis utilizados e informar quantidades inteiras por grupo. Exigir dados apenas dos itens incluídos. Nível e valor unitário visíveis; sem campos de subsídio no MVP.

Conferência | Cotas por linha, quantidades e cotas por grupo. Resultado incompleto indica quais dados corrigir. Ausência não vira zero.

Comparação | Proposta menos situação atual, por grupo e unidade, quando houver bases compatíveis. Mostrar aumento, redução ou manutenção.

Resumo | Entradas, parcelas, totais, diferenças disponíveis, data, origem, versão e pendências. Copiar o resumo para revisão; impressão se necessária ao fluxo observado.


### Como tratar a base agregada da planilha

B2 e C2 não permitem separar a situação atual entre CCESP e FCESP. Quando a equipe só dispuser dessa base, oferecer entrada agregada alternativa com dois totais, em vez dos quatro campos. Mostrar a variação agregada como informação descritiva e as comparações por grupo como “sem base atual por grupo”. Não estimar a divisão ou sugerir compensação entre grupos.

O primeiro recorte não exige o detalhamento atual por nível de C3:C20. Confirmar sua finalidade com a equipe antes do protótipo; se for indispensável à revisão, ajustar este recorte. Não exigir totais agregados e desdobrados para a mesma comparação. A base precisa ter natureza, data e abrangência confirmadas para gerar diferenças.


### Fora do primeiro recorte

Consulta a saldo oficial ou limites em tempo real; autorização de recomposição; validação de ocupantes, hierarquia ou requisitos de provimento; cálculo de folha; minutas; organogramas; integração com SEI ou RH; importação de planilhas de formatos variados; histórico compartilhado. Essas funções dependem de bases e regras próprias.


## Regras de cálculo e referência

O cálculo deve manter quatro resultados independentes: quantidade de CCESP, cotas de CCESP, quantidade de FCESP e cotas de FCESP. Por linha, multiplicar a quantidade pelo valor unitário. Somar as parcelas apenas no grupo correspondente. A comparação subtrai a situação atual da proposta, mantendo a unidade e a abrangência.

O Anexo I consultado apresenta os valores abaixo, coincidentes com E3:E20 e G3:G20. A tabela apoia a conferência aritmética; a aplicabilidade de níveis, categorias e natureza especial a cada estrutura deve ser validada no recorte do piloto. [1–2]

Nível | Valor unitário CCESP | Valor unitário FCESP

1 | 1,00 | 0,60

2 | 1,25 | 0,75

3 | 1,50 | 0,90

4 | 1,75 | 1,05

5 | 2,00 | 1,20

6 | 2,25 | 1,35

7 | 2,50 | 1,50

8 | 2,75 | 1,65

9 | 3,00 | 1,80

10 | 3,25 | 1,95

11 | 3,50 | 2,10

12 | 4,00 | 2,40

13 | 4,50 | 2,70

14 | 5,50 | 3,30

15 | 6,00 | 3,60

16 | 7,00 | 4,20

17 | 8,00 | 4,80

18 NES | 9,00 | 5,40

Precisão. Manter os centésimos dos coeficientes e calcular com aritmética decimal exata. A quantidade de cargos ou funções é inteira. Não arredondar uma quantidade fracionária para torná-la válida.

Separação. A LC 1.395/2023 distingue os grupos e veda recomposição entre CCESP e FCESP. Uma variação agregada nula não demonstra regularidade nem autoriza compensação. A análise administrativa abrange condições que esta calculadora não verifica. [2]

Atualização. Identificar versão, fonte, data de aplicação e responsável pela tabela. O MVP exibe apenas níveis, quantidades e valores unitários. Subsídios ficam fora da interface; a divergência em F19 permanece registrada para a manutenção da referência.


## Exemplo para discussão e testes de aceite

Exemplo fictício, sem vínculo com um órgão real. Quantidades e bases abaixo foram escolhidas apenas para demonstrar a leitura dos resultados. Os coeficientes correspondem à tabela da página anterior.

Composição proposta | Quantidade | Valor unitário | Cotas

CCESP nível 2 | 3 | 1,25 | 3,75

FCESP nível 4 | 2 | 1,05 | 2,10

Medida | Atual fictício | Proposta | Variação

Quantidade CCESP | 4 | 3 | −1 cargo

Cotas CCESP | 5,00 | 3,75 | −1,25 cota

Quantidade FCESP | 1 | 2 | +1 função

Cotas FCESP | 1,05 | 2,10 | +1,05 cota

Leitura esperada: redução de um cargo e de 1,25 cota CCESP; aumento de uma função e de 1,05 cota FCESP. As diferenças permanecem separadas. Esse resultado descreve a proposta e não decide sua admissibilidade.


### Critérios para aceitar o primeiro protótipo

Caso | Resultado esperado

Conta de referência | Reproduzir as parcelas e totais do exemplo e casos reais conferidos pela equipe, sem divergência aritmética não resolvida.

Quantidade inválida | Recusar quantidade negativa, fracionária ou texto. Informar o campo a corrigir, sem truncar valores.

Ausência e zero | Distinguir dado pendente de zero confirmado. Item não utilizado não exige quantidade; item incluído exige entrada válida.

Base atual incompleta | Manter o cálculo completo da proposta; não calcular a diferença cuja base esteja ausente ou incompatível.

Aumento e redução | Conservar sinal, unidade e grupo. Variação zero usa “sem alteração” e não “aprovado”.

Consistência da base | Não desagregar B2/C2 automaticamente. Se houver detalhamento atual, conferir sua relação com o total.

Atualização e resumo | Manter fonte e versão estáveis durante o preenchimento. O resumo conserva valores e pendências da tela ou planilha.

Uso acompanhado | Permitir completar, corrigir e explicar uma proposta; testar teclado, ampliação, telas estreitas e leitura dos campos. Erros não dependem apenas de cor.


## Método de trabalho e piloto

A sequência utiliza Imersão, Ideação e Transformação, aproveitando o diagnóstico já feito. O foco da nova imersão é a rotina da calculadora: de onde vêm os números, como uma proposta é preenchida e como outra pessoa a confere.

Etapa | Entrega | Condição para avançar

Imersão dirigida | Observar elaboração e conferência de um caso permitido. Confirmar B2/C2, finalidade de C3:C20, origem e manutenção da referência. | Significado dos dados e necessidade de melhoria registrados.

Ideação | Definir a forma de entrada da situação atual e o resumo. Desenhar uma página integrada ao SIORG com os requisitos desta proposta. | Recorte acordado e casos de teste com resultados conferidos.

Transformação | Construir e testar o primeiro protótipo. Aplicar correções e executar um piloto acompanhado. | Contas reconciliadas e tarefa compreendida no recorte testado.


### Como testar a utilidade

Começar com pelo menos uma pessoa que elabora e uma que revisa propostas, como rodada exploratória. Usar casos conhecidos, sem dados pessoais de ocupantes. Observar primeiro o procedimento atual; depois testar tarefas comparáveis no protótipo. Variar a ordem ou os casos para reduzir o efeito de aprendizado.

Indicador | Definição e uso

Conclusão da tarefa | Tarefas concluídas corretamente e sem ajuda ÷ tarefas tentadas. Informar também as contagens e o tipo de tarefa.

Compreensão do resultado | Tarefas em que a pessoa explica corretamente quantidades, cotas, comparação e origem ÷ tarefas com essa verificação aplicada.

Tempo de execução | Mediana do tempo das tarefas concluídas, do início do preenchimento à conferência. Registrar tarefas não concluídas separadamente.

As metas serão pactuadas após observar a referência atual. Os indicadores não foram medidos nesta análise. O piloto pequeno serve para encontrar problemas e orientar ajustes; não sustenta estimativas de ganho para toda a administração.

Condição de qualidade. Resolver as divergências relevantes de cálculo e interpretação encontradas no recorte, repetir os testes afetados e registrar o que foi conferido. A concordância com a planilha precisa de verificação independente para não reproduzir um erro existente.


### Papéis a confirmar

A equipe do projeto conduz pesquisa, conteúdo, desenho e organização do piloto. A área que mantém a calculadora confirma dados e regras; a unidade usuária fornece e confere os casos. A equipe responsável pelo SIORG define implementação, acesso, atualização e publicação. Essas responsabilidades são propostas, ainda sem designação nominal.


## Decisões e encaminhamento

O próximo pacote de trabalho é fechar o recorte com a equipe usuária e transformar esta especificação em um protótipo verificável. Não é necessário repetir o diagnóstico geral dos portais.

Decisão pendente | Por que interfere no MVP

Ambiente do SIORG | Confirmar onde incorporar a página, a equipe de manutenção e a forma de acesso. O destino no SIORG já está definido.

Significado da situação atual | Confirmar se os dados descrevem estrutura autorizada, ocupação ou outra referência. Comparar somente universos equivalentes.

Dados atuais por grupo | Confirmar disponibilidade de quatro totais e a finalidade de C3:C20. Evitar divisão estimada e preenchimento duplicado.

Referência e abrangência | Identificar responsável, condição de uso e significado da versão abril de 2026. Definir níveis e situações cobertos pelo piloto.

Resumo para revisão | Confirmar se a revisão usa o arquivo, impressão, quadro copiado ou outro formato. Implementar apenas o formato necessário.


### Sequência proposta após essas definições

Consolidar as regras e os casos esperados; desenhar a página; construir o protótipo; conferir os cálculos; realizar o piloto; corrigir os problemas observados; preparar a incorporação ao SIORG. Prazo e esforço dependem das pessoas disponíveis e do acesso ao ambiente, ainda não confirmados.


### Fontes e evidências

[1] Arquivo fornecido pelo usuário: “Calculadora de Cotas - vs abril_2026.xlsx”. Aba Calculadora, A1:M21. Inspeção em 14/09/2026. A2:C2: identificação e base atual; C3:C20: detalhe atual; D3:G20: tabela; H3:K21: composição e totais; L3/M3: diferenças. O original não foi alterado.

[2] LC 1.395 de 2023 na ALESP — texto compilado e anexos https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/compilacao-lei.complementar-1395-22.12.2023.html

Consulta em 14/09/2026. Arts. 3º a 6º: definições e separação; arts. 11 e 12: regime remuneratório; arts. 17, 18 e 23: distribuição, demonstrativos e condições administrativas. O Anexo I fundamenta os coeficientes e a comparação pontual de F19.

Anexo I — imagem oficial da tabela de valores https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/2024010810054623840.png

Referência complementar — Decreto 68.742 de 2024 https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-68742-05.08.2024.html

O decreto regula a implementação e possui alterações posteriores. Sua distribuição original não foi adotada como limite atual do MVP. A eventual inclusão de limites exigirá a cadeia de atos aplicável ao órgão e à data e a validação da área responsável.