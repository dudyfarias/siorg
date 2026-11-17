# Correção da planilha SGGD — 24/09/2026

Arquivo entregue: `outputs/01a08b9a-sggd-planilha-corrigida/SGGD_SIMULADOR_CORRIGIDO.xlsx`.
SHA256 final: `3a39402fc1f64094141b4f54f5940735bc06f6f915af1140e3291c27e0d70499`.

O original `SGGD_SIMULADOR_.xlsx` foi preservado, SHA256 `dd81060074013b1a2ff44b598d3dd0d92f3dac126ca51723b87334f1c4f74bad`.

## Alterações autorizadas e dependências

- Dez quantidades em E corrigidas por código completo conforme Anexo II, com rastreio em `mapeamento-anexo-ii-por-codigo.json`.
- FCESP 2.14 incluído na linha58 anteriormente vazia, com coeficiente3,30 e alocado1. A proposta recebida F13:F57 foi preservada; F58 inicia em0. Subsídio C58 vinculado ao mesmo nível14 existente em C40, sem revisão dos demais valores monetários.
- C5:D6/G5:H6 abrangem até58. H soma a coluna K, correspondente à proposta; G corresponde à alocação. Totais de cotas arredondados a centésimos.
- J13:J58 calcula D×E. K e M continuam representando cotas propostas e sua variação frente à alocação.
- P6:P51 inclui o novo código até58. Q e os blocos de distribuição mantêm os dados recebidos.
- Rótulos E12/J12 ajustados para alocação; A9 esclarece as fontes e a proposta preservada. Notas nas entradas identificam fonte e tratamento do código adicionado.
- Validação da proposta estendida paraF13:F58, com tipo inteiro não negativo e alerta. Formatação condicional existente ampliada aS51. Layout e a única abaSGGD preservados.

## Verificações

Alocado: CCESP299/1.069,50; FCESP201/348,75; total500/1.418,25. Proposta recebida: CCESP298/1.066,00; FCESP201/349,35; total499/1.415,35. Variação agregada−1/−2,90 não representa compensação entre espécies.

Sete verificações do motor Artifact Tool passaram, incluindo cabeçalho, incrementoCCESP1.15, última linha originalFCESP2.01, novoFCESP2.14, zero explícito, restauração da proposta e reimportação do arquivo salvo com novo teste de alteração. Nenhum erro de fórmula na varredura. O arquivo reaberto por biblioteca independente confirmou caches, mapeamento, fórmulas, mesclas e dependências. Não houve execução em Microsoft Excel nativo.

Prévia original e corrigida renderizadas: resumo, cabeçalho/detalhe, linhas alteradas e linha acrescentada. Textos/números legíveis, amarelo de entrada e padrão de bordas preservados. Capturas de suporte não integram a entrega.

O motor de importação conservava caches de filhos de fórmulas compartilhadas ao editar entradas. Para testar de fato, foram materializadas as fórmulas originais equivalentes antes da edição; nenhuma lógica externa ao escopo foi substituída. Após exportar, reparos pontuais no pacote preservaram a configuração de recálculo ao abrir e estenderam a regra condicional original, mantendo seus estilos nativos. Esse tratamento não altera os valores da proposta.

A revisão é dos três problemas solicitados e das dependências afetadas. A distribuição incompleta, a modelagem de campos ausentes e as regras condicionais antigas fora do escopo não foram reformuladas. Base e regras continuam em validação técnica conforme orientação do usuário.
