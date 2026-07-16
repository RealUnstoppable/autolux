import { db } from './auth.js';
import { submitDetailingRequestCore } from './auth.js';

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

    try {
        const id = await submitDetailingRequestCore({userId: userId, ...requestData});
        return { success: true, docId: id };
    } catch (error) {
        console.error("Failed to submit detailing request.");
        if (error.code) {
            console.error("Firebase error code:", error.code);
        }
        console.error("Full error:", error);

        return { success: false, error: error.message, code: error.code, message: "An error occurred while submitting your request. Please try again later." };
    }
}