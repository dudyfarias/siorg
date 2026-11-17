# Anexo II, resumo e PDF — critérios de aceite de fonte

Conferência independente em 21/10/2026, somente leitura. Escopo: orientar as saídas derivadas do simulador existente; não revalidar vigência, homologar a estrutura nem acrescentar ações estruturais ainda indisponíveis. Nenhum aplicativo ou arquivo recebido foi alterado nesta conferência.

## Evidência utilizada

- `sources/preparacao-2026-10-19/SGGD- TESTE1.xlsx`, lida com openpyxl, sem salvar: Anexo II `A1:D413`; Instruções `A7:C18`; Resumo `A2:L20`, `A251:F253` e `A275:I277`.
- `evidence/preparacao-2026-10-19/orientacoes-simulador-extraidas.json`: parágrafos 23–40, 61–71, 125–147 e 182. O documento define Reestruturação como entrada; Anexo II, calculadora e resumo derivam da mesma proposta.
- `AGENTS.md`, `src/data/sggd-structure.mjs` e `src/structure-proposal.mjs`: limites do incremento, identidade dos registros, validação de entrada e hierarquia pendente. Não houve nova pesquisa jurídica.
- A conferência do cache do Anexo II encontrou **407 linhas de cargos/funções e 221 cabeçalhos de unidade, totalizando 500 postos: 299 CCESP e 201 FCESP**. A área preenchida vai de `A7:D413`, sem quantitativos zero. Isso confirma o estado salvo da fonte, não a execução de suas fórmulas em Excel.

## Forma do Anexo II

1. Preservar o título documental `ANEXO II` e o subtítulo literal de `A2`: **Quadro Demonstrativo dos Cargos em Comissão e das Funções de Confiança da Secretaria de Gestão e Governo Digital**. Identificar como proposta/minuta em contexto separado; não fabricar número, data ou assinatura de decreto.
2. Usar exatamente quatro colunas, nesta ordem e com estes nomes de `A6:D6`: **UNIDADE | QTD | DENOMINAÇÃO CARGO/FUNÇÃO | CCESP/FCESP**.
3. Agrupar os cargos contíguos por identidade de unidade, mantendo a ordem documental. No modelo, `A7` traz SECRETARIA EXECUTIVA e `A8:A11` ficam vazias; os respectivos cargos continuam em `B:D`. Um nome exibido uma vez, célula agrupada ou cabeçalho visual equivalente pode reproduzir esse agrupamento sem criar uma quinta coluna.
4. Manter cada código completo e literal: por exemplo, `CCESP 1.18`, `CCESP 2.16` e `FCESP 2.01`. Não reduzir à espécie/nível, retirar o zero do nível, nem reunir categorias ou denominações distintas só porque têm a mesma cota unitária.
5. Preservar a identidade de unidades homônimas e a associação de cada cargo à sua unidade. Um agrupamento por nome, em vez de ID, é reprovado. Vínculos ambíguos da fonte não podem ser resolvidos pela ordem das linhas ou semelhança de nomes.
6. Exibir toda a estrutura resultante da proposta válida, incluindo cargos mantidos e acrescentados. Não é uma lista apenas das alterações. Retiradas com quantidade explícita zero não aparecem; elas permanecem no resumo comparativo. Não incluir código `0`, linhas de criação vazias, ações, alertas, cotas, subtotais ou observações internas nas quatro colunas.
7. Renomeação deve aparecer em todas as linhas daquela unidade. O nome da unidade superior no resumo deve acompanhar uma renomeação quando o vínculo já é identificado por ID; não deve ser resolvido por busca textual ambígua.
8. Retirar os cargos diretos de uma unidade não equivale a extingui-la nem a retirar seus subordinados. A UI atual não oferece extinção, transferência ou criação de unidades. Não produzir esses eventos por inferência.

## Resumo derivado da proposta

