from pathlib import Path
from shutil import copy2
from PIL import Image

root = Path(__file__).resolve().parents[1]
originals = root / 'design' / 'visual-refresh'
assets = root / 'public' / 'artwork' / 'experience'
originals.mkdir(parents=True, exist_ok=True)
assets.mkdir(parents=True, exist_ok=True)
source = Path('C:/Users/AgusSanti/.codex/generated_images/01a1191f-1f05-7a22-a3f2-9f570d37a343')
for name, filename in [('locker-room', 'exec-863beb35-9ffe-4dd3-a311-d36545180016.png'), ('passport-entry', 'exec-b9db35b0-4b60-41fa-b60a-711a73ded038.png')]:
    copy2(source / filename, originals / (name + '.png'))
    image = Image.open(source / filename).convert('RGB')
    image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    image.save(assets / (name + '.webp'), 'WEBP', quality=85, method=6)
    print(name, image.size, (assets / (name + '.webp')).stat().st_size)
