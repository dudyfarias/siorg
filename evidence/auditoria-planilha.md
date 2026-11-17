# Auditoria da planilha de referência da calculadora de cotas

14/09/2026. Arquivo examinado: **Calculadora de Cotas - vs abril_2026.xlsx**. A análise foi somente de leitura. O original permaneceu idêntico, com SHA-256 `17b7c81b169b0a33d2bced941ad9c164ce81b050f203b210d6d43208e93ede78` antes e depois.

**Conclusão:** há uma base de cálculo simples e aproveitável. As multiplicações e somas mantêm referências coerentes em todas as linhas. Os pontos prioritários são esclarecer a comparação com a situação atual, validar entradas e dar rastreabilidade aos dados. Há uma divergência material no subsídio de `F19`, que não alimenta o cálculo de cotas. Não há fundamento para descartar a lógica inteira ou presumir necessidade de nova API.

## Escopo e limites da verificação

Foi inspecionada a única aba, **Calculadora**, em sua extensão completa `A1:M21`: valores, 42 fórmulas, resultados salvos, mesclagens, formatos, vínculos, proteção e validação. A inspeção do pacote XLSX confirmou que não existem outras abas ocultas. Não há linhas ou colunas ocultas, nomes definidos, tabelas estruturadas, links externos de cálculo, VBA, comentários ou hyperlinks de fonte.

Os dados foram extraídos com leitura do XML e biblioteca Python. Foram executadas **14 simulações independentes em memória**, com aritmética decimal exata e interpretação limitada aos operadores e à função SUM presentes neste arquivo. Isso não é execução no Excel, nem em LibreOffice, nem teste da interação do usuário. Nenhum arquivo XLSX foi gerado ou modificado. Inspeção visual e validação normativa são frentes separadas.

## O que a planilha realmente calcula

| Células da aba Calculadora | Conteúdo ou função |
| --- | --- |
| `A2` | Nome do órgão ou entidade, preenchimento manual |
| `B2` | “Cotas atuais”, agregadas, preenchimento manual |
| `C2` | “Quantitativos atuais (FCESP + CCESP)”, agregado, preenchimento manual |
| `C3:C20` | 18 campos “Preencher” sob a coluna de quantitativos atuais; nenhum participa das fórmulas |
| `D3:D20` e `F3:F20` | Subsídios informativos, armazenados como constantes |
| `E3:E20` e `G3:G20` | Valores unitários de cotas, armazenados como constantes |
| `H3:H20` e `I3:I20` | Quantidades propostas de CCESP e FCESP |
| `J3:J20` | Valor unitário CCESP × quantidade proposta da mesma linha |
| `K3:K20` | Quantidade proposta FCESP × valor unitário da mesma linha |
| `H21:I21` | Quantidades propostas somadas por espécie |
| `J21:K21` | Cotas propostas somadas por espécie |
| `L3` | `=(J21+K21)-B2`: variação global de cotas, proposta menos situação atual informada |
| `M3` | `=(H21+I21)-C2`: variação global de postos, proposta menos situação atual informada |

`L3` e `M3` são as células superiores de áreas mescladas até a linha 20. A fórmula não se repete em cada linha dessa área. São **36 multiplicações, quatro somas e duas diferenças**, sem fórmulas condicionais, arredondamento, busca de regras ou verificação de teto.

## Achados verificáveis

### 1. Comparação com situação atual não equivale a verificação de limite

**Prioridade alta para a proposta de MVP.** Os cabeçalhos `B1:C1` e as fórmulas `L3:M3` mostram comparação com bases atuais informadas. Não há referência de teto autorizado, vigência ou saldo oficial no arquivo. Resultado positivo significa aumento em relação à base informada; negativo significa redução. A denominação “Total de Aumento” precisa ser entendida também quando a diferença é negativa.

Além disso, `L3` soma CCESP e FCESP antes da diferença. A soma é aritmeticamente válida como descrição global, mas não demonstra possibilidade de compensação entre espécies. Dois cenários sintéticos — dois CCESP com coeficiente 1,50 (`H5=2`) ou dois FCESP com coeficiente 1,50 (`I9=2`) — produzem os mesmos totais globais e delta zero com `B2=3` e `C2=2`, embora a composição seja diferente. Não se trata de uma recomendação de transformação: o exemplo demonstra perda de informação no agregado.

**Recomendação:** preservar quantidades e cotas de cada espécie como resultados principais. Separar “variação em relação à base atual informada” de eventual “diferença em relação a um limite aplicável”. São comparações distintas, com origens e sinais diferentes. Se só existir a base atual agregada, o delta global pode ser informativo, sem conclusão por espécie ou autorização administrativa.

### 2. Quantitativos atuais por linha não estão ligados ao total atual

**Prioridade alta para evitar preenchimento sem efeito.** Não há referência a `C3:C20` em nenhuma das 42 fórmulas. `M3` usa apenas `C2`. Alterar `C3` para 999 e `C20` para 123, mantendo os demais dados, não altera qualquer resultado no modelo independente.

