/* ═══════════════════════════════════════════════
   연세타이밍치과 - Intro Motion (5-Phase)
   검은 배경 → 슬로건 → 병원명 순차 등장 → 메인 전환
   sessionStorage 세션당 1회만 재생
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  var intro = document.getElementById('intro');
  if (!intro) return;

  // 세션당 1회만 재생
  if (sessionStorage.getItem('intro_played')) {
    intro.style.display = 'none';
    return;
  }

  document.body.style.overflow = 'hidden';

  // 5-Phase 시퀀스
  setTimeout(function () { intro.classList.add('phase-1'); }, 400);   // "정확한 진단"
  setTimeout(function () { intro.classList.add('phase-2'); }, 1500);  // "정직한 진료" + 서브
  setTimeout(function () { intro.classList.add('phase-3'); }, 3000);  // 슬로건 블러+페이드아웃
  setTimeout(function () { intro.classList.add('phase-4'); }, 3800);  // "연세타이밍" 순차 등장
  setTimeout(function () { intro.classList.add('phase-5'); }, 4800);  // "치과" 파란색 + glow

  // 로고 완성 후 2초 대기 → 페이드아웃 → 메인 노출
  setTimeout(function () {
    intro.classList.add('hidden');
    document.body.style.overflow = '';
    sessionStorage.setItem('intro_played', '1');
    setTimeout(function () { intro.remove(); }, 800);
  }, 8000);

})();

// 스킵 버튼
function skipIntro() {
  var intro = document.getElementById('intro');
  if (intro) {
    intro.classList.add('hidden');
    document.body.style.overflow = '';
    sessionStorage.setItem('intro_played', '1');
    setTimeout(function () { intro.remove(); }, 800);
  }
}
