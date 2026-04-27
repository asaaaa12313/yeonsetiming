# 구현 계획 v2 — 블로그 상세 페이지 (구글 SEO 최우선)

> **상태**: 🟢 **LOCKED v2 — 2026-04-27 사용자 승인. 구현 진행 중.**
>
> **확정 정보**:
> - 도메인: `https://ystiming.com`
> - 원장: 남승우 대표원장 (연세대학교 치의학과 졸업, 보건복지부 인증 통합치의학과 전문의)
> - 전화: 02-477-0028 / 카카오톡: http://pf.kakao.com/_xacxbMK / 네이버예약: https://booking.naver.com/booking/13/bizes/404493
> - 네이버 블로그: https://blog.naver.com/wyyezbrmztora
>
> **목적 변경**: "홈페이지에서 글을 읽게" + **"구글 검색에서 우리 사이트가 잡히게"**가 진짜 목표. 단순 뷰어가 아니라 **SEO 자산 빌딩** 관점으로 전체 설계 재조정.
>
> **결정**: Q2 = **A (정적 빌드)** 확정. SEO 목적이면 사실상 외길.
>
> 관련 문서: [`docs/research-blog-detail.md`](./research-blog-detail.md)

---

## 0. 의사결정 — SEO 권장안 채택안 (인라인 메모로 수정 가능)

| # | 항목 | 채택 | 근거 (SEO 관점) |
|---|---|---|---|
| Q1 | 본문 수집 | **A. 모바일 페이지 스크레이핑** | 본문 풀텍스트 확보 → 콘텐츠 길이/키워드 풍부도. 구글 Helpful Content 통과 조건 |
| Q2 | 라우팅 | **A. 정적 빌드 `blog/{slug}.html`** | 크롤러 100% 인덱싱 + 메타태그 정확. 동적 URL은 인덱싱 약함 |
| Q3 | 메인 카드 | **B. 메인에 최신 6장 + 더보기** | **내부 링크 강화** — 메인(가장 강한 페이지) → 글 직접 링크 → 인덱싱 가속 |
| Q4 | 네이버 CTA | **본문 끝 + 목록 하단** (둘 다) | 본문 끝 CTA는 `rel="nofollow"` 처리 — 링크주스 외부 유출 방지 |
| Q5 | 비텍스트 처리 | **A. 텍스트+이미지만, 위젯 제거** | 깔끔한 본문 = 구글 콘텐츠 품질 점수 ↑. 외부 스크립트 제거로 페이지 속도 ↑ |
| Q6 | 이미지 호스팅 | **A. 네이버 CDN 직접 + alt 텍스트 자동 생성** | 호스팅보다 alt가 SEO에 더 중요. 단 핫링크 깨지면 즉시 B로 전환 |

**추가 결정 (이번 v2에서 신규):**
| # | 항목 | 채택 | 근거 |
|---|---|---|---|
| Q7 | URL 구조 | `blog/{한글-slug}.html` | 한글 키워드 URL이 한국어 SERP에서 가산점. logNo는 충돌 방지용 fallback |
| Q8 | canonical | **우리 사이트를 canonical로** (네이버 쪽엔 영향력 X) | "이 글의 정본은 우리 도메인" 신호. 단 구글이 선점 인덱싱한 네이버를 따를 수도 있는 리스크 명시 |
| Q9 | 차별화 콘텐츠 | **자동 부가 블록 삽입** (관련 진료 페이지 링크 + CTA + 위치/예약 정보) | 네이버 원문과 100% 동일하면 중복 콘텐츠 페널티. 우리 도메인 콘텐츠를 5~15% 더 풍부하게 |
| Q10 | YMYL 신뢰 신호 | **작성자 박스(원장 자격) + 의료 disclaimer + 검토일 표시** 필수 | 의료/건강은 YMYL. E-E-A-T 신호 없으면 구글이 노출 안 시킴 |

> ⚠️ **사용자 확정 부탁드리는 항목**: Q7~Q10은 제가 SEO 관점에서 추가 제안한 항목입니다. 이대로 가도 좋은지, 빼거나 수정하실 부분이 있는지 메모 부탁드려요.

---

## 1. SEO 전략 — 이 계획의 핵심

