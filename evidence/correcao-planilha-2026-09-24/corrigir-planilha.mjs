import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const dir = path.dirname(new URL(import.meta.url).pathname);
const source = '/Users/eduardofariascappia/Downloads/SGGD_SIMULADOR_.xlsx';
const outputDir = path.resolve(dir, '../../outputs/01a08b9a-sggd-planilha-corrigida');
const mode = process.argv[2] || 'inspect';
const sourceHash = crypto.createHash('sha256').update(await fs.readFile(source)).digest('hex');
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const sheet = workbook.worksheets.getItem('SGGD');
if(mode==='help'){
 console.log(workbook.help('range.dataValidation',{include:'index,examples,notes',maxChars:3500}).ndjson);
 process.exit(0);
}
const render = async (name, range) => {
  const image = await workbook.render({ sheetName:'SGGD', range, scale:1, format:'png' });
  await fs.writeFile(path.join(dir,name),new Uint8Array(await image.arrayBuffer()));
};
if (mode === 'inspect') {
  console.log((await workbook.inspect({kind:'table',range:'SGGD!A4:M7',include:'values,formulas',tableMaxRows:4,tableMaxCols:13,maxChars:5000})).ndjson);
  console.log(JSON.stringify({detail:sheet.getRange('A12:M18').values,formulas:sheet.getRange('G13:M14').formulas}));
  await render('antes-resumo.png','A1:J10');
  await render('antes-detalhe.png','A12:M18');
  await fs.writeFile(path.join(dir,'source-hash.json'),JSON.stringify({source,sha256:sourceHash},null,2));
  process.exit(0);
}
if (mode !== 'edit') throw new Error(`Unknown mode ${mode}`);
const mapping = JSON.parse(await fs.readFile(path.join(dir,'mapeamento-anexo-ii-por-codigo.json'),'utf8'));
if (sourceHash !== mapping.workbook.sha256) throw new Error('The source changed after the independent audit.');
// Imported shared-formula child caches did not update on input changes.
// Materialize the exact original formulas, without changing their logic or formatting.
const originalFormulas=JSON.parse(await fs.readFile(path.join(dir,'original-formulas.json'),'utf8')).formulas;
for(const [address,formula] of Object.entries(originalFormulas)) sheet.getRange(address).formulas=[[formula]];
const originalProposal = sheet.getRange('F13:F57').values.map(row=>row[0]);
const changes=[];
for (const row of mapping.mapping.filter(row=>!row.requiresNewRow)) {
  if(sheet.getRange(row.originalCodeCell).values[0][0]!==row.code) throw new Error(`Code mismatch: ${row.code}`);
  if(row.allocatedQuantityChange) {
    sheet.getRange(row.originalAllocatedCell).values=[[row.correctAllocatedQuantityAnnexII]];
    changes.push({cell:row.originalAllocatedCell,from:row.originalAllocatedQuantity,to:row.correctAllocatedQuantityAnnexII,code:row.code});
  }
}
// Use the empty row immediately after the detail; retain every existing row address.
if(sheet.getRange('A58:M58').values[0].some(v=>v!=null&&v!=='')) throw new Error('Row 58 is not empty.');
sheet.getRange('A58:M58').copyFrom(sheet.getRange('A57:M57'),'all');
sheet.getRange('A58:B58').values=[['FCESP','FCESP 2.14']];
sheet.getRange('C58').formulas=[['=C40']];
sheet.getRange('D58:F58').values=[[3.3,1,0]];
// Imported style inheritance is not copied by copyFrom; match the adjacent detail row explicitly.
sheet.getRange('A58:M58').format={font:{name:'Calibri',size:12,color:'#000000',bold:false},fill:'#FFFFFF',horizontalAlignment:'center',wrapText:true,numberFormat:'General',borders:{preset:'all',style:'thin',color:'#000000'}};
sheet.getRange('F58').format.fill='#FFFF00';
sheet.getRange('F58').format.font.bold=true;
sheet.getRange('A58:M58').format.rowHeight=14.45;
sheet.getRange('G58:M58').formulas=[[
  '=IF(F58=E58,"Mantém",IF(F58=0,"Exclui",IF(F58<E58,"Reduz em "&(E58-F58),"Aumenta em "&(F58-E58))))',
  '=MAX(E58-F58,0)','=MAX(F58-E58,0)','=IF(OR(D58="",E58=""),"",D58*E58)',
  '=D58*F58','=F58-E58','=K58-J58'
]];
sheet.getRange('J13:J58').formulas=Array.from({length:46},(_,i)=>[`=IF(OR(D${i+13}="",E${i+13}=""),"",D${i+13}*E${i+13})`]);
for(const [r,group] of [[5,'CCESP'],[6,'FCESP']]){
  sheet.getRange(`C${r}`).formulas=[[`=SUMIF($A$13:$A$58,"${group}",$E$13:$E$58)`]];
  sheet.getRange(`D${r}`).formulas=[[`=SUMIF($A$13:$A$58,"${group}",$F$13:$F$58)`]];
  sheet.getRange(`G${r}`).formulas=[[`=ROUND(SUMPRODUCT(($A$13:$A$58="${group}")*$D$13:$D$58*$E$13:$E$58),2)`]];
  sheet.getRange(`H${r}`).formulas=[[`=ROUND(SUMIF($A$13:$A$58,"${group}",$K$13:$K$58),2)`]];
}
// The existing distribution check reads the proposal, including the new code.
sheet.getRange('P6:P51').formulas=Array.from({length:46},(_,i)=>[`=SUMIF($B$13:$B$58,O${i+6},$F$13:$F$58)`]);
// Extend the proposal input control to its new final row, supplying its missing numeric type.
sheet.getRange('F13:F57').dataValidation=null;
sheet.getRange('F13:F58').dataValidation={allowBlank:false,rule:{type:'whole',operator:'greaterThanOrEqual',formula1:0},errorAlert:{style:'stop',title:'Quantidade inválida',message:'Informe um número inteiro igual ou maior que zero.'}};
sheet.getRange('S51').conditionalFormats.addCustom('S51="Alocado corretamente"',{fill:'#D9EAD3'});
sheet.getRange('S51').conditionalFormats.addCustom('S51<>"Alocado corretamente"',{fill:'#F4CCCC'});
sheet.getRange('E12').values=[['Quantidade alocada']];
sheet.getRange('J12').values=[['Cotas alocadas']];
sheet.getRange('A9').values=[['Alocação: Anexo II. Proposta recebida preservada. Limites: Anexo III. Base e regras em validação técnica.']];
workbook.notes.add({id:'SGGD:E13',target:{cell:{sheetName:'SGGD',sheetId:sheet.sheetId,address:'E13'}},authorId:'',createdAt:'',body:{plainText:'Quantidades alocadas E13:E58: Decreto 70.755/2026, Anexo II. Limites B5:B6/F5:F6: Anexo III. Conferência em 24/09/2026. https://www.doe.sp.gov.br/executivo/decretos/decreto-n-70755-de-14-de-julho-de-2026-202607141182021982002'}});
workbook.notes.add({id:'SGGD:F58',target:{cell:{sheetName:'SGGD',sheetId:sheet.sheetId,address:'F58'}},authorId:'',createdAt:'',body:{plainText:'FCESP 2.14: 1 função alocada no Anexo II. Quantidade proposta iniciada em zero porque o código não estava na proposta recebida. Os demais quantitativos propostos foram preservados. Subsídio vinculado ao mesmo nível 14 da planilha (C40).'}});

