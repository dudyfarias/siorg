# Seletores de secretaria e unidade — roteiro crítico

Preparado em 24/09/2026. Escopo: revisão preventiva de código, rótulos e regras de apresentação, antes da implementação dos seletores. **Ainda não executado na interface.** A revisão do diff e a navegação visual devem registrar seus próprios resultados; este roteiro não é aprovação visual nem declaração de conformidade de acessibilidade.

Base consultada: `AGENTS.md`, `src/App.jsx`, `src/calculator.mjs`, `evidence/orgaos-2026-09-24/pesquisa-e-proposta.md`, `arquitetura.md`, `educacao.md`, `sggd.md`, `saude.md` e `sggd-doe-cotejo.md`. Critérios de clareza, estados, recuperação e acesso por teclado da skill Product Design/audit; nesta etapa não houve navegação ou captura de tela.

## Decisões de texto antes da apresentação

- Manter **Secretaria → Unidade** próximos e antes dos dois totais. A seleção identifica o recorte de toda a conta. Opção **Toda a secretaria**; não listar autarquias como unidades da administração direta.
- Separar **Base do decreto** de **Valores atuais informados**. No modo automático, usar **Cotas da base**, **Quantitativo da base** e coluna **Base** (ou equivalente com origem explicitamente visível). Não apresentar quantitativo autorizado como quantidade ocupada ou saldo disponível.
- Ações inequívocas: **Usar base do decreto** e **Informar valores atuais**. Uma edição dos valores copiados muda a origem exibida para **Valores informados manualmente**, mantendo a fonte anterior apenas como rastreabilidade, nunca como certificação do valor editado.
- Na tabela por níveis, trocar **Cotas por unidade** por **Valor unitário** ou **Cotas por cargo/função**: com o novo seletor, “unidade” também significa unidade organizacional.
- Título de resultado identifica o recorte. A ajuda da proposta deve informar **“Monte a composição final deste recorte, incluindo os postos mantidos.”** Uma lista apenas de acréscimos não substitui a composição completa.
- Pendências são do cadastro, sem aparência de erro cometido pelo usuário: **SGGD: “Divergência entre anexos — base automática pendente.”** **Saúde: “Base atual pendente de confirmação.”** O preenchimento manual continua disponível.

## Roteiro enxuto de aceitação

