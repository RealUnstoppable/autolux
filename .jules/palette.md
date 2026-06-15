## 2024-05-23 - Interactive Divs Missing Accessibility
**Learning:** The application uses custom `div` elements for core interactions (like the mobile menu toggle in `index.html`) without proper roles, tabindex, or keyboard event listeners, making them inaccessible to screen readers and keyboard users.
**Action:** Always ensure custom interactive elements have `role="button"`, `tabindex="0"`, appropriate `aria-*` attributes (like `aria-expanded`), and keyboard event handlers (Enter/Space), or preferably, use semantic `<button>` elements.
## 2024-05-20 - Custom Div Forms
**Learning:** The codebase occasionally uses custom `div` containers with inline `onclick` buttons for forms (like newsletter signups) instead of semantic `<form>` elements, breaking keyboard accessibility (native "Enter" submission).
**Action:** When working with text input and submit flows, always wrap the elements in a semantic `<form>` to inherit native "Enter" key submission behaviors.
## 2024-05-24 - Dynamic Form Submission Messages Missing aria-live
**Learning:** Across the application, various dynamic form submission response messages or status updates (e.g., 'Saved', 'Sending...', or error texts) were not using `aria-live="polite"`. As a result, screen readers would not announce these status changes, making the forms inaccessible.
**Action:** For accessibility, ensure dynamic form submission response messages or status updates (e.g., 'Saved', 'Sending...', or error texts) use `aria-live="polite"` so screen readers announce them dynamically without interrupting the user.
