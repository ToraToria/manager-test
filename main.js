// main.js - упрощённая версия для отправки формы
const db = firebase.firestore();

// Проверка имени
const firstName = localStorage.getItem('firstName');
const lastName = localStorage.getItem('lastName');

if (firstName && lastName) {
  const greetingElement = document.getElementById('userGreeting');
  if (greetingElement) {
    greetingElement.innerText = `Добро пожаловать, ${firstName} ${lastName}!`;
  }
} else {
  window.location.href = 'index.html';
}

// Отправка формы
document.getElementById('testForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const submitBtn = this.querySelector('#submitBtn');
  if (!submitBtn) return;
  
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Отправка...';
  submitBtn.disabled = true;
  
  // Анимация кнопки
  submitBtn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    submitBtn.style.transform = '';
  }, 300);

  try {
    const formData = new FormData(e.target);
    const answers = {};
    let allAnswered = true;
    const totalQuestions = 15;
    
    // Проверяем, что на все вопросы даны ответы
    for (let i = 1; i <= totalQuestions; i++) {
      const answer = formData.get(`q${i}`);
      if (!answer) {
        allAnswered = false;
        alert(`Пожалуйста, ответьте на вопрос ${i} перед отправкой.`);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      answers[`q${i}`] = answer;
    }

    let score = 0;
    for (let q in answers) {
      score += parseInt(answers[q]);
    }

    let level = "Новичок";
    if (score >= 30) level = "Опытный менеджер";
    if (score >= 40) level = "Профессионал высокого уровня";

    console.log('Отправка данных в Firebase...');
    
    const result = await db.collection("results").add({
      firstName: firstName,
      lastName: lastName,
      answers: answers,
      score: score,
      level: level,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Данные успешно отправлены! ID документа:', result.id);
    
    // Сохраняем результат
    localStorage.setItem('lastScore', score);
    localStorage.setItem('lastLevel', level);
    
    // Плавный переход к результатам
    submitBtn.textContent = '✓ Успешно!';
    submitBtn.style.background = 'var(--success)';
    
    setTimeout(() => {
      window.location.href = 'results.html';
    }, 1000);
    
  } catch (error) {
    console.error('Ошибка при отправке в Firebase:', error);
    submitBtn.textContent = 'Ошибка!';
    submitBtn.style.background = 'var(--danger)';
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.style.background = '';
    }, 2000);
  }
});
