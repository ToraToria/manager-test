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

// Инициализация навигации
const questionsWrapper = document.getElementById('questionsWrapper');
const questions = Array.from(document.querySelectorAll('.question'));
const totalQuestions = questions.length;
let currentQuestionIndex = 0;

// Элементы навигации
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const questionsIndicator = document.getElementById('questionsIndicator');

// Создаем индикаторы вопросов
function createQuestionIndicators() {
  questionsIndicator.innerHTML = '';
  questions.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'indicator-dot';
    dot.dataset.index = index;
    if (index === 0) dot.classList.add('active');
    
    dot.addEventListener('click', () => {
      if (index !== currentQuestionIndex) {
        goToQuestion(index);
      }
    });
    
    questionsIndicator.appendChild(dot);
  });
}

// Обновление прогресса
function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Вопрос ${currentQuestionIndex + 1} из ${totalQuestions}`;
  
  // Обновляем индикаторы
  document.querySelectorAll('.indicator-dot').forEach((dot, index) => {
    dot.classList.remove('active', 'completed');
    if (index === currentQuestionIndex) {
      dot.classList.add('active');
    } else if (index < currentQuestionIndex) {
      dot.classList.add('completed');
    }
  });
}

// Переход к вопросу
function goToQuestion(index, direction = 'right') {
  if (index < 0 || index >= totalQuestions) return;
  
  const currentQuestion = questions[currentQuestionIndex];
  const nextQuestion = questions[index];
  
  // Определяем направление анимации
  const isForward = index > currentQuestionIndex;
  const leavingClass = isForward ? 'leaving-left' : 'leaving-right';
  const enteringClass = isForward ? 'next' : 'prev';
  
  // Анимация ухода текущего вопроса
  currentQuestion.classList.remove('active');
  currentQuestion.classList.add(leavingClass);
  
  // Подготовка нового вопроса
  nextQuestion.classList.remove('prev', 'next', 'leaving-left', 'leaving-right');
  nextQuestion.classList.add(enteringClass);
  
  // Задержка для анимации
  setTimeout(() => {
    currentQuestionIndex = index;
    
    // Скрываем старый, показываем новый
    currentQuestion.classList.remove(leavingClass);
    nextQuestion.classList.remove(enteringClass);
    nextQuestion.classList.add('active');
    
    // Обновляем UI
    updateProgress();
    updateNavButtons();
    
    // Плавный скролл к верху
    window.scrollTo({
      top: questionsWrapper.offsetTop - 100,
      behavior: 'smooth'
    });
  }, 300);
}

// Обновление кнопок навигации
function updateNavButtons() {
  prevBtn.disabled = currentQuestionIndex === 0;
  
  if (currentQuestionIndex === totalQuestions - 1) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'block';
  } else {
    nextBtn.style.display = 'block';
    submitBtn.style.display = 'none';
  }
}

// Проверка, ответил ли на вопрос
function isQuestionAnswered(index) {
  const question = questions[index];
  const inputs = question.querySelectorAll('input[type="radio"]');
  return Array.from(inputs).some(input => input.checked);
}

// Инициализация
function initQuestions() {
  // Перемещаем все вопросы в wrapper
  questions.forEach(question => {
    questionsWrapper.appendChild(question);
    question.style.position = 'absolute';
  });
  
  // Показываем первый вопрос
  questions[0].classList.add('active');
  
  // Скрываем остальные
  for (let i = 1; i < questions.length; i++) {
    questions[i].classList.add('next');
  }
  
  createQuestionIndicators();
  updateProgress();
  updateNavButtons();
}

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
      }, 300);
      
      // Автоматически переходим к следующему вопросу через 0.5 секунды
      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          goToQuestion(currentQuestionIndex + 1, 'right');
        }
      }, 500);
    });
  });
});

// Навигация по кнопкам
prevBtn.addEventListener('click', () => {
  if (currentQuestionIndex > 0) {
    goToQuestion(currentQuestionIndex - 1, 'left');
  }
});

nextBtn.addEventListener('click', () => {
  if (currentQuestionIndex < totalQuestions - 1) {
    if (isQuestionAnswered(currentQuestionIndex)) {
      goToQuestion(currentQuestionIndex + 1, 'right');
    } else {
      // Анимация тряски для незаполненного вопроса
      const currentQuestion = questions[currentQuestionIndex];
      currentQuestion.style.animation = 'shake 0.5s ease';
      setTimeout(() => {
        currentQuestion.style.animation = '';
      }, 500);
      
      alert('Пожалуйста, выберите ответ перед переходом к следующему вопросу.');
    }
  }
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  initQuestions();
});

// Отправка формы
document.getElementById('testForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const submitBtn = this.querySelector('#submitBtn');
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
        goToQuestion(i - 1);
        const unansweredQuestion = questions[i - 1];
        unansweredQuestion.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
          unansweredQuestion.style.animation = '';
        }, 500);
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

// Добавляем анимацию тряски
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);
