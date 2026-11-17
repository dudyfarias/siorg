# Entrega local para teste — Simulador SGGD — 22/10/2026

## Resultado e alcance

Implementação local em `http://127.0.0.1:4173/`, com uma proposta compartilhada pela estrutura, calculadora, resumo e Anexo II. O estado final foi restaurado à base documental: 407 linhas, 221 unidades, CCESP 299 / 1.069,50 cotas e FCESP 201 / 348,75. Nenhuma publicação em Vercel ou alteração no CMS foi realizada.

Nova referência: `SGGD-SGGD (1).xlsx`, preservada. A comparação confirmou os mesmos registros documentais, quantitativos, coeficientes e vínculos da TESTE1 já importada. Ver `planilha-nova-inspecao.md` e `.json`. O modelo original oferecido para download tem SHA-256 idêntico ao recebido, documentado em `modelo-original-download.json`.

## Funcionalidades verificadas

- Quantidade final editada diretamente, inclusões, retirada por zero e alteração de código com coeficiente derivado do catálogo.
- Criação, renomeação, transferência e retirada de unidades. A retirada de uma unidade com subordinadas exige confirmação explícita do conjunto. A movimentação preserva as quantidades.
- Resumo das alterações com origem/destino, antes/depois e impacto nas cotas. A ordenação do Anexo II acompanha os novos vínculos sem resolver por suposição os homônimos documentais.
- Anexo II integral em PDF; Excel da proposta com Reestruturação, Calculadora, Resumo e Anexo II. Ambos derivam da mesma proposta, independentemente do filtro visual.
- Salvamento automático no mesmo navegador e cópia JSON portátil. Importação valida a base, preserva rascunhos incompletos e exige confirmação antes da substituição.
- Alertas novos separados dos apontamentos herdados. Novo erro estrutural verificado bloqueia PDF/Excel completos; atenção e divergências herdadas ficam para revisão. Excesso numérico de cotas é sinalizado e permanece exportável como minuta.

## Execução automatizada

`testes.txt`: **204 testes aprovados**, zero falhas, zero ignorados. Inclui 16 cenários integrados da SGGD com totais esperados independentes, além de testes específicos de cálculo, regras, alterações, armazenamento, PDF e Excel. `sites.txt`: quatro testes de empacotamento aprovados. `build.txt`: build de produção concluído. O aviso de tamanho dos bundles é não bloqueante; o exportador Excel é carregado sob demanda.

Esses resultados não reproduzem a execução relatada para 20 órgãos e não equivalem a um teste de usabilidade com pessoas. O roteiro humano está em `docs/roteiro-teste-sggd-2026-10-22.md`.

## Conferência no navegador

Executada no navegador integrado, com as operações reais da interface:

1. Assessor Especial III da Secretaria Executiva: quantidade 2 → 3; atualização do total e manutenção após recarregar.
2. Criação de Diretoria de Teste — QA, inicialmente vazia: bloqueio por ausência de titular. Inclusão de Diretor CCESP 1.15: bloqueio desaparece, aviso de subordinadas permanece.
3. Transferência da Divisão de Formação e Treinamento para a nova Diretoria: sem mudança de quantitativos, origem e destino corretos no resumo.
4. Download da cópia JSON, do PDF e do Excel. Mesma proposta de 408 linhas, 222 unidades, 502 cargos/funções; CCESP 301 / 1.081,50 e FCESP 201 / 348,75.
5. Criação de Ouvidoria de Teste — QA com titular CCESP 1.04: bloqueio do nível mínimo. Troca para 1.05 libera novamente a minuta. Quantidade −1 mantém pendência e bloqueio de exportação; corrigir para 1 permite continuar.
6. Retirada da Diretoria com sua subordinada: confirmação desabilitada até selecionar a retirada das subordinadas; ambas retiradas após confirmação.
7. Importação da cópia anterior: recupera Diretoria ativa, vínculo da Divisão e quantidade 3 do Assessor, com os totais originais da cópia. O estado posterior à cópia é corretamente substituído.
8. Nova proposta confirmada pela interface: zero alterações em relação à base, 407 linhas / 221 unidades. Nenhum aviso ou erro de console capturado.

Telas a 390 × 844 e 1440 × 1000 verificadas sem transbordamento horizontal do documento. A tabela extensa do Anexo II tem rolagem interna. O tamanho temporário do navegador foi restaurado. Evidências: `mobile-inicio.png`, `mobile-calculadora.png`, `desktop-simulador.png` e `desktop-edicao.png`.

## Arquivos baixados

`SGGD-proposta-2026-10-22.xlsx` e `SGGD-Anexo-II-proposta-2026-10-22.pdf` foram obtidos pelos botões do próprio portal e copiados para esta pasta. O Excel contém valores de consulta, sem fórmulas ou macros; a cópia JSON é o formato para continuar editando no portal. A conferência detalhada e as renderizações constam de `verificacao-arquivos.md`.

Exceção de runtime registrada: a exportação Excel é uma funcionalidade executada no navegador, onde o runtime Node de autoria de artefatos não funciona. Foi usado ExcelJS 4.4.0 com sua API oficial de workbook/writeBuffer. O arquivo resultante foi importado e renderizado somente para inspeção pelo runtime de artefatos; não houve reautoria da planilha recebida.

## Pendências para a área técnica e a equipe

- Conciliação dos oito apontamentos herdados, dos vínculos ambíguos e da diferença II/III: CCESP inicia com saldo −1 cargo / −3,50 cotas; FCESP com 0 / +0,60. Esses valores foram preservados, não corrigidos por suposição.
- Confirmação final da aplicabilidade das regras documentadas em `evidence/simulador-regras-2026-10-22/`. O protótipo não concede aprovação administrativa.
- Execução humana do roteiro, com registro de dificuldades de compreensão e observações da DMO.
- Persistência institucional, autenticação e integração ao CMS continuam dependentes da definição técnica. O salvamento entregue aqui é por navegador e cópia local.

O escopo deste incremento é o piloto SGGD. Os demais órgãos, linhas do tempo e revisão de conteúdo técnico são frentes distintas do plano semanal.
