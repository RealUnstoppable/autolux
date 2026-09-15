import { jest } from '@jest/globals';

export const initializeApp = jest.fn();
export const getApps = jest.fn(() => []);
export const getAuth = jest.fn();
export const onAuthStateChanged = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const signInWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const updateProfile = jest.fn();
export const getFirestore = jest.fn();
export const doc = jest.fn();
export const getDoc = jest.fn();
export const setDoc = jest.fn();
export const collection = jest.fn();
export const addDoc = jest.fn(async (col, data) => {
    if (data.userId === 'error-user') {
        const error = new Error('Permission denied');
        error.code = 'permission-denied';
        throw error;
    }
    return { id: 'mock-doc-id' };
});
export const serverTimestamp = jest.fn();
