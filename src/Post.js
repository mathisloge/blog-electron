exports.default = class Post {
    constructor(title, content, tags, status, id = null, url = null, date = null){
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.status = status;
        this.id = id;
        this.url = url;
        this.date = date;
    }   

    save(){

    }


    addToEl(parent){
        this.html = document.createElement("article");
        this.html.className = "column panel";
        // Seite muss in neuem BrowserWindow geöffnet werden.
        this.html.innerHTML = '<header class="panel-header"><h1 class="panel-title">'+this.title+'</h1></header><div class="panel-body"><p>'+this.content+'</p></div>';

        let footer = document.createElement("footer");
        footer.className = "panel-footer";
        let button = document.createElement("button");
        button.innerText = "Website öffnen";
        button.addEventListener("click",() => {
            console.log("test");
            window.open(this.url, 'modal')
        });
        footer.appendChild(button);
        this.html.appendChild(footer);

        parent.appendChild(this.html);
    }

    delete(){
        if(this.html){
            this.html.remove();
        }
    }


}