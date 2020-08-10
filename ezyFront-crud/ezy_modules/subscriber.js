import * as utils from './utils.js';

export class Subscriber {
    constructor(binder, node, nodeAttr, bindType, model, key, prop) {

        this.binder = binder;
        this.node = node;
        this.nodeOrig = node.cloneNode(true);
        this.nodeAttr = nodeAttr;
        this.nodeAttrOrig = (nodeAttr === null) ? null : nodeAttr.cloneNode(true);
        this.bindType = bindType;

        this.model = model;
        this.key = key;

        this.prop = prop;

        this.nodesAdded = [];

        this._initalise();
    }

    _initalise() {
        /** no data input */
        if(this.node.disabled){
            return;
        }

        if (this.node.tagName === 'INPUT') {
            /** exclue the subscribers for other attributes */
            if(this.nodeAttr.name !== 'value' && this.nodeAttr.name !== 'ezy-bind-value'){
                return;
            }

            if (
                this.node.type === 'text' 
                || this.node.type === 'number'
                || this.node.type === 'password'
                || this.node.type === 'email'
                || this.node.type === 'search'
                || this.node.type === 'tel'
                || this.node.type === 'url'
                ){
                    this.node.onkeyup = () => {
                        this.model.setValue(this.prop, this.node.value);
                    };

                    this.node.onchange = () => {
                        this.model.setValue(this.prop, this.node.value);
                    };
            } else if (this.node.type === 'checkbox') {
                this.node.onchange = () => {
                    let val = this.node.value;

                    if(!this.node.checked){
                        val = val.toString().toLowerCase();

                        switch (val) {
                            case 'true':
                                val = 'false';
                                break;
                            case 'yes':
                                val = 'no';
                                break;
                            case '1':
                                val = '0';
                                break;
                            case 'on':
                                val = 'off';
                                break;
                            default:
                                val = '';
                        }
                    }
                    
                    this.model.setValue(this.prop, val);
                };
            } else if (
                this.node.type === 'radio'
                || this.node.type === 'date' 
                || this.node.type === 'datetime-local'
                || this.node.type === 'month'
                || this.node.type === 'week'
                || this.node.type === 'time'
                || this.node.type === 'file'
                || this.node.type === 'range'
                ){
                    this.node.onchange = () => {
                        this.model.setValue(this.prop, this.node.value);
                    }
            }
        } else if (this.node.tagName === 'SELECT' && this.nodeAttr.name === 'value'){
            this.node.onchange = () => {
                this.model.setValue(this.prop, this.node.value);
            }
        } else if (this.node.tagName === 'TEXTAREA' && this.nodeAttr === null){
            this.node.onkeyup = () => {
                this.model.setValue(this.prop, this.node.value);
            }
        }
    }

    /** called on model data change */
    notify() {
        this._updateDOM();
    }

    _updateDOM() {

        if (this.node.nodeType === Node.ELEMENT_NODE) {
            /** list */
            if (this.bindType === this.binder.BIND_TYPE_LIST) {
                this._updateDOMWithList();
                return;
            }

            /** select */
            if(this.node.tagName === 'SELECT'){
                this.node.value = this.model.getValue(this.prop);
            }

            /** attrs, input */
            if (this.nodeAttr !== null){
                if (this.node.tagName === 'INPUT') {
                    if (this.node.type === 'checkbox' || this.node.type === 'radio') {
                        this.nodeAttr.value = this.model.getValue(this.prop);
                        this.node.checked = (this.node.value === this.nodeAttr.value);
                    } else{
                        this.nodeAttr.value = this.model.getValue(this.prop);
                    }
                } else {
                    this.nodeAttr.value = this._replaceTextWithNewValues(this.nodeAttrOrig.value);
                }

                // hide and show element
                if(this.nodeAttr.name === this.binder.BIND_TYPE_SHOW){
                    const show = utils.evaluateToBoolean(this.nodeAttr.value);

                    if(show){
                        utils.showNode(this.node);
                    }else{
                        utils.hideNode(this.node);
                    }
                }else if(this.nodeAttr.name === this.binder.BIND_TYPE_HIDE){
                    const hide = utils.evaluateToBoolean(this.nodeAttr.value);

                    if(hide){
                        utils.hideNode(this.node);
                    }else{
                        utils.showNode(this.node);
                    }
                }
                
                return;
            }
        }

        /** text */
        if (this.node.nodeType === Node.TEXT_NODE) {
            this.node.textContent = this._replaceTextWithNewValues(this.nodeOrig.textContent);
        }
    }

