const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const url = require('url')
const ApiConnector = require("./src/ApiConnector");
const {menuStruct} = require("./src/mainProcess/menu");
const {Auth} = require("./src/mainProcess/Auth");
let mainWindow;
let menu;
const auth = new Auth();
function createMainWindow (token = null, site = null) {
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
    let params = "?";
    if(token !== null){
        params += "token="+token+"&";
    }
    if(site !== null){
        params += "site="+site+"&";
    }
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    })+params);

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


function startUp() {
    menu = Menu.buildFromTemplate(menuStruct);
    Menu.setApplicationMenu(menu);
    let state = auth.init();
    state.then( (status) => {
        if(status == true && auth.bearer_token !== null){
            createMainWindow(auth.bearer_token, auth.site);
        }
        else
            createMainWindow();
    }).catch( (err) => {
        createMainWindow();
    });
   
}
app.on('ready', startUp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (win === null) {
    startUp();
  }
});
