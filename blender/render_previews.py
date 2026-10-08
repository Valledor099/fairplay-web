import bpy, math
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'blender'/'previews';OUT.mkdir(exist_ok=True)

def look(obj, pt=(0,0,0)):
    obj.rotation_euler=(Vector(pt)-obj.location).to_track_quat('-Z','Y').to_euler()

for name in ('camiseta','tote','gorra','pasaporte'):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(ROOT/'public'/'models'/(name+'.glb')))
    scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE_NEXT';scene.render.resolution_x=640;scene.render.resolution_y=640;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
    scene.world=bpy.data.worlds.new('PreviewWorld');scene.world.color=(.018,.025,.028)
    bpy.ops.object.camera_add(location=(0,-6,0));cam=bpy.context.object;look(cam);scene.camera=cam;cam.data.lens=58
    if name=='tote': cam.location=(0,-6,.2);look(cam,(0,0,.2))
    if name=='gorra': cam.location=(0,-5,.25);look(cam,(0,0,.15))
    bpy.ops.object.light_add(type='AREA',location=(-3,-4,4));key=bpy.context.object;key.data.energy=900;key.data.shape='DISK';key.data.size=4;look(key)
    bpy.ops.object.light_add(type='AREA',location=(3,-2,1));fill=bpy.context.object;fill.data.energy=500;fill.data.size=3;look(fill)
    bpy.ops.object.light_add(type='AREA',location=(0,2,3));rim=bpy.context.object;rim.data.energy=700;rim.data.size=2;look(rim)
    scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True)
