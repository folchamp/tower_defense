"use strict";

class RolesManager {
    constructor() {

    }
    displayRolesChoice(data) {
        this.roles = data.roles;
        alert(this.roles);
    }
}