### 1-1. 구글 인덱싱 경로 (의도된 흐름)
```
구글봇 ──▶ sitemap.xml ──▶ blog/{slug}.html (정적)
            │                  │
            │                  ├─ <link rel="canonical" href="자기-자신">
            │                  ├─ JSON-LD BlogPosting + BreadcrumbList + Organization
            │                  ├─ OG/Twitter 메타
            │                  ├─ 본문 풀텍스트 (스크레이프, 정제)
            │                  ├─ 내부 링크 → /implant.html, /care.html 등
            │                  └─ 본문 끝 외부 링크는 rel="nofollow"
            ▼
       index.html ──▶ 메인 "최신 블로그" 카드 ──▶ blog/{slug}.html
       blog.html ──▶ 카드 그리드 ──▶ blog/{slug}.html
```

### 1-2. URL 설계 (Q7)
- **포맷**: `blog/{slug}.html` (`posts/` 아닌 `blog/`로 변경 — 의미 명확)
- **slug 생성 규칙**:
  1. 제목에서 특수문자/이모지 제거
  2. 공백 → `-`
  3. 길이 60자 이내 절단
  4. 충돌 시 `-{logNo 끝 4자리}` 부착
- **예시**:
  - 제목: "강동구 치과 임플란트가 필요한 상태인지 어떻게 판단할까요?"
  - slug: `강동구-치과-임플란트가-필요한-상태인지-어떻게-판단할까요`
  - URL: `/blog/강동구-치과-임플란트가-필요한-상태인지-어떻게-판단할까요.html`
- **한글 URL의 SEO 효과**: 구글은 UTF-8 한글 URL을 정상 처리하며, 한국어 SERP에서 키워드 매칭 가산점 있음. 단, 공유 시 `%XX` 인코딩으로 보일 수 있음(브라우저 주소창에선 디코딩되어 표시).

### 1-3. canonical 정책 (Q8) — 가장 중요한 결정
**기존 plan v1에서 "네이버를 canonical로"라고 적었는데, SEO 목적이면 정반대입니다.**

| 옵션 | canonical 대상 | 결과 |
|---|---|---|
| (A) **우리 사이트** | `https://yeonse3.com/blog/{slug}.html` | 우리 도메인이 정본 신호. 구글이 인정하면 우리 사이트가 SERP에 노출 |
| (B) 네이버 | `https://blog.naver.com/...` | "이 글은 네이버가 정본"이라고 우리가 자진 신고 → 우리 사이트는 SERP에서 제외 (자살골) |

→ **A 채택**. 단, 다음 리스크 명시:
- 네이버에 글이 먼저 올라가 구글이 네이버를 정본으로 선점 인덱싱했을 수 있음
- 두 페이지가 콘텐츠 95% 이상 동일하면 구글이 임의로 정본 선택
- **완화책 = Q9** (차별화 콘텐츠 블록 삽입)

### 1-4. 차별화 콘텐츠 블록 (Q9)
모든 상세 페이지에 자동 삽입되는 **우리 도메인만의 가치**:
1. **본문 상단 — 카테고리 배지 + 진료 페이지 링크**
   - 예: 카테고리가 "임플란트"면 → `<a href="/implant.html">임플란트 진료 자세히 보기</a>`
2. **본문 끝 — 진료 예약 CTA 박스**
   - 전화/카카오톡/네이버예약 버튼 (현재 사이트의 quick-menu 재활용)
3. **본문 끝 — 위치/영업시간 박스**
   - 지하철 도보, 영업시간, 약도 링크 (LocalBusiness 강화)
4. **본문 끝 — "원장 직접 진료" 작성자 박스 (Q10)**
5. **관련 글 3개** — 같은 카테고리 최신 글 (내부 링크 강화)

이 블록들이 본문에 따라붙어 **우리 사이트의 unique value를 5~15% 추가** → 중복 콘텐츠 회피.

### 1-5. YMYL / E-E-A-T 신호 (Q10)
의료·건강 콘텐츠는 구글이 매우 엄격. 누락 시 노출 자체가 안 됨.
- **작성자 정보**: 글마다 "원장 OOO (치과의사 면허번호 / 전공)" 카드. `intro.html`로 링크.
- **의료 disclaimer**: 글 끝 작은 글씨로 "본 콘텐츠는 일반 정보 제공 목적이며, 정확한 진단·치료는 내원 상담이 필요합니다."
- **마지막 검토일**: `originalPublishedDate` (네이버 게시일) + `lastReviewedDate` (우리 사이트 빌드일). JSON-LD `dateModified`에도 반영.
- **JSON-LD `MedicalWebPage`** 또는 `BlogPosting` + `MedicalEntity` 보강 (조건부, 너무 무거우면 BlogPosting만)

