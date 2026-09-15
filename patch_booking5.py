import re

with open("booking.html", "r") as f:
    content = f.read()

content = content.replace(
    '        import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";',
    '        import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";\n        import { submitDetailingRequest } from \'./js/api.js\';'
)

with open("booking.html", "w") as f:
    f.write(content)
