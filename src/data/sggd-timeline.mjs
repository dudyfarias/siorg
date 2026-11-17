// Public, source-checked timeline. Original working files remain outside the bundle.
// `date` is always the act date; publication and legal effects are separate facts.
// Related resolutions are grouped for reading, not presented as a legal hierarchy.
export const sggdTimeline = {
  organization: {
    id: 'sggd',
    name: 'Secretaria de Gestão e Governo Digital',
    acronym: 'SGGD',
  },
  checkedAt: '2026-10-22',
  coverageNotice: 'Recorte dos 10 atos selecionados no levantamento recebido: 6 decretos e 4 resoluções. As datas do ato e da publicação foram conferidas nas fontes oficiais. Não é um histórico exaustivo nem uma certificação de vigência de todos os dispositivos; conteúdo sujeito à validação da área técnica.',
  groups: [
    {
      id: 'decreto-69052-2024',
      date: '2024-11-14', actDate: '2024-11-14', publicationDate: '2024-11-14', dateLabel: 'Data do ato',
      title: 'Decreto nº 69.052/2024',
      summary: 'Aprova a estrutura organizacional e o quadro de cargos em comissão e funções de confiança da SGGD. Prevê que o detalhamento das unidades de nível inferior a 14 seja feito por resolução.',
      sources: [
        { label: 'Diário Oficial', url: 'https://doe.sp.gov.br/executivo/decretos/decreto-n-69052-de-14-de-novembro-de-2024-20241114118202720092' },
        { label: 'Texto na ALESP', url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-69052-14.11.2024.html' },
      ],
      citationNote: 'Arts. 1º a 3º. Publicação em edição suplementar de 14/11/2024.',
      statusLabel: 'Alterações posteriores',
      statusDetail: 'Foi alterado pelos Decretos 69.230/2024, 69.506/2025 e 70.755/2026, apresentados nesta linha do tempo. A substituição dos anexos não equivale à revogação integral deste decreto.',
      related: [],
    },
    {
      id: 'decreto-69230-2024',
      date: '2024-12-23', actDate: '2024-12-23', publicationDate: '2024-12-26', dateLabel: 'Data do ato',
      title: 'Decreto nº 69.230/2024',
      summary: 'Altera o Decreto 69.052/2024: acrescenta regras sobre extinção de cargos e funções de servidores afastados e substitui anexos da estrutura e dos sistemas administrativos.',
      sources: [
        { label: 'Diário Oficial', url: 'https://www.doe.sp.gov.br/executivo/decretos/decreto-n-69230-de-23-de-dezembro-de-2024-20241223118202795458' },
        { label: 'Texto na ALESP', url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-69230-23.12.2024.html' },
        { label: 'Alteração pelo Decreto 69.506', url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-69506-30.04.2025.html' },
      ],
      citationNote: 'Arts. 1º a 3º. Vigência na publicação: 26/12/2024.',
      statusLabel: 'Anexo I revogado',
      statusDetail: 'O Decreto 69.506/2025 alterou seu art. 2º e revogou seu Anexo I, com vigência em 02/05/2025. A revogação é específica, não integral.',
      related: [],
    },
    {
      id: 'decreto-69290-2024',
      date: '2024-12-31', actDate: '2024-12-31', publicationDate: '2025-01-01', dateLabel: 'Data do ato',
      title: 'Decreto nº 69.290/2024',
      summary: 'Define a classificação da SGGD nos sistemas de administração financeira e orçamentária, identificando unidades orçamentárias, unidades de despesa e atribuições dos dirigentes.',
      sources: [
        { label: 'Diário Oficial', url: 'https://doe.sp.gov.br/executivo/decretos/decreto-n-69290-de-31-de-dezembro-de-2024-20241231118202802536' },
        { label: 'Texto na ALESP', url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-69290-31.12.2024.html' },
        { label: 'Alteração pelo Decreto 69.873', url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-69873-19.09.2025.html' },
      ],
      citationNote: 'Arts. 1º a 5º. Vigência na publicação: 01/01/2025. Classificação financeira e orçamentária não é uma nova tabela de cotas.',
      statusLabel: 'Alterado pelo Decreto 69.873/2025',
      statusDetail: 'A alteração de 2025 alcança dispositivos do art. 2º, relativos às unidades de despesa.',
      related: [],
    },
    {
      id: 'decreto-69506-2025',
      date: '2025-04-30', actDate: '2025-04-30', publicationDate: '2025-04-30', dateLabel: 'Data do ato',
      title: 'Decreto nº 69.506/2025',
      summary: 'Substitui os Anexos I, II e III do Decreto 69.052/2024, atualizando estrutura, quadro de cargos e funções e respectivos quantitativos e cotas. Também ajusta competências e outros dispositivos.',
      sources: [
        { label: 'Diário Oficial', url: 'https://doe.sp.gov.br/executivo/decretos/decreto-n-69506-de-30-de-abril-de-2025-202504301182021050800' },
        { label: 'Texto na ALESP', url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-69506-30.04.2025.html' },
        { label: 'Revogação específica pelo Decreto 70.599', url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70599-13.05.2026.html' },
      ],
      citationNote: 'Art. 1º; art. 2º, XI e XII; art. 3º. Publicação suplementar em 30/04/2025; vigência em 02/05/2025.',
      statusDetail: 'O Decreto 70.599/2026 revogou apenas o art. 2º, V, a, referente à gestão do BCEP. Os anexos da estrutura receberam nova redação pelo Decreto 70.755/2026.',
      related: [
        {
          id: 'resolucao-sggd-25-2025',
          date: '2025-05-16', actDate: '2025-05-16', publicationDate: '2025-05-19', dateLabel: 'Data do ato',
          title: 'Resolução SGGD nº 25/2025',
          summary: 'Aprova o detalhamento da estrutura da SGGD com fundamento no Decreto 69.052/2024, alterado pelos Decretos 69.230/2024 e 69.506/2025. Revoga a Resolução SGGD 37/2024.',
          relationLabel: 'Resolução vinculada',
          sources: [
            { label: 'Diário Oficial', url: 'https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-25-de-16-05-2025-20250516112812201082990' },
            { label: 'Revogação pela Resolução 33', url: 'https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-33-de-22-07-2026-20260723112912201999213' },
          ],
          citationNote: 'Preâmbulo e arts. 147–148. Vigência em 19/05/2025, com efeitos desde 02/05/2025.',
          statusLabel: 'Revogada pela Resolução 33/2026',
          statusDetail: 'A revogação integral consta do art. 183 da Resolução SGGD 33/2026, cuja vigência geral é 01/08/2026.',
        },
      ],
    },
    {
      id: 'decreto-69873-2025',
      date: '2025-09-19', actDate: '2025-09-19', publicationDate: '2025-09-22', dateLabel: 'Data do ato',
      title: 'Decreto nº 69.873/2025',
      summary: 'Altera o art. 2º do Decreto 69.290/2024, atualizando nomes de unidades de despesa e acrescentando a Diretoria Geral de Pagamento de Pessoal à classificação financeira e orçamentária da SGGD.',
      sources: [
        { label: 'Diário Oficial', url: 'https://www.doe.sp.gov.br/executivo/decretos/decreto-n-69873-de-19-de-setembro-de-2025-202509191182021352921' },
        { label: 'Texto na ALESP', url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-69873-19.09.2025.html' },
      ],
      citationNote: 'Arts. 1º a 3º. Vigência na publicação: 22/09/2025. O art. 3º também revoga os incisos X a XII do art. 5º do Decreto 69.362/2025.',
      related: [],
    },
    {
      id: 'decreto-70755-2026',
      date: '2026-07-14', actDate: '2026-07-14', publicationDate: '2026-07-15', dateLabel: 'Data do ato',
      title: 'Decreto nº 70.755/2026',
      summary: 'Substitui os Anexos I, II e III do Decreto 69.052/2024: estrutura organizacional, quadro demonstrativo e resumo de quantitativos e cotas da SGGD.',
      sources: [
        { label: 'Diário Oficial', url: 'https://doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002' },
        { label: 'Texto na ALESP', url: 'https://www.al.sp.gov.br/repositorio/legislacao/decreto/2026/decreto-70755-14.07.2026.html' },
      ],
      citationNote: 'Arts. 1º e 2º. Vigência geral em 01/08/2026; quatro dispositivos do Anexo I seguem prazo diferido previsto no art. 2º.',
      statusDetail: 'Vigência geral em 01/08/2026. Os dispositivos do Anexo I relacionados no art. 2º têm prazo específico.',
      related: [
        {
          id: 'resolucao-sggd-33-2026',
          date: '2026-07-22', actDate: '2026-07-22', publicationDate: '2026-07-24', dateLabel: 'Data do ato',
          title: 'Resolução SGGD nº 33/2026',
          summary: 'Aprova novo detalhamento da estrutura da SGGD. Seu preâmbulo cita o Decreto 69.052/2024 e suas alterações, incluindo o Decreto 70.755/2026. Revoga integralmente a Resolução 25/2025.',
          relationLabel: 'Resolução vinculada',
          sources: [
            { label: 'Diário Oficial', url: 'https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-33-de-22-07-2026-20260723112912201999213' },
            { label: 'Revogação parcial pela Resolução 39', url: 'https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-39-de-23-09-2026-20260924112912202154847' },
          ],
          citationNote: 'Preâmbulo e arts. 171, 183 e 184. Vigência geral em 01/08/2026; os arts. 6º a 9º seguem o prazo diferido do art. 184.',
          statusLabel: 'Dois dispositivos revogados',
          statusDetail: 'A Resolução 39/2026 revogou apenas o art. 76, XI, e o art. 77, VII. Não houve revogação integral da Resolução 33 por esse ato.',
        },
        {
          id: 'resolucao-sggd-39-2026',
          date: '2026-09-23', actDate: '2026-09-23', publicationDate: '2026-09-25', dateLabel: 'Data do ato',
          title: 'Resolução SGGD nº 39/2026',
          summary: 'Revoga o inciso XI do art. 76 e o inciso VII do art. 77 da Resolução SGGD 33/2026, relativos ao Laudo Técnico Específico para aposentadoria especial.',
          relationLabel: 'Revogação',
          sources: [
            { label: 'Diário Oficial', url: 'https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-39-de-23-09-2026-20260924112912202154847' },
          ],
          citationNote: 'Arts. 1º e 2º. Vigência na publicação: 25/09/2026.',
          statusLabel: 'Revogação parcial da Resolução 33',
          statusDetail: 'Alcança somente os dois dispositivos identificados; não revoga o Decreto 70.755/2026 nem toda a Resolução 33/2026.',
        },
      ],
    },
  ],
  complementaryActs: [
    {
      id: 'resolucao-sggd-42-2025',
      date: '2025-09-08', actDate: '2025-09-08', publicationDate: '2025-09-09', dateLabel: 'Data do ato',
      title: 'Resolução SGGD nº 42/2025',
      summary: 'Estabelece regras e procedimentos gerais de gestão e controle do QGCFC, instituído pela Lei Complementar 1.395/2023, com fundamento no art. 30 do Decreto 68.742/2024.',
      relationLabel: 'Regra geral relacionada',
      sources: [
        { label: 'Diário Oficial', url: 'https://doe.sp.gov.br/executivo/secretaria-de-gestao-e-governo-digital/resolucao-sggd-n-42-de-08-09-2025-20250908112812201325017' },
      ],
      citationNote: 'Preâmbulo e arts. 1º a 3º. Regra transversal; não é detalhamento exclusivo de um decreto da estrutura da SGGD.',
      statusDetail: 'Norma geral do QGCFC; não corresponde a um novo detalhamento exclusivo da estrutura da SGGD.',
    },
  ],
};
