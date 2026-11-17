# Importação estrutural da SGGD

19/10/2026. Base importada de `sources/preparacao-2026-10-19/SGGD- TESTE1.xlsx`, aba Reestruturação. O arquivo original foi aberto somente para leitura. O importador não recalcula fórmulas nem lê campos de proposta como referência vigente.

## Resultado

- 407 registros de cargos/funções, distribuídos em 221 unidades identificadas separadamente.
- Alocação do Anexo II: CCESP 299 postos / 1.069,50 cotas; FCESP 201 / 348,75. Total descritivo de 500 postos / 1.418,25 cotas.
- Limites do Anexo III, preservados na referência existente: CCESP 298 / 1.066,00; FCESP 201 / 349,35. Total descritivo de 499 / 1.415,35.
- Saldo inicial separado: CCESP −1 posto / −3,50 cotas; FCESP 0 / +0,60. A importação não altera números para conciliar os anexos.
- O consolidado amplo declara 495 alocados na SGGD, diferença de −5 em relação à base importada (−1 CCESP e −4 FCESP). Foi mantido como evidência de divergência, sem substituir o TESTE1.

## Critério de importação e conferência

Foram admitidas somente linhas com quantidade vigente positiva fixa na coluna F, código completo literal na coluna D, denominação na coluna C e ação Manter. As áreas de criação, ações de simulação, quantidade proposta, fórmulas e valores mensais não integram a base importada.

Cada um dos 407 registros foi cotejado, em ordem, com `evidence/orgaos-2026-09-24/sggd-70755-cotejo-doe.json`: unidade, denominação, código e quantidade. A comparação permite somente normalização de Unicode, caixa e espaços; o texto exibido permanece o do TESTE1. Não houve diferença de conteúdo nesses campos. Essa conferência compara com a extração documental de 24/09, sem afirmar vigência legal revalidada em 19/10.

IDs de posição usam a linha original do Anexo II na extração documental. IDs de unidade usam sua primeira posição documental. Assim, nomes repetidos ou mudanças de apresentação/linha no Excel não identificam nem fundem unidades distintas. As unidades são editadas por seus postos diretos; os recortes inclusivos antigos não foram somados.

## Vínculos

O nome da unidade superior vem explicitamente da coluna B do TESTE1. `parentUnitId` é preenchido apenas quando esse nome corresponde univocamente a uma unidade importada. Todos esses vínculos continuam marcados como provenientes do modelo, em validação técnica.

O Gabinete do Secretário e a Secretaria são identificadores de agrupamento no modelo e não foram criados como unidades com cargos fictícios. As unidades que os indicam preservam `parentName` e têm `parentUnitId` nulo.

Três unidades indicam “Divisão de Gestão Documental”, nome presente duas vezes. Seus vínculos ficam explicitamente ambíguos, sem escolher o pai pela proximidade na planilha:

- Seção de Normas Técnicas, linha 825.
- Seção de Assistência ao SAESP, linha 828.
- Seção de Monitoria e Fiscalização, linha 831.

Esse ponto não afeta o cálculo nem a edição por unidade direta desta primeira entrega; impede tratar a hierarquia completa como homologada.

## Arquivos e verificação

- Dados imutáveis: `src/data/sggd-structure.mjs`, exportação `sggdStructure`.
- Importador reproduzível: `scripts/import-sggd-structure.py`, executado com o Python do bundle 26.1017.11052.
- Registro de SHA-256 da fonte e da saída, diferenças e reconciliação: `importacao-estrutura-sggd.json`. Os metadados do módulo também preservam os hashes das fontes recebidas e da extração documental.
- Seis testes em `tests/sggd-structure.test.mjs` passaram: correspondência documental completa, igualdade com a base agrupada atual e o motor, partição por unidades diretas, separação II/III/consolidado, vínculos não inferidos e imutabilidade/proveniência por hash.

Nenhuma alteração foi feita em App.jsx, estilos, package.json, motor da calculadora ou fontes XLSX. Esta importação não fornece parâmetros financeiros atualizados nem aprovação técnica das regras.
