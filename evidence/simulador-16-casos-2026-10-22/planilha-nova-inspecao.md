# Conferência da nova referência SGGD — 22/10/2026

Leitura de `/Users/eduardofariascappia/Downloads/SGGD-SGGD (1).xlsx`, com openpyxl e XML do XLSX, sem salvar, recalcular ou executar instruções do arquivo. Comparação integral com a base local `src/data/sggd-structure.mjs` e com `sources/preparacao-2026-10-19/SGGD- TESTE1.xlsx`. Evidência estruturada: `planilha-nova-inspecao.json` nesta pasta.

## Resultado principal

**Não mudou a base alocada nem os limites usados pelo portal.** As 407 linhas de cargos e funções e as 221 unidades coincidem integralmente com a base local quanto a unidade, vinculação, denominação, código completo, quantidade e coeficiente. O detalhe fixo de `Quadro vigente` e o estado salvo de `Anexo II` também coincidem linha a linha.

| Medida | CCESP | FCESP | Total |
|---|---:|---:|---:|
| Alocação II — quantidade | 299 | 201 | 500 |
| Alocação II — cotas | 1.069,50 | 348,75 | 1.418,25 |
| Limite III — quantidade | 298 | 201 | 499 |
| Limite III — cotas | 1.066,00 | 349,35 | 1.415,35 |

Alocação declarada: `Quadro vigente!B7:C9`; alocação independente recalculada a partir de cada código/quantidade e da Tabela de cotas. **Os limites III estão presentes em `Calculadora!B13:C14`**, sob o título de `A11`, embora textos de `Instruções!B8`, `Quadro vigente!A10` e o primeiro quadro da calculadora (`B6:B7`, `L6:L7`) ainda digam “sem Anexo III”/“não informado”. O primeiro sinal desta revisão, restrito ao cabeçalho, foi corrigido após localizar esse segundo bloco. A contradição é de apresentação interna, não ausência dos valores do III.

## Inventário e mudanças de estrutura

- São nove abas, todas visíveis: Instruções (17×2), Quadro vigente (635×6), Simulações realizadas (21×14), Reestruturação (1325×48), Anexo II (1323×4), Calculadora (58×12), Resumo (233×13), Tabela de cotas (71×6) e Regras do regime (35×12). TESTE1 tinha cinco abas.
- A aba Instruções identifica o arquivo como modelo v3; o XML registra criação em 21/10/2026 19:38:53 e modificação em 22/10/2026 12:16:41. Metadados não certificam aprovação técnica.
- SHA-256 recebido: `dfb7d13d88d75dfa3ffa4c6de149ca9e06817b04688fc030e2e99866e9772a11`. Arquivo original preservado. Após a inspeção, uma cópia idêntica foi incluída em `public/modelos/SGGD-modelo-v3.xlsx` para o download explícito do modelo original. Os dados da aplicação não foram substituídos por fórmulas ou caches desse arquivo.
- `Quadro vigente` separa resumo e 407 linhas fixas, estas em `A229:E635`. A base não depende dos valores editados na proposta.
- Reestruturação explicita `L = Nova quantidade (digite)`, `I = quantidade proposta calculada`, `H = ação`, `J = novo nome/destino`, `M = observação automática` e `N = gravidade`. Na linha original, L vazia mantém a quantidade do decreto. Essa convenção do Excel não substitui o campo de quantidade final do portal, onde vazio representa rascunho incompleto.
- Ações de unidade: manter, renomear, transferir e retirar. O destino está em J; há cinco áreas para criar unidades em 1301, 1306, 1311, 1316 e 1321, com quatro posições cada. Cada unidade existente dispõe de três linhas de acréscimo.
- A Tabela de cotas preserva os coeficientes comuns à TESTE1 e acrescenta `CCESP 2.18 = 9` em `A2:B2`. Não é usado nas 407 linhas da base. Sua presença na lista não valida a possibilidade de criação desse código/denominação; não importá-lo automaticamente como opção aprovada.
- O Anexo II usa quatro colunas e índice sequencial com INDEX/MATCH para omitir retirados/zeros, em lugar do FILTER usado pela TESTE1. O estado salvo contém 407 linhas/500 postos; isso não prova compatibilidade executada com Excel 2010 ou LibreOffice.

## Fórmulas e alertas: aproveitamento com limites

