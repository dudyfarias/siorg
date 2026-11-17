# Calculadora de Cotas — MVP para SIORG

Página local de demonstração, preparada em 14/09/2026, simplificada em 17/09/2026 e ampliada com secretarias/unidades em 24/09/2026. SGGD é o foco e a seleção inicial. O destino proposto é uma ferramenta dentro do SIORG; esta entrega não está integrada ao portal e não foi publicada.

## Experimentar

A página local é http://127.0.0.1:4173/. Começa vazia. Use **Ver exemplo** para conhecer o cálculo; os dados do exemplo permanecem identificados como fictícios até a limpeza.

1. Escolha **Secretaria → Unidade**, nos dois seletores compactos lado a lado. “Toda a secretaria” é o recorte inicial. A descrição abaixo informa a abrangência.
2. Informe **Cotas atuais** e **Quantitativo atual**, com os totais de CCESP + FCESP desse recorte, como nas células B2 e C2 da planilha. Pode deixar vazio o valor desconhecido.
3. Inclua tipo, nível e quantidade na proposta; as linhas podem ser editadas diretamente. Monte a **composição final completa**, incluindo os postos mantidos, não apenas os acréscimos.
4. Confira os totais separados de CCESP/FCESP e o resultado **Atual → Proposta → Diferença**, com aumento ou redução de cotas e quantitativo. Use **Ver e copiar resumo** para guardar o texto, a identificação e as referências.

### Roteiro de apresentação da SGGD

Selecione **SGGD → Diretoria de Modernização Organizacional → Ver exemplo**. Os valores são fictícios: base de 6 postos e 10,50 cotas; proposta de 7 postos e 12,50 cotas; aumento de 1 posto e 2,00 cotas. Altere uma quantidade na tabela e confira a atualização. Abra o resumo para mostrar a identificação da unidade e a marcação de exemplo. Use **Limpar dados** para informar os números reais do levantamento.

Trocar secretaria/unidade com dados abre confirmação dentro do aplicativo. Cancelar preserva o contexto e todos os valores; confirmar inicia uma simulação vazia. “Outra unidade” aceita identificação própria e protege o nome quando associado a dados; **Alterar unidade** inicia a troca. Esta versão trabalha com um recorte por vez, sem somar propostas sobrepostas.

### Bases por secretaria

| Secretaria | Referência no MVP | Preenchimento |
| --- | --- | --- |
| SGGD | Decreto 70.755/2026, anexos com divergências documentadas; cinco unidades reais no seletor | Manual ou exemplo fictício. Sem carga automática ou consolidação oficial. |
| Educação | Decreto 70.042/2025: secretaria completa e URE Bauru, conciliadas aritmeticamente nos anexos | **Usar base do decreto** carrega o quadro autorizado e inicia a proposta com a mesma composição. |
| Saúde | Decreto 68.742/2024 histórico; atualização pendente | Manual. |

O quadro autorizado do decreto não comprova ocupação atual. Na Educação, os campos passam a **Cotas da base / Quantitativo da base** e ficam protegidos; a opção de informar valores manualmente desativa a consolidação. Para URE Bauru, o total estimado da secretaria usa **base da secretaria − base da unidade + proposta completa da unidade**, preservando o restante e calculando cada espécie separadamente. Não é saldo disponível nem autorização. Secretaria inteira: 2.066 postos / 4.284,85 cotas; Bauru: 16 postos / 31,30 cotas. A hierarquia de Bauru é fundamentada também na Resolução SEDUC 108/2025; o recorte inclui apenas os cargos/funções administrativos indicados, não todo o pessoal das escolas.

Pesquisa e divergências: [evidence/orgaos-2026-09-24/pesquisa-e-proposta.md](evidence/orgaos-2026-09-24/pesquisa-e-proposta.md).

A comparação na página é aritmética e imediata, sem cadastro de fonte ou confirmação de equivalência. Isso não valida natureza, abrangência ou limites administrativos. No motor, `comparisonBasis: 'arithmetic'` explicita esse alcance; o modo padrão continua exigindo contexto e equivalência. Ícones de informação junto dos rótulos explicam o preenchimento com mouse, teclado ou toque. Fontes e explicações longas ficam recolhidas.

O preenchimento existe somente na memória da página e é perdido ao atualizar/fechar. Não há autenticação, banco de cenários ou envio de dados para o SIORG. Links institucionais abrem o portal original em outra aba. O botão de Libras explica que a tradução ainda não está integrada.

## Referência e escopo

Catálogo fixo com os 36 valores-unitários do Anexo I da LC 1.395/2023, conferidos em 14/09/2026. Fonte: https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/compilacao-lei.complementar-1395-22.12.2023.html

Cotas são calculadas com inteiros exatos em centésimos. Diferença = proposta menos atual informado. Ausência não vira zero. Grupos não se compensam. A ferramenta não consulta limites nem aprova propostas; aplicabilidade e processo administrativo dependem de análise própria.

A referência visual é a página Material Instrucional do SIORG observada em 14/09/2026. Logos, fontes Rawline e ícones do portal foram preservados em arquivos locais. A área da calculadora é uma interface nova, dentro da estrutura institucional; no celular, os atalhos de acessibilidade ficam junto ao menu para não cobrir campos.

## Manutenção local

Projeto React/Vite isolado do site Célula. Para uma futura sessão, na pasta deste projeto: `npm install`, depois `npm run dev -- --host 127.0.0.1 --port 4173 --strictPort`.

- `npm test`: testes do cálculo, perfis, impacto da unidade e exportação (48 casos).
- `npm run build`: gera a versão compilada. Não publica.
- `src/calculator.mjs`: catálogo, validação, cálculo exato e resumo.
- `src/organization-profiles.mjs` e `src/data/`: perfis, recortes, referências e estado de conciliação.
- `src/scenario.mjs`: impacto aritmético na secretaria e resumo contextualizado.
- `src/App.jsx`: fluxo da calculadora.
- `src/SiorgShell.jsx`: cabeçalho, navegação, rodapé e acessibilidade.
- `design-qa.md`: evidências e limites da validação.
- `evidence/`: proposta, auditoria da planilha, fontes, capturas e revisão.

A planilha original em Downloads não foi alterada. Integração real, identidade de acesso, homologação das regras e publicação são etapas posteriores.
