/**
 * build-post-pages.js
 *
 * data/blog-posts.json의 본문이 채워진 글마다 blog/{slug}.html 정적 페이지를 생성하고,
 * sitemap.xml을 우리 사이트의 정적 페이지 + 모든 블로그 글로 재생성한다.
 *
 * Usage:
 *   node build-post-pages.js
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { renderPostPage, SITE } from './lib/template.js';
import { normalizeCategory } from './lib/category-map.js';

// 네이버 블로그 글 끝에 정형화돼 있는 "더 알아보기 / 위치 / 상담문의" 푸터 위젯은
// 우리 사이트에 같은 정보(위치/예약 CTA/외부 원문)가 이미 있어 중복 + 시각적 노이즈.
// 마커 헤딩 발견 시 그 형제부터 본문 끝까지 모두 잘라낸다.
const FOOTER_MARKERS = [
  '연세타이밍치과 더 알아보기',
  '연세타이밍치과 위치',
  '연세타이밍치과 상담문의',
  '연세타이밍치과 더알아보기',  // 띄어쓰기 변형 방어
];

function trimNaverFooter(bodyHtml) {
  if (!bodyHtml) return bodyHtml;
  if (!FOOTER_MARKERS.some(m => bodyHtml.includes(m))) return bodyHtml;
  const $ = load('<div id="__r">' + bodyHtml + '</div>', { decodeEntities: false });
  const $root = $('#__r');
  const $cut = $root.children().filter((_, el) => {
    const txt = $(el).text();
    return FOOTER_MARKERS.some(m => txt.includes(m));
  }).first();
  if (!$cut.length) return bodyHtml;
  $cut.nextAll().remove();
  $cut.remove();
  // 자른 뒤 본문 끝에 남는 hr / 빈 p 등 장식 잔여 제거
  let guard = 0;
  while (guard++ < 10) {
    const $last = $root.children().last();
    if (!$last.length) break;
    const tag = ($last.get(0).tagName || '').toLowerCase();
    const isEmpty = !$last.text().trim() && !$last.find('img').length;
    if (tag === 'hr' || isEmpty) { $last.remove(); continue; }
    break;
  }
  return $root.html().trim();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'blog-posts.json');
const OUT_DIR = path.join(ROOT, 'blog');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');

// 사이트 정적 페이지 목록 (sitemap.xml용)
const STATIC_PAGES = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/intro.html', priority: 0.9, changefreq: 'monthly' },
  { url: '/special.html', priority: 0.8, changefreq: 'monthly' },
  { url: '/implant.html', priority: 0.9, changefreq: 'monthly' },
  { url: '/beauty.html', priority: 0.8, changefreq: 'monthly' },
  { url: '/care.html', priority: 0.9, changefreq: 'monthly' },
  { url: '/tmj.html', priority: 0.8, changefreq: 'monthly' },
  { url: '/blog.html', priority: 0.9, changefreq: 'daily' },
];

function pickRelated(post, all, n = 3) {
  const cat = normalizeCategory(post.category);
  const others = all.filter(p => p.id !== post.id);
  const sameCat = others.filter(p => normalizeCategory(p.category) === cat);
  const filler = others.filter(p => normalizeCategory(p.category) !== cat);
  return [...sameCat, ...filler].slice(0, n);
}

async function main() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const data = JSON.parse(raw);
  const allPosts = Array.isArray(data.posts) ? data.posts : [];
  const buildPosts = allPosts.filter(p => p.bodyHtml && p.slug);

  console.log(`[build-post-pages] 빌드 대상: ${buildPosts.length} / 전체 ${allPosts.length}`);

  await fs.mkdir(OUT_DIR, { recursive: true });

  // ── 페이지 생성 ────────────────────────────────────
  const buildTime = new Date().toISOString();
  let written = 0, trimmed = 0;
  for (const post of buildPosts) {
    post.lastReviewedDate = buildTime;
    const before = post.bodyHtml;
    const after = trimNaverFooter(before);
    if (after !== before) trimmed += 1;
    const related = pickRelated(post, buildPosts, 3);
    const html = renderPostPage({ post: { ...post, bodyHtml: after }, related });
    const outPath = path.join(OUT_DIR, `${post.slug}.html`);
    await fs.writeFile(outPath, html, 'utf-8');
    written += 1;
  }
  console.log(`[build-post-pages] ✓ ${written}개 .html 생성 (네이버 푸터 정리: ${trimmed}건)`);

  // ── stale slug 정리 ────────────────────────────────
  const activeSlugs = new Set(buildPosts.map(p => p.slug));
  const existing = await fs.readdir(OUT_DIR);
  let removed = 0;
  for (const file of existing) {
    if (!file.endsWith('.html')) continue;
    const slug = file.slice(0, -5);
    if (!activeSlugs.has(slug)) {
      await fs.unlink(path.join(OUT_DIR, file));
      removed += 1;
    }
  }
  if (removed) console.log(`[build-post-pages] ✓ stale ${removed}개 제거`);

  // ── sitemap.xml 재생성 ────────────────────────────
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];
  for (const sp of STATIC_PAGES) {
    lines.push(
      '  <url>',
      `    <loc>${SITE.url}${sp.url}</loc>`,
      `    <changefreq>${sp.changefreq}</changefreq>`,
      `    <priority>${sp.priority.toFixed(1)}</priority>`,
      '  </url>'
    );
  }
  // 글: 최신순으로 (Google이 priority 외에도 신호로 활용)
  const sorted = [...buildPosts].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  for (const p of sorted) {
    const lastmod = (p.lastReviewedDate || p.fetchedBodyAt || p.pubDate).slice(0, 10);
    lines.push(
      '  <url>',
      `    <loc>${SITE.url}${p.internalUrl}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>monthly</changefreq>`,
      `    <priority>0.7</priority>`,
      '  </url>'
    );
  }
  lines.push('</urlset>', '');
  await fs.writeFile(SITEMAP_PATH, lines.join('\n'), 'utf-8');
  console.log(`[build-post-pages] ✓ sitemap.xml 갱신 (${STATIC_PAGES.length} 정적 + ${buildPosts.length} 글)`);

  // ── data 갱신 (lastReviewedDate, pagesBuiltAt) ────
  data.pagesBuiltAt = buildTime;
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');

  console.log('[build-post-pages] done');
}

main().catch(err => {
  console.error('[build-post-pages] FATAL:', err);
  process.exit(1);
});
