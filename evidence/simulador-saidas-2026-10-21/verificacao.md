# Verificação — resumo e Anexo II — 21/10/2026

Entrega local em http://127.0.0.1:4173/. Não houve publicação no Vercel nem alteração no CMS.

## Fontes e revisão
- SGGD TESTE1 e orientações recebidas, preservadas em sources/preparacao-2026-10-19.
- Agentes separados implementaram derivação/testes e PDF; terceiro fez revisão independente documental. Root integrou UI e verificou navegador/PDF.
- P2 identificado pelo revisor (homônimas sem contexto no resumo) foi corrigido: vínculos e linha de origem quando necessário, preservando três vínculos ambíguos. Há três testes específicos adicionais.
- Layout do Anexo tem quatro colunas, com nome de unidade repetido por linha para clareza entre páginas. Não mistura identidades homônimas nem insere controles no quadro.

## Validação automatizada
- 142 testes passaram (117 existentes, 17 de saídas, 8 de PDF).
- 4 testes de empacotamento Sites passaram.
- Build de produção passou; aviso de tamanho do pacote principal acima de 500 KB não impede execução. PDF carrega sob demanda.
- Logs em testes.txt, build.txt e sites.txt. Bibliotecas PDF fixadas em jspdf 4.2.1 e jspdf-autotable 5.0.9.

## Navegador
1. Base: resumo sem alterações, 407 linhas positivas em 221 unidades; limites III distintos da alocação II.
2. Secretaria Executiva: Assessor Especial III de 2 para 3; Assistente I de 1 para 0. Resumo CCESP +1 / +6,00 cotas; FCESP −1 / −0,60. Anexo passa a 406 linhas.
3. Chefia de Gabinete: campo FCESP vazio. Ao selecionar outra unidade, PDF ficou desabilitado, prévia completa retirada e variação FCESP pendente.
4. Correção FCESP para 2 e renomeação para “Chefia de Gabinete — proposta de teste”: resumo manteve duas unidades, FCESP quantidade líquida zero com dois movimentos visíveis e cotas +1,80. Novo nome refletido no Anexo.
5. Download real pelo botão: PDF de 16 páginas e 406 códigos completos, presença da última unidade e dados propostos (3, 2, retirada do zero). Cópia em anexo-ii-baixado-no-navegador.pdf; conferência de texto em navegador-pdf.json.
6. Download real do resumo TXT: mesmas alterações e números; limitações e fontes públicas incluídas.
7. Restaurar Chefia manteve mudanças da Executiva. “Editar esta unidade” no resumo selecionou a Executiva. Restaurar Executiva retornou resumo sem mudanças e 407 linhas.
8. Layouts 390px e 1440px: sem transbordamento da página; tabela do Anexo possui rolagem interna. Navegação por âncoras ajustada para não esconder títulos atrás do saldo fixo.
9. Nenhum erro de console ao final. Prévia deixada na base original, sem alterações de QA.

## PDF visual
A amostra do agente (cenário de QA separado) contém 407 linhas positivas/504 postos, incluindo mudanças na primeira e última unidades. Auditoria por extração confirma todos os códigos, sequência, acentos, cabeçalhos e rodapés. As 16 páginas foram renderizadas e conferidas em contato-pdf.png; páginas 1 e 16 também foram inspecionadas individualmente em 1000px. Nenhum corte ou sobreposição observados. Fonte mínima 9pt. Cenários de 128 dígitos, zero integral, fonte sem suporte e pendência global também têm testes.

## Limites da entrega
- Minuta de simulação, com base/regras ainda em revisão técnica. Não declara aprovação, ocupação atual ou vigência jurídica revisada hoje.
- Sessão continua em memória: fechar/recarregar reinicia. PDF e texto são documentos de saída, não um mecanismo de reabrir a proposta.
- Transferência/criação/extinção de unidades, XLSX e integração CMS ficam para próximos incrementos.
