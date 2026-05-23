import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const getEnvVar = (key, fallback) => {
    if (typeof process !== 'undefined' && process.env && process.env[`REACT_APP_${key}`]) {
        return process.env[`REACT_APP_${key}`];
    }
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
        return import.meta.env[`VITE_${key}`];
    }
    if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
        return window.ENV[key];
    }
    return fallback;
};

const apiKey = getEnvVar('FIREBASE_API_KEY', 'YOUR_API_KEY');

const firebaseConfig = {
    apiKey: apiKey,
    authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', "autolux.realunstoppable.store"),
    projectId: getEnvVar('FIREBASE_PROJECT_ID', "autolux-detailing"),
    storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', "autolux-detailing.appspot.com"),
    messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('FIREBASE_APP_ID')
};

let app, auth, db;

try {
    const existingApp = getApps().find(a => a.name === "autolux");
    app = existingApp ? existingApp : initializeApp(firebaseConfig, "autolux");

    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase Initialization Error", error);
}

// Debounce utility function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export { app, auth, db };
