import { db, auth } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function submitDetailingRequest(bookingData) {
    try {
        const payload = {
            ...bookingData,
            createdAt: serverTimestamp()
        };

        if (auth && auth.currentUser) {
            payload.userId = auth.currentUser.uid;
        }

        const docRef = await addDoc(collection(db, "bookings"), payload);
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        return { success: false, error: { message: error.message, code: error.code } };
    }
}
