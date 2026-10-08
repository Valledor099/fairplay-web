"""Encode a photographic camera push-in as seekable, scroll-controlled MP4."""
from pathlib import Path
import json
import shutil
import subprocess
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.video-runtime'))
import imageio_ffmpeg

SOURCE = Path(r'C:\Users\AgusSanti\.codex\generated_images\01a11356-54af-75d1-a935-f751c0b42bef\exec-c14a7110-669e-47ab-9e0b-f689577a5ec4.png')
archive = ROOT / 'design/victory-video'
video_dir = ROOT / 'public/video'
archive.mkdir(parents=True, exist_ok=True)
video_dir.mkdir(parents=True, exist_ok=True)
original = archive / 'team-celebration-source.png'
if not original.exists():
    shutil.copy2(SOURCE, original)
with Image.open(original) as source:
    poster = source.convert('RGB')
    poster.thumbnail((1440, 960), Image.Resampling.LANCZOS)
    poster.save(ROOT / 'public/artwork/victory-video-poster.webp', 'WEBP', quality=88, method=6)

FPS, FRAMES = 24, 192
p = f'(on/{FRAMES-1})'
def smooth(a, b):
    t = f'clip(({p}-{a})/{b-a},0,1)'
    return f'({t}*{t}*(3-2*{t}))'

zoom = f'(1+.8*{smooth(.02,.88)})'
cx = f'(.52-.08*{smooth(.04,.25)}+.20*{smooth(.55,.86)})'
desktop = f"scale=3344:-2,zoompan=z='{zoom}':x='max(0,min(iw-iw/zoom,iw*{cx}-iw/zoom/2))':y='max(0,min(ih-ih/zoom,ih*.51-ih/zoom/2))':d={FRAMES}:s=1440x810:fps={FPS}"
mobile = f"crop=trunc(ih*9/16/2)*2:ih:iw*.535-ow/2:0,scale=1080:-2,zoompan=z='1+.08*{smooth(.02,.88)}':x='iw/2-iw/zoom/2':y='ih*.51-ih/zoom/2':d={FRAMES}:s=540x960:fps={FPS}"
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
assets = []
for name, filters, size in [('victory-desktop', desktop, [1440,810]), ('victory-mobile', mobile, [540,960])]:
    target = video_dir / f'{name}.mp4'
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(original),
        '-vf', filters, '-frames:v', str(FRAMES), '-an', '-c:v', 'libx264', '-preset', 'medium',
        '-crf', '23', '-g', '6', '-keyint_min', '6', '-sc_threshold', '0', '-bf', '0',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(target)], check=True)
    reader = imageio_ffmpeg.read_frames(str(target))
    metadata = next(reader)
    reader.close()
    frames, seconds = imageio_ffmpeg.count_frames_and_secs(str(target))
    assets.append({'file':target.name, 'size':size, 'bytes':target.stat().st_size,
        'frames':frames, 'duration':seconds, 'fps':metadata['fps'], 'codec':metadata['codec']})
    print(json.dumps(assets[-1]), flush=True)
(archive / 'manifest.json').write_text(json.dumps({'source':'team-celebration-source.png',
    'method':'Camera push-in and lateral reframing over an Imagegen photograph. Players are not independently animated.',
    'assets':assets}, indent=2), encoding='utf-8')
