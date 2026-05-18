sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    var DAYS_SHORT   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    var MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    var MONTHS_FULL  = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

    var _aCalState = [];

    return BaseController.extend("chocolatesexy.project.controller.pages.Calendar", {

        onInit: function () {
            var that = this;

            this.getView().setModel(new JSONModel({
                ultimoPartido:  null,
                proximoPartido: null,
                partidos2526:   [],
                partidos2627:   [],
                hayUltimo:      false,
                hayProximo:     false
            }), "cal");

            fetch("/odata/v4/football/Jornadas?$expand=temporada,equipo,campo&$orderby=temporadaId%20desc,jornada%20asc")
                .then(function (r) { return r.json(); })
                .then(function (data) { that._procesarDatos(data.value); })
                .catch(function (e) { console.error("Error cargando Jornadas:", e); });

            this.getView().addEventDelegate({
                onAfterRendering: this._renderAllMiniCalendars.bind(this)
            });
        },

        _procesarDatos: function (aPartidos) {
            var that = this;
            var aEnr = aPartidos.map(function (p) { return that._enriquecer(p); });

            var aJugados    = aEnr.filter(function (p) { return !p.esPendiente; });
            var aPendientes = aEnr.filter(function (p) { return  p.esPendiente; });

            var a2526 = aEnr.filter(function (p) { return p.temporadaId === 1; });
            var a2627 = aEnr.filter(function (p) { return p.temporadaId === 2; });

            this.getView().getModel("cal").setData({
                ultimoPartido:   aJugados.length   ? aJugados[aJugados.length - 1] : null,
                proximoPartido:  aPendientes.length ? aPendientes[0]                : null,
                hayUltimo:       !!aJugados.length,
                hayProximo:      !!aPendientes.length,
                partidos2526:    this._flatList(a2526),
                partidos2627:    this._flatList(a2627),
                hayPartidos2526: a2526.length > 0,
                hayPartidos2627: a2627.length > 0
            });

            setTimeout(function () { that._renderAllMiniCalendars(); }, 200);
        },

        _flatList: function (aPartidos) {
            var aResult = [];
            var sLastKey = null;
            aPartidos.forEach(function (p) {
                var sKey, sLabel;
                if (p.fecha) {
                    var d = new Date(p.fecha);
                    sKey   = d.getFullYear() + "-" + d.getMonth();
                    sLabel = MONTHS_FULL[d.getMonth()] + " " + d.getFullYear();
                } else {
                    sKey   = "sf";
                    sLabel = "Fecha por confirmar";
                }
                if (sKey !== sLastKey) {
                    aResult.push({ isHeader: true, mesLabel: sLabel });
                    sLastKey = sKey;
                }
                aResult.push(Object.assign({}, p, { isHeader: false }));
            });
            return aResult;
        },

        _enriquecer: function (p) {
            var sRes       = (p.resultado || "PENDIENTE").trim().toUpperCase();
            var bPendiente = sRes === "PENDIENTE";

            var sFechaText  = "Por confirmar";
            var sFechaCorta = "Por confirmar";
            var sHora       = "--:--";

            if (p.fecha) {
                var d    = new Date(p.fecha);
                sHora    = String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
                sFechaCorta = DAYS_SHORT[d.getDay()] + ", " + d.getDate() + " " + MONTHS_SHORT[d.getMonth()];
                sFechaText  = sFechaCorta + " " + d.getFullYear() + " · " + sHora;
            }

            return Object.assign({}, p, {
                resultado:      sRes,
                marcador:       bPendiente ? "- : -" : (p.golesNuestros + " - " + p.golesRival),
                fechaTexto:     sFechaText,
                fechaCorta:     sFechaCorta,
                hora:           sHora,
                rivalNombre:    p.equipo  ? p.equipo.nombre    : "",
                rivalIniciales: p.equipo  ? p.equipo.iniciales : "",
                ubicTxt:        p.campo   ? p.campo.nombreCampo : "",
                campoEnlace:    p.campo   ? p.campo.enlaceCampo : "",
                temporadaNombre:p.temporada ? p.temporada.temporada : "",
                esPendiente:    bPendiente,
                esVictoria:     sRes === "VICTORIA",
                esEmpate:       sRes === "EMPATE",
                esDerrota:      sRes === "DERROTA",
                hayMvp:         !!p.mvpNombre,
                hayStats:       p.posesion != null,
                posesionTxt:    (p.posesion || 0) + "%",
                esLocal:        !!p.esLocal,
                teamsRowClass:  p.esLocal ? "calTeamsLocal" : ""
            });
        },

        onToggleSeasonBlock: function (oEvent) {
            var oButton      = oEvent.getSource();
            var oSeasonBlock = oButton.getParent().getParent();
            var oDomContent  = oSeasonBlock.getItems()[1].getDomRef();
            if (!oDomContent) { return; }

            var bWasCollapsed = oDomContent.classList.contains("cal-collapsed");
            oDomContent.classList.toggle("cal-collapsed");
            oButton.setIcon(bWasCollapsed ? "sap-icon://navigation-up-arrow" : "sap-icon://navigation-down-arrow");

            var oViewDom = this.getView().getDomRef();
            if (oViewDom) {
                var aBlocks  = Array.from(oViewDom.querySelectorAll(".calMidCol .calSeasonBlock"));
                var aPanels  = Array.from(oViewDom.querySelectorAll(".calRightCol .calMiniCalsPanel"));
                var iIdx     = aBlocks.indexOf(oSeasonBlock.getDomRef());
                if (iIdx !== -1 && aPanels[iIdx]) {
                    aPanels[iIdx].classList.toggle("cal-mini-collapsed", !bWasCollapsed);
                }
            }
        },

        _renderAllMiniCalendars: function () {
            var oViewDom = this.getView().getDomRef();
            if (!oViewDom) { return; }
            _aCalState = [];

            var aSeasonBlocks = Array.from(oViewDom.querySelectorAll(".calMidCol .calSeasonBlock"));
            var aMiniPanels   = Array.from(oViewDom.querySelectorAll(".calRightCol .calMiniCalsPanel"));

            aSeasonBlocks.forEach(function (oDomBlock, iPanelIdx) {
                var oDomContent   = oDomBlock.querySelector(".calSeasonContent");
                var oDomMiniPanel = aMiniPanels[iPanelIdx];
                if (!oDomContent || !oDomMiniPanel) { return; }

                var aMatches  = this._parseMatchesFromDOM(oDomContent);
                var oMonthMap = {};
                aMatches.forEach(function (m) {
                    var sKey = m.year + "-" + String(m.month).padStart(2,"0");
                    if (!oMonthMap[sKey]) { oMonthMap[sKey] = { year: m.year, month: m.month, matches: [] }; }
                    oMonthMap[sKey].matches.push(m);
                });

                var aSorted = Object.values(oMonthMap).sort(function (a, b) {
                    return a.year !== b.year ? a.year - b.year : a.month - b.month;
                });
                if (!aSorted.length) { return; }

                _aCalState[iPanelIdx] = { months: aSorted, currentIdx: 0 };
                this._renderWidget(oDomMiniPanel, oDomContent, iPanelIdx);
            }.bind(this));
        },

        _renderWidget: function (oDomMiniPanel, oDomContent, iPanelIdx) {
            var oState = _aCalState[iPanelIdx];
            var oData  = oState.months[oState.currentIdx];
            var bFirst = oState.currentIdx === 0;
            var bLast  = oState.currentIdx === oState.months.length - 1;

            oDomMiniPanel.innerHTML =
                "<div class='calMiniWidget'>" +
                "<div class='calMiniWidgetHeader'><span class='calMiniWidgetIcon'>◷</span><span class='calMiniWidgetTitle'>Calendario</span></div>" +
                "<div class='calMiniWidgetBody'>" +
                "<div class='calMiniNav'>" +
                "<button class='calMiniNavBtn" + (bFirst ? " calMiniNavBtnDisabled" : "") + "' data-panel-idx='" + iPanelIdx + "' data-dir='-1'" + (bFirst ? " disabled" : "") + ">&#8249;</button>" +
                "<span class='calMiniNavLabel'>" + MONTHS_FULL[oData.month] + " " + oData.year + "</span>" +
                "<button class='calMiniNavBtn" + (bLast ? " calMiniNavBtnDisabled" : "") + "' data-panel-idx='" + iPanelIdx + "' data-dir='1'" + (bLast ? " disabled" : "") + ">&#8250;</button>" +
                "</div>" +
                "<div class='calMiniCalGrid'>" + this._buildCalendarHTML(oData) + "</div>" +
                "<div class='calMiniLegend'>" +
                "<div class='calMiniLegendItem'><span class='cmcDot cmcVictoria'></span>Victoria</div>" +
                "<div class='calMiniLegendItem'><span class='cmcDot cmcEmpate'></span>Empate</div>" +
                "<div class='calMiniLegendItem'><span class='cmcDot cmcDerrota'></span>Derrota</div>" +
                "<div class='calMiniLegendItem'><span class='cmcDot cmcPendiente'></span>Pendiente</div>" +
                "</div></div></div>";

            oDomMiniPanel.querySelectorAll(".calMiniNavBtn").forEach(function (oBtn) {
                if (oBtn.disabled) { return; }
                oBtn.addEventListener("click", function () {
                    _aCalState[parseInt(oBtn.dataset.panelIdx)].currentIdx += parseInt(oBtn.dataset.dir);
                    this._renderWidget(oDomMiniPanel, oDomContent, parseInt(oBtn.dataset.panelIdx));
                }.bind(this));
            }.bind(this));

            var aCards = Array.from(oDomContent.querySelectorAll(".calMatchCard"));
            oDomMiniPanel.querySelectorAll("[data-card-idx]").forEach(function (oEl) {
                oEl.addEventListener("click", function () {
                    var oCard = aCards[parseInt(oEl.dataset.cardIdx)];
                    if (!oCard) { return; }
                    oCard.scrollIntoView({ behavior: "smooth", block: "center" });
                    oCard.classList.add("calMatchHighlight");
                    setTimeout(function () { oCard.classList.remove("calMatchHighlight"); }, 1800);
                });
            });
        },

        _buildCalendarHTML: function (oData) {
            var oByDay = {};
            oData.matches.forEach(function (m) { oByDay[m.day] = m; });
            var iRawFirst    = new Date(oData.year, oData.month, 1).getDay();
            var iOffset      = iRawFirst === 0 ? 6 : iRawFirst - 1;
            var iDaysInMonth = new Date(oData.year, oData.month + 1, 0).getDate();

            var s = ["L","M","X","J","V","S","D"].map(function (d) { return "<div class='cmcDh'>" + d + "</div>"; }).join("");
            for (var e = 0; e < iOffset; e++) { s += "<div class='cmcDc'></div>"; }
            for (var d = 1; d <= iDaysInMonth; d++) {
                var iDow = new Date(oData.year, oData.month, d).getDay();
                var oM   = oByDay[d];
                if (oM) {
                    s += "<div class='cmcDc cmcMatch " + this._resultClass(oM.result) + "' data-card-idx='" + oM.cardIdx + "' title='J" + oM.jornada + " · " + oM.result + " – ver partido'>J" + oM.jornada + "</div>";
                } else if (iDow === 0) {
                    s += "<div class='cmcDc cmcSun'>" + d + "</div>";
                } else {
                    s += "<div class='cmcDc'>" + d + "</div>";
                }
            }
            return s;
        },

        _parseMatchesFromDOM: function (oDomContent) {
            var aResult = [];
            Array.from(oDomContent.querySelectorAll(".calMatchCard")).forEach(function (oDomCard, iIdx) {
                var oJEl   = oDomCard.querySelector(".calJornada");
                var oBEl   = oDomCard.querySelector(".calBadge");
                var aInfos = oDomCard.querySelectorAll(".calInfoText");
                if (!oJEl || !aInfos.length) { return; }
                var iJornada = this._parseJornada(oJEl.textContent || "");
                var oDate    = this._parseMatchDate(aInfos[0].textContent || "");
                var sResult  = oBEl ? (oBEl.textContent || "PENDIENTE").trim() : "PENDIENTE";
                if (!oDate || !iJornada) { return; }
                aResult.push({ day: oDate.day, month: oDate.month, year: oDate.year, jornada: iJornada, result: sResult, cardIdx: iIdx });
            }.bind(this));
            return aResult;
        },

        _resultClass: function (s) {
            s = (s || "").toUpperCase();
            if (s === "VICTORIA") { return "cmcVictoria"; }
            if (s === "EMPATE")   { return "cmcEmpate"; }
            if (s === "DERROTA")  { return "cmcDerrota"; }
            return "cmcPendiente";
        },

        _parseJornada: function (s) {
            var m = s.match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
        },

        _parseMatchDate: function (sText) {
            try {
                var sPart  = sText.split("·")[0].trim();
                var sAfter = sPart.split(",")[1].trim();
                var aParts = sAfter.split(/\s+/);
                var iDay   = parseInt(aParts[0], 10);
                var iMonth = MONTHS_SHORT.indexOf(aParts[1]);
                var iYear  = parseInt(aParts[2], 10);
                if (isNaN(iDay) || iMonth === -1 || isNaN(iYear)) { return null; }
                return { day: iDay, month: iMonth, year: iYear };
            } catch (e) { return null; }
        }
    });
});