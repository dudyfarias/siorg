# Preparação das entregas do SIORG

19 de outubro de 2026 · Eduardo Farias Cappia

## Entrega desta preparação

Organizar o trabalho para apresentar uma versão de teste à equipe. A meta informada é quarta-feira, 21/10, com teste interno na quinta-feira, 22/10. A montagem das três linhas do tempo depende dos arquivos do Rafael e da definição das outras duas entidades pela Tatiana. A integração do simulador no CMS depende também das respostas técnicas que a Tatiana está levantando.

Esta preparação reúne o escopo, a ordem de execução, as dependências e os testes. Ainda não representa a implementação dessas mudanças no ambiente de teste.

## O que entra em cada frente

| Frente | Resultado esperado | Material necessário | Quem participa |
|---|---|---|---|
| Novas estruturas | Seletor de órgão ou entidade e três linhas do tempo com atos agrupados por decreto | HTML, levantamento e documentos do Rafael; definição das três entidades | Eduardo implementa; Rafael fornece o levantamento; Tatiana define os demais pilotos; área técnica confere os atos |
| Produtos | Orientações, escolha do órgão, download do Excel e percurso integrado de simulação | Modelos e orientações da Tatiana; regras e estrutura validadas; retorno técnico do CMS | Eduardo prepara o percurso; Tatiana fornece os modelos; área técnica valida dados e regras |
| Ajustes do diagnóstico | Melhorias de organização, apresentação e navegação no teste; Word com questões de conteúdo | Diagnóstico atualizado e identificação dos itens aprovados por Lina | Eduardo organiza e implementa os ajustes autorizados; área responsável devolve os conteúdos revisados |

O piloto será SGGD, uma autarquia e uma agência reguladora, conforme as orientações recebidas. Os nomes das duas últimas permanecem a definir. Os exemplos antigos de Educação e Saúde no protótipo não definem os novos pilotos.

## Materiais recebidos em 19 de outubro

O acesso pelo navegador permitiu obter o HTML do Rafael, o levantamento de atos, o diagnóstico atual da biblioteca, as orientações do simulador, o mapeamento de regimes, o quadro consolidado e o modelo `SGGD- TESTE1.xlsx`. As pastas Autarquias e Agências reguladoras estavam vazias na consulta. Os arquivos foram preservados sem edição. O inventário e as cópias de referência ficam em `sources/preparacao-2026-10-19/`.

O HTML apresenta dez marcos da SGGD, que coincidem com o recorte SGGD da planilha de levantamento. Precisamos transformar a sequência contínua em grupos e separar data do ato de publicação. Na base ampla do levantamento há duplicações e divergências entre links; não importar todas as abas por soma. O quadro consolidado e o modelo SGGD também apresentam quantitativos diferentes. Conferir a origem antes de escolher uma base. Essas diferenças foram registradas para revisão, sem alteração dos arquivos.

## Ordem de execução proposta

| Quando | Trabalho | Condição para avançar |
|---|---|---|
| Segunda 19/10 | Recuperar fontes, conferir o protótipo, fechar estrutura de dados e roteiro; separar questões de conteúdo | Arquivos do SharePoint recebidos; conteúdo e cobertura examinados, validação técnica ainda necessária |
| Terça 20/10 | Montar a linha da SGGD e o percurso de Produtos no teste; incorporar modelos recebidos; aplicar ajustes visuais autorizados | Arquivos do Rafael, modelo SGGD e destino de teste disponíveis |
| Quarta 21/10 | Completar as outras duas linhas, conferir links e totais, preparar a versão para teste e registrar pendências | Entidades e modelos definidos; fontes e acesso recebidos em tempo hábil |
| Quinta 22/10 | Fazer o teste interno com casos combinados; registrar erros e dúvidas de conteúdo separadamente | Versão de teste identificada, fontes rastreáveis e roteiro disponível |
| Sexta 23/10 | Ajustar a partir do teste e alinhar o envio às áreas | Reunião pode ser transferida para sexta, conforme decisão da equipe |

Se uma entrada necessária não chegar, manter a frente documentada como pendente e levar a situação à equipe. O prazo para o simulador completo, salvamento e exportações só pode ser fechado após conferir os modelos e as condições de integração. Não apresentar telas demonstrativas como funcionalidades concluídas.

## Novas estruturas

Percurso: escolher órgão ou entidade → consultar a linha correspondente → expandir os atos relacionados → abrir a fonte oficial.

Cada grupo começa pelo decreto que organiza aquela mudança. A resolução correspondente, eventuais alterações e informações de revogação aparecem vinculadas ao ato pertinente. Os grupos seguem a ordem cronológica dos decretos; atos relacionados mostram suas próprias datas. Um ato relacionado em data posterior não deve parecer anterior por estar dentro de um grupo.

Proposta de apresentação: grupos verticais com data, tipo e número do decreto, resumo curto e link do Diário Oficial. Os atos vinculados podem ser expandidos. Usar as cores e os componentes existentes do portal, com texto e ícones para que a cor não seja a única indicação. Manter espaço para futuras informações da DMO.

Conferir o vínculo entre os atos pelo levantamento e pelo documento oficial. Distinguir revogação total, parcial, alteração e ausência de informação. Não classificar como vigente apenas porque não há revogação cadastrada. Um mesmo ato pode ter relação com mais de um decreto; cadastrar uma vez e referenciar onde for necessário.

## Produtos

