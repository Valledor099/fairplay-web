import json, struct
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
for path in sorted((ROOT/'public'/'models').glob('*.glb')):
    data=path.read_bytes(); magic,version,length=struct.unpack_from('<4sII',data,0)
    off=12; doc=None
    while off < length:
        ln,typ=struct.unpack_from('<II',data,off); off+=8
        chunk=data[off:off+ln];off+=ln
        if typ==0x4E4F534A: doc=json.loads(chunk.rstrip(b' \x00'))
    tris=0
    for mesh in doc.get('meshes',[]):
        for prim in mesh.get('primitives',[]):
            acc=doc['accessors'][prim['indices']]
            tris += acc['count']//3
    print(path.name, f'{path.stat().st_size/1024:.1f} KiB', f'{tris} tris')
    for node in doc.get('nodes',[]):
        if node.get('name','').startswith('Passport'):
            print(' ',node['name'],'translation=',node.get('translation'),'rotation=',node.get('rotation'),'children=',node.get('children'))
