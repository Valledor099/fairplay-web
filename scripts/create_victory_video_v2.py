"""Encode two detailed photographic camera distances without extreme enlargement."""
from pathlib import Path
import json
import subprocess
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.video-runtime'))
import imageio_ffmpeg

archive = ROOT / 'design/victory-video'
video_dir = ROOT / 'public/video'
wide, close = archive / 'team-wide-v2.png', archive / 'team-close-v2.png'
with Image.open(wide) as source:
    poster = source.convert('RGB')
    poster.thumbnail((1440, 960), Image.Resampling.LANCZOS)
    poster.save(ROOT / 'public/artwork/victory-video-poster.webp', 'WEBP', quality=92, method=6)

FPS, FRAMES = 24, 192
p = f'(on/{FRAMES-1})'
def smooth(a, b, variable=p):
    t = f'clip(({variable}-{a})/{b-a},0,1)'
    return f'({t}*{t}*(3-2*{t}))'

wide_filter = f"scale=3344:-2,zoompan=z='1+.12*{smooth(.02,.65)}':x='max(0,min(iw-iw/zoom,iw*.44-iw/zoom/2))':y='ih*.51-ih/zoom/2':d={FRAMES}:s=1440x810:fps={FPS}"
close_filter = f"scale=3344:-2,zoompan=z='1+.03*{smooth(.5,.98)}':x='iw/2-iw/zoom/2':y='ih*.5-ih/zoom/2':d={FRAMES}:s=1008x567:fps={FPS},format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*min(1,(W-X)/130)*min(1,Y/32)*min(1,(H-Y)/60)'"
blend = smooth(.48,.69, '(N/191)')
desktop = (
    f'[0:v]split[wide][stadium];[wide]{wide_filter}[far];'
    f'[stadium]crop=iw:trunc(ih*.24/2)*2:0:trunc(ih*.14/2)*2,scale=1440:810,boxblur=12:2,loop=loop=191:size=1:start=0,setpts=N/(24*TB)[bg];'
    f'[1:v]{close_filter}[near];[bg][near]overlay=x=-60:y=122:shortest=1[closeshot];'
    f"[far][closeshot]blend=all_expr='A*(1-{blend})+B*{blend}'[out]"
)
mobile_far = f"crop=trunc(ih*9/16/2)*2:ih:iw*.515-ow/2:0,scale=1080:-2,zoompan=z='1+.02*{smooth(.02,.65)}':x='iw/2-iw/zoom/2':y='ih*.5-ih/zoom/2':d={FRAMES}:s=540x960:fps={FPS}"
mobile_close = f"crop=trunc(ih*9/16/2)*2:ih:iw*.48-ow/2:0,scale=1080:-2,zoompan=z='1+.02*{smooth(.5,.98)}':x='iw/2-iw/zoom/2':y='ih*.5-ih/zoom/2':d={FRAMES}:s=540x960:fps={FPS}"
mobile = f"[0:v]{mobile_far}[far];[1:v]{mobile_close}[near];[far][near]blend=all_expr='A*(1-{blend})+B*{blend}'[out]"

assets=[]
for name, filters, size in [('victory-desktop',desktop,[1440,810]),('victory-mobile',mobile,[540,960])]:
    target=video_dir / f'{name}.mp4'
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-i',str(wide),'-i',str(close),
        '-filter_complex',filters,'-map','[out]','-frames:v',str(FRAMES),'-an','-c:v','libx264','-preset','medium',
        '-crf','19','-g','6','-keyint_min','6','-sc_threshold','0','-bf','0','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],check=True)
    reader=imageio_ffmpeg.read_frames(str(target)); metadata=next(reader); reader.close()
    frames,seconds=imageio_ffmpeg.count_frames_and_secs(str(target))
    asset={'file':target.name,'size':size,'bytes':target.stat().st_size,'frames':frames,'duration':seconds,'fps':metadata['fps'],'codec':metadata['codec']}
    assets.append(asset); print(json.dumps(asset),flush=True)
(archive/'manifest.json').write_text(json.dumps({'sources':['team-wide-v2.png','team-close-v2.png'],
    'sourceSizes':[[1672,941],[1672,941]],'maxWideCropZoom':1.12,'maxCloseCropZoom':1.03,
    'method':'Two detailed Imagegen photographs at different camera distances, gentle crop and cinematic dissolve. Players are not independently animated. No extreme CSS enlargement.',
    'assets':assets},indent=2),encoding='utf-8')
