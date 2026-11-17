# Linha do tempo no CMS SP

O pacote [linha-do-tempo-script-application.zip](../outputs/cms-novas-estruturas/linha-do-tempo-script-application.zip) contém apenas o bloco interativo. Ele usa o mesmo catálogo da versão do Vercel, com 16 órgãos e entidades, 105 atos, busca por nome ou sigla, ordem alfabética e datas de ato, publicação e republicação. Herda a fonte da página. Não depende de iframe, Vercel, CDN ou de um framework instalado no CMS.

O bloco deve entrar **acima das abas atuais**, após a introdução da página [Novas Estruturas](https://www.siorg.sp.gov.br/siorg/novas_estruturas). Na conferência de 12/11/2026, foram encontrados 39 blocos com documentos e organogramas. O recorte também não inclui o Decreto SGGD 70.963/2026, já listado no portal. Preserve os blocos existentes, inclusive os links de organogramas; não substitua o conteúdo da página por este ZIP.

## Teste no HCL Digital Experience

1. Abra **SIORG → Novas Estruturas** no [CMS SP](https://admin.cms.sp.gov.br/). Selecione um **projeto de rascunho** ou trabalhe em homologação. Ative **Modo de Edição** e confirme que está nesse contexto antes de alterar a página.
2. No catálogo **Criar → Aplicações**, procure **Script Application**. Se estiver disponível, adicione uma **nova** instância entre a introdução e as abas da página. A importação substitui os arquivos de uma instância existente, por isso o teste deve usar um bloco novo.
3. No bloco novo, use **Importar**, escolha o ZIP e indique **index.html** como arquivo principal se o CMS pedir. O ZIP contém `index.html`, `css/linha-do-tempo.css` e `js/linha-do-tempo.js`, com referências relativas.
4. Abra a prévia do projeto. Teste a busca **SFP** e **agencia**, a seleção por teclado, a ordem dos atos, a republicação ARSESP 1.649 e os links do DOE. Em celular, confira se a lista cabe na tela. Na mesma prévia, confira que as abas e organogramas antigos continuam disponíveis.
5. Encaminhe o rascunho para revisão. Depois da aprovação, publique pelo fluxo do CMS e abra a página sem sessão administrativa para testar a leitura dos arquivos e os links.

O caminho acima segue a documentação da [importação de Script Applications](https://help.hcl-software.com/digital-experience/9.5/CF239/extend_dx/script_application/build_app_with_script_application/script_app_editor/import-apps/) e do [editor em projetos](https://help.hcl-software.com/digital-experience/9.5/CF239/extend_dx/script_application/build_app_with_script_application/script_app_editor/). A presença da aplicação e a permissão de importação ainda precisam ser confirmadas no CMS SP. A HCL descreve [acesso específico ao editor e importador](https://help.hcl-software.com/digital-experience/9.5/CF239/extend_dx/script_application/script_application_security/sp_security_upgrade/), além do acesso editorial ao conteúdo.

## Se o catálogo não oferecer Script Application

Peça à equipe que mantém o CMS um **Visualizador de Conteúdo Web** com um componente HTML. O template ou tema deve carregar o CSS e o JavaScript como recursos institucionais aprovados. Envie os mesmos três arquivos do ZIP; a equipe configura os endereços dos arquivos no template. O [filtro de conteúdo ativo do HCL](https://help.hcl-software.com/digital-experience/9.5/CF238/manage_content/wcm_configuration/cfg_webcontent_auth_env/wcm_config_prop_authoring/#active-content-filtering) pode remover scripts colados em HTML editável ou texto rico. Confira acesso público aos arquivos, tipo de conteúdo e política de scripts na homologação. [Configuração do Visualizador](https://help.hcl-software.com/digital-experience/9.5/CF239/manage_content/wcm_delivery/deliver_webcontent_on_dx/editing_wcm_viewer_setting/wcm_config_wcmviewer_hcontent/) · [Recursos de arquivo](https://help.hcl-software.com/digital-experience/9.5/CF239/manage_content/wcm_authoring/authoring_portlet/content_management_artifacts/elements/using_file_resource_element/wcm_dev_elements_fileresource_referencing/)

## Estado da entrega

ZIP gerado e conferido. Em navegador local, passaram os testes de busca, ordem alfabética dos 16 órgãos, seleção por teclado, atos vinculados, publicação original e republicação, e visualização em 390 px. A página de teste mantém uma área separada para documentos e organogramas. Ainda não foi feita a importação no CMS SP, nem houve alteração no portal ou no Vercel.

Para gerar o ZIP novamente a partir do catálogo: `node scripts/build-cms-timeline.mjs`. A página `previa.html` é só para teste local e fica fora do ZIP de importação.
