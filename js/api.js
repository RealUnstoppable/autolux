import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function submitDetailingRequest(userId, bookingData) {
    if (!userId) {
        return { success: false, error: "User must be authenticated to submit a request." };
    }
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            userId: userId,
            ...bookingData,
            status: "pending",
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        return { success: false, error: error };
    }
}
