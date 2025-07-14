"use strict";

class RolesManager {
    constructor() {

    }
    displayRolesChoice(data) {
        this.roles = data.roles;
        console.log("roles : ");
        console.log(this.roles);
    }
}