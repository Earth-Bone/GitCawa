import { Hono, type Context } from 'hono';
import { isCharacterId } from './characters';
import { progress, type Progress } from './game';
import { fetchActivity, isLogin } from './github';
import { farm, line, message } from './render';

type Env = { Bindings: { GITHUB_TOKEN: string } };

const MAX_AGE = 1800;

const app = new Hono<Env>();

app.get('/', (c) =>
  c.text(
    [
      'chiicawa: GitHub 활동으로 먼작귀 친구들을 키워요 (비공식 팬 프로젝트)',
      '',
      `farm: ${new URL(c.req.url).origin}/farm/{username}`,
      `line: ${new URL(c.req.url).origin}/line/{username}?pet=chiikawa|hachiware|usagi|momonga`,
    ].join('\n'),
  ),
);

app.get('/farm/:user', (c) => withProgress(c, (user, p) => farm(user, p)));

app.get('/line/:user', (c) =>
  withProgress(c, (user, p) => {
    const want = c.req.query('pet') ?? '';
    const pet = isCharacterId(want) && p.unlocked.includes(want) ? want : p.unlocked[p.unlocked.length - 1];
    return line(user, p, pet);
  }),
);

function svg(c: Context<Env>, body: string, status: 200 | 404 | 502 = 200, maxAge = MAX_AGE) {
  return c.body(body, status, {
    'content-type': 'image/svg+xml; charset=utf-8',
    'cache-control': `public, max-age=${maxAge}`,
  });
}

async function withProgress(c: Context<Env>, draw: (user: string, p: Progress) => string) {
  const user = c.req.param('user')!.replace(/\.svg$/, '');
  if (!isLogin(user)) return svg(c, message('GitHub 사용자 이름이 올바르지 않아요'), 404);

  const cache = typeof caches === 'undefined' ? undefined : caches.default;
  const hit = await cache?.match(c.req.url);
  if (hit) return hit;

  let activity;
  try {
    activity = await fetchActivity(user, c.env.GITHUB_TOKEN);
  } catch {
    return svg(c, message('GitHub에서 정보를 가져오지 못했어요. 잠시 후 다시 열어 주세요'), 502, 60);
  }
  if (!activity) return svg(c, message(`@${user} 사용자를 찾지 못했어요`), 404, 300);

  const res = svg(c, draw(user, progress(activity)));
  c.executionCtx.waitUntil(cache?.put(c.req.url, res.clone()) ?? Promise.resolve());
  return res;
}

export default app;
