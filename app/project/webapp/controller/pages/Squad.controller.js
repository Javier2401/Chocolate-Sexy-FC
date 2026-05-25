sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("chocolatesexy.project.controller.pages.Squad", {

        onInit: function () {
            var oSquadModel = new JSONModel({
                entrenadores:    [],
                porteros:        [],
                defensas:        [],
                centrocampistas: [],
                delanteros:      []
            });
            this.getView().setModel(oSquadModel, "squad");

            this.getOwnerComponent().getModel()
                .bindList("/Jugadores")
                .requestContexts()
                .then(function (aContexts) {
                    var aJugadores = aContexts.map(function (oCtx) { return oCtx.getObject(); });
                    oSquadModel.setProperty("/entrenadores",    aJugadores.filter(function (j) { return j.posicion === "Entrenador"; }));
                    oSquadModel.setProperty("/porteros",        aJugadores.filter(function (j) { return j.posicion === "Portero"; }));
                    oSquadModel.setProperty("/defensas",        aJugadores.filter(function (j) { return j.posicion === "Defensa"; }));
                    oSquadModel.setProperty("/centrocampistas", aJugadores.filter(function (j) { return j.posicion === "Centrocampista"; }));
                    oSquadModel.setProperty("/delanteros",      aJugadores.filter(function (j) { return j.posicion === "Delantero"; }));
                });
        },

        _attachNavContainerScroll: function () {
            if (this._bNavAttached) { return; }

            var that = this;
            var oRootView = this.getOwnerComponent().getRootControl();
            if (!oRootView) { return; }

            var oNavContainer = null;
            var fnFind = function (oControl) {
                if (!oControl || !oControl.getMetadata) { return; }
                if (oControl.isA && oControl.isA("sap.m.NavContainer")) {
                    oNavContainer = oControl;
                    return;
                }
                var aAgg = oControl.getAggregation ? oControl.getAggregation("content") : null;
                if (Array.isArray(aAgg)) {
                    aAgg.forEach(fnFind);
                } else if (aAgg) {
                    fnFind(aAgg);
                }
                if (!oNavContainer) {
                    ["_page", "rootControl", "app"].forEach(function (sId) {
                        if (!oNavContainer) {
                            var o = oRootView.byId && oRootView.byId(sId);
                            if (o && o.isA && o.isA("sap.m.NavContainer")) {
                                oNavContainer = o;
                            }
                        }
                    });
                }
            };
            fnFind(oRootView);

            if (!oNavContainer) { return; }

            this._bNavAttached = true;
            oNavContainer.attachAfterNavigate(function (oEvent) {
                var oTo = oEvent.getParameter("to");
                if (oTo !== that.getView()) { return; }

                var iScroll = parseInt(sessionStorage.getItem("squadScroll") || "0", 10);
                if (iScroll <= 0) { return; }
                sessionStorage.removeItem("squadScroll");

                var oPage = that.byId("squadPage");
                if (!oPage) { return; }
                var oEl = oPage.$().find(".sapMScrollContScroll")[0];
                if (oEl) { oEl.scrollTop = iScroll; }
            }, this);
        },

        onAfterRendering: function () {
            this._attachNavContainerScroll();

            var that = this;
            this.getView().$().off("click.squad").on("click.squad", ".sqPlayerCard", function () {
                var oPage = that.byId("squadPage");
                var oEl = oPage ? oPage.$().find(".sapMScrollContScroll")[0] : null;
                sessionStorage.setItem("squadScroll", String(oEl ? oEl.scrollTop : 0));

                var $card    = $(this).hasClass("sqPlayerCard") ? $(this) : $(this).closest(".sqPlayerCard");
                var oControl = sap.ui.getCore().byId($card.attr("id"));
                if (!oControl) { return; }

                var oContext = oControl.getBindingContext("squad");
                if (!oContext) { return; }

                that.getOwnerComponent().getRouter().navTo("RouteInfoSquadDetail", {
                    jugadorId: String(oContext.getObject().id)
                });
            });
        }

    });
});