/**
 * audit-images.mjs
 *
 * 시술 콘텐츠 재정비(docs/plan-content-revision.md)의 종료 조건을 기계적으로 검증한다.
 *
 *   1) 섹션-이미지 매칭  — 각 시술 섹션이 자기 시술 폴더의 이미지를 쓰는지 (타 시술 폴더 차용 0건)
 *   2) 클라이언트 제공 사진 — 원장 제공 39장이 전부 사이트에 배치되고 실제로 참조되는지
 *   3) 의료광고 표현    — 무통·첨단·완벽 등 클라이언트가 금지한 표현이 본문/meta/alt에 남아있는지
 *
 * 실행: node scripts/audit-images.mjs   (프로젝트 루트 = ystiming-redesign-v3)
 * 종료코드 0 = PASS, 1 = FAIL
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = ['index', 'intro', 'special', 'implant', 'beauty', 'care', 'tmj'];

/* ── 1) 섹션이 쓸 수 있는 이미지 경로 ───────────────────────────────
   key   = `<페이지>#<섹션 id>`
   value = 허용 경로 prefix 배열. 섹션 주제와 무관한 폴더를 쓰면 FAIL.
   공용 자산(로고·지도·의료진·시설)은 ALWAYS_OK 로 어디서나 허용.        */
const ALWAYS_OK = ['img/logo', 'img/main/map', 'img/doctor/', 'img/og_image'];

const SECTION_RULES = {
  'implant#page01': ['img/implant/navigation/'],
  'implant#page02': ['img/implant/oneday/'],
  'implant#page03': ['img/implant/full-arch/'],
  'implant#page03-case': ['img/implant/full-arch/'],
  'implant#page04': ['img/implant/sinus/'],
  'implant#page05': ['img/implant/ridge/'],
  'implant#page06': ['img/implant/overdenture/'],
  'implant#page07': ['img/implant/repair/'],
  'implant#page08': ['img/implant/repair/'],
  'implant#page09': ['img/implant/denture/'],
  'implant#page10': ['img/implant/maintenance/'],
  'implant#page11': ['img/implant/plasma/'],

  'beauty#page01': ['img/beauty/laminate/'],
  'beauty#page02': ['img/beauty/resin/'],
  'beauty#page03': ['img/beauty/prosthetics/'],
  'beauty#page04': ['img/beauty/whitening/'],

  'care#page01': ['img/care/wisdom/'],
  'care#page02': ['img/care/biopsy/'],
  'care#page03': ['img/care/mta/'],
  'care#page04': ['img/care/endodontic/'],
  'care#page05': ['img/care/scaling/'],
  'care#page06': ['img/care/cervical/'],
  'care#page07': ['img/care/pediatric/'],
  'care#page08': ['img/care/preortho/'],
  'care#page09': ['img/care/wire/'],

  'special#page01': ['img/special/disabled/'],
  // 장비 사진은 intro/equipment 가 원본 위치이므로 공유를 허용하되,
  // 아래 SHARED_OK 에 명시된 경로만 통과시킨다.
  'special#page02': ['img/special/onestop/', 'img/intro/equipment/'],
  'special#page03': ['img/special/anesthesia/'],
  'special#page04': ['img/special/foreign/'],
  'special#page05': ['img/intro/equipment/'],
  'special#page06': ['img/special/sterilization/'],

  'tmj#page01': ['img/tmj/physical/'],
  'tmj#page02': ['img/tmj/mouthpiece/', 'img/tmj/splint/'],
  'tmj#page03': ['img/tmj/botox/'],
  'tmj#page04': ['img/tmj/pdrn/'],
  'tmj#page05': ['img/tmj/mouthpiece/'],

  // 2026-08-23: 의료진 소개를 치과 철학보다 먼저 배치 (클라이언트 요청)
  'intro#page01': ['img/doctor/'],
  'intro#page02': ['img/intro/clinic/', 'img/facility/'],
  'intro#page03': ['img/intro/equipment/'],
  'intro#page04': ['img/intro/media/'],
  'intro#page05': ['img/intro/clinic/'],
};

