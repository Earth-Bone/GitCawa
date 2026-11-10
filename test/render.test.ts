import { describe, expect, it } from 'vitest';
import { progress, type Activity } from '../src/game';
import { escapeXml, farm, line, message } from '../src/render';

const busy: Activity = { commits: 500, mergedPrs: 3, recentDays: [2, 0, 0], mergedRecently: false };
const idle: Activity = { commits: 10, mergedPrs: 0, recentDays: [0, 0, 0], mergedRecently: false };

const images = (svg: string) => svg.match(/<image /g)?.length ?? 0;

describe('farm', () => {
  it('draws one actor per unlocked character', () => {
    const svg = farm('octocat', progress(busy));
    expect(images(svg)).toBe(4);
    expect(svg).toContain('@keyframes pos-a3');
  });

  it('puts everyone to sleep after quiet days', () => {
    const svg = farm('octocat', progress(idle));
    expect(images(svg)).toBe(1);
    expect(svg).toContain('st-sleep');
    expect(svg).not.toContain('@keyframes pos-');
  });

  it('is the same for the same user', () => {
    expect(farm('octocat', progress(busy))).toBe(farm('octocat', progress(busy)));
  });

  it('shows the stats', () => {
    expect(farm('octocat', progress(busy))).toContain('풀뽑기 500 · 토벌 3 · 초사 검정 3급');
  });

  it('escapes the username', () => {
    expect(farm('<x>', progress(idle))).toContain('@&#60;x&#62;');
  });
});

describe('line', () => {
  it('walks the chosen pet across', () => {
    const svg = line('octocat', progress(busy), 'usagi');
    expect(images(svg)).toBe(1);
    expect(svg).toContain('우사기 Lv.11');
    expect(svg).toContain('@keyframes pos-l0');
  });
});

describe('message', () => {
  it('renders plain text', () => {
    expect(message('없는 사용자예요')).toContain('없는 사용자예요');
  });
});

describe('escapeXml', () => {
  it('escapes markup characters', () => {
    expect(escapeXml(`a&b"c'`)).toBe('a&#38;b&#34;c&#39;');
  });
});
