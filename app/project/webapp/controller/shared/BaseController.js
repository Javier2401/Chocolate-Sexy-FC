sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("chocolatesexy.project.controller.shared.BaseController", {

        onInit: function () {
            this.getOwnerComponent().getRouter();
            this._getAppModel();
        },

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        _getAppModel: function () {
            var oComponent = this.getOwnerComponent();
            var oModel = oComponent.getModel("app");

            if (!oModel) {
                oModel = new JSONModel({
                    loggedIn:  false,
                    loggedOut: true
                });
                oComponent.setModel(oModel, "app");

                this._attachFirebaseListener(oModel);
            }

            return oModel;
        },

        _attachFirebaseListener: function (oModel) {
            if (typeof window.loadFirebase !== "function") {
                console.warn("[BaseController] window.loadFirebase no disponible.");
                return;
            }

            window.loadFirebase().then(function (auth) {
                auth.onAuthStateChanged(function (user) {
                    var bIn = !!(user && user.emailVerified);
                    oModel.setProperty("/loggedIn",  bIn);
                    oModel.setProperty("/loggedOut", !bIn);
                });
            }).catch(function (e) {
                console.warn("[BaseController] Firebase no disponible:", e);
                oModel.setProperty("/loggedIn",  false);
                oModel.setProperty("/loggedOut", true);
            });
        },

        _setLoggedIn: function (bLoggedIn) {
            var oModel = this._getAppModel();
            oModel.setProperty("/loggedIn",  !!bLoggedIn);
            oModel.setProperty("/loggedOut", !bLoggedIn);
        },

        //  ENLACES EXTERNOS
        onOpenEmail:     function () { window.open("mailto:chocolatesexyoficial@gmail.com", "_self"); },
        onOpenInstagram: function () { window.open("https://www.instagram.com/chocolatesexyoficial/", "_blank"); },
        onOpenGitHub:    function () { window.open("https://github.com/Javier2401", "_blank"); },

        //  NAVEGACIONES GLOBALES
        onNavMain:          function () { this.getOwnerComponent().getRouter().navTo("RouteMain"); },
        onNavSquad:         function () { this.getOwnerComponent().getRouter().navTo("RouteSquad"); },
        onNavCalendar:      function () { this.getOwnerComponent().getRouter().navTo("RouteCalendar"); },
        onNavLeaderboard:   function () { this.getOwnerComponent().getRouter().navTo("RouteLeaderboard"); },
        onNavStats:         function () { this.getOwnerComponent().getRouter().navTo("RouteStats"); },
        onNavSurveys:       function () { this.getOwnerComponent().getRouter().navTo("RouteSurveys"); },
        onNavSettings:      function () { this.getOwnerComponent().getRouter().navTo("RouteSettings"); },
        onNavNews:          function () { this.getOwnerComponent().getRouter().navTo("RouteNews"); },
        onNavInfoSquad:     function () { this.getOwnerComponent().getRouter().navTo("RouteInfoSquadDetail"); },
        onNavProfile:       function () { this.getOwnerComponent().getRouter().navTo("RouteProfile"); },
        onNavPrivacyPolicy: function () { this.getOwnerComponent().getRouter().navTo("RoutePrivacyPolicy"); },
        onNavCookiePolicy:  function () { this.getOwnerComponent().getRouter().navTo("RouteCookiePolicy"); },
        onNavTermsOfUse:    function () { this.getOwnerComponent().getRouter().navTo("RouteTermsOfUse"); }
    });
});