- `Calculadora!C6:K8` deriva alocação/proposta das linhas de Reestruturação e separa CCESP/FCESP. `B13:C14` contém o III; `D13:E14` referencia a proposta. Os valores iniciais reproduzem a divergência II/III existente.
- `F13:F14` usa ATENÇÃO ao ultrapassar cotas e linguagem de recomposição ao ultrapassar quantidade. Esses textos do modelo não constituem validação jurídica nem substituem a sinalização independente de quantidade/cotas acordada no portal.
- `Reestruturação!I9` usa a quantidade L se numérica, aplicando `MAX(0,L9)`; valor não numérico mantém F. Nas linhas novas, não numérico vira zero (`I14`). Há validação de inteiro não negativo no XML, mas fórmulas não invalidam por si só toda a proposta. O portal deve preservar seu tratamento explícito de entradas inválidas, não converter erros em zero.
- Vínculos/nível superior são resolvidos por nome (`AH8`, `AI8` com MATCH na primeira correspondência). A nova referência não resolveu as ambiguidades de unidades homônimas; manter IDs e pendências explícitas no portal. Renomeação da unidade superior também não deve quebrar a relação por depender do nome antigo na coluna B.
- A aba Regras do regime traz faixas de denominação, categorias, áreas do Anexo VIII e contagem de subordinadas. São regras propostas pela referência; não houve nova pesquisa jurídica nesta tarefa. `Instruções!B14` afirma que a contagem mínima não está automatizada, mas há fórmulas AQ/AR/AS/AN e o caso R04 que a exercita: texto e lógica precisam ser conciliados.
- No estado salvo há **três ATENÇÕES e cinco BLOQUEIOS**. A reconferência somente leitura, por openpyxl e XML, localizou os bloqueios em `Reestruturação!N1301`, `N1306`, `N1311`, `N1316` e `N1321`. São cinco áreas reservadas a novas unidades: A/B estão vazias, C contém “+ NOVA UNIDADE”, os quatro campos de código D e de quantidade L abaixo de cada cabeçalho estão vazios, e I soma zero. Q referencia A vazia e guarda cache 0; N testa Q contra texto vazio e guarda “BLOQUEIO”, com M indicando ausência de cargo ativo. O cache precisa ser conciliado com o resultado declarado em T00 (“nenhum BLOQUEIO”); não identifica a configuração nem o momento da execução relatada. Não houve recálculo em aplicativo de planilhas e não se infere qualquer intenção ou falsidade na declaração. No portal, uma área ainda não utilizada não deve ser tratada como unidade criada sem cargos.
- Nenhuma célula de erro do Excel foi encontrada nos valores salvos. Isso é uma inspeção de cache, não uma suíte executada. Não há comentários, hyperlinks estruturados, nomes definidos, macros nem partes de vínculos externos; a URL ALESP está em texto na aba Instruções. Referências a LC 1.395, Decretos 68.742/69.286, Resolução42 e remuneração constam do arquivo, sem nova validação nesta tarefa.

## Casos e verificações registrados

`Simulações realizadas!A6:N21` contém **16 casos da SGGD e 276 verificações internas declaradas como aprovadas (276/276)**, em registros estáticos, sem fórmulas nessa aba. São 12 casos T00–T11 e quatro R01–R04, incluindo retirada/inclusão, criação/transferência/renomeação, quantidades, cenário combinado, enquadramento, teto, nível mínimo e subordinadas.

Casos e verificações são medidas diferentes. A descrição de **16 casos × 20 órgãos = 320 execuções de casos** é aritmeticamente compatível com **276 verificações por órgão × 20 = 5.520 verificações**, se o mesmo conjunto de verificações for aplicado a cada órgão. Portanto, 276 e 320 **não representam uma divergência**. Este arquivo da SGGD não contém os registros de execução dos outros 19 órgãos; a presente inspeção não executou esses testes. Esta distinção corrige a comparação inadequada da versão anterior desta nota.

Os números registrados ajudam a definir casos de aceite. Não são testes executados por esta revisão e não comprovam que todas as condições declaradas foram verificadas. A preservação da base, a execução no portal e a revisão das regras são verificações distintas. Para fechar a entrega local, reaproveitar a base reconciliada e os casos úteis, mantendo o III existente, os IDs documentais, os rascunhos inválidos explícitos e a validação técnica das regras.
