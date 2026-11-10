import { SPRITES } from './sprites.generated';

export interface Eye {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  skin: string;
}

export interface CharacterArt {
  name: string;
  desc: string;
  /** body size relative to the 100-unit box */
  scale: number;
  /** horizontal shift in sprite pixels, to center bodies with tails */
  dx: number;
  /** seconds between blinks */
  blink: number;
  ink: string;
  eyes: Eye[];
  img: string;
}

/** sprite pixel space that eye coordinates are written in */
export const SPRITE_SIZE = 320;

/** unlock order; a character joins the farm once points reach `unlock` */
export const ROSTER = [
  { id: 'chiikawa', unlock: 0 },
  { id: 'hachiware', unlock: 50 },
  { id: 'usagi', unlock: 150 },
  { id: 'momonga', unlock: 400 },
] as const;

export type CharacterId = (typeof ROSTER)[number]['id'];

export function art(id: CharacterId): CharacterArt {
  return SPRITES[id];
}

export function isCharacterId(id: string): id is CharacterId {
  return ROSTER.some((r) => r.id === id);
}
