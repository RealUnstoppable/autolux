## 2025-05-17 - [Type Coercion XSS Vulnerability]
**Vulnerability:** Found a Stored XSS vulnerability in `admin.html`. The `escapeHTML` function checked if `typeof str !== 'string'` and returned the raw input if it wasn't. When non-string types like arrays (e.g. `['<script>alert(1)</script>']`) were processed, they bypassed escaping and were later implicitly converted to strings during HTML string interpolation, allowing script execution.
**Learning:** Type checking alone is insufficient for escaping functions when the output will be implicitly coerced back to a string later (like in template literals).
**Prevention:** Always explicitly coerce variables to Strings (`String(str)`) before escaping, rather than ignoring non-strings. Also check for `null`/`undefined` before string coercion to avoid `null` or `undefined` strings in output.
## 2026-05-22 - [String.repeat() DoS Vulnerability]
**Vulnerability:** Unsanitized user input (`rating`) was passed directly to `String.repeat()`.
**Learning:** If non-numeric or extreme values are passed from an unvalidated database write to `String.repeat()`, it throws a RangeError which halts JavaScript execution, causing a Persistent Client-Side DoS.
**Prevention:** Always sanitize and clamp numbers expected by `String.repeat()` to a safe range (e.g., `Math.max(0, Math.min(5, Number(rating) || 5))`) before use.
