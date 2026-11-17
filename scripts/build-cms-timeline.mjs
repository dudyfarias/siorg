import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const integration = join(root, 'integrations/cms-timeline');
const output = join(root, 'outputs/cms-novas-estruturas');
const staging = await mkdtemp(join(tmpdir(), 'siorg-cms-'));
const files = ['index.html', 'css/linha-do-tempo.css', 'js/linha-do-tempo.js'];
const fragment = `<link rel="stylesheet" href="css/linha-do-tempo.css">
<section class="siorg-timeline-widget" data-siorg-timeline aria-label="Linha do tempo das reestruturações">
  <h2>Linha do tempo das reestruturações</h2>
  <p>Se a linha do tempo não abrir, consulte a relação de documentos e organogramas nesta página.</p>
</section>
<script src="js/linha-do-tempo.js" defer></script>
`;

try {
  await mkdir(join(staging, 'css'));
  await writeFile(join(staging, 'index.html'), fragment);
  await copyFile(join(integration, 'widget.css'), join(staging, files[1]));
  await build({
    root, configFile: false, publicDir: false,
    build: {
      target: 'es2019', outDir: join(staging, 'js'), emptyOutDir: false,
      lib: { entry: join(integration, 'widget.mjs'), name: 'SiorgTimeline', formats: ['iife'], fileName: () => 'linha-do-tempo.js' },
    },
  });
  const zipName = 'linha-do-tempo-script-application.zip';
  execFileSync('zip', ['-q', '-X', zipName, ...files], { cwd: staging });
  await Promise.all(['css', 'js'].map(dir => mkdir(join(output, dir), { recursive: true })));
  await Promise.all([...files, zipName].map(file => copyFile(join(staging, file), join(output, file))));
  // This fixture is for local validation only; it is not part of the import ZIP.
  await writeFile(join(output, 'previa.html'), `<!doctype html>
<html lang="pt-BR">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Novas Estruturas — prévia do bloco CMS</title>
<style>
  body { max-width: 70rem; margin: 1.5rem auto; padding: 0 1rem; font: 1rem/1.55 system-ui,sans-serif; color: #333; }
  header { border-bottom: 1px solid #ddd; }
  .existing-content { margin-top: 1rem; padding-top: .75rem; border-top: 1px solid #ddd; }
</style>
<header><p>Prévia local da integração com o CMS</p><h1>Novas Estruturas</h1></header>
<main>
${fragment}
<section class="existing-content" aria-labelledby="existing-content">
  <h2 id="existing-content">Documentos e organogramas</h2>
  <p>Área reservada ao conteúdo já existente no CMS.</p>
  <a href="https://www.siorg.sp.gov.br/siorg/novas_estruturas">Consultar a página oficial</a>
</section>
</main>
</html>
`);
  console.log('Pacote do CMS: ' + join(output, zipName));
} finally {
  await rm(staging, { recursive: true, force: true });
}
