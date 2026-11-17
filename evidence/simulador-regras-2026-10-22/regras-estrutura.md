# Regras estruturais do piloto SGGD

Conferência em 22/10/2026. Implementação: `src/structure-rules.mjs`. Escopo: proposta completa da SGGD; avaliação somente leitura, independente do filtro de unidades. Os alertas não alteram quantidades, códigos, cotas ou a base. Não representam aprovação administrativa.

## Fontes recebidas

- `Downloads/SGGD-SGGD (1).xlsx`, SHA-256 `dfb7d13d88d75dfa3ffa4c6de149ca9e06817b04688fc030e2e99866e9772a11`.
- `sources/preparacao-2026-10-19/Orientacoes_simulador_cotas.docx`: seção de regras e alertas, exemplos e orientação para distinguir regra, exceção e validação da DMO.
- A planilha foi lida com valores e fórmulas; não foi alterada, recalculada ou exportada. Resultados registrados em “Simulações realizadas” são afirmações do arquivo recebido, não evidência de execução de Excel nesta revisão.

Referências inspecionadas na planilha: `Instruções!B9:B17`; `Simulações realizadas!A6:N21`; `Regras do regime!A4:G35`; `Reestruturação!AM8:AU8`, `AM17:AU17`, `M14:N14`, `M1302:N1302`. As fórmulas identificam comando pelo primeiro dígito do código. A validação de quantidade exige inteiro não negativo. Alertas de nomenclatura, nível, comando, área de controle e contagem mínima foram confrontados com as fontes públicas abaixo.

## Fontes públicas e alcance

