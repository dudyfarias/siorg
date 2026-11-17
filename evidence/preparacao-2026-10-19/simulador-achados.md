# Preparação do simulador de reestruturação

Conferência local: 19/10/2026. Escopo inicial: leitura do código, dados e instruções do projeto, com execução dos testes existentes. Nenhum código do aplicativo foi alterado. Depois do acesso autorizado ao SharePoint, foram lidos as orientações, o mapeamento, o quadro consolidado e o modelo SGGD — TESTE1. A atualização da seção 13 substitui as pendências genéricas de recebimento presentes na análise inicial. As configurações do CMS continuam sem inspeção.

## 1. O que já pode ser aproveitado

- Estrutura visual SIORG, seleção compacta de secretaria e unidade, ajuda contextual por ícone e comparação por CCESP/FCESP (`src/App.jsx`, `src/SiorgShell.jsx`).
- Cálculo automático exato de quantidade × coeficiente e totais separados por espécie (`src/calculator.mjs:186–267`). Os valores intermediários usam inteiros em centésimos e `BigInt`, sem arredondamento de ponto flutuante.
- Referências documentais da SGGD, identificação de fonte/versão, comparação entre limite do III e alocação do II, saldo e extrapolação (`src/quota-availability.mjs:95–154`).
- Distinção entre dado ausente, inválido e zero; valores incompletos não viram falso saldo disponível.
- Resumo textual com base, proposta, saldos e fontes (`src/scenario.mjs:257–299`). Ainda não é um relatório das alterações estruturais.

## 2. O que ainda precisa ser desenvolvido

- Orientações de entrada baseadas na capa validada das planilhas; seleção dos três modelos efetivos; download do Excel correspondente.
- Estrutura hierárquica completa, com unidades e cargos/funções identificados; edição de uma proposta que envolva mais de uma unidade.
- Resumo de alterações estruturais (o que foi incluído, removido, alterado ou movido, conforme operações autorizadas).
- Geração do Anexo II e Excel da proposta. Hoje o único download do aplicativo é `resumo-siorg-<orgao>-<unidade>.txt` (`src/App.jsx:203–205`). Não há bibliotecas ou rotina de PDF/XLSX no aplicativo.
- Salvar e retomar uma proposta após fechar o portal; identificação de usuário e armazenamento compartilhado quando necessário. Hoje `rows/current` vivem no estado do React, sem persistência (`src/App.jsx:120–128`). O worker apenas entrega arquivos estáticos (`worker/index.js`).

## 3. A mudança central do modelo

O seletor atual carrega um recorte e substitui os dados anteriores; quando existem edições, pede confirmação (`src/App.jsx:167–182`). Isso atende à simulação isolada de um recorte. Para o novo percurso, a proposta deve conter a estrutura inteira do órgão. O seletor de unidade deve somente filtrar a visualização dessa mesma proposta, preservando as alterações feitas nas outras unidades.

O resumo, os cálculos e os arquivos devem ser derivados da mesma versão da proposta. Nenhuma etapa deve pedir o preenchimento novamente nem manter uma cópia independente dos quantitativos.

## 4. Separar estrutura de cálculo

As linhas editáveis atuais guardam apenas `id`, `group`, `level`, `quantity` (`src/organization-profiles.mjs:215–222`). O motor também rejeita duas linhas com a mesma espécie/nível (`src/calculator.mjs:195–224`). Esse formato perde código completo, denominação e unidade de alocação; não basta para reconstruir um Anexo II fiel.

Proposta: conservar cada registro estrutural completo; montar uma visão agregada por espécie/nível somente para chamar o motor de cotas. O resultado agregado nunca deve substituir a estrutura detalhada. O catálogo atual possui uma única versão de coeficientes: a regra aplicável e seus campos precisam ser confirmados em cada novo modelo, sem inventar um multiplicador por órgão.

Há uma fonte local aproveitável para a carga inicial da SGGD: `evidence/orgaos-2026-09-24/sggd-70755-cotejo-doe.json`, com 407 registros contendo unidade, denominação, código completo, quantitativo e linha de origem. Essa extração é datada de 24/09 e não confirma a vigência em 19/10. A hierarquia completa ainda precisa ser cotejada com o modelo recebido e os atos aplicáveis; a ordem das linhas não prova subordinação.

