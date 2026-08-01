sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "chocolatesexy/project/model/models"
], (UIComponent, JSONModel, models) => {
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

            var oAppModel = new JSONModel({
                loggedIn:  false,
                loggedOut: true
            });
            this.setModel(oAppModel, "app");

            var script = document.createElement("script");
            script.src = sap.ui.require.toUrl("chocolatesexy/project/utils/firebase.js");

            script.onload = function () {
                if (typeof window.loadFirebase === "function") {
                    window.loadFirebase().then(function (auth) {
                        auth.onAuthStateChanged(function (user) {
                            var bIn = !!(user && user.emailVerified);
                            oAppModel.setProperty("/loggedIn",  bIn);
                            oAppModel.setProperty("/loggedOut", !bIn);
                        });
                    }).catch(function (e) {
                        console.warn("[Component] Firebase no disponible:", e);
                    });
                }
            };

            document.head.appendChild(script);

            this.getRouter().initialize();
        }
    });
});