# Contrato do motor da Calculadora de Cotas — MVP

14/09/2026. Plano para implementação após a confirmação da captura visual e da pasta de trabalho pela coordenação. Este arquivo define comportamento e testes; não implementa a aplicação.

Base: `proposta-conteudo.md` e `auditoria-planilha.md`, na mesma pasta. A planilha original permanece preservada. O motor atende à composição proposta e à variação contra situação atual informada, dentro da página do SIORG. Não consulta limites, não calcula remuneração e não decide admissibilidade administrativa.

## 1. Fronteira do motor

Núcleo puro: recebe catálogo, composição, base atual e contexto; devolve resultados e pendências. Mesmas entradas e mesma versão produzem os mesmos resultados. Não acessa rede, navegador, armazenamento, relógio ou dados pessoais. Não modifica os objetos recebidos.

O motor não usa campos monetários. Sua operação reproduz a parte aproveitável de `H3:K21` da referência: quantidade × coeficiente, seguida de soma por espécie. A diferença preserva o sentido de `L3/M3`: **proposta menos situação atual**.

## 2. Entradas

| Entrada | Contrato |
| --- | --- |
| Catálogo | Uma versão identificada, fonte oficial, data da conferência e 36 registros únicos: espécie CCESP ou FCESP, nível 1 a 18, rótulo do nível e coeficiente em centésimos inteiros. A data de conferência não deve ser apresentada como início de vigência. Sem misturar versões no cenário. |
| Linhas da proposta | Lista apenas dos itens incluídos, com identificador de linha, espécie, nível e quantidade digitada. A interface pode exibir linhas disponíveis, mas elas só entram no motor quando incluídas. |
| Modo da base atual | Exclusivamente `por grupo` ou `agregada`. Apenas o ramo ativo participa da comparação e da exportação, mesmo que a interface conserve campos anteriores para permitir voltar ao outro modo. |
| Base por grupo | Quatro entradas independentes e opcionais: quantidade CCESP, cotas CCESP, quantidade FCESP, cotas FCESP. |
| Base agregada | Duas entradas independentes e opcionais: quantidade conjunta e cotas conjuntas. Não estimar componentes por grupo. |
| Contexto da base | Órgão/entidade; natureza, data, abrangência e origem da situação atual; confirmação de equivalência de natureza e abrangência com a proposta. Podem ser preenchidos depois da composição. |

Não incluir os campos atuais por nível `C3:C20`, pois a proposta aprovada para prototipagem não os exige e a referência não os usa no cálculo. Não incluir identificadores de ocupantes.

**Catálogo de referência conferido**, na ordem dos níveis 1 a 18, em centésimos de cota:

- CCESP: 100; 125; 150; 175; 200; 225; 250; 275; 300; 325; 350; 400; 450; 550; 600; 700; 800; 900.
- FCESP: 60; 75; 90; 105; 120; 135; 150; 165; 180; 195; 210; 240; 270; 330; 360; 420; 480; 540.

O nível 18 deve manter identificação NES, inclusive FCESP 5,40. Existência na tabela não certifica aplicabilidade a uma estrutura. Fonte: [LC 1.395/2023, texto compilado e anexos](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/compilacao-lei.complementar-1395-22.12.2023.html) e [imagem oficial do Anexo I](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/2024010810054623840.png), conferidas na frente normativa em 14/09/2026.

## 3. Números exatos e validação

Quantidades são inteiros não negativos. Cotas e coeficientes têm escala fixa de centésimos. O núcleo deve usar inteiros exatos para multiplicação, soma e diferença; em JavaScript, a implementação recomendada é `BigInt`. Não usar aproximações de ponto flutuante nem arredondar durante o cálculo. A apresentação de cotas sempre conserva duas casas.

No limite de entrada, aceitar quantidade como texto com dígitos, retirando espaços nas extremidades. Para cotas atuais, aceitar dígitos com parte decimal opcional de uma ou duas casas, separada por vírgula ou ponto, **sem separador de milhar**. Exemplos válidos: `0`, `1250`, `1,5`, `1.50`; exemplos inválidos: `1.000`, `1.234,50`, `1,234.50`, `1e3`, `-1`, `+1`, `NaN`, `Infinity`. Quantidade `1,0` também é inválida: o campo solicita inteiro, sem truncamento. Orientar o formato ao lado do campo. Zeros à esquerda não alteram o valor.

Texto vazio ou só espaços significa ausência. O texto `0` significa zero confirmado. Não usar conversão genérica que transforme ausência em zero ou aceite apenas o começo de um texto inválido. Um valor digitado como `3` deve gerar o mesmo número para a soma de quantidades e para a multiplicação das cotas, evitando a divergência de coerção observada como hipótese na planilha.

Não instituir teto administrativo de quantidades. Se a implementação limitar tamanho do texto para evitar entradas desproporcionais, o limite deve ser identificado como técnico, aplicado antes da conversão e coberto por teste. Não pode surgir de arredondamento ou perda de precisão. O contrato não exige suportar números em notação científica.

