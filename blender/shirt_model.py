"""Draped FAIR PLAY jersey: registered print, open cuffs, knit PBR and seams."""
import bpy, bmesh, math
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]

def textile_maps(root):
    # Native procedural material data: 16 knit stitches per seamless 512px tile.
    size=512;cells=16
    heights=[]
    for y in range(size):
        for x in range(size):
            u=(x*cells/size)%1;v=(y*cells/size)%1
            left=math.exp(-((u-(.29+.18*(v-.5)))/.10)**2)
            right=math.exp(-((u-(.71-.18*(v-.5)))/.10)**2)
            yarn=(left+right)*(.65+.35*math.sin(math.pi*v)**2)
            fiber=.035*math.sin(2*math.pi*x/4)*math.sin(2*math.pi*y/8)
            heights.append(yarn+fiber)
    pixels=[];rough=[]
    for y in range(size):
        for x in range(size):
            h=heights[y*size+x]
            dx=(heights[y*size+(x+1)%size]-heights[y*size+(x-1)%size])*.85
            dy=(heights[((y+1)%size)*size+x]-heights[((y-1)%size)*size+x])*.85
            norm=math.sqrt(dx*dx+dy*dy+1)
            pixels.extend((.5-dx/norm*.5,.5+dy/norm*.5,.5+.5/norm,1))
            r=.81+.10*(1-min(1,h));rough.extend((r,r,r,1))
    images=[]
    for name,data in [('normal',pixels),('roughness',rough)]:
        image=bpy.data.images.new('Jersey_Knit_'+name,size,size,alpha=False)
        image.colorspace_settings.name='Non-Color';image.pixels.foreach_set(data)
        image.filepath_raw=str(root/'public/textures'/f'jersey-knit-{name}.png')
        image.file_format='PNG';image.save();images.append(image)
    return images

def fabric(name,normal,rough,color=(.004,.006,.007),printed=False):
    material=bpy.data.materials.new(name);material.use_nodes=True
    nt=material.node_tree;bs=nt.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Roughness'].default_value=.86;bs.inputs['Metallic'].default_value=0
    bs.inputs['Sheen Weight'].default_value=.28;bs.inputs['Sheen Roughness'].default_value=.75
    bs.inputs['Sheen Tint'].default_value=(.08,.10,.11,1)
    bs.inputs['Specular IOR Level'].default_value=.22
    if printed:
        tex=nt.nodes.new('ShaderNodeTexImage')
        tex.image=bpy.data.images.load(str(ROOT/'public/textures/jersey-front.png'),check_existing=True)
        uv=nt.nodes.new('ShaderNodeUVMap');uv.uv_map='PrintUV'
        nt.links.new(uv.outputs['UV'],tex.inputs['Vector']);nt.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
        # Opaque garment geometry owns the silhouette, instead of a floating transparent rectangle.
    weave=nt.nodes.new('ShaderNodeUVMap');weave.uv_map='KnitUV'
    ntex=nt.nodes.new('ShaderNodeTexImage');ntex.image=normal
    nt.links.new(weave.outputs['UV'],ntex.inputs['Vector'])
    nmap=nt.nodes.new('ShaderNodeNormalMap');nmap.uv_map='KnitUV';nmap.inputs['Strength'].default_value=.45
    nt.links.new(ntex.outputs['Color'],nmap.inputs['Color']);nt.links.new(nmap.outputs['Normal'],bs.inputs['Normal'])
    rtex=nt.nodes.new('ShaderNodeTexImage');rtex.image=rough
    nt.links.new(weave.outputs['UV'],rtex.inputs['Vector']);nt.links.new(rtex.outputs['Color'],bs.inputs['Roughness'])
    return material

# Trace lies inside the real garment in the supplied merchandising photograph.
# The V neckline is a real opening, not printed on a rectangular plate.
CROP_OUTLINE=[(360,9),(311,45),(234,68),(165,113),(81,177),(15,215),
              (101,326),(151,303),(171,289),(166,350),(148,463),(116,599),
              (83,729),(101,743),(192,777),(351,805),(451,824),(582,798),(697,758),
              (697,704),(716,454),(716,323),(750,338),(792,360),(861,306),
              (852,281),(846,219),(858,204),(809,143),(722,70),(616,36),(593,13),
              (577,55),(549,103),(497,134),(452,145),(407,123),(382,82),(369,40)]
