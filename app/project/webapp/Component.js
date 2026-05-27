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

            // ── Modelo "app" ────────────────────────────────────────────
            // Se crea AQUÍ, antes de inicializar el router y las vistas,
            // para que los bindings {app>/loggedIn} y {app>/loggedOut}
            // del Header fragment siempre encuentren el modelo y nunca
            // se resuelvan a `true` por defecto (lo que causaba que los
            // dos botones aparecieran a la vez al abrir la pestaña).
            //
            // Estado inicial seguro → solo "Registrarse" visible.
            var oAppModel = new JSONModel({
                loggedIn:  false,
                loggedOut: true
            });
            this.setModel(oAppModel, "app");

            // ── Script Firebase ─────────────────────────────────────────
            var script = document.createElement("script");
            script.src = sap.ui.require.toUrl("chocolatesexy/project/utils/firebase.js");

            // Cuando Firebase cargue, enganchamos el listener de sesión.
            // onAuthStateChanged se dispara al arrancar (restaura sesión
            // de localStorage) y en cada login/logout desde cualquier vista.
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