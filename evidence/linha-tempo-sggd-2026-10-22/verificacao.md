# Linha do tempo da SGGD — entrega para teste em 22/10/2026

Disponível em https://siorg-calculadora-mvp.vercel.app/novas-estruturas, na aba Novas Estruturas do mesmo protótipo usado pela equipe. O simulador continua em Produtos. Deployment `dpl_CCivjHFS7DcJ9qU5C6vQeFTPVpZd`, READY; registro integral em `deploy.txt` e metadados em `deployment.json`. Não houve alteração do CMS institucional.

## 1. Escolher o órgão — verificado

A referência visual atual do SIORG foi aberta e capturada em `01-portal-referencia.png`. A implementação mantém o cabeçalho já aprovado no MVP, tipografia Rawline, fundo branco, títulos pretos e detalhes vermelhos. A página troca a lista contínua do portal e o carrossel do modelo HTML por uma sequência vertical. O seletor oferece apenas o piloto SGGD, sem simular entidades ainda não recebidas. O menu identifica a página ativa e o salto para conteúdo alcança o main correto.

## 2. Ler e expandir a linha do tempo — verificado

Os seis decretos podem ser ordenados pela data do ato, do mais antigo ao mais recente ou ao contrário. A expansão individual funciona por teclado; o controle global abre/recolhe os blocos vinculados. Há três resoluções relacionadas nos blocos e uma regra geral complementar, somando os dez atos do recorte. Publicação e data do ato permanecem distintas, inclusive quando o ano difere, como 31/12/2024 e 01/01/2025.

As resoluções são agrupadas editorialmente com os decretos pertinentes e conservam seus próprios números, datas e efeitos. A revogação parcial pela Resolução 39 é explicitamente da Resolução 33; não indica revogação integral do decreto do grupo. A Resolução 42 aparece separada como norma geral do QGCFC. Não foi acrescentado selo genérico de vigência. Fontes, métodos, cobertura e achados estão em `docs/linha-tempo-sggd-2026-10-22-fontes.md` e `.json`.

## 3. Abrir fontes e voltar ao simulador — verificado

Links HTTPS somente para DOE/ALESP, identificados e com abertura em outra aba. Fontes normativas e dez datas de publicação foram conferidas na pesquisa. Na interface, a navegação Produtos → Simulador → Novas Estruturas → Voltar preservou a edição de quantidade 2 → 3 de Assessor Especial III, sem disparar uma saída completa da página. A âncora Resumo das alterações continuou focando o resumo, em vez de voltar ao topo; a edição foi restaurada a 2 após o teste.

O endereço público foi aberto a partir do menu do simulador e recarregado diretamente, confirmando que a rota específica também funciona fora da navegação SPA. A versão exibiu Protótipo para avaliação, script `index-JUwX20-X.js` correspondente ao build local, expansão/ordenação e retorno ao simulador. Nenhum erro de console capturado no público. `browser.json` registra os controles e o estado final. Não foi necessário login, bypass ou mudança de proteção.

## Layout e acessibilidade inspecionados

Desktop 1440×1000 e celular 390×844 sem transbordamento horizontal. A coluna de data passa para cima do decreto no celular; os controles continuam disponíveis. Fonte 125% e alto contraste conferidos, com retorno ao padrão e retirada do tamanho temporário do navegador. Inspeção visual não equivale a certificação de acessibilidade. Evidências: `03-desktop.png`, `04-mobile.png`, `05-contraste-fonte.png`. A captura pública `06-publicado.png` mostra a ordenação recente com os atos abertos. Uma captura intermediária `02-atos-relacionados.png` antecede a simplificação final das notas de vigência; não é a prova visual final do texto.

## Testes e limites

- `testes-completos.txt`: 207 testes aprovados, zero falhas; inclui três verificações de cobertura/fontes, datas e relações, além das regressões do simulador.
- `sites.txt`: quatro verificações aprovadas.
- `build.txt`: build concluído; aviso não bloqueante de tamanho de bundle preservado no log do comando.
- Desenvolvimento: um aviso transitório de createRoot após HMR do entrypoint foi identificado; não se reproduziu no build público novo.

A equipe ainda deve executar o teste humano. O recorte é o levantamento de dez atos, com ocorrências correlatas descritas nas notas de fonte; não é levantamento exaustivo de toda a história da SGGD. Os outros dois pilotos e a validação final da cobertura e dos resumos continuam com a área técnica. Nenhum documento original foi editado ou incluído indevidamente no pacote público.
