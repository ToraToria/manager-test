// main.js
const db = firebase.firestore();

// Проверка имени
const firstName = localStorage.getItem('firstName');
const lastName = localStorage.getItem('lastName');

if (firstName && lastName) {
  const greetingElement = document.getElementById('userGreeting');
  if (greetingElement) {
    greetingElement.innerText = `Привет, ${firstName} ${lastName}!`;
  }
} else {
  window.location.href = 'index.html';
}

const questions = document.querySelectorAll('.question');
const totalQuestions = questions.length;
let currentQuestionIndex = 0;

if (questions.length > 0) {
  questions[currentQuestionIndex].classList.remove('hidden');
  questions[currentQuestionIndex].classList.add('active');
}

questions.forEach((question, index) => {
  const inputs = question.querySelectorAll('input[type="radio"]');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      if (index === currentQuestionIndex) {
        setTimeout(() => {
          questions[currentQuestionIndex].classList.remove('active');
          setTimeout(() => {
            questions[currentQuestionIndex].classList.add('hidden');
            
            currentQuestionIndex++;
            if (currentQuestionIndex < totalQuestions) {
              questions[currentQuestionIndex].classList.remove('hidden');
              setTimeout(() => {
                questions[currentQuestionIndex].classList.add('active');
              }, 50);
            }
          }, 300);
        }, 300);
      }
    });
  });
});

// Отправка формы
document.getElementById('testForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Отправка...';
  submitBtn.disabled = true;

  try {
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

    console.log('Пытаемся отправить данные в Firebase...');
    
    const result = await db.collection("results").add({
      firstName: firstName,
      lastName: lastName,
      answers: answers,
      score: score,
      level: level,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('Данные успешно отправлены! ID документа:', result.id);
    
    window.location.href = 'results.html';
    
  } catch (error) {
    console.error('Ошибка при отправке в Firebase:', error);
    alert('Ошибка при отправке данных. Проверьте консоль для подробностей.');
    
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});
