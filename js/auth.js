import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let app, auth, db;

try {
    const appName = "autolux";

    // Because the codebase lacks a bundler, standard environment variables (like process.env or import.meta.env) aren't natively supported.
    // Rely on a globally injected window.ENV object for environment configuration, typically loaded via a separate ignored script like env.js.
    const firebaseConfig = {
        apiKey: window.ENV?.FIREBASE_API_KEY || "dummy-api-key",
        authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "autolux.realunstoppable.store",
        projectId: window.ENV?.FIREBASE_PROJECT_ID || "autolux-detailing",
        storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || "autolux-detailing.appspot.com",
        messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || "123456789",
        appId: window.ENV?.FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
    };

    if (!window.ENV) {
        console.warn("window.ENV is missing. Falling back to default configuration.");
    }

    const apps = getApps();
    const existingApp = apps.find(a => a.name === appName);

    if (existingApp) {
        app = existingApp;
    } else {
        app = initializeApp(firebaseConfig, appName);
    }

    auth = getAuth(app);
    db = getFirestore(app);

    console.log("Firebase initialized successfully for autolux.realunstoppable.store");

} catch (error) {
    console.error("Firebase connection error. Check App Check, CORS, or config.");
    if (error.code) console.error("Error code:", error.code);
    console.error(error);
}

export { app, auth, db };