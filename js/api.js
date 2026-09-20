import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { submitDetailingRequestCore, submitQuoteRequestCore } from './utils.js';
import { db, auth } from './auth.js';


export async function submitDetailingRequest(bookingData) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.error("Cannot submit detailing request: User is not authenticated.");
        return { success: false, error: "User must be authenticated", message: "An error occurred while submitting your request. Please try again later." };
    }

    try {
        const userId = auth.currentUser ? auth.currentUser.uid : null;
        const result = await submitDetailingRequestCore(userId, bookingData);
        if (result.success) {
            console.log("Document written with ID: ", result.docId);
            return { success: true, id: result.docId };
        } else {
            console.error("Error adding document: ", result.code, result.error);
            return { success: false, error: "An error occurred while submitting your request. Please try again later." };
        }
    } catch (error) {
        console.error("Error adding document:", error.message);
        if (error.code) console.error("Firebase error code:", error.code);
        return { success: false, error: "An error occurred while submitting your request. Please try again later.", message: "An error occurred while submitting your request. Please try again later." };
    }
}

export async function submitQuoteRequest(quoteData) {
    try {
        const result = await submitQuoteRequestCore(quoteData);
        if (result.success) {
            console.log("Quote document written with ID: ", result.docId);
            return { success: true, id: result.docId };
        } else {
            console.error("Error adding quote document: ", result.code, result.error);
            return { success: false, error: "An error occurred while submitting your quote request. Please try again later." };
        }
    } catch (error) {
        console.error("Error adding quote document:", error.message);
        if (error.code) console.error("Firebase error code:", error.code);
        return { success: false, error: "An error occurred while submitting your quote request. Please try again later.", message: "An error occurred while submitting your request. Please try again later." };
    }
}
