import { afterEach, describe, expect, it, vi } from 'vitest';
import app from '../src/index';

const env = { GITHUB_TOKEN: 'test' };
const ctx = { waitUntil: () => {}, passThroughOnException: () => {}, props: {} } as unknown as ExecutionContext;

function github(user: unknown, merged = 0, recent = 0) {
  const fetch = vi.fn(async () =>
    Response.json({ data: { user, merged: { issueCount: merged }, recent: { issueCount: recent } } }),
  );
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

const user = (commits: number, today: number) => ({
  contributionsCollection: {
    totalCommitContributions: commits,
    contributionCalendar: { weeks: [{ contributionDays: [{ date: '2026-11-10', contributionCount: today }] }] },
  },
});

afterEach(() => vi.unstubAllGlobals());

describe('routes', () => {
  it('renders a farm', async () => {
    github(user(200, 3));
    const res = await app.request('/farm/octocat', {}, env, ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('image/svg+xml');
    expect(res.headers.get('cache-control')).toBe('public, max-age=1800');
    expect(await res.text()).toContain('@octocat · Lv.5');
  });

  it('accepts a .svg suffix', async () => {
    github(user(0, 0));
    expect((await app.request('/farm/octocat.svg', {}, env, ctx)).status).toBe(200);
  });

  it('uses the requested pet when unlocked', async () => {
    github(user(200, 3));
    const res = await app.request('/line/octocat?pet=hachiware', {}, env, ctx);
    expect(await res.text()).toContain('하치와레 Lv.5');
  });

  it('falls back to the newest pet when the requested one is locked', async () => {
    github(user(60, 3));
    const res = await app.request('/line/octocat?pet=momonga', {}, env, ctx);
    expect(await res.text()).toContain('하치와레 Lv.2');
  });

  it('rejects bad usernames without calling GitHub', async () => {
    const fetch = github(user(0, 0));
    const res = await app.request('/farm/a%20is:pr', {}, env, ctx);
    expect(res.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('answers 404 for unknown users', async () => {
    github(null);
    const res = await app.request('/farm/nobody', {}, env, ctx);
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('@nobody 사용자를 찾지 못했어요');
  });

  it('answers 502 when GitHub fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })));
    const res = await app.request('/farm/octocat', {}, env, ctx);
    expect(res.status).toBe(502);
    expect(res.headers.get('cache-control')).toBe('public, max-age=60');
  });
});
