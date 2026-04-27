/**
 * fetch-naver-bodies.js
 *
 * 각 글의 모바일 페이지(m.blog.naver.com/{blogId}/{logNo})에서 본문을 스크레이프하여
 * data/blog-posts.json의 각 post에 bodyHtml/bodyText/images/excerpt/wordCount/fetchedBodyAt 채운다.
 *
 * 증분 로직: fetchedBodyAt + bodyHtml이 이미 있으면 스킵.
 *
 * Usage:
 *   node fetch-naver-bodies.js
 *
 * Env:
 *   NAVER_BLOG_ID  (default: wyyezbrmztora)
 *   FORCE_REFETCH  ("1"이면 모든 글 다시 가져옴)
 *   FETCH_DELAY_MS (default: 600 — 네이버 서버 예의)
 */

import { load } from 'cheerio';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_ID = process.env.NAVER_BLOG_ID || 'wyyezbrmztora';
const FORCE = process.env.FORCE_REFETCH === '1';
const DELAY = parseInt(process.env.FETCH_DELAY_MS || '600', 10);
const DATA_PATH = path.resolve(__dirname, '..', 'data', 'blog-posts.json');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

// 본문에 통과시킬 태그 화이트리스트
const ALLOWED_TAGS = new Set([
  'p', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'b', 'i', 'u',
  'ul', 'ol', 'li',
  'blockquote', 'figure', 'figcaption',
  'img', 'br', 'a', 'hr',
  'table', 'thead', 'tbody', 'tr', 'td', 'th'
]);
// 태그별 보존 속성
const ALLOWED_ATTRS = {
  img: ['src', 'alt'],
  a: ['href'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function normalizeImageSrc(src) {
  if (!src) return null;
  if (src.startsWith('data:')) return null;            // 인라인 base64 placeholder는 버림
  if (src.startsWith('//')) src = 'https:' + src;
  if (src.startsWith('/')) src = 'https://m.blog.naver.com' + src;
  // 썸네일 사이즈를 본문 폭에 맞게 업스케일
  src = src.replace(/([?&])type=[wmf]\d+/i, '$1type=w773');
  return src;
}

function cleanTree($, $root, blogTitle) {
  // 1. 위험/잡음 노드 통째 제거
  $root.find([
    'script', 'style', 'iframe', 'embed', 'object',
    'video', 'audio', 'button', 'input', 'form',
    'nav', 'aside', 'noscript',
    '.se-sticker', '.se-video', '.se-oglink',
    '.se-placesMap', '.se-map', '.__se_object',
    '.se-mention', '.se-pollComponent', '.se-recentBlog',
    '.se-codeBlock'
  ].join(', ')).remove();

  // 2. h1은 본문에 있으면 우리 페이지의 h1과 충돌 → h2로 강등
  $root.find('h1').each((_, el) => { el.tagName = 'h2'; });

  // 3. <br> 연속 정리는 후처리로 미루고, 일단 모든 노드 순회
  let imgIndex = 0;
  $root.find('*').each((_, el) => {
    const tag = (el.tagName || '').toLowerCase();
    if (!tag) return;
    const $el = $(el);

    // img 처리: 화이트리스트지만 src 정규화 + alt 보강 + 접근성 속성
    if (tag === 'img') {
      const rawSrc = el.attribs?.src
        || el.attribs?.['data-lazy-src']
        || el.attribs?.['data-src']
        || el.attribs?.['data-original'];
      const src = normalizeImageSrc(rawSrc);
      if (!src) { $el.remove(); return; }
      const alt = (el.attribs?.alt || '').trim();
      imgIndex += 1;
      el.attribs = {
        src,
        alt: alt || `${blogTitle} 본문 이미지 ${imgIndex}`,
        loading: 'lazy',
        referrerpolicy: 'no-referrer'
      };
      return;
    }

    // a 처리: 외부 유출 nofollow + 새 탭
    if (tag === 'a') {
      const href = el.attribs?.href || '';
      if (!href || href.startsWith('#')) { $el.replaceWith($el.contents()); return; }
      el.attribs = {
        href,
        rel: 'nofollow noopener',
        target: '_blank'
      };
      return;
    }

    // 화이트리스트 외 태그 → 자식 보존하며 unwrap (se-component, span, div 등)
    if (!ALLOWED_TAGS.has(tag)) {
      $el.replaceWith($el.contents());
      return;
    }

    // 화이트리스트 태그라도 인라인 속성은 모두 제거 (style/class/data-*)
    const allowed = new Set(ALLOWED_ATTRS[tag] || []);
    const attribs = el.attribs || {};
    for (const name of Object.keys(attribs)) {
      if (!allowed.has(name)) delete el.attribs[name];
    }
  });

  // 4. 빈 블록 정리 (텍스트도 미디어도 없는 경우; zero-width/nbsp도 빈 것으로 간주)
  const isBlank = (txt) => !txt || !txt.replace(/[\s ​-‍﻿​]/g, '').length;
  let removed = true;
  let guard = 0;
  while (removed && guard < 5) {
    removed = false;
    guard += 1;
    $root.find('p, li, blockquote, figure, h2, h3, h4').each((_, el) => {
      const $el = $(el);
      if (isBlank($el.text()) && !$el.find('img, br, hr').length) {
        $el.remove();
        removed = true;
      }
    });
  }

  // 5. 연속 <br> 압축 (3개 이상 → 단락 구분)
  $root.find('br + br + br').remove();
}

/**
 * cheerio가 출력한 HTML에서 SE 마커 주석과 과도한 공백을 정리.
 * 시각엔 영향 없지만 페이지 크기·로딩 속도에 큰 영향.
 */
function compactHtml(html) {
  return String(html || '')
    .replace(/<!--[\s\S]*?-->/g, '')          // HTML 주석 제거 (SE-TEXT 등)
    .replace(/>\s+</g, '><')                  // 태그 사이 공백/개행 제거
    .replace(/\s{2,}/g, ' ')                  // 연속 공백 압축
    .trim();
}

function extractImages($, $root) {
  const out = [];
  $root.find('img').each((_, el) => {
    const src = el.attribs?.src;
    const alt = el.attribs?.alt || '';
    if (src) out.push({ src, alt });
  });
  return out;
}

function htmlToText(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPostBody(post) {
  const url = `https://m.blog.naver.com/${BLOG_ID}/${post.id}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.5'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = load(html, { decodeEntities: false });

  // 본문 컨테이너 — SmartEditor 3.x 기본
  let $container = $('.se-main-container').first();
  if (!$container.length) $container = $('#postViewArea, .post_ct, .post-view').first();
  if (!$container.length) throw new Error('본문 컨테이너 없음');

  cleanTree($, $container, post.title);
  const images = extractImages($, $container);
  const bodyHtml = compactHtml($container.html());
  const bodyText = htmlToText(bodyHtml);
  if (bodyText.length < 50) throw new Error('본문 추출 실패 (너무 짧음)');

  const excerpt = bodyText.length > 155
    ? bodyText.slice(0, 155).replace(/\s+\S*$/, '') + '…'
    : bodyText;

  return {
    bodyHtml,
    bodyText,
    images,
    excerpt,
    wordCount: bodyText.length        // 한국어 기준 글자 수
  };
}

async function main() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const data = JSON.parse(raw);
  const posts = Array.isArray(data.posts) ? data.posts : [];

  let fetched = 0, skipped = 0, failed = 0;
  console.log(`[fetch-naver-bodies] 대상 ${posts.length}개 글 (FORCE=${FORCE})`);

  for (const post of posts) {
    if (!FORCE && post.bodyHtml && post.fetchedBodyAt) {
      skipped += 1;
      continue;
    }
    try {
      const body = await fetchPostBody(post);
      Object.assign(post, body, { fetchedBodyAt: new Date().toISOString() });
      fetched += 1;
      console.log(`  ✓ ${post.id} ${(post.title || '').slice(0, 36)} (${body.wordCount}자, img ${body.images.length})`);
      await sleep(DELAY);
    } catch (err) {
      failed += 1;
      console.warn(`  ✗ ${post.id} ${err.message}`);
    }
  }

  data.posts = posts;
  data.bodiesUpdatedAt = new Date().toISOString();
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`[fetch-naver-bodies] done — fetched: ${fetched}, skipped: ${skipped}, failed: ${failed}`);
}

main().catch(err => {
  console.error('[fetch-naver-bodies] FATAL:', err);
  process.exit(1);
});
