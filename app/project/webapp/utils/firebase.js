const firebaseConfig = {
    apiKey:     "AIzaSyCXrGswcNurmxDKacJyJSoukyylmzmIC8w",
    authDomain: "chocolate-sexy.firebaseapp.com",
    projectId:  "chocolate-sexy",
    appId:      "1:662902024937:web:c5e63276d2b2c2d16fde78"
};

var _scriptPromises = {};
function _loadScriptOnce(sUrl) {
    if (_scriptPromises[sUrl]) { return _scriptPromises[sUrl]; }
    _scriptPromises[sUrl] = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = sUrl;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return _scriptPromises[sUrl];
}

function loadFirebase() {
    return new Promise(function (resolve) {
        if (window._firebaseAuth) { resolve(window._firebaseAuth); return; }
        _loadScriptOnce("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js")
            .then(function () {
                return _loadScriptOnce("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js");
            })
            .then(function () {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                window._firebaseAuth = firebase.auth();
                resolve(window._firebaseAuth);
            });
    });
}

function loadFirestore() {
    return new Promise(function (resolve) {
        if (window._firebaseDb) { resolve(window._firebaseDb); return; }
        _loadScriptOnce("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js")
            .then(function () {
                return _loadScriptOnce("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js");
            })
            .then(function () {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                window._firebaseDb = firebase.firestore();
                resolve(window._firebaseDb);
            });
    });
}

window.loadFirebase = loadFirebase;
window.loadFirestore = loadFirestore;