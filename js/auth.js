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
    }
}

export { app, auth, db };
