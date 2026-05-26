import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Dummy Firebase config for demonstration/testing since one wasn't provided
const firebaseConfig = {
    apiKey: "dummy-api-key",
    authDomain: "dummy-project.firebaseapp.com",
    projectId: "dummy-project",
    storageBucket: "dummy-project.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:1234567890"
};

// Initialize Firebase App globally
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
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
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Helper to safely get environment variables across different bundlers/environments
const getEnvVar = (key, fallback) => {
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

const apiKey = getEnvVar('FIREBASE_API_KEY', 'YOUR_API_KEY');
const apiKey = getEnvVar('FIREBASE_API_KEY');

if (!apiKey) {
    console.warn("Firebase API Key is not defined. Ensure window.ENV.FIREBASE_API_KEY is configured correctly. Mocking will be needed for testing.");
}

const firebaseConfig = {
    apiKey: apiKey || "mock-api-key",
    authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', "autolux.realunstoppable.store"),
    projectId: getEnvVar('FIREBASE_PROJECT_ID', "autolux-detailing"),
    storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', "autolux-detailing.appspot.com"),
    messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', "mock-sender-id"),
    appId: getEnvVar('FIREBASE_APP_ID', "mock-app-id")
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
    // Ensure no cross-contamination by checking if the SPECIFIC app already exists
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
    console.log("Firebase initialized successfully for autolux.realunstoppable.store");
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
 * Ensures the user has a document in the 'users' collection.
 * Creates a default document with empty vehicles and appointments arrays if one does not exist.
 * @param {Object} user - The Firebase Auth user object.
 * @returns {Promise<Object>} - Returns the user data.
 */
export async function ensureUserDocument(user) {
    if (!db || !user) return null;

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            // Document doesn't exist, create it gracefully
            const newUserData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || "Anonymous User",
                isAdmin: false,
                signupDate: serverTimestamp(),
                vehicles: [],
                appointments: [],
                contactInfo: {},
                loyaltyPoints: 0
            };
            await setDoc(userDocRef, newUserData);
            return newUserData;
        }
    } catch (error) {
        console.error("Error ensuring user document:", error);
        return null;
    }
}

/**
 * Returns a definitive Promise that resolves when the auth state is known.
 * This prevents race conditions where the UI attempts to read DB data before auth is ready.
 * @returns {Promise<Object|null>} - Returns the user object if authenticated, or null.
 */
export function getAuthStatePromise() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe(); // Clean up listener once we have the initial state
            if (user) {
                // Ensure their user document exists before returning
                await ensureUserDocument(user);
            }
            resolve(user);
        });
    });
}

/**
 * Determines the correct redirect path for a user based on their role and current location.
 * Prevents infinite redirect loops by ensuring we don't redirect to the page we are already on.
 * @param {Object} user - The Firebase auth user object.
 * @param {Object} userData - The user's Firestore document data.
 * @param {string} currentPathname - The current window.location.pathname.
 * @returns {string|null} - The path to redirect to, or null if no redirect is needed.
 */
export function getUserRedirectPath(user, userData, currentPathname) {
    const decodedPath = decodeURIComponent(currentPathname);

    if (!user) {
        const publicPaths = ['/index.html', '/', '/sign in beta.html'];
        const isPublicPath = publicPaths.some(p => decodedPath.endsWith(p));

        if (!isPublicPath) {
            return 'sign in beta.html';
        }
        return null; // Stay on public page
    }

    if (userData && userData.isAdmin) {
        if (!decodedPath.endsWith('admin.html')) {
            return 'admin.html';
        }
        return null; // Stay on admin
    } else {
        // Standard User
        if (decodedPath.endsWith('admin.html')) {
            return 'account.html';
        } else if (decodedPath.endsWith('sign in beta.html')) {
            return 'account.html';
        }
        return null; // Stay on current page (e.g., account.html, index.html, booking.html)
    }
}

/**
 * A safe wrapper for window.location.replace that checks the current pathname.
 * @param {string} targetUrl - The URL to redirect to.
 */
export function safeRedirect(targetUrl) {
    if (!targetUrl) return;

    // Normalize paths for comparison
    const currentPath = decodeURIComponent(window.location.pathname).split('/').pop() || 'index.html';
    const targetPath = decodeURIComponent(targetUrl).split('/').pop() || 'index.html';

    if (currentPath !== targetPath) {
        window.location.replace(targetUrl);
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
