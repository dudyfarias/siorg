# Calculadora de Cotas — MVP para SIORG

Página local de demonstração, preparada em 14/09/2026, simplificada em 17/09/2026 e ampliada com secretarias/unidades em 24/09/2026. SGGD é o foco e a seleção inicial. O destino proposto é uma ferramenta dentro do SIORG; esta entrega não está integrada ao portal. Foi publicada em 24/09/2026 como protótipo público para avaliação.

## Link público

**https://siorg-calculadora-mvp.vercel.app/** — acesso sem login, conferido em 24/09/2026. O preenchimento automático da SGGD, a comparação e a exportação de resumo foram verificados na versão publicada. Os cálculos continuam no navegador, sem salvar simulações no servidor.

## Experimentar

A página local é http://127.0.0.1:4173/. Começa na SGGD com as quantidades documentais do Anexo II. Ao selecionar uma unidade com referência, a base e a composição são preenchidas automaticamente. **Ver exemplo** é uma opção separada e sempre identificada como fictícia.

1. Escolha **Secretaria → Unidade**, nos dois seletores compactos lado a lado. “Toda a secretaria” é o recorte inicial. A descrição abaixo informa a abrangência.
2. Confira **Cotas da base** e **Quantitativo da base**, carregados para o recorte selecionado. A origem fica indicada ao lado. Para comparar com outro levantamento, use **Informar valores manualmente**; os campos passam a Cotas atuais / Quantitativo atual, com os totais de CCESP + FCESP, como nas células B2/C2 da planilha. Saúde e Outra unidade começam em branco por não terem uma base disponível.
3. Ajuste as quantidades preenchidas na proposta. Também pode incluir tipo, nível e quantidade em novas linhas. Monte a **composição final completa**, incluindo os postos mantidos, não apenas os acréscimos.
4. Confira os totais separados de CCESP/FCESP e o resultado **Atual → Proposta → Diferença**, com aumento ou redução de cotas e quantitativo. Use **Ver e copiar resumo** para guardar o texto, a identificação e as referências.

### Roteiro de apresentação da SGGD

Selecione **SGGD → Diretoria de Modernização Organizacional**. A base documental e a proposta carregam os 7 postos diretos e 24,70 cotas do Anexo II. Sem edição, a diferença é zero. Altere uma quantidade e confira a variação; abra o resumo para mostrar unidade, abrangência e origem documental. Troque para outra unidade sem editar para demonstrar a carga automática. O quadro do Anexo II tem divergências com o resumo do Anexo III: não é apresentado como base conciliada nem ocupação atual. **Ver exemplo** continua disponível com números fictícios separados (6/10,50 → 7/12,50).

Trocar secretaria/unidade com uma base ainda não editada carrega imediatamente a referência da nova seleção. Se houver alterações, abre confirmação; cancelar preserva tudo, confirmar substitui pela nova referência (ou inicia vazio quando indisponível). “Outra unidade” aceita identificação própria e protege o nome quando associado a dados; **Alterar unidade** inicia a troca. Esta versão trabalha com um recorte por vez, sem somar propostas sobrepostas.

### Bases por secretaria

| Secretaria | Referência no MVP | Preenchimento |
| --- | --- | --- |
| SGGD | Decreto 70.755/2026, anexos com divergências documentadas; cinco unidades reais no seletor | Carga automática do Anexo II por recorte, identificada como documental e pendente de conciliação com o Anexo III. Sem consolidação oficial. |
| Educação | Decreto 70.042/2025: secretaria completa e URE Bauru, conciliadas aritmeticamente nos anexos | Carga automática do quadro autorizado, com proposta inicial igual à base. |
| Saúde | Decreto 68.742/2024 histórico; atualização pendente | Manual. |

Nenhum dos quadros de referência comprova ocupação atual. Na SGGD, o Anexo II soma 500 postos / 1.418,25 cotas e o resumo III informa 499 / 1.415,35; o MVP mantém cada origem distinta. Os recortes diretos DMO, Inovação e Normas/Logística não incluem subordinadas. DG e Subsecretaria de Gestão incluem as subordinadas explicitamente relacionadas na Resolução SGGD 33/2026. A memória de seleção das linhas está em `evidence/sggd-autofill-2026-09-24/`.

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

- `npm test`: testes do cálculo, perfis, impacto da unidade e exportação.
- `npm run build`: gera a versão compilada. Não publica.
- `src/calculator.mjs`: catálogo, validação, cálculo exato e resumo.
- `src/organization-profiles.mjs` e `src/data/`: perfis, recortes, referências e estado de conciliação.
- `src/scenario.mjs`: impacto aritmético na secretaria e resumo contextualizado.
- `src/App.jsx`: fluxo da calculadora.
- `src/SiorgShell.jsx`: cabeçalho, navegação, rodapé e acessibilidade.
- `design-qa.md`: evidências e limites da validação.
- `evidence/`: proposta, auditoria da planilha, fontes, capturas e revisão.

A planilha original em Downloads não foi alterada. Integração real, identidade de acesso e homologação institucional continuam como etapas posteriores. A publicação atual é apenas do protótipo para avaliação.

## Publicação Vercel

Projeto `siorg-calculadora-mvp`, equipe `dudycappia-4508s-projects`. `vercel.json` define Vite, `npm ci`, `npx vite build` e saída `dist/client`; o empacotamento Sites local é preservado. A lista `.vercelignore` permite apenas a aplicação, assets e configuração necessária, excluindo pesquisas, documentos, testes, planilha e variáveis locais.

Para republicar quando autorizado: `npx --yes vercel@59.25.4 deploy --prod --yes --scope dudycappia-4508s-projects`, dentro desta pasta. Revalidar sempre o alias público sem autenticação e as interações alteradas. Registro desta publicação em `evidence/vercel-2026-09-24/deployment.json` e `public-http.json`.
