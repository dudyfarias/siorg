# Design QA — preenchimento automático SGGD, 24/09/2026

> O relato abaixo registra a publicação anterior. A seção final “Calculadora: limites, alocação e saldo” documenta a atualização vigente e substitui o antigo bloqueio de comparação entre os anexos II e III.

## Resultado e escopo

Corrigida a seleção que deixava as quantidades vazias na SGGD. Agora a seleção inicial e cada unidade com referência preenchem a base e a proposta completa. Dados documentais do Anexo II permanecem identificados, sem apresentar conciliação com o Anexo III ou ocupação atual. Não há consolidação de impacto da SGGD.

O relatório anterior está preservado em `evidence/sggd-autofill-2026-09-24/before/design-qa.md`. A implementação anterior, inclusive instruções e README, está na mesma pasta.

## Fonte visual e implementação

Fonte: `evidence/ux-2026-09-24/after-desktop-final.png`, versão anterior no SIORG/DMO com exemplo fictício. Implementação: http://127.0.0.1:4173/.

- `evidence/sggd-autofill-2026-09-24/desktop-preenchido.png`: 1280 × 900 pixels, viewport CSS 1280 × 900, DPR1, no topo; DMO preenchida com dados documentais.
- `evidence/sggd-autofill-2026-09-24/quantidades-dmo.png`: mesmo viewport, foco nas linhas preenchidas da DMO.
- `evidence/sggd-autofill-2026-09-24/mobile-preenchido.png`: 390 × 844 pixels, viewport CSS equivalente, DPR1.

Fonte e implementação desktop foram abertas juntas na mesma entrada de comparação. Não houve redimensionamento nem recorte para essa comparação. Ambas estão no topo. O estado e os valores mudam intencionalmente: exemplo fictício anterior versus base documental atual. O aviso de exemplo deixa de aparecer porque os dados são do quadro; a divergência II/III continua visível. A imagem com foco nas linhas permite conferir os campos que não cabem na primeira tela.

## Superfícies de fidelidade

- Tipografia: Rawline e hierarquia existentes preservadas; rótulos mudaram de “atuais” para “da base”. Na tela móvel, “Quantitativo da base” ocupa duas linhas, sem sobreposição e com inputs alinhados.
- Layout: seletores continuam compactos e na mesma linha, Secretaria antes de Unidade. A 390px, larguras aproximadas de103/207px, mesma coordenada vertical; nenhum overflow horizontal. Cartões e formulário de planilha mantidos.
- Cores: vermelho institucional, fundo cinza, painéis brancos e foco existentes preservados. Base documental somente leitura usa o estilo cinza da base autorizada já existente.
- Imagens: logos locais, fontes e ícones preservados, sem aproximações ou novos ativos.
- Conteúdo: origem “Base do Anexo II”, explicação da divergência e abrangência direta/inclusiva explícitas. Proposta inicia igual à base e se torna editável. Fonte vai para o resumo. Nenhuma mudança visual P0/P1/P2 identificada na comparação.

## Achado corrigido e evidências de funcionamento

Achado inicial: SGGD permanecia vazia ao trocar a unidade porque o bloqueio da consolidação também impedia a carga documental. Correção: referências do Anexo II separadas de uma base reconciliada; carregamento automático não habilita impacto oficial.

Navegador confirmou as seis seleções, sem modal quando não havia edição e com diferença inicial zero. Registro: `evidence/sggd-autofill-2026-09-24/browser-scopes.json`.

| Recorte | Quantidade | Cotas | Abrangência |
| --- | ---: | ---: | --- |
| SGGD inteira | 500 | 1.418,25 | Quadro Anexo II; diverge do resumo III |
| Subsecretaria de Gestão | 66 | 203,75 | Inclui subordinadas verificadas |
| Diretoria Geral de Desenvolvimento e Capacidade Institucional | 44 | 128,30 | Inclui subordinadas verificadas |
| DMO | 7 | 24,70 | Postos diretos |
| Inovação em Gestão Pública | 2 | 10,00 | Postos diretos |
| Normas e Sistemas de Logística | 5 | 16,40 | Postos diretos |

A estrutura inclusiva foi cotejada com Resolução SGGD33/2026, art.1ºIII. Fontes, índices contribuintes e somas estão em `evidence/sggd-autofill-2026-09-24/mapeamento-e-somas.json` e `revisao-calculos-pdf.json`.

