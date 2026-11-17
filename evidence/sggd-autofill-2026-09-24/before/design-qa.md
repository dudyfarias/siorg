# Design QA — Calculadora SIORG, 24/09/2026

## Escopo e referências visuais

Ampliação autorizada do MVP existente, com prioridade SGGD e seletores menores lado a lado. Fonte visual: `evidence/ux-2026-09-24/before-desktop-viewport.png` (1280 × 900 pixels). Código anterior preservado em `evidence/ux-2026-09-24/before/`. A referência é a identidade e a superfície de planilha da versão existente, não uma reprodução pixel a pixel sem os novos campos.

Implementação: http://127.0.0.1:4173/. Capturas de navegador:

- `evidence/ux-2026-09-24/after-desktop-viewport.png`: 1280 × 900, SGGD/DMO vazia, seletores compactos.
- `evidence/ux-2026-09-24/after-desktop-final.png`: 1280 × 900, SGGD/DMO, exemplo fictício após ajustes finais.
- `evidence/ux-2026-09-24/after-mobile.png`: 390 × 844, SGGD/DMO vazia.
- `evidence/ux-2026-09-24/after-mobile-results.png`: 390 × 844, tabelas e resultado do exemplo.
- `evidence/ux-2026-09-24/seletores-sggd.png`: recorte direto do navegador da área de seleção e base, sem redimensionamento.

As capturas têm densidade 1:1, com pixels correspondentes ao viewport CSS e devicePixelRatio 1. Não houve redimensionamento. A captura anterior tem pequena rolagem, enquanto a final está no topo; a diferença de posição do cabeçalho decorrente da rolagem não foi tratada como mudança de layout. O estado final contém novos seletores e um exemplo marcado, ausentes no original. A comparação preserva esses limites e não atribui deslocamentos verticais intencionais a regressões.

## Comparação visual

Fonte e implementação foram abertas juntas na mesma chamada de comparação, primeiro com a versão vazia e depois com a final. A inspeção focou também os campos, rótulos e seletores na captura móvel, onde eram legíveis sem ampliação; o recorte final documenta a região de maior mudança. A captura fullPage anterior apresentou artefato de composição do navegador e foi descartada da avaliação. A primeira captura imediatamente após mudar o viewport móvel também foi descartada; a captura estabilizada tem 390 × 844 reais.

- **Fontes e tipografia:** Rawline, pesos, títulos institucionais e hierarquia dos campos preservados. Seletores de contexto em 13px; nome completo do recorte abaixo evita depender do texto truncado do select móvel.
- **Espaçamento e layout:** cartões, largura principal, margens internas e ritmo da planilha preservados. Seletores com 36px de altura, Secretaria 140px e Unidade 480px no desktop; na tela de 390px, aproximadamente 103/207px, mesma coordenada vertical. Inclusão da identificação e da origem alonga intencionalmente o primeiro cartão. Não há novo wizard. Sem overflow horizontal a 1280px ou 390px.
- **Cores e tokens:** fundo cinza, cartões brancos, linhas cinza, botão vermelho e foco azul existentes preservados. Referências ficam recolhidas e a identificação do exemplo usa o aviso já existente.
- **Imagens e ativos:** logos locais do SIORG/Governo, Rawline e Font Awesome mantidos; sem substituição por aproximações. Nenhum novo ativo visual exigido.
- **Texto e conteúdo:** “Valor unitário” elimina ambiguidade com Unidade. Base do decreto aparece como autorizada e não como ocupação atual. Origem manual/fictícia identificada. SGGD e Saúde indicam pendência; nomes/abrangência acompanham o resultado e a exportação.

## Histórico de revisão e correções

1. Revisão inicial de código: sem P0/P1 confirmado. Dois P2: identificação de unidade manual podia ser trocada com números associados; Saúde escondia a pendência em um título genérico.
2. Correções: unidade manual passa a proteger o nome ao associar dados; “Alterar unidade” segue a confirmação e limpa o recorte. Saúde mostra “Base atual pendente de confirmação” mesmo com detalhe fechado.
3. Conferência após correções: navegador confirmou nome protegido, cancelamento preservando valores, confirmação limpando e liberando o nome. Capturas finais após build/reload registram a versão entregue. Nenhum P0/P1/P2 visual ou funcional acionável permaneceu nos cenários testados.

## Interações e resultados conferidos

- Padrão SGGD / Toda a secretaria após recarregar; DMO e demais opções reais disponíveis.
- SGGD/DMO: exemplo 6 postos / 10,50 cotas → 7 / 12,50, diferenças +1 / +2,00. Total da secretaria não estimado por conflito de referência.
- Troca de secretaria com dados: cancelar preserva SGGD, DMO e valores; confirmar limpa base/proposta e apresenta opções da nova secretaria.
- Educação/URE Bauru: base 16 / 31,30 e proposta inicial idêntica; total secretaria 2.066 / 4.284,85. Aumentar CCESP nível 5 de 3 para 4 produz unidade 17 / 33,30 e secretaria 2.067 / 4.286,85.
- Converter base autorizada em manual preserva comparação numérica e desativa consolidação. Base autorizada fica protegida; campos manuais permanecem editáveis.
- Quantidade apagada pelo teclado resulta em valor pendente e bloqueia diferenças; não assume zero. A operação fill('') do navegador não apagou o campo; foi usada a sequência real de selecionar/apagar, que confirmou a implementação.
- Saúde: apenas secretaria/Outra unidade, sem carga automática. Outra unidade exige nome; zero explícito compara corretamente com proposta positiva.
- Ajuda acessível por clique e foco de teclado; Escape fecha. Captura móvel confirma tabelas, seletor em uma linha e ausência de sobreposição nos campos.
- Resumo identifica órgão, unidade, abrangência, referência, exemplo, valores e diferenças. Botão copiar confirmado no navegador e conteúdo copiado contém “EXEMPLO FICTÍCIO” e DMO.
- Console: houve um erro transitório de HMR enquanto o módulo delegado ainda não existia. Após build final e recarregamento, nenhum novo aviso/erro no período de verificação final.

## Validação técnica e limites

48/48 testes de cálculo, perfis, consolidação e resumo; 4/4 testes do empacotamento; build final concluído. O servidor local permanece em 127.0.0.1:4173. Override de viewport removido ao terminar; aba marcada para permanecer aberta com SGGD/DMO e exemplo fictício.

Não é integração com SIORG, homologação institucional ou aprovação de proposta. Valores oficiais SGGD permanecem sem carga automática devido a divergências documentadas. O MVP trabalha um recorte por vez. Não foram feitos testes em aparelho físico, leitor de tela real ou homologação com usuários. Download de texto não foi revalidado via evento de download nesta rodada; abertura e cópia do resumo foram verificadas. Nada foi publicado.

## Checklist de implementação

- [x] Contexto compacto Secretaria → Unidade, SGGD padrão.
- [x] Comparação atual/base → proposta → diferença por recorte.
- [x] Impacto geral somente com referência conciliada e compatível.
- [x] Fontes, abrangência e limites identificados.
- [x] Proteção contra mistura de contextos e revisão dos dois P2.
- [x] Desktop, móvel, teclado, cópia, testes e build conferidos.

final result: passed
