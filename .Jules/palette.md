## 2024-05-24 - Mobile Menu Accessibility Pattern
**Learning:** Found a recurring pattern in this application where mobile menu toggle icons (both on public-facing site and admin dashboard) were using standard HTML elements (divs) or buttons without proper semantic attributes and ARIA labels. This causes screen reader users to encounter non-descriptive elements for navigation.
**Action:** When working on navigation or custom toggle components in the future, always ensure that icon-only buttons use the `<button>` element with an appropriate `aria-label`, and if they act as a toggle, manage the `aria-expanded` state.

## 2024-05-24 - Semantic Form Submissions
**Learning:** Found instances where custom `div` elements with inline `onclick` buttons were used instead of semantic `<form>` tags for input and submit flows (e.g., newsletter signup). This prevents users from using the native "Enter" key to submit, which is a major accessibility and usability issue for keyboard users.
**Action:** Always wrap text inputs and submit buttons in semantic `<form>` tags and use `onsubmit` (with `event.preventDefault()`) instead of `onclick` to inherit native keyboard submission behavior.
