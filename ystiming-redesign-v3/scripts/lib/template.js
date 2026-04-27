/**
 * template.js — 상세 페이지 HTML 빌더
 *
 * blog/{slug}.html 정적 파일을 만들 때 호출되는 모든 컴포넌트 함수 모음.
 * 모든 링크는 절대경로(/...) 사용 — 상세 페이지가 /blog/ 하위에 있어 상대경로 처리가 까다롭기 때문.
 */

import { categoryDisplay, categoryHref } from './category-map.js';

// ── 사이트 상수 ────────────────────────────────────────
export const SITE = {
  url: 'https://ystiming.com',
  name: '연세타이밍치과',
  legalName: '연세타이밍치과의원',
  blogId: 'wyyezbrmztora',
  tel: '02-477-0028',
  telDisplay: '02.477.0028',
  address: '서울시 강동구 양재대로 1465, 마루홈타운 502호',
  hours: '평일 09:30~18:30 | 목(야간) ~20:30 | 토 09:00~13:30',
  kakao: 'http://pf.kakao.com/_xacxbMK',
  naverBooking: 'https://booking.naver.com/booking/13/bizes/404493',
  naverBlog: 'https://blog.naver.com/wyyezbrmztora',
  ogImage: '/img/og_image.jpg',
  logo: '/img/logo.png',
  doctor: {
    name: '남승우',
    title: '대표원장',
    cred: '연세대학교 치의학과 졸업 · 보건복지부 인증 통합치의학과 전문의',
    photo: '/img/doctor/nam-profile.jpg',
  },
  businessNo: '223-21-01077',
};