## 5. Contrato de dados proposto

| Conjunto | Campos mínimos | Finalidade |
| --- | --- | --- |
| Órgão/entidade | identificador estável, nome, tipo, versão do modelo, fontes, data da referência, situação de validação | Seleção correta e rastreabilidade |
| Referência vigente | identificador e versão imutáveis; unidades; alocações; fontes/atos | Preservar a base da comparação |
| Unidade | identificador estável, identificador da unidade superior, nome, ordem de exibição, fonte | Hierarquia sem depender de nomes ou posição na planilha |
| Cargo/função alocado | identificador estável, unidade, código completo, denominação, espécie, categoria/nível aplicável, quantidade, origem | Gerar estrutura, resumo e Anexo II |
| Regras/limites | versão, órgão aplicável, coeficientes válidos, limites separados por espécie e medida, fonte | Evitar reaproveitar indevidamente regras de outro modelo |
| Proposta | identificador, órgão, versão da base e das regras, cópia editável da estrutura, revisão, data de criação/alteração, situação | Uma simulação consistente entre unidades e saídas |
| Exportação | identificador/revisão da proposta, data, versão do modelo de saída, título e identificação de proposta | Garantir que PDF e Excel correspondam à tela |

Decisões de persistência (titular, permissões, compartilhamento, conflitos entre revisões) entram conforme a solução aprovada para o CMS. Totais e diferenças são derivados. A referência original permanece preservada. Quantidades usam inteiros; cotas usam representação decimal exata, com a precisão confirmada nos modelos.

## 6. Regras a preservar

- SGGD: Anexo III fornece limites; Anexo II fornece a alocação inicial. Uma divergência entre eles permanece visível, sem alterar dados para forçar igualdade.
- Saldo inicial = limite − alocado; saldo proposto = limite − proposta consolidada. Cada cargo/função deve entrar uma única vez no total do órgão.
- Totais diretos de uma unidade e totais incluindo subordinadas precisam ser diferenciados. Não somar recortes inclusivos sobrepostos.
- CCESP e FCESP, quantitativo e cotas permanecem separados. Não aplicar compensação entre espécies nem tolerância percentual sem regra validada.
- Entidades vinculadas não são automaticamente somadas à secretaria. Cada perfil precisa indicar sua abrangência.
- Regras da SGGD não se aplicam automaticamente às duas futuras entidades. Os modelos da Tatiana definirão o catálogo do piloto; Educação e Saúde existentes no protótipo são exemplos anteriores, não escolhas já confirmadas para esta entrega.

## 7. Percurso sugerido para preparar agora

1. Produtos: explicação curta, orientações expansíveis e escolha de órgão/entidade.
2. Após a seleção: referência e versão identificadas; ações “Simular no portal” e “Baixar planilha”.
3. Simulação: estrutura inicial preenchida, filtro de unidade e edição compacta semelhante à planilha. Quantitativos/cotas e avisos acompanham as alterações, sem exigir uma etapa separada de preenchimento.
4. Revisão: resumo das mudanças e saldo total do órgão. Voltar à estrutura preserva a proposta.
5. Saída: visualizar Anexo II proposto e baixar os formatos implementados e conferidos. Diferenciar Excel de referência e Excel da proposta.

As quatro entregas funcionais podem aparecer como seções de um mesmo ambiente. Não é necessário transformar o cálculo simples em um formulário longo com muitos passos.

## 8. Critérios de aceite do teste interno

1. Selecionar um modelo mostra apenas estrutura, orientações, regras e planilha daquele órgão; ausência de dado não vira zero.
2. Sem edição, proposta e Anexo II de referência coincidem por unidade, código, denominação e quantidade; cotas conferem por espécie.
3. Alterar a quantidade em uma unidade atualiza cálculo, saldo, resumo e exportação com o mesmo valor.
4. Editar uma segunda unidade e voltar à primeira preserva ambas; o total do órgão incorpora as duas alterações uma única vez.
5. Se forem autorizadas mudanças de unidade, nome ou código, o resumo as identifica sem reduzir tudo a “aumento/redução de cotas”. Uma movimentação sem mudança de quantidade não duplica postos.
6. Saldo negativo identifica a espécie e a medida excedidas. Um excesso preexistente continua identificado e separado do efeito da proposta.
7. Campos incompletos bloqueiam a apresentação de uma proposta completa e a exportação conclusiva; não apagam a referência.
8. PDF e Excel gerados correspondem à mesma revisão exibida, têm nome/versão do órgão, totais conferidos e estrutura legível. Verificar paginação/cabeçalhos do PDF e fórmulas/faixas do Excel, incluindo a última linha.
9. Ajuda funciona com mouse, teclado e toque; é possível percorrer os controles sem mouse; erros e atualizações ficam perceptíveis sem depender só de cor.
10. Se persistência entrar no teste, fechar/reabrir restaura exatamente a proposta e sua versão; testar também o comportamento de sessão expirada e a permissão de acesso. Se ainda não implementada, não apresentar botão que sugira salvamento permanente.

