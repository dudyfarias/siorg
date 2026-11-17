# Prontidão para apresentação — 23/10/2026

Objetivo: verificar as escolhas demonstráveis da calculadora/simulador e a consulta da linha do tempo antes da apresentação. Conferência da versão pública https://siorg-calculadora-mvp.vercel.app/, script `index-JUwX20-X.js`, e dos módulos correspondentes no checkout. Nenhuma alteração de código, deploy ou CMS nesta verificação. `testes.txt`: 207 testes reexecutados e aprovados, sem falhas.

## Funcionalidades

| Escolha | Resultado observado |
| --- | --- |
| Secretaria SGGD → unidade | Carrega a alocação direta; preserva a proposta nas outras unidades. É o único órgão incorporado neste piloto. |
| Quantidade final e retirada por zero | Secretaria Executiva, Assessor Especial III 2 → 0: reduz dois cargos e 12 cotas; remove a linha do Anexo proposto. |
| Inclusão explícita | Chefia de Gabinete, 1 Assessor I CCESP 2.09: acrescenta um cargo e três cotas; totais sem duplicação. |
| Renomear e transferir unidade | Divisão de Formação e Treinamento renomeada e transferida para Secretaria Executiva; resumo e PDF refletem nome e vínculo, sem mudar quantitativos. |
| Criar e retirar unidade | Criada Diretoria de Demonstração: bloqueio enquanto vazia. Inclusão de 1 Diretor CCESP 1.15 retira a ausência de titular e mantém aviso de subordinadas. Retirada explícita da Diretoria desfaz seu impacto. |
| Alterar código/espécie | Diretor CCESP 1.15 → FCESP 1.15: muda para uma função e 3,60 cotas; restauração para CCESP e retirada da unidade retornam ao cenário anterior. |
| Extrapolar | Assessor I temporariamente 1 → 4: CCESP 301 / 1.069,50; saldos −3 cargos / −3,50 cotas. O excesso fica sinalizado; a minuta permanece exportável, conforme o comportamento definido no MVP. |
| Entrada inválida | Quantidade −1 é marcada inválida e impede exportação completa; ao voltar a 1, o cálculo e as saídas são liberados. |
| Ausência de titular | Secretário Executivo temporariamente 1 → 0: novo bloqueio estrutural e PDF/Excel desabilitados. Restaurar 1 remove esse bloqueio. |
| Resumo e Anexo II | Usam a proposta inteira, independentemente da unidade selecionada. Retirada, inclusão, renomeação e transferência aparecem juntas. |
| PDF e Excel | Downloads públicos concluídos; leitura independente confirma os números, a linha retirada, a inclusão, o novo nome e o posicionamento da unidade transferida. |
| Salvar e continuar | JSON baixado e reaberto após começar proposta limpa recupera todas as mudanças. Recarregar a página também conserva a proposta. |
| Linha do tempo | Rota abre, ordenação recente funciona e o bloco 70.755 expande as Resoluções 33 e 39. Datas e textos coincidem com o dataset conferido em 22/10. |

## Cenário principal confirmado

Da base limpa: Assessor Especial III da Secretaria Executiva, CCESP 2.15, quantidade 2 → 0; incluir 1 Assessor I CCESP 2.09 na Chefia de Gabinete. Opcional executado: renomear Divisão de Formação e Treinamento e transferir para Secretaria Executiva.

| Medida | CCESP | FCESP |
| --- | ---: | ---: |
| Quantidade proposta | 298 | 201 |
| Cotas propostas | 1.060,50 | 348,75 |
| Saldo de quantidade | 0 | 0 |
| Saldo de cotas | +5,50 | +0,60 |

Zero novos bloqueios no cenário final. Oito apontamentos herdados permanecem para revisão. PDF e Excel: 407 linhas, 499 postos, 16 páginas de PDF. Valores e conteúdo verificados em `downloads.json`; primeira página renderizada e inspecionada em `06-pdf-inicio.png`. Não foi repetida a inspeção visual de cada página ou do Excel nativo nesta data; os arquivos foram lidos integralmente para conferir contagens e campos críticos. Nenhum erro de console capturado no ambiente público. Ao final, base limpa e simulador mantido aberto.

Arquivos de apoio em `outputs/apresentacao-2026-10-23/`: JSON portátil, PDF e Excel da demonstração. Roteiro humano: `docs/roteiro-apresentacao-sggd-2026-10-23.md`.

## Limites para narrar corretamente

- É um protótipo funcional da SGGD; não é cobertura de todos os órgãos, regimes ou regras normativas. Base, vínculos e regras continuam em validação técnica. Os testes não são aprovação institucional.
- A base documental já inicia com CCESP −1 cargo / −3,50 cotas na comparação II/III. Foi preservada, não igualada artificialmente.
- Salvar no navegador e baixar JSON não equivalem a conta, armazenamento compartilhado ou persistência no CMS. O Excel exportado é um registro protegido para consulta, sem fórmulas de edição; não é usado na retomada.
- Advertência, excesso numérico e novo erro estrutural têm efeitos diferentes. O botão de exportar desabilitado em cenário inválido é um resultado esperado.
- O catálogo aritmético contém coeficiente FCESP nível 18, mas isso não comprova autorização de alocação na SGGD. A revisão inicial que chamou sua ausência no seletor de bug foi retificada após consulta primária: manter a restrição deliberada a CCESP 1.18 no nível 18. Não houve necessidade de alterar o site para esta apresentação.
- A linha do tempo contém o recorte de dez atos selecionados, não um inventário exaustivo. A Resolução 42 é norma geral complementar; a Resolução 39 revoga apenas dois dispositivos da 33.

Evidências visuais desta execução, vistas em conjunto em `conferencia-telas.png`: 01 base, 02 proposta dentro dos limites, 03 extrapolação, 04 resumo e 05 linha do tempo. São telas do fluxo efetivamente executado nesta data. Esta verificação funcional não certifica acessibilidade integral nem substitui o teste humano da DMO.
