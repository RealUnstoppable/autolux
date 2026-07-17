import { db, auth } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { submitDetailingRequestCore } from './utils.js';

export async function submitDetailingRequest(bookingData) {
    try {
        const userId = auth?.currentUser?.uid;
        if (!userId) throw new Error("User not authenticated.");
        const docRef = await submitDetailingRequestCore(userId, bookingData);
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        return { success: false, error: error };
    }
}
