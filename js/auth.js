import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Helper to safely get environment variables across different bundlers/environments
const getEnvVar = (key, fallback) => {
    // Webpack / Create React App
    if (typeof process !== 'undefined' && process.env && process.env[`REACT_APP_${key}`]) {
        return process.env[`REACT_APP_${key}`];
    }
    // Vite
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
        return import.meta.env[`VITE_${key}`];
    }
    // Static HTML / window injected
    if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
        return window.ENV[key];
    }
    return fallback;
};

const apiKey = getEnvVar('FIREBASE_API_KEY');

if (!apiKey) {
    console.error("Critical Error: Firebase API Key is not defined. Ensure environment variables are configured correctly.");
}

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
    if (apiKey) {
        // Ensure no cross-contamination by checking if the SPECIFIC app already exists
        const existingApp = getApps().find(a => a.name === "autolux");
        app = existingApp ? existingApp : initializeApp(firebaseConfig, "autolux");

        auth = getAuth(app);
        db = getFirestore(app);
        console.log("Firebase initialized successfully for autolux.realunstoppable.store");
    }
} catch (error) {
    console.error("Firebase Initialization Error", {
        code: error.code,
        message: error.message
    });
}

/**
 * Submits a new detailing request to Firestore.
 * @param {Object} requestData - The data for the detailing request.
 * @param {string} requestData.customerName
 * @param {string} requestData.customerEmail
 * @param {string} requestData.vehicle
 * @param {string} requestData.appointmentDate
 * @returns {Promise<string|null>} - Returns the document ID on success, or null on error.
 */
export async function submitDetailingRequest(requestData) {
    if (!db || !auth) {
        console.error("Cannot submit detailing request: Firebase is not fully initialized.");
        return null;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.error("Cannot submit detailing request: User is not authenticated.");
        return null;
    }

    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...requestData,
            userId: currentUser.uid, // Required by security rules
            status: "pending",
            createdAt: serverTimestamp()
        });
        console.log("Detailing request submitted successfully with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
         console.error("Error submitting detailing request:", {
            code: error.code,
            message: error.message
        });
        return null;
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
    console.error("Firebase connection error. Check App Check, CORS, or config.");
    if (error.code) console.error("Error code:", error.code);
    console.error(error);
}

// Utility to wrap onAuthStateChanged in a promise
export function waitForAuthState() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
}

// Utility to determine redirect path safely
export async function getUserRedirectPath(user) {
    if (!user) return 'sign in beta.html';

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().isAdmin) {
            return 'admin.html';
        }
    } catch (e) {
        console.error("Error determining user role:", e);
    }

    return 'account.html';
}

export { auth, db };
export { auth, db };
} catch (error) {
    console.error("Firebase initialization error:", error.message);
    if (error.code) {
        console.error("Error code:", error.code);
    }
}

export { app, auth, db };
