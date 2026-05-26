import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
 * Determines the correct redirect path for a user based on their role and current location.
 * Prevents infinite redirect loops by ensuring we don't redirect to the page we are already on.
 * @param {Object} user - The Firebase auth user object.
 * @param {Object} userData - The user's Firestore document data.
 * @param {string} currentPathname - The current window.location.pathname.
 * @returns {string|null} - The path to redirect to, or null if no redirect is needed.
 */
export async function getUserRedirectPath(user, currentPathname = null) {
    if (!currentPathname) {
        currentPathname = window.location.pathname;
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

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().isAdmin) {
            if (!decodedPath.endsWith('admin.html')) {
                return 'admin.html';
            }
            return null; // Stay on admin
        }
    } catch (e) {
        console.error("Error determining user role:", e);
    }

    // Standard User
    if (decodedPath.endsWith('admin.html')) {
        return 'account.html';
    } else if (decodedPath.endsWith('sign in beta.html')) {
        return 'account.html';
    }
    return null; // Stay on current page (e.g., account.html, index.html, booking.html)
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

export { app, auth, db };
