# 연세타이밍치과 홈페이지 리디자인 - 구현 계획

## 접근 방식

기존 프로토타입(prototype.html)을 기반으로 멀티페이지 HTML/CSS/JS 구조로 분해·확장.
카페24 빌더 배포를 목표로 순수 HTML5 + CSS3 + Vanilla JS로 제작.

## 디렉토리 구조

```
/ystiming-redesign/
├── index.html          ← 메인 (인트로 모션 포함)
├── intro.html          ← 소개 (5섹션)
├── special.html        ← 특별함 (5섹션)
├── implant.html        ← 임플란트 (7섹션)
├── beauty.html         ← 심미치료 (4섹션)
├── care.html           ← 일반진료 (4섹션)
├── sleep.html          ← 수면치료 (4섹션)
├── css/
│   ├── common.css      ← 변수, 리셋, 헤더, 푸터, 퀵메뉴, 플로팅바
│   ├── main.css        ← 메인 페이지 전용
│   ├── sub.css         ← 서브 페이지 공통
│   └── responsive.css  ← 반응형 (Desktop/Tablet/Mobile)
├── js/
│   ├── common.js       ← 헤더 스크롤, 퀵메뉴, 모바일 메뉴, 팝업
│   ├── intro-motion.js ← 인트로 모션 (sessionStorage 제어)
│   ├── swiper-init.js  ← Swiper 초기화 (히어로, B&A)
│   └── form.js         ← 빠른상담 폼
├── img/                ← placeholder 이미지
└── lib/                ← (CDN 사용, 로컬 백업용)
```

## Phase 1: 프로젝트 셋업 + 공통 + 메인 페이지

### 1-1. 디렉토리 구조 생성
```bash
mkdir -p ystiming-redesign/{css,js,img/{main,sub,doctor,facility,bna,icons}}
```

### 1-2. css/common.css
프로토타입에서 추출:
- CSS 변수 (:root)
- 리셋 (*, html, body, a, button, img, ul)
- 헤더 (.header, .header-nav, .header-logo, .header-tel)
- 메가메뉴 드롭다운 (신규)
- 모바일 메뉴 (신규)
- 푸터 (.footer, .footer-inner, .footer-links)
- 퀵메뉴 (.quick-menu)
- 모바일 하단바 (.float-bar)
- 빠른상담 폼 (.consult-form)
- 팝업 레이어 (.popup-overlay)
- Reveal 애니메이션 (.reveal, .visible)
- 공통 섹션 (.section, .section-inner, .section-eyebrow, .section-title, .section-desc)

### 1-3. js/common.js
```js
// 헤더 스크롤 전환: scrollY > 60 → .solid, ≤ 60 → .transparent
// 퀵메뉴: scrollY > 400 → 표시
// 모바일 햄버거 메뉴 토글
// 메가메뉴 드롭다운 (mouseenter/mouseleave)
// 팝업 레이어 (24시간 쿠키)
// 스크롤 Reveal (IntersectionObserver)
```

### 1-4. js/intro-motion.js
```js
// sessionStorage 체크 → 첫 방문만 재생
// setTimeout 체인: 로고(200ms) → 라인1(800ms) → 라인2(1600ms) → 서브(2400ms) → fadeout(4200ms)
// skipIntro() 함수
```

### 1-5. index.html
프로토타입 메인 페이지 구조 그대로 + 누락 기능 추가:
- 인트로 오버레이
- 히어로 슬라이더 (4슬라이드)
- 치과 소개 블록
- 의료진 소개 (마키)
- B&A (탭+Swiper)
- 진료 과목 (7카드)
- 진료안내 + 오시는길
- CTA 배너
- 빠른상담 폼 (플로팅)

### 1-6. css/main.css
메인 전용: 인트로, 히어로, 소개, 의료진, B&A, 진료과목, 진료안내, CTA

### 1-7. js/swiper-init.js
```js
// 히어로: effect fade, autoplay 5000, loop, pagination bullets
// B&A: slidesPerView 반응형 (1→2→3)
```

### 1-8~10. 메가메뉴, 빠른상담폼, 팝업
- 메가메뉴: 헤더 nav에 드롭다운 패널 (각 메뉴별 앵커 목록)
- 빠른상담: 우측 하단 플로팅 탭 (진료과목/성함/연락처/동의)
- 팝업: 이미지 기반 모달 (쿠키 24시간)

## Phase 2: 핵심 서브페이지

### 2-1. css/sub.css
- 서브 히어로 (.sub-hero)
- 서브 네비게이션 (.sub-nav)
- 2단 레이아웃 (.sub-two-col)
- 이미지 placeholder
- 배경색 교차 패턴

### 2-2. intro.html (5섹션)
- #page01: 치과 철학 (텍스트+이미지)
- #page02: 의료진 소개 (프로필+약력)
- #page03: 내부시설 갤러리 (3x2 grid)
- #page04: 장비 소개
- #info: 진료시간+오시는길

### 2-3. implant.html (7섹션)
- #page01~07: 임플란트란/무절개/원데이/네비게이션/뼈이식/전악/재수술
- 각 섹션: eyebrow+title+desc+image, 배경 교차

### 2-4. beauty.html (4섹션)
- #page01~04: 라미네이트/앞니심미/심미보철/치아미백

## Phase 3: 나머지 + 반응형

### 3-1. special.html (5섹션)
### 3-2. care.html (4섹션)
### 3-3. sleep.html (4섹션)
### 3-4. css/responsive.css
```css
/* Desktop: min-width 1200px */
/* Tablet: 768px ~ 1199px */
/* Mobile: max-width 767px */
```
### 3-5. 모바일 메뉴 + SEO + QA

## 체크리스트

- [x] 1-1. 디렉토리 구조 생성
- [x] 1-2. css/common.css
- [x] 1-3. js/common.js
- [x] 1-4. js/intro-motion.js
- [x] 1-5. index.html
- [x] 1-6. css/main.css
- [x] 1-7. js/swiper-init.js
- [x] 1-8. 메가메뉴 드롭다운
- [x] 1-9. 빠른상담 폼 (form.js)
- [x] 1-10. 팝업 레이어
- [x] 2-1. css/sub.css
- [x] 2-2. intro.html
- [x] 2-3. implant.html
- [x] 2-4. beauty.html
- [x] 3-1. special.html
- [x] 3-2. care.html
- [x] 3-3. sleep.html
- [x] 3-4. css/responsive.css
- [x] 3-5. 모바일 메뉴 + SEO + QA

## 고려 사항

1. **사진 없음**: 모든 이미지는 placeholder 처리. 실사진 교체는 클라이언트 확인 후.
2. **컬러 미확정**: 프로토타입 기준(네이비+골드) 임시 적용. 브랜드 컬러 확정 시 CSS 변수만 수정.
3. **수면치료 불확실**: 임시 제작. 미도입 시 메뉴+페이지 제거.
4. **원장 약력 미확정**: 프로토타입 임시 데이터 사용.
5. **카페24 호환**: 순수 HTML/CSS/JS만 사용, 빌드 도구 없음, CDN 의존.