OUTLINE=[(x+29,y+76) for x,y in CROP_OUTLINE]

def coords(px,py):
    return ((px-29)/890-.5)*2.82, (1-(py-76)/839)*2.66-1.33

def drape(x,z,back=False):
    t=max(0,min(1,(z+1.33)/2.66));body=math.exp(-(x/.84)**6)
    fullness=.115*body*math.sin(math.pi*t)**.6
    roll=.015*math.sin(11*x+1.7*z)*math.sin(math.pi*t)
    folds=0
    for side,phase in [(-1,.3),(1,-.45)]:
        center=side*(.46+.10*math.sin(z*2+phase))
        folds+=.042*math.exp(-((x-center)/.13)**2)-.023*math.exp(-((x-center-.13*side)/.11)**2)
    folds*=math.sin(math.pi*t)**.8
    underarm=.018*math.sin((z+.55*abs(x)-.25)*18)*math.exp(-((z+.55*abs(x)-.25)/.24)**2)
    hem=.022*math.sin(9*x)*math.exp(-((z+1.22)/.13)**2)
    depth=.055+fullness+roll+folds*body+underarm+hem
    return depth*.8 if back else -depth

def surface(name,outline,material,parent,back=False):
    from mathutils.geometry import tessellate_polygon
    points=[Vector((x,0,z)) for x,z in [coords(*point) for point in outline]]
    verts=[];faces=[];lookup={};cuts=24
    def vertex(v):
        key=tuple(round(c,7) for c in v)
        if key not in lookup:lookup[key]=len(verts);verts.append(tuple(v))
        return lookup[key]
    # Subdivide each tessellated triangle without rebuilding the concave underarm outline.
    for triangle in tessellate_polygon([points]):
        a,b,c=[points[p] if isinstance(p,int) else p for p in triangle]
        grid={}
        for i in range(cuts+1):
            for j in range(cuts-i+1):grid[i,j]=vertex(a+(b-a)*(i/cuts)+(c-a)*(j/cuts))
        for i in range(cuts):
            for j in range(cuts-i):
                faces.append((grid[i,j],grid[i+1,j],grid[i,j+1]))
                if j<cuts-i-1:faces.append((grid[i+1,j],grid[i+1,j+1],grid[i,j+1]))
    mesh=bpy.data.meshes.new(name+'Mesh');mesh.from_pydata(verts,[],faces);mesh.update()
    bm=bmesh.new();bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
    bm.to_mesh(mesh);bm.free()
    mesh.uv_layers.new(name='PrintUV');mesh.uv_layers.new(name='KnitUV')
    for loop in mesh.loops:
        v=mesh.vertices[loop.vertex_index].co;x,z=v.x,v.z
        mesh.uv_layers['PrintUV'].data[loop.index].uv=(x/2.82+.5,z/2.66+.5)
        mesh.uv_layers['KnitUV'].data[loop.index].uv=(x/2.82*22,z/2.66*26)
    for vertex in mesh.vertices:
        vertex.co.y=drape(vertex.co.x,vertex.co.z,back)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);obj.parent=parent
    obj.data.materials.append(material)
    # Front, back and connecting panels form the garment volume without a rigid board rim.
    if back:
        # The front polygon winds toward -Y; back normals point outwards toward +Y.
        bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
    for polygon in mesh.polygons:polygon.use_smooth=True
    return obj

def seam(name,photo_points,material,parent,radius=.0038,back=False):
    cu=bpy.data.curves.new(name+'Curve','CURVE');cu.dimensions='3D';cu.bevel_depth=radius
    cu.bevel_resolution=2;cu.resolution_u=8
    spline=cu.splines.new('POLY')
    pts=[]
    for a,b in zip(photo_points,photo_points[1:]):
        steps=max(2,int(math.dist(a,b)/9))
        for i in range(steps):
            t=i/steps;pts.append((a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t))
    pts.append(photo_points[-1]);spline.points.add(len(pts)-1)
    for point,xy in zip(spline.points,pts):
        x,z=coords(*xy);point.co=(x,drape(x,z,back)+(.005 if back else -.006),z,1)
    obj=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(obj);obj.parent=parent;obj.data.materials.append(material)
    return obj

