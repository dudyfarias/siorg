import { build } from './work/node_modules/vite/dist/node/index.js';
import react from './work/node_modules/@vitejs/plugin-react/dist/index.js';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const out=dirname(fileURLToPath(import.meta.url));
const work=resolve(out,'work');
for (const file of ['cms-entry.jsx','cms-environment.mjs']) await copyFile(resolve(out,file),resolve(work,'src',file));
await build({
  configFile:false, root:work, publicDir:false, base:'./', plugins:[react()],
  define:{'process.env.NODE_ENV':'"production"'},
  build:{
    outDir:resolve(out,'package'), emptyOutDir:true, target:'es2020', sourcemap:false,
    rollupOptions:{
      input:resolve(work,'src/cms-entry.jsx'),
      output:{format:'iife',inlineDynamicImports:true,entryFileNames:'js/siorg-simulator.js'},
    },
  },
});
// esbuild may emit small class-field helpers outside Rollup's IIFE.
// The outer closure keeps those helpers private to this Script Application.
const bundlePath=resolve(out,'package/js/siorg-simulator.js');
await writeFile(bundlePath,`(function(){\n${await readFile(bundlePath,'utf8')}\n})();\n`);
await writeFile(resolve(out,'package/index.html'),`<section id="siorg-simulator-__SPNS__" aria-label="Simulador de Reestruturação e Calculadora de Cotas" data-siorg-cms-homolog="2026-11-17">
  <p>Carregando o simulador de reestruturação… Se esta mensagem permanecer, a equipe do CMS deve conferir a importação dos recursos.</p>
  <noscript>Ative o JavaScript para usar o simulador.</noscript>
</section>
<script src="js/siorg-simulator.js" defer></script>
`);
await mkdir(resolve(out,'preview'),{recursive:true});
await writeFile(resolve(out,'preview/index.html'),`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Homologação local do componente SIORG</title><style>body{margin:0;background:#f5f5f5;font:18px Georgia;color:navy}#portal-header{padding:24px;background:#fff;border-bottom:5px solid navy}#portal-sentinel{font:22px Georgia;color:purple;background:lavender;border:5px dashed purple;padding:12px}main#portal-content{max-width:1240px;margin:24px auto;padding:24px;background:white}h1{color:purple!important;font-size:40px!important}button,input{border:7px dashed purple!important;font-family:Georgia!important}.card{background:lavender!important}#portal-footer{padding:32px;background:#eee}</style></head><body><header id="portal-header">Cabeçalho do portal — ambiente de teste local</header><p id="portal-sentinel">Sentinela: estilos do portal devem permanecer isolados.</p><main id="portal-content"><section id="siorg-simulator-__SPNS__" aria-label="Simulador de Reestruturação e Calculadora de Cotas"><p>Carregando simulador…</p></section><script src="../package/js/siorg-simulator.js" defer></script></main><footer id="portal-footer">Rodapé do portal preservado</footer></body></html>`);
