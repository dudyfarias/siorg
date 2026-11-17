# Destaque do saldo — 23/10/2026

Pedido: aumentar o destaque da faixa Saldo da Secretaria, preservando o visual SIORG.

Faixa maior, números 28px no tamanho padrão e 22px no celular; CCESP/FCESP separados. Mantidos os mesmos valores, formatação, estados e link de cálculo. Margens de navegação acompanham a faixa e o tamanho da fonte.

Verificado no navegador local em 1280px, 621px e 390px: sem transbordamento horizontal e seção de cálculo abaixo da faixa. Texto a 125%: faixa termina em 176,125px e seção começa em 239,86px. Campo vazio mantém Cálculo pendente nos dois grupos; restauração retorna saldos originais. Base limpa ao final. Revisão independente sem bloqueios. Build de produção concluído (aviso pré-existente de tamanho de pacotes).

Capturas: 01-saldo-destacado.png; 02-celular.png; 03-fonte-ampliada.png. Ajuste local, sem publicação Vercel/CMS e sem mudança na lógica dos cálculos.

## Publicação autorizada

Em 23/10/2026, o usuário autorizou publicar o ajuste para a apresentação. Vercel CLI 59.25.4 retornou deployment dpl_AZxANkuVLURc1LJ4FvZSBhZURQDF, READY, production. URL imutável: https://siorg-calculadora-8npsd14p2-dudycappia-4508s-projects.vercel.app. Alias fixo: https://siorg-calculadora-mvp.vercel.app/.

Alias aberto no navegador sem login. Conferidos fonte dos números28px, faixa154,5px, resultado em191,91px abaixo da faixa em162,5px, ausência de overflow horizontal e de erros de console. Assets públicos index-Y4tovWRr.js / index-CBGPe5vm.css coincidem com o build local. Sem edição de propostas durante esta verificação. Status HTTP numérico não disponibilizado por esta API do navegador; conteúdo e acesso público verificados visualmente.

Quatro testes de empacotamento passaram antes do envio. Revisão independente do allowlist:46 arquivos autorizados; fontes, evidências, documentos e credenciais excluídos. A planilha original pública deliberada mantém SHA256dfb7d13d88d75dfa3ffa4c6de149ca9e06817b04688fc030e2e99866e9772a11. Avisos não bloqueantes do build: dependências transitivas antigas, configuração npm cache-dir, scripts de instalação pendentes e tamanho de pacotes já registrado.

Captura pública04-publicado-vercel.png e asserções em publicacao.json. Nenhuma mudança no CMS, commit ou push.
