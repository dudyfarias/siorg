# Calculadora de Cotas — MVP para SIORG

Página de demonstração, preparada em 14/09/2026, simplificada em 17/09/2026 e ampliada com secretarias/unidades em 24/09/2026. SGGD é o foco e a seleção inicial. O destino proposto é uma ferramenta dentro do SIORG; esta entrega não está integrada ao portal. A atualização com Anexo III como limite e Anexo II como alocação foi publicada e conferida em 24/09/2026 como protótipo público para avaliação.

## Link público

**https://siorg-calculadora-mvp.vercel.app/** — atualização de limites/alocação conferida em 24/09/2026: HTTP200 anônimo no alias fixo, arquivos públicos iguais ao build local e cálculo/resumo da DMO testados no navegador público. Os cálculos continuam no navegador, sem salvar simulações no servidor.

## Experimentar

A página local é http://127.0.0.1:4173/. Começa na SGGD com a alocação documental do Anexo II e a proposta inicialmente igual a essa alocação. O Anexo III fornece os limites da secretaria, mostrados separadamente. Ao selecionar uma unidade com referência, sua alocação e composição do Anexo II são preenchidas automaticamente. **Ver exemplo** é uma opção separada e sempre identificada como fictícia.

1. Escolha **Secretaria → Unidade**, nos dois seletores compactos lado a lado. “Toda a secretaria” é o recorte inicial. A descrição abaixo informa a abrangência.
2. Na SGGD, confira **Limite do Anexo III → Alocado no Anexo II → Saldo disponível**, com quantitativo e cotas separados em CCESP e FCESP. A alocação documental fica protegida. Onde houver preenchimento manual, os quatro campos mantêm apenas a comparação local, sem aplicar disponibilidade automaticamente. Ausência não vira zero. Saúde e Outra unidade começam em branco por não terem base disponível.
3. Ajuste as quantidades preenchidas na proposta. Também pode incluir tipo, nível e quantidade em novas linhas. Monte a **composição final completa**, incluindo os postos mantidos, não apenas os acréscimos.
4. Confira o **saldo após a proposta**, por espécie e por medida. Na secretaria inteira, a proposta representa a nova alocação total. Na unidade, a projeção mantém o restante da secretaria e substitui apenas o recorte selecionado. Um saldo negativo sinaliza extrapolação, mesmo que a outra espécie tenha margem. A variação local em relação ao alocado fica disponível separadamente. Use **Ver e copiar resumo** para guardar os valores, as fontes e as pendências.

### Roteiro de apresentação da SGGD

Selecione **SGGD → Diretoria de Modernização Organizacional**. A alocação e a proposta carregam os 7 postos diretos e 24,70 cotas do Anexo II. Sem edição, a variação local é zero, mas o saldo da secretaria já reflete III menos II: CCESP −1 posto/−3,50 cotas e FCESP 0/+0,60. Aumente em 1 o quantitativo CCESP de nível 8: o saldo projetado da secretaria passa a −2 postos/−6,25 cotas em CCESP; FCESP permanece inalterado. Abra o resumo para mostrar recorte, hipótese de manutenção do restante, limites e alocação com suas fontes. **Ver exemplo** continua disponível com números fictícios separados (6/10,50 → 7/12,50), sem disponibilidade automática.

Trocar secretaria/unidade com uma base ainda não editada carrega imediatamente a referência da nova seleção. Se houver alterações, abre confirmação; cancelar preserva tudo, confirmar substitui pela nova referência (ou inicia vazio quando indisponível). “Outra unidade” aceita identificação própria e protege o nome quando associado a dados; **Alterar unidade** inicia a troca. Esta versão trabalha com um recorte por vez, sem somar propostas sobrepostas.

### Bases por secretaria

| Secretaria | Referência no MVP | Preenchimento |
| --- | --- | --- |
| SGGD | Decreto 70.755/2026; Anexo III = limite e Anexo II = alocação, conforme definição explícita do usuário; cinco unidades reais no seletor | Alocação e proposta inicial vêm do II (secretaria: 500 postos / 1.418,25 cotas). O limite III (499 / 1.415,35) é comparado separadamente com a alocação atual e projetada, por espécie e medida. |
| Educação | Decreto 70.042/2025: secretaria completa e URE Bauru, conciliadas aritmeticamente nos anexos | Carga automática do quadro autorizado, com proposta inicial igual à base. |
| Saúde | Decreto 68.742/2024 histórico; atualização pendente | Manual. |

