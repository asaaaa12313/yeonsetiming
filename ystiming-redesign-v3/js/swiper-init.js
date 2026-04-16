/* ═══════════════════════════════════════════════
   연세타이밍치과 - Swiper 초기화
   히어로 배너, Before & After, 진료 과목
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── HERO SWIPER ───
  var heroEl = document.getElementById('heroSwiper');
  if (heroEl) {
    new Swiper('#heroSwiper', {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      autoplay: { delay: 3000, disableOnInteraction: false },
      loop: true,
      speed: 1000,
      pagination: {
        el: '.hero-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.hero-next',
        prevEl: '.hero-prev',
      },
    });
  }

  // ─── B&A SWIPER (탭별 별도 인스턴스) ───
  var bnaPanels = document.querySelectorAll('[data-bna-panel]');
  var bnaSwipers = {};

  function initBnaSwiper(panel) {
    var swiperEl = panel.querySelector('.bna-swiper');
    if (!swiperEl) return null;
    return new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 16,
      navigation: {
        nextEl: panel.querySelector('.bna-next'),
        prevEl: panel.querySelector('.bna-prev'),
      },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 16 },
        1200: { slidesPerView: 3, spaceBetween: 20 },
      },
    });
  }

  // 첫 번째 패널만 초기화
  if (bnaPanels.length > 0) {
    bnaSwipers['0'] = initBnaSwiper(bnaPanels[0]);
  }

  // B&A 탭 전환
  var tabs = document.querySelectorAll('.bna-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      var targetIdx = tab.getAttribute('data-tab');

      // 모든 패널 숨기고 타겟만 표시
      bnaPanels.forEach(function (p) {
        p.style.display = p.getAttribute('data-bna-panel') === targetIdx ? '' : 'none';
      });

      // 아직 초기화 안 된 Swiper면 초기화
      if (!bnaSwipers[targetIdx]) {
        var targetPanel = document.querySelector('[data-bna-panel="' + targetIdx + '"]');
        if (targetPanel) {
          bnaSwipers[targetIdx] = initBnaSwiper(targetPanel);
        }
      }
    });
  });

  // ─── TREATMENT SWIPER ───
  var treatEl = document.getElementById('treatSwiper');
  if (treatEl) {
    new Swiper('#treatSwiper', {
      slidesPerView: 2.5,
      spaceBetween: 12,
      freeMode: true,
      breakpoints: {
        768: { slidesPerView: 4.5, spaceBetween: 16 },
        1200: { slidesPerView: 7, spaceBetween: 20 },
      },
    });
  }

  // ─── 3D TILT + GLARE (마우스 추적) ───
  var tiltCards = document.querySelectorAll('.treat-card');
  tiltCards.forEach(function (card) {
    var glare = card.querySelector('.treat-glare');

    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;

      var rotY = ((x - cx) / cx) * 12;
      var rotX = ((cy - y) / cy) * 12;

      card.style.transform = 'rotateX(' + rotX.toFixed(1) + 'deg) rotateY(' + rotY.toFixed(1) + 'deg) scale(1.04)';
      card.style.animationPlayState = 'paused';

      if (glare) {
        var gx = (x / rect.width) * 100;
        var gy = (y / rect.height) * 100;
        glare.style.background = 'radial-gradient(circle at ' + gx + '% ' + gy + '%, rgba(255,255,255,0.25) 0%, transparent 55%)';
      }
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      card.style.animationPlayState = '';
      if (glare) glare.style.background = '';
    });
  });

})();
