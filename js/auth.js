import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let app, auth, db;

try {
    const appName = "autolux";

    // 🛡️ Security Fix: Prevent hardcoded Firebase configuration
    // Rationale: Hardcoded non-dummy configuration values can inadvertently connect to real projects
    // or leak environment details. We enforce loading from window.ENV and fail securely if missing.
    if (!window.ENV) {
        throw new Error("Missing required Firebase configuration in window.ENV. Failing securely.");
    }

    const firebaseConfig = {
        apiKey: window.ENV?.FIREBASE_API_KEY,
        authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN,
        projectId: window.ENV?.FIREBASE_PROJECT_ID,
        storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID,
        appId: window.ENV?.FIREBASE_APP_ID,
        measurementId: window.ENV?.FIREBASE_MEASUREMENT_ID
    };

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
    console.error("Firebase connection error. Check App Check, CORS, or config.");
    if (error.code) console.error("Error code:", error.code);
    console.error(error);
    console.error("Firebase Initialization Error:", error.message);
}

export { app, auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged };

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
            const newUserData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || "Anonymous User",
                username: user.displayName || "Anonymous User",
                isAdmin: false,
                isBanned: false,
                membershipLevel: 'free',
                signupDate: serverTimestamp(),
                vehicles: [],
                appointments: [],
                contactInfo: {}
            };
            await setDoc(userDocRef, newUserData);
            return newUserData;
        }
    } catch (error) {
        console.error("Error ensuring user document:", error.message);
        if (error.code) console.error("Error code:", error.code);
        return null;
    }
}

/**
 * Returns a definitive Promise that resolves when the auth state is known.
 * @returns {Promise<Object|null>} - Returns the user object if authenticated, or null.
 */
export function getAuthStatePromise() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (user) {
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
 * @param {Object} user - The Firebase auth user object.
 * @param {Object} [userData] - The user's Firestore document data.
 * @param {string} [currentPathname] - The current window.location.pathname.
 * @returns {Promise<string|null>} - The path to redirect to, or null if no redirect is needed.
 */
export async function getUserRedirectPath(user, userData = null, currentPathname = null) {
    // Overloading support for simpler form: getUserRedirectPath(user)
    if (!userData && !currentPathname) {
        if (!user) return 'sign in beta.html';
        return 'account.html'; // Basic fallback if userData is not provided synchronously
    }
    const decodedPath = decodeURIComponent(currentPathname);
    const pathname = currentPathname || window.location.pathname;
    const decodedPath = decodeURIComponent(pathname);

    if (!user) {
        const publicPaths = ['/index.html', '/', '/sign in beta.html', '/donate.html'];
        const isPublicPath = publicPaths.some(p => decodedPath.endsWith(p));

        if (!isPublicPath) {
            return 'sign in beta.html';
        }
        return null;
    }

    let data = userData;
    if (!data && user) {
        data = await ensureUserDocument(user);
    }

    if (data && data.isAdmin) {
        if (!decodedPath.endsWith('admin.html')) {
            return 'admin.html';
        }
        return null;
    } else {
        if (decodedPath.endsWith('admin.html')) {
            return 'account.html';
        } else if (decodedPath.endsWith('sign in beta.html')) {
            return 'account.html';
        }
        return null;
    }
}

/**
 * A safe wrapper for window.location.replace that checks the current pathname.
 * @param {string} targetUrl - The URL to redirect to.
 */
export function safeRedirect(targetUrl) {
    if (!targetUrl) return;

    const currentPath = decodeURIComponent(window.location.pathname).split('/').pop() || 'index.html';
    const targetPath = decodeURIComponent(targetUrl).split('/').pop() || 'index.html';

    if (currentPath !== targetPath) {
        window.location.replace(targetUrl);
    }
}

/**
 * Submits a new detailing request to Firestore.
 * @param {Object} requestData - The data for the detailing request.
 * @returns {Promise<string|null>} - Returns the document ID on success, or null on error.
 */

