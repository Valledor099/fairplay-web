import bpy
import json
import math
import os
import random
import sys
import tempfile
from pathlib import Path
from mathutils import Vector, Matrix


ROOT = Path(__file__).resolve().parents[1]
BLENDER_DIR = ROOT / "blender"
MODEL_DIR = ROOT / "public" / "models"
ART_DIR = ROOT / "public" / "artwork"
EVIDENCE_DIR = ROOT / "evidence"
TEX_DIR = BLENDER_DIR / "generated-team-textures"
for directory in (MODEL_DIR, ART_DIR, EVIDENCE_DIR, TEX_DIR):
    directory.mkdir(parents=True, exist_ok=True)

BLEND_PATH = BLENDER_DIR / "team-celebration.blend"
GLB_PATH = MODEL_DIR / "team-celebration.glb"
START_PATH = EVIDENCE_DIR / "team-model-start.png"
END_PATH = EVIDENCE_DIR / "team-model-end.png"
POSTER_PNG = ART_DIR / "team-celebration-poster.png"
POSTER_WEBP = ART_DIR / "team-celebration-poster.webp"

FPS = 24
FRAMES = (0, 30, 72, 120)
TAU = math.tau
random.seed(70981)

MH_OBJ_PATH = BLENDER_DIR / "makehuman-base-cc0.obj"
MH_SKEL_PATH = BLENDER_DIR / "makehuman-default-cc0.mhskel"
MH_WEIGHTS_PATH = BLENDER_DIR / "makehuman-default-weights-cc0.mhw"


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (bpy.data.meshes, bpy.data.curves, bpy.data.materials,
                       bpy.data.cameras, bpy.data.lights, bpy.data.images):
        for block in list(collection):
            if block.users == 0:
                collection.remove(block)


def smooth(obj):
    if obj.type == "MESH":
        for poly in obj.data.polygons:
            poly.use_smooth = True
    return obj


def mesh_object(name, verts, faces, material=None, parent=None, collection=None):
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update(calc_edges=True)
    obj = bpy.data.objects.new(name, mesh)
    (collection or bpy.context.collection).objects.link(obj)
    if material:
        mesh.materials.append(material)
    if parent:
        obj.parent = parent
    return smooth(obj)


def add_uv_map(obj):
    mesh = obj.data
    uv = mesh.uv_layers.new(name="UVMap")
    for loop in mesh.loops:
        v = mesh.vertices[loop.vertex_index].co
        uv.data[loop.index].uv = ((math.atan2(v.y, v.x) / TAU) % 1.0,
                                  max(0.0, min(1.0, v.z + 0.5)))


def save_image(name, path, pixel_fn, size=1024, file_format="PNG"):
    image = bpy.data.images.new(name, width=size, height=size, alpha=False, float_buffer=False)
    row = [0.0] * (size * 4)
    pixels = [0.0] * (size * size * 4)
    for y in range(size):
        v = y / (size - 1)
        for x in range(size):
            u = x / (size - 1)
            rgb = pixel_fn(u, v)
            i = (y * size + x) * 4
            pixels[i:i + 4] = (rgb[0], rgb[1], rgb[2], 1.0)
    image.pixels.foreach_set(pixels)
    image.filepath_raw = str(path)
    image.file_format = file_format
    image.save()
    return image


def create_textures():
    def fabric_base(u, v):
        warp = 0.025 * (0.5 + 0.5 * math.sin(TAU * u * 128.0))
        weft = 0.018 * (0.5 + 0.5 * math.sin(TAU * v * 104.0))
        marle = 0.012 * math.sin(TAU * (u * 9.0 + v * 7.0))
        return (0.42 + warp + marle, 0.54 + weft + marle, 0.49 + 0.5 * (warp + weft) + marle)

    def fabric_rough(u, v):
        weave = 0.66 + 0.12 * (0.5 + 0.5 * math.sin(TAU * u * 128.0) * math.sin(TAU * v * 104.0))
        return (weave, weave, weave)

    def fabric_normal(u, v):
        nx = 0.5 + 0.09 * math.sin(TAU * u * 128.0)
        ny = 0.5 + 0.09 * math.sin(TAU * v * 104.0)
        return (nx, ny, 0.98)

    def skin_fn(base, seed):
        def fn(u, v):
            low = 0.026 * math.sin(TAU * (u * 5.0 + seed)) * math.sin(TAU * (v * 4.0 + seed * 0.7))
            pores = 0.010 * math.sin(TAU * u * 73.0) * math.sin(TAU * v * 61.0)
            blush = 0.025 * math.exp(-((v - 0.56) / 0.18) ** 2)
            return (max(0, min(1, base[0] + low + pores + blush)),
                    max(0, min(1, base[1] + low * 0.72 + pores * 0.6)),
                    max(0, min(1, base[2] + low * 0.48 + pores * 0.35)))
        return fn

    images = {}
    specs = [
        ("TeamFabricBase", TEX_DIR / "team-fabric-base.jpg", fabric_base, "JPEG"),
        ("TeamFabricRoughness", TEX_DIR / "team-fabric-roughness.png", fabric_rough, "PNG"),
        ("TeamFabricNormal", TEX_DIR / "team-fabric-normal.png", fabric_normal, "PNG"),
        ("SkinWarm", TEX_DIR / "skin-warm.jpg", skin_fn((0.64, 0.38, 0.25), 0.18), "JPEG"),
        ("SkinOlive", TEX_DIR / "skin-olive.jpg", skin_fn((0.46, 0.29, 0.20), 0.39), "JPEG"),
        ("SkinDeep", TEX_DIR / "skin-deep.jpg", skin_fn((0.25, 0.12, 0.075), 0.67), "JPEG"),
    ]
    for name, path, fn, fmt in specs:
        images[name] = save_image(name, path, fn, 1024, fmt)
    return images


