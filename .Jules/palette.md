## 2024-05-23 - Interactive Divs Missing Accessibility
**Learning:** The application uses custom `div` elements for core interactions (like the mobile menu toggle in `index.html`) without proper roles, tabindex, or keyboard event listeners, making them inaccessible to screen readers and keyboard users.
**Action:** Always ensure custom interactive elements have `role="button"`, `tabindex="0"`, appropriate `aria-*` attributes (like `aria-expanded`), and keyboard event handlers (Enter/Space), or preferably, use semantic `<button>` elements.
## 2024-05-20 - Custom Div Forms
**Learning:** The codebase occasionally uses custom `div` containers with inline `onclick` buttons for forms (like newsletter signups) instead of semantic `<form>` elements, breaking keyboard accessibility (native "Enter" submission).
**Action:** When working with text input and submit flows, always wrap the elements in a semantic `<form>` to inherit native "Enter" key submission behaviors.
## 2026-05-26 - Accessible Character Counter Initialization
**Learning:** Adding a character counter with `aria-live="polite"` causes severe screen reader spam on every keystroke. Also, simply attaching an `input` event listener is insufficient; the counter must be initialized on load to handle browser-restored or pre-filled text.
**Action:** When adding character counters, do NOT use `aria-live`. Instead, use `aria-describedby` on the textarea pointing to the counter's ID. Ensure the update function is explicitly called once during initialization before binding it to the `input` event.
