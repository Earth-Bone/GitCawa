# GitCawa

GitHub에서 활동할수록 먼작귀 친구들이 자라는 README 농장이에요.

**현재 버전: v0.2.0-beta** (베타라 규칙과 모양이 바뀔 수 있어요) · [업데이트 내역](#업데이트-내역)

<img src="https://gitcawa.gitcawa.workers.dev/farm/minwoo-3" width="600" alt="GitCawa farm" />

> 글꼴: [갈무리](https://github.com/quiple/galmuri) (이민서, SIL Open Font License 1.1)
>
> 비공식 팬 프로젝트예요. 치이카와와 등장 캐릭터의 권리는 나가노 작가와 치이카와 위원회에 있어요. 수익을 내지 않으며, 권리자가 요청하면 바로 내릴게요.

## 1분 만에 붙이기

프로필 README(`{아이디}/{아이디}` 저장소의 `README.md`)에 아래 한 줄을 넣고, `{username}`을 내 GitHub 아이디로 바꾸면 끝이에요. 가입은 필요 없어요.

```md
<img src="https://gitcawa.gitcawa.workers.dev/farm/{username}" width="600" alt="GitCawa farm" />
```

## 어떻게 자라나요?

모든 기준은 **점수** 하나로 정해져요. 농장 왼쪽 아래에 내 점수 계산식이 보여요.

### 1. 점수

```
점수 = 커밋 수 × 1 + merge된 PR 수 × 10
```

| GitHub 활동 | 농장에서는 | 점수 | 세는 범위 |
|---|---|---|---|
| 커밋 | 풀뽑기 | 1점 | 최근 1년 |
| merge된 PR | 토벌 | 10점 | 전체 기간 |

커밋은 최근 1년만 세서, 오래 쉬면 점수가 줄 수 있어요.

### 2. 친구가 추가되는 기준

점수가 아래 숫자에 닿는 순간 친구가 농장에 와요.

| 친구 | 필요한 점수 |
|---|---|
| 치이카와 | 0점 (처음부터) |
| 하치와레 | 50점 |
| 우사기 | 150점 |
| 모몽가 | 400점 |

아직 못 만난 친구가 있으면 왼쪽 위에 "다음 친구: ○○까지 N점"이 보여요.

### 3. 레벨 기준

레벨은 두 종류예요. 둘 다 **50점마다 1씩** 올라요 (최대 Lv.99).

| 레벨 | 어디에 보여요 | 계산 |
|---|---|---|
| 내 레벨 | 왼쪽 위 `@아이디 · Lv.N` | 1 + (점수 ÷ 50의 몫) |
| 친구 레벨 | 친구 이름표 | 1 + ((점수 − 그 친구가 온 점수) ÷ 50의 몫) |

친구는 농장에 온 뒤부터 레벨을 쌓아서, 먼저 온 친구일수록 레벨이 높아요. 친구 레벨이 오를수록 몸집도 커져요 (Lv.40까지).
오른쪽 아래 게이지는 **내 레벨**이 오르기까지 남은 점수예요.

### 4. 초사 검정 등급

| 등급 | 필요한 점수 |
|---|---|
| 5급 | 0점 |
| 4급 | 100점 |
| 3급 | 300점 |
| 2급 | 700점 |
| 1급 | 1,500점 |

### 예시: 커밋 120개, merge된 PR 5개

- 점수: 120 × 1 + 5 × 10 = **170점**
- 친구: 치이카와, 하치와레, 우사기 (모몽가까지 230점 남음)
- 내 레벨: 1 + 3 = **Lv.4** (Lv.5까지 30점)
- 친구 레벨: 치이카와 Lv.4, 하치와레 Lv.3 (170 − 50 = 120점), 우사기 Lv.1 (170 − 150 = 20점)
- 초사 검정: **4급**

### 5. 요즘 활동에 따른 분위기

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

### v0.2.0-beta (2026-11-10)

- 농장 배경을 꽃이 핀 들판 그림으로 바꿨어요. 어두운 테마에서는 밤처럼 어두워져요.
- 글씨를 픽셀 글꼴(갈무리11)로 바꿨어요. 어느 기기에서 봐도 같은 모양이에요.
- 농장 왼쪽 아래에 점수 계산식(`풀뽑기 + 토벌×10 = 점수`)을 보여 줘요.
- README에 레벨, 친구 추가, 등급 기준과 계산 예시를 정리했어요.

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
  background.generated.ts  농장 배경 (자동 생성)
  font.generated.ts     픽셀 글꼴 (자동 생성)
design/
  source/               원본 그림과 배경
  fonts/                갈무리11 글꼴과 라이선스
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
