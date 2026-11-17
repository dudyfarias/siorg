from pathlib import Path
import base64
import hashlib
import json
import subprocess
import sys

import requests

project=Path('/Users/eduardofariascappia/minutodaoracao')
sys.path.insert(0,str(project))
from src.config import elevenlabs_api_key, elevenlabs_model_id, elevenlabs_voice_id, elevenlabs_voice_settings

root=Path(__file__).resolve().parent
scenes=json.loads((root/'cenas.json').read_text())
text='\n\n'.join('\n'.join(s['narration']) for s in scenes)
model=elevenlabs_model_id()
voice=elevenlabs_voice_id()
settings=elevenlabs_voice_settings()
assert model == 'eleven_v4' and voice == '5p9IbzcK4R8rN1fpGdMF'
assert settings['similarity_boost'] == 1.0
assert 100 < len(text) < 5000
payload={'text':text,'model_id':model,'voice_settings':settings}
receipt=root/'voz-v4-recibo.json'
if receipt.exists():
    raise SystemExit('Já há registro desta chamada. Confira o resultado antes de gerar outra vez.')
info={'status':'started','model':model,'voice_id':voice,'voice_settings':settings,'characters':len(text),
      'text_sha256':hashlib.sha256(text.encode()).hexdigest()}
def save():
    receipt.write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
save()
response=requests.post(
    f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps',
    headers={'xi-api-key':elevenlabs_api_key(),'Content-Type':'application/json'},
    params={'output_format':'mp3_44100_128'},json=payload,timeout=180)
info['http_status']=response.status_code
info['request_id']=response.headers.get('request-id')
if not response.ok:
    value=response.json().get('detail', {})
    info['status']='rejected'
    info['provider_code']=value.get('status') if isinstance(value,dict) else 'erro'
    info['provider_type']=value.get('type') if isinstance(value,dict) else None
    save()
    raise SystemExit(f'ElevenLabs HTTP {response.status_code}, código {info.get("provider_code")}, tipo {info.get("provider_type")}.')
data=response.json()
audio=base64.b64decode(data['audio_base64'])
alignment=data.get('alignment') or data.get('normalized_alignment')
assert alignment and alignment.get('characters')
(root/'voz-v4.mp3').write_bytes(audio)
(root/'voz-v4-alinhamento.json').write_text(json.dumps(alignment,ensure_ascii=False),encoding='utf-8')
subprocess.run(['/tmp/siorg-video-lib/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v9.0','-y','-hide_banner','-loglevel','error','-i',
                str(root/'voz-v4.mp3'),'-ar','24000','-ac','1','-c:a','pcm_s16le',str(root/'voz-v4.wav')],check=True)
info['status']='completed'
info['audio_sha256']=hashlib.sha256(audio).hexdigest()
save()
print(f'ElevenLabs V4 concluído. {len(text)} caracteres, áudio e marcação de tempo recebidos.')
