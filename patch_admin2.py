import re

with open("admin.html", "r") as f:
    content = f.read()

content = content.replace(
    '        import { doc, getDoc, collection, getDocs, Timestamp, updateDoc, deleteDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";',
    '        import { doc, getDoc, collection, getDocs, Timestamp, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";'
)

with open("admin.html", "w") as f:
    f.write(content)

with open("test_script.js", "r") as f:
    content = f.read()

content = content.replace(
    'import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, where, getDoc, addDoc, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";',
    'import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, where, getDoc, addDoc, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";'
)
# Fix test_script.js imports if needed. Let's just check the top of test_script.js first.
