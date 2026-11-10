# GitCawa

GitHub 활동으로 먼작귀 친구들을 키우는 README 위젯이에요. 커밋하면 풀뽑기 알바를 하고, PR이 merge되면 토벌에 성공해요. 활동이 쌓이면 새 친구가 들판에 합류해요.

> 비공식 팬 프로젝트예요. 치이카와와 등장 캐릭터의 권리는 나가노 작가와 치이카와 위원회에 있어요. 수익을 내지 않으며, 권리자의 요청이 있으면 바로 내리거나 수정할게요.

<img src="https://gitcawa.gitcawa.workers.dev/farm/minwoo-3" width="100%" alt="GitCawa farm" />

<img src="https://gitcawa.gitcawa.workers.dev/line/minwoo-3?pet=momonga" width="100%" alt="GitCawa line" />

## 사용법

README에 이미지로 넣으면 돼요. `{username}` 자리에 GitHub 아이디를 넣으세요.

```md
<img src="https://gitcawa.gitcawa.workers.dev/farm/{username}" width="100%" alt="GitCawa farm" />
<img src="https://gitcawa.gitcawa.workers.dev/line/{username}?pet=hachiware" width="100%" alt="GitCawa line" />
```

| 주소 | 내용 |
|---|---|
| `/farm/{username}` | 해금한 친구들이 들판을 돌아다녀요 (600×300) |
| `/line/{username}?pet={id}` | 친구 하나가 한 줄을 가로질러 걸어요 (600×130). `pet`을 빼거나 아직 해금하지 않은 친구면 가장 최근에 해금한 친구가 나와요 |

`pet` 값: `chiikawa`, `hachiware`, `usagi`, `momonga`

이미지는 30분 동안 캐시돼요.

## 규칙

| GitHub 활동 | 세계관 | 점수 |
|---|---|---|
| 최근 1년 커밋 | 풀뽑기 | 1점 |
| merge된 PR (전체 기간) | 토벌 | 10점 |

- **레벨**: 50점마다 1씩 올라요 (최대 99).
- **초사 검정**: 100, 300, 700, 1500점에서 5급부터 1급까지 올라요.
- **친구 해금**

  | 친구 | 필요 점수 |
  |---|---|
  | 치이카와 | 0 |
  | 하치와레 | 50 |
  | 우사기 | 150 |
  | 모몽가 | 400 |

- **기분**: 최근 활동에 따라 들판 분위기가 바뀌어요.
  - 3일 안에 PR이 merge됐으면 자주 점프해요.
  - 3일 안에 활동이 있으면 걸어 다니다 가끔 점프해요.
  - 3일 동안 활동이 없으면 모두 잠들어요.

같은 사용자는 늘 같은 경로로 움직여요. 모든 움직임은 SVG 안의 CSS 애니메이션이라 README에서도 재생돼요.

## 개발

Cloudflare Workers와 Hono로 만들었어요.

```sh
npm install
npm test            # vitest
npm run typecheck
```

### 로컬 실행

GitHub 토큰이 필요해요. 권한은 공개 정보 읽기면 충분해요.

```sh
echo "GITHUB_TOKEN=ghp_..." > .dev.vars
npm run dev
```

### 배포

```sh
npx wrangler secret put GITHUB_TOKEN
npm run deploy
```

## 구조

```
src/
  index.ts              라우트와 캐시
  github.ts             GitHub GraphQL로 활동 가져오기
  game.ts               점수, 레벨, 급수, 해금, 기분
  motion.ts             걷기 일정을 CSS 키프레임으로 바꾸기
  render.ts             farm, line SVG 그리기
  characters.ts         친구 목록과 해금 점수
  sprites.generated.ts  캐릭터 그림 (생성 파일)
design/
  source/               원본 그림
  sprites/              배경을 지운 320px 그림
  characters.json       크기, 위치, 눈 좌표, 깜빡임 간격
  tools/                배경 제거, 눈 찾기, 내보내기 스크립트
```

### 캐릭터 그림 바꾸기

Python과 Pillow가 필요해요.

```sh
python3 -m venv design/.venv
design/.venv/bin/pip install -r design/requirements.txt

# 배경 지우기
design/.venv/bin/python -I design/tools/cutout.py design/source/usagi.png design/sprites/usagi.png
# 눈 위치 찾기 (속이 빈 눈은 characters.json에 직접 적어요)
design/.venv/bin/python -I design/tools/eyes.py design/sprites/usagi.png
# src/sprites.generated.ts 다시 만들기
npm run sprites
```

`design/tools/build.py`를 실행하면 네 가지 동작을 한 화면에서 보는 `design/preview.html`이 만들어져요.
