import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


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
export async function submitDetailingRequestCore(userId, requestData) {
    return await addDoc(collection(db, "bookings"), {
        ...requestData,
        ...(userId && { userId }),
        createdAt: serverTimestamp(),
        status: 'pending'
    });
}

export function safeSetSessionStorage(key, value) {
    try {
        sessionStorage.setItem(key, value);
    } catch (e) {
        console.error('Storage quota exceeded');
    }
}

export async function submitDetailingRequest(userId, requestData) {
    if (!userId) {
        return { success: false, error: "User must be authenticated to submit a request." };
    }

    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            // 🛡️ Sentinel: Spread user payload first to prevent Mass Assignment of trusted fields
            ...requestData,
            userId: userId,
            createdAt: serverTimestamp(),
            status: 'pending'
        });
        return { success: true, docId: docId };
    } catch (error) {
        console.error("Failed to submit detailing request.");
        if (error.code) console.error(error.code);
        console.error("Full error:", error);

        return { success: false, error: "Failed to submit request.", code: error.code };
    }
}

/**
 * Safely sets an item in sessionStorage, catching QuotaExceededError.
 * @param {string} key
 * @param {string} value
 */
export function safeSetSessionStorage(key, value) {
    try {
        sessionStorage.setItem(key, value);
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn('Session storage quota exceeded. Unable to cache data for key:', key);
        } else {
            console.error('Error setting session storage for key:', key, e);
        }
    }
}