### 1-6. 내부 링크 그래프 (SEO에서 가장 저평가된 무기)
```
index.html (PageRank 최고)
   ├─ /blog/{slug}.html × 6  (메인 "최신 블로그" 섹션)
   ├─ /blog.html (목록)
   │     └─ /blog/{slug}.html × 50 (모든 글)
   ├─ /implant.html, /care.html, /tmj.html, /beauty.html, /special.html, /sleep.html
   └─ /intro.html (원장)

/blog/{slug}.html (각 상세)
   ├─ 카테고리 → 해당 진료 페이지 (예: 임플란트 글 → /implant.html)
   ├─ 작성자 박스 → /intro.html
   ├─ 관련 글 3개 → 같은 카테고리 다른 글
   └─ 외부: 네이버 원문 (rel="nofollow noopener")
```
**핵심**: 모든 상세 페이지가 진료 페이지로 인바운드 링크를 줌 → 진료 페이지의 PageRank 자동 강화 → 핵심 검색어("강동구 임플란트" 등) 순위 상승.

### 1-7. Core Web Vitals (페이지 속도 — 랭킹 시그널)
- **LCP < 2.5s**: 본문 첫 이미지에 `fetchpriority="high"`, 나머지는 `loading="lazy"`
- **CLS < 0.1**: 모든 `<img>`에 `width`/`height` 명시 (스크레이퍼가 이미지 dimension 추출하거나 default 비율 가정)
- **INP < 200ms**: 상세 페이지엔 거의 JS 없으니 OK
- **HTML 사이즈**: 인라인 SVG/CSS 최소화. 상세 페이지 30KB 이내 목표.
- **폰트**: 본문 폰트는 시스템/이미 로드된 것 재사용, 새 웹폰트 추가 금지.

### 1-8. 구조화 데이터 (Schema.org)
페이지 head에 JSON-LD 3종 주입:
```jsonc
// 1. BlogPosting (글 본문)
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "image": ["{thumbnail}"],
  "datePublished": "{pubDate}",
  "dateModified": "{lastReviewedDate}",
  "author": { "@type": "Person", "name": "원장 OOO", "url": "/intro.html" },
  "publisher": { "@type": "MedicalOrganization", "name": "연세타이밍치과", "logo": {...} },
  "mainEntityOfPage": "{우리 사이트 URL}",
  "articleSection": "{category}",
  "keywords": "{category}, 강동구 치과, ..."
}

// 2. BreadcrumbList (구글이 SERP에 빵부스러기 표시)
{ "@type": "BreadcrumbList",
  "itemListElement": [
    {"position":1, "name":"홈", "item":"/"},
    {"position":2, "name":"블로그", "item":"/blog.html"},
    {"position":3, "name":"{title}", "item":"/blog/{slug}.html"}
  ]
}

// 3. MedicalOrganization (사이트 공통, common.js에 이미 있는지 확인)
```

### 1-9. sitemap.xml 자동 갱신
- 빌드 스크립트가 `sitemap.xml`을 매번 재생성:
  - 정적 페이지(index/intro/blog/implant/...) + 상세 글 50개+
  - 각 항목에 `<lastmod>`, `<changefreq>`, `<priority>` 명시
  - 글: `priority=0.7`, `changefreq=monthly`
  - 메인: `priority=1.0`, `changefreq=weekly`

### 1-10. robots.txt / 인덱싱 메타
- robots.txt 변경 없음 (이미 OK).
- 상세 페이지에 `<meta name="robots" content="index, follow, max-image-preview:large">` — 구글 SERP에서 큰 썸네일 노출.

---

## 2. JSON 스키마 v2

