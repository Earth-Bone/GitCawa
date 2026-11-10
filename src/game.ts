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

export interface Progress {
  points: number;
  level: number;
  /** 초사 검정 grade, 5 (lowest) to 1 */
  grade: number;
  unlocked: CharacterId[];
  mood: Mood;
}

export const POINTS_PER_COMMIT = 1;
export const POINTS_PER_MERGED_PR = 10;
const GRADE_STEPS = [100, 300, 700, 1500];
const MAX_LEVEL = 99;

export function progress(a: Activity): Progress {
  const points = a.commits * POINTS_PER_COMMIT + a.mergedPrs * POINTS_PER_MERGED_PR;
  return {
    points,
    level: Math.min(MAX_LEVEL, 1 + Math.floor(points / 50)),
    grade: 5 - GRADE_STEPS.filter((s) => points >= s).length,
    unlocked: ROSTER.filter((r) => points >= r.unlock).map((r) => r.id),
    mood: moodOf(a),
  };
}

export function moodOf(a: Activity): Mood {
  if (a.mergedRecently) return 'party';
  return a.recentDays.slice(0, 3).some((n) => n > 0) ? 'active' : 'sleepy';
}
