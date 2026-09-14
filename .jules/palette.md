## 2024-05-23 - Interactive Divs Missing Accessibility
**Learning:** The application uses custom `div` elements for core interactions (like the mobile menu toggle in `index.html`) without proper roles, tabindex, or keyboard event listeners, making them inaccessible to screen readers and keyboard users.
**Action:** Always ensure custom interactive elements have `role="button"`, `tabindex="0"`, appropriate `aria-*` attributes (like `aria-expanded`), and keyboard event handlers (Enter/Space), or preferably, use semantic `<button>` elements.
## 2024-05-20 - Custom Div Forms
**Learning:** The codebase occasionally uses custom `div` containers with inline `onclick` buttons for forms (like newsletter signups) instead of semantic `<form>` elements, breaking keyboard accessibility (native "Enter" submission).
**Action:** When working with text input and submit flows, always wrap the elements in a semantic `<form>` to inherit native "Enter" key submission behaviors.
## 2025-02-12 - Semantic HTML vs ARIA Roles for Links
**Learning:** Adding `role="button"` and custom `onkeydown` handlers (like Enter/Space detection) to native `<a>` tags with `href` attributes is an anti-pattern. Screen readers and keyboards already natively understand and support `<a>` elements for navigation.
**Action:** Use native HTML semantics whenever possible. Reserve `role="button"` and custom keyboard handlers for non-interactive elements (like `div` or `span`) that act as custom controls when semantic `<button>` or `<a>` elements truly cannot be used.
## 2024-05-24 - Status Messages Missing Aria-Live
**Learning:** Many status message containers across the application are dynamically updated without `aria-live`, preventing screen readers from announcing the changes.
**Action:** Always include `aria-live="polite"` or `aria-live="assertive"` on containers that update dynamically with status messages or errors.
## 2024-11-20 - Adding aria-live to status messages
**Learning:** Status messages that update dynamically without page reloads (like form validation errors or login success/failure messages) are visually apparent but often missed by assistive technologies.
**Action:** When creating or modifying dynamic message containers (e.g. `id="error-msg"`), always include `aria-live="polite"` (or `"assertive"` if critical) so screen readers proactively announce the content updates to users.
## 2024-05-24 - Dynamic Messages and Toggle Elements Accessibility
**Learning:** Dynamic status messages (like form submission success/error messages) and custom toggle menus (like the mobile menu or FAQ accordions) often lack the necessary ARIA attributes to be announced correctly by screen readers.
**Action:** Always add `aria-live="polite"` to empty message containers that will be populated dynamically by JavaScript to ensure screen readers announce updates. For interactive toggle elements, ensure they use `aria-controls="[id of target container]"` to establish the relationship between the trigger and the content.

## 2024-06-26 - Add aria-live to dynamic message containers
**Learning:** When implementing dynamic status updates or form submission feedback (like error or success messages) without page reloads, screen readers may fail to announce these changes unless explicitly configured.
**Action:** Always add the `aria-live="polite"` attribute to message container elements (e.g. `<div id="msg"></div>`) to ensure screen readers dynamically announce updates without interrupting the user's current task.
## 2026-05-26 - Accessible Character Counter Initialization
**Learning:** Adding a character counter with `aria-live="polite"` causes severe screen reader spam on every keystroke. Also, simply attaching an `input` event listener is insufficient; the counter must be initialized on load to handle browser-restored or pre-filled text.
**Action:** When adding character counters, do NOT use `aria-live`. Instead, use `aria-describedby` on the textarea pointing to the counter's ID. Ensure the update function is explicitly called once during initialization before binding it to the `input` event.
