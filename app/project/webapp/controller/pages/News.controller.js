sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("chocolatesexy.project.controller.news.News", {

        onInit: function () {
            var that = this;

            var oModel = new JSONModel({
                newsHtml:      "",
                esDetalle:     false,
                titulo:        "",
                subtitulo:     "",
                tipoHtml:      "",
                fechaLabel:    "",
                contenidoHtml: "",
                imagenUrl:     "",
                hasLink:       false
            });
            this.getView().setModel(oModel, "newsModel");

            this.getOwnerComponent().getRouter()
                .getRoute("RouteNews")
                .attachMatched(this._onRouteLista, this);

            this.getOwnerComponent().getRouter()
                .getRoute("RouteNewsDetail")
                .attachMatched(this._onRouteDetalle, this);

            window._csOpenNews = function (iId) {
                that.getOwnerComponent().getRouter().navTo("RouteNewsDetail", { id: iId });
            };
        },

        _onRouteLista: function () {
            this.getView().getModel("newsModel").setProperty("/esDetalle", false);
            this._cargarLista();
        },

        _onRouteDetalle: function (oEvent) {
            var iId = parseInt(oEvent.getParameter("arguments").id, 10);
            this.getView().getModel("newsModel").setProperty("/esDetalle", true);
            this._cargarDetalle(iId);
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMain");
        },

        _cargarLista: function () {
            var that = this;
            fetch("/odata/v4/football/Noticias?$orderby=fecha%20desc&$select=id,tipo,titulo,subtitulo,fecha")
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    var sHtml = that._buildListaHtml(data.value || []);
                    that.getView().getModel("newsModel").setProperty("/newsHtml", sHtml);
                })
                .catch(function (e) { console.error("Error cargando noticias:", e); });
        },

        _cargarDetalle: function (iId) {
            var that = this;
            fetch("/odata/v4/football/Noticias(" + iId + ")")
                .then(function (r) { return r.json(); })
                .then(function (n) {
                    var oCfg   = that._getTipoConfig(n.tipo);
                    var sFecha = that._formatFecha(n.fecha);

                    var sTexto = (n.contenido || "Sin contenido disponible.")
                        .replace(/&/g,  "&amp;")
                        .replace(/</g,  "&lt;")
                        .replace(/>/g,  "&gt;")
                        .replace(/\n\n/g, "</p><p class='ndParagraph'>")
                        .replace(/\n/g,   "<br>");

                    var sContenidoHtml = "<div class='ndContenidoText'><p class='ndParagraph'>" + sTexto + "</p></div>";

                    var sTipoHtml = "<span class='ndTipoTag' style='background:" + oCfg.bg + ";color:" + oCfg.color + ";'>"
                                  + oCfg.emoji + " " + oCfg.label + "</span>";

                    var sImagen = n.foto || "images/logo.jpg";

                    var oModel = that.getView().getModel("newsModel");
                    oModel.setProperty("/titulo",        n.titulo    || "");
                    oModel.setProperty("/subtitulo",     n.subtitulo || "");
                    oModel.setProperty("/tipoHtml",      sTipoHtml);
                    oModel.setProperty("/fechaLabel",    sFecha);
                    oModel.setProperty("/contenidoHtml", sContenidoHtml);
                    oModel.setProperty("/imagenUrl",     sImagen);
                    oModel.setProperty("/hasLink",       false);
                })
                .catch(function (e) { console.error("Error cargando noticia:", e); });
        },

        _buildListaHtml: function (aNoticias) {
            if (!aNoticias || !aNoticias.length) {
                return "<div style='font-size:1.05rem;color:#9ca3af;text-align:center;font-style:italic;padding:2rem 0;width:100%;'>No hay noticias disponibles</div>";
            }

            var that = this;
            var oGroups = {};
            var aFechas = [];

            aNoticias.forEach(function (n) {
                var sFL = that._formatFecha(n.fecha);
                if (!oGroups[sFL]) { oGroups[sFL] = []; aFechas.push(sFL); }
                oGroups[sFL].push(n);
            });

            var sHtml = "<div style='width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;'><div style='padding-top:0.5rem;'>";

            aFechas.forEach(function (sFecha) {
                sHtml += "<div style='display:flex;flex-direction:column;margin-bottom:1rem;gap:8px;'>";
                sHtml += "<div style='display:flex;justify-content:flex-end;padding:0.8rem 15px 0.6rem 0;margin:0 1.1rem;border-bottom:2px solid #c4c4c4;'>";
                sHtml += "<span style='font-size:1rem;color:#6b7280;font-weight:700;letter-spacing:0.3px;'>" + sFecha + "</span></div>";

                oGroups[sFecha].forEach(function (n) {
                    var oCfg = that._getTipoConfig(n.tipo);
                    var sIcon = oCfg.imgSrc
                        ? "<img src='" + oCfg.imgSrc + "' style='width:44px;height:44px;object-fit:contain;border-radius:50%;'>"
                        : "<span style='font-size:2.2rem;line-height:1;'>" + oCfg.emoji + "</span>";

                    sHtml += "<div style='display:flex;align-items:stretch;border-radius:14px;overflow:hidden;background:#ffffff;"
                           + "box-shadow:0 2px 10px rgba(0,0,0,0.07);border:1px solid #f3f4f6;min-height:80px;margin:0 1.2rem;"
                           + "cursor:pointer;transition:transform 0.22s ease,box-shadow 0.22s ease;'"
                           + " onclick=\"window._csOpenNews(" + n.id + ")\""
                           + " onmouseover=\"this.style.transform='scale(1.025)';this.style.boxShadow='0 6px 22px rgba(97,26,50,0.18)';\""
                           + " onmouseout=\"this.style.transform='scale(1)';this.style.boxShadow='0 2px 10px rgba(0,0,0,0.07)';\">";
                    sHtml += "<div style='display:flex;align-items:center;justify-content:center;flex-shrink:0;width:72px;min-width:72px;background:" + oCfg.emojiBg + ";'>" + sIcon + "</div>";
                    sHtml += "<div style='display:flex;flex-direction:column;justify-content:center;padding:0.65rem 0.9rem;flex:1;min-width:0;gap:0.2rem;'>";
                    sHtml += "<span style='font-size:0.88rem;font-weight:800;color:#111827;letter-spacing:0.3px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>" + n.titulo + "</span>";
                    sHtml += "<span style='font-size:0.82rem;font-weight:500;color:#6b7280;line-height:1.35;'>" + n.subtitulo + "</span>";
                    sHtml += "</div></div>";
                });

                sHtml += "</div>";
            });

            sHtml += "</div></div>";
            return sHtml;
        },

        _getTipoConfig: function (sTipo) {
            var sImgBase = sap.ui.require.toUrl("chocolatesexy/project/images/");
            var mCfg = {
                lesion:       { emoji: "\uD83C\uDFE5", label: "JUGADOR",    emojiBg: "#ffd5d5", bg: "#fecaca", color: "#991b1b" },
                jugador:      { emoji: "\uD83D\uDC55", label: "JUGADOR",    emojiBg: "#c8f5d8", bg: "#bbf7d0", color: "#166534" },
                fichaje:      { emoji: "\u270D\uFE0F", label: "JUGADOR",    emojiBg: "#fde68a", bg: "#fde68a", color: "#92400e" },
                baja:         { emoji: "\uD83D\uDC4B", label: "JUGADOR",    emojiBg: "#fed7aa", bg: "#fed7aa", color: "#9a3412" },
                sancion:      { emoji: "\uD83D\uDFE8", label: "JUGADOR",    emojiBg: "#fecaca", bg: "#fca5a5", color: "#7f1d1d" },

                convocatoria: { emoji: "\uD83D\uDCCB", label: "PARTIDOS",   emojiBg: "#e9d5ff", bg: "#e9d5ff", color: "#6b21a8" },
                resultado:    { emoji: "\u26BD",        label: "PARTIDOS",   emojiBg: "#bfdbfe", bg: "#bfdbfe", color: "#1e40af" },
                lineacion:    { emoji: "\uD83D\uDCCB",  label: "PARTIDOS",   emojiBg: "#bfdbfe", bg: "#bfdbfe", color: "#1e40af" },

                comunicado:   { emoji: "\uD83D\uDCE2", label: "COMUNICADO", emojiBg: "#782c47", bg: "#611a32", color: "#ffffff",
                                imgSrc: sImgBase + "logo.jpg" },

                app:          { emoji: "\u2699\uFE0F", label: "APP",        emojiBg: "#e5e7eb", bg: "#e5e7eb", color: "#374151" }
            };
            var sKey = (sTipo || "").toLowerCase().trim();
            return mCfg[sKey] || { emoji: "\uD83D\uDCE2", label: "COMUNICADO", emojiBg: "#e5e7eb", bg: "#e5e7eb", color: "#374151" };
        },

        _formatFecha: function (sIso) {
            if (!sIso) { return ""; }
            var d = new Date(sIso);
            if (isNaN(d.getTime())) { return sIso; }
            var dd   = String(d.getDate()).padStart(2, "0");
            var mm   = String(d.getMonth() + 1).padStart(2, "0");
            var yyyy = d.getFullYear();
            return dd + "/" + mm + "/" + yyyy;
        }

    });
});