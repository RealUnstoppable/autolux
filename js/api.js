import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { submitDetailingRequestCore, submitQuoteRequestCore, submitDetailingPlanCore, submitToFirestore } from './utils.js';
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

export async function submitDetailingRequest(bookingData) {
    try {
        const currentUser = auth?.currentUser;
        const userId = currentUser ? currentUser.uid : bookingData?.userId;
        if (!userId) {
            console.error("Cannot submit detailing request: User is not authenticated.");
            return { success: false, error: "User must be authenticated", message: "An error occurred while submitting your request. Please try again later." };
        }
        const payload = { ...bookingData, userId };
        if (bookingData.referralCode) {
            payload.referralCode = bookingData.referralCode.trim().toUpperCase();
        }
        return await handleApiRequest(submitToFirestore, ["bookings", payload], "Detailing");
    } catch (error) {
        console.error("Firebase connection error during detailing request - Code:", error.code || 'UNKNOWN_ERROR');
        return { success: false, error: "Connection lost. Please check your network and try again.", code: error.code || 'UNKNOWN_ERROR' };
    }
}

export async function submitQuoteRequest(quoteData) {
    return handleApiRequest(submitToFirestore, ["quotes", quoteData], "Quote");
}

export async function submitDetailingPlan(planData) {
    const currentUser = auth?.currentUser;
    const userId = currentUser ? currentUser.uid : planData?.userId;
    if (!userId) {
        console.error("Cannot submit detailing plan: User is not authenticated.");
        return { success: false, error: "User must be authenticated", message: "An error occurred while submitting your request. Please try again later." };
    }
    return handleApiRequest(submitDetailingPlanCore, [userId, planData], "DetailingPlan");
}

export const AUTOLUX_CLUB_PRODUCTS = {
    monthly: {
        id: "autolux-detailing-club",
        name: "AutoLux Detailing Club Plan - $129/mo",
        price: 129,
        interval: "monthly",
        description: "Monthly maintenance detail with 15% discount on all services and priority scheduling.",
        checkoutUrl: "https://realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1"
    },
    annual: {
        id: "autolux-club-annual",
        name: "AutoLux Detailing Club Annual - $1,290/yr",
        price: 1290,
        interval: "annual",
        description: "Annual VIP membership (12 washes with 2 months free) and 15% discount on all services.",
        checkoutUrl: "https://realunstoppable.store/checkout.html?productId=autolux-club-annual&quantity=1"
    }
};

export function getUnstoppableCheckoutUrl(productId = "autolux-detailing-club", quantity = 1) {
    return `https://realunstoppable.store/checkout.html?productId=${encodeURIComponent(productId)}&quantity=${quantity}`;
}

export async function joinAutoLuxClub(subscriptionData) {
    const isAnnual = subscriptionData?.planType === 'annual' || (subscriptionData?.package && subscriptionData.package.includes('Annual'));
    const selected = isAnnual ? AUTOLUX_CLUB_PRODUCTS.annual : AUTOLUX_CLUB_PRODUCTS.monthly;
    const payload = {
        ...subscriptionData,
        package: selected.name,
        service: selected.name,
        planType: selected.interval,
        price: selected.price,
        storeCheckoutUrl: selected.checkoutUrl
    };
    return submitDetailingPlan(payload);
}