// ── 유틸 ────────────────────────────────────────────
export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDateKR(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

// ── HEAD ────────────────────────────────────────────
export function renderHead({ title, description, canonical, ogImage, publishedTime, modifiedTime, ldScripts = [] }) {
  const safeOgImage = ogImage && ogImage.startsWith('http') ? ogImage : `${SITE.url}${ogImage || SITE.ogImage}`;
  return `<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${escapeHtml(canonical)}">

<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(safeOgImage)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:site_name" content="${escapeHtml(SITE.name)}">
<meta property="og:locale" content="ko_KR">
${publishedTime ? `<meta property="article:published_time" content="${escapeHtml(publishedTime)}">` : ''}
${modifiedTime ? `<meta property="article:modified_time" content="${escapeHtml(modifiedTime)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(safeOgImage)}">

<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap">

<link rel="stylesheet" href="/css/common.css">
<link rel="stylesheet" href="/css/sub.css">
<link rel="stylesheet" href="/css/responsive.css">
<link rel="stylesheet" href="/css/blog-detail.css">

${ldScripts.join('\n')}
</head>`;
}

// ── HEADER (메인과 동일, 절대경로) ─────────────────────
export function renderHeader() {
  return `<header class="header solid" id="header">
  <a href="/" class="header-logo"><img src="${SITE.logo}" alt="${SITE.name}" class="logo-img"></a>
  <ul class="header-nav">
    <li><a href="/intro.html">연세타이밍치과 소개</a>
      <div class="mega-menu">
        <a href="/intro.html#page01">치과 철학</a>
        <a href="/intro.html#page02">의료진 소개</a>
        <a href="/intro.html#page03">장비 소개</a>
        <a href="/intro.html#page04">언론·사회활동</a>
        <a href="/intro.html#page05">치과 둘러보기</a>
        <a href="/intro.html#info">오시는 길</a>
      </div>
    </li>
    <li><a href="/special.html">연세타이밍치과의 특별함</a>
      <div class="mega-menu">
        <a href="/special.html#page01">장애인 치과</a>
        <a href="/special.html#page02">고난도 진료</a>
        <a href="/special.html#page03">3단계 무통마취</a>
        <a href="/special.html#page04">외국인 진료</a>
        <a href="/special.html#page05">디지털 치과</a>
        <a href="/special.html#page06">멸균·위생</a>
      </div>
    </li>
    <li><a href="/implant.html">임플란트 센터</a>
      <div class="mega-menu">
        <a href="/implant.html#page01">네비게이션 임플란트</a>
        <a href="/implant.html#page02">원데이 임플란트</a>
        <a href="/implant.html#page03">전악 임플란트</a>
        <a href="/implant.html#page04">상악동 거상술</a>
        <a href="/implant.html#page05">발치와 보존술</a>
        <a href="/implant.html#page06">임플란트 틀니</a>
        <a href="/implant.html#page07">재수술</a>
        <a href="/implant.html#page08">임플란트 수리</a>
        <a href="/implant.html#page09">완전·부분 틀니</a>
        <a href="/implant.html#page10">사후 관리</a>
      </div>
    </li>
    <li><a href="/beauty.html">심미 치료 센터</a>
      <div class="mega-menu">
        <a href="/beauty.html#page01">무삭제 라미네이트</a>
        <a href="/beauty.html#page02">앞니 레진</a>
        <a href="/beauty.html#page03">심미 보철</a>
        <a href="/beauty.html#page04">치아미백</a>
      </div>
    </li>
    <li><a href="/care.html">일반진료 센터</a>
      <div class="mega-menu">
        <a href="/care.html#page01">당일 사랑니 발치</a>
        <a href="/care.html#page02">구강소수술·병리</a>
        <a href="/care.html#page03">MTA 자연치아 살리기</a>
        <a href="/care.html#page04">신경치료</a>
        <a href="/care.html#page05">스케일링·잇몸</a>
        <a href="/care.html#page06">치경부 GI/레진</a>
        <a href="/care.html#page07">소아치료</a>
        <a href="/care.html#page08">프리올소</a>
        <a href="/care.html#page09">교정 와이어 수리</a>
      </div>
    </li>
    <li><a href="/tmj.html">턱관절 센터</a>
      <div class="mega-menu">
        <a href="/tmj.html#page01">턱관절 물리치료</a>
        <a href="/tmj.html#page02">턱관절 스플린트</a>
        <a href="/tmj.html#page03">턱관절 보톡스</a>
        <a href="/tmj.html#page04">PDRN 프롤로</a>
        <a href="/tmj.html#page05">운동용 마우스피스</a>
      </div>
    </li>
    <li><a href="/blog.html" class="is-active">블로그</a></li>
  </ul>
  <div class="header-tel">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
    ${SITE.telDisplay}
  </div>
  <button class="mobile-menu-btn" aria-label="메뉴"><span></span><span></span><span></span></button>
</header>

<div class="mega-menu-bar" id="megaMenuBar">
  <div class="mega-menu-col">
    <div class="mega-menu-col-title">연세타이밍치과 소개</div>
    <a href="/intro.html#page01">치과 철학</a>
    <a href="/intro.html#page02">의료진 소개</a>
    <a href="/intro.html#page03">장비 소개</a>
    <a href="/intro.html#page04">언론·사회활동</a>
    <a href="/intro.html#page05">치과 둘러보기</a>
    <a href="/intro.html#info">오시는 길</a>
  </div>
  <div class="mega-menu-col">
    <div class="mega-menu-col-title">연세타이밍치과의 특별함</div>
    <a href="/special.html#page01">장애인 치과</a>
    <a href="/special.html#page02">고난도 진료</a>
    <a href="/special.html#page03">3단계 무통마취</a>
    <a href="/special.html#page04">외국인 진료</a>
    <a href="/special.html#page05">디지털 치과</a>
    <a href="/special.html#page06">멸균·위생</a>
  </div>
  <div class="mega-menu-col">
    <div class="mega-menu-col-title">임플란트 센터</div>
    <a href="/implant.html#page01">네비게이션</a>
    <a href="/implant.html#page02">원데이</a>
    <a href="/implant.html#page03">전악</a>
    <a href="/implant.html#page04">상악동 거상술</a>
    <a href="/implant.html#page05">발치와 보존술</a>
    <a href="/implant.html#page06">임플란트 틀니</a>
    <a href="/implant.html#page07">재수술</a>
    <a href="/implant.html#page08">임플란트 수리</a>
    <a href="/implant.html#page09">완전·부분 틀니</a>
    <a href="/implant.html#page10">사후 관리</a>
  </div>
  <div class="mega-menu-col">
    <div class="mega-menu-col-title">심미 치료 센터</div>
    <a href="/beauty.html#page01">무삭제 라미네이트</a>
    <a href="/beauty.html#page02">앞니 레진</a>
    <a href="/beauty.html#page03">심미 보철</a>
    <a href="/beauty.html#page04">치아미백</a>
  </div>
  <div class="mega-menu-col">
    <div class="mega-menu-col-title">일반진료 센터</div>
    <a href="/care.html#page01">당일 사랑니 발치</a>
    <a href="/care.html#page02">구강소수술·병리</a>
    <a href="/care.html#page03">MTA 자연치아</a>
    <a href="/care.html#page04">신경치료</a>
    <a href="/care.html#page05">스케일링·잇몸</a>
    <a href="/care.html#page06">치경부 GI/레진</a>
    <a href="/care.html#page07">소아치료</a>
    <a href="/care.html#page08">프리올소</a>
    <a href="/care.html#page09">교정 와이어 수리</a>
  </div>
  <div class="mega-menu-col">
    <div class="mega-menu-col-title">턱관절 센터</div>
    <a href="/tmj.html#page01">물리치료</a>
    <a href="/tmj.html#page02">스플린트</a>
    <a href="/tmj.html#page03">보톡스</a>
    <a href="/tmj.html#page04">PDRN 프롤로</a>
    <a href="/tmj.html#page05">운동용 마우스피스</a>
  </div>
  <div class="mega-menu-col">
    <div class="mega-menu-col-title">블로그</div>
    <a href="/blog.html">임상 케이스 모아보기</a>
    <a href="${SITE.naverBlog}" target="_blank" rel="nofollow noopener">네이버 블로그 바로가기</a>
  </div>
</div>

<div class="mobile-drawer-overlay"></div>
<nav class="mobile-drawer">
  <ul class="mobile-drawer-nav">
    <li><a href="/intro.html">연세타이밍치과 소개</a></li>
    <li><a href="/special.html">연세타이밍치과의 특별함</a></li>
    <li><a href="/implant.html">임플란트 센터</a></li>
    <li><a href="/beauty.html">심미 치료 센터</a></li>
    <li><a href="/care.html">일반진료 센터</a></li>
    <li><a href="/tmj.html">턱관절 센터</a></li>
    <li><a href="/blog.html">블로그</a></li>
  </ul>
  <div class="mobile-drawer-tel">${SITE.telDisplay}</div>
  <div class="mobile-drawer-info">
    ${SITE.address}<br>
    ${SITE.hours}
  </div>
</nav>`;
}

// ── FOOTER ──────────────────────────────────────────
export function renderFooter() {
  return `<footer class="footer">
  <div class="footer-inner">
    <div>
      <div class="footer-logo"><img src="${SITE.logo}" alt="${SITE.name}" class="footer-logo-img"></div>
      <div class="footer-info">
        상호명: ${SITE.legalName} &nbsp;|&nbsp; 대표자: ${SITE.doctor.name}<br>
        사업자번호: ${SITE.businessNo} &nbsp;|&nbsp; 대표번호: ${SITE.tel}<br>
        주소: ${SITE.address}
      </div>
      <div class="footer-copy">COPYRIGHT &copy; 2026 YONSEI TIMING DENTAL CLINIC. ALL RIGHTS RESERVED.</div>
    </div>
    <div class="footer-links">
      <a href="${SITE.naverBlog}" class="footer-link-icon" target="_blank" rel="nofollow noopener" aria-label="블로그">
        <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><text x="12" y="15" text-anchor="middle" fill="rgba(255,255,255,.4)" font-size="8" font-weight="bold">B</text></svg>
      </a>
      <a href="${SITE.naverBooking}" class="footer-link-icon" target="_blank" rel="nofollow noopener" aria-label="네이버예약">
        <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><text x="12" y="15" text-anchor="middle" fill="rgba(255,255,255,.4)" font-size="8" font-weight="bold">N</text></svg>
      </a>
      <a href="${SITE.kakao}" class="footer-link-icon" target="_blank" rel="nofollow noopener" aria-label="카카오톡">
        <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><text x="12" y="15" text-anchor="middle" fill="rgba(255,255,255,.4)" font-size="8" font-weight="bold">K</text></svg>
      </a>
    </div>
  </div>
</footer>`;
}

export function renderQuickMenu() {
  return `<div class="quick-menu" id="quickMenu">
  <a href="${SITE.naverBooking}" class="quick-menu-item qm-naver" target="_blank" rel="nofollow noopener">
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/></svg>
    네이버예약
  </a>
  <a href="${SITE.kakao}" class="quick-menu-item qm-kakao" target="_blank" rel="nofollow noopener">
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.726 1.8 5.117 4.512 6.482-.2.744-.723 2.696-.828 3.114-.129.516.19.509.398.37.164-.109 2.612-1.776 3.67-2.497.733.105 1.487.16 2.248.16 5.523 0 10-3.463 10-7.691S17.523 3 12 3z"/></svg>
    카카오톡
  </a>
  <a href="${SITE.naverBlog}" class="quick-menu-item qm-blog" target="_blank" rel="nofollow noopener">
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm3 4v8h2.5c2.5 0 3.5-1.5 3.5-4s-1-4-3.5-4H7zm2 2h.5c1 0 1.5.5 1.5 2s-.5 2-1.5 2H9V10z"/></svg>
    블로그
  </a>
  <a href="tel:${SITE.tel}" class="quick-menu-item qm-tel">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
    전화상담
  </a>
  <a href="#" class="quick-menu-item top-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>
    TOP
  </a>
</div>

<div class="float-bar">
  <a href="tel:${SITE.tel}">전화예약</a>
  <a href="${SITE.kakao}" target="_blank" rel="nofollow noopener" style="color:#FEE500;">카카오톡</a>
  <a href="${SITE.naverBooking}" target="_blank" rel="nofollow noopener" style="color:#03C75A;">네이버예약</a>
</div>`;
}

// ── 본문 컴포넌트들 ──────────────────────────────────
function renderBreadcrumb(post) {
  return `<nav class="post-breadcrumb" aria-label="현재 위치">
  <a href="/">홈</a>
  <span class="post-breadcrumb-sep">›</span>
  <a href="/blog.html">블로그</a>
  <span class="post-breadcrumb-sep">›</span>
  <a href="/blog.html?cat=${encodeURIComponent(post.category || '')}">${escapeHtml(post.category || '기타')}</a>
  <span class="post-breadcrumb-sep">›</span>
  <span aria-current="page">${escapeHtml(post.title)}</span>
</nav>`;
}

function renderPostHero(post) {
  return `<header class="post-hero">
  ${renderBreadcrumb(post)}
  <div class="post-meta">
    <a class="post-cat" href="${escapeHtml(categoryHref(post.category))}">${escapeHtml(post.category || '기타')}</a>
    <time class="post-date" datetime="${escapeHtml(post.pubDate)}">${formatDateKR(post.pubDate)}</time>
  </div>
  <h1 class="post-title">${escapeHtml(post.title)}</h1>
  ${post.excerpt ? `<p class="post-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
</header>`;
}

function renderRelatedCareTop(post) {
  const display = categoryDisplay(post.category);
  const href = categoryHref(post.category);
  if (href === '/blog.html') return '';
  return `<aside class="post-related-care top">
  <p>이 글은 <a href="${escapeHtml(href)}">${escapeHtml(display)}</a>와 관련된 내용입니다. 진료 상세는 해당 페이지에서 확인하실 수 있습니다.</p>
</aside>`;
}

function renderPostBody(post) {
  return `<div class="post-body">${post.bodyHtml || ''}</div>`;
}

function renderRelatedCareBottom(post) {
  const display = categoryDisplay(post.category);
  const href = categoryHref(post.category);
  if (href === '/blog.html') return '';
  return `<aside class="post-related-care bottom">
  <div class="post-related-care-label">관련 진료</div>
  <a href="${escapeHtml(href)}" class="post-related-care-card">
    <div>
      <div class="post-related-care-name">${escapeHtml(display)}</div>
      <div class="post-related-care-desc">진료 과정·시설·비용 안내를 자세히 보세요.</div>
    </div>
    <span class="post-related-care-arrow">→</span>
  </a>
</aside>`;
}

function renderBookingCta() {
  return `<aside class="post-booking-cta">
  <h2 class="post-booking-title">상담 · 예약 안내</h2>
  <p class="post-booking-sub">전문의 직접 진료 — 언제든 편하게 문의 주세요.</p>
  <div class="post-booking-buttons">
    <a href="tel:${SITE.tel}" class="post-booking-btn primary">
      <span class="post-booking-btn-icon">📞</span>
      <span class="post-booking-btn-label">전화 상담</span>
      <span class="post-booking-btn-value">${SITE.telDisplay}</span>
    </a>
    <a href="${SITE.naverBooking}" class="post-booking-btn naver" target="_blank" rel="nofollow noopener">
      <span class="post-booking-btn-icon">N</span>
      <span class="post-booking-btn-label">네이버 예약</span>
      <span class="post-booking-btn-value">바로가기 →</span>
    </a>
    <a href="${SITE.kakao}" class="post-booking-btn kakao" target="_blank" rel="nofollow noopener">
      <span class="post-booking-btn-icon">K</span>
      <span class="post-booking-btn-label">카카오톡 상담</span>
      <span class="post-booking-btn-value">채팅하기 →</span>
    </a>
  </div>
</aside>`;
}

function renderAuthorBox() {
  return `<aside class="post-author">
  <div class="post-author-photo"><img src="${SITE.doctor.photo}" alt="${SITE.doctor.title} ${SITE.doctor.name}" loading="lazy"></div>
  <div class="post-author-text">
    <div class="post-author-label">검토 의료진</div>
    <div class="post-author-name">${SITE.doctor.title} <strong>${SITE.doctor.name}</strong></div>
    <div class="post-author-cred">${SITE.doctor.cred}</div>
    <a class="post-author-link" href="/intro.html#page02">의료진 소개 자세히 보기 →</a>
  </div>
</aside>`;
}

function renderLocationBox() {
  return `<aside class="post-location">
  <h3>오시는 길</h3>
  <p class="post-location-addr">${SITE.address}</p>
  <p class="post-location-hours">${SITE.hours}</p>
  <a class="post-location-link" href="/intro.html#info">약도 · 주차 · 대중교통 자세히 →</a>
</aside>`;
}

function renderOutboundCta(post) {
  return `<aside class="post-outbound">
  <p class="post-outbound-label">원문이 궁금하신가요?</p>
  <a href="${escapeHtml(post.naverUrl || post.link)}" rel="nofollow noopener" target="_blank" class="post-outbound-btn">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/></svg>
    이 글을 네이버 블로그에서 보기
  </a>
</aside>`;
}

function renderDisclaimer(post) {
  const reviewed = formatDateKR(post.lastReviewedDate || post.fetchedBodyAt || new Date().toISOString());
  return `<p class="post-disclaimer">
  본 콘텐츠는 일반적인 정보 제공 목적이며, 정확한 진단·치료는 직접 내원 상담이 필요합니다.<br>
  최초 게시: ${formatDateKR(post.pubDate)} · 마지막 검토: ${reviewed}
</p>`;
}

function renderRelatedPosts(related) {
  if (!related?.length) return '';
  const cards = related.map(p => `
    <a class="post-related-card" href="${escapeHtml(p.internalUrl)}">
      <div class="post-related-card-thumb">${p.thumbnail ? `<img src="${escapeHtml(p.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}</div>
      <div class="post-related-card-body">
        <div class="post-related-card-cat">${escapeHtml(p.category || '기타')}</div>
        <h3 class="post-related-card-title">${escapeHtml(p.title)}</h3>
      </div>
    </a>`).join('');
  return `<section class="post-related-posts">
  <h2 class="post-related-posts-title">함께 읽으면 좋은 글</h2>
  <div class="post-related-posts-grid">${cards}</div>
</section>`;
}

// ── JSON-LD ─────────────────────────────────────────
function buildBlogPostingLd(post, canonical) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt,
    'image': post.thumbnail ? [post.thumbnail] : [`${SITE.url}${SITE.ogImage}`],
    'datePublished': post.pubDate,
    'dateModified': post.lastReviewedDate || post.fetchedBodyAt || post.pubDate,
    'author': {
      '@type': 'Person',
      'name': `${SITE.doctor.title} ${SITE.doctor.name}`,
      'url': `${SITE.url}/intro.html#page02`
    },
    'publisher': {
      '@type': 'MedicalOrganization',
      'name': SITE.name,
      'logo': { '@type': 'ImageObject', 'url': `${SITE.url}${SITE.logo}` }
    },
    'mainEntityOfPage': { '@type': 'WebPage', '@id': canonical },
    'articleSection': post.category,
    'keywords': [post.category, '강동구 치과', '길동역 치과', SITE.name].filter(Boolean).join(', ')
  };
}

function buildBreadcrumbLd(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': '홈', 'item': `${SITE.url}/` },
      { '@type': 'ListItem', 'position': 2, 'name': '블로그', 'item': `${SITE.url}/blog.html` },
      { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': `${SITE.url}${post.internalUrl}` }
    ]
  };
}

function buildOrganizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    'name': SITE.name,
    'legalName': SITE.legalName,
    'url': SITE.url,
    'logo': `${SITE.url}${SITE.logo}`,
    'image': `${SITE.url}${SITE.ogImage}`,
    'telephone': SITE.tel,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '양재대로 1465, 마루홈타운 502호',
      'addressLocality': '강동구',
      'addressRegion': '서울특별시',
      'addressCountry': 'KR'
    },
    'medicalSpecialty': 'Dentistry'
  };
}

// ── 메인 페이지 빌더 ─────────────────────────────────
export function renderPostPage({ post, related }) {
  const canonical = `${SITE.url}${post.internalUrl}`;
  const description = post.excerpt || `${post.title} | ${SITE.name}`;
  const ldScripts = [
    jsonLd(buildBlogPostingLd(post, canonical)),
    jsonLd(buildBreadcrumbLd(post)),
    jsonLd(buildOrganizationLd()),
  ];

  return `<!DOCTYPE html>
<html lang="ko">
${renderHead({
    title: `${post.title} | ${SITE.name} 블로그`,
    description,
    canonical,
    ogImage: post.thumbnail,
    publishedTime: post.pubDate,
    modifiedTime: post.lastReviewedDate || post.fetchedBodyAt,
    ldScripts
  })}
<body>
${renderHeader()}

<main class="post-page">
<article>
${renderPostHero(post)}
${renderRelatedCareTop(post)}
${renderPostBody(post)}
${renderRelatedCareBottom(post)}
${renderBookingCta()}
${renderAuthorBox()}
${renderLocationBox()}
${renderOutboundCta(post)}
${renderDisclaimer(post)}
${renderRelatedPosts(related)}
</article>
</main>

${renderFooter()}
${renderQuickMenu()}

<script src="/js/common.js"></script>
</body>
</html>`;
}
