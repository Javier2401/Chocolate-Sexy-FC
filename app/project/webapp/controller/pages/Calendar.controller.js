sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController",
    "sap/ui/unified/CalendarAppointment"
], function (BaseController, CalendarAppointment) {
    "use strict";

    return BaseController.extend("chocolatesexy.project.controller.pages.Calendar", {

        onInit: function () {
            this.getView().attachAfterRendering(this._populateCalendar.bind(this));
        },

        _populateCalendar: function () {
            var oCalendar = this.byId("planningCalendar");
            if (!oCalendar || oCalendar.getAppointments().length > 0) {
                return;
            }

            var aOpponents = [
                "Real Valencia", "Yellow FC", "Águilas City", "VFC United",
                "Los Leones", "Deportivo Sur", "FC Norte", "Atlético Centro",
                "Racing Club", "Sporting FC", "Club Marino", "Estrella FC",
                "CD Esperanza", "Atlético Rojo", "Unión Norte", "Sporting Sur"
            ];

            var aLocations = [
                "Campo Municipal", "Estadio Central", "Campo Norte",
                "Polideportivo Sur", "Campo Los Pinos", "Campo Rivera",
                "Estadio Nuevo"
            ];

            var aCompetitions = [
                "Liga · J", "Liga · J", "Liga · J", "Copa", "Amistoso"
            ];

            var aTypes = [
                "Type01", "Type01", "Type01", "Type02", "Type08"
            ];

            var oCurrent = new Date();
            var iDay    = oCurrent.getDay();
            var iDiff   = (7 - iDay) % 7;
            if (iDiff === 0) { iDiff = 0; }
            oCurrent.setDate(oCurrent.getDate() + iDiff);
            oCurrent.setHours(0, 0, 0, 0);

            var oEndDate  = new Date(2027, 11, 31);
            var iIndex    = 0;
            var iJornada  = 1;

            while (oCurrent <= oEndDate) {
                var bHome     = Math.random() > 0.5;
                var sOpponent = aOpponents[iIndex % aOpponents.length];
                var sLocation = aLocations[Math.floor(Math.random() * aLocations.length)];
                var sComp     = aCompetitions[iIndex % aCompetitions.length];
                var sType     = aTypes[iIndex % aTypes.length];

                // Hora aleatoria: 11:00, 12:00, 17:00, 18:00, 19:00
                var aHours   = [11, 12, 17, 18, 19];
                var iHour    = aHours[Math.floor(Math.random() * aHours.length)];

                var oStart = new Date(oCurrent);
                oStart.setHours(iHour, 0, 0, 0);
                var oEnd = new Date(oCurrent);
                oEnd.setHours(iHour + 2, 0, 0, 0);

                var sTitle = bHome
                    ? "CS vs " + sOpponent
                    : sOpponent + " vs CS";

                var sCompLabel = sComp.indexOf("J") !== -1
                    ? sComp + iJornada
                    : sComp;

                var oApp = new CalendarAppointment({
                    startDate : oStart,
                    endDate   : oEnd,
                    title     : sTitle,
                    text      : sCompLabel + " · " + sLocation,
                    type      : sType
                });

                oCalendar.addAppointment(oApp);

                if (sComp.indexOf("Liga") !== -1) {
                    iJornada++;
                    if (iJornada > 30) { iJornada = 1; }
                }

                oCurrent.setDate(oCurrent.getDate() + 7);
                iIndex++;
            }
        }

    });
});