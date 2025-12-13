// main.js - интегрированный с навигацией
document.addEventListener('DOMContentLoaded', function() {
  console.log('main.js загружен');
  
  // Проверка имени
  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');

  if (firstName && lastName) {
    const greetingElement = document.getElementById('userGreeting');
    if (greetingElement) {
      greetingElement.innerText = `Добро пожаловать, ${firstName} ${lastName}!`;
    }
  } else {
    console.log('Имя не найдено, перенаправление на index.html');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    return;
  }

  // Получаем ссылку на Firestore
  const db = firebase.firestore();
  
  // Функция для проверки ответа на вопрос
  function isQuestionAnswered(index) {
    // Используем глобальную функцию или проверяем самостоятельно
    if (typeof window.isQuestionAnswered === 'function') {
      return window.isQuestionAnswered(index);
    }
    
    // Fallback проверка
    const questions = document.querySelectorAll('.question');
    if (questions[index]) {
      const inputs = questions[index].querySelectorAll('input[type="radio"]');
      return Array.from(inputs).some(input => input.checked);
    }
    return false;
  }
  
  // Функция для перехода к вопросу
  function goToQuestion(index) {
    if (typeof window.goToQuestion === 'function') {
      window.goToQuestion(index);
    } else {
      // Fallback навигация
      const questions = document.querySelectorAll('.question');
      questions.forEach((q, i) => {
        q.classList.remove('active');
        if (i === index) {
          q.classList.add('active');
        }
      });
      
      // Обновляем текущий индекс
      if (typeof window.currentQuestionIndex !== 'undefined') {
        window.currentQuestionIndex = index;
      }
      
      // Обновляем прогресс
      updateProgress(index);
    }
  }
  
  // Функция обновления прогресса
  function updateProgress(currentIndex) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
      const totalQuestions = 15;
      const progress = ((currentIndex + 1) / totalQuestions) * 100;
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `Вопрос ${currentIndex + 1} из ${totalQuestions}`;
    }
  }
  
  // Функция для поиска первого неотвеченного вопроса
  function findFirstUnansweredQuestion() {
    const totalQuestions = 15;
    for (let i = 0; i < totalQuestions; i++) {
      if (!isQuestionAnswered(i)) {
        return i;
      }
    }
    return -1; // Все вопросы отвечены
  }

  // Отправка формы
  const testForm = document.getElementById('testForm');
  if (testForm) {
    console.log('Форма найдена, добавляем обработчик submit');
    
    testForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Форма отправляется...');
      
      const submitBtn = document.getElementById('submitBtn');
      if (!submitBtn) {
        console.error('Кнопка submitBtn не найдена');
        return;
      }
      
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      submitBtn.disabled = true;
      
      // Анимация кнопки
      submitBtn.style.transform = 'scale(0.95)';
      submitBtn.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        submitBtn.style.transform = '';
      }, 300);

      try {
        // Собираем все ответы из формы
        const formData = new FormData(this);
        const answers = {};
        let allAnswered = true;
        const totalQuestions = 15;
        
        console.log('Проверка ответов на все вопросы...');
        
        // Проверяем, что на все вопросы даны ответы
        for (let i = 1; i <= totalQuestions; i++) {
          const answer = formData.get(`q${i}`);
          console.log(`Вопрос ${i}:`, answer ? 'ответ дан' : 'нет ответа');
          
          if (!answer) {
            allAnswered = false;
            const questionIndex = i - 1;
            
            // Показываем анимацию на пропущенном вопросе
            const questions = document.querySelectorAll('.question');
            if (questions[questionIndex]) {
              questions[questionIndex].style.animation = 'shake 0.5s ease';
              setTimeout(() => {
                questions[questionIndex].style.animation = '';
              }, 500);
            }
            
            // Переходим к пропущенному вопросу
            let currentIndex = 0;
            if (typeof window.currentQuestionIndex !== 'undefined') {
              currentIndex = window.currentQuestionIndex;
            }
            
            if (currentIndex !== questionIndex) {
              console.log(`Переход к пропущенному вопросу ${i}`);
              goToQuestion(questionIndex);
            }
            
            // Показываем сообщение
            const errorMsg = document.createElement('div');
            errorMsg.className = 'validation-error';
            errorMsg.innerHTML = `
              <p style="color: #e74c3c; background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 4px; margin: 10px 0;">
                ⚠️ Пожалуйста, ответьте на вопрос ${i} перед отправкой.
              </p>
            `;
            
            // Вставляем сообщение перед формой
            const form = document.getElementById('testForm');
            if (form && !document.querySelector('.validation-error')) {
              form.parentNode.insertBefore(errorMsg, form);
              
              // Удаляем сообщение через 3 секунды
              setTimeout(() => {
                if (errorMsg.parentNode) {
                  errorMsg.parentNode.removeChild(errorMsg);
                }
              }, 3000);
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
          }
          answers[`q${i}`] = answer;
        }

        if (!allAnswered) {
          console.log('Не все вопросы отвечены');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          return;
        }

        console.log('Все вопросы отвечены, подсчет баллов...');
        
        // Подсчет баллов
        let score = 0;
        for (let q in answers) {
          score += parseInt(answers[q]);
        }

        // Определение уровня
        let level = "Новичок";
        if (score >= 30) level = "Опытный менеджер";
        if (score >= 40) level = "Профессионал высокого уровня";

        console.log('Результат:', { score, level });
        console.log('Отправка данных в Firebase...');
        
        // Отправка в Firebase
        const result = await db.collection("results").add({
          firstName: firstName,
          lastName: lastName,
          answers: answers,
          score: score,
          level: level,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Данные успешно отправлены! ID документа:', result.id);
        
        // Сохраняем результат в localStorage
        localStorage.setItem('lastScore', score);
        localStorage.setItem('lastLevel', level);
        
        // Плавный переход к результатам
        submitBtn.textContent = '✓ Успешно!';
        submitBtn.style.background = '#27ae60';
        submitBtn.style.color = 'white';
        submitBtn.style.borderColor = '#27ae60';
        
        // Добавляем анимацию успеха
        submitBtn.style.transition = 'all 0.5s ease';
        
        // Показываем сообщение об успехе
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `
          <div style="text-align: center; padding: 20px; background: rgba(39, 174, 96, 0.1); border-radius: 8px; margin: 20px 0;">
            <p style="color: #27ae60; font-weight: bold; margin-bottom: 10px;">
              ✅ Результат сохранен! Вы набрали ${score} баллов.
            </p>
            <p style="color: #bdc3c7;">
              Ваш уровень: <strong>${level}</strong>
            </p>
            <p style="color: #95a5a6; font-size: 14px; margin-top: 10px;">
              Перенаправление на страницу результатов...
            </p>
          </div>
        `;
        
        const form = document.getElementById('testForm');
        if (form && !document.querySelector('.success-message')) {
          form.parentNode.insertBefore(successMsg, form);
        }
        
        // Ждем 1.5 секунды и переходим
        setTimeout(() => {
          console.log('Переход на results.html...');
          window.location.href = 'results.html';
        }, 1500);
        
      } catch (error) {
        console.error('Ошибка при отправке в Firebase:', error);
        
        submitBtn.textContent = 'Ошибка!';
        submitBtn.style.background = '#e74c3c';
        submitBtn.style.color = 'white';
        submitBtn.style.borderColor = '#e74c3c';
        
        // Показываем сообщение об ошибке
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `
          <div style="text-align: center; padding: 20px; background: rgba(231, 76, 60, 0.1); border-radius: 8px; margin: 20px 0;">
            <p style="color: #e74c3c
