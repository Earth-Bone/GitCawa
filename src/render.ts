import { art, SPRITE_SIZE, type CharacterId } from './characters';
import { POINTS_PER_LEVEL, type Progress } from './game';
import { keyframes, plan, rng, type Step } from './motion';

const FONT = "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif";

/** shared look; the scene follows the viewer's light or dark theme */
const BASE_CSS = `
:root{--sky:#cfe8f7;--sky2:#e6f4fb;--hill:#a9d39a;--grass:#7cbf6a;--grass2:#5fa651;--tuft:#3f8a3d;--sign:#b98a5a;--sign2:#8a6340;--chip:rgba(255,255,255,.88);--chip-fg:#26302a;--zzz:#6d86b8;--bar-bg:rgba(38,48,42,.15)}
@media (prefers-color-scheme:dark){:root{--sky:#1d2b4a;--sky2:#283a5e;--hill:#2f5a3a;--grass:#3a6e3c;--grass2:#30602f;--tuft:#234a24;--sign:#8a6845;--sign2:#5e4430;--chip:rgba(20,26,23,.85);--chip-fg:#e4ece6;--zzz:#9fb6e6;--bar-bg:rgba(228,236,230,.2)}}
.ch .body-g,.ch .spark,.ch .zzz{transform-box:fill-box}
.ch .body-g{transform-origin:50% 100%}
.ch .spark{transform-origin:50% 50%}
.ch .eyes-closed,.ch .eyes-happy,.ch .spark,.ch .zzz{opacity:0}
.ch .lid{opacity:0;animation:lid var(--blink,4.2s) linear infinite}
.st-sleep .body-g{animation:snooze 3.6s ease-in-out infinite}
.st-sleep .eyes-closed{opacity:1}
.st-sleep .zzz{opacity:1;animation:zzz 2.4s ease-in-out infinite}
.st-sleep .lid{animation:none;opacity:0}
@keyframes snooze{0%,100%{transform:rotate(-6deg) scale(1,1)}50%{transform:rotate(-6deg) scale(1.03,.95)}}
@keyframes lid{0%,93%{opacity:0}93.5%,96.5%{opacity:1}97%,100%{opacity:0}}
@keyframes twinkle{0%,100%{transform:scale(.6)}50%{transform:scale(1.1)}}
@keyframes zzz{0%{transform:translate(0,4px);opacity:0}30%{opacity:1}100%{transform:translate(6px,-8px);opacity:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

/** rough text width: Hangul is about one em wide, Latin and digits about 0.6 em */
export function textWidth(text: string, size: number): number {
  let w = 0;
  for (const ch of text) w += /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/.test(ch) ? size * 0.92 : size * 0.6;
  return Math.ceil(w);
}

export function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const star = (cx: number, cy: number, r: number) =>
  `<path d="M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z" fill="#ffd54a" stroke="#4a3a30" stroke-width="1.2" stroke-linejoin="round"/>`;

const extras = () =>
  `<g class="spark">${star(8, 14, 6)}${star(92, 10, 5)}${star(96, 44, 4)}</g>` +
  `<g class="zzz"><text x="78" y="20" font-family="${FONT}" font-weight="700" font-size="16" fill="var(--zzz)">z</text>` +
  `<text x="88" y="8" font-family="${FONT}" font-weight="700" font-size="11" fill="var(--zzz)">z</text></g>`;

/** eye overlays in sprite pixels: blink lid, closed eyes, happy eyes */
function faces(id: CharacterId): string {
  const c = art(id);
  const cover = c.eyes.map((o) => `<ellipse cx="${o.cx}" cy="${o.cy}" rx="${o.rx + 4}" ry="${o.ry + 4}" fill="${o.skin}"/>`).join('');
  const arc = (up: boolean) =>
    c.eyes
      .map((o) => {
        const x0 = o.cx - o.rx * 1.05;
        const x1 = o.cx + o.rx * 1.05;
        const d = up
          ? `M${x0} ${o.cy + o.ry * 0.4}Q${o.cx} ${o.cy - o.ry * 0.9} ${x1} ${o.cy + o.ry * 0.4}`
          : `M${x0} ${o.cy}Q${o.cx} ${o.cy + o.ry * 0.9} ${x1} ${o.cy}`;
        return `<path d="${d}" fill="none" stroke="${c.ink}" stroke-width="5" stroke-linecap="round"/>`;
      })
      .join('');
  return (
    `<g class="lid" style="--blink:${c.blink}s">${cover}${arc(false)}</g>` +
    `<g class="eyes-closed">${cover}${arc(false)}</g><g class="eyes-happy">${cover}${arc(true)}</g>`
  );
}

/** one character in a 100x100 box, feet on the bottom edge */
export function character(id: CharacterId): string {
  const c = art(id);
  const z = c.scale;
  const u = (100 * z) / SPRITE_SIZE;
  const ox = 50 - 50 * z + c.dx * u;
  const oy = 100 - 100 * z;
  return (
    `<g class="body-g"><image href="${c.img}" x="${ox}" y="${oy}" width="${100 * z}" height="${100 * z}"/>` +
    `<g transform="translate(${ox} ${oy}) scale(${u})">${faces(id)}</g></g>${extras()}`
  );
}

function actor(cls: string, id: CharacterId, x: number, y: number, size: number, inner = ''): string {
  return (
    `<g class="${cls}" transform="translate(${x} ${y})"><g class="pos">${inner}` +
    `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible"><g class="ch">${character(id)}</g></svg></g></g>`
  );
}

