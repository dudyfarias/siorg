# Conferência dos arquivos baixados pela interface — 22/10/2026

Resultado: os arquivos baixados correspondem à mesma proposta de teste. A comparação integral encontrou **408 linhas e 502 cargos/funções**, com os mesmos quatro campos e a mesma ordem no PDF e na aba Anexo II do XLSX. Não houve alteração, reexportação ou autoria dos arquivos nesta conferência.

## Arquivos e método

- Originais: `~/Downloads/SGGD-proposta-2026-10-22.xlsx` e `~/Downloads/SGGD-Anexo-II-proposta-2026-10-22.pdf`.
- Cópias idênticas preservadas nesta pasta; SHA-256 conferido entre origem e cópia. Valores, hashes e resultados estão em `verificacao-arquivos.json`.
- XLSX: importação e renderização somente leitura com `@oai/artifact-tool` do runtime bundled. Conferência independente de células com openpyxl em leitura, XML OOXML e ExcelJS 4.4.0. Não executado no Excel nativo; o arquivo contém valores calculados, sem fórmulas.
- PDF: extração de tabelas nas 16 páginas com pdfplumber; imagens geradas com pdftoppm. Todas as linhas extraídas foram comparadas à aba Anexo II, com normalização apenas de espaços/quebras de linha.
- Marcadores de criação não foram repetidos. Nenhum código da aplicação foi alterado.

## Conferência de valores

| Medida | Limite III | Alocado II | Proposta | Variação | Saldo proposto |
| --- | ---: | ---: | ---: | ---: | ---: |
| Quantidade CCESP | 298 | 299 | 301 | +2 | -3 |
| Cotas CCESP | 1.066,00 | 1.069,50 | 1.081,50 | +12,00 | -15,50 |
| Quantidade FCESP | 201 | 201 | 201 | 0 | 0 |
| Cotas FCESP | 349,35 | 348,75 | 348,75 | 0 | +0,60 |

Confirmado em `Calculadora!C9:H12` e por soma independente das 408 posições detalhadas. Os saldos das espécies permanecem separados.

Alterações da proposta:

1. `Reestruturação!G11:H11`: Assessor Especial III da Secretaria Executiva, 2 → 3; cotas 12 → 18. `Resumo!9` descreve a variação. O PDF e `Anexo II!11` mostram quantidade 3.
2. Diretoria de Teste — QA criada sob Secretaria Executiva, com Diretor CCESP 1.15 e quantidade 1. `Resumo!11:12` separa criação da unidade e inclusão do cargo. `Anexo II!14` contém a nova linha.
3. Divisão de Formação e Treinamento transferida de Coordenadoria de Difusão de Acervos para Diretoria de Teste — QA. `Resumo!10` conserva os vínculos antes/depois; o cargo FCESP 1.10 e a quantidade 1 permanecem. `Anexo II!15` está depois da nova diretoria.

O XLSX tem as quatro abas esperadas, cabeçalhos explícitos de exportação da proposta, fontes públicas e avisos de validação técnica. As quatro abas estão protegidas para consulta. A conferência não constitui homologação normativa nem prova de vigência da base.

## Inspeção visual

Imagens efetivamente vistas:

- `xlsx-reestruturacao.png`: A1:K15.
- `xlsx-calculadora.png`: A1:H15.
- `xlsx-resumo.png`: A1:O15.
- `xlsx-anexo-ii.png`: A1:D15.
- `pdf-first.png` e `pdf-last.png`: páginas 1 e 16 em resolução ampliada.
- `pdf-contact-sheet.png`: visão conjunta das 16 páginas, apoiada por `pdf-page-01.png` a `pdf-page-16.png`.

Não foram observados cortes materiais, sobreposição de tabelas ou desaparecimento de dados nas regiões inspecionadas. PDF com quatro colunas, títulos e cabeçalho repetidos, rodapés e numeração 1–16. A página final contém 13 linhas e espaço livre abaixo, sem perda do encerramento. No XLSX, Reestruturação e Resumo são tabelas largas e exigem navegação horizontal; a prévia não equivale à impressão pelo Excel. O renderizador apresenta separadores numéricos em padrão internacional, mantendo os valores numéricos e o formato Excel invariável.

### Limitação identificada no importador de prévia

O render artifact-tool da aba Resumo mostra `305` em algumas células textuais vazias, por exemplo A11, C11, F10, G10 e H10. **Esse número não é conteúdo textual dessas células no XLSX.** O XML original contém célula `t="s"` com `<v>305</v>`, que referencia a entrada 305 de `xl/sharedStrings.xml`: `<si><t/></si>`, uma string vazia. Openpyxl e ExcelJS 4.4.0 reabertos diretamente no arquivo retornam `""` nesses endereços. A evidência distingue, portanto, uma falha de resolução de string vazia na importação/renderização de um erro no arquivo. Não foi feita correção nem reautoria para contornar a prévia.

## Estado da entrega

Conferência concluída para os arquivos efetivamente baixados. Nenhuma divergência material de conteúdo identificada entre XLSX, PDF e cenário esperado. A anomalia visual do importador está documentada acima; o comportamento no Excel nativo não foi testado nesta etapa.
