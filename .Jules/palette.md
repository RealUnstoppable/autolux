## 2024-05-24 - Mobile Menu Accessibility Pattern
**Learning:** Found a recurring pattern in this application where mobile menu toggle icons (both on public-facing site and admin dashboard) were using standard HTML elements (divs) or buttons without proper semantic attributes and ARIA labels. This causes screen reader users to encounter non-descriptive elements for navigation.
**Action:** When working on navigation or custom toggle components in the future, always ensure that icon-only buttons use the `<button>` element with an appropriate `aria-label`, and if they act as a toggle, manage the `aria-expanded` state.

## 2024-05-24 - Semantic Form Submissions
**Learning:** Found instances where custom `div` elements with inline `onclick` buttons were used instead of semantic `<form>` tags for input and submit flows (e.g., newsletter signup). This prevents users from using the native "Enter" key to submit, which is a major accessibility and usability issue for keyboard users.
**Action:** Always wrap text inputs and submit buttons in semantic `<form>` tags and use `onsubmit` (with `event.preventDefault()`) instead of `onclick` to inherit native keyboard submission behavior.
## 2026-05-22 - Semantic Forms for Newsletter/Inputs
**Learning:** The codebase occasionally uses custom `div` containers with inline `onclick` buttons for forms (like newsletter signups) instead of semantic `<form>` elements. This prevents users from using the Enter key to submit the input, negatively impacting keyboard navigation and accessibility.
**Action:** When working with text input and submit flows, always wrap the elements in a semantic `<form>` with a submit button and ensure the Javascript handles `event.preventDefault()` to inherit native submission behaviors.
## $(date +%Y-%m-%d) - Semantic Forms over Custom Divs
**Learning:** The application occasionally uses custom `div` containers with inline `onclick` buttons for forms (like the newsletter signup in `index.html`). This is bad UX as it prevents standard "Enter" key submission and natively validating inputs (`required`).
**Action:** When implementing or fixing text inputs meant to act as submissions, wrap them in a semantic `<form>` with a `onsubmit` handler (e.g. `onsubmit="event.preventDefault(); submitFunc();"`) and use `<button type="submit">` to ensure full keyboard and form validation accessibility.