## 9. Perguntas objetivas para a confirmação técnica do CMS

- Qual é o ambiente de teste, como será publicado o componente e quais permissões Eduardo/Tatiana têm para código interativo e recursos estáticos?
- A solução será incorporada no CMS ou integrada como aplicação em ambiente institucional aprovado? Quais restrições a scripts, dependências, chamadas a serviços e downloads existem?
- Há identificação institucional do usuário e armazenamento aprovado para rascunhos? A proposta precisa continuar em outro dispositivo ou ser compartilhada? Quem pode ler e editar?
- Há serviço disponível para salvar/carregar propostas? Como tratar limites de tamanho, versões concorrentes, expiração e recuperação?
- O PDF e o Excel podem ser gerados no navegador, ou há serviço de geração institucional? Qual é o modelo de Anexo II validado e quais formatos são exigidos para o primeiro teste?
- Qual o tamanho do maior órgão do piloto e o volume esperado de usuários simultâneos? Quem acompanha o ambiente e aprova os critérios de desempenho?

O acesso de edição de conteúdo não comprova permissão para publicar aplicações, persistir dados ou gerar arquivos. Estas respostas não foram obtidas nesta leitura local.

## 10. Onde medir possíveis gargalos

Não foi identificada nem medida falta de capacidade do servidor. O risco imediato é confirmar o caminho de integração, o modelo completo dos dados e o salvamento. Depois, medir: carregamento da maior estrutura; tempo de recalcular após edição; tamanho e duração dos arquivos gerados; quantidade de salvamentos; usuários simultâneos; erros e latência dos serviços.

Cálculo e exportação no navegador concentram trabalho no dispositivo do usuário. Persistência, autenticação e eventuais exportações no servidor mudam a demanda de infraestrutura. Portanto, dimensionar depois de confirmar a arquitetura e com o modelo real, sem estimar limite de capacidade pela aparência do portal.

## 11. Ordem de implementação proposta

1. Conferir os modelos e confirmar operações permitidas; congelar uma referência versionada da SGGD.
2. Criar o modelo de proposta completa e o adaptador para o motor existente.
3. Preparar seleção/orientações/download e a edição simples da estrutura.
4. Ligar cálculo, comparação e resumo à mesma proposta.
5. Gerar Anexo II e exportações a partir do modelo validado.
6. Integrar persistência e CMS conforme resposta técnica; testar perdas, permissões e continuidade.

Para a quarta-feira, distinguir no plano o percurso de teste preparado das funcionalidades efetivamente integradas. A entrega de três modelos preenchidos depende de receber os outros dois modelos e suas bases; não preencher lacunas com os exemplos antigos.

## 12. Validação realizada nesta leitura

Executados em 19/10/2026 os testes existentes de cálculo, cenário, perfis, balanço e disponibilidade: **98 passaram, 0 falharam**. Comando: runtime Node do bundle 26.1017.11052, `node --test --test-reporter=spec tests/calculator.test.mjs tests/scenario.test.mjs tests/organization-profiles.test.mjs tests/reference-balance.test.mjs tests/quota-availability.test.mjs`.

Isso confirma a regressão coberta pelos testes atuais. Não valida regras ainda não recebidas, a vigência das referências, o novo fluxo estrutural, os arquivos futuros nem a integração no CMS.

## 13. Atualização após recebimento dos materiais do SharePoint

Leitura em 19/10/2026, sem editar os originais e sem executar os comandos/prompts contidos no documento. O texto foi tratado como fonte de requisitos para o trabalho solicitado. Foram usadas as skills de documentos e Spreadsheets e o runtime Python do bundle. Esta etapa examinou conteúdo e cobertura, sem recalcular as planilhas ou confirmar juridicamente seus enunciados.

