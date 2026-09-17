import { jest } from '@jest/globals';
import { submitDetailingRequestCore } from '../js/api.js';
import { escapeHTML } from '../js/utils.js';

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

    test('submitDetailingRequestCore fails if no userId provided', async () => {
        const originalError = console.error;
        console.error = jest.fn();
        const result = await submitDetailingRequestCore(null, { service: 'Wash' });
        console.error = originalError;

        expect(result.success).toBe(false);
        expect(result.error).toBe('User must be authenticated to submit a request.');
    });

    test('submitDetailingRequestCore succeeds with valid data', async () => {
        const result = await submitDetailingRequestCore('user123', { service: 'Wash' });
        expect(result.success).toBe(true);
        expect(result.docId).toBe('mock-doc-id');
    });

    test('submitDetailingRequestCore handles errors during addDoc', async () => {
        const originalError = console.error;
        console.error = jest.fn();
        const result = await submitDetailingRequestCore('error-user', { service: 'Wash' });
        console.error = originalError;

        expect(result.success).toBe(false);
        expect(result.code).toBe('permission-denied');
    });
});
