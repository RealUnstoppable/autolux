import re

with open("account.html", "r") as f:
    content = f.read()

new_card = """
                <div class="card">
                    <h2>Refer & Earn</h2>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 15px;">
                        Share your unique referral code with friends. They get a premium wash, and you earn rewards!
                    </p>
                    <div style="margin-bottom: 15px;">
                        <p style="margin: 0 0 5px 0; font-size: 0.85rem; color: var(--text-muted);">Your Referral Code:</p>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="user-referral-code" readonly style="flex-grow: 1; padding: 10px; background: var(--bg-dark); border: 1px solid var(--border); color: var(--gold); border-radius: 6px; font-weight: bold; text-align: center;" value="Loading...">
                            <button class="btn-schedule" id="copy-referral-btn" style="border: none; cursor: pointer;">Copy</button>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(212, 175, 55, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3);">
                        <span style="font-weight: 600; color: var(--gold);">Earned Credits:</span>
                        <span id="user-referral-credits" style="font-size: 1.2rem; font-weight: 800; color: var(--text-main);">$0</span>
                    </div>
                </div>
"""

content = content.replace(
    '                    <a href="booking.html?package=club" class="btn-schedule" style="background: var(--gold); color: black; width: 100%; text-align: center;">Join AutoLux Club</a>\n                </div>\n            </div>',
    '                    <a href="booking.html?package=club" class="btn-schedule" style="background: var(--gold); color: black; width: 100%; text-align: center;">Join AutoLux Club</a>\n                </div>\n' + new_card + '            </div>'
)

js_injection = """
                userNameEl.textContent = userData?.name || user.displayName || 'Valued Client';
                userEmailEl.textContent = user.email;

                // Set referral data
                const referralCodeEl = document.getElementById('user-referral-code');
                const referralCreditsEl = document.getElementById('user-referral-credits');
                if (referralCodeEl && userData?.referralCode) {
                    referralCodeEl.value = userData.referralCode;
                }
                if (referralCreditsEl && userData?.referralCredits !== undefined) {
                    referralCreditsEl.textContent = `$${userData.referralCredits}`;
                }
"""

content = content.replace(
    "                userNameEl.textContent = userData?.name || user.displayName || 'Valued Client';\n                userEmailEl.textContent = user.email;",
    js_injection
)

with open("account.html", "w") as f:
    f.write(content)
