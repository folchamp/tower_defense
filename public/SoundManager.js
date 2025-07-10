"use strict";

class SoundManager {
    constructor() {
    }
    go() {

        AUDIO["loop"].addEventListener("canplaythrough", (event) => {
        });
        AUDIO["loop"].play()
        AUDIO["loop"].loop = true;

    }
}