Nenhum dos quadros de referência comprova ocupação atual. Na SGGD, os números dos dois anexos são preservados como objetos distintos: limite e alocação. Sua diferença é o saldo adotado nesta simulação; não se força igualdade entre os quadros. Os recortes diretos DMO, Inovação e Normas/Logística não incluem subordinadas. DG e Subsecretaria de Gestão incluem as subordinadas explicitamente relacionadas na Resolução SGGD 33/2026. A memória de seleção das linhas está em `evidence/sggd-autofill-2026-09-24/`.

O quadro autorizado do decreto não comprova ocupação atual. Na Educação, os campos passam a **Cotas da base / Quantitativo da base** e ficam protegidos; a opção de informar valores manualmente desativa a consolidação. Para URE Bauru, o total estimado da secretaria usa **base da secretaria − base da unidade + proposta completa da unidade**, preservando o restante e calculando cada espécie separadamente. Não é saldo disponível nem autorização. Secretaria inteira: 2.066 postos / 4.284,85 cotas; Bauru: 16 postos / 31,30 cotas. A hierarquia de Bauru é fundamentada também na Resolução SEDUC 108/2025; o recorte inclui apenas os cargos/funções administrativos indicados, não todo o pessoal das escolas.

Pesquisa e divergências: [evidence/orgaos-2026-09-24/pesquisa-e-proposta.md](evidence/orgaos-2026-09-24/pesquisa-e-proposta.md).

A comparação é aritmética e imediata: são quatro checagens, quantitativo e cotas de cada espécie. Na SGGD, **saldo atual = limite III − alocado II**; **saldo após proposta = limite III − alocação projetada**. Para unidade, **alocação projetada = II da secretaria − II da unidade + proposta completa da unidade**. Valores negativos geram extrapolação. CCESP e FCESP nunca se compensam; o total geral é apenas descritivo. A área técnica ainda valida a base e as regras, e o resultado não equivale a homologação ou aprovação administrativa. Bases manuais, exemplos e recortes sem referência aplicável ficam na comparação local, sem limite automático. No motor, `comparisonBasis: 'arithmetic'` mantém as diferenças numéricas; o módulo de disponibilidade aplica separadamente os papéis III/II. Ícones de informação explicam o preenchimento com mouse, teclado ou toque. Fontes e explicações longas ficam recolhidas.

Se a proposta estiver vazia, incompleta ou inválida, o quadro de limite/alocação e o saldo atual continuam disponíveis quando a base documental corresponde ao recorte. A projeção e seu saldo ficam pendentes, sem supor zero.

O preenchimento existe somente na memória da página e é perdido ao atualizar/fechar. Não há autenticação, banco de cenários ou envio de dados para o SIORG. Links institucionais abrem o portal original em outra aba. O botão de Libras explica que a tradução ainda não está integrada.

## Referência e escopo

Catálogo fixo com os 36 valores-unitários do Anexo I da LC 1.395/2023, conferidos em 14/09/2026. Fonte: https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/compilacao-lei.complementar-1395-22.12.2023.html

Cotas são calculadas com inteiros exatos em centésimos. **Variação = proposta − alocado/base informada**; **saldo disponível = limite − alocado/projetado**, quando os limites documentais são aplicáveis. Ausência não vira zero. Grupos não se compensam. A ferramenta sinaliza extrapolações numéricas na regra adotada, ainda em validação técnica; não certifica nem aprova administrativamente a proposta. Não há tolerância percentual automática.

A referência visual é a página Material Instrucional do SIORG observada em 14/09/2026. Logos, fontes Rawline e ícones do portal foram preservados em arquivos locais. A área da calculadora é uma interface nova, dentro da estrutura institucional; no celular, os atalhos de acessibilidade ficam junto ao menu para não cobrir campos.

## Manutenção local

Projeto React/Vite isolado do site Célula. Para uma futura sessão, na pasta deste projeto: `npm install`, depois `npm run dev -- --host 127.0.0.1 --port 4173 --strictPort`.

