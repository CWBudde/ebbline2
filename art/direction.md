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

The title is one picture in three layers, so that the title scene can move them against each other:
the background (the sky with the distant vent; the silt sea is drawn by the title scene's shader), the
rock islands and the near ridge with the lander. The two upper layers are transparent cut-outs. The
background (K2) is cut from the rows 120 to 984 (16:9) of its 1536x1024 canvas and scaled to 1920 px
wide (1.25x); of it only the sky above the horizon, row 454 of the 1920x1080 picture, is shown.

The islands (K3a, K3b) are painted as two sheets of separate rocks in the style of the first Ebbline's
title painting, each with a level waterline, and are cut apart and stood in the sea one by one. The
scene draws every island as an upright card at the distance of its waterline, from the one layer
file, so no island may lie inside another one's box. Placement in the 1920x1080 picture (part of the
sheet as x,y,w,h, less 2 rows at its bottom; then left edge, waterline row and width), far to near:

| Island      | Sheet | Part            | Left | Waterline | Width |
| ----------- | ----- | --------------- | ---- | --------- | ----- |
| range-left  | K3b   | 17,576,1502,121 | -15  | 457       | 931   |
| range-right | K3b   | 25,800,1494,130 | 1440 | 457       | 822   |
| islet-1     | K3b   | 35,373,324,42   | 990  | 474       | 130   |
| islet-2     | K3b   | 1180,373,326,42 | 560  | 478       | 140   |
| islet-3     | K3b   | 27,150,334,52   | 300  | 485       | 150   |
| islet-4     | K3b   | 800,142,321,60  | 800  | 490       | 150   |
| islet-5     | K3b   | 418,353,321,62  | 1520 | 495       | 170   |
| islet-6     | K3b   | 803,366,318,49  | 1290 | 498       | 160   |
| islet-7     | K3b   | 1174,139,335,63 | 470  | 524       | 230   |
| crags       | K3a   | 20,753,490,156  | 40   | 540       | 220   |
| mesa        | K3b   | 423,141,317,61  | 1600 | 560       | 300   |
| reef        | K3a   | 1026,816,489,93 | 1120 | 575       | 400   |
| slab        | K3a   | 537,746,464,163 | 930  | 690       | 320   |
| ridge       | K3a   | 31,205,1484,338 | -40  | 742       | 880   |

The ridge is the foreground of the first Ebbline's title painting (K1 there, a 1536x1024 picture shown
from its rows 80 to 944 at 1.25x), repainted as a cut-out with the seven-hexagon lander in place of
that picture's square craft. Its reference is the part of the old painting from 448,298, 1088x725 px,
enlarged to 1536x1024, so the layer is painted 1.41x larger than it is shown and is laid in at
0.8854x: its canvas point x,y lands at 585 + 0.8854 x, 273 + 0.8854 y of the 1920x1080 picture, which
puts its pylons on those of the old painting. The lower left corner of the canvas, where the ridge
ran into the canvas edge, is cut away along the line from 0,925 to 90,1024.

Stored as `title-bg.jpg`, `title-mid.jpg` (rows 376 to 746) and `title-fg.jpg` (rows 610 to 1080); a
cut-out file holds its band of rows twice, the colour above and the alpha as grey below. `title.jpg` is
the flat picture, for the menus and as the fallback.

Attachments: K3a and K3b are sent without the preamble and attach the first Ebbline's title painting:
"Image 1 is the earlier title painting: take from it only the look of its rock islands and ridges
(colour, slabs, silhouettes, brushwork, darkness); do not paint its sea, sky, plume, machines or
foreground, and do not copy its layout."

K4, K4b and K4c are edits, sent without the preamble, each on the result of the one before; the
installed image is the result of K4c.

- K4 attaches the enlarged part of the old painting and the picked lander illustration:
  "Image 1 is the earlier title painting, enlarged: reproduce its rocky ridge, its pylon line with the
  cable and its lighting; do not paint its sea, islands, far ridges, sky or plume, and do not keep its
  square craft. Image 2 shows the game's lander from a steeper angle on a dark backdrop: take its design,
  the seven hexagonal modules, the round reactor core on the centre module and the steel-blue rims; do
  not copy its view, its size, its clean brightness or its backdrop."
