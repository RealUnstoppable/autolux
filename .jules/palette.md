## 2024-05-23 - Interactive Divs Missing Accessibility
**Learning:** The application uses custom `div` elements for core interactions (like the mobile menu toggle in `index.html`) without proper roles, tabindex, or keyboard event listeners, making them inaccessible to screen readers and keyboard users.
**Action:** Always ensure custom interactive elements have `role="button"`, `tabindex="0"`, appropriate `aria-*` attributes (like `aria-expanded`), and keyboard event handlers (Enter/Space), or preferably, use semantic `<button>` elements.
## 2024-05-20 - Custom Div Forms
**Learning:** The codebase occasionally uses custom `div` containers with inline `onclick` buttons for forms (like newsletter signups) instead of semantic `<form>` elements, breaking keyboard accessibility (native "Enter" submission).
**Action:** When working with text input and submit flows, always wrap the elements in a semantic `<form>` to inherit native "Enter" key submission behaviors.
## 2024-07-30 - Form Feedback Accessibility
**Learning:** The application uses various `div` and `p` elements as dynamic message containers (e.g., `#error-msg`, `#booking-msg`, `#auth-msg`, etc.) to show success or error messages after form submissions. Without an `aria-live` attribute, screen reader users are not notified when these messages appear.
**Action:** When working with dynamic form feedback, success messages, or error notifications that appear without a page reload, ensure the container has an `aria-live="polite"` attribute (or `aria-live="assertive"` for critical errors) so assistive technologies announce the changes.
