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
    var _a2526Enr  = [];
    var _a2627Enr  = [];
    var _oUltimoPartidoEnr = null;

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

            Promise.all([
                fetch("/odata/v4/football/Jornadas?$expand=temporada,equipo,campo&$orderby=temporadaId%20desc,jornada%20asc").then(function (r) { return r.json(); }),
                fetch("/odata/v4/football/Goles?$expand=jugador").then(function (r) { return r.json(); }),
                fetch("/odata/v4/football/GolesRival").then(function (r) { return r.json(); }),
                fetch("/odata/v4/football/Tarjetas?$expand=jugador").then(function (r) { return r.json(); })
            ])
                .then(function (aResults) {
                    that._procesarDatos(
                        aResults[0].value || [],
                        aResults[1].value || [],
                        aResults[2].value || [],
                        aResults[3].value || []
                    );
                })
                .catch(function (e) { console.error("Error cargando Jornadas:", e); });

            this.getView().addEventDelegate({
                onAfterRendering: function () {
                    this._renderAllMiniCalendars();
                    this._renderEventosEnCards();
                }.bind(this)
            });
        },

        _procesarDatos: function (aPartidos, aGoles, aGolesRival, aTarjetas) {
            var that = this;

            var oGolesMap      = {};
            var oGolesRivalMap = {};
            var oTarjetasMap   = {};
            (aGoles || []).forEach(function (g) {
                if (!oGolesMap[g.jornadaId]) { oGolesMap[g.jornadaId] = []; }
                oGolesMap[g.jornadaId].push(g);
            });
            (aGolesRival || []).forEach(function (g) {
                if (!oGolesRivalMap[g.jornadaId]) { oGolesRivalMap[g.jornadaId] = []; }
                oGolesRivalMap[g.jornadaId].push(g);
            });
            (aTarjetas || []).forEach(function (t) {
                if (!oTarjetasMap[t.jornadaId]) { oTarjetasMap[t.jornadaId] = []; }
                oTarjetasMap[t.jornadaId].push(t);
            });

            var aEnr = aPartidos.map(function (p) {
                var pConDatos = Object.assign({}, p, {
                    _golesArr:      oGolesMap[p.id]      || [],
                    _golesRivalArr: oGolesRivalMap[p.id] || [],
                    _tarjetasArr:   oTarjetasMap[p.id]   || []
                });
                return that._enriquecer(pConDatos);
            });

            var aJugados    = aEnr.filter(function (p) { return !p.esPendiente; });
            var aPendientes = aEnr.filter(function (p) { return  p.esPendiente; });

            _oUltimoPartidoEnr = aJugados.length ? aJugados[aJugados.length - 1] : null;

            var a2526 = aEnr.filter(function (p) { return p.temporadaId === 1; });
            var a2627 = aEnr.filter(function (p) { return p.temporadaId === 2; });

            _a2526Enr = a2526;
            _a2627Enr = a2627;

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

            setTimeout(function () {
                that._renderAllMiniCalendars();
                that._renderEventosEnCards();
            }, 200);
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

            var bEsLocal = p.esLocal === true || p.esLocal === 1 ||
                           (p.esLocal != null && String(p.esLocal).toLowerCase() === "true");

            var sFechaText  = "Por confirmar";
            var sFechaCorta = "Por confirmar";
            var sHora       = "--:--";

            if (p.fecha) {
                var d    = new Date(p.fecha);
                sHora    = String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
                sFechaCorta = DAYS_SHORT[d.getDay()] + ", " + d.getDate() + " " + MONTHS_SHORT[d.getMonth()];
                sFechaText  = sFechaCorta + " " + d.getFullYear() + " · " + sHora;
            }

            var sMarcador = bPendiente ? "- : -"
                          : bEsLocal  ? (p.golesRival + " - " + p.golesNuestros)
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
                        tipo:   (t.tipo   || "AMARILLA").toUpperCase()
                    };
                });

            return Object.assign({}, p, {
                resultado:      sRes,
                marcador:       sMarcador,
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
                posesionTexto:  (p.posesion || 0) + "%",
                esLocal:        bEsLocal,
                _golesNuestros: aGolesNuestros,
                _golesRival:    aGolesRival,
                _tarjetas:      aTarjetas
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

        _renderEventosEnCards: function () {
            var oViewDom = this.getView().getDomRef();
            if (!oViewDom) { return; }

            var oDomUltimo = oViewDom.querySelector(".calUltimoGolesZone");
            if (oDomUltimo && _oUltimoPartidoEnr) {
                this._injectEventosHTML(oDomUltimo, _oUltimoPartidoEnr);
            }

            var aSeasonBlocks = Array.from(oViewDom.querySelectorAll(".calMidCol .calSeasonBlock"));
            var aSeasonData   = [_a2627Enr, _a2526Enr];

            aSeasonBlocks.forEach(function (oDomBlock, iSeasonIdx) {
                var aCards    = Array.from(oDomBlock.querySelectorAll(".calMatchCard"));
                var aPartidos = aSeasonData[iSeasonIdx] || [];
                aCards.forEach(function (oDomCard, iCardIdx) {
                    var oPartido = aPartidos[iCardIdx];
                    if (!oPartido) { return; }

                    var oDomTarjZone = oDomCard.querySelector(".calTarjetasZone");
                    if (oDomTarjZone) { oDomTarjZone.style.display = "none"; }

                    var oDomZone = oDomCard.querySelector(".calGolesZone");
                    if (!oDomZone) { return; }
                    this._injectEventosHTML(oDomZone, oPartido);
                }.bind(this));
            }.bind(this));
        },

        _injectEventosHTML: function (oDomZone, oPartido) {
            var aGN    = oPartido._golesNuestros || [];
            var aGR    = oPartido._golesRival    || [];
            var aT     = oPartido._tarjetas      || [];
            var bLocal = !!oPartido.esLocal;

            var sOurSide   = bLocal ? "right" : "left";
            var sRivalSide = bLocal ? "left"  : "right";

            var aEvents = [];

            aGN.filter(function (g) { return !g.esPropio; }).forEach(function (g) {
                aEvents.push({ minuto: g.minuto, side: sOurSide,
                    label: g.nombre + (g.esPenalti ? " (P)" : ""), isOurs: true, type: "gol" });
            });

            aGN.filter(function (g) { return g.esPropio; }).forEach(function (g) {
                aEvents.push({ minuto: g.minuto, side: sRivalSide,
                    label: "PP (" + g.nombre + ")", isOurs: false, type: "gol" });
            });

            aGR.filter(function (g) { return !g.esPropio; }).forEach(function (g) {
                aEvents.push({ minuto: g.minuto, side: sRivalSide,
                    label: "Gol rival", isOurs: false, type: "gol" });
            });

            aGR.filter(function (g) { return g.esPropio; }).forEach(function (g) {
                aEvents.push({ minuto: g.minuto, side: sOurSide,
                    label: "PP rival", isOurs: true, type: "gol" });
            });

            aT.forEach(function (t) {
                var sTipo = (t.tipo || "AMARILLA").toUpperCase();
                aEvents.push({ minuto: t.minuto, side: sOurSide,
                    label: t.nombre, isOurs: true, type: "tarjeta", tipo: sTipo });
            });

            if (!aEvents.length) { oDomZone.style.display = "none"; return; }
            oDomZone.style.display = "";
            aEvents.sort(function (a, b) { return a.minuto - b.minuto; });

            var sRows = aEvents.map(function (ev) {
                var sLabelClass = ev.isOurs ? "calGoalOursLabel" : "calGoalRivalLabel";
                var sLabel  = "<span class='calGoalLabel " + sLabelClass + "'>" + ev.label + "</span>";
                var sMin    = "<span class='calGoalMin'>" + ev.minuto + "&#8242;</span>";
                var sIcon;

                if (ev.type === "tarjeta") {
                    var sIconInner;
                    if (ev.tipo === "ROJA") {
                        sIconInner = "<span class='calCardIcon calCardRoja'></span>";
                    } else if (ev.tipo === "DOBLE_AMARILLA" || ev.tipo === "AMARILLA_ROJA") {
                        sIconInner = "<span class='calCardIcon calCardAmarilla'></span>" +
                                     "<span class='calCardIcon calCardRoja calCardSecond'></span>";
                    } else {
                        sIconInner = "<span class='calCardIcon calCardAmarilla'></span>";
                    }
                    sIcon = "<span class='calCardSlot'>" + sIconInner + "</span>";
                } else {
                    sIcon = "<span class='calGoalBall " + (ev.isOurs ? "" : "calGoalBallRival") + "'>&#x26BD;</span>";
                }

                var sCellContent;
                if (ev.side === "left") {
                    sCellContent = sLabel + sMin + sIcon;
                } else {
                    sCellContent = sIcon + sMin + sLabel;
                }

                var sLeft  = ev.side === "left"
                    ? "<div class='calEvtCell calEvtLeft'>"  + sCellContent + "</div>"
                    : "<div class='calEvtCell calEvtLeft'></div>";
                var sRight = ev.side === "right"
                    ? "<div class='calEvtCell calEvtRight'>" + sCellContent + "</div>"
                    : "<div class='calEvtCell calEvtRight'></div>";

                return "<div class='calEvtRow'>" + sLeft + "<div class='calEvtDivider'></div>" + sRight + "</div>";
            }).join("");

            oDomZone.innerHTML = "<div class='calEvtZone'>" + sRows + "</div>";
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