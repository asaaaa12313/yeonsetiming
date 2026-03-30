/* ═══════════════════════════════════════════════
   연세타이밍치과 - Common JS
   헤더 스크롤, 퀵메뉴, 모바일 메뉴, 팝업, Reveal
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── HEADER SCROLL ───
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        header.classList.remove('transparent');
        header.classList.add('solid');
      } else {
        header.classList.remove('solid');
        header.classList.add('transparent');
      }
    });
  }

  // ─── MEGA MENU BAR (full-width dropdown) ───
  var headerNav = document.querySelector('.header-nav');
  var megaBar = document.getElementById('megaMenuBar');
  if (headerNav && megaBar) {
    var megaTimeout;
    headerNav.addEventListener('mouseenter', function () {
      clearTimeout(megaTimeout);
      megaBar.classList.add('active');
    });
    headerNav.addEventListener('mouseleave', function () {
      megaTimeout = setTimeout(function () {
        megaBar.classList.remove('active');
      }, 200);
    });
    megaBar.addEventListener('mouseenter', function () {
      clearTimeout(megaTimeout);
      megaBar.classList.add('active');
    });
    megaBar.addEventListener('mouseleave', function () {
      megaBar.classList.remove('active');
    });
  }

  // ─── MOBILE MENU ───
  var menuBtn = document.querySelector('.mobile-menu-btn');
  var drawer = document.querySelector('.mobile-drawer');
  var overlay = document.querySelector('.mobile-drawer-overlay');

  function openMobileMenu() {
    if (menuBtn) menuBtn.classList.add('active');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (menuBtn) menuBtn.classList.remove('active');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      if (drawer && drawer.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }

  // ─── QUICK MENU ───
  var quickMenu = document.getElementById('quickMenu');
  if (quickMenu) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        quickMenu.classList.add('visible');
      } else {
        quickMenu.classList.remove('visible');
      }
    });
  }

  // Scroll to top
  var topBtn = document.querySelector('.quick-menu .top-btn');
  if (topBtn) {
    topBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── SCROLL REVEAL + MOTION GRAPHICS ───

  // char-reveal: 글자를 개별 span으로 분리
  function prepareCharReveal() {
    var els = document.querySelectorAll('[data-motion="char-reveal"]');
    els.forEach(function (el) {
      if (el.dataset.charReady) return;
      var text = el.textContent;
      var html = '';
      var charIndex = 0;
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === ' ' || ch === '\n') {
          html += ch;
        } else {
          var delay = charIndex * 0.04;
          html += '<span class="m-char" style="transition-delay:' + delay.toFixed(2) + 's">' + ch + '</span>';
          charIndex++;
        }
      }
      el.innerHTML = html;
      el.dataset.charReady = '1';
    });
  }

  // countup: 숫자 카운트업 애니메이션
  function animateCountup(el) {
    var target = parseInt(el.dataset.target || el.textContent, 10);
    if (isNaN(target)) return;
    var suffix = el.dataset.suffix || '';
    var prefix = el.dataset.prefix || '';
    var duration = 1500;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutQuart
      var eased = 1 - Math.pow(1 - progress, 4);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    el.textContent = prefix + '0' + suffix;
    requestAnimationFrame(step);
  }

  // parallax: 스크롤 속도 차이
  function initParallax() {
    var pEls = document.querySelectorAll('[data-motion="parallax"]');
    if (!pEls.length) return;
    var speed;
    function onScroll() {
      var scrollY = window.scrollY;
      pEls.forEach(function (el) {
        speed = parseFloat(el.dataset.speed || 0.3);
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var viewCenter = window.innerHeight / 2;
        var offset = (center - viewCenter) * speed;
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initMotion() {
    // char-reveal 준비
    prepareCharReveal();

    // 모든 모션 요소 + 기존 .reveal 수집
    var motionEls = document.querySelectorAll('.reveal, [data-motion]');
    if (!motionEls.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // countup 트리거
          if (entry.target.dataset.motion === 'countup') {
            animateCountup(entry.target);
          }

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    motionEls.forEach(function (el) {
      observer.observe(el);
    });

    // parallax 초기화
    initParallax();
  }
  initMotion();

  // ─── POPUP LAYER ───
  var popupOverlay = document.querySelector('.popup-overlay');
  if (popupOverlay) {
    // Check 24h cookie
    var lastClosed = localStorage.getItem('popup_closed');
    if (lastClosed && (Date.now() - parseInt(lastClosed)) < 86400000) {
      // Don't show
    } else {
      // 인트로가 있으면 인트로 완료 후 표시, 없으면 1초 후 표시
      var intro = document.getElementById('intro');
      var popupDelay = (intro && !sessionStorage.getItem('intro_played')) ? 9000 : 1000;
      setTimeout(function () {
        popupOverlay.classList.add('open');
      }, popupDelay);
    }

    // Close buttons
    var closeBtn = popupOverlay.querySelector('.popup-close-btn');
    var todayBtn = popupOverlay.querySelector('.popup-today-close');
    var justCloseBtn = popupOverlay.querySelector('.popup-just-close');

    function closePopup() {
      popupOverlay.classList.remove('open');
    }

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (justCloseBtn) justCloseBtn.addEventListener('click', closePopup);
    if (todayBtn) {
      todayBtn.addEventListener('click', function () {
        localStorage.setItem('popup_closed', Date.now().toString());
        closePopup();
      });
    }
  }

  // ─── CONSULT FORM TOGGLE ───
  var consultBtn = document.querySelector('.consult-float-btn');
  var consultPanel = document.querySelector('.consult-panel');
  if (consultBtn && consultPanel) {
    consultBtn.addEventListener('click', function () {
      consultPanel.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.consult-float')) {
        consultPanel.classList.remove('open');
      }
    });
  }

})();
