sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    var DAYS_SHORT   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    var MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

    return Controller.extend("chocolatesexy.project.controller.shared.BaseController", {

        onInit: function () {
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

        _enriquecer: function (p) {
            var sRes       = (p.resultado || "PENDIENTE").trim().toUpperCase();
            var bPendiente = sRes === "PENDIENTE";

            var bEsLocal = p.esLocal === true || p.esLocal === 1 ||
                           (p.esLocal != null && String(p.esLocal).toLowerCase() === "true");

            var sFechaText  = "Por confirmar";
            var sFechaCorta = "Por confirmar";
            var sHora       = "--:--";

            if (p.fecha) {
                var d       = new Date(p.fecha);
                sHora       = String(d.getHours()).padStart(2, "0") + ":" +
                              String(d.getMinutes()).padStart(2, "0");
                sFechaCorta = DAYS_SHORT[d.getDay()] + ", " + d.getDate() + " " +
                              MONTHS_SHORT[d.getMonth()];
                sFechaText  = sFechaCorta + " " + d.getFullYear() + " · " + sHora;
            }

            var sMarcador = bPendiente ? "- : -"
                          : bEsLocal  ? (p.golesRival    + " - " + p.golesNuestros)
                                      : (p.golesNuestros + " - " + p.golesRival);

            var aGolesNuestros = (p._golesArr || [])
                .slice()
                .sort(function (a, b) { return (a.minuto || 999) - (b.minuto || 999); })
                .map(function (g) {
                    return {
                        nombre:    g.jugador ? g.jugador.nombreCamiseta : "?",
                        minuto:    g.minuto  || 0,
                        esPenalti: !!g.esPenalti,
                        esPropio:  !!g.esPropio
                    };
                });

            var aGolesRival = (p._golesRivalArr || [])
                .slice()
                .sort(function (a, b) { return (a.minuto || 999) - (b.minuto || 999); })
                .map(function (g) {
                    return {
                        minuto:   g.minuto || 0,
                        esPropio: !!g.esPropio
                    };
                });

            var aTarjetas = (p._tarjetasArr || [])
                .slice()
                .sort(function (a, b) { return (a.minuto || 999) - (b.minuto || 999); })
                .map(function (t) {
                    return {
                        nombre: t.jugador ? t.jugador.nombreCamiseta : "?",
                        minuto: t.minuto  || 0,
                        tipo:   t.esRoja  ? "ROJA" : "AMARILLA"
                    };
                });

            return Object.assign({}, p, {
                resultado:       sRes,
                marcador:        sMarcador,
                fechaTexto:      sFechaText,
                fechaCorta:      sFechaCorta,
                hora:            sHora,
                rivalNombre:     p.equipo    ? p.equipo.nombre       : "",
                rivalIniciales:  p.equipo    ? p.equipo.iniciales    : "",
                ubicTxt:         p.campo     ? p.campo.nombreCampo   : "",
                campoEnlace:     p.campo     ? p.campo.enlaceCampo   : "",
                temporadaNombre: p.temporada ? p.temporada.temporada : "",
                esPendiente:     bPendiente,
                esVictoria:      sRes === "VICTORIA",
                esEmpate:        sRes === "EMPATE",
                esDerrota:       sRes === "DERROTA",
                esLocal:         bEsLocal,
                _golesNuestros:  aGolesNuestros,
                _golesRival:     aGolesRival,
                _tarjetas:       aTarjetas
            });
        },

        // ── Enlaces externos
        onOpenEmail:     function () { window.open("mailto:chocolatesexyoficial@gmail.com", "_self"); },
        onOpenInstagram: function () { window.open("https://www.instagram.com/chocolatesexyoficial/", "_blank"); },
        onOpenGitHub:    function () { window.open("https://github.com/Javier2401", "_blank"); },

        // ── Navegaciones globales
        onNavMain:          function () { this.getOwnerComponent().getRouter().navTo("RouteMain"); },
        onNavSquad:         function () { this.getOwnerComponent().getRouter().navTo("RouteSquad"); },
        onNavCalendar:      function () { this.getOwnerComponent().getRouter().navTo("RouteCalendar"); },
        onNavLeaderboard:   function () { this.getOwnerComponent().getRouter().navTo("RouteLeaderboard"); },
        onNavStats:         function () { this.getOwnerComponent().getRouter().navTo("RouteStats"); },
        onNavSurveys:       function () { this.getOwnerComponent().getRouter().navTo("RouteSurveys"); },
        onNavSettings:      function () { this.getOwnerComponent().getRouter().navTo("RouteSettings"); },
        onNavNews:          function () { this.getOwnerComponent().getRouter().navTo("RouteNews"); },
        onNavProfile:       function () { this.getOwnerComponent().getRouter().navTo("RouteProfile"); },
        onNavPrivacyPolicy: function () { this.getOwnerComponent().getRouter().navTo("RoutePrivacyPolicy"); },
        onNavCookiePolicy:  function () { this.getOwnerComponent().getRouter().navTo("RouteCookiePolicy"); },
        onNavTermsOfUse:    function () { this.getOwnerComponent().getRouter().navTo("RouteTermsOfUse"); }
    });
});