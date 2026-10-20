import { jest } from '@jest/globals';
import { submitDetailingRequest, submitQuoteRequest, submitDetailingPlan } from '../js/api.js';

describe('api.js', () => {
    test('submitQuoteRequest runs and succeeds', async () => {
        const result = await submitQuoteRequest({ name: 'John Doe', email: 'john@example.com' });
        console.log('Quote result:', result);
        expect(result.success).toBe(true);
    });

    test('submitDetailingRequest runs and succeeds', async () => {
        const result = await submitDetailingRequest({ package: 'Luxury Sedan', vehicle: 'Porsche' });
        console.log('Detailing result:', result);
        expect(result.success).toBe(true);
    });

    test('submitDetailingPlan runs and succeeds', async () => {
        const result = await submitDetailingPlan({ package: 'AutoLux Detailing Club Plan - $99/mo' });
        console.log('Detailing plan result:', result);
        expect(result.success).toBe(true);
    });
});
