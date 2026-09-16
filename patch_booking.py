import re

with open("booking.html", "r") as f:
    content = f.read()

new_input = """                <div class="input-group">
                    <label for="referral-code">Referral Code <span style="color: var(--text-muted); font-weight: 400;">(Optional)</span></label>
                    <input type="text" id="referral-code" placeholder="e.g. A1B2C3" style="text-transform: uppercase;">
                    <p id="referral-msg" style="font-size: 0.85rem; margin-top: 5px; font-weight: 600;"></p>
                </div>
                """

content = content.replace(
    '                <div class="input-group">\n                    <label for="notes">Additional Notes</label>\n                    <textarea id="notes" rows="3" placeholder="Any specific areas of concern?"></textarea>\n                </div>',
    new_input + '                <div class="input-group">\n                    <label for="notes">Additional Notes</label>\n                    <textarea id="notes" rows="3" placeholder="Any specific areas of concern?"></textarea>\n                </div>'
)

# Also import validateReferralCode in booking.html
content = content.replace(
    "import { auth, db, getAuthStatePromise } from './js/auth.js';",
    "import { auth, db, getAuthStatePromise, validateReferralCode } from './js/auth.js';"
)

with open("booking.html", "w") as f:
    f.write(content)
