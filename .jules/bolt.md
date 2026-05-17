## 2024-05-14 - Sequential Firebase Fetching in Admin Dashboard
**Learning:** Found a significant waterfall bottleneck in the admin dashboard (`admin.html`) where 6 separate Firebase collections were being fetched sequentially using `await getDocs()`. This forces the client to wait for each roundtrip before starting the next, significantly slowing down the initial dashboard load.
**Action:** Applied `Promise.allSettled()` / `Promise.all()` to fetch independent data streams concurrently. Will look for similar sequential fetching patterns in other parts of the application.
