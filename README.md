# pumpkin-web

사탕바구니 클라이언트. React 19 + TypeScript + Vite, 모션은 `motion`.

## 실행

```bash
pnpm install
pnpm dev          # http://127.0.0.1:5173  (/api/* 는 127.0.0.1:8000 으로 프록시)
pnpm build
```

## 화면

| 경로 | 화면 |
|---|---|
| `/` | 바구니 만들기. 이미 있으면 `/me`로 |
| `/me` | 대기 화면. 호박 통 더미 + 링크 뿌리기. 8초마다 폴링해서 새 사탕 도착 연출 |
| `/me/open` | 개봉. 호박이 켜지고 사탕이 그리드로 흩어진다. 아무거나 눌러 팝업에서 깐다. 깐 기록은 localStorage |
| `/b/:slug` | 사탕 넣기. 공유 링크가 여기로 온다. 로그인 없음 |

## 구조

- `src/assets/CandyDefs.tsx` — 사탕 12종·호박 통 SVG 정의 (design-system-v1.html 원본). 문서에 한 번만 심고 `<use>`로 참조
- `src/components/Pumpkin.tsx` — 호박 통. 더미, 떨어지는 연출, 얼굴 점등
- `src/components/CandyReveal.tsx` — 사탕 까기 팝업
- `src/lib/pile.ts` — 바구니 안 사탕 자리 24개
- `src/styles/tokens.css` — 디자인 토큰

모션을 줄이는 설정(prefers-reduced-motion)을 켠 사용자에게는 깜빡임·낙하 연출을 끈다.

## 배포 — Cloudflare Workers (GitHub 연동)

레포에 `wrangler.jsonc` 와 `worker/index.ts` 가 있다. 정적 파일은 에셋으로 서빙하고, `/api/*` 만 Worker 가 받아 Cloud Run 으로 프록시한다. 그래서 CORS 가 없다.

Cloudflare 대시보드에서 Workers & Pages → Create → Import a repository 로 `waverdeep/pumpkin-web` 을 고르고:

| 항목 | 값 |
|---|---|
| Build command | `pnpm build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

`API_ORIGIN`(Cloud Run 주소)은 `wrangler.jsonc` 의 `vars` 에 있다. 배포마다 이 값이 적용되므로 대시보드가 아니라 파일을 고쳐 푸시한다. 비어 있으면 `/api/*` 가 503 을 준다.

커스텀 도메인 `pumpkin.zzam.today` 는 `wrangler.jsonc` 의 `routes` 에 있어서 배포 때 자동으로 붙는다. `zzam.today` 가 같은 계정에 있어야 한다.

로컬에서 확인:

```bash
pnpm preview:worker   # 빌드 후 wrangler dev. .dev.vars 에 API_ORIGIN=http://127.0.0.1:8000
```
