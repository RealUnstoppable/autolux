import { fetchWithFallback } from './utils.js';
import { db } from './auth.js';
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
    try {
        const logsRef = collection(db, "service_logs");
        const primaryQuery = query(logsRef, where("userId", "==", userId), orderBy("serviceDate", "desc"));
        const fallbackQuery = query(logsRef, where("userId", "==", userId));

        return await fetchWithFallback(
            primaryQuery,
            fallbackQuery,
            (a, b) => (b.serviceDate?.seconds || 0) - (a.serviceDate?.seconds || 0)
        );
    } catch (error) {
        console.error("Unexpected error in fetchUserServiceLogs setup:", { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        return [];
    }
}
