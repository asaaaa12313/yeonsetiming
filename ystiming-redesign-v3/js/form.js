/* ═══════════════════════════════════════════════
   연세타이밍치과 - 빠른상담 폼
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  var form = document.getElementById('consultForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.querySelector('[name="name"]');
    var phone = form.querySelector('[name="phone"]');
    var agree = form.querySelector('[name="agree"]');

    // 간단한 유효성 검사
    if (!name || !name.value.trim()) {
      alert('성함을 입력해 주세요.');
      if (name) name.focus();
      return;
    }

    if (!phone || !phone.value.trim()) {
      alert('연락처를 입력해 주세요.');
      if (phone) phone.focus();
      return;
    }

    // 전화번호 형식 검증
    var phoneVal = phone.value.replace(/[^0-9]/g, '');
    if (phoneVal.length < 10 || phoneVal.length > 11) {
      alert('올바른 연락처를 입력해 주세요.');
      phone.focus();
      return;
    }

    if (!agree || !agree.checked) {
      alert('개인정보 수집·이용에 동의해 주세요.');
      return;
    }

    // 폼 데이터 수집
    var formData = {
      subject: form.querySelector('[name="subject"]') ? form.querySelector('[name="subject"]').value : '',
      name: name.value.trim(),
      phone: phone.value.trim(),
    };

    // 실제 서버 연동 시 여기에 fetch/XHR 호출
    console.log('상담 신청:', formData);
    alert('상담 신청이 접수되었습니다.\n빠른 시간 내에 연락드리겠습니다.');

    // 폼 초기화
    form.reset();

    // 패널 닫기
    var panel = document.querySelector('.consult-panel');
    if (panel) panel.classList.remove('open');
  });

})();
