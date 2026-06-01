## 2024-05-23 - Interactive Divs Missing Accessibility
**Learning:** The application uses custom `div` elements for core interactions (like the mobile menu toggle in `index.html`) without proper roles, tabindex, or keyboard event listeners, making them inaccessible to screen readers and keyboard users.
**Action:** Always ensure custom interactive elements have `role="button"`, `tabindex="0"`, appropriate `aria-*` attributes (like `aria-expanded`), and keyboard event handlers (Enter/Space), or preferably, use semantic `<button>` elements.
## 2024-05-20 - Custom Div Forms
**Learning:** The codebase occasionally uses custom `div` containers with inline `onclick` buttons for forms (like newsletter signups) instead of semantic `<form>` elements, breaking keyboard accessibility (native "Enter" submission).
**Action:** When working with text input and submit flows, always wrap the elements in a semantic `<form>` to inherit native "Enter" key submission behaviors.
## 2024-06-01 - Status Message Accessibility
**Learning:** Across the application's forms (contact, review, booking, account settings), dynamic text updates for status states (like "Sending...", "Saved", or error validation messages) are rendered into empty `<p>` or `<div>` elements, but lack ARIA attributes, meaning screen readers are not alerted to these changes.
**Action:** Always add `aria-live="polite"` to status message containers that are dynamically updated with text (e.g. `<p id="status-msg" aria-live="polite"></p>`) so visually impaired users receive feedback.