```jsonc
{
  "id": "224253518738",
  "title": "...",
  "slug": "강동구-치과-임플란트가-필요한-상태인지...",  // 신규 (Q7)
  "internalUrl": "/blog/강동구-치과-임플란트가-필요한-상태인지....html", // 신규
  "naverUrl": "https://blog.naver.com/.../224253518738",  // 외부 원문 (rel="nofollow")
  "category": "임플란트",
  "categoryHref": "/implant.html",  // 신규 — 카테고리 → 진료 페이지 매핑
  "pubDate": "2026-04-16T00:10:00.000Z",          // 네이버 게시일
  "lastReviewedDate": "2026-04-27T00:00:00.000Z", // 빌드일 (Q10)
  "thumbnail": "https://blogthumb.pstatic.net/...",
  "thumbnailDimensions": { "w": 773, "h": 454 },  // 신규 (CWV용)
  "summary": "...(120자 카드용)",
  "excerpt": "...(155자 메타 description)",       // 신규 (160자 컷)
  "bodyHtml": "<p>...</p><figure>...</figure>",
  "bodyText": "전문 텍스트(검색용)",
  "wordCount": 850,                                // 신규 (Helpful Content 진단용)
  "images": [
    { "src": "...", "alt": "임플란트 시술 전 X-ray 사진", "w": 1200, "h": 800 }
  ],
  "fetchedBodyAt": "2026-04-27T00:00:00.000Z"
}
```

**카테고리 → 진료 페이지 매핑표** (`categoryHref` 자동 부여):
| category | href |
|---|---|
| 임플란트 | `/implant.html` |
| 잇몸,연조직 질환 | `/care.html` |
| 자연치아살리기치료 | `/care.html` |
| 사랑니 | `/special.html` |
| 심미치료 | `/beauty.html` |
| 연세타이밍치과 (잡담/공지성) | `/intro.html` |
| 그 외 | `/blog.html` |

---

## 3. 수정/신규 파일 목록 (v2)

### 신규
- `scripts/fetch-naver-bodies.js` — 본문 스크레이프 + alt 자동 생성 + word count
- `scripts/build-post-pages.js` — 정적 페이지 빌드 + sitemap 갱신 + 차별화 블록 삽입
- `scripts/lib/slug.js` — 한글 slug 생성 + 충돌 처리
- `scripts/lib/template.js` — 상세 페이지 템플릿 (헤더/푸터/JSON-LD/OG)
- `scripts/lib/category-map.js` — 카테고리 → 진료 페이지 매핑
- `blog/` (디렉터리, 글 정적 파일들 — 빌드 산출물)
- `css/blog-detail.css` — 상세 페이지 전용 스타일

### 수정
- `scripts/fetch-naver-blog.js` — `slug`/`internalUrl`/`categoryHref` 필드 자동 부여
- `scripts/build-blog-html.js` — 카드 `href`를 내부 URL로
- `scripts/package.json` — `cheerio` 의존성 추가
- `js/blog.js:126` `renderCard()` — `href` 내부화, `target="_blank"` 제거
- `blog.html` — 카드 SSG 영역 (자동), 빵부스러기 추가
- `index.html` — 신규 `<section class="home-blog">` 추가
- `css/main.css` — `.home-blog` 섹션 스타일
- `data/blog-posts.json` — 스키마 확장 (자동)
- `.github/workflows/fetch-blog.yml` — 스크레이프 + 페이지 빌드 + sitemap 갱신 단계 추가
- `sitemap.xml` — 빌드 스크립트가 자동 재생성

---

## 4. 작업 단위 체크리스트 (Phase 분할)

### Phase 1 — 데이터 보강 + slug 정책
- [ ] `scripts/lib/slug.js` 작성 (한글 slug + 충돌 처리)
- [ ] `scripts/lib/category-map.js` 작성 (카테고리 → 진료 페이지)
- [ ] `scripts/package.json`에 `cheerio` 추가
- [ ] `scripts/fetch-naver-bodies.js` 작성 — m.blog.naver.com 스크레이프
- [ ] HTML 화이트리스트 클리너 (p, h1~h6, strong, em, ul/ol/li, blockquote, figure, img, br, a)
- [ ] alt 텍스트 자동 생성 (alt 비어있으면 제목 + 순번)
- [ ] 이미지 dimension 추출 (HEAD 요청 또는 본문 메타에서)
- [ ] word count 계산
- [ ] 증분 처리 (`fetchedBodyAt` + 본문 존재 → 스킵)
- [ ] `fetch-naver-blog.js`에 `slug`/`internalUrl`/`categoryHref`/`lastReviewedDate` 자동 부여 로직
- [ ] **검증**: 50개 글 모두 본문 채워진 JSON 확인. 무작위 5개 원문/추출본 비교

