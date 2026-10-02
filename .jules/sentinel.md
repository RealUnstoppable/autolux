
**Vulnerability:** A Mass Assignment vulnerability was discovered in the proposed `support_tickets` implementation where users could inject `isAdmin: true` into the `messages` array payload, bypassing root-level security checks and impersonating administrators.
**Learning:** Checking root-level keys using `!('isAdmin' in request.resource.data)` is insufficient for nested data structures (like arrays of objects).
**Prevention:** To prevent nested Mass Assignment in Firestore rules without complex map validations or cloud functions, explicitly validate the contents of the nested structure during `create` and `update` operations (e.g., verifying that any newly added object inside the array has `isAdmin == false`).
