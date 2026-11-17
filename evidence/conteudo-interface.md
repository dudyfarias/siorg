# Calculadora de Cotas — textos de interface

Conteúdo para a página do MVP no SIORG. Base: proposta-conteudo.md, revista em 14/09/2026. Os textos abaixo não pressupõem publicação, homologação da ferramenta ou consulta automática a dados oficiais. Elementos entre chaves representam informações do preenchimento ou da versão efetivamente usada.

## 1. Abertura

| Elemento | Texto |
|---|---|
| Caminho da página | Início / Calculadora de Cotas |
| Título | Calculadora de Cotas |
| Apresentação | Monte uma proposta de cargos e funções e confira suas quantidades e cotas. Se tiver os dados atuais, compare os resultados. |
| Limite do resultado, em texto discreto | O cálculo ajuda a preparar a proposta. Ele não representa sua aprovação nem informa saldo autorizado. |
| Uso do exemplo | Carregar exemplo |
| Persistência, perto das ações | O preenchimento será perdido ao fechar ou atualizar esta página. Copie o resumo antes de sair. |

Se for necessário identificar a versão ainda em teste, usar uma única indicação: **“Versão para teste”**. Não usar “oficial”, “homologada”, “validada pelo SIORG” ou selo de conformidade sem esse estado confirmado.

O início fica vazio. Não carregar automaticamente órgão, quantidades, situação atual ou exemplo. Antes de incluir uma composição, mostrar orientação e traços no lugar dos resultados, sem aparentar uma proposta já calculada.

## 2. Identificação e dados atuais

### Identificação

| Elemento | Texto |
|---|---|
| Título da seção | Identifique a proposta |
| Campo | Órgão ou entidade |
| Ajuda | Informe o nome do órgão ou entidade desta proposta. |
| Campo | Estrutura considerada |
| Ajuda | Descreva o que está incluído. Por exemplo: órgão inteiro ou uma unidade. |

### Escolha da comparação

**Título:** Dados atuais para comparação

**Pergunta do grupo de opções:** Como você quer informar os dados atuais?

| Opção | Ajuda curta |
|---|---|
| Por grupo | Informe CCESP e FCESP separadamente. |
| Totais conjuntos | Use esta opção se só tiver a soma de CCESP e FCESP. |
| Não informar agora | Calcule a proposta e deixe a comparação para depois. |

Para iniciar sem exigir dados atuais, a opção padrão pode ser **“Não informar agora”**. Trocar de opção não deve somar os dois modos nem usar campos ocultos na comparação.

### Origem e significado — nos modos com comparação

| Campo ou controle | Ajuda ou opções |
|---|---|
| O que os dados atuais representam? | Estrutura autorizada / Ocupação / Outra referência / Ainda não sei |
| Descreva a referência | Exibir quando a pessoa escolher “Outra referência”. |
| Data dos dados atuais | Use a data a que esses números se referem. |
| De onde vieram os dados? | Informe o documento, a planilha ou o link consultado. |
| Confirmação de abrangência | Os dados atuais e a proposta se referem à mesma estrutura e à mesma abrangência. |

**Ajuda junto à confirmação:** “Não compare cargos autorizados com cargos ocupados. Confira o que cada número representa.”

“Estrutura autorizada” identifica o tipo de informação declarado pela pessoa. A seleção não valida o documento nem transforma o número em limite ou saldo oficial.

### Por grupo

| Grupo | Campos |
|---|---|
| CCESP — cargos em comissão | Quantidade atual de cargos / Cotas atuais de CCESP |
| FCESP — funções de confiança | Quantidade atual de funções / Cotas atuais de FCESP |

**Ajuda comum:** “Informe os valores que você tem. Um campo vazio deixa apenas aquela comparação pendente. Use zero quando tiver confirmado que não há quantidade ou cotas.”

### Totais conjuntos

