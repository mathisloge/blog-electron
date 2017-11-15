require("./../node_modules/jodit/build/jodit.min.js");

exports.default = class Post {
    constructor(apiconnector, title, content, tags, status, parent, id = null, url = null, date = null, createParent = false){
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.status = status;
        this.id = id;
        this.url = url;
        this.date = new Date(date);
        this.parent = parent;
        this.editor = null;
        this.api = apiconnector;
        
        this.edit = () => {
            if(!this.editor)
                this.editor = new Jodit(this.contentHTML);
            this.editButton.style.display = 'none';
            this.saveButton.style.display = "inline-block";
        }

        this. save = () => {
            let content = this.editor.getEditorValue();
            this.editor.destruct();
            this.editor = null;
            this.editButton.style.display = 'inline-block';
            this.saveButton.style.display = "none";


        }            
        this.buildHtml();
        
        if(createParent !== false)
            this.edit(createParent);      
    }   

   
    buildHtml(){
        this.html = document.createElement("article");
        this.html.className = "column panel post";
        // Seite muss in neuem BrowserWindow geöffnet werden.
        this.html.innerHTML = '<header class="panel-header"><h1 class="panel-title">'+this.title+'</h1><div class="card-subtitle text-gray">Veröffentlicht am '+this.date.toLocaleString("de-DE")+' Uhr</div></header>';
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