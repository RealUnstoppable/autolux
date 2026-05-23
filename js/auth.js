import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Because the codebase lacks a bundler, standard environment variables (like process.env or import.meta.env) aren't natively supported.
// Rely on a globally injected window.ENV object for environment configuration, typically loaded via a separate ignored script like env.js.
const firebaseConfig = {
    apiKey: window.ENV?.FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "autolux.realunstoppable.store",
    projectId: window.ENV?.FIREBASE_PROJECT_ID || "autolux-detailing",
    storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || "autolux-detailing.appspot.com",
    messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
    appId: window.ENV?.FIREBASE_APP_ID || "YOUR_APP_ID"
};

const appName = 'autolux';

// Initialize Firebase only if it hasn't been initialized already to prevent cross-contamination
const app = getApps().find(a => a.name === appName) || initializeApp(firebaseConfig, appName);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let app;
let auth;
let db;

try {
    const appName = "autolux";

    if (!window.ENV) {
        throw new Error("window.ENV is missing. Make sure env.js is loaded before auth.js");
    }

    // Strict reliance on window.ENV for static HTML apps
    const firebaseConfig = {
        apiKey: window.ENV.FIREBASE_API_KEY,
        authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
        projectId: window.ENV.FIREBASE_PROJECT_ID,
        storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
        appId: window.ENV.FIREBASE_APP_ID
    };

    const apps = getApps();
    app = apps.find(a => a.name === appName);

    if (!app) {
        app = initializeApp(firebaseConfig, appName);
    }

    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization error:", error.message);
    if (error.code) {
        console.error("Error code:", error.code);
    }
}

export { app, auth, db };
