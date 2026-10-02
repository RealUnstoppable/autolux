
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
- For Firebase connection auditing, always ensure lenient hostname matching in `js/auth.js` (`hostname.includes(...)`) to prevent instance caching collisions, and enforce missing API keys using `window.ENV`.
## 2025-05-24 - [CRITICAL/HIGH] Fix Mass Assignment Vulnerability in Firestore Rules
**Vulnerability:** Missing strict schema checks (`hasOnly()`) on public/user collections like `reviews` and `bookings`. Authenticated users could inject arbitrary fields into documents during creation.
**Learning:** Even with checks to ensure the `userId` matches and `status` is `pending`, a lack of `.hasOnly()` allows clients to persist unauthorized fields to the database.
**Prevention:** Always use `request.resource.data.keys().hasOnly(['expected', 'keys'])` when authorizing `create` or `update` operations on documents written directly by clients.
