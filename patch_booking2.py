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
    '                <div class="input-group">\n                    <label for="notes">Special Requests or Notes (Optional)</label>\n                    <textarea id="notes" rows="3" placeholder="Tell us about specific spots, pet hair, or ceramic requests..."></textarea>\n                </div>',
    new_input + '\n                <div class="input-group">\n                    <label for="notes">Special Requests or Notes (Optional)</label>\n                    <textarea id="notes" rows="3" placeholder="Tell us about specific spots, pet hair, or ceramic requests..."></textarea>\n                </div>'
)

with open("booking.html", "w") as f:
    f.write(content)
