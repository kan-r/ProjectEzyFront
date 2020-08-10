import { Subscriber } from './subscriber.js';

export class Binder{

    constructor(router, model) {
        this.router = router;
        this.model = model;

        this.BIND_TYPE_DEF = "ezy-bind";
        this.BIND_TYPE_VAL = "ezy-bind-value";
        this.BIND_TYPE_LIST = "ezy-bind-list";
        this.BIND_TYPE_SHOW = "ezy-bind-show";
        this.BIND_TYPE_HIDE = "ezy-bind-hide";

        //looking for prop, eg. {user.userId}, {user.dateCrt | date : short}
        this.BIND_PROP_PATT = /{\w+(.\w+)*(\s+\|\s+.+)?}/;
        this.BIND_PROP_PATT_G = /{\w+(.\w+)*(\s+\|\s+.+)?}/g;

        //looking for { at the start and, } at the end
        this.BIND_PROP_DELIM_PATT = /^{|}$/g;

        //looking for " in ", eg. "usr in userList"
        this.BIND_FOR_PATT = /\sin\s/i;

        //looking for prop enclosed by [], eg. [usr]
        this.BIND_LIST_PATT = /^\[\w+\]$/;

        //looking for [ at the start and, ] at the end
        this.BIND_LIST_DELIM_PATT = /^\[|\]$/g;

        //looking for }.formatDate( at the start and, ) at the end
        this.FORMAT_DATE_PATT = /^(}.formatDate)\)$/
    }

    /**
     * finds elements with attribute BIND_TYPE_DEF and their children and,
     * binds to model
     */
    findAndBindNodes(pBindId = '') {
        const bindNodes = document.querySelectorAll('[' + this.BIND_TYPE_DEF + ']');
        for (let i = 0; i < bindNodes.length; i++) {

            let bindId = '#' + bindNodes[i].getAttribute("id");

            // skip the rest
            if(pBindId !== '' && pBindId !== bindId){
                continue;
            }
           
            /** this will be bound under SELECT */
            if(bindNodes[i].tagName === 'OPTION'){
                continue;
            }

            /** 
             * subscriptions are created every time routing occurs
             * so remove the previous subscriptions if any
             */
            if(bindId === this.router.outlet){
                this.model.removeSubscriptions(bindId);
            }

            this._findAndBindChildNodes(bindNodes[i], bindId);
        }
   
        if (bindNodes.length > 0) {
            this.model.notifyAll();
        }
    }
    
    _findAndBindChildNodes(node, bindId) {
        if(node.tagName === 'SCRIPT'){
            return;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            
            /** list */
            const bind = node.getAttribute(this.BIND_TYPE_LIST);
            if (bind !== null && bind !== '') {
                // looking for " in ", eg. "usr in userist"
                let bindParts = bind.split(this.BIND_FOR_PATT);
                if (bindParts.length === 2) {
                    const key = bindParts[1]; /** userList */
                    const prop = '[' + bindParts[0] + ']'; /** [usr], this will be replaced with 0, 1 etc. */
    
                    this.model.subscribe(bindId, key, new Subscriber(this, node, null, this.BIND_TYPE_LIST, this.model, key, prop));
                    return;
                }
            }
    
            /** textarea, not same as input, value is between tags */
            if(node.tagName === 'TEXTAREA'){
               
                if(!this.BIND_PROP_PATT.test(node.value)){
                    return;
                }

                const prop = node.value.replace(this.BIND_PROP_DELIM_PATT, '');
                const propParts = prop.split('.');
                const key = propParts[0];
    
                this.model.subscribe(bindId, key, new Subscriber(this, node, null, this.BIND_TYPE_DEF, this.model, key, prop));
            }
    
            /** input, textarea, select */
            this._findAndBindNodeAttributes(node, bindId);
    
        } else if (node.nodeType === Node.TEXT_NODE) {
    
            const textCont = node.textContent;
    
            if (this.BIND_PROP_PATT.test(textCont)) {
    
                const matches = textCont.match(this.BIND_PROP_PATT_G);
                matches.forEach(match => {
        
                    const prop = match.replace(this.BIND_PROP_DELIM_PATT, '');
                    const propParts = prop.split('.');
                    const key = propParts[0];
    
                    this.model.subscribe(bindId, key, new Subscriber(this, node, null, this.BIND_TYPE_DEF, this.model, key, prop));
                })
            }
        }

        let childNodes = node.childNodes;
        for (let j = 0; j < childNodes.length; j++) {
            this._findAndBindChildNodes(childNodes[j], bindId);
        }
    }
    
    _findAndBindNodeAttributes(node, bindId) {

        if (node.nodeType !== Node.ELEMENT_NODE || !node.hasAttributes()) {
            return;
        }
    
        const attrs = node.attributes;
        for (let i = 0; i < attrs.length; i++) {

            if (!this.BIND_PROP_PATT.test(attrs[i].value)) {
                continue;
            }
    
            const matches = attrs[i].value.match(this.BIND_PROP_PATT_G);
            matches.forEach(match => {
    
                const prop = match.replace(this.BIND_PROP_DELIM_PATT, '');
                const propParts = prop.split('.');
                const key = propParts[0];

                this.model.subscribe(bindId, key, new Subscriber(this, node, attrs[i], this.BIND_TYPE_DEF, this.model, key, prop));
            })
        }
    }
}
