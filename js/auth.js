import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export let app, auth, db;

try {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const isAutolux = hostname === 'autolux.realunstoppable.store' || hostname.includes('autolux');
    const appName = isAutolux ? "autolux-detailing-app" : "ezmanage-app";

    // 🛡️ Security Fix: Prevent hardcoded Firebase configuration
    // Rationale: Hardcoded non-dummy configuration values can inadvertently connect to real projects
    // or leak environment details. We enforce loading from window.ENV and fail securely if missing.
    if (typeof window !== 'undefined' && (!window.ENV || !window.ENV.FIREBASE_API_KEY)) {
        throw new Error("Missing required Firebase configuration in window.ENV. Failing securely.");
    }
    const env = typeof window !== 'undefined' && window.ENV ? window.ENV : {};

    // Validate project ID to prevent ezManage cross-contamination
    if (isAutolux && env.FIREBASE_AUTH_DOMAIN !== 'autolux.realunstoppable.store') {
        throw new Error("Critical Error: Environment config auth domain does not match expected Autolux domain. Preventing cross-origin auth issue.");
    }

    if (isAutolux && env.FIREBASE_PROJECT_ID !== 'autolux-detailing') {
        throw new Error("Critical Error: Environment config project ID does not match expected Autolux project ID. Preventing cross-contamination.");
    }

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
    console.error("Firebase connection error - Code:", error.code || 'UNKNOWN_ERROR');
    console.error("Firebase connection error:", { message: error.message, details: error });
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
            let data = userDoc.data();
            if (!data.referralCode) {
                const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                await setDoc(userDocRef, { referralCode: referralCode, referralCredits: 0 }, { merge: true });
                data.referralCode = referralCode;
                data.referralCredits = 0;
            }
            return data;
        } else {
            const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
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
                contactInfo: {},
                loyaltyPoints: 0
            };
            await setDoc(userDocRef, newUserData);
            return newUserData;
        }
    } catch (error) {
        console.error("Error ensuring user document:", { code: error.code, message: error.message, details: error });
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
    if (!userData && user) {
        // Fetch the user data if missing, instead of infinitely recursing
        userData = await ensureUserDocument(user);
    }

    if (!currentPathname) {
        currentPathname = typeof window !== 'undefined' ? window.location.pathname : '/';
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

    if (userData && userData.isAdmin) {
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

    try {
        // 🛡️ Sentinel: Prevent Open Redirect and javascript: URI XSS
        const dummyBase = 'http://safe-dummy-base.local';
        const parsed = new URL(targetUrl, dummyBase);

        // If the origin is not the dummy base, it's an absolute URL (Open Redirect risk)
        // If protocol is javascript:, it's an XSS risk
        if (parsed.origin !== dummyBase || parsed.protocol === 'javascript:') {
            console.error('Unsafe redirect attempt blocked:', targetUrl);
            return;
        }

        const currentPath = decodeURIComponent(window.location.pathname).split('/').pop() || 'index.html';
        const targetPath = decodeURIComponent(targetUrl).split('/').pop() || 'index.html';

        if (currentPath !== targetPath) {
            window.location.replace(targetUrl);
        }
    } catch (e) {
        console.error('Invalid URL in safeRedirect:', targetUrl, { code: e.code, message: e.message, details: e });
    }
}

/**
 * Validates a referral code by checking if it belongs to an existing user.
 * @param {string} code - The referral code to validate.
 * @returns {Promise<Object|null>} - Returns the user object if valid, or null.
 */



/**
 * Validates a referral code by checking if it belongs to an existing user.
 * @param {string} code - The referral code to validate.
 * @returns {Promise<Object|null>} - Returns the user object if valid, or null.
 */
export async function validateReferralCode(code) {
    if (!code || typeof code !== 'string') return null;
    try {
        const q = query(collection(db, "users"), where("referralCode", "==", code.trim().toUpperCase()));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
        return null;
    } catch (e) {
        console.error("Error validating referral code:", { code: e.code, message: e.message, details: e });
        return null;
    }
}
