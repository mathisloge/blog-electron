//https://developer.wordpress.com/docs/api/

/*
    Müsste eigentlich auf einem Server sein. Da Secret und ClientID nicht unbedingt zu verfügung stehen sollten ;) 
    Für die Demo sollte es aber gehen. ggf. nochmal besprechen und eben im Server implementieren. Wäre auch kein Akt.
*/

const { remote } = require('electron');
const Loader = require("./Loader");

const REQUEST_TOKEN_URL = 'https://public-api.wordpress.com/oauth2/token'
const AUTHENTICATE_URL = 'https://public-api.wordpress.com/oauth2/authenticate';
const CLIENT_SECRET = "OrdfIlFHPiIKpuFWCSJsNaI0T3WlmOxnCsASaFYBumfOJhMQZcQeuoPVmtBelCQ5";
const CLIENT_ID = 55898;
const RESPONSE_TYPE = "token";
exports.default = class ApiConnector {
    constructor(url) {
        this.url = url;
        this.state = Math.ceil(Math.random() * 10000);
        const code = this.triggerSignIn();
        this.ready = false;
        code.then((isLoggedIn) => {
            this.loader.hideLoader();
            this.ready = isLoggedIn;
        }).catch((err) => {
            this.loader.hideLoader();
            console.log(err);
        });
    }

    getPosts() {
    }
    
    triggerSignIn() {
        return new Promise((resolve, reject) => {
            this.loader = new Loader.default();
            let wordpressAuthUrl = AUTHENTICATE_URL + '?response_type=' + RESPONSE_TYPE +
                "&client_id=" + CLIENT_ID +
                "&state=" + this.state +
                "&redirect_uri=http://localhost";

            const authWindow = new remote.BrowserWindow({
                width: 500,
                height: 600,
                show: true
            })


            function handleNavigation(redirectUrl) {
                let urlObj = new URL(redirectUrl);
                if(urlObj.hostname == "localhost"){
                    let hash = redirectUrl.substring(redirectUrl.indexOf('#')+1);
                    let maniUrl = new URL("http://localhost?"+hash);

                    this.access_token = maniUrl.searchParams.get("access_token");
                    this.expires_in = maniUrl.searchParams.get("expires_in");
                    this.token_type = maniUrl.searchParams.get("token_type");
                    this.site_id = maniUrl.searchParams.get("site_id");

                    authWindow.close();
                    resolve(true);
                }
            }


            authWindow.on('closed', () => {
                reject("Window closed by user");
            })

            authWindow.webContents.on('will-navigate', (event, url) => {
                handleNavigation(url)
            })

            authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
                handleNavigation(newUrl)
            })

            authWindow.loadURL(wordpressAuthUrl)
            
        });
    
    }
}