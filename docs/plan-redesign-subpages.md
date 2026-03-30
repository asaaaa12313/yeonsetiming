# 서브페이지 레이아웃 레퍼런스 수준 재정비 계획

## 문제 진단

### 현재 "AI 느낌"의 원인
1. **implant/beauty/care** — 7~4개 섹션 전부 동일한 `sub-two-col` 좌우 교차 반복 (단조로움)
2. **sleep #page03** — 추천 대상이 2x2 `feature-cards` 균등 그리드 (전형적 AI 패턴)
3. **special #page05** — 안심 보증제가 2x2 `feature-cards` (동일)
4. **sleep #page02** — 진행 순서가 `process-steps` 수평 4단계 (생경한 구조)
5. 모든 섹션 동일한 패딩/간격, 배경색 교차도 흰/오프화이트 2색만 반복

### 레퍼런스(다감치과) 핵심 패턴
- **이미지 비중 ↑**: 2단에서 이미지 비율 55~60%, 텍스트 40~45%
- **섹션마다 다른 레이아웃**: 2단, 풀폭이미지+텍스트, 번호리스트+대형이미지, 3열포인트 등 혼용
- **배경색 3단계**: 흰색 → #f5f5f0 → 다크(navy) 강조 섹션 활용
- **넉넉한 여백**: 섹션 패딩 130~190px (현재 100px)
- **추천대상**: 카드그리드 ❌ → 좌측 대형이미지 + 우측 번호 리스트(hover 시 이미지 변경)
- **카드 미사용**: 테두리 있는 균등 카드 대신 풀폭 섹션 블록으로 정보 전달

---

## 수정 대상 파일

| 파일 | 변경 범위 | 핵심 변경 |
|------|----------|----------|
| `css/sub.css` | 대폭 추가 | 새 레이아웃 컴포넌트 CSS |
| `implant.html` | 7개 섹션 구조 변경 | 레이아웃 다양화 + 다크섹션 추가 |
| `beauty.html` | 4개 섹션 구조 변경 | 레이아웃 다양화 |
| `care.html` | 4개 섹션 구조 변경 | 레이아웃 다양화 |
| `sleep.html` | 3개 섹션 구조 변경 | feature-cards → 리스트형, process-steps → 타임라인 |
| `special.html` | 1개 섹션 구조 변경 | feature-cards → 풀폭 블록 |
| `intro.html` | 미세 조정 | 여백/비율 개선 (기존 구조 양호) |
| `css/responsive.css` | 추가 | 새 컴포넌트 반응형 |

---

## 페이지별 상세 계획

### 1. implant.html (7섹션 → 4가지 레이아웃 혼용)

현재: 7섹션 전부 sub-two-col 좌우 교차 반복
변경: 섹션마다 다른 레이아웃을 적용하여 시각적 리듬감 부여

```
#page01 임플란트란?    → [풀폭 이미지 배경 + 텍스트 오버레이] (다크 섹션)
#page02 무절개         → [이미지(55%) 좌 + 텍스트 우] 흰 배경
#page03 원데이         → [텍스트 좌 + 이미지(55%) 우] 오프화이트 배경
#page04 네비게이션     → [풀폭 이미지 배경 + 텍스트 오버레이] (다크 섹션)
#page05 뼈이식         → [이미지(55%) 좌 + 텍스트 우] 흰 배경
#page06 전악           → [텍스트 좌 + 이미지(55%) 우] 오프화이트 배경
#page07 재수술         → [풀폭 CTA형] (다크 섹션, 상담 유도)
```

- [ ] page01: `sub-two-col` → `sub-hero-section` (풀폭 이미지 + 오버레이 텍스트)
- [ ] page04: `sub-two-col.reverse` → `sub-hero-section` (풀폭 이미지 + 오버레이)
- [ ] page07: `sub-two-col` → `sub-cta-section` (다크 배경 + 텍스트 + CTA 버튼)
- [ ] page02,03,05,06: 이미지 비율 1fr 1fr → 1.2fr 1fr / 1fr 1.2fr 교차
- [ ] 배경색: 흰 → 오프화이트 → 다크 → 흰 → 오프화이트 → 흰 → 다크

