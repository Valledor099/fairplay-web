import bpy, math, os, json, sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'blender'))
MODELS = ROOT / "public" / "models"
TEX = ROOT / "public" / "textures"
MODELS.mkdir(parents=True, exist_ok=True)

def clear():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.curves, bpy.data.materials):
        pass

def mat(name, color, rough=.7, metallic=0.0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Roughness'].default_value=rough; bs.inputs['Metallic'].default_value=metallic
    return m

BLACK=mat('Textile_Black',(0.012,0.016,0.018),.86)
CHARCOAL=mat('Charcoal',(0.045,0.052,0.055),.76)
GREY=mat('Collar_Grey',(0.38,0.43,0.45),.72)
SAGE=mat('Sage_Canvas',(0.32,0.43,0.37),.9)
CREAM=mat('Warm_Paper',(0.91,0.88,0.79),.82)
WHITE=mat('Warm_White',(0.94,0.93,0.88),.62)
METAL=mat('Pin_Metal',(0.25,0.31,0.29),.3,.72)

def image_mat(name, path, rough=.65):
    m=bpy.data.materials.new(name); m.use_nodes=True
    nt=m.node_tree; bs=nt.nodes.get('Principled BSDF'); img=nt.nodes.new('ShaderNodeTexImage')
    img.image=bpy.data.images.load(str(path), check_existing=True); nt.links.new(img.outputs['Color'],bs.inputs['Base Color'])
    nt.links.new(img.outputs['Alpha'],bs.inputs['Alpha']); bs.inputs['Roughness'].default_value=rough
    m.surface_render_method='DITHERED'; return m

def passport_material(name, kind, path=None):
    m=image_mat(name,path,1) if path else mat(name,(.012,.019,.022) if kind=='cover' else (.91,.88,.81),1)
    nt=m.node_tree;bs=nt.nodes.get('Principled BSDF')
    for channel in ('normal','roughness'):
        tex=nt.nodes.new('ShaderNodeTexImage')
        tex.image=bpy.data.images.load(str(TEX/f'passport-{kind}-{channel}.png'),check_existing=True)
        tex.image.colorspace_settings.name='Non-Color'
        if channel=='normal':
            normal=nt.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.38 if kind=='cover' else .28
            nt.links.new(tex.outputs['Color'],normal.inputs['Color']);nt.links.new(normal.outputs['Normal'],bs.inputs['Normal'])
        else: nt.links.new(tex.outputs['Color'],bs.inputs['Roughness'])
    return m

def passport_surface(name,path,loc,parent,underside=False,mirror_u=False,kind='paper'):
    # A rounded, gently bowed sheet, with UVs matching the original printed layout.
    w,h,r=1.93,2.78,.095;nx,ny=24,48;verts=[];uvs=[];faces=[]
    for j in range(ny+1):
        v=j/ny;y=h*(.5-v);edge=max(0,abs(y)-(h/2-r))
        half=w/2-r+math.sqrt(max(0,r*r-edge*edge)) if edge else w/2
        for i in range(nx+1):
            u=i/nx;x=(2*u-1)*half
            bow=(.002 if kind=='cover' else .005)*math.sin(math.pi*u)*math.sin(math.pi*v)
            verts.append((x,y,-bow if underside else bow))
            uvs.append((1-(x/w+.5) if mirror_u else x/w+.5,1-v))
    for j in range(ny):
        for i in range(nx):
            a=j*(nx+1)+i;b=a+1;c=b+nx+1;d=a+nx+1
            faces.append((a,b,c,d) if underside else (a,d,c,b))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update();me.uv_layers.new(name='UV')
    for loop in me.loops:me.uv_layers[0].data[loop.index].uv=uvs[loop.vertex_index]
    for polygon in me.polygons:polygon.use_smooth=True
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.location=loc;o.parent=parent
    o.data.materials.append(passport_material(name+'Mat',kind,path));return o

def passport_piece(name,loc,scale,material,radius,parent):
    # Round the XY silhouette independently of sheet thickness.
    x,y,z=scale;outline=[]
    for cx,cy,start in [(x-radius,y-radius,0),(-x+radius,y-radius,90),(-x+radius,-y+radius,180),(x-radius,-y+radius,270)]:
        for step in range(9):
            angle=math.radians(start+step*90/8)
            outline.append((cx+radius*math.cos(angle),cy+radius*math.sin(angle)))
    n=len(outline);verts=[(a,b,-z) for a,b in outline]+[(a,b,z) for a,b in outline]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update()
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.location=loc;o.parent=parent;o.data.materials.append(material)
    bevel=o.modifiers.new('Fine edge','BEVEL');bevel.width=min(.002,z*.3);bevel.segments=2
    # Planar UVs also give the grain on the small exposed cover margins.
    me.uv_layers.new(name='UV')
    for loop in me.loops:
        co=me.vertices[loop.vertex_index].co;me.uv_layers[0].data[loop.index].uv=(co.x/(2*x)+.5,co.y/(2*y)+.5)
    return o

def cube(name, loc, scale, material, bevel=.04, parent=None):
    bpy.ops.mesh.primitive_cube_add(location=loc); o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Soft edges','BEVEL'); mod.width=bevel; mod.segments=2
    o.data.materials.append(material); o.parent=parent; return o

def cyl(name, loc, radius, depth, material, rot=(math.pi/2,0,0), verts=32, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=depth,location=loc,rotation=rot)
    o=bpy.context.object;o.name=name;o.data.materials.append(material);o.parent=parent
    bev=o.modifiers.new('Edge bevel','BEVEL');bev.width=.025;bev.segments=2;return o

def prism(name, pts, depth, material, parent=None, bevel=.025):
    # polygon in X/Z, depth along Y; front is -Y / +Z in glTF.
    n=len(pts); verts=[(x,-depth/2,z) for x,z in pts]+[(x,depth/2,z) for x,z in pts]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    for i in range(n): j=(i+1)%n; faces.append((i,j,n+j,n+i))
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],faces);me.update()
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.data.materials.append(material);o.parent=parent
    if bevel:
        b=o.modifiers.new('Fabric edge','BEVEL');b.width=bevel;b.segments=2
    return o

