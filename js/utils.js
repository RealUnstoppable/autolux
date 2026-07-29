import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Submits a detailing request to the bookings collection.
 * @param {string} userId - The user's Firebase Auth UID.
 * @param {object} requestData - The data for the detailing request.
 * @returns {Promise<object>} The result of the operation.
 */

/**
 * Core utility to submit a detailing request.
 * @param {object} data - The data for the detailing request.
 * @returns {Promise<string>} The document ID.
 * @throws {Error} If the submission fails.
 */
export async function submitDetailingRequestCore(data) {
    const docRef = await addDoc(collection(db, "bookings"), {
        ...data,
        createdAt: serverTimestamp(),
        status: data.status || 'pending'
    });
    return docRef.id;
}

export async function submitDetailingRequest(userId, requestData) {
    if (!userId) {
        return { success: false, error: "User must be authenticated to submit a request." };
    }

    try {
        const docId = await submitDetailingRequestCore({
            userId: userId,
            ...requestData
        });
        return { success: true, docId: docId };
    } catch (error) {
        console.error("Failed to submit detailing request.");
        if (error.code) {
            console.error("Firebase error code:", error.code);
        }
        console.error("Full error:", error);

        return { success: false, error: error.message, code: error.code };
    }
}