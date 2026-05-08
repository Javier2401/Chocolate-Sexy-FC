sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("chocolatesexy.project.controller.shared.BaseController", {

        onInit: function () {

        },


        onOpenEmail: function () { window.open("mailto:chocolatesexyoficial@gmail.com", "_self"); },
        onOpenInstagram: function () { window.open("https://www.instagram.com/chocolatesexyoficial/", "_blank"); },
        onOpenGitHub: function () { window.open("https://github.com/Javier2401", "_blank"); },

        onNavMain: function () { this.getOwnerComponent().getRouter().navTo("RouteMain"); },
        onNavCalendar: function () { this.getOwnerComponent().getRouter().navTo("RouteCalendar"); },
        onNavPrivacyPolicy: function () { this.getOwnerComponent().getRouter().navTo("RoutePrivacyPolicy"); },
        onNavCookiePolicy: function () { this.getOwnerComponent().getRouter().navTo("RouteCookiePolicy"); },
        onNavTermsOfUse: function () { this.getOwnerComponent().getRouter().navTo("RouteTermsOfUse"); }
    });
});