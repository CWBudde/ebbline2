# Ebbline 2: plan

Ebbline 2 is the successor to [Ebbline](https://github.com/CWBudde/Ebbline): the same fluid-defence
game (silt rises from vents, you build an energy grid, burn the silt back and cap every vent), played
on hexagonal tiles instead of squares. Ranges are counted in steps from tile to touching tile.

## Done

- [x] Hex geometry, and the engine ported to hexagons (`engine/`).
- [x] Hex drawing and picking in the app.
- [x] Campaign of fifteen missions (`c1` to `c15`); the interface text of all thirteen languages
      covers them. c14 (Levee) holds a brim-full sea off a low basin with a thin wall that spills over
      at its notches. c15 (Hillside) floods the foot of a long slope with gullies (landform `slope`),
      and the sea, already over three fifths of the map, climbs toward the lander at the top.
- [x] Spring (introduced in c15): turns energy into balm, a second fluid (`game.balm`) that flows like
      silt, cancels it on its own tile and the tiles next to it, and fades as it stands (`silt.ts`,
      `SPRING` in `weapons.ts`). The bot pours it down the slope into the sea and cannot win c15 without it.
- [x] Moving ground (`movingFloor.ts`): waves that roll out from the lander in c11, and shoals that
      rise and sink in turn in c12's bend, and the sinking island of c13 (Atlantis).
- [x] Earthy brown ground.
- [x] Hex art: structures on hexagonal plates, the seven-tile lander, vent, spitter, lode and the
      briefing illustrations (`app/public/art/`; prompts in `art/`).
- [x] Title scene for the hex look: a shader draws the silt sea in perspective, the painted rock
      islands stand on it, the vent smokes, and the ridge with the seven-hexagon lander is in front.
- [x] Statistics screen: the engine samples silt, flooded tiles, energy, income by source, spending by
      purpose, open vents and structures into the save (`history.ts`); the screen draws them as SVG charts
      from the pause menu, the result screen, the key T and the energy readout. Its new text is still English
      in the ten other languages (`// TODO translate`).
- [x] Airfield (introduced in c10): loads a plane with thirty energy; when full it flies to the area with the most
      silt on the map, drops fifteen lobber-sized bombs along a short run, returns and reloads (`weapons.ts`).
- [x] Generated sprites and illustrations for the Airfield and the Booster (S4, S5, I4, I5 in `art/direction.md`).

## Open

- [ ] Landforms, or other ways to give missions more character.
- [ ] More missions.
- [ ] Title sky: it is still the painted one (`title-bg.jpg`), with a higher horizon than the first
      Ebbline title. The sea bands are also softer than that title's painted rivers.
- [ ] Engine: a structure standing in silt requests a full energy packet for each tiny repair, which
      can drain 2 to 4 energy per second. Look at batching or scaling the request.
- [ ] Balance: the scripted bot (`engine/src/testing/bot.ts`) never builds trunks, pumps, baffles or graders,
      so the balance of the missions that introduce them is unproven.
- [ ] Balance of the Airfield: the bot never builds it, so its strength in c10 is unproven.
- [ ] Generated art for the Spring (map sprite and briefing illustration), and drawing balm in the app.
- [ ] Load time of large maps: about 430 ms for 80x80.
