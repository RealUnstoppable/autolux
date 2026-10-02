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
        return { success: false, error: "Failed to create service log." };
    }
}

export async function fetchUserServiceLogs(userId) {
    try {
        const q = query(
            collection(db, "service_logs"),
            where("userId", "==", userId),
            orderBy("serviceDate", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching service logs:", { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        // Fallback for missing index
        if (error.code === 'failed-precondition' || error.message.includes('index')) {
            console.warn("Missing index. Returning unsorted logs.");
            const qFallback = query(collection(db, "service_logs"), where("userId", "==", userId));
            const snap = await getDocs(qFallback);
            const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return logs.sort((a,b) => (b.serviceDate?.seconds || 0) - (a.serviceDate?.seconds || 0));
        }
        return [];
    }
}
