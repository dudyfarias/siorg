from pathlib import Path
import hashlib,json,zipfile
out=Path(__file__).parent
files=[out/'package/index.html',out/'package/js/siorg-simulator.js']
dest=out/'siorg-simulador-script-application-homologacao.zip'
with zipfile.ZipFile(dest,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:
        name=str(p.relative_to(out/'package'))
        assert name.isascii() and not name.startswith('/') and '..' not in Path(name).parts
        z.write(p,name)
with zipfile.ZipFile(dest) as z:
    assert z.testzip() is None
    assert z.namelist()==['index.html','js/siorg-simulator.js']
    for p in files: assert z.read(str(p.relative_to(out/'package')))==p.read_bytes()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
report={'zip':str(dest),'zipBytes':dest.stat().st_size,'zipSha256':sha(dest),'entries':[{'name':str(p.relative_to(out/'package')),'bytes':p.stat().st_size,'sha256':sha(p)} for p in files],'testedZipIntegrity':True,'sourceUnchangedChecks':'verification-static.json','archiveContainsOnlyPublicRuntime':True}
(out/'package-manifest.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
