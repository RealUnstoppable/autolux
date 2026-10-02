import re

with open("booking.html", "r") as f:
    content = f.read()

if "window.ENV?.FIREBASE_API_KEY" in content:
    print("Found fallback in booking.html")
else:
    print("No fallback found in booking.html")
