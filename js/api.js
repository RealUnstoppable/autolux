import { db, auth } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

/**
 * Submits a new detailing request to Firestore.
 * @param {Object} requestData - The data for the detailing request.
 * @param {string} [userId] - Optional. If not provided, it will attempt to use the current auth user.
 * @returns {Promise<Object>} - Returns { success: true, id: docRef.id } on success, or { success: false, error: ... } on error.
 */
export async function submitDetailingRequest(requestData, userId = null) {
    if (!db) {
        console.error("Cannot submit detailing request: Firebase is not fully initialized.");
        return { success: false, error: { message: "Firebase is not fully initialized." } };
    }

    const uid = userId || (auth && auth.currentUser ? auth.currentUser.uid : null);

    if (!uid) {
        console.error("Cannot submit detailing request: User is not authenticated.");
        return { success: false, error: { message: "User is not authenticated." } };
    }

    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...requestData,
            userId: uid,
            status: "pending",
            createdAt: serverTimestamp()
        });
        console.log("Detailing request submitted successfully with ID:", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error submitting detailing request:", { code: error.code, message: error.message, details: error });
        return { success: false, error: { code: error.code, message: error.message } };
    }
}
