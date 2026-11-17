# SGGD- TESTE.xlsx — inspeção somente leitura

Consulta em 24/09/2026. Arquivo recebido como referência da chefia, com bases e regras ainda sob revisão técnica. Nenhuma alteração da planilha, aplicativo ou perfis; nenhum dado foi publicado. Extração com openpyxl, comparação de fórmulas e valores salvos e cálculo independente em decimal exato. Não houve recálculo no Excel/LibreOffice nem auditoria jurídica nova.

## O que aproveitar nesta entrega

É um **modelo combinado de calculadora e distribuição**, em uma única aba `SGGD`. Para fechar apenas a calculadora, aproveitar concretamente o bloco A4:M56: base, proposta e comparação de **quantidade/cotas por CCESP e FCESP**, com proposta completa editável por código. A distribuição (A58:F75 e O4:S50) fica fora desta entrega.

**A proposta F12:F56 e a base E12:E56 coincidem integralmente com os 45 códigos de quantidade não zero do Anexo III do Decreto 70.755/2026.** Os coeficientes D12:D56 também coincidem, sem divergências. Há apenas a apresentação de “CCESP NES” como “CCESP 1.18”, normalização já documentada pelo código presente no Anexo II.

| Espécie | Quantidade calculada | Cotas calculadas | Fonte na planilha |
|---|---:|---:|---|
| CCESP | 298 | 1.066,00 | B12:F36; produtos J12:K36 |
| FCESP | 201 | 349,35 | B37:F56; produtos J37:K56 |
| Total | 499 | 1.415,35 | Soma independente das linhas acima |

A identidade código/quantidade/coeficiente foi cotejada com a extração oficial preservada em `evidence/orgaos-2026-09-24/sggd-70755-quadros.json`, anteriormente conferida no DOE. Fonte: [Decreto 70.755/2026, Anexo III, PDF pp. 39–40/40](https://www.doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002), também disponível na [ALESP](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70755-14.07.2026.html). O art. 1º substitui os Anexos I–III do Decreto 69.052/2024; os Anexos II–III têm efeitos desde 01/08/2026.

## Separação proposta para o aplicativo

**É coerente com a calculadora da planilha usar o Anexo III como referência documental de “Toda a secretaria”.** Os recortes de unidade podem continuar com o Anexo II, identificados como outra origem. Isso exige alterar explicitamente os rótulos, metadados, referência preenchida e texto exportado, sem chamar o novo valor de teto validado nem esconder a divergência entre os anexos.

O atual quadro do Anexo II soma CCESP **299/1.069,50** e FCESP **201/348,75**, diferentes do resumo III. A composição completa III não é a soma reconciliada dos recortes II. Portanto, permanecer bloqueado o cálculo de impacto total da SGGD que subtrairia uma unidade do Anexo II de um total do Anexo III. Trocar uma referência com edições deve exigir confirmação. A escolha documental não significa resolver administrativamente o conflito.

Rótulos úteis: **Base do Anexo III**, **Proposta**, **Diferença**, quatro medidas por espécie, **Acima/igual/abaixo da referência**. “Limite”, “Enquadrada” ou “Fora do limite” dependem da confirmação técnica solicitada. A planilha esclarece a intenção do produto; não certifica os parâmetros por si.

## Dependências e problemas a não reproduzir

1. **Resumo da proposta fixo.** D4 significa “Quantidade proposta” e H4 “Cotas propostas”. D5:D7 são constantes 298/201/499; H5:H7 são constantes 1.066,00/349,35/1.415,35. Os campos de base C5:C7/G5:G7 e de limite B5:B7/F5:F7 também são constantes. As fórmulas de E5:E7, I5:I7 e J5:J7 leem esse topo, sem dependência do detalhe F12:F56. A instrução de A8 promete atualização automática que essa ligação não sustenta. Exemplo sem editar o arquivo: F16 de 21 para 22 elevaria a proposta CCESP a **299/1.072,00**, mas D5/H5 e o status J5 continuariam fixados nos números anteriores. No aplicativo, derivar todo resumo diretamente da proposta.
2. **Status agregado pode esconder diferença entre espécies.** J7 testa apenas totais gerais, independentemente dos estados J5/J6. O resultado geral não deve permitir compensar CCESP e FCESP. Manter os quatro controles separados, sem emitir conformidade administrativa.
3. **Distribuição contém referências independentes e incompletas.** C66:C72 e E66:E72 são valores fixos por sete blocos; D66:D72/F66:F72 são listas textuais de códigos/quantidades. Somam **284 CCESP + 188 FCESP = 472**, com cotas independentes de **1.023,25 + 329,70 = 1.352,95**. Não são fórmulas ligadas a alocações editáveis. O resumo de distribuição B60:B62 depende do topo fixo D5:D7.
4. **Conferência de códigos omite CCESP 2.16.** O6:O50 inclui FCESP 2.14 (ausente na composição III por ter quantidade zero), mas não inclui CCESP 2.16, que tem 1 posto em B15/F15 e na lista do Gabinete D66. Por isso Q6:Q50 soma **283 CCESP + 188 FCESP = 471**, um posto a menos que os blocos. R50=-1 sinaliza FCESP 2.14 alocada sem quantidade na proposta. As diferenças não podem ser corrigidas silenciosamente.
5. **Validação e cores não são garantias funcionais.** A validação F12:F56 não define tipo, embora contenha operador e mínimo zero; não comprova restrição efetiva a inteiros não negativos. Há formatação condicional apontando E278:E280 e J290:J350, áreas sem conteúdo, e referências que não correspondem aos status exibidos. Não reutilizar essas regras como validação do aplicativo.

## Estrutura e fontes internas

- Uma aba visível, `SGGD`, com 945 células preenchidas e 479 fórmulas. Conteúdo efetivo A1:S75; dimensão de formatação A1:S359.
- Títulos: A1 “Simulador de cargos e cotas — SGGD”; A2 cita o Decreto 70.755 de 14/07/2026. A10 identifica calculadora; A58 distribuição; A64 estrutura por bloco; O4 conferência código a código.
- Fórmulas principais: G12:G56 identifica manutenção/redução/aumento; H:I separa saídas/entradas; J/K multiplica peso pela quantidade; L/M calcula proposta menos base. P6:P50 usa SUMIF sobre os códigos e quantidades propostos; Q é fixo; R=P−Q; S descreve o resultado.
- Sem comentários, hyperlinks, URLs em células, conexões externas, nomes definidos, macros ou objetos de desenho detectados. Há citação textual ao decreto, sem link. Não foram retidos autores ou metadados pessoais.
- Coluna C traz valores monetários sob “Subsídio (R$)”. Essa remuneração não é necessária ao cálculo de cotas e não foi recertificada nesta inspeção.

O JSON de mesmo nome contém células, fórmulas e valores salvos, extrações estruturadas e conferências independentes. Hash SHA-256 do arquivo foi conferido antes/depois e permaneceu igual. Resultado limitado à referência recebida; não é homologação da ferramenta nem autorização de publicação.
