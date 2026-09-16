import re

with open("booking.html", "r") as f:
    content = f.read()

search_form_submit = """        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return;

            const selectedPackage = packageSelect.value;
            const vehicle = document.getElementById('vehicle').value.trim();
            const appointmentDate = document.getElementById('date').value;
            const notes = document.getElementById('notes').value.trim();

            if (!selectedPackage || !vehicle || !appointmentDate) {
                msgEl.style.color = "var(--error)";
                msgEl.textContent = "Please fill in all required fields.";
                return;
            }

            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
            submitBtn.textContent = 'Submitting Request...';
            msgEl.textContent = '';

            try {
                // Determine membership intent"""

replace_form_submit = """        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return;

            const selectedPackage = packageSelect.value;
            const vehicle = document.getElementById('vehicle').value.trim();
            const appointmentDate = document.getElementById('date').value;
            const notes = document.getElementById('notes').value.trim();
            const referralCode = document.getElementById('referral-code').value.trim();
            const referralMsg = document.getElementById('referral-msg');

            if (referralMsg) referralMsg.textContent = '';

            if (!selectedPackage || !vehicle || !appointmentDate) {
                msgEl.style.color = "var(--error)";
                msgEl.textContent = "Please fill in all required fields.";
                return;
            }

            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
            submitBtn.textContent = 'Validating...';
            msgEl.textContent = '';

            if (referralCode) {
                const referrer = await validateReferralCode(referralCode);
                if (!referrer) {
                    if (referralMsg) {
                        referralMsg.style.color = "var(--error)";
                        referralMsg.textContent = "Invalid referral code.";
                    }
                    submitBtn.disabled = false;
                    submitBtn.removeAttribute('aria-busy');
                    submitBtn.textContent = 'Submit Booking Request';
                    return;
                } else if (referrer.uid === currentUser.uid) {
                    if (referralMsg) {
                        referralMsg.style.color = "var(--error)";
                        referralMsg.textContent = "You cannot use your own referral code.";
                    }
                    submitBtn.disabled = false;
                    submitBtn.removeAttribute('aria-busy');
                    submitBtn.textContent = 'Submit Booking Request';
                    return;
                } else {
                    if (referralMsg) {
                        referralMsg.style.color = "#16A34A";
                        referralMsg.textContent = "Referral code applied successfully!";
                    }
                }
            }

            submitBtn.textContent = 'Submitting Request...';

            try {
                // Determine membership intent"""

content = content.replace(search_form_submit, replace_form_submit)

search_data = """                const bookingData = {
                    package: selectedPackage,
                    vehicle: vehicle,
                    appointmentDate: appointmentDate,
                    notes: notes,
                    customerName: userData.name || currentUser.displayName || "Unknown",
                    customerPhone: userData.contactInfo?.phone || "N/A",
                    customerEmail: currentUser.email,
                    isClubPlan: isClubPlan
                };

                const result = await submitDetailingRequest(bookingData);"""

replace_data = """                const bookingData = {
                    package: selectedPackage,
                    vehicle: vehicle,
                    appointmentDate: appointmentDate,
                    notes: notes,
                    customerName: userData.name || currentUser.displayName || "Unknown",
                    customerPhone: userData.contactInfo?.phone || "N/A",
                    customerEmail: currentUser.email,
                    isClubPlan: isClubPlan
                };

                if (referralCode) {
                    bookingData.referralCode = referralCode;
                }

                const result = await submitDetailingRequest(bookingData);"""

content = content.replace(search_data, replace_data)

with open("booking.html", "w") as f:
    f.write(content)
