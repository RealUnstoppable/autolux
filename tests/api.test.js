import { jest } from '@jest/globals';
import { submitDetailingRequest, submitQuoteRequest, submitDetailingPlan } from '../js/api.js';

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

    test('submitDetailingPlan runs and succeeds for AutoLux detailing plan', async () => {
        const planData = {
            package: 'AutoLux Detailing Club Plan - $99/mo',
            vehicle: '2024 Audi RS6 Avant',
            appointmentDate: '2026-11-03T09:00',
            address: '300 Pine St, Buford, GA',
            notes: 'First monthly maintenance wash'
        };
        const result = await submitDetailingPlan(planData);
        expect(result.success).toBe(true);
        expect(result.id).toBe('mock-doc-id');
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
