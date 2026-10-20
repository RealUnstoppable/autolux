import { db } from './auth.js';
import { collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

let functions;
try {
    functions = getFunctions();
} catch (e) {
    // In headless or node tests, getFunctions might fail gracefully
    functions = null;
}

export const DEFAULT_REWARDS = [
    {
        id: "basic-wash-bonus",
        title: "Basic Wash Package",
        description: "Redeem your 100 points sign up bonus for a full exterior hand wash, wheel cleaning, and tire shine.",
        cost: 100
    },
    {
        id: "detail-discount-50",
        title: "50% Off Detail Card",
        description: "Receive 50% off any single complete interior & exterior detailing appointment.",
        cost: 250
    },
    {
        id: "premium-detail",
        title: "Premium Full Detail",
        description: "Complete paint decontamination, machine polish, and deep steam interior cleaning.",
        cost: 500
    },
    {
        id: "ceramic-boost",
        title: "Ceramic Coating Boost",
        description: "6-month hydrophobic ceramic sealant protection for all painted exterior surfaces.",
        cost: 750
    },
    {
        id: "one-month-pro",
        title: "1 Month Pro Membership",
        description: "One month of unlimited maintenance washes and 15% discount on specialized treatments.",
        cost: 1000
    }
];

/**
 * Fetch available rewards from Firestore, falling back to default catalog if empty
 */
export async function getAvailableRewards() {
    try {
        if (!db) return DEFAULT_REWARDS;
        const rewardsRef = collection(db, "rewards");
        const q = query(rewardsRef, orderBy("cost", "asc"));
        const snapshot = await getDocs(q);

        const rewards = [];
        snapshot.forEach((doc) => {
            rewards.push({ id: doc.id, ...doc.data() });
        });

        if (rewards.length > 0) {
            return rewards;
        }
        // Fallback to default catalog if no rewards seeded in Firestore yet
        return DEFAULT_REWARDS;
    } catch (error) {
        console.warn("Falling back to default rewards catalog:", error.message || error);
        return DEFAULT_REWARDS;
    }
}

/**
 * Redeem a reward using the secure Cloud Function
 */
export async function redeemReward(rewardId, cost, title) {
    try {
        if (!functions) {
            try {
                functions = getFunctions();
            } catch (initErr) {
                return { success: false, message: "Cloud Functions service is not initialized." };
            }
        }
        const redeemFn = httpsCallable(functions, 'redeemReward');
        const result = await redeemFn({ rewardId, cost, title });
        return result.data;
    } catch (error) {
        console.error("Redemption error:", { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        return { success: false, message: error.message || "Failed to redeem reward. Please try again." };
    }
}

/**
 * Get user's redeemed rewards
 */
export async function getUserRewards() {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user || !db) return [];

        const userRewardsRef = collection(db, "user_rewards");
        const q = query(userRewardsRef, where("userId", "==", user.uid), orderBy("redeemedAt", "desc"));
        const snapshot = await getDocs(q);

        const rewards = [];
        snapshot.forEach((doc) => {
            rewards.push({ id: doc.id, ...doc.data() });
        });
        return rewards;
    } catch (error) {
        console.error("Error fetching user rewards:", { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        // Fallback for missing index during development
        if (error.code === 'failed-precondition' || (error.message && error.message.includes('index'))) {
            console.warn("Missing index for user_rewards. Returning unsorted list.");
            try {
                const userRewardsRef = collection(db, "user_rewards");
                const q = query(userRewardsRef, where("userId", "==", user.uid));
                const snapshot = await getDocs(q);

                const rewards = [];
                snapshot.forEach((doc) => {
                    rewards.push({ id: doc.id, ...doc.data() });
                });
                return rewards.sort((a,b) => (b.redeemedAt?.seconds || 0) - (a.redeemedAt?.seconds || 0));
            } catch (fallbackError) {
                console.error("Error fetching user rewards fallback:", { code: fallbackError.code || 'UNKNOWN_ERROR', message: fallbackError.message, details: fallbackError });
                return [];
            }
        }
        return [];
    }
}

/**
 * Get user's points transfer and bonus activity history
 */
export async function getUserTransfers(user, userData = null) {
    if (!user) return [];
    const transfers = [];

    try {
        if (db) {
            const notifRef = collection(db, "notifications");
            const q = query(notifRef, where("userId", "==", user.uid));
            const snap = await getDocs(q);
            if (snap && typeof snap.forEach === 'function') {
                snap.forEach(docSnap => {
                    const data = docSnap.data();
                    if (data.type === 'bonus' || (data.title && data.title.toLowerCase().includes('bonus')) || data.amount) {
                        transfers.push({
                            id: docSnap.id,
                            title: data.title || "Points Transfer",
                            message: data.message || "100 points sign up bonus transferred to your account.",
                            amount: data.amount || 100,
                            type: data.type || "bonus",
                            createdAt: data.createdAt,
                            status: "Completed"
                        });
                    }
                });
            }
        }
    } catch (err) {
        console.warn("Could not fetch transfer notifications:", err);
    }

    // If no transfer record was logged in notifications, create the sign-up bonus record representation
    if (transfers.length === 0) {
        transfers.push({
            id: 'signup-bonus-transfer',
            title: '100 Points Sign Up Bonus Transferred',
            message: 'Welcome to AutoLux! A 100 points sign up bonus has been transferred to your account.',
            amount: 100,
            type: 'bonus',
            createdAt: userData?.signupDate || null,
            status: 'Completed'
        });
    }

    // Include UN link transfer activity if account is linked
    if (userData && userData.unLinked) {
        transfers.unshift({
            id: 'un-link-transfer',
            title: 'UN Account Linked (realunstoppable.store)',
            message: `Linked account with ${userData.unAccountEmail || 'realunstoppable.store'}. Points added to total UN account balance.`,
            amount: userData.unPointsAdded !== undefined ? userData.unPointsAdded : (userData.loyaltyPoints || 0),
            type: 'un_link',
            createdAt: userData.unLinkedAt || null,
            status: 'Linked'
        });
    }

    return transfers;
}
