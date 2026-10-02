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
 * Submits a document to a specified Firestore collection safely.
 * @param {string} collectionName - The name of the collection.
 * @param {object} payloadData - The data payload to submit.
 * @returns {Promise<object>} The result of the operation.
 */
export async function submitToFirestore(collectionName, payloadData) {
    try {
        const payload = {
            ...payloadData,
            createdAt: serverTimestamp(),
            status: 'pending'
        };

        if ('isAdmin' in payload) {
            delete payload.isAdmin;
        }

        const docRef = await addDoc(collection(db, collectionName), payload);
        return { success: true, docId: docRef.id };
    } catch (error) {
        console.error(`Firebase connection error in ${collectionName}. Code:`, error.code || 'UNKNOWN_ERROR');
        console.error(`Failed to submit request to ${collectionName}:`, { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
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


