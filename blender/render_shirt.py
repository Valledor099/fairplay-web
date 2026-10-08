import bpy
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/models/camiseta.glb'))
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE_NEXT'
scene.render.resolution_x=800;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.world=bpy.data.worlds.new('ShirtPreviewWorld');scene.world.color=(.018,.025,.028)
def look(obj,pt=(0,0,0)):
    obj.rotation_euler=(Vector(pt)-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(.6,-6,.25));camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=3.5;look(camera);scene.camera=camera
for name,position,energy,size in [('Key',(-3,-3,4),650,3),('Fill',(3,-2,1),180,3),('Rim',(0,2,3),550,2)]:
    bpy.ops.object.light_add(type='AREA',location=position);lamp=bpy.context.object;lamp.name=name;lamp.data.energy=energy;lamp.data.size=size;look(lamp)
scene.render.filepath=str(ROOT/'blender/previews/camiseta-fabric.png');bpy.ops.render.render(write_still=True)
