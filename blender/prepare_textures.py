from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, math

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "public" / "artwork"
OUT = ROOT / "public" / "textures"
OUT.mkdir(parents=True, exist_ok=True)

def perspective_crop(src, quad, size, dst):
    # Match the projective mapping in src/passport-model.js, including the seal centres.
    points=[quad[0],quad[3],quad[2],quad[1]] # PIL-style UL,LL,LR,UR -> TL,TR,BR,BL.
    rows=[]
    for (u,v),(x,y) in zip([(0,0),(1,0),(1,1),(0,1)],points):
        rows += [[u,v,1,0,0,0,-u*x,-v*x,x],[0,0,0,u,v,1,-u*y,-v*y,y]]
    for col in range(8):
        best=max(range(col,8),key=lambda r:abs(rows[r][col]));rows[col],rows[best]=rows[best],rows[col]
        d=rows[col][col];rows[col]=[v/d for v in rows[col]]
        for row in range(8):
            if row!=col:
                f=rows[row][col];rows[row]=[a-f*b for a,b in zip(rows[row],rows[col])]
    h=[row[8] for row in rows];w,height=size
    coefficients=(h[0]/w,h[1]/height,h[2],h[3]/w,h[4]/height,h[5],h[6]/w,h[7]/height)
    im=Image.open(src).convert('RGB').transform(size,Image.Transform.PERSPECTIVE,coefficients,Image.Resampling.BICUBIC)
    im.save(dst,quality=92,optimize=True)

def crop_alpha(src, dst, max_size=1024):
    im = Image.open(src).convert("RGBA")
    a = im.getchannel("A")
    box = a.getbbox()
    if box:
        im = im.crop(box)
    im.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    im.save(dst, optimize=True)

# Reference points from src/passport-model.js are TL,TR,BR,BL. PIL QUAD wants TL,BL,BR,TR.
def pil_quad(points):
    tl,tr,br,bl=points
    return [tl,bl,br,tr]
perspective_crop(ART / "pasaporte.png", pil_quad([(73,304),(504,223),(618,834),(171,912)]), (700,1000), OUT / "passport-cover.jpg")
perspective_crop(ART / "pasaporte.png", pil_quad([(627,158),(1046,196),(1001,791),(608,746)]), (700,1000), OUT / "passport-left.jpg")
perspective_crop(ART / "pasaporte.png", pil_quad([(1046,196),(1458,221),(1430,823),(1001,791)]), (700,1000), OUT / "passport-right.jpg")
crop_alpha(ART / "symbol-light.png", OUT / "symbol-light-decal.png")
crop_alpha(ART / "brand-light.png", OUT / "brand-light-decal.png")

# Exact jersey surface from the supplied reference, masked to its real silhouette.
merch=Image.open(ART/'merchandising-sin-frase.png').convert('RGBA')
shirt_poly=[(185,155),(391,76),(447,82),(511,112),(561,116),(617,99),(653,78),(728,130),(815,184),(918,279),(865,402),(781,385),(762,426),(764,845),(701,882),(538,914),(337,901),(170,865),(103,817),(163,421),(109,409),(29,295),(105,214)]
mask=Image.new('L',merch.size,0);ImageDraw.Draw(mask).polygon(shirt_poly,fill=255)
pix=merch.load(); ma=mask.load()
for y in range(70,920):
    for x in range(20,930):
        if ma[x,y] and min(pix[x,y][:3])>232 and not (545<x<725 and 170<y<350): ma[x,y]=0
merch.putalpha(mask); jersey=merch.crop((29,76,919,915)); jersey.thumbnail((1024,1024),Image.Resampling.LANCZOS);jersey.save(OUT/'jersey-front.png',optimize=True)

font_candidates = [
    Path("C:/Windows/Fonts/georgiab.ttf"),
    Path("C:/Windows/Fonts/georgia.ttf"),
]
font_path = next(p for p in font_candidates if p.exists())

def text_decal(lines, dst, size=(1024,1024), font_size=112, color=(246,244,236,255)):
    im = Image.new("RGBA", size, (0,0,0,0))
    d = ImageDraw.Draw(im)
    font = ImageFont.truetype(str(font_path), font_size)
    spacing = int(font_size * .08)
    boxes = [d.textbbox((0,0), line, font=font, stroke_width=1) for line in lines]
    heights = [b[3]-b[1] for b in boxes]
    total = sum(heights) + spacing*(len(lines)-1)
    y = (size[1]-total)//2
    for line, box, h in zip(lines, boxes, heights):
        w = box[2]-box[0]
        d.text(((size[0]-w)//2, y), line, font=font, fill=color, stroke_width=1, stroke_fill=color)
        y += h + spacing
    im.save(dst, optimize=True)

text_decal(["MIRÁ", "DETRÁS", "DEL JUEGO"], OUT / "tote-message.png", font_size=118)
text_decal(["FAIR PLAY"], OUT / "fair-play.png", size=(1024,256), font_size=116)

# Deterministic radial contour of the exact alpha artwork, used as the pin's metal silhouette.
logo=Image.open(OUT/'symbol-light-decal.png').convert('RGBA'); alpha=logo.getchannel('A')
w,h=logo.size; cx,cy=w/2,h/2; contour=[]
for i in range(128):
    a=2*math.pi*i/128; best=0
    for r in range(1,int(math.hypot(w,h))):
        x=int(cx+math.cos(a)*r); y=int(cy+math.sin(a)*r)
        if not (0<=x<w and 0<=y<h): break
        if alpha.getpixel((x,y))>24: best=r
    contour.append([(math.cos(a)*best)/(w*.5),-(math.sin(a)*best)/(h*.5)])
(ROOT/'blender'/'pin_outline.json').write_text(json.dumps(contour),encoding='utf8')
print("Prepared:", *sorted(p.name for p in OUT.iterdir()), sep="\n- ")
