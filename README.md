<div align="center">

# GitCawa

**커밋할수록 먼작귀 친구들이 자라는 GitHub 프로필 농장**

<img src="https://gitcawa.gitcawa.workers.dev/farm/minwoo-3" width="600" alt="GitCawa farm" />

![version](https://img.shields.io/github/v/release/Earth-Bone/GitCawa?include_prereleases&label=version&color=f2b84b)
![status](https://img.shields.io/badge/status-beta-9fd17f)

</div>

> [!NOTE]
> 지금은 **베타**예요. 규칙과 모양이 바뀔 수 있어요.

## 시작하기

프로필 README(`{아이디}/{아이디}` 저장소)에 한 줄만 붙여 넣으세요. `{username}`은 내 GitHub 아이디로 바꿔요. 가입이나 설치는 필요 없어요.

```md
<img src="https://gitcawa.gitcawa.workers.dev/farm/{username}" width="600" alt="GitCawa farm" />
```

## 농장 읽는 법

| 위치 | 보이는 것 | 뜻 |
|---|---|---|
| 왼쪽 위 | `@아이디 · Lv.N · 초사 검정 N급` | 내 레벨과 등급 |
| 왼쪽 위 아래 줄 | `다음 친구: ○○까지 N점` | 다음 친구가 오기까지 남은 점수 |
| 친구 발밑 | `치이카와 Lv.N` | 친구 이름과 친구 레벨 |
| 왼쪽 아래 | `풀뽑기 N + 토벌 N×10 = N점` | 내 점수 계산식 |
| 오른쪽 아래 | 노란 게이지 | 다음 레벨까지 남은 점수 |

## 자라는 규칙

모든 기준은 **점수** 하나예요.

```
점수 = 커밋 수 × 1  +  merge된 PR 수 × 10
       (풀뽑기, 최근 1년)  (토벌, 전체 기간)
```

**친구가 오는 점수**

| 치이카와 | 하치와레 | 우사기 | 모몽가 |
|:---:|:---:|:---:|:---:|
| 처음부터 | 50점 | 150점 | 400점 |

**레벨** (둘 다 50점마다 1씩, 최대 Lv.99)

- 내 레벨 = 1 + (점수 ÷ 50의 몫)
- 친구 레벨 = 1 + ((점수 − 그 친구가 온 점수) ÷ 50의 몫)
- 친구 레벨이 오를수록 몸집이 커져요 (Lv.40까지).

**초사 검정**

| 5급 | 4급 | 3급 | 2급 | 1급 |
|:---:|:---:|:---:|:---:|:---:|
| 0점 | 100점 | 300점 | 700점 | 1,500점 |

**요즘 분위기** (최근 3일 기준)

| PR이 merge됐어요 | 활동이 있어요 | 활동이 없어요 |
|:---:|:---:|:---:|
| 신나서 자주 뛰어요 | 돌아다니다 가끔 뛰어요 | 모두 잠들어요 💤 |

<details>
<summary>계산 예시: 커밋 120개, merge된 PR 5개</summary>

- 점수: 120 × 1 + 5 × 10 = **170점**
- 친구: 치이카와, 하치와레, 우사기 (모몽가까지 230점)
- 내 레벨: 1 + 3 = **Lv.4** (Lv.5까지 30점)
- 친구 레벨: 치이카와 Lv.4, 하치와레 Lv.3 (170 − 50 = 120점), 우사기 Lv.1 (170 − 150 = 20점)
- 초사 검정: **4급**

</details>

## 자주 묻는 질문

<details>
<summary>커밋했는데 농장이 그대로예요</summary>

이미지는 30분마다 새로 그려요. GitHub도 이미지를 잠깐 저장해 두기 때문에 조금 기다려 주세요.

</details>

<details>
<summary>비공개 저장소 커밋도 세나요?</summary>

GitHub 프로필 설정에서 "Private contributions"를 켜면 개수만 포함돼요. 저장소 내용은 보지 않아요.

</details>

<details>
<summary>점수가 줄었어요</summary>

커밋은 최근 1년만 세요. 1년이 지난 커밋은 빠져요. merge된 PR은 계속 남아요.

</details>

<details>
<summary>친구 한 마리만 보여 줄 수 있나요?</summary>

한 줄짜리 이미지가 있어요. `pet`에는 `chiikawa`, `hachiware`, `usagi`, `momonga` 중 하나를 넣어요.

```md
<img src="https://gitcawa.gitcawa.workers.dev/line/{username}?pet=chiikawa" width="600" alt="GitCawa line" />
```

</details>

## 업데이트 내역

전체 내역은 [릴리즈](https://github.com/Earth-Bone/GitCawa/releases)에서 볼 수 있어요.

**v0.3.0-beta** (2026-11-10)

- 친구들이 들판 앞뒤로 뛰어다녀요. 멀리 가면 작아지고, 가까이 오면 커져요.
- 신나면 깡충깡충 뛰면서 이동해요.
- 가는 방향을 바라보고, 발밑에 그림자가 생겨요.

<details>
<summary>이전 버전</summary>

**v0.2.0-beta** (2026-11-10)

- 농장 배경을 꽃 들판 그림으로 바꿨어요. 어두운 테마에서는 밤처럼 어두워져요.
- 글씨를 픽셀 글꼴(갈무리11)로 바꿨어요.
- 농장에 점수 계산식을 보여 줘요.

**v0.1.0-beta** (2026-11-10)

- 첫 베타. 친구 4명, 점수와 레벨, 초사 검정, 분위기, 눈 깜빡임과 표정, 밝은/어두운 테마

</details>

## 개발

<details>
<summary>실행과 배포</summary>

Cloudflare Workers + Hono + TypeScript로 만들었어요.

```sh
npm install
npm test               # 테스트
npm run typecheck      # 타입 검사
```

GitHub 토큰이 필요해요. 공개 저장소 읽기 전용 fine-grained 토큰이면 충분해요.

```sh
echo "GITHUB_TOKEN=github_pat_..." > .dev.vars
npm run dev                                      # 로컬 실행

pbpaste | npx wrangler secret put GITHUB_TOKEN   # 토큰을 복사한 뒤 등록
npm run deploy                                   # 배포
```

</details>

<details>
<summary>폴더 구조</summary>

```
src/
  index.ts                 주소 처리와 캐시
  github.ts                GitHub에서 활동 가져오기
  game.ts                  점수, 레벨, 등급, 친구, 분위기
  motion.ts                걷기와 점프를 CSS 애니메이션으로 바꾸기
  render.ts                농장 그리기
  characters.ts            친구 목록과 만나는 점수
  *.generated.ts           그림, 배경, 글꼴 (자동 생성)
design/
  source/                  원본 그림과 배경
  sprites/                 배경을 지운 그림
  fonts/                   갈무리11 글꼴과 라이선스
  characters.json          크기, 위치, 눈 좌표, 깜빡임 간격
  tools/                   배경 지우기, 눈 찾기, 내보내기
```

</details>

<details>
<summary>캐릭터 그림 바꾸기</summary>

Python이 필요해요.

```sh
python3 -m venv design/.venv
design/.venv/bin/pip install -r design/requirements.txt

design/.venv/bin/python -I design/tools/cutout.py design/source/usagi.png design/sprites/usagi.png  # 배경 지우기
design/.venv/bin/python -I design/tools/eyes.py design/sprites/usagi.png                          # 눈 위치 찾기
npm run sprites                                                                                    # 코드에 반영
```

속이 빈 눈은 자동으로 못 찾아요. `design/characters.json`에 좌표를 직접 적어 주세요. 한국어 문구를 새로 넣었다면 `npm run font`도 실행해 주세요.

</details>

## 만든 것들

- 글꼴: [갈무리](https://github.com/quiple/galmuri) (이민서, SIL Open Font License 1.1)
- 영감: [GitAnimals](https://github.com/git-goods/gitanimals)

비공식 팬 프로젝트예요. 치이카와와 등장 캐릭터의 권리는 나가노 작가와 치이카와 위원회에 있어요. 수익을 내지 않으며, 권리자가 요청하면 바로 내릴게요.