function sleeper(id: CharacterId, x: number, y: number, size: number, inner = ''): string {
  return (
    `<g transform="translate(${x} ${y})">${inner}` +
    `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible"><g class="ch st-sleep">${character(id)}</g></svg></g>`
  );
}

function tufts(rand: () => number, count: number, y0: number, y1: number, w: number): string {
  let s = '';
  for (let i = 0; i < count; i++) {
    const x = Math.round((rand() * (w - 12)) / 4) * 4;
    const y = Math.round((y0 + rand() * (y1 - y0)) / 4) * 4;
    s += `<path d="M${x} ${y}q2 -7 4 -9M${x + 5} ${y}q0 -8 1 -11M${x + 10} ${y}q-1 -6 -3 -8" fill="none" stroke="var(--tuft)" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  return s;
}

function chip(x: number, y: number, text: string): string {
  const w = textWidth(text, 12) + 16;
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="22" rx="4" fill="var(--chip)"/>` +
    `<text x="${x + 8}" y="${y + 15}" font-family="${FONT}" font-size="12" fill="var(--chip-fg)">${escapeXml(text)}</text>`
  );
}

/** pill under the feet of a pet that is `size` px tall */
function nameTag(text: string, cx: number, size: number): string {
  const w = textWidth(text, 11.5) + 14;
  return (
    `<rect x="${cx - w / 2}" y="${size + 2}" width="${w}" height="18" rx="9" fill="var(--chip)"/>` +
    `<text x="${cx}" y="${size + 15}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="11.5" fill="var(--chip-fg)">${escapeXml(text)}</text>`
  );
}

function svg(w: number, h: number, label: string, css: string, body: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(label)}">` +
    `<style>${BASE_CSS}${css}</style>${body}</svg>`
  );
}

/** farm lanes by feet position, back to front */
const LANES = [
  { feet: 190, x: 470 },
  { feet: 202, x: 250 },
  { feet: 222, x: 60 },
  { feet: 240, x: 380 },
];

/** pets grow from 64px at Lv.1 to 88px at Lv.40 */
export const petSize = (level: number) => Math.round(64 + (24 * (Math.min(level, 40) - 1)) / 39);

function levelBar(p: Progress): string {
  const filled = p.toNextLevel === 0 ? 1 : 1 - p.toNextLevel / POINTS_PER_LEVEL;
  const text = p.toNextLevel === 0 ? '최고 레벨이에요' : `Lv.${p.level + 1}까지 ${p.toNextLevel}점`;
  return (
    `<g transform="translate(424 262)"><rect width="164" height="30" rx="4" fill="var(--chip)"/>` +
    `<text x="8" y="13" font-family="${FONT}" font-size="11" fill="var(--chip-fg)">${text}</text>` +
    `<rect x="8" y="19" width="148" height="5" rx="2.5" fill="var(--bar-bg)"/>` +
    `<rect x="8" y="19" width="${Math.round(148 * filled)}" height="5" rx="2.5" fill="#f2b84b"/></g>`
  );
}

