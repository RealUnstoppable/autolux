import { submitDetailingRequestCore } from './utils.js';

export async function submitDetailingRequest(bookingData) {
    const result = await submitDetailingRequestCore(bookingData.userId, bookingData);
    if (result.success) {
        console.log("Document written with ID: ", result.docId);
        return { success: true, id: result.docId };
    } else {
        return { success: false, error: result.error };
    }
}
