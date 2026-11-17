# Revisão técnica da interface simplificada

## Estado atual — totais atuais na tela principal e diferenças aritméticas

17/09/2026. A nova versão substituiu a comparação opcional em duas telas por **cotas atuais + quantitativo atual agregados na tela principal**, mantendo as quantidades da proposta, os totais por grupo e duas diferenças imediatas. Esta seção é o resultado vigente; o exame do modal abaixo permanece como histórico.

Versões lidas: `App.jsx` SHA-256 `2a7f01f1accaa99caae44f0703913262162708dd8d321148c3666e5b24b3c5bb`; `calculator.mjs` SHA-256 `7f1d2b63119f187b8a6bc7f37b5f5568ee70e300f9a06a25835faa60632f63d7`. A inspeção da interface continua estática; a coordenação realiza o navegador. Nesta rodada somente `tests/calculator.test.mjs` e este relatório foram editados por esta frente.

**Validação executada: `npm test`, 27 testes aprovados, zero falhas.** Foram preservados os 22 testes existentes e acrescentados cinco testes com múltiplos casos para o novo `comparisonBasis: 'arithmetic'`:

1. As duas diferenças agregadas funcionam sem contexto: proposta 5 postos/5,85 cotas contra atual 4/5,00 produz +1/+0,85. As parcelas CCESP 3,75 e FCESP 2,10 continuam separadas; não se inventa base atual por grupo.
2. Vazio e zero mantêm significados diferentes em cada medida. Base vazia deixa a diferença indisponível; zero explícito permite a subtração. A proposta continua calculada se os atuais não forem informados.
3. O novo modo não permite quantidade negativa/fracionária, separador de milhar ou precisão de cotas inválida; uma proposta incompleta bloqueia os deltas agregados e não apresenta soma parcial como total final.
4. Somente o valor explícito `arithmetic` dispensa o contexto. O modo padrão, `declared-equivalence`, e um valor desconhecido continuam exigindo a identificação/equivalência. A dispensa não transforma `equivalent` em verdadeiro nem declara que data ou natureza foram verificadas.
5. O resumo usa o resultado calculado, informa “Diferenças aritméticas sobre os totais informados” e que natureza/abrangência não foram validadas. Preserva sinal, unidades, fonte e versão da tabela; não afirma equivalência nem autorização. Entradas inválidas permanecem textuais, sem falso zero, inclusive na exportação.

**Conclusão sobre cálculo e resumo:** não foi encontrado defeito material nos comportamentos exercitados. A fonte da tabela continua identificada como LC 1.395/2023, Anexo I, com data da conferência anterior; esta rodada não realizou nova pesquisa normativa nem homologação administrativa. Os resultados novos são aritméticos sobre dados fornecidos pelo usuário.

**Situação dos achados anteriores:** o editor de referência e seus erros deixaram de fazer parte da interface. O código agora inclui fechamento adiado da dica com Escape global e reposicionamento de foco após remoção de linha e limpeza. A eficácia visual/interativa dessas mudanças depende da conferência do navegador.

**P2 residual de associação/foco na inclusão — `App.jsx:84–88` e `127`:** o seletor `new-level` ainda recebe `aria-describedby='add-error'` quando a mensagem corresponde somente à quantidade; os retornos de falha em `addItem` não focam o campo responsável. Não compromete a aritmética, mas pode levar o usuário de teclado a ouvir uma orientação atribuída ao campo errado. Associar a mensagem apenas ao controle inválido; focar quantidade/nível conforme a falha e, no item duplicado, a quantidade da linha existente. A quantidade já possui sua mensagem própria. Este ponto foi comunicado à coordenação; não alterado nesta frente.

## Histórico — versão anterior com editor modal

17/09/2026. Inspeção somente de leitura de `src/App.jsx`, com consulta às regras locais e aos estilos dos elementos envolvidos. Versão examinada: SHA-256 `689fb64827f3e5d19295ae6c059cc0c1936c19c0b5df916985752d5c4ba36065`. As linhas abaixo pertencem a essa versão.

**Atualização de escopo após a leitura:** o usuário solicitou cotas e quantitativo atuais na tela principal, com diferenças imediatas como na planilha. A coordenação iniciou a substituição do editor modal por esse fluxo e informou correções de tooltip e foco. Este documento registra a versão anterior; os achados não constituem avaliação da nova versão. A próxima conferência deverá concentrar-se na identificação das diferenças como aritméticas, na fonte e no resumo.

Não foi usado navegador nesta frente. Os caminhos são sustentados pelo código; posição visual, foco efetivo em cada navegador e anúncios de leitor de tela devem ser conferidos na validação interativa realizada pela coordenação. Não se trata de auditoria completa de acessibilidade. O motor não foi alterado nem seus testes repetidos: a coordenação informou 22 testes e compilação aprovados.

## Resultado geral

O fluxo central corresponde ao recorte solicitado: tipo, nível e quantidade; linhas editáveis e totais imediatos; comparação adicional em janela própria. Não foi encontrado um caminho de mutação dos dados salvos ao cancelar a comparação. Apesar de o estado inicial do editor compartilhar referências, todas as atualizações de números e contexto fazem cópias dos objetos afetados. Só `onSave` grava no estado da página (`App.jsx:60–71`, `81–84`, `178`).

A validação numérica da interface mantém a gramática do motor: quantidades inteiras, cotas com até duas casas, ausência distinta de zero e limite técnico de 128 caracteres. Uma base parcialmente informada é permitida, enquanto ausência total ou valor inválido impede avançar (`47–50`, `74–78`). Alterar base, modo ou metadados invalida a equivalência (`68–71`, `89`). Voltar à etapa de números conserva o rascunho; fechar ou cancelar descarta as alterações. A proposta continua independente da comparação.

