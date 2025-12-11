// main.js
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

const questions = document.querySelectorAll('.question');
const totalQuestions = questions.length;
let currentQuestionIndex = 0;

// Элементы навигации
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('submitBtn'); // временно как next
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Вопрос ${currentQuestionIndex + 1} из ${totalQuestions}`;
}

function showQuestion(index) {
  questions.forEach((q, i) => {
    q.classList.remove('active');
    q.classList.add('hidden');
    if (i === index) {
      setTimeout(() => {
        q.classList.remove('hidden');
        q.classList.add('active');
      }, 50);
    }
  });
  
  // Обновляем кнопки навигации
  prevBtn.disabled = index === 0;
  
  updateProgress();
}

// Инициализация
showQuestion(currentQuestionIndex);
updateProgress();

// Обработка выбора ответа
questions.forEach((question, index) => {
  const inputs = question.querySelectorAll('input[type="radio"]');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      // Автоматический переход к следующему вопросу
      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          currentQuestionIndex++;
          showQuestion(currentQuestionIndex);
        }
      }, 300);
    });
  });
});

// Кнопка "Назад"
prevBtn.addEventListener('click', () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion(currentQuestionIndex);
  }
});

// Отправка формы
document.getElementById('testForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const submitBtn = this.querySelector('#submitBtn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Отправка...';
  submitBtn.disabled = true;

  try {
    const formData = new FormData(e.target);
    const answers = {};
    let allAnswered = true;
    
    // Проверяем, что на все вопросы даны ответы
    for (let i = 1; i <= totalQuestions; i++) {
      const answer = formData.get(`q${i}`);
      if (!answer) {
        allAnswered = false;
        break;
      }
      answers[`q${i}`] = answer;
    }

    if (!allAnswered) {
      alert('Пожалуйста, ответьте на все вопросы перед отправкой.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
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
    
    // Сохраняем результат в localStorage для отображения на следующей странице
    localStorage.setItem('lastScore', score);
    localStorage.setItem('lastLevel', level);
    
    window.location.href = 'results.html';
    
  } catch (error) {
    console.error('Ошибка при отправке в Firebase:', error);
    alert('Ошибка при отправке данных. Проверьте подключение к интернету.');
    
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});
