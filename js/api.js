import { db, submitDetailingRequestCore } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function submitDetailingRequest(bookingData) {
    try {
        const docId = await submitDetailingRequestCore(bookingData);
        console.log("Document written with ID: ", docId);
        return { success: true, id: docId };
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        return { success: false, error: error };
    }
}
