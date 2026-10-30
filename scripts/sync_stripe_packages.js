import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DETAILED_PACKAGES = [
    // 1. Core Vehicle Detailing Packages
    {
        key: 'luxury_sedan',
        id_slug: 'autolux-luxury-sedan',
        name: 'Luxury Sedan Detail',
        amount: 15000,
        priceFormatted: '$150.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'detailing_package',
        description: 'Deep exterior foam wash, wheel barrel detailing, interior vacuum, leather wipe-down, and ceramic spray sealant.'
    },
    {
        key: 'luxury_suv',
        id_slug: 'autolux-luxury-suv',
        name: 'Luxury SUV Package',
        amount: 25000,
        priceFormatted: '$250.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'detailing_package',
        description: 'Comprehensive interior/exterior detail. Ideal for keeping the family hauler looking brand new.'
    },
    {
        key: 'premium_truck',
        id_slug: 'autolux-premium-truck',
        name: 'Premium Truck Detail',
        amount: 28000,
        priceFormatted: '$280.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'detailing_package',
        description: 'Heavy-duty deep cleaning. Includes bed flush, intense wheel/tire scrub, and heavy interior extraction.'
    },
    {
        key: 'sprinter_van',
        id_slug: 'autolux-sprinter-van',
        name: 'Executive Sprinter Van Detail',
        amount: 40000,
        priceFormatted: '$400.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'detailing_package',
        description: 'Extensive exterior surface coverage and massive interior cubic volume cleaning. Perfect for executive transports.'
    },

    // 2. Specialized Detailing Services
    {
        key: 'paint_correction',
        id_slug: 'autolux-paint-correction',
        name: 'Multi-Stage Paint Correction',
        amount: 50000,
        priceFormatted: '$500.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'specialty_service',
        description: 'Multi-stage machine compounding and polishing eliminating 85-95%+ of swirl marks, scratches, and clear coat defects for showroom mirror gloss.'
    },
    {
        key: 'ceramic_coating',
        id_slug: 'autolux-ceramic-coating',
        name: 'Ceramic Coating (3 to 7 Year Warranty)',
        amount: 85000,
        priceFormatted: '$850.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'specialty_service',
        description: 'Ultra-hydrophobic SiO2 nano-ceramic shield chemically bonded to paint. Superior UV defense, chemical etching resistance, and self-cleaning gloss.'
    },
    {
        key: 'interior_detail',
        id_slug: 'autolux-interior-detail',
        name: 'Complete Interior Detail & Restoration',
        amount: 17500,
        priceFormatted: '$175.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'specialty_service',
        description: 'Deep steam sanitization, hot-water carpet extraction, meticulous leather cleaning & conditioning, UV interior trim dressing, and odor elimination.'
    },
    {
        key: 'exterior_detail',
        id_slug: 'autolux-exterior-detail',
        name: 'Signature Exterior Concierge Detail',
        amount: 12500,
        priceFormatted: '$125.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'specialty_service',
        description: 'Two-bucket scratch-free foam wash, chemical iron & fallout decontamination, clay bar treatment, wheel & caliper deep clean, and ceramic sealant application.'
    },

    // 3. Individual Add-On Services
    {
        key: 'addon_engine_bay',
        id_slug: 'autolux-addon-engine-bay',
        name: 'Engine Bay Detail & Dressing',
        amount: 7500,
        priceFormatted: '$75.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'add_on',
        description: 'Careful degreasing, steam cleaning, and hydrophobic satin dressing of engine compartment components.'
    },
    {
        key: 'addon_headlight_restoration',
        id_slug: 'autolux-addon-headlight-restoration',
        name: 'Headlight Restoration & UV Ceramic Seal',
        amount: 9500,
        priceFormatted: '$95.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'add_on',
        description: 'Multi-grit wet sanding, rotary compounding, and ceramic clear coat sealant to restore crystal-clear night visibility.'
    },
    {
        key: 'addon_ozone_odor',
        id_slug: 'autolux-addon-ozone-odor',
        name: 'Ozone Odor Elimination & Air Purification',
        amount: 6000,
        priceFormatted: '$60.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'add_on',
        description: 'Industrial medical-grade ozone generator cycle eliminating bacteria, smoke, pet odors, and mold spores.'
    },
    {
        key: 'addon_glass_coating',
        id_slug: 'autolux-addon-glass-coating',
        name: 'Glass Ceramic Hydrophobic Treatment',
        amount: 8000,
        priceFormatted: '$80.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'add_on',
        description: 'Full windshield and exterior glass mechanical polish and dedicated rain-repellent hydrophobic coating for ultra-clear wet weather driving.'
    },
    {
        key: 'addon_leather_shield',
        id_slug: 'autolux-addon-leather-shield',
        name: 'Leather Shield Ceramic Coating',
        amount: 15000,
        priceFormatted: '$150.00',
        currency: 'usd',
        type: 'one_time',
        interval: null,
        category: 'add_on',
        description: 'Advanced barrier coating for interior leather seats and consoles protecting against dye transfer, UV damage, liquid spills, and abrasions.'
    },

    // 4. AutoLux Detailing Club Memberships (Subscriptions)
    {
        key: 'club_monthly',
        id_slug: 'autolux-detailing-club',
        name: 'AutoLux Detailing Club Plan - $129/mo',
        amount: 12900,
        priceFormatted: '$129.00/mo',
        currency: 'usd',
        type: 'recurring',
        interval: 'month',
        category: 'membership',
        description: 'Premier monthly mobile detailing maintenance wash. Includes exterior pH-neutral foam wash, paint decontamination, ceramic spray sealant, complete interior vacuum, leather cleanse, 15% discount on all services, priority booking, and 200 monthly UN loyalty points.'
    },
    {
        key: 'club_annual',
        id_slug: 'autolux-club-annual',
        name: 'AutoLux Detailing Club Annual - $1,290/yr',
        amount: 129000,
        priceFormatted: '$1,290.00/yr',
        currency: 'usd',
        type: 'recurring',
        interval: 'year',
        category: 'membership',
        description: 'Full year VIP detailing membership (12 monthly maintenance washes - 2 months free!). 15% discount on all specialized coatings and corrections, priority calendar lock-in, and 1,200 welcome UN loyalty points.'
    }
];

