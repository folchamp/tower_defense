"use strict";

class WaveNotifier {
    constructor(container) {
        this.container = container;

        this.waveNotifierText = Util.quickElement("waveNotifierText", "p", this.container);
    }
    notifyNextWave() {
        this.waveNotifierText.innerHTML = "New wave !";
        this.showThenHide();
    }
    notifyEndWave() {
        this.waveNotifierText.innerHTML = "Wave cleared !";
        this.showThenHide();
    }
    showThenHide() {
        this.container.classList.remove("hidden");
        setTimeout(() => {
            this.container.classList.add("hidden");
        }, 1500);
    }
}