**Campos:** “Quantidade atual de cargos e funções” e “Cotas atuais de CCESP e FCESP”.

**Ajuda:** “A comparação mostrará apenas a variação do conjunto. Esses totais não permitem separar a situação atual por grupo.”

Não usar “limite atual”, “cotas disponíveis” ou “capacidade restante” para renomear a base recebida.

## 3. Composição proposta

**Título:** Monte a proposta

**Ajuda:** “Inclua os níveis utilizados e informe as quantidades. A calculadora mostra as cotas de cada item.”

| Elemento | Texto |
|---|---|
| Campo de seleção | Grupo |
| Opções | CCESP — cargo em comissão / FCESP — função de confiança |
| Campo | Nível |
| Estado sem seleção | Selecione o nível |
| Campo | Quantidade proposta |
| Ajuda da quantidade | Informe um número inteiro, sem casas decimais. |
| Referência da linha | Valor-unitário |
| Ajuda do valor-unitário | Valor usado para calcular as cotas deste nível. |
| Resultado da linha | Cotas do item |
| Ação | Adicionar item |
| Ação para excluir | Remover item |
| Nome acessível da exclusão | Remover {grupo}, nível {nível} |

**Cabeçalhos da composição:** Grupo · Nível · Quantidade proposta · Valor-unitário · Cotas do item · Ações.

**Explicação do cálculo:** “Cotas do item = quantidade × valor-unitário.”

**Estado sem itens:** “Nenhum item incluído. Selecione um grupo e um nível para começar.”

**Caso a estrutura use linhas selecionáveis em vez de inclusão individual:** “Selecione apenas os níveis que farão parte da proposta.” Preservar as mesmas informações e evitar exigir quantidade em níveis não utilizados.

### Mensagens junto ao campo

| Condição | Texto |
|---|---|
| Grupo ausente | Selecione CCESP ou FCESP. |
| Nível ausente | Selecione o nível deste item. |
| Quantidade ausente no item incluído | Informe a quantidade deste item. |
| Quantidade negativa, fracionária ou texto | Informe um número inteiro igual ou maior que zero. |
| Cotas atuais inválidas | Informe um número igual ou maior que zero, com até duas casas decimais. |
| Item repetido, se o controle impedir duplicação | Este grupo e nível já foram incluídos. Altere a quantidade na linha existente. |
| Nível fora do recorte disponível | Este nível não está disponível nesta versão. |
| Composição incompleta | Confira os campos indicados para concluir o cálculo. |

Não mostrar `NaN`, `undefined`, erros de fórmula ou mensagens sobre bibliotecas. Não apagar outros campos válidos ao apontar um erro.

## 4. Resultados e comparação

**Título:** Confira os resultados

**Ajuda:** “Quantidades e cotas são medidas diferentes. Os resultados de CCESP e FCESP aparecem separados.”

### Totais propostos

- Quantidade proposta de CCESP — unidade: cargos.
- Cotas propostas de CCESP — unidade: cotas.
- Quantidade proposta de FCESP — unidade: funções.
- Cotas propostas de FCESP — unidade: cotas.

**Antes de começar:** “Inclua os itens da proposta para ver os resultados.”

**Composição incompleta:** “Resultado incompleto. Corrija os campos indicados na proposta.”

Se o motor mantiver parcelas válidas visíveis durante uma pendência, identificá-las como **“Subtotal dos itens preenchidos”**, sem apresentar esse número como total concluído. O estado vazio usa “—”; zero é reservado para resultados definidos pela composição válida ou dados confirmados.

### Comparação por grupo

**Título:** Variação em relação aos dados atuais informados

**Cabeçalhos:** Medida · Atual informado · Proposta · Variação.

**Explicação:** “A variação é a diferença entre a proposta e os dados atuais informados.”