### Phase 2 — 정적 페이지 템플릿 + 빌드
- [ ] `scripts/lib/template.js` 작성 (헤더/푸터/JSON-LD 3종/OG 메타)
- [ ] 빵부스러기 BreadcrumbList JSON-LD + 시각 컴포넌트
- [ ] `css/blog-detail.css` — 본문 타이포(16px/1.85), figure, 작성자 박스, 차별화 블록 스타일
- [ ] `scripts/build-post-pages.js` 작성
  - JSON 순회 → 템플릿 주입 → `blog/{slug}.html` 생성
  - 차별화 블록 자동 삽입 (카테고리 링크, 진료 예약 CTA, 위치 박스, 작성자 박스, 관련 글 3개)
  - 의료 disclaimer 자동 삽입
- [ ] `<link rel="canonical">` 우리 사이트로
- [ ] 외부 네이버 링크 모두 `rel="nofollow noopener"`
- [ ] **검증**: 무작위 글 1개 빌드 → 브라우저로 열기 → Open Graph Debugger / Rich Results Test 통과

### Phase 3 — 카드 링크 내부화
- [ ] `js/blog.js:126` `renderCard()` href 내부 URL로 변경, `target="_blank"` 제거
- [ ] `scripts/build-blog-html.js`도 동일 수정
- [ ] `blog.html` BLOG_SSG 영역 자동 재빌드
- [ ] **검증**: blog.html 카드 클릭 → 새 상세 페이지로 같은 탭 이동, 뒤로가기 자연스러운지

### Phase 4 — 메인 "최신 블로그" 섹션
- [ ] `index.html`에 `<section class="home-blog">` 추가 (제목 + 6장 카드 + "블로그 더보기" CTA)
- [ ] BLOG_HOME_SSG 마커 추가 (빌드 스크립트가 자동 채움)
- [ ] `css/main.css`에 `.home-blog` 섹션 스타일 (기존 진료 카드 섹션 톤 일치)
- [ ] `build-blog-html.js`에 메인 카드 빌드 로직 추가
- [ ] **검증**: 메인 → 블로그 섹션 노출 → 카드 클릭 → 상세 페이지 이동 자연스러운지

### Phase 5 — sitemap + robots + 메타
- [ ] `scripts/build-post-pages.js`가 `sitemap.xml` 재생성
  - 정적 페이지 + 모든 상세 글 + lastmod/changefreq/priority
- [ ] 상세 페이지 `<meta name="robots" content="index, follow, max-image-preview:large">`
- [ ] 상세 페이지 `<meta name="description" content="{excerpt}">`
- [ ] 상세 페이지 OG/Twitter 카드 메타 완비

### Phase 6 — 깃액션 자동화
- [ ] `.github/workflows/fetch-blog.yml`에 단계 추가:
  - `node fetch-naver-bodies.js` (본문 수집)
  - `node build-post-pages.js` (페이지 + 사이트맵 빌드)
- [ ] `git add blog/ data/ blog.html index.html sitemap.xml`
- [ ] **검증**: workflow_dispatch 수동 실행 → `blog/`에 50개 파일 + 메인/목록 카드 갱신 + sitemap 50개 추가 확인

### Phase 7 — 코딩봇/검수봇 분리 + 최종 SEO 감사
- [ ] §6 규칙대로 별도 Agent에 코드 리뷰 의뢰
- [ ] 무작위 글 5개에 대해 다음 검사:
  - Lighthouse SEO 점수 95+
  - PageSpeed Insights LCP < 2.5s, CLS < 0.1
  - Rich Results Test에서 BlogPosting + Breadcrumb 인식
  - Open Graph Debugger에서 카드 정상 표시
  - 모바일 친화성 테스트 통과
- [ ] 검수 통과 후 사용자에게 보고

### Phase 8 — 배포 후 (사용자 직접 작업, 가이드만 제공)
- [ ] Google Search Console에 새 sitemap 제출 (`/sitemap.xml`)
- [ ] URL 인스펙션으로 신규 글 5개 색인 요청
- [ ] 2~4주 후 GSC에서 인덱싱 상태 + 검색 노출 확인
- [ ] 노출 안 되면 차별화 블록 강화 (글당 unique 콘텐츠 비율 ↑)

