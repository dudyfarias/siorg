# Simulador SGGD — primeiro incremento local

19/10/2026. Autorização do usuário: iniciar o item 1 do plano acordado, aproveitando a calculadora existente. Não houve publicação nem alteração do CMS.

## Entrega

- Entrada local: http://127.0.0.1:4173/ (Vite em execução ao concluir).
- Edição por unidade direta, proposta única em memória e cálculo da Secretaria inteira.
- Quantidade final editável, inclusão com código/denominação documental, retirada por zero, renomeação e restauração restrita à unidade.
- Pesquisa por unidade/pai e filtro de unidades alteradas; nomes repetidos preservam identidades independentes.
- Alocação original protegida e saldos CCESP/FCESP separados; invalidez em unidade fora da tela não vira zero.
- Informações adicionais recolhidas, seletores adjacentes, ajuda por clique/foco e layout do SIORG preservado.

## Base

`sources/preparacao-2026-10-19/SGGD- TESTE1.xlsx`, aba Reestruturação, foi aberta somente para leitura. O importador compara suas 407 posições com a extração documental existente, preservando 221 identidades de unidade. Os totais por espécie/nível coincidem exatamente com a base anterior do motor. Relatório completo em `../preparacao-2026-10-19/importacao-estrutura-sggd.md`.

Não houve nova afirmação de vigência dos atos. Permanecem distintos:

| Referência | CCESP quantidade / cotas | FCESP quantidade / cotas |
|---|---|---|
| Alocado Anexo II | 299 / 1.069,50 | 201 / 348,75 |
| Limite Anexo III | 298 / 1.066,00 | 201 / 349,35 |
| Saldo inicial | −1 / −3,50 | 0 / 0,60 |

O consolidado com 495 postos não substituiu a base. Três nomes de pais ambíguos não foram resolvidos por suposição. A edição direta não depende dessa hierarquia pendente.

## Verificação automatizada

- `npm test`: **117 testes passaram**, zero falhas (98 anteriores + 6 importação + 13 proposta estrutural).
- `npm run build`: concluído. Artefatos de client, server e hosting gerados.
- `npm run test:sites`: **4 testes passaram**, zero falhas.
- Fontes XLSX permanecem intactas; testes conferem seus hashes.

## Verificação no navegador

Executada via navegador integrado sobre a aplicação local, com interações reais nos controles:

1. Secretaria Executiva: Assessor Especial III, CCESP 2.15, quantidade 2 → 3. Saldo CCESP mudou de −1/−3,50 para **−2/−9,50**.
2. Chefia de Gabinete: Assessor IV, FCESP 2.12, 1 → 2. Saldo FCESP virou **−1/−1,80**. Retorno à Secretaria Executiva preservou quantidade3 e ambos os saldos; contador mostrou duas unidades alteradas.
3. Quantidade vazia na Secretaria Executiva seguida de navegação à Chefia: ambos os saldos propostos pendentes e alerta direcionando à unidade com erro. Nenhum total parcial foi apresentado como completo.
4. Corrigida quantidade e restaurada apenas Secretaria Executiva: CCESP voltou a −1/−3,50; FCESP permaneceu −1/−1,80. Alterações de outra unidade mantidas.
5. Inclusão de Assessor Especial IV, CCESP 2.16, quantidade2: cálculo acresceu14,00cotas. Nova linha zerada continuou removível e foi excluída sem afetar a base.
6. Renomeação persistiu ao trocar de unidade e retornar; nome original continuou visível e saldos não mudaram.
7. Busca “Modernização” encontrou DMO e duas unidades vinculadas, mantendo a seleção atual disponível.
8. Ajuda da quantidade abriu por clique/foco com exemplo2→3 e distinção vazio/zero; Escape fechou.
9. Inspeção visual em1440×1000 e390×844. Campos, seletores adjacentes e cálculo permaneceram legíveis; no celular, largura do documento390px para viewport390px, sem transbordamento horizontal global. A captura pelo método de screenshot da aba evitou o recorte físico da janela nativa em teste1440px.
10. Console sem erros no estado verificado. Dados de teste restaurados antes da entrega; proposta igual à base.

## Revisão independente

Agente de dados conferiu fonte/identidade/importação; agente de cálculo implementou e testou a proposta. Revisão independente da interface apontou anúncio acessível repetido, espécie ausente no cabeçalho da linha de cotas, retirada de linha nova zerada e pesquisa pelo pai renomeado. Os quatro pontos foram corrigidos. Medição isolada do módulo apontou mediana4,65ms/máximo10,48ms em12execuções; isso não é teste de infraestrutura CMS ou concorrência.

## Limites desta entrega

A proposta dura nesta página; recarregar ou fechar reinicia o preenchimento. Há proteção de saída após alterações e aviso visível. Ainda não inclui criação/transferência/remoção de unidades, resumo formal, geração do Anexo II, PDF/Excel da proposta, identificação do usuário ou salvamento institucional. Todos esses itens permanecem no plano, com a mesma proposta detalhada como base.

O código da calculadora anterior fica acessível em `?modo=calculadora`, separado da proposta estrutural. Esta rota preserva a versão agregada anterior para comparação técnica. A interface padrão usa o simulador.
