// user.js
function startTest() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();

  if (!firstName || !lastName) {
    alert('Пожалуйста, введите имя и фамилию.');
    return;
  }

  // Сохраняем в localStorage — это безопасно и просто
  localStorage.setItem('firstName', firstName);
  localStorage.setItem('lastName', lastName);

  // Переходим на тест
  window.location.href = 'test.html';
}