1. Mostrar o que mudou em relação à base fixa: unidade, denominação, código completo, quantidade anterior/proposta e efeito em quantidade/cotas; para renomeação, nome anterior e proposto. As unidades e registros usados são os mesmos do Anexo II e da calculadora.
2. Usar rótulo compatível com o conteúdo implementado, como `Resumo das alterações`. O modelo tem `RESUMO — GABINETE E SUBSECRETARIAS` e detalhamento por unidade; só usar esse título específico se a saída realmente trouxer tal consolidação.
3. `Sem alterações` exige ausência de mudanças efetivas nos registros e nomes, não apenas delta agregado igual a zero. Uma retirada e inclusão que se compensam, inclusive em unidades diferentes, continuam visíveis separadamente. Não chamá-las de transferência automática.
4. Inclusão com quantidade zero não é acréscimo efetivo; inclusão retirada depois não deve permanecer como mudança líquida. Restaurar à base retira a mudança do resumo. O resumo é comparação do estado atual com a base, não uma trilha histórica de cliques.
5. Separar CCESP e FCESP e distinguir quantidade de cotas. Se apresentar totais gerais, não usá-los para esconder extrapolação em uma espécie. A variação da proposta é `proposta − base`; disponibilidade é `limite III − proposta`. São medidas diferentes.
6. Não acrescentar R$ 2.966,00, custo mensal ou folha como resultado validado neste incremento. O modelo menciona valores financeiros, mas sua aplicabilidade permanece pendente no projeto. Também não chamar a proposta de estrutura aprovada ou ocupação atual.

## UI e PDF

1. As saídas são somente leitura. Correções acontecem na Reestruturação, sem manter cópias editáveis concorrentes. Trocar a unidade, buscar, filtrar ou recolher grupos não altera o conteúdo exportado.
2. Entrada vazia, negativa, decimal ou inválida em qualquer unidade mantém a proposta pendente. Não a converter em zero nem omitir silenciosamente o registro para produzir um PDF aparentemente completo. O PDF final deve permanecer indisponível até a correção, com indicação do motivo e da unidade afetada.
3. Exportar a proposta completa, e não o recorte visível. A instrução de conferência de `Anexo II!A4` é orientação da UI; não deve entrar entre as linhas do quadro. Status de simulação, data de geração e fonte podem ficar em identificação separada, preservando as quatro colunas documentais.
4. PDF deve manter textos selecionáveis, acentos, códigos completos e todos os registros; repetir o cabeçalho nas páginas e evitar nome de unidade isolado sem seu primeiro cargo. Em continuação de grupo, repetir o nome ou indicar continuação, sem gerar um cargo adicional.
5. Não cortar títulos, nomes longos, denominações ou a quarta coluna; quebra de linha deve aumentar a altura da linha. Não imprimir botões, menus, filtros, dicas abertas, IDs internos, caminhos locais ou links autenticados do SharePoint.
6. Anexo e resumo exportados devem retratar o mesmo estado da proposta e a mesma versão de base. Se o PDF reúne os dois, separar as seções; o quadro limpo não deve receber colunas de alteração ou impacto.

## Casos mínimos de aceite

