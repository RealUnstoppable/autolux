import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let app, auth, db;

try {
    const firebaseConfig = window.ENV?.FIREBASE_CONFIG || {
        apiKey: "dummy-api-key", // Replace with actual in production env.js
        authDomain: "autolux.realunstoppable.store",
        projectId: "unstoppable-detailing",
        storageBucket: "unstoppable-detailing.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef123456"
    };

    const appName = "autolux";
    const existingApp = getApps().find(a => a.name === appName);

    if (existingApp) {
        app = existingApp;
    } else {
        app = initializeApp(firebaseConfig, appName);
    }

    auth = getAuth(app);
    db = getFirestore(app);

} catch (error) {
    console.error("Firebase connection error. Check App Check, CORS, or config.");
    if (error.code) console.error("Error code:", error.code);
    console.error(error);
}

export { auth, db };