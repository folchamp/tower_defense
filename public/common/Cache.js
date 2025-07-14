"use strict";

class Cache {
    constructor(cacheData, position, cacheID) {
        this.cacheData = cacheData;
        this.position = position;
        this.cacheID = cacheID;
        this.imageName = "cache_closed";
        this.status = "closed";
    }
    open() {
        this.imageName = "cache_open";
        this.status = "open";
    }
    load(data) {
        this.cacheData = data.cacheData;
        this.position = data.position;
        this.cacheID = data.cacheID;
        this.imageName = data.imageName;
        this.status = data.status;
    }
}

(function (exports) {
    exports.Cache = Cache;
}(typeof exports === 'undefined' ? {} : exports));