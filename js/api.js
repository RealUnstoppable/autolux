import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { submitDetailingRequestCore, submitQuoteRequestCore } from './utils.js';
import { db, auth } from './auth.js';


async function handleApiSubmission(coreFunction, payload, authRequired, errorPrefix) {
    if (authRequired) {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error(`Cannot submit ${errorPrefix}: User is not authenticated.`);
            return { success: false, error: "User must be authenticated", message: `An error occurred while submitting your ${errorPrefix}. Please try again later.` };
        }
    }

    try {
        let result;
        if (authRequired) {
            const userId = auth.currentUser ? auth.currentUser.uid : null;
            result = await coreFunction(userId, payload);
        } else {
            result = await coreFunction(payload);
        }

        if (result.success) {
            console.log("Document written with ID: ", result.docId);
            return { success: true, id: result.docId };
        } else {
            console.error("Error adding document: ", result.code, result.error);
            return { success: false, error: `An error occurred while submitting your ${errorPrefix}. Please try again later.` };
        }
    } catch (error) {
        console.error('Error context:', { code: error?.code, message: error?.message, details: error });
        return { success: false, error: `An error occurred while submitting your ${errorPrefix}. Please try again later.`, message: `An error occurred while submitting your ${errorPrefix}. Please try again later.` };
    }
}


export async function submitDetailingRequest(bookingData) {
    return await handleApiSubmission(submitDetailingRequestCore, bookingData, true, 'request');
}

export async function submitQuoteRequest(quoteData) {
    return await handleApiSubmission(submitQuoteRequestCore, quoteData, false, 'quote request');
}
