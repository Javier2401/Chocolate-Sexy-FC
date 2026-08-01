sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("chocolatesexy.project.controller.pages.Surveys", {

        onInit: function () {
            var oSurveyModel = new JSONModel({
                isLoggedIn: false,
                list: []   
            });
            this.getView().setModel(oSurveyModel, "survey");

            this._currentUser = null;

            this._oClosesAtBySurvey = {};          
            this._fnUnsubscribeVotesBySurvey = {};  
            this._fnUnsubscribeAuth = null;
            this._iCountdownIntervalId = null;

            this._loadEncuestas();
        },

        onExit: function () {
            var that = this;
            Object.keys(this._fnUnsubscribeVotesBySurvey).forEach(function (sSurveyId) {
                that._fnUnsubscribeVotesBySurvey[sSurveyId]();
            });

            if (this._fnUnsubscribeAuth) {
                this._fnUnsubscribeAuth();
            }
            if (this._iCountdownIntervalId) {
                clearInterval(this._iCountdownIntervalId);
                this._iCountdownIntervalId = null;
            }
        },

        _getText: function (sKey) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
        },

        _loadEncuestas: function () {
            var that = this;
            var oModel = this.getView().getModel("survey");

            fetch("/odata/v4/football/Encuestas?$expand=jugador1,jugador2,jugador3")
                .then(function (oResponse) { return oResponse.json(); })
                .then(function (oResult) {
                    var aSurveys = (oResult.value || []).map(function (oRow) {
                        return {
                            id: oRow.id,
                            title: oRow.titulo,
                            hasVoted: false,
                            selectedOption: null,    
                            showError: false,
                            errorMsg: "",
                            showSuccess: false,
                            successMsg: "",
                            votingClosed: false,
                            countdownText: "",       
                            closedAtText: "",       
                            options: {
                                opcion1: { name: oRow.jugador1 && oRow.jugador1.nombreCamiseta, image: oRow.jugador1 && oRow.jugador1.foto, votes: 0, isWinner: false },
                                opcion2: { name: oRow.jugador2 && oRow.jugador2.nombreCamiseta, image: oRow.jugador2 && oRow.jugador2.foto, votes: 0, isWinner: false },
                                opcion3: { name: oRow.jugador3 && oRow.jugador3.nombreCamiseta, image: oRow.jugador3 && oRow.jugador3.foto, votes: 0, isWinner: false }
                            }
                        };
                    });

                    aSurveys.reverse();

                    oModel.setProperty("/list", aSurveys);

                    that._initAuthListener();
                    aSurveys.forEach(function (oSurvey, iIndex) {
                        that._initVotesListener(oSurvey.id, "/list/" + iIndex);
                    });

                    that._iCountdownIntervalId = setInterval(
                        that._actualizarTodasLasCuentasAtras.bind(that), 1000
                    );
                })
                .catch(function (e) {
                    console.error("[Surveys] error cargando Encuestas:", e);
                });
        },

        _initAuthListener: function () {
            var that = this;
            var oModel = this.getView().getModel("survey");

            window.loadFirebase().then(function (auth) {
                that._fnUnsubscribeAuth = auth.onAuthStateChanged(function (oUser) {
                    var bValido = !!(oUser && oUser.emailVerified);
                    that._currentUser = bValido ? oUser : null;
                    oModel.setProperty("/isLoggedIn", bValido);

                    var aList = oModel.getProperty("/list") || [];
                    aList.forEach(function (oSurvey, iIndex) {
                        var sPath = "/list/" + iIndex;
                        if (bValido) {
                            oModel.setProperty(sPath + "/showError", false);
                            that._checkIfAlreadyVoted(oSurvey.id, sPath);
                        } else {
                            oModel.setProperty(sPath + "/hasVoted", false);
                            oModel.setProperty(sPath + "/selectedOption", null);
                            oModel.setProperty(sPath + "/showSuccess", false);
                        }
                    });
                });
            }).catch(function (e) {
                console.error("[Surveys] loadFirebase error:", e);
            });
        },

        _checkIfAlreadyVoted: function (sSurveyId, sPath) {
            var that = this;
            var oModel = this.getView().getModel("survey");

            window.loadFirestore().then(function (db) {
                db.collection("surveys").doc(sSurveyId)
                    .collection("voters").doc(that._currentUser.uid).get()
                    .then(function (oDoc) {
                        if (oDoc.exists) {
                            oModel.setProperty(sPath + "/hasVoted", true);
                            oModel.setProperty(sPath + "/selectedOption", oDoc.data().option);
                        }
                    })
                    .catch(function (e) {
                        console.error("[Surveys] error comprobando voto previo (" + sSurveyId + "):", e);
                    });
            }).catch(function (e) {
                console.error("[Surveys] loadFirestore error:", e);
            });
        },

        _initVotesListener: function (sSurveyId, sPath) {
            var that = this;
            var oModel = this.getView().getModel("survey");

            window.loadFirestore().then(function (db) {
                var fnUnsubscribe = db.collection("surveys").doc(sSurveyId)
                    .onSnapshot(function (oDoc) {
                        var oData = oDoc.data() || {};
                        var oVotes = oData.votes || {};

                        oModel.setProperty(sPath + "/options/opcion1/votes", oVotes.opcion1 || 0);
                        oModel.setProperty(sPath + "/options/opcion2/votes", oVotes.opcion2 || 0);
                        oModel.setProperty(sPath + "/options/opcion3/votes", oVotes.opcion3 || 0);
                        that._actualizarGanador(sPath);

                        that._oClosesAtBySurvey[sSurveyId] = oData.closesAt ? oData.closesAt.toDate() : null;
                        that._actualizarCuentaAtras(sSurveyId, sPath);
                    }, function (e) {
                        console.error("[Surveys] error escuchando votos en directo (" + sSurveyId + "):", e);
                    });

                that._fnUnsubscribeVotesBySurvey[sSurveyId] = fnUnsubscribe;
            }).catch(function (e) {
                console.error("[Surveys] loadFirestore error:", e);
            });
        },

        _actualizarGanador: function (sPath) {
            var oModel = this.getView().getModel("survey");
            var iV1 = oModel.getProperty(sPath + "/options/opcion1/votes") || 0;
            var iV2 = oModel.getProperty(sPath + "/options/opcion2/votes") || 0;
            var iV3 = oModel.getProperty(sPath + "/options/opcion3/votes") || 0;
            var iMax = Math.max(iV1, iV2, iV3);
            var bHayGanador = iMax > 0;

            oModel.setProperty(sPath + "/options/opcion1/isWinner", bHayGanador && iV1 === iMax);
            oModel.setProperty(sPath + "/options/opcion2/isWinner", bHayGanador && iV2 === iMax);
            oModel.setProperty(sPath + "/options/opcion3/isWinner", bHayGanador && iV3 === iMax);
        },

        _formatFechaCierre: function (dCierre) {
            var fnDosDigitos = function (n) { return (n < 10 ? "0" : "") + n; };
            var sFecha = fnDosDigitos(dCierre.getDate()) + "/" + fnDosDigitos(dCierre.getMonth() + 1) + "/" + dCierre.getFullYear();
            var sHora = fnDosDigitos(dCierre.getHours()) + ":" + fnDosDigitos(dCierre.getMinutes());

            return sFecha + " (" + sHora + "h)";
        },

        _actualizarCuentaAtras: function (sSurveyId, sPath) {
            var oModel = this.getView().getModel("survey");
            var dCierre = this._oClosesAtBySurvey[sSurveyId];

            if (!dCierre) {
                oModel.setProperty(sPath + "/votingClosed", false);
                oModel.setProperty(sPath + "/countdownText", "");
                return;
            }

            var iRestante = dCierre.getTime() - Date.now();

            if (iRestante <= 0) {
                oModel.setProperty(sPath + "/votingClosed", true);
                oModel.setProperty(sPath + "/countdownText", "");

                if (!oModel.getProperty(sPath + "/closedAtText")) {
                    oModel.setProperty(sPath + "/closedAtText", this._formatFechaCierre(dCierre));
                }
                return;
            }

            oModel.setProperty(sPath + "/votingClosed", false);

            var iSegundos = Math.floor(iRestante / 1000);
            var iDias = Math.floor(iSegundos / 86400);
            iSegundos -= iDias * 86400;
            var iHoras = Math.floor(iSegundos / 3600);
            iSegundos -= iHoras * 3600;
            var iMinutos = Math.floor(iSegundos / 60);
            iSegundos -= iMinutos * 60;

            var aPartes = [];
            if (iDias > 0) { aPartes.push(iDias + "d"); }
            if (iDias > 0 || iHoras > 0) { aPartes.push(iHoras + "h"); }
            aPartes.push(iMinutos + "min");
            aPartes.push(iSegundos + "s");

            oModel.setProperty(sPath + "/countdownText", aPartes.join(" "));
        },

        _actualizarTodasLasCuentasAtras: function () {
            var oModel = this.getView().getModel("survey");
            var aList = oModel.getProperty("/list") || [];
            var that = this;

            aList.forEach(function (oSurvey, iIndex) {
                that._actualizarCuentaAtras(oSurvey.id, "/list/" + iIndex);
            });
        },

        onSelectOption: function (oEvent) {
            var oSource = oEvent.getSource();
            var sOption = oSource.data("option"); 
            var sPath = oSource.getBindingContext("survey").getPath();
            var oModel = this.getView().getModel("survey");

            if (oModel.getProperty(sPath + "/votingClosed")) {
                return;
            }
            if (!oModel.getProperty("/isLoggedIn")) {
                oModel.setProperty(sPath + "/showError", true);
                oModel.setProperty(sPath + "/errorMsg", this._getText("surveys.error.notLoggedIn"));
                return;
            }
            if (oModel.getProperty(sPath + "/hasVoted")) {
                return;
            }

            oModel.setProperty(sPath + "/showError", false);
            oModel.setProperty(sPath + "/selectedOption", sOption);
        },

        onConfirmVote: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("survey").getPath();
            var oModel = this.getView().getModel("survey");

            if (oModel.getProperty(sPath + "/votingClosed")) {
                oModel.setProperty(sPath + "/showError", true);
                oModel.setProperty(sPath + "/errorMsg", this._getText("surveys.error.votingClosed"));
                return;
            }
            if (!oModel.getProperty("/isLoggedIn")) {
                oModel.setProperty(sPath + "/showError", true);
                oModel.setProperty(sPath + "/errorMsg", this._getText("surveys.error.notLoggedIn"));
                return;
            }
            if (oModel.getProperty(sPath + "/hasVoted")) {
                return;
            }

            var sOption = oModel.getProperty(sPath + "/selectedOption");
            if (!sOption) {
                oModel.setProperty(sPath + "/showError", true);
                oModel.setProperty(sPath + "/errorMsg", this._getText("surveys.error.noOptionSelected"));
                return;
            }

            oModel.setProperty(sPath + "/showError", false);
            oModel.setProperty(sPath + "/showSuccess", false);
            var sSurveyId = oModel.getProperty(sPath + "/id");
            this._castVote(sSurveyId, sPath, sOption);
        },

        _castVote: function (sSurveyId, sPath, sOption) {
            var that = this;
            var oModel = this.getView().getModel("survey");
            var sUid = this._currentUser.uid;

            window.loadFirestore().then(function (db) {
                var oSurveyRef = db.collection("surveys").doc(sSurveyId);
                var oVoterRef = oSurveyRef.collection("voters").doc(sUid);

                db.runTransaction(function (transaction) {
                    return transaction.get(oVoterRef).then(function (oVoterDoc) {
                        if (oVoterDoc.exists) {
                            throw new Error("ALREADY_VOTED");
                        }
                        return transaction.get(oSurveyRef).then(function (oSurveyDoc) {
                            var oVotes = (oSurveyDoc.data() && oSurveyDoc.data().votes) || {};
                            oVotes[sOption] = (oVotes[sOption] || 0) + 1;

                            transaction.set(oSurveyRef, { votes: oVotes }, { merge: true });
                            transaction.set(oVoterRef, {
                                option: sOption,
                                votedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        });
                    });
                }).then(function () {
                    oModel.setProperty(sPath + "/hasVoted", true);
                    oModel.setProperty(sPath + "/selectedOption", sOption);
                    oModel.setProperty(sPath + "/showSuccess", true);
                    oModel.setProperty(sPath + "/successMsg", that._getText("surveys.success.voteRegistered"));
                }).catch(function (e) {
                    if (e && e.message === "ALREADY_VOTED") {
                        oModel.setProperty(sPath + "/hasVoted", true);
                    } else {
                        console.error("[Surveys] error al votar (" + sSurveyId + "):", e);
                        oModel.setProperty(sPath + "/showError", true);
                        oModel.setProperty(sPath + "/errorMsg", that._getText("surveys.error.voteFailed"));
                    }
                });
            }).catch(function (e) {
                console.error("[Surveys] loadFirestore error:", e);
            });
        }

    });
});