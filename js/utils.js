export function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
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
 * Submits a new detailing request to Firestore.
 * @param {Object} requestData - The detailing request data (e.g., name, vehicle, serviceType).
 * @param {string} [userId] - Optional user ID if the user is logged in.
 * @returns {Promise<string>} The ID of the newly created document.
 */
export async function submitDetailingRequest(requestData, userId = null) {
    if (!db) {
        throw new Error("Firestore database is not initialized.");
    }

    try {
        const docRef = await addDoc(collection(db, "detailingRequests"), {
            ...requestData,
            userId: userId,
            status: "pending",
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error submitting detailing request:", error.message);
        if (error.code) {
            console.error("Firebase Error Code:", error.code);
        }
        throw error;
    }
}
