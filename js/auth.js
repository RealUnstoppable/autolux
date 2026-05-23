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