def curve_tube(name, points, radius, material, parent=None, cyclic=False):
    cu=bpy.data.curves.new(name+'Curve','CURVE');cu.dimensions='3D';cu.bevel_depth=radius;cu.bevel_resolution=4;cu.resolution_u=8
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
    for bp,co in zip(sp.bezier_points,points): bp.co=co;bp.handle_left_type='AUTO';bp.handle_right_type='AUTO'
    sp.use_cyclic_u=cyclic;o=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(o);o.data.materials.append(material);o.parent=parent;return o

def decal(name, path, loc, size, parent=None):
    w,h=size
    if 'symbol-light-decal' in str(path) or 'brand-light-decal' in str(path):
        image=bpy.data.images.load(str(path),check_existing=True);iw,ih=image.size;h=w*ih/iw
    verts=[(-w/2,0,-h/2),(w/2,0,-h/2),(w/2,0,h/2),(-w/2,0,h/2)]
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],[(0,1,2,3)]);me.uv_layers.new(name='UV')
    for loop,uv in zip(me.uv_layers[0].data,[(0,0),(1,0),(1,1),(0,1)]):loop.uv=uv
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.location=loc;o.data.materials.append(image_mat(name+'Mat',path));o.parent=parent;return o

def decal_xy(name, path, loc, size, parent=None, flip_v=False):
    w,h=size
    if 'symbol-light-decal' in str(path) or 'brand-light-decal' in str(path):
        image=bpy.data.images.load(str(path),check_existing=True);iw,ih=image.size;h=w*ih/iw
    verts=[(-w/2,-h/2,0),(w/2,-h/2,0),(w/2,h/2,0),(-w/2,h/2,0)]
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],[(0,1,2,3)]);me.uv_layers.new(name='UV')
    uvs=[(0,1),(1,1),(1,0),(0,0)] if flip_v else [(0,0),(1,0),(1,1),(0,1)]
    for loop,uv in zip(me.uv_layers[0].data,uvs):loop.uv=uv
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.location=loc;o.data.materials.append(image_mat(name+'Mat',path));o.parent=parent;return o

def passport_plane(name, path, loc, size, parent, underside=False, mirror_u=False):
    """Horizontal plane with explicit web-space TL/TR/BR/BL correspondence."""
    w,h=size
    # Blender +Y maps to web -Z, therefore TL is (-w/2,+h/2).
    coords=[(-w/2,h/2,0),(w/2,h/2,0),(w/2,-h/2,0),(-w/2,-h/2,0)] # TL TR BR BL
    order=[0,1,2,3] if underside else [0,3,2,1]
    verts=[coords[i] for i in order]
    uv_by_corner=[(0,1),(1,1),(1,0),(0,0)]
    if mirror_u: uv_by_corner=[(1-u,v) for u,v in uv_by_corner]
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(verts,[],[(0,1,2,3)]);me.uv_layers.new(name='UV')
    for loop,i in zip(me.uv_layers[0].data,order): loop.uv=uv_by_corner[i]
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.location=loc;o.data.materials.append(image_mat(name+'Mat',path));o.parent=parent;return o

def stitch(name, points, parent=None):
    return curve_tube(name,points,.003,CHARCOAL,parent)

