# SGGD — preenchimento documental do Anexo II

Consulta e implementação dos dados: **24/09/2026**. Versão do conjunto: `sggd-decreto-70755-2026-08-01-anexo-II`.

A seleção agora fornece a composição publicada no **Anexo II do Decreto 70.755/2026** para estudos de estrutura. O perfil continua `conflict`; a referência tem `nature: published-distribution`, `sourceAnnex: II`, `reconciliationStatus: conflict` e `conflictingAnnex: III`. Essa identificação acompanha os dados, sem transformar a soma em limite oficial reconciliado ou número de pessoas ocupantes.

## Fontes e conferência

- [Decreto 70.755/2026 — publicação original do DOE](https://www.doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002): Anexo II, composição; Anexo III, fatores e resumo conflitante.
- [Decreto 70.755/2026 — reprodução ALESP](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70755-14.07.2026.html): cotejo código a código das 407 linhas distribuídas.
- [Resolução SGGD 33/2026 — original do DOE](https://www.doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-33-de-22-07-2026-20260723112912201999213): art. 1º, III, explicita a árvore completa da Subsecretaria de Gestão, incluindo unidades abaixo do nível 14. O art. 184 fixa efeitos em 01/08/2026 para os recortes utilizados.

O conteúdo bruto do Decreto foi consultado novamente pelo serviço público do DOE e é idêntico ao conteúdo bruto salvo anteriormente. O gerador reabriu a primeira tabela do HTML do DOE e conferiu quantidade, denominação e código das **407 linhas**, além da igualdade dos registros com a extração ALESP. Os registros originais e as posições na tabela estão no mapeamento JSON.

A revisão independente da frente de fontes reconstruiu as **56 linhas do recorte da Subsecretaria** pelo PDF certificado do Decreto (pp. 31–32), cotejou a hierarquia no PDF da Resolução (p. 3) e confirmou as somas abaixo. Veja a nota `revisao-fontes.md` dessa frente nesta pasta.

## Recortes utilizados

| Recorte | Índices de registros numéricos, base zero e extremos inclusivos | Quantidade | Cotas derivadas |
| --- | --- | ---: | ---: |
| Toda a SGGD, administração direta | 0–406 | 500 | 1.418,25 |
| Subsecretaria de Gestão com todas as unidades do art. 1º, III | 103–158 | 66 | 203,75 |
| Diretoria Geral com todas as unidades do art. 1º, III, a | 104–140 | 44 | 128,30 |
| Modernização Organizacional — postos diretos | 111–115 | 7 | 24,70 |
| Inovação em Gestão Pública — postos diretos | 131–132 | 2 | 10,00 |
| Normas e Sistemas de Logística — postos diretos | 141–145 | 5 | 16,40 |

Os intervalos são endereços de registros após a comprovação da hierarquia; a posição na tabela não foi usada como prova de subordinação. A Diretoria Geral inclui Assessoria Técnica, Seção de Apoio Administrativo, Modernização Organizacional e Inovação em Gestão Pública com suas subordinadas. A Subsecretaria acrescenta seu posto direto e Normas e Sistemas de Logística com as três coordenadorias e respectivas divisões, incluindo a Central de Compras. Os três recortes diretos não incluem coordenadorias ou divisões.

Esses recortes se sobrepõem: **não se deve somá-los entre si**. Não há agregação dos quadros das entidades vinculadas à Secretaria.

| Recorte | CCESP — quantidade | CCESP — cotas | FCESP — quantidade | FCESP — cotas |
| --- | ---: | ---: | ---: | ---: |
| Toda a SGGD | 299 | 1.069,50 | 201 | 348,75 |
| Subsecretaria | 43 | 160,25 | 23 | 43,50 |
| Diretoria Geral | 27 | 96,50 | 17 | 31,80 |
| Modernização — diretos | 6 | 22,75 | 1 | 1,95 |
| Inovação — diretos | 2 | 10,00 | 0 | 0,00 |
| Normas/Logística — diretos | 3 | 12,50 | 2 | 3,90 |

## Cálculo, preservação e limites

Cada quantidade foi multiplicada pelo fator de sua espécie e nível em centésimos inteiros, antes de agrupar as linhas por espécie/nível para o motor. Não foram acrescentados fatores específicos da Secretaria. As denominações e os códigos originais permanecem no mapeamento; por exemplo, a posição FCESP 2.14 da Assessoria e o código CCESP 2.12 associado a “Assessor II” na Inteligência não foram corrigidos por inferência.

O resumo do Anexo III publica **499 posições / 1.415,35 cotas**, enquanto o quadro distribuído soma **500 / 1.418,25**. O preenchimento usa expressamente o Anexo II e conserva o conflito; não determina causa, prevalência normativa ou eventual retificação. Uma soma exata não resolve a divergência. A pesquisa não garante a inexistência de retificações posteriores ou não indexadas.

`mapeamento-e-somas.json` contém os índices, cada registro, o número da linha na tabela HTML, as unidades incluídas, os dispositivos de estrutura, os fatores e os subtotais. `build-sggd-references.py` reproduz esse arquivo e `src/data/sggd-reference.mjs` a partir das evidências preservadas. Nenhuma planilha original ou publicação foi modificada.

Os **14 testes de perfis passaram**, incluindo valores literais independentes para os seis recortes SGGD, totais da Educação, bloqueio de Saúde/custom, versões, integridade da origem, cópias isoladas e IDs únicos. A conferência de interface e os testes de resumo/impacto pertencem às frentes responsáveis por esses componentes.