def create_shirt(root=ROOT):
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    normal,rough=textile_maps(root)
    front=fabric('Jersey_Knit_Printed',normal,rough,printed=True)
    back=fabric('Jersey_Knit_Back',normal,rough)
    thread=fabric('Jersey_Knit_Thread',normal,rough,(.006,.009,.010))
    rib=fabric('Jersey_Ribbed_Collar',normal,rough,(.06,.075,.08))
    parent=bpy.data.objects.new('CamisetaRoot',None);bpy.context.collection.objects.link(parent)
    surface('JerseyBody',OUTLINE,front,parent)
    back_outline=OUTLINE[:32]+[(590,118),(480,134),(400,118)]
    surface('JerseyBack',back_outline,back,parent,True)
    # Narrow side panels join front/back; neck, sleeve cuffs and bottom hem stay open.
    edges=[('Left',OUTLINE[9:13]),('Right',list(reversed(OUTLINE[18:22]))),
           ('LeftShoulder',OUTLINE[:6]),('RightShoulder',OUTLINE[26:32])]
    for side,edge in edges:
        pts=[];faces=[]
        count=(len(edge)-1)*16
        for i in range(count+1):
            segment=min(len(edge)-2,i//16);a,b=edge[segment],edge[segment+1];t=(i-segment*16)/16
            x,z=coords(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)
            pts.extend([(x,drape(x,z),z),(x,drape(x,z,True),z)])
            if i: faces.append((2*i-2,2*i-1,2*i+1,2*i))
        mesh=bpy.data.meshes.new(side+'SideFabric');mesh.from_pydata(pts,[],faces);mesh.update();mesh.uv_layers.new(name='KnitUV')
        for loop in mesh.loops:
            v=mesh.vertices[loop.vertex_index].co;mesh.uv_layers[0].data[loop.index].uv=(v.z*8,v.y*8)
        ob=bpy.data.objects.new(side+'SideFabric',mesh);bpy.context.collection.objects.link(ob);ob.parent=parent;ob.data.materials.append(back)
        for p in mesh.polygons:p.use_smooth=True
    seam('VNeckRibbing',[(390,88),(399,117),(415,156),(439,194),(481,216),(526,207),(578,176),(607,129),(621,90)],rib,parent,.009)
    seam('NeckTopstitch',[(407,153),(434,197),(480,223),(529,214),(581,183),(610,138)],thread,parent,.0028)
    seam('LeftCuffTopstitch',[(52,291),(133,402)],thread,parent)
    seam('RightCuffTopstitch',[(874,353),(825,427)],thread,parent)
    seam('HemTopstitch',[(119,798),(132,813),(226,846),(380,875),(481,891),(611,865),(720,826)],thread,parent,.003)
    seam('HemSecondTopstitch',[(120,792),(133,807),(227,840),(380,869),(481,885),(611,859),(720,820)],thread,parent,.0022)
    seam('LeftShoulderTopstitch',[(291,137),(245,174),(228,242),(224,310)],thread,parent,.0028)
    seam('RightShoulderTopstitch',[(718,149),(763,191),(781,250)],thread,parent,.0028)
    bpy.ops.object.select_all(action='DESELECT');parent.select_set(True)
    for obj in parent.children_recursive:obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(root/'public/models/camiseta.glb'),export_format='GLB',use_selection=True,export_apply=True,export_materials='EXPORT',export_cameras=False,export_lights=False,export_yup=True,export_texcoords=True,export_normals=True,export_tangents=True,export_skins=False,export_animations=False)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(root/'blender/camiseta-fabric.blend'))
    print('FABRIC_JERSEY_EXPORT_COMPLETE')
    return parent

if __name__=='__main__':create_shirt()
