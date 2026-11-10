import { MEADOW } from './background.generated';
import { art, SPRITE_SIZE, type CharacterId } from './characters';
import { GALMURI, GALMURI_BOLD, WIDTHS } from './font.generated';
import { POINTS_PER_LEVEL, type Progress } from './game';
import { keyframes, plan, rng, type Step } from './motion';

/** Galmuri11 pixel font, embedded because README images cannot load web fonts */
const FONT = 'Galmuri11,monospace';

/** shared look; the scene follows the viewer's light or dark theme */
const BASE_CSS = `
@font-face{font-family:Galmuri11;font-weight:400;src:url(data:font/woff2;base64,${GALMURI}) format("woff2")}
@font-face{font-family:Galmuri11;font-weight:700;src:url(data:font/woff2;base64,${GALMURI_BOLD}) format("woff2")}
:root{--sky:#cfe8f7;--grass:#9fd17f;--chip:rgba(255,255,255,.9);--chip-fg:#26302a;--zzz:#6d86b8;--bar-bg:rgba(38,48,42,.15)}
.night{opacity:0}
@media (prefers-color-scheme:dark){:root{--sky:#1d2b4a;--grass:#3a6e3c;--chip:rgba(20,26,23,.85);--chip-fg:#e4ece6;--zzz:#9fb6e6;--bar-bg:rgba(228,236,230,.2)}.night{opacity:1}}
.ch .body-g,.ch .spark,.ch .zzz{transform-box:fill-box}
.ch .body-g{transform-origin:50% 100%}
.ch .spark{transform-origin:50% 50%}
.ch .face{transform-box:fill-box;transform-origin:50% 50%}
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
`;

/** text width from the embedded font's glyph advances */
export function textWidth(text: string, size: number): number {
  let w = 0;
  for (const ch of text) w += (WIDTHS[ch] ?? 1) * size;
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

/** soft shadow that keeps a pet on the grass */
const shadow = (size: number) =>
  `<ellipse cx="${size / 2}" cy="${size - 1}" rx="${fx(size * 0.28)}" ry="${fx(size * 0.06)}" fill="rgba(30,50,20,.22)"/>`;

const fx = (v: number) => Number(v.toFixed(2));

function actor(cls: string, id: CharacterId, x: number, y: number, size: number, inner = ''): string {
  return (
    `<g class="${cls}" transform="translate(${x} ${y})"><g class="pos" style="transform-origin:${size / 2}px ${size}px">` +
    shadow(size) +
    inner +
    `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible"><g class="ch"><g class="face">${character(id)}</g></g></svg></g></g>`
  );
}

function sleeper(id: CharacterId, x: number, y: number, size: number, inner = '', scale = 1): string {
  const h = size / 2;
  return (
    `<g transform="translate(${x} ${y}) translate(${h} ${size}) scale(${fx(scale)}) translate(${-h} ${-size})">` +
    shadow(size) +
    inner +
    `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible"><g class="ch st-sleep">${character(id)}</g></svg></g>`
  );
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
  const w = textWidth(text, 12) + 14;
  return (
    `<rect x="${cx - w / 2}" y="${size + 2}" width="${w}" height="18" rx="9" fill="var(--chip)"/>` +
    `<text x="${cx}" y="${size + 15}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="12" fill="var(--chip-fg)">${escapeXml(text)}</text>`
  );
}

function svg(w: number, h: number, label: string, css: string, body: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(label)}">` +
    `<style>${BASE_CSS}${css}</style>${body}</svg>`
  );
}

/** painted meadow, cropped to cover the box, dimmed at night */
function meadow(w: number, h: number): string {
  return (
    `<image href="${MEADOW}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax slice"/>` +
    `<rect class="night" width="${w}" height="${h}" fill="rgba(14,22,52,.38)"/>`
  );
}

/** farm lanes, back to front; each pet roams its own band of the meadow so the paint order stays right */
const LANES = [
  { x: 470, feet: 172, minY: 150, maxY: 190 },
  { x: 250, feet: 188, minY: 166, maxY: 206 },
  { x: 60, feet: 210, minY: 190, maxY: 228 },
  { x: 380, feet: 230, minY: 210, maxY: 248 },
];

/** pets further back (higher up) look smaller */
export const depth = (feet: number) => 0.72 + (0.33 * (feet - 150)) / 100;

/** pets grow from 64px at Lv.1 to 88px at Lv.40 */
export const petSize = (level: number) => Math.round(64 + (24 * (Math.min(level, 40) - 1)) / 39);

function levelBar(p: Progress): string {
  const filled = p.toNextLevel === 0 ? 1 : 1 - p.toNextLevel / POINTS_PER_LEVEL;
  const text = p.toNextLevel === 0 ? '최고 레벨이에요' : `Lv.${p.level + 1}까지 ${p.toNextLevel}점`;
  return (
    `<g transform="translate(424 262)"><rect width="164" height="30" rx="4" fill="var(--chip)"/>` +
    `<text x="8" y="13" font-family="${FONT}" font-size="12" fill="var(--chip-fg)">${text}</text>` +
    `<rect x="8" y="19" width="148" height="5" rx="2.5" fill="var(--bar-bg)"/>` +
    `<rect x="8" y="19" width="${Math.round(148 * filled)}" height="5" rx="2.5" fill="#f2b84b"/></g>`
  );
}

const n = (v: number) => v.toLocaleString('en-US');

export function farm(username: string, p: Progress): string {
  const pets = p.pets.slice(-LANES.length);
  const css: string[] = [];
  const actors = pets.map((pet, i) => {
    const lane = LANES[(i + LANES.length - pets.length) % LANES.length];
    const size = petSize(pet.level);
    const tag = nameTag(`${art(pet.id).name} Lv.${pet.level}`, size / 2, size);
    if (p.mood === 'sleepy') return sleeper(pet.id, lane.x, lane.feet - size, size, tag, depth(lane.feet));
    const cls = `a${i}`;
    const box = { minX: 10, maxX: 520, minY: lane.minY, maxY: lane.maxY };
    const steps = plan(p.mood, lane.x, lane.feet, box, rng(`${username}/${pet.id}`));
    css.push(keyframes(cls, lane.x, steps, { y0: lane.feet, depth }));
    return actor(cls, pet.id, lane.x, lane.feet - size, size, tag);
  });
  const next = p.nextPet ? `다음 친구: ${art(p.nextPet.id).name}까지 ${p.nextPet.need}점` : `친구 ${p.pets.length}명이 모두 모였어요`;

  const body =
    meadow(600, 300) +
    actors.join('') +
    chip(12, 12, `@${username} · Lv.${p.level} · 초사 검정 ${p.grade}급`) +
    chip(12, 40, next) +
    chip(12, 266, `풀뽑기 ${n(p.commits)} + 토벌 ${n(p.mergedPrs)}×10 = ${n(p.points)}점`) +
    levelBar(p);

  return svg(600, 300, `${username}의 먼작귀 농장`, css.join('\n'), body);
}

export function line(username: string, p: Progress, pet: CharacterId): string {
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
    meadow(600, 130) +
    who;
  return svg(600, 130, `${username}의 ${art(pet).name}`, css, body);
}

export function message(text: string): string {
  const body =
    `<rect width="600" height="130" fill="var(--sky)"/><rect y="96" width="600" height="34" fill="var(--grass)"/>` +
    `<text x="300" y="60" text-anchor="middle" font-family="${FONT}" font-size="16" fill="var(--chip-fg)">${escapeXml(text)}</text>`;
  return svg(600, 130, text, '', body);
}
