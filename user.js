// user.js
function startTest() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();

  if (!firstName || !lastName) {
    alert('Пожалуйста, введите имя и фамилию.');
    return;
  }

  // Проверка минимальной длины
  if (firstName.length < 2 || lastName.length < 2) {
    alert('Имя и фамилия должны содержать минимум 2 символа.');
    return;
  }

  // Очищаем предыдущие результаты
  localStorage.removeItem('lastScore');
  localStorage.removeItem('lastLevel');

  localStorage.setItem('firstName', firstName);
  localStorage.setItem('lastName', lastName);

  window.location.href = 'test.html';
}
