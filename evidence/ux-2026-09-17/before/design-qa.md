# Revisão do MVP — Calculadora de Cotas / SIORG

Data: 14/09/2026.

final result: passed

## Alvo e limite da comparação

Referência visual: https://www.siorg.sp.gov.br/siorg/produtos/materail%20Instrucional, observada no navegador nesta sessão. Implementação: http://127.0.0.1:4173/.

O cabeçalho, as marcas, a navegação, as fontes, a área cinza, o título com filete vermelho e o rodapé seguem a estrutura do SIORG. O conteúdo de Material Instrucional não é o conteúdo da calculadora: formulário, resultados, comparação e resumo são a nova funcionalidade solicitada. A diferença de densidade e de altura nessa área é intencional, e não uma tentativa de copiar os cartões de materiais.

Fonte preservada em `evidence/captures/siorg-desktop.png`, `siorg-mobile.png`, `siorg-mobile-menu.png` e `siorg-footer.png`. Assets de origem registrados em `evidence/source-assets-manifest.json` e copiados para `public/assets/`.

## Evidências visuais

| Superfície | Fonte | Implementação | Dimensões e estado |
| --- | --- | --- | --- |
| Desktop completo no primeiro viewport | siorg-desktop.png | mvp-desktop-final.png | 1440 × 1000 px e CSS px, DPR 1; topo, menus fechados, padrão. Calculadora vazia. |
| Mobile completo no primeiro viewport | siorg-mobile.png | mvp-mobile-final.png | 390 × 844 px e CSS px, DPR 1; topo, menu fechado, padrão. |
| Navegação móvel | siorg-mobile-menu.png | mvp-mobile-menu.png | 390 × 844; menu principal aberto. |
| Rodapé | siorg-footer.png | mvp-footer.png | 1440 × 1000; final da rolagem, rodapés alinhados na base do viewport. |
| Formulário móvel | Proposta e contrato em evidence/ | mvp-mobile-form.png | 390 × 844; exemplo fictício de dois itens, valores-unitários visíveis. |
| Resultados móveis | Proposta e contrato em evidence/ | mvp-mobile-results.png | 390 × 844; exemplo fictício, atual/proposta/diferença. |
| Texto ampliado e contraste | Requisitos do MVP | mvp-mobile-contrast.png | 390 × 844, texto 125%, alto contraste. |
| Tamanho intermediário | Estrutura SIORG e adaptação do formulário | mvp-tablet.png | 1024 × 900; estado vazio. |

Todos os nomes de imagem acima estão em `evidence/captures/`. As capturas da fonte e da implementação foram apresentadas juntas, no mesmo retorno visual do navegador, antes do julgamento. Não houve redimensionamento das imagens finais: os arquivos guardados usam os pixels do viewport. A captura CUA foi usada porque a alternativa de screenshot da API secundária devolveu escala diferente em uma observação inicial; essa captura inadequada não embasa a aprovação.

Comparação de visão completa feita para desktop e mobile. Comparações focadas incluíram o menu móvel aberto e o rodapé, além dos estados de formulário/resultados e acessibilidade. Marcas, nav e título são legíveis a 1:1 na captura desktop; não foi necessário gerar cortes artificiais.

## Achados e correções

1. **P2 — versão inicial móvel:** SP.GOV.BR ficou sem contraste e os botões flutuantes cobriam a área de leitura. Evidência: primeira comparação com `mvp-mobile.png`. Correção: cor branca explícita na barra e atalhos móveis posicionados junto ao menu. Nova comparação `mvp-mobile-final.png`: texto visível e área de leitura livre.
2. **P2 — composição no celular:** o valor-unitário ficava oculto e o grupo truncava no seletor. Correção: rótulo curto CCESP/FCESP e itens em duas linhas com quantidade, valor-unitário e cotas do item. Evidência posterior: `mvp-mobile-form.png`.
3. **P2 — rodapé:** primeira comparação mostrou links desalinhados e ritmo vertical diferente. Correção: centralização nas quatro colunas, ajuste de espaço superior e distância da legenda. Nova comparação `mvp-footer.png` com `siorg-footer.png`: marcas, links e faixas alinhados. A legenda de protótipo substitui deliberadamente a reivindicação institucional de copyright.
4. **P2 — alto contraste:** números das etapas e identificação do protótipo herdavam fundo claro. Correção: fundo preto e borda/texto brancos. Evidência posterior: `mvp-mobile-contrast.png`.
5. **P1 — integridade de comparação:** alteração da natureza, órgão, abrangência, data ou origem agora desmarca a confirmação; trocar o modo também exige nova confirmação. Conferido no navegador: totais propostos permanecem, diferenças ficam pendentes.
6. **P2 — resumo e feedback:** removidos caminhos técnicos; exemplo não atribui confirmação real ao usuário; metadados de base inativa são omitidos; indicação de cópia é zerada ao gerar outro resumo. Conferidos em exportação, navegador e testes de regressão.

