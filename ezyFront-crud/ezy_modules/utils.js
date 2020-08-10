/**
 * checks if an object is array
 * @param {object} a 
 */
export function isArray(a) {
    return Array.isArray(a);
}

/**
 * checks if an object is really an object ( not null or array)
 * @param {object} a 
 */
export function isObject(a) {
    // JavaScript considers null and array as objects
    if (a === null || isArray(a)) {
        return false;
    }

    return (typeof a) === 'object';
}

/**
 * check if type of something is same as that of another
 * @param {*} a 
 * @param {*} b 
 */
export function isTypeOfSame(a, b) {
    if (a === null && b === null) {
        return true;
    }

    if (isArray(a) && isArray(b)) {
        return true;
    }

    if (isObject(a) && isObject(b)) {
        return true;
    }

    if ((typeof a) && (typeof b)) {
        return true;
    }

    return false;
}

/**
 * check if content of an array is same as that of another
 * @param {array} arr1 
 * @param {array} arr2 
 */
export function isArrayEqual(arr1, arr2) {

    if (!isArray(arr1) || !isArray(arr2)) {
        return false;
    }

    // Check if the arrays are the same length
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Check if all items exist and are in the same order
    for (var i = 0; i < arr1.length; i++) {
        if (!isEqual(arr1[i], arr2[i])) {
            return false;
        }
    }

    // Otherwise, return true
    return true;
}

/**
 * checks if value of something is same as that of another
 * @param {*} a 
 * @param {*} b 
 */
export function isEqual(a, b) {
    
    if (!isTypeOfSame(a, b)) {
        return false;
    }
    
    if (a === null) {
        return (a === b);
    }
   
    if (isArray(a)) {
        return isArrayEqual(a, b);
    }
   
    if (!isObject(a)) {
        return (a === b);
    }

    // Create arrays of property names
    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i];

        if (!isEqual(a[propName], b[propName])) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}
 
export function isEmpty(val){
    if(val === undefined || val === null || val === ''){
        return true;
    }

    return false;
}

export function evaluateToBoolean(value){

    if(value === undefined){
        return false;
    }

    const val = value.toString().toLowerCase();
    let ret = true;

    switch (val) {
        case '':
        case 'false':
        case '0':
        case 'no':
        case 'off':
            ret = false;
    }

    return ret;
}

/****************************************************************** */

/**
 * formats a value based on the format
 * @param {string} value 
 * @param {string} format -> string, number, date, dateTime, time, day
 */
export function format(value, format){
   
    if(isEmpty(value)){
        return '';
    }

    if(isEmpty(format)){
        return value;
    }

    let val = value;

    let fmtParts = format.split(':');
    if(fmtParts[0].trim().toLowerCase() === 'string'){
        let fmt = '';

        if(fmtParts.length > 1){
            fmt = fmtParts[1].trim().toLowerCase();
        }

        val = formatString(val, fmt);

    }else if(fmtParts[0].trim().toLowerCase() === 'number'){
        let fmt = [];

        if(fmtParts.length > 1){
            fmt = fmtParts.slice(1);
        }

        val = formatNumber(val, fmt);

    }else if(fmtParts[0].trim().toLowerCase() === 'datetime'){
        let fmt = '';

        if(fmtParts.length > 1){
            fmt = fmtParts[1].trim().toLowerCase();
        }

        let locale = '';

        if(fmtParts.length > 2){
            locale = fmtParts[2].trim().toLowerCase();
        }

        val = formatDateTime(val, fmt, locale);

    }else if(fmtParts[0].trim().toLowerCase() === 'date'){
        let fmt = '';

        if(fmtParts.length > 1){
            fmt = fmtParts[1].trim().toLowerCase();
        }

        let locale = '';

        if(fmtParts.length > 2){
            locale = fmtParts[2].trim().toLowerCase();
        }

        val = formatDate(val, fmt, locale);

    }else if(fmtParts[0].trim().toLowerCase() === 'time'){
        let fmt = '';

        if(fmtParts.length > 1){
            fmt = fmtParts[1].trim().toLowerCase();
        }

        val = formatTime(val, fmt);

    }else if(fmtParts[0].trim().toLowerCase() === 'day'){
        let fmt = '';

        if(fmtParts.length > 1){
            fmt = fmtParts[1].trim().toLowerCase();
        }

        val = formatDay(val, fmt);
    }

    return val;
}

/**
 * DOM { value | string [ : format ] }
 * 
 * @param {string} value 
 * @param {uppercase | lowercase} format 
 */
function formatString(value, format){
    let val = value;
    const fmt = format.trim().toLowerCase(format);

    switch (fmt) {
        case 'uppercase':
            val = val.toUpperCase();
            break;
        case 'lowercase':
            val = val.toLowerCase();
            break;
    }

    return val;
}