- K4b attaches the K4 result, the enlarged part of the old painting and a low-angle painting of the
  seven-hexagon lander (cut from an earlier, rejected foreground):
  "Image 1 is the selected foreground layer to edit: keep everything but the lander as it is. Image 2
  is the earlier title painting: take from its square craft the camera angle, the weathered dark
  gunmetal, the worn legs and the way its cyan core lights the hull and the rock; do not keep its square
  shape, and do not paint its sea, islands, sky or plume. Image 3 shows the seven-hexagon lander from the
  right low angle: take its view and how the hexagonal tops and side walls read; do not copy its size,
  its unlit dark lamps, its ladder or its brighter, cleaner plating."
- K4c attaches the K4b result and the enlarged part of the old painting:
  "Image 1 is the selected foreground layer to edit: keep everything as it is except the two changes.
  Image 2 is the earlier title painting: take from its square craft only how large and bright its cyan
  core is and how it lights the hull and the rock; do not keep its square shape, and do not paint its
  sea, islands, sky or plume."

**K2 Title background**

```text
Canvas: LANDSCAPE 1536x1024 px (3:2), a very wide establishing shot seen from a height, looking out
over a flooded lowland to a far horizon. This is the BACKGROUND PLATE of a layered title scene: rock
islands, a rocky foreground and machines are painted on separate layers later, so leave them out.
The horizon is a straight, level line at 46% of the canvas height from the top (y = 470 px).
Above the horizon, the sky: deep dark teal-grey (#0d2228) at the top, a thin band of cold pale light
(#9fd8d0) hugging the horizon, a few long thin streaks of cloud low over the horizon on the right half.
The upper left half of the sky is calm and nearly empty: room for a title to be placed later.
Below the horizon, from the horizon down to the bottom edge and from the left edge to the right edge,
nothing but the silt sea: a luminous magenta (#ff3fa4) fluid, glowing from within, with slow broad
swirls and current lines of lighter pink (#ff8ccb) and darker crimson-violet (#7a1450) eddies, larger
in the near field at the bottom and compressed into thin streaks toward the horizon. Near the horizon
the silt dims under a thin haze.
On the horizon, at 70% of the canvas width from the left (x = 1075 px), one distant vent: a low dark
cone with a tall plume of glowing magenta silt and vapour rising about 200 px (1/5 of the canvas
height) and drifting to the right, lighting the haze around it.
Only two low, faint mountain silhouettes on the horizon line itself, far left and far right, no higher
than 30 px. No islands or rocks in the sea, no shore, no foreground ground, no machines, no buildings,
no vehicles, no people.
```

**K3a Title islands, near**

```text
A sheet of separate rock islands for a layered game title scene: a transparent cut-out, LANDSCAPE
1536x1024 px (3:2). Four islands, each a complete object on its own, to be cut apart and placed in a
sea later.
Upper half (y = 40 to 500 px): ONE large craggy ridge, 1440 px wide (almost the full canvas width)
and about 300 px tall, its waterline at y = 480 px. A long, low mountain of tilted slate slabs: the
highest crag stands right of its middle and ends in a steep cliff on the right; to the left the
ridge falls in several lower shoulders and spurs to a long low tail. Like the big dark ridge at the
left of Image 1.
Lower half (y = 560 to 1000 px): THREE mid-size islands side by side, each about 440 px wide (a
little under 1/3 of the canvas width) and 110 to 150 px tall, all with their waterline at y = 960 px,
with 50 px gaps between them: left, a ridge with two crags and a saddle; middle, a single long
tilted slab rising to the left; right, a low broken reef of three or four joined rocks.
Style, exactly as the rock islands and ridges that rise out of the glowing sea in Image 1: dark, cool
slate-grey rock (#141c20 in shadow, #2a373c on most faces, #55666b on the lit upper planes and
ridgelines), craggy tilted slabs with sharp broken edges and a jagged, clearly cut silhouette, painted
with the same crisp brushwork, low-key at dusk. The light comes from the glowing magenta sea below:
only the lowest tenth of each rock, just above its waterline, catches a faint magenta (#ff3fa4)
bounce; no other colour. Seen from the side across the water, from only a little above, as in
Image 1.
Each rock stands in a flat sea that is NOT painted: its bottom is its waterline, one perfectly
straight, level, horizontal cut across its whole width, as if sliced off by the flat surface. Nothing
below the waterline: no sea, no reflection, no glow band, no foam, no mist, no shadow.
Everything outside the rocks is fully transparent (alpha zero) with a clean hard edge: no sea, no
sky, no fog, no halo, no ground plate, no checkerboard, no frame, no text, no machines, no plants.
The rocks never touch each other or the canvas edges; clear transparent gaps between them.
```

**K3b Title islands, far**