| # | Ação / cenário | Resultado esperado |
|---|---|---|
| 1 | Abrir a calculadora sem preencher | Dois seletores dependentes e os dois totais fáceis de encontrar; nenhuma base desconhecida convertida em zero. A conta simples segue possível sem formulário administrativo longo. |
| 2 | Selecionar Educação / Toda a secretaria e usar a base do decreto | Preencher **4.284,85 cotas / 2.066 postos**, identificados como referência do Decreto 70.042/2025, com data/versão e link. Detalhamento, se exibido: CCESP **3.089,50 / 1.246**; FCESP **1.195,35 / 820**. Não alterar coeficientes por nível ao selecionar a secretaria. |
| 3 | Editar um dos totais copiados ou escolher preenchimento manual | A origem deixa de ser automática. Se o outro valor copiado for conservado, o conjunto fica claramente manual, sem alegar que a nova dupla consta do decreto. Restaurar a base só ocorre por ação explícita; não sobrescrever a edição por recalculação. |
| 4 | Em cenário preenchido, tentar trocar Secretaria; cancelar, depois confirmar | **Cancelar:** seleção, unidade, base, origem, proposta e rascunho permanecem iguais. **Confirmar:** mudar o contexto inteiro; unidade volta para Toda a secretaria, e dados incompatíveis são limpos/reinicializados de modo informado. Nunca mostrar Saúde com números da Educação. |
| 5 | Trocar somente Unidade, inclusive quando há apenas rascunho ou total “0” | Mesma proteção da troca de secretaria. Zero informado conta como dado. Não manter a proposta do órgão sob a base de uma unidade ou a base de um filho sob título do pai. Fechar ou invalidar resumo antigo. |
| 6 | Selecionar uma unidade | Mostrar somente recortes documentados da secretaria; declarar **postos diretos** ou **inclui subordinadas**. Se cobertura/composição não estiver validada, usar base manual/estado pendente, sem subtotal presumido por ordem das linhas. Nomes longos continuam reconhecíveis. |
| 7 | Comparar uma proposta de unidade | A comparação principal usa a base dessa mesma unidade. Exemplo didático: base **10,00 cotas / 5 postos**, proposta **12,00 / 6** → diferenças **+2,00 / +1**. Não usar o total da secretaria como denominador da unidade. |
| 8 | Pedir ou mostrar impacto na secretaria | Somente com base completa, reconciliada e compatível, mesmo recorte e proposta final completa: **total da secretaria − base da unidade + proposta da unidade**, por espécie. Exemplo didático compatível: **100,00 − 10,00 + 12,00 = 102,00**. Resto preservado; pai/filho não duplicados. Com Toda a secretaria, evitar painel duplicado do mesmo total. |
| 9 | Unidade manual, composição incompleta, origem/data incompatível ou cobertura desconhecida | A conta local permanece disponível quando numericamente possível; impacto geral fica **não calculado**, com motivo curto. Campos vazios/linhas inválidas não viram zero, nem subtotal parcial é apresentado como total final da secretaria. |
| 10 | Selecionar SGGD | Pendência visível e base automática indisponível. Nenhuma escolha silenciosa entre **499 / 1.415,35** e **500 / 1.418,25**. Valores documentais, se apresentados em detalhe, identificam o anexo. Não habilitar impacto consolidado por unidade enquanto o conflito persistir. |
| 11 | Selecionar Saúde | Campos manuais vazios e estado de referência pendente. Não pré-carregar o quadro histórico de 2024 nem o de hospital autárquico. Não aplicar fator pela jornada de 30 horas ou remuneração. |
| 12 | Copiar/baixar resumo, carregar exemplo e limpar | Resumo identifica secretaria, unidade, cobertura, origem e valores efetivamente usados, fonte/versão e pendências. Exemplo é fictício e não fica associado ao selo de decreto. Limpar cumpre o texto do diálogo; não deixa origem automática ou resumo de outro contexto escondidos. |

Os números dos passos 7–8 são exemplos de teste, não bases institucionais.

## Pontos funcionais a conferir no diff

1. **Transição atômica de contexto.** A mudança pendente fica separada da seleção ativa até a confirmação; cancelar não precisa reconstruir estado já sobrescrito. Atualizar/limpar também origem da base, rascunho, erros, exemplo, resumo e estimativa geral. Se o projeto optar por guardar cenários separados, restauração deve ser explícita e por identificador, nunca por nome de exibição.
2. **Presença de dados.** A verificação deve incluir linhas, rascunho, campos agregados ou por espécie e zero digitado; não usar conversão numérica booleana que trate `0` como vazio. Uma simples troca do tipo CCESP/FCESP no rascunho não precisa criar falsa confirmação.
3. **Proveniência consistente.** O texto do resumo e o painel visível devem derivar do mesmo contexto/base. O `comparisonBasis: 'arithmetic'` continua sendo conta descritiva; perfil normativo não autoriza rótulos “aprovado”, “dentro do limite”, “vagas disponíveis” ou “economia” pelo sinal da diferença.
4. **Consolidação separada.** A comparação da unidade não depende de metadados extras para funcionar. A estimativa da secretaria exige, separadamente, dados completos e compatíveis por espécie. Não compensar aumento CCESP com redução FCESP para emitir conclusão administrativa.

## Verificação de tela a executar pela coordenação

- Teclado percorre Secretaria → Unidade → origem/base → proposta sem saltos. Troca confirmada anuncia o recorte e devolve foco útil; cancelar devolve foco ao seletor acionado. Diálogo fecha por Escape sem aplicar mudança.
- Ajuda aparece por foco/toque; estado pendente tem texto, não só cor ou ícone. Se uma ação está desabilitada, o motivo está visível ou acessível fora do controle desabilitado.
- Em largura móvel, nomes e motivo da pendência não ficam cortados, os dois totais continuam reconhecíveis e botões não se sobrepõem. Conferir também zoom e alto contraste do shell.
- Se a UI estimar impacto geral, o resultado da unidade permanece hierarquicamente principal e a fórmula/abrangência pode ser consultada sem poluir a conta básica.

