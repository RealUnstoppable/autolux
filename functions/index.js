const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.redeemReward = onCall(async (request) => {
    // 1. Check Auth
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be signed in to redeem rewards.");
    }

    const uid = request.auth.uid;
    const { rewardId, cost, title } = request.data;

    // 2. Validate input
    if (!rewardId || typeof cost !== "number" || cost <= 0 || !title) {
        throw new HttpsError("invalid-argument", "Invalid reward data provided.");
    }

    const userRef = db.collection("users").doc(uid);
    const rewardLogRef = db.collection("user_rewards").doc(); // Create new doc reference

    try {
        // 3. Run Transaction
        const result = await db.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);

            if (!userDoc.exists) {
                throw new HttpsError("not-found", "User profile not found.");
            }

            const currentPoints = userDoc.data().loyaltyPoints || 0;

            if (currentPoints < cost) {
                throw new HttpsError("failed-precondition", "Insufficient points to redeem this reward.");
            }

            // Deduct points
            t.update(userRef, { loyaltyPoints: currentPoints - cost });

            // Log reward redemption
            t.set(rewardLogRef, {
                userId: uid,
                rewardId: rewardId,
                title: title,
                cost: cost,
                redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: "Active"
            });

            return {
                newBalance: currentPoints - cost
            };
        });

        return { success: true, message: "Reward redeemed successfully!", newBalance: result.newBalance };
    } catch (error) {
        console.error("Transaction failure:", error);
        throw new HttpsError("internal", error.message || "Failed to process redemption.");
    }
});
