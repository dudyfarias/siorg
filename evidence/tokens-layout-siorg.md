# SIORG — tokens e regras extraídos dos arquivos capturados

14/09/2026. Leitura de arquivos locais, sem navegador ou alteração da aplicação. São valores declarados no CSS capturado, não medições de estilo computado. CSS compartilhado contém componentes de outras páginas; a existência de uma regra não prova seu uso no SIORG atual.

## Fontes e identidade

| Elemento / seletor | Valor exato |
|---|---|
| `body,html` | `font-family:Rawline,sans-serif!important`; margem e padding zero |
| Fonte presente no bundle | Rawline WOFF normal 400, 600 e 700; folha de fontes declara outros pesos/itálicos, mas seus binários não constam no manifesto |
| Vermelho de títulos, seleção e ícones | `#FF161F` |
| Texto principal / rodapé | `#000000` / fundo preto e texto `#FFFFFF` |
| Texto secundário | `#333333`; cinza de apoio `#888888` |
| Hover do menu / fundo dropdown | `#F5F5F5` |
| Seção cinza | `#EDEDED` |
| Fundo de imagem de cartão | `#F2F2F2`; hover `#E1E1E1` |
| Divisórias de tabela / breadcrumb | `#CCCCCC` |
| Botão gov na navegação | `#1351B4`, texto branco, raio 25 px |
| Mensagem informativa do CMS | fundo `#D4E5FF`; ícone/link `#155BCB` |
| Alerta de limite do CMS | fundo `#FDE0DB`; ícone `#E52207` |

O vermelho institucional não deve virar a cor de todos os dados da calculadora: os arquivos o usam em acentos, estados e ícones. Os nomes desta tabela são descritivos; o arquivo não declara um conjunto de variáveis CSS de cores para esses elementos.

Font Awesome Free 6.4.2: `.fa-solid`/`.fas` usa família `Font Awesome 6 Free`, peso 900; `.fa-fw` tem largura 1,25 em. O arquivo também declara aliases `Font Awesome 5 Free` para compatibilidade com pseudo-elementos antigos do tema. O binário presente é `fa-solid-900.woff2`.

## Larguras, títulos e espaçamento

- `.container`: **max-width 1152 px e padding 0 !important a partir de 1280 px**, tanto na faixa 1280–1600 como em ≥1601. O bundle não determina sozinho as larguras padrão abaixo disso: dependem da base/cascata da página.
- `section.componente`: margem `0 0 32px`, padding zero. Seção cinza: padding `32px 0`.
- `.tit-area`: borda esquerda **4 px #FF161F**; padding esquerdo **24 px**; fonte **24 px/600**, uppercase; margem `0 0 16px`. Permanece 24 px nas regras mobile/tablet. A variante dentro de `.text-center` remove borda/padding/uppercase.
- `.tit-interna`: borda 4 px vermelha; padding esquerdo 12 px; fonte 18 px/600, uppercase; margem inferior 60 px. Seu `strong`: 24 px/700, sem uppercase.
- `.tit-destaque`: 28 px/600, entrelinha 38 px. `small`: 16 px/600, entrelinha 22 px, vermelho, bloco, margem inferior 15 px.
- `.btn-padrao`: borda vermelha; hover vermelho com texto branco. `.btn-mais`: padding `8px 24px`, fonte 16 px/600.
- Cartão de acesso rápido: raio 8 px; sombra `0 0 5px 0 rgba(0,0,0,.15)`; hover `0 0 1rem rgba(0,0,0,.15)`. Não é necessário transplantar a altura fixa do cartão para o formulário.

## Cabeçalho, menu e rodapé

`#barra-gov`: padding `16px 0`; imagens em `.logo` e `.govbr` com max-width 165 px. O texto `.org` usa 16 px, padding esquerdo 30 px; `.org.only-text` usa 21 px. Essas medidas são regras genéricas: dimensões inline ou de outra folha podem controlar o logotipo SIORG observado.

`.navbar`: margem inferior 16 px. `.nav-item`: margem 8 px. `.nav-link`: 16 px/600, preto, padding 8 px. Link ativo e item aberto: borda inferior 3 px vermelha. Ícones de dropdown vermelhos, transição 0,3 s; aberto gira 180°. Dropdown: fundo #F5F5F5, largura max-content, top 95%; borda `1px solid rgba(0,0,0,.15)`, raio 0,25 rem, sem sombra. O CSS não define sozinho os estados ARIA ou o comportamento de teclado.

`.breadcrumb`: fundo transparente, links pretos. Separador `\f105` (chevron-right), cinza #CCC, fonte 12 px, margem superior 2 px.

`footer`: fundo preto, padding `32px 0`; links brancos, display block, margem inferior 15 px; títulos brancos com margem inferior 30 px. Parágrafos 14 px; `.redes p.small` 12 px. Ícones sociais: círculo vermelho 36 × 36 px. Logos: max-width 165 px; texto institucional 16 px e padding esquerdo 30 px.

