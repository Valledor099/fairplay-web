from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
source=root/'design/victory-video/team-plate-continuous.png'
out=root/'public/artwork/victory-team-plate.webp'
image=Image.open(source)
image.save(out,'WEBP',quality=95,method=6)
manifest={'sources':[source.name],'sourceSizes':[list(image.size)],'method':'One continuous photo, one scroll camera; the same engraved W becomes the vector wordmark. No shot switching or light trail.','asset':{'file':out.name,'size':list(image.size),'bytes':out.stat().st_size},'inscriptionPixels':{'center':[790,131],'size':[80,62]}}
(root/'design/victory-video/manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(image.size, out.stat().st_size)
