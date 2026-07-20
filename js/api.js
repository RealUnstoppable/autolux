import { db, auth } from './auth.js';
import { submitDetailingRequestCore } from './utils.js';

export async function submitDetailingRequest(bookingData) {
    try {
        if (!auth.currentUser) throw new Error("User not authenticated");
        const res = await submitDetailingRequestCore(auth.currentUser.uid, bookingData);
        if (res.success) {
            console.log("Document written with ID: ", res.docId);
            return { success: true, id: res.docId };
        } else {
            throw new Error(res.error);
        }
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        return { success: false, error: error };
    }
}