## Responsividade declarada

| Faixa | Regras úteis |
|---|---|
| ≤767 px | Barra gov sem padding superior; logo centralizado; texto institucional em bloco com margem superior 15 px. `.govbr` oculto; `.gov-mobile` visível. Navbar com margem inferior 40 px e padding 0,5 rem; itens sem margem; collapse sem max-height. Dropdown relativo, largura 100%, top −2 px. |
| 768–991 px | Mesmo tratamento geral do logo/barra mobile; containers específicos sem padding. Collapse sem max-height; dropdown relativo, max-width 100%, top/left auto. |
| 991–1023 px | Navbar container com padding horizontal 40 px; dropdown relativo e max-width 100%. Há sobreposição deliberada das faixas em 991 px; a ordem e a especificidade da cascata importam. |
| 1024–1279 px | Dropdown no tratamento desktop; hover do item sublinhado. Não há max-width global do container nesta faixa no arquivo capturado. |
| 1280–1600 px e ≥1601 px | Container 1152 px, sem padding; hover do dropdown sublinhado. |

`.gov-mobile`: fundo preto, margem inferior 15 px, padding `3px 0 6px`; imagem com altura 12 px. Não confundir a altura dessa imagem com a altura real da barra renderizada.

Rodapé até 991 px: logo centralizado, nome institucional em bloco; títulos podem receber chevrons de expansão. No mobile, `.footer-menu h4` tem exceção que esconde o chevron; `h4.no-child` também o esconde.

`.table-mobile` até 991 px: esconde `thead`, transforma `td` em bloco, remove padding esquerdo e usa 12 px abaixo da última célula. Para a calculadora, qualquer adaptação precisa conservar rótulos e associação dos valores; a declaração CSS isolada não prova acessibilidade da tabela.

Há outras condições pontuais no arquivo (`≤375`, `≤374`, `≤768`, `768–1024` e aspect-ratio 16/9) ligadas a componentes específicos. Não são um sistema alternativo de breakpoints gerais.

## Acessibilidade e integração

- `#barraAcessibilidade`: fixed, **top 248 px, right 0, z-index 99999**, display flex. Ícone de abertura 40 px; links padding `5px 10px`, fonte 1 rem. Menu branco com borda 1 px #DDD.
- `.contrast`: fundo preto; texto e bordas brancos em vários componentes. Inputs, inclusive number, recebem borda branca. Cartões e dropdowns recebem borda branca. Breadcrumb sublinhado. Há exceções específicas para componentes de outras páginas.
- `.hipelight-links a`: fundo `#DDFF55` (abreviação original `#df5`), texto preto.
- `.inversed`: fundo preto e `filter:invert(100%)`; não é equivalente a um esquema de alto contraste acessível testado.
- Não há regra genérica `:focus-visible` nos trechos capturados. Regras pontuais retiram sombras de foco em outros componentes. Não presumir que o tema resolva o foco dos novos controles.
- Cookie modal genérico: max-width 1152 px, width 95%, bottom 30 px, raio 8 px, z-index 9999; até 768 px empilha conteúdo e botão. Os arquivos não demonstram se o modal está aberto na página observada.

Preservar o espaço e o funcionamento dos recursos já presentes no portal, sem duplicar barras/diálogos. Captura de ícone VLibras não comprova integração de tradução na calculadora.

## Ativos e proveniência

Bundle: `/var/folders/jq/drpbqr_j16g_594_xn6q_qf80000gn/T/browser-use/assets/e180ce7e-3062-4f33-a1d9-45256dffc19d`.

- `manifest.json`: URLs e ativos capturados, sem falhas registradas.
- `ff8525f62c694b3e.css` — [custom.min.css](https://www.siorg.sp.gov.br/statics/css/custom.min.css).
- `4eacbc8c55fd551f.css` — [acessibilidade.css](https://www.siorg.sp.gov.br/statics/css/acessibilidade.css).
- `30178435fca64738.css` — [Rawline](https://www.siorg.sp.gov.br/statics/rawline/css/rawline.min.css).
- `cb41253515b70672.css` — [Font Awesome 6.4.2](https://www.siorg.sp.gov.br/statics/fontawesome-6.4.2/css/all.min.css).
- SIORG PNG `6a4accba653dabe0.png`: dimensão intrínseca 2120 × 742. Ícone de acessibilidade PNG: 446 × 446. SVGs de governo: viewBox 0 0 216 140. Não redimensionar pela dimensão intrínseca como se fosse a dimensão exibida.

Faltam neste recorte: DOM, estilos inline, ordem completa de carregamento, base de grid/framework e medições computadas. Portanto alturas totais de header/nav, largura mobile efetiva e distribuição real de colunas devem vir das capturas/medições já feitas pela frente de interface.
