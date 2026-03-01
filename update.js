const fs = require('fs');
const path = require('path');
const { dialog, shell } = require('electron');

function compareVersions(v1, v2) {
  const a = v1.split('.').map(Number);
  const b = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const n1 = a[i] || 0, n2 = b[i] || 0;
    if (n1 < n2) return -1;
    if (n1 > n2) return 1;
  }
  return 0;
}

let latestVersionInfo = null; // 用于存储新版本信息
async function checkForUpdates(showDialog = true) {
  try {
    // 读取本地版本
    const infoPath = path.join(__dirname, 'assets', 'custom', 'baseInfo.json');
    const localInfo = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
    const currentVersion = localInfo.version;

    // 获取最新版本
    const res = await fetch('https://api.github.com/repos/Joyin-lidayes/JClassRoom/releases/latest', { timeout: 5000 });
    if (res.ok) {
      const latest = await res.json();
      const latestVersion = (latest.tag_name || '').replace(/^v/, '');
      if (compareVersions(currentVersion, latestVersion) < 0) {
        latestVersionInfo = {
          version: latestVersion,
          url: 'https://github.com/Joyin-lidayes/JClassRoom/releases'
        };
        if (showDialog) {
          const result = dialog.showMessageBoxSync({
            type: 'info',
            title: '更新可用',
            message: `有新版本 v${latestVersion} 可用。`,
            detail: '请访问 GitHub 下载最新版本。',
            buttons: ['打开链接', '确定'],
            defaultId: 1,
            cancelId: 1
          });
          if (result === 0) {
            shell.openExternal('https://github.com/Joyin-lidayes/JClassRoom/releases');
          }
        }
        return true;
      }
    }
  } catch (e) {
    // 忽略网络或解析错误
  }
  return false;
}