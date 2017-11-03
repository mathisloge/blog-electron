exports.default = class Loader {
    constructor(){
        this.loader = document.getElementById("loader-element");
        if(this.loader){
            this.loader.dataset.count = parseInt(this.loader.dataset.count) + 1;
        }
        this.showLoader();
    }
    showLoader() {
        if(!this.loader){
            this.loader = document.createElement("progress");
            this.loader.className = "progress loader";
            this.loader.id = "loader-element";
            this.loader.max = 100;
            this.loader.dataset.count = 1;
            document.body.insertBefore(this.loader, document.body.firstChild);
        }
    }

    hideLoader() {
        if(this.loader){
            this.loader.dataset.count = parseInt(this.loader.dataset.count) - 1;
            if(this.loader.dataset.count <= 0)
                this.loader.remove();
        }
    }
}