import { db } from './auth.js';
import { submitDetailingRequestCore } from './utils.js';

export async function submitDetailingRequest(bookingData) {
    try {
        const docId = await submitDetailingRequestCore(bookingData);
        console.log("Document written with ID: ", docId);
        return { success: true, id: docId };
    } catch (error) {
        console.error("Error adding document: ", error.message);
        if (error.code) console.error("Error code:", error.code);
        return { success: false, error: error };
    }
}
