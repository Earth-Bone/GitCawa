import { ROSTER, type CharacterId } from './characters';

/** GitHub activity, already counted */
export interface Activity {
  /** commit contributions over the last year (풀뽑기) */
  commits: number;
  /** merged pull requests, all time (토벌) */
  mergedPrs: number;
  /** contribution counts for the last days, index 0 is today */
  recentDays: number[];
  /** a pull request was merged in the last 3 days */
  mergedRecently: boolean;
}

export type Mood = 'party' | 'active' | 'sleepy';

export interface Pet {
  id: CharacterId;
  /** grows from the points earned since this pet joined */
  level: number;
}

export interface Progress {
  commits: number;
  mergedPrs: number;
  points: number;
  level: number;
  /** points left until the next level, 0 at max level */
  toNextLevel: number;
  /** 초사 검정 grade, 5 (lowest) to 1 */
  grade: number;
  unlocked: CharacterId[];
  pets: Pet[];
  /** next pet to join and the points it still needs */
  nextPet: { id: CharacterId; need: number } | null;
  mood: Mood;
}

export const POINTS_PER_COMMIT = 1;
export const POINTS_PER_MERGED_PR = 10;
export const POINTS_PER_LEVEL = 50;
const GRADE_STEPS = [100, 300, 700, 1500];
export const MAX_LEVEL = 99;

const levelOf = (points: number) => Math.min(MAX_LEVEL, 1 + Math.floor(points / POINTS_PER_LEVEL));

export function progress(a: Activity): Progress {
  const points = a.commits * POINTS_PER_COMMIT + a.mergedPrs * POINTS_PER_MERGED_PR;
  const level = levelOf(points);
  const joined = ROSTER.filter((r) => points >= r.unlock);
  const next = ROSTER.find((r) => points < r.unlock);
  return {
    commits: a.commits,
    mergedPrs: a.mergedPrs,
    points,
    level,
    toNextLevel: level === MAX_LEVEL ? 0 : POINTS_PER_LEVEL - (points % POINTS_PER_LEVEL),
    grade: 5 - GRADE_STEPS.filter((s) => points >= s).length,
    unlocked: joined.map((r) => r.id),
    pets: joined.map((r) => ({ id: r.id, level: levelOf(points - r.unlock) })),
    nextPet: next ? { id: next.id, need: next.unlock - points } : null,
    mood: moodOf(a),
  };
}

export function moodOf(a: Activity): Mood {
  if (a.mergedRecently) return 'party';
  return a.recentDays.slice(0, 3).some((n) => n > 0) ? 'active' : 'sleepy';
}
