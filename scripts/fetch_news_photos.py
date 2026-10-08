from pathlib import Path
import json,urllib.request
from PIL import Image
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'design/news-gallery/manifest.json').read_text(encoding='utf-8'))
for asset in manifest['assets']:
 source=root/'design/news-gallery'/asset['original']
 if not source.exists():
  request=urllib.request.Request(asset['photo'],headers={'User-Agent':'FairPlayAcademicWebsite/1.0'})
  source.write_bytes(urllib.request.urlopen(request,timeout=30).read())
 image=Image.open(source);image.thumbnail((1400,1000))
 target=root/'public/artwork/news'/asset['file']
 image.convert('RGB').save(target,'WEBP',quality=88,method=6)
 asset['size']=list(image.size);asset['bytes']=target.stat().st_size
(root/'design/news-gallery/manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
