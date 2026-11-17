# Apresentação SGGD — 23/10/2026

**Duração: 4–6 minutos.** Piloto: somente SGGD. Apresentar como **protótipo para avaliação**, com base e regras em validação técnica. Cenário fictício para demonstrar o fluxo; não representa uma proposta institucional aprovada.

Endereço do protótipo: https://siorg-calculadora-mvp.vercel.app/ . Linha do tempo: https://siorg-calculadora-mvp.vercel.app/novas-estruturas . Este roteiro foi conferido no código, no motor local e no ambiente público em 23/10. A suíte automatizada foi reexecutada: **207 testes aprovados**. A conferência pública incluiu o cenário principal, renomeação/transferência, criação/retirada de unidade, troca CCESP/FCESP, alertas, downloads, retomada após recarregar e importação JSON. O portal foi devolvido à base limpa.

**Plano de apoio:** a [cópia pronta da proposta](../outputs/apresentacao-2026-10-23/SGGD-cenario-apresentacao.siorg.json) contém o cenário final com a renomeação/transferência opcional. Abra por **Salvar uma cópia ou começar outra proposta → Abrir proposta salva**. O [PDF](../outputs/apresentacao-2026-10-23/SGGD-Anexo-II-demonstracao.pdf) e o [Excel](../outputs/apresentacao-2026-10-23/SGGD-proposta-demonstracao.xlsx) foram baixados pelo portal e conferidos com a mesma proposta: **407 linhas / 499 postos**. São arquivos de uma demonstração fictícia, não de uma proposta aprovada.

## Antes de apresentar

1. Se houver trabalho que precise guardar, abra **Salvar uma cópia ou começar outra proposta → Baixar cópia da proposta**. Guarde o arquivo `.siorg.json`.
2. Clique em **Começar nova proposta** e confirme. Deve aparecer **Proposta igual à base**. Limpe filtros de busca e desmarque **Somente unidades alteradas**, se necessário.
3. Confira os valores da primeira linha da tabela abaixo. Não comece a demonstração sobre alterações anteriores.

**Quantidade proposta é FINAL:** para passar de 2 para 0, digite `0`; não digite `−2`. Vazio deixa o cálculo pendente. A tabela da unidade mostra alocação direta; o saldo considera todas as unidades da Secretaria.

## Percurso principal

| Tempo | Ação e resultado esperado | Fala sugerida |
| --- | --- | --- |
| 0:00–0:35 | Mostre o rótulo do protótipo, a SGGD e **Ver cálculo**. Identifique Anexo III como limite e Anexo II como alocado. | “Este é o primeiro piloto. A estrutura alocada fica preservada; vamos alterar uma proposta e acompanhar o efeito em toda a Secretaria.” |
| 0:35–1:15 | Em **Unidade**, escolha **SECRETARIA EXECUTIVA**. Na linha **Assessor Especial III — CCESP 2.15**, substitua a quantidade proposta `2` por `0`. Saia do campo. | “Informo a quantidade final. Esta retirada de dois cargos reduz 12 cotas. Não estou alterando a fonte.” |
| 1:15–2:00 | Escolha **CHEFIA DE GABINETE → Incluir cargo ou função**. Modelo **CCESP 2.09 · Assessor I**; mantenha o código **CCESP 2.09**; quantidade `1`; **Incluir na proposta**. | “Agora incluo um cargo de três cotas em outra unidade. A troca de unidade preserva o trabalho anterior.” |
| 2:00–2:30 | Abra **Cotas/Ver cálculo**. Confira proposta **CCESP 298 / 1.060,50 cotas** e **FCESP 201 / 348,75 cotas**. Saldos **CCESP 0 / +5,50** e **FCESP 0 / +0,60**. | “As espécies e as medidas são separadas. Neste cenário não há extrapolação numérica nem novos bloqueios nas regras implementadas. Isso não substitui a validação técnica.” |
| 2:30–3:00 | Demonstre o excesso temporário abaixo e **volte a `1`** antes de continuar. | “Ter cota disponível não permite ultrapassar o quantitativo de cargos.” |
| 3:00–3:30 | Demonstre a ausência de comando abaixo e **restaure o Secretário Executivo para `1`**. | “O saldo numérico e as verificações da estrutura são controles diferentes.” |
| 3:30–4:25 | Abra **Resumo das alterações**: retirada `2 → 0` na Secretaria Executiva e inclusão `0 → 1` na Chefia. Abra **Anexo II**: a linha zerada sai; a incluída aparece. Mostre **Baixar Anexo II em PDF**, **Baixar proposta em Excel** e **Baixar cópia da proposta**. | “Resumo e Anexo II acompanham a mesma proposta completa. PDF e Excel são registros para consulta; o JSON é a cópia para continuar editando no portal.” |
| 4:25–5:10 | Abra **Novas Estruturas**, escolha o bloco **Decreto 70.755/2026** e expanda os atos relacionados: Resoluções **33 e 39**. Mostre as datas e os links oficiais. | “A linha reúne os atos e suas relações. A Resolução 39 revoga somente dois dispositivos da 33; não revoga toda a resolução nem o decreto.” |