### 2. beauty.html (4섹션 → 3가지 레이아웃)

```
#page01 라미네이트     → [이미지(55%) 좌 + 텍스트 우] 흰 배경
#page02 앞니 심미      → [풀폭 이미지 + 오버레이] (다크 섹션)
#page03 심미 보철      → [텍스트 좌 + 이미지(55%) 우] 오프화이트 배경
#page04 치아미백       → [이미지(55%) 좌 + 텍스트 우] 흰 배경
```

- [ ] page02: `sub-two-col.reverse` → `sub-hero-section`
- [ ] page01,03,04: 이미지 비율 1.2fr:1fr 비대칭 적용
- [ ] 배경색 교차: 흰 → 다크 → 오프화이트 → 흰

### 3. care.html (4섹션 → 3가지 레이아웃)

```
#page01 사랑니 발치    → [이미지(55%) 좌 + 텍스트 우] 흰 배경
#page02 충치/신경      → [텍스트 좌 + 이미지(55%) 우] 오프화이트 배경
#page03 치주치료       → [풀폭 이미지 + 오버레이] (다크 섹션)
#page04 스케일링       → [이미지(55%) 좌 + 텍스트 우] 흰 배경
```

- [ ] page03: `sub-two-col` → `sub-hero-section`
- [ ] 나머지: 비대칭 비율 적용
- [ ] 배경색 교차: 흰 → 오프화이트 → 다크 → 흰

### 4. sleep.html (4섹션 → 모든 레이아웃 다름)

```
#page01 수면 마취란?   → [이미지(55%) 좌 + 텍스트 우] 흰 배경 (기존 유지)
#page02 치료 진행 순서 → [세로 타임라인] (process-steps → 세로 스텝 + 좌우 교차 이미지)
#page03 추천 대상      → [좌측 대형이미지 + 우측 번호리스트] (feature-cards 제거)
#page04 주의사항       → [아이콘 리스트] (기존 구조 유지, 스타일 개선)
```

- [ ] page02: `process-steps` 수평 → `timeline` 세로 타임라인 (번호 + 제목 + 설명, 좌우 교차)
- [ ] page03: `feature-cards` 2x2 → `numbered-list-with-image` (좌 이미지 60% + 우 번호리스트)
- [ ] page04: 기존 리스트 유지, 아이콘 크기/여백 개선

### 5. special.html (5섹션 → page05 변경)

```
#page01~04  → 기존 sub-two-col 유지 (이미 양호)
#page05 안심 보증제 → feature-cards 2x2 제거 → 3열 포인트 블록 또는 세로 리스트형
```

- [ ] page05: `feature-cards` → `point-blocks` (3열 아이콘+제목+설명, 테두리 없이 배경색만)
- [ ] page01~04: 이미지 비율 비대칭 적용 + 배경색 교차 강화

### 6. intro.html (미세 조정)

- [ ] 여백 확대: 섹션 패딩 100px → 120px
- [ ] 이미지 비율: doctor-profile 그리드 비율 미세 조정
- [ ] 기존 구조 유지 (이미 가장 다양한 레이아웃)

---

## 새로 추가할 CSS 컴포넌트 (sub.css)

### 1. `sub-hero-section` — 풀폭 이미지 + 텍스트 오버레이
```css
.sub-hero-section {
  position: relative;
  min-height: 500px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  padding: 120px 48px;
}
.sub-hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(10,22,40,.85) 0%, rgba(10,22,40,.4) 100%);
}
.sub-hero-section .section-content {
  position: relative;
  z-index: 1;
  max-width: 520px;
}
/* 텍스트 흰색 */
.sub-hero-section .section-eyebrow { color: var(--gold); }
.sub-hero-section .section-title { color: var(--white); }
.sub-hero-section .section-desc { color: rgba(255,255,255,.7); }
```

