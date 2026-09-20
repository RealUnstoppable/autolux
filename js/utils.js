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
    if (!userId) {
        return { success: false, error: "User must be authenticated to submit a request." };
    }
    
    try {
        const payload = {
            // 🛡️ Sentinel: Spread user payload first to prevent Mass Assignment of trusted fields
            ...requestData,
            userId: userId,
            createdAt: serverTimestamp(),
            status: 'pending'
        };

        // Ensure user can't inject admin status
        if ('isAdmin' in payload) {
            delete payload.isAdmin;
        }

        if (requestData.referralCode) {
            payload.referralCode = requestData.referralCode.trim().toUpperCase();
        }

        const docRef = await addDoc(collection(db, "bookings"), payload);
        return { success: true, docId: docRef.id };
    } catch (error) {
        // Robust error handling: Log error.code specifically to identify App Check, CORS, or API key issues
        console.error("Firebase connection error. Code:", error.code || 'UNKNOWN_ERROR');
        console.error("Failed to submit detailing request:", { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        return { success: false, error: "Failed to submit request.", code: error.code || 'UNKNOWN_ERROR' };
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
            console.warn('Session storage quota exceeded. Unable to cache data for key:', key, { code: e.code, message: e.message, details: e });
        } else {
            console.error('Error setting session storage for key:', key, { code: e.code, message: e.message, details: e });
        }
    }
}

/**
 * Safely gets an item from sessionStorage, catching SecurityError.
 * @param {string} key
 * @returns {string|null}
 */
export function safeGetSessionStorage(key) {
    try {
        return sessionStorage.getItem(key);
    } catch (e) {
        console.warn('Session storage read failed. Key:', key, { code: e.code, message: e.message, details: e });
        return null;
    }
}

/**
 * Submits a custom quote request to the quotes collection.
 * @param {object} quoteData - The data for the quote request.
 * @returns {Promise<object>} The result of the operation.
 */
export async function submitQuoteRequestCore(quoteData) {
    try {
        const payload = {
            // Spread user payload first to prevent Mass Assignment of trusted fields
            ...quoteData,
            createdAt: serverTimestamp(),
            status: 'pending'
        };

        // Ensure user can't inject admin status
        if ('isAdmin' in payload) {
            delete payload.isAdmin;
        }

        const docRef = await addDoc(collection(db, "quotes"), payload);
        return { success: true, docId: docRef.id };
    } catch (error) {
        console.error("Failed to submit quote request:", { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        return { success: false, error: "Failed to submit request.", code: error.code || 'UNKNOWN_ERROR' };
    }
}
