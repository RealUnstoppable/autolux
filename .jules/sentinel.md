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
## 2024-06-01 - [Stored XSS via innerHTML rendering of document IDs]
**Vulnerability:** Found a Stored XSS vulnerability in `admin.html`. The application was rendering document IDs (e.g., `userId`, `id` for reviews, inquiries, quotes) directly into the DOM using `innerHTML` without sanitization within action buttons.
**Learning:** Any data retrieved from a database and injected into the DOM via `innerHTML` is an XSS vector if not properly sanitized, even metadata like document IDs.
**Prevention:** Always use the `escapeHTML` utility function to sanitize variables before interpolating them into `innerHTML` strings.
## 2026-08-15 - Hardcoded Firebase Configuration

**Vulnerability:**
The application had hardcoded Firebase configuration values in `js/auth.js` instead of loading them exclusively from environment variables or failing securely when they were missing.

**Learning:**
Hardcoded configuration values can unintentionally establish connections to real projects or leak environment details (such as project IDs, API keys, and bucket names) in inappropriate contexts, potentially exposing the application to abuse.

**Prevention:**
Always load configuration dynamically from an environment object (e.g., `window.ENV`) and strictly enforce a fail-secure state by throwing an error if the required configuration is missing, avoiding real or plausible fallback values.
## 2026-10-15 - [Mass Assignment in API module]
**Vulnerability:** The `submitDetailingRequest` in `js/api.js` was susceptible to Mass Assignment by spreading `...bookingData` without enforcing server-side trusted fields like `status` and `userId`.
**Learning:** When using object spread for database writes, trusted fields must explicitly follow the user payload to prevent parameter tampering.
**Prevention:** Always spread user payload first, then explicitly assign trusted server-determined fields afterwards.
## 2027-06-27 - [Information Disclosure via Raw Error Objects]
**Vulnerability:** The API utility function `submitDetailingRequest` returned the raw caught `error` object (`return { success: false, error: error };`) to the client on failure.
**Learning:** Returning raw error objects violates the "fail securely" principle. It can inadvertently expose internal stack traces, database schema details, or sensitive error codes directly to the client/UI.
**Prevention:** Always extract and return safe properties (like `error.message`) or generic fallback strings instead of the entire raw error object when passing errors across boundaries.
## 2026-06-19 - [Information Exposure via Error Return]
**Vulnerability:** Raw error objects caught in `catch` blocks within API utilities (like `submitDetailingRequest`) were being returned directly to the calling client (`return { success: false, error: error }`).
**Learning:** Returning raw exception objects breaks the "fail securely" principle because it can leak sensitive internal details, Firebase error codes, or stack traces directly to the frontend or user.
**Prevention:** Always catch exceptions and return a generalized, secure error message (e.g., `'An error occurred while processing the request'`) rather than the raw error object.
## 2026-11-20 - [Privilege Escalation via Mass Assignment]
**Vulnerability:** A broken access control / privilege escalation vulnerability existed in `firestore.rules` because users could specify `isAdmin: true` during the creation or update of their own profile document.
**Learning:** Even if client-side code correctly initializes non-privileged fields (e.g., `isAdmin: false`), Firebase rules must explicitly block users from mutating protected fields directly via API calls.
**Prevention:** In Firestore rules, always enforce validation on protected properties during `create` and `update` by checking `request.resource.data` to prevent mass assignment (e.g., `(!('isAdmin' in request.resource.data) || request.resource.data.isAdmin == false)`).
## 2026-11-20 - [DOMPurify Context Stripping & Broken Access Control]
**Vulnerability:** Found `DOMPurify.sanitize()` being used to wrap entire `<tr>` template literals before injection into `innerHTML` in `admin.html`, which caused DOMPurify to strip the table tags because they were evaluated outside a `<table>` context. Also discovered that the `donations` collection in `firestore.rules` had `allow read: if true;`, exposing donor PII data to anyone.
**Learning:** Overly broad application of `DOMPurify.sanitize` without proper context configuration strips essential layout tags like `<tr>` and `<td>`. Concurrently, leaving collections like `donations` open for global read access constitutes a critical Broken Access Control vulnerability that leaks sensitive data.
**Prevention:** For DOM insertion of table rows, rely on interpolating specifically escaped variables (e.g. `escapeHTML(variable)`) into the template string rather than sanitizing the entire row chunk. Always ensure that collections storing user data or PII (e.g., `donations`) have restrictive read rules in `firestore.rules`, such as `allow read: if isAdmin();`.

## 2026-11-20 - [Data Exposure in Firestore Collections]
**Vulnerability:** The `donations` collection in `firestore.rules` had an open read rule (`allow read: if true;`), combined with `donate.html` explicitly saving user PII (name and email).
**Learning:** Any Firestore collection holding user PII must be heavily restricted to prevent massive data leaks via simple database querying by unauthenticated actors.
**Prevention:** Always verify that newly created Firestore collections (like `donations`) are restricted to admins (`allow read: if isAdmin();`) or document owners, and never use `allow read: if true;` unless the data is strictly meant to be public and contains zero sensitive info.
## 2026-12-10 - [Mass Assignment in Public Collections]
**Vulnerability:** Publicly writable collections (`inquiries`, `newsletterSubscribers`, `donations`) in `firestore.rules` allowed unrestricted creation (`allow create: if true;`), exposing the database to arbitrary data injection and mass assignment.
**Learning:** Even if the client-side code correctly structures the payload, allowing unvalidated writes to public collections opens the door for malicious actors to inject arbitrary fields or bypass intended schemas via direct API requests.
**Prevention:** Always enforce strict schema validation in `firestore.rules` for publicly writable collections using `request.resource.data.keys().hasOnly([...])` and validate specific field constraints (e.g., `status == 'pending'`).
## 2026-10-25 - [Missing Firebase Error Log Extraction]
**Vulnerability:**
The application had generic or bundled error objects being passed directly in Firebase `try/catch` logs (e.g., `console.error(error)`), rather than extracting specific codes.
**Learning:**
Logging generic errors without extracting the code (`error.code`) obscures critical infrastructure bugs such as App Check, CORS blocks, or API key misconfigurations, making debugging much harder in production.
**Prevention:**
Always explicitly extract and log `error.code` individually (e.g., `error.code || 'UNKNOWN_ERROR'`) alongside the standard error object in all `catch` blocks involving Firebase calls.
