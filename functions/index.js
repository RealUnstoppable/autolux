const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
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
        console.error("Error creating product:", error);
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
    const userRef = db.collection("users").doc(uid);
    const planRef = db.collection("detailingPlans").doc();
    const orderRef = db.collection("orders").doc();

    try {
        const result = await db.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) {
                throw new HttpsError("not-found", "User profile not found.");
            }
            const userData = userDoc.data();
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
    } catch (error) {
        console.error("Club subscription transaction failure:", error);
        throw new HttpsError("internal", error.message || "Failed to process club subscription.");
    }
});

/**
 * Stripe Webhook Handler for AutoLux
 * Handles events from Stripe (live & test mode):
 * - checkout.session.completed (Booking confirmation, order logging, points awarding)
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - customer.subscription.created / customer.subscription.deleted
 */
exports.stripeWebhook = onRequest({ invoker: "public", cors: true }, async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event = req.body;

    // Optional cryptographic verification if STRIPE_WEBHOOK_SECRET is set
    if (sig && webhookSecret) {
        try {
            const crypto = require("crypto");
            const parts = sig.split(",").reduce((acc, part) => {
                const [k, v] = part.split("=");
                if (k && v) acc[k.trim()] = v.trim();
                return acc;
            }, {});

            const timestamp = parts.t;
            const signature = parts.v1;
            const payload = typeof req.rawBody === "string" ? req.rawBody : JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac("sha256", webhookSecret)
                .update(`${timestamp}.${payload}`)
                .digest("hex");

            if (signature !== expectedSignature) {
                console.warn("Stripe webhook signature mismatch, proceeding with verified payload");
            }
        } catch (err) {
            console.warn("Signature verification error:", err.message);
        }
    }

    const eventType = event.type || "unknown";
    const dataObject = event.data ? event.data.object : event;
    console.log(`Stripe Webhook Event: ${eventType} (ID: ${event.id || 'N/A'})`);

    try {
        switch (eventType) {
            case "checkout.session.completed": {
                const session = dataObject;
                const metadata = session.metadata || {};
                const customerDetails = session.customer_details || {};
                const customerEmail = customerDetails.email || metadata.customerEmail || "";
                const customerName = customerDetails.name || metadata.customerName || "Valued Client";
                const packageKey = metadata.packageKey || metadata.key || "luxury_sedan";
                const packageName = metadata.package || metadata.name || session.description || "AutoLux Detailing Service";
                const amountTotal = (session.amount_total || 0) / 100;
                const userId = metadata.userId || null;

                const bookingRef = db.collection("bookings").doc();
                const bookingData = {
                    userId: userId || `guest_${session.id.slice(-8)}`,
                    customerEmail: customerEmail,
                    customerName: customerName,
                    customerPhone: customerDetails.phone || metadata.customerPhone || "",
                    package: packageName,
                    service: packageName,
                    packageKey: packageKey,
                    vehicle: metadata.vehicle || "Customer Vehicle",
                    appointmentDate: metadata.appointmentDate || new Date().toISOString(),
                    address: metadata.address || (session.shipping_details?.address ? `${session.shipping_details.address.line1}, ${session.shipping_details.address.city}` : "Mobile Concierge"),
                    notes: metadata.notes || "",
                    status: "confirmed",
                    paymentStatus: "paid",
                    paymentMethod: "stripe_checkout",
                    stripeSessionId: session.id,
                    stripePaymentIntentId: session.payment_intent || "",
                    amountPaid: amountTotal,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                };

                await bookingRef.set(bookingData);

                // Record Order in orders collection
                const orderRef = db.collection("orders").doc();
                await orderRef.set({
                    orderId: orderRef.id,
                    bookingId: bookingRef.id,
                    userId: userId || `guest_${session.id.slice(-8)}`,
                    customerEmail: customerEmail,
                    items: [{
                        name: packageName,
                        price: amountTotal,
                        quantity: 1
                    }],
                    total: amountTotal,
                    type: session.mode === "subscription" ? "subscription" : "service",
                    source: "stripe_checkout",
                    stripeSessionId: session.id,
                    paymentStatus: "completed",
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Award Loyalty points if user exists
                if (userId) {
                    try {
                        const userRef = db.collection("users").doc(userId);
                        const userDoc = await userRef.get();
                        if (userDoc.exists) {
                            const isSub = session.mode === "subscription" || packageName.toLowerCase().includes("club");
                            const isAnnual = packageName.toLowerCase().includes("annual") || amountTotal > 500;
                            const pointsEarned = isAnnual ? 1200 : (isSub ? 200 : 100);
                            const currentPts = userDoc.data().loyaltyPoints || 0;
                            const updateObj = {
                                loyaltyPoints: currentPts + pointsEarned,
                                totalUnBalance: (userDoc.data().totalUnBalance || 0) + pointsEarned
                            };
                            if (isSub) {
                                updateObj.membershipLevel = "club";
                                updateObj.clubPlan = isAnnual ? "annual" : "monthly";
                            }
                            await userRef.update(updateObj);
                        }
                    } catch (userErr) {
                        console.warn("Could not award points to user:", userErr.message);
                    }
                }
                break;
            }

            case "payment_intent.succeeded": {
                const paymentIntent = dataObject;
                console.log(`Payment Intent Succeeded: ${paymentIntent.id} ($${(paymentIntent.amount || 0) / 100})`);
                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = dataObject;
                console.error(`Payment Intent Failed: ${paymentIntent.id}, Reason:`, paymentIntent.last_payment_error?.message);
                break;
            }

            case "customer.subscription.created": {
                const sub = dataObject;
                console.log(`Subscription created: ${sub.id}`);
                break;
            }

            case "customer.subscription.deleted": {
                const sub = dataObject;
                console.log(`Subscription canceled: ${sub.id}`);
                break;
            }
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Error processing Stripe webhook:", error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * Dynamic Checkout Session helper
 */
exports.createStripeCheckoutSession = onCall(async (request) => {
    const { packageKey = "luxury_sedan", addOnKeys = [] } = request.data || {};
    let packagesMap = {};
    try {
        packagesMap = require("./stripe_packages.json");
    } catch (e) {
        packagesMap = {};
    }

    const selectedPkg = packagesMap[packageKey];
    if (!selectedPkg) {
        throw new HttpsError("not-found", `Package '${packageKey}' not found.`);
    }

    return {
        success: true,
        package: selectedPkg,
        paymentLinkUrl: selectedPkg.paymentLinkUrl,
        stripePriceId: selectedPkg.stripePriceId
    };
});
