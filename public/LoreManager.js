"use strict";

class LoreManager {
    constructor() {
        this.loreList = [];

        ELEMENTS["infoPopupCloseButton"].addEventListener("click", (event) => {
            Util.hide(ELEMENTS["infoPopupContainer"]);
            // this.soundManager.go();
        });

        ELEMENTS["continueButton"].addEventListener("click", (event) => {
            Util.hide(ELEMENTS["infoPopupContainer"]);
        });

    }
    closePopup() {
        Util.hide(ELEMENTS["infoPopupContainer"]);
    }
    loreAlreadyPresent(data) {
        let alreadyPresent = false;
        this.loreList.forEach((lore) => {
            if (lore.title === data.title && lore.subtitle === data.subtitle) {
                alreadyPresent = true;
            }
        });
        return alreadyPresent;
    }
    displayLoreElement(data) {
        Util.show(ELEMENTS["infoPopupContainer"]);
        ELEMENTS["infoPopupBigTitle"].innerHTML = data.title;
        ELEMENTS["infoPopupSubtitle"].innerHTML = data.subtitle;
        ELEMENTS["infoPopupDescription"].innerHTML = data.description;
        ELEMENTS["infoPopupVrac"].innerHTML = data.vrac;
        ELEMENTS["infoPopupImage"].src = data.imageName;
    }
    addLoreElement(data) {
        if (!this.loreAlreadyPresent(data)) {
            ELEMENTS["playersButton"].classList.add("animateButton");
            setTimeout(() => {
                ELEMENTS["playersButton"].classList.remove("animateButton");
            }, 500);
            this.loreList.push(data);
            let loreButtonContainer = Util.quickElement("loreButtonContainer", "div", ELEMENTS["loreListContainer"]);
            let loreImage = Util.quickElement("loreImage", "img", loreButtonContainer)
            let loreText = Util.quickElement("loreButtonText", "span", loreButtonContainer);
            loreText.innerHTML = data.title;
            loreImage.src = data.imageName;

            loreButtonContainer.addEventListener("click", (event) => {
                this.displayLoreElement(data);
            });
        }
    }
}