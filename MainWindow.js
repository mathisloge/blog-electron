const ApiConnector = require("./src/ApiConnector").default;
const Loader = require("./src/Loader").default;
const Post = require("./src/Post").default;
const smalltalk = require("smalltalk");
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

    init(){

        this.loadPosts();
    }

    loadPosts() {
        let loader = new Loader();
        let posts = this.api.getPosts();
        posts.then((response) => {
            console.log(response);
            let parent = document.getElementById("posts");
            this.posts = [];
            for (let post of response.posts) {
                this.posts.push(new Post(this.api, post.title, post.content, post.tags, post.status, parent, post.ID, post.URL, post.date));
            }
            loader.hideLoader();
            
            for (let post of this.posts) {
                post.show();
            }
        }).catch((err) => {
            console.error(err);
            loader.hideLoader();
        });
    }
}

let mainWindow = new MainWindow();