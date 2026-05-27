const firebaseConfig = {
    apiKey:     "AIzaSyCXrGswcNurmxDKacJyJSoukyylmzmIC8w",
    authDomain: "chocolate-sexy.firebaseapp.com",
    projectId:  "chocolate-sexy",
    appId:      "1:662902024937:web:c5e63276d2b2c2d16fde78"
};

function loadFirebase() {
    return new Promise(function (resolve) {
        if (window._firebaseAuth) { resolve(window._firebaseAuth); return; }
        var script = document.createElement("script");
        script.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js";
        script.onload = function () {
            var script2 = document.createElement("script");
            script2.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js";
            script2.onload = function () {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                window._firebaseAuth = firebase.auth();
                resolve(window._firebaseAuth);
            };
            document.head.appendChild(script2);
        };
        document.head.appendChild(script);
    });
}

window.loadFirebase = loadFirebase;