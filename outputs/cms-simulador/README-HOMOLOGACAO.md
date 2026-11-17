# Simulador SIORG — pacote de homologação no CMS

Preparado em 17/11/2026 a partir da mesma fonte permitida da versão pública do simulador. O repositório original, o Vercel e o CMS não foram alterados por esta preparação. Este ZIP é um candidato para teste; sua criação não comprova implantação ou homologação no CMS.SP.

## Arquivo de importação

`siorg-simulador-script-application-homologacao.zip`

O ZIP contém apenas `index.html` na raiz e `js/siorg-simulator.js`. O arquivo inicial é um fragmento de conteúdo. Cabeçalho, navegação principal e rodapé ficam a cargo do portal. Não há arquivos internos de trabalho, credenciais, mapas de código, configuração de Vercel, dependências Node nem originais privados no ZIP.

O JavaScript clássico reúne o simulador, suas 23 bases públicas, React, PDF, Excel, estilos, quatro fontes locais e os bytes do modelo original da SGGD já publicado. Não contém módulos/importações dinâmicas nem depende do endereço do Vercel, CDN ou arquivos em `/assets` e `/modelos` do portal.

## Como importar para teste

1. A equipe do CMS deve disponibilizar uma nova instância de **Script Application** em contexto de rascunho confirmado ou ambiente de homologação autorizado.
2. Usar **Import** e selecionar o ZIP; o arquivo principal é `index.html`.
3. Conferir o conteúdo na prévia e no contexto de rascunho, sem publicar. Importar sobre uma instância existente substitui seus elementos; usar a instância nova.
4. Se o catálogo mostrar apenas componentes editoriais, o ZIP não deve ser colado em um componente de texto. A equipe administradora precisa disponibilizar o Script Application ou outro mecanismo institucional aprovado que carregue o HTML e o JavaScript.

