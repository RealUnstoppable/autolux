import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Helper to safely get environment variables across different bundlers/environments
const getEnvVar = (key, fallback) => {
    // Static HTML / window injected
    if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
        return window.ENV[key];
    }
    return fallback;
};

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
};

let app, auth, db;

try {
    // Ensure no cross-contamination by checking if the SPECIFIC app already exists
    const existingApp = getApps().find(a => a.name === "autolux");
    app = existingApp ? existingApp : initializeApp(firebaseConfig, "autolux");

    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully for autolux.realunstoppable.store");
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
                contactInfo: {}
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
    }
}

export { app, auth, db };