Teste DMO: aumentar CCESPnível8 de2 para3 produz8 postos/27,45cotas, delta+1/+2,75, sem alterar a base7/24,70. A troca após edição abre confirmação; cancelar preservou o valor3 e a DMO, confirmar carregou Inovação2/10,00. Voltar à DMO carregou novamente os dados originais. O resumo exportado identifica origem documental, abrangência, valores, divergência e ausência de consolidação. Evidência: `resumo-dmo-teste.txt`.

Educação inteira e Bauru também carregaram automaticamente suas referências, com o impacto compatível preservado. O cancelamento após alteração em Bauru manteve seus valores e total estimado.

## Verificação final e limites

59/59 testes passaram (motor, perfis, resumos e impacto); build final concluído; 4/4 testes de empacotamento passaram. Nenhum novo aviso/erro de console foi capturado no intervalo de QA final e nesta continuação. Há um erro transitório antigo de HMR, já registrado no relatório anterior, sem repetição nesta entrega.

A revisão visual passou na primeira comparação desta correção, sem necessidade de ajustes visuais. O viewport temporário foi removido e a aba permanece aberta na DMO preenchida. A planilha original não foi alterada. Na etapa de preenchimento automático não houve publicação. Continua sem integração, teste em dispositivo físico, ocupação atual comprovada ou homologação institucional. O total500/1.418,25 é a soma do quadroII, não substitui o resumoIII499/1.415,35 e não é um limite conciliado.

## Verificação da publicação Vercel — 24/09/2026

Publicação solicitada pelo usuário para avaliação por terceiros. Alias https://siorg-calculadora-mvp.vercel.app/ retornou HTTP200 sem cookies/autenticação e sem redirecionamento para login. JS e CSS remotos coincidem byte a byte com o build local. Deployment `dpl_5ccpCPTy8kq56q6w12uN8beZGEuC`, READY, target production do projeto de protótipo.

Navegador público: SGGD inicial preenchida; DMO7/24,70; edição para8/27,45 e delta+1/+2,75; Inovação2/10,00 após confirmar substituição; resumo com unidade, origem documental e delta corretos. Console sem erros/avisos. Rótulo público alterado para “Protótipo para avaliação”, preservado “Protótipo local” no desenvolvimento. Novo build e 59testes passaram. Assets e configurações revisados independentemente; trabalhos/documentos ficam fora do upload e da saída estática.

Houve aviso não bloqueante de cobertura de script de instalação esbuild no npm remoto; instalação, build e verificação pública concluíram. Registro detalhado em `evidence/vercel-2026-09-24/`.

final result: passed

## Calculadora: limites, alocação e saldo — 24/09/2026

Regra expressa do usuário: Anexo III representa os limites; Anexo II representa a alocação da estrutura; saldo disponível = limite − alocado. A proposta começa na alocação II. Para uma unidade, a projeção usa II total − II da unidade + proposta completa da unidade. Há quatro comparações independentes (quantidade/cotas de CCESP/FCESP); nenhum saldo compensa outra espécie ou medida. Base e regras continuam em validação técnica.

### Referência visual e evidências atuais

Pasta: `evidence/calculadora-limites-2026-09-24/`.

- `before-desktop.png`: interface anterior, 1280 × 900, rolagem 13,5 px.
- `final-desktop-base.png`: referência atual com limite, alocado e saldo, 1280 × 900, topo da página.
- `final-desktop-dmo.png`: resultado da projeção da DMO, 1280 × 900, após “Ver resultado”.
- `final-mobile-base.png` e `final-mobile-dmo.png`: base/resultado a 390 × 844.
- `final-especies-independentes.png`: redução de FCESP sem ocultar excesso de CCESP.
- `final-resumo-dmo.txt`: texto lido da exportação real do navegador.

Imagens desktop anterior/atual abertas juntas para comparação, sem redimensionamento nem recorte. Considerada a diferença de 13,5 px de rolagem; os blocos novos ocupam deliberadamente mais altura para explicitar as quatro medidas. Os arquivos sem prefixo `final-` desta pasta são capturas intermediárias, anteriores à regra definitiva III/II, e não comprovam a versão entregue.

