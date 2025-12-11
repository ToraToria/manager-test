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
}

const questions = document.querySelectorAll('.question');
const totalQuestions = questions.length;
let currentQuestionIndex = 0;

// Элементы навигации
const prevBtn = document.getElementById('prevBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Вопрос ${currentQuestionIndex + 1} из ${totalQuestions}`;
}

function showQuestion(index) {
  // Скрываем текущий вопрос с анимацией
  const currentQuestion = questions[currentQuestionIndex];
  if (currentQuestion) {
    currentQuestion.classList.remove('active');
    currentQuestion.classList.add('hidden');
  }
  
  // Показываем новый вопрос с задержкой для плавности
  setTimeout(() => {
    const newQuestion = questions[index];
    if (newQuestion) {
      newQuestion.classList.remove('hidden');
      setTimeout(() => {
        newQuestion.classList.add('active');
      }, 50);
    }
    
    currentQuestionIndex = index;
    updateProgress();
    
    // Прокручиваем к вопросу плавно
    if (newQuestion) {
      newQuestion.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }
  }, 300);
}

// Инициализация
showQuestion(currentQuestionIndex);

// Обработка выбора ответа
questions.forEach((question, index) => {
  const inputs = question.querySelectorAll('input[type="radio"]');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      // Анимация выбора
      const label = input.closest('label');
      label.style.transform = 'translateX(10px)';
      label.style.background = 'rgba(52, 152, 219, 0.1)';
      label.style.borderColor = 'var(--accent)';
      
      setTimeout(() => {
        label.style.transform = '';
        label.style.background = '';
        label.style.borderColor = '';
      }, 200);
      
      // Автоматический переход к следующему вопросу с задержкой
      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          showQuestion(currentQuestionIndex + 1);
        }
      }, 500);
    });
  });
});

// Кнопка "Назад"
if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      showQuestion(currentQuestionIndex - 1);
    }
  });
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
    
    // Проверяем, что на все вопросы даны ответы
    for (let i = 1; i <= totalQuestions; i++) {
      const answer = formData.get(`q${i}`);
      if (!answer) {
        allAnswered = false;
        // Показываем, какой вопрос не отвечен
        const questionIndex = i - 1;
        const unansweredQuestion = questions[questionIndex];
        if (unansweredQuestion) {
          unansweredQuestion.style.animation = 'shake 0.5s ease';
          setTimeout(() => {
            unansweredQuestion.style.animation = '';
          }, 500);
        }
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

// Добавляем анимацию тряски для незаполненных полей
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);
