const ApiConnector = require("./src/ApiConnector").default;
const Loader = require("./src/Loader").default;
const Post = require("./src/Post").default;
const smalltalk = require("smalltalk");
const {Blog} = require("./src/Blog");
/* url params auslesen. Siehe main.js: site und token werden bisher gesetzt, falls cookies gesetzt wurden. */
let urlParams;
(window.onpopstate = function () {
    let match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

class MainWindow {
    constructor() {
        this.editor;
        this.blog = null;
        if("site" in urlParams && "token" in urlParams){
            this.api = new ApiConnector(this.params.site);
            let checkPromise = this.api.checkToken("Bearer", this.params.token);
            checkPromise.then( (status) => {
                if(status === true){
                    this.init();
                }
                else {
                    this.openStartupWindow();
                }
            })
        }
        else {
            this.openStartupWindow();
        }

        document.addEventListener("file-new", () => {
            this.newPost();
        });
    }

    newPost(){
        this.blog.createPost();
    }

    openStartupWindow(){
        smalltalk.prompt('Wordpress', 'Wordpress.com Seite: ', 'electronblogblog.wordpress.com')
        .then((site_url) => {
            if (site_url == null || site_url == "") {
                document.body.innerHTML = "ERROR: KEINE SEITE ANGEGEBEN!";
                return;
            } else {
                this.api = new ApiConnector(site_url);

                let signin = this.api.signIn();
                let posts = null;
                signin.then((ready) => {
                    console.log("sign in: ", ready);
                    this.init();
                }).catch((err) => {
                    console.error("Auth Error: ", err);
                })
            }
        })
        .catch(() => {
            document.body.innerHTML = "KEINE WORDPRESS.COM SEITE ANGEGEBEN!";
        });
    }

    init() {
        this.blog = new Blog(this.api);
    }
}

let mainWindow = new MainWindow();

require('electron').ipcRenderer.on('ping', (event, message) => {
    console.log(message)  // Prints 'whoooooooh!'
})