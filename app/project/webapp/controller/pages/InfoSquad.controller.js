sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("chocolatesexy.project.controller.pages.InfoSquad", {

        onInit: function () {
            var sModulePath = sap.ui.require.toUrl("chocolatesexy/project");
            this.getView().setModel(new JSONModel({
                id: null,
                nombreCamiseta: "",
                dorsal: "",
                nombre: "",
                apellidos: "",
                fechaNacimiento: "",
                piernaHabil: "",
                posicion: "",
                foto: "",
                camisetaImg: sModulePath + "/images/camiseta.png"
            }), "info");

            this.getView().setModel(new JSONModel({
                partidosJugados:   0,
                titularidades:     0,
                suplencias:        0,
                mvps:              0,
                goles:             0,
                asistencias:       0,
                golesPenalti:      0,
                golesPropio:       0,
                tarjetasAmarillas: 0,
                tarjetasRojas:     0,
                titularidadesPct:  "0%",
                rankGoles:            "-",
                rankAsistencias:      "-",
                rankGolesLabel:       "GOLEADOR",
                rankAsistenciasLabel: "ASISTENTE",
                rankGolesTotalLabel:  "",
                rankAsistTotalLabel:  "",
                totalJugadores:       0
            }), "stats");

            this.getOwnerComponent().getRouter()
                .getRoute("RouteInfoSquadDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sJugadorId = oEvent.getParameter("arguments").jugadorId;
            if (!sJugadorId) { return; }
            this._loadPlayer(parseInt(sJugadorId, 10));
        },

        _loadPlayer: function (iId) {
            var oODataModel = this.getOwnerComponent().getModel();
            var oInfoModel  = this.getView().getModel("info");
            var oStatsModel = this.getView().getModel("stats");

            oODataModel.bindContext("/Jugadores(" + iId + ")")
                .requestObject()
                .then(function (oJugador) {
                    var sModulePath = sap.ui.require.toUrl("chocolatesexy/project");
                    oJugador.camisetaImg = sModulePath + "/images/camiseta.png";
                    oInfoModel.setData(oJugador);
                })
                .catch(function (oErr) {
                    console.error("Error cargando jugador:", oErr);
                });

            oODataModel.bindList("/JornadaJugadores", null, null, [
                new Filter("jugadorId", FilterOperator.EQ, iId)
            ]).requestContexts().then(function (aContexts) {
                var aRows      = aContexts.map(function (c) { return c.getObject(); });
                var iJugados   = aRows.length;
                var iTitulares = aRows.filter(function (r) { return r.esTitular; }).length;

                oStatsModel.setProperty("/partidosJugados",  iJugados);
                oStatsModel.setProperty("/titularidades",    iTitulares);
                oStatsModel.setProperty("/suplencias",       iJugados - iTitulares);
                oStatsModel.setProperty("/mvps",             aRows.filter(function (r) { return r.esMVP; }).length);
                oStatsModel.setProperty("/titularidadesPct", iJugados > 0 ? Math.round((iTitulares / iJugados) * 100) + "%" : "0%");
            });

            oODataModel.bindList("/Goles", null, null, [
                new Filter("jugadorId", FilterOperator.EQ, iId)
            ]).requestContexts().then(function (aContexts) {
                var aGoles = aContexts.map(function (c) { return c.getObject(); });
                var aGolesAFavor = aGoles.filter(function (g) { return !g.esPropio; });
                oStatsModel.setProperty("/goles",        aGolesAFavor.length);
                oStatsModel.setProperty("/golesPenalti", aGolesAFavor.filter(function (g) { return g.esPenalti; }).length);
                oStatsModel.setProperty("/golesPropio",  aGoles.filter(function (g) { return g.esPropio; }).length);
            });

            oODataModel.bindList("/Goles", null, null, [
                new Filter("asistenciaJugadorId", FilterOperator.EQ, iId)
            ]).requestContexts().then(function (aContexts) {
                var aAsist = aContexts.map(function (c) { return c.getObject(); });
                oStatsModel.setProperty("/asistencias", aAsist.filter(function (g) { return !g.esPropio; }).length);
            });

            oODataModel.bindList("/Tarjetas", null, null, [
                new Filter("jugadorId", FilterOperator.EQ, iId)
            ]).requestContexts().then(function (aContexts) {
                var aTarjetas = aContexts.map(function (c) { return c.getObject(); });
                oStatsModel.setProperty("/tarjetasAmarillas", aTarjetas.filter(function (t) { return t.esAmarilla; }).length);
                oStatsModel.setProperty("/tarjetasRojas",     aTarjetas.filter(function (t) { return t.esRoja;     }).length);
            });

            this._loadRankings(iId);
        },

        _loadRankings: function (iId) {
            var oODataModel = this.getOwnerComponent().getModel();
            var oStatsModel = this.getView().getModel("stats");

            var oFilterNoEntrenador = new Filter("posicion", FilterOperator.NE, "Entrenador");

            var pJugadores = oODataModel.bindList("/Jugadores", null, null, [oFilterNoEntrenador])
                .requestContexts(0, 10000).then(function (aCtx) {
                    return aCtx.map(function (c) { return c.getObject(); });
                });

            var pGoles = oODataModel.bindList("/Goles")
                .requestContexts(0, 10000).then(function (aCtx) {
                    return aCtx.map(function (c) { return c.getObject(); });
                });

            var pJornadas = oODataModel.bindList("/JornadaJugadores")
                .requestContexts(0, 10000).then(function (aCtx) {
                    return aCtx.map(function (c) { return c.getObject(); });
                });

            Promise.all([pJugadores, pGoles, pJornadas]).then(function (aResults) {
                var aJugadores = aResults[0];
                var aGoles     = aResults[1];
                var aJornadas  = aResults[2];
                var iTotal     = aJugadores.length;

                var mPJ      = {};
                var mTitular = {};
                aJornadas.forEach(function (j) {
                    if (j.jugadorId != null) {
                        var sJugId = String(j.jugadorId);
                        mPJ[sJugId] = (mPJ[sJugId] || 0) + 1;
                        if (j.esTitular) {
                            mTitular[sJugId] = (mTitular[sJugId] || 0) + 1;
                        }
                    }
                });
                console.log("[Ranking] PJ por jugador:", JSON.stringify(mPJ));
                console.log("[Ranking] Titularidades por jugador:", JSON.stringify(mTitular));

                var mGoles = {};
                aGoles.forEach(function (g) {
                    if (g.jugadorId != null && !g.esPropio) {
                        var sJugId = String(g.jugadorId);
                        mGoles[sJugId] = (mGoles[sJugId] || 0) + 1;
                    }
                });

                var mAsist = {};
                aGoles.forEach(function (g) {
                    if (g.asistenciaJugadorId != null && !g.esPropio) {
                        var sAsistId = String(g.asistenciaJugadorId);
                        mAsist[sAsistId] = (mAsist[sAsistId] || 0) + 1;
                    }
                });

                function makeSortFn(mStat) {
                    return function (a, b) {
                        var aId = String(a.id);
                        var bId = String(b.id);

                        var dStat = (mStat[bId] || 0) - (mStat[aId] || 0);
                        if (dStat !== 0) { return dStat; }

                        var dPJ = (mPJ[aId] || 0) - (mPJ[bId] || 0);
                        if (dPJ !== 0) { return dPJ; }

                        return (mTitular[aId] || 0) - (mTitular[bId] || 0);
                    };
                }

                var aSortedGoles = aJugadores.slice().sort(makeSortFn(mGoles));
                var iRankGoles   = aSortedGoles.findIndex(function (j) { return String(j.id) === String(iId); }) + 1;

                var aSortedAsist = aJugadores.slice().sort(makeSortFn(mAsist));
                var iRankAsist   = aSortedAsist.findIndex(function (j) { return String(j.id) === String(iId); }) + 1;

                oStatsModel.setProperty("/rankGoles",            iRankGoles > 0 ? "TOP " + iRankGoles : "-");
                oStatsModel.setProperty("/rankAsistencias",      iRankAsist > 0 ? "TOP " + iRankAsist : "-");
                oStatsModel.setProperty("/rankGolesLabel",        "GOLEADOR");
                oStatsModel.setProperty("/rankAsistenciasLabel",  "ASISTENTE");
                oStatsModel.setProperty("/rankGolesTotalLabel",   "GOLEADOR DE " + iTotal);
                oStatsModel.setProperty("/rankAsistTotalLabel",   "ASISTENTE DE " + iTotal);
                oStatsModel.setProperty("/totalJugadores",        iTotal);
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteSquad");
        },

        formatFullName: function (sNombre, sApellidos) {
            return (sNombre || "") + " " + (sApellidos || "");
        },

        formatRatioLegend: function (iValue, sLabel) {
            return (iValue || 0) + " " + (sLabel || "");
        }

    });
});