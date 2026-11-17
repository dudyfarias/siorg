# SIORG — alinhamento dos três produtos

Registro atualizado em 24/09/2026, a partir do alinhamento e das definições posteriores fornecidas nesta tarefa. A calculadora local já incorpora a relação entre limites, alocação e saldo descrita abaixo. Base e regras permanecem em validação técnica; isso não representa homologação nem aprovação da implementação no CMS.

## Direção e sequência

Calculadora de Cotas e Distribuição de Cargos devem evoluir e ser validadas juntas, começando pela SGGD. A calculadora já mostra a composição proposta e sua relação com a alocação e os limites documentais adotados na simulação. A próxima entrega de distribuição detalhará onde os cargos e funções ficarão, usando a mesma proposta. A representação do organograma decorrerá da estrutura hierárquica conferida. A Linha Histórica vem na sequência.

Os formatos continuam abertos a sugestões. A área técnica revisa regras, referências e informações durante o desenvolvimento. Eduardo prepara a experiência e a implementação no CMS após essa validação. Rafael estrutura o levantamento histórico. A autoria dos modelos iniciais de calculadora e distribuição não foi identificada nominalmente no texto recebido.

## O que existe e o que falta

| Produto | Situação no MVP revisado | Próximo avanço proposto |
| --- | --- | --- |
| Calculadora de Cotas | Na SGGD, carrega a alocação do Anexo II, identifica os limites do Anexo III e mostra saldo atual e após a proposta, separadamente para quantitativos e cotas de CCESP e FCESP. Ao simular uma unidade, mantém o restante da Secretaria. | Validar com a área técnica as fontes, os limites e as demais condições aplicáveis; integrar a futura distribuição à mesma proposta. |
| Distribuição e Organograma | O editor de distribuição e o organograma ainda não estão implementados. A calculadora permite selecionar recortes e simular um de cada vez; trocar de unidade substitui a simulação, com confirmação se houver edição. | Manter as alterações de várias unidades na sessão, distribuir uma proposta conjunta, consolidar totais e representar a hierarquia validada. |
| Linha Histórica | Não implementada neste aplicativo. | Após validar as duas primeiras frentes, transformar o levantamento de Rafael em consulta cronológica por secretaria. |

## Regra já incorporada à calculadora

Por definição explícita do usuário para esta simulação, **Anexo III = limites da Secretaria** e **Anexo II = estrutura alocada**. O saldo disponível atual é **limite do Anexo III − alocado no Anexo II**, calculado de forma independente para quatro medidas: quantitativo CCESP, cotas CCESP, quantitativo FCESP e cotas FCESP. Um saldo negativo indica extrapolação naquela medida; o saldo de outra espécie ou de outra medida não o compensa.

A proposta começa com a composição do Anexo II. Para toda a Secretaria, o saldo após a proposta é o limite do Anexo III menos a composição final proposta. Para uma unidade, primeiro se calcula **alocado total no Anexo II − alocado na unidade no Anexo II + composição final proposta para a unidade**; depois, essa alocação projetada da Secretaria é comparada com os limites do Anexo III. O restante da estrutura fica mantido. A alocação inicial da unidade não é tratada como teto próprio.

Apagar uma quantidade deixa a projeção pendente, preservando o contexto, os limites e o saldo atual. Zero informado é tratado como zero, sem substituir dados ausentes por zero. O resumo identifica as fontes de limite e alocação, a variação local e os saldos atuais e projetados por espécie e medida.

Os valores publicados permanecem preservados. A diferença entre os anexos é utilizada no cálculo segundo essa definição de negócio; ela não bloqueia por si só a projeção descrita acima. A definição não constitui correção dos atos nem validação normativa concluída. A mensagem **“Base e regras em validação técnica”** permanece na experiência e na exportação. Esses saldos aritméticos não representam homologação, aprovação administrativa, ocupação ou vacância.

Essa relação automática entre os dois anexos está implementada para a SGGD. Valores manuais, exemplos e demais secretarias mantêm a comparação aplicável à sua própria base; os limites da SGGD não são transferidos para esses contextos.

## Próxima versão proposta: um cenário, duas visões

1. **Selecionar Secretaria e referência.** Mostrar o quadro de referência, sua data, origem e estado de validação. Identificar a composição aprovada aplicável, inclusive alterações confirmadas pela área técnica, sem presumir que um decreto isolado represente toda a situação vigente.
2. **Preservar o cálculo já implementado.** Na SGGD, começar pela alocação do Anexo II e permitir editar quantidades. Mostrar limites do Anexo III, alocação, proposta e saldo/extrapolação por espécie e medida, mantendo o estado de validação técnica explícito e a interação simples, semelhante à planilha.
3. **Distribuir a mesma proposta.** Usar a Unidade como filtro de edição. Alterar uma unidade, abrir outra e voltar deve preservar as alterações durante a sessão. Mostrar quanto já foi distribuído e quanto falta distribuir por espécie e nível. Se a distribuição ultrapassar a composição definida na calculadora, sinalizar o excesso.
4. **Conferir a Secretaria.** Somar uma única vez cada alocação direta; subtotais de unidades superiores devem ser derivados das subordinadas, nunca somados novamente aos próprios itens. Preservar a identificação completa dos cargos/funções na distribuição, mesmo quando a calculadora agrupar espécies e níveis para a conta.
5. **Representar a estrutura.** Exibir um organograma simples a partir de vínculos hierárquicos conferidos. A ordem das linhas do Anexo II, sozinha, não define subordinação.
6. **Apresentar e validar.** Revisar com a área técnica a correspondência entre proposta, distribuição e regras. Usar as observações para ajustar o modelo antes da integração ao CMS.

