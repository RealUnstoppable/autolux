## 2024-05-23 - Interactive Divs Missing Accessibility
**Learning:** The application uses custom `div` elements for core interactions (like the mobile menu toggle in `index.html`) without proper roles, tabindex, or keyboard event listeners, making them inaccessible to screen readers and keyboard users.
**Action:** Always ensure custom interactive elements have `role="button"`, `tabindex="0"`, appropriate `aria-*` attributes (like `aria-expanded`), and keyboard event handlers (Enter/Space), or preferably, use semantic `<button>` elements.
## 2024-05-20 - Custom Div Forms
**Learning:** The codebase occasionally uses custom `div` containers with inline `onclick` buttons for forms (like newsletter signups) instead of semantic `<form>` elements, breaking keyboard accessibility (native "Enter" submission).
**Action:** When working with text input and submit flows, always wrap the elements in a semantic `<form>` to inherit native "Enter" key submission behaviors.
## 2024-06-22 - Dynamic Form Feedback Messages
**Learning:** The application extensively uses empty message containers (like `<div id="msg"></div>`) to dynamically inject form submission success or error feedback via JavaScript, but these containers were missing the `aria-live` attribute, causing screen readers to silently ignore the updates.
**Action:** Always add `aria-live="polite"` to any container element that will receive dynamic text updates (like form validation errors or success messages) to ensure screen readers announce the changes.
