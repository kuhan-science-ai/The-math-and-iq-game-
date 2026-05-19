# Math Genius 3D Asset Pack

Generated with Blender 5.1 from the provided visual reference.

Important note: these are separate procedural 3D assets inspired by the single supplied image. A single 2D image cannot be converted into a mathematically identical 3D model because hidden depth, rear surfaces, exact topology, and original material node data are not present in the image.

## Assets

Each asset is exported independently with its own centered origin/pivot:

- `math_genius_badge`
- `ruby_shard`
- `amethyst_shard`
- `sapphire_shard`
- `emerald_shard`
- `topaz_shard`

## Folders

- `exports/high`: higher-detail versions
- `exports/low`: lower-detail game-ready versions
- `previews`: transparent PNG previews
- `scripts/generate_assets.py`: Blender generation/export script

## Formats

Every asset includes:

- `.glb`
- `.fbx`
- `.obj`
- `.mtl`
- `.blend`

## Runtime Notes

- GLB is recommended for web viewers, Three.js, React Three Fiber, Babylon.js, and Godot.
- FBX can be imported into Unity and Unreal.
- OBJ is included for compatibility, but GLB/FBX preserve materials more reliably.
- Gem materials use transparency/emission settings for crystal and glow appearance.
- Gold materials are metallic and reflective.
