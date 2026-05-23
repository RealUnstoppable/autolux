import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

/**
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