// Actual input changes test the dependency chain; restore them before final export.
const checks=[];
const number=(address)=>sheet.getRange(address).values[0][0];
const expect=(address,expected)=>{
  const actual=number(address);
  if(typeof expected==='number' ? typeof actual!=='number'||Math.abs(actual-expected)>1e-8 : actual!==expected) throw new Error(`${address}: expected ${expected}, got ${actual}`);
  return {cell:address,actual,expected};
};
workbook.recalculate();
checks.push({scenario:'corrected baseline and preserved proposal',cells:[
  expect('C5',299),expect('C6',201),expect('C7',500),expect('G5',1069.5),expect('G6',348.75),expect('G7',1418.25),
  expect('D5',298),expect('D6',201),expect('D7',499),expect('H5',1066),expect('H6',349.35),expect('H7',1415.35),
  expect('E5',-1),expect('I5',-3.5),expect('E6',0),expect('I6',0.6),expect('J7','Enquadrada nos limites'),
  expect('J58',3.3),expect('K58',0),expect('M58',-3.3)
]});
const cases=[
  {cell:'F17',value:22,name:'CCESP 1.15 increases',expected:{J17:126,K17:132,M17:6,D5:299,H5:1072,I5:2.5,J5:'Fora dos limites',J7:'Fora dos limites'}},
  {cell:'F57',value:5,name:'last original FCESP row included',expected:{D6:202,H6:349.95,J57:2.4,K57:3,M57:0.6,J6:'Fora dos limites'}},
  {cell:'F58',value:1,name:'added FCESP 2.14 included',expected:{D6:202,H6:352.65,J58:3.3,K58:3.3,M58:0,J6:'Fora dos limites',P51:1,R51:0,S51:'Alocado corretamente'}},
  {cell:'F57',value:0,name:'explicit zero proposal',expected:{D6:197,H6:346.95,J57:2.4,K57:0,M57:-2.4}}
];
for(const test of cases){
 const previous=number(test.cell);
 sheet.getRange(test.cell).values=[[test.value]];
 workbook.recalculate();
 checks.push({scenario:test.name,cells:Object.entries(test.expected).map(([cell,value])=>expect(cell,value))});
 sheet.getRange(test.cell).values=[[previous]];
}
if(JSON.stringify(sheet.getRange('F13:F57').values.map(row=>row[0]))!==JSON.stringify(originalProposal)) throw new Error('Proposal preservation failed.');
workbook.recalculate();
checks.push({scenario:'restored final state',cells:[expect('D7',499),expect('H7',1415.35),expect('C7',500),expect('G7',1418.25),expect('J7','Enquadrada nos limites')]});
const errors=await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'final formula error scan',maxChars:4000});
console.log(errors.ndjson);
console.log((await workbook.inspect({kind:'table',range:'SGGD!A4:J7',include:'values,formulas',tableMaxRows:4,tableMaxCols:10,maxChars:4500})).ndjson);
await render('depois-resumo.png','A1:J10');
await render('depois-detalhe.png','D23:M28');
await render('depois-final-detalhe.png','A54:M59');
await fs.mkdir(outputDir,{recursive:true});
const outputPath=path.join(outputDir,'SGGD_SIMULADOR_CORRIGIDO.xlsx');
const output=await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
// The exporter omits calcPr. Preserve the source engine id and request recalculation
// on open using a narrowly scoped package-metadata repair; all authored cells remain unchanged.
execFileSync('/Users/eduardofariascappia/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',['-c',
`from zipfile import ZipFile
import sys, os, re
p=sys.argv[1]
with ZipFile(p) as z:
    items=[(i,z.read(i.filename)) for i in z.infolist()]
text=dict((i.filename,b) for i,b in items)['xl/workbook.xml'].decode('utf-8')
assert '<x:calcPr' not in text and '</x:workbook>' in text
text=text.replace('</x:workbook>','<x:calcPr calcId="191028" fullCalcOnLoad="1"/></x:workbook>')
sheetxml=dict((i.filename,b) for i,b in items)['xl/worksheets/sheet1.xml'].decode('utf-8')
# Extend the original conditional rules to retain their exact native differential styles.
assert sheetxml.count('sqref="S6:S50"')==1
sheetxml=sheetxml.replace('sqref="S6:S50"','sqref="S6:S51"')
sheetxml,count=re.subn(r'<x:conditionalFormatting[^>]*sqref="S51:S51"[^>]*>.*?</x:conditionalFormatting>','',sheetxml,flags=re.S)
assert count==1
tmp=p+'.tmp'
with ZipFile(tmp,'w') as z:
    for i,b in items:
        data=text.encode('utf-8') if i.filename=='xl/workbook.xml' else sheetxml.encode('utf-8') if i.filename=='xl/worksheets/sheet1.xml' else b
        z.writestr(i,data)
os.replace(tmp,p)
`,outputPath]);
const reopened=await SpreadsheetFile.importXlsx(await FileBlob.load(outputPath));
const reopenedSheet=reopened.worksheets.getItem('SGGD');
const reopenValue=cell=>reopenedSheet.getRange(cell).values[0][0];
const savedHeaderPreview=await reopened.render({sheetName:'SGGD',range:'A12:M18',scale:1,format:'png'});
await fs.writeFile(path.join(dir,'depois-cabecalho-detalhe.png'),new Uint8Array(await savedHeaderPreview.arrayBuffer()));
if(reopenValue('C7')!==500||Math.abs(reopenValue('G7')-1418.25)>1e-8) throw new Error('Saved base did not roundtrip.');
reopenedSheet.getRange('F57').values=[[5]];
reopened.recalculate();
if(reopenValue('D6')!==202||Math.abs(reopenValue('H6')-349.95)>1e-8||Math.abs(reopenValue('J57')-2.4)>1e-8) throw new Error('Saved formulas did not recalculate correctly.');
checks.push({scenario:'saved workbook reimported; FCESP 2.01 proposal changed 4 to 5',cells:[{cell:'D6',actual:reopenValue('D6'),expected:202},{cell:'H6',actual:reopenValue('H6'),expected:349.95},{cell:'J57',actual:reopenValue('J57'),expected:2.4}],disposableInMemoryOnly:true});
const finalSourceHash=crypto.createHash('sha256').update(await fs.readFile(source)).digest('hex');
if(finalSourceHash!==sourceHash) throw new Error('Original workbook hash changed.');
await fs.writeFile(path.join(dir,'artifact-verification.json'),JSON.stringify({source,sourceHash,originalUnchanged:true,outputPath,changes,checks,formulaErrorScan:errors.ndjson},null,2));
console.log(JSON.stringify({outputPath,scenariosPassed:checks.length,originalUnchanged:true}));
