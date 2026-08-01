sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    var OWN_TEAM_NAME = "Chocolate Sexy";
    var sImgBase      = sap.ui.require.toUrl("chocolatesexy/project/images/");

    return BaseController.extend("chocolatesexy.project.controller.main.Main", {

        onInit: function () {
            var that = this;

            var igPost = '<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/DXry9-KjaET/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/DXry9-KjaET/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">Ver esta publicación en Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/p/DXry9-KjaET/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">Una publicación compartida de Chocolate Sexy (@chocolatesexyoficial)</a></p></div></blockquote>';

            var oModel = new JSONModel({
                igPostHtml:    igPost,
                standingsHtml: "",
                newsHtml:      "",
                ultimoPartido:  null,
                proximoPartido: null,
                hayUltimo:      false,
                hayProximo:     false
            });
            this.getView().setModel(oModel, "mainModel");

            this._oClasifData  = null;
            this._bClasifReady = false;

            Promise.all([
                fetch(
                    "/odata/v4/football/Jornadas" +
                    "?$expand=temporada,equipo,campo" +
                    "&$orderby=temporadaId%20desc,jornada%20asc"
                ).then(function (r) { return r.json(); }),

                fetch(
                    "/odata/v4/football/Clasificaciones" +
                    "?$expand=equipo,temporada" +
                    "&$orderby=temporadaId%20asc,jornada%20asc"
                ).then(function (r) { return r.json(); }),

                fetch(
                    "/odata/v4/football/Noticias" +
                    "?$orderby=fecha%20desc" +
                    "&$top=5" +
                    "&$select=id,tipo,titulo,subtitulo,fecha"
                ).then(function (r) { return r.json(); })
            ])
            .then(function (aResults) {
                that._procesarJornadas(aResults[0].value || []);
                that._procesarClasificaciones(aResults[1].value || []);
                that._bClasifReady = true;
                that._updateStandingsModel();
                that._procesarNoticias(aResults[2].value || []);
            })
            .catch(function (e) { console.error("Error cargando datos Main:", e); });

            this._currentNewsPage = 0;
            this._lastNoticias    = [];
            window._csSetNewsPage = function (nPage) {
                that._currentNewsPage = nPage;
                var sHtml = that._buildNewsHtml(that._lastNoticias, nPage);
                that.getView().getModel("mainModel").setProperty("/newsHtml", sHtml);
            };

            window._csOpenNews = function (iId) {
                that.getOwnerComponent().getRouter().navTo("RouteNewsDetail", { id: iId });
            };

            this.getView().addEventDelegate({
                onAfterRendering: function () {
                    if (window.instgrm && window.instgrm.Embeds) {
                        window.instgrm.Embeds.process();
                    }
                }
            });
        },

        _procesarNoticias: function (aNoticias) {
            this._lastNoticias    = aNoticias;
            this._currentNewsPage = 0;
            var sHtml = this._buildNewsHtml(aNoticias, 0);
            this.getView().getModel("mainModel").setProperty("/newsHtml", sHtml);
        },

        _getTipoConfig: function (sTipo) {
            var mCfg = {
                lesion:       { emoji: "\uD83C\uDFE5", label: "JUGADOR",    emojiBg: "#ffd5d5", bg: "#fecaca", color: "#991b1b" },
                jugador:      { emoji: "\uD83D\uDC55", label: "JUGADOR",    emojiBg: "#c8f5d8", bg: "#bbf7d0", color: "#166534" },
                fichaje:      { emoji: "\u270D\uFE0F", label: "JUGADOR",    emojiBg: "#fde68a", bg: "#fde68a", color: "#92400e" },
                baja:         { emoji: "\uD83D\uDC4B", label: "JUGADOR",    emojiBg: "#fed7aa", bg: "#fed7aa", color: "#9a3412" },
                sancion:      { emoji: "\uD83D\uDFE8", label: "JUGADOR",    emojiBg: "#fecaca", bg: "#fca5a5", color: "#7f1d1d" },
                convocatoria: { emoji: "\uD83D\uDCCB", label: "PARTIDOS",   emojiBg: "#e9d5ff", bg: "#e9d5ff", color: "#6b21a8" },
                resultado:    { emoji: "\u26BD",        label: "PARTIDOS",   emojiBg: "#bfdbfe", bg: "#bfdbfe", color: "#1e40af" },
                lineacion:    { emoji: "\uD83D\uDCCB",  label: "PARTIDOS",   emojiBg: "#bfdbfe", bg: "#bfdbfe", color: "#1e40af" },
                comunicado:   { emoji: "\uD83D\uDCE2", label: "COMUNICADO", emojiBg: "#782c47", bg: "#611a32", color: "#ffffff", imgSrc: sImgBase + "escudo.png" },
                app:          { emoji: "\u2699\uFE0F", label: "APP",        emojiBg: "#e5e7eb", bg: "#e5e7eb", color: "#374151" }
            };
            var sKey = (sTipo || "").toLowerCase().trim();
            return mCfg[sKey] || { emoji: "\uD83D\uDCE2", label: "COMUNICADO", emojiBg: "#e5e7eb", bg: "#e5e7eb", color: "#374151" };
        },

        _formatFechaNoticia: function (sIsoFecha) {
            if (!sIsoFecha) { return ""; }
            var d = new Date(sIsoFecha);
            if (isNaN(d.getTime())) { return sIsoFecha; }
            var dd = String(d.getDate()).padStart(2, "0");
            var mm = String(d.getMonth() + 1).padStart(2, "0");
            var yy = String(d.getFullYear()).slice(2);
            return dd + "/" + mm + "/" + yy;
        },

        _buildNewsHtml: function (aNoticias, nPage) {
            var ITEMS_PER_PAGE = 6;
            nPage = nPage || 0;

            if (!aNoticias || !aNoticias.length) {
                return "<div style='font-size:1.05rem;color:#9ca3af;text-align:center;" +
                       "font-style:italic;padding:2rem 0;width:100%;'>No hay noticias disponibles</div>";
            }

            var that = this;

            var oGroups = {};
            var aFechas = [];
            aNoticias.forEach(function (n) {
                var sFL = that._formatFechaNoticia(n.fecha);
                if (!oGroups[sFL]) { oGroups[sFL] = []; aFechas.push(sFL); }
                oGroups[sFL].push(n);
            });
            var aFlat = [];
            aFechas.forEach(function (sF) {
                oGroups[sF].forEach(function (n) { aFlat.push({ fechaLabel: sF, n: n }); });
            });

            var nTotal = aFlat.length;
            var nPages = Math.ceil(nTotal / ITEMS_PER_PAGE);
            nPage = Math.max(0, Math.min(nPage, nPages - 1));
            var aPageItems = aFlat.slice(nPage * ITEMS_PER_PAGE, (nPage + 1) * ITEMS_PER_PAGE);

            var sDGS = "display:flex;flex-direction:column;margin-bottom:1rem;gap:8px;";
            var sDHS = "display:flex;justify-content:flex-end;padding:0.8rem 15px 0.6rem 0;" +
                       "margin:0 1.1rem;border-bottom:2px solid #c4c4c4;";
            var sDLS = "font-size:1rem;color:#6b7280;font-weight:700;flex-shrink:0;letter-spacing:0.3px;";
            var sCTS = "display:flex;flex-direction:column;justify-content:center;" +
                       "padding:0.65rem 0.9rem;flex:1;min-width:0;gap:0.2rem;";
            var sTIS = "font-size:0.88rem;font-weight:800;color:#111827;letter-spacing:0.3px;" +
                       "text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
            var sSUS = "font-size:0.82rem;font-weight:500;color:#6b7280;line-height:1.35;";

            var sCardsHtml = "";
            var sLastFecha = null;

            aPageItems.forEach(function (item) {
                if (item.fechaLabel !== sLastFecha) {
                    if (sLastFecha !== null) { sCardsHtml += "</div>"; }
                    sCardsHtml += "<div style='" + sDGS + "'>" +
                                  "<div style='" + sDHS + "'><span style='" + sDLS + "'>" +
                                      item.fechaLabel + "</span></div>";
                    sLastFecha = item.fechaLabel;
                }

                var n    = item.n;
                var oCfg = that._getTipoConfig(n.tipo);
                var sOC  = " onclick=\"window._csOpenNews(" + n.id + ")\"";

                var sCard =
                    "display:flex;align-items:stretch;border-radius:14px;overflow:hidden;" +
                    "background:#ffffff;box-shadow:0 2px 10px rgba(0,0,0,0.07);" +
                    "border:1px solid #f3f4f6;min-height:80px;margin:0 1.2rem 0;" +
                    "transition:transform 0.22s ease,box-shadow 0.22s ease;cursor:pointer;";

                var sEB = "display:flex;align-items:center;justify-content:center;" +
                          "flex-shrink:0;width:72px;min-width:72px;background:" + oCfg.emojiBg + ";";

                var sIcon = oCfg.imgSrc
                    ? "<img src='" + oCfg.imgSrc + "' style='width:44px;height:44px;object-fit:contain;border-radius:50%;'>"
                    : "<span style='font-size:2.2rem;line-height:1;text-align:center;'>" + oCfg.emoji + "</span>";

                sCardsHtml +=
                    "<div style='" + sCard + "'" + sOC +
                    " onmouseover=\"this.style.transform='scale(1.025)';this.style.boxShadow='0 6px 22px rgba(97,26,50,0.18)';\"" +
                    " onmouseout=\"this.style.transform='scale(1)';this.style.boxShadow='0 2px 10px rgba(0,0,0,0.07)';\">" +
                        "<div style='" + sEB + "'>" + sIcon + "</div>" +
                        "<div style='" + sCTS + "'>" +
                            "<span style='" + sTIS + "'>" + n.titulo + "</span>" +
                            "<span style='" + sSUS + "'>" + n.subtitulo + "</span>" +
                        "</div>" +
                    "</div>";
            });

            if (sLastFecha !== null) { sCardsHtml += "</div>"; }

            var sPagination = "";
            if (nPages > 1) {
                var sPagWrap =
                    "display:flex;justify-content:center;align-items:center;" +
                    "gap:6px;padding:0.9rem 1.2rem 0.6rem;flex-wrap:wrap;";
                sPagination = "<div style='" + sPagWrap + "'>";
                for (var i = 0; i < nPages; i++) {
                    var bA = i === nPage;
                    var sBtnStyle =
                        "border-radius:8px;padding:0.3rem 0.75rem;font-size:0.85rem;" +
                        "font-weight:700;cursor:pointer;min-width:36px;" +
                        "border:1.5px solid #611a32;" +
                        "transition:background 0.15s ease,color 0.15s ease;" +
                        (bA ? "background:#611a32;color:#ffffff;" : "background:#ffffff;color:#611a32;");
                    sPagination +=
                        "<button style='" + sBtnStyle + "' " +
                        "onclick='window._csSetNewsPage(" + i + ")'>" + (i + 1) + "</button>";
                }
                sPagination += "</div>";
            }

            return "<div style='width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;'>" +
                       "<div style='padding-top:0.5rem;" + (nPages > 1 ? "min-height:580px;" : "") + "'>" + sCardsHtml + "</div>" +
                       sPagination +
                   "</div>";
        },

        _procesarJornadas: function (aPartidos) {
            var that      = this;
            var aEnr      = aPartidos.map(function (p) { return that._enriquecer(p); });
            var aJugados  = aEnr.filter(function (p) { return !p.esPendiente; });
            var aPending  = aEnr.filter(function (p) { return  p.esPendiente; });

            var oModel = this.getView().getModel("mainModel");
            oModel.setProperty("/ultimoPartido",  aJugados.length ? aJugados[aJugados.length - 1] : null);
            oModel.setProperty("/proximoPartido", aPending.length  ? aPending[0]                   : null);
            oModel.setProperty("/hayUltimo",  !!aJugados.length);
            oModel.setProperty("/hayProximo", !!aPending.length);
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

        _updateStandingsModel: function () {
            var sHtml = this._buildMiniStandingsHtml();
            this.getView().getModel("mainModel").setProperty("/standingsHtml", sHtml);
        },

        _buildUltimos3: function (oData, iEquipoId, iCur, aJornadas) {
            var iCurIdx = aJornadas.indexOf(iCur);
            var aLast3  = aJornadas.slice(Math.max(0, iCurIdx - 2), iCurIdx + 1);

            return aLast3.map(function (j) {
                var iPrevIdx = aJornadas.indexOf(j) - 1;
                var iPrevJor = iPrevIdx >= 0 ? aJornadas[iPrevIdx] : null;

                var oActual = (oData[j] || []).find(function (c) { return c.equipoId === iEquipoId; });
                if (!oActual) { return ""; }

                var oPrev = null;
                if (iPrevJor !== null) {
                    oPrev = (oData[iPrevJor] || []).find(function (c) { return c.equipoId === iEquipoId; }) || null;
                }

                var gDiff = (oActual.partidosGanados   || 0) - (oPrev ? (oPrev.partidosGanados   || 0) : 0);
                var eDiff = (oActual.partidosEmpatados || 0) - (oPrev ? (oPrev.partidosEmpatados || 0) : 0);
                var pDiff = (oActual.partidosPerdidos  || 0) - (oPrev ? (oPrev.partidosPerdidos  || 0) : 0);

                var sImgStyle = "width:24px;height:24px;object-fit:contain;border-radius:4px;flex-shrink:0;display:inline-block";
                if (gDiff > 0) { return "<img src='" + sImgBase + "victoria.png' style='" + sImgStyle + "' title='Victoria'/>"; }
                if (eDiff > 0) { return "<img src='" + sImgBase + "empate.png'   style='" + sImgStyle + "' title='Empate'/>"; }
                if (pDiff > 0) { return "<img src='" + sImgBase + "derrota.png'  style='" + sImgStyle + "' title='Derrota'/>"; }
                return "";
            }).join("");
        },

        _buildMiniStandingsHtml: function () {
            var that = this;

            if (!this._oClasifData) { return ""; }

            var oData = this._oClasifData[1];
            if (!oData) {
                return "<div class='calNoDataMsg'>Sin datos de clasificación</div>";
            }

            var aJornadas = Object.keys(oData).map(Number).sort(function (a, b) { return a - b; });
            if (!aJornadas.length) {
                return "<div class='calNoDataMsg'>Sin datos de clasificación</div>";
            }

            var iLastJor = aJornadas[aJornadas.length - 1];

            var aEquipos = (oData[iLastJor] || []).map(function (c) {
                var iDG = (c.golesAFavor || 0) - (c.golesEnContra || 0);
                return {
                    nombre:   c.equipo ? c.equipo.nombre : "Equipo " + c.equipoId,
                    equipoId: c.equipoId,
                    puntos:   c.puntos || 0,
                    pj:       iLastJor,
                    dg:       iDG,
                    dgText:   iDG >= 0 ? "+" + iDG : "" + iDG
                };
            });

            aEquipos.sort(function (a, b) {
                if (b.puntos !== a.puntos) { return b.puntos - a.puntos; }
                if (b.dg     !== a.dg)     { return b.dg     - a.dg;     }
                return a.nombre.localeCompare(b.nombre);
            });

            var iOwnIdx = aEquipos.findIndex(function (e) { return e.nombre === OWN_TEAM_NAME; });
            if (iOwnIdx === -1) {
                return "<div class='calNoDataMsg'>Sin datos de clasificación</div>";
            }

            var aIdxs = [];
            if (iOwnIdx > 0)                   { aIdxs.push(iOwnIdx - 1); }
            aIdxs.push(iOwnIdx);
            if (iOwnIdx < aEquipos.length - 1) { aIdxs.push(iOwnIdx + 1); }

            var sPos  = "style='width:46px;flex:0 0 46px'";
            var sTeam = "style='flex:1 1 auto;min-width:0;width:auto'";
            var sPts  = "style='width:56px;flex:0 0 56px'";
            var sUlt  = "style='width:106px;flex:0 0 106px'";

            var sHead =
                "<div class='lbTHead sapMHBox'>" +
                    "<span class='lbTH lbTHPos  sapMText' " + sPos  + "><span><bdi>POS</bdi></span></span>" +
                    "<span class='lbTH lbTHTeam sapMText' " + sTeam + "><span><bdi>EQUIPO</bdi></span></span>" +
                    "<span class='lbTH lbTHPts  sapMText' " + sPts  + "><span><bdi>PTS</bdi></span></span>" +
                    "<span class='lbTH lbTHLast sapMText' " + sUlt  + "><span><bdi>ÚLTIMOS 3</bdi></span></span>" +
                "</div>";

            var sRows = aIdxs.map(function (iIdx) {
                var e       = aEquipos[iIdx];
                var bPropio = e.nombre === OWN_TEAM_NAME;
                var bLast   = iIdx === aIdxs[aIdxs.length - 1];
                var sUlt3   = that._buildUltimos3(oData, e.equipoId, iLastJor, aJornadas);

                var sRowCls  = "lbTRowDyn lbTRow sapMHBox" +
                               (bPropio ? " lbTRowOwn"  : "") +
                               (bLast   ? " lbTRowLast" : "");

                var sPosExtra  = bPropio ? " lbTDPosOwn"  : "";
                var sTeamExtra = bPropio ? " lbTDTeamOwn" : "";
                var sPtsExtra  = bPropio ? " lbTDPtsOwn"  : "";

                return "<div class='" + sRowCls + "'>" +
                    "<span class='lbTDPos"  + sPosExtra  + " sapMText' " + sPos  + "><span><bdi>" + (iIdx + 1) + "º</bdi></span></span>" +
                    "<span class='lbTDTeam" + sTeamExtra + " sapMText' " + sTeam + "><span><bdi>" + e.nombre   + "</bdi></span></span>" +
                    "<span class='lbTDPts"  + sPtsExtra  + " sapMText' " + sPts  + "><span><bdi>" + e.puntos   + "</bdi></span></span>" +
                    "<div class='lbLastCol sapMHBox' "                   + sUlt  + ">" + sUlt3 + "</div>" +
                "</div>";
            }).join("");

            return sHead + sRows;
        },

        onAfterRendering: function () {
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        }

    });
});