def export(name, objects=None):
    bpy.ops.object.select_all(action='DESELECT')
    targets=objects or list(bpy.context.scene.objects)
    for o in targets:
        o.select_set(True)
        for c in o.children_recursive: c.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(MODELS/(name+'.glb')), export_format='GLB', use_selection=True,
        export_apply=True, export_materials='EXPORT', export_cameras=False, export_lights=False,
        export_yup=True, export_texcoords=True, export_normals=True, export_tangents=False,
        export_attributes=False, export_skins=False, export_morph=False, export_animations=False)

def shirt():
    from shirt_model import create_shirt
    create_shirt(ROOT)

def tote():
    clear();root=bpy.data.objects.new('ToteRoot',None);bpy.context.collection.objects.link(root)
    body=cube('CanvasBag',(0,0,-.12),(1.05,.11,1.05),SAGE,.10,root)
    # lightly tapered lower corners by side seam accents
    stitch('TopSeam',[(-1.0,-.102,.84),(0,-.105,.87),(1.0,-.102,.84)],root)
    stitch('BottomSeam',[(-.94,-.102,-1.08),(0,-.105,-1.12),(.94,-.102,-1.08)],root)
    # One wide U at the front and its mate behind the bag.
    for y,s in [(-.12,'Front'),(.12,'Back')]:
        curve_tube('Handle'+s,[(-.62,y,.86),(-.60,y,1.56),(0,y,1.72),(.60,y,1.56),(.62,y,.86)],.045,SAGE,root)
        stitch('HandleStitch'+s,[(-.62,y-.012,.86),(-.58,y-.012,1.53),(0,y-.012,1.68),(.58,y-.012,1.53),(.62,y-.012,.86)],root)
    cube('LeftGusset',(-1.045,0,-.15),(.035,.13,.96),SAGE,.02,root);cube('RightGusset',(1.045,0,-.15),(.035,.13,.96),SAGE,.02,root)
    decal('ToteMessage',TEX/'tote-message.png',(0,-.122,.06),(1.5,1.5),root)
    decal('ToteLogo',TEX/'symbol-light-decal.png',(0,-.124,-.70),(.38,.22),root)
    export('tote',[root])

def cap():
    clear();root=bpy.data.objects.new('GorraRoot',None);bpy.context.collection.objects.link(root)
    seg=40;rings=10;verts=[];faces=[]
    for r in range(rings+1):
        phi=(math.pi/2)*(r/rings); z=.12+.82*math.cos(phi); rr=math.sin(phi)
        for i in range(seg):
            a=2*math.pi*i/seg;verts.append((.92*rr*math.sin(a),.10+.72*rr*math.cos(a),z))
    for r in range(rings):
        for i in range(seg):
            j=(i+1)%seg;a=r*seg+i;b=r*seg+j;c=(r+1)*seg+j;d=(r+1)*seg+i;faces.append((a,b,c,d))
    me=bpy.data.meshes.new('SixPanelCrownMesh');me.from_pydata(verts,[],faces);me.update();crown=bpy.data.objects.new('SixPanelCrown',me);bpy.context.collection.objects.link(crown);crown.data.materials.append(BLACK);crown.parent=root
    for p in crown.data.polygons: p.use_smooth=True
    # Hide lower half inside sweat band; brim extends toward viewer (-Y).
    band=cyl('SweatBand',(0,.08,.08),.79,.14,CHARCOAL,(0,0,0),40,root);band.scale.y=.90
    # Horizontal XY brim, directly projecting toward viewer (-Y).
    bverts=[]
    outline=[(-.76,-.50),(-.64,-.95),(0,-1.12),(.64,-.95),(.76,-.50),(.48,-.34),(0,-.30),(-.48,-.34)]
    for z in (.02,.11): bverts += [(x,y,z) for x,y in outline]
    n=len(outline);bfaces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    me=bpy.data.meshes.new('CurvedBrimMesh');me.from_pydata(bverts,[],bfaces);me.update();brim=bpy.data.objects.new('CurvedBrim',me);bpy.context.collection.objects.link(brim);brim.data.materials.append(BLACK);brim.parent=root

    for panel in range(6):
        angle=panel*math.pi/3
        points=[]
        for n in range(1,13):
            phi=(math.pi/2)*n/12
            points.append((.923*math.sin(phi)*math.sin(angle),.10+.723*math.sin(phi)*math.cos(angle),.12+.823*math.cos(phi)))
        curve_tube('PanelSeam'+str(panel),points,.0018,CHARCOAL,root)
    cyl('TopButton',(0,.10,.95),.075,.05,BLACK,(0,0,0),24,root)
    decal('CapLogo',TEX/'symbol-light-decal.png',(0,-.635,.30),(.48,.28),root)
    export('gorra',[root])

