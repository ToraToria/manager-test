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

// Проверка имени
const firstName = localStorage.getItem('firstName');
const lastName = localStorage.getItem('lastName');

if (firstName && lastName) {
  document.getElementById('userGreeting').innerText = `Привет, ${firstName} ${lastName}!`;
} else {
  window.location.href = 'index.html';
}

// === Логика поочерёдного показа вопросов ===
const questions = document.querySelectorAll('.question');
const totalQuestions = questions.length;
let currentQuestionIndex = 0;

// Показываем первый вопрос
if (questions.length > 0) {
  questions[currentQuestionIndex].classList.remove('hidden');
}

// Обрабатываем выбор ответа
questions.forEach((question, index) => {
  const inputs = question.querySelectorAll('input[type="radio"]');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      if (index === currentQuestionIndex) {
        setTimeout(() => {
          currentQuestionIndex++;
          if (currentQuestionIndex < totalQuestions) {
            questions[currentQuestionIndex].classList.remove('hidden');
          } else {
            document.getElementById('submitBtn').style.display = 'block';
          }
        }, 300);
      }
    });
  });
});

// Отправка формы
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

  await db.collection("results").add({
    firstName: firstName,
    lastName: lastName,
    answers: answers,
    score: score,
    level: level,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Переход на страницу результатов
  window.location.href = 'results.html';
});
