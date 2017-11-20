//https://developer.wordpress.com/docs/api/

/*
    Müsste eigentlich auf einem Server sein. Da Secret und ClientID nicht unbedingt zu verfügung stehen sollten ;) 
    Für die Demo sollte es aber gehen. ggf. nochmal besprechen und eben im Server implementieren. Wäre auch kein Akt.
*/

const { remote } = require('electron');
const Loader = require("./Loader").default;
const axios = require("axios");
const wpcom = require( 'wpcom' );

const WORDPRESS_BASE_API_URL = "https://public-api.wordpress.com/";
const REQUEST_TOKEN_URL = WORDPRESS_BASE_API_URL+'oauth2/token'
const AUTHENTICATE_URL = WORDPRESS_BASE_API_URL+'oauth2/authenticate';
const AUTHORIZE_URL = WORDPRESS_BASE_API_URL+'oauth2/authorize';
const CLIENT_SECRET = "OrdfIlFHPiIKpuFWCSJsNaI0T3WlmOxnCsASaFYBumfOJhMQZcQeuoPVmtBelCQ5";
const CLIENT_ID = 55898;
const RESPONSE_TYPE = "token";
const WORDPRESS_API_URL = WORDPRESS_BASE_API_URL+'rest/v1.2';

exports.default = class ApiConnector {
    constructor(site_url) {
        this.site_url = site_url;
        this.state = Math.ceil(Math.random() * 10000);
        this.access_token = null;
        this.expires_in = null;
        this.token_type = null;
        this.site_id = null;
        this.ready = false;

        this.handleError = (error) => {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            console.log(error.config);
        }
    }

    getPosts() {
        return  this.blog.postsList();       
    }

    createPost(date, title, content){
        return this.blog.post().add( { date: date, title: title, content: content } );
    }

    updatePost(id, title, content){
        return this.blog.post(id).update( { title: title, content: content } );
    }

    deletePost(id) {
        return this.blog.post(id).delete();
    }
    signIn() {
        return new Promise((resolve, reject) => {
            const code = this.triggerSignIn();
            code.then((state) => {
                this.loader.hideLoader();
                this.expires_in = state.expires_in;
                this.initAuthThings(state.token_type, state.access_token, state.site_id);
                resolve(true);
            }).catch((err) => {
                this.loader.hideLoader();
                reject(err);
            });
        });
    }

    initAuthThings(token_type, access_token, site_id) {
        this.ready = true;
        this.access_token = access_token;
        this.token_type = token_type;
        this.site_id = site_id;
        this.wp = wpcom(this.access_token);
        this.blog = this.wp.site(this.site_id);
    }


    checkToken(token_type, access_token) {
        let loader = new Loader();
        return new Promise((resolve, reject) => {
            const params = {
                client_id: CLIENT_ID,
                token: access_token
            };
            axios.get(WORDPRESS_BASE_API_URL + "/oauth2/token-info?"+this.encodeData(params))
            .then((response) => {
                console.log(response);
                loader.hideLoader();
                this.initAuthThings(token_type, access_token, response.data.blog_id);
                resolve(true);
            })
            .catch((error) => {
                loader.hideLoader();
                this.handleError(error);
                reject(error);
            });
        });
    }

    triggerSignIn() {
        return new Promise((resolve, reject) => {
            this.loader = new Loader();
            let wordpressAuthUrl = AUTHORIZE_URL + '?response_type=' + RESPONSE_TYPE +
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
                    console.log(access_token);
                    console.log(redirectUrl);

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

    encodeData(data) {
        return Object.keys(data).map(function(key) {
            return [key, data[key]].map(encodeURIComponent).join("=");
        }).join("&");
    }  
}