## Registro de execução

- Revisão preventiva de fontes e App anterior: **concluída**.
- Revisão do diff implementado e dos ajustes finais de `src/App.jsx`: **concluída em 24/09/2026**. Não foram confirmados problemas P0/P1 nesta revisão de código.
- Conferência direta dos módulos com os perfis reais: Educação **2.066 postos / 4.284,85 cotas** e URE Bauru **16 postos / 31,30 cotas**, ambos com diferença zero contra a própria base; impacto da URE preserva o total inicial de **2.066 / 4.284,85**. Essa execução não substitui teste da interface.
- Testes de navegador: conduzidos pela coordenação. Nesta frente não houve navegação nem inspeção independente de capturas; não se declara aprovação visual ou conformidade integral de acessibilidade.

### Encerramento dos dois P2 identificados

1. **Identificação livre da unidade manual — corrigido.** `customLocked` protege o nome ao adicionar item, informar base com nome existente ou carregar exemplo. O `onBlur` cobre a identificação preenchida depois dos valores. O botão **Alterar unidade** chama o mesmo fluxo de contexto: cancelar conserva os dados; confirmar executa `resetValues`, limpa a identificação e libera o campo. `resetValues` também remove resumo, origem de referência, exemplo e rascunho. Código reconferido; a coordenação informou ter confirmado no navegador o campo somente leitura, o cancelamento preservando dados e a confirmação limpando/liberando.
2. **Pendência da Saúde pouco explícita — corrigido.** Com Saúde / Toda a secretaria, o título do detalhe fechado apresenta **Base atual pendente de confirmação**. “Outra unidade” mantém a distinção **Referência informada manualmente**. A mensagem principal da SGGD continua sinalizando a conciliação pendente.

**Conclusão desta frente:** os dois achados foram resolvidos no código revisto. Não resta pendência P0/P1/P2 confirmada nesta revisão específica. A conclusão é limitada ao fluxo, rótulos e módulos inspecionados; fontes institucionais pendentes, testes visuais e acessibilidade mantêm seus limites próprios.

## Atualização: preenchimento automático e referência documental da SGGD

Revisão somente de código após a inclusão do preenchimento automático em 24/09/2026. Esta seção atualiza os critérios anteriores de carregamento por botão e de indisponibilidade da base SGGD: a escolha de um recorte com referência agora carrega sua base e composição automaticamente. Na SGGD, a origem é **Base do Anexo II**, com conflito explícito, e não referência reconciliada.

- `referencePreset` inicializa base e composição da mesma seleção. `applyContext` limpa rascunho, erro, exemplo, resumo, identificação personalizada e indicador de edição antes de aplicar a nova referência. Sem referência disponível, os campos começam vazios.
- `edited` é marcado ao alterar base, linha, rascunho, adicionar/remover item ou converter uma base em manual. `requestContext` mantém a seleção ativa até a confirmação; fechar/cancelar limpa somente a seleção pendente. O nome de unidade personalizada também protege a troca. Bases apenas carregadas podem mudar de recorte sem modal, pois não contêm edição do usuário.
- `loadReference` restaura os dados do recorte selecionado e reinicia o estado de edição; quando existem edições, o botão abre a confirmação antes da substituição. `clear` continua exigindo confirmação explícita.
- A base documental fica somente leitura e seus rótulos/ajudas distinguem o quadro do Anexo II de ocupação atual e limite reconciliado. Os recortes preservam a abrangência documentada. A conversão manual muda a origem e continua bloqueando consolidação.
- `calculateOrganizationImpact` rejeita a origem documental com motivo `documentary_conflict`; os rótulos da comparação e o resumo preservam a fonte documental e a pendência. A nova base não habilita silenciosamente o impacto geral da SGGD.

**Resultado desta revisão breve:** nenhum problema material P0/P1/P2 confirmado no fluxo de preenchimento automático e proteção das edições inspecionado. A coordenação informou teste de navegador Educação → Bauru sem modal quando não havia edição e confirmação/cancelamento preservando dados após alterar CCESP nível 5. Esta frente não repetiu a navegação e não atribui aprovação visual própria a esse relato.
