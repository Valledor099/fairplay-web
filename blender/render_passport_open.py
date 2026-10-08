import bpy, math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public'/'models'/'pasaporte.glb'))
hinge=bpy.data.objects['PassportHinge'];hinge.rotation_euler.y=-math.pi
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE_NEXT';scene.render.resolution_x=900;scene.render.resolution_y=600;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('World');scene.world.color=(.03,.03,.03)
bpy.ops.object.camera_add(location=(-.98,0,7));cam=bpy.context.object;cam.rotation_euler=(0,0,0);cam.rotation_euler=(Vector((-.98,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.7;scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(-1,0,5));bpy.context.object.data.energy=900;bpy.context.object.data.size=5
scene.render.filepath=str(ROOT/'blender'/'previews'/'pasaporte-open.png');scene.render.image_settings.file_format='PNG';bpy.ops.render.render(write_still=True)
