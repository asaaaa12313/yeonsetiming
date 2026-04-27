/**
 * fetch-naver-blog.js
 *
 * Fetches Naver blog RSS (wyyezbrmztora), extracts thumbnail/summary/category,
 * merges with existing data/blog-posts.json (keeps previously fetched posts),
 * and writes the union back to disk.
 *
 * Runs daily via .github/workflows/fetch-blog.yml (6h cron).
 *
 * Usage:
 *   cd ystiming-redesign-v3/scripts
 *   npm install
 *   node fetch-naver-blog.js
 *
 * Env:
 *   NAVER_BLOG_ID (default: wyyezbrmztora)
 *   MAX_POSTS (default: 300)  — cap the stored archive to avoid unbounded growth
 */

import Parser from 'rss-parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uniqueSlug } from './lib/slug.js';
import { categoryHref } from './lib/category-map.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_ID = process.env.NAVER_BLOG_ID || 'wyyezbrmztora';
const MAX_POSTS = parseInt(process.env.MAX_POSTS || '300', 10);
const RSS_URL = `https://rss.blog.naver.com/${BLOG_ID}.xml`;
const OUT_PATH = path.resolve(__dirname, '..', 'data', 'blog-posts.json');

const parser = new Parser({
  customFields: {
    item: ['category', 'dc:creator']
  }
});

// ── Extract Naver blog logNo from URL ─────────────────────────
// e.g. https://blog.naver.com/wyyezbrmztora/223456789012 → "223456789012"
function extractId(link) {
  if (!link) return null;
  const m = link.match(/\/(\d{10,})(?:[/?#]|$)/);
  return m ? m[1] : link;
}

// ── Extract first image src from HTML description ─────────────
function extractThumbnail(html) {
  if (!html) return null;
  // Look for <img src="..." in priority, but also check postfiles CDN URLs
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!imgMatch) return null;
  let src = imgMatch[1];
  // Naver often uses data URIs or low-res thumbnails — prefer full-size
  // Replace "type=w80" / "type=m80" → "type=w773" for better quality if present
  src = src.replace(/[?&]type=[wm]\d+/, '?type=w773');
  return src;
}

// ── Extract text summary from HTML description ────────────────
function extractSummary(html, maxLen = 120) {
  if (!html) return '';
  // Remove tags, decode common entities
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
}

// ── Normalize an RSS item into our post schema ────────────────
function normalizeItem(item) {
  const id = extractId(item.link);
  if (!id) return null;
  const pubDate = item.isoDate || item.pubDate || new Date().toISOString();
  const category = (item.category || '기타').trim();
  return {
    id,
    title: (item.title || '(제목 없음)').trim(),
    link: item.link,
    category,
    pubDate,
    thumbnail: extractThumbnail(item['content:encoded'] || item.content || item.description || ''),
    summary: extractSummary(item['content:encoded'] || item.content || item.description || '')
  };
}

async function loadExisting() {
  try {
    const raw = await fs.readFile(OUT_PATH, 'utf-8');
    const json = JSON.parse(raw);
    return Array.isArray(json.posts) ? json.posts : [];
  } catch {
    return [];
  }
}

async function main() {
  console.log(`[fetch-naver-blog] fetching ${RSS_URL}`);
  let feed;
  try {
    feed = await parser.parseURL(RSS_URL);
  } catch (err) {
    console.error('[fetch-naver-blog] RSS fetch failed:', err.message);
    process.exit(1);
  }

  const newPosts = (feed.items || [])
    .map(normalizeItem)
    .filter(Boolean);
  console.log(`[fetch-naver-blog] fetched ${newPosts.length} new items`);

  const existing = await loadExisting();
  console.log(`[fetch-naver-blog] existing archive has ${existing.length} posts`);

  // Union: merge by id, prefer the newly-fetched version (in case category/thumbnail changed)
  const byId = new Map(existing.map(p => [p.id, p]));
  for (const p of newPosts) {
    byId.set(p.id, p);
  }

  // Sort by pubDate descending, cap to MAX_POSTS
  const merged = Array.from(byId.values())
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, MAX_POSTS);

  // ── SEO 필드 부여: slug, internalUrl, categoryHref, naverUrl ────
  // 기존 글의 slug는 보존(URL 변경 시 SEO 손실), 신규 글에만 충돌 방지하며 부여
  const existingSlugs = new Set();
  merged.forEach(p => { if (p.slug) existingSlugs.add(p.slug); });
  merged.forEach(p => {
    if (!p.slug) {
      p.slug = uniqueSlug(p.title, p.id, existingSlugs);
      existingSlugs.add(p.slug);
    }
    p.internalUrl = `/blog/${p.slug}.html`;
    p.categoryHref = categoryHref(p.category);
    p.naverUrl = p.link;
  });

  // Categories — keep insertion order grouped by post frequency
  const catCount = new Map();
  merged.forEach(p => {
    const c = p.category || '기타';
    catCount.set(c, (catCount.get(c) || 0) + 1);
  });
  const categories = Array.from(catCount.entries())
    .sort((a, b) => b[1] - a[1])  // most frequent first
    .map(([c]) => c);

  const output = {
    updatedAt: new Date().toISOString(),
    blogUrl: `https://blog.naver.com/${BLOG_ID}`,
    totalCount: merged.length,
    categories,
    posts: merged,
    _note: '이 파일은 GitHub Actions(.github/workflows/fetch-blog.yml)가 6시간마다 자동 갱신합니다. 수동 편집 금지.'
  };

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  console.log(`[fetch-naver-blog] ✓ wrote ${OUT_PATH} (${merged.length} posts, ${categories.length} categories)`);
}

main().catch(err => {
  console.error('[fetch-naver-blog] FATAL:', err);
  process.exit(1);
});