**Recomendação:** esclarecer com quem utiliza a ferramenta a finalidade desses campos. Se são quantitativos atuais detalhados, o total precisa derivar deles ou ser reconciliado explicitamente. Se a tarefa usa somente um total atual agregado, não pedir o detalhamento sem utilização. A auditoria não presume que `C2` deva ser substituído por uma soma antes de confirmar o significado das linhas.

### 3. Não há validação de domínio nem proteção ativa contra alterações acidentais

**Prioridade alta.** Há zero regras de validação de dados e zero regras de formatação condicional. Não há proteção ativa da aba ou da estrutura do arquivo. As células têm a marca padrão `locked`, mas ela não bloqueia edição com a proteção da aba desativada. Assim, entradas, coeficientes e fórmulas não estão separados por proteção efetiva.

As fórmulas não exigem quantidades inteiras não negativas. Com `H4=1,5`, o modelo calcula 1,875 cota e 1,5 posto; com `H4=-1`, calcula −1,25 cota e −1 posto. São resultados matemáticos das expressões, não quantidades válidas de cargos. Se um coeficiente for apagado, a multiplicação pode tratar a ausência como zero. Se `B2:C2` forem apagados, as diferenças passam a considerar base zero, sem aviso próprio.

Texto numérico também exige cuidado: `H4` armazenado como texto “3” pode gerar 3,75 em `J4`, enquanto `SUM(H3:H20)` ignora esse texto e retorna zero se os outros valores forem zero. Esta hipótese foi simulada conforme a coerção aritmética e a soma por referência documentadas pela Microsoft; **não foi testada na interface do Excel**. [Operadores e conversão de valores](https://support.microsoft.com/en-us/excel/calculation-operators-and-precedence-in-excel), [comportamento da função SUM](https://support.microsoft.com/en-us/excel/functions/sum-function).

**Recomendação:** entradas tipadas, quantidades inteiras não negativas, ausência diferente de zero, mensagens específicas e coeficientes publicados como dados conferidos. Em eventual melhoria da própria planilha, proteger fórmulas pode reduzir acidentes, mas não constitui controle de segurança nem validação jurídica.

### 4. O modelo recebido contém placeholders e erros salvos, não um cenário concluído

**Prioridade média, ligada à experiência de preenchimento.** `H3:I20`, `B2:C2` e outros campos contêm o texto “Preencher”. Há **40 resultados salvos `#VALUE!`**, nas multiplicações, totais de cotas e diferenças. `H21:I21` têm zero salvo porque SUM ignora os textos de suas faixas. A interpretação independente reproduziu os 42 resultados salvos. Isso não comprova uma nova recalculação pelo Excel, mas explica o estado armazenado.

A presença de `#VALUE!` neste modelo ainda vazio não demonstra que as fórmulas falhem quando todas as entradas são válidas. Tampouco os zeros de quantidade provam que alguém informou zero. No MVP, usar instrução de preenchimento fora do valor do campo, estado “cenário incompleto” e distinção explícita entre linha não utilizada e dado faltante. Não encobrir problemas com conversão indiscriminada de erros em zero.

### 5. F19 tem uma divergência material de subsídio; as cotas não dependem dela

**Prioridade média, informacional.** `F19` contém **R$ 14.457,20**. A relação interna com `D3=2.966` e `G19=4,8` resulta em **R$ 14.236,80**, diferença de **R$ 220,40**. A frente normativa também confirmou R$ 14.236,80 no anexo oficial. [Imagem do anexo da LC 1.395](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/2024010810054623840.png).

`K19=I19*G19` não referencia `F19`; nenhuma fórmula referencia as colunas de subsídio `D` ou `F`. Corrigir apenas `F19` não muda os resultados de cotas. Evitar dizer que essa divergência invalida o cálculo de cotas inteiro.

Na conferência monetária de todas as 36 células de subsídio contra base × coeficiente, **35 coincidem na precisão de centavos**. `F10` e `F16` têm resíduos de representação abaixo de um centavo no XML; com seus formatos de duas casas, correspondem aos valores esperados. Não são divergências materiais como `F19`. O Excel utiliza ponto flutuante, o que pode gerar esses resíduos. [Microsoft: representação e precisão numérica](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/floating-point-arithmetic-inaccurate-result).

### 6. O catálogo é fixo e não documenta sua origem dentro da aba

**Prioridade média para rastreabilidade.** `E3:E20` e `G3:G20` são constantes, sem fórmula de atualização. Não há fonte, vigência, registro de revisão ou referência de ato no conteúdo da aba, nem notas ou hyperlinks. “Abril_2026” está no nome do arquivo, sem demonstrar por si a vigência ou conferência de cada valor. Também não há uma coluna de códigos/níveis individuais: as linhas são identificadas pela sequência e valores, dentro dos grupos de escolaridade/NES.

A frente normativa informou que **todos os 36 coeficientes de cotas conferem**, inclusive o coeficiente FCESP de 5,40 em `G20`. Portanto, ausência de metadados não é evidência de que esses coeficientes estejam errados. A aplicação de uma espécie/nível a determinado órgão continua dependendo do recorte validado.

**Recomendação:** reutilizar os coeficientes conferidos em catálogo com identificadores explícitos, fonte e versão. Não derivar cotas dos subsídios exibidos, pois hoje a conta usa diretamente E/G e os campos monetários são independentes. Subsídios podem permanecer como referência somente se forem úteis à tarefa e mantidos com fonte e vigência próprias.

## Testes independentes e resultados

Em cada simulação abaixo, os campos quantitativos não mencionados foram zerados em memória, exceto quando o teste define explicitamente texto ou ausência. Bases atuais foram zeradas quando não especificadas. Esses são testes analíticos das expressões extraídas, não testes executados no Excel.

| Caso | Entradas/células | Resultado independente |
| --- | --- | --- |
| Zero explícito | `H3:I20`, `B2:C2` iguais a zero | Todos os seis totais/diferenças iguais a zero |
| Precisão de centésimos | `H4=3`, `I6=2`, `B2=5,85`, `C2=5` | `J21=3,75`, `K21=2,10`, `L3=0`, `M3=0` |
| Aumento | Mesmo cenário, `B2=5`, `C2=4` | `L3=+0,85`, `M3=+1` |
| Redução | Mesmo cenário, `B2=7`, `C2=6` | `L3=−1,15`, `M3=−1` |
| Fração | `H4=1,5` | `H21=1,5`, `J21=1,875`; a fórmula não rejeita |
| Negativo | `H4=−1` | `H21=−1`, `J21=−1,25`; a fórmula não rejeita |
| Bases vazias | Cenário 3 CCESP + 2 FCESP acima, `B2:C2` vazios | `L3=5,85`, `M3=5`; ausência interpretada como base zero |
| Coeficiente vazio | `H4=3`, `E4` vazio | `H21=3`, `J21=0`; ausência pode subestimar consumo |
| Texto numérico | `H4` como texto “3” | `H21=0`, `J21=3,75`; valores podem divergir entre soma e multiplicação |
| Células atuais desconectadas | `C3=999`, `C20=123` | Nenhum dos seis resultados muda |
| Subsídio sem efeito nas cotas | `F19=14.236,80`, `I19=1` | `K21=4,8`; o mesmo obtido com F19 original |
| Composição CCESP | `H5=2`, `B2=3`, `C2=2` | Dois CCESP, três cotas CCESP, diferenças globais zero |
| Composição FCESP | `I9=2`, `B2=3`, `C2=2` | Dois FCESP, três cotas FCESP, diferenças globais zero |
| Placeholder remanescente | `H3=1`, `I20="Preencher"` | `H21=1`, `I21=0`, `K21` e `L3` com `#VALUE!` |

Os 14 resultados esperados foram confirmados pelo modelo decimal independente. Também foram conferidas todas as referências das multiplicações e os limites das quatro somas, sem deslocamento de linha ou omissão de parcela nesses intervalos. Essa conclusão cobre as expressões existentes, não autoriza todas as entradas aceitas por elas.

## Revisão fundamentada da arquitetura proposta

1. **Trocar a premissa inicial centrada em “limite” pela tarefa demonstrada:** montar a proposta e comparar com a situação atual informada. Limites autorizados entram apenas se a necessidade e a base aplicável forem confirmadas; a planilha não os fornece.
2. **Reaproveitar o núcleo existente:** quantidade × coeficiente e somas por espécie. A referência tem apenas uma aba e 42 fórmulas simples. Melhorar a própria planilha, suas instruções ou criar um complemento continua sendo uma decisão de produto a validar.
3. **Modelar base atual e proposta separadamente.** Origem, unidade e data da base atual ficam explícitas. Delta do cenário é proposta menos base atual. Eventual disponibilidade frente a teto usa outra referência e outra expressão, sem intercâmbio silencioso.
4. **Preservar as quatro medidas por espécie:** postos CCESP, cotas CCESP, postos FCESP e cotas FCESP. Quando a base atual vier só agregada, não inventar sua distribuição. Mostrar a limitação do delta global.
5. **Resolver C3:C20 com os usuários antes de reproduzir o campo.** Nenhuma entrada deve parecer influenciar uma conta quando é apenas anotação.
6. **Dar prioridade à validação, ausência versus zero, leitura de sinais e resumo rastreável.** São lacunas demonstradas na referência; não exigem API, dados pessoais ou armazenamento de cenários.
7. **Manter cotas e subsídios separados.** O erro de F19 é relevante à informação monetária, mas não justifica trocar o motor de cotas. O MVP não precisa calcular remuneração se a tarefa é dimensionar cotas.
8. **Adicionar à homologação os casos identificados aqui:** base atual vazia, tipo numérico, quantidade inválida, coeficiente faltante, reconciliação do detalhamento atual e igualdade global com grupos distintos. A homologação posterior no Excel, caso a solução continue em planilha, precisa ser declarada e realizada separadamente.

As recomendações não alteram o original nem constituem aprovação normativa de uma composição. A publicação de uma ferramenta utilizável depende da revisão dos dados, do recorte de regras e da compreensão da tarefa pela área responsável.
