import { Router } from './router.js';
import { Model } from './model.js';
import { Binder } from './binder.js';
import * as utils from './utils.js';

class Ezy{

    constructor(){
        this.router = new Router();
        this.model = new Model();
        this.binder = new Binder(this.router, this.model);

        this.load = utils.load;
    }

    // added to the script on loading the App page (utils.load)
    _appInit(){
        const event = new Event('AppInit');
        document.dispatchEvent(event);
    }

    // added to the script on loading a page (utils.load)
    _bind(bindId){
        this.model.defineModelProps();
        this.binder.findAndBindNodes(bindId);
    }
}

export let $ezy = new Ezy();

onload = function(){
    document.addEventListener("AppInit", function(event) {
        $ezy.router.loadRoute(location.hash);
    });
}

onhashchange = function(){
    $ezy.router.loadRoute(location.hash);
}
