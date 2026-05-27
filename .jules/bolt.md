## 2025-02-24 - [Parallelizing independent DB reads]
**Learning:** In Firebase (and JavaScript in general), placing multiple `await` keywords sequentially for independent network requests causes the main thread to wait for each request to finish before starting the next one. This codebase exhibited this anti-pattern in `admin.html`, creating unnecessary delays in rendering the dashboard.
**Action:** When making multiple independent Firebase reads, start the requests concurrently by executing the queries (creating Promises) and storing them in variables, then `await` those variables when the data is actually needed. This preserves precise try/catch error handling while allowing the network requests to resolve in parallel, taking the page load time from O(A+B+C+D+E+F) to O(max(A,B,C,D,E,F)).
## 2024-05-20 - Unsplash FCP Optimization
**Learning:** Using raw Unsplash image URLs without format optimization parameters leads to slower First Contentful Paint (FCP) and network loading performance.
**Action:** When using Unsplash image URLs for the UI, append `&auto=format` to optimize the delivery format.

## 2026-05-20 - [Unsplash Image Format Optimization]
**Learning:** Unsplash image URLs use Imgix under the hood. Serving default format images (often large JPEGs) hurts frontend performance, specifically First Contentful Paint (FCP) and bandwidth usage.
**Action:** Append `&auto=format` to Unsplash URLs. This allows the backend to automatically negotiate and serve the most optimal, modern image format (like WebP or AVIF) supported by the user's browser, safely falling back if needed.
## 2025-05-24 - [Avoid Git Merge Diff Botched Syntax Replacements]
**Learning:** When using `replace_with_git_merge_diff` to replace duplicated syntax, large blocks with overlapping tokens can confuse the patching logic, leading to severely mangled syntax or the removal of unintended blocks (like important imports).
**Action:** When deduplicating code blocks inside large files, prefer smaller, more targeted `replace_with_git_merge_diff` chunks or use bash `sed`/`awk` directly for precise in-place removal to avoid massive side-effects.
## 2025-05-24 - [Avoid DB Queries for Static Global Elements]
**Learning:** Functions that load static or globally shared data on page load (like FAQs or Menus) via database queries introduce unnecessary latency and database reads if they are repeatedly hit during a single session.
**Action:** When rendering data that doesn't change frequently during a session, use `sessionStorage` to cache the initial database response. Update the loading function to check `sessionStorage` before making the network call, skipping the fetch entirely if the cache is present.
## 2026-05-27 - [Batch DOM Updates with DocumentFragment]
**Learning:** In `admin.html`, rendering functions iteratively called `.appendChild()` inside `.forEach()` loops, causing multiple reflows/repaints (layout thrashing) proportional to the array size.
**Action:** When dynamically rendering lists or tables, construct the entire list in memory using a `DocumentFragment` first, then append the single fragment to the DOM container after the loop. This reduces rendering costs to O(1) repaint per list instead of O(N). Always add an inline comment explaining the optimization.
