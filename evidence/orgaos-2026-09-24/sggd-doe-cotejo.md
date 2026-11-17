# SGGD — cotejo entre ALESP e publicação original do DOE

Consulta: 24/09/2026. Escopo: Decreto 70.755, de 14/07/2026, publicado em 15/07/2026. Esta nota documenta a origem da divergência numérica identificada entre os Anexos II e III; não define qual composição deve prevalecer administrativamente.

## Conclusão verificável

A divergência não está restrita à reprodução da ALESP. O conteúdo fornecido pelo serviço público do próprio DOE reproduz as mesmas linhas e quantidades, e o PDF disponibilizado pelo DOE como certificado confirma visualmente um caso inequívoco:

- **Página 31/40, Anexo II:** Diretoria Geral de Desenvolvimento e Capacidade Institucional → Assessoria Técnica → quantidade **1**, Chefe de Assessoria, **FCESP 2.14**.
- **Página 40/40, Anexo III:** código **FCESP 2.14**, valor unitário **3,3**, quantidade **0**, valor total **0**.

As páginas 39–40 do PDF confirmam visualmente os totais publicados no resumo: **298 CCESP / 1.066,00 cotas** e **201 FCESP / 349,35 cotas**, total **499 postos / 1.415,35 cotas**. A verificação visual abrangeu integralmente essas três páginas (31, 39 e 40); não equivale a recertificação visual de todas as linhas do quadro.

A segunda extração independente realizada pelo agente da frente SGGD percorreu 407 linhas numéricas do Anexo II e 69 linhas do resumo. Confirmou os mesmos valores na ALESP e no HTML DOE, sem diferenças entre as duas reproduções. A agregação do quadro detalhado resulta em **299 CCESP / 1.069,50 cotas** e **201 FCESP / 348,75 cotas**, total **500 postos / 1.418,25 cotas**. Esses totais são resultado da soma das linhas, não totais declarados no Anexo II. A extração e os confrontos estão em `sggd-70755-cotejo-doe.json` e `sggd-70755-quadros.json`.

Diferenças de quantidade entre quadro e resumo (quadro / resumo):

| Código | Anexo II agregado | Anexo III publicado |
|---|---:|---:|
| CCESP 1.10 | 36 | 35 |
| CCESP 1.05 | 8 | 7 |
| CCESP 2.10 | 17 | 16 |
| CCESP 2.09 | 14 | 15 |
| CCESP 2.05 | 5 | 6 |
| FCESP 1.14 | 2 | 3 |
| FCESP 1.13 | 14 | 13 |
| FCESP 2.14 | 1 | 0 |
| FCESP 2.13 | 2 | 3 |
| FCESP 2.10 | 9 | 10 |
| FCESP 2.06 | 25 | 24 |

## Fontes primárias e rastreabilidade

1. [Ficha ALESP do Decreto 70.755](https://www.al.sp.gov.br/norma/212838), com link para publicação oficial e sem anotação de retificação na consulta. Ficha preservada em `alesp-70755-registro.json`.
2. [Publicação original no DOE](https://www.doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002). A URL sem o sufixo identificador, fornecida pela ficha, também resolve no serviço do DOE.
3. [Conteúdo público do artigo no serviço utilizado pelo DOE](https://do-api-web-search.doe.sp.gov.br/v2/publications/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026). Resposta preservada em `doe-70755-publicacao.json`; campo `content` preservado sem alteração em `doe-70755-content.html`.
4. [Recurso do DOE para download do PDF certificado](https://do-api-web-search.doe.sp.gov.br/v2/authentication/download/2026.07.14.1.1.8.202.1982002). Resposta pública com PDF em base64; decodificação preservada em `doe-70755-certificado.pdf`, 40 páginas. Metadados em `doe-70755-pdf-metadata.json`.
5. [Reprodução ALESP](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70755-14.07.2026.html).

Identificador do artigo: `c8104920-dd0d-4022-8693-08ded05ee4db`. Código de autenticidade impresso no PDF: `2026.07.14.1.1.8.202.1982002`. A obtenção foi feita por recursos públicos chamados pela própria interface do DOE, sem login e sem mutação externa. O documento foi preservado como recebido; não foi realizada validação criptográfica independente da assinatura.

## Busca por retificações e alterações: alcance e limite

- Ficha ALESP consultada sem anotação de alteração posterior ou retificação do Decreto 70.755.
- Serviço de busca pública do DOE, termo `70.755`, de 15/07/2026 até 24/09/2026, página 1, tamanho 50: **20 itens, 1 página, sem próxima página**. Foram examinados os títulos e trechos retornados; nenhum título de retificação ou novo decreto alterador foi localizado. A resposta inclui o próprio decreto, a Resolução SGGD 33/2026 de detalhamento, atos de pessoal, a Resolução 34/2026, a IN 14/2026 e portarias. A simples citação do decreto por esses atos não é alteração do seu quadro de cotas.
- Consulta igual com termo `70755` (sem ponto): **0 itens**.
- Buscas indexadas por `70.755`/`70755` com `retificação` em DOE/ALESP não retornaram resultado pertinente.

[Consulta pública do DOE utilizada](https://do-api-web-search.doe.sp.gov.br/v2/advanced-search/publications?Terms=70.755&FromDate=2026-07-15&ToDate=2026-09-24&PageNumber=1&PageSize=50). Respostas preservadas em `doe-70755-search.json` e `doe-70755-search-semponto.json`.

**Essas buscas não provam inexistência de retificação.** Uma publicação pode usar outro título, citar apenas a data original, não repetir o número ou ainda não estar corretamente indexada. A formulação segura é: “não foi localizada retificação que reconcilie os anexos nas fontes e buscas consultadas até 24/09/2026”.

## Consequência para a proposta da calculadora

- Pode-se apresentar o **resumo publicado no Anexo III** como referência documental identificada e datada, sem chamá-lo de composição reconciliada ou saldo oficial disponível.
- Não importar silenciosamente o Anexo II como se fechasse com o Anexo III; não corrigir valores por conta própria; não eleger um dos anexos como juridicamente prevalente.
- O perfil SGGD precisa de indicação explícita **“divergência entre anexos — composição pendente de validação”** antes de autopreenchimento institucional confiável.
- Encaminhamento a confirmar com DMO/área responsável: texto consolidado válido, eventual retificação, explicação das 11 diferenças e versão que deve sustentar o perfil. O achado demonstra discrepância documental; não demonstra ilegalidade, impacto financeiro, ocupação efetiva ou excesso em relação a limite administrativo vigente.

## Integridade das cópias

- `doe-70755-publicacao.json`: SHA-256 `9ffa66b192a14c5317eb8251d7f08ffdd53acab9981e4cdd35fa8583c40777bd`.
- `doe-70755-content.html`: SHA-256 `e8d9060ab645501f8c55e07938c9e61c499f41255adc146b2281470ce5d80929`.
- `doe-70755-certificado.pdf`: SHA-256 `0d910a0ec870ad1a8a6d45660747b025c26226c75e3fcab003e7065de2ce1574`.
- `doe-70755-search.json`: SHA-256 `08b186fd9cf93b5b93545ebb646283341f99efa061eae74c215580d8944b257d`.
- `doe-70755-search-semponto.json`: SHA-256 `f8f19025d718f28193875782bad512545c8090ed9ec05f6a6fdb0e4e64733cb9`.
