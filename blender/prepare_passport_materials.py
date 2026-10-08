"""Deterministic, tileable PBR data maps; the original print artwork is untouched."""
from pathlib import Path
import math
import random
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parents[1] / 'public' / 'textures'
OUT.mkdir(parents=True, exist_ok=True)
SIZE = 512

def normal_map(height, strength):
    pixels = height.load()
    normal = Image.new('RGB', height.size)
    out = normal.load()
    for y in range(SIZE):
        for x in range(SIZE):
            dx = (pixels[(x + 1) % SIZE, y] - pixels[(x - 1) % SIZE, y]) / 255 * strength
            dy = (pixels[x, (y + 1) % SIZE] - pixels[x, (y - 1) % SIZE]) / 255 * strength
            length = math.sqrt(dx * dx + dy * dy + 1)
            out[x, y] = (round(127.5 * (1 - dx / length)), round(127.5 * (1 + dy / length)), round(127.5 * (1 + 1 / length)))
    return normal

for material, seed in [('cover', 7429), ('paper', 1974)]:
    rng = random.Random(seed)
    height = Image.new('L', (SIZE, SIZE))
    height.putdata([rng.randrange(85, 171) for _ in range(SIZE * SIZE)])
    if material == 'cover':
        height = height.filter(ImageFilter.GaussianBlur(.65))
        draw = ImageDraw.Draw(height)
        for _ in range(11000):
            x, y = rng.randrange(SIZE), rng.randrange(SIZE)
            radius = rng.choice([1, 1, 2])
            draw.ellipse((x, y, x + radius, y + radius), fill=rng.randrange(105, 155))
        height = height.filter(ImageFilter.GaussianBlur(.4))
    else:
        height = height.filter(ImageFilter.GaussianBlur(.45))
        draw = ImageDraw.Draw(height)
        for _ in range(8000):
            x, y = rng.randrange(SIZE), rng.randrange(SIZE)
            draw.line((x, y, x + rng.randrange(2, 8), y + rng.choice([-1, 0, 1])), fill=rng.randrange(113, 144), width=1)
    roughness = height.point(lambda v: round((.73 if material == 'cover' else .90) * 255 + (v - 128) * .32))
    normal_map(height, 2.4 if material == 'cover' else 1.0).save(OUT / f'passport-{material}-normal.png', optimize=True)
    roughness.convert('RGB').save(OUT / f'passport-{material}-roughness.png', optimize=True)
    print(f'{material}: 512px normal + roughness')