/**
 * DOM { value | number [ : style [ : scale [ : locale [ : currency ] ] ] ] }
 * style = decimal | percent | currency
 * scale = 0, 1, 2, etc.
 * locale = en-AUS, en-US, etc.
 * currency = AUD, USD, etc.
 * 
 * @param {number} value 
 * @param {array} fmt -> [style, scale, locale, currency]
 */
function formatNumber(value, fmt){
    
    let style = 'decimal';
    if(fmt.length > 0){
        style = fmt[0].trim().toLowerCase();
    }

    let scale = '';
    if(fmt.length > 1){
        scale = fmt[1].trim();
    }

    let locale = 'default';
    if(fmt.length > 2){
        locale = fmt[2].trim();
    }

    let currency = 'AUD';
    if(fmt.length > 3){
        currency = fmt[3].trim();
    }

    let options = {
    	style: style
    }

    if(scale !== ''){
        options.minimumFractionDigits = scale;
        options.maximumFractionDigits = scale;
    }

    if(style === 'currency'){
        options.currency = currency;
    }

    return new Intl.NumberFormat(locale, options).format(value);
}

 /**
 * DOM { value | datetime [ : format [ : locale ] ] }
 * 
 * @param {value in YYYY-MM-DDTHH:mm:ss:sssZ } dateVal
 * @param { | short | short24 | medium | medium24 | long | long24 | full | full24} dateFmt 
 * @param { | en_US | etc.} dateLocale 
 */
function formatDateTime(dateVal, dateFmt, dateLocale){

    let locale = 'default';
    if(dateLocale !== ''){
        locale = dateLocale;
    }

    let options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
        hour12: true
    };

    if(dateFmt === 'short' || dateFmt === 'short24'){
        options.month = 'numeric';
        options.day = 'numeric';
        options.hour = 'numeric';

        if(dateFmt === 'short24'){
            options.hour12 = false;
        }
    }else if(dateFmt === 'medium' || dateFmt === 'medium24'){
        options.month = 'short';
        options.day = 'numeric';
        options.hour = 'numeric';
        options.second = 'numeric';
        
        if(dateFmt === 'medium24'){
            options.hour12 = false;
        }
    }else if(dateFmt === 'long' || dateFmt === 'long24'){
        options.month = 'long';
        options.day = 'numeric';
        options.hour = 'numeric';
        options.second = 'numeric';
        options.timeZoneName = 'short';

        
        if(dateFmt === 'long24'){
            options.hour12 = false;
        }
    }else if(dateFmt === 'full' || dateFmt === 'full24'){
        options.month = 'long';
        options.day = 'numeric';
        options.hour = 'numeric';
        options.second = 'numeric';
        options.weekday = 'long';
        options.timeZoneName = 'long';
        
        if(dateFmt === 'full24'){
            options.hour12 = false;
        }
    }

    let dt = '';

    if(dateVal !== null && dateVal !== '') {
        dt = new Intl.DateTimeFormat(locale, options).format(new Date(dateVal));
    }

    return dt;
}

/**
 * DOM { value | date [ : format [ : locale ] ] }
 * 
 * @param {value in YYYY-MM-DDTHH:mm:ss:sssZ } dateVal
 * @param { | short | medium | long | full} dateFmt 
 * @param { | en_US | etc.} dateLocale 
 */
function formatDate(dateVal, dateFmt, dateLocale){

    let locale = 'default';
    if(dateLocale !== ''){
        locale = dateLocale;
    }

    let options = { 
        year: 'numeric', month: '2-digit', day: '2-digit' 
    };

    if(dateFmt === 'short'){
        options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    }else if(dateFmt === 'medium'){
        options = { year: 'numeric', month: 'short', day: 'numeric' };
    }else if(dateFmt === 'long'){
        options = { year: 'numeric', month: 'long', day: 'numeric' };
    }else if(dateFmt === 'full'){
        options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    }

    let dt = '';

    if(dateVal !== null && dateVal !== '') {
        dt = new Intl.DateTimeFormat(locale, options).format(new Date(dateVal));
    }

    return dt;
}

 /**
 * DOM { value | datetime [ : format [ : locale ] ] }
 * 
 * @param {value in YYYY-MM-DDTHH:mm:ss:sssZ } dateVal
 * @param { | short | short24 | medium | medium24 | long | long24 | full | full24} dateFmt  
 */
