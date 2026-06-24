## 2024-05-23 - Interactive Divs Missing Accessibility
**Learning:** The application uses custom `div` elements for core interactions (like the mobile menu toggle in `index.html`) without proper roles, tabindex, or keyboard event listeners, making them inaccessible to screen readers and keyboard users.
**Action:** Always ensure custom interactive elements have `role="button"`, `tabindex="0"`, appropriate `aria-*` attributes (like `aria-expanded`), and keyboard event handlers (Enter/Space), or preferably, use semantic `<button>` elements.
## 2024-05-20 - Custom Div Forms
**Learning:** The codebase occasionally uses custom `div` containers with inline `onclick` buttons for forms (like newsletter signups) instead of semantic `<form>` elements, breaking keyboard accessibility (native "Enter" submission).
**Action:** When working with text input and submit flows, always wrap the elements in a semantic `<form>` to inherit native "Enter" key submission behaviors.
## 2024-06-24 - Missing aria-live for dynamic message updates
**Learning:** The application updates status and error messages dynamically via JavaScript on form submissions (like logins, inquiries, booking requests), but these message containers lacked `aria-live="polite"`. This means screen readers wouldn't announce the updates to the user without interrupting their flow.
**Action:** Always add `aria-live="polite"` to message containers that are updated dynamically to ensure screen readers dynamically announce the updates without interrupting the user.
