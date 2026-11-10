import { describe, expect, it } from 'vitest';
import { progress, type Activity } from '../src/game';
import { escapeXml, farm, line, message, petSize } from '../src/render';

const busy: Activity = { commits: 500, mergedPrs: 3, recentDays: [2, 0, 0], mergedRecently: false };
const idle: Activity = { commits: 10, mergedPrs: 0, recentDays: [0, 0, 0], mergedRecently: false };

const images = (svg: string) => svg.match(/<image href="data:image\/png/g)?.length ?? 0;

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
    const svg = farm('octocat', progress(busy));
    expect(svg).toContain('@octocat · Lv.11 · 초사 검정 3급');
    expect(svg).toContain('풀뽑기 500 + 토벌 3×10 = 530점');
  });

  it('tags each pet with its own level', () => {
    const svg = farm('octocat', progress(busy));
    expect(svg).toContain('치이카와 Lv.11');
    expect(svg).toContain('모몽가 Lv.3');
  });

  it('shows the way to the next level and pet', () => {
    const svg = farm('octocat', progress(idle));
    expect(svg).toContain('Lv.2까지 40점');
    expect(svg).toContain('다음 친구: 하치와레까지 40점');
  });

  it('celebrates a full farm', () => {
    expect(farm('octocat', progress(busy))).toContain('친구 4명이 모두 모였어요');
  });

  it('escapes the username', () => {
    expect(farm('<x>', progress(idle))).toContain('@&#60;x&#62;');
  });
});

describe('petSize', () => {
  it('grows from 64px to 88px and stops at Lv.40', () => {
    expect(petSize(1)).toBe(64);
    expect(petSize(40)).toBe(88);
    expect(petSize(99)).toBe(88);
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