def image_material(name, base_image=None, base_color=(0.5, 0.5, 0.5, 1), roughness=0.5,
                   metallic=0.0, rough_image=None, normal_image=None, normal_strength=0.3):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = base_color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.32
    if base_image:
        tex = nodes.new("ShaderNodeTexImage")
        tex.name = name + "_BaseColor"
        tex.image = base_image
        tex.interpolation = "Linear"
        links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    if rough_image:
        tex = nodes.new("ShaderNodeTexImage")
        tex.name = name + "_Roughness"
        tex.image = rough_image
        tex.image.colorspace_settings.name = "Non-Color"
        links.new(tex.outputs["Color"], bsdf.inputs["Roughness"])
    if normal_image:
        tex = nodes.new("ShaderNodeTexImage")
        tex.name = name + "_Normal"
        tex.image = normal_image
        tex.image.colorspace_settings.name = "Non-Color"
        normal = nodes.new("ShaderNodeNormalMap")
        normal.inputs["Strength"].default_value = normal_strength
        links.new(tex.outputs["Color"], normal.inputs["Color"])
        links.new(normal.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def solid_material(name, color, roughness=0.5, metallic=0.0):
    return image_material(name, base_color=(*color, 1), roughness=roughness, metallic=metallic)


def make_materials(images):
    mats = {}
    mats["skin_warm"] = image_material("Skin_Warm_PBR", images["SkinWarm"], roughness=0.53)
    mats["skin_olive"] = image_material("Skin_Olive_PBR", images["SkinOlive"], roughness=0.55)
    mats["skin_deep"] = image_material("Skin_Deep_PBR", images["SkinDeep"], roughness=0.57)
    mats["sage"] = image_material("Kit_Sage_Fabric_PBR", images["TeamFabricBase"],
                                  rough_image=images["TeamFabricRoughness"],
                                  normal_image=images["TeamFabricNormal"], normal_strength=0.34)
    mats["black"] = image_material("Kit_Black_Fabric_PBR", images["TeamFabricBase"],
                                   base_color=(0.012, 0.017, 0.016, 1),
                                   rough_image=images["TeamFabricRoughness"],
                                   normal_image=images["TeamFabricNormal"], normal_strength=0.36)
    # Multiplying an image texture is represented explicitly so it survives glTF export.
    for key, tint in (("sage", (0.29, 0.43, 0.36, 1)), ("black", (0.012, 0.016, 0.016, 1))):
        mat = mats[key]
        nt = mat.node_tree
        bsdf = nt.nodes.get("Principled BSDF")
        tex = nt.nodes.get(mat.name + "_BaseColor")
        if tex:
            mix = nt.nodes.new("ShaderNodeMixRGB")
            mix.blend_type = "MULTIPLY"
            mix.inputs[0].default_value = 1.0
            mix.inputs[2].default_value = tint
            nt.links.new(tex.outputs["Color"], mix.inputs[1])
            nt.links.new(mix.outputs["Color"], bsdf.inputs["Base Color"])
    mats["hair_dark"] = solid_material("Hair_Dark", (0.018, 0.012, 0.009), 0.62)
    mats["hair_brown"] = solid_material("Hair_Brown", (0.075, 0.032, 0.018), 0.60)
    mats["eye_brown"] = solid_material("Iris_Brown", (0.07, 0.025, 0.012), 0.28)
    mats["eye_white"] = solid_material("Eye_Sclera", (0.78, 0.72, 0.64), 0.34)
    mats["boot"] = solid_material("Boot_Matte_Black", (0.009, 0.012, 0.011), 0.44)
    mats["sole"] = solid_material("Boot_Sole", (0.025, 0.028, 0.027), 0.70)
    mats["gold"] = solid_material("Trophy_Brushed_Gold", (0.83, 0.48, 0.09), 0.22, 0.88)
    mats["gold_dark"] = solid_material("Trophy_Engraved_Gold", (0.26, 0.12, 0.025), 0.29, 0.72)
    mats["stadium"] = solid_material("Stadium_Charcoal", (0.010, 0.016, 0.018), 0.83)
    mats["pitch"] = solid_material("Pitch_Dark", (0.018, 0.055, 0.039), 0.92)
    mats["white"] = solid_material("Kit_Detail", (0.72, 0.76, 0.72), 0.66)
    return mats


def loft(name, rings, sides, material, parent=None, phase=0.0, caps=True):
    verts = []
    uvs = []
    # ring tuple: (z, rx, ry, xoff, yoff, shape)
    for z, rx, ry, xo, yo, shape in rings:
        for i in range(sides):
            a = TAU * i / sides + phase
            c, s = math.cos(a), math.sin(a)
            # shape > 0 gives subtle anatomical squaring without hard edges.
            qx = math.copysign(abs(c) ** (1.0 - shape), c)
            qy = math.copysign(abs(s) ** (1.0 - shape), s)
            verts.append((xo + rx * qx, yo + ry * qy, z))
            uvs.append((i / sides, (z - rings[0][0]) / max(0.001, rings[-1][0] - rings[0][0])))
    faces = []
    nr = len(rings)
    for r in range(nr - 1):
        for i in range(sides):
            j = (i + 1) % sides
            faces.append((r * sides + i, r * sides + j, (r + 1) * sides + j, (r + 1) * sides + i))
    if caps:
        verts.extend([(rings[0][3], rings[0][4], rings[0][0]),
                      (rings[-1][3], rings[-1][4], rings[-1][0])])
        bottom, top = len(verts) - 2, len(verts) - 1
        faces.extend((bottom, (i + 1) % sides, i) for i in range(sides))
        off = (nr - 1) * sides
        faces.extend((top, off + i, off + (i + 1) % sides) for i in range(sides))
    obj = mesh_object(name, verts, faces, material, parent)
    uv = obj.data.uv_layers.new(name="UVMap")
    for loop in obj.data.loops:
        idx = loop.vertex_index
        if idx < len(uvs):
            uv.data[loop.index].uv = uvs[idx]
        else:
            uv.data[loop.index].uv = (0.5, 0.5)
    return obj


def tapered_segment(name, radius_a, radius_b, material, parent=None, muscle=0.09, sides=16):
    rings = [
        (-0.5, radius_a * 0.86, radius_a * 0.82, 0, 0, 0.04),
        (-0.34, radius_a * (1.0 + muscle), radius_a * 0.96, 0, -radius_a * 0.04, 0.06),
        (0.00, (radius_a + radius_b) * 0.55, (radius_a + radius_b) * 0.52, 0, 0, 0.04),
        (0.33, radius_b * (1.0 + muscle * 0.5), radius_b * 0.96, 0, radius_b * 0.03, 0.04),
        (0.5, radius_b * 0.86, radius_b * 0.82, 0, 0, 0.03),
    ]
    return loft(name, rings, sides, material, parent)


def sphere_mesh(name, scale, material, parent=None, segments=20, rings=12):
    verts = []
    faces = []
    for j in range(rings + 1):
        p = math.pi * j / rings
        for i in range(segments):
            a = TAU * i / segments
            verts.append((scale[0] * math.sin(p) * math.cos(a),
                          scale[1] * math.sin(p) * math.sin(a),
                          scale[2] * math.cos(p)))
    for j in range(rings):
        for i in range(segments):
            k = (i + 1) % segments
            faces.append((j * segments + i, j * segments + k,
                          (j + 1) * segments + k, (j + 1) * segments + i))
    return mesh_object(name, verts, faces, material, parent)


def box_mesh(name, dims, material, parent=None, bevel=0.0):
    x, y, z = (d / 2 for d in dims)
    verts = [(-x, -y, -z), (x, -y, -z), (x, y, -z), (-x, y, -z),
             (-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z)]
    faces = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2),
             (2, 6, 7, 3), (4, 0, 3, 7)]
    obj = mesh_object(name, verts, faces, material, parent)
    if bevel:
        mod = obj.modifiers.new("Soft tailoring", "BEVEL")
        mod.width = bevel
        mod.segments = 2
    return obj


def cylinder_mesh(name, radius, depth, material, parent=None, sides=24):
    return loft(name, [(-depth / 2, radius, radius, 0, 0, 0),
                       (depth / 2, radius, radius, 0, 0, 0)], sides, material, parent)


def torus(name, major, minor, material, parent=None, major_segments=32, minor_segments=10):
    verts = []
    faces = []
    for i in range(major_segments):
        a = TAU * i / major_segments
        for j in range(minor_segments):
            b = TAU * j / minor_segments
            verts.append(((major + minor * math.cos(b)) * math.cos(a),
                          (major + minor * math.cos(b)) * math.sin(a),
                          minor * math.sin(b)))
    for i in range(major_segments):
        for j in range(minor_segments):
            ni, nj = (i + 1) % major_segments, (j + 1) % minor_segments
            faces.append((i * minor_segments + j, ni * minor_segments + j,
                          ni * minor_segments + nj, i * minor_segments + nj))
    return mesh_object(name, verts, faces, material, parent)


