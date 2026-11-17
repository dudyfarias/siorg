# SIORG — fontes e regras para delimitar uma calculadora de cargos e cotas

Pesquisa em fontes primárias estaduais realizada em 14/09/2026. Registro de trabalho para retomada; não é parecer jurídico, catálogo homologado nem especificação aprovada. Nenhuma interface foi implementada ou publicada.

**Retomada em 14/09/2026:** após a pausa solicitada pelo usuário, foi recebido e examinado em modo somente leitura o arquivo `/Users/eduardofariascappia/Downloads/Calculadora de Cotas - vs abril_2026.xlsx`. A conferência por célula está em `matriz-valores-norma.md` e `matriz-valores-norma.csv`. Esta frente verificou constantes e significado normativo; a auditoria funcional das fórmulas é uma frente independente.

## Resultado que já pode orientar a retomada

O arquivo recebido define a prioridade do MVP: comparar situação atual e proposta. O núcleo aritmético multiplica quantidades inteiras por valores unitários, apresentando quatro saídas: quantidade de CCESP, quantidade de FCESP, cotas de CCESP e cotas de FCESP. A variação é proposta menos atual. Comparação com limite informado seria uma capacidade futura opcional, dependente de fonte e escopo próprios. Um resultado aritmético não autoriza recomposição, provimento ou alteração da estrutura.

Quantidade de cargos/funções e montante de cotas são dimensões diferentes. CCESP e FCESP têm controles separados. Embora os valores possam aparecer somados em um total de referência, isso não torna seus limites intercambiáveis. Também devem permanecer distintos: tabela de coeficientes, quantitativo global criado, distribuição por órgão/entidade e disponibilidade administrativa atual.

O painel de transparência não foi revalidado no navegador nesta tarefa. As consultas web ao canal retornaram 403; não houve integração nem obtenção de saldo oficial. Portanto, os limites e a disponibilidade atual de cada órgão permanecem pendentes de fonte apropriada e validação da área responsável.

## 1. Base legal e definições

### Lei Complementar nº 1.395, de 22/12/2023

[Texto compilado na ALESP](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/compilacao-lei.complementar-1395-22.12.2023.html).

- Arts. 1º–2º: QGCFC da administração direta e autarquias; art. 28 exclui universidades públicas estaduais.
- Art. 3º, III: valor unitário vinculado à referência CCESP-1; IV define cota como “montante resultante da soma dos valores-unitários de um grupo de cargos em comissão ou de funções de confiança”; V define recomposição.
- Art. 4º, § 2º: Anexos III e IV discriminam os grupos.
- Art. 5º: recomposição sujeita a condições, vacância, ato competente e ausência de aumento de despesa; §§ 2º–3º trazem particularidades.
- Art. 6º: impede conversão/recomposição entre CCESP e FCESP.
- Arts. 7º–8º: elegibilidade e participação mínima de servidores de carreira nos cargos providos. O percentual não deve ser aplicado automaticamente ao desenho de cargos vagos.
- Arts. 11–12: regimes e opções remuneratórias impedem equiparar cotas à folha efetiva.
- Arts. 17–18 e 23: distribuição, demonstrativos e adequação fiscal/financeira; a soma de cotas é somente parte da análise.

### Decreto nº 68.742, de 05/08/2024

