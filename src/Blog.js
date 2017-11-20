const Loader = require("./Loader").default;

exports.Blog = class Blog {
    constructor(apiconnector){
        this.api = apiconnector;
        this.postContainer = document.getElementById("posts");
        this.posts = [];

        document.addEventListener("post-deleted", (ev) =>{
            console.log(ev);
            let post = ev.detail.post;
            let index = this.posts.indexOf(post);
            if(index > -1){
                this.posts[index].hide();
                this.posts.splice(index, 1);
            }
        });
        this.fetchPosts();
    }

    createPost(){
        if(!this.newpost || !this.newpost.editor){
            this.newpost = new Post(this.api, "Titel", null, null, null, this.postContainer, null, null, null, true);
            this.newpost.show();
            this.posts.push(this.newpost);
        }
        else
            smalltalk.alert("Nur ein neuer Post gleichzeitig.", "Es kann nur maximal ein Post gleichzeitig neu erstellt werden.");
    }

    addPost(Post){
        this.posts.push(Post);
    }

    deletePost(){

    }

    fetchPosts() {
        let loader = new Loader();
        let posts = this.api.getPosts();
        posts.then((response) => {
            this.posts = [];
            for (let post of response.posts) {
                this.posts.push(new Post(this.api, post.title, post.content, post.tags, post.status, this.postContainer, post.ID, post.URL, post.date));
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