let subject = "";
let questions = [];
let answers = [];
let currentQ = 0;
let startTime = 0;
let timer = null;

// Fanni tanlash sahifasini ko'rsatish
function showSubjects() {
  document.getElementById('subjectPage').classList.remove('hidden');
  document.getElementById('testPage').classList.add('hidden');
  document.getElementById('resultPage').classList.add('hidden');
  clearInterval(timer);
}

// Dastlabki ochilishda
showSubjects();

// Test boshlash
function startTest(subj) {
  subject = subj;
  questions = testData[subj].slice(0, 30);
  answers = Array(questions.length).fill(null);
  currentQ = 0;
  startTime = Date.now();
  
  document.getElementById('subjectPage').classList.add('hidden');
  document.getElementById('resultPage').classList.add('hidden');
  document.getElementById('testPage').classList.remove('hidden');
  
  showQ();
  startTimer();
}

// Savolni ko'rsatish
function showQ() {
  const q = questions[currentQ];
  
  document.getElementById('questionNumber').textContent = `Savol ${currentQ + 1} / ${questions.length}`;
  document.getElementById('question').textContent = q.question;
  
  let optionsHTML = '';
  q.options.forEach((option, index) => {
    const isSelected = answers[currentQ] === index ? 'selected' : '';
    optionsHTML += `<button class="option ${isSelected}" onclick="answerQ(${index})">${option}</button>`;
  });
  
  document.getElementById('optionsContainer').innerHTML = optionsHTML;
  document.getElementById('status').textContent = '';
  
  document.getElementById('prevBtn').disabled = currentQ === 0;
  document.getElementById('nextBtn').textContent = (currentQ === questions.length - 1) ? "Testni Yakunlash ✓" : "Keyingi →";
  
  // Progress bar
  const progress = ((currentQ + 1) / questions.length) * 100;
  document.getElementById('progressBar').style.width = progress + '%';
}

// Variantni tanlash
function answerQ(index) {
  answers[currentQ] = index;
  showQ();
}

// Oldingi savol
function prevQ() {
  if (currentQ > 0) {
    currentQ--;
    showQ();
  }
}

// Keyingi savol
function nextQ() {
  if (answers[currentQ] === null) {
    document.getElementById('status').textContent = "❌ Avval javob belgilang!";
    return;
  }
  
  if (currentQ < questions.length - 1) {
    currentQ++;
    showQ();
  } else {
    showResult();
  }
}

// Timer
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer').textContent = `⏱️ Vaqt: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, 1000);
}

// Natijalarni ko'rsatish
function showResult() {
  clearInterval(timer);
  
  let correct = 0;
  answers.forEach((ans, i) => {
    if (ans === questions[i].correct) correct++;
  });
  
  const percent = Math.round((correct / questions.length) * 100);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  
  // Natija sahifasini ko'rsatish
  document.getElementById('testPage').classList.add('hidden');
  document.getElementById('resultPage').classList.remove('hidden');
  
  // Foiz
  document.getElementById('scorePercentage').textContent = percent + '%';
  
  // To'g'ri javoblar
  document.getElementById('correctAnswers').textContent = `${correct}/${questions.length}`;
  
  // Vaqt
  document.getElementById('timeSpent').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  // Tavsif
  let desc = '';
  if (percent >= 90) desc = '🎉 Ajoyib natija! Siz o\'tkazib berdingiz!';
  else if (percent >= 70) desc = '✅ Yaxshi natija!';
  else if (percent >= 50) desc = '📚 Yanada bilim oshirishga harakat qiling.';
  else desc = '💪 Yana o\'rganish kerak!';
  
  document.getElementById('resultDesc').textContent = desc;
  
  // Batafsil natijalar
  let detailHTML = '<h3>📋 Batafsil Natijalar</h3>';
  questions.forEach((q, i) => {
    const isCorrect = answers[i] === q.correct;
    const status = isCorrect ? '✅ To\'g\'ri' : '❌ Noto\'g\'ri';
    const className = isCorrect ? 'correct' : 'incorrect';
    
    detailHTML += `
      <div class="result-item ${className}">
        <strong>${i + 1}. ${status}</strong><br>
        <strong>Savol:</strong> ${q.question}<br>
        <strong>Sizning javob:</strong> ${answers[i] !== null ? q.options[answers[i]] : 'Javob berilmadi'}<br>
        ${!isCorrect ? `<strong style="color: #22c55e;">To'g'ri javob:</strong> ${q.options[q.correct]}` : ''}
      </div>
    `;
  });
  
  document.getElementById('detailedResults').innerHTML = detailHTML;
  
  // LocalStorage ga saqlash
  const results = JSON.parse(localStorage.getItem('testResults') || '[]');
  results.push({
    date: new Date().toLocaleString(),
    subject: subject,
    score: correct,
    total: questions.length,
    percent: percent,
    time: elapsed
  });
  localStorage.setItem('testResults', JSON.stringify(results));
}