Nenhum achado P0/P1/P2 pendente no recorte testado.

## Superfícies obrigatórias

- **Fontes:** Rawline 400/600/700 e Font Awesome 6 Free locais, retirados dos assets observados. Título 24px/600, links principais 16px/600 no desktop. Fontes e controles verificados no render; sem fontes remotas substitutas.
- **Espaçamento:** cabeçalho 138,94px, navegação com faixa de 71px e margem de 16px; conteúdo desktop a 80% da largura; filete vermelho, cartões com raio pequeno e borda discreta. Logos preservam as dimensões observadas. Formulário reordena campos em telas menores.
- **Cores:** branco, fundo #ededed, texto #333, filete vermelho; ações novas usam vermelho escuro com texto branco. Variações positivas e negativas não têm julgamento automático por cor. Contraste alto, destaque de links e foco visível testados.
- **Assets:** logo SIORG original 170 × 75; brasão oficial com texto preto no header e branco no footer; imagens de acessibilidade e Libras preservadas. Não foram substituídos por SVG desenhado, texto ou ilustrações improvisadas.
- **Conteúdo:** início vazio, exemplo explicitamente fictício, fontes e data da tabela indicadas, sem saldo ou aprovação implícitos. A diferença é proposta menos atual; os quatro totais mantêm CCESP e FCESP separados.

## Interações efetivamente verificadas

- Estado inicial sem números fabricados; resumo desabilitado sem itens.
- Exemplo: CCESP nível 2 × 3 = 3,75; FCESP nível 4 × 2 = 2,10. Variações −1/−1,25 e +1/+1,05.
- Adição de item, edição, remoção e rejeição de grupo/nível duplicado.
- Quantidade vazia torna apenas o grupo afetado incompleto. Quantidade fracionária é recusada. Números com 129 caracteres são preservados na entrada e rejeitados, sem truncamento silencioso.
- Base vazia distinta de zero: cotas CCESP vazias deixam a medida pendente; zero gera diferença +3,75.
- Modo conjunto com 5 postos e 5,85 cotas gera diferenças zero, com nota descritiva. Tela mostra atual, proposta e variação.
- Mudança da referência suspende a diferença até reconfirmar equivalência; modo sem comparação não usa metadados ocultos no resumo.
- Resumo incompleto e completo; cópia efetivamente conferida pela área de transferência; novo resumo não herda feedback de cópia antigo.
- Download de texto feito e arquivo em Downloads conferido com FCESP NES 5,40 e fonte oficial.
- Limpeza com cancelamento preserva dados; confirmação retorna ao vazio.
- Tabela de 36 valores expandida e lida no navegador; NES FCESP 5,40 conferido também pela interface.
- Menu móvel, submenu Produtos e navegação por teclado (ArrowDown e Escape, com retorno do foco).
- Aumentar texto para 125%, alto contraste, destacar links e restaurar padrão. Diálogo de Libras informa o limite real da integração.
- Nenhuma rolagem horizontal em 320, 390, 1024 e 1440px; diálogo tem 288px de largura em viewport de 320px. Sem imagens quebradas no estado intermediário.
- Nenhum erro de console observado na página após os testes.

## Validação de código

- 22/22 testes do motor passaram em 14/09/2026. Incluem precisão exata, entradas ausentes/zero/inválidas, duplicatas, separação de grupos, modos inativos e resumo.
- Build de produção concluído sem erro depois das correções finais de interface.
- Projeto isolado; planilha original e repositório Célula preservados.

## Limites e adaptações intencionais

Protótipo local, sem API, autenticação, consulta de limites, persistência de cenários ou homologação. VLibras ainda não está integrado; o botão abre informação sobre o recurso no portal oficial. Links institucionais levam ao portal em outra aba. No celular, atalhos de acessibilidade foram realocados para evitar sobreposição, preservando os assets do portal. Não foi realizada auditoria formal WCAG, teste com leitor de tela real ou homologação em equipamentos físicos; os testes descritos ocorreram no navegador desktop com viewports controlados.

A tabela precisa de governança de atualização e confirmação institucional antes da integração real. Não há afirmação de publicação ou de autorização administrativa.

## Checklist de entrega

- [x] Página executável e aberta localmente.
- [x] Cálculos e resumo com referência explícita.
- [x] Comparações visuais e revisões independentes consolidadas.
- [x] Erros P0/P1/P2 encontrados corrigidos e novamente verificados.
- [x] README, fontes e capturas preservados.

final result: passed
