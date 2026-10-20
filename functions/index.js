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
        console.error("Transaction failure:", { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        throw new HttpsError("internal", error.message || "Failed to process redemption.");
    }
});

exports.linkUnAccount = onCall(async (request) => {
    // 1. Check Auth
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be signed in to link your UN account.");
    }

    const uid = request.auth.uid;
    const { unAccountEmail } = request.data || {};

    if (!unAccountEmail || typeof unAccountEmail !== "string" || !unAccountEmail.includes("@")) {
        throw new HttpsError("invalid-argument", "Valid UN account email is required.");
    }

    const userRef = db.collection("users").doc(uid);

    try {
        const result = await db.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);

            if (!userDoc.exists) {
                throw new HttpsError("not-found", "User profile not found.");
            }

            const userData = userDoc.data();
            const currentPoints = userData.loyaltyPoints || 0;
            const existingUnBalance = userData.totalUnBalance || userData.unAccountBalance || 0;
            const newTotalBalance = existingUnBalance + currentPoints;
            const sanitizedEmail = unAccountEmail.trim().toLowerCase();

            const updateData = {
                unLinked: true,
                unLinkedAt: admin.firestore.FieldValue.serverTimestamp(),
                unAccountEmail: sanitizedEmail,
                unAccountId: `un_${uid.slice(0, 8)}`,
                totalUnBalance: newTotalBalance,
                unPointsAdded: currentPoints,
                linkedInformation: {
                    autoluxUid: uid,
                    autoluxEmail: userData.email || '',
                    unAccountEmail: sanitizedEmail,
                    name: userData.name || userData.username || 'Valued Client',
                    vehiclesCount: Array.isArray(userData.vehicles) ? userData.vehicles.length : 0,
                    membershipLevel: userData.membershipLevel || 'free',
                    storeDomain: 'realunstoppable.store',
                    syncedAt: new Date().toISOString()
                }
            };

            t.update(userRef, updateData);

            return {
                newTotalBalance,
                pointsAdded: currentPoints,
                unAccountEmail: sanitizedEmail
            };
        });

        return {
            success: true,
            message: `Successfully linked with UN (${result.unAccountEmail})! Added ${result.pointsAdded.toLocaleString()} points to your total UN balance.`,
            totalUnBalance: result.newTotalBalance,
            pointsAdded: result.pointsAdded
        };
    } catch (error) {
        console.error("Link UN Account transaction failure:", { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        throw new HttpsError("internal", error.message || "Failed to link UN account.");
    }
});