    _updateDOMWithList() {

        this._removeAddedNodes(this.node.parentElement);

        const key = this.key;
        const prop = this.prop.replace(this.binder.BIND_LIST_DELIM_PATT, '');
        const patt = new RegExp('{' + prop, 'g');

        const lst = this.model[key];

        // this is the reference node, always hidden
        utils.hideNode(this.node);

        // empty list
        if(lst === undefined || lst === null || lst.length === 0){
            return;
        }

        let prevNd = this.node;

        for (let i = 0; i < lst.length; i++) {

            const newNd = this.nodeOrig.cloneNode(true);
            this._replaceNodeWithNewValues(newNd, key, patt, i);

            //set the selected value
            if(newNd.tagName === 'OPTION'){
                if(newNd.value ===  this.node.parentElement.getAttribute('value')){
                    newNd.selected = true;
                }
            }

            prevNd.after(newNd);
            prevNd = newNd;
            this._addNode(newNd);
        }
    }

    _addNode(nd) {
        this.nodesAdded.push(nd);
    }

    _removeAddedNodes(parentEl) {
        if (this.nodesAdded.length === 0) {
            return;
        }

        this.nodesAdded.forEach(el => {
            parentEl.removeChild(el);
        })

        this.nodesAdded.length = 0;
    }

    _replaceTextWithNewValues(textCont) {

        if (!this.binder.BIND_PROP_PATT.test(textCont)) {
            return textCont;
        }

        let ret = textCont;
        const matches = ret.match(this.binder.BIND_PROP_PATT_G);
        matches.forEach(match => {

            let prop = match.replace(this.binder.BIND_PROP_DELIM_PATT, '');
           
            /** format */
            const patt = /\|/;
            let fmt = '';
            if(patt.test(prop)){
                const splits = prop.split(patt);
                if(splits.length > 0){
                    prop = splits[0].trim();
                    fmt = splits[1].trim();
                }
            }

            let value = this.model.getValue(prop);
            value = utils.format(value, fmt);

            if (utils.isObject(value)) {
                value = JSON.stringify(value);
            }

            ret = ret.replace(match, value);
        })

        return ret;
    }

    _replaceNodeWithNewValues(node, key, patt, idx) {

        if (node.nodeType === Node.ELEMENT_NODE) {
            this._replaceAttributesWithNewValues(node, key, patt, idx);
            this._hideAndShow(node);

            if (node.tagName === 'INPUT') {
                if (node.type === 'checkbox' || node.type === 'radio') {
                    const val = node.getAttribute(this.binder.BIND_TYPE_VAL);
                    node.checked = (node.value === val);
                }
            }

        } else if (node.nodeType === Node.TEXT_NODE) {
            const textCont = node.textContent.replace(patt, '{' + key + '.' + idx);
            node.textContent = this._replaceTextWithNewValues(textCont);
        }

        const childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            this._replaceNodeWithNewValues(childNodes[i], key, patt, idx);
        }
    }

    _replaceAttributesWithNewValues(node, key, patt, idx) {
        if (!node.hasAttributes()) {
            return;
        }

        const attrs = node.attributes;
        for (let i = 0; i < attrs.length; i++) {
            const value = attrs[i].value.replace(patt, '{' + key + '.' + idx);
            attrs[i].value = this._replaceTextWithNewValues(value);
        }
    }

    _hideAndShow(node){
        if (node.nodeType !== Node.ELEMENT_NODE){
            return;
        }

        // hide and show element
        if(node.hasAttribute(this.binder.BIND_TYPE_SHOW)){
            const val = node.getAttribute(this.binder.BIND_TYPE_SHOW);
            const show = utils.evaluateToBoolean(val);

            if(show){
                utils.showNode(node);
            }else{
                utils.hideNode(node);
            }
        }else if(node.hasAttribute(this.binder.BIND_TYPE_HIDE)){
            const val = node.getAttribute(this.binder.BIND_TYPE_HIDE);
            const hide = utils.evaluateToBoolean(val);

            if(hide){
                utils.hideNode(node);
            }else{
                utils.showNode(node);
            }
        }
    }
}
