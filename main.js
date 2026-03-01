const { app, BrowserWindow, Menu } = require('electron');

let isFrameless = true;
let isSwitching = false;

function createWindow(bounds = null) {
  const options = {
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon: 'assets/custom/logo.ico',
    frame: !isFrameless,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js'
    }
  };

  if (bounds) {
    options.x = bounds.x;
    options.y = bounds.y;
    options.width = bounds.width;
    options.height = bounds.height;
  }

    const win = new BrowserWindow(options);
    currentWin = win;
    // ... rest of the code ...
  win.loadFile('index.html');

  // 注入 isFrameless 状态到渲染进程
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`window.isFrameless = ${JSON.stringify(isFrameless)}; if(window.updateWindowControls) window.updateWindowControls();`);
  });

  // 添加右键菜单
  win.webContents.on('context-menu', (event, params) => {
    const isAlwaysOnTop = win.isAlwaysOnTop();
    const menu = Menu.buildFromTemplate([
      {
        label: isAlwaysOnTop ? '取消置顶' : '置顶',
        click: () => win.setAlwaysOnTop(!isAlwaysOnTop)
      },
      {
        label: isFrameless ? '取消无边框' : '无边框',
        click: () => {
          isFrameless = !isFrameless;
          isSwitching = true;
          
          // 获取当前窗口的位置和大小
          const bounds = win.getBounds();

          setTimeout(() => {
            // 将老窗口的位置信息传递给新窗口
            createWindow(bounds);
            win.close();
            setTimeout(() => {
              isSwitching = false;
            }, 100);
          }, 100);
        }
      }
    ]);
    menu.popup();
  });
}



const { ipcMain } = require('electron');
let currentWin = null;

// ...保留上方完整的 createWindow(bounds) 实现...

// 在主 createWindow 函数内设置 currentWin
// 在 function createWindow(bounds = null) {...} 内部：
// const win = new BrowserWindow(options);
// currentWin = win;

ipcMain.on('window-minimize', () => {
  if (currentWin) currentWin.minimize();
});
ipcMain.on('window-maximize', () => {
  if (currentWin) {
    if (currentWin.isMaximized()) currentWin.unmaximize();
    else currentWin.maximize();
  }
});
ipcMain.on('window-close', () => {
  if (currentWin) {
    // 创建加载窗口
    const loadingWin = new BrowserWindow({
      width: 300,
      height: 120,
      frame: false,
      alwaysOnTop: true,
      modal: true,
      parent: currentWin,
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    loadingWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <body style="display:flex;align-items:center;justify-content:center;height:80%;font-size:18px;">
        正在保存信息，请稍候...
      </body>
    `));
    loadingWin.once('ready-to-show', () => {
      loadingWin.show();
      // 模拟保存操作（如有异步保存可替换此 setTimeout）
      setTimeout(() => {
        currentWin.close();
      }, 200); // 1.5秒后关闭
    });
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !isSwitching) app.quit();
});