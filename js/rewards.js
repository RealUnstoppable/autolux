import { db } from './auth.js';
import { collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const functions = getFunctions();

/**
 * Fetch available rewards from Firestore
 */
export async function getAvailableRewards() {
    try {
        const rewardsRef = collection(db, "rewards");
        const q = query(rewardsRef, orderBy("cost", "asc"));
        const snapshot = await getDocs(q);

        const rewards = [];
        snapshot.forEach((doc) => {
            rewards.push({ id: doc.id, ...doc.data() });
        });
        return rewards;
    } catch (error) {
        console.error("Error fetching rewards:", error);
        return [];
    }
}

/**
 * Redeem a reward using the secure Cloud Function
 */
export async function redeemReward(rewardId, cost, title) {
    try {
        const redeemFn = httpsCallable(functions, 'redeemReward');
        const result = await redeemFn({ rewardId, cost, title });
        return result.data;
    } catch (error) {
        console.error("Redemption error:", error);
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
        if (!user) return [];

        const userRewardsRef = collection(db, "user_rewards");
        const q = query(userRewardsRef, where("userId", "==", user.uid), orderBy("redeemedAt", "desc"));
        const snapshot = await getDocs(q);

        const rewards = [];
        snapshot.forEach((doc) => {
            rewards.push({ id: doc.id, ...doc.data() });
        });
        return rewards;
    } catch (error) {
        console.error("Error fetching user rewards:", error);
        // Fallback for missing index during development
        if (error.code === 'failed-precondition' || error.message.includes('index')) {
            console.warn("Missing index for user_rewards. Returning unsorted list.");
             const userRewardsRef = collection(db, "user_rewards");
             const q = query(userRewardsRef, where("userId", "==", user.uid));
             const snapshot = await getDocs(q);

             const rewards = [];
             snapshot.forEach((doc) => {
                 rewards.push({ id: doc.id, ...doc.data() });
             });
             return rewards.sort((a,b) => (b.redeemedAt?.seconds || 0) - (a.redeemedAt?.seconds || 0));
        }
        return [];
    }
}
