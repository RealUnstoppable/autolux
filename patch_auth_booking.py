import re

with open("js/auth.js", "r") as f:
    content = f.read()

# Make sure booking.html is not public...
# The publicPaths are: ['/index.html', '/', '/sign in beta.html', '/donate.html']
# booking.html requires authentication. This is correct as per instructions.
