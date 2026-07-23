import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

import { submitDetailingRequestCore } from './utils.js';
import { auth } from './auth.js';

export async function submitDetailingRequest(bookingData) {
    try {
        const userId = auth.currentUser ? auth.currentUser.uid : null;
        const result = await submitDetailingRequestCore(userId, bookingData);
        if (result.success) {
            console.log("Document written with ID: ", result.docId);
            return { success: true, id: result.docId };
        } else {
            console.error("Error adding document: ", result.code, result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        return { success: false, error: error };
    }
}
