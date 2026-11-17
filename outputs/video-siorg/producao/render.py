from pathlib import Path
from collections import Counter
import argparse
import difflib
import json
import re
import subprocess
import wave

from PIL import Image, ImageDraw, ImageFont, ImageOps

root = Path(__file__).resolve().parents[1]
app = root.parents[1]
workspace = root / 'producao'
images = root / 'capturas'
frames = workspace / 'quadros'
frames.mkdir(exist_ok=True)
scenes = json.loads((workspace / 'cenas.json').read_text())
chapter_names = ('Apresentação', 'Passo a passo', 'O que mudou', 'CMS do SIORG', 'Servidor institucional')
palette = {'ground':'#F4F3F0', 'ink':'#1E2429', 'mute':'#505960', 'red':'#A12A29', 'line':'#D7DAD8',
    'white':'#FFFFFF', 'caption':'#242A2E', 'tint':'#FBEDEC', 'darkred':'#842120'}
font_dir = Path('/System/Library/Fonts/Supplemental')
ffmpeg = Path('/tmp/siorg-video-lib/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v9.0')

def font(size, weight='regular'):
    name = 'Arial Bold.ttf' if weight == 'bold' else 'Arial.ttf'
    return ImageFont.truetype(str(font_dir / name),size)

def lines(draw, text, face, width):
    result=[]
    for paragraph in text.splitlines():
        row=''
        for word in paragraph.split():
            probe = f'{row} {word}' if row else word
            if row and draw.textlength(probe,font=face) > width:
                result.append(row)
                row = word
            else:
                row = probe
        result.append(row)
    return result

def label(draw, xy, text, face, width, color, spacing=1.17):
    x,y=xy
    for row in lines(draw,text,face,width):
        draw.text((x,y),row,font=face,fill=color,anchor='lt')
        y+=round(face.size*spacing)
    return y

def rounded(draw, rect, fill, border=None, radius=22):
    draw.rounded_rectangle(rect,radius=radius,fill=fill,outline=border,width=2)

def source(name):
    if name == 'cms-catalogo':
        return app/'evidence/homologacao-cms-2026-11-17/rascunho-catalogo.jpg'
    return images/(name+'.jpg')

def fit_picture(frame, area, shot, crop, highlight=None):
    raw = Image.open(source(shot)).convert('RGB')
    x0,y0,x1,y1 = crop or (0,0,*raw.size)
    if x1 > raw.width or y1 > raw.height:
        raise ValueError((shot,raw.size,crop))
    crop_image=raw.crop((x0,y0,x1,y1))
    fitted=ImageOps.contain(crop_image,(area[2]-area[0],area[3]-area[1]),Image.Resampling.LANCZOS)
    left = area[0]+(area[2]-area[0]-fitted.width)//2
    top = area[1]+(area[3]-area[1]-fitted.height)//2
    frame.paste(fitted,(left,top))
    if highlight:
        a,b,c,d=highlight
        sx=fitted.width/(x1-x0)
        sy=fitted.height/(y1-y0)
        r=(left+int((a-x0)*sx),top+int((b-y0)*sy),left+int((c-x0)*sx),top+int((d-y0)*sy))
        if all([r[0]>=area[0],r[1]>=area[1],r[2]<=area[2],r[3]<=area[3]]):
            ImageDraw.Draw(frame).rounded_rectangle(r,radius=10,outline='#BA2328',width=5)

