# SGGD_SIMULADOR_.xlsx — diferenças frente a SGGD- TESTE.xlsx

Inspeção somente leitura em 24/09/2026. As duas planilhas permaneceram intactas, com hashes conferidos antes/depois. A definição explícita do usuário permanece: **Anexo III = limite; Anexo II = alocado; saldo = limite menos alocado/projetado**. As regras seguem em revisão técnica.

## Consequência para a implementação

A versão nova **confirma a direção do aplicativo**, sem exigir importar novos parâmetros. Seus cabeçalhos passaram a distinguir III e II e o topo começou a ler o detalhamento. Contudo, os dados de alocação ainda não foram trocados para o Anexo II, e existem erros nas referências das fórmulas. O aplicativo deve manter a alocação real do II e os limites do III já conferidos, em vez de reproduzir os números incompletos exibidos no novo cabeçalho.

A distribuição continua fora desta entrega. O arquivo permanece um modelo combinado, com uma aba `SGGD`; não foram acrescentados seletores, cenários ou fonte externa.

## Mudanças confirmadas

| Item | Versão anterior | Versão nova |
|---|---|---|
| B4 / F4 | Limite quantitativo / Limite de cotas | Limite disponível — Anexo III / Limite de cotas — Anexo III |
| C4 / G4 | Quantidade atual / Cotas atuais | Quantidade alocada — Anexo II / Cotas alocadas — Anexo II |
| C5:D6 e G5:H6 | Constantes | Fórmulas ligadas às linhas, mas intervalos terminam antes da última linha |
| J7 | Considerava só os totais gerais | Também exige J5 e J6 “Enquadrada”, preservando o controle por espécie |
| Detalhe | A12:M56 | A13:M57, deslocado por nova instrução em A9 |
| Dados A:F do detalhe | 45 códigos do Anexo III | Exatamente os mesmos códigos, coeficientes, valores e quantidades |
| Conferência por código | O6:S50, sem CCESP 2.16 | O6:S51, inclui CCESP 2.16 em O9/Q9=1 |
| Fórmulas / células preenchidas | 479 / 945 | 496 / 951 |

## A coluna alocada ainda contém o Anexo III

A comparação alinhada pelo código confirma **nenhuma alteração de A12:F56 para A13:F57**. E13:E57, embora alimentando o cabeçalho agora chamado Anexo II, continua com todos os 45 códigos não nulos do **Anexo III**. F13:F57 é idêntico a E. Isso é diferença entre rótulo e conteúdo, não nova composição normativa.

| Origem / apuração | CCESP: quantidade / cotas | FCESP: quantidade / cotas | Total: quantidade / cotas |
|---|---:|---:|---:|
| Detalhe completo E13:E57 × D13:D57 | 298 / 1.066,00 | 201 / 349,35 | 499 / 1.415,35 |
| Cabeçalho novo, fórmulas até linha 56 | 298 / 1.066,00 | 197 / 346,95 | 495 / 1.412,95 |
| Anexo II oficial já conferido | 299 / 1.069,50 | 201 / 348,75 | 500 / 1.418,25 |
| Anexo III oficial, limites adotados | 298 / 1.066,00 | 201 / 349,35 | 499 / 1.415,35 |

O saldo inicial correto para a definição do usuário continua **CCESP −1 posto/−3,50 cotas; FCESP 0/+0,60**. O cabeçalho da nova planilha sugeriria uma margem fictícia de 4 FCESP/2,40 cotas por omissão da última linha, além de usar a composição III no lugar da II.

Fontes normativas reaproveitadas da conferência anterior: [Decreto 70.755/2026, Anexos II e III — DOE](https://www.doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002) e `evidence/orgaos-2026-09-24/sggd-70755-quadros.json`. Não foi realizada nova varredura normativa.

## Fórmulas relevantes: avanços e falhas

1. **Última linha excluída do resumo.** C5:D6/G5:H6 usam A13:A56 e as colunas correspondentes. O detalhe termina em 57. B57 é FCESP 2.01; D57=0,60; E57=F57=4. Ficam fora **4 funções e 2,40 cotas**. O valor salvo em C6/D6=197 e G6/H6≈346,95 corresponde a essa omissão; não é erro de arredondamento nem mudança de base. Alterar F57 não afeta o cabeçalho.
2. **Cotas atuais passaram a usar a proposta.** J12 continua “Cotas atuais”, mas J13:J56 usa `IF(OR(Dn="",Fn=""),"",Dn*Fn)`. K13:K56 também usa D×F. Portanto M=K−J fica zero com números preenchidos, mesmo quando a proposta muda. J57 continua D57×E57, formando uma exceção involuntária. Exemplo independente, sem editar o arquivo: F17 de 21→22 (CCESP 1.15) deveria gerar +6,00 cotas; J17 e K17 iriam a132 e M17 ficaria0, enquanto I5 do topo mostraria+6,00. No aplicativo, calcular alocado por E e proposto por F; somar K para o total proposto.
3. **Avanço no status geral.** J7 agora verifica os limites agregados e requer J5/J6 “Enquadrada”. Assim um excesso em uma espécie não é apagado pela outra. Essa lógica deve ser mantida, sem converter estado numérico em aprovação administrativa.
4. **Variação continua diferente de saldo.** E5:E7=D−C e I5:I7=H−G continuam proposta menos alocado. Não são limite III menos alocado II. O resumo não ganhou campo próprio para esse saldo. R6:R51 e D61:D63 pertencem à distribuição e calculam proposta menos alocação. O aplicativo precisa manter a distinção adotada pelo usuário.

## Controles e distribuição, apenas para rastreabilidade

- A instrução nova A9 permite testar quantidades atuais ou propostas; A8/A10 ainda dizem editar somente proposta. Não usar essa inconsistência como autorização para alterar uma base oficial silenciosamente.
- A validação apenas mudou para F13:F57; continua sem `type`, com `showErrorMessage=false`. Não foi introduzida uma validação comprovada de inteiro não negativo. A aba permanece sem proteção e sem congelamento de painéis.
- A conferência acrescentou **CCESP 2.16=1** e agora totaliza **284 CCESP +188 FCESP=472**, igual aos blocos. As demais quantidades de alocação por código permaneceram iguais. Os sete blocos foram apenas deslocados para as linhas67–73, mantendo seus valores fixos e listas textuais.
- O saldo de distribuição total D63 agora mostra23, antes27. Essa mudança decorre dos 4 FCESP omitidos no cabeçalho, não de uma nova alocação. Não importar esse saldo.
- A formatação condicional de S6:S50 passou a referenciar corretamente S6, mas deixa a nova última linha S51 fora. Permanecem regras em áreas vazias E279:E281 e J291:J351 e regras de texto em I4:I6 incompatíveis com o conteúdo.
- Sem comentários, hyperlinks, nomes definidos ou vínculos externos detectados. Não foram retidos metadados pessoais.

## Conclusão

Aproveitar os rótulos III/II, a ligação automática do resumo ao detalhe e o controle independente das espécies. Preservar a implementação com dados reais do II para alocação e III para limite, pois a nova planilha ainda não fez essa troca de composição. Não reproduzir os intervalos incompletos, as cotas atuais ligadas à proposta ou os saldos de distribuição. O JSON de mesmo nome documenta fórmulas, valores salvos, diferenças alinhadas por código e contas independentes. Não houve edição, publicação nem recálculo em aplicativo nativo.
