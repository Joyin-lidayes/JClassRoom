let names = [];
let animationInterval;

// 页面加载时获取目标组的学生信息
document.addEventListener('DOMContentLoaded', function() {
    loadNamesFromGoalGroup();
});

function loadNamesFromGoalGroup() {
    const goalGroup = get_goal_group();
    if (goalGroup) {
        names = get_stu_group(goalGroup);
    } else {
        names = [];
    }
}

function startRollCall() {
    if (names.length === 0) {
        alert('请先在主页面设置中选择目标组并添加学生！');
        return;
    }
    const resultDiv = document.getElementById('result');
    resultDiv.classList.add('animating');
    resultDiv.textContent = '🎲 正在选择...';

    let currentIndex = 0;
    animationInterval = setInterval(() => {
        resultDiv.textContent = `🎯 ${names[currentIndex]}`;
        currentIndex = (currentIndex + 1) % names.length;
    }, 150);

    setTimeout(() => {
        clearInterval(animationInterval);
        const randomIndex = Math.floor(Math.random() * names.length);
        resultDiv.textContent = `🏆 选中的是：${names[randomIndex]}`;
        resultDiv.classList.remove('animating');
    }, 2500);
}