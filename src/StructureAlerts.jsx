export function StructureAlerts({ outputs,proposal,unitId,onSelect }) {
  const newAlerts=outputs.rules.alerts.filter(alert=>alert.origin==='new');
  const current=newAlerts.filter(alert=>alert.unitId===unitId), others=newAlerts.filter(alert=>alert.unitId!==unitId);
  const inherited=outputs.rules.alerts.filter(alert=>alert.origin==='baseline');
  const unitName=id=>proposal.units.find(unit=>unit.id===id)?.name || 'Unidade';
  const render=alert=><li key={`${alert.unitId}:${alert.positionId || 'unit'}:${alert.code}`} className={`structure-alert ${alert.severity}`}><strong>{alert.severity==='error'?'Corrigir':'Atenção'} · {unitName(alert.unitId)}</strong><p>{alert.message}</p>{alert.source&&<a href={alert.source.url} target="_blank" rel="noreferrer">{alert.source.title} · {alert.source.provision}</a>}{alert.unitId!==unitId&&<button className="text-button" onClick={()=>onSelect(alert.unitId)}>Conferir unidade</button>}</li>;
  return <div className="structure-alerts" aria-label="Conferência da estrutura">
    {current.length>0&&<div role="status" aria-live="polite"><ul>{current.map(render)}</ul></div>}
    {others.length>0&&<details className="structure-alert-details"><summary>{others.length} alerta(s) em outras unidades</summary><ul>{others.map(render)}</ul></details>}
    {inherited.length>0&&<details className="structure-alert-details baseline-alerts"><summary>Apontamentos da base recebida ({inherited.length})</summary><p>Estes pontos já aparecem no quadro de referência e precisam de conferência da área técnica. Eles não bloqueiam a minuta como se fossem alterações suas.</p><ul>{inherited.map(render)}</ul></details>}
  </div>;
}
