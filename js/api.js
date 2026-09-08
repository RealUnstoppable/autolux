import { db, auth } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function submitDetailingRequest(bookingData) {
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            // 🛡️ Sentinel: Spread user payload first to prevent Mass Assignment of trusted fields
            ...bookingData,
            userId: auth?.currentUser ? auth.currentUser.uid : (bookingData.userId || null),
            status: 'pending',
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        return { success: false, error: error };
    }
}
