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
        console.error(`Error adding ${type.toLowerCase()} document:`, { code: error.code || "UNKNOWN_ERROR", message: error.message, details: error });
        return { success: false, error: `An error occurred while submitting your ${type.toLowerCase()} request. Please try again later.`, message: "An error occurred while submitting your request. Please try again later." };
    }
}

export async function submitDetailingRequest(bookingData) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.error("Cannot submit detailing request: User is not authenticated.");
        return { success: false, error: "User must be authenticated", message: "An error occurred while submitting your request. Please try again later." };
    }
    const userId = currentUser.uid;
    return handleApiRequest(submitDetailingRequestCore, [userId, bookingData], "Detailing");
}

export async function submitQuoteRequest(quoteData) {
    return handleApiRequest(submitQuoteRequestCore, [quoteData], "Quote");
}

export async function submitDetailingPlan(planData) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.error("Cannot submit detailing plan: User is not authenticated.");
        return { success: false, error: "User must be authenticated", message: "An error occurred while submitting your request. Please try again later." };
    }
    return handleApiRequest(submitDetailingPlanCore, [currentUser.uid, planData], "DetailingPlan");
}
