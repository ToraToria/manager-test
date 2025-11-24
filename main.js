// main.js
const firebaseConfig = {
  apiKey: "AIzaSyAmTtXSLeksMmRuxlmt19qz60zESOCFGGY",
  authDomain: "manager-test-2b964.firebaseapp.com",
  projectId: "manager-test-2b964",
  storageBucket: "manager-test-2b964.firebasestorage.app",
  messagingSenderId: "769825814408",
  appId: "1:769825814408:web:072ec41246a2d1027b6c3d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Показываем приветствие
const firstName = localStorage.getItem('firstName');
const lastName = localStorage.getItem('lastName');

if (firstName && lastName) {
  document.getElementById('userGreeting').innerText = `Привет, ${firstName} ${lastName}! Пройдите тест ниже.`;
} else {
  // Если кто-то зашёл напрямую — перенаправляем на index.html
  window.location.href = 'index.html';
}

// Обработка отправки теста
document.getElementById('testForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const answers = {};
  for (let [key, value] of formData.entries()) {
    answers[key] = value;
  }

  let score = 0;
  for (let q in answers) {
    score += parseInt(answers[q]);
  }

  let level = "Новичок";
  if (score >= 30) level = "Опытный менеджер";
  if (score >= 40) level = "Профессионал высокого уровня";

  // Сохраняем имя и фамилию
  await db.collection("results").add({
    firstName: firstName,
    lastName: lastName,
    answers: answers,
    score: score,
    level: level,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById('result').innerText = `Ваш уровень: ${level} (баллы: ${score})`;
  document.getElementById('result').style.display = 'block';
  e.target.reset();
});
