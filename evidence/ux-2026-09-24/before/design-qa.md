# QA da simplificação — 17/09/2026

final result: passed

## Referência e escopo

Interface local em http://127.0.0.1:4173/. Referência visual do shell SIORG: captura inicial `evidence/ux-2026-09-17/01-antes-inicio.png`, comparada à implementação em `08-final-inicio-601.png`. As duas imagens foram abertas juntas na mesma chamada de inspeção. Ambas têm 601 × 837 pixels, viewport CSS 601 × 837 e densidade de captura 1:1, sem redimensionamento. O mesmo estado vazio foi usado nas duas capturas. A estrutura externa do SIORG foi preservada; a área interna foi simplificada intencionalmente.

Referência funcional: planilha original, analisada em `evidence/ux-2026-09-17/planilha-fluxo.md`, e feedback explícito do usuário: poucos campos, simplicidade semelhante à planilha, ajuda por ícone e cotas/quantitativo atuais visíveis para mostrar os dois aumentos. A planilha não foi modificada nem executada para uma nova validação cruzada.

## Histórico de achados e correções

1. P1 — Densidade inicial: instruções, etapas, cadastros e resultados competiam na mesma página. Evidência inicial: `01-antes-inicio.png` e `02-antes-comparacao.png`. Removidos o stepper, a coluna lateral, os metadados obrigatórios e os textos repetidos. O uso principal ficou concentrado em situação atual, proposta e diferença.
2. P1 — Na primeira simplificação a comparação ficou escondida. O usuário apontou que isso prejudicava o uso semelhante ao Excel. A versão final coloca **Cotas atuais** e **Quantitativo atual** no topo, sempre visíveis, e calcula as diferenças imediatamente. `03-depois-inicio.png` é uma captura intermediária, não a entrega final. Evidências finais: `08-final-inicio-601.png`, `05-resultado-aumentos-desktop.png` e `06-resultado-mobile.png`.
3. P2 — Ajuda precisava ser acessível sem texto permanente. Adicionados botões de informação, tooltips de mouse/foco/toque, fechamento com Escape e tolerância de 180 ms para mover o ponteiro até o conteúdo. O foco e Escape foram conferidos no navegador; hover é suportado pelo componente, sem teste independente de trajetória do ponteiro. Evidências: `04-ajuda-quantidade.png` e `07-ajuda-cotas-mobile.png`.
4. P2 — Revisão independente identificou associação/foco de erros de inclusão e perda de foco ao remover. O nível só descreve seu próprio erro; erros levam ao campo correspondente ou à linha duplicada; remoção e limpeza têm destino de foco explícito.
5. P2 — A 125% de fonte, os rótulos da base tinham alturas diferentes e os campos ficaram desalinhados. Alinhados pelo fundo. Antes: `09-mobile-contraste-125.png`; depois: `10-mobile-contraste-125-final.png`, mesmo viewport 390 × 844. Não há corte nem rolagem horizontal nos estados inspecionados.

## Superfícies visuais

- Tipografia: Rawline e pesos locais mantidos. Título ligeiramente mais compacto no celular, rótulos legíveis e hierarquia curta. Verificação visual em fonte padrão e 125%.
- Espaçamento: mantido o shell institucional; formulário usa uma coluna de trabalho. A comparação conjunta de antes/depois mostra os cinco campos essenciais disponíveis muito antes dos cadastros anteriores. Tabelas e controles verificados em capturas focadas do resultado e da ajuda; não foi necessário ampliar recortes adicionais.
- Cores: cinza, branco e vermelho institucional preservados. Diferenças são descritas por sinal e palavras, sem depender de cor. Alto contraste conferido.
- Imagens e ícones: logos locais e Font Awesome do shell mantidos; nenhum logo foi refeito. Ícone de informação consistente nos rótulos.
- Conteúdo: cotas não são apresentadas como dinheiro, dados vazios não viram zero, CCESP e FCESP mantêm totais próprios. Diferenças agregadas são aritméticas e não validam limites ou equivalência administrativa. Fonte e explicações ficam recolhidas. O exemplo permanece marcado como fictício.

## Validação funcional

- Navegador: CCESP nível 2 × 3 = 3,75; FCESP nível 4 × 2 = 2,10; conjunto = 5 cargos/funções e 5,85 cotas.
- Base atual de 4 e 3,00: +1 e +2,85, ambos “Aumento”. Base de 7 e 8,00: −2 e −2,15, ambos “Redução”.
- Cotas atuais zero: diferença +5,85. Quantitativo atual vazio: “Atual não informado”, sem bloquear a diferença de cotas.
- Quantidade proposta negativa suspende os totais e as diferenças afetadas; ao corrigir, os valores são recuperados.
- Resumo usa o mesmo resultado da tela. Cópia real para a área de transferência conferida. Não afirma equivalência validada.
- Cancelar limpeza preserva os dados; confirmar limpa proposta/base e devolve foco ao preenchimento.
- Layout e overflow: capturas 1280 × 720, 601 × 837, 390 × 844. Inspeção de largura do documento confirma ausência de overflow horizontal em 390px, inclusive fonte 125%.
- Console da aba final: nenhum erro registrado.
- 27/27 testes do motor e resumo passaram, incluindo cinco novos grupos para o modo aritmético. Build final passou. Não houve publicação.

## Limites

A simplicidade foi avaliada por inspeção e pelo feedback recebido, sem pesquisa formal com usuários finais ou certificação completa WCAG. Não houve ensaio em aparelho físico. A primeira versão intermediária usava calendário nativo que derrubou a aba do navegador ao abrir; essa etapa de metadados foi removida do fluxo final, que não usa calendário.

O resultado continua sendo um MVP local: sem integração, autenticação, persistência, consulta a limites ou homologação. O modo padrão do motor conserva as exigências de contexto e equivalência; somente a tela de cálculo imediato usa a opção explícita `comparisonBasis: 'arithmetic'`. Não foi afirmada identidade automática com todas as fórmulas e cenários do Excel.

## Checklist final

- [x] Base atual visível e diferenças automáticas.
- [x] Ajuda junto dos campos, com exemplo curto.
- [x] Quantidades editáveis e totais separados.
- [x] Validação numérica e resumo conferidos.
- [x] Responsividade, contraste e foco inspecionados.
- [x] Evidências locais salvas e localhost aberto.
