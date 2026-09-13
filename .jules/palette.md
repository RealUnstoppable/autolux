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
