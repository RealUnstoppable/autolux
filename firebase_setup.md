# Firebase Cross-Origin Auth Instructions

To resolve the Firebase cross-origin authentication issues, you need to add your domain to the authorized domains in the Firebase Console.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (`autolux-detailing`).
3.  In the left-hand navigation menu, go to **Authentication**.
4.  Click on the **Settings** tab.
5.  Select **Authorized domains** from the left sidebar of the Settings menu.
6.  Click the **Add domain** button.
7.  Enter the domain: `autolux.realunstoppable.store`
8.  Click **Add**.

This will authorize `autolux.realunstoppable.store` to use Firebase Authentication for this project, resolving any CORS or unapproved domain errors during sign-in or API requests.
