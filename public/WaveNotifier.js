"use strict";

class WaveNotifier {
    constructor(container) {
        this.container = container;

        this.waveNotifierText = Util.quickElement("waveNotifierText", "p", this.container);
    }
    notifyNextWave(waveCounter) {
        this.waveNotifierText.innerHTML = `Vague ${waveCounter}`;
        this.showThenHide();
    }
    notifyEndWave() {
        this.waveNotifierText.innerHTML = "Fin de vague";
        this.showThenHide();
    }
    showThenHide() {
        this.container.classList.remove("hidden");
        setTimeout(() => {
            this.container.classList.add("hidden");
        }, 1500);
    }
}