A HCL documenta ZIP com HTML principal na raiz, recursos relativos e reescrita dos caminhos na importação. O marcador `__SPNS__` permite gerar um identificador próprio da instância. Esses comportamentos precisam ser confirmados na versão/configuração do CMS.SP. [Importação HCL](https://help.hcl-software.com/digital-experience/9.5/CF239/extend_dx/script_application/build_app_with_script_application/script_app_editor/import-apps/) · [Namespace HCL](https://help.hcl-software.com/digital-experience/9.5/CF239/extend_dx/script_application/build_app_with_script_application/cmd_line_push_cmd_patt_rep/).

## Isolamento e recursos preservados

- **Estilos e elementos:** Shadow DOM aberto separa os estilos, IDs e consultas internas do simulador. As fontes têm nomes exclusivos; o portal não recebe regras CSS genéricas. O tamanho em `rem` continua acompanhando a raiz do portal, portanto mudanças de tamanho de texto devem ser conferidas no tema real.
- **Navegação:** as etapas usam âncoras internas ao componente. Não alteram título, rota, histórico ou fragmento `#` do portal. Os links de fontes oficiais continuam abrindo em outra aba. Não há navegação para a linha do tempo dentro deste pacote.
- **Cálculo e saídas:** os motores, bases, regras, resumo TXT, Anexo II PDF e planilha da proposta são os mesmos da fonte publicada, sem mudança de conteúdo ou de aritmética. As limitações de validação técnica já informadas na ferramenta permanecem.
- **Rascunhos:** salvamento no armazenamento local do navegador, com prefixo próprio `siorg-cms:`; exportação/importação do arquivo JSON preservada. Não é salvamento na conta do CMS, em servidor, entre computadores ou colaboração simultânea. Os rascunhos do Vercel não migram automaticamente entre origens; podem ser transferidos por JSON.
- **Modelo original:** o download SGGD entrega os mesmos 795.591 bytes do arquivo público. Não transforma a planilha em base normativa nova.

## Pontos de compatibilidade a validar no CMS

1. **Componente/permissão/perfil:** confirmar que Script Application está instalado e disponível para a equipe. A documentação HCL informa que o perfil Lightweight impede abrir os diálogos de edição/importação, embora instâncias prontas possam ser usadas em execução. [Limitações HCL](https://help.hcl-software.com/digital-experience/9.5/CF239/extend_dx/script_application/limitations/).
2. **Tamanho/MIME/cache:** o único JS tem aproximadamente 5,09 MB sem compactação. O ZIP tem cerca de 2 MB. Confirmar os limites reais de upload, importação e elemento WCM, o MIME JavaScript, compressão/cache e o acesso no contexto de teste. Não foi presumido um limite padrão do CMS.SP.
3. **Política de conteúdo (CSP):** permitir o JS institucional do WCM; estilos do componente são inseridos em `<style>` no Shadow DOM; as fontes usam `data:` pela FontFace API; os downloads usam `blob:`. Um nonce do script, se fornecido pelo CMS, é reaproveitado no estilo. Não é criado nonce artificial, não há alteração de CSP nem tentativa de contornar a política. A equipe deve adaptar a integração caso a política vigente bloqueie algum recurso.
4. **Navegadores/tema:** exige navegador moderno com Shadow DOM, FontFace, BigInt, Blob, dialog e localStorage; testar Chrome/Edge adotados pela instituição. O saldo fixo deve ser conferido com o cabeçalho real. Se necessário, configurar no host `--siorg-cms-sticky-top` para o deslocamento do cabeçalho. Não foi feito ajuste específico presumindo a altura do tema.
5. **Acessibilidade do portal:** a semântica e o teclado do simulador foram preservados, mas extensões de acessibilidade que só percorrem o DOM externo podem não entrar no Shadow DOM. Conferir leitura por tecnologia assistiva, contraste do tema, aumento de fonte, diálogos e tradução do portal no ambiente real.
6. **Instâncias:** usar uma instância do simulador por página na primeira homologação. A montagem é idempotente e o namespace separa o host; duas instâncias compartilham a chave de rascunho por órgão/versão nesta origem, portanto não devem ser apresentadas como propostas independentes simultâneas. Ao remover o componente, o React é desmontado e o download original é liberado.

## Prévia e reprodução local

A prévia é `http://127.0.0.1:4187/preview/index.html`, enquanto o servidor local estiver ativo. As faixas e os estilos roxos são sentinelas de teste, fora do ZIP; ajudam a verificar que o portal e o simulador não alteram o visual um do outro.

O diretório `work` contém uma cópia da fonte pública e o adaptador de integração. `prepare.py` copia apenas a lista permitida; `build.mjs` gera o pacote com o Vite já instalado; `verify.mjs` verifica integridade e o formato do bundle. O arquivo `source-manifest.json` guarda os hashes da fonte original e permite confirmar que ela permaneceu intacta. Nenhum desses arquivos de trabalho entra no ZIP.

Para reproduzir nesta máquina: executar `prepare.py` com Python 3, depois `node build.mjs`, `node verify.mjs` e os testes indicados em `verification-static.json`. A dependência `work/node_modules` é um vínculo local para as dependências já instaladas; não entra no ZIP e, em outra máquina, deverá ser substituída por instalação com o `package-lock.json` da cópia.

As evidências de conferência estão em `verification-static.json`, `tests-exportacao.txt` e `package-manifest.json`. Foram aprovadas 19 verificações estáticas, 5 testes do adaptador de isolamento e 62 testes dos módulos copiados de proposta, resumo, PDF e Excel. Os 58 arquivos permitidos da fonte original permaneceram intactos. O ZIP final tem 2.044.317 bytes e SHA256 `c774ccbcffbaf488e14872f176808443217c005afb275d28e4dad53b7ebbe981`; seu JS tem 5.093.286 bytes. A conferência local não substitui a importação e o teste no contexto institucional.
