import test from 'node:test';
import assert from 'node:assert/strict';

class FakeRoot extends EventTarget {
  nodes=new Map();
  getElementById(id){return this.nodes.get(id)||null;}
}
const portalWindow=new EventTarget();
portalWindow.location={hash:'#portal-existing',pathname:'/portal-path'};
const storage=new Map();
portalWindow.localStorage={getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
portalWindow.method=function(){return this===portalWindow;};
const portalDocument=new EventTarget();
portalDocument.getElementById=()=>{throw new Error('Portal IDs must not be queried');};
portalDocument.createElement=function(tag){assert.equal(this,portalDocument);return {tag};};
globalThis.window=portalWindow;
globalThis.document=portalDocument;
const {cmsWindow,cmsDocument,initializeEnvironment}=await import('./cms-environment.mjs');
const shadow=new FakeRoot();
let focus=0,scroll=0,hashEvents=0,modelDownloads=0;
const target={hasAttribute:()=>false,setAttribute(){},focus(){focus++;},scrollIntoView(){scroll++;}};
shadow.nodes.set('resultados',target);
const mount={};
initializeEnvironment(shadow,mount,()=>modelDownloads++);

test('queries, active element and download body are scoped to component',()=>{
  assert.equal(cmsDocument.getElementById('resultados'),target);
  assert.equal(cmsDocument.getElementById('portal-existing'),null);
  shadow.activeElement=target;
  assert.equal(cmsDocument.activeElement,target);
  assert.equal(cmsDocument.body,mount);
  assert.deepEqual(cmsDocument.createElement('a'),{tag:'a'});
});

test('hash and guide events do not change the portal location',()=>{
  cmsWindow.addEventListener('hashchange',()=>hashEvents++);
  cmsWindow.location.hash='#resultados';
  assert.equal(cmsWindow.location.hash,'#resultados');
  assert.equal(portalWindow.location.hash,'#portal-existing');
  assert.equal(portalWindow.location.pathname,'/portal-path');
  assert.equal(hashEvents,1);
  assert.equal(focus,1);
  assert.equal(scroll,1);
  assert.throws(()=>{cmsWindow.location.pathname='/other';});
});

test('native methods retain their receiver and document listeners stay scoped',()=>{
  assert.equal(cmsWindow.method(),true);
  let keys=0;
  const handler=()=>keys++;
  cmsDocument.addEventListener('keydown',handler);
  portalDocument.dispatchEvent(new Event('keydown'));
  assert.equal(keys,0);
  shadow.dispatchEvent(new Event('keydown'));
  assert.equal(keys,1);
  cmsDocument.removeEventListener('keydown',handler);
});

test('component storage does not overwrite unrelated portal keys',()=>{
  storage.set('draft','portal-value');
  cmsWindow.localStorage.setItem('draft','component-value');
  assert.equal(storage.get('draft'),'portal-value');
  assert.equal(storage.get('siorg-cms:draft'),'component-value');
  cmsWindow.localStorage.removeItem('draft');
  assert.equal(storage.get('draft'),'portal-value');
});

test('Excel model action remains internal and prevents portal hash navigation',()=>{
  const event=new Event('click',{cancelable:true});
  event.composedPath=()=>[{tagName:'A',getAttribute:()=> '#modelo-excel-sggd'}];
  shadow.dispatchEvent(event);
  assert.equal(event.defaultPrevented,true);
  assert.equal(modelDownloads,1);
  assert.equal(portalWindow.location.hash,'#portal-existing');
});
