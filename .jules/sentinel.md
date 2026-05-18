## 2026-05-18 - Type Confusion XSS Bypass
**Vulnerability:** The `escapeHTML` function returned input as-is if `typeof str !== 'string'`, allowing array-based XSS payloads (e.g., `["<script>alert(1)</script>"]`) to bypass escaping.
**Learning:** Type checks that fail open (`!== string`) can be bypassed when the consuming context (like template literals) implicitly calls `.toString()` on complex objects.
**Prevention:** Always coerce input to string (`String(str)`) before applying security-critical regex replacements, rather than skipping non-strings.
