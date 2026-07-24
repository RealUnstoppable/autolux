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
export async function submitDetailingRequest(userId, requestData) {
    if (!userId) {
        return { success: false, error: "User must be authenticated to submit a request." };
    }
    const { submitDetailingRequestCore } = await import('./api.js');
    try {
        const result = await submitDetailingRequestCore({ userId, ...requestData, status: 'pending' });
        return { success: result.success, docId: result.id, error: result.error };
    } catch (error) {
        console.error("Failed to submit detailing request.");
        if (error.code) console.error("Firebase error code:", error.code);
        return { success: false, error: error.message, code: error.code };
    }
}