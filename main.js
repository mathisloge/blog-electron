const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const ApiConnector = require("./src/ApiConnector");

let mainWindow;

function createMainWindow () {
    mainWindow = new BrowserWindow(
        {
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                nativeWindowOpen: true
            }
        }
    );

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Debug
    mainWindow.webContents.openDevTools();
    mainWindow.on('closed', () => {
        mainWindow = null
    });

    mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        if (frameName === 'modal') {
            // open window as modal
            event.preventDefault();
            Object.assign(options, {
                modal: true,
                parent: mainWindow,
                width: 800,
                height: 800
            });
            event.newGuest = new BrowserWindow(options);
        }
    });
}

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (win === null) {
    createMainWindow()
  }
});
