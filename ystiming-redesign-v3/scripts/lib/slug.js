/**
 * slug.js — 한글 친화 slug 생성 유틸
 *
 * 정책:
 *  - 한글/영문/숫자/하이픈만 허용
 *  - 공백 → '-'
 *  - 60자 컷 (URL 길이 합리적 한도)
 *  - 충돌 시 logNo 끝 4자리 부착
 */

export function slugify(title) {
  return String(title || '')
    .replace(/[?!.,;:'"“”‘’()[\]{}<>~`@#$%^&*+=|\\/]/g, ' ')   // 구두점 → 공백
    .replace(/[^\p{L}\p{N}\s-]/gu, '')                          // 언어/숫자/공백/하이픈만
    .replace(/\s+/g, '-')                                       // 공백 → -
    .replace(/-+/g, '-')                                        // 중복 - 압축
    .replace(/^-|-$/g, '')                                      // 양끝 - 제거
    .slice(0, 60)
    .replace(/-+$/, '');                                        // 컷 후 끝 - 정리
}

/**
 * existingSlugs(Set)에 이미 같은 slug가 있으면 logNo 끝 4자리를 붙여 충돌 회피.
 * 그래도 충돌하면 6자리, 8자리 순으로 늘림.
 */
export function uniqueSlug(title, id, existingSlugs) {
  const base = slugify(title);
  if (!base) return String(id);                                 // 제목이 비정상이면 id로 폴백
  if (!existingSlugs.has(base)) return base;
  for (const len of [4, 6, 8]) {
    const candidate = `${base}-${String(id).slice(-len)}`;
    if (!existingSlugs.has(candidate)) return candidate;
  }
  return `${base}-${id}`;
}
