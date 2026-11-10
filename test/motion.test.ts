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
    const steps = plan('active', 100, 20, 500, rng('seed'));
    const walks = steps.filter((s) => s.action === 'walk');
    expect(walks[walks.length - 1].to).toBe(100);
    for (const w of walks) {
      expect(w.to).toBeGreaterThanOrEqual(20);
      expect(w.to).toBeLessThanOrEqual(500);
    }
  });

  it('hops more at a party', () => {
    const count = (mood: 'party' | 'active') =>
      Array.from({ length: 50 }, (_, i) => plan(mood, 0, 0, 400, rng(`u${i}`)))
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
    expect(css).toContain('33.333%{transform:translateX(70px)}');
  });

  it('shows happy eyes only while hopping', () => {
    expect(css).toMatch(/@keyframes eh-a1\{0%\{opacity:0\}33\.333%\{opacity:1\}66\.667%\{opacity:0\}/);
  });

  it('loops every rule over the whole plan', () => {
    expect(css).toContain('.a1 .pos{animation:pos-a1 6s linear infinite}');
  });
});
