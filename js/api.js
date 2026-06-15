import { db, auth } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function submitDetailingRequest(bookingData) {
    if (!db) {
        console.error("Firebase db is not initialized");
        return { success: false, error: "Firebase not initialized" };
    }
    if (!auth || !auth.currentUser) {
        console.error("User not authenticated");
        return { success: false, error: "User not authenticated" };
    }
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding document: ", error.message);
        if (error.code) console.error("Error code: ", error.code);
        return { success: false, error: error.message };
    }
}
