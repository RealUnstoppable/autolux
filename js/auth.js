import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export let app, auth, db;

try {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const isAutolux = hostname.includes('autolux');
    const appName = isAutolux ? "autolux-detailing-app" : "ezmanage-app";

    // 🛡️ Security Fix: Prevent hardcoded Firebase configuration
    // Rationale: Hardcoded non-dummy configuration values can inadvertently connect to real projects
    // or leak environment details. We enforce loading from window.ENV and fail securely if missing.
    if (typeof window !== 'undefined' && (!window.ENV || !window.ENV.FIREBASE_API_KEY)) {
        throw new Error("Missing required Firebase configuration in window.ENV. Failing securely.");
    }
    const env = typeof window !== 'undefined' && window.ENV ? window.ENV : {};

    // Validate auth domain to prevent ezManage cross-contamination while supporting autolux.store & autolux.realunstoppable.store
    const validAutoluxDomains = ['autolux.realunstoppable.store', 'autolux.store'];
    const isDomainAutolux = env.FIREBASE_AUTH_DOMAIN && (validAutoluxDomains.includes(env.FIREBASE_AUTH_DOMAIN) || env.FIREBASE_AUTH_DOMAIN.includes('autolux') || env.FIREBASE_AUTH_DOMAIN.includes('autolux-detailing.firebaseapp.com'));
    if (isAutolux && !isDomainAutolux) {
        throw new Error("Critical Error: Environment config auth domain does not match expected Autolux domain. Preventing cross-origin auth issue.");
    }

    if (isAutolux && env.FIREBASE_PROJECT_ID !== 'autolux-detailing') {
        throw new Error("Strict check failed: Environment config project ID does not match expected Autolux project ID. Stopping initialization to prevent cross-contamination.");
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
    if (error.code === 'app-check/fetch-status-error' || error.code === 'permission-denied') {
        console.error("App Check or CORS issue detected:", error.message);
    } else if (error.code === 'auth/invalid-api-key') {
        console.error("Invalid API key detected:", error.message);
    } else {
        console.error("Firebase connection error:", { message: error.message, details: error });
    }
}

// Performance Caching for User Documents to eliminate redundant Firestore queries
const userDocMemoryCache = new Map();
const inFlightUserDocPromises = new Map();
const USER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function serializeUserData(data) {
    if (!data) return null;
    const copy = { ...data };
    if (copy.signupDate && typeof copy.signupDate.toDate === 'function') {
        copy.signupDate = { _isTimestamp: true, seconds: copy.signupDate.seconds, nanoseconds: copy.signupDate.nanoseconds || 0 };
    }
    return JSON.stringify(copy);
}

function deserializeUserData(jsonStr) {
    if (!jsonStr) return null;
    const obj = JSON.parse(jsonStr);
    if (obj && obj.signupDate && obj.signupDate._isTimestamp) {
        const { seconds, nanoseconds } = obj.signupDate;
        obj.signupDate = {
            seconds,
            nanoseconds,
            toDate: () => new Date(seconds * 1000 + (nanoseconds || 0) / 1000000)
        };
    }
    return obj;
}

/**
 * Safely retrieves cached user doc from sessionStorage.
 * @param {string} uid - User ID
 * @returns {Object|null}
 */
function getCachedUserDocFromSession(uid) {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    try {
        const raw = sessionStorage.getItem(`autolux_user_doc_${uid}`);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (entry && entry.data && (Date.now() - (entry.timestamp || 0) < USER_CACHE_TTL_MS)) {
            return deserializeUserData(JSON.stringify(entry.data));
        }
    } catch (e) {
        // Handle SecurityError / QuotaExceededError per .Jules/bolt.md
    }
    return null;
}

/**
 * Safely stores cached user doc in sessionStorage.
 * @param {string} uid - User ID
 * @param {Object} data - Document data to cache
 */
function setCachedUserDocInSession(uid, data) {
    if (typeof window === 'undefined' || !window.sessionStorage || !data) return;
    try {
        const serialized = serializeUserData(data);
        if (serialized) {
            sessionStorage.setItem(`autolux_user_doc_${uid}`, JSON.stringify({
                data: JSON.parse(serialized),
                timestamp: Date.now()
            }));
        }
    } catch (e) {
        // Handle SecurityError / QuotaExceededError per .Jules/bolt.md
    }
}

/**
 * Clears the user document cache from memory and sessionStorage.
 * @param {string} [uid] - Specific user UID to clear, or clears all if omitted.
 */
export function clearUserDocumentCache(uid) {
    if (uid) {
        userDocMemoryCache.delete(uid);
        inFlightUserDocPromises.delete(uid);
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                sessionStorage.removeItem(`autolux_user_doc_${uid}`);
            } catch (e) {}
        }
    } else {
        userDocMemoryCache.clear();
        inFlightUserDocPromises.clear();
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                for (let i = sessionStorage.length - 1; i >= 0; i--) {
                    const key = sessionStorage.key(i);
                    if (key && key.startsWith('autolux_user_doc_')) {
                        sessionStorage.removeItem(key);
                    }
                }
            } catch (e) {}
        }
    }
}

