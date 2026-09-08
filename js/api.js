import { db, auth } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function submitDetailingRequest(bookingData) {
    if (!auth || !auth.currentUser) return { success: false, error: 'User not authenticated' };
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        if (error.code) console.error(error.code);
        console.error("Error adding document:", error.message);
        return { success: false, error: error };
    }
}
