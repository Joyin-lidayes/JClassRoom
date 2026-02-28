let names = [];
let questionBanks = JSON.parse(get_local_data('questionBanks')) || {};
let scores = {};
let correctCounts = {};
let wrongCounts = {};
let currentName = '';
let currentQuestion = '';
let usedQuestions = new Set();
let animationInterval;

document.addEventListener('DOMContentLoaded', function() {
    loadNamesFromGoalGroup();
    init();
});

function loadNamesFromGoalGroup() {
    const goalGroup = get_goal_group();
    if (goalGroup) {
        names = get_stu_group(goalGroup);
    } else {
        names = [];
    }
}

function init() {
    updateQuestionBankSelect();
    updateScores();
    updateQuestionBanksList();
    document.getElementById('questionProgress').style.display = 'none';
    document.getElementById('correctBtn').style.display = 'none';
    document.getElementById('wrongBtn').style.display = 'none';
    enableButtons();
}

function updateQuestionBankSelect() {
    const select = document.getElementById('questionBankSelect');
    select.innerHTML = '<option value="">选择题库</option>';
    for (let bank in questionBanks) {
        const option = document.createElement('option');
        option.value = bank;
        option.textContent = bank;
        select.appendChild(option);
    }
}

function updateQuestionBanksList() {
    const list = document.getElementById('questionBanksList');
    list.innerHTML = '';
    for (let bank in questionBanks) {
        const item = document.createElement('div');
        item.className = 'question-bank-item';
        item.innerHTML = `<strong>${bank}</strong> (${questionBanks[bank].length} 题)<span class="delete-icon" onclick="deleteQuestionBank('${bank}')">🗑️</span>`;
        list.appendChild(item);
    }
}

function deleteQuestionBank(bankName) {
    if (confirm(`确定删除题库 "${bankName}" 吗？`)) {
        delete questionBanks[bankName];
        set_local_data('questionBanks', JSON.stringify(questionBanks));
        updateQuestionBanksList();
        updateQuestionBankSelect();
    }
}

function openAddQuestionBank() {
    document.getElementById('addQuestionBankModal').style.display = 'block';
}

function closeAddQuestionBank() {
    document.getElementById('addQuestionBankModal').style.display = 'none';
    document.getElementById('bankNameInput').value = '';
    document.getElementById('questionsTextarea').value = '';
}

function saveQuestionBank() {
    const bankName = document.getElementById('bankNameInput').value.trim();
    const questionsText = document.getElementById('questionsTextarea').value;
    if (!bankName) {
        alert('请输入题库名');
        return;
    }
    const questions = questionsText.split('\n').map(q => q.trim()).filter(q => q);
    if (questions.length === 0) {
        alert('请输入题目');
        return;
    }
    questionBanks[bankName] = questions;
    set_local_data('questionBanks', JSON.stringify(questionBanks));
    updateQuestionBanksList();
    updateQuestionBankSelect();
    closeAddQuestionBank();
}

function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    closeSettings();
}

function drawRandom() {
    // Disable buttons during draw
    document.getElementById('drawBtn').disabled = true;
    document.getElementById('correctBtn').disabled = true;
    document.getElementById('wrongBtn').disabled = true;
    document.getElementById('drawBtn').style.opacity = '0.5';
    document.getElementById('correctBtn').style.opacity = '0.5';
    document.getElementById('wrongBtn').style.opacity = '0.5';

    const selectedBank = document.getElementById('questionBankSelect').value;
    if (!selectedBank || !questionBanks[selectedBank]) {
        alert('请选择题库');
        // Re-enable
        enableButtons();
        return;
    }
    if (names.length === 0) {
        alert('请先在主页面设置中选择目标组并添加学生！');
        enableButtons();
        return;
    }
    const noRepeat = document.getElementById('noRepeatCheckbox').checked;
    let availableQuestions = questionBanks[selectedBank];
    if (noRepeat) {
        availableQuestions = availableQuestions.filter(q => !usedQuestions.has(q));
        if (availableQuestions.length === 0) {
            alert('题库已抽完，已自动重置');
            resetUsedQuestions();
            availableQuestions = questionBanks[selectedBank];
        }
    }
    // Animation
    let nameIndex = 0;
    let questionIndex = 0;
    animationInterval = setInterval(() => {
        document.getElementById('nameCard').textContent = names[nameIndex % names.length];
        document.getElementById('questionText').textContent = availableQuestions[questionIndex % availableQuestions.length];
        nameIndex++;
        questionIndex++;
    }, 100);
    setTimeout(() => {
        clearInterval(animationInterval);
        const randomNameIndex = Math.floor(Math.random() * names.length);
        const randomQuestionIndex = Math.floor(Math.random() * availableQuestions.length);
        currentName = names[randomNameIndex];
        currentQuestion = availableQuestions[randomQuestionIndex];
        document.getElementById('nameCard').textContent = currentName;
        document.getElementById('questionText').textContent = currentQuestion;
        if (noRepeat) {
            usedQuestions.add(currentQuestion);
            const total = questionBanks[selectedBank].length;
            const currentNum = usedQuestions.size;
            document.getElementById('questionProgress').textContent = `${currentNum}/${total}`;
            document.getElementById('questionProgress').style.display = 'block';
        } else {
            document.getElementById('questionProgress').style.display = 'none';
        }
        // Hide draw button, show answer buttons
        document.getElementById('drawBtn').style.display = 'none';
        document.getElementById('correctBtn').style.display = 'inline-block';
        document.getElementById('wrongBtn').style.display = 'inline-block';
        // Enable answer buttons
        enableButtons();
    }, 2000);
}

