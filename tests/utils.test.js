import { jest } from '@jest/globals';
import { escapeHTML, submitGenericRequest, linkUnAccount } from '../js/utils.js';

describe('utils.js', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('escapeHTML escapes HTML characters correctly', () => {
        expect(escapeHTML('<script>alert("test")&\'</script>')).toBe('&lt;script&gt;alert(&quot;test&quot;)&amp;&#039;&lt;/script&gt;');
    });

    test('escapeHTML handles null and undefined gracefully', () => {
        expect(escapeHTML(null)).toBe('');
        expect(escapeHTML(undefined)).toBe('');
    });

    test('submitGenericRequest succeeds', async () => {
        const originalError = console.error;
        console.error = jest.fn();
        const result = await submitGenericRequest('bookings', { service: 'Wash' });
        console.error = originalError;

        expect(result.success).toBe(true);
        expect(result.docId).toBe('mock-doc-id');
    });

    test('submitGenericRequest succeeds with valid data', async () => {
        const result = await submitGenericRequest('bookings', { service: 'Wash' });
        expect(result.success).toBe(true);
        expect(result.docId).toBe('mock-doc-id');
    });

    test('submitGenericRequest handles errors during addDoc', async () => {
        const originalError = console.error;
        console.error = jest.fn();
        const result = await submitGenericRequest('bookings', { service: 'Wash', throwError: true });
        console.error = originalError;

        expect(result.success).toBe(false);
        expect(result.code).toBe('permission-denied');
    });

    describe('linkUnAccount', () => {
        const mockDb = {};

        test('fails when userId is missing', async () => {
            const result = await linkUnAccount(mockDb, null, { unAccountEmail: 'test@realunstoppable.store' });
            expect(result.success).toBe(false);
            expect(result.error).toMatch(/authenticated/i);
        });

        test('fails when email is invalid or missing', async () => {
            const result1 = await linkUnAccount(mockDb, 'user123', { unAccountEmail: '' });
            expect(result1.success).toBe(false);
            expect(result1.error).toMatch(/valid email/i);

            const result2 = await linkUnAccount(mockDb, 'user123', { unAccountEmail: 'not-an-email' });
            expect(result2.success).toBe(false);
            expect(result2.error).toMatch(/valid email/i);
        });

        test('successfully links UN account and adds current points to total UN balance', async () => {
            const result = await linkUnAccount(mockDb, 'user_abc123', {
                unAccountEmail: 'Alex@realunstoppable.store',
                currentLoyaltyPoints: 150,
                existingUnBalance: 50,
                additionalInfo: {
                    name: 'Alex Turner',
                    vehicles: ['2023 Porsche 911'],
                    membershipLevel: 'club'
                }
            });

            expect(result.success).toBe(true);
            expect(result.totalUnBalance).toBe(200); // 50 existing + 150 current
            expect(result.pointsAdded).toBe(150);
            expect(result.unAccountEmail).toBe('alex@realunstoppable.store');
            expect(result.message).toContain('Added 150 points to your total UN balance');
        });

        test('handles 0 points and undefined existing balance correctly', async () => {
            const result = await linkUnAccount(mockDb, 'user_xyz789', {
                unAccountEmail: 'driver@realunstoppable.store',
                currentLoyaltyPoints: 0
            });

            expect(result.success).toBe(true);
            expect(result.totalUnBalance).toBe(0);
            expect(result.pointsAdded).toBe(0);
            expect(result.unAccountEmail).toBe('driver@realunstoppable.store');
        });

        test('gracefully handles database errors and returns safe failure message', async () => {
            const originalError = console.error;
            console.error = jest.fn();
            const result = await linkUnAccount(mockDb, 'user_err', {
                unAccountEmail: 'err@realunstoppable.store',
                currentLoyaltyPoints: 100,
                additionalInfo: { throwError: true }
            });
            console.error = originalError;

            expect(result.success).toBe(false);
            expect(result.error).toMatch(/failed to link un account/i);
        });
    });
});
