import { describe, expect, it } from 'vitest';
import { isLogin, toActivity, type ActivityResponse } from '../src/github';

const res = (user: unknown, merged = 4, recent = 0) =>
  ({ data: { user, merged: { issueCount: merged }, recent: { issueCount: recent } } }) as ActivityResponse;

const user = {
  contributionsCollection: {
    totalCommitContributions: 321,
    contributionCalendar: {
      weeks: [
        { contributionDays: [{ date: '2026-11-01', contributionCount: 1 }, { date: '2026-11-02', contributionCount: 2 }] },
        { contributionDays: [{ date: '2026-11-08', contributionCount: 0 }, { date: '2026-11-09', contributionCount: 5 }] },
      ],
    },
  },
};

describe('toActivity', () => {
  it('reads counts and orders recent days newest first', () => {
    expect(toActivity(res(user))).toEqual({ commits: 321, mergedPrs: 4, recentDays: [5, 0, 2, 1], mergedRecently: false });
  });

  it('flags a recent merge', () => {
    expect(toActivity(res(user, 4, 1))?.mergedRecently).toBe(true);
  });

  it('returns null for a missing user', () => {
    expect(toActivity(res(null))).toBeNull();
  });
});

describe('isLogin', () => {
  it('accepts GitHub logins', () => {
    expect(isLogin('minwoo-3')).toBe(true);
  });

  it('rejects search qualifiers and odd names', () => {
    expect(isLogin('a is:pr')).toBe(false);
    expect(isLogin('-start')).toBe(false);
    expect(isLogin('a'.repeat(40))).toBe(false);
  });
});
