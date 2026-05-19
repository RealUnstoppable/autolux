## 2024-05-24 - DoS vulnerability via unvalidated rating
**Vulnerability:** Unvalidated `review.rating` data from Firestore caused client-side rendering crashes (Denial of Service) when passed to `String.repeat()` in `admin.html` and `index.html`.
**Learning:** Even if data is submitted via a UI with restricted options (like a `<select>` for 1-5 stars), attackers can bypass the UI and insert malicious data directly into the database via API. If this data is later used in functions that expect constrained input (like `String.repeat`), it will crash the client app.
**Prevention:** Always sanitize and clamp numeric values originating from a database before passing them to string manipulation functions, ensuring they fall within valid bounds.
