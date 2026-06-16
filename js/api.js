import { db, auth } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function submitDetailingRequest(bookingData) {
    if (!db || !auth) {
        return { success: false, error: "Database connection not established." };
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
        return { success: false, error: "User is not authenticated." };
    }

    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            userId: currentUser.uid,
            ...bookingData,
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding document: ", error.message);
        if (error.code) console.error("Error code:", error.code);
        return { success: false, error: "Failed to process request. Please try again." };
    }
}