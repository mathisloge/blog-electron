exports.default = class Post {
    constructor(title, content, tags, id = null){
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.id = id;
    }   

    save(){

    }


    getHtml(){
        this.html = document.createElement("div");

    }


}