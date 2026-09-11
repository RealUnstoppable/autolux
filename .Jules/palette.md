## 2024-05-23 - Interactive Divs Missing Accessibility
**Learning:** The application uses custom `div` elements for core interactions (like the mobile menu toggle in `index.html`) without proper roles, tabindex, or keyboard event listeners, making them inaccessible to screen readers and keyboard users.
**Action:** Always ensure custom interactive elements have `role="button"`, `tabindex="0"`, appropriate `aria-*` attributes (like `aria-expanded`), and keyboard event handlers (Enter/Space), or preferably, use semantic `<button>` elements.
## 2024-05-20 - Custom Div Forms
**Learning:** The codebase occasionally uses custom `div` containers with inline `onclick` buttons for forms (like newsletter signups) instead of semantic `<form>` elements, breaking keyboard accessibility (native "Enter" submission).
**Action:** When working with text input and submit flows, always wrap the elements in a semantic `<form>` to inherit native "Enter" key submission behaviors.
## 2024-05-24 - Missing Focus Outlines
**Learning:** The application lacked `:focus-visible` CSS rules on interactive elements (links, buttons, inputs) in most HTML files (`booking.html`, `account.html`, `donate.html`, `sign in beta.html`), making keyboard navigation invisible and failing WCAG accessibility guidelines.
**Action:** Always ensure that every HTML file with interactive elements includes CSS rules for `*:focus-visible` (or specific elements like `a:focus-visible, button:focus-visible`) to provide a clear, high-contrast visual outline for keyboard users.
## 2024-05-25 - Form Labels without Required Indicators
**Learning:** The `booking.html` form lacked explicit required visual indicators on labels and accessibility features like `aria-live` and `aria-busy` during form submission.
**Action:** For the AUTOLUX project, when explicitly marking required form fields with visual indicators, follow the standard UI pattern of appending `<span aria-hidden="true" style="color: #ef4444;">*</span>` directly inside the corresponding `<label>` element. Also add `aria-live="polite"` to status message containers and toggle `aria-busy` on submit buttons.
