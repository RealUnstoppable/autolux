import test from 'node:test';
import assert from 'node:assert';

// Import the dynamically generated, modified target that doesn't use network imports
import { escapeHTML, submitDetailingRequestCore } from './tmp/utils.test_target.js';

test('escapeHTML escapes HTML characters correctly', () => {
    assert.strictEqual(escapeHTML('<script>alert("test")&\'</script>'), '&lt;script&gt;alert(&quot;test&quot;)&amp;&#039;&lt;/script&gt;');
});

test('escapeHTML handles null and undefined gracefully', () => {
    assert.strictEqual(escapeHTML(null), '');
    assert.strictEqual(escapeHTML(undefined), '');
});

test('submitDetailingRequestCore fails if no userId provided', async () => {
    const originalError = console.error;
    console.error = () => {};
    const result = await submitDetailingRequestCore(null, { service: 'Wash' });
    console.error = originalError;

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'User must be authenticated to submit a request.');
});

test('submitDetailingRequestCore succeeds with valid data', async () => {
    const result = await submitDetailingRequestCore('user123', { service: 'Wash' });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.docId, 'mock-doc-id');
});

test('submitDetailingRequestCore handles errors during addDoc', async () => {
    const originalError = console.error;
    console.error = () => {};
    const result = await submitDetailingRequestCore('error-user', { service: 'Wash' });
    console.error = originalError;

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.code, 'permission-denied');
});
