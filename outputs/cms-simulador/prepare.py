from pathlib import Path
import hashlib, json, re, shutil, base64

source=Path('/Users/eduardofariascappia/Documents/ChatGPT/SIORG-Calculadora-MVP')
out=Path(__file__).parent
work=out/'work'
work.mkdir(exist_ok=True)
allowed=[p for folder in ['src','public'] for p in (source/folder).rglob('*') if p.is_file()]
allowed += [source/p for p in ['index.html','package.json','package-lock.json','vite.config.mjs','vercel.json','.npmrc']]
manifest={str(p.relative_to(source)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(allowed)}
(out/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
shutil.copytree(source/'src',work/'src',dirs_exist_ok=True)
shutil.copytree(source/'public',work/'public',dirs_exist_ok=True)
for name in ['package.json','package-lock.json']:
    shutil.copy2(source/name,work/name)
modules=work/'node_modules'
if not modules.exists(): modules.symlink_to(source/'node_modules',target_is_directory=True)

for p in (work/'src').glob('*'):
    if p.suffix not in ['.jsx','.mjs']: continue
    text=p.read_text()
    text=re.sub(r"^import ['\"][^'\"]+\.css['\"];?\s*$",'',text,flags=re.M)
    if p.suffix == '.jsx' and p.name not in ['main.jsx','SiorgShell.jsx'] and re.search(r'\b(?:document|window)\.',text):
        text="import { cmsDocument as document, cmsWindow as window } from './cms-environment.mjs';\n"+text
    text=text.replace('href="/modelos/SGGD-modelo-v3.xlsx"','href="#modelo-excel-sggd"')
    p.write_text(text)
(work/'src/SiorgShell.jsx').write_text('export function SiorgShell({children}) { return children; }\nexport default SiorgShell;\n')
style_names=['styles.css','search-picker.css','structure-tools.css','proposal-outputs.css','simulator.css']
css='\n'.join((work/'src'/p).read_text() for p in style_names)
css=re.sub(r'@font-face\{[^}]+\}','',css)
css=css.replace('Rawline','SIORG_CMS_Rawline').replace('Font Awesome 6 Free','SIORG_CMS_Icons')
css=css.replace(':root','.siorg-cms-document')
css=re.sub(r'(?<![\w-])body(?=\s*\{)', '.siorg-cms-document', css)
css+='''
:host { display: block; width: 100%; isolation: isolate; color: #333; }
.siorg-cms-document { background: #fff; color: #333; font-family: SIORG_CMS_Rawline, Arial, sans-serif; font-size: 16px; line-height: 1.5; text-align: left; text-transform: none; letter-spacing: normal; }
.siorg-cms-document .calculator-page { width: 100%; max-width: none; padding: 24px 0; }
.siorg-cms-document .live-balance { top: var(--siorg-cms-sticky-top, 8px); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; } }
'''
fonts=[]
for name,weight,family,mime in [('rawline-400.woff','400','SIORG_CMS_Rawline','font/woff'),('rawline-600.woff','600','SIORG_CMS_Rawline','font/woff'),('rawline-700.woff','700','SIORG_CMS_Rawline','font/woff'),('fa-solid-900.woff2','900','SIORG_CMS_Icons','font/woff2')]:
    fonts.append({'family':family,'weight':weight,'url':'data:'+mime+';base64,'+base64.b64encode((work/'public/assets'/name).read_bytes()).decode()})
model=base64.b64encode((work/'public/modelos/SGGD-modelo-v3.xlsx').read_bytes()).decode()
(work/'src/cms-assets.mjs').write_text('export const css='+json.dumps(css,ensure_ascii=False)+';\nexport const fonts='+json.dumps(fonts)+';\nexport const excelModel='+json.dumps(model)+';\n')
(out/'source-count.json').write_text(json.dumps({'files':len(manifest),'sourceBytes':sum(p.stat().st_size for p in allowed),'note':'Only published src/public and build configuration copied. No private sources, credentials, evidence or workbooks other than published Excel.'},indent=2)+'\n')
print(json.dumps({'work':str(work),'sourceFiles':len(manifest),'cssBytes':len(css.encode()),'embeddedFonts':len(fonts),'originalExcelBytes':len(base64.b64decode(model))}))
