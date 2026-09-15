import re

with open("js/auth.js", "r") as f:
    content = f.read()

# Add getDocs, query, where to firestore imports
content = content.replace(
    'import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";',
    'import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";'
)

new_func = """
/**
 * Validates a referral code by checking if it belongs to an existing user.
 * @param {string} code - The referral code to validate.
 * @returns {Promise<Object|null>} - Returns the user object if valid, or null.
 */
export async function validateReferralCode(code) {
    if (!code || typeof code !== 'string') return null;
    try {
        const q = query(collection(db, "users"), where("referralCode", "==", code.trim().toUpperCase()));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
        return null;
    } catch (e) {
        console.error("Error validating referral code:", e);
        return null;
    }
}
"""

content += new_func

with open("js/auth.js", "w") as f:
    f.write(content)