- [Decreto 68.742/2024](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-68742-05.08.2024.html): arts. 6º e 7º, art. 16, § 4º, arts. 17 e 18 e Anexo VIII, tabela A, linha SGGD.
- [Decreto 69.286/2024](https://www.al.sp.gov.br/repositorio/legislacao/decreto/2024/decreto-69286-30.12.2024.html): art. 1º, V, a, tabela de nomenclatura/nível da administração direta; art. 1º, VII, legenda do Anexo VIII; art. 2º, III, exceção de nomenclatura.

Foi feita busca por alterações dos dispositivos relevantes nas fontes públicas. Esta leitura verifica o fundamento das regras implementadas, sem substituir exame de regimes próprios, atos excepcionais ou validação jurídica da proposta.

## Regras implementadas

| Condição | Resultado | Fundamento e limite |
| --- | --- | --- |
| Unidade ativa perde todo código de comando; nova unidade sem comando | Erro novo verificado | Arts. 6º e 7º. Titular é identificado pelo código 1, nunca apenas pelo nome. Entrada incompleta suspende esta inferência. |
| Denominação e categoria do código divergem | Erro novo verificado | Tabela A e, para Chefe de Assessoria, art. 7º, § 4º. |
| Nível fora da faixa da denominação | Aviso verificado | Tabela A; eventual exceção exige conferência. |
| Assessoramento no mesmo nível ou acima do comando da unidade | Erro novo verificado | Art. 6º, §§ 3º e 4º. |
| Ouvidoria ou Integridade explicitamente classificada com titular abaixo de 5 | Erro novo verificado | Anexo VIII da SGGD. Nome sugestivo sem classificação produz somente aviso. |
| Diretoria sem duas unidades vinculadas na faixa de até dois níveis inferiores | Aviso | Art. 18. Contagem por identidade, vínculo direto e titular; vínculos retirados não contam. |
| Diretoria Geral ou Coordenadoria Geral sem duas unidades no nível imediatamente inferior | Aviso | Art. 18; atribuições e justificativa seguem para revisão. |
| Subsecretaria abaixo de três unidades até dois níveis inferiores | Aviso, nunca aprovação/reprovação automática | Art. 17 prevê hipótese alternativa. Gestão Corporativa tem regra específica de duas unidades até quatro níveis inferiores. |

Também são sinalizados múltiplos códigos de comando na mesma unidade, enquadramento não mapeado, nível de titular incompatível com vínculo superior informado e áreas de controle marcadas como não aplicáveis. Condições que dependem de classificação ou vínculo ainda não confirmado recebem `model-review`.

## Divergências da planilha e da base preservadas

1. `Regras do regime!D24` aceita Chefe de Assessoria como “Ambos”. O art. 7º, § 4º, item 2, exige comando. A base documental contém Chefe de Assessoria com `FCESP 2.14` em uma Assessoria Técnica: a diferença fica como revisão herdada, sem corrigir o quadro recebido.
2. A Consultoria Jurídica não tem código 1 no conjunto importado. O módulo pede conferência de titularidade/regime específico; não inventa um titular nem muda assessoramento para comando.
3. A Coordenadoria de Inteligência em Gestão contém Assessor II com código de nível 12, enquanto a tabela associa a denominação ao nível 10. O dado original continua preservado.
4. Um vínculo do modelo relaciona titulares de nível 15. É pendência de conferência da hierarquia, não conclusão sobre ilegalidade do ato.
5. Três Subsecretarias têm contagem abaixo da condição numérica genérica do art. 17, I. A hipótese alternativa do inciso II não foi transformada em dado presumido. A Gestão Corporativa utiliza o parágrafo único, sem o falso mínimo genérico de três.
6. `Instruções!B14` afirma que a contagem mínima não está automatizada; `Reestruturação!AQ:AU` e `Simulações realizadas!R04` já a utilizam. Esta contradição foi registrada, não copiada para o comportamento do portal.
7. O caso T10 trata quantidade negativa como zero. O portal preserva a validação estrita: negativo é entrada inválida e mantém o resultado pendente, para não encobrir erro.
8. `Instruções!B8` diz não haver Anexo III para comparação, mas `B16` identifica esse anexo como teto. O módulo estrutural não substitui os referenciais separados II/III já adotados no motor.

## Contrato

`evaluateStructureRules(proposal, base)` retorna:

- `alerts`: alertas da proposta completa; cada item informa `severity`, `unitId`, `positionId` quando aplicável, `code`, `message`, `source`, `status` e `origin`.
- `baselineAlerts`: achados do quadro de origem, separados, sempre em revisão. Não são escondidos para satisfazer a expectativa T00 “nenhum alerta”.
- `coverage`: escopo, unidades com entradas pendentes, tipos sugeridos para conferência e limites da avaliação.

`status: verified` identifica fundamento normativo conferido, não homologação. `origin: baseline` conserva a diferença herdada como aviso em revisão, com `ruleStatus` do fundamento. `origin: new` identifica condição que não existia com os mesmos dados na base. Alertas antigos resolvidos deixam de aparecer em `alerts`, permanecendo identificáveis em `baselineAlerts`.

Campos considerados: `units[].removed`, `origin`, `unitType`, `parentUnitId`; `positions[].unitId`, `code`, `denomination`, `quantity`. Nenhum vínculo é resolvido pelo primeiro nome semelhante. A classificação explícita permite diferenciar tipos especiais sem inferi-los de simples texto. Quantidades permanecem strings e são comparadas com BigInt.

A decisão de bloquear Anexo/PDF fica com o chamador. Critério acordado: somente alerta atual `origin: new`, `severity: error`, `status: verified`; cálculo válido permanece visível. Avisos, pendências herdadas e interpretações em revisão não provocam bloqueio automático.

## Verificação

`node --test tests/structure-rules.test.mjs`: 15 testes aprovados, incluindo T09, R01, R03 e R04; limites 4/5 na Ouvidoria; níveis dos subordinados; exclusão de retiradas; identidades homônimas; quantidade grande; pendência diferente de zero; exceção de Gestão Corporativa; isolamento de órgãos; imutabilidade e separação dos achados da base.

A base inicial produz oito avisos herdados em revisão. Não há erro novo atribuído ao usuário. Isso não certifica regularidade, vigência, ocupação de cargos ou aprovação.