Proposta de interação a validar: a calculadora define a composição pretendida; a distribuição aloca essa composição. Se a composição mudar depois, manter as alocações existentes e sinalizar o que precisa ser ajustado. Evitar sincronizações que apaguem ou redistribuam itens silenciosamente. Se a equipe preferir montar a proposta diretamente pela distribuição, o total da calculadora poderá ser derivado dela; escolher um fluxo principal na revisão do modelo.

## Validações e decisões para a área técnica

- Validar as fontes, a vigência e a aplicação da definição adotada: Anexo III como limites, Anexo II como alocação e diferença como saldo. Registrar eventuais alterações ou retificações aplicáveis, sem corrigir o ato por inferência.
- Confirmar quais outras condições restringem o uso do saldo aritmético apresentado. A definição de disponível na simulação já foi adotada; não equivale a ocupação, vacância ou autorização para prover cargos e funções.
- Validar os alertas independentes de quantitativos e cotas por espécie já implementados e esclarecer restrições adicionais por nível, categoria ou combinação, se aplicáveis.
- Quais regras se aplicam à distribuição entre unidades e à alteração da estrutura? Quais operações devem apenas alertar e quais devem impedir a conclusão?
- Qual hierarquia e abrangência devem integrar o primeiro modelo da SGGD? Distinguir cargos diretamente alocados de totais com subordinadas.

A distribuição inicial de uma unidade não deve se transformar automaticamente em teto dessa unidade. O modelo deve distinguir limites compartilhados da Secretaria de eventuais restrições locais expressamente confirmadas.

Essas validações orientarão ajustes das regras e mensagens. Enquanto a revisão técnica estiver pendente, a ferramenta deve preservar a simulação disponível e explicitar seu estado de validação, sem emitir conclusão de conformidade ou aprovação administrativa.

## Critérios para a apresentação da próxima versão

- A proposta inicial reproduz a alocação selecionada e explicita seu estado de validação; na SGGD, os limites do Anexo III aparecem separados da alocação do Anexo II.
- Alterar a unidade A, editar a B e retornar à A preserva as duas alterações durante a sessão.
- Transferir uma alocação entre unidades, sem mudar sua espécie, nível ou quantidade, não altera o total da Secretaria.
- Totais superiores incluem subordinadas uma única vez; expandir/recolher a hierarquia não altera a soma.
- O excesso de uma espécie permanece visível mesmo que a outra tenha saldo.
- Distribuir mais do que a composição proposta sinaliza o excesso; dados faltantes permanecem pendentes e não viram zero.
- A exportação identifica referência, proposta, distribuição e pendências, sem sugerir aprovação administrativa.

Preservar e editar simultaneamente a distribuição de várias unidades durante a sessão é a próxima entrega, ainda não implementada. Salvar cenários entre sessões, permissões, gestão das bases e integração ao CMS são decisões posteriores de implementação; não são capacidades existentes por causa deste alinhamento.

## Linha Histórica, na sequência

Para cada secretaria, organizar os atos em ordem cronológica com data de publicação, vigência quando diferente, resumo objetivo da mudança, fonte oficial e estado de revisão. O levantamento estruturado por Rafael e revisado pela área técnica alimentará a implementação de Eduardo. O primeiro escopo deve privilegiar consulta simples, sem prometer reconstrução automática de qualquer organograma histórico.

## Fontes deste alinhamento

- Mensagens do usuário nesta tarefa: objetivos, sequência, responsabilidades e definição posterior de Anexo III como limites, Anexo II como alocação e diferença como saldo, com base e regras ainda em validação técnica.
- `src/App.jsx`: apresentação de limites, alocação, saldos por espécie e medida, projeção e substituição da simulação ao trocar de recorte.
- `src/quota-availability.mjs`: saldo atual e após a proposta; projeção da unidade mantendo a alocação fora do recorte.
- `src/reference-balance.mjs`: comparações exatas e independentes por espécie e medida, sem compensação ou margem inventada para dados ausentes.
- `src/scenario.mjs`: exportação das fontes, da composição e dos saldos atuais e projetados segundo a definição adotada.
- `README.md` e `evidence/orgaos-2026-09-24/pesquisa-e-proposta.md`: escopo implementado e pendências documentadas. O desenho antigo de preenchimento na pesquisa foi sucedido pelo preenchimento automático documentado no README e no aplicativo.

O fechamento registrado aqui corresponde à calculadora local e à sua exportação. A distribuição conjunta, a memória de alterações entre unidades e o organograma permanecem no escopo da próxima entrega; a Linha Histórica vem depois.
