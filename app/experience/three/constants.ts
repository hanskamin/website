// World units are metres. The net is on z = 0. Nadal plays on +z (near the
// TV camera), Federer on -z.

export const HALF_LEN = 11.885;
export const HALF_W = 5.485;
export const SINGLES_W = 4.115;
export const SERVICE_Z = 6.4;
export const NET_H = 0.914;
export const NET_POST_H = 1.07;
export const NET_POST_X = 6.4;

// Grass arena inside the backstop wall (rounded rectangle).
export const ARENA_X = 10.5;
export const ARENA_Z = 18.8;
export const CORNER_R = 3;

// Stands. "d" is the distance outward from the arena wall.
export const WALL_H = 1.4;
export const LEDGE = 0.35;
export const ROWS = 18;
export const ROW_D = 0.8;
export const ROW_H = 0.42;
export const STAND_D = LEDGE + ROWS * ROW_D;
export const STAND_H = WALL_H + ROWS * ROW_H;
export const SHELL_D = 15.6;
export const ROOF_H = 16.6;
export const ROOF_IN_D = 5.5;
export const ROOF_IN_H = 15.2;
export const FASCIA = 1.3;

// Half-width of the three pavilions cut into the stands.
export const GAP = 6.5;

export const BALL_R = 0.075;
export const GRAVITY = 9.81;
export const PLAYER_SCALE = 1.12;

export const COLORS = {
  wall: 0x12382a,
  wallDark: 0x0c2a1f,
  tread: 0x6f7a6c,
  riser: 0x1c4a37,
  roofTop: 0x1a4433,
  roofUnder: 0x33483c,
  purple: 0x4b2a6b,
  gold: 0xd8b25a,
  cream: 0xf1e9d2,
  line: 0xf6f4ea,
};

export type ViewId = "home" | "music" | "software" | "volunteering" | "play";
