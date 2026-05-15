sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController",
    "sap/m/ResponsivePopover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Bar",
    "sap/m/Title",
    "sap/m/Button",
    "sap/ui/core/HTML"
], function (BaseController, ResponsivePopover, List, StandardListItem, Bar, Title, Button, HTML) {
    "use strict";

    /* ─── Datos jugadores 2026/27 (top 8) ─────────────────────── */
    var aPlayers2627 = [
        { name: "SERGIO",        pj: 8,  g: 9,  a: 3 },
        { name: "PADI",          pj: 9,  g: 5,  a: 2 },
        { name: "ASI",           pj: 10, g: 4,  a: 3 },
        { name: "DAVID",         pj: 10, g: 3,  a: 4 },
        { name: "DRAGOS",        pj: 7,  g: 3,  a: 1 },
        { name: "JOSEDA",        pj: 4,  g: 2,  a: 1 },
        { name: "ÁLEX",          pj: 6,  g: 2,  a: 1 },
        { name: "CORDESINHO",    pj: 9,  g: 1,  a: 3 }
    ];

    /* ─── Datos jugadores 2025/26 (top 8) ─────────────────────── */
    var aPlayers2526 = [
        { name: "SERGIO",        pj: 15, g: 14, a: 5 },
        { name: "ASI",           pj: 20, g: 7,  a: 4 },
        { name: "DAVID",         pj: 22, g: 6,  a: 5 },
        { name: "PADI",          pj: 19, g: 7,  a: 2 },
        { name: "JOSEDA",        pj: 6,  g: 3,  a: 2 },
        { name: "DRAGOS",        pj: 12, g: 3,  a: 2 },
        { name: "CORDESINHO",    pj: 20, g: 1,  a: 2 },
        { name: "ÁLEX",          pj: 2,  g: 2,  a: 0 }
    ];

    /* ─── MVP por jornada 2026/27 ──────────────────────────────── */
    var aMvpJornadas2627 = {
        "SERGIO":  [1, 3, 5, 7, 8],
        "PADI":    [2, 4, 6],
        "ASI":     [9, 10]
    };

    /* ─── MVP por jornada 2025/26 ──────────────────────────────── */
    var aMvpJornadas2526 = {
        "SERGIO":  [1, 3, 5, 7, 9, 13, 17, 21],
        "ASI":     [2, 6, 11, 15],
        "DAVID":   [4, 8, 18],
        "PADI":    [10, 14]
    };

    /* ─── Datos de jornadas 2026/27 ────────────────────────────── */
    var aJornadas2627 = [
        { jornada: 1,  vs: "Real Madrid",       result: "3 - 1" },
        { jornada: 2,  vs: "Barcelona",          result: "1 - 2" },
        { jornada: 3,  vs: "Atlético Madrid",    result: "2 - 0" },
        { jornada: 4,  vs: "Sevilla FC",         result: "1 - 1" },
        { jornada: 5,  vs: "Valencia CF",        result: "4 - 0" },
        { jornada: 6,  vs: "Athletic Club",      result: "2 - 3" },
        { jornada: 7,  vs: "Real Sociedad",      result: "1 - 0" },
        { jornada: 8,  vs: "Villarreal CF",      result: "3 - 2" },
        { jornada: 9,  vs: "Real Betis",         result: "0 - 0" },
        { jornada: 10, vs: "Celta de Vigo",      result: "2 - 1" },
        { jornada: 11, vs: "Getafe CF",          result: "1 - 0" },
        { jornada: 12, vs: "Osasuna",            result: "3 - 0" },
        { jornada: 13, vs: "Girona FC",          result: "2 - 2" },
        { jornada: 14, vs: "Rayo Vallecano",     result: "1 - 3" },
        { jornada: 15, vs: "Espanyol",           result: "2 - 1" },
        { jornada: 16, vs: "Deportivo Alavés",   result: "0 - 1" },
        { jornada: 17, vs: "CD Leganés",         result: "4 - 1" },
        { jornada: 18, vs: "UD Las Palmas",      result: "3 - 0" },
        { jornada: 19, vs: "Real Valladolid",    result: "2 - 0" },
        { jornada: 20, vs: "RCD Mallorca",       result: "1 - 1" },
        { jornada: 21, vs: "Deportivo Coruña",   result: "3 - 2" },
        { jornada: 22, vs: "SD Eibar",           result: "2 - 0" }
    ];

    /* ─── Datos de jornadas 2025/26 ────────────────────────────── */
    var aJornadas2526 = [
        { jornada: 1,  vs: "Atlético Madrid",    result: "1 - 0" },
        { jornada: 2,  vs: "Real Madrid",        result: "0 - 2" },
        { jornada: 3,  vs: "Valencia CF",        result: "2 - 1" },
        { jornada: 4,  vs: "Barcelona",          result: "3 - 3" },
        { jornada: 5,  vs: "Sevilla FC",         result: "1 - 0" },
        { jornada: 6,  vs: "Real Sociedad",      result: "2 - 2" },
        { jornada: 7,  vs: "Villarreal CF",      result: "0 - 1" },
        { jornada: 8,  vs: "Celta de Vigo",      result: "3 - 0" },
        { jornada: 9,  vs: "Athletic Club",      result: "1 - 1" },
        { jornada: 10, vs: "Osasuna",            result: "4 - 2" },
        { jornada: 11, vs: "Getafe CF",          result: "2 - 0" },
        { jornada: 12, vs: "Real Betis",          result: "1 - 3" },
        { jornada: 13, vs: "Rayo Vallecano",     result: "2 - 1" },
        { jornada: 14, vs: "Girona FC",          result: "0 - 0" },
        { jornada: 15, vs: "Espanyol",           result: "3 - 1" },
        { jornada: 16, vs: "CD Leganés",         result: "2 - 2" },
        { jornada: 17, vs: "Deportivo Alavés",   result: "1 - 0" },
        { jornada: 18, vs: "RCD Mallorca",       result: "3 - 0" },
        { jornada: 19, vs: "Real Valladolid",    result: "2 - 1" },
        { jornada: 20, vs: "UD Las Palmas",      result: "1 - 2" },
        { jornada: 21, vs: "SD Eibar",           result: "4 - 0" },
        { jornada: 22, vs: "Deportivo Coruña",   result: "2 - 1" }
    ];

    /* ─── Helper: color del resultado ─────────────────────────── */
    function _getResultState(sResult) {
        var aParts = sResult.split(" - ");
        if (aParts.length !== 2) { return "None"; }
        var iG1 = parseInt(aParts[0]);
        var iG2 = parseInt(aParts[1]);
        if (iG1 > iG2) { return "Success"; }
        if (iG1 < iG2) { return "Error"; }
        return "Warning";
    }

    return BaseController.extend("chocolatesexy.project.controller.pages.Stats", {

        /* ═══════════════════════════════════════════════════
           INIT
        ═══════════════════════════════════════════════════ */
        onInit: function () {
            this._oJornadaPopover2627 = null;
            this._oJornadaPopover2526 = null;
            this._bStatsRendered = false;
        },

        onAfterRendering: function () {
            /* Sólo se renderiza una vez; evita trabajo extra en
               cada re-render parcial de SAP UI5 */
            if (this._bStatsRendered) { return; }
            this._bStatsRendered = true;
            this._renderStats("2627", aPlayers2627, aMvpJornadas2627);
            this._renderStats("2526", aPlayers2526, aMvpJornadas2526);
        },

        /* ═══════════════════════════════════════════════════
           RENDER — HTML puro (un único control en lugar de
           ~56 controles SAP por temporada → mucho más rápido)
        ═══════════════════════════════════════════════════ */
        _renderStats: function (sSeason, aPlayers, oMvpMap) {
            var oContainer = this.byId("statsRows" + sSeason);
            if (!oContainer) { return; }

            oContainer.destroyItems();

            /* ── Cabecera ── */
            var sHtml = '<div class="stTHead">'
                + '<div class="stTHPos">#</div>'
                + '<div class="stTHTeam">JUGADOR</div>'
                + '<div class="stTHNum">PJ</div>'
                + '<div class="stTHNum">G</div>'
                + '<div class="stTHNum">A</div>'
                + '<div class="stTHPts">G+A</div>'
                + '<div class="stTHMvp">MVP</div>'
                + '</div>';

            /* ── Filas ── */
            aPlayers.forEach(function (oP, i) {
                var aJornadas = oMvpMap[oP.name] || [];
                var sMvp = aJornadas.length > 0
                    ? aJornadas.map(function (j) {
                        return '<span class="stMvpStarBadge">★ J' + j + '</span>';
                      }).join("")
                    : '<span class="stMvpNoBadge">—</span>';

                var sRowClass = "stTRow"
                    + (i % 2 === 0 ? " stTRowEven" : " stTRowOdd")
                    + (i === aPlayers.length - 1 ? " stTRowLast" : "");

                sHtml += '<div class="' + sRowClass + '">'
                    + '<div class="stTDPos">' + (i + 1) + 'º</div>'
                    + '<div class="stTDTeam">' + oP.name + '</div>'
                    + '<div class="stTDNum">' + oP.pj + '</div>'
                    + '<div class="stTDNum">' + oP.g  + '</div>'
                    + '<div class="stTDNum">' + oP.a  + '</div>'
                    + '<div class="stTDPts">' + (oP.g + oP.a) + '</div>'
                    + '<div class="stTDMvp">' + sMvp + '</div>'
                    + '</div>';
            });

            oContainer.addItem(new HTML({ content: sHtml }));
        },

        /* ═══════════════════════════════════════════════════
           COLLAPSE / EXPAND
        ═══════════════════════════════════════════════════ */
        onToggleStats2627: function () {
            this._toggleCard("statsContent2627", "statsToggle2627");
        },

        onToggleStats2526: function () {
            this._toggleCard("statsContent2526", "statsToggle2526");
        },

        _toggleCard: function (sContentId, sBtnId) {
            var oContent = this.byId(sContentId);
            var oBtn     = this.byId(sBtnId);
            var bVisible = oContent.getVisible();
            oContent.setVisible(!bVisible);
            if (bVisible) {
                oBtn.addStyleClass("stCollapsed");
            } else {
                oBtn.removeStyleClass("stCollapsed");
            }
        },

        /* ═══════════════════════════════════════════════════
           POPOVER DE JORNADAS
        ═══════════════════════════════════════════════════ */
        onJornadaMenuOpen2627: function (oEvent) {
            if (!this._oJornadaPopover2627) {
                this._oJornadaPopover2627 = this._buildJornadaPopover("2627", aJornadas2627);
                this.getView().addDependent(this._oJornadaPopover2627);
            }
            this._oJornadaPopover2627.openBy(oEvent.getSource());
        },

        onJornadaMenuOpen2526: function (oEvent) {
            if (!this._oJornadaPopover2526) {
                this._oJornadaPopover2526 = this._buildJornadaPopover("2526", aJornadas2526);
                this.getView().addDependent(this._oJornadaPopover2526);
            }
            this._oJornadaPopover2526.openBy(oEvent.getSource());
        },

        _buildJornadaPopover: function (sSeason, aData) {
            var that = this;

            function applySelection(iJor, sVs, sRes) {
                var oBtn = that.byId("statsJornadaBtn" + sSeason);
                if (oBtn) { oBtn.setText("Jornada " + iJor); }
                var oLabel = that.byId("statsJornadaSelected" + sSeason);
                if (oLabel) { oLabel.setText("VS " + sVs + "   ·   " + sRes); }
                oPopover.close();
            }

            var oList = new List({
                mode: "SingleSelectMaster",
                showSeparators: "Inner",
                selectionChange: function (oEvent) {
                    var oItem = oEvent.getParameter("listItem");
                    if (!oItem) { return; }
                    applySelection(
                        oItem.data("jornada"),
                        oItem.data("vs"),
                        oItem.data("result")
                    );
                }
            });

            aData.forEach(function (oJ) {
                var oItem = new StandardListItem({
                    title:       "Jornada " + oJ.jornada,
                    description: "VS  " + oJ.vs,
                    info:        oJ.result,
                    infoState:   _getResultState(oJ.result),
                    type:        "Active",
                    press: function () {
                        applySelection(oJ.jornada, oJ.vs, oJ.result);
                    }
                }).addStyleClass("stJornadaItem");

                oItem.data("jornada", oJ.jornada);
                oItem.data("vs",      oJ.vs);
                oItem.data("result",  oJ.result);

                oList.addItem(oItem);
            });

            var oPopover = new ResponsivePopover({
                title: "Seleccionar Jornada",
                placement: "Bottom",
                showHeader: true,
                customHeader: new Bar({
                    contentMiddle: [
                        new Title({ text: "Seleccionar Jornada" })
                    ]
                }).addStyleClass("stJornadaPopoverHeader"),
                content: [oList],
                contentWidth: "320px",
                contentHeight: "340px",
                beginButton: new Button({
                    text: "Todas las jornadas",
                    type: "Emphasized",
                    press: function () {
                        var oBtnReset = that.byId("statsJornadaBtn" + sSeason);
                        if (oBtnReset) { oBtnReset.setText("JORNADA"); }
                        var oLabel = that.byId("statsJornadaSelected" + sSeason);
                        if (oLabel) { oLabel.setText("Todas las jornadas"); }
                        oList.removeSelections(true);
                        oPopover.close();
                    }
                }).addStyleClass("stJornadaAllBtn")
            }).addStyleClass("stJornadaPopover");

            return oPopover;
        }

    });
});