### Materiais efetivamente recebidos e função

| Fonte local | Conteúdo observado | Consequência para o plano |
| --- | --- | --- |
| `Downloads/OneDrive_1_19-10-2026/Orientacoes_simulador_cotas.docx` | Roteiro para SGGD, autarquia e agência, operações, saídas, regras a conferir, critérios de teste e fontes | As orientações de trabalho já foram recebidas. Falta adaptação editorial ao portal e aprovação do texto final, não começar essa orientação do zero |
| `Downloads/SGGD- TESTE1.xlsx` | Cinco abas: Instruções, Reestruturação, Anexo II, Calculadora e Resumo; estrutura detalhada e fórmulas de saída | O modelo SGGD citado no roteiro foi localizado. Deve substituir a indicação genérica de “modelo SGGD ainda não recebido” |
| `Downloads/OneDrive_1_19-10-2026/mapeamento_CCESP_FCESP_SP_2026 (1.2).xlsx` | Data de corte declarada 01/10/2026; catálogo de setores, atos, fontes, regras gerais e consolidações por regime; inclui pendências e perguntas | Material de apoio recebido. Não é autorização para transportar regras gerais indiscriminadamente nem prova de validação de cada enquadramento |
| `Downloads/OneDrive_1_19-10-2026/Quadro_consolidado_cargos_cotas_siorg_estrutura_dentro_de_cada_orgao.xlsx` | Resumo e 40 abas de órgãos/entidades, com quadros numéricos e, em várias abas, área de cadastro de unidades | A cobertura ampla ajuda a localizar candidatos e referências. Não equivale a 40 modelos completos e homologados nem define os três pilotos |

O roteiro mantém `[NOME DA AUTARQUIA]` e `[NOME DA AGÊNCIA]` como campos a escolher (seções 10 e 11). Detran-SP aparece somente como exemplo na seção 5. A composição do piloto está definida por regime: **SGGD + uma autarquia + uma agência reguladora**; não encontrei a escolha nominal das últimas duas nesses materiais. As abas ARSESP, ARTESP e SP-Águas do consolidado demonstram cobertura da base, não uma decisão de piloto.

### O que acrescentar ou precisar no plano de trabalho

1. **Recebimento:** atualizar “Materiais ainda necessários”. Orientações, mapeamento, consolidado e TESTE1 já estão disponíveis. Permanecem confirmação dos dois pilotos, modelos específicos correspondentes, validação dos dados/regras e condições do CMS. Fontes oficiais completas de cada base precisam ser conferidas separadamente.
2. **Ponto único de edição:** a Reestruturação é o único preenchimento do usuário. Vigente fixo e proposta ativa separados. No Excel, campos amarelos; no portal, controles editáveis claramente identificados. Anexo II, cálculo e resumo são resultados da mesma proposta.
3. **Operações já previstas no modelo:** manter, acrescentar e retirar cargos; criar, manter, renomear, transferir e retirar unidades. O texto do plano não precisa apresentá-las como possibilidades ainda desconhecidas; deve dizer que serão implementadas conforme os parâmetros e exceções validados. Não considerar isso autorização para qualquer operação em qualquer entidade.
4. **Quantidade sem dupla contagem:** TESTE1, `Reestruturação!A5`, explica aumento de 2 para 3 como manter 2 e acrescentar 1. O roteiro aceita avaliar edição direta da quantidade final, desde que fórmulas e instruções sejam ajustadas. O portal pode oferecer a quantidade final simples e derivar o movimento, preservando o resultado; escolher uma semântica única e registrar esse ajuste, sem somar ambas.
5. **Anexo II especificado:** automático e somente leitura; quatro colunas, UNIDADE, QTD, DENOMINAÇÃO CARGO/FUNÇÃO e CCESP/FCESP. Excluir unidades retiradas, cargos retirados, quantidades zero e áreas de criação vazias. Não exportar ações, alertas, cálculos ou observações internas. Exportar toda a estrutura, mesmo com grupos recolhidos. Fonte: roteiro seção 4 e `TESTE1!Anexo II!A6:D6`.
6. **Resumo mais preciso:** identificar origem/destino das transferências, renomeações, inclusões e retiradas, unidade e impacto. Manter cargo não é uma alteração; transferir muda alocação e não cria outro cargo.
7. **Regras estruturais:** preparar matriz com condição, exceção, dispositivo, verificação e mensagem. Separar aviso, justificativa e bloqueio com a DMO. Cobrir titularidade, hierarquia, níveis, cargos de comando/assessoramento, vínculos e requisitos de subordinadas, conforme regime. O documento determina conferir os atos antes de implementar; não converter o mapeamento em validações cegas.
8. **Novo campo funcional do plano:** o modelo inclui valor mensal de referência e sua variação, além de quantidade e cotas. Há também percentual de variação quantitativa, que fica vazio quando o vigente é zero. Prever essa saída e sua dependência de tabela remuneratória, fonte e vigência conferidas; explicar que não representa a folha completa. Fonte: `TESTE1!Instruções!A14:A18`, `Calculadora!A15:L15` e roteiro seção 4.
9. **Casos de teste:** acrescentar retirada/transferência de subordinada atualizando o aviso da unidade superior; cargo distinto na mesma unidade; nova unidade disponível nas opções de vínculo; exclusão de zeros na saída; exportação independente do recolhimento visual; nenhuma simulação de teste remanescente no modelo de entrega.
10. **Compatibilidade Excel:** o roteiro pede teste efetivo de matrizes dinâmicas na versão de Excel escolhida. TESTE1 contém fórmula de matriz no Anexo II. Abrir o arquivo ou preservar a fórmula não comprova que ela se atualiza no Excel utilizado pela equipe.
11. **Validação e implementação:** o documento diz que implementação no CMS será posterior à validação técnica dos modelos. A preparação local do percurso e do contrato de dados pode avançar, mas isso não equivale a liberar regras não conferidas no portal.

