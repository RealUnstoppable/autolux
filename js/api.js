import { db, auth } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function submitDetailingRequest(bookingData) {
    if (!db || !auth) {
        console.error("Cannot submit detailing request: Firebase is not fully initialized.");
        return { success: false, error: "Firebase not initialized" };
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.error("Cannot submit detailing request: User is not authenticated.");
        return { success: false, error: "User not authenticated" };
    }

    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            userId: currentUser.uid, // Required by security rules
            status: "pending",
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        if (error.code) console.error("Error code:", error.code);
        return { success: false, error: error };
    }
}
