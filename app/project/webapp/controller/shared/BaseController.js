sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("chocolatesexy.project.controller.shared.BaseController", {

        onInit: function () {

        },

        // Enlaces externos
        onOpenEmail: function () { window.open("mailto:chocolatesexyoficial@gmail.com", "_self"); },
        onOpenInstagram: function () { window.open("https://www.instagram.com/chocolatesexyoficial/", "_blank"); },
        onOpenGitHub: function () { window.open("https://github.com/Javier2401", "_blank"); },

        // Navegaciones globales
        onNavMain: function () { this.getOwnerComponent().getRouter().navTo("RouteMain"); },
        onNavSquad: function () { this.getOwnerComponent().getRouter().navTo("RouteSquad"); },
        onNavCalendar: function () { this.getOwnerComponent().getRouter().navTo("RouteCalendar"); },
        onNavLeaderboard: function () { this.getOwnerComponent().getRouter().navTo("RouteLeaderboard"); },
        onNavStats: function () { this.getOwnerComponent().getRouter().navTo("RouteStats"); },
        onNavSurveys: function () { this.getOwnerComponent().getRouter().navTo("RouteSurveys"); },
        onNavSettings: function () { this.getOwnerComponent().getRouter().navTo("RouteSettings"); },
        onNavProfile: function () { this.getOwnerComponent().getRouter().navTo("RouteProfile"); },
        onNavPrivacyPolicy: function () { this.getOwnerComponent().getRouter().navTo("RoutePrivacyPolicy"); },
        onNavCookiePolicy: function () { this.getOwnerComponent().getRouter().navTo("RouteCookiePolicy"); },
        onNavTermsOfUse: function () { this.getOwnerComponent().getRouter().navTo("RouteTermsOfUse"); },
    });
});