export function farm(username: string, p: Progress): string {
  const rand = rng(username);
  const pets = p.pets.slice(-LANES.length);
  const css: string[] = [];
  const actors = pets.map((pet, i) => {
    const lane = LANES[(i + LANES.length - pets.length) % LANES.length];
    const size = petSize(pet.level);
    const tag = nameTag(`${art(pet.id).name} Lv.${pet.level}`, size / 2, size);
    if (p.mood === 'sleepy') return sleeper(pet.id, lane.x, lane.feet - size, size, tag);
    const cls = `a${i}`;
    css.push(keyframes(cls, lane.x, plan(p.mood, lane.x, 20, 500, rng(`${username}/${pet.id}`))));
    return actor(cls, pet.id, lane.x, lane.feet - size, size, tag);
  });
  const next = p.nextPet ? `다음 친구: ${art(p.nextPet.id).name}까지 ${p.nextPet.need}점` : `친구 ${p.pets.length}명이 모두 모였어요`;

  const body =
    `<rect width="600" height="300" fill="var(--sky)"/><rect width="600" height="40" fill="var(--sky2)"/>` +
    `<ellipse cx="120" cy="128" rx="190" ry="44" fill="var(--hill)"/><ellipse cx="480" cy="124" rx="210" ry="48" fill="var(--hill)"/>` +
    `<rect y="116" width="600" height="184" fill="var(--grass)"/><rect y="116" width="600" height="5" fill="var(--grass2)"/>` +
    tufts(rand, 28, 140, 292, 600) +
    `<g transform="translate(528 70)"><rect x="10" y="22" width="8" height="40" rx="2" fill="var(--sign2)"/>` +
    `<rect x="-16" y="0" width="60" height="30" rx="6" fill="var(--sign)"/>` +
    `<text x="14" y="20" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="14" fill="#fff">풀뽑기</text></g>` +
    actors.join('') +
    chip(12, 12, `@${username} · Lv.${p.level} · 초사 검정 ${p.grade}급`) +
    chip(12, 40, next) +
    chip(12, 266, `풀뽑기 ${p.commits.toLocaleString('en-US')} · 토벌 ${p.mergedPrs.toLocaleString('en-US')}`) +
    levelBar(p);

  return svg(600, 300, `${username}의 먼작귀 농장`, css.join('\n'), body);
}

export function line(username: string, p: Progress, pet: CharacterId): string {
  const rand = rng(username);
  const tag = nameTag(`${art(pet).name} Lv.${p.level}`, 38, 76);
  let css = '';
  let who: string;
  if (p.mood === 'sleepy') {
    who = sleeper(pet, 262, 30, 76, tag);
  } else {
    // start on screen so the first frame is never empty, exit right, come back from the left
    const steps: Step[] = [
      { action: 'idle', dur: 1 },
      { action: 'walk', dur: 5.5, to: 220 },
      { action: p.mood === 'party' ? 'happy' : 'idle', dur: 2 },
      { action: 'walk', dur: 7, to: 460 },
      { action: 'idle', dur: 2 },
      { action: 'walk', dur: 7, to: 700 },
      { action: 'idle', dur: 0.05, to: -90 },
      { action: 'walk', dur: 3, to: 20 },
    ];
    css = keyframes('l0', 20, steps);
    who = actor('l0', pet, 20, 30, 76, tag);
  }
  const body =
    `<rect width="600" height="130" fill="var(--sky)"/><rect y="96" width="600" height="34" fill="var(--grass)"/>` +
    `<rect y="96" width="600" height="4" fill="var(--grass2)"/>` +
    tufts(rand, 10, 112, 126, 600) +
    who;
  return svg(600, 130, `${username}의 ${art(pet).name}`, css, body);
}

export function message(text: string): string {
  const body =
    `<rect width="600" height="130" fill="var(--sky)"/><rect y="96" width="600" height="34" fill="var(--grass)"/>` +
    `<text x="300" y="60" text-anchor="middle" font-family="${FONT}" font-size="16" fill="var(--chip-fg)">${escapeXml(text)}</text>`;
  return svg(600, 130, text, '', body);
}
