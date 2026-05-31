import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

import { auth } from './auth.js';

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
        console.error("Error submitting detailing request:", { code: error.code, message: error.message, details: error });
        return null;
    }
}
