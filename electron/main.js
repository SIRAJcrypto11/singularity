const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');
const path = require('path');
const net = require('net');

let serverProcess;
let mainWindow;

// Helper to find a free port
const getFreePort = () => new Promise(res => {
  const srv = net.createServer();
  srv.listen(0, () => {
    const port = srv.address().port;
    srv.close(() => res(port));
  });
});

app.on('ready', async () => {
  const port = await getFreePort();
  
  // Determine path to the standalone Next.js server
  // When packaged by electron-packager on .next/standalone, main.js and server.js are in the same folder
  const serverPath = app.isPackaged 
     ? path.join(__dirname, 'server.js')
     : path.join(__dirname, '..', '.next', 'standalone', 'server.js');

  console.log('Starting Next.js Standalone server at:', serverPath);

  // Start Next.js server using Electron's built-in Node
  serverProcess = fork(serverPath, [], {
    cwd: path.dirname(serverPath),
    env: {
      ...process.env,
      PORT: port.toString(),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production'
    },
    stdio: 'pipe' // CRITICAL FIX: Windows GUI apps crash child processes if 'inherit' is used without console handles attached!
  });

  // Optional: Listen for fatal errors to debug later
  if (serverProcess.stderr) {
    serverProcess.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data.toString()}`);
    });
  }

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#050506', // Matching Singularity theme
    autoHideMenuBar: true,
    title: "Singularity Elite V7",
    webPreferences: { 
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Hide default title to prevent flash, wait for ready-to-show
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const url = `http://127.0.0.1:${port}`;
  
  // Intelligent auto-retry loader to prevent blank ERR_CONNECTION_REFUSED
  const loadWithRetry = (retryCount = 0) => {
    mainWindow.loadURL(url).catch(err => {
      console.log(`Waiting for Next.js to boot... (Retry ${retryCount})`);
      if (retryCount < 20) { // Keep trying for up to ~10 seconds
        setTimeout(() => loadWithRetry(retryCount + 1), 500);
      } else {
        console.error("Failed to load Next.js server.", err);
      }
    });
  };

  // Start loading sequence after a brief 1-second delay
  setTimeout(() => loadWithRetry(0), 1000);

});

app.on('quit', () => {
  if (serverProcess) {
    console.log('Killing Next.js server process');
    serverProcess.kill();
  }
});

app.on('window-all-closed', () => {
  // Quit when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
