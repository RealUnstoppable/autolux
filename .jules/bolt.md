## 2023-10-25 - Prevent N+1 waterfall latency on page load
**Learning:** Initializing independent sub-collections queries inside sequential try-catch blocks or subsequent downstream functions creates a massive N+1 waterfall latency on initialization that scales terribly with dataset size.
**Action:** Hoist all independent UI-blocking queries to the top level of the primary initialization hook and wrap them in \`Promise.allSettled()\` to execute concurrently while ensuring that individual failures do not disrupt the entire loading process.
