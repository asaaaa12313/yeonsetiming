/**
 * build-blog-html.js
 *
 * Injects the latest 9 blog posts into blog.html as static HTML (for SEO).
 * Reads data/blog-posts.json, builds static <article> cards inside blog.html
 * between <!-- BLOG_SSG_START --> and <!-- BLOG_SSG_END --> markers.
 *
 * If markers don't exist yet, inserts them inside #blogGrid.
 * Designed to run after fetch-naver-blog.js in the GitHub Actions pipeline.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.resolve(__dirname, '..', 'data', 'blog-posts.json');
const BLOG_HTML = path.resolve(__dirname, '..', 'blog.html');
const INDEX_HTML = path.resolve(__dirname, '..', 'index.html');

// 페이지별 SSG 사전 렌더 개수
const TARGETS = [
  { file: BLOG_HTML, marker: 'BLOG_SSG', count: 9 },
  { file: INDEX_HTML, marker: 'HOME_BLOG_SSG', count: 6 },
];

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function truncate(s, n) {
  if (!s) return '';
  s = s.replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function renderCard(p) {
  const safeTitle = escapeHtml(p.title || '(제목 없음)');
  const safeSummary = escapeHtml(truncate(p.summary, 110));
  const safeCat = escapeHtml(p.category || '기타');
  const date = formatDate(p.pubDate);
  const thumb = p.thumbnail
    ? `<img src="${escapeHtml(p.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
    : 'YONSEI';
  const thumbCls = p.thumbnail ? 'blog-card-thumb' : 'blog-card-thumb is-placeholder';
  // 내부 상세 페이지로 라우팅. internalUrl이 없으면 외부 폴백.
  const href = p.internalUrl || p.link;
  return `  <a class="blog-card" href="${escapeHtml(href)}">
    <div class="${thumbCls}">${thumb}</div>
    <div class="blog-card-body">
      <div class="blog-card-meta">
        <span class="blog-card-cat">${safeCat}</span>
        <span class="blog-card-date">${date}</span>
      </div>
      <h3 class="blog-card-title">${safeTitle}</h3>
      <p class="blog-card-summary">${safeSummary}</p>
    </div>
  </a>`;
}

async function injectCards({ file, marker, count }, posts) {
  const startMark = `<!-- ${marker}_START -->`;
  const endMark = `<!-- ${marker}_END -->`;
  let html;
  try {
    html = await fs.readFile(file, 'utf-8');
  } catch (err) {
    console.warn(`[build-blog-html] skip ${path.basename(file)}: ${err.message}`);
    return 0;
  }
  if (!html.includes(startMark) || !html.includes(endMark)) {
    console.warn(`[build-blog-html] skip ${path.basename(file)}: 마커 없음 (${marker}_START / _END)`);
    return 0;
  }
  const items = posts.slice(0, count);
  const cards = items.map(renderCard).join('\n');
  const block = `${startMark}\n${cards}\n${endMark}`;
  const re = new RegExp(`${startMark}[\\s\\S]*?${endMark}`);
  html = html.replace(re, block);
  await fs.writeFile(file, html, 'utf-8');
  console.log(`[build-blog-html] ✓ ${path.basename(file)} ← ${items.length}장`);
  return items.length;
}

async function main() {
  const json = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));
  const posts = Array.isArray(json.posts) ? json.posts : [];
  for (const target of TARGETS) {
    await injectCards(target, posts);
  }
  console.log('[build-blog-html] done');
}

main().catch(err => {
  console.error('[build-blog-html] FATAL:', err);
  process.exit(1);
});
