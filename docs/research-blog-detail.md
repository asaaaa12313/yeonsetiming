# 리서치 보고서 — 블로그 상세 페이지(자체 뷰어) 도입

> **목적**: 현재 카드 클릭 → 외부 네이버 블로그로 즉시 이탈하는 구조를, **홈페이지 내에서 글·사진을 보고**, 별도 "네이버 블로그 바로가기" 버튼으로만 외부 이동하는 구조로 개편하기 위한 사전 조사.
>
> 작업 디렉터리: `ystiming-redesign-v3/`

---

## 1. 현재 블로그 영역 구성

### 1-1. 메인 페이지(index.html)
- **블로그 카드 섹션 없음.** 헤더 메뉴, 메가메뉴(`index.html:217-219`), 모바일 드로어, 풋터 아이콘(`index.html:634-636`), 우측 퀵메뉴(`index.html:660-663`)에서만 "블로그" 링크가 노출됨.
- 메가메뉴에서는 두 항목 병기:
  - "임상 케이스 모아보기" → `blog.html` (내부)
  - "네이버 블로그 바로가기" → `https://blog.naver.com/wyyezbrmztora` (외부, `target="_blank"`)
- ⇒ 현재 사용자가 말한 "블로그 영역"은 **`blog.html` 본체**를 가리킴(메인의 카드 섹션은 존재하지 않음).

### 1-2. 블로그 목록 페이지(blog.html)
- **서브 히어로**(`blog.html:228-231`) + **인트로 카피**(`240-247`) + **카테고리 필터**(`250-253`, `tablist`) + **카드 그리드**(`256-364`) + **페이지네이션**(`370`) + **"네이버 블로그에서 더 많은 글 보기" 아웃바운드 버튼**(`373-378`).
- 카드 그리드 안에 `<!-- BLOG_SSG_START --> ... <!-- BLOG_SSG_END -->` 마커로 둘러싸인 9장의 사전 렌더 카드. GitHub Actions(아래 §1-5)가 매번 다시 채워 넣음.
- 모든 카드 `<a>`는 `href="https://blog.naver.com/.../{logNo}"` + `target="_blank"` + `rel="noopener"`. 즉 **클릭 시 무조건 외부 이탈**.

### 1-3. 클라이언트 렌더링 — `js/blog.js`
- IIFE 모듈. JSON 패치 → 카테고리 필터링 → 9개씩 페이지네이션.
- `renderCard(p)` (`js/blog.js:116-138`): 카드 마크업을 문자열로 만들어 주입. **여기서 `<a href="${p.link}" target="_blank">`로 외부 링크가 박힘.** 변경 진입점은 이 함수 한 곳.
- 데이터 로드 실패 시 폴백: 네이버 블로그 한 장짜리 카드 노출(`224-234`).

### 1-4. 스타일 — `css/blog.css`
- 그리드: 데스크탑 3열(`blog-grid` `grid-template-columns: repeat(3, 1fr)`) → 1024px 이하 2열 → 640px 이하 1열.
- 카드: 1.7:1 썸네일 + 카테고리/날짜 메타 + 제목 2줄 클램프 + 요약 2줄 클램프, hover 시 `translateY(-6px)` 그림자.
- 디자인 토큰(공용 `css/common.css:8-34`): `--navy #0A1628`, `--gold #2B7AE8`(파란색으로 재정의됨), `--off-white #F5F5F0`, gray 스케일, `--dark #111827`, `--font-en Cormorant Garamond`, `--max-w 1280px`.
- ⇒ 상세 페이지를 새로 만들 때 **이 토큰만 그대로 쓰면** 시각적 일관성 확보.

### 1-5. 데이터 수집 파이프라인
- **소스**: `https://rss.blog.naver.com/wyyezbrmztora.xml` (RSS).
- **스크립트**: `scripts/fetch-naver-blog.js` (Node 18+, ESM, `rss-parser` 의존).
  - `extractThumbnail()` → 본문 HTML의 첫 `<img>` src만 추출, `type=w773`로 화질 업스케일.
  - `extractSummary()` → 태그 제거 후 120자로 잘라서 `summary` 필드에 저장.
  - **본문(content) 자체는 저장하지 않음.**
- **빌드**: `scripts/build-blog-html.js`가 JSON에서 최신 9개를 골라 `blog.html`의 `BLOG_SSG_*` 마커 사이에 카드 HTML을 주입(SEO용).
- **자동화**: `.github/workflows/fetch-blog.yml`이 6시간 크론으로 ① fetch → ② build → ③ 변경 시 자동 커밋&푸시.

### 1-6. JSON 스키마 (`data/blog-posts.json`)
```jsonc
{
  "updatedAt": "2026-04-16T...",
  "blogUrl": "https://blog.naver.com/wyyezbrmztora",
  "totalCount": 50,
  "categories": ["사랑니", "연세타이밍치과", "자연치아살리기치료", "임플란트", "잇몸,연조직 질환", "심미치료"],
  "posts": [
    {
      "id": "224253518738",                    // 네이버 logNo
      "title": "...",
      "link": "https://blog.naver.com/.../224253518738?fromRss=true...",
      "category": "임플란트",
      "pubDate": "2026-04-16T00:10:00.000Z",
      "thumbnail": "https://blogthumb.pstatic.net/...?type=s3",
      "summary": "안녕하세요... (120자 컷)"
    }
  ]
}
```
**현재 스키마에서 본문/추가 이미지/대체텍스트가 모두 빠져 있음.** 상세 뷰어 도입의 가장 큰 전제 조건이 데이터 보강.

