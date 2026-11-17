# SIORG

Protótipo do Simulador de Reestruturação, da Calculadora de Cotas e da Linha do Tempo dos órgãos e entidades do Estado de São Paulo.

O simulador reúne 23 órgãos e entidades. A mesma proposta alimenta a edição da estrutura, o cálculo de quantitativos e cotas, o resumo das alterações e o quadro proposto em PDF e Excel. A Linha do Tempo reúne 16 órgãos e entidades e 105 atos no recorte documental atual.

A versão de testes está no [simulador](https://siorg-calculadora-mvp.vercel.app/) e na [Linha do Tempo](https://siorg-calculadora-mvp.vercel.app/novas-estruturas). A publicação dos ajustes da CMO foi registrada em 16 de novembro de 2026. O acompanhamento deste repositório foi preparado em 17 de novembro de 2026.

As bases e as regras continuam em validação pela área técnica. A integração das aplicações no CMS aguarda a liberação do componente pelo administrador e os testes no ambiente institucional.

## Começar

Use Node.js 22.12 ou superior. Após clonar o repositório, execute na pasta do projeto.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

Abra `http://127.0.0.1:4173/` para usar o simulador e `http://127.0.0.1:4173/novas-estruturas` para a Linha do Tempo. A calculadora agregada anterior continua acessível por `?modo=calculadora`.

Os comandos de verificação e compilação são os seguintes.

```sh
npm test
npm run test:sites
npm run build
```

A compilação gera a aplicação em `dist/client` e o empacotamento de integração em `dist/server` e `dist/.openai`.

## Como a proposta funciona

As alterações de quantidade e código e as ações de criar, renomear, transferir e retirar unidades compõem a proposta inteira do órgão. Selecionar outra unidade mantém as alterações já feitas.

CCESP e FCESP são calculados separadamente. Na SGGD, o Anexo III fornece os limites e o Anexo II fornece a distribuição de referência. Os números de origem e as divergências ficam identificados para a revisão técnica.

O rascunho é salvo no mesmo navegador. A cópia em JSON permite retomar a edição em outro computador. O Excel exportado contém os valores da simulação para consulta e compartilhamento. Salvar por conta, editar uma proposta em equipe e manter um histórico de cada ação são funções previstas para uma etapa adicional.

## Documentos para a equipe

- [Situação dos 33 apontamentos](<outputs/SIORG - Situacao dos ajustes e pendencias - 17-11-2026.docx>)
- [Seis apontamentos para validação técnica](<outputs/SIORG - Apontamentos para validacao tecnica.docx>)
- [Relatório de viabilidade no CMS](<outputs/SIORG - Relatorio de viabilidade no CMS.docx>)
- [Vídeo com navegação, cliques e voz V4](<outputs/video-siorg/SIORG - Guia com navegação na tela.mp4>)
- [Roteiro do vídeo](outputs/video-siorg/Roteiro-video-SIORG.md)
- [Legendas do vídeo](outputs/video-siorg/Legendas-SIORG.srt)
- [Encaminhamento dos apontamentos da CMO](docs/apontamentos-v1-encaminhamento.md)
- [Orientações da Linha do Tempo no CMS](docs/cms-novas-estruturas.md)
- [Pacote da Linha do Tempo para o CMS](outputs/cms-novas-estruturas/linha-do-tempo-script-application.zip)
- [Pacote do simulador para homologação no CMS](outputs/cms-simulador/README-HOMOLOGACAO.md)
- [Conferência das bases dos órgãos](evidence/orgaos-2026-11-16/conferencia-dos-orgaos.md)
- [Roteiro de teste da SGGD](docs/roteiro-teste-sggd-2026-10-22.md)
- [Materiais recebidos e planilhas originais](sources/recebidos-2026-11-17/README.md)

## Organização dos arquivos

| Pasta | Conteúdo |
| --- | --- |
| `src` | Aplicação, cálculos e bases utilizadas na simulação. |
| `tests` | Testes do cálculo, das propostas, das regras e dos arquivos gerados. |
| `docs` | Orientações, decisões, roteiros e referências. |
| `sources` | Materiais recebidos e planilhas originais usados na preparação. |
| `evidence` | Fontes documentais, conferências, resultados de testes e registros por data. |
| `outputs` | Documentos, vídeos, exemplos exportados e pacotes de integração. |
| `integrations/cms-timeline` | Bloco da Linha do Tempo preparado para o CMS. |
| `scripts` | Importação, geração das bases e empacotamento. |

A produção editável do vídeo está em `outputs/video-siorg/producao`, incluindo gravação final, narração V4 e scripts utilizados. Esses scripts registram os caminhos e as ferramentas do ambiente de produção original e podem exigir adaptação em outro computador.

As verificações em `evidence` têm data e escopo próprios. O [histórico da calculadora de setembro](docs/historico-calculadora-2026-09-24.md) preserva a documentação daquela etapa.

## Compartilhamento

Este repositório é público, conforme a solicitação de compartilhamento com a equipe. O código, as bases de referência, os materiais recebidos, os relatórios e os vídeos podem ser consultados e baixados pelo link do projeto.

As credenciais e as configurações de acesso são mantidas no ambiente de cada pessoa. A aplicação de demonstração usa os dados de referência já presentes no repositório. As dependências são instaladas por `npm ci`.
