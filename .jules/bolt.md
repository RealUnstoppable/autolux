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
