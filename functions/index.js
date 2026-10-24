const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();


async function runUserTransaction(db, uid, errorMessage, transactionCallback) {
    const userRef = db.collection("users").doc(uid);
    try {
        return await db.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) {
                throw new HttpsError("not-found", "User profile not found.");
            }
            return await transactionCallback(t, userRef, userDoc.data());
        });
    } catch (error) {
        console.error(errorMessage, { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        if (error.code && error.code.includes('failed-precondition')) {
            throw error;
        }
        if (error.code === 'not-found') {
            throw error;
        }
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", error.message || errorMessage);
    }
}


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

    const rewardLogRef = db.collection("user_rewards").doc(); // Create new doc reference

    const result = await runUserTransaction(db, uid, "Transaction failure:", async (t, userRef, userData) => {
        const currentPoints = userData.loyaltyPoints || 0;

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

    const result = await runUserTransaction(db, uid, "Link UN Account transaction failure:", async (t, userRef, userData) => {
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
});

/**
 * Step A: Create a Secure Product Creation API (Cloud Function)
 * Allows authorized services / external sites to create and sync products into Firestore.
 */
exports.createProduct = onRequest({ invoker: "public", cors: true }, async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    // 1. Verify Secret API Key from other sites
    const apiKey = req.headers["x-unstoppable-api-key"];
    const expectedApiKey = process.env.STORE_API_KEY;
    if (expectedApiKey && apiKey !== expectedApiKey) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { id, name, price, description, imageUrl, category, sourceSite, costBasis, profitMargin } = req.body || {};
    if (!id || !name || price == null) {
        return res.status(400).json({ error: "Missing required fields (id, name, price)" });
    }
    try {
        const productRef = db.collection("products").doc(id);
        const productData = {
            id,
            name,
            price: Number(price),
            description: description || "",
            imageUrl: imageUrl || "",
            category: category || "membership",
            sourceSite: sourceSite || "autolux",
            active: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (costBasis != null) productData.costBasis = Number(costBasis);
        if (profitMargin != null) productData.profitMargin = Number(profitMargin);

        await productRef.set(productData, { merge: true });
        return res.status(200).json({ success: true, productId: id, product: productData });
    } catch (error) {
        console.error("Error creating product:", { code: error.code || 'UNKNOWN_ERROR', message: error.message, details: error });
        return res.status(500).json({ error: error.message });
    }
});

/**
 * Facilitates AutoLux Club membership subscription transactions.
 * Sets up detailing plan, awards UN loyalty points, and records the order.
 */
exports.subscribeToClub = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be signed in to join the AutoLux Club.");
    }
    const uid = request.auth.uid;
    const { planType = "monthly", vehicle, appointmentDate, address, referralCode } = request.data || {};

    const isAnnual = planType === "annual";
    const price = isAnnual ? 1290 : 129;
    const planName = isAnnual ? "AutoLux Detailing Club Annual - $1,290/yr" : "AutoLux Detailing Club Plan - $129/mo";
    const planRef = db.collection("detailingPlans").doc();
    const orderRef = db.collection("orders").doc();

    const result = await runUserTransaction(db, uid, "Club subscription transaction failure:", async (t, userRef, userData) => {
        const currentPoints = userData.loyaltyPoints || 0;
        const clubBonusPoints = isAnnual ? 1200 : 200;
        const updatedPoints = currentPoints + clubBonusPoints;

        t.update(userRef, {
            membershipLevel: "club",
            clubPlan: planType,
            clubPrice: price,
            clubSubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
            loyaltyPoints: updatedPoints,
            totalUnBalance: (userData.totalUnBalance || 0) + clubBonusPoints
        });

        t.set(planRef, {
            userId: uid,
            service: planName,
            package: planName,
            planType: planType,
            price: price,
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            customerEmail: userData.email || "",
            vehicle: vehicle || "",
            appointmentDate: appointmentDate || "",
            address: address || "",
            referralCode: referralCode ? String(referralCode).trim().toUpperCase() : null
        });

        t.set(orderRef, {
            userId: uid,
            customerEmail: userData.email || "",
            items: [{
                productId: isAnnual ? "autolux-club-annual" : "autolux-detailing-club",
                name: planName,
                price: price,
                quantity: 1
            }],
            total: price,
            type: "subscription",
            source: "autolux",
            paymentStatus: "completed",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            planId: planRef.id,
            orderId: orderRef.id,
            bonusPoints: clubBonusPoints,
            newBalance: updatedPoints
        };
    });

    return {
        success: true,
        message: `Welcome to the AutoLux Detailing Club! Your subscription (${planName}) is activated.`,
        planId: result.planId,
        orderId: result.orderId,
        newBalance: result.newBalance,
        checkoutUrl: `https://realunstoppable.store/checkout.html?productId=${isAnnual ? "autolux-club-annual" : "autolux-detailing-club"}&quantity=1`
    };
});
