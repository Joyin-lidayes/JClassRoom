let names = [];
let minDecibel = parseInt(get_local_data('minDecibel')) || 40;
let growthSpeed = parseFloat(get_local_data('growthSpeed')) || 5;
let trees = [];
let audioContext;
let analyser;
let microphone;
let isDetecting = false;
let animationFrame;

document.addEventListener('DOMContentLoaded', function() {
    loadNamesFromGoalGroup();
    initTrees();
});

function loadNamesFromGoalGroup() {
    const goalGroup = get_goal_group();
    if (goalGroup) {
        names = get_stu_group(goalGroup);
    } else {
        names = [];
    }
}

function initTrees() {
    const grid = document.getElementById('grassGrid');
    grid.innerHTML = '';
    trees = [];
    names.forEach(name => {
        const patch = document.createElement('div');
        patch.className = 'grass-patch';
        patch.innerHTML = `
            <div class="student-name">${name}</div>
            <div class="tree-emoji" onclick="witherTree('${name}')">🌱</div>
        `;
        grid.appendChild(patch);
        trees.push({ name, scale: 0, element: patch.querySelector('.tree-emoji'), isWithered: false });
    });
}

function startDetection() {
    if (names.length === 0) {
        alert('请先在主页面设置中选择目标组并添加学生！');
        return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            isDetecting = true;
            document.getElementById('startBtn').textContent = '停止检测';
            updateDecibel(dataArray);
        })
        .catch(err => {
            alert('无法访问麦克风：' + err.message);
        });
}

function stopDetection() {
    if (audioContext) {
        audioContext.close();
    }
    if (microphone) {
        microphone.disconnect();
    }
    isDetecting = false;
    document.getElementById('startBtn').textContent = '开始检测';
    const display = document.getElementById('decibelDisplay');
    display.textContent = '当前分贝：-- dB';
    display.classList.remove('high-decibel');
    cancelAnimationFrame(animationFrame);
}

function updateDecibel(dataArray) {
    if (!isDetecting) return;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const decibel = Math.round(20 * Math.log10(rms / 128) + 50); // 估算分贝
    document.getElementById('decibelDisplay').textContent = `当前分贝：${decibel} dB`;
    const display = document.getElementById('decibelDisplay');
    if (decibel > minDecibel) {
        display.classList.add('high-decibel');
    } else {
        display.classList.remove('high-decibel');
    }
    updateTrees(decibel);
    animationFrame = requestAnimationFrame(() => updateDecibel(dataArray));
}

function updateTrees(decibel) {
    trees.forEach(tree => {
        if (!tree.isWithered) {
            if (decibel < minDecibel) {
                tree.scale = Math.min(tree.scale + growthSpeed / 10000, 1);
            } else {
                tree.scale = Math.max(tree.scale - growthSpeed / 10000, 0);
            }
        }
        const scaleValue = 1 + tree.scale * 2; // 从1到3
        tree.element.style.transform = `scale(${scaleValue})`;
        if (tree.scale > 0) {
            tree.element.textContent = '🌳';
        } else {
            tree.element.textContent = '🌱';
        }
    });
}

function witherTree(name) {
    const tree = trees.find(t => t.name === name);
    if (tree) {
        tree.isWithered = true;
        tree.scale = 0;
        tree.element.style.transform = 'scale(0.5)';
        tree.element.textContent = '🥀';
        // 10秒后重置为🌱
        setTimeout(() => {
            tree.isWithered = false;
            tree.element.style.transform = 'scale(1)';
            tree.element.textContent = '🌱';
        }, 10000);
    }
}

document.getElementById('startBtn').onclick = function() {
    if (isDetecting) {
        stopDetection();
    } else {
        startDetection();
    }
};

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
    document.getElementById('minDecibelInput').value = minDecibel;
    document.getElementById('growthSpeedInput').value = growthSpeed;
    document.getElementById('speedValue').textContent = growthSpeed;
}

// 滑块实时更新显示值
document.getElementById('growthSpeedInput').addEventListener('input', function() {
    document.getElementById('speedValue').textContent = this.value;
});

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    minDecibel = parseInt(document.getElementById('minDecibelInput').value) || 50;
    set_local_data('minDecibel', minDecibel);
    growthSpeed = parseFloat(document.getElementById('growthSpeedInput').value) || 5;
    set_local_data('growthSpeed', growthSpeed);
    closeSettings();
}