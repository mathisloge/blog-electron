//https://developer.wordpress.com/docs/api/

/*
    Müsste eigentlich auf einem Server sein. Da Secret und ClientID nicht unbedingt zu verfügung stehen sollten ;) 
    Für die Demo sollte es aber gehen. ggf. nochmal besprechen und eben im Server implementieren. Wäre auch kein Akt.
*/

const { remote } = require('electron');
const Loader = require("./Loader");
const axios = require("axios");

const REQUEST_TOKEN_URL = 'https://public-api.wordpress.com/oauth2/token'
const AUTHENTICATE_URL = 'https://public-api.wordpress.com/oauth2/authenticate';
const CLIENT_SECRET = "OrdfIlFHPiIKpuFWCSJsNaI0T3WlmOxnCsASaFYBumfOJhMQZcQeuoPVmtBelCQ5";
const CLIENT_ID = 55898;
const RESPONSE_TYPE = "token";
const WORDPRESS_API_URL = 'https://public-api.wordpress.com/rest/v1.1';

exports.default = class ApiConnector {
    constructor(site_url) {
        this.site_url = site_url;
        this.state = Math.ceil(Math.random() * 10000);
        this.access_token = null;
        this.expires_in = null;
        this.token_type = null;
        this.site_id = null;
        this.ready = false;
        this.axiosInstance = null;

        this.handleError = (error) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            console.log(error.config);
        }
    }

    signIn() {
        return new Promise((resolve, reject) => {
            const code = this.triggerSignIn();
            code.then((state) => {
                this.loader.hideLoader();
                this.access_token = state.access_token;
                this.expires_in = state.expires_in;
                this.token_type = state.token_type;
                this.site_id = state.site_id;
                this.ready = true;

                this.axiosInstance = axios.create({
                    baseURL: WORDPRESS_API_URL,
                    timeout: 1000,
                    headers: { 'Authorization': this.token_type + " " + this.access_token }
                });
                resolve(true);
            }).catch((err) => {
                this.loader.hideLoader();
                reject(err);
            });
        });
    }

    getPosts() {
        return new Promise((resolve, reject) => {
            if (this.ready && this.axiosInstance) {
                axios.get(WORDPRESS_API_URL + "/sites/" + this.site_url + "/posts/")
                    .then((response) => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.handleError(error);
                        reject(error);
                    });
            }
        });
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
                if (urlObj.hostname == "localhost") {
                    let hash = redirectUrl.substring(redirectUrl.indexOf('#') + 1);
                    let maniUrl = new URL("http://localhost?" + hash);
                    let access_token = maniUrl.searchParams.get("access_token");
                    let expires_in = maniUrl.searchParams.get("expires_in");
                    let token_type = maniUrl.searchParams.get("token_type");
                    let site_id = maniUrl.searchParams.get("site_id");

                    let error = maniUrl.searchParams.get("error");
                    let error_description = maniUrl.searchParams.get("error_description");

                    if (error) {
                        reject(error_description);
                    }

                    if (!access_token) {
                        reject("No access_token");
                    }

                    authWindow.close();
                    resolve({
                        access_token: access_token,
                        expires_in: expires_in,
                        token_type: token_type,
                        site_id: site_id
                    });
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