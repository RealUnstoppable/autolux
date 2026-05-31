import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

    console.log(`Firebase initialized successfully for ${firebaseConfig.authDomain}`);

} catch (error) {
    console.error("Firebase connection error:", { code: error.code, message: error.message, details: error });
}

export { app, auth, db };

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
        console.error("Error ensuring user document:", error.message);
        if (error.code) console.error("Error code:", error.code);
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

// Utility to wrap onAuthStateChanged in a promise
export function waitForAuthState() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            unsubscribe();
            resolve(user);
        }, reject);
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
export async function getUserRedirectPath(user, userData = null, currentPathname = null) {
    // Overloading support for simpler form: getUserRedirectPath(user)
    if (!userData && !currentPathname) {
        if (!user) return 'sign in beta.html';
        return 'account.html'; // Basic fallback if userData is not provided synchronously
    }
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

export { app };
export { auth };
export { db };
