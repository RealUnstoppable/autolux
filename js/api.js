import { db, auth } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function submitDetailingRequestCore(requestData, userId = null) {
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

export async function submitDetailingRequest(requestData, userId = null) {
    return await submitDetailingRequestCore(requestData, userId);
}

export async function submitQuoteRequest(quoteData) {
    try {
        const docRef = await addDoc(collection(db, "quotes"), {
            ...quoteData,
            status: "pending",
            createdAt: serverTimestamp()
        });
        console.log("Quote request submitted successfully with ID:", docRef.id);
        return { success: true, docId: docRef.id };
    } catch (error) {
        console.error("Error submitting quote request:", error.message);
        if (error.code) console.error("Error code:", error.code);
        return { success: false, error: error.message, code: error.code };
    }
}