### 2. `sub-two-col` 비대칭 변형
```css
.sub-two-col.img-large {
  grid-template-columns: 1.3fr 1fr;
}
.sub-two-col.img-large.reverse {
  grid-template-columns: 1fr 1.3fr;
}
```

### 3. `timeline` — 세로 타임라인 (sleep 진행순서)
```css
.timeline {
  position: relative;
  padding-left: 60px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--gray-200);
}
.timeline-item {
  position: relative;
  padding: 32px 0;
}
.timeline-item-number {
  position: absolute;
  left: -60px;
  width: 48px;
  height: 48px;
  background: var(--gold);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
```

### 4. `numbered-list` — 번호 리스트 + 대형 이미지 (sleep 추천대상)
```css
.numbered-list-section {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
  align-items: start;
}
.numbered-list-item {
  display: flex;
  gap: 20px;
  padding: 24px 0;
  border-bottom: 1px solid var(--gray-100);
  align-items: flex-start;
}
.numbered-list-num {
  width: 36px;
  height: 36px;
  background: var(--off-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--gold);
  flex-shrink: 0;
}
```

### 5. `point-blocks` — 3열 포인트 (special 안심보증)
```css
.point-blocks {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.point-block {
  padding: 40px 32px;
  background: var(--off-white);
  text-align: center;
  border-radius: 0; /* 테두리/그림자 없음 */
}
```

---

## 배경색 교차 규칙 (레퍼런스 기반)

기존: `nth-child(odd/even)`으로 흰/오프화이트 2색만
변경: 수동으로 3색 + 다크 섹션 배치

```
흰(#fff) → 오프화이트(#F5F5F0) → 다크(navy) → 흰 → 오프화이트 → ...
```

- 다크 섹션은 페이지당 1~2회, 임팩트 있는 위치에 배치
- `sub-section.dark` 클래스 활용 (기존 CSS에 이미 정의됨)

---

## 체크리스트

### Phase 1: CSS 인프라
- [ ] `sub.css`에 5개 새 컴포넌트 CSS 추가
- [ ] `responsive.css`에 새 컴포넌트 모바일 대응 추가
- [ ] `sub-two-col` 비대칭 비율 변형 추가
- [ ] 섹션 패딩 확대 (100px → 120px)

### Phase 2: implant.html 레이아웃 재구성
- [ ] page01 → sub-hero-section (풀폭 이미지+오버레이)
- [ ] page04 → sub-hero-section
- [ ] page07 → sub-cta-section (다크 CTA)
- [ ] page02,03,05,06 → img-large 비대칭 비율
- [ ] 배경색 수동 지정 (nth-child 제거)

### Phase 3: beauty.html + care.html 레이아웃 재구성
- [ ] beauty page02 → sub-hero-section
- [ ] care page03 → sub-hero-section
- [ ] 나머지 → img-large 비대칭 비율
- [ ] 배경색 수동 지정

### Phase 4: sleep.html 레이아웃 재구성
- [ ] page02 → process-steps 제거 → timeline 세로 타임라인
- [ ] page03 → feature-cards 제거 → numbered-list + 대형 이미지
- [ ] page04 → 아이콘 리스트 스타일 개선

### Phase 5: special.html + intro.html 미세 조정
- [ ] special page05 → feature-cards 제거 → point-blocks 3열
- [ ] special page01~04 → img-large 비대칭 비율
- [ ] intro.html → 여백/비율 미세 조정

### Phase 6: QA
- [ ] 전 페이지 브라우저 확인
- [ ] 모바일 375px 테스트
- [ ] 배경색 교차 일관성 확인

---

## 고려사항

1. **이미지 비중 증가** — sub-hero-section은 배경 이미지 필수. 현재 placeholder JPG를 활용
2. **기존 .reveal / data-motion 유지** — 레이아웃만 변경, 모션 속성은 그대로
3. **카페24 호환** — 순수 CSS Grid/Flexbox만 사용, 특수 기능 없음
4. **점진적 작업** — implant.html부터 확정 후 나머지 페이지에 동일 패턴 적용
