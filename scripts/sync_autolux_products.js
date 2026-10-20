/**
 * AutoLux Product Sync to Unstoppable Store (realunstoppable.store / ezManage)
 *
 * Implements Step B: Syncing AutoLux Club products into the central Unstoppable Store
 * catalog with verified pricing guaranteeing >= 20% profit margin.
 */

export const AUTOLUX_PRODUCTS = [
    {
        id: "autolux-detailing-club",
        name: "AutoLux VIP Detailing Club Plan",
        price: 129.00,
        costBasis: 89.00,
        profitMargin: 0.31, // 31.0% profit margin (> 20% requirement)
        billingInterval: "monthly",
        description: "Premier monthly mobile detailing maintenance wash. Includes exterior pH-neutral foam wash, paint decontamination, ceramic spray sealant, complete interior vacuum, leather cleanse, 15% discount on all services, priority booking, and 200 monthly UN loyalty points.",
        imageUrl: "https://images.unsplash.com/photo-1614165936126-2ed18e471b3b?q=80&w=800&auto=format",
        category: "membership",
        sourceSite: "autolux",
        checkoutUrl: "https://realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1"
    },
    {
        id: "autolux-club-annual",
        name: "AutoLux VIP Detailing Club (Annual VIP Pass)",
        price: 1290.00,
        costBasis: 900.00,
        profitMargin: 0.302, // 30.2% profit margin (> 20% requirement)
        billingInterval: "annual",
        description: "Full year VIP detailing membership (12 monthly maintenance washes - 2 months free!). 15% discount on all specialized coatings and corrections, priority calendar lock-in, and 1,200 welcome UN loyalty points.",
        imageUrl: "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800&auto=format",
        category: "membership",
        sourceSite: "autolux",
        checkoutUrl: "https://realunstoppable.store/checkout.html?productId=autolux-club-annual&quantity=1"
    }
];

/**
 * Validates that a product satisfies the minimum 20% profit margin.
 * @param {object} product
 * @returns {{isValid: boolean, margin: number, profit: number}}
 */
export function validateProfitMargin(product) {
    const cost = Number(product.costBasis) || 0;
    const price = Number(product.price) || 0;
    if (price <= 0) return { isValid: false, margin: 0, profit: 0 };
    const profit = price - cost;
    const margin = profit / price;
    return {
        isValid: margin >= 0.20,
        margin: Math.round(margin * 1000) / 1000,
        profit: Math.round(profit * 100) / 100
    };
}

/**
 * Syncs a single product to the Unstoppable Store API endpoint.
 * @param {object} product
 * @param {object} [options]
 * @returns {Promise<object>}
 */
export async function syncProductToStore(product, options = {}) {
    const apiUrl = options.apiUrl || process.env.UNSTOPPABLE_STORE_API_URL || "https://us-central1-dts-hub-website.cloudfunctions.net/createProduct";
    const apiKey = options.apiKey || process.env.STORE_API_KEY || "unstoppable-store-secret-key";

    const validation = validateProfitMargin(product);
    if (!validation.isValid) {
        throw new Error(`Product ${product.id} does not meet the minimum 20% profit margin requirement (Current: ${(validation.margin * 100).toFixed(1)}%).`);
    }

    const payload = {
        id: product.id,
        name: product.name,
        price: product.price,
        costBasis: product.costBasis,
        profitMargin: validation.margin,
        description: product.description,
        imageUrl: product.imageUrl,
        category: product.category,
        sourceSite: product.sourceSite || "autolux"
    };

    if (options.dryRun) {
        return { success: true, dryRun: true, product: payload, margin: validation.margin };
    }

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-unstoppable-api-key": apiKey
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                error: data.error || `HTTP ${response.status}`,
                product: payload
            };
        }
        return { success: true, data, product: payload };
    } catch (error) {
        return {
            success: false,
            error: error.message || "Network error syncing product",
            product: payload
        };
    }
}

/**
 * Main execution runner
 */
export async function runProductSync() {
    console.log("=== AutoLux Club Product Catalog & Profit Margin Verification ===");
    for (const product of AUTOLUX_PRODUCTS) {
        const check = validateProfitMargin(product);
        console.log(`\n• Product: ${product.name} (${product.id})`);
        console.log(`  - Retail Price: $${product.price.toFixed(2)}`);
        console.log(`  - Estimated Cost: $${product.costBasis.toFixed(2)}`);
        console.log(`  - Net Profit: $${check.profit.toFixed(2)}`);
        console.log(`  - Profit Margin: ${(check.margin * 100).toFixed(1)}% (Requirement >= 20%: ${check.isValid ? 'PASSED ✓' : 'FAILED ✗'})`);
        console.log(`  - Checkout Link: ${product.checkoutUrl}`);
    }
}

// Run if called directly via CLI
if (typeof process !== "undefined" && process.argv && process.argv[1] && process.argv[1].endsWith("sync_autolux_products.js")) {
    runProductSync();
}
