import type { Mood } from './game';

export type Action = 'walk' | 'idle' | 'happy';

export interface Step {
  action: Action;
  /** seconds */
  dur: number;
  /** x to reach by the end of the step; a short idle step with `to` warps */
  to?: number;
}

const WALK_SPEED = 36; // px per second
const WALK_PERIOD = 0.7;
const HOP_PERIOD = 1;
const BREATH_PERIOD = 2.4;
const SAMPLE = 0.05;

/** small deterministic RNG so the same user gets the same farm */
export function rng(seed: string): () => number {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  let s = h >>> 0 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** a looping plan that starts and ends at x0 */
export function plan(mood: Exclude<Mood, 'sleepy'>, x0: number, minX: number, maxX: number, rand: () => number): Step[] {
  const happyChance = mood === 'party' ? 0.5 : 0.15;
  const steps: Step[] = [];
  let x = x0;
  for (let i = 0; i < 3; i++) {
    const to = Math.round(minX + rand() * (maxX - minX));
    steps.push({ action: 'walk', dur: walkTime(x, to), to });
    x = to;
    steps.push(rand() < happyChance ? { action: 'happy', dur: 2 } : { action: 'idle', dur: 1 + Math.round(rand() * 2) });
  }
  steps.push({ action: 'walk', dur: walkTime(x, x0), to: x0 });
  steps.push({ action: 'idle', dur: 1.5 });
  return steps;
}

export function walkTime(from: number, to: number): number {
  return Math.max(0.7, Math.round((Math.abs(to - from) / WALK_SPEED) * 10) / 10);
}

interface Pose {
  ty: number;
  rot: number;
  sx: number;
  sy: number;
}

const HOP = [
  [0, 0, 1.08, 0.9],
  [0.15, -6, 0.94, 1.08],
  [0.4, -22, 1, 1],
  [0.65, 0, 1.06, 0.93],
  [0.8, 0, 1, 1],
  [1, 0, 1.08, 0.9],
];

export function poseAt(action: Action, u: number): Pose {
  if (action === 'walk') {
    const p = (u / WALK_PERIOD) * 2 * Math.PI;
    return { ty: -4 * Math.abs(Math.sin(p)), rot: -5 * Math.cos(p), sx: 1, sy: 1 };
  }
  if (action === 'happy') {
    const p = (u % HOP_PERIOD) / HOP_PERIOD;
    let i = 0;
    while (p > HOP[i + 1][0]) i++;
    const [a, b] = [HOP[i], HOP[i + 1]];
    const f = (p - a[0]) / (b[0] - a[0]);
    const lerp = (j: number) => a[j] + (b[j] - a[j]) * f;
    return { ty: lerp(1), rot: 0, sx: lerp(2), sy: lerp(3) };
  }
  const c = (1 - Math.cos((2 * Math.PI * u) / BREATH_PERIOD)) / 2;
  return { ty: 0, rot: 0, sx: 1 + 0.03 * c, sy: 1 - 0.04 * c };
}

const fx = (n: number, d = 2) => Number(n.toFixed(d)).toString();

/**
 * CSS for one actor following `steps` in a loop. The actor markup needs
 * `.pos`, `.body-g`, `.eyes-happy`, `.spark` and `.lid` inside an element
 * with class `id`.
 */
export function keyframes(id: string, x0: number, steps: Step[]): string {
  const segs: { action: Action; t0: number; t1: number; x0: number; x1: number }[] = [];
  let t = 0;
  let x = x0;
  for (const s of steps) {
    const x1 = s.to ?? x;
    segs.push({ action: s.action, t0: t, t1: t + s.dur, x0: x, x1 });
    t += s.dur;
    x = x1;
  }
  const T = fx(t);
  const pct = (s: number) => fx((s / t) * 100, 3) + '%';

  const pos = segs.map((s) => `${pct(s.t0)}{transform:translateX(${s.x0 - x0}px)}${pct(s.t1)}{transform:translateX(${s.x1 - x0}px)}`).join('');
  let body = '';
  const toggles: Record<'eh' | 'ld', [string, number][]> = { eh: [], ld: [] };
  const n = Math.round(t / SAMPLE);
  for (let i = 0; i <= n; i++) {
    const tt = Math.min(t, i * SAMPLE);
    const seg = segs.find((s) => tt < s.t1) ?? segs[segs.length - 1];
    const v = poseAt(seg.action, tt - seg.t0);
    const p = pct(tt);
    body += `${p}{transform:translateY(${fx(v.ty)}px) rotate(${fx(v.rot)}deg) scale(${fx(v.sx, 3)},${fx(v.sy, 3)})}`;
    const happy = seg.action === 'happy' ? 1 : 0;
    for (const [key, val] of [['eh', happy], ['ld', 1 - happy]] as const) {
      const list = toggles[key];
      if (!list.length || list[list.length - 1][1] !== val || i === n) list.push([p, val]);
    }
  }
  const eh = toggles.eh.map(([p, v]) => `${p}{opacity:${v}}`).join('');
  const ld = toggles.ld.map(([p, v]) => `${p}{visibility:${v ? 'visible' : 'hidden'}}`).join('');
  return [
    `@keyframes pos-${id}{${pos}}`,
    `@keyframes body-${id}{${body}}`,
    `@keyframes eh-${id}{${eh}}`,
    `@keyframes ld-${id}{${ld}}`,
    `.${id} .pos{animation:pos-${id} ${T}s linear infinite}`,
    `.${id} .body-g{animation:body-${id} ${T}s linear infinite}`,
    `.${id} .eyes-happy{animation:eh-${id} ${T}s step-end infinite}`,
    `.${id} .spark{animation:eh-${id} ${T}s step-end infinite,twinkle 1s ease-in-out infinite}`,
    `.${id} .lid{animation:lid var(--blink) linear infinite,ld-${id} ${T}s step-end infinite}`,
  ].join('\n');
}