### Excesso temporário: quantidade e cotas não se compensam

Na **CHEFIA DE GABINETE**, na nova linha **Assessor I — CCESP 2.09**, mude a quantidade final de `1` para `2`. Não clique em incluir novamente.

Resultado: **299 CCESP / 1.063,50 cotas**. O saldo será **−1 cargo e +2,50 cotas**. Portanto, este exemplo demonstra excesso **de quantidade**, apesar das cotas positivas. FCESP permanece em **201 / 348,75**, com saldo **0 / +0,60**. Não há novo bloqueio estrutural; o excesso numérico é sinalizado e continua exportável como minuta para revisão.

**Volte essa mesma linha a `1`.** O cenário final deve retornar a **298 CCESP / 1.060,50 cotas** e saldo **0 / +5,50**.

Para mostrar **quantidade e cotas excedidas ao mesmo tempo**, use temporariamente quantidade final `4` nessa linha. Resultado conferido na interface: **301 CCESP / 1.069,50 cotas**, com saldos **−3 cargos / −3,50 cotas**. Retorne a `1` antes de exportar o cenário final.

### Alerta de comando: demonstração separada

Somente depois de restaurar o Assessor I para `1`, selecione **SECRETARIA EXECUTIVA**. Na linha **Secretário Executivo — CCESP 1.18**, mude `1` para `0`. Não confunda essa linha com Assessor Especial III, que permanece em `0`.

O alerta esperado é: **“A unidade está sem cargo ou função de comando (código 1). Defina seu titular.”** Esse novo bloqueio impede baixar o Anexo II completo em PDF/Excel. O total será **297 CCESP / 1.051,50 cotas**; saldo **+1 / +14,50**. Há saldo positivo e, ainda assim, existe um problema estrutural detectado.

**Restaure o Secretário Executivo para `1` imediatamente.** O novo bloqueio desaparece; voltam os valores finais e a disponibilidade das exportações. Não use “Restaurar esta unidade”, pois isso também desfaria a retirada do Assessor Especial III.

## Opcional, se houver até 45 segundos adicionais

Escolha **Divisão de Formação e Treinamento**, atualmente vinculada à **Coordenadoria de Difusão de Acervos**. Use **Renomear** para `Divisão de Formação e Treinamento — proposta` e **Aplicar nome**. Depois abra **Ações de unidades → Transferir unidade**, selecione **SECRETARIA EXECUTIVA** como nova unidade superior e **Aplicar transferência**.

O resumo passa a registrar renomeação e transferência. O nome proposto e a nova posição no quadro acompanham o Anexo II. **Quantidades, cotas e saldos não mudam**; neste recorte testado não surgem novos alertas nem bloqueios estruturais. A divisão conserva seu Chefe de Divisão **FCESP 1.10**, quantidade `1`. A operação é apenas demonstrativa; não afirma que essa alteração de vínculo foi administrativamente autorizada.

Para encerrar sem essa parte opcional, restaure **somente essa divisão**, sem marcar subordinadas. Para mantê-la, guarde a cópia JSON depois da transferência. Os valores da tabela seguinte são iguais nos dois casos.

## Conferência rápida dos números

Saldo = limite do Anexo III − proposta. Limites: **CCESP 298 / 1.066,00 cotas**; **FCESP 201 / 349,35 cotas**.

| Etapa | CCESP: quantidade / cotas | Saldo CCESP: quantidade / cotas | FCESP: quantidade / cotas | Saldo FCESP: quantidade / cotas |
| --- | --- | --- | --- | --- |
| Base limpa, Anexo II | 299 / 1.069,50 | −1 / −3,50 | 201 / 348,75 | 0 / +0,60 |
| Retirada dos 2 Assessores Especiais III | 297 / 1.057,50 | +1 / +8,50 | 201 / 348,75 | 0 / +0,60 |
| **Final: inclusão de 1 Assessor I** | **298 / 1.060,50** | **0 / +5,50** | **201 / 348,75** | **0 / +0,60** |
| Excesso temporário: Assessor I final 2 | 299 / 1.063,50 | −1 / +2,50 | 201 / 348,75 | 0 / +0,60 |
| Comando zerado, a partir do cenário final | 297 / 1.051,50 | +1 / +14,50 | 201 / 348,75 | 0 / +0,60 |

Conta independente do cenário final: `299 − 2 + 1 = 298` cargos CCESP; `1.069,50 − (2 × 6,00) + (1 × 3,00) = 1.060,50` cotas CCESP. FCESP não sofre alteração. A proposta total tem **499 cargos/funções e 1.409,25 cotas**; esse agregado não substitui as quatro verificações separadas.

