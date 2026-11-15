# Ebbline art direction

One entry per image. A prompt is the [style.md](style.md) Preamble, the named section and the entry
text, verbatim. The entries below are the prompts of the installed picks; the tries, measurements and
verdicts are kept in the review records of the generation run (not committed).

Installed files live in `app/public/art/`. Every image is optional at runtime: the game falls back to
its code-drawn art when one is missing.

## Map sprites (section Sprites)

Cut into `structures.png` / `structures.json` and `features.png` / `features.json` at 128 px per tile.

**S1 Lander** (`lander`, 3x3 tiles)

```text
Canvas: SQUARE 1024x1024 px, one object only, one cell.
The lander: the crew's landing craft and the root of the power grid, seen from straight above. A
heavy, squat, square hull with broadly chamfered corners, about 800 px wide and 800 px high (about 4/5
of the canvas), centred. Four short, thick landing legs reach out diagonally from the four corners and
end in round footpads. In the centre a large hexagonal reactor hatch with a bright cyan (#5fe3ff)
glowing core, about 1/4 of the hull width. Around it large flat hull plates with a few wide panel lines,
four small cyan marker lights, one dish antenna on the upper right plate. Dark gunmetal hull, steel-blue
rims. The whole craft is one bold, symmetric shape that reads when shrunk to 72 px.
```

**S2 Structures A** (`pylon`, `trunk`, `tap`, `cell`, `pump`, `cap`)

```text
Canvas: LANDSCAPE 1536x1024 px, a grid of 3 columns and 2 rows, six cells of 512x512 px, one machine
per cell, each machine about 380 px across (about 3/4 of its cell) unless a size is given.
Row 1, left: PYLON. A small power relay post seen from above: a diamond-shaped (square turned 45
degrees) footplate with four short struts to its corners and a round cyan (#5fe3ff) glowing node in the
centre. Smaller than the others: about 300 px across.
Row 1, middle: TRUNK. A heavy long-range relay hub: a thick regular hexagonal housing with a wide cyan
glowing ring on top and a small cyan node in the middle of the ring.
Row 1, right: TAP. A mining clamp that sits on an energy deposit: a square frame with four chunky
corner claws pointing inward and a large amber (#ffc857) glowing diamond-shaped bore in the centre.
Row 2, left: CELL. An energy storage bank: a square base plate with rounded corners carrying three
thick parallel horizontal capacitor bars that glow amber, evenly spaced.
Row 2, middle: PUMP. A skimmer pump: a round turbine housing with a thick amber glowing outer ring, six
broad dark fan blades inside and a small amber hub.
Row 2, right: CAP. A vent seal: a large, heavy, perfectly round pressure lid in pale ceramic white
(#f4f7f8) with a dark round centre plate and four big bolted clamps at the diagonals. About 440 px
across.
Every machine: dark gunmetal body, steel-blue rim, only its one accent colour glowing.
```

**S3 Structures B** (`lance`, `lobber`, `baffle`, `interceptor`, `grader`)

