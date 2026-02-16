let currentLanguage = 'uz';
let currentSubject = '';
let currentQuestion = 0;
let answers = [];
let startTime = 0;
let testQuestions = [];
let timerInterval;

// Tillar
const translations = {
    uz: {
        mainDesc: "Bilimingizni tekshiring va o'zlashtiring",
        questionLabel: "Savol",
        correctAnswers: "To'g'ri Javoblar",
        timeSpent: "Vaqt Sarflandi",
        excellent: "🎉 Ajoyib! Siz o'tkazib berdingiz!",
        good: "✅ Yaxshi natija!",
        medium: "📚 Yanada bilim oshirizga ehtiyoj bor.",
        poor: "💪 Yana o'rganishga urinib ko'ring."
    },
    en: {
        mainDesc: "Test your knowledge and improve",
        questionLabel: "Question",
        correctAnswers: "Correct Answers",
        timeSpent: "Time Spent",
        excellent: "🎉 Excellent! You passed!",
        good: "✅ Good result!",
        medium: "📚 You need to study more.",
        poor: "💪 Try again!"
    },
    ru: {
        mainDesc: "Проверьте свои знания и улучшайте себя",
        questionLabel: "Вопрос",
        correctAnswers: "Правильные ответы",
        timeSpent: "Потраченное время",
        excellent: "🎉 Отлично! Вы сдали!",
        good: "✅ Хороший результат!",
        medium: "📚 Вам нужно учиться больше.",
        poor: "💪 Попробуйте снова!"
    }
};

// Oyna yuklanganda
document.addEventListener('DOMContentLoaded', function() {
    // SessionStorage dan ma'lumotlarni olish
    currentSubject = sessionStorage.getItem('testSubject') || 'english';
    currentLanguage = sessionStorage.getItem('testLanguage') || 'uz';
    
    updateLanguage();
    startTest(currentSubject);
});

// Tilni yangilash
function updateLanguage() {
    document.getElementById('langBtn').textContent = currentLanguage.toUpperCase();
}

// Til tugmachasi
document.getElementById('langBtn')?.addEventListener('click', function() {
    const langs = ['uz', 'en', 'ru'];
    const currentIndex = langs.indexOf(currentLanguage);
    currentLanguage = langs[(currentIndex + 1) % langs.length];
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
});

// Testni boshlash
function startTest(subject) {
    currentSubject = subject;
    currentQuestion = 0;
    answers = [];
    testQuestions = JSON.parse(JSON.stringify(testData[subject]));
    startTime = Date.now();
    
    displayQuestion();
    startTimer();
}

// Savolni ko'rsatish
function displayQuestion() {
    const question = testQuestions[currentQuestion];
    const trans = translations[currentLanguage];
    
    // Progress bar
    const progress = ((currentQuestion + 1) / testQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Savol raqami
    document.getElementById('questionNumber').textContent = 
        `${trans.questionLabel} ${currentQuestion + 1}/${testQuestions.length}`;
    
    // Savol
    document.getElementById('question').textContent = question.question;
    
    // Variantlar
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option';
        btn.textContent = option;
        btn.onclick = () => selectOption(index);
        
        if (answers[currentQuestion] === index) {
            btn.classList.add('selected');
        }
        
        optionsContainer.appendChild(btn);
    });
    
    // Tugmalarni sozlash
    document.getElementById('prevBtn').disabled = currentQuestion === 0;
    document.getElementById('nextBtn').textContent = 
        currentQuestion === testQuestions.length - 1 ? 'Testni Tugatish ✓' : 'Keyingi →';
}

// Variantni tanlash
function selectOption(index) {
    answers[currentQuestion] = index;
    displayQuestion();
}

// Oldingi savolga
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

// Keyingi savolga
function nextQuestion() {
    if (currentQuestion < testQuestions.length - 1) {
        currentQuestion++;
        displayQuestion();
    } else {
        finishTest();
    }
}

// Vaqt tizimini boshlash
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = 
            `⏱️ Vaqt: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Testni tugatish
function finishTest() {
    clearInterval(timerInterval);
    
    let correctCount = 0;
    answers.forEach((answer, index) => {
        if (answer === testQuestions[index].correct) {
            correctCount++;
        }
    });
    
    const percentage = Math.round((correctCount / testQuestions.length) * 100);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    const result = {
        subject: currentSubject,
        score: correctCount,
        total: testQuestions.length,
        percentage: percentage,
        timeSpent: timeSpent,
        date: new Date().toLocaleString(),
        answers: answers
    };
    
    saveResult(result);
    displayResults(result);
}

// Natijalarni saqlash
function saveResult(result) {
    let results = JSON.parse(localStorage.getItem('testResults')) || [];
    results.push(result);
    localStorage.setItem('testResults', JSON.stringify(results));
}

// Natijalarni ko'rsatish
function displayResults(result) {
    document.getElementById('testPage').classList.add('hidden');
    document.getElementById('resultsPage').classList.remove('hidden');
    
    const trans = translations[currentLanguage];
    
    // Foiz
    document.getElementById('scorePercentage').textContent = result.percentage + '%';
    
    // Tavsif
    let resultDesc = '';
    if (result.percentage >= 90) resultDesc = trans.excellent;
    else if (result.percentage >= 70) resultDesc = trans.good;
    else if (result.percentage >= 50) resultDesc = trans.medium;
    else resultDesc = trans.poor;
    
    document.getElementById('resultDesc').textContent = resultDesc;
    document.getElementById('correctAnswers').textContent = `${result.score}/${result.total}`;
    
    const minutes = Math.floor(result.timeSpent / 60);
    const seconds = result.timeSpent % 60;
    document.getElementById('timeSpent').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Batafsil natijalar
    displayDetailedResults(result);
}

// Batafsil natijalarni ko'rsatish
function displayDetailedResults(result) {
    const detailedDiv = document.getElementById('detailedResults');
    detailedDiv.innerHTML = '';
    
    answers.forEach((answer, index) => {
        const question = testQuestions[index];
        const isCorrect = answer === question.correct;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `result-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        itemDiv.innerHTML = `
            <strong>${index + 1}. ${isCorrect ? '✅' : '❌'}</strong><br>
            <small>${question.question}</small><br>
            <small style="opacity: 0.8;">Sizning javob: ${question.options[answer] || 'Javob berilmadi'}</small>
            ${!isCorrect ? `<br><small style="color: #22c55e;">To'g'ri javob: ${question.options[question.correct]}</small>` : ''}
        `;
        
        detailedDiv.appendChild(itemDiv);
    });
}

// Natijalarni yuklab olish
function downloadResults() {
    const results = JSON.parse(localStorage.getItem('testResults')) || [];
    let csv = 'Fan,To\'g\'ri Javoblar,Foiz,Vaqt,Sana\n';
    
    results.forEach(r => {
        csv += `${r.subject},${r.score}/${r.total},${r.percentage}%,${r.timeSpent}s,"${r.date}"\n`;
    });
    
    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    link.setAttribute('download', 'test-results.csv');
    link.click();
}

// Oynani yopish
function closeWindow() {
    window.close();
}

// Oyna yopilganda session tozalash
window.addEventListener('beforeunload', function() {
    sessionStorage.removeItem('testSubject');
    sessionStorage.removeItem('testLanguage');
});