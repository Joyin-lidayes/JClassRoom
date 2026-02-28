

document.addEventListener('DOMContentLoaded', function() {
    const minTimeInput = document.getElementById('minTime');
    const maxTimeInput = document.getElementById('maxTime');
    const savedMin = get_local_data('bombMinTime');
    const savedMax = get_local_data('bombMaxTime');
    if (savedMin) minTimeInput.value = savedMin;
    if (savedMax) maxTimeInput.value = savedMax;
    // 滚动到页面底部
    window.scrollTo(0, document.body.scrollHeight);
});

let countdown;
let interval;
const countdownAudio = new Audio('countdown.mp3');
const boomAudio = new Audio('boom.mp3');

// 设置按钮事件
document.getElementById('settingsBtn').onclick = openSettings;

// 模态框关闭事件
document.getElementsByClassName('close')[0].onclick = closeSettings;

// 点击模态框外部关闭
window.onclick = function(event) {
    if (event.target == document.getElementById('settingsModal')) {
        closeSettings();
    }
}

function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    const minTime = parseInt(document.getElementById('minTime').value);
    const maxTime = parseInt(document.getElementById('maxTime').value);
    if (minTime >= maxTime || minTime < 1 || maxTime < 1) {
        alert('请输入有效的范围');
        return;
    }
    set_local_data('bombMinTime', minTime);
    set_local_data('bombMaxTime', maxTime);
    closeSettings();
}

document.getElementById('bomb').addEventListener('click', function() {
    const bomb = document.getElementById('bomb');
    const explosion = document.getElementById('explosion');
    const prompt = document.getElementById('prompt');
    if (interval) {
        // 取消倒计时
        clearInterval(interval);
        interval = null;
        bomb.classList.remove('clicked', 'surprised', 'happy');
        prompt.style.display = 'block';
        countdownAudio.pause();
        countdownAudio.currentTime = 0;
        return;
    }
    const minTime = parseInt(document.getElementById('minTime').value);
    const maxTime = parseInt(document.getElementById('maxTime').value);
    if (minTime >= maxTime || minTime < 1 || maxTime < 1) {
        alert('请输入有效的范围');
        return;
    }
    // 保存设置到本地缓存
    set_local_data('bombMinTime', minTime);
    set_local_data('bombMaxTime', maxTime);
    const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    countdown = randomTime;
    bomb.classList.add('clicked');
    const expressions = ['', 'surprised', 'happy'];
    const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
    if (randomExpression) {
        bomb.classList.add(randomExpression);
    }
    prompt.style.display = 'none';
    countdownAudio.currentTime = 0;
    countdownAudio.loop = true;
    countdownAudio.play();
    interval = setInterval(function() {
        countdown--;
        if (countdown <= 0) {
            clearInterval(interval);
            interval = null;
            bomb.classList.remove('clicked', 'surprised', 'happy');
            bomb.style.display = 'none';
            explosion.style.display = 'block';
            countdownAudio.pause();
            countdownAudio.currentTime = 0;
            boomAudio.play();
            setTimeout(function() {
                explosion.style.display = 'none';
                bomb.style.display = 'block';
                prompt.style.display = 'block';
                // 滚动到页面底部
                window.scrollTo(0, document.body.scrollHeight);
            }, 2000);
        }
    }, 1000);
});