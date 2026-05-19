## 2024-05-24 - Mobile Menu Accessibility Pattern
**Learning:** Found a recurring pattern in this application where mobile menu toggle icons (both on public-facing site and admin dashboard) were using standard HTML elements (divs) or buttons without proper semantic attributes and ARIA labels. This causes screen reader users to encounter non-descriptive elements for navigation.
**Action:** When working on navigation or custom toggle components in the future, always ensure that icon-only buttons use the `<button>` element with an appropriate `aria-label`, and if they act as a toggle, manage the `aria-expanded` state.

## 2026-05-19 - Form Accessibility Pattern
**Learning:** Found an interactive form pattern where a custom `div` container with an inline `onclick` button was used instead of a semantic `<form>` element. This prevents the expected "Enter" key submission behavior, breaking keyboard accessibility for submitting the form.
**Action:** When creating text input and submit flows (like newsletter signups or search bars), always wrap the elements in a semantic `<form>` element to inherit native "Enter" key to submit behaviors, and use `type="submit"` on the button.
