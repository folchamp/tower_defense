"use strict";

class Util {
    constructor() {
        throw "this class is supposed to be static, don't try to instantiate it";
    }
    static createElement(name, parent) {
        let elementToReturn = undefined;
        if (name.endsWith("Text")) {
            elementToReturn = Util.quickElement(name, "span", parent);
        } else if (name.endsWith("Button")) {
            elementToReturn = Util.quickElement(name, "button", parent);
        } else if (name.endsWith("Li")) {
            elementToReturn = Util.quickElement(name, "li", parent);
        } else if (name.endsWith("Container")) {
            elementToReturn = Util.quickElement(name, "div", parent);
        } else {
            throw "type not supported";
        }
        return elementToReturn;
    }
    static quickStructure(structure, parent, self) {
        if (typeof structure === "string") {
            // TODO créer l'élément
            let name = structure;
            self[name] = Util.createElement(name, parent);
        } else {
            let name = structure.shift();
            self[name] = Util.createElement(name, parent);;
            structure.forEach((structurePart) => {
                Util.quickStructure(structurePart, self[name], self);
            });
        }
    }
    static quickElement(name, type, parent) {
        let element = document.createElement(type);
        element.classList.add(name);
        parent.appendChild(element);
        return element;
    }
    static emptyElement(element) {
        while (element.firstChild) {
            element.removeChild(element.lastChild);
        }
    }
    static show(element) {
        element.classList.remove("hidden");
    }
    static hide(element) {
        element.classList.add("hidden");
    }
    static loadSounds(urls) {
        let audios = {};
        for (let name in urls) {
            let url = urls[name];
            let element = new Audio(url);
            audios[name] = element;
            element.addEventListener("canplaythrough", (event) => {
                console.log(`${name} is loaded.`);
            });
        }
        return audios;
    }
    static getElements(elementNames) {
        let elementsToReturn = {};
        elementNames.forEach((name) => {
            let element = document.getElementById(name);
            elementsToReturn[name] = element;
            if (element === null) {
                console.log(`${name} not found`);
            }
        });
        return elementsToReturn;
    }
    static saveToLocalStorage(name, data) {
        if (appName === undefined) {
            throw "Util.js requires an app name";
        }
        localStorage.setItem(`${appName}_${name}`, JSON.stringify(data));
    }
    static getFromLocalStorage(name) {
        let item;
        try {
            item = JSON.parse(localStorage.getItem(`${appName}_${name}`));
        } catch (error) {
            console.log(`Error, ${name} in localStorage couldn"t be fetched`);
        }
        return item;
    }
    static getNewID() {
        let UUID = Util.randomValue(100000, 999999) + "not-unique";
        if (crypto && crypto.randomUUID) {
            UUID = crypto.randomUUID();
        }
        return UUID;
    }
    static randomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    static randomValue(min, max) {
        const span = max - min + 1;
        const randomNumber = Math.random();
        const rectifiedRandom = Math.floor(min + randomNumber * span);
        return rectifiedRandom;
    }
    static shuffle(array) {
        const length = array.length
        let currentIndex = length - 1;
        while (currentIndex >= 0) {
            let randomIndex = Util.randomValue(0, length - 1);
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            currentIndex--;
        }
        return array;
    }
    static copyObject(o) {
        let newObject = {};
        for (let attribute in o) {
            newObject[attribute] = o[attribute];
        }
        return newObject;
    }
    static distance(one, two) {
        let a = one.x - two.x;
        let b = one.y - two.y;
        return Math.sqrt(a * a + b * b);
    }
}

(function (exports) {
    exports.Util = Util;
}(typeof exports === 'undefined' ? {} : exports));