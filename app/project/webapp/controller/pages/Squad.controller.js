sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("chocolatesexy.project.controller.pages.Squad", {

        onInit: function () {
            var oSquadModel = new JSONModel({
                entrenadores: [],
                porteros: [],
                defensas: [],
                centrocampistas: [],
                delanteros: []
            });
            this.getView().setModel(oSquadModel, "squad");

            var oODataModel = this.getOwnerComponent().getModel();
            oODataModel.bindList("/Jugadores").requestContexts().then(function (aContexts) {
                var aJugadores = aContexts.map(function (oCtx) {
                    return oCtx.getObject();
                });

                oSquadModel.setProperty("/entrenadores",    aJugadores.filter(function(j){ return j.posicion === "Entrenador"; }));
                oSquadModel.setProperty("/porteros",        aJugadores.filter(function(j){ return j.posicion === "Portero"; }));
                oSquadModel.setProperty("/defensas",        aJugadores.filter(function(j){ return j.posicion === "Defensa"; }));
                oSquadModel.setProperty("/centrocampistas", aJugadores.filter(function(j){ return j.posicion === "Centrocampista"; }));
                oSquadModel.setProperty("/delanteros",      aJugadores.filter(function(j){ return j.posicion === "Delantero"; }));
            });
        }

    });
});