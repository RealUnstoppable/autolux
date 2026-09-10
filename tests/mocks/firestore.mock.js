export const collection = (db, path) => ({ db, path });
export const addDoc = async (coll, data) => {
    if (data.userId === 'error-user') {
        const error = new Error("Mocked error");
        error.code = "permission-denied";
        throw error;
    }
    return { id: 'mock-doc-id' };
};
export const serverTimestamp = () => 'mock-timestamp';
