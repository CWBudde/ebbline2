# Ebbline art style

Ebbline is an original game. Its images are generated for this project from the prompts in
[direction.md](direction.md); nothing here refers to, or imitates, another game's art, names or logos.

A full prompt is the **Preamble** block, a blank line, the block of one section below (**Sprites**,
**Terrain**, **Illustration** or **Keyart**), a blank line and the entry from `direction.md`.

## Palette

| Role | Colour | Used for |
| --- | --- | --- |
| Background | `#070d10` | space behind the map, page background |
| Plate | `#14222a`, rim `#33505c` | machine hulls and hexagonal base plates |
| Grid cyan | `#5fe3ff` | lander, pylon, trunk, links |
| Energy amber | `#ffc857` | tap, cell, pump, lodes, energy packets |
| Weapon orange | `#ff7a45` | lance, lobber, interceptor |
| Utility lime | `#b6f36b` | baffle, grader |
| Cap white | `#f4f7f8` | cap |
| Silt magenta | `#ff3fa4` | silt, vents, spitters |
| Ground | `#1c1611` low, `#3d2c20`, `#7a5a3c`, `#c9a878` high | earthy brown height bands, tinted in the terrain bake |

## Map geometry

The map is a grid of pointy-top hexagons: a corner points up and a corner points down, the left and right
sides are vertical and flat. In units where neighbouring tile centres are 1 apart, a tile is 1 wide (flat
side to flat side) and 2/√3 ≈ 1.155 tall (corner to corner); rows are √3/2 apart and every second row is
shifted half a tile. Every machine stands on a pointy-top hexagonal base plate that is its whole
footprint, so it fills its tile. The lander covers its tile and the six around it: a flower of seven
hexagons, 3 tiles wide and about 2.89 tiles tall, with a scalloped outline (two hexagons on the top and
bottom rows, three in the middle row). The natural features (vents, spitters, lodes) have no plate.

## Preamble

```text
Art for "Ebbline", an original science-fiction strategy game. A survey crew has landed on a dead colony
world of dark earthy brown rock, where a glowing magenta fluid called silt wells up from vents and floods
the lowlands. The crew's machines are hard-surface survey and mining equipment: compact, functional,
slightly worn, built from dark gunmetal plates (#14222a) with lighter steel-blue rims and edges
(#33505c), a few bolts and panel lines, and exactly one glowing accent colour per machine.
Fixed palette: grid cyan #5fe3ff, energy amber #ffc857, weapon orange #ff7a45, utility lime #b6f36b,
cap white #f4f7f8, silt magenta #ff3fa4, deep background #070d10.
Clean painted game-art rendering with crisp edges and soft shading, light from the upper left.
No text, no letters, no numbers, no logos, no watermark, no signature, no frame, no user interface.
Original designs only: do not imitate any existing game, film or brand.
```

## Sprites

```text
This image is a sprite sheet of map pieces for a top-down game.
View: strictly top-down orthographic, the camera looks straight down, no perspective, no horizon, no
three-quarter view, no visible side walls. Light from the upper left: upper-left edges lighter,
lower-right edges darker.
Each piece is shown at 24 pixels in the game, so it must read as an icon: one bold, simple silhouette,
a few large shapes, thick clear edges, strong contrast between the dark hull and the glowing accent.
No fine detail, no thin wires, no small greebles, no texture noise.
The map is made of hexagonal tiles in POINTY-TOP orientation. Every machine is built on a base plate
shaped as a regular hexagon in that orientation: one corner points straight up, one corner points
straight down, and the left and right sides are vertical straight edges. The plate is taller than wide
(width : height = 87 : 100). Never a flat-top hexagon with a flat edge on top, never a square, octagon
or circle as the footprint. All plates on a sheet have the same orientation and the same size, and
every part of a machine stays on its plate.
Background: fully transparent (alpha zero) everywhere outside the objects. No ground patch and no
floor around them (a machine's hexagonal base plate is part of the machine), no halo, no glow
spilling outside the object, no checkerboard, no cast shadow, no grid lines, no labels.
Each object sits centred in its own cell with a clear transparent margin on every side; objects never
touch or overlap a neighbouring cell.
```

## Terrain

```text
This image is a seamless, tileable ground material for a top-down game, seen from straight above.
It repeats in both directions: the left edge continues into the right edge and the top edge into the
bottom edge without any visible seam.
Flat overcast light with no light direction, whatever the style notes above say: no cast shadows, no
highlights from one side, no gradient across the image, no vignette.
Even coverage: the same density of detail everywhere, no single large feature, no focal point, nothing
that would be recognised when the image repeats every few tiles.
Neutral mid-grey tones with no colour tint; the game multiplies its own colours in.
Opaque, no transparency, no objects, no machines, no fluid, no plants.
```

## Illustration

```text
This image is a sheet of briefing illustrations: each cell shows one machine as a small product
portrait.
View: three-quarter view from above (about 35 degrees down, turned about 30 degrees), the same angle for
every machine, so that the top and two sides are visible. Light from the upper left, a soft rim light in
the machine's accent colour, a gentle glow from its accent parts.
More detail than a map sprite: panel lines, bolts, vents, cables, worn paint edges; still a clear, bold
overall shape.
Background: fully transparent (alpha zero) everywhere outside the machines. No ground plate, no floor,
no backdrop, no checkerboard, no cast shadow, no labels.
Each machine sits centred in its own cell with a clear transparent margin on every side; machines never
touch or overlap a neighbouring cell.
```

## Keyart

```text
This image is the title key art: a wide, atmospheric painted landscape, cinematic but calm.
Dusk on a dead world: a dark teal-grey sky fading to a thin band of cold light at the horizon, dark rock
in the foreground, the magenta silt as the brightest and most saturated element, cyan and amber machine
lights as small accents.
Opaque, full-bleed painting to every edge. No people in close-up, no faces.
```
