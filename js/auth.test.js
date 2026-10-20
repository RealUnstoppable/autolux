import { jest } from '@jest/globals';

// Store original properties
const originalWindow = global.window;

// Create mock window with required methods before importing auth.js
global.window = {
    location: {
        pathname: '/',
        replace: jest.fn()
    }
};

import { debounce, ensureUserDocument, getAuthStatePromise, getUserRedirectPath, safeRedirect, clearUserDocumentCache } from './auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

describe('auth.js utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearUserDocumentCache();
        global.window.location.pathname = '/';
        global.window.location.replace.mockClear();
    });

    afterAll(() => {
        global.window = originalWindow;
    });

    describe('debounce', () => {
        it('should delay function execution', () => {
            jest.useFakeTimers();
            const func = jest.fn();
            const debouncedFunc = debounce(func, 100);

            debouncedFunc();
            expect(func).not.toBeCalled();

            jest.advanceTimersByTime(50);
            debouncedFunc();
            expect(func).not.toBeCalled();

            jest.advanceTimersByTime(100);
            expect(func).toBeCalledTimes(1);
            jest.useRealTimers();
        });
    });

    describe('getAuthStatePromise', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should resolve with user when authenticated', async () => {
            getDoc.mockResolvedValue({
                exists: () => true,
                data: () => ({ referralCode: 'ABCDEF' })
            });

            const mockUser = { uid: 'user123', email: 'test@test.com' };
            const unsubscribeMock = jest.fn();

            onAuthStateChanged.mockImplementation((auth, callback) => {
                setTimeout(() => callback(mockUser), 0);
                return unsubscribeMock;
            });

            const result = await getAuthStatePromise();

            expect(unsubscribeMock).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('should resolve with null when not authenticated', async () => {
            const unsubscribeMock = jest.fn();

            onAuthStateChanged.mockImplementation((auth, callback) => {
                setTimeout(() => callback(null), 0);
                return unsubscribeMock;
            });

            const result = await getAuthStatePromise();

            expect(unsubscribeMock).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('ensureUserDocument', () => {
        it('should return null if no user', async () => {
            const result = await ensureUserDocument(null);
            expect(result).toBeNull();
        });

        it('should initialize a new user with a 100 points sign up bonus', async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => false
            });

            const mockUser = { uid: 'new-user-123', email: 'new@autolux.com', displayName: 'Jane Doe' };
            const result = await ensureUserDocument(mockUser);

            expect(result).not.toBeNull();
            expect(result.loyaltyPoints).toBe(100);
            expect(result.bonusAwarded).toBe(true);
            expect(setDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    loyaltyPoints: 100,
                    bonusAwarded: true
                })
            );
        });

        it('should award 100 points sign up bonus to existing user missing points', async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ loyaltyPoints: 0, referralCode: 'ABC123' })
            });

            const mockUser = { uid: 'existing-user-123', email: 'existing@autolux.com' };
            const result = await ensureUserDocument(mockUser);

            expect(result).not.toBeNull();
            expect(result.loyaltyPoints).toBe(100);
            expect(result.bonusAwarded).toBe(true);
            expect(setDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    loyaltyPoints: 100,
                    bonusAwarded: true
                }),
                { merge: true }
            );
        });

        it('should cache user document in memory to prevent duplicate Firestore calls', async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ loyaltyPoints: 100, bonusAwarded: true, referralCode: 'CACHED1', isAdmin: false })
            });

            const mockUser = { uid: 'cache-user-1', email: 'cache@autolux.com' };
            const firstResult = await ensureUserDocument(mockUser);
            expect(getDoc).toHaveBeenCalledTimes(1);
            expect(firstResult.referralCode).toBe('CACHED1');

            // Second call should return immediately from cache without calling getDoc
            const secondResult = await ensureUserDocument(mockUser);
            expect(getDoc).toHaveBeenCalledTimes(1);
            expect(secondResult).toEqual(firstResult);
        });

        it('should deduplicate concurrent in-flight requests for the same user', async () => {
            getDoc.mockImplementation(async () => {
                await new Promise(r => setTimeout(r, 20));
                return {
                    exists: () => true,
                    data: () => ({ loyaltyPoints: 100, bonusAwarded: true, referralCode: 'DEDUP1' })
                };
            });

            const mockUser = { uid: 'dedup-user-1', email: 'dedup@autolux.com' };
            const [call1, call2] = await Promise.all([
                ensureUserDocument(mockUser),
                ensureUserDocument(mockUser)
            ]);

            expect(getDoc).toHaveBeenCalledTimes(1);
            expect(call1).toEqual(call2);
        });

        it('should bypass cache when forceRefresh is true', async () => {
            getDoc.mockResolvedValue({
                exists: () => true,
                data: () => ({ loyaltyPoints: 100, bonusAwarded: true, referralCode: 'REFRESH1' })
            });

            const mockUser = { uid: 'refresh-user-1', email: 'refresh@autolux.com' };
            await ensureUserDocument(mockUser);
            expect(getDoc).toHaveBeenCalledTimes(1);

            // With forceRefresh: true, getDoc should be called again
            await ensureUserDocument(mockUser, { forceRefresh: true });
            expect(getDoc).toHaveBeenCalledTimes(2);
        });

        it('should allow clearing the cache via clearUserDocumentCache', async () => {
            getDoc.mockResolvedValue({
                exists: () => true,
                data: () => ({ loyaltyPoints: 100, bonusAwarded: true, referralCode: 'CLEAR1' })
            });

            const mockUser = { uid: 'clear-user-1', email: 'clear@autolux.com' };
            await ensureUserDocument(mockUser);
            expect(getDoc).toHaveBeenCalledTimes(1);

            clearUserDocumentCache('clear-user-1');

            await ensureUserDocument(mockUser);
            expect(getDoc).toHaveBeenCalledTimes(2);
        });
    });

    describe('getUserRedirectPath', () => {
        it('should redirect unauthenticated users away from private paths', async () => {
            const result = await getUserRedirectPath(null, null, '/account.html');
            expect(result).toBe('sign in beta.html');
        });

        it('should not redirect unauthenticated users on public paths like index.html and rewards.html', async () => {
            const resultIndex = await getUserRedirectPath(null, null, '/index.html');
            expect(resultIndex).toBeNull();

            const resultRewards = await getUserRedirectPath(null, null, '/rewards.html');
            expect(resultRewards).toBeNull();
        });

        it('should redirect non-admins away from admin path', async () => {
            const mockUser = { uid: 'test' };
            const mockUserData = { isAdmin: false };
            const result = await getUserRedirectPath(mockUser, mockUserData, '/admin.html');
            expect(result).toBe('account.html');
        });

        it('should redirect admins to admin path if not there', async () => {
            const mockUser = { uid: 'test' };
            const mockUserData = { isAdmin: true };
            const result = await getUserRedirectPath(mockUser, mockUserData, '/account.html');
            expect(result).toBe('admin.html');
        });

        it('should handle clean URLs without .html extension', async () => {
            const mockUser = { uid: 'test' };
            const mockUserData = { isAdmin: false };
            const result = await getUserRedirectPath(mockUser, mockUserData, '/sign in beta');
            expect(result).toBe('account.html');
        });
    });

    describe('safeRedirect', () => {
        it('should redirect if paths differ', () => {
            global.window.location.pathname = '/index.html';
            safeRedirect('/account.html');
            expect(global.window.location.replace).toHaveBeenCalledWith('/account.html');
        });

        it('should not redirect if paths are the same', () => {
            global.window.location.pathname = '/account.html';
            safeRedirect('/account.html');
            expect(global.window.location.replace).not.toHaveBeenCalled();
        });

        it('should allow same-origin absolute URLs', () => {
            global.window.location.origin = 'https://autolux.realunstoppable.store';
            global.window.location.pathname = '/sign in beta.html';
            safeRedirect('https://autolux.realunstoppable.store/account.html');
            expect(global.window.location.replace).toHaveBeenCalledWith('https://autolux.realunstoppable.store/account.html');
        });

        it('should not redirect to external URLs', () => {
            const originalConsoleError = console.error;
            console.error = jest.fn();
            global.window.location.pathname = '/index.html';
            safeRedirect('https://evil.com/account.html');
            expect(global.window.location.replace).not.toHaveBeenCalled();
            expect(console.error).toHaveBeenCalled();
            console.error = originalConsoleError;
        });

        it('should not redirect to javascript URIs', () => {
            const originalConsoleError = console.error;
            console.error = jest.fn();
            global.window.location.pathname = '/index.html';
            safeRedirect('javascript:alert(1)');
            expect(global.window.location.replace).not.toHaveBeenCalled();
            expect(console.error).toHaveBeenCalled();
            console.error = originalConsoleError;
        });
    });
});