| Resultado | Texto |
|---|---|
| Diferença positiva de quantidade CCESP | Aumento de {n} cargo(s) |
| Diferença negativa de quantidade CCESP | Redução de {n} cargo(s) |
| Diferença positiva de quantidade FCESP | Aumento de {n} função(ões) |
| Diferença negativa de quantidade FCESP | Redução de {n} função(ões) |
| Diferença positiva de cotas | Aumento de {valor} cota(s) |
| Diferença negativa de cotas | Redução de {valor} cota(s) |
| Diferença zero | Sem alteração |

Aplicar singular e plural na exibição, sem mostrar parênteses. Manter sinal e unidade quando usar a apresentação numérica. Não atribuir verde a redução ou vermelho a aumento como julgamento automático.

### Comparação conjunta

**Título:** Variação dos totais conjuntos

**Linhas:** “Quantidade de cargos e funções” e “Cotas de CCESP e FCESP”.

**Nota junto aos resultados:** “Esta comparação descreve o conjunto. Ela não autoriza compensar CCESP e FCESP.”

Nas comparações por grupo, usar **“Sem dados atuais por grupo”**. Não estimar a divisão dos totais conjuntos.

### Estados da comparação

| Condição | Texto |
|---|---|
| Pessoa escolheu não informar | Comparação não realizada. Você pode informar os dados atuais quando quiser. |
| Uma medida atual está ausente | Dado atual não informado. |
| Falta data | Informe a data dos dados atuais para comparar. |
| Falta origem | Informe de onde vieram os dados atuais. |
| Não sabe o significado | Confirme o que os dados atuais representam para comparar. |
| Falta confirmar equivalência | Confirme que os dados atuais e a proposta se referem à mesma estrutura e abrangência. |
| Referências incompatíveis | A comparação não foi calculada: os dados se referem a situações diferentes. |
| Falta concluir composição | Conclua a proposta para ver a comparação. |

As pendências da comparação não impedem o cálculo de uma proposta válida. Não apresentar percentuais: este recorte trabalha com diferenças absolutas, preservando unidade e grupo, sem criar denominadores implícitos.

## 5. Exemplo, limpeza e cópia

### Carregar exemplo

**Botão:** Carregar exemplo.

Se já houver dados inseridos, usar confirmação:

- Título: “Substituir o preenchimento pelo exemplo?”
- Texto: “O exemplo substituirá os dados desta proposta.”
- Ações: “Manter preenchimento” / “Carregar exemplo”.

**Identificação persistente do exemplo:** “Exemplo fictício”.

**Aviso do exemplo:** “Estes dados servem apenas para conhecer a calculadora. Não representam um órgão ou uma proposta real.”

Valores do exemplo:

| Informação | Valor |
|---|---|
| Órgão ou entidade | Órgão fictício |
| Estrutura considerada | Estrutura fictícia usada no exemplo |
| Origem dos dados atuais | Dados fictícios para demonstração |
| Modo de comparação | Por grupo |
| Quantidade atual de CCESP | 4 |
| Cotas atuais de CCESP | 5,00 |
| Quantidade atual de FCESP | 1 |
| Cotas atuais de FCESP | 1,05 |
| Proposta CCESP, nível 2 | 3 cargos; valor-unitário 1,25; cotas 3,75 |
| Proposta FCESP, nível 4 | 2 funções; valor-unitário 1,05; cotas 2,10 |

A data da base demonstrativa, caso necessária para exercitar a comparação, deve ser apresentada como fictícia. Uma convenção possível é **14/09/2026**, identificada no exemplo como data de demonstração. Natureza e abrangência devem ser coerentes nos dois lados. Carregar o exemplo não pode fazer uma confirmação sobre dados reais em nome da pessoa.

**Leitura esperada:** “CCESP: redução de 1 cargo e de 1,25 cota. FCESP: aumento de 1 função e de 1,05 cota.”

Ao editar o exemplo, manter **“Simulação iniciada a partir de exemplo fictício”** no resumo enquanto ainda houver valores demonstrativos; não passar silenciosamente a tratá-los como dados reais. Uma alternativa simples é mantê-lo identificado como fictício até a pessoa limpar o preenchimento.

