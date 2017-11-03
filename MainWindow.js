const ApiConnector = require("./src/ApiConnector");
const Loader = require("./src/Loader");
class MainWindow {
    constructor(){
        this.api = new ApiConnector.default();
    }
}

let mainWindow = new MainWindow();