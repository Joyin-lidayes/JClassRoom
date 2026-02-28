// 加载教师姓名和标题
get_custom_info("teacher").then(teacher => {
    if (teacher) {
        document.getElementById('teacher-name').textContent = teacher;
        document.title = teacher + '游戏课堂';
    }
}).catch(error => console.error('Error loading teacher info:', error));

// 加载logo
get_custom_info("logo").then(logo => {
    const logoElement = document.querySelector('.logo');
    if (logo && logo.trim() !== '') {
        logoElement.src = logo;
    } else {
        logoElement.style.display = 'none';
    }
}).catch(error => console.error('Error loading logo info:', error));

// 加载游戏列表
get_custom_info("games").then(games => {
    if (games) {
        const gameList = document.querySelector('.game-list');
        gameList.innerHTML = '';
        games.forEach(game => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = game.file + 'index.html';
            a.className = 'game-link';
            a.textContent = game.icon + ' ' + game.name;
            li.appendChild(a);
            gameList.appendChild(li);
        });
    }
}).catch(error => console.error('Error loading games info:', error));

// 设置按钮事件
document.getElementById('settingsBtn').onclick = function() {
    openSettings();
};

// 模态框关闭事件
document.querySelector('.close').onclick = function() {
    closeSettings();
};

window.onclick = function(event) {
    if (event.target == document.getElementById('settingsModal')) {
        closeSettings();
    }
};

function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
    loadGroups();
    loadGoalGroup();
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function loadGroups() {
    const groups = get_all_groups();
    const container = document.getElementById('groups-container');
    container.innerHTML = '';
    groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-item';
        groupDiv.onclick = () => openAddStudentModal(group);
        groupDiv.innerHTML = `
            <span class="delete-group-x" onclick="deleteGroup('${group}'); event.stopPropagation();">&times;</span>
            <h4><span class="group-name">${group}</span>（点击添加学生）</h4>
            <div class="students">
                <ul class="student-list"></ul>
            </div>
        `;
        const studentList = groupDiv.querySelector('.student-list');
        const students = get_stu_group(group);
        students.forEach(stu => {
            const stuDiv = document.createElement('div');
            stuDiv.className = 'student-item';
            stuDiv.innerHTML = `<span class="student-name">${stu}</span><span class="delete-student-x" onclick="deleteStudent('${group}', '${stu}'); event.stopPropagation();">&times;</span>`;
            studentList.appendChild(stuDiv);
        });
        container.appendChild(groupDiv);
    });
}

function addNewGroup() {
    const name = document.getElementById('new-group-name').value.trim();
    if (name) {
        add_stu_group(name);
        loadGroups();
        loadGoalGroup();
        document.getElementById('new-group-name').value = '';
    }
}

function addStudentToGroup(group) {
    const input = event.target.previousElementSibling;
    const name = input.value.trim();
    if (name) {
        add_stu_to_group(name, group);
        loadGroups();
        input.value = '';
    }
}

function deleteGroup(name) {
    delete_stu_group(name);
    loadGroups();
    loadGoalGroup();
}

function deleteStudent(group, name) {
    delete_stu_from_group(name, group);
    loadGroups();
}

function openAddStudentModal(group) {
    document.getElementById('current-group-name').textContent = group;
    document.getElementById('addStudentModal').style.display = 'block';
    window.currentGroup = group;
}

function closeAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.close-sub').onclick = closeAddStudentModal;
});

function addStudent() {
    const text = document.getElementById('add-student-names').value.trim();
    if (text && window.currentGroup) {
        const names = text.split('\n').map(name => name.trim()).filter(name => name);
        names.forEach(name => {
            add_stu_to_group(name, window.currentGroup);
        });
        loadGroups();
        document.getElementById('add-student-names').value = '';
        closeAddStudentModal();
    }
}

function loadGoalGroup() {
    const select = document.getElementById('goal-group-select');
    select.innerHTML = '';
    const groups = get_all_groups();
    const current = get_goal_group();
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        if (group === current) option.selected = true;
        select.appendChild(option);
    });
}

function setGoalGroup() {
    const select = document.getElementById('goal-group-select');
    set_goal_group(select.value);
    alert('目标组已设置为: ' + select.value);
}