Rejeitar espécie ou nível desconhecido, identificador de linha repetido, repetição do par espécie/nível e coeficiente ausente ou inválido. Não somar duplicatas silenciosamente; a página permite ajustar a quantidade do item já incluído. Coeficientes do catálogo são referências, não campos editáveis pelo usuário.

## 4. Estados da proposta

| Situação | Resultado |
| --- | --- |
| Nenhuma linha incluída | Estado `vazio`, sem apresentar um cenário concluído de valor zero. |
| Linha incluída sem quantidade ou com dado inválido | A linha informa a pendência; o grupo correspondente fica `incompleto`, sem total conclusivo ou comparação daquele grupo. |
| Outro grupo válido | Seus totais e comparações disponíveis podem continuar visíveis, identificados por grupo. |
| Grupo sem linhas em um cenário que contém ao menos uma linha incluída | Quantidade e cotas iguais a zero, com indicação “nenhum item incluído neste grupo”. Isso deriva da composição escolhida, não de preencher um dado ausente com zero. |
| Linha com quantidade zero explícita | Linha válida; parcela zero, preservada no resumo para permitir conferência. |
| Linha sem espécie válida ou catálogo estruturalmente inválido | Erro global; não apresentar totais conclusivos, porque não é possível atribuir ou confiar no cálculo. |
| Todos os itens válidos, inclusive cenário com zeros explícitos | Estado `completo`, com quatro totais por grupo. “Completo” descreve somente o preenchimento e a aritmética. |

Não mostrar soma parcial de linhas válidas como se fosse total de um grupo incompleto. O total geral descritivo só existe quando a proposta inteira está completa. A falta da base atual ou de seus metadados não impede concluir o cálculo da composição proposta.

## 5. Comparações

Uma comparação depende de: proposta válida para a medida; base numérica presente e válida; órgão, natureza, data válida, abrangência e origem identificados; equivalência confirmada com a proposta. A confirmação é declaração do usuário, não verificação de autoridade pelo motor. Contexto incompleto ou incompatível suspende diferenças, preservando os totais propostos.

No modo por grupo, cada uma das quatro medidas é independente: a ausência ou invalidade de cotas atuais CCESP suspende essa diferença, sem suspender uma comparação válida de quantidade CCESP ou de FCESP. Não fabricar totais atuais gerais a partir de apenas parte das quatro medidas. Para manter a primeira interface enxuta, não é necessário gerar comparação agregada neste modo.

No modo agregado, as duas diferenças só usam a proposta completa. Mostrar “Variação agregada em relação à situação atual informada”, com observação de caráter descritivo. As comparações por grupo ficam indisponíveis com razão “sem base atual por grupo”, mesmo quando o agregado é zero. Não gerar rateio, conversão, compensação, saldo disponível ou conclusão de autorização.

Variação positiva = aumento; negativa = redução; zero = sem alteração nessa medida. Preservar sinal, espécie e unidade: cargos CCESP, funções FCESP, postos no agregado e cotas no respectivo escopo. Não usar cor ou palavra “aprovado” como significado de zero.

## 6. Saída e resumo copiável

A saída contém versão do motor e do catálogo, estado global, estado de cada grupo, parcelas válidas, quatro totais quando disponíveis, comparação de cada medida com seu estado e razão de indisponibilidade, e pendências vinculadas aos campos/linhas. Estados distintos devem separar vazio, dado ausente, dado inválido, contexto incompleto, bases incompatíveis e falta de base por grupo.

Representação pública/serializável: quantidades e centésimos como textos inteiros canônicos; valores decimais canônicos de cotas como textos com duas casas. Objetos de resultado não expõem `BigInt` diretamente à serialização JSON. Formatação pt-BR e sinais são funções de apresentação consistentes sobre esses inteiros, sem reconverter para ponto flutuante.

O resumo deriva do mesmo resultado que a tela utiliza; não tem um segundo cálculo. Inclui identificação, natureza/data/abrangência/origem informadas, modo ativo, linhas e coeficientes, totais disponíveis, diferenças disponíveis, fonte e versão, pendências e observação sobre o alcance aritmético. Dados do ramo inativo não aparecem. Textos do usuário são tratados como texto simples, nunca como HTML executável.

Em cenário incompleto, a cópia pode ser permitida como **“Rascunho incompleto — não contém todos os totais”**, mantendo pendências e omitindo totais inválidos. A tela precisa distinguir essa ação de copiar uma composição completa. Campos contextuais ausentes aparecem como “não informado”. Se houver data/hora da geração, ela é fornecida pela camada de apresentação e identificada separadamente da data da base e da conferência do catálogo.

## 7. Casos significativos de teste

Casos abaixo são requisitos de testes do novo motor. Não foram executados em uma aplicação nesta etapa. Os números de referência já foram confrontados com contas independentes na auditoria, quando aplicável. Usar contexto completo e equivalente nas comparações, salvo indicação contrária.

