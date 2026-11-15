# Ebbline art direction

One entry per image. A prompt is the [style.md](style.md) Preamble, the named section and the entry
text, verbatim. The entries below are the prompts of the installed picks; the tries, measurements and
verdicts are kept in the review records of the generation run (not committed).

Installed files live in `app/public/art/`. Every image is optional at runtime: the game falls back to
its code-drawn art when one is missing.

## Map sprites (section Sprites)

Cut into `structures.png` / `structures.json` and `features.png` / `features.json` at 128 px per tile.
Every machine stands on a pointy-top hexagonal plate that is its footprint (see the map geometry in
[style.md](style.md)); the lander's hull is the seven-hexagon flower of its footprint.

**S1 Lander** (`lander`, its tile and the six around it)

```text
Canvas: SQUARE 1024x1024 px, one object only, one cell.
The lander: the crew's landing craft and the root of the power grid, seen from straight above. Its hull
outline is exactly seven pointy-top hexagons packed edge to edge like a flower: one central hexagon and
six around it. The middle row is three hexagons side by side, the top row two hexagons and the bottom
row two hexagons, each shifted half a hexagon so they nest into the gaps. Every hexagon has a corner
pointing straight up and a corner pointing straight down, with vertical flat left and right sides, so the
whole outline is scalloped (zigzag) on top and bottom and stepped on the sides. The hull is about 880 px
wide and 850 px high (about 6/7 of the canvas), centred, with a transparent margin on every side.
Each hexagon is one thick armoured hull module with a raised steel-blue rim; deep dark seams between the
modules make the seven hexagons clearly readable. The central module holds a large round reactor hatch
with a bright cyan (#5fe3ff) glowing core. The upper-right module carries one dish antenna; each of the
other five outer modules carries one small cyan marker light near its outer edge. No legs, no feet and
nothing else reaches outside the seven-hexagon outline. Dark gunmetal hull, steel-blue rims. The whole
craft is one bold, symmetric shape that reads when shrunk to 72 px.
```

**S2 Structures A** (`pylon`, `trunk`, `tap`, `cell`, `pump`, `cap`)

```text
Canvas: LANDSCAPE 1536x1024 px, a grid of 3 columns and 2 rows, six cells of 512x512 px, one machine
per cell.
Every machine stands on its own base plate shaped as a REGULAR pointy-top hexagon with all six sides the
same length (a corner at the top and at the bottom, vertical flat sides left and right): about 400 px
tall from corner to corner and 346 px wide from flat side to flat side, so its width is 0.87 of its
height (the plate is about 4/5 of the cell height). All six plates the same size and orientation, each
centred in its cell. The plate is dark gunmetal (#14222a) with a thick steel-blue (#33505c) rim along
all six edges; the machine sits on top of it and stays inside it.
Row 1, left: PYLON. A light power relay post: the plate is an open hexagonal frame with three thick
struts running from three alternate corners to a round cyan (#5fe3ff) glowing node in the centre.
Row 1, middle: TRUNK. A heavy long-range relay hub: a thick raised housing carrying a wide cyan glowing
ring and a small cyan node in the middle of the ring.
Row 1, right: TAP. A mining clamp that sits on an energy deposit: four chunky claws pointing inward
from the upper-left, upper-right, lower-left and lower-right around a large amber (#ffc857) glowing
diamond-shaped bore in the centre.
Row 2, left: CELL. An energy storage bank: three thick parallel horizontal capacitor bars that glow
amber, evenly spaced, the middle bar the longest.
Row 2, middle: PUMP. A skimmer pump: a round turbine housing with a thick amber glowing outer ring,
exactly six broad dark fan blades inside and a small amber hub.
Row 2, right: CAP. A vent seal: a large, heavy, perfectly round pressure lid in pale ceramic white
(#f4f7f8), nearly as wide as the plate, with a dark round centre plate and four big bolted clamps.
Every machine: dark gunmetal body, steel-blue rim, only its one accent colour glowing.
```

**S3 Structures B** (`lance`, `lobber`, `baffle`, `interceptor`, `grader`)

