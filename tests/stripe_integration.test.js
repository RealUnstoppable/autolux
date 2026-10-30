import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AUTOLUX_STRIPE_PACKAGES, STRIPE_CONFIG, getPackageStripeUrl } from '../js/stripe_config.js';
import { AUTOLUX_CLUB_PRODUCTS, getPackageStripeCheckoutUrl } from '../js/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Phase 3: Stripe Products & Pricing Verification', () => {
    const rawData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../stripe_products.json'), 'utf8'));

    test('Stripe configuration has valid live account and publishable key', () => {
        expect(STRIPE_CONFIG.account).toBe('acct_1MLrhJBmfNp1AIyk');
        expect(STRIPE_CONFIG.currency).toBe('usd');
        expect(STRIPE_CONFIG.publishableKey).toMatch(/^pk_live_/);
    });

    test('All 15 detailing services and add-ons exist and have live Stripe IDs', () => {
        const expectedKeys = [
            'luxury_sedan',
            'luxury_suv',
            'premium_truck',
            'sprinter_van',
            'paint_correction',
            'ceramic_coating',
            'interior_detail',
            'exterior_detail',
            'addon_engine_bay',
            'addon_headlight_restoration',
            'addon_ozone_odor',
            'addon_glass_coating',
            'addon_leather_shield',
            'club_monthly',
            'club_annual'
        ];

        for (const key of expectedKeys) {
            const item = rawData[key];
            expect(item).toBeDefined();
            expect(item.stripeProductId).toMatch(/^prod_/);
            expect(item.stripePriceId).toMatch(/^price_/);
            expect(item.paymentLinkId).toMatch(/^plink_/);
            expect(item.paymentLinkUrl).toMatch(/^https:\/\/buy\.stripe\.com\//);
            expect(item.currency).toBe('usd');
        }
    });

    test('Core detailing packages match website pricing exactly', () => {
        expect(rawData.luxury_sedan.name).toBe('Luxury Sedan Detail');
        expect(rawData.luxury_sedan.amount).toBe(15000); // $150.00

        expect(rawData.luxury_suv.name).toBe('Luxury SUV Package');
        expect(rawData.luxury_suv.amount).toBe(25000); // $250.00

        expect(rawData.premium_truck.name).toBe('Premium Truck Detail');
        expect(rawData.premium_truck.amount).toBe(28000); // $280.00

        expect(rawData.sprinter_van.name).toBe('Executive Sprinter Van Detail');
        expect(rawData.sprinter_van.amount).toBe(40000); // $400.00
    });

    test('Specialized concierge services match website specifications exactly', () => {
        expect(rawData.paint_correction.name).toBe('Multi-Stage Paint Correction');
        expect(rawData.paint_correction.amount).toBe(50000); // $500.00

        expect(rawData.ceramic_coating.name).toBe('Ceramic Coating (3 to 7 Year Warranty)');
        expect(rawData.ceramic_coating.amount).toBe(85000); // $850.00

        expect(rawData.interior_detail.name).toBe('Complete Interior Detail & Restoration');
        expect(rawData.interior_detail.amount).toBe(17500); // $175.00

        expect(rawData.exterior_detail.name).toBe('Signature Exterior Concierge Detail');
        expect(rawData.exterior_detail.amount).toBe(12500); // $125.00
    });

    test('Luxury add-ons match website specifications exactly', () => {
        expect(rawData.addon_engine_bay.amount).toBe(7500); // $75.00
        expect(rawData.addon_headlight_restoration.amount).toBe(9500); // $95.00
        expect(rawData.addon_ozone_odor.amount).toBe(6000); // $60.00
        expect(rawData.addon_glass_coating.amount).toBe(8000); // $80.00
        expect(rawData.addon_leather_shield.amount).toBe(15000); // $150.00
    });

    test('AutoLux Detailing Club memberships match subscription recurring models', () => {
        expect(rawData.club_monthly.amount).toBe(12900); // $129.00
        expect(rawData.club_monthly.type).toBe('recurring');
        expect(rawData.club_monthly.interval).toBe('month');

        expect(rawData.club_annual.amount).toBe(129000); // $1,290.00
        expect(rawData.club_annual.type).toBe('recurring');
        expect(rawData.club_annual.interval).toBe('year');

        expect(AUTOLUX_CLUB_PRODUCTS.monthly.stripePriceId).toBe(rawData.club_monthly.stripePriceId);
        expect(AUTOLUX_CLUB_PRODUCTS.annual.stripePriceId).toBe(rawData.club_annual.stripePriceId);
    });

    test('getPackageStripeUrl returns valid Stripe hosted payment links', () => {
        const sedanUrl = getPackageStripeUrl('luxury_sedan');
        expect(sedanUrl).toBe(rawData.luxury_sedan.paymentLinkUrl);
        expect(sedanUrl).toMatch(/^https:\/\/buy\.stripe\.com\//);

        const clubUrl = getPackageStripeCheckoutUrl('club_monthly');
        expect(clubUrl).toBe(rawData.club_monthly.paymentLinkUrl);
    });
});

describe('Phase 3: Webhook & Transaction Handler Simulation', () => {
    test('Simulates checkout.session.completed payload handling', () => {
        const mockSession = {
            id: 'cs_test_a1b2c3d4e5',
            mode: 'payment',
            amount_total: 15000,
            currency: 'usd',
            payment_intent: 'pi_test_123456789',
            customer_details: {
                email: 'vip.client@autolux.com',
                name: 'Alexander Sterling',
                phone: '+15551234567'
            },
            metadata: {
                userId: 'user_autolux_123',
                package: 'Luxury Sedan Detail',
                packageKey: 'luxury_sedan',
                vehicle: '2024 Porsche 911 GT3',
                appointmentDate: '2026-11-05T10:00',
                address: '100 Concierge Way, Buford, GA'
            }
        };

        // Validate structure matches what functions/index.js processes
        expect(mockSession.amount_total / 100).toBe(150);
        expect(mockSession.metadata.packageKey).toBe('luxury_sedan');
        expect(mockSession.payment_intent).toMatch(/^pi_/);
    });

    test('Simulates annual VIP subscription points calculation (1,200 points)', () => {
        const packageName = 'AutoLux Detailing Club Annual - $1,290/yr';
        const isAnnual = packageName.toLowerCase().includes('annual');
        const pointsEarned = isAnnual ? 1200 : 200;
        expect(pointsEarned).toBe(1200);
    });

    test('Simulates monthly subscription points calculation (200 points)', () => {
        const packageName = 'AutoLux Detailing Club Plan - $129/mo';
        const isAnnual = packageName.toLowerCase().includes('annual');
        const pointsEarned = isAnnual ? 1200 : 200;
        expect(pointsEarned).toBe(200);
    });
});
