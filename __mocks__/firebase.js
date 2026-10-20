import { jest } from '@jest/globals';

export const initializeApp = jest.fn();
export const getApps = jest.fn(() => []);
export const getAuth = jest.fn(() => ({ currentUser: { uid: 'mock-user-id' } }));
export const onAuthStateChanged = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const signInWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const updateProfile = jest.fn();
export const getFirestore = jest.fn(() => ({}));
export const doc = jest.fn((db, col, id) => ({ db, col, id }));
export const getDoc = jest.fn();
export const setDoc = jest.fn();
export const updateDoc = jest.fn(async (docRef, data) => {
    if (data.throwError || (docRef && docRef.id === 'error-user')) {
        const error = new Error('Permission denied');
        error.code = 'permission-denied';
        throw error;
    }
    return;
});
export const collection = jest.fn();
export const addDoc = jest.fn(async (col, data) => {
    if (data.userId === 'error-user' || data.throwError) {
        const error = new Error('Permission denied');
        error.code = 'permission-denied';
        throw error;
    }
    return { id: 'mock-doc-id' };
});
export const serverTimestamp = jest.fn();
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const getDocs = jest.fn();
export const getFunctions = jest.fn(() => ({}));
export const httpsCallable = jest.fn(() => jest.fn(async () => ({ data: { success: true, message: 'Reward redeemed successfully!' } })));