function correctAnswer() {
    if (!currentName) return;
    // Disable buttons
    document.getElementById('correctBtn').disabled = true;
    document.getElementById('wrongBtn').disabled = true;
    document.getElementById('correctBtn').style.opacity = '0.5';
    document.getElementById('wrongBtn').style.opacity = '0.5';
    if (!scores[currentName]) scores[currentName] = 0;
    if (!correctCounts[currentName]) correctCounts[currentName] = 0;
    scores[currentName]++;
    correctCounts[currentName]++;
    updateScores();
    // Auto next round
    drawRandom();
}

function wrongAnswer() {
    if (!currentName) return;
    // Disable buttons
    document.getElementById('correctBtn').disabled = true;
    document.getElementById('wrongBtn').disabled = true;
    document.getElementById('correctBtn').style.opacity = '0.5';
    document.getElementById('wrongBtn').style.opacity = '0.5';
    if (!scores[currentName]) scores[currentName] = 0;
    if (!wrongCounts[currentName]) wrongCounts[currentName] = 0;
    scores[currentName]--;
    wrongCounts[currentName]++;
    updateScores();
    // Auto next round
    drawRandom();
}

function resetCards() {
    currentName = '';
    currentQuestion = '';
    document.getElementById('nameCard').textContent = '准备就绪';
    document.getElementById('questionText').textContent = '等待抽取题目';
    document.getElementById('questionProgress').style.display = 'none';
}

function enableButtons() {
    document.getElementById('drawBtn').disabled = false;
    document.getElementById('correctBtn').disabled = false;
    document.getElementById('wrongBtn').disabled = false;
    document.getElementById('drawBtn').style.opacity = '1';
    document.getElementById('correctBtn').style.opacity = '1';
    document.getElementById('wrongBtn').style.opacity = '1';
}

function resetUsedQuestions() {
    usedQuestions.clear();
}

function updateScores() {
    const tbody = document.querySelector('#scoresTable tbody');
    tbody.innerHTML = '';
    // Ensure all names have scores and counts
    names.forEach(name => {
        if (scores[name] === undefined) scores[name] = 0;
        if (correctCounts[name] === undefined) correctCounts[name] = 0;
        if (wrongCounts[name] === undefined) wrongCounts[name] = 0;
    });
    const sortedNames = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    sortedNames.forEach((name, index) => {
        const row = document.createElement('tr');
        const rank = index + 1;
        const totalScore = scores[name];
        const correct = correctCounts[name] || 0;
        const wrong = wrongCounts[name] || 0;
        row.innerHTML = `
            <td>${rank}</td>
            <td>${name}</td>
            <td>${totalScore}</td>
            <td class="operation">
                <span class="correct-stat">答对: ${correct}</span>
                <span class="wrong-stat">答错: ${wrong}</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById('settingsBtn').onclick = openSettings;
document.getElementById('drawBtn').onclick = drawRandom;
document.getElementById('correctBtn').onclick = correctAnswer;
document.getElementById('wrongBtn').onclick = wrongAnswer;
document.getElementById('resetBtn').onclick = resetUsedQuestions;
window.onclick = function(event) {
    if (event.target == document.getElementById('settingsModal')) {
        closeSettings();
    }
    if (event.target == document.getElementById('addQuestionBankModal')) {
        closeAddQuestionBank();
    }
}

init();