[Texto original na ALESP](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-68742-05.08.2024.html) e [registro de alterações](https://www.al.sp.gov.br/norma/209802).

- Arts. 6º–8º e 16–18: hierarquia, categorias, nomenclaturas e condições de enquadramento. Parte das tabelas foi alterada posteriormente.
- Art. 7º: comando recebe categoria 1; assessoramento, categoria 2.
- Art. 19, VI/Anexo VI: demonstrativo em valores unitários, com subtotais por grupo.
- Arts. 20–23: classificação e instrução/aprovação das propostas; aritmética não substitui o processo administrativo.
- Art. 24: retorno de unidades e décimos excedentes ao QGCFC. Isso não estabelece uma regra geral para arredondar todos os coeficientes a uma casa decimal.
- Art. 26/Anexo VII: distribuição por órgão/entidade, com quantidade e cotas separadas para CCESP e FCESP; alteração exige justificativa e avaliações competentes.
- Arts. 29–32: órgão central, unidades setoriais e registro das estruturas.

**Cuidado de versão:** a página do decreto é o texto original, não uma consolidação integral. Não usar diretamente o Anexo VII de 2024 como limite atual.

## 2. Valores unitários lidos e conferidos

O **Anexo I** da LC 1.395 apresenta diretamente os valores individuais em reais e os coeficientes por nível, inclusive FCESP de natureza especial/nível 18. Ele foi inspecionado visualmente após o recebimento da planilha: [imagem oficial do Anexo I](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/2024010810054623840.png), cópia local `lc1395-anexo1-valores.png`.

Os Anexos III e IV apresentam quantidade e total de valores unitários. Na pesquisa inicial, seus coeficientes haviam sido derivados por divisão. A conferência posterior com o Anexo I confirma os valores individuais e resolve a lacuna sobre FCESP NES: a ausência de uma linha NES no quantitativo inicial do Anexo IV não significa inexistência do coeficiente no Anexo I.

As duas imagens oficiais foram baixadas e inspecionadas visualmente:

- [Anexo III — CCESP](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/2024010810092007345.png). Cópia local: `lc1395-anexo3-ccesp.png`.
- [Anexo IV — FCESP](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/2024010810094888841.png). Cópia local: `lc1395-anexo4-fcesp.png`.

| Nível | CCESP: valor por cargo | FCESP: valor por função |
|---|---:|---:|
| 1 | 1,00 | 0,60 |
| 2 | 1,25 | 0,75 |
| 3 | 1,50 | 0,90 |
| 4 | 1,75 | 1,05 |
| 5 | 2,00 | 1,20 |
| 6 | 2,25 | 1,35 |
| 7 | 2,50 | 1,50 |
| 8 | 2,75 | 1,65 |
| 9 | 3,00 | 1,80 |
| 10 | 3,25 | 1,95 |
| 11 | 3,50 | 2,10 |
| 12 | 4,00 | 2,40 |
| 13 | 4,50 | 2,70 |
| 14 | 5,50 | 3,30 |
| 15 | 6,00 | 3,60 |
| 16 | 7,00 | 4,20 |
| 17 | 8,00 | 4,80 |
| 18 / NES | 9,00 | 5,40 |

**Estado desta tabela:** os 36 coeficientes da planilha conferem com o Anexo I consultado. Isso valida essa correspondência, sem homologar a ferramenta inteira ou autorizar qualquer cargo/função em qualquer estrutura. Não gerar coeficientes por progressão. O FCESP NES/18 de 5,40 tem previsão expressa; sua utilização numa proposta concreta depende do enquadramento e do ato organizacional aplicável. A codificação e a nomenclatura permitidas precisam de catálogo próprio e versão vigente.

Atos de 2026 mostram diretamente valores individuais e corroboram parcelas da tabela:

- [Decreto nº 70.751, de 03/07/2026](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70751-03.07.2026.html), Anexo II: CCESP 1.08 = 2,75; CCESP 2.10 = 3,25; FCESP 1.10 = 1,95; FCESP 2.08 = 1,65. O art. 3º altera a distribuição do CEETEPS no Anexo VII do Decreto 68.742; art. 6º dispõe sobre vigência.
- [Decreto nº 70.648, de 28/05/2026](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70648-28.05.2026.html), Anexo III: FCESP 1.04 = 1,05; FCESP 2.02 = 0,75. O art. 4º altera a distribuição do HCFMRP; art. 11 contém cláusula específica de vigência. O art. 8º ilustra condições remuneratórias particulares que ficam fora da multiplicação de cotas.

A presença de centésimos é observável. Não foi localizada regra geral de arredondamento que autorize eliminar essa precisão. Para uma implementação futura, a representação decimal exata é uma recomendação técnica; a política de apresentação e qualquer arredondamento devem ser reconciliados com a referência da equipe.

## 3. Alterações e limites por órgão

O [registro da ALESP para o Decreto 68.742](https://www.al.sp.gov.br/norma/209802) lista vários atos alteradores, inclusive de 2026. A pesquisa encontrou, entre outros, os Decretos 70.751/2026 e 70.648/2026 acima. Isso basta para afastar o uso indiscriminado da distribuição original; não prova que esses sejam os últimos atos aplicáveis a todos os órgãos.

[Decreto nº 69.286, de 30/12/2024](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-69286-30.12.2024.html): art. 1º, V, substitui tabelas do Anexo III do Decreto 68.742; também modifica dispositivos de instrução/vigência. Art. 2º, III, inclui possibilidade de nomenclaturas excepcionais mediante avaliação competente. Consequência: nomes e níveis de guias antigos não devem alimentar automaticamente o catálogo.

Há alterações posteriores dos quantitativos globais de FCESP, que também impedem tratar o quantitativo inicial como fotografia atual:

- [LC nº 1.426, de 17/06/2025](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2025/lei.complementar-1426-17.06.2025.html), art. 19/Anexo V: acresce quantitativos ao Anexo IV da LC 1.395.
- [LC nº 1.435, de 31/10/2025](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2025/lei.complementar-1435-31.10.2025.html), art. 18/Anexo III: novo acréscimo ao mesmo anexo.

Essas adições de funções não são, por si, alteração dos coeficientes de cada nível. Tampouco um total global equivale à dotação de um órgão ou ao que esteja disponível para uma nova proposta.

Para qualquer comparação por órgão, é necessário identificar: ato de distribuição aplicável, alterações posteriores, data de efeito, grupo, quantidade e cotas; e esclarecer se o número informado representa o limite total ou uma parcela disponível já apurada pela área. Ocupação, reservas e compromissos não foram obtidos nesta pesquisa.

## 4. Orientações oficiais e governança

### Comunicado SIORG nº 02/2024

[Documento oficial](https://admin.sggd.sp.gov.br/dx/api/dam/v1/collections/29f0dc6c-b53c-4950-860f-296588adb1e2/items/d06346e5-3152-480c-a23d-9d7c7a0b9fa0/renditions/363f4db0-103c-45f0-9ff7-30fe85d77ff8?binary=true).

Orienta limites de cotas e de quantitativos do Anexo VII, com tratamento excepcional e justificado de acréscimos/recomposição de quantitativos. Menciona 10% e consideração de secretarias com suas vinculadas. O texto recuperado contém referência numérica aparentemente equivocada a “68.724”, embora o contexto seja a regulamentação examinada.

**Não converter o comunicado em fator automático 1,10.** A base de incidência, eventual agregação, cálculo de quantidades inteiras, aplicabilidade atual e necessidade de aprovação devem ser confirmados pela DMO. Esse ponto é uma pendência interpretativa e operacional, não permissão pronta para cálculo.

### Resolução SGGD nº 42/2025

[Publicação no canal oficial SGGD](https://www.sggd.sp.gov.br/sgp/Publica%C3%A7%C3%B5es/comunicados/resolucoo%2B42-2025).

Texto recuperado pela indexação da página oficial; a abertura direta retornou 403. Convém obter o documento da equipe para arquivo e conferência integral antes de formalizar regras operacionais.

- Art. 7º: atuação da DMO e unidades vinculadas em apoio à Subsecretaria de Gestão.
- Arts. 8º–10: gestão do quadro baseada nos atos oficiais e correspondência dos registros com as estruturas; alteração no sistema depende de aprovação formal competente.
- Arts. 13–14: distinguem nova classificação e realocação, com condições de preservação da estrutura, dos quantitativos e das cotas.

Essas distinções impedem um comando genérico de “recompor” baseado somente no resultado da soma. A natureza da operação e seus requisitos devem ser validados pela área competente.

### Guias e canais SIORG

- [Guia encontrado no repositório oficial](https://admin.sggd.sp.gov.br/dx/api/dam/v1/collections/29f0dc6c-b53c-4950-860f-296588adb1e2/items/e8b645bd-1fd6-4694-a484-18a4f49126cd/renditions/6b0b5c37-6a6f-4c1e-a144-579629de2eb3?binary=true): FAQ, questão 4, aponta cotas por CCESP/FCESP e distribuição no Anexo VII.
- [Outra versão de guia](https://admin.sggd.sp.gov.br/dx/api/dam/v1/collections/29f0dc6c-b53c-4950-860f-296588adb1e2/items/d5f48175-a638-4faa-b50e-1a8e754c15de/renditions/8d01b1f1-2f2b-4bb8-85d4-a5dafa4a0778?binary=true): exemplos de quantidade × valor unitário. Há nomenclatura anterior a alterações posteriores; não presumir que seja a versão vigente.
- [FAQ](https://www.siorg.sp.gov.br/siorg/Canais%20de%20comunica%C3%A7%C3%A3o/perguntas%20frequentes%20-%20faq), [material instrucional](https://www.siorg.sp.gov.br/siorg/produtos/materail%20Instrucional) e [transparência](https://www.siorg.sp.gov.br/siorg/transparencia): acesso web direto indisponível nesta pesquisa, com resposta 403. Não atribuir esse retorno ao funcionamento para todos os usuários.

## 5. Hipótese de núcleo do MVP, a reconciliar com a referência

As expressões abaixo são uma proposta aritmética, não código nem automação de requisitos jurídicos:

- Quantidade do grupo = soma das quantidades das linhas daquele grupo.
- Cotas do grupo = soma de (quantidade da linha × valor unitário validado da linha).
- Comparação entre cenários = resultado proposto − resultado inicial, usando tabela e escopo compatíveis.

Essas são as saídas prioritárias, correspondentes à finalidade da referência recebida. Uma capacidade futura e opcional seria: diferença em relação ao limite informado = limite informado do grupo − cotas calculadas para o mesmo escopo. Ela tem sentido diferente da variação proposta menos atual e não deve substituir ou confundir o cálculo existente.

Exibir quantidades e cotas separadas para CCESP e FCESP. Uma sobra em um grupo não compensa ultrapassagem em outro. Um total agregado pode ser descritivo, desde que isso não sugira orçamento intercambiável.

Se o cenário abrange apenas uma parte do órgão, não subtrair sua soma do limite integral e chamar a diferença de disponibilidade. É preciso incluir a estrutura preservada ou receber da área um limite parcial explicitamente destinado àquela simulação. Valor ausente não equivale a zero.

Dados mínimos candidatos: espécie, categoria/código, nível, quantidade; tabela e versão do coeficiente; fonte e período de efeito; identificação do órgão/entidade quando houver comparação; abrangência do cenário; limites de quantidade e de cotas por grupo, quando conhecidos; origem, data e natureza desses limites. Campos adicionais devem partir do arquivo existente, não de suposições sobre a rotina.

Ficam fora da mera soma: autorização de recomposição, verificação de vacância e provimento, elegibilidade de pessoas, percentual sobre cargos providos, regras hierárquicas e exceções, impacto em folha e adequação fiscal, aproveitamento de excedentes e interpretação do limite excepcional do comunicado.

## 6. Pendências que precisam de responsáveis

| Pendência | Fonte/validação adequada |
|---|---|
| Identificar a manutenção e a data de referência da ferramenta | Arquivo recebido e lido; responsável e histórico de versões ainda precisam de confirmação |
| Reconciliar coeficientes, códigos, nomenclaturas e versões | DMO/órgão central SIORG, com base normativa e ferramenta de referência |
| Determinar limite aplicável ao órgão e seu período de efeito | Cadeia dos atos de distribuição e confirmação da área responsável |
| Distinguir limite total, parcela disponível e compromissos existentes | DMO/unidade setorial e fonte administrativa identificada |
| Confirmar tratamento do Comunicado 02/2024 e exceções | DMO e apoio jurídico competente quando necessário |
| Definir quais operações a ferramenta realmente apoia | Equipe usuária e governança SIORG, antes de transformar condições em validações automáticas |
| Calcular eventual custo monetário | Frente específica de gestão de pessoas/financeira, com regras remuneratórias e bases próprias |

**Estado após a retomada:** arquivo recebido e constantes confrontadas. Nenhum saldo oficial, homologação integral, autorização administrativa ou disponibilidade pública da calculadora foi estabelecido.

## 7. Conferência da planilha recebida

O arquivo contém uma aba `Calculadora`, ocupando A1:M21. O nome traz “vs abril_2026”, mas não há nas células um ato normativo ou uma data de vigência da tabela. O nome do arquivo sozinho não comprova atualização normativa em abril. A fonte primária de comparação é o Anexo I da LC 1.395 disponibilizado na compilação da ALESP, cuja página informa última atualização em 10/03/2026. Não foi identificado, nas consultas direcionadas realizadas, ato posterior modificando esses coeficientes ou a tabela monetária do Anexo I. Isso não substitui validação institucional de vigência antes de uso operacional.

### Correspondência e divergência comprovadas

- `E3:E20` (CCESP) e `G3:G20` (FCESP): todos os 36 coeficientes correspondem às 18 linhas do Anexo I.
- `D3:D20`: os 18 valores monetários de CCESP correspondem ao Anexo I.
- `F3:F18` e `F20`: os 17 valores de FCESP correspondem ao Anexo I.
- **`F19`: R$ 14.457,20 no arquivo, versus R$ 14.236,80 para FCESP nível 17 no Anexo I. Diferença: R$ 220,40 a maior na célula informativa.** Não é necessário presumir aumento salarial ou coeficiente incorreto para explicar a divergência: a própria fonte normativa traz o valor esperado. A conta independente 2.966 × 4,80 também produz 14.236,80.
- `G20 = 5,40` e `F20 = 16.016,40`: ambos constam no Anexo I, nível 18/NES. Não apontar esses números como erro ou invenção. Tampouco sua presença na tabela autoriza alocar FCESP NES em toda estrutura.

A correspondência de nível 1–18 foi estabelecida pela ordem e pelo conjunto de constantes do Anexo I. A planilha não apresenta uma coluna numérica explícita de nível: não citar a célula C19 como “nível 17”, pois ela contém “Preencher”.

### Alcance da divergência F19

As fórmulas de cotas examinadas usam coeficientes e quantidades: `J19 = E19*H19` e `K19 = I19*G19`. Os totais `J21` e `K21` somam essas colunas. F19 não aparece como precedente das fórmulas do arquivo; a divergência monetária, portanto, não altera diretamente as cotas calculadas nesta versão. Ela pode induzir a erro se o valor em reais for lido, copiado ou reutilizado. A validação de recálculo e de entradas não foi feita por esta frente.

### Significados que o MVP deve esclarecer

- `F2` chama a coluna FCESP de “Subsídio - R$”. O Anexo I usa “valor - R$” e o art. 12, § 3º, trata da retribuição da função acrescida à remuneração de origem. Sugestão de rótulo: “Valor da FCESP — R$”. Isso evita tratar a coluna como remuneração total da pessoa.
- `B2` recebe uma única base de “Cotas atuais” e `C2` recebe um único total de quantitativos. `L3` e `M3` calculam variações agregadas. São diferenças em relação aos dados informados, não consulta a limite vigente ou saldo oficial.
- Há subtotais distintos de CCESP/FCESP em `H21:K21`, mas faltam bases atuais separadas por espécie para conferir preservação de cada grupo. Não concluir que a planilha converte cargos em funções; o ponto comprovado é que seu resumo agregado, isoladamente, não detecta compensações entre grupos.
- Os blocos `A3:A6` e `A7:A19` seguem a divisão de escolaridade do Anexo I. Isso não esgota requisitos de nomeação ou enquadramento hierárquico.

### Abril de 2026 e pesquisa de setembro de 2026

Os valores centrais já constam da LC 1.395/2023; não dependem de um reajuste identificado em abril de 2026. Atos de maio e julho de 2026 alteram distribuições específicas por órgão e corroboram coeficientes, mas não devem ser usados retroativamente como limite de uma simulação referente a abril. A data do cenário e a vigência do ato de distribuição precisam ser dados explícitos se o produto vier a comparar limites.

A conclusão desta frente é restrita: há base normativa para os coeficientes usados; há uma divergência monetária comprovada em F19; os controles de saldo, limites e autorização administrativa não podem ser inferidos dos totais agregados. A ferramenta inteira não foi homologada.
