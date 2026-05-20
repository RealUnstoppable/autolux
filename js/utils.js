import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

/**
 * Submits a detailing request to the bookings collection.
 * @param {string} userId - The user's Firebase Auth UID.
 * @param {object} requestData - The data for the detailing request.
 * @returns {Promise<object>} The result of the operation.
 */
export async function submitDetailingRequest(userId, requestData) {
    if (!userId) {
        return { success: false, error: "User must be authenticated to submit a request." };
    }

    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            userId: userId,
            ...requestData,
            createdAt: serverTimestamp(),
            status: 'pending'
        });

        return { success: true, docId: docRef.id };
    } catch (error) {
        console.error("Failed to submit detailing request.");
        if (error.code) {
            console.error("Firebase error code:", error.code);
        }
        console.error("Full error:", error);

        return { success: false, error: error.message, code: error.code };
    }
}