Percurso: orientações → escolher órgão ou entidade → baixar o Excel ou iniciar a simulação → montar a proposta → conferir cotas e resumo → gerar o Anexo II proposto.

O simulador começa com uma cópia da estrutura de referência. A pessoa altera a proposta, mantendo a base disponível para comparação. Quantitativos e cotas acompanham as alterações automaticamente. O resumo e as exportações usam a mesma proposta, sem novo preenchimento.

Manter a interface simples, próxima da planilha: unidade selecionada, linhas editáveis, totais visíveis e ajuda no ícone de informação. Os seletores compactos ficam lado a lado, órgão primeiro e unidade depois. A troca de unidade preserva as alterações já feitas em outras unidades. O roteiro prevê manter, acrescentar e retirar cargos; criar, manter, renomear, transferir e retirar unidades. Aplicar cada operação conforme as regras e exceções validadas para o regime. A Reestruturação é o único ponto de edição; os demais resultados são derivados.

O Anexo II proposto contém quatro colunas: Unidade, QTD, Denominação cargo/função e CCESP/FCESP. Excluir retirados, zeros, áreas vazias e informações internas da simulação. Exportar toda a proposta, mesmo com blocos recolhidos na tela. O resumo deve identificar origem e destino das transferências e não tratar uma transferência como criação de outro cargo.

O modelo também prevê valor mensal de referência e variação percentual. Conferir tabela, fonte e vigência antes de mostrar valores financeiros; essa medida não representa a folha completa. Para facilitar o preenchimento no portal, a proposta de UX é editar a quantidade final e derivar as inclusões/retiradas. Essa semântica precisa ser alinhada ao Excel, que atualmente separa manter e acrescentar. Não somar as duas representações.

Preparar uma matriz de regra, condição, exceção, dispositivo e mensagem. A DMO define quando há aviso, justificativa ou bloqueio. Tratar categorias especiais das agências de acordo com seu modelo; não presumir que tudo se enquadra nas regras da SGGD.

Reaproveitar o cálculo existente e a comparação dos anexos. O editor da estrutura completa, a proposta com várias unidades, o resumo detalhado e as exportações precisam ser desenvolvidos. O Excel original do órgão e o Excel preenchido com a simulação são saídas diferentes e devem ser identificados assim na interface.

Para a SGGD, manter a regra acordada: Anexo III fornece os limites; Anexo II fornece o que está alocado; o saldo é a diferença entre os dois. Conferir separadamente quantidade e cotas de CCESP e FCESP. Dados e regras permanecem sujeitos à validação técnica. Cada entidade deve ter sua própria base e regras verificadas.

## Pontos para Tatiana confirmar com a equipe do CMS

1. Qual é o endereço do ambiente de teste e quais permissões estão disponíveis para incluir uma ferramenta interativa?
2. Como a ferramenta poderá consultar os dados aprovados de cada órgão e qual equipe atualizará essa base?
3. Como identificar o usuário e onde guardar a proposta para retomá-la depois? A retomada precisa funcionar em outro computador?
4. O ambiente permite gerar e baixar PDF e Excel? Há restrições de bibliotecas, tamanho de arquivos ou chamadas a serviços?
5. Quem acompanha o teste e quais dados de uso estão disponíveis para avaliar desempenho e erros?

Ainda não há medição que permita apontar o servidor como gargalo. O teste deve registrar tamanho das estruturas, número de acessos simultâneos, tempo de resposta, falhas e custo de salvar e exportar. A equipe técnica poderá então avaliar a capacidade necessária.

## Condições para apresentar o teste como pronto

- A seleção mostra apenas entidades realmente incorporadas e identifica a fonte e a versão de cada base.
- Cada decreto abre sua fonte oficial e mostra corretamente os atos vinculados, inclusive revogação quando documentada.
- Alterar uma unidade preserva a proposta nas demais e não conta a mesma posição duas vezes.
- Uma mudança aparece de forma consistente na estrutura, nos totais, no resumo e nas saídas geradas.
- Extrapolação, campo inválido e base incompleta aparecem como situações distintas; ausência de dados não vira zero.
- O Anexo II e a planilha da simulação reproduzem a proposta e o modelo aprovado, com identificação de que são uma proposta.
- O Anexo II mantém as quatro colunas, exclui zeros e retirados e exporta tudo, independentemente do recolhimento visual. Conferir matrizes dinâmicas na versão de Excel usada pela equipe.
- Retomar uma proposta só é apresentado como disponível depois de verificar fechamento e reabertura no cenário combinado com a equipe técnica.
- Seleção, ajuda e expansão dos atos funcionam com teclado e em tela pequena.
- A equipe registra o que passou, o que falhou e quem precisa responder às pendências de conteúdo.

## Materiais ainda necessários

Nomes da autarquia e da agência; seus modelos específicos; validação técnica do modelo SGGD e das bases divergentes; conferência de datas, links e relações entre atos; redação final das orientações; identificação dos ajustes aprovados; endereço e permissões do ambiente de teste; respostas sobre armazenamento, acesso e exportação.

As orientações e os modelos recebidos permitem fechar o desenho das telas, organizar os campos e preparar os casos de teste da SGGD. A ausência de um arquivo ou de uma resposta deve ficar associada à entrega afetada, para ajustar o prazo com clareza. O Word de revisão de conteúdo usa o diagnóstico obtido no SharePoint; os apontamentos de setembro pedem confirmação da situação atual do portal.
