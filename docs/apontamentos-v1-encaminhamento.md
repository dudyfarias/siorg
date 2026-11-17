# Apontamentos da CMO no Simulador de Reestruturação

Conferência de 16/11/2026. A numeração segue as quatro partes do compilado da CMO. Os ajustes desta rodada estão na versão local do protótipo. A SGGD foi usada no teste de navegação e de edição.

## Ajustes diretos no simulador

| Parte | Nº | Encaminhamento |
| --- | --- | --- |
| 1 | 01 | O diálogo de renomeação explica que a ação edita a denominação e que mudanças de tipo ou nível precisam de conferência. O critério de reenquadramento segue para a área técnica. |
| 1 | 03 | A edição de código orienta a conferir o enquadramento e corrigir o código após um alerta. O caso da Coordenadoria de Arquivo Digital depende da decisão sobre bloqueio. |
| 1 | 04 | O saldo fixo ganhou legenda para valores negativos, zero e positivos. A calculadora identifica o saldo como resultado da proposta aberta no navegador. Vídeo e colaboração seguem como decisões de produto. |
| 1 | 05 | A tela informa o salvamento automático no navegador e avisa quando ele falha. Ao sair com mudanças que o navegador ainda não salvou, o simulador solicita confirmação. |
| 1 | 06 | O caminho da unidade aparece ao lado dos seletores. Vínculos externos e pendentes são identificados conforme a base. |
| 1 | 07 | A coluna Situação do Excel sinaliza renomeação, transferência e alterações em cargos ou funções. Pode mostrar mais de uma alteração na mesma unidade. |
| 1 | 09 | O botão Restaurar esta unidade tem borda e fica disponível quando existe alguma alteração restaurável. |
| 1 | 10 | O saldo fixo tem um atalho para Ver alterações. Pelo resumo, é possível voltar à edição da unidade. |
| 2 | 03 | Já atendido. O seletor de unidades oferece busca por nome e por unidade superior. |
| 2 | 04 | A tela diferencia o Excel, que permite ler e compartilhar a proposta, da cópia em JSON, que permite retomar a edição. A adoção de outro formato de rascunho é uma decisão de produto. |
| 2 | 05 | O resumo ganhou busca por nome ou código de cargo ou função, com atalho para abrir a unidade. Os totais e downloads refletem a proposta inteira. |
| 2 | 06 | O arquivo de texto mostra a variação de cotas por alteração e por unidade, separada por espécie. O saldo compara a proposta com a referência global do órgão. |
| 2 | 08 | A tela explica a finalidade do Anexo II da proposta e indica o modelo no Decreto nº 68.742/2024. |
| 2 | 09 | O quadro posiciona unidades novas e transferidas junto ao ramo do superior identificado e indica esse vínculo na prévia, no PDF e no Excel. |
| 2 | 10 | Os cargos e funções de cada unidade são apresentados por nível decrescente na edição e no quadro da proposta. Os empates seguem a ordem de origem. |
| 3 | 01 | A consulta consolidada mostra quantitativos e cotas da base e da proposta. Os filtros são por espécie, código ou nome do cargo e nome da unidade. O nome da unidade abre a edição. |
| 3 | 02 | A primeira tela explica o objetivo do simulador e oferece instruções de preenchimento antes da edição. |
| 3 | 03 | A estrutura em árvore mostra a unidade criada sob a superior. O seletor segue em ordem alfabética, com busca e identificação da unidade superior. |
| 3 | 04 | Já atendido. A lista de unidades filtra as sugestões enquanto a pessoa digita. |
| 3 | 05 | A retirada ficou explícita no editor e no resumo. O resumo compara o estado da base com o da proposta. O histórico ação por ação segue como decisão de produto. |
| 3 | 06 | A transferência agora tem confirmação visível. O resumo identifica a unidade, o vínculo de origem e o de destino. O histórico ação por ação segue como decisão de produto. |
| 3 | 07 | Foram ampliados textos e reforçado o contraste nas orientações, no caminho da unidade e no resumo. |
| 3 | 08 | O botão Iniciar simulação direciona à seleção do órgão e da unidade. |
| 3 | 09 | As etapas ganharam links com descrição e destaque da seção selecionada. |
| 3 | 10 | A página orienta o percurso Estrutura → Cotas → Resumo das alterações → Anexo II, com acesso direto a cada etapa. |
| 4 | 01 | As instruções de cálculo aparecem antes da edição e no ícone de ajuda junto à coluna de cotas. |
| 4 | 02 | A retirada pede confirmação e passa a ser sinalizada na unidade, com opção de restauração quando aplicável. |
| 4 | 03 | A transferência ganhou busca de destino e caminho hierárquico. O diálogo identifica a unidade e seu vínculo atual. O resumo mostra De e Para. |

## Decisões da área técnica

| Parte e nº | O que precisa ser definido |
| --- | --- |
| Parte 1, 01 | Quando alterar a denominação exige reenquadrar uma unidade e quais níveis e requisitos devem ser verificados em cada caso. |
| Parte 1, 02 e 03 | Quais alertas devem bloquear a transferência ou a troca de código, incluindo os dois cenários relatados na CMO, e em que situações o usuário pode prosseguir. |
| Parte 2, 01 e 07 | Qual tabela oficial de denominação por código adotar, como tratar códigos com mais de uma denominação e como refletir a decisão no editor, no resumo e nos arquivos. |
| Parte 2, 02 | Quais exceções se aplicam às subsecretarias, quando cabe justificativa e o que a proposta deve registrar. |

O art. 16, § 1º, remete ao modelo do Anexo IV. Os arts. 17 e 18 trazem requisitos e hipóteses que fundamentam a conferência técnica dos cenários. [Decreto nº 68.742/2024](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-68742-05.08.2024.html)

## Decisões de produto e infraestrutura

| Parte e nº | Decisão |
| --- | --- |
| Parte 1, 04 e 08 | Definir se haverá uma mesma proposta editável em equipe e, nesse caso, como identificar os participantes, controlar o acesso e preservar mudanças simultâneas. A simulação atual é individual por navegador. |
| Parte 1, 04 | Avaliar o roteiro de um vídeo de orientação junto com o próximo teste de usabilidade. |
| Parte 2, 04 | Definir se o Excel também deve reabrir uma edição no portal. Hoje o Excel é a versão de consulta e a cópia em JSON é o rascunho reimportável. |
| Parte 3, 03 e Parte 4, 03 | Avaliar a necessidade de uma visualização em árvore também dentro dos seletores. A seleção principal prioriza a busca alfabética e o diálogo de transferência mostra o caminho do destino. |
| Parte 3, 05 e 06 | Definir se haverá histórico de cada movimentação e quais informações devem ser registradas. O resumo atual é a comparação final da proposta com a base. |
