const ApiConnector = require("./src/ApiConnector");
const Loader = require("./src/Loader");
class MainWindow {
    constructor(){
        this.api = new ApiConnector.default("electronblogblog.wordpress.com");

        let signin = this.api.signIn();
        let posts = null;
        signin.then( (ready) => {
            console.log("sign in: ", ready);
            this.loadPosts();
        })
        .catch( (err) => {
            console.error("Auth Error: ", err);
        })
    }


    loadPosts() {
        let loader = new Loader.default();
        let posts = this.api.getPosts();
        posts.then((response) => {
            console.log(response);
            this.posts = response.posts;
            loader.hideLoader();
        }).catch((err)=>{
            console.error(reject);
            loader.hideLoader();
        });
    }
}

let mainWindow = new MainWindow();