"""Copy Imagegen originals and encode the twelve web catalog photos."""
import json, shutil
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'design/product-photography'
DEST=ROOT/'public/artwork/products'
DEST.mkdir(parents=True,exist_ok=True)
manifest=json.loads((SOURCE/'prompts.json').read_text(encoding='utf-8'))
for asset in manifest['assets']:
    for variant in ['product','lifestyle']:
        original=Path(asset[variant])
        if not original.is_absolute():original=SOURCE/original
        archived=SOURCE/f"{asset['slug']}-{variant}.png"
        if original.exists() and original.resolve()!=archived.resolve():shutil.copy2(original,archived)
        with Image.open(archived) as image:
            image=image.convert('RGB')
            image.thumbnail((900,1200),Image.Resampling.LANCZOS)
            target=DEST/f"{asset['slug']}-{variant}.webp"
            image.save(target,'WEBP',quality=85,method=6)
            print(target.name,image.size,target.stat().st_size)
