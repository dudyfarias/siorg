# Linha do tempo SGGD — conferência das fontes

Conferência em **22/10/2026**. Dataset: `src/data/sggd-timeline.mjs`. Extração e metadados: `docs/linha-tempo-sggd-2026-10-22-fontes.json`.

## Recorte e método

O recorte contém os **10 atos recebidos: 6 decretos e 4 resoluções**. A planilha `sources/preparacao-2026-10-19/Levantamento atos reestruturação.xlsx`, em `Base!A79:G88`, repete esse conjunto em `Secretarias!A4:G13`. O HTML correto é `sources/preparacao-2026-10-19/index (1) (1).html`, com dez objetos em `atosData`. Ambos foram lidos sem alterar os originais; os scripts do HTML não foram executados. A leitura da planilha seguiu a skill Spreadsheets, com openpyxl apenas para extração.

O manifesto registra recebimento em 19/10/2026. A conferência normativa pública ocorreu em 22/10, sem nova consulta ao SharePoint por esta frente. Os hashes dos dois arquivos constam no JSON e coincidem com o manifesto recebido. O visual do HTML não foi adotado como projeto da nova interface.

Os decretos foram confrontados com os textos e fichas da ALESP; as dez datas de publicação foram conferidas nos metadados da API pública do Diário Oficial. A API pública foi necessária porque algumas páginas do DOE entregam ao leitor de texto apenas a estrutura de uma aplicação JavaScript. URLs, identificadores, datas e hashes das respostas estão preservados no JSON. Nenhuma data foi deduzida do sufixo numérico de uma URL.

## Datas conferidas e vínculos

`date` e `actDate` representam a **data do ato**, usada na ordenação; `publicationDate` é outro campo. A coluna G do levantamento se chama “Data de Publicação”, mas seus registros e os rótulos do HTML misturam os dois conceitos.

| Ato | Data do ato | Publicação oficial | Fonte recebida | Vínculo e efeito confirmado |
| --- | --- | --- | --- | --- |
| Decreto 69.052/2024 | 14/11/2024 | 14/11/2024, suplementar | Base, linha 79 | Arts. 1º–3º: estrutura, cargos/funções e detalhamento inferior ao nível 14 por resolução. |
| Decreto 69.230/2024 | 23/12/2024 | **26/12/2024** | Linha 80 traz 23/12 | Altera 69.052. Seu Anexo I foi depois expressamente revogado por 69.506. |
| Decreto 69.290/2024 | **31/12/2024** | 01/01/2025 | Linha 81 traz publicação | Classificação financeira e orçamentária; não é nova tabela de cotas. |
| Decreto 69.506/2025 | 30/04/2025 | 30/04/2025, suplementar | Linha 82 | Substitui Anexos I–III de 69.052; arts. 2º–3º também alteram/revogam dispositivos determinados. |
| Resolução SGGD 25/2025 | **16/05/2025** | 19/05/2025 | Linha 83 traz publicação | Detalha a estrutura; preâmbulo cita 69.052 e alterações, inclusive 69.506. Revogada integralmente pela Resolução 33. |
| Resolução SGGD 42/2025 | 08/09/2025 | **09/09/2025** | Linha 84 traz 08/09 | Regra geral de gestão e controle do QGCFC, fundada no art. 30 de 68.742 e na LC 1.395. |
| Decreto 69.873/2025 | 19/09/2025 | **22/09/2025** | Linha 85 traz 19/09 | Altera o art. 2º de 69.290, quanto às unidades de despesa. |
| Decreto 70.755/2026 | **14/07/2026** | 15/07/2026 | Linha 86 traz publicação | Dá nova redação aos Anexos I–III de 69.052. Tipo normalizado de “Decreto SGGD” para “Decreto”. |
| Resolução SGGD 33/2026 | 22/07/2026 | **24/07/2026** | Linha 87 traz 22/07 | Novo detalhamento; preâmbulo cita 70.755 na cadeia de alterações de 69.052. Art. 183 revoga a Resolução 25. |
| Resolução SGGD 39/2026 | 23/09/2026 | **25/09/2026** | Linha 88 traz texto 23/09/26 | Revoga somente o art. 76, XI, e o art. 77, VII, da Resolução 33. |

Todos os dez atos são anteriores à data desta conferência. Não há marco futuro de 2030 neste recorte SGGD.

## Fontes primárias dos dez atos

