import { db } from './auth.js';
import { submitDetailingRequestCore } from './utils.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function submitDetailingRequest(bookingData) {
    try {
        const docRef = await submitDetailingRequestCore(bookingData.userId, bookingData);
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        return { success: false, error: error };
    }
}
