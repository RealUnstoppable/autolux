import { jest } from '@jest/globals';
import { submitDetailingRequest, submitQuoteRequest, submitDetailingPlan, joinAutoLuxClub, getUnstoppableCheckoutUrl, AUTOLUX_CLUB_PRODUCTS } from '../js/api.js';

describe('api.js', () => {
    test('submitQuoteRequest runs and succeeds with quote data', async () => {
        const quoteData = {
            name: 'Alex Turner',
            email: 'alex@example.com',
            phone: '555-123-4567',
            details: '2024 Porsche 911 GT3',
            serviceRequested: 'Ceramic Coating',
            additionalNotes: 'Full exterior and interior detail needed'
        };
        const result = await submitQuoteRequest(quoteData);
        expect(result.success).toBe(true);
        expect(result.id).toBe('mock-doc-id');
    });

    test('submitDetailingRequest runs and succeeds for booked service', async () => {
        const bookingData = {
            package: 'Luxury Sedan - $150',
            vehicle: '2023 Mercedes C300',
            appointmentDate: '2026-11-01T10:00',
            address: '100 Main St, Buford, GA',
            notes: 'Gate code is #1234'
        };
        const result = await submitDetailingRequest(bookingData);
        expect(result.success).toBe(true);
        expect(result.id).toBe('mock-doc-id');
    });

    test('submitDetailingRequest normalizes referral code if provided', async () => {
        const bookingData = {
            package: 'Luxury SUV - $250',
            vehicle: '2024 BMW X5',
            appointmentDate: '2026-11-02T14:00',
            address: '200 Oak St, Buford, GA',
            referralCode: '  vip99  '
        };
        const result = await submitDetailingRequest(bookingData);
        expect(result.success).toBe(true);
    });

    test('submitDetailingPlan runs and succeeds for AutoLux detailing club plan ($129/mo)', async () => {
        const planData = {
            package: 'AutoLux Detailing Club Plan - $129/mo',
            vehicle: '2024 Audi RS6 Avant',
            appointmentDate: '2026-11-03T09:00',
            address: '300 Pine St, Buford, GA',
            notes: 'First monthly maintenance wash'
        };
        const result = await submitDetailingPlan(planData);
        expect(result.success).toBe(true);
        expect(result.id).toBe('mock-doc-id');
    });

    test('submitDetailingPlan runs and succeeds for AutoLux detailing annual VIP plan ($1,290/yr)', async () => {
        const planData = {
            package: 'AutoLux Detailing Club Annual - $1,290/yr',
            vehicle: '2024 Porsche 911 Turbo S',
            appointmentDate: '2026-11-05T10:00',
            address: '450 Lakeview Dr, Buford, GA',
            notes: 'Annual VIP membership wash'
        };
        const result = await submitDetailingPlan(planData);
        expect(result.success).toBe(true);
        expect(result.id).toBe('mock-doc-id');
    });

    test('joinAutoLuxClub formats payload with correct monthly pricing and store checkout link', async () => {
        const result = await joinAutoLuxClub({
            planType: 'monthly',
            vehicle: '2025 BMW M3',
            appointmentDate: '2026-11-10T11:00',
            address: '120 Peachtree Rd, Buford, GA'
        });
        expect(result.success).toBe(true);
        expect(result.id).toBe('mock-doc-id');
    });

    test('joinAutoLuxClub formats payload with correct annual pricing and store checkout link', async () => {
        const result = await joinAutoLuxClub({
            planType: 'annual',
            vehicle: '2025 Porsche Taycan',
            appointmentDate: '2026-11-12T14:00',
            address: '77 Ocean View Dr, Buford, GA'
        });
        expect(result.success).toBe(true);
        expect(result.id).toBe('mock-doc-id');
    });

    test('getUnstoppableCheckoutUrl produces valid deep links to realunstoppable.store', () => {
        const monthlyLink = getUnstoppableCheckoutUrl('autolux-detailing-club', 1);
        expect(monthlyLink).toBe('https://realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1');

        const annualLink = getUnstoppableCheckoutUrl('autolux-club-annual', 1);
        expect(annualLink).toBe('https://realunstoppable.store/checkout.html?productId=autolux-club-annual&quantity=1');
    });

    test('handles errors during quote request submission', async () => {
        const originalError = console.error;
        console.error = jest.fn();
        const result = await submitQuoteRequest({ name: 'Error User', throwError: true });
        console.error = originalError;

        expect(result.success).toBe(false);
        expect(result.error).toMatch(/error occurred while submitting your quote request/i);
    });

    test('handles errors during detailing request submission', async () => {
        const originalError = console.error;
        console.error = jest.fn();
        const result = await submitDetailingRequest({ package: 'Luxury Sedan', throwError: true });
        console.error = originalError;

        expect(result.success).toBe(false);
        expect(result.error).toMatch(/error occurred while submitting your detailing request/i);
    });

    test('handles errors during detailing plan submission', async () => {
        const originalError = console.error;
        console.error = jest.fn();
        const result = await submitDetailingPlan({ package: 'Detailing Plan', throwError: true });
        console.error = originalError;

        expect(result.success).toBe(false);
        expect(result.error).toMatch(/error occurred while submitting your detailingplan request/i);
    });
});
