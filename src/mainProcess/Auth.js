const {session} = require('electron');

exports.Auth = class Auth {
    constructor(){
        this.bearer_token = null;
        this.site = null;
    }

    init(){
        return new Promise( (resolve, reject) => {
            let authCookiePromise = this.getAuthCookie();
            let siteCookiePromise = this.getSiteCookie();

            siteCookiePromise.then((site) => this.site = site);
            authCookiePromise.then((token) => {
                if(token !== false){
                this.bearer_token = token;
                    resolve(true);
                }
                else 
                    resolve(false);
            }).catch((err) => {
                console.warn("Error Cookie: ", err);
                reject("Cookie Error");
            });
        });
    }


    getSiteCookie() {
        return new Promise((resolve, reject) =>{
            session.defaultSession.cookies.get({url: 'http://localhost', name:"site"}, (error, cookies) => {
                if(error) reject(error);
                if(cookies[0]) resolve(cookies[0]);
                else resolve(false);
            });
        });
    }
    getAuthCookie () {
        return new Promise((resolve, reject) =>{
            session.defaultSession.cookies.get({url: 'http://localhost', name:"bearer_token"}, (error, cookies) => {
                if(error) reject(error);
                if(cookies[0]) resolve(cookies[0]);
                else resolve(false);
            });
        });
    }
}