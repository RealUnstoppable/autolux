import { AUTOLUX_STRIPE_PACKAGES, STRIPE_CONFIG, getPackageStripeUrl } from '../js/stripe_config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function assert(condition, message) {
    if (!condition) {
        console.error(`FAIL: ${message}`);
        process.exit(1);
    } else {
        console.log(`PASS: ${message}`);
    }
}

async function runTests() {
    console.log('=== Running AutoLux Stripe Integration Verification Tests ===\n');

    // 1. Config Check
    assert(STRIPE_CONFIG.account === 'acct_1MLrhJBmfNp1AIyk', 'Stripe Account ID is acct_1MLrhJBmfNp1AIyk');
    assert(STRIPE_CONFIG.publishableKey.startsWith('pk_live_'), 'Stripe publishable key starts with pk_live_');
    assert(STRIPE_CONFIG.currency === 'usd', 'Stripe currency is USD');

    // 2. Packages check
    const rawData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../stripe_products.json'), 'utf8'));
    const expectedKeys = [
        'luxury_sedan', 'luxury_suv', 'premium_truck', 'sprinter_van',
        'paint_correction', 'ceramic_coating', 'interior_detail', 'exterior_detail',
        'addon_engine_bay', 'addon_headlight_restoration', 'addon_ozone_odor',
        'addon_glass_coating', 'addon_leather_shield', 'club_monthly', 'club_annual'
    ];

    for (const key of expectedKeys) {
        const item = rawData[key];
        assert(item !== undefined, `Package ${key} exists in stripe_products.json`);
        assert(item.stripeProductId.startsWith('prod_'), `${key} has valid Stripe Product ID (${item.stripeProductId})`);
        assert(item.stripePriceId.startsWith('price_'), `${key} has valid Stripe Price ID (${item.stripePriceId})`);
        assert(item.paymentLinkId.startsWith('plink_'), `${key} has valid Payment Link ID (${item.paymentLinkId})`);
        assert(item.paymentLinkUrl.startsWith('https://buy.stripe.com/'), `${key} has valid hosted buy.stripe.com URL (${item.paymentLinkUrl})`);
    }

    // 3. Exact Pricing match
    assert(rawData.luxury_sedan.amount === 15000, 'Luxury Sedan price is exactly $150.00 (15000 cents)');
    assert(rawData.luxury_suv.amount === 25000, 'Luxury SUV price is exactly $250.00 (25000 cents)');
    assert(rawData.premium_truck.amount === 28000, 'Premium Truck price is exactly $280.00 (28000 cents)');
    assert(rawData.sprinter_van.amount === 40000, 'Sprinter Van price is exactly $400.00 (40000 cents)');
    assert(rawData.paint_correction.amount === 50000, 'Paint Correction price is exactly $500.00 (50000 cents)');
    assert(rawData.ceramic_coating.amount === 85000, 'Ceramic Coating price is exactly $850.00 (85000 cents)');
    assert(rawData.interior_detail.amount === 17500, 'Interior Detail price is exactly $175.00 (17500 cents)');
    assert(rawData.exterior_detail.amount === 12500, 'Exterior Detail price is exactly $125.00 (12500 cents)');
    assert(rawData.club_monthly.amount === 12900, 'Club Monthly price is exactly $129.00 (12900 cents)');
    assert(rawData.club_annual.amount === 129000, 'Club Annual price is exactly $1,290.00 (129000 cents)');

    // 4. API & Club exports match
    assert(AUTOLUX_STRIPE_PACKAGES.club_monthly.stripePriceId === rawData.club_monthly.stripePriceId, 'AUTOLUX_STRIPE_PACKAGES monthly has correct stripePriceId');
    assert(AUTOLUX_STRIPE_PACKAGES.club_annual.stripePriceId === rawData.club_annual.stripePriceId, 'AUTOLUX_STRIPE_PACKAGES annual has correct stripePriceId');
    assert(getPackageStripeUrl('luxury_sedan') === rawData.luxury_sedan.paymentLinkUrl, 'getPackageStripeUrl returns valid link for luxury_sedan');

    console.log('\n=== ALL STRIPE INTEGRATION TESTS PASSED PERFECTLY (100%) ===\n');
}

runTests().catch(err => {
    console.error(err);
    process.exit(1);
});
