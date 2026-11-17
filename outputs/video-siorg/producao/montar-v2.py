"""Replace the central slideshow with a recorded SIORG walkthrough.

Only the picture is encoded. The final mux copies the original AAC packets and
their hash must match before the output is promoted to its final filename.
Run with the bundled Python (Pillow required). --check-layout needs no recording.
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from fractions import Fraction
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PRODUCTION = ROOT / "producao"
ORIGINAL = ROOT / "SIORG - Guia da Linha do Tempo e do Simulador.mp4"
OUTPUT = ROOT / "SIORG - Guia com navegação na tela.mp4"
TAKE = PRODUCTION / "navegacao-v2" / "take.webm"
METADATA = TAKE.with_suffix(".json")
SRT = ROOT / "Legendas-SIORG.srt"
SCENES = PRODUCTION / "cenas.json"
FFMPEG = Path(os.environ.get("SIORG_VIDEO_FFMPEG", "/tmp/siorg-video-lib/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v9.0"))
FFPROBE = Path(os.environ.get("SIORG_VIDEO_FFPROBE", "/Users/eduardofariascappia/QG do FUT/06-Videos/editor/tools/ffprobe"))
FONT_DIR = Path("/System/Library/Fonts/Supplemental")
WIDTH, HEIGHT, FPS = 1920, 1080, 30
VIDEO_X, VIDEO_Y, VIDEO_W, VIDEO_H = 105, 76, 1710, 880
PALETTE = {
    "ground": "#F4F3F0", "ink": "#1E2429", "mute": "#505960",
    "red": "#A12A29", "line": "#D7DAD8", "white": "#FFFFFF",
    "caption": "#242A2E", "tint": "#FBEDEC", "darkred": "#842120",
}


@dataclass(frozen=True)
class Cue:
    number: int
    start: float
    end: float
    text: str


def timestamp(text: str) -> float:
    hours, minutes, seconds, milliseconds = map(int, re.split(r"[:,.]", text.strip()))
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000


def read_cues(path: Path = SRT) -> list[Cue]:
    blocks = re.split(r"\n\s*\n", path.read_text(encoding="utf-8-sig").strip())
    result = []
    for block in blocks:
        rows = block.splitlines()
        if len(rows) < 3 or " --> " not in rows[1]:
            raise ValueError("Bloco de legenda inválido: " + block[:80])
        start, end = rows[1].split(" --> ", 1)
        cue = Cue(int(rows[0]), timestamp(start), timestamp(end), " ".join(" ".join(rows[2:]).split()))
        if cue.end <= cue.start:
            raise ValueError(f"Duração inválida na legenda {cue.number}.")
        result.append(cue)
    if [c.number for c in result] != list(range(1, len(result) + 1)):
        raise ValueError("A numeração das legendas deve ser contínua.")
    return result


def font(size: int, bold: bool = False):
    return ImageFont.truetype(str(FONT_DIR / ("Arial Bold.ttf" if bold else "Arial.ttf")), size)


def wrap(draw, text: str, face, width: int) -> list[str]:
    rows, current = [], ""
    for word in text.split():
        candidate = f"{current} {word}" if current else word
        if current and draw.textlength(candidate, font=face) > width:
            rows.append(current)
            current = word
        else:
            current = candidate
    if current:
        rows.append(current)
    return rows


def background() -> Image.Image:
    # A quiet, warm background and a soft frame shadow keep the screen dominant.
    image = Image.new("RGB", (WIDTH, HEIGHT), PALETTE["ground"])
    draw = ImageDraw.Draw(image)
    for y in range(HEIGHT):
        progress = y / (HEIGHT - 1)
        color = tuple(round(a + (b - a) * progress) for a, b in zip((248, 247, 244), (236, 237, 235)))
        draw.line((0, y, WIDTH, y), fill=color)
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (VIDEO_X - 4, VIDEO_Y + 2, VIDEO_X + VIDEO_W + 4, VIDEO_Y + VIDEO_H + 8),
        radius=12, fill=(22, 29, 34, 48),
    )
    image = Image.alpha_composite(image.convert("RGBA"), shadow.filter(ImageFilter.GaussianBlur(10))).convert("RGB")
    draw = ImageDraw.Draw(image)
    draw.rectangle((VIDEO_X - 1, VIDEO_Y - 1, VIDEO_X + VIDEO_W, VIDEO_Y + VIDEO_H), fill=PALETTE["white"], outline=PALETTE["line"], width=1)
    draw.text((75, 23), "SIORG", font=font(32, True), fill=PALETTE["ink"], anchor="lt")
    draw.rectangle((215, 23, 218, 53), fill=PALETTE["red"])
    draw.rounded_rectangle((75, 970, 1847, 1064), radius=14, fill=PALETTE["caption"])
    return image


def frame_for_cue(base: Image.Image, cue: Cue, scene: dict) -> tuple[Image.Image, int, int]:
    image = base.copy()
    draw = ImageDraw.Draw(image)
    chapter = "ÚLTIMAS MUDANÇAS" if scene["chapter"] == 2 else "PASSO A PASSO"
    draw.text((244, 29), chapter, font=font(22, True), fill=PALETTE["darkred"], anchor="lt")
    title = str(scene["title"])
    title_size = 33
    while draw.textlength(title, font=font(title_size, True)) > 1260 and title_size > 24:
        title_size -= 1
    if draw.textlength(title, font=font(title_size, True)) > 1260:
        raise ValueError(f"Cabeçalho muito longo na legenda {cue.number}.")
    draw.text((555, 24), title, font=font(title_size, True), fill=PALETTE["ink"], anchor="lt")
    size = 36
    while True:
        face = font(size)
        rows = wrap(draw, cue.text, face, 1660)
        if len(rows) <= 2:
            break
        size -= 1
        if size < 30:
            raise ValueError(f"A legenda {cue.number} não cabe em duas linhas legíveis.")
    line_height = size + 5
    top = 970 + (94 - len(rows) * line_height) / 2 + 1
    for i, row in enumerate(rows):
        draw.text((WIDTH / 2, top + i * line_height), row, font=face, fill=PALETTE["white"], anchor="mt")
    return image, len(rows), size


def load_layout() -> tuple[list[Cue], list[dict]]:
    cues = read_cues()
    scenes = json.loads(SCENES.read_text(encoding="utf-8"))
    expanded = [scene for scene in scenes for _ in scene["narration"]]
    texts = [text for scene in scenes for text in scene["narration"]]
    if len(expanded) != len(cues):
        raise ValueError("As cenas não correspondem à quantidade de legendas.")
    for cue, text in zip(cues, texts):
        if cue.text != " ".join(text.split()):
            raise ValueError(f"O texto da legenda {cue.number} diverge da cena original.")
    selected = [cue for cue in cues if 3 <= cue.number <= 28]
    if len(selected) != 26:
        raise ValueError("Esperadas exatamente as legendas 3 a 28 para a navegação.")
    for before, after in zip(selected, selected[1:]):
        if abs(before.end - after.start) > 0.002:
            raise ValueError("Há intervalo ou sobreposição nas legendas da navegação.")
    return selected, expanded


def probe(path: Path) -> dict:
    command = [str(FFPROBE), "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)]
    return json.loads(subprocess.check_output(command, text=True))


def audio_hash(path: Path) -> str:
    command = [str(FFMPEG), "-v", "error", "-i", str(path), "-map", "0:a:0", "-c:a", "copy", "-f", "hash", "-hash", "sha256", "-"]
    result = subprocess.check_output(command, text=True).strip()
    if not re.fullmatch(r"SHA256=[a-fA-F0-9]{64}", result):
        raise ValueError("Não foi possível conferir a integridade da faixa de áudio.")
    return result


def numeric_metadata(metadata: dict, key: str, default: float | None = None) -> float:
    value = metadata.get(key, default)
    if isinstance(value, bool) or value is None:
        raise ValueError(f"take.json precisa de {key} numérico.")
    result = float(value)
    if not math.isfinite(result):
        raise ValueError(f"take.json contém {key} inválido.")
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check-layout", action="store_true", help="Confere capítulos e duas linhas de legenda, sem gravar arquivos.")
    parser.add_argument("--take", type=Path, default=TAKE)
    parser.add_argument("--metadata", type=Path, default=METADATA)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--preset", default="veryfast", choices=["ultrafast", "superfast", "veryfast", "faster", "fast", "medium"])
    args = parser.parse_args()
    cues, scenes = load_layout()
    base = background()
    layout = []
    for cue in cues:
        _, rows, size = frame_for_cue(base, cue, scenes[cue.number - 1])
        layout.append({"cue": cue.number, "lines": rows, "fontSize": size})
    if args.check_layout:
        print(json.dumps({"ok": True, "canvas": [WIDTH, HEIGHT], "screen": [VIDEO_X, VIDEO_Y, VIDEO_W, VIDEO_H], "cues": layout}, ensure_ascii=False, indent=2))
        return
    for path in [FFMPEG, FFPROBE, ORIGINAL, args.take, args.metadata]:
        if not path.is_file():
            raise FileNotFoundError(path)
    if args.output.resolve() == ORIGINAL.resolve():
        raise ValueError("A saída não pode sobrescrever a versão 1.")
    metadata = json.loads(args.metadata.read_text(encoding="utf-8"))
    source_from = numeric_metadata(metadata, "sourceFrom")
    speed = numeric_metadata(metadata, "speed", 0.64)
    target_start = numeric_metadata(metadata, "targetStart", 11.82)
    target_end = numeric_metadata(metadata, "targetEnd", 168.8)
    if source_from < 0 or speed <= 0 or target_end <= target_start:
        raise ValueError("Recorte ou velocidade inválidos no take.json.")
    if abs(target_start - cues[0].start) > 0.002 or abs(target_end - cues[-1].end) > 0.002:
        raise ValueError("O trecho de destino deve coincidir com as legendas 3 a 28.")
    original_info, take_info = probe(ORIGINAL), probe(args.take)
    original_video = next(s for s in original_info["streams"] if s["codec_type"] == "video")
    original_audio = next(s for s in original_info["streams"] if s["codec_type"] == "audio")
    take_video = next(s for s in take_info["streams"] if s["codec_type"] == "video")
    if (original_video["width"], original_video["height"]) != (WIDTH, HEIGHT):
        raise ValueError("A versão 1 deve ter 1920×1080.")
    if abs(float(Fraction(original_video["avg_frame_rate"])) - FPS) > 0.001:
        raise ValueError("A versão 1 deve ter 30 fps para preservar seus cortes por quadro.")
    if original_audio["codec_name"] != "aac":
        raise ValueError("Esperada a faixa AAC original do MP4, sem conversão.")
    if (take_video["width"], take_video["height"]) != (1360, 700):
        raise ValueError("A gravação deve ter 1360×700 para o enquadramento combinado.")
    original_duration = float(original_video.get("duration") or original_info["format"]["duration"])
    total_frames = int(original_video.get("nb_frames") or round(original_duration * FPS))
    first_frame, last_frame = round(target_start * FPS), round(target_end * FPS)
    middle_frames = last_frame - first_frame
    if not 0 < first_frame < last_frame < total_frames:
        raise ValueError("Os cortes ultrapassam a versão 1.")
    take_duration = float(take_video.get("duration") or take_info["format"]["duration"])
    source_to = source_from + (target_end - target_start) * speed
    if take_duration + 0.10 < source_to:
        raise ValueError(f"Gravação curta: precisa chegar a {source_to:.3f}s; contém {take_duration:.3f}s. Não será congelado um trecho ausente.")
    original_audio_hash = audio_hash(ORIGINAL)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    partial = args.output.with_name(args.output.stem + ".montando.tmp.mp4")
    try:
        with tempfile.TemporaryDirectory(prefix="siorg-montagem-v2-") as temporary:
            work = Path(temporary)
            concat_rows = []
            for cue in cues:
                image, _, _ = frame_for_cue(base, cue, scenes[cue.number - 1])
                path = work / f"cue-{cue.number:02d}.png"
                image.save(path, optimize=False)
                concat_rows.extend([f"file '{path.as_posix()}'", f"duration {cue.end - cue.start:.6f}"])
            concat_rows.append(f"file '{path.as_posix()}'")
            timeline = work / "legendas-e-capitulos.ffconcat"
            timeline.write_text("\n".join(concat_rows) + "\n", encoding="utf-8")
            silent = work / "video-sem-audio.mp4"
            graph = (
                f"[0:v]split=2[intro_src][tail_src];"
                f"[intro_src]trim=end_frame={first_frame},setpts=PTS-STARTPTS,setsar=1[intro];"
                f"[tail_src]trim=start_frame={last_frame}:end_frame={total_frames},setpts=PTS-STARTPTS,setsar=1[tail];"
                f"[1:v]trim=start={source_from:.9f}:end={source_to:.9f},setpts=(PTS-STARTPTS)/{speed:.9f},"
                f"scale={VIDEO_W}:{VIDEO_H}:flags=lanczos,setsar=1,fps={FPS},"
                f"tpad=stop_mode=clone:stop_duration=0.25,trim=end_frame={middle_frames}[screen];"
                f"[2:v]fps={FPS},trim=end_frame={middle_frames},setpts=PTS-STARTPTS,setsar=1[background];"
                f"[background][screen]overlay=x={VIDEO_X}:y={VIDEO_Y}:shortest=1:eof_action=repeat,format=yuv420p[middle];"
                f"[intro][middle][tail]concat=n=3:v=1:a=0,fps={FPS},format=yuv420p[picture]"
            )
            render_command = [
                str(FFMPEG), "-y", "-hide_banner", "-loglevel", "warning", "-stats",
                "-i", str(ORIGINAL), "-i", str(args.take), "-f", "concat", "-safe", "0", "-i", str(timeline),
                "-filter_complex_threads", "1", "-filter_complex", graph,
                "-map", "[picture]", "-an", "-frames:v", str(total_frames),
                "-c:v", "libx264", "-preset", args.preset, "-crf", "18", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", str(silent),
            ]
            print(f"Montando imagem: abertura original, {middle_frames / FPS:.3f}s de navegação e encerramento original.", flush=True)
            subprocess.run(render_command, check=True)
            print("Copiando a faixa original de voz, sem recodificação…", flush=True)
            subprocess.run([
                str(FFMPEG), "-y", "-hide_banner", "-loglevel", "warning", "-i", str(silent), "-i", str(ORIGINAL),
                "-map", "0:v:0", "-map", "1:a:0", "-map_metadata", "1", "-c:v", "copy", "-c:a", "copy",
                "-movflags", "+faststart", str(partial),
            ], check=True)
            final_info = probe(partial)
            final_video = next(s for s in final_info["streams"] if s["codec_type"] == "video")
            if int(final_video.get("nb_frames", 0)) != total_frames:
                raise ValueError("A duração em quadros divergiu da versão 1.")
            if audio_hash(partial) != original_audio_hash:
                raise ValueError("A faixa de voz divergiu da original. A saída não será entregue.")
            partial.replace(args.output)
            print(json.dumps({
                "output": str(args.output), "videoCodec": final_video["codec_name"],
                "frames": total_frames, "fps": FPS, "originalAudioCopied": True,
                "originalAudioPacketHash": original_audio_hash,
                "sourceFrom": source_from, "sourceTo": source_to, "speed": speed,
                "targetStart": target_start, "targetEnd": target_end,
                "actualVideoStart": first_frame / FPS, "actualVideoEnd": last_frame / FPS,
                "captionSource": str(SRT), "cues": [3, 28],
            }, ensure_ascii=False, indent=2), flush=True)
    finally:
        if partial.exists():
            partial.unlink()


if __name__ == "__main__":
    main()