def diagram(d, key):
    p=palette
    if key == 'editor':
        data=[('Painel do portal','Textos, links e arquivos de referência.'),('Aplicação do simulador','Busca, cálculo e arquivos da proposta.')]
        for i,(title,desc) in enumerate(data):
            y=253+i*243
            rounded(d,(526,y,1778,y+190),'#F7F7F5',p['line'],18)
            d.rectangle((526,y+24,533,y+166),fill=p['red'])
            label(d,(579,y+40),title,font(53,'bold'),1110,p['ink'])
            label(d,(580,y+114),desc,font(35),1120,p['mute'])
    elif key == 'servidor':
        for x,y,w,h,top,body in [
          (517,275,513,307,'Portal SIORG','Produtos\nAbrir simulador'),
          (1171,275,636,307,'Servidor institucional','Simulador e Linha do Tempo\nEndereço próprio')]:
            rounded(d,(x,y,x+w,y+h),'#F7F7F5',p['line'],18)
            label(d,(x+32,y+43),top,font(46,'bold'),w-64,p['ink'])
            label(d,(x+32,y+154),body,font(38),w-64,p['mute'])
        d.line((1050,424,1143,424),fill=p['red'],width=7)
        d.polygon(((1143,412),(1162,424),(1143,436)),fill=p['red'])
        label(d,(554,662),'O portal apresenta a ferramenta. A aplicação roda no seu próprio endereço.',font(37),1169,p['mute'])
    else:
        for i,(title,desc) in enumerate([
          ('Funcionou no teste local','Recálculo, resumo e downloads em PDF e Excel.'),
          ('Falta confirmar','Instalação no CMS, regras técnicas e hospedagem institucional.')]):
            y=261+i*218
            rounded(d,(531,y,1778,y+174),'#F7F7F5',p['line'],18)
            label(d,(581,y+37),title,font(48,'bold'),1100,p['ink'])
            label(d,(581,y+103),desc,font(35),1120,p['mute'])

def draw_frame(scene, cue, caption):
    p=palette
    f=Image.new('RGB',(1920,1080),p['ground'])
    d=ImageDraw.Draw(f)
    d.text((76,53),'SIORG',font=font(53,'bold'),fill=p['ink'],anchor='lt')
    d.rectangle((75,118,1847,120),fill=p['line'])
    labels=(('Passo a passo',1),('Últimas mudanças',2),('CMS',3),('Servidor próprio',4))
    x=969
    for title,number in labels:
        selected = scene['chapter'] == number
        size = 23
        face=font(size,'bold' if selected else 'regular')
        width=round(d.textlength(title,font=face))+39
        if selected:
            rounded(d,(x,54,x+width,94),p['tint'],radius=12)
        d.text((x+19,65),title,font=face,fill=p['darkred'] if selected else p['mute'],anchor='lt')
        x+=width+7
    rounded(d,(465,156,1847,885),p['white'],p['line'],18)
    d.rectangle((78,207,130,214),fill=p['red'])
    d.text((78,243),chapter_names[scene['chapter']].upper(),font=font(21,'bold'),fill=p['darkred'],anchor='lt')
    end=label(d,(73,309),scene['title'],font(61,'bold'),365,p['ink'],1.07)
    label(d,(77,end+32),scene['note'],font(31),351,p['mute'],1.28)
    if 'diagram' in scene:
        diagram(d,scene['diagram'])
    elif scene['image']=='cms-catalogo':
        fit_picture(f,(491,257,1820,586),scene['image'],scene['crop'])
        label(d,(541,633),'Projeto de rascunho criado. A busca por Script retornou zero resultados.',font(38,'bold'),1180,p['ink'])
    else:
        shot = scene.get('before') if cue==0 and scene.get('before') else scene['image']
        fit_picture(f,(480,169,1833,871),shot,scene.get('crop'),scene.get('highlight'))
    rounded(d,(75,919,1847,1031),p['caption'],radius=17)
    face=font(38)
    rows=lines(d,caption,face,1655)
    if len(rows)>2:
        face=font(34)
        rows=lines(d,caption,face,1655)
    assert len(rows)<=2, (scene['title'],caption)
    cy=955 if len(rows)==1 else 934
    for row in rows:
        d.text((961,cy),row,font=face,fill=p['white'],anchor='mt')
        cy+=45
    return f

