import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
