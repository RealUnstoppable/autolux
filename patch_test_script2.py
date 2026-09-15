import re

with open("test_script.js", "r") as f:
    content = f.read()

content = content.replace(
    '        import { doc, getDoc, collection, getDocs, Timestamp, updateDoc, deleteDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";',
    '        import { doc, getDoc, collection, getDocs, Timestamp, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";'
)

with open("test_script.js", "w") as f:
    f.write(content)
