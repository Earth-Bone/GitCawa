# GitCawa

GitHub에서 활동할수록 먼작귀 친구들이 자라는 README 농장이에요.

**현재 버전: v0.1.0-beta** (베타라 규칙과 모양이 바뀔 수 있어요) · [업데이트 내역](#업데이트-내역)

<img src="https://gitcawa.gitcawa.workers.dev/farm/minwoo-3" width="100%" alt="GitCawa farm" />

> 비공식 팬 프로젝트예요. 치이카와와 등장 캐릭터의 권리는 나가노 작가와 치이카와 위원회에 있어요. 수익을 내지 않으며, 권리자가 요청하면 바로 내릴게요.

## 1분 만에 붙이기

프로필 README(`{아이디}/{아이디}` 저장소의 `README.md`)에 아래 한 줄을 넣고, `{username}`을 내 GitHub 아이디로 바꾸면 끝이에요. 가입은 필요 없어요.

```md
<img src="https://gitcawa.gitcawa.workers.dev/farm/{username}" width="100%" alt="GitCawa farm" />
```

## 어떻게 자라나요?

**1. 활동하면 점수가 쌓여요**

| GitHub 활동 | 농장에서는 | 점수 |
|---|---|---|
| 커밋 (최근 1년) | 풀뽑기 | 1점 |
| merge된 PR (전체) | 토벌 | 10점 |

**2. 점수가 쌓이면 친구가 늘어요**

| 친구 | 만나는 점수 |
|---|---|
| 치이카와 | 처음부터 |
| 하치와레 | 50점 |
| 우사기 | 150점 |
| 모몽가 | 400점 |

**3. 친구마다 레벨이 올라요**

- 친구는 농장에 온 뒤로 50점마다 1레벨씩 올라요 (최대 Lv.99).
- 레벨이 오를수록 몸집이 커져요 (Lv.40까지).
- 이름표에 친구 레벨이 보여요.

**4. 내 등급도 올라요**

- 내 레벨: 전체 점수 50점마다 1씩 올라요. 오른쪽 아래 게이지가 다음 레벨까지 남은 점수예요.
- 초사 검정: 100 / 300 / 700 / 1500점에서 5급 → 1급으로 올라요.

**5. 요즘 활동에 따라 분위기가 바뀌어요**

| 최근 3일 | 친구들 |
|---|---|
| PR이 merge됐어요 | 신나서 자주 뛰어요 |
| 활동이 있어요 | 돌아다니다 가끔 뛰어요 |
| 활동이 없어요 | 모두 잠들어요 💤 |

## 알아 두면 좋아요

- 이미지는 30분마다 새로 그려요. 방금 한 커밋은 조금 늦게 반영될 수 있어요.
- 공개 활동만 세요. 비공개 저장소 커밋은 GitHub 설정에서 "Private contributions"를 켜야 포함돼요.
- 친구 한 마리만 걷는 한 줄짜리 이미지도 있어요: `/line/{username}?pet=chiikawa` (`hachiware`, `usagi`, `momonga`도 가능)

## 업데이트 내역

배포할 때마다 버전을 올리고 [릴리즈](https://github.com/Earth-Bone/GitCawa/releases)를 남겨요.

### v0.1.0-beta (2026-11-10)

첫 베타예요.

- 농장 이미지: `/farm/{username}`
- 친구 4명: 치이카와, 하치와레, 우사기, 모몽가
- 점수: 커밋 1점, merge된 PR 10점
- 친구별 레벨과 몸집 성장, 이름표
- 내 레벨 게이지, 초사 검정 등급, 다음 친구 안내
- 최근 활동에 따라 뛰기, 걷기, 잠자기
- 눈 깜빡임과 표정, 밝은/어두운 테마
- 한 줄 이미지: `/line/{username}?pet=`

## 개발

Cloudflare Workers + Hono + TypeScript로 만들었어요.

```sh
npm install
npm test               # 테스트
npm run typecheck      # 타입 검사
```

로컬 실행과 배포에는 GitHub 토큰이 필요해요. 공개 저장소 읽기 전용 fine-grained 토큰이면 충분해요.

```sh
echo "GITHUB_TOKEN=github_pat_..." > .dev.vars
npm run dev                                      # 로컬 실행

pbpaste | npx wrangler secret put GITHUB_TOKEN   # 토큰을 복사한 뒤 등록
npm run deploy                                   # 배포
```

<details>
<summary>폴더 구조</summary>

```
src/
  index.ts              주소 처리와 캐시
  github.ts             GitHub에서 활동 가져오기
  game.ts               점수, 레벨, 등급, 친구, 분위기
  motion.ts             걷기와 점프를 CSS 애니메이션으로 바꾸기
  render.ts             농장 그리기
  characters.ts         친구 목록과 만나는 점수
  sprites.generated.ts  캐릭터 그림 (자동 생성)
design/
  source/               원본 그림
  sprites/              배경을 지운 그림
  characters.json       크기, 위치, 눈 좌표, 깜빡임 간격
  tools/                배경 지우기, 눈 찾기, 내보내기
```

</details>

<details>
<summary>캐릭터 그림 바꾸기</summary>

Python과 Pillow가 필요해요.

```sh
python3 -m venv design/.venv
design/.venv/bin/pip install -r design/requirements.txt

design/.venv/bin/python -I design/tools/cutout.py design/source/usagi.png design/sprites/usagi.png  # 배경 지우기
design/.venv/bin/python -I design/tools/eyes.py design/sprites/usagi.png                          # 눈 위치 찾기
npm run sprites                                                                                    # 코드에 반영
```

속이 빈 눈은 자동으로 못 찾아요. `design/characters.json`에 좌표를 직접 적어 주세요.

</details>
