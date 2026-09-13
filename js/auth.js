import { submitDetailingRequestCore } from './utils.js';
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export let app, auth, db;

try {
    const appName = "autolux";
    const hostname = window.location.hostname;
    const isAutolux = hostname.includes('autolux');

    // 🛡️ Security Fix: Prevent hardcoded Firebase configuration
    // Rationale: Hardcoded non-dummy configuration values can inadvertently connect to real projects
    // or leak environment details. We enforce loading from window.ENV and fail securely if missing.
    if (typeof window !== 'undefined' && !window.ENV) {
        throw new Error("Missing required Firebase configuration in window.ENV. Failing securely.");
    }
    const env = typeof window !== 'undefined' && window.ENV ? window.ENV : {};

    const firebaseConfig = {
        apiKey: env.FIREBASE_API_KEY,
        authDomain: env.FIREBASE_AUTH_DOMAIN,
        projectId: env.FIREBASE_PROJECT_ID,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
        appId: env.FIREBASE_APP_ID,
        measurementId: env.FIREBASE_MEASUREMENT_ID
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
    console.error("Firebase Initialization Error:", error.message);
    if (error.code) console.error("Error code:", error.code);
    console.error("Full error:", error);
}

export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged };

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
        return 'account.html';
    }
    return getUserRedirectPathAsync(user, userData, currentPathname);
}

export async function getUserRedirectPathAsync(user, userData = null, currentPathname = null) {
    if (!userData && !currentPathname) {
        // Fetch the user data if missing, instead of infinitely recursing
        userData = await ensureUserDocument(user);
        currentPathname = window.location.pathname;
    }
    const decodedPath = decodeURIComponent(currentPathname);

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

export async function getUserRedirectPathAsyncInternal(user) {
    const userData = await ensureUserDocument(user);
    return getUserRedirectPath(user, userData, window.location.pathname);
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


export async function submitDetailingRequest(requestData) {
    if (!auth) {
        console.error("Cannot submit detailing request: Firebase is not fully initialized.");
        return { success: false, error: { message: "Firebase is not fully initialized." } };
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.error("Cannot submit detailing request: User is not authenticated.");
        return { success: false, error: "You must be signed in to submit a request." };
    }
    try {
        const result = await submitDetailingRequestCore(currentUser.uid, requestData);
        if (result.success) {
            console.log("Detailing request submitted successfully with ID:", result.docId);
            return result.docId;
        } else {
            console.error("Error submitting detailing request:", result.error);
            if (result.code) console.error("Error code:", result.code);
            return null;
        }
    } catch (error) {
        console.error("Error submitting detailing request:", error);
        if (error.code) console.error("Error code:", error.code);
        return null;
    }
}

