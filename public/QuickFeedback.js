"use strict";

class QuickFeedback {
    constructor(element) {
        this.element = element;
        this.element.innerHTML = "";
        Util.hide(this.element);
    }
    displayFeedback(text, position, isSuccesful) {
        if (isSuccesful) {
            this.element.classList.add("successful");
        } else {
            this.element.classList.remove("successful");
        }
        Util.show(this.element);
        this.element.style.left = `${position.x}px`
        this.element.style.top = `${position.y}px`
        this.element.innerHTML = text;
        setTimeout(() => {
            Util.hide(this.element);
            this.element.innerHTML = "";
        }, 1500);
    }
}