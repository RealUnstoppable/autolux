## 2024-05-23 - Interactive Divs Missing Accessibility
**Learning:** The application uses custom `div` elements for core interactions (like the mobile menu toggle in `index.html`) without proper roles, tabindex, or keyboard event listeners, making them inaccessible to screen readers and keyboard users.
**Action:** Always ensure custom interactive elements have `role="button"`, `tabindex="0"`, appropriate `aria-*` attributes (like `aria-expanded`), and keyboard event handlers (Enter/Space), or preferably, use semantic `<button>` elements.
## 2024-05-20 - Custom Div Forms
**Learning:** The codebase occasionally uses custom `div` containers with inline `onclick` buttons for forms (like newsletter signups) instead of semantic `<form>` elements, breaking keyboard accessibility (native "Enter" submission).
**Action:** When working with text input and submit flows, always wrap the elements in a semantic `<form>` to inherit native "Enter" key submission behaviors.
## 2024-05-24 - Missing aria-controls on Toggle Components
**Learning:** The application's toggle components (like the mobile menu and FAQs) use `aria-expanded` but consistently omit `aria-controls`, breaking the programmatic relationship between the toggle button and its target content for screen readers.
**Action:** When implementing or updating toggle widgets (menus, accordions, FAQs), always pair `aria-expanded` with `aria-controls="[id of target]"` on the trigger element to properly associate it with the collapsible container.