/* ── 2) 원장 제공 사진 → 사이트 배치 경로 ───────────────────────── */
const CLIENT_ASSETS = [
  ['발치와보존술.png', 'img/implant/ridge/01'],
  ['원데이임플란트 치아 .png', 'img/implant/oneday/01'],
  ['원데이임플란트.png', 'img/implant/oneday/02'],
  ['원데이임플란트.jpg', 'img/implant/oneday/03'],
  ['플라즈마임플.png', 'img/implant/plasma/01'],
  ['임플란트 수리.jpg', 'img/implant/repair/16'],
  ['임플란트 관리.png', 'img/implant/maintenance/01'],
  ['틀니,부분틀니.jpg', 'img/implant/denture/05'],
  ['지르코니아크라운.png', 'img/beauty/prosthetics/01'],
  ['올세라믹크라운.png', 'img/beauty/prosthetics/02'],
  ['세라믹 인레이.png', 'img/beauty/prosthetics/03'],
  ['불소도포.png', 'img/care/pediatric/10'],
  ['큐레이.png', 'img/intro/equipment/06'],
  ['007.JPG', 'img/intro/equipment/07'],
  ['CT.png', 'img/intro/equipment/08'],
  ['image.png', 'img/care/scaling/05'],
  ['vrn.ARW', 'img/care/scaling/06'],   // 카메라 RAW → JPEG 변환 후 배치
  ['멸균포스터.jpg', 'img/special/sterilization/02'],
  ['장애인치과.png', 'img/special/disabled/04'],
  ['휠체어 할머니.jpg', 'img/special/disabled/05'],
  // 이전 라운드에서 이미 반영된 20장
  ['TV+모임1.jpg', 'img/intro/media/03'],
  ['TV+모임2.jpg', 'img/intro/media/05'],
  ['나를살리는1교시01.jpg', 'img/intro/media/06'],
  ['나를살리는1교시08.jpg', 'img/intro/media/07'],
  ['나를살리는1교시41 - 복사본.jpg', 'img/intro/media/09'],
  ['나를살리는1교시49.jpg', 'img/intro/media/11'],
  ['나를살리는1교시69.jpg', 'img/intro/media/12'],
  ['나를살리는1교시77.jpg', 'img/intro/media/14'],
  ['나를살리는1교시80.jpg', 'img/intro/media/16'],
  ['메디트 스캐너.png', 'img/intro/equipment/05'],
  ['연세타이밍치과 소독과정.jpg', 'img/special/sterilization/01'],
  ['완료후 엑스레이.jpg', 'img/implant/full-arch/01'],
  ['치경부레진 (1).jpg', 'img/care/cervical/05'],
  ['치경부지아이.jpg', 'img/care/cervical/06'],
  ['치료전 엑스레이.jpg', 'img/implant/full-arch/02'],
  ['치료전 임상사진.jpg', 'img/implant/full-arch/03'],
  ['치료후 엑스레이.jpg', 'img/implant/overdenture/02'],
  ['치료후 임상사진.jpg', 'img/implant/full-arch/05'],
  ['치료후.jpg', 'img/implant/overdenture/03'],
];

/* ── 3) 클라이언트가 금지한 표현 ─────────────────────────────────── */
const BANNED = ['무통', '최첨단', '첨단', '통증없', '완벽', '최고의'];

// ────────────────────────────────────────────────────────────────
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const html = Object.fromEntries(PAGES.map((p) => [p, read(`${p}.html`)]));
const allHtml = Object.values(html).join('\n');

let fail = 0;
const log = (ok, msg) => {
  if (!ok) fail++;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${msg}`);
};

console.log('\n[1] 섹션-이미지 매칭 (타 시술 폴더 차용)');
let unruled = 0;
for (const page of PAGES) {
  if (page === 'index') continue;
  for (const chunk of html[page].split(/<section\b/).slice(1)) {
    const id = chunk.match(/id="([^"]+)"/)?.[1];
    if (!id) continue;
    const key = `${page}#${id}`;
    const imgs = [...new Set(chunk.match(/img\/[A-Za-z0-9_\-/]+\.(?:webp|jpg|png|svg)/g) || [])];
    const allow = SECTION_RULES[key];
    if (!allow) {
      // 규칙 없는 섹션을 조용히 넘기면 새 섹션이 무검증으로 통과한다
      if (imgs.length && !['sub-hero', 'info'].includes(id)) {
        unruled++;
        log(false, `${key} → SECTION_RULES 미등록인데 이미지 ${imgs.length}장 사용 (규칙을 추가하세요)`);
      }
      continue;
    }
    const bad = imgs.filter(
      (i) => !allow.some((a) => i.startsWith(a)) && !ALWAYS_OK.some((a) => i.startsWith(a))
    );
    if (bad.length) log(false, `${key} → 허용 ${allow.join('|')} 밖: ${bad.join(', ')}`);
  }
}
if (!fail) console.log('  ok   차용 0건, 미등록 섹션 0건');