---

## 2. 핵심 기술 제약 / 고려사항

### 2-1. 본문 수집 방법 (가장 중요)
RSS는 `content:encoded`에 본문 HTML을 일부 포함하지만, **네이버 블로그 RSS는 본문이 잘려서 옴**(요약 + 이미지 1~2장 정도). 전체 본문을 얻으려면 별도 수집이 필요.

후보 소스:
| 방식 | URL 패턴 | 본문 완전성 | 안정성 | 비고 |
|---|---|---|---|---|
| **모바일 페이지 스크레이핑** | `https://m.blog.naver.com/{blogId}/{logNo}` | ★★★ 거의 풀 | ★★★ | SmartEditor 마크업 안정적, JS 없이도 본문 노출 |
| iframe 직접 임베드 | 네이버 페이지 그대로 | - | ★ | X-Frame-Options/CSP로 차단될 가능성 큼 |
| 검색 OpenAPI | `openapi.naver.com/v1/search/blog.json` | ★ 발췌만 | ★★★ | 본문 미제공, 요약만 |
| 수동 백업 | 직접 복사 | ★★★ | ★ | 운영 부담 |

→ **권장: 모바일 페이지 스크레이핑**. 본인(클리닉) 소유 블로그이므로 정책적 마찰 없음.

### 2-2. 본문 안의 비텍스트 요소
네이버 블로그 본문에는 이미지·동영상·스티커·지도·외부 링크·인용·CTA 위젯 등이 섞여 있음. 우리 사이트로 옮길 때:
- **텍스트 + 이미지** 위주로 추출하면 깔끔(권장).
- 동영상/지도/스티커 등 임베드는 잘라내고 "원문에서 보기" CTA로 우회할지, 일부만 살릴지 결정 필요.

### 2-3. 이미지 호스팅
- 현재 카드 썸네일은 네이버 CDN(`blogthumb.pstatic.net`)을 `referrerpolicy="no-referrer"`로 직접 사용 중 — 정상 노출됨.
- 본문 이미지도 동일 정책으로 직접 참조 가능. 단, 네이버가 핫링크 정책을 바꾸면 깨짐 → **백업 옵션: 깃액션에서 이미지를 우리 저장소로 다운로드**(용량 증가, LFS 또는 외부 스토리지 검토).

### 2-4. SEO / 라우팅
- **정적 빌드**(글마다 `.html`): 크롤러 친화적, 메타태그/OG/JSON-LD 정확. 깃액션이 글 수만큼 파일 생성.
- **단일 페이지 + 쿼리**(`blog-post.html?id=...`): 빌드 단순, 메타태그가 클라이언트 동적이라 SEO 약함.
- **하이브리드**(정적 HTML + 동일 데이터로 재렌더): 가장 깨끗. 현재 `BLOG_SSG_*` 마커 패턴과 결이 같음.

### 2-5. 운영 자동화
6시간 크론에 본문 스크레이프 단계를 추가하면 50개 × 1초 = ~1분 정도. 새 글만 증분 수집하도록 캐시(이미 본문이 저장된 글은 스킵)하면 부담 거의 없음.

---

## 3. 변경 영향 범위 요약

| 영역 | 파일 | 변경 강도 |
|---|---|---|
| 데이터 스키마 | `data/blog-posts.json` (스키마 확장: `bodyHtml`, `bodyText`, `images[]`, `excerpt` 등) | 중 |
| 수집 스크립트 | `scripts/fetch-naver-blog.js` (본문 스크레이프 단계 추가) **또는 신규 `scripts/fetch-naver-bodies.js`** | 중~상 |
| 빌드 스크립트 | `scripts/build-blog-html.js` (상세 페이지 빌드 또는 `posts/{id}.html` 생성) | 중 |
| 카드 링크 | `js/blog.js:126` `renderCard()`의 `href` → 내부 라우트 / `blog.html`의 SSG 카드 마크업 | 소 |
| 신규 페이지 | `blog-post.html` 또는 `posts/{id}.html` (템플릿 + 스타일) | 상 |
| 신규 스타일 | `css/blog.css`에 `.blog-detail-*` 추가 또는 `css/blog-detail.css` 분리 | 중 |
| GitHub Actions | `.github/workflows/fetch-blog.yml` (스크레이프 단계 + 상세 페이지 빌드 단계 추가) | 소 |
| 메인 진입(선택) | `index.html`에 "최신 블로그 3~6개" 섹션 신설 여부 | 소~중 |

---

## 4. 미해결 의사결정 포인트 (사용자 확인 필요)

`docs/plan-blog-detail.md` §0에서 선택지로 제시. 결정되면 plan 확정.
