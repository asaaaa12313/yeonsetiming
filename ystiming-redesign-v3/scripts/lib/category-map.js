/**
 * category-map.js — 네이버 블로그 카테고리 → 우리 사이트 진료 페이지 매핑
 *
 * 상세 페이지의 "관련 진료" 차별화 블록에서 사용. 매핑이 없으면 /blog.html로 폴백.
 */

export const CATEGORY_TO_HREF = {
  '임플란트': '/implant.html',
  '심미치료': '/beauty.html',
  '잇몸,연조직 질환': '/care.html',
  '자연치아살리기치료': '/care.html',
  '사랑니': '/care.html',
  '연세타이밍치과': '/intro.html',
};

export const CATEGORY_DISPLAY = {
  '임플란트': '임플란트 센터',
  '심미치료': '심미치료 센터',
  '잇몸,연조직 질환': '잇몸·연조직 진료',
  '자연치아살리기치료': '자연치아살리기 (MTA·신경치료)',
  '사랑니': '당일 사랑니 발치',
  '연세타이밍치과': '연세타이밍치과 소개',
};

// 네이버 카테고리에 NO-BREAK SPACE(U+00A0)가 섞여 들어오는 경우가 있어 정규화 필수.
// 명시적   이스케이프로 작성 — 에디터 자동 변환으로 NBSP가 일반 공백으로 치환되는 사고 방지.
export function normalizeCategory(category) {
  return String(category || '').replace(/ /g, ' ').trim();
}

export function categoryHref(category) {
  return CATEGORY_TO_HREF[normalizeCategory(category)] || '/blog.html';
}

export function categoryDisplay(category) {
  const n = normalizeCategory(category);
  return CATEGORY_DISPLAY[n] || n || '블로그';
}
