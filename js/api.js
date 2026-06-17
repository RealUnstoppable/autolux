import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function submitDetailingRequest(bookingData) {
    if (!db) {
        return { success: false, error: 'Database not initialized.' };
    }

    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        return { success: false, error: 'Failed to submit detailing request.' };
    }
}
