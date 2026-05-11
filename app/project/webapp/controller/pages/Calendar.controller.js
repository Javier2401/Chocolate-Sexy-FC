sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("chocolatesexy.project.controller.pages.Calendar", {

        onInit: function () {

        },

        onToggleSeasonBlock: function(oEvent) {
            var oButton      = oEvent.getSource();
            var oSeasonBlock = oButton.getParent().getParent();
            var oContent     = oSeasonBlock.getItems()[1];
            var oDomRef      = oContent.getDomRef();

            if (!oDomRef) return;

            var bCollapsed = oDomRef.classList.contains("cal-collapsed");
            oDomRef.classList.toggle("cal-collapsed");

            oButton.setIcon(
                bCollapsed
                    ? "sap-icon://navigation-up-arrow"
                    : "sap-icon://navigation-down-arrow"
            );
        }

    });
});