console.log('\n[2] 원장 제공 사진 배치·참조');
let missing = 0;
for (const [src, dst] of CLIENT_ASSETS) {
  const exists = ['.webp', '.jpg', '.png', '.JPG'].some((e) => fs.existsSync(path.join(ROOT, dst + e)));
  const pages = PAGES.filter((p) =>
    ['.webp', '.jpg', '.png'].some((e) => html[p].includes(dst + e))
  );
  if (!exists || !pages.length) {
    missing++;
    log(false, `${src} → ${dst} (파일 ${exists ? 'O' : 'X'} / 참조 ${pages.length ? pages.join(',') : 'X'})`);
  }
}
if (!missing) console.log(`  ok   ${CLIENT_ASSETS.length}장 전부 배치·참조됨`);

console.log('\n[3] 금지 표현 (본문·meta·alt + 블로그 nav 템플릿)');
// 블로그 본문은 원장이 쓴 원문이라 제외하지만, 우리가 만든 nav/템플릿은 검사 대상이다.
// (이 구멍 때문에 blog/ 66개 페이지의 "3단계 무통마취"가 PASS로 통과한 적이 있다)
const templateSrc = fs.existsSync(path.join(ROOT, 'scripts/lib/template.js'))
  ? read('scripts/lib/template.js')
  : '';
const blogNav = fs
  .readdirSync(path.join(ROOT, 'blog'))
  .filter((f) => f.endsWith('.html'))
  .map((f) => {
    const t = read(`blog/${f}`);
    // 헤더~메가메뉴 구간만 잘라 검사 (본문 원문은 제외)
    const start = t.indexOf('<header');
    const end = t.indexOf('</div>', t.indexOf('mega-menu-bar'));
    return start >= 0 && end > start ? { f, nav: t.slice(start, end) } : null;
  })
  .filter(Boolean);

for (const word of BANNED) {
  const hits = PAGES.flatMap((p) => {
    const n = (html[p].match(new RegExp(word, 'g')) || []).length;
    return n ? [`${p}.html×${n}`] : [];
  });
  if (templateSrc.includes(word)) hits.push(`scripts/lib/template.js`);
  const blogHits = blogNav.filter((b) => b.nav.includes(word)).length;
  if (blogHits) hits.push(`blog/*.html(nav)×${blogHits}`);
  log(hits.length === 0, `"${word}" ${hits.length ? hits.join(' ') : '0건'}`);
}

console.log('\n[4] 블로그 nav 링크-라벨 일치 (intro 섹션 순서 변경 대비)');
{
  const expect = [
    ['/intro.html#page01', '의료진 소개'],
    ['/intro.html#page02', '치과 철학'],
  ];
  let bad = 0;
  for (const { f, nav } of blogNav) {
    for (const [href, label] of expect) {
      const m = nav.match(new RegExp(`href="${href.replace(/[/#]/g, '\\$&')}">([^<]*)<`));
      if (m && m[1] !== label) {
        bad++;
        if (bad <= 3) log(false, `blog/${f}: ${href} 라벨이 "${m[1]}" (기대 "${label}")`);
      }
    }
  }
  if (bad > 3) log(false, `… 외 ${bad - 3}건 더`);
  if (!bad) console.log(`  ok   블로그 ${blogNav.length}개 nav 링크-라벨 일치`);
}

console.log(fail ? `\n❌ FAIL ${fail}건\n` : '\n✅ PASS — 종료 조건 충족\n');
process.exit(fail ? 1 : 0);