Attachment: the picked S2 sheet, to lock the rendering style and the plates ("Image 1 is the first sheet
of the same set: match its rendering style, materials, plate shape, plate size, rim thickness and level
of detail exactly; do not copy any of its machines.").

```text
Canvas: LANDSCAPE 1536x1024 px, a grid of 3 columns and 2 rows, six cells of 512x512 px, one machine
per cell. The cell in row 2, right stays completely empty and transparent.
Every machine stands on its own base plate shaped as a REGULAR pointy-top hexagon with all six sides the
same length (a corner at the top and at the bottom, vertical flat sides left and right): about 400 px
tall from corner to corner and 346 px wide from flat side to flat side, so its width is 0.87 of its
height (the plate is about 4/5 of the cell height). All five plates the same size and orientation, each
centred in its cell. The plate is dark gunmetal (#14222a) with a thick steel-blue (#33505c) rim along
all six edges; the machine sits on top of it and stays inside it.
The weapons can turn in the game, so none of them has a barrel or nose pointing in any direction: each
is rotationally symmetric when seen from above.
Row 1, left: LANCE. A beam emitter turret: a bold three-sided (triangular) emitter crown of three
prongs around a round orange (#ff7a45) glowing lens.
Row 1, middle: LOBBER. A heavy mortar seen straight down its muzzle: a very thick round barrel ring
with a deep dark bore and an orange glowing charge at the bottom of the bore.
Row 1, right: BAFFLE. A field projector: three thick parallel vertical emitter slats glowing lime green
(#b6f36b), side by side in the middle of the plate.
Row 2, left: INTERCEPTOR. A point-defence station: an X-shaped mount of four diagonal arms, each arm
ending in a small orange launch tube, and a bright yellow (#fff27a) round sensor dome in the centre.
Row 2, middle: GRADER. A ground-shaping station: a broad lime green (#b6f36b) glowing chevron (an
upward-pointing angle bracket) above a thick horizontal lime light bar in the lower half of the plate.
Every machine: dark gunmetal body, steel-blue rim, only its one accent colour glowing.
```

**F1 Features** (`vent`, `spitter`, `lode`)

```text
Canvas: LANDSCAPE 1536x1024 px, three objects side by side in one row, each centred in its own third of
the canvas (cells of 512 px width), each about 400 px across, vertically centred.
These are natural features of the world, not machines; ignore the machine materials and the hexagonal
base plates above. They lie on dark earthy brown ground.
Left: VENT. A wound in the ground from which silt wells up: a round crater mouth with a ragged, cracked
rim of dark earthy brown rock (#3d2c20, lighter edges #7a5a3c) and a bright magenta (#ff3fa4) glowing
molten pool filling its centre, hot pink at the very middle. Roughly circular outline with a broken rock
edge.
Middle: SPITTER. A hostile growth that hurls silt: a dark purple-black (#2a0f24) crusted mound shaped
like a star with five thick blunt spines, ribbed like hardened lava, with a round magenta glowing maw in
the centre and thin magenta glowing cracks running out along the spines.
Right: LODE. An energy deposit: a tight cluster of seven to nine chunky amber (#ffc857) glowing crystals
of different sizes growing out of a small flat patch of dark brown rock; the patch and the cluster
together have a roughly hexagonal outline with a corner at the top and at the bottom, taller than wide.
```

## Terrain materials (section Terrain)

Graded to a neutral mean and scaled to 512 px as `ground.jpg` and `rock.jpg`; one period covers 8x8
tiles.

**T1 Ground**

```text
Canvas: SQUARE 1024x1024 px showing a patch of ground about 8 metres wide.
Dry, dead regolith of a colony world: compacted fine gravel and dust with many small flat stone
fragments (each about 1/40 of the canvas width), fine hairline cracks, a few shallow wind ripples.
Low contrast, mid-grey, matte; small-scale detail only, evenly spread.
```

**T2 Rock**

```text
Canvas: SQUARE 1024x1024 px showing a patch of solid bedrock about 8 metres wide.
Hard, fractured basalt seen from above: angular interlocking slabs (each about 1/8 of the canvas
width) separated by dark, narrow fracture lines, slab faces slightly rough. Clearly harder and more
angular than loose ground. Mid-grey slabs, darker cracks; evenly spread.
```

## Title key art (section Keyart)

Stored as `title.jpg`, 16:9.

**K1 Title**

```text
Canvas: LANDSCAPE 1536x1024 px, wide shot.
In the lower right third, on a dark rocky ridge, stands the lander: a squat, square survey landing
craft on four short legs, dark gunmetal with a cyan (#5fe3ff) glowing reactor light and a few amber
window lights, small in the frame (about 1/6 of the canvas width), seen from slightly behind and above.
A thin line of small relay pylons with cyan lights runs from it along the ridge.
Below and beyond the ridge the whole valley is flooded with glowing magenta (#ff3fa4) silt, like a
luminous sea reaching to the horizon, with dark rock islands and ridges rising out of it and one distant
vent fountaining silt.
The upper left half of the image is calm, dark teal dusk sky with a few thin clouds and almost no
detail: empty room for a title to be placed later. Do not paint any title, text or logo.
```

## Briefing illustrations (section Illustration)

Cut to 320 px JPEGs on `#0b1418` as `illustrations/<kind>.jpg`. The objects of I3 came out larger
than their thirds and were cut apart by hand at the gaps between them before cutting each one.

Attachments for all three: the picked top-down sheets of the same objects, numbered in the order named
("keep each object's design, shapes, hexagonal base and accent colour so it is recognisable as the same
object; do not copy the top-down view or the sheet layout"): S2 and S3 for I1; S2, S3 and F1 for I2;
S1 and F1 for I3. I2 and I3 also attach the picked I1 sheet last ("the first illustration sheet of the
same set: match its view angle, rendering and level of detail; do not copy its machines"; for I2 also
"and its six-sided base plinths").

**I1 Illustrations A** (`pylon`, `tap`, `lance`, `cell`, `lobber`, `pump`)

```text
Canvas: LANDSCAPE 1536x1024 px, a grid of 3 columns and 2 rows, six cells of 512x512 px, one machine
per cell, each machine about 400 px across (about 3/4 of its cell).
Every machine stands on a low, thick six-sided (hexagonal) base plinth of dark gunmetal with steel-blue
edges, the same shape and size for all six; no square bases.
Row 1, left: PYLON. A slim power relay post: an open hexagonal frame as its base, three thick struts
rising from three alternate corners of the frame to a glowing cyan (#5fe3ff) node on top.
Row 1, middle: TAP. A mining clamp: four chunky claws gripping downward around an amber (#ffc857)
glowing diamond-shaped bore in the middle of the hexagonal base.
Row 1, right: LANCE. A beam emitter turret: a short turret carrying a crown of three emitter prongs
around an orange (#ff7a45) glowing lens that faces straight up.
Row 2, left: CELL. An energy storage bank: three thick horizontal capacitor cylinders glowing amber,
lying side by side on the base, the middle one the longest.
Row 2, middle: LOBBER. A heavy mortar: a short, very thick barrel pointing straight up, orange glow
inside the muzzle.
Row 2, right: PUMP. A skimmer pump: a low round turbine housing with an amber glowing ring, fan blades
inside and a short intake skirt.
```

**I2 Illustrations B** (`trunk`, `baffle`, `interceptor`, `grader`, `cap`, `spitter`)

```text
Canvas: LANDSCAPE 1536x1024 px, a grid of 3 columns and 2 rows, six cells of 512x512 px, one object per
cell, each about 400 px across (about 3/4 of its cell).
Each of the five machines stands on a low, thick six-sided (hexagonal) base plinth of dark gunmetal with
steel-blue edges, the same shape and size for all five; no square or octagonal bases.
The bases are six-sided, exactly like the hexagonal base plinths of the machines in Image 4.
Row 1, left: TRUNK. A heavy long-range relay hub: a thick hexagonal tower with a wide cyan (#5fe3ff)
glowing ring on top.
Row 1, middle: BAFFLE. A field projector: three thick upright emitter slats standing side by side like
fins, glowing lime green (#b6f36b).
Row 1, right: INTERCEPTOR. A point-defence station: an X-shaped mount with four small orange (#ff7a45)
launch tubes pointing up and a yellow (#fff27a) sensor dome in the centre.
Row 2, left: GRADER. A ground-shaping station: a lime green glowing chevron emitter above a lime light
bar.
Row 2, middle: CAP. A vent seal: a large, heavy round pressure lid in pale ceramic white (#f4f7f8) with
four big bolted clamps, sitting on its hexagonal base.
Row 2, right: SPITTER. Not a machine and no base: a hostile growth, a dark purple-black crusted mound
with five thick blunt spines and a magenta (#ff3fa4) glowing maw at the top, magenta glowing cracks.
```

**I3 Illustrations C** (`lander`, `vent`, `lode`)

```text
Canvas: LANDSCAPE 1536x1024 px, three objects side by side in one row, each centred in its own third of
the canvas (cells of 512 px width), each about 380 px across (about 3/4 of its third), vertically
centred, with a clear transparent gap between neighbours; nothing crosses into the next third.
The lander is seen from the same three-quarter view as the other objects, about 35 degrees down, so
that two of its side walls are clearly visible below the top.
Left: LANDER. The crew's landing craft: a low, wide, heavy hull built from seven hexagonal modules
packed together like a flower (one central module and six around it), each module a thick armoured
block with steel-blue rims and deep seams between them. On top of the central module a round reactor
hatch with a cyan (#5fe3ff) glowing core; one dish antenna on an outer module; small cyan marker
lights. Short, stubby landing feet tucked under the hull.
Middle: VENT. Not a machine: a wound in the ground, a low crater of ragged, cracked dark earthy brown
rock with a bright magenta (#ff3fa4) glowing molten pool welling up in its mouth.
Right: LODE. Not a machine: a cluster of chunky amber (#ffc857) glowing crystals of different sizes
growing out of a small hexagonal patch of dark brown rock.
```
