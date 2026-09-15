import { jest } from '@jest/globals';

// Import the dynamically generated, modified target that doesn't use network imports
import { escapeHTML, submitDetailingRequest } from './tmp/utils.test_target.js';

it('escapeHTML escapes HTML characters correctly', () => {
    expect(escapeHTML('<script>alert("test")&\'</script>')).toStrictEqual('&lt;script&gt;alert(&quot;test&quot;)&amp;&#039;&lt;/script&gt;');
});

it('escapeHTML handles null and undefined gracefully', () => {
    expect(escapeHTML(null)).toStrictEqual('');
    expect(escapeHTML(undefined)).toStrictEqual('');
});

it('submitDetailingRequest fails if no userId provided', async () => {
    const originalError = console.error;
    console.error = () => {};
    const result = await submitDetailingRequest(null, { service: 'Wash' });
    console.error = originalError;

    expect(result.success).toStrictEqual(false);
    expect(result.error).toStrictEqual('User must be authenticated to submit a request.');
});

it('submitDetailingRequest succeeds with valid data', async () => {
    const result = await submitDetailingRequest('user123', { service: 'Wash' });
    expect(result.success).toStrictEqual(true);
    expect(result.docId).toStrictEqual('mock-doc-id');
});

it('submitDetailingRequest handles errors during addDoc', async () => {
    const originalError = console.error;
    console.error = () => {};
    const result = await submitDetailingRequest('error-user', { service: 'Wash' });
    console.error = originalError;

    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual('permission-denied');
});