Tipografia Rawline, logos/ícones locais, cabeçalho SIORG, paleta institucional e largura do conteúdo foram preservados. A mudança substitui os dois campos agregados por duas tabelas compactas, com fontes explícitas e saldo negativo em vermelho acompanhado de texto. Os seletores continuam Secretaria → Unidade na mesma linha. A 390 px, larguras 103,33/206,66 px e mesma coordenada vertical; documento e viewport com largura390, sem overflow horizontal. Tabelas se empilham e mantêm títulos, números e sinais legíveis. O aviso fixo não cobre o título ao navegar por “Ver resultado”. Nenhum defeito visual P0/P1/P2 identificado.

### Conferência funcional

| Cenário | Resultado verificado |
| --- | --- |
| Inicial SGGD | CCESP −1 posto/−3,50 cotas; FCESP 0/+0,60 |
| CCESP nível11: 8→7 | CCESP no limite: 298/1.066,00; FCESP mantém +0,60 cota |
| FCESP nível15: 5→4 | CCESP continua excedido em1/3,50; FCESP saldo1/4,20, sem compensação |
| DMO CCESP nível8: 2→3 | Projeção CCESP300/1.072,25; saldo−2/−6,25; FCESP0/+0,60 |
| Campo da proposta apagado | Limites, alocação e saldo atual continuam visíveis; projeção pendente, sem zero inventado |
| Troca com edição | Confirmação preserva/recarrega conforme escolha; referência canônica da nova unidade |
| Ajuda em tela estreita | Abre por toque/clique, conteúdo legível, Escape fecha |
| Resumo DMO | Fontes III/II distintas, alocado/proposto e saldos corretos; sem bloqueio cruzado obsoleto |

Também conferidos nesta iteração: zero explícito, base manual inválida, exemplo fictício, Educação/Bauru e Saúde sem referência automática. O modo manual conserva a comparação aritmética, sem atribuir disponibilidade automática da SGGD. Não há armazenamento de propostas entre unidades; trata-se de um recorte por vez.

Revisões independentes cobriram o cálculo, a integridade documental, a planilha e o fluxo. 98/98 testes de motor/perfis/saldos/impacto/exportação passaram; build final concluído; 4/4 testes de empacotamento Sites passaram. Build local: `index-PkHaXBNB.js` e `index-D2iWCPn8.css`. Nenhum novo aviso/erro no intervalo da conferência final do navegador. O log histórico contém uma falha transitória de atualização a quente anterior à criação do módulo, corrigida; não se repetiu na verificação final.

### Planilhas e limites da entrega

`planilha-sggd-teste.md/.json` e `planilha-sggd-simulador.md/.json` documentam leitura somente leitura dos arquivos enviados, preservados com hashes conferidos. A nova SGGD_SIMULADOR_.xlsx conecta o cabeçalho ao detalhe e verifica ambas as espécies, mas ainda contém a composição III sob o rótulo II, omite a linha57 nos totais e calcula “cotas atuais” a partir da proposta em J13:J56. Essas falhas não foram reproduzidas no aplicativo. A fonte da alocação é o Anexo II documental conferido; a do limite é o III. O cálculo numérico não homologa a base nem constitui aprovação administrativa. Distribuição, organograma, histórico, CMS e teste em dispositivo físico não fazem parte desta verificação.

Final result da interface e cálculo local: passed.

### Atualização pública verificada

Deployment `dpl_7KYjVVpgn23Lsm9pJuRsK8zAG7Qg`, publicado no alias fixo https://siorg-calculadora-mvp.vercel.app/. Conferência anônima às16:47UTC de24/09/2026 retornou HTTP200, sem redirecionamento ou login; JS/CSS públicos coincidem byte a byte com o build local. Foram enviados28 arquivos da aplicação, respeitando a lista restrita de publicação.

No navegador público: rótulo “Protótipo para avaliação”, saldos iniciais III−II, DMO CCESPnível8 de2→3 projetando CCESP300/1.072,25 e saldo−2/−6,25, FCESPsaldo0/+0,60. O resumo público reproduziu fontes e números e manteve a revisão técnica pendente. Nenhum aviso/erro no intervalo final. Registros: `final-public-http.json`, `final-browser-checks.json`, `final-public-dmo.png` e `final-public-summary.txt`. A aba foi reposta na SGGD inteira e a alteração temporária de viewport foi removida.

Final result da publicação do protótipo: passed. Integração CMS e homologação institucional continuam pendentes.
