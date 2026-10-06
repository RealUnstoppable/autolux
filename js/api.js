import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { submitDetailingRequestCore, submitQuoteRequestCore, submitDetailingPlanCore } from './utils.js';
import { db, auth } from './auth.js';


async function handleApiRequest(coreFunction, payload, type) {
    try {
        const result = await coreFunction(...payload);
        if (result.success) {
            console.log(`${type} document written with ID: `, result.docId);
            return { success: true, id: result.docId };
        } else {
            console.error(`Error adding ${type.toLowerCase()} document: `, result.code, result.error);
            return { success: false, error: `An error occurred while submitting your ${type.toLowerCase()} request. Please try again later.` };
        }
    } catch (error) {
        console.error("Firebase connection error - Code:", error.code || 'UNKNOWN_ERROR');
        if (error.code === 'app-check/fetch-status-error' || error.code === 'permission-denied') {
            console.error("App Check or CORS issue detected:", error.message);
        } else if (error.code === 'auth/invalid-api-key') {
            console.error("Invalid API key detected:", error.message);
        } else {
            console.error(`Error adding ${type.toLowerCase()} document:`, { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        }
        return { success: false, error: `An error occurred while submitting your ${type.toLowerCase()} request. Please try again later.`, code: error.code || 'UNKNOWN_ERROR' };
    }
}

async function requireAuthAndSubmit(submitFn, payloadBuilder, type) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.error(`Cannot submit ${type.toLowerCase()}: User is not authenticated.`);
        return { success: false, error: "User must be authenticated", message: "An error occurred while submitting your request. Please try again later." };
    }
    const payloadArgs = payloadBuilder(currentUser);
    return handleApiRequest(submitFn, payloadArgs, type);
}

export async function submitDetailingRequest(bookingData) {
    return requireAuthAndSubmit(
        submitDetailingRequestCore,
        (user) => {
            const payload = { ...bookingData, userId: user.uid };
            if (bookingData.referralCode) {
                payload.referralCode = bookingData.referralCode.trim().toUpperCase();
            }
            return [user.uid, payload]; // Match submitDetailingRequestCore signature
        },
        "Detailing"
    );
}

export async function submitQuoteRequest(quoteData) {
    return handleApiRequest(submitQuoteRequestCore, [quoteData], "Quote");
}

export async function submitDetailingPlan(planData) {
    return requireAuthAndSubmit(
        submitDetailingPlanCore,
        (user) => [user.uid, planData], // Match submitDetailingPlanCore signature
        "DetailingPlan"
    );
}
