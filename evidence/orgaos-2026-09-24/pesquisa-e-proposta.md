# Calculadora SIORG — referências por órgão e proposta para o MVP

Pesquisa em 24/09/2026. Recorte: Secretarias da Educação, da Saúde e de Gestão e Governo Digital do **Estado de São Paulo**, administração direta. Esta entrega documenta fontes, conferências e proposta de funcionamento; não altera a página nem a planilha.

## Decisão recomendada

Adicionar o seletor de órgão, associado a uma referência identificada por decreto e versão. Os quadros conferidos da Educação e da SGGD usam os mesmos valores unitários por espécie e nível do catálogo geral. A diferença encontrada está na composição e nos totais atribuídos a cada órgão. Não há fundamento identificado nesta pesquisa para criar um multiplicador genérico por secretaria.

O cadastro deve separar: **coeficientes por nível**, **quadro autorizado no ato** e **base atual informada pelo usuário**. Uma referência de decreto não informa, sozinha, ocupação, vacância, reservas ou saldo disponível. A LC 1.395/2023 distingue esses objetos nos arts. 3º–4º e 17–18; o art. 6º impede tratar CCESP e FCESP como espécies livremente intercambiáveis. [LC 1.395/2023, compilação oficial](https://www.al.sp.gov.br/repositorio/legislacao/lei.complementar/2023/compilacao-lei.complementar-1395-22.12.2023.html).

## Referências encontradas

| Órgão / quadro | CCESP: quantidade | CCESP: cotas | FCESP: quantidade | FCESP: cotas | Total descritivo |
| --- | ---: | ---: | ---: | ---: | --- |
| Educação — Anexo II do Decreto 70.042/2025 | 1.246 | 3.089,50 | 820 | 1.195,35 | 2.066 posições / 4.284,85 cotas |
| SGGD — resumo, Anexo III do Decreto 70.755/2026 | 298 | 1.066,00 | 201 | 349,35 | 499 posições / 1.415,35 cotas |
| SGGD — soma do quadro por unidades, Anexo II do mesmo ato | 299 | 1.069,50 | 201 | 348,75 | 500 posições / 1.418,25 cotas |
| Saúde — distribuição original de 2024, sem confirmação de base atual | 2.087 | 5.615,00 | 587 | 1.578,00 | 2.674 posições / 7.193,00 cotas |

A linha da Saúde é histórica. As duas linhas da SGGD expõem uma divergência entre anexos na versão consultada e não são alternativas livremente selecionáveis como se ambas estivessem conciliadas.

### Educação

O [Decreto 69.665/2025](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-69665-30.06.2025.html) aprovou a estrutura e substituiu a distribuição anterior da Secretaria. O [Decreto 70.042/2025](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-70042-30.10.2025.html) substituiu seus Anexos II e III; os novos valores têm efeito a partir da publicação em 31/10/2025. A alteração orçamentária do Decreto 70.351/2026 não estabelece novo quadro de cotas.

As 50 linhas do resumo conferem nas multiplicações, nos subtotais e na comparação código a código com o quadro distribuído por unidades. É uma referência adequada para demonstrar o seletor, com identificação explícita do ato e da consulta. A confirmação institucional de completude da cadeia continua distinta da conferência aritmética realizada.

Detalhamento e fontes: [educacao.md](educacao.md).

### SGGD

O [Decreto 69.052/2024](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-69052-14.11.2024.html) tem alterações diretas pelos Decretos 69.230/2024, 69.506/2025 e [70.755/2026](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70755-14.07.2026.html). Este último substitui integralmente os Anexos I, II e III. Seus quadros II e III têm efeito em **01/08/2026**; as exceções temporais do art. 2º incidem somente em dispositivos do Anexo I.

O resumo do Anexo III fecha internamente: 69 linhas de códigos, sendo 45 com quantidade positiva, sem divergência em quantidade × valor unitário. Entretanto, a soma do Anexo II diverge em **11 códigos**, com diferença global de **uma posição e 2,90 cotas**. Extrações independentes do HTML da ALESP confirmaram o resultado. O cotejo com o conteúdo original do DOE encontrou as mesmas 69 linhas do resumo e a mesma soma por código das 407 linhas numéricas do quadro. Exemplo localizável: o quadro distribuído traz uma posição FCESP 2.14, enquanto o resumo registra quantidade zero nesse código. [Publicação do DOE, 15/07/2026](https://www.doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002).

Não corrigir a fonte por inferência nem escolher silenciosamente um dos totais. O perfil deve registrar a divergência e aguardar esclarecimento da área responsável, incluindo eventual retificação aplicável. Os totais do Anexo III podem aparecer na pesquisa como valores declarados desse anexo, sem rótulo de base integralmente conciliada. A reprodução HTML original também contém a divergência; não se trata apenas de uma diferença entre a extração da ALESP e o DOE. Detalhamento: [sggd.md](sggd.md) e [cadeia normativa](sggd-cadeia-verificacao.md).

O exemplo FCESP 2.14 também foi confirmado visualmente no PDF certificado do DOE: página 31 registra uma posição na Assessoria Técnica da Diretoria Geral de Desenvolvimento e Capacidade Institucional; página 40 registra zero no resumo. As imagens de conferência e o PDF estão nesta pasta. Esse cotejo confirma a divergência observada, sem determinar sua causa ou qual composição deve prevalecer.

### Saúde

O [Decreto 68.742/2024, Anexo VII, tabela A](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-68742-05.08.2024.html) contém a distribuição original exibida acima. A pesquisa não confirmou um decreto geral de implantação da Secretaria com cadeia suficiente para definir seu quadro atual. A ausência de resultado não prova inexistência do ato.

Os decretos localizados de HCFAMEMA, HCFMB e HCFMRP têm escopos próprios e não substituem o perfil da Secretaria. A regra de jornada de 30 horas, quando aplicável a postos privativos de profissionais da saúde, trata de retribuição proporcional; não permite presumir redução geral de cotas. A LC 1.395, art. 23 e disposições transitórias, também impede inferir implantação a partir da mera distribuição inicial.

Para o MVP, manter o perfil da Saúde identificado e os dois totais em preenchimento manual até confirmação do ato, alterações, vigência e abrangência. Detalhamento: [saude.md](saude.md).

## Fluxo simples proposto

1. **Secretaria:** Educação, Saúde ou SGGD. A referência aparece em uma linha curta, com decreto, data e link.
2. **Unidade:** seletor dependente, mostrando somente recortes da secretaria escolhida. A opção inicial é **“Toda a secretaria”**. Um recorte de unidade deve declarar se inclui suas subordinadas; o vínculo hierárquico precisa vir dos atos de estrutura/detalhamento, não apenas da ordem das linhas de uma tabela.
3. **Base da comparação:** manter os dois campos no topo, acompanhando o recorte selecionado. Para uma referência conciliada, a ação **“Usar base do decreto”** preenche os totais e os identifica como autorizados. **“Informar valores atuais”** mantém a operação manual semelhante à planilha. Editar uma base copiada muda sua origem para manual.
4. **Proposta:** preservar a tabela compacta com espécie, nível e quantidade, os ícones de informação e as diferenças imediatas em cotas e quantitativo. Fórmula: proposta menos base do recorte selecionado.

Se o perfil não tiver informação suficiente, os campos ficam vazios para preenchimento manual; ausência não vira zero. Na SGGD, informar “Divergência entre anexos — base automática pendente”. Na Saúde, “Base atual pendente de confirmação”. Esses estados não devem parecer falha no preenchimento do usuário.

**Totais na tela:** uma única comparação principal — base, proposta e diferença de cotas e quantitativo — para o recorte escolhido. O total da secretaria aparece como resumo de impacto, sem exigir novo preenchimento dos mesmos dados. Quando houver bases completas e compatíveis, o novo total geral é: total da secretaria menos base da unidade mais proposta da unidade. A operação precisa ser feita por espécie e sem contar novamente uma unidade já incluída no total de outra.

Se a unidade estiver em base manual, o total do órgão faltar ou os recortes/datas/origens forem incompatíveis, mostrar apenas o resultado da unidade e deixar o impacto geral sem estimativa. Não subtrair uma proposta parcial do total da Secretaria e apresentar a diferença como disponibilidade. Autarquias e entidades vinculadas precisam de perfis próprios. Ao trocar secretaria ou unidade com cenário preenchido, permitir cancelar; não conservar ocultamente uma base antiga sob o novo nome nem apagar trabalho sem aviso.

O primeiro conjunto de unidades pode limitar-se aos recortes com hierarquia e composição conferidas. As resoluções de detalhamento abaixo do nível 14 podem ser necessárias: não foram todas auditadas nesta pesquisa. Isso precisa ser concluído antes de oferecer totais automáticos por qualquer unidade.

## Dados e manutenção

Cada perfil guarda órgão, abrangência, referência aos coeficientes, quatro valores por espécie, atos/alterações, vigência, data de consulta e estado de conferência. Preservar versões usadas em simulações; uma atualização do cadastro não recalcula silenciosamente um cenário já aberto. Arquivos locais de referência bastam para demonstrar o MVP; integração e atualização institucional são etapas distintas.

Os códigos completos e as unidades continuam registrados na fonte. O motor atual trabalha por espécie e nível; ao transportar dados para a conta, as categorias de comando e assessoramento de mesmo nível podem ser somadas aritmeticamente. Esse agrupamento não comprova equivalência de atribuições, requisitos ou autorização administrativa.

Detalhamento de arquitetura: [arquitetura.md](arquitetura.md).

## Conferências realizadas e limites

- Educação: reconciliação dos dois anexos; 50 produtos conferidos; transporte para 32 parcelas por espécie/nível; motor atual reproduz 2.066 / 4.284,85 e diferença zero contra a mesma referência.
- SGGD: 69 produtos do resumo conferidos; 34 parcelas positivas no motor reproduzem 499 / 1.415,35. O confronto com o outro anexo falhou: 500 / 1.418,25. A soma interna correta não elimina essa divergência.
- Catálogo geral: leitura visual do Anexo I da LC 1.395, com os 36 coeficientes por espécie/nível, e confronto dos coeficientes presentes nos resumos.
- Saúde: distribuição original identificada e escopos hospitalares separados; quadro atual da Secretaria não confirmado.

Evidências numéricas: `educacao-70042-anexo-II-conferencia.json`, `educacao-validacao-motor.json`, `sggd-70755-quadros.json`, `sggd-70755-cotejo-doe.json` e `sggd-validacao-motor.json`. HTMLs oficiais e fichas consultadas estão preservados nesta pasta. Os valores não são dados de ocupação. Não houve execução da planilha no Excel, homologação, implantação no SIORG ou publicação do aplicativo nesta rodada.