/**
 * Safe signOut wrapper that purges cached user document data.
 * @param {Object} [authInstance=auth] - Firebase auth instance.
 * @returns {Promise<void>}
 */
export async function safeSignOut(authInstance = auth) {
    clearUserDocumentCache();
    if (authInstance) {
        return await signOut(authInstance);
    }
}

// Auto-purge cached user document when authentication state becomes null
try {
    if (auth && typeof onAuthStateChanged === 'function') {
        onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                clearUserDocumentCache();
            }
        });
    }
} catch (e) {
    // Non-fatal if auth listener cannot be attached in mock/test setup
}

export { createUserWithEmailAndPassword, signInWithEmailAndPassword, safeSignOut as signOut, updateProfile, onAuthStateChanged };

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
 * Employs in-memory and sessionStorage caching along with in-flight deduplication for maximum speed.
 * @param {Object} user - The Firebase Auth user object.
 * @param {Object} [options] - Options object.
 * @param {boolean} [options.forceRefresh=false] - If true, bypasses the cache and forces a fresh query.
 * @returns {Promise<Object>} - Returns the user data.
 */
export async function ensureUserDocument(user, options = {}) {
    if (!db || !user) return null;

    const uid = user.uid;
    const forceRefresh = Boolean(options && options.forceRefresh);

    if (!forceRefresh) {
        // 1. Check in-memory cache
        const memEntry = userDocMemoryCache.get(uid);
        if (memEntry && (Date.now() - memEntry.timestamp < USER_CACHE_TTL_MS)) {
            return memEntry.data;
        }

        // 2. Return in-flight promise if a request for this uid is currently running
        if (inFlightUserDocPromises.has(uid)) {
            return inFlightUserDocPromises.get(uid);
        }

        // 3. Check sessionStorage cache
        const sessionData = getCachedUserDocFromSession(uid);
        if (sessionData && sessionData.referralCode) {
            userDocMemoryCache.set(uid, { data: sessionData, timestamp: Date.now() });
            return sessionData;
        }
    }

    const fetchPromise = (async () => {
        try {
            const userDocRef = doc(db, "users", uid);
            const userDoc = await getDoc(userDocRef);

            let data;
            if (userDoc && typeof userDoc.exists === 'function' && userDoc.exists()) {
                data = userDoc.data();
                const updates = {};
                let referralCode = data.referralCode;
                if (!referralCode) {
                    referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                    updates.referralCode = referralCode;
                    data.referralCode = referralCode;
                }
                if (data.referralCredits === undefined) {
                    updates.referralCredits = 0;
                    data.referralCredits = 0;
                }

                // Sync referral code mapping to referral_codes lookup collection
                if (data.referralCode) {
                    try {
                        const refCodeRef = doc(db, "referral_codes", data.referralCode);
                        await setDoc(refCodeRef, {
                            code: data.referralCode,
                            userId: uid,
                            createdAt: data.signupDate || serverTimestamp()
                        }, { merge: true });
                    } catch (refCodeErr) {
                        console.warn("Could not sync referral code mapping:", refCodeErr);
                    }
                }

                // Ensure user has received the 100 points sign up bonus
                if (data.loyaltyPoints === undefined || data.loyaltyPoints === 0 || !data.bonusAwarded) {
                    updates.loyaltyPoints = 100;
                    updates.bonusAwarded = true;
                    data.loyaltyPoints = 100;
                    data.bonusAwarded = true;

                    try {
                        await addDoc(collection(db, "notifications"), {
                            userId: uid,
                            title: "100 Points Sign Up Bonus Transferred",
                            message: "Welcome to AutoLux! A 100 points sign up bonus has been transferred to your account.",
                            type: "bonus",
                            amount: 100,
                            read: false,
                            createdAt: serverTimestamp()
                        });
                    } catch (notifErr) {
                        console.warn("Could not record sign up bonus notification:", notifErr);
                    }
                }
                if (Object.keys(updates).length > 0) {
                    await setDoc(userDocRef, updates, { merge: true });
                }
            } else {
                const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                const newUserData = {
                    uid: uid,
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
                    loyaltyPoints: 100,
                    bonusAwarded: true,
                    referralCode: referralCode,
                    referralCredits: 0
                };
                await setDoc(userDocRef, newUserData);

                // Register code mapping for fast lookup and validation
                try {
                    const refCodeRef = doc(db, "referral_codes", referralCode);
                    await setDoc(refCodeRef, {
                        code: referralCode,
                        userId: uid,
                        createdAt: serverTimestamp()
                    });
                } catch (refCodeErr) {
                    console.warn("Could not register referral code mapping:", refCodeErr);
                }

                try {
                    await addDoc(collection(db, "notifications"), {
                        userId: uid,
                        title: "100 Points Sign Up Bonus Transferred",
                        message: "Welcome to AutoLux! A 100 points sign up bonus has been transferred to your account.",
                        type: "bonus",
                        amount: 100,
                        read: false,
                        createdAt: serverTimestamp()
                    });
                } catch (notifErr) {
                    console.warn("Could not record sign up bonus notification:", notifErr);
                }

                data = newUserData;
            }

            if (data) {
                userDocMemoryCache.set(uid, { data, timestamp: Date.now() });
                setCachedUserDocInSession(uid, data);
            }
            return data;
        } catch (error) {
            console.error("Error ensuring user document - Code:", error.code || 'UNKNOWN_ERROR');
            console.error("Error ensuring user document:", { message: error.message, details: error });
            return null;
        } finally {
            inFlightUserDocPromises.delete(uid);
        }
    })();

    inFlightUserDocPromises.set(uid, fetchPromise);
    return fetchPromise;
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
    const cleanPath = decodedPath.split('?')[0].split('#')[0].replace(/\/$/, '');
    const filename = cleanPath.split('/').pop().toLowerCase() || '';
    const baseName = filename.replace(/\.html$/, '');

    if (!user) {
        const publicBases = ['', 'index', 'sign in beta', 'sign-in-beta', 'donate', 'rewards'];
        const isPublic = publicBases.includes(baseName) || cleanPath === '' || cleanPath === '/';

        if (!isPublic) {
            return 'sign in beta.html';
        }
        return null;
    }

    if (userData && userData.isAdmin) {
        if (baseName !== 'admin') {
            return 'admin.html';
        }
        return null;
    } else {
        if (baseName === 'admin') {
            return 'account.html';
        } else if (baseName === 'sign in beta' || baseName === 'sign-in-beta') {
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
    if (!targetUrl || typeof targetUrl !== 'string') return;

    try {
        // 🛡️ Sentinel: Prevent Open Redirect and javascript: URI XSS
        const dummyBase = 'http://safe-dummy-base.local';
        const parsed = new URL(targetUrl, dummyBase);

        // Disallow dangerous URI protocols (XSS risk)
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
        if (dangerousProtocols.includes(parsed.protocol)) {
            console.error('Unsafe redirect attempt blocked:', targetUrl);
            return;
        }

        // Validate origin: allow dummyBase (relative URLs), same-origin absolute URLs, or local file: protocol
        const currentOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : null;
        const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:' && parsed.protocol === 'file:';
        const isSameOrigin = (parsed.origin === dummyBase) || (Boolean(currentOrigin) && currentOrigin !== 'null' && parsed.origin === currentOrigin) || isFileProtocol;

        if (!isSameOrigin) {
            console.error('Unsafe redirect attempt blocked:', targetUrl);
            return;
        }

        const currentPath = typeof window !== 'undefined' && window.location && window.location.pathname
            ? decodeURIComponent(window.location.pathname).split('/').pop() || 'index.html'
            : 'index.html';
        const targetPath = decodeURIComponent(parsed.pathname).split('/').pop() || 'index.html';

        if (currentPath !== targetPath) {
            try {
                window.location.replace(targetUrl);
            } catch (err) {
                console.warn('window.location.replace failed, falling back to href:', err);
                window.location.href = targetUrl;
            }
        }
    } catch (e) {
        console.error('Invalid URL in safeRedirect - Code:', e.code || 'UNKNOWN_ERROR');
        console.error('Invalid URL in safeRedirect:', targetUrl, { message: e.message, details: e });
    }
}

/**
 * Validates a referral code by checking if it belongs to an existing user.
 * @param {string} code - The referral code to validate.
 * @returns {Promise<Object|null>} - Returns the user object if valid, or null.
 */
export async function validateReferralCode(code) {
    if (!code || typeof code !== 'string') return null;
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return null;

    try {
        // 1. Direct document lookup in referral_codes collection
        const refDocRef = doc(db, "referral_codes", cleanCode);
        const refDocSnap = await getDoc(refDocRef);
        if (refDocSnap && typeof refDocSnap.exists === 'function' && refDocSnap.exists()) {
            const data = refDocSnap.data();
            return {
                id: data.userId,
                uid: data.userId,
                userId: data.userId,
                referralCode: cleanCode,
                ...data
            };
        }

        // 2. Fallback: Query users collection where referralCode == cleanCode
        const q = query(collection(db, "users"), where("referralCode", "==", cleanCode));
        const snapshot = await getDocs(q);
        if (snapshot && !snapshot.empty) {
            const docSnap = snapshot.docs[0];
            return { id: docSnap.id, uid: docSnap.id, userId: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (e) {
        console.error("Error validating referral code - Code:", e.code || 'UNKNOWN_ERROR');
        console.error("Error validating referral code:", { message: e.message, details: e });
        return null;
    }
}