### Diferenças importantes entre as fontes recebidas

- **O consolidado não substitui TESTE1.** Sua aba SGGD tem 61 linhas, estrutura numérica por código e orienta editar apenas quantidade proposta (`SGGD!A10`); TESTE1 tem cinco abas e Reestruturação com hierarquia, vínculos e operações. O consolidado ainda reflete o percurso anterior de quantidade primeiro e cadastro de estrutura depois em outras abas (`DETRAN!A66:A67`, por exemplo).
- **Não importar seus números automaticamente:** o consolidado registra, na SGGD, 495 na quantidade alocada/proposta (`SGGD!C8:D8`), enquanto o TESTE1 explica 500 na transcrição do II e 499 no III (`Instruções!A18`). São divergências de fonte/modelo para conferir, não motivo para substituir silenciosamente o aplicativo.
- **Remuneração exige atualização:** TESTE1 declara o fator de R$ 2.966,00 (`Instruções!A17`, `Reestruturação!DI1:DI2`). O roteiro pede sua conferência com as tabelas vigentes antes de apresentar valores financeiros atuais. Não assumir esse fator como confirmado.
- **Referências dos anexos merecem cotejo:** o roteiro identifica Anexos III e IV da LC 1.395/2023 para valores unitários, enquanto o TESTE1 traz indicação do Anexo I junto ao valor mensal-base. Os enunciados tratam referências que precisam ser lidas nos textos oficiais e distinguidas por finalidade; esta revisão de cobertura não estabelece qual artigo/anexo deve alimentar cada valor.
- **Agências têm tratamento próprio:** o roteiro manda distinguir unidades, colegiados e cargos, verificar cargos especiais e não presumir FCESP. O contrato precisa permitir categorias que não entram no cálculo comum, identificadas separadamente, quando o modelo validado assim determinar.
- **A existência de referências não comprova os limites:** o consolidado registra para ARSESP que sua deliberação distribui o quadro e que a norma autorizativa do limite ainda deve ser vinculada (`Resumo!J43`). Não usar quadro distribuído como teto só porque há números nas colunas “limite”.

### Rastreabilidade da leitura

Extrações locais auxiliares: `orientacoes-simulador-extraidas.json`, `cobertura-mapeamento.json`, `cobertura-quadro.json`, `cobertura-teste1.json`. Os arquivos originais foram abertos apenas para leitura. O documento não contém comentários nem alterações controladas na extração examinada. Não foram executados novos testes de fórmulas e nenhum modelo foi aprovado por esta conferência.