def full_text():
    return '\n\n'.join('\n'.join(s['narration']) for s in scenes)

def frame_timings(narration, alignment):
    chars=''.join(alignment['characters'])
    matcher=difflib.SequenceMatcher(None, narration, chars, autojunk=False)
    mapping={}
    for pos,other,length in matcher.get_matching_blocks():
        mapping.update({pos+k:other+k for k in range(length)})
    expected=[line for scene in scenes for line in scene['narration']]
    durations=[]
    text_from=0
    for cue in expected:
        index=narration.index(cue,text_from)
        mapped=[mapping[i] for i in range(index,index+len(cue)) if i in mapping and not narration[i].isspace()]
        if len(mapped)<len(cue.replace(' ',''))*0.86:
            raise ValueError('O alinhamento da locução não encontrou a frase: '+cue)
        durations.append((alignment['character_start_times_seconds'][mapped[0]],alignment['character_end_times_seconds'][mapped[-1]]))
        text_from=index+len(cue)
    return durations

def to_srt(seconds):
    ms=round(seconds*1000)
    h,ms=divmod(ms,3600000); m,ms=divmod(ms,60000); s,ms=divmod(ms,1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--voice',action='store_true')
    ap.add_argument('--only-frames',action='store_true')
    args=ap.parse_args()
    items=[]
    for i,scene in enumerate(scenes):
        for j,caption in enumerate(scene['narration']):
            image = frames/f'{i+1:02d}-{j+1:02d}.jpg'
            draw_frame(scene,j,caption).save(image,quality=95,subsampling=0)
            items.append((image,caption,scene['chapter']))
    if args.only_frames:
        return
    if args.voice:
        align=json.loads((workspace/'voz-v4-alinhamento.json').read_text())
        voice=workspace/'voz-v4.wav'
        with wave.open(str(voice),'rb') as w:
            duration=w.getnframes()/w.getframerate()
        raw=frame_timings(full_text(),align)
        boundaries=[0]
        for (prev_a,prev_b),(next_a,next_b) in zip(raw,raw[1:]):
            boundaries.append(max(boundaries[-1]+0.25,min(next_a,(prev_b+next_a)/2)))
        boundaries.append(max(duration,raw[-1][1])+0.9)
        title='SIORG - Guia da Linha do Tempo e do Simulador.mp4'
    else:
        boundaries=[0]
        for _,caption,_ in items:
            length=len(re.findall(r'\S+',caption))
            boundaries.append(boundaries[-1]+max(2.7,length*60/157+0.42))
        title='SIORG - Previa visual sem locucao.mp4'
    concat=[]
    subs=[]
    for i,(image,caption,_) in enumerate(items):
        concat+=['file '+repr(str(image)),f'duration {boundaries[i+1]-boundaries[i]:.6f}']
        subs+=[str(i+1),f'{to_srt(boundaries[i])} --> {to_srt(boundaries[i+1])}',caption,'']
    concat+=['file '+repr(str(items[-1][0]))]
    timeline=workspace/'cortes.txt'
    timeline.write_text('\n'.join(concat)+'\n')
    (root/'Legendas-SIORG.srt').write_text('\n'.join(subs),encoding='utf-8')
    app_args=[str(ffmpeg),'-y','-hide_banner','-loglevel','warning','-f','concat','-safe','0','-i',str(timeline)]
    if args.voice:
        app_args+=['-i',str(voice),'-af','loudnorm=I=-16:TP=-1.5:LRA=10,apad','-c:a','aac','-b:a','160k','-ar','48000']
    app_args+=['-vf','fps=30,format=yuv420p','-c:v','libx264','-crf','18','-preset','veryfast','-movflags','+faststart','-t',f'{boundaries[-1]:.3f}',str(root/title)]
    subprocess.run(app_args,check=True)
    print(f'{title} — {boundaries[-1]:.2f} segundos')
if __name__=='__main__':
    main()
