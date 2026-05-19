import math
import os
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
EXPORT_DIR = ROOT / "exports"
PREVIEW_DIR = ROOT / "previews"

GOLD = (1.0, 0.58, 0.08, 1.0)
DARK = (0.015, 0.018, 0.022, 1.0)


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    bpy.context.scene.render.engine = "CYCLES"
    bpy.context.scene.cycles.samples = 96
    bpy.context.scene.view_settings.view_transform = "Filmic"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.unit_settings.system = "METRIC"


def material(name, color, metallic=0.0, roughness=0.25, alpha=1.0, transmission=0.0, emission=None, strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (color[0], color[1], color[2], alpha)
        bsdf.inputs["Alpha"].default_value = alpha
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = transmission
        if "Alpha" in bsdf.inputs:
            mat.blend_method = "BLEND"
            mat.use_screen_refraction = True
        if emission and "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission
            bsdf.inputs["Emission Strength"].default_value = strength
    return mat


mat_gold = None
mat_dark = None


def init_materials():
    global mat_gold, mat_dark
    mat_gold = material("reflective_gold", GOLD, metallic=1.0, roughness=0.16)
    mat_dark = material("black_enamel", DARK, metallic=0.1, roughness=0.34)


def add_light_rig():
    bpy.ops.object.light_add(type="AREA", location=(0, -4, 5))
    key = bpy.context.object
    key.name = "cinematic_key_light"
    key.data.energy = 650
    key.data.size = 5
    bpy.ops.object.light_add(type="POINT", location=(-3, 3, 2))
    rim = bpy.context.object
    rim.name = "colored_rim_light"
    rim.data.energy = 160
    rim.data.color = (0.35, 0.55, 1.0)
    bpy.ops.object.camera_add(location=(0, -7, 3.2), rotation=(math.radians(64), 0, 0))
    bpy.context.scene.camera = bpy.context.object
    bpy.context.object.data.lens = 70


def set_origin_center(objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")


def shield_mesh(name, scale=1.0, depth=0.12, mat=None):
    pts = [
        (-2.15, 0.9), (-1.55, 1.45), (-0.85, 1.7), (0, 2.1),
        (0.85, 1.7), (1.55, 1.45), (2.15, 0.9), (1.78, -0.9),
        (0.0, -2.05), (-1.78, -0.9)
    ]
    verts = [(x * scale, 0, y * scale) for x, y in pts] + [(x * scale, depth, y * scale) for x, y in pts]
    faces = [tuple(range(len(pts))), tuple(range(len(pts), len(pts) * 2))]
    n = len(pts)
    for i in range(n):
        faces.append((i, (i + 1) % n, (i + 1) % n + n, i + n))
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    bevel = obj.modifiers.new("soft_bevel", "BEVEL")
    bevel.width = 0.045 * scale
    bevel.segments = 3
    obj.modifiers.new("weighted_normals", "WEIGHTED_NORMAL")
    return obj


def add_text(name, text, loc, size, extrude=0.055):
    font_curve = bpy.data.curves.new(name, "FONT")
    font_curve.body = text
    font_curve.align_x = "CENTER"
    font_curve.align_y = "CENTER"
    font_curve.size = size
    font_curve.extrude = extrude
    font_curve.bevel_depth = extrude * 0.16
    obj = bpy.data.objects.new(name, font_curve)
    obj.location = loc
    obj.rotation_euler[0] = math.radians(90)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_gold)
    return obj


def add_star(name, loc, radius=0.22, depth=0.05):
    pts = []
    for i in range(10):
        r = radius if i % 2 == 0 else radius * 0.42
        a = math.radians(90 + i * 36)
        pts.append((math.cos(a) * r, math.sin(a) * r))
    verts = [(x, -depth, y) for x, y in pts] + [(x, depth, y) for x, y in pts]
    n = len(pts)
    faces = [tuple(range(n)), tuple(range(n, 2 * n))]
    for i in range(n):
        faces.append((i, (i + 1) % n, (i + 1) % n + n, i + n))
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.data.materials.append(mat_gold)
    obj.modifiers.new("star_bevel", "BEVEL").width = radius * 0.05
    obj.modifiers.new("weighted_normals", "WEIGHTED_NORMAL")
    return obj


def add_leaf(name, loc, rot, scale):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat_gold)
    return obj


def build_badge(detail="high"):
    reset_scene()
    init_materials()
    add_light_rig()
    objects = []
    objects.append(shield_mesh("math_genius_black_shield", 1.0, 0.10, mat_dark))
    objects.append(shield_mesh("math_genius_gold_outer_frame", 1.12, 0.08, mat_gold))
    objects[-1].location.y = -0.08
    objects.append(shield_mesh("math_genius_inner_gold_frame", 0.94, 0.07, mat_gold))
    objects[-1].location.y = -0.14
    objects += [
        add_text("math_text", "MATH", (0, -0.22, 0.38), 0.72, 0.07),
        add_text("genius_text", "GENIUS", (0, -0.22, -0.25), 0.38, 0.052),
        add_star("top_star", (0, -0.08, 2.36), 0.25, 0.05),
        add_star("bottom_star", (0, -0.1, -1.0), 0.16, 0.04),
    ]
    for i in range(10):
        x = -0.45 + i * 0.1
        z = 1.26 + 0.14 * math.sin(i * 1.7)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32 if detail == "high" else 12, ring_count=16 if detail == "high" else 8, location=(x, -0.18, z))
        lobe = bpy.context.object
        lobe.name = f"gold_brain_lobe_{i:02d}"
        lobe.scale = (0.13, 0.08, 0.11)
        lobe.data.materials.append(mat_gold)
        objects.append(lobe)
    for side in [-1, 1]:
        for i in range(7):
            objects.append(add_leaf(
                f"laurel_{side}_{i}",
                (side * (1.35 + i * 0.14), -0.05, -1.25 + i * 0.18),
                (0, 0, math.radians(side * (25 + i * 4))),
                (0.08, 0.02, 0.22)
            ))
    for i in range(9):
        angle = -52 + i * 13
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.18, 2.1))
        ray = bpy.context.object
        ray.name = f"gold_light_ray_{i:02d}"
        ray.dimensions = (0.025, 0.025, 0.85)
        ray.rotation_euler[1] = math.radians(angle)
        ray.data.materials.append(mat_gold)
        objects.append(ray)
    set_origin_center(objects)
    return objects