- **69.052:** [Diário Oficial](https://doe.sp.gov.br/executivo/decretos/decreto-n-69052-de-14-de-novembro-de-2024-20241114118202720092) e [texto ALESP](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-69052-14.11.2024.html).
- **69.230:** [Diário Oficial](https://www.doe.sp.gov.br/executivo/decretos/decreto-n-69230-de-23-de-dezembro-de-2024-20241223118202795458) e [texto ALESP](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-69230-23.12.2024.html).
- **69.290:** [Diário Oficial](https://doe.sp.gov.br/executivo/decretos/decreto-n-69290-de-31-de-dezembro-de-2024-20241231118202802536) e [texto ALESP](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-69290-31.12.2024.html).
- **69.506:** [Diário Oficial](https://doe.sp.gov.br/executivo/decretos/decreto-n-69506-de-30-de-abril-de-2025-202504301182021050800) e [texto ALESP](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-69506-30.04.2025.html).
- **Resolução 25:** [Diário Oficial](https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-25-de-16-05-2025-20250516112812201082990). Cópia oficial também no [e-Sisla](https://esisla.sp.gov.br/eSisla/manuais/Resolucao_SGGD_25_estrutura_SGGD.pdf).
- **Resolução 42:** [Diário Oficial](https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-42-de-08-09-2025-20250908112812201325017).
- **69.873:** [Diário Oficial](https://www.doe.sp.gov.br/executivo/decretos/decreto-n-69873-de-19-de-setembro-de-2025-202509191182021352921) e [texto ALESP](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-69873-19.09.2025.html).
- **70.755:** [Diário Oficial](https://doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002) e [texto ALESP](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70755-14.07.2026.html).
- **Resolução 33:** [Diário Oficial](https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-33-de-22-07-2026-20260723112912201999213).
- **Resolução 39:** [Diário Oficial](https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-39-de-23-09-2026-20260924112912202154847).

## Agrupamento adotado

Os seis decretos formam os blocos principais, em ordem cronológica crescente pela data do ato. A Resolução 25 fica com o Decreto 69.506; as Resoluções 33 e 39 ficam com o Decreto 70.755. O texto de cada resolução explica o vínculo: trata-se de agrupamento editorial para leitura, não de atribuição de hierarquia exclusiva. A Resolução 39 é uma revogação parcial **da Resolução 33**, não do decreto do bloco.

A Resolução 42 fica em `complementaryActs`, sob “Regra geral relacionada”. Ela regula o QGCFC transversalmente; não detalha exclusivamente um dos seis decretos da estrutura da SGGD. As datas próprias de cada ato permanecem visíveis mesmo quando a ordenação ocorre por blocos. Não se criou um vínculo com o Decreto 69.158: a publicação da Resolução 33 cita 69.052, 69.230, 69.506 e 70.755.

## Vigência, revogações e limites de interpretação

- **69.230:** a redação original substituiu os Anexos I e IV de 69.052. O art. 2º, XII, de 69.506 alterou esse dispositivo; o art. 3º, III, revogou especificamente o Anexo I de 69.230, com vigência em 02/05/2025. O rótulo do dataset limita a revogação ao anexo.
- **69.506:** vigência em 02/05/2025, conforme art. 3º. O [Decreto 70.599/2026](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70599-13.05.2026.html), art. 9º, X, revogou especificamente seu art. 2º, V, a, relativo à gestão do BCEP. Isso não significa revogação de toda a estrutura.
- **69.873:** vigência em 22/09/2025. Seu art. 3º também revoga os incisos X–XII do art. 5º de 69.362/2025.
- **Resolução 25:** arts. 147–148 revogam a Resolução 37/2024 e fixam vigência na publicação de 19/05, com efeitos desde 02/05/2025. O art. 183 da Resolução 33 revoga integralmente a Resolução 25. O dataset inclui uma segunda fonte explícita para essa revogação.
- **70.755:** art. 2º fixa vigência geral em 01/08/2026. As exceções são, no Anexo I, art. 1º, VI; art. 2º, I, g; art. 10; art. 46, VIII. Esses dispositivos seguem o primeiro dia do mês subsequente após decorridos trinta dias da publicação. O dataset informa a existência do prazo específico, sem misturar data do ato, publicação e efeitos.
- **Resolução 33:** art. 184 fixa vigência geral em 01/08/2026; arts. 6º–9º seguem o prazo diferido ali previsto. Art. 183 contém a revogação da Resolução 25.
- **Resolução 39:** art. 1º revoga somente dois dispositivos da Resolução 33, relacionados ao Laudo Técnico Específico para aposentadoria especial. Art. 2º fixa vigência na publicação, em 25/09/2026. Não há revogação integral da Resolução 33 por esse ato.
- **Resolução 42:** não se atribuiu uma data de vigência inferida. O prazo de dez dias úteis aparece em uma **minuta do Anexo I**, não em cláusula de vigência da própria resolução. O art. 24 contém regra de transição de trinta dias da publicação. Esse detalhe de pesquisa permanece nesta nota, sem ocupar a interface.

A indicação “Sem revogação expressa” retornada nas fichas dos decretos não foi convertida em selo de “vigente”. Substituir um anexo, revogar um inciso e revogar integralmente um ato são acontecimentos distintos. O dataset não resolve a divergência entre os Anexos II e III de 70.755, já registrada na frente do simulador, nem certifica toda a cadeia normativa.

## Ocorrências fora dos dez marcos e pendências

- A ficha de 69.230 registra [retificação publicada em 10/06/2025](https://doe.sp.gov.br/executivo/decretos/retificacao-do-doesp-de-26-de-dezembro-de-2024-202506091182231135364), relativa ao referendo. Ela foi reconhecida como evidência contextual, sem aumentar silenciosamente o recorte recebido.
- A alteração específica por 70.599 está mencionada no contexto de 69.506, mas não foi introduzida como sétimo bloco. Atos correlatos e histórico anterior exigem uma decisão de ampliação de cobertura.
- Na inspeção do portal SIORG realizada pelo root, um fragmento do título 69.052 apontava para 70.050; os outros links e as fontes normativas identificam 69.052. O dataset usa 69.052 e não introduz 70.050. Evidência visual do root: `evidence/linha-tempo-sggd-2026-10-22/01-portal-referencia.png`.
- Os outros dois pilotos continuam fora deste recorte. A escolha de órgãos/entidades e a validação institucional dos resumos e da cobertura pertencem à área técnica.
- A conferência não autoriza publicação institucional. Nesta frente foram produzidos somente dados e documentação; não houve alteração dos originais, acesso ao CMS ou deploy.

## Verificação técnica do dataset

Importação JavaScript executada com sucesso. Conferidos: seis grupos, três atos relacionados, um ato complementar, dez IDs únicos; datas ISO; datas de publicação iguais ou posteriores às datas dos atos; ausência de atos futuros; ordem cronológica crescente dos decretos; links HTTPS exclusivamente do DOE/ALESP; ausência de URLs internas, caminhos locais e selo de vigência inferida no dataset público. O JSON também registra a comparação das dez datas com a API oficial do DOE.
