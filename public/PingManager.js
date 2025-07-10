"use strict";

class PingManager {
    constructor(sendPingCallback, displayPing) {
        this.sendPingCallback = sendPingCallback;
        this.displayPing = displayPing;

        this.pingSendContainer = ELEMENTS["pingSendContainer"];
        this.pingRecieveContainer = ELEMENTS["pingRecieveContainer"];
        this.offsetPosition = { x: 0, y: 0 };

        this.pings = [
            "GG !",
            "Oui",
            "Non",
            "Danger ici",
            "Je suis prêt",
            "Placez une tour ici",
            "Placez un tour de contrôle ici",
            "Je suis trop pauvre",
            "Plus d'actions",
            "Longue vie au développeur ♥"
        ]

        this.pings.forEach((pingText) => {
            let element = Util.quickElement("pingSendText", "span", this.pingSendContainer);
            element.innerHTML = pingText;
            element.addEventListener("click", (event) => {
                this.sendPing(pingText);
            });
        });
    }
    openPingSender(position, offsetPosition) {
        this.offsetPosition = offsetPosition;
        Util.show(this.pingSendContainer);
        this.pingSendContainer.style["left"] = `${position.x}px`;
        this.pingSendContainer.style["top"] = `${position.y}px`;
    }
    closePingSender() {
        Util.hide(this.pingSendContainer);
    }
    sendPing(pingText) {
        this.closePingSender();
        this.sendPingCallback({ position: this.offsetPosition, pingText: pingText });
    }
}