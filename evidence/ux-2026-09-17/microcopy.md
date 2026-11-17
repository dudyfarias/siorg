# Textos e sequência mínima — 17/09/2026

Orientação vigente do usuário: “Muitos campos e informações de uma vez” e “tem que ser simples igual a planilha”. Base: leitura do App.jsx. Skill Product Design audit aplicada apenas aos critérios de fluxo, hierarquia, rótulos e recuperação de erros. Sem navegador, capturas ou revalidação dos cálculos. Esta versão substitui a sugestão anterior de um percurso com quatro etapas.

## 1. Um núcleo curto, sem assistente longo

**Preencher → adicionar → ver resultado.** Manter os itens incluídos fáceis de editar, como as linhas de uma planilha. Se houver uma tela separada de resultado, limitar o percurso principal a essas duas telas. Não apresentar a comparação como etapa obrigatória num indicador de progresso.

| Elemento | Texto |
|---|---|
| Título | Calculadora de Cotas |
| Indicação discreta | Versão de teste |
| Campos | Tipo / Nível / Quantidade |
| Opções de tipo | CCESP — cargo / FCESP — função |
| Ação do item | Adicionar |
| Lista | Proposta |
| Ação para concluir | Ver resultado |
| Voltar do resultado | Editar proposta |
| Ação secundária | Carregar exemplo |

No início, uma frase basta: **“Adicione os cargos e funções da proposta.”** Não exibir painel de resultados vazio, dados atuais, fórmula, versão normativa e vários avisos junto aos três campos. Não abrir outra tela apenas para perguntar se a pessoa quer começar.

Após incluir itens, permitir corrigir a quantidade diretamente na lista. Valores-unitários e parcelas ficam disponíveis nos detalhes do resultado; não desaparecem do resumo.

## 2. Resultado claro e comparação por escolha

**Título:** Resultado da proposta.

Mostrar os quatro resultados em dois grupos: **CCESP — cargos e cotas**; **FCESP — funções e cotas**. Aplicar singular/plural normalmente.

**Ações:** “Ver resumo”, “Editar proposta” e, em segundo plano, “Comparar com os dados atuais”. Dentro do resumo, usar “Copiar resumo” e “Baixar texto”. Não multiplicar botões que abrem o mesmo destino.

**Detalhes recolhidos:** “Como o cálculo foi feito” e “Fonte dos valores”.

**Nota única:** “O cálculo apoia a conferência e não aprova a proposta.”

Enquanto não houver pedido de comparação, não mostrar “Comparação não solicitada”, campos pendentes ou comparações vazias. A proposta calculada já é um resultado útil.

## 3. Comparação secundária, sem novo percurso numerado

Ao escolher comparar, começar pelos valores atuais. A entrada separada por CCESP/FCESP pode ser o padrão. Oferecer **“Só tenho o total”** como alternativa discreta; não é necessário abrir três cartões de escolha.

| Forma | Campos |
|---|---|
| CCESP | Quantidade atual de cargos / Cotas atuais |
| FCESP | Quantidade atual de funções / Cotas atuais |
| Total conjunto | Quantidade atual de cargos e funções / Total atual de cotas |

Ajuda comum: **“Deixe em branco o que não souber.”** Ajuda nas cotas: **“Ex.: 1250,50”**.

Origem e contexto aparecem apenas nesse ramo opcional. Se forem mostrados depois dos números, tratar como continuação da mesma comparação, sem novo assistente ou indicador de etapas. Rótulos curtos:

- Órgão ou entidade.
- Estrutura considerada — “Ex.: órgão inteiro ou uma unidade”.
- O que os números representam? — “Estrutura autorizada”, “Cargos e funções ocupados”, “Outra situação”.
- Data dos dados.
- Fonte dos dados — “Documento, planilha ou link”.
- Confirmação: “Os dados atuais e a proposta tratam da mesma estrutura e da mesma situação.”

Ações: **“Ver comparação”** e **“Voltar ao resultado”**. Preservar os dados ao voltar. Não alterar os requisitos do motor para esconder campos necessários; apenas mostrar esses campos no contexto em que serão usados.

No resultado comparativo, usar **“Atual informado / Proposta / Diferença”**. Se forem totais conjuntos, exibir só essa comparação e a nota “Os totais conjuntos não autorizam compensar CCESP e FCESP.” Não acrescentar quatro comparações indisponíveis por grupo.

## 4. Orientações só quando ajudam a continuar

| Situação | Texto |
|---|---|
| Item ainda não adicionado ao avançar | Adicione este item ou apague os campos antes de continuar. |
| Falta nível | Selecione o nível. |
| Falta quantidade | Informe a quantidade. |
| Quantidade inválida | Informe um número inteiro igual ou maior que zero. |
| Cotas inválidas | Use até duas casas decimais. Exemplo: 1250,50. |
| Item repetido | Este item já está na proposta. Altere a quantidade na lista. |
| Item incluído | Item adicionado. |
| Item removido | Item removido. |
| Falta contexto para comparar | Complete os dados sobre a origem dos números. |
| Falta confirmar compatibilidade | Confira se os dados atuais e a proposta tratam da mesma situação. |
| Cópia concluída | Resumo copiado. |

Não mostrar uma lista de todos os campos faltantes assim que a pessoa abre a comparação. Apontar os campos relevantes após a tentativa de continuar. Trocar “equivalência”, “liberar a comparação” e “inteiro ≥ 0” pelas instruções acima. Não antecipar limite técnico de caracteres nem explicar separadores em todos os campos.

## 5. Cortar repetição sem perder informação

Manter **“Exemplo fictício”** quando aplicável, sem carregar exemplo automaticamente. Concentrar **“Copie o resumo antes de fechar ou atualizar a página”** junto ao resumo. Fonte, data e versão permanecem nos detalhes e na exportação, sem abrir a jornada.

“Limpar preenchimento” continua uma ação explícita, separada de voltar/editar. Não repetir a mesma advertência na abertura, em cada cartão, no resultado e no rodapé. O indicador “Versão de teste” já comunica o caráter demonstrativo; detalhes técnicos da integração não ajudam a preencher a calculadora.

**Critério para a revisão visual:** ao entrar, três campos e uma ação clara; depois, itens editáveis e resultado; comparação somente por escolha. A nova interface precisa parecer uma calculadora curta, não um cadastro ou formulário de processo.
