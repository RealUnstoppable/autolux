## 2024-05-24 - DoS vulnerability via unvalidated rating
**Vulnerability:** Unvalidated `review.rating` data from Firestore caused client-side rendering crashes (Denial of Service) when passed to `String.repeat()` in `admin.html` and `index.html`.
**Learning:** Even if data is submitted via a UI with restricted options (like a `<select>` for 1-5 stars), attackers can bypass the UI and insert malicious data directly into the database via API. If this data is later used in functions that expect constrained input (like `String.repeat`), it will crash the client app.
**Prevention:** Always sanitize and clamp numeric values originating from a database before passing them to string manipulation functions, ensuring they fall within valid bounds.
## 2025-05-17 - [Type Coercion XSS Vulnerability]
**Vulnerability:** Found a Stored XSS vulnerability in `admin.html`. The `escapeHTML` function checked if `typeof str !== 'string'` and returned the raw input if it wasn't. When non-string types like arrays (e.g. `['<script>alert(1)</script>']`) were processed, they bypassed escaping and were later implicitly converted to strings during HTML string interpolation, allowing script execution.
**Learning:** Type checking alone is insufficient for escaping functions when the output will be implicitly coerced back to a string later (like in template literals).
**Prevention:** Always explicitly coerce variables to Strings (`String(str)`) before escaping, rather than ignoring non-strings. Also check for `null`/`undefined` before string coercion to avoid `null` or `undefined` strings in output.
## 2026-05-21 - [Client-Side DoS via String.repeat]
**Vulnerability:** Found a client-side Denial of Service (DoS) vulnerability in `admin.html` and `index.html` where `String.repeat()` was called with an unvalidated user input (`review.rating`). A malicious user could submit a rating > 5, causing `5 - review.rating` to be negative, which throws a `RangeError` and crashes the JavaScript execution for the entire page.
**Learning:** Unsanitized numeric input passed to built-in functions that expect a specific range (like `String.repeat()`) can cause unhandled exceptions that break the application for all users.
**Prevention:** Always clamp numeric inputs from untrusted sources to a safe range (e.g. `Math.max(0, Math.min(MAX_VAL, val))`) before using them in operations that have strict bounds.
## 2026-05-22 - [String.repeat() DoS Vulnerability]
**Vulnerability:** Unsanitized user input (`rating`) was passed directly to `String.repeat()`.
**Learning:** If non-numeric or extreme values are passed from an unvalidated database write to `String.repeat()`, it throws a RangeError which halts JavaScript execution, causing a Persistent Client-Side DoS.
**Prevention:** Always sanitize and clamp numbers expected by `String.repeat()` to a safe range (e.g., `Math.max(0, Math.min(5, Number(rating) || 5))`) before use.
## 2026-05-24 - [Stored XSS via innerHTML rendering]
**Vulnerability:** The application was vulnerable to Stored XSS because dynamic service package data fetched from the database was rendered directly into the DOM using `innerHTML` without escaping in `booking.html`.
**Learning:** Any data retrieved from a database and injected into the DOM via `innerHTML` is an XSS vector if not properly sanitized, even if the data is assumed to be "internal" or "safe".
**Prevention:** Always use the `escapeHTML` utility function from `/js/utils.js` to sanitize variables before interpolating them into `innerHTML` strings, or build DOM elements using `document.createElement` and `textContent`.
## 2026-05-29 - [Privilege Escalation via Firestore Rules]
**Vulnerability:** The Firestore security rules for the `users` collection allowed users to set or update their own `isAdmin` field to `true`, enabling privilege escalation to an admin role.
**Learning:** When allowing users to create or update their own user documents, sensitive fields like roles or permissions must be explicitly excluded or restricted in the security rules to prevent self-granted escalation.
**Prevention:** Ensure `allow create` checks that sensitive fields are set to safe defaults (e.g. `request.resource.data.get('isAdmin', false) == false`) and `allow update` ensures those fields remain untouched (e.g. `!request.resource.data.diff(resource.data).affectedKeys().hasAny(['isAdmin'])`).