### Limpar

**Botão:** Limpar preenchimento.

**Confirmação, quando houver dados:** “Limpar esta proposta?”

**Texto:** “Os dados preenchidos serão removidos desta página.”

**Ações:** “Manter preenchimento” / “Limpar proposta”.

**Mensagem após a ação:** “Preenchimento limpo.”

### Copiar

**Botão:** Copiar resumo.

**Sucesso:** “Resumo copiado.”

**Falha:** “Não foi possível copiar automaticamente. Selecione o texto do resumo e copie.”

**Sem itens:** “Inclua itens na proposta para gerar o resumo.”

**Com pendências:** “O resumo inclui os resultados disponíveis e as pendências indicadas.”

Não trocar um resultado pendente por zero para permitir cópia.

## 6. Resumo copiável

Modelo de texto, com linhas não aplicáveis omitidas e informações ausentes explicitadas:

> Calculadora de Cotas — resumo da proposta
>
> {Exemplo fictício, quando aplicável}
>
> Órgão ou entidade: {nome ou “não informado”}
> Estrutura considerada: {descrição ou “não informada”}
> Dados atuais: {por grupo / totais conjuntos / não informados}
> O que representam: {natureza ou “não informado”}
> Data dos dados: {data ou “não informada”}
> Origem dos dados: {origem ou “não informada”}
>
> Composição proposta
> {grupo}, nível {nível}: {quantidade} × {valor-unitário} = {cotas} cotas.
>
> Totais da proposta
> CCESP: {quantidade} cargos e {cotas} cotas.
> FCESP: {quantidade} funções e {cotas} cotas.
>
> Comparação
> {Valores atuais, proposta e diferenças por medida disponível; ou motivo da ausência de comparação.}
>
> Pendências: {pendências existentes; omitir a linha se não houver}
>
> Valores-unitários: Anexo I da Lei Complementar nº 1.395/2023.
> Fonte: {link efetivamente usado}
> Versão da referência: {versão efetivamente usada}
> Consulta da referência: {data da consulta, sem chamar de data de vigência}
> Resumo gerado em: {data e hora}
>
> O resultado descreve os dados informados e não representa aprovação da proposta.

A base atual informada pela pessoa e a fonte dos valores-unitários devem aparecer separadamente. Na comparação conjunta, reproduzir também a nota sobre ausência de autorização para compensar os grupos.

## 7. Referência de cálculo e ajuda final

**Título:** Referência dos valores-unitários

**Texto:** “Valores do Anexo I da Lei Complementar nº 1.395/2023.”

**Link:** Consultar a fonte dos valores.

**Dados próximos ao link:** “Referência: {versão}” e “Consultada em: {data}”. Exibir o que estiver efetivamente identificado, sem inventar responsável ou data de homologação.

**Pergunta de ajuda:** O que são cotas?

**Resposta:** “Nesta calculadora, as cotas são obtidas pela soma das quantidades multiplicadas pelos valores-unitários de cada nível. Elas não são a quantidade de cargos ou funções nem o valor da folha de pagamento.”

**Pergunta de ajuda:** A calculadora aprova minha proposta?

**Resposta:** “Não. Ela organiza os cálculos para apoiar a preparação e a conferência. A análise da proposta segue o procedimento próprio.”

**Pergunta de ajuda:** Posso calcular sem os dados atuais?

**Resposta:** “Sim. Escolha ‘Não informar agora’. Você verá os resultados da proposta, sem comparação com a situação atual.”

**Orientação editorial:** concentrar a explicação do limite do resultado na abertura, na comparação conjunta quando usada e no resumo. Evitar repetir avisos em cada campo. Não incluir F19, valores de subsídio, linguagem de API, banco de dados, motor de cálculo ou detalhes de implementação na experiência da pessoa.
