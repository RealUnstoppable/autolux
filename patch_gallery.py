import os

filename = "index.html"
with open(filename, 'r') as f:
    content = f.read()

# Wait, index.html already has loading="lazy" decoding="async" width="600" height="400".
# Let me look closely at index-old.html.
