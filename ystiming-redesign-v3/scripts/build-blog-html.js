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
const HTML_PATH = path.resolve(__dirname, '..', 'blog.html');
const PRERENDER_COUNT = 9;

const MARK_START = '<!-- BLOG_SSG_START -->';
const MARK_END = '<!-- BLOG_SSG_END -->';

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
  return `  <a class="blog-card" href="${escapeHtml(p.link)}" target="_blank" rel="noopener">
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

async function main() {
  const json = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));
  const posts = Array.isArray(json.posts) ? json.posts.slice(0, PRERENDER_COUNT) : [];

  let html = await fs.readFile(HTML_PATH, 'utf-8');

  const staticCards = posts.length === 0
    ? ''
    : posts.map(renderCard).join('\n');

  const ssgBlock = `${MARK_START}\n${staticCards}\n${MARK_END}`;

  if (html.includes(MARK_START) && html.includes(MARK_END)) {
    const re = new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}`);
    html = html.replace(re, ssgBlock);
  } else {
    // Insert inside <div class="blog-grid" id="blogGrid"> ... </div>
    // right after opening tag
    const openTag = '<div class="blog-grid" id="blogGrid" aria-live="polite">';
    const idx = html.indexOf(openTag);
    if (idx === -1) {
      console.error('[build-blog-html] #blogGrid element not found');
      process.exit(1);
    }
    const insertAt = idx + openTag.length;
    html = html.slice(0, insertAt) + '\n' + ssgBlock + '\n' + html.slice(insertAt);
  }

  // Update last-modified meta (helpful for search engines)
  const nowIso = new Date().toISOString();
  html = html.replace(
    /<meta http-equiv="last-modified"[^>]*>/,
    ''
  );
  html = html.replace(
    /<meta property="og:type" content="website">/,
    `<meta property="og:type" content="website">\n<meta http-equiv="last-modified" content="${nowIso}">`
  );

  await fs.writeFile(HTML_PATH, html, 'utf-8');
  console.log(`[build-blog-html] ✓ injected ${posts.length} posts into blog.html`);
}

main().catch(err => {
  console.error('[build-blog-html] FATAL:', err);
  process.exit(1);
});
