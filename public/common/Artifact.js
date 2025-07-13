"use strict";

class Artifact {
    constructor(artifactData, position, artifactID) {
        this.artifactData = artifactData;
        this.position = position;
        this.artifactID = artifactID;
    }
    load(data) {
        this.artifactData = data.artifactData;
        this.position = data.position;
        this.artifactID = data.artifactID;
    }
}

(function (exports) {
    exports.Artifact = Artifact;
}(typeof exports === 'undefined' ? {} : exports));