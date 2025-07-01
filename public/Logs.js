"use strict";

class Logs {
    constructor(element) {
        this.element = element;
    }
    log(text) {
        this.element.innerHTML = `${text}<br>${this.element.innerHTML}`;
    }
}