const preventForms = document.querySelectorAll('.prevent-multiple-submit-form');
const preventButtons = document.querySelectorAll('.prevent-multiple-submit-button');

preventForms.forEach((form) => {
  form.addEventListener('submit', function() {
    // Form gönderildiğinde tüm butonları devre dışı bırak
    preventButtons.forEach(button => button.disabled = true);
  });
});