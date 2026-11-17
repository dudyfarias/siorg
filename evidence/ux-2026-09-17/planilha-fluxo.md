# Planilha de referência — fluxo e simplificação da interface

Leitura em 17/09/2026, com a skill Spreadsheets e Python do runtime empacotado. Arquivo: `/Users/eduardofariascappia/Downloads/Calculadora de Cotas - vs abril_2026.xlsx`, aba `Calculadora`, A1:M21. Nenhum arquivo de cálculo ou código foi alterado. Esta é uma análise dos rótulos, disposição e dependências da planilha; não houve observação de uma pessoa utilizando-a nem nova certificação matemática.

## O que torna o preenchimento direto

A planilha é uma única superfície, sem etapas, seleção de modos ou formulário para adicionar cada cargo. A pessoa encontra a lista inteira e digita nas células correspondentes. Inputs, referências e resultados permanecem lado a lado.

O fluxo sugerido pelos próprios campos é:

1. Identificar o órgão/entidade em **A2** e informar os dois totais atuais em **B2** (cotas) e **C2** (quantitativos de CCESP + FCESP).
2. Percorrer as 18 linhas de referência e digitar as quantidades propostas de **CCESP em H3:H20** e **FCESP em I3:I20**. Não existe uma seleção de espécie por linha: as duas colunas já estão disponíveis.
3. Ler as cotas de cada linha nas colunas **J e K**, imediatamente ao lado das entradas. Os valores de referência em **D:G** já estão preenchidos; não fazem parte do trabalho ordinário de digitação.
4. Conferir os **quatro totais no fim da tabela, H21:K21**: quantidades CCESP/FCESP e cotas CCESP/FCESP.
5. Conferir as duas diferenças agregadas à direita: **L3:L20** e **M3:M20** são regiões mescladas, cada uma com um único resultado. Elas confrontam a proposta com os totais atuais informados. Não representam consulta a limite ou saldo autorizado.

As cores e bordas separam grupos de informação. A tipografia é compacta, predominantemente 11 pt. As linhas estão agrupadas visualmente em nível médio, superior e natureza especial. Não há uma coluna explícita numerando os níveis; a interface pode acrescentá-la para orientar o preenchimento.

## Poucos campos essenciais na tela

| Campo / bloco | Tratamento recomendado |
|---|---|
| Órgão/entidade | Um campo curto no topo; não deve impedir testar uma composição. |
| Cotas atuais | Uma entrada para quem deseja comparar com a situação atual agregada. |
| Quantidade atual total | Segunda entrada de comparação, junto da anterior. |
| Quantidades propostas CCESP e FCESP | Duas entradas numéricas por nível, na mesma tabela. É a tarefa central. |
| Cotas calculadas e quatro totais | Texto de resultado, sem edição, próximo dos números preenchidos. |
| Diferenças de cotas e quantidade | Dois resultados compactos com sinal e descrição clara; indisponíveis enquanto faltar a respectiva base atual. |

Uma tela próxima da planilha pode ser organizada em **uma faixa superior de três campos, uma tabela e uma linha de totais**, seguida das duas diferenças. A comparação deve ser opcional para permitir calcular a proposta sem primeiro preencher dados administrativos.

Tabela principal sugerida: **Nível | Quantidade CCESP | Quantidade FCESP | Cotas CCESP | Cotas FCESP**. Manter os 18 níveis disponíveis e os quatro totais alinhados às colunas. A alternativa de colocar cada quantidade junto de sua cota também é possível, desde que a separação entre entrada e resultado seja clara.

Evitar obrigar a pessoa a escolher um nível em um seletor e clicar “Adicionar” 18 vezes. Digitação direta e navegação por Tab preservam o jeito de trabalhar da referência. Os resultados devem acompanhar a edição, sem uma etapa adicional para calculá-los.

## O que pode ficar secundário

- **Valores em reais de D e F:** referência informativa; não precisam ocupar a área principal de uma calculadora de cotas.
- **Coeficientes de E e G:** manter disponíveis em “Valores unitários e fonte” ou em ajuda compacta. Não pedir que a pessoa os digite.
- **Legislação, versão e explicação metodológica:** um acesso discreto junto do título ou no fim da tabela. Não vários blocos introdutórios antes do primeiro campo.
- **Exportar, imprimir, copiar resumo, exemplo e limpar:** ações secundárias reunidas perto do resultado; não etapas obrigatórias.
- **Detalhe atual em C3:C20:** pede preenchimento, mas não participa das fórmulas do arquivo. Não torná-lo uma exigência nova sem confirmar sua finalidade.
- **Comparação atual por espécie, data e origem detalhadas:** informação útil para usos mais completos, mas adicional ao fluxo da referência. Não impor quatro totais atuais, seleção de modalidade ou cadastro de cenário antes da conta básica.

## Limites que a simplificação deve preservar

Simplificar o formulário não exige fundir os quatro totais de proposta: quantidades e cotas de CCESP e FCESP continuam identificadas. A diferença agregada pode permanecer para acompanhar a referência, com o rótulo “Variação em relação à situação atual”; ela não autoriza compensação entre os grupos.

O texto “Preencher” das células deve virar rótulo/ajuda de entrada, sem virar valor numérico. Não é preciso transportar os erros visíveis do modelo vazio para a tela. Validação curta deve aparecer no campo afetado, no momento em que for necessária.

No celular, priorizar as mesmas tarefas — encontrar o nível, digitar as duas quantidades e conferir resultados — sem uma pilha de cartões de apresentação antes da tabela. A solução responsiva deve conservar a associação de cada valor ao seu nível e espécie.

**Decisão recomendada:** primeiro reduzir a interface a essa superfície de trabalho; manter documentação e recursos avançados disponíveis, mas fora do caminho principal. O ganho de simplicidade é uma hipótese orientada pela preferência expressa pelo usuário, não um resultado de teste de usabilidade.

## Integridade da fonte

SHA-256 do arquivo lido: `17b7c81b169b0a33d2bced941ad9c164ce81b050f203b210d6d43208e93ede78`. Leitura e inspeção apenas; sem edição, salvamento ou recálculo do workbook.