Attachment: the picked S2 sheet, to lock the rendering style ("match its rendering style, materials, edge
thickness and level of detail exactly; do not copy any of its machines").

```text
Canvas: LANDSCAPE 1536x1024 px, a grid of 3 columns and 2 rows, six cells of 512x512 px, one machine
per cell, each machine about 380 px across (about 3/4 of its cell). The cell in row 2, right stays
completely empty and transparent.
The weapons can turn in the game, so none of them has a barrel or nose pointing in any direction: each
is rotationally symmetric when seen from above.
Row 1, left: LANCE. A beam emitter turret: a square base plate with rounded corners carrying a bold
three-sided (triangular) emitter crown of three prongs around a round orange (#ff7a45) glowing lens.
Row 1, middle: LOBBER. A heavy mortar seen straight down its muzzle: a square base plate carrying a
very thick round barrel ring with a deep dark bore and an orange glowing charge at the bottom of the
bore.
Row 1, right: BAFFLE. A field projector: a regular octagonal housing with three thick parallel
horizontal emitter slats on top glowing lime green (#b6f36b).
Row 2, left: INTERCEPTOR. A point-defence station: a square base plate carrying an X-shaped mount of
four diagonal arms, each arm ending in a small orange launch tube, and a bright yellow (#fff27a) round
sensor dome in the centre.
Row 2, middle: GRADER. A ground-shaping station: a square base plate carrying a broad lime green
(#b6f36b) glowing chevron (an upward-pointing angle bracket) above a thick lime light bar along the
lower edge.
Every machine: dark gunmetal body, steel-blue rim, only its one accent colour glowing.
```

**F1 Features** (`vent`, `spitter`, `lode`)

```text
Canvas: LANDSCAPE 1536x1024 px, three objects side by side in one row, each centred in its own third of
the canvas (cells of 512 px width), each about 400 px across, vertically centred.
These are natural features of the world, not machines; ignore the machine materials above.
Left: VENT. A wound in the ground from which silt wells up: a round crater mouth with a ragged, cracked
rim of dark teal-grey rock and a bright magenta (#ff3fa4) glowing molten pool filling its centre, hot
pink at the very middle. Roughly circular outline with a broken rock edge.
Middle: SPITTER. A hostile growth that hurls silt: a dark purple-black (#2a0f24) crusted mound shaped
like a star with five thick blunt spines, ribbed like hardened lava, with a round magenta glowing maw in
the centre and thin magenta glowing cracks running out along the spines.
Right: LODE. An energy deposit: a tight cluster of seven to nine chunky amber (#ffc857) glowing crystals
of different sizes growing out of a small flat patch of dark rock; overall diamond-shaped (rhombic)
outline.
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

Cut to 320 px JPEGs on `#0b1418` as `illustrations/<kind>.jpg`.

Attachments for all three: the picked top-down sheets of the same objects ("keep each object's design,
shapes and accent colour so it is recognisable as the same object; do not copy the top-down view or the
sheet layout").

**I1 Illustrations A** (`pylon`, `tap`, `lance`, `cell`, `lobber`, `pump`)

```text
Canvas: LANDSCAPE 1536x1024 px, a grid of 3 columns and 2 rows, six cells of 512x512 px, one machine
per cell, each machine about 400 px across (about 3/4 of its cell).
Row 1, left: PYLON. A slim power relay mast on a diamond-shaped footplate with four struts and a
glowing cyan (#5fe3ff) node on top.
Row 1, middle: TAP. A mining clamp: a low square frame with four chunky claws gripping downward around
an amber (#ffc857) glowing bore.
Row 1, right: LANCE. A beam emitter turret: a square base with a short turret carrying three emitter
prongs around an orange (#ff7a45) glowing lens.
Row 2, left: CELL. An energy storage bank: a square base carrying three thick horizontal capacitor
cylinders glowing amber.
Row 2, middle: LOBBER. A heavy mortar: a square base with a short, very thick barrel pointing steeply
upward, orange glow inside the muzzle.
Row 2, right: PUMP. A skimmer pump: a low round turbine housing with an amber glowing ring, fan blades
inside and a short intake skirt.
```

**I2 Illustrations B** (`trunk`, `baffle`, `interceptor`, `grader`, `cap`, `spitter`)

```text
Canvas: LANDSCAPE 1536x1024 px, a grid of 3 columns and 2 rows, six cells of 512x512 px, one object per
cell, each about 400 px across (about 3/4 of its cell).
Row 1, left: TRUNK. A heavy long-range relay hub: a thick hexagonal tower with a wide cyan (#5fe3ff)
glowing ring on top.
Row 1, middle: BAFFLE. A field projector: an octagonal housing with three thick emitter slats glowing
lime green (#b6f36b).
Row 1, right: INTERCEPTOR. A point-defence station: a square base carrying an X-shaped mount with four
small orange (#ff7a45) launch tubes and a yellow sensor dome in the centre.
Row 2, left: GRADER. A ground-shaping station: a square base with a lime green glowing chevron emitter
and a lime light bar.
Row 2, middle: CAP. A vent seal: a large, heavy round pressure lid in pale ceramic white (#f4f7f8) with
four big bolted clamps.
Row 2, right: SPITTER. Not a machine: a hostile growth, a dark purple-black crusted mound with five
thick blunt spines and a magenta (#ff3fa4) glowing maw at the top, magenta glowing cracks.
```

**I3 Illustrations C** (`lander`, `vent`, `lode`)

```text
Canvas: LANDSCAPE 1536x1024 px, three objects side by side in one row, each centred in its own third of
the canvas (cells of 512 px width), each about 420 px across, vertically centred.
Left: LANDER. The crew's landing craft: a heavy, squat, square hull with chamfered corners on four
short thick legs with round footpads, a hexagonal reactor hatch with a cyan (#5fe3ff) glowing core on
top, small cyan marker lights, one dish antenna.
Middle: VENT. Not a machine: a wound in the ground, a low crater of ragged, cracked dark teal-grey rock
with a bright magenta (#ff3fa4) glowing molten pool welling up in its mouth.
Right: LODE. Not a machine: a cluster of chunky amber (#ffc857) glowing crystals of different sizes
growing out of a small patch of dark rock.
```