def curve_tube(name, points, radius, material, parent=None, cyclic=False, resolution=2):
    curve = bpy.data.curves.new(name + "Curve", "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = resolution
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, co in zip(spline.bezier_points, points):
        point.co = co
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    if parent:
        obj.parent = parent
    return obj


def make_head(prefix, skin, hair, eye, parent, head_z=1.70, face_width=1.0, hair_style=0):
    root = bpy.data.objects.new(prefix + "_HeadRig", None)
    bpy.context.collection.objects.link(root)
    root.parent = parent
    root.location.z = head_z
    # A facial loft with jaw, cheekbones, temples and cranium. Front is local -Y.
    rings = [
        (-0.135, 0.085 * face_width, 0.072, 0, 0.012, 0.05),
        (-0.105, 0.116 * face_width, 0.085, 0, 0.004, 0.04),
        (-0.055, 0.142 * face_width, 0.105, 0, -0.005, 0.03),
        (0.005, 0.148 * face_width, 0.115, 0, -0.010, 0.02),
        (0.070, 0.142 * face_width, 0.119, 0, 0.000, 0.01),
        (0.130, 0.124 * face_width, 0.108, 0, 0.014, 0.00),
        (0.175, 0.086 * face_width, 0.076, 0, 0.024, 0.00),
    ]
    face = loft(prefix + "_Face", rings, 28, skin, root, phase=math.pi / 28)
    # Nose bridge and nostril base, modeled as a small anatomical wedge.
    verts = [(-0.022, -0.101, 0.040), (0.022, -0.101, 0.040),
             (-0.028, -0.143, -0.030), (0.028, -0.143, -0.030),
             (-0.018, -0.125, -0.052), (0.018, -0.125, -0.052),
             (0.0, -0.152, -0.038), (0.0, -0.111, 0.064)]
    faces_n = [(0, 1, 7), (0, 7, 2), (1, 3, 7), (2, 7, 6), (7, 3, 6),
               (2, 6, 4), (6, 5, 4), (3, 5, 6), (0, 2, 4), (0, 4, 1), (1, 4, 5), (1, 5, 3)]
    mesh_object(prefix + "_Nose", verts, faces_n, skin, root)
    # Eyes sit inside the facial plane; upper and lower lid curves avoid a wide-eyed expression.
    for side in (-1, 1):
        e = sphere_mesh(prefix + ("_Eye_L" if side < 0 else "_Eye_R"),
                        (0.029, 0.010, 0.017), bpy.data.materials["Eye_Sclera"], root, 16, 8)
        e.location = (side * 0.056 * face_width, -0.111, 0.036)
        iris = sphere_mesh(prefix + ("_Iris_L" if side < 0 else "_Iris_R"),
                           (0.010, 0.006, 0.010), eye, root, 12, 6)
        iris.location = (side * 0.056 * face_width, -0.121, 0.036)
        curve_tube(prefix + ("_UpperLid_L" if side < 0 else "_UpperLid_R"),
                   [(side * (0.083 if side > 0 else 0.030), -0.124, 0.038),
                    (side * 0.056, -0.126, 0.053),
                    (side * (0.030 if side > 0 else 0.083), -0.124, 0.038)],
                   0.0032, skin, root)
        curve_tube(prefix + ("_Brow_L" if side < 0 else "_Brow_R"),
                   [(side * (0.088 if side > 0 else 0.026), -0.116, 0.077),
                    (side * 0.056, -0.123, 0.086),
                    (side * (0.026 if side > 0 else 0.088), -0.116, 0.080)],
                   0.0042, hair, root)
    # Ears with an inner helix line.
    for side in (-1, 1):
        ear = sphere_mesh(prefix + ("_Ear_L" if side < 0 else "_Ear_R"),
                          (0.018, 0.017, 0.041), skin, root, 14, 8)
        ear.location = (side * 0.151 * face_width, 0.000, 0.005)
        ear.rotation_euler.y = side * 0.12
    # Mouth has two subdued lip curves and chin plane, no painted smile.
    curve_tube(prefix + "_UpperLip", [(-0.040, -0.124, -0.064), (0, -0.134, -0.058), (0.040, -0.124, -0.064)],
               0.0035, solid_material(prefix + "_LipMat", (0.28, 0.095, 0.07), 0.55), root)
    curve_tube(prefix + "_LowerLip", [(-0.035, -0.124, -0.070), (0, -0.132, -0.075), (0.035, -0.124, -0.070)],
               0.0030, bpy.data.materials[prefix + "_LipMat"], root)
    # Hair cap follows the skull and is kept close to the head silhouette.
    hair_rings = [
        (0.055, 0.144 * face_width, 0.118, 0, 0.012, 0.02),
        (0.112, 0.135 * face_width, 0.114, 0, 0.020, 0.01),
        (0.168, 0.096 * face_width, 0.082, 0, 0.028, 0.00),
        (0.194, 0.047 * face_width, 0.045, 0, 0.030, 0.00),
    ]
    cap = loft(prefix + "_Hair", hair_rings, 28, hair, root, phase=math.pi / 28)
    if hair_style == 1:
        for i in range(10):
            a = TAU * i / 10
            curl = sphere_mesh(prefix + f"_Curl_{i:02d}", (0.027, 0.025, 0.032), hair, root, 10, 6)
            curl.location = (0.095 * math.cos(a), 0.072 * math.sin(a) + 0.015, 0.151 + 0.018 * math.sin(a * 2))
    return root


def make_hand(prefix, skin, parent, open_hand=False):
    root = bpy.data.objects.new(prefix + "_HandRoot", None)
    bpy.context.collection.objects.link(root)
    root.parent = parent
    palm = loft(prefix + "_Palm", [(-0.042, 0.045, 0.024, 0, 0, 0.08),
                                    (0.028, 0.050, 0.027, 0, 0, 0.08),
                                    (0.058, 0.040, 0.024, 0, 0, 0.06)], 14, skin, root)
    # Five fingers. Closed hands curl around the trophy handle; open celebration hands fan slightly.
    lengths = (0.057, 0.078, 0.086, 0.079, 0.063)
    xpositions = (-0.046, -0.024, 0.0, 0.024, 0.046)
    for i, (length, x) in enumerate(zip(lengths, xpositions)):
        finger = tapered_segment(prefix + f"_Finger_{i}", 0.0105, 0.0080, skin, root, 0.02, 10)
        finger.scale.z = length
        finger.location = (x, -0.002, 0.060 + length * 0.5)
        finger.rotation_euler = (0.35 if open_hand else 1.02, 0.0, x * (3.0 if open_hand else 1.0))
    thumb = tapered_segment(prefix + "_Thumb", 0.013, 0.009, skin, root, 0.03, 10)
    thumb.scale.z = 0.055
    thumb.location = (0.056, -0.006, 0.005)
    thumb.rotation_euler = (0.62 if not open_hand else 0.15, 0.78, 0.28)
    return root


def make_shoe(prefix, material, sole, parent):
    # A tapered football boot with separate sole, heel cup, tongue, laces and studs.
    verts = [(-0.050, -0.130, -0.035), (0.050, -0.130, -0.035), (0.065, 0.090, -0.035), (-0.065, 0.090, -0.035),
             (-0.045, -0.145, 0.035), (0.045, -0.145, 0.035), (0.058, 0.070, 0.065), (-0.058, 0.070, 0.065),
             (-0.030, -0.185, 0.005), (0.030, -0.185, 0.005)]
    faces = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 9, 8, 4),
             (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    boot = mesh_object(prefix + "_BootUpper", verts, faces, material, parent)
    sole_obj = box_mesh(prefix + "_Sole", (0.135, 0.33, 0.025), sole, parent, 0.012)
    sole_obj.location = (0, -0.015, -0.044)
    tongue = box_mesh(prefix + "_Tongue", (0.072, 0.12, 0.018), material, parent, 0.008)
    tongue.location = (0, 0.040, 0.076)
    tongue.rotation_euler.x = -0.34
    for i in range(4):
        lace = curve_tube(prefix + f"_Lace_{i}", [(-0.032, 0.010 + i * 0.020, 0.081),
                                                   (0.032, 0.010 + i * 0.020, 0.081)],
                          0.0025, bpy.data.materials["Kit_Detail"], parent)
    for sx in (-1, 1):
        for sy in (-0.105, 0.055):
            stud = cylinder_mesh(prefix + f"_Stud_{sx}_{sy}", 0.010, 0.025, sole, parent, 10)
            stud.location = (sx * 0.040, sy, -0.064)
    return boot


def set_between(obj, start, end, frame=None, radius_scale=1.0):
    start, end = Vector(start), Vector(end)
    vec = end - start
    obj.location = (start + end) * 0.5
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(vec.normalized())
    obj.scale = (radius_scale, radius_scale, vec.length)
    if frame is not None:
        obj.keyframe_insert("location", frame=frame, group="Celebration")
        obj.keyframe_insert("rotation_quaternion", frame=frame, group="Celebration")
        obj.keyframe_insert("scale", frame=frame, group="Celebration")


def key_obj(obj, frame, location=None, rotation=None, scale=None):
    if location is not None:
        obj.location = location
        obj.keyframe_insert("location", frame=frame, group="Celebration")
    if rotation is not None:
        obj.rotation_mode = "XYZ"
        obj.rotation_euler = rotation
        obj.keyframe_insert("rotation_euler", frame=frame, group="Celebration")
    if scale is not None:
        obj.scale = scale
        obj.keyframe_insert("scale", frame=frame, group="Celebration")


def load_makehuman_source():
    """Load only the CC0 MakeHuman body surface, preserving original vertex indices."""
    if not (MH_OBJ_PATH.exists() and MH_SKEL_PATH.exists() and MH_WEIGHTS_PATH.exists()):
        raise FileNotFoundError("MakeHuman CC0 source assets are required beside this script")
    source_vertices = []
    source_uvs = []
    body_faces = []
    active_group = None
    with MH_OBJ_PATH.open("r", encoding="utf8", errors="ignore") as handle:
        for line in handle:
            if line.startswith("v "):
                _, x, y, z = line.split()[:4]
                source_vertices.append((float(x), float(y), float(z)))
            elif line.startswith("vt "):
                bits = line.split()
                source_uvs.append((float(bits[1]), float(bits[2])))
            elif line.startswith("g "):
                active_group = line.split(None, 1)[1].strip()
            elif line.startswith("f ") and active_group == "body":
                face = []
                for token in line.split()[1:]:
                    fields = token.split("/")
                    vi = int(fields[0]) - 1
                    ti = int(fields[1]) - 1 if len(fields) > 1 and fields[1] else None
                    face.append((vi, ti))
                body_faces.append(face)
    used = sorted({vi for face in body_faces for vi, _ in face})
    remap = {old: new for new, old in enumerate(used)}
    compact_faces = [[(remap[vi], ti) for vi, ti in face] for face in body_faces]
    skeleton = json.loads(MH_SKEL_PATH.read_text(encoding="utf8"))
    weights = json.loads(MH_WEIGHTS_PATH.read_text(encoding="utf8"))["weights"]
    return dict(vertices=source_vertices, uvs=source_uvs, faces=compact_faces,
                used=used, remap=remap, skeleton=skeleton, weights=weights)


def mh_transform(co, height, min_y, max_y):
    scale = height / (max_y - min_y)
    # MakeHuman uses Y-up and +Z front. Blender uses Z-up and -Y front,
    # which becomes glTF +Z after export_yup.
    return Vector((co[0] * scale, -co[2] * scale, (co[1] - min_y) * scale))


def mh_joint_position(source, joint_ref, height, min_y, max_y):
    indices = source["skeleton"]["joints"][joint_ref]
    if isinstance(indices, int):
        indices = [indices]
    result = Vector((0, 0, 0))
    for idx in indices:
        result += mh_transform(source["vertices"][idx], height, min_y, max_y)
    return result / max(1, len(indices))


def make_makehuman_rig(prefix, source, height, skin, parent, location, yaw=0.0):
    original = source["vertices"]
    min_y = min(v[1] for v in original)
    max_y = max(v[1] for v in original)
    verts = [mh_transform(original[old], height, min_y, max_y) for old in source["used"]]
    hscale = height / 1.80
    visible_faces = []
    visible_source_faces = []
    for face in source["faces"]:
        coords = [verts[vi] for vi, _ in face]
        zs = [c.z for c in coords]
        xs = [abs(c.x) for c in coords]
        covered = (
            (min(zs) > 1.01 * hscale and max(zs) < 1.52 * hscale and max(xs) < 0.49 * hscale)
            or (min(zs) > 0.76 * hscale and max(zs) < 1.10 * hscale and max(xs) < 0.33 * hscale)
            or (min(zs) > 0.11 * hscale and max(zs) < 0.43 * hscale and min(xs) > 0.03 * hscale)
            or max(zs) < 0.14 * hscale
            or (min(zs) > 1.665 * hscale and (sum(c.y for c in coords) / len(coords) > -0.04 or min(zs) > 1.735 * hscale))
        )
        if not covered:
            visible_faces.append([vi for vi, _ in face])
            visible_source_faces.append(face)
    faces = visible_faces
    mesh = bpy.data.meshes.new(prefix + "_AnatomyMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update(calc_edges=True)
    body = bpy.data.objects.new(prefix + "_Anatomy", mesh)
    bpy.context.collection.objects.link(body)
    mesh.materials.append(skin)
    uv_layer = mesh.uv_layers.new(name="MakeHumanUV")
    # from_pydata preserves polygon and loop order.
    loop_index = 0
    for face in visible_source_faces:
        for _, ti in face:
            uv_layer.data[loop_index].uv = source["uvs"][ti] if ti is not None else (0.0, 0.0)
            loop_index += 1
    smooth(body)

    arm_data = bpy.data.armatures.new(prefix + "_RigData")
    armature = bpy.data.objects.new(prefix + "_Rig", arm_data)
    bpy.context.collection.objects.link(armature)
    armature.parent = parent
    armature.location = location
    armature.rotation_euler.z = yaw
    armature.show_in_front = True
    armature["source"] = "MakeHuman hm08 CC0 (2020)"
    armature["license"] = "CC0"
    armature["source_url"] = "https://github.com/makehumancommunity/makehuman"

    bpy.context.view_layer.objects.active = armature
    armature.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    edit_bones = {}
    for name, spec in source["skeleton"]["bones"].items():
        eb = arm_data.edit_bones.new(name)
        eb.head = mh_joint_position(source, spec["head"], height, min_y, max_y)
        eb.tail = mh_joint_position(source, spec["tail"], height, min_y, max_y)
        if (eb.tail - eb.head).length < 0.001:
            eb.tail.z += 0.005
        edit_bones[name] = eb
    for name, spec in source["skeleton"]["bones"].items():
        parent_name = spec.get("parent")
        if parent_name in edit_bones:
            edit_bones[name].parent = edit_bones[parent_name]
            # Only connect exact shared joints; facial bones should remain offset.
            if (edit_bones[name].head - edit_bones[parent_name].tail).length < 0.0005:
                edit_bones[name].use_connect = True
    bpy.ops.object.mode_set(mode="OBJECT")

    body.parent = armature
    # Official MakeHuman weights are transferred by original vertex index.
    remap = source["remap"]
    for bone_name, entries in source["weights"].items():
        indices = []
        values = []
        for old_idx, weight in entries:
            new_idx = remap.get(old_idx)
            if new_idx is not None and weight > 0.0005:
                indices.append(new_idx)
                values.append(float(weight))
        if not indices:
            continue
        group = body.vertex_groups.new(name=bone_name)
        # VertexGroup.add takes one weight per call; batches by quantized weight keep generation quick.
        buckets = {}
        for idx, weight in zip(indices, values):
            buckets.setdefault(round(weight, 4), []).append(idx)
        for weight, batch in buckets.items():
            group.add(batch, weight, "REPLACE")

    # Moderate planar reduction preserves the face/hands while keeping five players web-friendly.
    dec = body.modifiers.new("Web_Triangle_Budget", "DECIMATE")
    dec.decimate_type = "COLLAPSE"
    dec.ratio = 0.72
    dec.use_collapse_triangulate = True
    bpy.context.view_layer.objects.active = body
    body.select_set(True)
    bpy.ops.object.modifier_apply(modifier=dec.name)
    modifier = body.modifiers.new("MakeHuman_Skin", "ARMATURE")
    modifier.object = armature
    modifier.use_deform_preserve_volume = True
    return armature, body, (min_y, max_y)


def bone_weight_object(obj, armature, bone_name):
    obj.parent = armature
    group = obj.vertex_groups.new(name=bone_name)
    group.add(list(range(len(obj.data.vertices))), 1.0, "REPLACE")
    modifier = obj.modifiers.new("GarmentSkin", "ARMATURE")
    modifier.object = armature
    modifier.use_deform_preserve_volume = True
    return obj


def make_mh_garment(name, source, height, armature, material, predicate, offset=0.008):
    """Extract a fitted garment from the anatomical surface and copy official rig weights."""
    original = source["vertices"]
    min_y = min(v[1] for v in original)
    max_y = max(v[1] for v in original)
    chosen = []
    for face in source["faces"]:
        old_ids = [source["used"][new_idx] for new_idx, _ in face]
        coords = [mh_transform(original[old], height, min_y, max_y) for old in old_ids]
        if predicate(coords):
            chosen.append((old_ids, [ti for _, ti in face], coords))
    used_old = sorted({old for face, _, _ in chosen for old in face})
    remap = {old: new for new, old in enumerate(used_old)}
    verts = []
    for old in used_old:
        co = mh_transform(original[old], height, min_y, max_y)
        # Offset from the body center while preserving garment hem height.
        radial = Vector((co.x, co.y, 0))
        if radial.length > 0.0001:
            co += radial.normalized() * offset
        verts.append(co)
    faces = [[remap[old] for old in old_ids] for old_ids, _, _ in chosen]
    obj = mesh_object(name, verts, faces, material)
    uv = obj.data.uv_layers.new(name="MakeHumanUV")
    loop_index = 0
    for _, tex_ids, _ in chosen:
        for ti in tex_ids:
            uv.data[loop_index].uv = source["uvs"][ti] if ti is not None else (0, 0)
            loop_index += 1
    for bone_name, entries in source["weights"].items():
        bucket = []
        weighted = []
        for old_idx, weight in entries:
            new_idx = remap.get(old_idx)
            if new_idx is not None and weight > 0.0005:
                weighted.append((new_idx, float(weight)))
        if not weighted:
            continue
        group = obj.vertex_groups.new(name=bone_name)
        batches = {}
        for idx, weight in weighted:
            batches.setdefault(round(weight, 4), []).append(idx)
        for weight, indices in batches.items():
            group.add(indices, weight, "REPLACE")
    obj.parent = armature
    modifier = obj.modifiers.new("GarmentSkin", "ARMATURE")
    modifier.object = armature
    modifier.use_deform_preserve_volume = True
    return obj


def make_mh_player(index, x, y, height, source, skin, shirt, mats, parent,
                   hair_style=0, central=False, yaw=0.0):
    prefix = f"Player_{index:02d}"
    armature, body, _ = make_makehuman_rig(prefix, source, height, skin, parent, (x, y, 0), yaw)
    armature["role"] = "captain" if central else "teammate"
    hscale = height / 1.80
    def jersey_region(coords):
        zs = [c.z for c in coords]
        xs = [abs(c.x) for c in coords]
        return min(zs) > 1.02 * hscale and max(zs) < 1.51 * hscale and max(xs) < 0.48 * hscale
    def shorts_region(coords):
        zs = [c.z for c in coords]
        return min(zs) > 0.77 * hscale and max(zs) < 1.09 * hscale and max(abs(c.x) for c in coords) < 0.32 * hscale
    def socks_region(coords):
        zs = [c.z for c in coords]
        return min(zs) > 0.12 * hscale and max(zs) < 0.42 * hscale and min(abs(c.x) for c in coords) > 0.035 * hscale
    def boot_region(coords):
        return max(c.z for c in coords) < 0.13 * hscale
    def hair_region(coords):
        zs = [c.z for c in coords]
        return min(zs) > 1.67 * hscale and (sum(c.y for c in coords) / len(coords) > -0.035 or min(zs) > 1.74 * hscale)

    make_mh_garment(prefix + "_Jersey", source, height, armature, shirt, jersey_region, 0.010)
    make_mh_garment(prefix + "_Shorts", source, height, armature, mats["black"], shorts_region, 0.012)
    make_mh_garment(prefix + "_Socks", source, height, armature, shirt, socks_region, 0.007)
    make_mh_garment(prefix + "_Boots", source, height, armature, mats["boot"], boot_region, 0.009)
    make_mh_garment(prefix + "_Hair", source, height, armature,
                    mats["hair_brown"] if index in (2, 4) else mats["hair_dark"], hair_region, 0.006)
    collar = torus(prefix + "_Collar", 0.078 * hscale, 0.006, mats["black"], armature, 28, 8)
    collar.scale.y = 0.72
    collar.location.z = 1.505 * hscale
    # Anatomically sized inset eyes; 24 mm wide, partly covered by the MakeHuman eyelids.
    for side in ("L", "R"):
        eye_bone = armature.data.bones.get(f"eye.{side}")
        if eye_bone:
            p = eye_bone.head_local
            eye = sphere_mesh(prefix + f"_Eye_{side}", (0.012, 0.007, 0.009), mats["eye_white"], None, 16, 8)
            eye.location = p
            bone_weight_object(eye, armature, f"eye.{side}")
            iris = sphere_mesh(prefix + f"_Iris_{side}", (0.0045, 0.002, 0.0045), mats["eye_brown"], None, 12, 6)
            iris.location = (p.x, p.y - 0.0065, p.z)
            bone_weight_object(iris, armature, f"eye.{side}")
    return dict(prefix=prefix, root=armature, body=body, central=central)


def add_ik(player, side, target_positions, parent):
    armature = player["root"]
    suffix = "L" if side < 0 else "R"
    wrist_name = f"wrist.{suffix}"
    wrist = armature.pose.bones.get(wrist_name)
    if wrist is None:
        raise RuntimeError(f"Missing MakeHuman bone {wrist_name}")
    target = bpy.data.objects.new(player["prefix"] + f"_HandTarget_{suffix}", None)
    bpy.context.collection.objects.link(target)
    target.parent = parent
    target.empty_display_type = "SPHERE"
    target.empty_display_size = 0.035
    pole = bpy.data.objects.new(player["prefix"] + f"_ElbowPole_{suffix}", None)
    bpy.context.collection.objects.link(pole)
    pole.parent = parent
    pole.empty_display_type = "CUBE"
    pole.empty_display_size = 0.035
    for frame, location in target_positions.items():
        key_obj(target, frame, location=location)
        # Pole stays forward and outside, producing an athletic rather than mechanical elbow line.
        root_loc = armature.location
        pole_loc = (root_loc.x + side * 0.55, root_loc.y - 0.55,
                    1.25 + (location[2] - 1.15) * 0.55)
        key_obj(pole, frame, location=pole_loc)
    constraint = wrist.constraints.new("IK")
    constraint.name = "Celebration_IK"
    constraint.target = target
    constraint.pole_target = pole
    constraint.chain_count = 5
    constraint.use_stretch = False
    constraint.pole_angle = math.radians(-90 if side < 0 else 90)
    # Keep every finger in a relaxed curl; the captain closes the grip further.
    curl = math.radians(42 if player["central"] else 10)
    for finger in range(1, 6):
        for joint in range(1, 4):
            pb = armature.pose.bones.get(f"finger{finger}-{joint}.{suffix}")
            if pb:
                pb.rotation_mode = "XYZ"
                pb.rotation_euler.x = curl if finger > 1 else curl * 0.72
                pb.keyframe_insert("rotation_euler", frame=0, group="Celebration")
                pb.keyframe_insert("rotation_euler", frame=120, group="Celebration")
    return target, pole


def animate_mh_players(players, team_root):
    for player in players:
        armature = player["root"]
        x, y, _ = armature.location
        if player["central"]:
            left = {0: (-0.235, -0.235, 1.10), 30: (-0.235, -0.235, 1.25),
                    72: (-0.235, -0.205, 1.75), 120: (-0.235, -0.180, 2.06)}
            right = {f: (-lx, ly, lz) for f, (lx, ly, lz) in left.items()}
            add_ik(player, -1, left, team_root)
            add_ik(player, 1, right, team_root)
        else:
            idx = int(player["prefix"].split("_")[-1])
            outer = -1 if idx in (1, 2) else 1
            for side in (-1, 1):
                raise_arm = side == outer
                targets = {}
                for frame, t in zip(FRAMES, (0.0, 0.25, 0.64, 1.0)):
                    if raise_arm:
                        targets[frame] = (x + side * (0.28 + 0.04 * t), y - 0.10,
                                          1.06 + 0.96 * t)
                    else:
                        targets[frame] = (x + side * (0.19 - 0.03 * t), y - 0.13,
                                          1.15 + 0.60 * t)
                add_ik(player, side, targets, team_root)
        # A small chest/head pitch adds emotion while the hips and planted feet stay fixed.
        for frame, angle in ((0, 0.0), (30, math.radians(-1.5)),
                             (72, math.radians(2.0)), (120, math.radians(-1.0))):
            for bone_name, factor in (("spine03", 0.55), ("spine04", 0.75), ("neck01", 0.45)):
                pb = armature.pose.bones.get(bone_name)
                if pb:
                    pb.rotation_mode = "XYZ"
                    pb.rotation_euler.x = angle * factor
                    pb.keyframe_insert("rotation_euler", frame=frame, group="Celebration")


def make_player(index, x, y, height, skin, shirt, mats, hair_style=0, central=False, yaw=0.0):
    prefix = f"Player_{index:02d}"
    root = bpy.data.objects.new(prefix, None)
    bpy.context.collection.objects.link(root)
    root.location = (x, y, 0)
    root.rotation_euler.z = yaw
    root["role"] = "captain" if central else "teammate"
    scale = height / 1.80

    body = bpy.data.objects.new(prefix + "_Body", None)
    bpy.context.collection.objects.link(body)
    body.parent = root
    body.scale = (scale, scale, scale)

    # Neck remains skin and is visibly narrower than both jaw and shoulders.
    neck = loft(prefix + "_Neck", [(-0.09, 0.065, 0.060, 0, 0, 0.03),
                                    (0.08, 0.072, 0.065, 0, 0, 0.03)], 18, skin, body)
    neck.location.z = 1.535
    # Under-shirt anatomical torso gives natural shoulder/chest volume.
    torso = loft(prefix + "_Torso", [(-0.28, 0.155, 0.105, 0, 0.018, 0.08),
                                      (-0.18, 0.170, 0.120, 0, 0.008, 0.10),
                                      (-0.02, 0.205, 0.135, 0, -0.008, 0.12),
                                      (0.14, 0.245, 0.145, 0, -0.014, 0.11),
                                      (0.24, 0.225, 0.132, 0, -0.006, 0.08)], 24, skin, body)
    torso.location.z = 1.29
    # Shirt shell with shaped armholes, loose hem and front fold ridges.
    kit = loft(prefix + "_Jersey", [(-0.29, 0.176, 0.126, 0, 0.015, 0.10),
                                     (-0.18, 0.188, 0.137, 0, 0.007, 0.11),
                                     (-0.02, 0.225, 0.151, 0, -0.012, 0.12),
                                     (0.14, 0.267, 0.157, 0, -0.015, 0.11),
                                     (0.225, 0.238, 0.145, 0, -0.004, 0.08)], 28, shirt, body)
    kit.location.z = 1.29
    # Collar and sleeve hems read as garment construction at the target camera distance.
    collar = torus(prefix + "_Collar", 0.077, 0.008, mats["black"], body, 28, 8)
    collar.scale.y = 0.78
    collar.location.z = 1.505
    for dx in (-0.172, 0.172):
        fold = curve_tube(prefix + ("_Fold_L" if dx < 0 else "_Fold_R"),
                          [(dx * 0.35, -0.142, 1.475), (dx * 0.7, -0.153, 1.30), (dx, -0.132, 1.05)],
                          0.0028, mats["black"], body)

    # Shorts form a cloth shell over pelvis and upper thigh, with fly and hem seams.
    shorts = loft(prefix + "_Shorts", [(-0.22, 0.178, 0.125, 0, 0.006, 0.08),
                                        (0.02, 0.205, 0.143, 0, 0.000, 0.10),
                                        (0.16, 0.185, 0.132, 0, 0.002, 0.08)], 24, mats["black"], body)
    shorts.location.z = 0.93
    curve_tube(prefix + "_ShortsWaist", [(-0.188, -0.120, 1.105), (0, -0.139, 1.115), (0.188, -0.120, 1.105)],
               0.005, mats["white"], body)
    curve_tube(prefix + "_ShortsFly", [(0, -0.143, 1.105), (0.006, -0.151, 0.96)],
               0.003, mats["white"], body)

    # Legs are anatomical lofts with thigh adductors, patella, calf bellies and ankle taper.
    leg_objs = []
    for side in (-1, 1):
        sx = side * 0.105
        thigh = tapered_segment(prefix + ("_Thigh_L" if side < 0 else "_Thigh_R"),
                                0.105, 0.079, skin, body, 0.16, 18)
        set_between(thigh, (sx, 0.008, 0.99), (sx * 1.06, 0.002, 0.56))
        knee = sphere_mesh(prefix + ("_Knee_L" if side < 0 else "_Knee_R"),
                           (0.072, 0.069, 0.075), skin, body, 18, 10)
        knee.location = (sx * 1.06, -0.006, 0.545)
        calf = tapered_segment(prefix + ("_Calf_L" if side < 0 else "_Calf_R"),
                               0.070, 0.046, skin, body, 0.22, 18)
        set_between(calf, (sx * 1.06, 0.002, 0.515), (sx * 1.03, -0.002, 0.18))
        sock = tapered_segment(prefix + ("_Sock_L" if side < 0 else "_Sock_R"),
                               0.058, 0.047, shirt, body, 0.04, 16)
        set_between(sock, (sx * 1.03, 0.0, 0.39), (sx * 1.03, 0.0, 0.12))
        boot = make_shoe(prefix + ("_L" if side < 0 else "_R"), mats["boot"], mats["sole"], body)
        boot.location = (sx * 1.03, -0.025, 0.065)
        boot.rotation_euler.z = side * 0.035

    head = make_head(prefix, skin, mats["hair_brown"] if index in (2, 4) else mats["hair_dark"],
                     mats["eye_brown"], body, 1.675, 0.94 + index * 0.015, hair_style)

    # Arms are separate anatomical meshes animated in world space relative to Body.
    arms = {}
    for side in (-1, 1):
        tag = "L" if side < 0 else "R"
        upper = tapered_segment(prefix + f"_UpperArm_{tag}", 0.072, 0.058, skin, body, 0.13, 18)
        fore = tapered_segment(prefix + f"_Forearm_{tag}", 0.060, 0.044, skin, body, 0.16, 18)
        hand = make_hand(prefix + f"_{tag}", skin, body, open_hand=not central)
        sleeve = tapered_segment(prefix + f"_Sleeve_{tag}", 0.087, 0.076, shirt, body, 0.03, 18)
        arms[side] = dict(upper=upper, fore=fore, hand=hand, sleeve=sleeve)

    player = dict(prefix=prefix, root=root, body=body, scale=scale, arms=arms, central=central)
    return player


def pose_arm(player, side, shoulder, elbow, wrist, frame, open_rotation=(0, 0, 0)):
    parts = player["arms"][side]
    set_between(parts["upper"], shoulder, elbow, frame)
    # sleeve occupies the top 33% of the upper arm and overlaps skin cleanly.
    sleeve_end = Vector(shoulder).lerp(Vector(elbow), 0.35)
    set_between(parts["sleeve"], shoulder, sleeve_end, frame, 1.03)
    set_between(parts["fore"], elbow, wrist, frame)
    hand = parts["hand"]
    hand.location = wrist
    hand.rotation_mode = "XYZ"
    hand.rotation_euler = open_rotation
    hand.scale = (1, 1, 1)
    hand.keyframe_insert("location", frame=frame, group="Celebration")
    hand.keyframe_insert("rotation_euler", frame=frame, group="Celebration")
    hand.keyframe_insert("scale", frame=frame, group="Celebration")


def animate_players(players):
    for p in players:
        sc = p["scale"]
        body = p["body"]
        # Athletic celebration bounce happens above the hips; feet remain planted.
        for frame, tilt, lift in ((0, 0.0, 0.0), (30, -0.018, 0.010), (72, 0.025, 0.025), (120, -0.012, 0.018)):
            key_obj(body, frame, location=(0, 0, lift), rotation=(tilt, 0, 0), scale=(sc, sc, sc))

        if p["central"]:
            poses = {
                0: ((-0.235, -0.015, 1.47), (-0.305, -0.15, 1.31), (-0.205, -0.235, 1.25),
                    (0.235, -0.015, 1.47), (0.305, -0.15, 1.31), (0.205, -0.235, 1.25)),
                30: ((-0.235, -0.015, 1.48), (-0.325, -0.16, 1.45), (-0.215, -0.235, 1.43),
                     (0.235, -0.015, 1.48), (0.325, -0.16, 1.45), (0.215, -0.235, 1.43)),
                72: ((-0.235, -0.015, 1.49), (-0.350, -0.13, 1.72), (-0.220, -0.205, 1.84),
                     (0.235, -0.015, 1.49), (0.350, -0.13, 1.72), (0.220, -0.205, 1.84)),
                120: ((-0.235, -0.015, 1.49), (-0.315, -0.08, 1.86), (-0.220, -0.180, 2.075),
                      (0.235, -0.015, 1.49), (0.315, -0.08, 1.86), (0.220, -0.180, 2.075)),
            }
            for frame, pose in poses.items():
                pose_arm(p, -1, pose[0], pose[1], pose[2], frame, (math.radians(78), 0, math.radians(-12)))
                pose_arm(p, 1, pose[3], pose[4], pose[5], frame, (math.radians(78), 0, math.radians(12)))
        else:
            idx = int(p["prefix"].split("_")[-1])
            # Alternating silhouettes: one arm embraces the group, the other rises in celebration.
            outer = -1 if idx in (1, 2) else 1
            inner = -outer
            sign = outer
            for frame, t in zip(FRAMES, (0.0, 0.25, 0.64, 1.0)):
                sh_outer = (sign * 0.235, -0.005, 1.46)
                elbow_outer = (sign * (0.34 + 0.07 * t), -0.05 - 0.05 * t, 1.25 + 0.50 * t)
                wrist_outer = (sign * (0.29 + 0.05 * t), -0.10 - 0.05 * t, 1.05 + 0.94 * t)
                pose_arm(p, outer, sh_outer, elbow_outer, wrist_outer, frame,
                         (math.radians(12 + 18 * t), 0, sign * math.radians(15)))
                sh_inner = (-sign * 0.235, -0.005, 1.46)
                elbow_inner = (-sign * (0.31 - 0.02 * t), -0.08, 1.28 + 0.30 * t)
                wrist_inner = (-sign * (0.20 - 0.03 * t), -0.13, 1.16 + 0.55 * t)
                pose_arm(p, inner, sh_inner, elbow_inner, wrist_inner, frame,
                         (math.radians(20 + 16 * t), 0, -sign * math.radians(12)))


def make_trophy(mats):
    root = bpy.data.objects.new("TrophyRoot", None)
    bpy.context.collection.objects.link(root)
    root["animation_anchor"] = True
    root.scale = (0.78, 0.78, 0.78)
    # Cup bowl from a refined revolution profile, open at the top.
    profile = [(-0.02, 0.078), (0.01, 0.086), (0.05, 0.112), (0.10, 0.148),
               (0.16, 0.184), (0.22, 0.210), (0.28, 0.224), (0.325, 0.222),
               (0.35, 0.212)]
    bowl = loft("Trophy_Cup", [(z, r, r, 0, 0, 0) for z, r in profile], 36, mats["gold"], root, caps=False)
    bowl.location.z = 0.16
    lip = torus("Trophy_Lip", 0.207, 0.012, mats["gold"], root, 36, 10)
    lip.location.z = 0.50
    # A dark inner bowl at the open rim gives the cup physical depth in glTF and render.
    inner = loft("Trophy_Inner", [(0.24, 0.175, 0.175, 0, 0, 0),
                                   (0.31, 0.198, 0.198, 0, 0, 0),
                                   (0.343, 0.199, 0.199, 0, 0, 0)],
                 36, mats["gold_dark"], root, caps=False)
    inner.location.z = 0.16
    stem = loft("Trophy_Stem", [(-0.12, 0.085, 0.085, 0, 0, 0),
                                (0.04, 0.045, 0.045, 0, 0, 0),
                                (0.15, 0.075, 0.075, 0, 0, 0)], 24, mats["gold"], root)
    base = cylinder_mesh("Trophy_Base", 0.135, 0.08, mats["gold_dark"], root, 28)
    base.location.z = -0.16
    plaque = box_mesh("Trophy_Plaque", (0.13, 0.012, 0.045), mats["gold"], root, 0.006)
    plaque.location = (0, -0.136, -0.16)
    for side in (-1, 1):
        handle = curve_tube("Trophy_Handle_L" if side < 0 else "Trophy_Handle_R",
                            [(side * 0.18, 0, 0.42), (side * 0.30, 0, 0.34),
                             (side * 0.30, 0, 0.20), (side * 0.18, 0, 0.12)],
                            0.017, mats["gold"], root)
    poses = {
        0: ((0, -0.245, 0.90), (math.radians(-5), 0, 0)),
        30: ((0, -0.245, 1.05), (math.radians(-3), 0, 0)),
        72: ((0, -0.215, 1.55), (math.radians(1), 0, 0)),
        120: ((0, -0.190, 1.86), (math.radians(3), 0, 0)),
    }
    for frame, (loc, rot) in poses.items():
        key_obj(root, frame, loc, rot)
    return root


def stadium_environment(mats):
    env = bpy.data.objects.new("Preview_Stadium", None)
    bpy.context.collection.objects.link(env)
    env.hide_render = False
    # Ground plane and tier bands are render-only context and excluded from GLB export.
    ground = cylinder_mesh("Preview_Pitch", 8.0, 0.035, mats["pitch"], env, 96)
    ground.location.z = -0.035
    # Three low tiers live entirely behind the team. Full rings would cross the camera
    # sightline and obscure the players at this 6.3 m full-body framing.
    for number, (z, width, depth) in enumerate(((0.54, 9.0, 0.50), (1.05, 9.8, 0.58), (1.60, 10.6, 0.66))):
        tier = box_mesh(f"Preview_Stand_{number}", (width, depth, 0.34), mats["stadium"], env, 0.08)
        tier.location = (0, 3.15 + number * 0.34, z)
    # Stadium light points, blurred by depth of field.
    emissive = solid_material("Preview_Stadium_Lights", (0.9, 0.83, 0.65), 0.25)
    bsdf = emissive.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Emission Color"].default_value = (1.0, 0.82, 0.60, 1)
    bsdf.inputs["Emission Strength"].default_value = 4.0
    for i in range(28):
        lamp = sphere_mesh(f"Preview_StadiumLamp_{i:02d}", (0.033, 0.033, 0.033), emissive, env, 8, 5)
        lamp.location = (-4.4 + i * 8.8 / 27, 3.55, 2.42 + 0.08 * math.sin(i * 1.7))
    return env


def setup_camera_lights():
    cam_data = bpy.data.cameras.new("PreviewCamera")
    camera = bpy.data.objects.new("PreviewCamera", cam_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    cam_data.lens = 50.0
    cam_data.sensor_width = 36
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 6.4
    cam_data.dof.aperture_fstop = 4.0
    camera.location = (0.05, -6.35, 1.43)
    target = Vector((0, 0.05, 1.24))
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()

    def area(name, loc, energy, color, size):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.color = color
        data.shape = "DISK"
        data.size = size
        obj = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(obj)
        obj.location = loc
        obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()
        return obj

    area("Preview_Key_Warm", (-3.2, -3.6, 4.8), 1250, (1.0, 0.77, 0.58), 3.2)
    area("Preview_Fill_Sage", (3.5, -1.8, 3.0), 850, (0.36, 0.65, 0.52), 2.8)
    area("Preview_Rim", (0.8, 3.4, 4.5), 1450, (0.53, 0.68, 0.61), 2.4)
    return camera


def set_interpolation():
    for obj in bpy.data.objects:
        if obj.animation_data and obj.animation_data.action:
            for fcurve in obj.animation_data.action.fcurves:
                for point in fcurve.keyframe_points:
                    point.interpolation = "BEZIER"
                    point.easing = "AUTO"


def render_frame(frame, path):
    scene = bpy.context.scene
    scene.frame_set(frame)
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


def export_glb(team_root_objects):
    export_tmp = BLENDER_DIR / "gltf-temp"
    export_tmp.mkdir(parents=True, exist_ok=True)
    tempfile.tempdir = str(export_tmp)
    os.environ["TEMP"] = str(export_tmp)
    os.environ["TMP"] = str(export_tmp)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in team_root_objects:
        obj.select_set(True)
        for child in obj.children_recursive:
            child.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=False,
        export_materials="EXPORT",
        export_texcoords=True,
        export_normals=True,
        export_tangents=True,
        export_attributes=False,
        export_cameras=False,
        export_lights=False,
        export_skins=False,
        export_morph=False,
        export_animations=True,
        export_animation_mode="SCENE",
        export_nla_strips_merged_animation_name="Celebration",
        export_anim_scene_split_object=False,
        export_frame_range=True,
        export_frame_step=1,
        export_optimize_animation_size=True,
        export_optimize_animation_keep_anim_object=True,
        export_bake_animation=False,
    )


def main():
    clear_scene()
    scene = bpy.context.scene
    scene.name = "Celebration"
    scene.frame_start = 0
    scene.frame_end = 120
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 65
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    scene.render.image_settings.color_depth = "8"
    scene.render.fps = FPS
    scene.render.fps_base = 1.0
    scene.world.color = (0.004, 0.007, 0.009)
    world = scene.world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.003, 0.008, 0.010, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.12
    scene.view_settings.look = "AgX - Medium High Contrast"

    images = create_textures()
    mats = make_materials(images)
    mh_source = load_makehuman_source()

    team_root = bpy.data.objects.new("TeamCelebrationRoot", None)
    bpy.context.collection.objects.link(team_root)
    team_root["front_axis_gltf"] = "+Z"
    team_root["ground_origin"] = True
    team_root["animation_clip"] = "Celebration"

    specs = [
        (1, -1.42, 0.29, 1.83, "skin_deep", "sage", 1, math.radians(-7)),
        (2, -0.72, 0.18, 1.76, "skin_warm", "black", 0, math.radians(-3)),
        (0, 0.00, -0.18, 1.82, "skin_olive", "sage", 1, 0.0),
        (3, 0.72, 0.20, 1.79, "skin_deep", "black", 0, math.radians(3)),
        (4, 1.42, 0.32, 1.85, "skin_warm", "sage", 1, math.radians(7)),
    ]
    players = []
    for idx, x, y, height, skin_key, shirt_key, hair_style, yaw in specs:
        p = make_mh_player(idx, x, y, height, mh_source, mats[skin_key], mats[shirt_key], mats,
                           team_root, hair_style=hair_style, central=(idx == 0), yaw=yaw)
        players.append(p)

    animate_mh_players(players, team_root)
    trophy = make_trophy(mats)
    trophy.parent = team_root
    set_interpolation()
    preview_env = stadium_environment(mats)
    setup_camera_lights()

    # Save the complete authoring scene first; images are packed into the .blend.
    for image in images.values():
        try:
            image.pack()
        except RuntimeError:
            pass
    bpy.context.preferences.filepaths.save_version = 0
    scene.frame_set(0)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))

    render_frame(0, START_PATH)
    render_frame(120, END_PATH)
    render_frame(0, POSTER_PNG)
    # Blender supports WEBP as an image output in 4.4. Keep PNG as the source fallback.
    try:
        scene.render.image_settings.file_format = "WEBP"
        scene.render.image_settings.color_mode = "RGBA"
        scene.render.filepath = str(POSTER_WEBP)
        scene.frame_set(0)
        bpy.ops.render.render(write_still=True)
    except Exception as exc:
        print("WEBP_RENDER_SKIPPED", repr(exc))
        scene.render.image_settings.file_format = "PNG"

    # Preview environment, camera and lights stay in the .blend but are excluded from GLB selection.
    export_glb([team_root])
    scene.frame_set(0)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    print("TEAM_CELEBRATION_EXPORT_COMPLETE")
    print("BLEND", BLEND_PATH)
    print("GLB", GLB_PATH)
    print("START", START_PATH)
    print("END", END_PATH)


if __name__ == "__main__":
    main()
