import { db } from './auth.js';
import { fetchUserDocsWithFallback } from "./utils.js";

import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function createServiceLog(logData) {
    try {
        const docRef = await addDoc(collection(db, "service_logs"), {
            ...logData,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating service log:", { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        return { success: false, error: error.message };
    }
}

export async function fetchUserServiceLogs(userId) {
    return await fetchUserDocsWithFallback("service_logs", userId, "serviceDate", getDocs, query, collection, db, where, orderBy);
}
