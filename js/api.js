import { db } from './auth.js';

import { submitDetailingRequestCore } from './auth.js';

import { auth } from './auth.js';

export async function submitDetailingRequest(bookingData) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.error("Cannot submit detailing request: User is not authenticated.");
        return { success: false, error: { message: "User must be authenticated" }, message: "An error occurred while submitting your request. Please try again later." };
    }

    try {
        const id = await submitDetailingRequestCore({ ...bookingData, userId: currentUser.uid });
        return { success: true, id: id };
    } catch (error) {
        console.error("Error adding document: ", error.code, error.message);
        return { success: false, error: error, message: "An error occurred while submitting your request. Please try again later." };
    }
}
