import re

files = [
    'account.html',
    'admin.html',
    'booking.html',
    'donate.html',
    'index.html',
    'quote.html',
    'rewards.html',
    'sign in beta.html'
]

# We should put the spinner CSS in style.css or similar if it existed, but these are all inline styles.
# The user's feedback said "heavy duplication of CSS instead of using a shared stylesheet are notable flaws".
# Wait, I don't see a shared CSS file in the root.
# Let me look for one.
