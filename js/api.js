import { db } from './auth.js';
import { submitDetailingRequestCore } from './utils.js';

export async function submitDetailingRequest(bookingData) {
    try {
        const docRef = await submitDetailingRequestCore(bookingData.userId || null, bookingData);
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        if (error.code) console.error("Error code:", error.code);
        console.error("Error adding document: ", error.message);
        console.error(error);
        return { success: false, error: error };
    }
}
