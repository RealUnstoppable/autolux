import { jest } from '@jest/globals';
import { linkUnAccount } from '../js/utils.js';
import { getUserTransfers } from '../js/rewards.js';

describe('UN Account Linking (realunstoppable.store)', () => {
    const mockDb = {};

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('validates required authenticated user id', async () => {
        const result = await linkUnAccount(mockDb, null, {
            unAccountEmail: 'client@realunstoppable.store'
        });

        expect(result.success).toBe(false);
        expect(result.error).toMatch(/authenticated/i);
    });

    test('validates valid UN store email format', async () => {
        const resultEmpty = await linkUnAccount(mockDb, 'user_123', {
            unAccountEmail: ''
        });
        expect(resultEmpty.success).toBe(false);
        expect(resultEmpty.error).toMatch(/valid email/i);

        const resultInvalid = await linkUnAccount(mockDb, 'user_123', {
            unAccountEmail: 'invalid-email-address'
        });
        expect(resultInvalid.success).toBe(false);
        expect(resultInvalid.error).toMatch(/valid email/i);
    });

    test('adds user current loyalty points to existing total UN account balance', async () => {
        const result = await linkUnAccount(mockDb, 'user_vip_999', {
            unAccountEmail: 'VIP@REALUNSTOPPABLE.STORE',
            currentLoyaltyPoints: 350,
            existingUnBalance: 150,
            additionalInfo: {
                name: 'Jordan Chase',
                vehicles: ['2024 Mercedes AMG GT', '2023 Porsche Taycan'],
                membershipLevel: 'platinum'
            }
        });

        expect(result.success).toBe(true);
        expect(result.totalUnBalance).toBe(500); // 150 + 350
        expect(result.pointsAdded).toBe(350);
        expect(result.unAccountEmail).toBe('vip@realunstoppable.store');
        expect(result.message).toContain('Added 350 points to your total UN balance');
    });

    test('handles default 0 existing UN balance and adds current points', async () => {
        const result = await linkUnAccount(mockDb, 'user_abc', {
            unAccountEmail: 'owner@realunstoppable.store',
            currentLoyaltyPoints: 100
        });

        expect(result.success).toBe(true);
        expect(result.totalUnBalance).toBe(100);
        expect(result.pointsAdded).toBe(100);
    });

    test('handles 0 current points gracefully', async () => {
        const result = await linkUnAccount(mockDb, 'user_zero', {
            unAccountEmail: 'zero@realunstoppable.store',
            currentLoyaltyPoints: 0,
            existingUnBalance: 50
        });

        expect(result.success).toBe(true);
        expect(result.totalUnBalance).toBe(50);
        expect(result.pointsAdded).toBe(0);
    });

    test('returns graceful failure message on database failure', async () => {
        const originalError = console.error;
        console.error = jest.fn();

        const result = await linkUnAccount(mockDb, 'error-user', {
            unAccountEmail: 'err@realunstoppable.store',
            currentLoyaltyPoints: 50,
            additionalInfo: { throwError: true }
        });

        console.error = originalError;

        expect(result.success).toBe(false);
        expect(result.error).toMatch(/failed to link un account/i);
    });

    test('getUserTransfers displays UN linked transfer entry when account is linked', async () => {
        const user = { uid: 'user_linked_1' };
        const userData = {
            unLinked: true,
            unAccountEmail: 'alex@realunstoppable.store',
            totalUnBalance: 250,
            unPointsAdded: 150,
            unLinkedAt: new Date().toISOString()
        };

        const transfers = await getUserTransfers(user, userData);
        const unTransfer = transfers.find(t => t.id === 'un-link-transfer');

        expect(unTransfer).toBeDefined();
        expect(unTransfer.title).toBe('UN Account Linked (realunstoppable.store)');
        expect(unTransfer.amount).toBe(150);
        expect(unTransfer.status).toBe('Linked');
    });
});
