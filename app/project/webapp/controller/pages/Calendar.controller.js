sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController"
], function (BaseController) {
    "use strict";

    var MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    var MONTHS_FULL  = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

    var _aCalState = [];

    return BaseController.extend("chocolatesexy.project.controller.pages.Calendar", {

        onInit: function () {
            this.getView().addEventDelegate({
                onAfterRendering: this._renderAllMiniCalendars.bind(this)
            });
        },

        onToggleSeasonBlock: function (oEvent) {
            var oButton      = oEvent.getSource();
            var oHeader      = oButton.getParent();          
            var oSeasonBlock = oHeader.getParent();         
            var oContent     = oSeasonBlock.getItems()[1];   
            var oDomContent  = oContent.getDomRef();

            if (!oDomContent) return;

            var bWasCollapsed = oDomContent.classList.contains("cal-collapsed");
            oDomContent.classList.toggle("cal-collapsed");

            oButton.setIcon(bWasCollapsed
                ? "sap-icon://navigation-up-arrow"
                : "sap-icon://navigation-down-arrow"
            );

            var oViewDom = this.getView().getDomRef();
            if (oViewDom) {
                var aSeasonBlocks = Array.from(oViewDom.querySelectorAll(".calMidCol .calSeasonBlock"));
                var aMiniPanels   = Array.from(oViewDom.querySelectorAll(".calRightCol .calMiniCalsPanel"));
                var oDomSeasonBlock = oSeasonBlock.getDomRef();
                var iIdx = aSeasonBlocks.indexOf(oDomSeasonBlock);
                if (iIdx !== -1 && aMiniPanels[iIdx]) {
                    if (bWasCollapsed) {
                        aMiniPanels[iIdx].classList.remove("cal-mini-collapsed");
                    } else {
                        aMiniPanels[iIdx].classList.add("cal-mini-collapsed");
                    }
                }
            }
        },

        _renderAllMiniCalendars: function () {
            var oViewDom = this.getView().getDomRef();
            if (!oViewDom) return;

            _aCalState = [];

            var aSeasonBlocks = Array.from(oViewDom.querySelectorAll(".calMidCol .calSeasonBlock"));
            var aMiniPanels   = Array.from(oViewDom.querySelectorAll(".calRightCol .calMiniCalsPanel"));

            aSeasonBlocks.forEach(function (oDomSeasonBlock, iPanelIdx) {
                var oDomSeasonContent = oDomSeasonBlock.querySelector(".calSeasonContent");
                var oDomMiniPanel     = aMiniPanels[iPanelIdx];

                if (!oDomSeasonContent || !oDomMiniPanel) return;

                var aMatches = this._parseMatchesFromDOM(oDomSeasonContent);

                var oMonthMap = {};
                aMatches.forEach(function (m) {
                    var sKey = m.year + "-" + String(m.month).padStart(2, "0");
                    if (!oMonthMap[sKey]) {
                        oMonthMap[sKey] = { year: m.year, month: m.month, matches: [] };
                    }
                    oMonthMap[sKey].matches.push(m);
                });

                var aSortedMonths = Object.values(oMonthMap).sort(function (a, b) {
                    return a.year !== b.year ? a.year - b.year : a.month - b.month;
                });

                if (!aSortedMonths.length) return;

                _aCalState[iPanelIdx] = { months: aSortedMonths, currentIdx: 0 };
                this._renderWidget(oDomMiniPanel, oDomSeasonContent, iPanelIdx);

            }.bind(this));
        },

        _renderWidget: function (oDomMiniPanel, oDomSeasonContent, iPanelIdx) {
            var oState  = _aCalState[iPanelIdx];
            var oData   = oState.months[oState.currentIdx];
            var bFirst  = (oState.currentIdx === 0);
            var bLast   = (oState.currentIdx === oState.months.length - 1);

            var sCalHTML = this._buildCalendarHTML(oData);

            var sHTML =
                "<div class='calMiniWidget'>" +
                "  <div class='calMiniWidgetHeader'>" +
                "    <span class='calMiniWidgetIcon'>◷</span>" +
                "    <span class='calMiniWidgetTitle'>Calendario</span>" +
                "  </div>" +
                "  <div class='calMiniWidgetBody'>" +
                "    <div class='calMiniNav'>" +
                "      <button class='calMiniNavBtn" + (bFirst ? " calMiniNavBtnDisabled" : "") + "'" +
                "        data-panel-idx='" + iPanelIdx + "' data-dir='-1'" +
                "        " + (bFirst ? "disabled" : "") + ">&#8249;</button>" +
                "      <span class='calMiniNavLabel'>" + MONTHS_FULL[oData.month] + " " + oData.year + "</span>" +
                "      <button class='calMiniNavBtn" + (bLast ? " calMiniNavBtnDisabled" : "") + "'" +
                "        data-panel-idx='" + iPanelIdx + "' data-dir='1'" +
                "        " + (bLast ? "disabled" : "") + ">&#8250;</button>" +
                "    </div>" +
                "    <div class='calMiniCalGrid'>" + sCalHTML + "</div>" +
                "    <div class='calMiniLegend'>" +
                "      <div class='calMiniLegendItem'><span class='cmcDot cmcVictoria'></span>Victoria</div>" +
                "      <div class='calMiniLegendItem'><span class='cmcDot cmcEmpate'></span>Empate</div>" +
                "      <div class='calMiniLegendItem'><span class='cmcDot cmcDerrota'></span>Derrota</div>" +
                "      <div class='calMiniLegendItem'><span class='cmcDot cmcPendiente'></span>Pendiente</div>" +
                "    </div>" +
                "  </div>" +
                "</div>";

            oDomMiniPanel.innerHTML = sHTML;

            oDomMiniPanel.querySelectorAll(".calMiniNavBtn").forEach(function (oBtn) {
                if (oBtn.disabled) return;
                oBtn.addEventListener("click", function () {
                    var iIdx = parseInt(oBtn.getAttribute("data-panel-idx"), 10);
                    var iDir = parseInt(oBtn.getAttribute("data-dir"), 10);
                    _aCalState[iIdx].currentIdx += iDir;
                    this._renderWidget(oDomMiniPanel, oDomSeasonContent, iIdx);
                }.bind(this));
            }.bind(this));

            var aCards = Array.from(oDomSeasonContent.querySelectorAll(".calMatchCard"));
            oDomMiniPanel.querySelectorAll("[data-card-idx]").forEach(function (oEl) {
                oEl.addEventListener("click", function () {
                    var iIdx  = parseInt(oEl.getAttribute("data-card-idx"), 10);
                    var oCard = aCards[iIdx];
                    if (!oCard) return;
                    oCard.scrollIntoView({ behavior: "smooth", block: "center" });
                    oCard.classList.add("calMatchHighlight");
                    setTimeout(function () { oCard.classList.remove("calMatchHighlight"); }, 1800);
                });
            });
        },

        _buildCalendarHTML: function (oData) {
            var iYear    = oData.year;
            var iMonth   = oData.month;
            var aMatches = oData.matches;

            var oByDay = {};
            aMatches.forEach(function (m) { oByDay[m.day] = m; });

            var iRawFirst    = new Date(iYear, iMonth, 1).getDay();
            var iOffset      = (iRawFirst === 0) ? 6 : iRawFirst - 1;
            var iDaysInMonth = new Date(iYear, iMonth + 1, 0).getDate();

            var sCells = ["L","M","X","J","V","S","D"].map(function (d) {
                return "<div class='cmcDh'>" + d + "</div>";
            }).join("");

            for (var e = 0; e < iOffset; e++) {
                sCells += "<div class='cmcDc'></div>";
            }

            for (var d = 1; d <= iDaysInMonth; d++) {
                var iDow   = new Date(iYear, iMonth, d).getDay();
                var oMatch = oByDay[d];

                if (oMatch) {
                    var sResultClass = this._resultClass(oMatch.result);
                    sCells += "<div class='cmcDc cmcMatch " + sResultClass + "'" +
                              " data-card-idx='" + oMatch.cardIdx + "'" +
                              " title='J" + oMatch.jornada + " · " + oMatch.result + " – ver partido'>" +
                              "J" + oMatch.jornada + "</div>";
                } else if (iDow === 0) {
                    sCells += "<div class='cmcDc cmcSun'>" + d + "</div>";
                } else {
                    sCells += "<div class='cmcDc'>" + d + "</div>";
                }
            }

            return sCells;
        },

        _parseMatchesFromDOM: function (oDomSeasonContent) {
            var aResult = [];
            var aCards  = Array.from(oDomSeasonContent.querySelectorAll(".calMatchCard"));

            aCards.forEach(function (oDomCard, iIdx) {
                var oJornadaEl = oDomCard.querySelector(".calJornada");
                var oBadgeEl   = oDomCard.querySelector(".calBadge");
                var aInfoEls   = oDomCard.querySelectorAll(".calInfoText");
                if (!oJornadaEl || !aInfoEls.length) return;

                var iJornada = this._parseJornada(oJornadaEl.textContent || "");
                var oDate    = this._parseMatchDate(aInfoEls[0].textContent || "");
                var sResult  = oBadgeEl ? (oBadgeEl.textContent || "PENDIENTE").trim() : "PENDIENTE";

                if (!oDate || iJornada === 0) return;

                aResult.push({
                    day:     oDate.day,
                    month:   oDate.month,
                    year:    oDate.year,
                    jornada: iJornada,
                    result:  sResult,
                    cardIdx: iIdx
                });
            }.bind(this));

            return aResult;
        },

        _resultClass: function (sResult) {
            var s = (sResult || "").toUpperCase();
            if (s === "VICTORIA") return "cmcVictoria";
            if (s === "EMPATE")   return "cmcEmpate";
            if (s === "DERROTA")  return "cmcDerrota";
            return "cmcPendiente";
        },

        _parseJornada: function (sText) {
            var oM = sText.match(/\d+/);
            return oM ? parseInt(oM[0], 10) : 0;
        },

        _parseMatchDate: function (sText) {
            try {
                var sPart       = sText.split("·")[0].trim();
                var sAfterComma = sPart.split(",")[1].trim();
                var aParts      = sAfterComma.split(/\s+/);
                var iDay        = parseInt(aParts[0], 10);
                var iMonth      = MONTHS_SHORT.indexOf(aParts[1]);
                var iYear       = parseInt(aParts[2], 10);
                if (isNaN(iDay) || iMonth === -1 || isNaN(iYear)) return null;
                return { day: iDay, month: iMonth, year: iYear };
            } catch (e) {
                return null;
            }
        }

    });
});