def wristband():
    clear();root=bpy.data.objects.new('PulseraRoot',None);bpy.context.collection.objects.link(root)
    # Folded woven strap from the merchandising reference, with text on fabric rather than over an empty ring.
    cube('WovenFront',(0,-.06,.12),(.88,.035,.145),BLACK,.04,root)
    cube('WovenBack',(0,.09,.12),(.85,.028,.135),BLACK,.035,root)
    curve_tube('LeftFold',[(-.82,-.06,.12),(-.91,.015,.12),(-.82,.09,.12)],.09,BLACK,root)
    cube('AdjustableKnot',(.93,.02,.055),(.135,.11,.145),CHARCOAL,.065,root)
    end=cube('FabricTailFront',(1.045,-.035,-.29),(.10,.03,.27),BLACK,.03,root);end.rotation_euler.y=-.33
    end=cube('FabricTailBack',(1.22,.07,-.22),(.08,.025,.22),BLACK,.025,root);end.rotation_euler.y=.30
    decal('WristbandText',TEX/'fair-play.png',(0,-.097,.12),(1.48,.245),root)
    export('pulsera',[root])

def pin():
    clear();root=bpy.data.objects.new('PinRoot',None);bpy.context.collection.objects.link(root)
    # Exact outer contour sampled from the original symbol alpha.
    pts=[(x*.62,z*.62*.8) for x,z in json.loads((ROOT/'blender'/'pin_outline.json').read_text())]
    prism('FPSilhouette',pts,.14,METAL,root,.035)
    decal('PinLogo',TEX/'symbol-light-decal.png',(0,-.076,0),(.96,.56),root)
    cyl('PinBack',(0,.13,0),.16,.10,METAL,(math.pi/2,0,0),24,root)
    export('pin',[root])

def stickers():
    clear();root=bpy.data.objects.new('StickersRoot',None);bpy.context.collection.objects.link(root)
    for i in range(7):
        o=cube('Sticker_%02d'%i,(0,i*.035-.10,i*.018-.05),(.78,.015,.55),BLACK,.07,root)
        o.rotation_euler.y=math.radians((i-3)*1.6)
    decal('StickerLogo',TEX/'brand-light-decal.png',(0,-.126,.05),(1.18,.59),root)
    export('stickers',[root])

def passport():
    clear();root=bpy.data.objects.new('PassportRoot',None);bpy.context.collection.objects.link(root)
    # Horizontal book: Blender XY becomes glTF X/-Z; Blender Z becomes glTF Y.
    paper=passport_material('Passport_Paper','paper');cover_material=passport_material('Passport_Grained_Cover','cover')
    passport_piece('PassportBackCover',(0,0,.025),(.985,1.410,.012),cover_material,.115,root)
    right=passport_piece('PassportRight',(0,0,.069),(.952,1.375,.031),paper,.10,root)
    # Individual fine leaf edges replace the appearance of one solid white block.
    for i in range(8):
        passport_piece(f'PassportRightLeaf_{i:02d}',(0,0,.043+i*.0095),(.965-i*.0005,1.390-i*.0005,.0032),paper,.10,root)
    curve_tube('PassportSpine',[(-.986,-1.34,.048),(-.994,0,.070),(-.986,1.34,.048)],.017,cover_material,root)
    body=bpy.data.objects.new('PassportBody',None);bpy.context.collection.objects.link(body);body.parent=root
    # Exact glTF pivot [-.975,.131,0]. Local Blender Z maps to glTF local Y, and local Y maps to glTF local Z.
    hinge=bpy.data.objects.new('PassportHinge',None);bpy.context.collection.objects.link(hinge);hinge.location=(-.975,0,.131);hinge.parent=root
    cover=passport_piece('PassportCover',(.975,0,.046),(.985,1.410,.015),cover_material,.115,hinge)
    passport_surface('PassportCoverArtwork',TEX/'passport-cover.jpg',(.975,0,.063),hinge,kind='cover')
    # Left interior leaf rides with the cover; after web rotation.z=PI it extends to x=-2.925.
    left=passport_piece('PassportLeft',(.975,0,.014),(.952,1.375,.018),paper,.10,hinge)
    for i in range(4):
        passport_piece(f'PassportLeftLeaf_{i:02d}',(.975,0,-.003+i*.009),(.965-i*.0005,1.390-i*.0005,.0032),paper,.10,hinge)
    # Closed: underside normal points down. Opened at PI: it points up and U un-mirrors in world space.
    passport_surface('PassportLeftArtwork',TEX/'passport-left.jpg',(.975,0,-.007),hinge,True,True)
    passport_surface('PassportRightArtwork',TEX/'passport-right.jpg',(0,0,.050),right)
    export('pasaporte',[root])

for fn in ((passport,) if '--passport-only' in sys.argv else (shirt,tote,cap,wristband,pin,stickers,passport)): fn()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'blender'/'fairplay-assets.blend'))
print('EXPORT_COMPLETE')
