// 通用窗口控制逻辑
function updateWindowControls() {
  const windowControls = document.getElementById('window-controls');
  if (!windowControls) return; // 防止报错
  if (window.isFrameless) {
    document.getElementById('window-controls').style.display = 'flex';
  } else {
    document.getElementById('window-controls').style.display = 'none';
  }
}

function bindWindowControlEvents() {
  const minBtn = document.getElementById('min-btn');
  const maxBtn = document.getElementById('max-btn');
  const closeBtn = document.getElementById('close-btn');
  if (minBtn) minBtn.onclick = function() {
    if (window.electronAPI && window.electronAPI.minimize) window.electronAPI.minimize();
  };
  if (maxBtn) maxBtn.onclick = function() {
    if (window.electronAPI && window.electronAPI.maximize) window.electronAPI.maximize();
  };
  if (closeBtn) closeBtn.onclick = function() {
    if (window.electronAPI && window.electronAPI.close) window.electronAPI.close();
  };
}

document.addEventListener('DOMContentLoaded', function() {
  updateWindowControls();
  bindWindowControlEvents();
});

async function backHomeBtn() {
    let homeSrc = await get_custom_info("index");
    if (homeSrc) {
        window.location.href = homeSrc;
    } else {
        alert("主页地址未设置");
    }
}