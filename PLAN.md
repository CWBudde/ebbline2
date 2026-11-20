# Ebbline 2: plan

Ebbline 2 is the successor to [Ebbline](https://github.com/CWBudde/Ebbline): the same fluid-defence
game (silt rises from vents, you build an energy grid, burn the silt back and cap every vent), played
on hexagonal tiles instead of squares. Ranges are counted in steps from tile to touching tile.

## Done

- [x] Hex geometry, and the engine ported to hexagons (`engine/`).
- [x] Hex drawing and picking in the app.
- [x] Campaign of twelve missions (`c1` to `c12`), replacing the fourteen square-grid ones; the
      interface text of all thirteen languages covers them.
- [x] Moving ground (`movingFloor.ts`): waves that roll out from the lander in c11, and shoals that
      rise and sink in turn in c12's bend.
- [x] Earthy brown ground.
- [x] Hex art: structures on hexagonal plates, the seven-tile lander, vent, spitter, lode and the
      briefing illustrations (`app/public/art/`; prompts in `art/`).
- [x] Title scene for the hex look: a shader draws the silt sea in perspective, the painted rock
      islands stand on it, the vent smokes, and the ridge with the seven-hexagon lander is in front.
- [x] Statistics screen: the engine samples silt, flooded tiles, energy, income by source, spending by
      purpose, open vents and structures into the save (`history.ts`); the screen draws them as SVG charts
      from the pause menu, the result screen, the key T and the energy readout. Its new text is still English
      in the ten other languages (`// TODO translate`).

## Open

- [ ] Landforms, or other ways to give missions more character.
- [ ] More missions.
- [ ] Title sky: it is still the painted one (`title-bg.jpg`), with a higher horizon than the first
      Ebbline title. The sea bands are also softer than that title's painted rivers.
- [ ] Engine: a structure standing in silt requests a full energy packet for each tiny repair, which
      can drain 2 to 4 energy per second. Look at batching or scaling the request.
- [ ] Balance: the scripted bot (`engine/src/testing/bot.ts`) never builds trunks, pumps, baffles or graders,
      so the balance of the missions that introduce them is unproven.
- [ ] Load time of large maps: about 430 ms for 80x80.
