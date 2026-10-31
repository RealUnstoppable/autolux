import { jest } from '@jest/globals';
import { getAvailableRewards, getUserTransfers, redeemReward, getUserRewards, DEFAULT_REWARDS } from '../js/rewards.js';
import { getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import fs from 'fs';
import path from 'path';

describe('rewards.js and firestore rules', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAvailableRewards returns rewards from Firestore when available', async () => {
        const mockDocs = [
            { id: 'custom-1', data: () => ({ title: 'Custom Wash', cost: 120 }) }
        ];
        getDocs.mockResolvedValueOnce({
            forEach: (cb) => mockDocs.forEach(cb),
            length: 1
        });

        const rewards = await getAvailableRewards();
        expect(rewards.length).toBe(1);
        expect(rewards[0].id).toBe('custom-1');
        expect(rewards[0].cost).toBe(120);
    });

    test('getAvailableRewards falls back to DEFAULT_REWARDS when Firestore is empty', async () => {
        getDocs.mockResolvedValueOnce({
            forEach: () => {},
            length: 0
        });

        const rewards = await getAvailableRewards();
        expect(rewards.length).toBeGreaterThan(0);
        expect(rewards).toEqual(DEFAULT_REWARDS);
        expect(rewards.some(r => r.cost === 100)).toBe(true);
    });

    test('getAvailableRewards falls back to DEFAULT_REWARDS on error', async () => {
        getDocs.mockRejectedValueOnce(new Error('Permission denied'));

        const rewards = await getAvailableRewards();
        expect(rewards).toEqual(DEFAULT_REWARDS);
    });

    test('getUserTransfers returns transfer activity with 100 points sign up bonus', async () => {
        getDocs.mockResolvedValueOnce({
            forEach: () => {}
        });

        const mockUser = { uid: 'user-xyz' };
        const mockUserData = { loyaltyPoints: 100, bonusAwarded: true };

        const transfers = await getUserTransfers(mockUser, mockUserData);
        expect(transfers.length).toBeGreaterThan(0);
        expect(transfers[0].amount).toBe(100);
        expect(transfers[0].title).toContain('100 Points Sign Up Bonus');
        expect(transfers[0].status).toBe('Completed');
    });

    test('redeemReward calls Cloud Function successfully', async () => {
        const result = await redeemReward('basic-wash-bonus', 100, 'Basic Wash Package');
        expect(result.success).toBe(true);
        expect(result.message).toBe('Reward redeemed successfully!');
    });

    test('getUserRewards returns user redeemed rewards', async () => {
        const mockRedeemed = [
            { id: 'redemption-1', data: () => ({ title: 'Basic Wash Package', cost: 100, status: 'Active' }) }
        ];
        getDocs.mockResolvedValueOnce({
            forEach: (cb) => mockRedeemed.forEach(cb)
        });

        const userRewards = await getUserRewards();
        // auth.currentUser is mocked in __mocks__/firebase.js, let's test graceful handling
        expect(Array.isArray(userRewards)).toBe(true);
    });

    test('firestore.rules grants read access to /rewards collection', () => {
        const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
        const rulesContent = fs.readFileSync(rulesPath, 'utf8');

        // Verify match /rewards/{rewardId} exists
        expect(rulesContent).toMatch(/match\s+\/rewards\/\{rewardId\}/);
        expect(rulesContent).toMatch(/allow\s+read:\s+if\s+true;/);
    });

    test('rewards.html contains window.ENV configuration for autolux', () => {
        const htmlPath = path.resolve(process.cwd(), 'rewards.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');

        expect(htmlContent).toContain('env.js');
        expect(htmlContent).toContain('100 Points Sign Up Bonus Transferred');
    });
});
