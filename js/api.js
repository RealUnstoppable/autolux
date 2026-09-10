import { db, auth } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function submitDetailingRequest(requestData, userId = null) {
    if (userId && requestData.userId === undefined) {
        requestData.userId = userId;
    }
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...requestData,
            status: requestData.status || "pending",
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id, docId: docRef.id };
    } catch (error) {
        console.error("Error adding document: ", error.message);
        if(error.code) console.error("Error code:", error.code);
        return { success: false, error: error.message, code: error.code };
    }
}