```text
A sheet of separate far-away rock islands and mountain lines for a layered game title scene: a
transparent cut-out, LANDSCAPE 1536x1024 px (3:2). Ten objects, each complete on its own, to be cut
apart and placed in a sea later.
Rows 1 and 2 (y = 30 to 400 px): EIGHT small, low, far islands in a grid of 4 columns and 2 rows,
one per cell of 384x190 px. Each is 300 px wide (about 1/5 of the canvas width) and only 40 to 70
px tall, much wider than tall: low reefs, flat-topped skerries, a low hump with one small crag, two
joined humps; every one different. Waterlines at y = 200 px (row 1) and y = 390 px (row 2).
Row 3 (y = 440 to 690 px): ONE long, low mountain range as seen on a far horizon, 1440 px wide
(almost the full canvas width) and at most 130 px tall, its waterline at y = 670 px: a chain of
many overlapping low peaks and ridges, higher near its left end, falling to low hills at its right
end.
Row 4 (y = 740 to 1000 px): ONE second, different range of the same kind, 1440 px wide and at most
150 px tall, its waterline at y = 980 px: higher at its right end, with one broad flat-topped
massif, falling to low hills at its left end.
The small islands and the ranges are far away, so they are simpler than near rock: fewer, larger
planes, but still sharp jagged silhouettes, never smooth lumps or dunes.
Style, exactly as the rock islands and ridges that rise out of the glowing sea in Image 1: dark, cool
slate-grey rock (#141c20 in shadow, #2a373c on most faces, #55666b on the lit upper planes and
ridgelines), craggy tilted slabs with sharp broken edges and a jagged, clearly cut silhouette, painted
with the same crisp brushwork, low-key at dusk. The light comes from the glowing magenta sea below:
only the lowest tenth of each rock, just above its waterline, catches a faint magenta (#ff3fa4)
bounce; no other colour. Seen from the side across the water, from only a little above, as in
Image 1.
Each rock stands in a flat sea that is NOT painted: its bottom is its waterline, one perfectly
straight, level, horizontal cut across its whole width, as if sliced off by the flat surface. Nothing
below the waterline: no sea, no reflection, no glow band, no foam, no mist, no shadow.
Everything outside the rocks is fully transparent (alpha zero) with a clean hard edge: no sea, no
sky, no fog, no halo, no ground plate, no checkerboard, no frame, no text, no machines, no plants.
The rocks never touch each other or the canvas edges; clear transparent gaps between them.
```

**K4 Title ridge**

```text
Edit Image 1 into the FOREGROUND LAYER of a layered title scene for the game "Ebbline": a transparent
cut-out, LANDSCAPE 1536x1024 px (3:2), the same canvas and framing as Image 1.
Keep, exactly as painted in Image 1 and exactly where it is: the near rocky ridge (cool, dark
slate-grey angular slabs with a faint teal sheen on their tops and a thin magenta rim light on the
edges that face the glowing sea, low-key and cinematic), the four small relay pylons along its edge
with their glowing cyan (#5fe3ff) lamp tips, and the sagging cable that joins them and runs on to the
lander. Same brushwork, same colours, same darkness, same positions and sizes; only sharper, painted
at full resolution with crisp edges, because Image 1 is a soft enlargement.
The ridge is the dark slate rock that rises from the bottom left corner (x = 0, y = 1010 px) along
the pylon line to a level shelf at about y = 650 px from x = 1000 px to the right edge, and
everything below that outline down to the bottom edge. It runs off the bottom and right edges.
Remove everything else and leave it fully transparent (alpha zero): the magenta sea, the sky, the
clouds, the plume, the far mountains and islands, and also the lower, farther ridge with glowing
shores at the left edge above y = 900 px. Do not paint any of them.
Change one thing only: replace the square landing craft with the game's lander, shown in Image 2, at
the same place and about the same size (its hull about 470 px wide, from x = 1000 px to x = 1470 px,
its top at about y = 500 px, its feet on the shelf at about y = 740 px; an antenna mast with a small
cyan lamp may reach y = 400 px). The lander is a low, wide hull of SEVEN HEXAGONAL MODULES packed
like a flower: one centre hexagon ringed by six. Seen as Image 1 sees its craft, from the side and
slightly above (about 25 degrees), so the flat hexagonal tops with their steel-blue rims read
clearly and the nearest modules show their side walls. The same weathered dark gunmetal as the craft
in Image 1, with its amber (#ffc857) lit windows in the side walls and its worn, rust-edged landing
legs: short legs, the hull close to the rock. On the centre module a large round reactor core
glowing bright cyan (#5fe3ff), the brightest thing in the image, casting a little cyan light on the
hull around it and on the rock under it, as the core does in Image 1.
The lamps and the core glow as in Image 1, but their glow stays on the objects: no halo or light
spill over the transparent area.
Alpha zero outside the ridge, the pylons, the cable and the lander, with a clean hard edge: no sea,
no sky, no fog, no smoke, no ground plate, no halo, no checkerboard, no cast shadow outside the
objects. No text, no letters, no stencil marks, no logos, no frame.
```

