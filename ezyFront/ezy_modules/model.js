import * as utils from './utils.js';

/**
 * all the data is stored in the model
 * eg. user = {firstName: , lastName}
 */
export class Model {

    constructor() {
        this.subscriptions = [];

        let self = this;

        this.message = {
            info: '',
            warning: '',
            error: '',

            reset(){
                this.info = '';
                this.warning = '';
                this.error = '';
                self.notify('message');
            },

            setInfo(info) {
                this.info = info;
                this.warning = '';
                this.error = '';
                self.notify('message');
            },

            setWarning(warning) {
                this.info = '';
                this.warning = warning;
                this.error = '';
                self.notify('message');
            },

            setError(error) {
                this.info = '';
                this.warning = '';
                this.error = error;
                self.notify('message');
            }
        }
    }

    /**
     * defines getter and setter for each model properties
     * generally objects like user
     */
    defineModelProps() {
        let keys = Object.keys(this);
        
        keys.forEach((key) => {

            let value = this[key];
            let notify = (key) => this.notify(key);

            Object.defineProperty(this, key, {
                get() {
                    return value;
                },
                set(newValue) {
                    if (!utils.isEqual(value, newValue)) {
                        value = newValue;
                        notify(key);
                    };
                }
            })
        });
    }

    /**
     * 
     * @param {string} bindId -> element id eg. #out
     * @param {*} key -> e.g user, userList
     * @param {*} subscriber 
     */
    subscribe(bindId, key, subscriber) {
        this.subscriptions.push({
            bindId: bindId,
            key: key,
            subscriber: subscriber
        });
    }

    removeSubscriptions(bindId){
        for(let i = this.subscriptions.length-1; i >= 0; i--){
            if(this.subscriptions[i].bindId === bindId){
                this.subscriptions.splice(i, 1);
            }
        }
    }

    /**
     * notifys all the subscribers for a key to refresh the page when model property changes
     * @param {*} key -> e.g user, userList
     */
    notify(key) {
        const subscriptions = this.subscriptions.filter(
            subscription => subscription.key == key
        );

        subscriptions.forEach(subscription => {
            subscription.subscriber.notify();
        })
    }

    /**
     * notifys all the subscribers to refresh the page
     */
    notifyAll() {
        this.subscriptions.forEach(subscription => {
            subscription.subscriber.notify(this[subscription.key]);
        })
    }

    /**
     * 
     * @param {'user' | 'user.firstName' | 'userList.0.firstName'} prop 
     */
    getValue(prop) {
        return this.getValueFromObject(this, prop);
    }


    /**
     * 
     * @param {'user' | 'user.firstName'} prop 
     * @param {{firstName: 'Kan'} |'Kan'} value 
     */
    setValue(prop, value) {
        if (this.setValueToObject(this, prop, value)) {
            const propParts = prop.split('.');
            const key = propParts[0];
            this.notify(key);
        }
    }

    /**
     * 
     * @param {utils.model} obj 
     * @param {'user' | 'user.firstName' | 'userList.0.firstName' } prop 
     */
    getValueFromObject(obj, prop) {

        if (!utils.isObject(obj) && !utils.isArray(obj)) {
            return '';
        }

        var i = prop.indexOf('.');
        if (i > -1) {
            return this.getValueFromObject(obj[prop.substring(0, i)], prop.substr(i + 1));
        }

        return obj[prop];
    }

    /**
     * 
     * @param {utils.model} obj 
     * @param {'user' | 'user.firstName'} prop 
     * @param {{firstName: 'Kan'} |'Kan'} value 
     */
    setValueToObject(obj, prop, value) {

        if (!utils.isObject(obj)) {
            return false;
        }

        var i = prop.indexOf('.')
        if (i > -1) {
            this.setValueToObject(obj[prop.substring(0, i)], prop.substr(i + 1), value);
        }

        // no change
        if (utils.isEqual(obj[prop], value)) {
            return false;
        }

        obj[prop] = value;
        return true;
    }
}
