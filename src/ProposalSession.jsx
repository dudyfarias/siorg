import { useEffect, useRef, useState } from 'react';
import { organizationAcronym } from './data/simulator-bases.mjs';
import { Modal } from './App.jsx';
import { createStructureProposal } from './structure-proposal.mjs';
import { encodeProposal, decodeProposal, saveProposal, loadProposal, removeSavedProposal } from './proposal-storage.mjs';

export function initialProposal(base) {
  try {
    const saved=loadProposal(window.localStorage,base);
    return {proposal:saved || createStructureProposal(base), restored:!!saved, problem:''};
  } catch {return {proposal:createStructureProposal(base),restored:false,problem:'Não foi possível abrir o rascunho salvo. Ele será preservado até você abrir uma cópia ou começar uma nova proposta.'};}
}

export function ProposalSession({ proposal, base, initial, hasChanges, onReplace }) {
  const [message,setMessage]=useState(initial.restored?'Rascunho retomado neste navegador.':initial.problem), [blocked,setBlocked]=useState(!!initial.problem), [pending,setPending]=useState(null), [error,setError]=useState('');
  const latest = useRef(proposal);
  const lastSaved = useRef(null);
  latest.current = proposal;

  useEffect(() => {
    if (!hasChanges) return;
    const guard = event => {
      if (latest.current === lastSaved.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [hasChanges]);
  useEffect(()=>{
    if(blocked)return;
    try {
      saveProposal(window.localStorage, proposal, base);
      lastSaved.current = proposal;
      setMessage('Proposta salva automaticamente neste navegador.');
    }
    catch{setMessage('O navegador não conseguiu salvar o rascunho. Baixe uma cópia da proposta para continuar depois.');}
  },[proposal,base,blocked]);
  function download(){
    try{
      const text=encodeProposal(proposal,base),url=URL.createObjectURL(new Blob([text],{type:'application/json'})),link=document.createElement('a');
      link.href=url;link.download=`${organizationAcronym(base)}-proposta.siorg.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setError('');
    }catch(reason){setError(reason.message);}
  }
  async function openFile(event){
    const input=event.currentTarget,file=input.files?.[0];if(!file)return;
    const snapshot=latest.current;
    try{
      if(file.size>4*1024*1024)throw new Error('Escolha uma cópia da proposta com até 4 MB.');
      const decoded=decodeProposal(await file.text(),base);
      if(latest.current!==snapshot)throw new Error('A proposta mudou durante a leitura. Escolha o arquivo novamente.');
      setPending({kind:'import',proposal:decoded,name:file.name});setError('');
    }catch(reason){setError(reason.message);}finally{input.value='';}
  }
  function replace(){
    if(pending.kind==='new'){
      try{removeSavedProposal(window.localStorage,base);}catch{}
      onReplace(createStructureProposal(base));
    }else onReplace(pending.proposal);
    setBlocked(false);setPending(null);setError('');
  }
  return <>
    <p className="sim-session-status" role="status">{message}</p>
    <details className="card sim-session-tools">
      <summary>Salvar uma cópia ou começar outra proposta</summary>
      <p>Para retomar a edição em outro computador, baixe a cópia da proposta em .json e use <strong>Abrir proposta salva</strong> no simulador.</p>
      <p>Para ler ou compartilhar a proposta em planilha, use <a href="#anexo-ii">Baixar proposta em Excel</a> no quadro da proposta.</p>
      <div className="sim-session-actions">
        <button className="button secondary" onClick={download}>Baixar cópia da proposta (.json)</button>
        <label className="button secondary sim-file-label">Abrir proposta salva<input type="file" accept=".json,application/json" aria-label="Abrir proposta salva" onChange={openFile} /></label>
        <button className="text-button" onClick={() => setPending({kind:'new'})}>Começar nova proposta</button>
      </div>
      {error && <p role="alert" className="field-error">{error}</p>}
    </details>
    {pending&&<Modal title={pending.kind==='new'?'Começar uma nova proposta?':'Abrir a proposta salva?'} onClose={()=>setPending(null)} actions={<><button className="button secondary" onClick={()=>setPending(null)}>Manter proposta atual</button><button className="button primary" onClick={replace}>{pending.kind==='new'?'Começar nova proposta':'Abrir esta proposta'}</button></>}><p>{pending.kind==='new'?'As alterações deste navegador serão substituídas pela base de referência.':'O arquivo selecionado substituirá a proposta aberta neste navegador.'} Baixe uma cópia antes se quiser guardar as alterações atuais.</p></Modal>}
  </>;
}