GEMS = {
    "ruby": ((1.0, 0.03, 0.02, 0.68), (1.0, 0.12, 0.08, 1.0)),
    "amethyst": ((0.55, 0.1, 1.0, 0.66), (0.8, 0.25, 1.0, 1.0)),
    "sapphire": ((0.02, 0.28, 1.0, 0.66), (0.1, 0.48, 1.0, 1.0)),
    "emerald": ((0.02, 0.9, 0.42, 0.66), (0.08, 1.0, 0.55, 1.0)),
    "topaz": ((1.0, 0.62, 0.02, 0.68), (1.0, 0.78, 0.08, 1.0)),
}


def crystal_mesh(name, sides=10, height=2.6, radius=0.55, mat=None):
    rings = [
        (height / 2, 0.0),
        (height * 0.27, radius * 0.82),
        (0.0, radius),
        (-height * 0.28, radius * 0.72),
        (-height / 2, 0.0),
    ]
    verts = []
    for z, r in rings:
        if r == 0:
            verts.append((0, 0, z))
        else:
            for i in range(sides):
                a = 2 * math.pi * i / sides + (math.pi / sides if z == 0 else 0)
                verts.append((math.cos(a) * r, math.sin(a) * r * 0.72, z))
    top = 0
    r1 = 1
    r2 = r1 + sides
    r3 = r2 + sides
    bottom = r3 + sides
    faces = []
    for i in range(sides):
        j = (i + 1) % sides
        faces.append((top, r1 + i, r1 + j))
        faces.append((r1 + i, r2 + i, r2 + j, r1 + j))
        faces.append((r2 + i, r3 + i, r3 + j, r2 + j))
        faces.append((r3 + i, bottom, r3 + j))
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    obj.modifiers.new("weighted_normals", "WEIGHTED_NORMAL")
    return obj


def build_gem(gem, detail="high"):
    reset_scene()
    init_materials()
    add_light_rig()
    color, emission = GEMS[gem]
    gem_mat = material(f"{gem}_transparent_crystal", color, roughness=0.035, alpha=color[3], transmission=0.55, emission=emission, strength=0.12)
    glow_mat = material(f"{gem}_emissive_glow", emission, roughness=0.3, alpha=0.75, emission=emission, strength=1.2)
    objects = []
    sides = 14 if detail == "high" else 8
    crystal = crystal_mesh(f"{gem}_crystal_body", sides=sides, mat=gem_mat)
    crystal.location.z = 1.38
    objects.append(crystal)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64 if detail == "high" else 24, radius=0.7, depth=0.18, location=(0, 0, -0.03))
    top = bpy.context.object
    top.name = f"{gem}_display_base_top"
    top.data.materials.append(mat_gold)
    objects.append(top)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64 if detail == "high" else 24, radius=0.82, depth=0.28, location=(0, 0, -0.24))
    base = bpy.context.object
    base.name = f"{gem}_display_base_black_gold"
    base.data.materials.append(mat_dark)
    objects.append(base)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.62, minor_radius=0.035, major_segments=64 if detail == "high" else 24, minor_segments=8, location=(0, 0, 0.1))
    ring = bpy.context.object
    ring.name = f"{gem}_gold_base_ring"
    ring.data.materials.append(mat_gold)
    objects.append(ring)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48 if detail == "high" else 20, radius=0.38, depth=0.02, location=(0, 0, 0.09))
    glow = bpy.context.object
    glow.name = f"{gem}_colored_light_pad"
    glow.data.materials.append(glow_mat)
    objects.append(glow)
    text = add_text(f"{gem}_base_label", gem.upper(), (0, -0.76, -0.24), 0.18, 0.018)
    text.rotation_euler[0] = math.radians(72)
    objects.append(text)
    set_origin_center(objects)
    return objects


def export_asset(asset_name, build_fn, detail):
    objects = build_fn(detail)
    base = EXPORT_DIR / detail
    base.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(filepath=str(base / f"{asset_name}.glb"), export_format="GLB", use_selection=True)
    bpy.ops.wm.obj_export(filepath=str(base / f"{asset_name}.obj"), export_selected_objects=True, export_materials=True)
    bpy.ops.export_scene.fbx(filepath=str(base / f"{asset_name}.fbx"), use_selection=True, apply_unit_scale=True, bake_space_transform=False)
    bpy.ops.wm.save_as_mainfile(filepath=str(base / f"{asset_name}.blend"))
    bpy.context.scene.render.filepath = str(PREVIEW_DIR / f"{asset_name}_{detail}.png")
    bpy.ops.render.render(write_still=True)


def main():
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    for detail in ["high", "low"]:
        export_asset("math_genius_badge", build_badge, detail)
        for gem in GEMS:
            export_asset(f"{gem}_shard", lambda d, g=gem: build_gem(g, d), detail)


if __name__ == "__main__":
    main()
