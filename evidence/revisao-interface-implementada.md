# Revisão independente da interface implementada

14/09/2026. Escopo: leitura de `src/App.jsx` e `src/calculator.mjs`, com reprodução pontual do resumo pelo Node empacotado. Sem navegador, edição de arquivos do projeto ou alteração da calculadora. As linhas abaixo correspondem à versão lida nesta revisão.

## 1. P2 — O resumo expõe identificadores internos e omite entradas atuais inválidas

**Local:** `calculator.mjs:355–376`; metadado adicional em `calculator.mjs:381`.

**Reprodução confirmada:** com quantidade atual CCESP igual a `1.000`, a exportação contém `Cargos CCESP: indisponível — base atual inválida.` e a pendência termina em `[current.groups.CCESP.quantity]`. O texto originalmente digitado não aparece no resumo. As demais pendências também recebem caminhos como `[context.organization]`.

**Impacto:** a pessoa recebe jargão de implementação e não consegue reconstruir o preenchimento inválido após fechar a página, apesar da oferta de resumo com entradas e pendências.

**Correção:** usar rótulos de usuário nas pendências, por exemplo “Quantidade atual de cargos CCESP: informe um número inteiro, sem separador de milhar”. Conservar a entrada inválida como texto identificado, sem convertê-la em número. Omitir “Versão do motor” do resumo comum; a versão da tabela e a fonte continuam necessárias. Metadados de diagnóstico podem permanecer fora do texto destinado à revisão administrativa.

**Aceite:** exportação sem caminhos `context.*`, `rows.*` ou `current.*`; entrada inválida preservada e associada ao campo correto.

## 2. P2 — Confirmação de cópia pode pertencer a um resumo anterior

**Local:** `App.jsx:24–25` e `App.jsx:53`.

**Caminho de estado:** copiar um resumo define `notice = 'Resumo copiado.'`; fechar a janela e editar uma quantidade não limpa esse estado; `openSummary()` gera um novo texto, mas não limpa `notice`. Ao reabrir, o novo resumo já apresenta “Resumo copiado.”, embora a área de transferência ainda contenha a versão anterior.

Há também uma diferença no tratamento de falha: o texto dentro do diálogo só apresenta a mensagem de sucesso. A falha de cópia é enviada ao aviso geral fora do diálogo. Não foi verificada a visibilidade desse aviso sob o modal, mas o feedback local é incompleto pelo código.

**Correção:** manter o estado de cópia ligado à versão do resumo e reiniciá-lo ao abrir/gerar outro texto. Mostrar sucesso ou falha dentro do diálogo, em região de status, e manter a opção de selecionar e copiar manualmente.

**Aceite:** depois de editar e reabrir, nenhum sucesso de cópia aparece antes de uma nova cópia bem-sucedida; falha é informada dentro da janela aberta.

## 3. P2 — Declaração de equivalência continua válida após mudança de contexto

**Local:** `App.jsx:18` (`setContextField`), `App.jsx:40` (mudança de modo), `App.jsx:42` (natureza, origem e confirmação).

**Caminho de estado:** preencher a referência e confirmar equivalência; depois trocar a natureza de “Estrutura autorizada” para “Ocupação”, ou alterar órgão/abrangência/origem. O código preserva `context.equivalent = true` e o motor pode continuar liberando a comparação com a confirmação dada para o contexto anterior. Trocar o modo de base também a preserva.

**Correção:** invalidar a confirmação quando mudar o contexto ao qual ela se refere, especialmente órgão, abrangência, natureza, origem e modo de entrada. A alteração rotineira de uma quantidade não precisa necessariamente exigir nova confirmação; definir esse limite de modo que não atrapalhe a simulação.

**Aceite:** mudar a natureza ou abrangência exige nova confirmação antes de apresentar diferenças, preservando o cálculo válido da proposta.

## 4. P2 — A comparação conjunta omite o total proposto que explica a diferença

**Local:** `App.jsx:28`, `App.jsx:46–47`.

**Evidência no código:** as linhas de comparação exibem o valor atual e a diferença. Não exibem `row.value.proposed`. Na modalidade conjunta, o painel de resultados acima continua mostrando apenas os quatro totais separados; o total conjunto proposto não aparece na página. O resumo traz esse total, mas a comparação em tela exige que a pessoa o reconstrua somando os grupos.

**Correção:** apresentar, em cada medida, “Atual informado”, “Proposta” e “Variação”. Na modalidade conjunta, manter a identificação descritiva e a nota de que não autoriza compensação. Usar unidades claras: cargos/funções e cotas.

**Aceite:** a pessoa consegue verificar a subtração conjunta diretamente na página, sem abrir o resumo ou fazer soma adicional.

## 5. P2 — Erro de quantidade da inclusão está associado ao seletor de nível

**Local:** `App.jsx:21` e `App.jsx:36`; componente `Field` em `App.jsx:9`.

**Caminho:** selecionar um nível, digitar quantidade inválida e acionar “Adicionar”. `draftError` recebe o erro de quantidade, mas `aria-describedby='add-error'` é aplicado ao seletor de nível. O campo de quantidade não recebe `error`, `aria-invalid` nem associação com a mensagem. A emissão `role='alert'` comunica o erro naquele momento, mas não corrige a associação quando a pessoa volta ao campo.

**Correção:** guardar qual campo está inválido, associar a mensagem à quantidade ou ao nível conforme o caso e marcar o controle correspondente. Ao falhar a inclusão, direcionar o foco para o primeiro campo inválido. Usar a mensagem por extenso também na edição das linhas, em vez de “Use um inteiro ≥ 0”.

**Aceite:** o campo de quantidade inválida expõe seu estado e sua orientação ao receber foco; o nível só recebe o erro relativo ao nível.

## 6. P3 — Trocar para “Não informar agora” deixa dados ocultos sem caminho consistente para limpar

**Local:** `App.jsx:16`, `App.jsx:40` e `calculator.mjs:326–331`.

**Caminho de estado:** começar sem proposta nem identificação, selecionar “Por grupo”, preencher um valor atual e voltar a “Não informar agora”. Os valores permanecem no estado, mas `hasData` ignora os dados numéricos ocultos; “Limpar preenchimento” fica desabilitado. Ao voltar ao modo anterior, eles reaparecem.

Se havia metadados completos, o resumo no modo sem comparação continua publicando natureza, fonte e “Equivalência declarada: confirmada pelo usuário”, mesmo quando os campos estão ocultos e não participam da comparação. A preservação desses metadados foi reproduzida no motor.

**Correção:** manter os números ao alternar modos, se esse for o comportamento desejado, mas incluir todos os dados retidos em `hasData`, para que a limpeza continue disponível. No resumo sem comparação, conservar órgão e descrição da proposta e omitir a declaração de equivalência e a referência atual inativa, ou identificá-las explicitamente como não utilizadas.

**Aceite:** qualquer preenchimento retido pode ser limpo; o resumo não apresenta uma referência desativada como base empregada no cálculo comparativo.
