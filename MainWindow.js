const ApiConnector = require("./src/ApiConnector").default;
const Loader = require("./src/Loader").default;
const Post = require("./src/Post").default;
const smalltalk = require("smalltalk");

class MainWindow {
    constructor() {
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
                        this.loadPosts();
                    }).catch((err) => {
                        console.error("Auth Error: ", err);
                    })
                }
            })
            .catch(() => {
                document.body.innerHTML = "KEINE WORDPRESS.COM SEITE ANGEGEBEN!";
            });
    }


    loadPosts() {
        let loader = new Loader();
        let posts = this.api.getPosts();
        posts.then((response) => {
            console.log(response);
            this.posts = [];
            for (let post of response.posts) {
                this.posts.push(new Post(post.title, post.content, post.tags, post.status, post.ID, post.URL, post.date));
            }
            loader.hideLoader();
            let el = document.getElementById("posts");
            for (let post of this.posts) {
                console.log(post);
                post.addToEl(el);
            }
        }).catch((err) => {
            console.error(err);
            loader.hideLoader();
        });
    }
}

let mainWindow = new MainWindow();