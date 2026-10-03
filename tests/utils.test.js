import { jest } from '@jest/globals';
import { escapeHTML, submitGenericRequest } from '../js/utils.js';

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
});
