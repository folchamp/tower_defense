"use strict";

class Menu {
    constructor(menuData) {
        this.menuData = menuData;
        this.elements = this.getElementsFromData();
        this.initMenu();
        this.hideAllPages();
    }
    getElementsFromData() {
        let elementsToFetch = [];
        let fetchedElements;
        this.menuData.forEach((link) => {
            elementsToFetch.push(link.button);
            elementsToFetch.push(link.element);
        });
        fetchedElements = Util.getElements(elementsToFetch);
        return fetchedElements;
    }
    initMenu() {
        this.menuData.forEach((link) => {
            this.elements[link.button].addEventListener("click", (event) => {
                this.hideAllPages(this.elements, this.menuData);
                Util.show(this.elements[link.element]);
            });
        });
    }
    hideAllPages() {
        this.menuData.forEach((link) => {
            Util.hide(this.elements[link.element]);
        });
    }
    open(name) {
        Util.show(this.elements[name]);
    }
}