- `npm test`: testes do cálculo, perfis, disponibilidade, impacto da unidade e exportação.
- `npm run build`: gera a versão compilada. Não publica.
- `src/calculator.mjs`: catálogo, validação, cálculo exato e resumo.
- `src/organization-profiles.mjs` e `src/data/`: perfis, recortes, referências e estado de conciliação.
- `src/scenario.mjs`: impacto aritmético na secretaria e resumo contextualizado.
- `src/reference-balance.mjs`: saldo/excesso numérico das quatro medidas e resumo sem compensação.
- `src/quota-availability.mjs`: limites III versus alocação II e projeção da secretaria, com origem/versões conferidas e proposta incompleta mantida pendente.
- `getCalculatorScope('sggd', 'all')` fornece o limite III. `getScope('sggd', 'all')` e `getScope('sggd', unidade)` fornecem a alocação II; a interface usa esses dados para base e proposta inicial. Os getters de calculadora continuam disponíveis, mas o quadro III não é carregado como se fosse alocação II.
- `src/App.jsx`: fluxo da calculadora.
- `src/SiorgShell.jsx`: cabeçalho, navegação, rodapé e acessibilidade.
- `design-qa.md`: evidências e limites da validação.
- `evidence/`: proposta, auditoria da planilha, fontes, capturas e revisão.

A planilha original em Downloads não foi alterada. Integração real, identidade de acesso e homologação institucional continuam como etapas posteriores. A publicação atual é apenas do protótipo para avaliação.

## Publicação Vercel

Projeto `siorg-calculadora-mvp`, equipe `dudycappia-4508s-projects`. `vercel.json` define Vite, `npm ci`, `npx vite build` e saída `dist/client`; o empacotamento Sites local é preservado. A lista `.vercelignore` permite apenas a aplicação, assets e configuração necessária, excluindo pesquisas, documentos, testes, planilha e variáveis locais.

Para republicar quando autorizado: `npx --yes vercel@59.25.4 deploy --prod --yes --scope dudycappia-4508s-projects`, dentro desta pasta. Revalidar sempre o alias público sem autenticação e as interações alteradas. Registro desta publicação em `evidence/vercel-2026-09-24/deployment.json` e `public-http.json`.

## Fechamento funcional da calculadora — 24/09/2026

O usuário confirmou que a área técnica ainda está validando a base e as regras e definiu explicitamente: **Anexo III = limite disponível; Anexo II = efetivamente alocado na estrutura; diferença = saldo disponível**. Isso substitui a interpretação temporária que carregava o III como alocação/proposta inicial e bloqueava a comparação entre anexos. Os dados oficiais dos dois quadros permanecem intactos.

Os limites III são CCESP 298 / 1.066,00 cotas e FCESP 201 / 349,35. A alocação II inicial é CCESP 299 / 1.069,50 e FCESP 201 / 348,75. Portanto, antes de qualquer edição, o saldo é CCESP −1 posto/−3,50 cotas e FCESP 0/+0,60. Na unidade, subtrai-se sua alocação do **total alocado II**, acrescenta-se a proposta completa e compara-se a projeção com o **limite III**. Não se subtrai a unidade diretamente do limite para compor a nova estrutura.

As planilhas foram lidas sem alteração. Os 45 códigos não zero de `SGGD- TESTE.xlsx` coincidem com o III e são agrupados em 34 linhas por espécie/nível na referência desse anexo, sem afirmar equivalência administrativa entre categorias. `SGGD_SIMULADOR_.xlsx` mudou os rótulos para III/II, mas manteve os mesmos dados A:F do III; os totais omitem a última linha 57 e parte das fórmulas de cotas atuais usa a proposta, anulando a variação. O aplicativo mantém a alocação real do II, recalcula os totais a partir das linhas e não reproduz essas falhas. Conferência: [planilha-sggd-simulador.md](evidence/calculadora-limites-2026-09-24/planilha-sggd-simulador.md).

A distribuição simultânea, o organograma e a linha histórica permanecem fora desta atualização. A versão de limites/alocação está no endereço público. Registro: `evidence/calculadora-limites-2026-09-24/final-public-http.json`, `final-browser-checks.json` e `final-public-summary.txt`. Deployment: `dpl_7KYjVVpgn23Lsm9pJuRsK8zAG7Qg`. Verificação: 98 testes de cálculo/perfis/saldos/resumos, build e 4 testes de empacotamento passaram.

Evidências da planilha, revisão de cálculos e conferência da interface: `evidence/calculadora-limites-2026-09-24/`.
