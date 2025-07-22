"use strict";

class RolesManager {
    constructor(callback) {
        this.callback = callback;
        Util.quickStructure(
            ["rolesPopupContainer",
                ["rolesChoiceContainer",
                    "rolesTitleText"
                ]
            ],
            document.body,
            this
        );
        Util.hide(this.rolesPopupContainer);
    }
    displayRolesChoice(data) {
        Util.emptyElement(this.rolesChoiceContainer);
        Util.show(this.rolesPopupContainer);
        this.roles = data.roles;
        this.roles.forEach((role) => {
            Util.quickStructure(
                ["roleContainer",
                    "roleTitleText",
                    ["roleDescriptionContainer",
                        "roleFirstAbilityText",
                        "roleSecondAbilityText"
                    ]
                ],
                this.rolesChoiceContainer,
                this
            );
            this.rolesTitleText.innerHTML = "Choisissez votre rôle";
            this.roleTitleText.innerHTML = role.roleName;
            this.roleFirstAbilityText.innerHTML = `- ${role.firstAbility}`;
            this.roleSecondAbilityText.innerHTML = `- ${role.secondAbility}`;
            this.roleContainer.addEventListener("click", (data) => {
                Util.hide(this.rolesPopupContainer);
                this.callback(role.roleID, role);
            });
        })
        console.log("roles : ");
        console.log(this.roles);
    }
}