function formatTime(dateVal, dateFmt){

    let options = {
        hour: '2-digit', minute: '2-digit',
        hour12: true
    };

    if(dateFmt === 'short' || dateFmt === 'short24'){
        options.hour = 'numeric';

        if(dateFmt === 'short24'){
            options.hour12 = false;
        }
    }else if(dateFmt === 'medium' || dateFmt === 'medium24'){
        options.hour = 'numeric';
        options.second = 'numeric';
        
        if(dateFmt === 'medium24'){
            options.hour12 = false;
        }
    }else if(dateFmt === 'long' || dateFmt === 'long24'){
        options.hour = 'numeric';
        options.second = 'numeric';
        options.timeZoneName = 'short';

        if(dateFmt === 'long24'){
            options.hour12 = false;
        }
    }else if(dateFmt === 'full' || dateFmt === 'full24'){
        options.hour = 'numeric';
        options.second = 'numeric';
        options.timeZoneName = 'long';
        
        if(dateFmt === 'full24'){
            options.hour12 = false;
        }
    }

    let dt = '';

    if(dateVal !== null && dateVal !== '') {
        dt = new Intl.DateTimeFormat('default', options).format(new Date(dateVal));
    }

    return dt;
}

/**
 * DOM { value | date [ : format ] }
 * 
 * @param {value in YYYY-MM-DDTHH:mm:ss:sssZ } dateVal
 * @param { | short | long } dayFmt 
 */
function formatDay(dateVal, dayFmt){
    let options = {
        weekday: 'short'
    };

    if(dayFmt === 'long'){
        options.weekday = 'long';
    }

    let dt = '';

    if(dateVal !== null && dateVal !== '') {
        dt = new Intl.DateTimeFormat('default', options).format(new Date(dateVal));
    }

    return dt;
}

/****************************************************************** */

/**
 * 
 * @param {string} outletSel -> e.g. '#out'
 * @param {string} html 
 */
function setInnerHTML(outletSel, html) {
    let elm = document.querySelector(outletSel);

    if(elm === null){
        return;
    }

    elm.innerHTML = html;

    const oldScripts =  elm.querySelectorAll("script");
    reloadScripts(oldScripts, 0, outletSel);
}

/**
 * 
 * @param {html element} scripts 
 * @param {number} i -> index of the array 0, 1, etc.
 */
function reloadScripts(scripts, i, outletSel){
    if(i === scripts.length){
        return;
    }

    //waits for each reload
    reloadScript(scripts[i], outletSel, (res) =>{
        reloadScripts(scripts, i+1, outletSel);
    });
}

/**
 * 
 * @param {html element} oldScript 
 */
function reloadScript(oldScript, outletSel, callback) {
    
    const appInit = (outletSel === '#root');
    const importPatt = /import\s+{\s*\$ezy\s*}/g;

    const url = oldScript.src;
    if(url === ''){
        const newScript = document.createElement("script");

        Array.from(oldScript.attributes).forEach( attr => {
            newScript.setAttribute(attr.name, attr.value);
        });

        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        
        if(oldScript.type === 'module' && importPatt.test(oldScript.innerHTML)){
            newScript.appendChild(document.createTextNode(`$ezy._bind("${outletSel}");`));

            if(appInit){
                newScript.appendChild(document.createTextNode('$ezy._appInit();'));
            }
        }

        oldScript.parentNode.replaceChild(newScript, oldScript);

        callback('done');
        return;
    }

    // loads from a src
    getText(url)
        .then(res => {
            const newScript = document.createElement("script");

            Array.from(oldScript.attributes).forEach( attr => {
                if(attr.name !== 'src'){
                    newScript.setAttribute(attr.name, attr.value);
                }
            });

            newScript.appendChild(document.createTextNode(res));
            
            if(oldScript.type === 'module' && importPatt.test(res)){
                newScript.appendChild(document.createTextNode(`$ezy._bind("${outletSel}");`));

                if(appInit){
                    newScript.appendChild(document.createTextNode('$ezy._appInit();'));
                }
            }
            
            oldScript.parentNode.replaceChild(newScript, oldScript);

            callback('done');
        })
        .catch(err => {
            // do nothing
            callback('error');
        })
}

/**
 * 
 * @param {string} outletSel -> e.g. '#out'
 * @param {*} url -> e.g. './views/login.html'
 */
export function load(outletSel, url){
    getText(url)
        .then(res => {
            setInnerHTML(outletSel, res);
        })
        .catch(err => {
            setInnerHTML(outletSel, `<h1>${err}</h1>`);
        })
};

/**
 * loads and returns text as a Promise
 * @param {string} url 
 */
async function getText(url) {
    return fetch(url)
        .then(res => {
            if (!res.ok) {
                return Promise.reject('Error ' + res.status + ' - ' + res.statusText);
            }
            // this is a Promise
            return res.text();
        })
}

/****************************************************************** */

export function showNode(node){
    if(node === undefined || node === null){
        return;
    }

    if(node.style.display !== 'none'){
        return;
    }

    //removes 'none'
    node.style.display = '';
}

export function hideNode(node){
    if(node === undefined || node === null){
        return;
    }

    if(node.style.display === 'none'){
        return;
    }

    node.style.display = 'none';
}
