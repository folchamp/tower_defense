"use strict";

class RolesManager {
    constructor() {
        Util.quickStructure(
            ["rolesPopupContainer",
                ["rolesChoiceContainer",
                    "rolesTitleText"
                ]
            ],
            document.body,
            this
        );
    }
    displayRolesChoice(data) {
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
            this.roleTitleText.innerHTML = role.role;
            this.roleFirstAbilityText.innerHTML = `- ${role.firstAbility}`;
            this.roleSecondAbilityText.innerHTML = `- ${role.secondAbility}`;
            this.roleContainer.addEventListener("click", (data) => {
                Util.hide(this.rolesPopupContainer);
            });
        })
        console.log("roles : ");
        console.log(this.roles);
    }
}
