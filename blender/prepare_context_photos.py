"""Copy generated editorial originals and encode the website's WebP assets."""
from pathlib import Path
import shutil
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GENERATED = Path(r'C:\Users\AgusSanti\.codex\generated_images\01a11356-54af-75d1-a935-f751c0b42bef')
FILES = {
    'sportswashing': 'exec-31653258-eebe-4340-b2be-50ac8bf1b3fa.png',
    'censorship': 'exec-d505a652-f7b5-4697-bae5-386723355cbc.png',
    'behind-sport': 'exec-31e357c0-a8e2-4409-90cd-dece1a951f01.png',
}
archive = ROOT / 'design/context-photography'
web = ROOT / 'public/artwork/context'
archive.mkdir(parents=True, exist_ok=True)
web.mkdir(parents=True, exist_ok=True)
for name, filename in FILES.items():
    original = archive / f'{name}.png'
    if not original.exists():
        shutil.copy2(GENERATED / filename, original)
    with Image.open(original) as source:
        photo = source.convert('RGB')
        photo.thumbnail((1440, 960), Image.Resampling.LANCZOS)
        target = web / f'{name}.webp'
        photo.save(target, 'WEBP', quality=85, method=6)
        print(f'{name}: {photo.width} x {photo.height}, {target.stat().st_size / 1024:.0f} KiB')
