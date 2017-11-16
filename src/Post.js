require("./../node_modules/jodit/build/jodit.min.js");

exports.default = class Post {
    constructor(apiconnector, title, content, tags, status, parent, id = null, url = null, date = null, createPost = false){
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.status = status;
        this.id = id;
        this.url = url;
        if(date)
            this.date = new Date(date);
        else
            this.date = new Date();
        this.parent = parent;
        this.editor = null;
        this.api = apiconnector;
        
        this.edit = () => {
            if(!this.editor)
                this.editor = new Jodit(this.contentHTML);
            if(!this.titleInput){
                this.titleInput = document.createElement("input");
                this.titleInput.value = this.title;
                this.titleHTML.innerHTML = "";
                this.titleHTML.appendChild(this.titleInput);
            }


            this.editButton.style.display = 'none';
            this.saveButton.style.display = "inline-block";
        }

        this. save = () => {
            let content = this.editor.getEditorValue();
            this.editor.destruct();
            this.editor = null;

            this.title = this.titleInput.value;
            this.titleInput = null;

            this.titleHTML.innerHTML = this.title;
            this.editButton.style.display = 'inline-block';
            this.saveButton.style.display = "none";
        }            
        this.buildHtml();
        
        if(createPost === true)
            this.edit();      
    }   

   
    buildHtml(){
        this.html = document.createElement("article");
        this.html.className = "column panel post";
       
        this.titleHTML = document.createElement("h1");
        this.titleHTML.className = "panel-title";
        this.titleHTML.innerHTML = this.title;

        this.headerHTML = document.createElement("header");
        this.headerHTML.className = "panel-header";
        this.headerHTML.appendChild(this.titleHTML);

        this.dateHTML = document.createElement("div");
        this.dateHTML.className = "card-subtitle text-gray";
        this.dateHTML.innerText = 'Veröffentlicht am '+this.date.toLocaleString("de-DE")+' Uhr';
        this.headerHTML.appendChild(this.dateHTML);

        this.html.appendChild(this.headerHTML);

        this.contentHTML = document.createElement("div");
        this.contentHTML.className = "panel-body";
        this.contentHTML.innerHTML = this.content;
        this.html.appendChild(this.contentHTML);

        let footer = document.createElement("footer");
        footer.className = "panel-footer";

        let button = document.createElement("button");
        button.innerText = "Website öffnen";
        button.addEventListener("click", () => window.open(this.url, 'modal'));
        button.classList = "btn btn-link"

        this.editButton = document.createElement("button");
        this.editButton.classList = "btn"
        this.editButton.innerText = "Bearbeiten";
        this.editButton.addEventListener("click", this.edit);

        this.saveButton = document.createElement("button");
        this.saveButton.classList = "btn"
        this.saveButton.innerText = "Speichern";
        this.saveButton.style.display = 'none';
        this.saveButton.addEventListener("click", this.save);

        footer.appendChild(this.editButton);
        footer.appendChild(this.saveButton);
        footer.appendChild(button);
        this.html.appendChild(footer);
    }
    show() {
        this.parent.appendChild(this.html);
    }

    hide(){
        this.parent.removeChild(this.html);
    }

    delete(){
        if(this.html){
            this.html.remove();
        }
    }


}