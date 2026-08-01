sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("chocolatesexy.project.controller.pages.Stats", {

        onInit: function () {
            this._oRaw        = { jornadaJugadores: [], goles: [] };
            this._bDataOk     = false;
            this._oCurJornada = {};
            this._oPlayerMap  = {};

            var that = this;

            Promise.all([
                fetch("/odata/v4/football/JornadaJugadores"
                    + "?$expand=jugador,jornada"
                    + "&$orderby=jornadaId%20asc")
                    .then(function (r) { return r.json(); }),

                fetch("/odata/v4/football/Goles"
                    + "?$expand=jornada,jugador,asistencia"
                    + "&$orderby=jornadaId%20asc")
                    .then(function (r) { return r.json(); })
            ])
            .then(function (aRes) {
                that._oRaw.jornadaJugadores = aRes[0].value || [];
                that._oRaw.goles            = aRes[1].value || [];
                that._bDataOk = true;
                that._tryRender();
            })
            .catch(function (e) { console.error("[Stats] fetch error:", e); });

            this.getView().addEventDelegate({
                onAfterRendering: function () { that._tryRender(); }
            });
        },

        _tryRender: function () {
            if (!this._bDataOk) { return; }
            var oDom = this.getView().getDomRef();
            if (!oDom) { return; }

            this._buildPlayerMap();
            this._renderAllSeasons(oDom);
            this._renderAwardCards();
        },

        _buildPlayerMap: function () {
            var oMap = {};

            this._oRaw.jornadaJugadores.forEach(function (jj) {
                if (jj.jugador && !oMap[jj.jugadorId]) {
                    oMap[jj.jugadorId] = jj.jugador;
                }
            });

            this._oRaw.goles.forEach(function (g) {
                if (g.jugador && g.jugadorId && !oMap[g.jugadorId]) {
                    oMap[g.jugadorId] = g.jugador;
                }
                if (g.asistencia && g.asistenciaJugadorId && !oMap[g.asistenciaJugadorId]) {
                    oMap[g.asistenciaJugadorId] = g.asistencia;
                }
            });

            this._oPlayerMap = oMap;
        },

        _renderAwardCards: function () {
            var oGoleadorControl  = this.byId("awardGoleadorContent");
            var oAsistenteControl = this.byId("awardAsistenteContent");
            if (!oGoleadorControl || !oAsistenteControl) { return; }

            var oGoleadorDom  = oGoleadorControl.getDomRef();
            var oAsistenteDom = oAsistenteControl.getDomRef();
            if (!oGoleadorDom || !oAsistenteDom) { return; }

            var oTemporadaNames = { 1: "2025/26", 2: "2026/27" };

            var oTemporadaMaxJornada = {};

            this._oRaw.jornadaJugadores.forEach(function (jj) {
                if (!jj.jornada) { return; }
                var tId  = jj.jornada.temporadaId;
                var jNum = jj.jornada.jornada;
                if (!oTemporadaMaxJornada[tId] || jNum > oTemporadaMaxJornada[tId]) {
                    oTemporadaMaxJornada[tId] = jNum;
                }
            });

            var aTemporadasConDatos = Object.keys(oTemporadaMaxJornada)
                .map(Number)
                .sort(function (a, b) { return b - a; });

            if (!aTemporadasConDatos.length) {
                var sSinDatos = "<span class='stAwardNoData'>Sin datos</span>";
                oGoleadorDom.innerHTML  = sSinDatos;
                oAsistenteDom.innerHTML = sSinDatos;
                return;
            }

            var iLastTemporada  = aTemporadasConDatos[0];
            var sTemporadaName  = oTemporadaNames[iLastTemporada] || ("T" + iLastTemporada);

            var oStats = {};

            this._oRaw.goles.forEach(function (g) {
                if (!g.jornada || g.jornada.temporadaId !== iLastTemporada) { return; }
                if (g.esPropio) { return; }

                if (g.jugadorId) {
                    if (!oStats[g.jugadorId]) {
                        oStats[g.jugadorId] = { id: g.jugadorId, g: 0, a: 0, pj: 0 };
                    }
                    oStats[g.jugadorId].g++;
                }

                if (g.asistenciaJugadorId) {
                    if (!oStats[g.asistenciaJugadorId]) {
                        oStats[g.asistenciaJugadorId] = { id: g.asistenciaJugadorId, g: 0, a: 0, pj: 0 };
                    }
                    oStats[g.asistenciaJugadorId].a++;
                }
            });

            this._oRaw.jornadaJugadores.forEach(function (jj) {
                if (!jj.jornada || jj.jornada.temporadaId !== iLastTemporada) { return; }
                if (!oStats[jj.jugadorId]) {
                    oStats[jj.jugadorId] = { id: jj.jugadorId, g: 0, a: 0, pj: 0 };
                }
                oStats[jj.jugadorId].pj++;
            });

            var aList = Object.values(oStats);

            var maxG = aList.reduce(function (m, p) { return p.g > m ? p.g : m; }, 0);
            var maxA = aList.reduce(function (m, p) { return p.a > m ? p.a : m; }, 0);

            var aTopScorers   = maxG > 0 ? aList.filter(function (p) { return p.g === maxG; }) : [];
            var aTopAssisters = maxA > 0 ? aList.filter(function (p) { return p.a === maxA; }) : [];

            var oTitleG = this.byId("awardGoleadorTitle");
            var oTitleA = this.byId("awardAsistenteTitle");
            if (oTitleG) {
                oTitleG.setText(aTopScorers.length > 1 ? "Máximos Goleadores" : "Máximo Goleador");
            }
            if (oTitleA) {
                oTitleA.setText(aTopAssisters.length > 1 ? "Máximos Asistentes" : "Máximo Asistente");
            }

            var that = this;

            oGoleadorDom.innerHTML = aTopScorers.length > 0
                ? "<div class='stAwardPlayersRow'>" +
                  aTopScorers.map(function (p) {
                      return that._buildAwardContent(p, "goals", sTemporadaName);
                  }).join("") +
                  "</div>"
                : "<span class='stAwardNoData'>Sin goles esta temporada</span>";

            oAsistenteDom.innerHTML = aTopAssisters.length > 0
                ? "<div class='stAwardPlayersRow'>" +
                  aTopAssisters.map(function (p) {
                      return that._buildAwardContent(p, "assists", sTemporadaName);
                  }).join("") +
                  "</div>"
                : "<span class='stAwardNoData'>Sin asistencias esta temporada</span>";
        },

        _buildAwardContent: function (oStats, sType, sTemporadaName) {
            var oPlayer   = this._oPlayerMap[oStats.id] || {};
            var sName     = oPlayer.nombreCamiseta || ("Jugador " + oStats.id);
            var sDorsal   = oPlayer.dorsal   !== undefined ? oPlayer.dorsal   : "";
            var sPosicion = oPlayer.posicion  || "";
            var sFoto     = oPlayer.foto      || "";

            var iValue  = sType === "goals" ? oStats.g : oStats.a;
            var sLabel  = sType === "goals"
                ? (iValue === 1 ? "gol"        : "goles")
                : (iValue === 1 ? "asistencia" : "asistencias");
            var sPJLabel = oStats.pj === 1 ? "partido jugado" : "partidos jugados";

            var sImgHtml = sFoto
                ? "<img src='" + sFoto + "' class='sqPlayerImg stAwardImg' alt='" + sName + "'/>"
                : "";

            return (
                "<div class='stAwardPlayerWrapper'>" +
                    "<div class='sqPlayerCard stAwardPlayerCard sapMVBox'>" +
                        "<div class='sqPlayerImgBox sapMVBox'>" +
                            sImgHtml +
                        "</div>" +
                        "<div class='sqPlayerInfo sapMVBox'>" +
                            "<span class='sqPlayerDorsal sapMText'><span><bdi>" + sDorsal   + "</bdi></span></span>" +
                            "<span class='sqPlayerName  sapMText'><span><bdi>" + sName     + "</bdi></span></span>" +
                            "<span class='sqPlayerPos   sapMText'><span><bdi>" + sPosicion + "</bdi></span></span>" +
                        "</div>" +
                    "</div>" +

                    "<div class='stAwardSeparator'></div>" +

                    "<div class='stAwardStatText'>" +
                        "<span class='stAwardPlayerRef'>" + sName + "</span>" +
                        " ha contribuido " +
                        "<span class='stAwardStatVal'>" + iValue + "</span>" +
                        " " + sLabel + " en " +
                        "<span class='stAwardStatVal'>" + oStats.pj + "</span>" +
                        " " + sPJLabel +
                    "</div>" +
                "</div>"
            );
        },

        _renderAllSeasons: function (oViewDom) {
            var that        = this;
            var aBlocks     = Array.from(oViewDom.querySelectorAll(".stSeasonBlock"));
            var aTemporadas = [2, 1];

            aBlocks.forEach(function (oDomBlock, i) {
                that._renderSeasonBlock(oDomBlock, aTemporadas[i]);
            });
        },

        _renderSeasonBlock: function (oDomBlock, iTemporadaId) {
            if (!oDomBlock) { return; }

            var oDomContent = oDomBlock.querySelector(".stSeasonContent");
            if (!oDomContent) { return; }

            var oJornadaMap = {};
            this._oRaw.jornadaJugadores.forEach(function (jj) {
                if (!jj.jornada || jj.jornada.temporadaId !== iTemporadaId) { return; }
                if (!oJornadaMap[jj.jornadaId]) {
                    oJornadaMap[jj.jornadaId] = {
                        id:          jj.jornadaId,
                        jornada:     jj.jornada.jornada,
                        temporadaId: iTemporadaId
                    };
                }
            });

            var aJornadas = Object.values(oJornadaMap)
                .sort(function (a, b) { return a.jornada - b.jornada; });

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
                this._oCurJornada[iTemporadaId] = aJornadas[aJornadas.length - 1].jornada;
            }
            var iCur = this._oCurJornada[iTemporadaId];

            var aPlayers = this._computeStats(iTemporadaId, iCur, oJornadaMap);

            var oPrevPositions = {};
            var aJornadasNums  = aJornadas.map(function (j) { return j.jornada; });
            var iCurIdx        = aJornadasNums.indexOf(iCur);

            if (iCurIdx > 0) {
                var iPrevJor     = aJornadasNums[iCurIdx - 1];
                var aPrevPlayers = this._computeStats(iTemporadaId, iPrevJor, oJornadaMap);
                aPrevPlayers.forEach(function (p, i) {
                    oPrevPositions[p.id] = i + 1;
                });
            }

            oDomContent.innerHTML =
                this._buildJornadaBar(iTemporadaId, aJornadas, iCur) +
                this._buildTable(aPlayers, oPrevPositions);

            if (oNoDataNode) {
                oDomContent.appendChild(oNoDataNode);
            }

            var that = this;
            oDomContent.querySelectorAll(".lbJBtn").forEach(function (oBtn) {
                oBtn.addEventListener("click", function () {
                    var iTId = parseInt(oBtn.dataset.tempid,  10);
                    var iJ   = parseInt(oBtn.dataset.jornada, 10);
                    that._oCurJornada[iTId] = iJ;
                    that._renderSeasonBlock(oDomBlock, iTId);
                });
            });
        },

        _computeStats: function (iTemporadaId, iCurJornada, oJornadaMap) {

            var aJornadaIds = Object.values(oJornadaMap)
                .filter(function (j) { return j.jornada <= iCurJornada; })
                .map(function (j) { return j.id; });

            var oIdToNum = {};
            Object.values(oJornadaMap).forEach(function (j) {
                oIdToNum[j.id] = j.jornada;
            });

            var oPlayers = {};

            this._oRaw.jornadaJugadores.forEach(function (jj) {
                if (!jj.jornada || jj.jornada.temporadaId !== iTemporadaId) { return; }
                if (aJornadaIds.indexOf(jj.jornadaId) === -1) { return; }

                var iId   = jj.jugadorId;
                var sName = jj.jugador ? jj.jugador.nombreCamiseta : "Jugador " + iId;

                if (!oPlayers[iId]) {
                    oPlayers[iId] = { id: iId, name: sName, pj: 0, g: 0, a: 0, mvp: 0, mvpJornadas: [] };
                }
                oPlayers[iId].pj++;

                if (jj.esMVP) {
                    oPlayers[iId].mvp++;
                    var iJorNum = oIdToNum[jj.jornadaId];
                    if (iJorNum !== undefined) {
                        oPlayers[iId].mvpJornadas.push(iJorNum);
                    }
                }
            });

            this._oRaw.goles.forEach(function (g) {
                if (!g.jornada || g.jornada.temporadaId !== iTemporadaId) { return; }
                if (aJornadaIds.indexOf(g.jornadaId) === -1) { return; }
                if (g.esEnContra || g.esPropio) { return; }

                if (g.jugadorId) {
                    if (!oPlayers[g.jugadorId]) {
                        oPlayers[g.jugadorId] = {
                            id:   g.jugadorId,
                            name: g.jugador ? g.jugador.nombreCamiseta : "Jugador " + g.jugadorId,
                            pj: 0, g: 0, a: 0, mvp: 0, mvpJornadas: []
                        };
                    }
                    oPlayers[g.jugadorId].g++;
                }

                if (g.asistenciaJugadorId) {
                    if (!oPlayers[g.asistenciaJugadorId]) {
                        oPlayers[g.asistenciaJugadorId] = {
                            id:   g.asistenciaJugadorId,
                            name: g.asistencia ? g.asistencia.nombreCamiseta : "Jugador " + g.asistenciaJugadorId,
                            pj: 0, g: 0, a: 0, mvp: 0, mvpJornadas: []
                        };
                    }
                    oPlayers[g.asistenciaJugadorId].a++;
                }
            });

            var aList = Object.values(oPlayers).filter(function (p) {
                return p.g > 0 || p.a > 0 || p.mvp > 0;
            });

            aList.sort(function (a, b) {
                var aGA = a.g + a.a;
                var bGA = b.g + b.a;
                if (bGA !== aGA)   { return bGA - aGA; }
                if (b.g  !== a.g)  { return b.g  - a.g; }
                if (b.a  !== a.a)  { return b.a  - a.a; }
                if (a.pj !== b.pj) { return a.pj - b.pj; }
                return a.name.localeCompare(b.name);
            });

            return aList;
        },

        _buildJornadaBar: function (iTemporadaId, aJornadas, iCur) {
            var sBtns =
                "<span class='lbJornadaLabel sapMText'><span><bdi>JOR</bdi></span></span>" +
                "<div class='lbJornadaDivider sapMVBox'></div>";

            aJornadas.forEach(function (oJ) {
                var sActive = oJ.jornada === iCur ? " lbJBtnActive" : "";
                sBtns +=
                    "<button class='lbJBtn sapMBtn" + sActive + "'" +
                    " data-tempid='" + iTemporadaId + "'" +
                    " data-jornada='" + oJ.jornada + "'>" +
                        "<span class='sapMBtnInner'>" +
                            "<span class='sapMBtnContent'>" + oJ.jornada + "</span>" +
                        "</span>" +
                    "</button>";
            });

            return "<div class='lbJornadaBar sapMScrollCont'>" +
                       "<div class='lbJornadaBtns sapMHBox'>" + sBtns + "</div>" +
                   "</div>";
        },

        _buildTable: function (aPlayers, oPrevPositions) {
            var sHead =
                "<div class='lbTHead sapMHBox'>" +
                    "<span class='lbTH lbTHPos  sapMText'><span><bdi>POS</bdi></span></span>"      +
                    "<span class='lbTH lbTHTeam sapMText'><span><bdi>JUGADOR</bdi></span></span>"  +
                    "<span class='lbTH lbTHNum  sapMText'><span><bdi>PJ</bdi></span></span>"       +
                    "<span class='lbTH lbTHNum  sapMText'><span><bdi>G</bdi></span></span>"        +
                    "<span class='lbTH lbTHNum  sapMText'><span><bdi>A</bdi></span></span>"        +
                    "<span class='lbTH lbTHPts  sapMText'><span><bdi>G+A</bdi></span></span>"      +
                    "<span class='lbTH stTHMvp  sapMText'><span><bdi>MVP</bdi></span></span>"      +
                    "<span class='lbTH stTHMov  sapMText'><span><bdi>MOV</bdi></span></span>"      +
                "</div>";

            if (!aPlayers.length) {
                return sHead +
                    "<div class='stNoStatsRow'>" +
                        "<span class='stNoStatsMsg'>No hay estad&#237;sticas para esta jornada</span>" +
                    "</div>";
            }

            var that = this;
            var sRows = "";

            aPlayers.forEach(function (oP, i) {
                var bIsLast   = i === aPlayers.length - 1;
                var sRowClass = "lbTRow sapMHBox" + (bIsLast ? " lbTRowLast" : "");

                var sMvpHtml = oP.mvpJornadas.length > 0
                    ? oP.mvpJornadas
                        .sort(function (a, b) { return a - b; })
                        .map(function (j) {
                            return "<span class='stMvpStarBadge'>&#9733; J" + j + "</span>";
                        }).join("")
                    : "<span class='stMvpNoBadge'>&mdash;</span>";

                var sMovHtml = that._buildMov(oP.id, i + 1, oPrevPositions);

                sRows +=
                    "<div class='" + sRowClass + "'>" +
                        "<span class='lbTDPos  sapMText'><span><bdi>" + (i + 1) + "&#186;</bdi></span></span>" +
                        "<span class='lbTDTeam sapMText'><span><bdi>" + oP.name  + "</bdi></span></span>"      +
                        "<span class='lbTDNum  sapMText'><span><bdi>" + oP.pj    + "</bdi></span></span>"      +
                        "<span class='lbTDNum  lbTDG sapMText'><span><bdi>" + oP.g + "</bdi></span></span>"    +
                        "<span class='lbTDNum  sapMText'><span><bdi>" + oP.a     + "</bdi></span></span>"      +
                        "<span class='lbTDPts  sapMText'><span><bdi>" + (oP.g + oP.a) + "</bdi></span></span>" +
                        "<div  class='stTDMvp'>" + sMvpHtml + "</div>"                                         +
                        "<div  class='stTDMov'>" + sMovHtml + "</div>"                                         +
                    "</div>";
            });

            return sHead + sRows;
        },

        _buildMov: function (iJugadorId, iCurPos, oPrevPositions) {
            var iPrevPos = oPrevPositions[iJugadorId];

            if (iPrevPos === undefined) {
                return "<span class='stMovNewBadge'>NEW</span>";
            }

            var iDiff = iPrevPos - iCurPos;

            if (iDiff > 0) {
                return "<span class='lbTDSampleUp'>&#9650; +" + iDiff + "</span>";
            }
            if (iDiff < 0) {
                return "<span class='lbTDSampleDown'>&#9660; " + iDiff + "</span>";
            }
            return "<span class='lbTDSampleSame'>=</span>";
        },

        onToggleStats2627: function (oEvent) {
            this._toggleSeasonBlock(oEvent.getSource());
        },

        onToggleStats2526: function (oEvent) {
            this._toggleSeasonBlock(oEvent.getSource());
        },

        _toggleSeasonBlock: function (oButton) {
            var oDomCard = oButton.getDomRef();
            if (!oDomCard) { return; }

            var oDomBlock = oDomCard.closest(".stSeasonBlock");
            if (!oDomBlock) { return; }

            var oDomContent = oDomBlock.querySelector(".stSeasonContent");
            if (!oDomContent) { return; }

            var bCollapsed = oDomContent.classList.contains("cal-collapsed");
            oDomContent.classList.toggle("cal-collapsed");

            oButton.setIcon(
                bCollapsed
                    ? "sap-icon://slim-arrow-up"
                    : "sap-icon://slim-arrow-down"
            );
        }

    });
});