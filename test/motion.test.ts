import { describe, expect, it } from 'vitest';
import { keyframes, plan, poseAt, rng, walkTime } from '../src/motion';

describe('rng', () => {
  it('repeats for the same seed', () => {
    const a = rng('octocat');
    const b = rng('octocat');
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays in [0, 1)', () => {
    const r = rng('x');
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('plan', () => {
  it('loops back to the start and stays in bounds', () => {
    const steps = plan('active', 100, 200, { minX: 20, maxX: 500, minY: 180, maxY: 240 }, rng('seed'));
    const moves = steps.filter((s) => s.to !== undefined);
    expect(moves[moves.length - 1]).toMatchObject({ action: 'walk', to: 100, toY: 200 });
    for (const m of moves) {
      expect(m.to).toBeGreaterThanOrEqual(20);
      expect(m.to).toBeLessThanOrEqual(500);
      expect(m.toY).toBeGreaterThanOrEqual(180);
      expect(m.toY).toBeLessThanOrEqual(240);
    }
  });

  it('hops more at a party', () => {
    const count = (mood: 'party' | 'active') =>
      Array.from({ length: 50 }, (_, i) => plan(mood, 0, 0, { minX: 0, maxX: 400, minY: 0, maxY: 50 }, rng(`u${i}`)))
        .flat()
        .filter((s) => s.action === 'happy').length;
    expect(count('party')).toBeGreaterThan(count('active'));
  });
});

describe('walkTime', () => {
  it('never drops below one step', () => {
    expect(walkTime(10, 10)).toBe(0.7);
    expect(walkTime(0, 360)).toBe(10);
  });
});

describe('poseAt', () => {
  it('peaks the hop at 40%', () => {
    expect(poseAt('happy', 0.4).ty).toBe(-22);
  });

  it('leans while walking', () => {
    expect(poseAt('walk', 0).rot).toBe(-5);
  });
});

describe('keyframes', () => {
  const css = keyframes('a1', 50, [
    { action: 'walk', dur: 2, to: 120 },
    { action: 'happy', dur: 2 },
    { action: 'walk', dur: 2, to: 50 },
  ]);

  it('moves relative to the start position', () => {
    expect(css).toContain('33.333%{transform:translate(70px,0px)}');
  });

  it('shows happy eyes only while hopping', () => {
    expect(css).toMatch(/@keyframes eh-a1\{0%\{opacity:0\}33\.333%\{opacity:1\}66\.667%\{opacity:0\}/);
  });

  it('turns to face the way it walks', () => {
    expect(css).toContain('@keyframes fc-a1{0%{transform:scaleX(1)}33.333%{transform:scaleX(1)}66.667%{transform:scaleX(-1)}100%{transform:scaleX(-1)}}');
  });

  it('shrinks with distance when given a depth', () => {
    const deep = keyframes('d', 0, [{ action: 'walk', dur: 1, to: 10, toY: 100 }], { y0: 0, depth: (y) => 1 - y / 200 });
    expect(deep).toContain('100%{transform:translate(10px,100px) scale(0.5)}');
  });

  it('loops every rule over the whole plan', () => {
    expect(css).toContain('.a1 .pos{animation:pos-a1 6s linear infinite}');
  });
});
