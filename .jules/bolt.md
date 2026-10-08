## 2024-05-20 - Unsplash FCP Optimization
**Learning:** Using raw Unsplash image URLs without format optimization parameters leads to slower First Contentful Paint (FCP) and network loading performance.
**Action:** When using Unsplash image URLs for the UI, append `&auto=format` to optimize the delivery format.

## 2026-05-20 - [Unsplash Image Format Optimization]
**Learning:** Unsplash image URLs use Imgix under the hood. Serving default format images (often large JPEGs) hurts frontend performance, specifically First Contentful Paint (FCP) and bandwidth usage.
**Action:** Append `&auto=format` to Unsplash URLs. This allows the backend to automatically negotiate and serve the most optimal, modern image format (like WebP or AVIF) supported by the user's browser, safely falling back if needed.

## 2025-02-24 - [Parallelizing independent DB reads]
**Learning:** In Firebase (and JavaScript in general), placing multiple `await` keywords sequentially for independent network requests causes the main thread to wait for each request to finish before starting the next one. This codebase exhibited this anti-pattern in `admin.html`, creating unnecessary delays in rendering the dashboard.
**Action:** When making multiple independent Firebase reads, start the requests concurrently by executing the queries (creating Promises) and storing them in variables, then `await` those variables when the data is actually needed. This preserves precise try/catch error handling while allowing the network requests to resolve in parallel, taking the page load time from O(A+B+C+D+E+F) to O(max(A,B,C,D,E,F)).

## 2025-05-24 - [Avoid Git Merge Diff Botched Syntax Replacements]
**Learning:** When using `replace_with_git_merge_diff` to replace duplicated syntax, large blocks with overlapping tokens can confuse the patching logic, leading to severely mangled syntax or the removal of unintended blocks (like important imports).
**Action:** When deduplicating code blocks inside large files, prefer smaller, more targeted `replace_with_git_merge_diff` chunks or use bash `sed`/`awk` directly for precise in-place removal to avoid massive side-effects.

## 2025-05-24 - [Avoid DB Queries for Static Global Elements]
**Learning:** Functions that load static or globally shared data on page load (like FAQs or Menus or Reviews) via database queries introduce unnecessary latency and database reads if they are repeatedly hit during a single session.
**Action:** When rendering data that doesn't change frequently during a session, use `sessionStorage` to cache the initial database response. Update the loading function to check `sessionStorage` before making the network call, skipping the fetch entirely if the cache is present. Also, ensure timestamps are properly stringified to avoid loss of prototype methods like `.toDate()`.
## 2025-05-24 - [Safely Accessing sessionStorage]
**Learning:** Browsers in strict privacy modes or incognito settings can block access to `sessionStorage`, causing `getItem` or `setItem` to throw exceptions (like `SecurityError` or `QuotaExceededError`). If these calls are not handled, they will crash the executing script and break page functionality.
**Action:** When interacting with `sessionStorage` (or `localStorage`), always wrap the read and write operations in a `try...catch` block to gracefully fail without breaking the rest of the application execution.
## 2025-10-24 - [Preloading CSS Background Images for LCP]
**Learning:** Above-the-fold hero images that are loaded via CSS background properties (`background-image`) are hidden from the browser's initial HTML parser, delaying their discovery and negatively impacting Largest Contentful Paint (LCP) and First Contentful Paint (FCP).
**Action:** Use `<link rel="preload" as="image" href="..." fetchpriority="high">` in the `<head>` of the HTML to explicitly inform the browser to fetch the critical background image immediately with high priority, bypassing the CSS parsing bottleneck.
## 2025-10-24 - [Avoid Eager Fetching Below-the-fold Images]
**Learning:** Using `fetchpriority="high"` on images located below the fold (e.g., in galleries) forces the browser to prioritize them over critical above-the-fold assets, hurting LCP and initial load performance.
**Action:** Always use `loading="lazy"` and `decoding="async"` for images that are not immediately visible in the initial viewport, allowing the browser to optimize network requests and rendering thread availability.
## 2025-05-24 - [Avoid DOM Appends Inside Loops]
**Learning:** Appending elements (like `<tr>`) directly to a live DOM element (like `<tbody>`) inside a `forEach` or `for` loop causes synchronous layout reflows and repaints on every single iteration, leading to significant layout thrashing and slow rendering of long lists.
**Action:** When generating multiple DOM elements, always append them to an in-memory `DocumentFragment` during the loop, and then append that fragment to the live DOM exactly once after the loop completes.
