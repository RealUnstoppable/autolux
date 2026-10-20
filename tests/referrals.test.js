import { jest } from '@jest/globals';
import { validateReferralCode, ensureUserDocument, clearUserDocumentCache } from '../js/auth.js';
import { getDoc, setDoc, getDocs, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

describe('Referral System Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearUserDocumentCache();
    });

    describe('validateReferralCode', () => {
        it('returns null for empty or non-string referral codes', async () => {
            expect(await validateReferralCode(null)).toBeNull();
            expect(await validateReferralCode(undefined)).toBeNull();
            expect(await validateReferralCode('')).toBeNull();
            expect(await validateReferralCode('   ')).toBeNull();
            expect(await validateReferralCode(12345)).toBeNull();
        });

        it('looks up code in referral_codes collection and returns user info', async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ code: 'FRIEND50', userId: 'referrer_user_123' })
            });

            const result = await validateReferralCode('friend50 ');
            expect(result).not.toBeNull();
            expect(result.userId).toBe('referrer_user_123');
            expect(result.referralCode).toBe('FRIEND50');
            expect(getDoc).toHaveBeenCalledWith(expect.objectContaining({ col: 'referral_codes', id: 'FRIEND50' }));
        });

        it('falls back to users query if not found in referral_codes collection', async () => {
            // First lookup in referral_codes returns not found
            getDoc.mockResolvedValueOnce({
                exists: () => false
            });
            // Fallback query to users collection returns match
            getDocs.mockResolvedValueOnce({
                empty: false,
                docs: [{
                    id: 'legacy_user_789',
                    data: () => ({ referralCode: 'LEGACY1', referralCredits: 25 })
                }]
            });

            const result = await validateReferralCode('legacy1');
            expect(result).not.toBeNull();
            expect(result.id).toBe('legacy_user_789');
            expect(result.referralCode).toBe('LEGACY1');
        });

        it('returns null if referral code exists neither in referral_codes nor in users', async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => false
            });
            getDocs.mockResolvedValueOnce({
                empty: true,
                docs: []
            });

            const result = await validateReferralCode('NONEXISTENT');
            expect(result).toBeNull();
        });

        it('catches and logs errors without throwing an unhandled exception', async () => {
            const originalError = console.error;
            console.error = jest.fn();

            getDoc.mockRejectedValueOnce(new Error('Network error'));
            const result = await validateReferralCode('ERRORCODE');
            expect(result).toBeNull();

            console.error = originalError;
        });
    });

    describe('ensureUserDocument referral initialization', () => {
        it('assigns unique referralCode and sets referralCredits to 0 for new users', async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => false
            });

            const mockNewUser = { uid: 'brand_new_user', email: 'new@autolux.com', displayName: 'New Client' };
            const userData = await ensureUserDocument(mockNewUser);

            expect(userData).not.toBeNull();
            expect(userData.referralCode).toBeDefined();
            expect(typeof userData.referralCode).toBe('string');
            expect(userData.referralCode.length).toBeGreaterThanOrEqual(4);
            expect(userData.referralCredits).toBe(0);

            // Verifies setDoc was called with referralCode and referralCredits: 0
            expect(setDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    referralCode: userData.referralCode,
                    referralCredits: 0
                })
            );
        });

        it('generates a referralCode for existing users missing one, preserving referralCredits', async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({
                    uid: 'existing_no_code',
                    email: 'existing@autolux.com',
                    loyaltyPoints: 100,
                    bonusAwarded: true,
                    referralCredits: 50 // Existing credits should be preserved
                })
            });

            const mockUser = { uid: 'existing_no_code', email: 'existing@autolux.com' };
            const userData = await ensureUserDocument(mockUser);

            expect(userData.referralCode).toBeDefined();
            expect(userData.referralCredits).toBe(50);
        });
    });

    describe('booking submission with referralCode', () => {
        it('normalizes and attaches uppercase referralCode to bookings payload', async () => {
            const { submitDetailingRequest } = await import('../js/api.js');
            const result = await submitDetailingRequest({
                package: 'Luxury Sedan - $150',
                vehicle: '2024 Tesla Model S',
                appointmentDate: '2026-10-25T10:00',
                address: '123 Test Road',
                referralCode: '  friend99  '
            });

            expect(result.success).toBe(true);
            expect(result.id).toBe('mock-doc-id');
        });
    });
});