| Caso | Resultado verificável |
|---|---|
| Base intacta | 407 registros e 500 postos no Anexo; 299 CCESP/1.069,50 cotas e 201 FCESP/348,75 cotas; nenhuma alteração no resumo. |
| Quantidade 2 → 3 | Mesma linha/unidade/código passa a 3; resumo registra +1 e a cota desse cargo uma única vez. |
| Retirada com zero | Linha deixa o Anexo; resumo conserva a retirada com valores anterior/proposto; demais linhas da unidade e dos subordinados permanecem. |
| Acréscimo em outra unidade | Entra no grupo correto com denominação e código completos do modelo; não aparece apenas no final desassociado da unidade. |
| Retirar e acrescentar valores equivalentes | Delta geral pode ser zero, mas ambos os movimentos permanecem identificados; não aparece `Sem alterações`. |
| Renomear unidade | Quadro e resumo usam o novo nome; resumo registra o anterior; quantidade/cotas permanecem iguais. |
| Unidades homônimas | Mudança em uma identidade não altera nem reúne a outra. |
| Busca/filtro/recolhimento | PDF mantém os registros da proposta inteira, inclusive outras unidades editadas. |
| Entrada inválida fora da seleção | Resultado global e exportação não tratam a proposta como completa; a origem do problema é localizável. |
| Restaurar uma unidade | Remove apenas suas alterações diretas e renomeação; mantém mudanças em outras unidades e subordinadas. |
| PDF multipágina | Contagem dos registros e soma de QTD coincidem com a saída em memória; conferir início, uma quebra no meio de um grupo e última linha. Na base, a última linha é Divisão de Formação e Treinamento / 1 / Chefe de Divisão / FCESP 1.10. |

Estes são critérios de revisão, não declaração de testes executados. A revisão do novo código e a inspeção visual do PDF devem registrar separadamente os resultados efetivos.

## Revisão independente dos módulos — 21/10/2026

Leitura de `proposal-outputs.mjs` e `annex-pdf.mjs` durante sua implementação. Executadas verificações em memória com o Node empacotado, sem editar módulos, salvar PDF ou abrir navegador.

**P2 reproduzido: falta a vinculação para distinguir unidades homônimas no resumo textual.** `deriveChanges` preserva `unitId`, mas retorna apenas nomes, e `buildProposalSummaryText` imprime só esses nomes. Ao aumentar uma linha das Assessorias Técnicas `sggd-unit-ii-56` e `sggd-unit-ii-127`, o texto apresentou dois blocos intitulados somente “Assessoria Técnica”. A primeira pertence à Subsecretaria de Gestão Corporativa; a segunda, à Diretoria Geral de Desenvolvimento e Capacidade Institucional. A fonte prevê vinculação em `Resumo!C20` e `C276`. Incluir contexto de vínculo explícito, resolvendo o nome atual pelo `parentUnitId` quando existente e preservando a indicação documental/pendência nos demais casos. Não houve mistura aritmética: as identidades são mantidas no modelo.

**Observação de fidelidade visual, a confirmar no QA do responsável:** o PDF repete o nome da unidade em cada linha, com borda superior mais forte no início do grupo. O modelo recebido escreve o nome uma vez por bloco (`Anexo II!A7:A11`). Os cargos permanecem contíguos e associados corretamente; se o objetivo é reproduzir a aparência do quadro, usar nome único por grupo e repeti-lo somente na continuação de página, sem fundir unidades homônimas.

Verificações efetivamente aprovadas nesta leitura:

- Base intacta: 407 linhas, 221 unidades, 500 postos, 1.418,25 cotas; resumo sem alterações. PDF gerado em memória com 16 páginas.
- Quantidade vazia na última linha: Anexo vazio/bloqueado e `createAnnexPdf` lança `incomplete_proposal`; não gera quadro parcial.
- Retirada por zero: uma linha a menos no Anexo e uma retirada no resumo.
- Nova linha com zero: nenhum acréscimo efetivo nem linha extra no Anexo.
- Retirada e inclusão equivalentes: delta quantitativo zero, mantendo ambos os eventos no resumo.
- Renomeação: nome atualizado no Anexo e no resumo, sem variação de quantitativos.

A inspeção visual de cortes, legibilidade, continuação dos grupos e paginação permanece com o responsável pelo navegador/renderização. Estas verificações não substituem a validação jurídica da base.


## Fechamento do responsável

P2 de vinculação corrigido em proposal-outputs.mjs e na UI; 17 testes de saída passaram, incluindo três cenários de homonímia/vínculos. A decisão de repetir unidade por linha foi mantida para clareza de paginação, preservando os quatro campos. Inspeção visual de 16 páginas e testes reais de navegador concluídos; ver verificacao.md.
