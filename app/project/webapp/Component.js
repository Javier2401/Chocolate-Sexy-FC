sap.ui.define([
    "sap/ui/core/UIComponent",
    "chocolatesexy/project/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("chocolatesexy.project.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(models.createDeviceModel(), "device");

            this.getRouter().initialize();
        }
    });
});