---

## 5. 트레이드오프 / 리스크 (SEO 관점 보강)

| 리스크 | 가능성 | 완화책 |
|---|---|---|
| 구글이 네이버를 정본으로 인덱싱 (선점 효과) | **중~높음** | 차별화 블록 + 우리 사이트 canonical + 내부 링크 그래프로 우리 도메인 권위↑. 시간 걸림(2~3개월) |
| 네이버 마크업 변경으로 스크레이퍼 깨짐 | 낮음 | 셀렉터 상수화 + 워크플로우 실패 알림(추후) |
| 한글 URL이 일부 SNS에서 인코딩되어 보임 | 낮음 | 사용자 UX 영향 작음, SEO엔 영향 없음. 큰 문제면 영문 transliteration 검토 |
| 본문 이미지 핫링크 차단 가능성 | 낮음 | 이미지 host 추상화, 차단 시 자체 호스팅 즉시 전환 |
| YMYL 신뢰 신호 부족 → 구글이 노출 안 함 | **중** | Phase 2의 작성자 박스/disclaimer/검토일 필수 구현. intro.html에 원장 자격 명시 |
| 50개 글이 동시에 인덱싱 요청 → "콘텐츠 폭발" 의심 | 낮음 | sitemap의 lastmod로 점진적 신호. 한 번에 모두 published 상태 OK (게시일 기준 시계열) |
| 상세 페이지가 늘어 빌드 시간↑ | 낮음 | 증분 빌드 (변경된 글만 재생성) |

---

## 6. 코드 스니펫 (의사코드)

### 6-1. canonical (Q8)
```html
<!-- blog/{slug}.html 안 -->
<link rel="canonical" href="https://yeonse3.com/blog/{slug}.html">
```

### 6-2. 차별화 블록 자동 삽입 (Q9)
```js
// build-post-pages.js
const differentiationBlock = `
  <aside class="post-related-care">
    <h3>이 주제와 관련된 진료</h3>
    <a href="${categoryHref}">${categoryName} 진료 자세히 보기 →</a>
  </aside>
  <aside class="post-cta-booking">
    <h3>진료 예약 / 상담</h3>
    <a href="tel:02-477-0028">📞 02.477.0028</a>
    <a href="https://booking.naver.com/booking/13/bizes/404493">네이버 예약</a>
    <a href="https://pf.kakao.com/...">카카오톡 상담</a>
  </aside>
  <aside class="post-author">
    <h3>이 글을 검토한 의료진</h3>
    <p>연세타이밍치과 원장 OOO (치과의사)</p>
    <a href="/intro.html">의료진 자세히 보기 →</a>
  </aside>
  <p class="post-disclaimer">본 콘텐츠는 일반 정보 제공 목적이며, 정확한 진단·치료는 내원 상담이 필요합니다.</p>
`;
```

### 6-3. 외부 링크 nofollow (Q4)
```html
<!-- 본문 끝 외부 CTA -->
<a href="{naverUrl}" rel="nofollow noopener" target="_blank" class="post-outbound-cta">
  이 글을 네이버 블로그에서 보기 →
</a>
```

### 6-4. JSON-LD 주입 (1-8)
```html
<script type="application/ld+json">
{ "@context":"https://schema.org", "@type":"BlogPosting", ... }
</script>
<script type="application/ld+json">
{ "@context":"https://schema.org", "@type":"BreadcrumbList", ... }
</script>
```

---

## 7. 다음 단계
1. **Q7~Q10에 대한 사용자 확인** (Q1~Q6은 이번에 모두 SEO 권장안으로 채택)
   - 특히 **Q10 작성자 박스 — 원장님 성함과 자격(면허/전공) 표시 OK 한지** 확인 부탁드립니다.
2. 확인 완료 후 plan 상태를 🟢 LOCKED로 변경
3. "구현해라" 명령 시 Phase 1부터 순차 구현 (구현봇 → 별도 검수봇 분리 운영)

> ⏸ **현재는 코드 작성 보류 상태입니다.** Q7~Q10 답변 주시면 plan 확정합니다.