O saldo inicial negativo em CCESP é **herdado da comparação documental entre os Anexos II e III**. Os **oito apontamentos da base** permanecem em validação e são apresentados separadamente. Nenhum deles deve ser narrado como erro criado nesta demonstração ou como prova de ilegalidade. O roteiro não corrige nem homologa a fonte.

## Como guardar e retomar

- **Mesmo navegador:** as alterações são salvas automaticamente quando o navegador permite. Confira a mensagem de salvamento; não prometa armazenamento em conta, no CMS ou em servidor.
- **Cópia portátil:** use **Baixar cópia da proposta**. O arquivo é `SGGD-proposta.siorg.json`. Para continuar, use **Abrir proposta salva**, selecione o JSON e confirme **Abrir esta proposta**; a proposta aberta será substituída pelo arquivo escolhido.
- **Excel da proposta:** registra a simulação nas abas de consulta; não é uma planilha de edição com fórmulas vivas nem o arquivo de retomada do portal. O **modelo original em Excel** é outro download e não incorpora as alterações do portal.
- Ao terminar, deixe o Assessor I em `1` e o Secretário Executivo em `1`, com os saldos finais conferidos. Baixe o JSON desse estado. Se quiser deixar o ambiente limpo, guarde a cópia antes de **Começar nova proposta**.

## Linha do tempo: três atos para apresentar

Fontes normativas conferidas em **22/10/2026**; hoje foi conferido o dataset local, sem nova pesquisa normativa. A linha é o recorte de dez atos selecionados, não um inventário exaustivo nem selo de vigência integral.

| Ato | Data do ato | Publicação | Mensagem central |
| --- | --- | --- | --- |
| Decreto 70.755/2026 | 14/07/2026 | 15/07/2026 | Atualiza os Anexos I–III do Decreto 69.052: estrutura, quadro e resumo de quantitativos/cotas. |
| Resolução SGGD 33/2026 | 22/07/2026 | 24/07/2026 | Detalha a estrutura, cita a cadeia que inclui 70.755 e revoga integralmente a Resolução 25/2025. |
| Resolução SGGD 39/2026 | 23/09/2026 | 25/09/2026 | Revoga somente o art. 76, XI, e o art. 77, VII, da Resolução 33, relativos ao Laudo Técnico Específico para aposentadoria especial. |

Não confundir data do ato, publicação e vigência. Não dizer que a Resolução 39 revogou o Decreto 70.755 ou toda a Resolução 33. As fontes e os dispositivos estão em [linha-tempo-sggd-2026-10-22-fontes.md](linha-tempo-sggd-2026-10-22-fontes.md) e nos links oficiais de cada cartão.

## Apoio para o ensaio e rastreabilidade

| Item | Identificador interno conferido |
| --- | --- |
| Secretaria Executiva | `sggd-unit-ii-6` |
| Assessor Especial III, CCESP 2.15, base 2 | `sggd-position-ii-8`; campo `qty-sggd-position-ii-8` |
| Secretário Executivo, CCESP 1.18, base 1 | `sggd-position-ii-6`; campo `qty-sggd-position-ii-6` |
| Chefia de Gabinete | `sggd-unit-ii-12` |
| Modelo Assessor I, CCESP 2.09 | No seletor público, `sggd-position-ii-274`, confirmado pelo root no DOM em 23/10. Para apresentar, selecionar pelo rótulo **CCESP 2.09 · Assessor I**. |
| Linha incluída, quando esta é a primeira inclusão na proposta limpa | `proposal-position-1`; campo `qty-proposal-position-1` |
| Divisão de Formação e Treinamento | `sggd-unit-ii-452`; superior original `sggd-unit-ii-449` |

Validação executada em 23/10, sem gravar na base: cenário limpo, retirada, inclusão, excesso, restauração, ausência de comando e restauração, renomeação/transferência opcional; totais do motor confrontados com soma independente de quantidade × coeficiente das linhas, usando inteiros; resumo e Anexo II derivados; ida e volta JSON do cenário final e opcional. A primeira execução usou o modelo documental equivalente `sggd-position-ii-19`; uma segunda execução com `sggd-position-ii-274`, presente no seletor público deduplicado, confirmou os mesmos totais finais e ausência de novos alertas. A base permaneceu idêntica antes/depois. Cenário final: **zero alertas novos, zero bloqueios novos, 407 linhas positivas em 221 unidades**. Resumo principal: duas unidades alteradas, uma retirada e uma inclusão. Opcional: três unidades alteradas, mais uma renomeação e uma transferência.

Arquivos consultados: `src/data/sggd-structure.mjs`, `src/structure-proposal.mjs`, `src/proposal-outputs.mjs`, `src/structure-rules.mjs`, `src/proposal-storage.mjs`, componentes da interface e `src/data/sggd-timeline.mjs`. Não houve alteração de aplicativo, fontes, navegador, credenciais ou deploy nesta preparação.