**K4b Title ridge, lander from a lower view**

```text
Edit Image 1, the foreground layer of a game's title scene: a transparent cut-out, LANDSCAPE
1536x1024 px (3:2), of a dark slate ridge with four relay pylons joined by a sagging cable and a
landed craft. Keep the canvas size and keep the ridge, the pylons with their glowing cyan lamps, the
cable, the lighting and the transparent area exactly as they are, pixel for pixel where you can.
Change one thing only: repaint the lander. In Image 1 it is seen from too high (about 45 degrees
down), so it looks like a flat game icon laid on the rock, with clean new plating. Paint it as the
square craft is seen in Image 2: from the side and only slightly above, about 20 degrees down, a
heavy weathered machine standing on the ridge.
The lander keeps its design: a low, wide hull of SEVEN HEXAGONAL MODULES packed like a flower, one
centre hexagon ringed by six, each a hexagonal prism. From this lower view the flat hexagonal tops
are strongly foreshortened bands with steel-blue rims, still readable as hexagons, and the side
walls of the three nearest modules are tall and face the camera, as in Image 3, which shows the same
lander from the right angle. It stands in the same place: about 470 px wide, from x = 980 px to
x = 1450 px, the top of the hull at about y = 540 px, its feet on the rock at about y = 750 px, on
short worn legs with rust-edged foot pads as in Image 2.
Material and light as the craft in Image 2: dark weathered gunmetal with chipped edges, low-key,
darker than in Image 1, a thin magenta rim on the edges that face the sea, amber (#ffc857) lit
windows in the side walls. On the centre module a large round reactor core, a dome ringed by
segments, glowing bright cyan (#5fe3ff): the brightest thing in the image, lighting the hull around
it and a patch of rock under the craft cyan, as the core does in Image 2. Keep the small dish and
the antenna mast with its cyan lamp on a rear module, the mast tip at about y = 410 px. No crew
figures, no ladder, no extra cable.
The glow of the core and the lamps stays on the objects: no halo or light spill over the
transparent area. Alpha zero outside the ridge, the pylons, the cable and the lander, with a clean
hard edge: no sea, no sky, no fog, no ground plate, no checkerboard, no cast shadow outside the
objects. No text, no stencil marks, no logos.
```

**K4c Title ridge, reactor core**

```text
Edit Image 1, the foreground layer of a game's title scene: a transparent cut-out, LANDSCAPE
1536x1024 px (3:2), of a dark slate ridge with four relay pylons joined by a sagging cable and a
landed craft of seven hexagonal modules. Keep the canvas size and keep everything exactly as it is
and exactly where it is, pixel for pixel where you can: the ridge, the four pylons with their
glowing cyan lamps, the cable, the lander's view, its seven hexagonal modules, its weathered
gunmetal, its amber windows, its legs, the dish, the mast, the lighting and the transparent area.
Two changes only, both on the lander:
1. The reactor core. In Image 1 it is a small, dim glow half hidden in its ring (about 70 px wide).
Make it the brightest and most striking thing in the image, as the round cyan core of the square
craft is in Image 2: a large raised dome of glowing glass on the centre module, about 110 px wide,
white-hot in the middle and bright cyan (#5fe3ff) around it, set in a ring of dark segments with
thin glowing cyan seams, lighting the tops of the six modules around it, the dish and the patch of
rock under the craft cyan.
2. The size. Image 1's lander is 545 px wide (x = 920 px to 1465 px). Make it a little smaller,
about 480 px wide (x = 975 px to 1455 px), standing on the same spot with its feet at the same
height, so that more of the ridge shows to its left.
The glow of the core and the lamps stays on the objects: no halo or light spill over the
transparent area. Alpha zero outside the ridge, the pylons, the cable and the lander, with a clean
hard edge: no sea, no sky, no fog, no ground plate, no checkerboard, no cast shadow outside the
objects. No text, no stencil marks, no logos.
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