## 1. P2 — A dica aberta por hover não tem um percurso contínuo até seu texto nem Escape fora do botão

**Local:** `App.jsx:14–24` e estilo `.help-tooltip`.

**Evidência:** a dica é posicionada 8 px além do botão; o invólucro fecha imediatamente em `onMouseLeave` quando o botão não está focado. Ao tentar atravessar esse espaço com o ponteiro, ele deixa o invólucro antes de alcançar a dica, acionando o fechamento. O tratamento de Escape existe somente no próprio botão de informação. Se a dica foi aberta pelo mouse e o foco continua em outro campo, esse tratamento não recebe a tecla. Dentro da janela, Escape pode cancelar o editor em vez de apenas dispensar a dica.

**Impacto:** dificulta mover o ponteiro para ler o texto e dispensar uma dica sem mudar a posição do mouse. É uma fragilidade específica do modo hover; abrir pelo foco do botão já tem tratamento de Escape.

**Correção sugerida:** manter a dica aberta durante a travessia até ela, com região contínua de interação ou fechamento adiado cancelável ao entrar no conteúdo. Enquanto uma dica estiver aberta, permitir que Escape a feche independentemente de qual controle recebeu o foco, sem fechar a janela naquele mesmo acionamento. Evitar que múltiplas dicas capturem o mesmo Escape de modo conflitante.

**Aceite no navegador:** abrir apenas por hover, alcançar o texto com o ponteiro e lê-lo sem fechamento; deixar o foco em um campo, passar o mouse sobre `i`, pressionar Escape e confirmar que só a dica fechou. Conferir também toque e foco pelo teclado.

## 2. P2 — Os erros de referência não ficam associados aos campos que precisam de correção

**Local:** `App.jsx:80–101`; inclusão de item em `125–129` e `162–164`.

**Evidência:** os erros de contexto aparecem exclusivamente no resumo ao final. Os componentes `Field` de órgão, abrangência, data, fonte e descrição não recebem a propriedade `error`. O seletor de natureza e o checkbox de equivalência também não recebem estado de erro nem associação com a mensagem correspondente. Assim, mesmo após a tentativa de salvar, ao voltar a um campo inválido ele continua sem esse estado e orientação programáticos. O resumo existe e é focável, mas não contém links para os campos.

Na inclusão de uma linha, a mensagem geral de quantidade também é ligada ao seletor de nível por `aria-describedby='add-error'`, mesmo quando o nível está válido. A quantidade tem sua própria mensagem, mas a associação indiscriminada no seletor gera orientação fora do campo correto. Os retornos de falha em `addItem` não movem foco; a tentativa duplicada também não leva à linha existente.

**Correção sugerida:** mapear `contextIssues` por campo após a tentativa, reutilizar o suporte `error` de `Field` e associar mensagens também a natureza/equivalência. Manter o resumo geral, preferencialmente com acesso aos respectivos campos. Na inclusão, associar `add-error` somente ao controle responsável e, em falha, focar esse controle ou a quantidade da linha já existente.

**Aceite no navegador:** tentar salvar referência vazia; cada campo pendente anuncia sua condição e orientação ao receber foco. Ao adicionar com nível válido e quantidade inválida, o nível não anuncia erro de quantidade. A tentativa de item duplicado oferece acesso direto à quantidade existente.

## 3. P2 — Remoções e retorno à primeira etapa não definem um destino de foco estável

**Local:** `App.jsx:67`, `86`, `140–141`, `168`, `172`, `181`.

**Evidência:** o botão de remover linha desaparece junto com a linha e não há reposicionamento de foco. Ao remover a comparação, o botão que abriu a confirmação também sai do documento. Ao limpar tudo, o disparador “Limpar dados” fica desabilitado. A restauração padrão da janela, portanto, não tem um disparador utilizável em todos esses caminhos. O efeito de foco do editor trata apenas a passagem para `reference`; “Voltar aos valores” não define destino na etapa que reaparece.

**Impacto:** o usuário de teclado pode perder a posição da tarefa depois de remover um item ou dados. O destino exato depende do navegador, mas o código não oferece uma alternativa quando o elemento deixa de existir. Ao voltar uma etapa, é possível permanecer no rodapé, sem indicação clara do início dos números.

**Correção sugerida:** após remover linha, focar a quantidade da linha seguinte ou anterior; se não restarem itens, focar nível/quantidade de inclusão. Depois de limpar, focar o início da composição; depois de remover comparação, focar “Comparar com situação atual”. Ao voltar para os números, focar a introdução da etapa ou seu primeiro controle. Preservar a restauração normal ao cancelar quando o disparador ainda existe.

**Aceite no navegador:** executar essas ações somente com teclado e confirmar que o foco fica visível em um controle relacionado à próxima tarefa, sem retornar ao corpo da página ou exigir percorrer o cabeçalho do portal. Cancelar a edição deve devolver o foco ao disparador e manter os dados salvos.

## Roteiro mínimo de regressão para a frente interativa

1. Montar 3 CCESP de nível 2 e 2 FCESP de nível 4: totais 3,75 e 2,10 cotas; apagar uma quantidade e restaurá-la, sem apresentar total parcial como conclusivo.
2. Salvar uma comparação por grupo, reabrir, mudar valores e metadados, voltar uma etapa e cancelar. Totais atuais e referência salvos devem permanecer intactos.
3. Alternar o rascunho entre grupos e agregado, salvar somente o ramo escolhido e confirmar a origem das diferenças; dados não preenchidos continuam “não informado”.
4. Repetir erros, retorno de etapa, remoções e dicas de ajuda conforme os três achados acima.

Nenhum arquivo de implementação foi modificado por esta revisão.
