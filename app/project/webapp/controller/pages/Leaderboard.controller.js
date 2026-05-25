sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController"
], function (BaseController) {
    "use strict";

    var OWN_TEAM_NAME = "Chocolate Sexy";
    var sImgBase = sap.ui.require.toUrl("chocolatesexy/project/images/");

    var TEAM_COLORS = [
        "#e63946", "#2a9d8f", "#e9c46a", "#457b9d", "#f4a261",
        "#a8dadc", "#6d6875", "#b5838d", "#52b788", "#f77f00",
        "#7209b7", "#3a86ff"
    ];

    return BaseController.extend("chocolatesexy.project.controller.pages.Leaderboard", {

        onInit: function () {
            this._oClasifData = {};
            this._oCurJornada = {};
            this._bClasifOk   = false;

            var that = this;

            fetch(
                "/odata/v4/football/Clasificaciones" +
                "?$expand=equipo,temporada" +
                "&$orderby=temporadaId%20asc,jornada%20asc"
            )
                .then(function (r) { return r.json(); })
                .then(function (d) {
                    that._procesarClasificaciones(d.value);
                    that._bClasifOk = true;
                    that._tryRender();
                })
                .catch(function (e) { console.error("Error Clasificaciones:", e); });

            this.getView().addEventDelegate({
                onAfterRendering: function () { that._tryRender(); }
            });
        },

        _procesarClasificaciones: function (aRecords) {
            this._oClasifData = {};
            aRecords.forEach(function (c) {
                if (!this._oClasifData[c.temporadaId]) { this._oClasifData[c.temporadaId] = {}; }
                var oT = this._oClasifData[c.temporadaId];
                if (!oT[c.jornada]) { oT[c.jornada] = []; }
                oT[c.jornada].push(c);
            }.bind(this));
        },

        _tryRender: function () {
            if (!this._bClasifOk) { return; }
            var oDom = this.getView().getDomRef();
            if (!oDom) { return; }
            this._renderAllSeasons(oDom);
        },

        _renderAllSeasons: function (oViewDom) {
            var that = this;
            var aBlocks = Array.from(oViewDom.querySelectorAll(".calSeasonBlock"));
            var aTemporadas = [2, 1];
            aBlocks.forEach(function (oDomBlock, i) {
                that._renderSeasonBlock(oDomBlock, aTemporadas[i]);
            });
        },

        _renderSeasonBlock: function (oDomBlock, iTemporadaId) {
            if (!oDomBlock) { return; }

            var oDomContent = oDomBlock.querySelector(".lbSeasonContent");
            if (!oDomContent) { return; }

            var oData = this._oClasifData[iTemporadaId];
            var aJornadas = oData ? Object.keys(oData).map(Number).sort(function (a, b) { return a - b; }) : [];

            var oNoDataNode = oDomContent.querySelector(".calNoDataBox");

            if (!aJornadas.length) {
                oDomContent.innerHTML = "";
                if (oNoDataNode) {
                    oNoDataNode.classList.remove("lbNoDataHidden");
                    oNoDataNode.classList.add("lbNoDataVisible");
                    oDomContent.appendChild(oNoDataNode);
                }
                return;
            }

            if (oNoDataNode) {
                oNoDataNode.classList.add("lbNoDataHidden");
                oNoDataNode.classList.remove("lbNoDataVisible");
            }

            if (!this._oCurJornada[iTemporadaId]) {
                this._oCurJornada[iTemporadaId] = aJornadas[aJornadas.length - 1];
            }
            var iCur = this._oCurJornada[iTemporadaId];

            var sJorBtns = "<span class='lbJornadaLabel sapMText'><span><bdi>JOR</bdi></span></span>" +
                           "<div class='lbJornadaDivider sapMVBox'></div>";

            aJornadas.forEach(function (j) {
                var sActive = j === iCur ? " lbJBtnActive" : "";
                sJorBtns +=
                    "<button class='lbJBtn sapMBtn" + sActive + "'" +
                    " data-tempid='" + iTemporadaId + "'" +
                    " data-jornada='" + j + "'>" +
                        "<span class='sapMBtnInner'>" +
                            "<span class='sapMBtnContent'>" + j + "</span>" +
                        "</span>" +
                    "</button>";
            });

            var oPrevPositions = {};
            var iCurIdx = aJornadas.indexOf(iCur);
            if (iCurIdx > 0) {
                var iPrevJor = aJornadas[iCurIdx - 1];
                var aPrevRaw = (oData[iPrevJor] || []).map(function (c) {
                    var iDG = (c.golesAFavor || 0) - (c.golesEnContra || 0);
                    return {
                        equipoId: c.equipoId,
                        puntos:   c.puntos || 0,
                        dg:       iDG,
                        nombre:   c.equipo ? c.equipo.nombre : "Equipo " + c.equipoId
                    };
                });
                aPrevRaw.sort(function (a, b) {
                    if (b.puntos !== a.puntos) { return b.puntos - a.puntos; }
                    if (b.dg     !== a.dg)     { return b.dg     - a.dg; }
                    return a.nombre.localeCompare(b.nombre);
                });
                aPrevRaw.forEach(function (e, i) {
                    oPrevPositions[e.equipoId] = i + 1;
                });
            }

            var aEquipos = (oData[iCur] || []).map(function (c) {
                var iDG = (c.golesAFavor || 0) - (c.golesEnContra || 0);
                return {
                    nombre:   c.equipo ? c.equipo.nombre : "Equipo " + c.equipoId,
                    equipoId: c.equipoId,
                    puntos:   c.puntos            || 0,
                    pj:       iCur,
                    g:        c.partidosGanados   || 0,
                    e:        c.partidosEmpatados || 0,
                    p:        c.partidosPerdidos  || 0,
                    gf:       c.golesAFavor       || 0,
                    gc:       c.golesEnContra      || 0,
                    dg:       iDG,
                    dgText:   iDG > 0 ? "+" + iDG : "" + iDG
                };
            });

            aEquipos.sort(function (a, b) {
                if (b.puntos !== a.puntos) { return b.puntos - a.puntos; }
                if (b.dg     !== a.dg)     { return b.dg     - a.dg; }
                return a.nombre.localeCompare(b.nombre);
            });

            var that  = this;
            var sRows = "";

            aEquipos.forEach(function (e, i) {
                var bEsPropio = e.nombre === OWN_TEAM_NAME;
                var bEsUltimo = i === aEquipos.length - 1;
                var sDgClass  = e.dg >= 0 ? "lbTDDGPos" : "lbTDDGNeg";

                var sRowClass = "lbTRowDyn lbTRow sapMHBox" +
                    (bEsPropio ? " lbTRowOwn" : "") +
                    (bEsUltimo ? " lbTRowLast" : "");

                var sUltimos3 = that._buildUltimos3(iTemporadaId, e.equipoId, iCur, aJornadas);
                var sSample   = that._buildSample(e.equipoId, i + 1, oPrevPositions);

                var sPosExtra  = bEsPropio ? " lbTDPosOwn"  : "";
                var sTeamExtra = bEsPropio ? " lbTDTeamOwn" : "";
                var sPtsExtra  = bEsPropio ? " lbTDPtsOwn"  : "";

                sRows +=
                    "<div class='" + sRowClass + "'>" +
                        "<span class='lbTDPos"  + sPosExtra  + " sapMText'><span><bdi>" + (i + 1) + "º</bdi></span></span>" +
                        "<span class='lbTDTeam" + sTeamExtra + " sapMText'><span><bdi>" + e.nombre + "</bdi></span></span>" +
                        "<span class='lbTDPts"  + sPtsExtra  + " sapMText'><span><bdi>" + e.puntos + "</bdi></span></span>" +
                        "<span class='lbTDNum sapMText'><span><bdi>"                    + e.pj     + "</bdi></span></span>" +
                        "<span class='lbTDNum lbTDG sapMText'><span><bdi>"              + e.g      + "</bdi></span></span>" +
                        "<span class='lbTDNum sapMText'><span><bdi>"                    + e.e      + "</bdi></span></span>" +
                        "<span class='lbTDNum lbTDPerdidas sapMText'><span><bdi>"       + e.p      + "</bdi></span></span>" +
                        "<span class='lbTDNum sapMText'><span><bdi>"                    + e.gf     + "</bdi></span></span>" +
                        "<span class='lbTDNum sapMText'><span><bdi>"                    + e.gc     + "</bdi></span></span>" +
                        "<span class='" + sDgClass + " sapMText'><span><bdi>"           + e.dgText + "</bdi></span></span>" +
                        "<div class='lbLastCol sapMHBox'>" + sUltimos3 + "</div>" +
                        "<div class='lbTDSample sapMHBox'>" + sSample + "</div>" +
                    "</div>";
            });

            var sHead =
                "<div class='lbTHead sapMHBox'>" +
                    "<span class='lbTH lbTHPos sapMText'><span><bdi>POS</bdi></span></span>" +
                    "<span class='lbTH lbTHTeam sapMText'><span><bdi>EQUIPO</bdi></span></span>" +
                    "<span class='lbTH lbTHPts sapMText'><span><bdi>PTS</bdi></span></span>" +
                    "<span class='lbTH lbTHNum sapMText'><span><bdi>PJ</bdi></span></span>" +
                    "<span class='lbTH lbTHNum lbTHG sapMText'><span><bdi>G</bdi></span></span>" +
                    "<span class='lbTH lbTHNum sapMText'><span><bdi>E</bdi></span></span>" +
                    "<span class='lbTH lbTHNum lbTHP sapMText'><span><bdi>P</bdi></span></span>" +
                    "<span class='lbTH lbTHNum sapMText'><span><bdi>GF</bdi></span></span>" +
                    "<span class='lbTH lbTHNum sapMText'><span><bdi>GC</bdi></span></span>" +
                    "<span class='lbTH lbTHDG sapMText'><span><bdi>DG</bdi></span></span>" +
                    "<span class='lbTH lbTHLast sapMText'><span><bdi>ÚLTIMOS 3</bdi></span></span>" +
                    "<span class='lbTH lbTHSample sapMText'><span><bdi>MOV</bdi></span></span>" +
                "</div>";

            oDomContent.innerHTML =
                "<div class='lbJornadaBar sapMScrollCont'>" +
                    "<div class='lbJornadaBtns sapMHBox'>" + sJorBtns + "</div>" +
                "</div>" +
                sHead +
                sRows;

            if (oNoDataNode) {
                oNoDataNode.classList.add("lbNoDataHidden");
                oNoDataNode.classList.remove("lbNoDataVisible");
                oDomContent.appendChild(oNoDataNode);
            }

            oDomContent.querySelectorAll(".lbJBtn").forEach(function (oBtn) {
                oBtn.addEventListener("click", function () {
                    var iTId = parseInt(oBtn.dataset.tempid, 10);
                    var iJ   = parseInt(oBtn.dataset.jornada, 10);
                    that._oCurJornada[iTId] = iJ;
                    that._renderSeasonBlock(oDomBlock, iTId);
                });
            });

            that._renderChartCard(oDomBlock, iTemporadaId, aJornadas, iCur);
   
            that._renderMejorPeorCards(oDomBlock, iTemporadaId, aJornadas);
        },

        _renderChartCard: function (oDomBlock, iTemporadaId, aJornadas, iCurJornada) {
           
            var oParent = oDomBlock.parentElement;
            if (!oParent) { return; }
            var oChartCard = oParent.querySelector(".calEvoBlock");
            if (!oChartCard) { return; }

            var sChart = this._buildEvolutionChart(iTemporadaId, aJornadas, iCurJornada);

            oChartCard.innerHTML =
                "<div class='lbEvoCardHeader'>" +
                    "<span class='lbEvoCardIcon'>◉</span>" +
                    "<span class='lbEvoCardTitle'>GRÁFICA EVOLUCIÓN</span>" +
                "</div>" +
                "<div class='lbEvoCardBody'>" +
                    sChart +
                "</div>";

            this._attachChartHoverEvents(oChartCard);
        },

        _buildEvolutionChart: function (iTemporadaId, aJornadas, iCurJornada) {
            var oData = this._oClasifData[iTemporadaId];
            if (!oData || aJornadas.length < 1) { return ""; }

            var aJornadasToShow = aJornadas.filter(function (j) { return j <= iCurJornada; });
            if (aJornadasToShow.length < 1) { return ""; }

            var oEquipoNames = {};
            var oEvolution   = {};

            aJornadasToShow.forEach(function (jornada) {
                var aRaw = (oData[jornada] || []).map(function (c) {
                    var iDG = (c.golesAFavor || 0) - (c.golesEnContra || 0);
                    var sNombre = c.equipo ? c.equipo.nombre : "Equipo " + c.equipoId;
                    oEquipoNames[c.equipoId] = sNombre;
                    return { equipoId: c.equipoId, puntos: c.puntos || 0, dg: iDG, nombre: sNombre };
                });
                aRaw.sort(function (a, b) {
                    if (b.puntos !== a.puntos) { return b.puntos - a.puntos; }
                    if (b.dg     !== a.dg)     { return b.dg     - a.dg; }
                    return a.nombre.localeCompare(b.nombre);
                });
                aRaw.forEach(function (e, i) {
                    if (!oEvolution[e.equipoId]) { oEvolution[e.equipoId] = []; }
                    oEvolution[e.equipoId].push({ jornada: jornada, pos: i + 1 });
                });
            });

            var aEquipoIds = Object.keys(oEvolution).map(Number);
            var iNumEquipos = aEquipoIds.length;
            if (iNumEquipos === 0) { return ""; }

            var W      = 420;
            var H      = 320;
            var PAD_L  = 28;
            var PAD_R  = 10;
            var PAD_T  = 16;
            var PAD_B  = 32;
            var PLOT_W = W - PAD_L - PAD_R;
            var PLOT_H = H - PAD_T - PAD_B;

            var iMaxPos = iNumEquipos;
            var iMinPos = 1;

            var xScale = function (jornada) {
                if (aJornadas.length === 1) { return PAD_L + PLOT_W / 2; }
                var idx = aJornadas.indexOf(jornada);
                return PAD_L + (idx / (aJornadas.length - 1)) * PLOT_W;
            };
            var yScale = function (pos) {
                return PAD_T + ((pos - iMinPos) / (iMaxPos - iMinPos)) * PLOT_H;
            };

            var sSvg = "<svg class='lbEvoChart' viewBox='0 0 " + W + " " + H + "' xmlns='http://www.w3.org/2000/svg'>";
            sSvg += "<rect x='0' y='0' width='" + W + "' height='" + H + "' rx='8' fill='#ffffff'/>";
            sSvg += "<rect x='" + PAD_L + "' y='" + PAD_T + "' width='" + PLOT_W + "' height='" + PLOT_H + "' fill='#f8f9fa' rx='2'/>";

            for (var p = iMinPos; p <= iMaxPos; p++) {
                var yG = yScale(p);
                if (p % 2 === 0) {
                    sSvg += "<rect x='" + PAD_L + "' y='" + (yG - (PLOT_H / (iMaxPos - iMinPos) / 2)).toFixed(1) + "' width='" + PLOT_W + "' height='" + (PLOT_H / (iMaxPos - iMinPos)).toFixed(1) + "' fill='#ececec' opacity='0.5'/>";
                }
                sSvg += "<line x1='" + PAD_L + "' y1='" + yG + "' x2='" + (W - PAD_R) + "' y2='" + yG + "' stroke='#ddd' stroke-width='0.8'/>";
                sSvg += "<text x='" + (PAD_L - 4) + "' y='" + (yG + 4) + "' text-anchor='end' font-size='9' fill='#9ca3af' font-family='sans-serif'>" + p + "º</text>";
            }

            aJornadas.forEach(function (j) {
                var xG = xScale(j);
                var bFuture = j > iCurJornada;
                if (j === iCurJornada) {
                    sSvg += "<line x1='" + xG + "' y1='" + PAD_T + "' x2='" + xG + "' y2='" + (H - PAD_B) + "' stroke='#611a32' stroke-opacity='0.3' stroke-width='1.5' stroke-dasharray='3,3'/>";
                } else if (bFuture) {
                    sSvg += "<line x1='" + xG + "' y1='" + PAD_T + "' x2='" + xG + "' y2='" + (H - PAD_B) + "' stroke='#ddd' stroke-width='0.5' stroke-dasharray='2,4'/>";
                } else {
                    sSvg += "<line x1='" + xG + "' y1='" + PAD_T + "' x2='" + xG + "' y2='" + (H - PAD_B) + "' stroke='#ddd' stroke-width='0.8'/>";
                }
                sSvg += "<text x='" + xG + "' y='" + (H - PAD_B + 12) + "' text-anchor='middle' font-size='8' fill='" + (bFuture ? "#d1d5db" : "#9ca3af") + "' font-family='sans-serif'>J" + j + "</text>";
            });

            aEquipoIds.forEach(function (iEqId, iColorIdx) {
                var aPoints = oEvolution[iEqId];
                if (!aPoints || aPoints.length < 1) { return; }

                var sNombre   = oEquipoNames[iEqId] || ("Equipo " + iEqId);
                var bEsPropio = sNombre === OWN_TEAM_NAME;
                var sColor    = bEsPropio ? "#901e44" : TEAM_COLORS[iColorIdx % TEAM_COLORS.length];
                var fOpacity  = bEsPropio ? 1.0 : 0.75;
                var fWidth    = bEsPropio ? 2.5 : 1.5;

                var sPoints = aPoints.map(function (pt) {
                    return xScale(pt.jornada).toFixed(1) + "," + yScale(pt.pos).toFixed(1);
                }).join(" ");

                sSvg += "<polyline" +
                    " class='lbEvoLine'" +
                    " data-equipo='" + iEqId + "'" +
                    " data-nombre='" + sNombre.replace(/'/g, "&#39;") + "'" +
                    " points='" + sPoints + "'" +
                    " fill='none'" +
                    " stroke='" + sColor + "'" +
                    " stroke-width='" + fWidth + "'" +
                    " stroke-opacity='" + fOpacity + "'" +
                    " stroke-linejoin='round'" +
                    " stroke-linecap='round'/>";

                aPoints.forEach(function (pt) {
                    var cx = xScale(pt.jornada).toFixed(1);
                    var cy = yScale(pt.pos).toFixed(1);
                    var r  = bEsPropio ? 4 : 3;
                    sSvg += "<circle" +
                        " class='lbEvoPoint'" +
                        " data-equipo='" + iEqId + "'" +
                        " data-jornada='" + pt.jornada + "'" +
                        " data-pos='" + pt.pos + "'" +
                        " data-nombre='" + sNombre.replace(/'/g, "&#39;") + "'" +
                        " cx='" + cx + "' cy='" + cy + "' r='" + r + "'" +
                        " fill='" + sColor + "'" +
                        " stroke='#ffffff' stroke-width='1.5'" +
                        " opacity='" + fOpacity + "'/>";
                });
            });

            sSvg += "<g class='lbChartTooltip' transform='translate(-999,-999)'>" +
                "<rect rx='4' ry='4' x='-4' y='-18' width='150' height='22' fill='#611a32' stroke='#a3295f' stroke-width='0.8' opacity='0.95'/>" +
                "<text class='lbTooltipText' x='2' y='-4' font-size='10' fill='#ffffff' font-family='sans-serif'></text>" +
            "</g>";
            sSvg += "</svg>";

            var sLegend = "<div class='lbChartLegend'>";
            aEquipoIds.forEach(function (iEqId, iColorIdx) {
                var sNombre   = oEquipoNames[iEqId] || ("Equipo " + iEqId);
                var bEsPropio = sNombre === OWN_TEAM_NAME;
                var sColor    = bEsPropio ? "#901e44" : TEAM_COLORS[iColorIdx % TEAM_COLORS.length];
                sLegend +=
                    "<div class='lbChartLegendItem" + (bEsPropio ? " lbChartLegendOwn" : "") + "' data-equipo='" + iEqId + "'>" +
                        "<span class='lbChartLegendDot' style='background:" + sColor + "'></span>" +
                        "<span class='lbChartLegendName'>" + sNombre + "</span>" +
                    "</div>";
            });
            sLegend += "</div>";

            return "<div class='lbChartContainer'>" + sSvg + sLegend + "</div>";
        },

        _attachChartHoverEvents: function (oDomContent) {
            var oChart = oDomContent.querySelector(".lbEvoChart");
            if (!oChart) { return; }

            var oTooltip     = oChart.querySelector(".lbChartTooltip");
            var oTooltipText = oChart.querySelector(".lbTooltipText");
            var aPoints      = Array.from(oChart.querySelectorAll(".lbEvoPoint"));
            var aLines       = Array.from(oChart.querySelectorAll(".lbEvoLine"));
            var aLabels      = Array.from(oChart.querySelectorAll(".lbEvoLabel"));
            var aLegendItems = Array.from(oDomContent.querySelectorAll(".lbChartLegendItem"));

            function highlightEquipo(iEqId) {
                aLines.forEach(function (l) {
                    l.style.strokeOpacity = l.dataset.equipo == iEqId ? "1" : "0.12";
                    l.style.strokeWidth   = l.dataset.equipo == iEqId ? "3"  : "1";
                });
                aPoints.forEach(function (c) {
                    c.style.opacity = c.dataset.equipo == iEqId ? "1" : "0.1";
                });
                aLabels.forEach(function (t) {
                    t.style.opacity = t.dataset.equipo == iEqId ? "1" : "0.1";
                });
                aLegendItems.forEach(function (li) {
                    li.style.opacity = li.dataset.equipo == iEqId ? "1" : "0.35";
                });
            }

            function resetHighlight() {
                aLines.forEach(function (l) { l.style.strokeOpacity = ""; l.style.strokeWidth = ""; });
                aPoints.forEach(function (c) { c.style.opacity = ""; });
                aLabels.forEach(function (t) { t.style.opacity = ""; });
                aLegendItems.forEach(function (li) { li.style.opacity = ""; });
            }

            aPoints.forEach(function (oPt) {
                oPt.style.cursor = "pointer";
                oPt.addEventListener("mouseenter", function (ev) {
                    var iEq  = oPt.dataset.equipo;
                    var iPos = oPt.dataset.pos;
                    var iJor = oPt.dataset.jornada;
                    var sNom = oPt.dataset.nombre;
                    highlightEquipo(iEq);

                    if (oTooltip && oTooltipText) {
                        oTooltipText.textContent = "J" + iJor + " · " + iPos + "º · " + sNom;
                        var cx = parseFloat(oPt.getAttribute("cx"));
                        var cy = parseFloat(oPt.getAttribute("cy"));
                        oTooltip.setAttribute("transform", "translate(" + (cx + 8) + "," + (cy - 6) + ")");
                    }
                });
                oPt.addEventListener("mouseleave", function () {
                    resetHighlight();
                    if (oTooltip) { oTooltip.setAttribute("transform", "translate(-999,-999)"); }
                });
            });

            aLegendItems.forEach(function (oLi) {
                oLi.style.cursor = "pointer";
                oLi.addEventListener("mouseenter", function () {
                    highlightEquipo(oLi.dataset.equipo);
                });
                oLi.addEventListener("mouseleave", function () {
                    resetHighlight();
                    if (oTooltip) { oTooltip.setAttribute("transform", "translate(-999,-999)"); }
                });
            });
        },

        _buildUltimos3: function (iTemporadaId, iEquipoId, iHastaJornada, aTodasJornadas) {
            var oData = this._oClasifData[iTemporadaId];
            if (!oData) { return ""; }

            var aJornadasHasta = aTodasJornadas.filter(function (j) { return j <= iHastaJornada; });
            var aLast3 = aJornadasHasta.slice(-3);

            return aLast3.map(function (jornada) {
                var iIdx     = aTodasJornadas.indexOf(jornada);
                var iPrevJor = iIdx > 0 ? aTodasJornadas[iIdx - 1] : null;

                var aActual = oData[jornada] || [];
                var oActual = aActual.find(function (c) { return c.equipoId === iEquipoId; });
                if (!oActual) { return ""; }

                var oPrev = null;
                if (iPrevJor !== null) {
                    var aPrev = oData[iPrevJor] || [];
                    oPrev = aPrev.find(function (c) { return c.equipoId === iEquipoId; }) || null;
                }

                var gDiff = (oActual.partidosGanados   || 0) - (oPrev ? (oPrev.partidosGanados   || 0) : 0);
                var eDiff = (oActual.partidosEmpatados || 0) - (oPrev ? (oPrev.partidosEmpatados || 0) : 0);
                var pDiff = (oActual.partidosPerdidos  || 0) - (oPrev ? (oPrev.partidosPerdidos  || 0) : 0);

                if (gDiff > 0) { return "<img src='" + sImgBase + "victoria.png' class='lbR3Img' title='Victoria' />"; }
                if (eDiff > 0) { return "<img src='" + sImgBase + "empate.png'   class='lbR3Img' title='Empate'   />"; }
                if (pDiff > 0) { return "<img src='" + sImgBase + "derrota.png'  class='lbR3Img' title='Derrota'  />"; }
                return "";
                }).join("");
        },

        _buildSample: function (iEquipoId, iCurPos, oPrevPositions) {
            var iPrevPos = oPrevPositions[iEquipoId];

            if (!iPrevPos) {
                return "<span class='lbTDSampleNew'>NEW</span>";
            }

            var iDiff = iPrevPos - iCurPos;
            if (iDiff > 0) {
                return "<span class='lbTDSampleUp'>▲ +" + iDiff + "</span>";
            }
            if (iDiff < 0) {
                return "<span class='lbTDSampleDown'>▼ " + iDiff + "</span>";
            }
            return "<span class='lbTDSampleSame'>=</span>";
        },

        _renderMejorPeorCards: function (oDomBlock, iTemporadaId, aJornadas) {
            var oParent = oDomBlock.parentElement;
            if (!oParent) { return; }

            var oMejorBlock = oParent.querySelector(".calMejorEvoBlock");
            var oPeorBlock  = oParent.querySelector(".calPeorEvoBlock");
            var oSpacer     = oParent.querySelector(".lbEvoSpacer");
            if (!oMejorBlock || !oPeorBlock) { return; }

            var bShow = aJornadas.length >= 22;

            if (!bShow) {
                oMejorBlock.classList.add("lbMiniEvoHidden");
                oPeorBlock.classList.add("lbMiniEvoHidden");
                if (oSpacer) { oSpacer.style.display = ""; }
                return;
            }

            var oData      = this._oClasifData[iTemporadaId];
            var iFirstJor  = aJornadas[0];
            var iLastJor   = aJornadas[aJornadas.length - 1];
            var oPosFirst  = this._calcPositions(oData, iFirstJor);
            var oPosLast   = this._calcPositions(oData, iLastJor);

            var aEvol = [];
            Object.keys(oPosLast).forEach(function (sId) {
                var iEqId    = parseInt(sId, 10);
                var sNombre  = oPosLast[sId].nombre;
                var iPosF    = oPosFirst[sId] ? oPosFirst[sId].pos : oPosLast[sId].pos;
                var iPosL    = oPosLast[sId].pos;
                aEvol.push({ equipoId: iEqId, nombre: sNombre, diff: iPosF - iPosL });
            });
            aEvol.sort(function (a, b) { return b.diff - a.diff; });

            var oMejor = aEvol[0];
            var oPeor  = aEvol[aEvol.length - 1];

            if (oSpacer) { oSpacer.style.display = "none"; }
            oMejorBlock.classList.remove("lbMiniEvoHidden");
            oPeorBlock.classList.remove("lbMiniEvoHidden");

            oMejorBlock.innerHTML = this._buildMiniEvoCard("MEJOR EVOLUCIÓN TEMPORADA", oMejor, true);
            oPeorBlock.innerHTML  = this._buildMiniEvoCard("PEOR EVOLUCIÓN TEMPORADA",  oPeor,  false);
        },

        _calcPositions: function (oData, jornada) {
            var aRaw = (oData[jornada] || []).map(function (c) {
                var iDG = (c.golesAFavor || 0) - (c.golesEnContra || 0);
                var sN  = c.equipo ? c.equipo.nombre : "Equipo " + c.equipoId;
                return { equipoId: c.equipoId, puntos: c.puntos || 0, dg: iDG, nombre: sN };
            });
            aRaw.sort(function (a, b) {
                if (b.puntos !== a.puntos) { return b.puntos - a.puntos; }
                if (b.dg     !== a.dg)     { return b.dg     - a.dg; }
                return a.nombre.localeCompare(b.nombre);
            });
            var oResult = {};
            aRaw.forEach(function (e, i) { oResult[e.equipoId] = { pos: i + 1, nombre: e.nombre }; });
            return oResult;
        },

        _buildMiniEvoCard: function (sTitle, oEquipo, bMejor) {
            var sNombre   = oEquipo.nombre;
            var bEsPropio = sNombre === OWN_TEAM_NAME;
            var bEsRVB    = sNombre === "Real Valencia Balompie";

            var sInitials = sNombre.split(" ")
                .map(function (w) { return w.charAt(0); })
                .join("").substring(0, 3).toUpperCase();

            var iDiff     = Math.abs(oEquipo.diff);
            var sColor    = bMejor ? "#16a34a" : "#dc2626";
            var sBgColor  = bMejor ? "#f0fdf4" : "#fef2f2";
            var sArrow    = bMejor ? "▲" : "▼";
            var sDiffText = sArrow + " " + iDiff + " puesto" + (iDiff !== 1 ? "s" : "") +
                            (bMejor ? " ganados" : " perdidos");

            var oIconInfo   = sap.ui.core.IconPool.getIconInfo(bMejor ? "sap-icon://trend-up" : "sap-icon://trend-down");
            var sIconChar   = oIconInfo ? oIconInfo.content : (bMejor ? "▲" : "▼");
            var sIconHeader = "<span style=\"font-family:SAP-icons;font-size:1rem;vertical-align:middle;color:#ffffff\">" + sIconChar + "</span>";

            var sShield;
            if (bEsPropio) {
                sShield = "<div class='lbMiniEvoShield lbMiniEvoShieldOwn'>" +
                              sInitials +
                              "<img src='" + sImgBase + "escudo.png' class='lbMiniEvoShieldImgEl' onerror='this.remove()'/>" +
                          "</div>";
            } else if (bEsRVB) {
                sShield = "<div class='lbMiniEvoShield lbMiniEvoShieldBrand'>" + sInitials + "</div>";
            } else {
                sShield = "<div class='lbMiniEvoShield'>" + sInitials + "</div>";
            }

            var sNameClass = "lbMiniEvoTeamName" + (bEsPropio ? " lbMiniEvoTeamOwn" : "");

            return "<div class='lbMiniEvoCardHeader'>" +
                        "<span class='lbMiniEvoCardIcon'>" + sIconHeader + "</span>" +
                        "<span class='lbMiniEvoCardTitle'>" + sTitle + "</span>" +
                    "</div>" +
                    "<div class='lbMiniEvoCardBody'>" +
                        "<div class='lbMiniEvoTeamRow'>" +
                            sShield +
                            "<span class='" + sNameClass + "'>" + sNombre + "</span>" +
                        "</div>" +
                        "<div class='lbMiniEvoDivider'></div>" +
                        "<div class='lbMiniEvoDiff' style='color:" + sColor + ";background:" + sBgColor + "'>" +
                            sDiffText +
                        "</div>" +
                    "</div>";
        },

        onToggleSeasonBlock: function (oEvent) {
            var oButton      = oEvent.getSource();
            var oSeasonBlock = oButton.getParent().getParent();
            var oDomBlock    = oSeasonBlock.getDomRef();

            if (!oDomBlock) { return; }

            var oDomRef = oDomBlock.querySelector(".lbSeasonContent");
            if (!oDomRef) { return; }

            var bCollapsed = oDomRef.classList.contains("cal-collapsed");
            oDomRef.classList.toggle("cal-collapsed");

            var oParent   = oDomBlock.parentElement;
            var oEvoBlock = oParent ? oParent.querySelector(".calEvoBlock") : null;
            if (oEvoBlock) { oEvoBlock.classList.toggle("lbEvoHidden", !bCollapsed); }
            var oMejor = oParent ? oParent.querySelector(".calMejorEvoBlock") : null;
            var oPeor  = oParent ? oParent.querySelector(".calPeorEvoBlock")  : null;
            if (oMejor) { oMejor.classList.toggle("lbEvoHidden", !bCollapsed); }
            if (oPeor)  { oPeor.classList.toggle("lbEvoHidden",  !bCollapsed); }

            oButton.setIcon(
                bCollapsed
                    ? "sap-icon://navigation-up-arrow"
                    : "sap-icon://navigation-down-arrow"
            );
        }

    });
});