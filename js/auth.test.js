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

import { debounce, ensureUserDocument, getUserRedirectPath, safeRedirect } from './auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

describe('auth.js utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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

    describe('ensureUserDocument', () => {
        it('should return null if no user', async () => {
            const result = await ensureUserDocument(null);
            expect(result).toBeNull();
        });
    });

    describe('getUserRedirectPath', () => {
        it('should redirect unauthenticated users away from private paths', async () => {
            const result = await getUserRedirectPath(null, null, '/account.html');
            expect(result).toBe('sign in beta.html');
        });

        it('should not redirect unauthenticated users on public paths', async () => {
            const result = await getUserRedirectPath(null, null, '/index.html');
            expect(result).toBeNull();
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
    });
});
