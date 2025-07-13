"use strict";

class Artifact {
    constructor(artifactData, position) {
        this.artifactData = artifactData;
        this.position = position;
    }
    load(data) {
        this.artifactData = data.artifactData;
        this.position = data.position;
    }
}

(function (exports) {
    exports.Artifact = Artifact;
}(typeof exports === 'undefined' ? {} : exports));