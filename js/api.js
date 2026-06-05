import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function submitDetailingRequest(userId, requestData) {
    if (!userId) {
        return { success: false, error: "User must be authenticated to submit a request." };
    }
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            userId: userId,
            ...requestData,
            createdAt: serverTimestamp(),
            status: 'pending'
        });
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        if (error.code) console.error("Firebase error code:", error.code);
        console.error("Message:", { code: error.code, message: error.message, details: error });
        return { success: false, error: error.message, code: error.code };
    }
}