function runStripeCommand(args) {
    try {
        const stdout = execFileSync('stripe', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        return JSON.parse(stdout);
    } catch (err) {
        console.error('Stripe CLI Error:', err.stderr || err.message);
        throw err;
    }
}

export async function syncPackagesToStripe() {
    console.log('Fetching existing Stripe products (live)...');
    const existingProductsList = runStripeCommand(['products', 'list', '--limit', '100', '--live']);
    const existingProductMap = new Map();
    for (const prod of existingProductsList.data || []) {
        if (prod.active) {
            existingProductMap.set(prod.name.trim(), prod);
            if (prod.metadata?.id_slug) existingProductMap.set(prod.metadata.id_slug, prod);
            if (prod.metadata?.key) existingProductMap.set(prod.metadata.key, prod);
        }
    }

    console.log('Fetching existing Payment Links (live)...');
    const existingLinksList = runStripeCommand(['payment_links', 'list', '--limit', '100', '--live']);
    const existingLinkMap = new Map();
    for (const link of existingLinksList.data || []) {
        if (link.active && link.metadata?.key) {
            existingLinkMap.set(link.metadata.key, link);
        }
    }

    const results = {};

    for (const pkg of DETAILED_PACKAGES) {
        process.stdout.write(`\nProcessing: "${pkg.name}" (${pkg.priceFormatted})... `);
        let stripeProduct = existingProductMap.get(pkg.name) || existingProductMap.get(pkg.id_slug) || existingProductMap.get(pkg.key);

        if (!stripeProduct) {
            const createArgs = [
                'products', 'create',
                '--name', pkg.name,
                '--description', pkg.description,
                '-d', `metadata[id_slug]=${pkg.id_slug}`,
                '-d', `metadata[key]=${pkg.key}`,
                '-d', `metadata[category]=${pkg.category}`,
                '-d', `metadata[sourceSite]=autolux`,
                '-d', `default_price_data[currency]=${pkg.currency}`,
                '-d', `default_price_data[unit_amount]=${pkg.amount}`,
                '-c',
                '--live'
            ];

            if (pkg.type === 'recurring' && pkg.interval) {
                createArgs.push('-d', `default_price_data[recurring][interval]=${pkg.interval}`);
            }

            stripeProduct = runStripeCommand(createArgs);
            console.log(`Product CREATED (${stripeProduct.id})`);
        } else {
            console.log(`Product EXISTS (${stripeProduct.id})`);
        }

        const priceId = stripeProduct.default_price;
        let paymentLink = existingLinkMap.get(pkg.key);

        // Check if luxury sedan's link or existing link matches
        if (!paymentLink && pkg.key === 'luxury_sedan') {
            paymentLink = existingLinksList.data?.find(l => l.id === 'plink_1UW1HTBmfNp1AIykrjvAZvo9');
        }

        if (!paymentLink) {
            process.stdout.write(`  Creating Payment Link for "${pkg.name}"... `);
            const redirectUrl = `https://autolux.realunstoppable.store/account.html?booking_success=true&package=${encodeURIComponent(pkg.key)}&session_id={CHECKOUT_SESSION_ID}`;
            const linkArgs = [
                'payment_links', 'create',
                '-d', `line_items[0][price]=${priceId}`,
                '-d', `line_items[0][quantity]=1`,
                '-d', `after_completion[type]=redirect`,
                '-d', `after_completion[redirect][url]=${redirectUrl}`,
                '-d', `metadata[packageKey]=${pkg.key}`,
                '-d', `metadata[key]=${pkg.key}`,
                '-d', `metadata[sourceSite]=autolux`,
                '-c',
                '--live'
            ];
            paymentLink = runStripeCommand(linkArgs);
            console.log(`LINK CREATED: ${paymentLink.url}`);
        } else {
            console.log(`  Payment Link EXISTS: ${paymentLink.url}`);
        }

        results[pkg.key] = {
            ...pkg,
            stripeProductId: stripeProduct.id,
            stripePriceId: priceId,
            paymentLinkId: paymentLink.id,
            paymentLinkUrl: paymentLink.url
        };
    }

    const outputPathJson = path.resolve(__dirname, '../stripe_products.json');
    fs.writeFileSync(outputPathJson, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\nWrote mapped Stripe products to: ${outputPathJson}`);

    // Generate client-side config js
    const outputPathJs = path.resolve(__dirname, '../js/stripe_config.js');
    const jsContent = `/**
 * AutoLux Luxury Detailing - Stripe Products & Pricing Configuration
 * Synchronized with Stripe Live Account (acct_1MLrhJBmfNp1AIyk)
 */
export const STRIPE_CONFIG = {
    publishableKey: "pk_live_51MLrhJBmfNp1AIykO5p4QW0l6950BmfNp1AIyk",
    account: "acct_1MLrhJBmfNp1AIyk",
    businessName: "AutoLux Luxury Mobile Detailing",
    currency: "usd"
};

export const AUTOLUX_STRIPE_PACKAGES = ${JSON.stringify(results, null, 4)};

export function getPackageStripeUrl(packageKey) {
    const pkg = AUTOLUX_STRIPE_PACKAGES[packageKey];
    return pkg ? pkg.paymentLinkUrl : null;
}

export default AUTOLUX_STRIPE_PACKAGES;
`;
    fs.writeFileSync(outputPathJs, jsContent, 'utf8');
    console.log(`Wrote client-safe Stripe config to: ${outputPathJs}`);

    return results;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('sync_stripe_packages.js')) {
    syncPackagesToStripe().catch(err => {
        console.error('Fatal execution error:', err);
        process.exit(1);
    });
}
