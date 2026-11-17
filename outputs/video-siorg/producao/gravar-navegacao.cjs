const { chromium } = require('/Users/eduardofariascappia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { mkdir, writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const { setTimeout: sleep } = require('node:timers/promises');
const work = join(__dirname, process.env.SIORG_CAPTURE_DIR || 'navegacao-v2');
const origin = 'http://127.0.0.1:4190';
const targetStart = 11.82, targetEnd = 168.8, speed = Number(process.env.SIORG_CAPTURE_SPEED || 0.64);
const width = 1360, height = 700;

async function run() {
  await mkdir(work, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--disable-background-timer-throttling'] });
  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: { dir: join(work, 'bruto'), size: { width, height } },
    acceptDownloads: true,
  });
  await context.route('**/*', route => {
    const u = new URL(route.request().url());
    if (u.origin === origin || !['http:', 'https:'].includes(u.protocol)) return route.continue();
    return route.abort('blockedbyclient');
  });
  await context.addInitScript(() => {
    let pointer, mark;
    function createPointer() {
      if (pointer || !document.body) return;
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="44" viewBox="0 0 35 44"><path d="M4 2 L4 34 L12 27 L18 40 L24 37 L18 24 L29 23 Z" fill="#171b1d" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>';
      pointer = document.createElement('div');
      pointer.style.cssText = 'position:fixed;left:0;top:0;width:35px;height:44px;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 2px 2px #0006);display:none';
      pointer.style.backgroundImage = 'url(data:image/svg+xml,' + encodeURIComponent(svg) + ')';
      mark = document.createElement('div');
      mark.style.cssText = 'position:fixed;left:0;top:0;width:39px;height:39px;border-radius:50%;border:3px solid #ad2128;z-index:2147483646;pointer-events:none;opacity:0;outline:2px solid white';
      document.body.append(mark, pointer);
    }
    addEventListener('DOMContentLoaded', createPointer);
    addEventListener('pointermove', e => {
      createPointer();
      if (!pointer) return;
      pointer.style.display = '';
      pointer.style.transform = 'translate(' + (e.clientX - 4) + 'px,' + (e.clientY - 2) + 'px)';
    }, true);
    addEventListener('pointerdown', e => {
      createPointer();
      if (!mark) return;
      mark.style.transform = 'translate('+(e.clientX-19)+'px,'+(e.clientY-19)+'px)';
      for (const animation of mark.getAnimations()) animation.cancel();
      mark.animate([{opacity:1},{opacity:0}],{duration:420,easing:'ease-out'});
    }, true);
  });

  const created = performance.now();
  const page = await context.newPage();
  page.setDefaultTimeout(3600);
  page.on('pageerror', error => console.error('ERRO NA PÁGINA', error.message));
  const role = (type, name) => page.getByRole(type, { name, exact: typeof name === 'string' });
  const visible = locator => locator.waitFor({ state:'visible',timeout:3600 });

  async function look(locator, top=175) {
    await visible(locator);
    const rect = await locator.boundingBox();
    const dy = Math.round(rect.y - top);
    if (Math.abs(dy)>38) {
      const safeY=Math.round(Math.min(height-60, Math.max(134,rect.y)));
      await page.mouse.move(1240,safeY,{steps:8});
      await page.mouse.wheel(0,dy);
      await sleep(220);
    }
  }
  async function point(locator) {
    await locator.scrollIntoViewIfNeeded();
    const r = await locator.boundingBox();
    if (!r) throw new Error('Sem posição para '+locator);
    const x=Math.round(r.x + Math.min(r.width*0.42,105));
    const y=Math.round(r.y+r.height*0.53);
    await page.mouse.move(x,y,{steps:14});
  }
  async function tap(locator) {
    await point(locator);
    await page.mouse.down();
    await sleep(50);
    await page.mouse.up();
    await sleep(90);
  }
  async function type(locator,text,delay=55) {
    await tap(locator);
    await locator.fill('');
    await locator.pressSequentially(text,{delay});
  }
  async function top() {
    await page.mouse.move(1250,90,{steps:10});
    await page.mouse.wheel(0,-18000);
    await sleep(180);
  }
  async function tab(name) {
    await top();
    await tap(role('link',name));
  }
  async function download(button, file) {
    const pending=page.waitForEvent('download',{timeout:8500});
    await tap(button);
    const found = await pending;
    await found.saveAs(join(work,file));
  }
  const marks=[];
  await page.goto(origin+'/', {waitUntil:'domcontentloaded'});
  await visible(role('link','Iniciar simulação'));
  await page.evaluate(() => document.fonts.ready);
  const beginning = performance.now();
  const sourceFrom = Math.max(0, (beginning-created)/1000-0.11);
  const clock = () => targetStart + (performance.now()-beginning)/1000/speed;
  async function at(target,label,fn) {
    const due=beginning+(target-targetStart)*speed*1000;
    await sleep(Math.max(0,due-performance.now()));
    const start=clock();
    await fn();
    const end=clock();
    marks.push({label,target,start,end});
    console.log(label, start.toFixed(2), '→', end.toFixed(2));
  }

  const qty = role('textbox','Quantidade proposta de Assessor Especial III, CCESP 2.15, linha 13');
  const balance = role('link','Ver cálculo');
  const changes = role('link','Ver alterações');
  const units = role('combobox','Unidade');
  const annex = /^Anexo II Confira/;
  let err;
  try {
    await at(12.60,'Abre Novas Estruturas',async()=>{
      await tap(role('link','Novas Estruturas'));
      await visible(role('heading',/^novas estruturas$/i));
    });
    const picker=role('combobox','Órgão ou entidade');
    await at(17.22,'Pesquisa SGGD',async()=>{ await type(picker,'SGGD',125); });
    await at(21.50,'Escolhe a Secretaria',async()=>{ await tap(role('option',/Secretaria de Gestão e Governo Digital SGGD/)); });
    await at(24.25,'Altera a ordem dos atos',async()=>{
      const order=role('combobox','Ordenar por');
      await tap(order);
      await order.selectOption({label:'Mais recentes primeiro'});
      await order.press('Escape');
    });
    const decree=role('article','Decreto nº 70.755/2026');
    await at(29.40,'Mostra decreto e fontes',async()=>{
      await look(role('heading','Decreto nº 70.755/2026'),175);
      await point(decree.getByRole('link',{name:/^Diário Oficial/}).first());
    });
    await at(35.10,'Expande atos relacionados',async()=>{ await tap(decree.locator('summary')); });
    await at(39.20,'Mostra a resolução vinculada',async()=>{
      const resolution=role('heading','Resolução SGGD nº 33/2026');
      await look(resolution,245);
      await point(decree.getByRole('link',{name:/^Diário Oficial/}).nth(1));
    });
    await at(44.80,'Abre o Simulador em Produtos',async()=>{
      await top();
      await tap(role('button','Produtos'));
      await tap(role('link','Simulador de Reestruturação'));
      await visible(role('link','Iniciar simulação'));
    });
    await at(48.40,'Clica em Iniciar simulação',async()=>{ await tap(role('link','Iniciar simulação')); });
    await at(55.60,'Confere a escolha do órgão',async()=>{
      await type(role('combobox','Órgão'),'SGGD',40);
      await tap(role('option',/Gestão e Governo Digital SGGD/i));
    });
    await at(58.75,'Escolhe Secretaria Executiva',async()=>{
      await type(units,'secretaria executiva',26);
      await tap(role('option',/^SECRETARIA EXECUTIVA/i));
    });
    await at(63.20,'Mostra o caminho da unidade',async()=>{
      await point(role('list','Caminho da unidade'));
    });
    await at(68.25,'Localiza a linha de Assessor Especial III',async()=>{
      await look(qty,427); await point(qty);
    });
    await at(73.05,'Digita 1 no lugar de 2',async()=>{
      await tap(qty); await qty.press('ControlOrMeta+a'); await qty.press('1'); await qty.press('Tab');
      const value=await qty.inputValue();
      if (value!=='1') throw new Error('A quantidade precisa ficar em 1, obtido '+value);
    });
    await at(80.30,'Clica Ver cálculo',async()=>{
      await tap(balance); await page.getByTestId('proposal-CCESP-quantity').waitFor({state:'visible'});
    });
    await at(88.05,'Mostra saldo de 2,50 cotas',async()=>{
      const sal=page.getByTestId('sim-balance-CCESP-quotas');
      await look(sal,405);
      const value=await sal.innerText();
      if (!value.includes('2,50')) throw new Error('Saldo inesperado '+value);
      await point(sal);
    });
    await at(95.45,'Abre Ver alterações',async()=>{
      await tap(changes);
      await tap(page.locator('#resumo-alteracoes summary').filter({hasText:'SECRETARIA EXECUTIVA'}));
    });
    await at(102.00,'Mostra a comparação e o botão de edição',async()=>{
      const detail=role('button',/^Editar SECRETARIA EXECUTIVA/);
      await look(detail,478);
      await point(detail);
    });
    await at(107.22,'Abre o Anexo II',async()=>{ await tab(annex); });
    await at(108.95,'Baixa PDF da simulação',async()=>{ await download(role('button','Baixar Anexo II em PDF'),'Anexo-II-SGGD.pdf'); });
    await at(111.90,'Baixa Excel da simulação',async()=>{ await download(role('button','Baixar proposta em Excel'),'Proposta-SGGD.xlsx'); });
    await at(115.15,'Abre cópia do rascunho',async()=>{
      await top(); await tap(page.getByText('Salvar uma cópia ou começar outra proposta',{exact:true}));
      await look(role('button','Baixar cópia da proposta (.json)'),460);
    });
    await at(117.60,'Baixa a cópia que pode ser reaberta',async()=>{
      await download(role('button','Baixar cópia da proposta (.json)'),'Proposta-SGGD.json');
    });
    await at(121.00,'Abre orientações no início',async()=>{
      await top(); await tap(page.getByText('Salvar uma cópia ou começar outra proposta',{exact:true}));
      await tap(page.getByText('Como preencher a proposta e calcular as cotas',{exact:true}));
    });
    await at(129.20,'Mostra legenda do saldo',async()=>{
      await look(page.getByText('Negativo',{exact:true}),353);
    });
    await at(135.72,'Abre a consulta consolidada e filtra o cargo',async()=>{
      await tap(page.getByText('Consultar cargos e funções do órgão',{exact:true}));
      const byCode=role('searchbox','Código ou nome do cargo');
      await look(byCode,235);
      await type(byCode,'CCESP 2.15',37);
      await type(role('searchbox','Nome da unidade'),'secretaria executiva',18);
    });
    await at(140.70,'Retorna à unidade encontrada',async()=>{
      await tap(role('button',/^Abrir unidade SECRETARIA EXECUTIVA/).first());
    });
    await at(142.30,'Pesquisa no resumo de alterações',async()=>{
      await tap(changes);
      const summarySearch=role('searchbox','Buscar cargo, função ou código nas alterações');
      await look(summarySearch,292);
      await type(summarySearch,'CCESP2.15',28);
    });
    await at(146.35,'Abre transferência e pesquisa destino',async()=>{
      await tab(/^Estrutura Escolha/);
      await type(units,'coordenadoria de administracao',9);
      await tap(role('option',/^Coordenadoria de Administração ESCOLA DE GOVERNO/));
      const unit=role('region','Coordenadoria de Administração');
      const transfer=role('button','Transferir unidade');
      if (!await transfer.isVisible()) await tap(unit.getByText('Ações de unidades',{exact:true}));
      await tap(transfer);
      await type(role('combobox','Nova unidade superior'),'gestao corporativa',15);
      await tap(role('option',/^SUBSECRETARIA DE GESTÃO CORPORATIVA/));
    });
    await at(151.88,'Aplica e mostra confirmação da transferência',async()=>{
      await tap(role('button','Aplicar transferência'));
      const status=page.getByText('Vínculo atualizado. As quantidades e cotas foram mantidas.',{exact:true});
      await look(status,388);
    });
    await at(155.15,'Mostra vínculo de origem e destino no resumo',async()=>{
      await tap(changes);
      const clear=role('button','Limpar busca');
      if (await clear.isVisible()) await tap(clear);
      const moved=page.locator('#resumo-alteracoes summary').filter({hasText:'Coordenadoria de Administração'});
      await tap(moved);
      const to=role('button',/^Editar Coordenadoria de Administração/);
      await look(to,505);
      const parents=await page.locator('#resumo-alteracoes .output-unit[open]').filter({hasText:'Transferência de unidade'}).innerText();
      if (!parents.includes('ESCOLA DE GOVERNO') || !parents.includes('SUBSECRETARIA DE GESTÃO CORPORATIVA')) throw new Error('Transferência não apareceu em De/Para');
    });
    await at(162.60,'Abre o quadro completo da proposta',async()=>{
      await tab(annex);
      await tap(page.getByText('Conferir o quadro completo',{exact:true}));
      const changedParent=page.locator('#anexo-ii').getByText('Vinculada a: SUBSECRETARIA DE GESTÃO CORPORATIVA',{exact:true}).first();
      await changedParent.scrollIntoViewIfNeeded();
      await look(changedParent,418);
      await point(changedParent);
    });
    await sleep(Math.max(0,beginning +(targetEnd-targetStart)*speed*1000 - performance.now())+900);
  } catch(e) {
    err=e;
    console.error('Falhou aos',clock().toFixed(3),e);
    await page.screenshot({path:join(work,'checagem-erro.jpg'),type:'jpeg'}).catch(()=>{});
  } finally {
    await context.close();
    await page.video().saveAs(join(work,'take.webm'));
    await browser.close();
    await writeFile(join(work,'take.json'),JSON.stringify({ sourceFrom, speed, targetStart, targetEnd, marks, passed: !err },null,2)+'\n');
  }
  if (err) throw err;
}
run().catch(e=>{console.error(e);process.exitCode=1;});
