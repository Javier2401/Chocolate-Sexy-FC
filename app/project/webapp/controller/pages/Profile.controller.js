sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("chocolatesexy.project.controller.pages.Profile", {

        _bRemember: false,
        _checkEmailInterval: null,

        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteProfile")
                .attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var that = this;
            this._bRemember = false;
            this._actualizarRemember();
            this._limpiarErroresVisuales();

            window.loadFirebase().then(function (auth) {
                var oUser = auth.currentUser;
                if (oUser && oUser.emailVerified) {
                    that._mostrarPerfil(oUser);
                    return;
                }
                var unsubscribe = auth.onAuthStateChanged(function (user) {
                    unsubscribe();
                    if (user && user.emailVerified) {
                        that._mostrarPerfil(user);
                    } else {
                        that._mostrarAuth();
                    }
                });
            }).catch(function (e) {
                console.error("[Profile] loadFirebase error:", e);
            });
        },

        onNavToRegister: function () {
            this._limpiarErroresVisuales();
            this._limpiarTodosLosCampos();
            this.byId("cardLogin").setVisible(false);
            this.byId("cardRegister").setVisible(true);
        },

        onNavToLogin: function () {
            this._limpiarErroresVisuales();
            this._limpiarTodosLosCampos();
            this.byId("cardRegister").setVisible(false);
            this.byId("cardLogin").setVisible(true);
        },

        onRememberToggle: function () {
            this._bRemember = !this._bRemember;
            this._actualizarRemember();
        },

        _actualizarRemember: function () {
            var oBtn = this.byId("btnRemember");
            if (!oBtn) { return; }
            oBtn.setIcon("");
            var oDom = oBtn.getDomRef ? oBtn.getDomRef() : null;
            if (oDom) {
                oDom.classList.toggle("cb-checked", this._bRemember);
            }
        },

        _mostrarAuth: function () {
            this.byId("panelAuth").setVisible(true);
            this.byId("cardLogin").setVisible(true);
            this.byId("cardRegister").setVisible(false);
            this.byId("panelProfile").setVisible(false);
            this._setLoggedIn(false);
        },

        _mostrarPerfil: function (oUser) {
            this.byId("panelAuth").setVisible(false);
            this.byId("panelProfile").setVisible(true);
            this.byId("profileEmail").setText(oUser.email);
            this.byId("profileVerified").setText(
                oUser.emailVerified ? "✅ Correo verificado" : "⚠️ Correo no verificado"
            );
            this._setLoggedIn(true);
        },

        _limpiarErroresVisuales: function () {
            this.byId("loginError").setVisible(false);
            this.byId("registerError").setVisible(false);
            this.byId("registerSuccess").setVisible(false);
            this.byId("loginEmail").removeStyleClass("inputStateError");
            this.byId("loginPassword").removeStyleClass("inputStateError");
            this.byId("registerEmail").removeStyleClass("inputStateError");
            this.byId("registerPassword").removeStyleClass("inputStateError");
            this.byId("registerPassword2").removeStyleClass("inputStateError");
        },

        _limpiarTodosLosCampos: function () {
            this.byId("loginEmail").setValue("");
            this.byId("loginPassword").setValue("");
            this.byId("registerEmail").setValue("");
            this.byId("registerPassword").setValue("");
            this.byId("registerPassword2").setValue("");
        },

        _pararPollingEmail: function () {
            if (this._checkEmailInterval) {
                clearInterval(this._checkEmailInterval);
                this._checkEmailInterval = null;
            }
        },

        onLogin: function () {
            var oEmailInput = this.byId("loginEmail");
            var oPassInput  = this.byId("loginPassword");
            var sEmail      = oEmailInput.getValue().trim();
            var sPassword   = oPassInput.getValue();
            var oError      = this.byId("loginError");
            var that        = this;

            this._limpiarErroresVisuales();

            if (!sEmail || !sPassword) {
                oError.setText("Rellena todos los campos.");
                oError.setVisible(true);
                if (!sEmail)    { oEmailInput.addStyleClass("inputStateError"); }
                if (!sPassword) { oPassInput.addStyleClass("inputStateError"); }
                return;
            }

            window.loadFirebase().then(function (auth) {
                var sPersistence = that._bRemember ? "local" : "session";

                var doSignIn = function () {
                    auth.signInWithEmailAndPassword(sEmail, sPassword)
                        .then(function (result) {
                            if (!result.user.emailVerified) {
                                oError.setText("Verifica tu correo antes de entrar. Revisa tu bandeja de entrada.");
                                oError.setVisible(true);
                                auth.signOut();
                                return;
                            }
                            that._limpiarTodosLosCampos();
                            that._mostrarPerfil(result.user);
                        })
                        .catch(function (e) {
                            console.error("[Profile] signIn error:", e);
                            oError.setVisible(true);
                            if (e.code === "auth/user-not-found" || e.code === "auth/invalid-email") {
                                oError.setText("El correo electrónico no está registrado.");
                                oEmailInput.addStyleClass("inputStateError");
                            } else if (e.code === "auth/wrong-password") {
                                oError.setText("Contraseña incorrecta.");
                                oPassInput.addStyleClass("inputStateError");
                            } else {
                                oError.setText("Correo o contraseña incorrectos.");
                                oEmailInput.addStyleClass("inputStateError");
                                oPassInput.addStyleClass("inputStateError");
                            }
                        });
                };

                auth.signOut()
                    .then(function () {
                        if (typeof auth.setPersistence === "function") {
                            return auth.setPersistence(sPersistence);
                        }
                    })
                    .then(doSignIn)
                    .catch(function (e) {
                        console.warn("[Profile] setPersistence/signOut failed:", e);
                        doSignIn();
                    });

            }).catch(function (e) {
                console.error("[Profile] loadFirebase error:", e);
                oError.setText("Error de conexión. Inténtalo de nuevo.");
                oError.setVisible(true);
            });
        },

        onRegister: function () {
            var oEmailInput  = this.byId("registerEmail");
            var oPass1Input  = this.byId("registerPassword");
            var oPass2Input  = this.byId("registerPassword2");
            var sEmail       = oEmailInput.getValue().trim();
            var sPass1       = oPass1Input.getValue();
            var sPass2       = oPass2Input.getValue();
            var oError       = this.byId("registerError");
            var oSuccess     = this.byId("registerSuccess");

            this._limpiarErroresVisuales();

            if (!sEmail || !sPass1 || !sPass2) {
                oError.setText("Rellena todos los campos.");
                oError.setVisible(true);
                if (!sEmail) { oEmailInput.addStyleClass("inputStateError"); }
                if (!sPass1) { oPass1Input.addStyleClass("inputStateError"); }
                if (!sPass2) { oPass2Input.addStyleClass("inputStateError"); }
                return;
            }
            if (sPass1 !== sPass2) {
                oError.setText("Las contraseñas no coinciden.");
                oError.setVisible(true);
                oPass1Input.addStyleClass("inputStateError");
                oPass2Input.addStyleClass("inputStateError");
                return;
            }
            if (sPass1.length < 6) {
                oError.setText("La contraseña debe tener al menos 6 caracteres.");
                oError.setVisible(true);
                oPass1Input.addStyleClass("inputStateError");
                return;
            }

            var that = this;
            window.loadFirebase().then(function (auth) {
                auth.createUserWithEmailAndPassword(sEmail, sPass1)
                    .then(function (result) {
                        result.user.sendEmailVerification();
                        oSuccess.setText("¡Cuenta creada! Revisa tu correo. La sesión se iniciará automáticamente aquí en cuanto verifiques tu email.");
                        oSuccess.setVisible(true);
                        that._limpiarTodosLosCampos();

                        that._pararPollingEmail();
                        var checkCount = 0;
                        that._checkEmailInterval = setInterval(function () {
                            checkCount++;
                            if (!auth.currentUser || checkCount > 100) {
                                that._pararPollingEmail();
                                return;
                            }
                            auth.currentUser.reload().then(function () {
                                if (auth.currentUser && auth.currentUser.emailVerified) {
                                    that._pararPollingEmail();
                                    that._mostrarPerfil(auth.currentUser);
                                }
                            }).catch(function () { that._pararPollingEmail(); });
                        }, 3000);
                    })
                    .catch(function (e) {
                        console.error("[Profile] register error:", e);
                        oError.setVisible(true);
                        if (e.code === "auth/email-already-in-use") {
                            oError.setText("Este correo ya está registrado.");
                            oEmailInput.addStyleClass("inputStateError");
                        } else {
                            oError.setText("Error al crear la cuenta. Inténtalo de nuevo.");
                        }
                    });
            }).catch(function (e) {
                console.error("[Profile] loadFirebase error:", e);
                oError.setText("Error de conexión. Inténtalo de nuevo.");
                oError.setVisible(true);
            });
        },

        onForgotPassword: function () {
            var oEmailInput = this.byId("loginEmail");
            var sEmail      = oEmailInput.getValue().trim();
            var oError      = this.byId("loginError");

            this._limpiarErroresVisuales();

            if (!sEmail) {
                oError.setText("Escribe tu correo arriba para recuperar la contraseña.");
                oError.setVisible(true);
                oEmailInput.addStyleClass("inputStateError");
                return;
            }

            window.loadFirebase().then(function (auth) {
                auth.sendPasswordResetEmail(sEmail)
                    .then(function () {
                        oError.setText("Correo de recuperación enviado. Revisa tu bandeja.");
                        oError.setVisible(true);
                    })
                    .catch(function (e) {
                        console.error("[Profile] resetPassword error:", e);
                        oError.setText("No se encontró ninguna cuenta con ese correo.");
                        oError.setVisible(true);
                        oEmailInput.addStyleClass("inputStateError");
                    });
            }).catch(function (e) {
                console.error("[Profile] loadFirebase error:", e);
            });
        },

        onLogout: function () {
            var that = this;
            this._pararPollingEmail();
            window.loadFirebase().then(function (auth) {
                auth.signOut().then(function () {
                    that._limpiarTodosLosCampos();
                    that._limpiarErroresVisuales();
                    that._mostrarAuth();
                });
            });
        },

        onToggleLoginPassword: function () {
            this._togglePassword("loginPassword", "btnEyeLogin");
        },
        onToggleRegisterPassword: function () {
            this._togglePassword("registerPassword", "btnEyeRegister");
        },
        onToggleRegisterPassword2: function () {
            this._togglePassword("registerPassword2", "btnEyeRegister2");
        },

        _togglePassword: function (sInputId, sBtnId) {
            var oInput  = this.byId(sInputId);
            var oBtn    = this.byId(sBtnId);
            var bIsPass = oInput.getType() === "Password";
            if (bIsPass) {
                oInput.setType("Text");
                oBtn.setIcon("sap-icon://show");
            } else {
                oInput.setType("Password");
                oBtn.setIcon("sap-icon://hide");
            }
        }

    });
});