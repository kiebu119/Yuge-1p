window.addEventListener('DOMContentLoaded', function () {

  // ================================
  // 0. HEROスライドショー
  // ================================
  var slides = document.querySelectorAll('.hero-slide');
  var currentSlide = 0;

  setInterval(function () {
    slides[currentSlide].classList.remove('is-active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('is-active');
  }, 5000);

  // ================================
  // 1. スクロールアニメーション（IntersectionObserver）
  // ================================
  var fadeEls = document.querySelectorAll('.fade-in, .trust-item');
  
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach(function (el) {
    observer.observe(el);
  });

  // ================================
  // 2. プランボタン → 予約フォームに自動反映
  // ================================
  var planButtons = document.querySelectorAll('.plan .btn[data-plan]');
  var planSelect = document.getElementById('plan');

  planButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var planName = btn.getAttribute('data-plan');
      if (planSelect && planName) {
        for (var i = 0; i < planSelect.options.length; i++) {
          if (planSelect.options[i].text === planName) {
            planSelect.selectedIndex = i;
            break;
          }
        }
      }
    });
  });

  // ================================
  // 3. インラインバリデーション
  // ================================
  var nameInput = document.getElementById('name');
  var emailInput = document.getElementById('email');
  var phoneInput = document.getElementById('phone');
  var dateInput = document.getElementById('date');
  var timeSelect = document.getElementById('time');

  var nameError = document.getElementById('name-error');
  var emailError = document.getElementById('email-error');
  var phoneError = document.getElementById('phone-error');
  var dateError = document.getElementById('date-error');
  var timeError = document.getElementById('time-error');

  function showError(input, errorEl, message) {
    errorEl.textContent = message;
    input.classList.add('is-error');
  }

  function clearError(input, errorEl) {
    errorEl.textContent = '';
    input.classList.remove('is-error');
  }

  function validateName() {
    if (!nameInput.value.trim()) {
      showError(nameInput, nameError, 'お名前を入力してください。');
      return false;
    }
    clearError(nameInput, nameError);
    return true;
  }

  function validateEmail() {
    var val = emailInput.value.trim();
    if (!val) {
      showError(emailInput, emailError, 'メールアドレスを入力してください。');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showError(emailInput, emailError, 'メールアドレスの形式が正しくありません。');
      return false;
    }
    clearError(emailInput, emailError);
    return true;
  }

  function validatePhone() {
    var val = phoneInput.value.trim();
    if (!val) {
      showError(phoneInput, phoneError, '電話番号を入力してください。');
      return false;
    }
    var digits = val.replace(/[-ー－]/g, '');
    if (!/^\d{10,13}$/.test(digits)) {
      showError(phoneInput, phoneError, '電話番号の形式が正しくありません。例: 090-1234-5678');
      return false;
    }
    clearError(phoneInput, phoneError);
    return true;
  }

  function validateDate() {
    if (!dateInput.value) {
      showError(dateInput, dateError, 'ご希望日を選択してください。');
      return false;
    }
    var selected = new Date(dateInput.value + 'T00:00:00');
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      showError(dateInput, dateError, '過去の日付は選択できません。');
      return false;
    }
    clearError(dateInput, dateError);
    return true;
  }

  function validateTime() {
    if (!timeSelect.value) {
      showError(timeSelect, timeError, 'ご希望時間を選択してください。');
      return false;
    }
    clearError(timeSelect, timeError);
    return true;
  }

  // リアルタイムバリデーション
  nameInput.addEventListener('input', function () {
    if (nameInput.classList.contains('is-error')) validateName();
  });

  emailInput.addEventListener('input', function () {
    if (emailInput.classList.contains('is-error')) validateEmail();
  });

  phoneInput.addEventListener('input', function () {
    var digits = this.value.replace(/\D/g, '');
    if (digits.length <= 3) {
      this.value = digits;
    } else if (digits.length <= 7) {
      this.value = digits.slice(0, 3) + '-' + digits.slice(3);
    } else {
      this.value = digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7, 11);
    }
    if (phoneInput.classList.contains('is-error')) validatePhone();
  });

  dateInput.addEventListener('change', function () {
    if (dateInput.classList.contains('is-error')) validateDate();
  });

  timeSelect.addEventListener('change', function () {
    if (timeSelect.classList.contains('is-error')) validateTime();
  });

  // ================================
  // 4. 予約フォーム送信 + Thanks画面
  // ================================
  var submitBtn = document.querySelector('.btn-submit');
  var bookingSection = document.getElementById('booking');
  var thanksSection = document.getElementById('thanks');

  submitBtn.addEventListener('click', function () {
    var isNameValid = validateName();
    var isEmailValid = validateEmail();
    var isPhoneValid = validatePhone();
    var isDateValid = validateDate();
    var isTimeValid = validateTime();

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isDateValid || !isTimeValid) {
      var firstError = document.querySelector('.is-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    var data = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      date: dateInput.value,
      time: timeSelect.value,
      plan: document.getElementById('plan').value,
      people: document.getElementById('people').value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    fetch('https://script.google.com/macros/s/AKfycbydUCLsZkdtS26D6DxCKv6NK6m7wrAqLBfQiFgXdM0acEZwuTdn3Ut6VnoR6N2I0Pk/exec', {
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        // Thanks画面に予約内容を反映
        document.getElementById('thanks-plan').textContent = data.plan;
        document.getElementById('thanks-name').textContent = data.name;
        document.getElementById('thanks-people').textContent = data.people;
        document.getElementById('thanks-datetime').textContent = data.date + ' ' + data.time;

        // フォーム非表示 → Thanks表示
        bookingSection.style.display = 'none';
        thanksSection.classList.add('is-show');
        thanksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // フォームリセット
        nameInput.value = '';
        emailInput.value = '';
        phoneInput.value = '';
        dateInput.value = '';
        timeSelect.selectedIndex = 0;
        document.getElementById('plan').selectedIndex = 0;
        document.getElementById('people').selectedIndex = 0;
      })
      .catch(function (error) {
        alert('送信エラーが発生しました。\n通信環境をご確認の上、もう一度お試しください。');
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = '予約を確定する';
      });
  });

  // トップに戻るボタン
  document.getElementById('thanks-top').addEventListener('click', function (e) {
    e.preventDefault();
    thanksSection.classList.remove('is-show');
    bookingSection.style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});