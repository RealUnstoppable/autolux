import { describe, test, expect } from '@jest/globals';
import { AUTOLUX_PRODUCTS, validateProfitMargin, syncProductToStore } from '../scripts/sync_autolux_products.js';
import { AUTOLUX_CLUB_PRODUCTS, getUnstoppableCheckoutUrl } from '../js/api.js';

describe('AutoLux Club Pricing & Profit Margin Verification', () => {
    test('monthly club plan ($129/mo) exceeds the minimum 20% profit margin requirement', () => {
        const monthly = AUTOLUX_PRODUCTS.find(p => p.id === 'autolux-detailing-club');
        expect(monthly).toBeDefined();
        expect(monthly.price).toBe(129.00);
        expect(monthly.costBasis).toBe(89.00);

        const check = validateProfitMargin(monthly);
        expect(check.isValid).toBe(true);
        expect(check.margin).toBeGreaterThanOrEqual(0.20);
        expect(check.margin).toBe(0.31); // 31.0% margin
        expect(check.profit).toBe(40.00);
    });

    test('annual club pass ($1,290/yr) exceeds the minimum 20% profit margin requirement', () => {
        const annual = AUTOLUX_PRODUCTS.find(p => p.id === 'autolux-club-annual');
        expect(annual).toBeDefined();
        expect(annual.price).toBe(1290.00);
        expect(annual.costBasis).toBe(900.00);

        const check = validateProfitMargin(annual);
        expect(check.isValid).toBe(true);
        expect(check.margin).toBeGreaterThanOrEqual(0.20);
        expect(check.margin).toBe(0.302); // 30.2% margin
        expect(check.profit).toBe(390.00);
    });

    test('verifies that legacy $99/mo price failed the 20% profit margin requirement', () => {
        const legacyPlan = {
            id: 'legacy-club-99',
            price: 99.00,
            costBasis: 89.00
        };
        const check = validateProfitMargin(legacyPlan);
        expect(check.isValid).toBe(false);
        expect(check.margin).toBeLessThan(0.20);
        expect(check.profit).toBe(10.00);
    });

    test('syncProductToStore dryRun returns valid payload matching Unstoppable Store schema', async () => {
        const monthly = AUTOLUX_PRODUCTS[0];
        const result = await syncProductToStore(monthly, { dryRun: true, apiKey: 'test-key' });

        expect(result.success).toBe(true);
        expect(result.dryRun).toBe(true);
        expect(result.product.id).toBe('autolux-detailing-club');
        expect(result.product.price).toBe(129.00);
        expect(result.product.sourceSite).toBe('autolux');
        expect(result.product.category).toBe('membership');
        expect(result.margin).toBeGreaterThanOrEqual(0.20);
    });

    test('generates valid checkout deep links for Unstoppable Store', () => {
        const monthlyLink = getUnstoppableCheckoutUrl('autolux-detailing-club', 1);
        expect(monthlyLink).toBe('https://realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1');

        const annualLink = getUnstoppableCheckoutUrl('autolux-club-annual', 1);
        expect(annualLink).toBe('https://realunstoppable.store/checkout.html?productId=autolux-club-annual&quantity=1');
    });
});
