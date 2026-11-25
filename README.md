# hanskamin.com

The site is one 3D scene: a stylised Centre Court, as in the 2008 final. The page opens on a TV view of the court. Federer and Nadal rally in the background.

| Route | Camera goes to | Content |
| --- | --- | --- |
| `/` | TV view | Name, links, the four options |
| `/music` | The bandstand (north stand) | Releases and the player |
| `/software` | The press box (west stand) | Career, stack, links |
| `/volunteering` | The royal box (south stand) | Photographs and text |
| `/play` | Behind Nadal | One game against a computer-controlled Federer |

## Run

```bash
bun install
bun dev
```

## Structure

- `app/layout.tsx` mounts `Experience`. The route pages render nothing: the path only selects the camera view, so the scene stays alive between pages.
- `app/experience/three/` is the scene (three.js, no model files: all geometry and textures are made in code).
  - `stadium.ts` court, stands, roof, crowd, scoreboards
  - `areas.ts` the three pavilions
  - `players.ts` the two player rigs and their strokes
  - `game.ts` rules, ball physics, the computer player
  - `world.ts` renderer, camera rig, picking, main loop
- `app/experience/ui/` is the HTML overlay (panels, match HUD).
- `app/experience/content.ts` holds the text and data for all sections.
