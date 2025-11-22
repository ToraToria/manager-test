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

document.getElementById('testForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Собираем ответы
  const formData = new FormData(e.target);
  const answers = {};
  for (let [key, value] of formData.entries()) {
    answers[key] = value;
  }

  // Пример простой оценки: сумма баллов
  let score = 0;
  for (let q in answers) {
    score += parseInt(answers[q]);
  }

  // Определяем уровень
  let level = "Новичок";
  if (score >= 7) level = "Опытный менеджер";
  if (score >= 9) level = "Эксперт";

  // Сохраняем в Firebase
  await db.collection("results").add({
    answers: answers,
    score: score,
    level: level,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Показываем результат
  document.getElementById('result').innerText = `Ваш уровень: ${level} (баллы: ${score})`;
  document.getElementById('result').style.display = 'block';

  
  e.target.reset();
});