| Caso | Entrada ou mudança | Resultado esperado |
| --- | --- | --- |
| 1. Catálogo completo | Conferir todos os 36 pares espécie/nível | Correspondem às sequências acima; nível 18 FCESP = 540 centésimos. Sem duplicatas ou lacunas. |
| 2. Referência com centésimos | 3 CCESP nível 2 e 2 FCESP nível 4 | CCESP: 3 cargos/3,75 cotas; FCESP: 2 funções/2,10 cotas; agregado: 5 postos/5,85 cotas. |
| 3. Comparação por grupo | Caso 2; atual CCESP 4/5,00; FCESP 1/1,05 | CCESP −1 cargo/−1,25 cota; FCESP +1 função/+1,05 cota. |
| 4. Igualdade agregada | Caso 2; modo agregado; atual 5/5,85 | Diferenças 0 posto/0,00 cota; comparações por grupo indisponíveis; sem autorização ou compensação. |
| 5. Sinais agregados | Caso 2; atual 4/5,00 e depois 6/7,00 | Primeiro +1/+0,85; depois −1/−1,15. Nunca inverter atual e proposta. |
| 6. Ausência e zero atual | Caso 2; cotas atuais CCESP vazias e depois `0` | Vazio: diferença indisponível; zero: +3,75. Outras comparações válidas permanecem. |
| 7. Base inválida independente | Caso 3; quantidade atual FCESP `2,5` | Recusar campo; suspender só essa comparação; totais propostos e outras diferenças válidas permanecem. |
| 8. Sem contexto equivalente | Caso 3, mas origem ausente ou equivalência não confirmada | Proposta completa; diferenças indisponíveis com pendência contextual. Não chamar simples soma de comparação válida. |
| 9. Vazio e zero explícito | Nenhuma linha; depois uma linha CCESP nível 2 com `0` | Primeiro cenário vazio; segundo completo com zero explícito e FCESP sem itens. |
| 10. Linha incluída pendente | Caso 2; apagar quantidade FCESP | Grupo FCESP incompleto; CCESP válido; sem total geral ou comparação agregada. Restaurar `2` recupera todos os valores. |
| 11. Domínio da quantidade | `-1`, `1,5`, `1.0`, `3x`, `1e3`, `Infinity`, `Preencher` | Todos inválidos; nenhum truncamento, arredondamento ou parcela conclusiva. ` 003 ` é 3 em soma e multiplicação. |
| 12. Leitura de cotas | `1,5`, `1.50`, `0`, vazio, `1.000`, `1.234,50` | 150; 150; 0 centésimos; ausência; inválido; inválido, respectivamente. |
| 13. Integridade | Nível desconhecido, espécie desconhecida, item duplicado, coeficiente ausente | Pendência explícita no nível correto; nunca coeficiente zero presumido, soma silenciosa ou comparação conclusiva afetada. |
| 14. Agregado oculta composição | Cenário A: 2 CCESP nível 3; B: 2 FCESP nível 7; atual agregado 2/3,00 | Ambos têm delta agregado zero; os quatro resultados por grupo diferem e continuam explícitos. |
| 15. Alternância de modo | Preencher ambos os ramos em memória e selecionar cada modo | Somente o ramo ativo influencia diferenças e resumo. Base antiga do outro modo não preenche lacunas. |
| 16. Preservação exata | Somar parcelas de 1,25 e 1,05 repetidamente; quantidade acima de 2^53 se aceita pela política de tamanho | Resultado exato em centésimos, inclusive produtos grandes admitidos; sem comparação falsa por resíduos. Se houver limite técnico, rejeição explícita antes da conta. |
| 17. Reprodutibilidade | Recalcular a mesma entrada; permutar ordem das linhas sem mudar itens | Mesmos totais/diferenças; entrada original intacta; parcelas identificadas pelas mesmas linhas. |
| 18. Exportação | Casos 2, 3, 6 e 10; órgão com sinais como `<` e `&` | Resumo preserva valores, sinais, grupos, unidades, versão, modo e pendências; texto literal seguro; cenário incompleto rotulado; não contém ramo inativo. |
| 19. Catálogo e contexto | Trocar a versão declarada sem registros correspondentes; data inexistente como 31/02 | Catálogo inconsistente impede resultado conclusivo; data inválida impede comparação, mas não o cálculo válido da proposta. |

## 8. Entrega delimitada da implementação

Após receber a pasta exata, implementar somente o catálogo/motor, formatação e resumo necessários à sua interface e os testes significativos correspondentes, dentro dos arquivos combinados. Coordenar os nomes e os tipos de entrada/saída com quem integra a UI. O desenho, o estado dos formulários, a navegação do SIORG e os testes de interação ficam com a frente de interface. Nenhuma dependência nova de API ou persistência é necessária para este contrato.
