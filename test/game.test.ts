import { describe, expect, it } from 'vitest';
import { progress, type Activity } from '../src/game';

const base: Activity = { commits: 0, mergedPrs: 0, recentDays: [0, 0, 0], mergedRecently: false };

describe('progress', () => {
  it('starts a new user with chiikawa at grade 5', () => {
    expect(progress(base)).toEqual({
      commits: 0,
      mergedPrs: 0,
      points: 0,
      level: 1,
      toNextLevel: 50,
      grade: 5,
      unlocked: ['chiikawa'],
      pets: [{ id: 'chiikawa', level: 1 }],
      nextPet: { id: 'hachiware', need: 50 },
      mood: 'sleepy',
    });
  });

  it('levels each pet from the points earned since it joined', () => {
    expect(progress({ ...base, commits: 260 }).pets).toEqual([
      { id: 'chiikawa', level: 6 },
      { id: 'hachiware', level: 5 },
      { id: 'usagi', level: 3 },
    ]);
  });

  it('counts down to the next level and the next pet', () => {
    const p = progress({ ...base, commits: 120 });
    expect(p.toNextLevel).toBe(30);
    expect(p.nextPet).toEqual({ id: 'usagi', need: 30 });
  });

  it('has no next pet once everyone joined', () => {
    expect(progress({ ...base, commits: 400 }).nextPet).toBeNull();
  });

  it('counts commits once and merged PRs ten times', () => {
    expect(progress({ ...base, commits: 30, mergedPrs: 2 }).points).toBe(50);
  });

  it('unlocks characters as points grow', () => {
    expect(progress({ ...base, commits: 50 }).unlocked).toEqual(['chiikawa', 'hachiware']);
    expect(progress({ ...base, commits: 400 }).unlocked).toEqual(['chiikawa', 'hachiware', 'usagi', 'momonga']);
  });

  it('raises the grade at each step', () => {
    expect(progress({ ...base, commits: 99 }).grade).toBe(5);
    expect(progress({ ...base, commits: 100 }).grade).toBe(4);
    expect(progress({ ...base, commits: 1500 }).grade).toBe(1);
  });

  it('caps the level at 99', () => {
    expect(progress({ ...base, commits: 100000 }).level).toBe(99);
  });
});

describe('mood', () => {
  it('parties after a recent merge', () => {
    expect(progress({ ...base, mergedRecently: true }).mood).toBe('party');
  });

  it('is active with contributions in the last 3 days', () => {
    expect(progress({ ...base, recentDays: [0, 0, 4, 0] }).mood).toBe('active');
  });

  it('sleeps when the last 3 days are empty', () => {
    expect(progress({ ...base, recentDays: [0, 0, 0, 9] }).mood).toBe('sleepy');
  });
});
