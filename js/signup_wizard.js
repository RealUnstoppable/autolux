/**
 * AUTOLUX Detailing - Expanded Multi-Step Registration Wizard Helper
 * Implements NHTSA VIN auto-decoding, PCI-DSS compliant card tokenization,
 * step validation, and Firestore user payload construction with 100 Loyalty Points.
 */

/**
 * Validates a VIN string format (typically 17 alphanumeric chars, excluding I, O, Q)
 * @param {string} vin
 * @returns {boolean}
 */
export function isValidVin(vin) {
    if (!vin || typeof vin !== 'string') return false;
    const clean = vin.trim().toUpperCase();
    return /^[A-HJ-NPR-Z0-9]{11,17}$/.test(clean);
}

/**
 * Queries the official NHTSA VPIC API to decode Year, Make, and Model from a VIN.
 * Free, public, no API key required.
 * @param {string} vin
 * @param {Function} [fetchFn=fetch]
 * @returns {Promise<{success: boolean, year?: string, make?: string, model?: string, error?: string}>}
 */
export async function decodeVinWithNhtsa(vin, fetchFn = (typeof fetch !== 'undefined' ? fetch : null)) {
    if (!vin || typeof vin !== 'string') {
        return { success: false, error: 'Please enter a valid VIN.' };
    }
    const cleanVin = vin.trim().toUpperCase();
    if (cleanVin.length < 11) {
        return { success: false, error: 'VIN must be at least 11 characters (17 characters for modern vehicles).' };
    }

    if (!fetchFn) {
        return { success: false, error: 'Network fetch is unavailable in this environment.' };
    }

    try {
        const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(cleanVin)}?format=json`;
        const res = await fetchFn(url);
        if (!res.ok) {
            return { success: false, error: `NHTSA API error: HTTP ${res.status}` };
        }
        const data = await res.json();
        const result = (data && data.Results && data.Results[0]) ? data.Results[0] : null;

        if (!result) {
            return { success: false, error: 'No vehicle data found for this VIN.' };
        }

        const year = (result.ModelYear || '').trim();
        const make = (result.Make || '').trim();
        const model = (result.Model || '').trim();

        if (!make && !model && !year) {
            return { success: false, error: 'Vehicle details could not be resolved from this VIN.' };
        }

        return {
            success: true,
            year: year || '',
            make: make || '',
            model: model || '',
            bodyClass: (result.BodyClass || '').trim(),
            driveType: (result.DriveType || '').trim()
        };
    } catch (err) {
        return { success: false, error: err.message || 'Failed to connect to NHTSA VIN service.' };
    }
}

/**
 * Validates Step 1: Personal & Account Info
 * Required: name, email, password (>=6), phone, primary address
 * @param {Object} data
 * @returns {{isValid: boolean, errors: Object}}
 */
export function validateStep1(data = {}) {
    const errors = {};
    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const password = data.password || '';
    const phone = (data.phone || '').trim();
    const address = (data.address || '').trim();

    if (!name) {
        errors.name = 'Full name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
        errors.password = 'Password is required.';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone) {
        errors.phone = 'Phone number is required.';
    } else if (phoneDigits.length < 10) {
        errors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (!address) {
        errors.address = 'Primary service address is required.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates Step 2: Vehicle ("Add to Garage")
 * Required: year, make, model, color
 * @param {Object} data
 * @returns {{isValid: boolean, errors: Object}}
 */
export function validateStep2(data = {}) {
    const errors = {};
    const year = (data.year || '').toString().trim();
    const make = (data.make || '').trim();
    const model = (data.model || '').trim();
    const color = (data.color || '').trim();

    const currentYear = new Date().getFullYear();
    const numYear = parseInt(year, 10);
    if (!year) {
        errors.year = 'Vehicle year is required.';
    } else if (isNaN(numYear) || numYear < 1920 || numYear > currentYear + 2) {
        errors.year = `Please enter a valid model year (1920-${currentYear + 1}).`;
    }

    if (!make) {
        errors.make = 'Vehicle make is required.';
    }

    if (!model) {
        errors.model = 'Vehicle model is required.';
    }

    if (!color) {
        errors.color = 'Vehicle color is required.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Tokenizes card information for PCI-DSS compliance.
 * NEVER stores raw credit card number or CVC.
 * Returns a sanitized tokenized payment representation.
 * @param {Object} cardData
 * @returns {Object|null}
 */
export function tokenizePaymentMethod(cardData = {}) {
    const rawNumber = (cardData.cardNumber || '').toString().replace(/\D/g, '');
    if (!rawNumber) return null;

    if (rawNumber.length < 13 || rawNumber.length > 19) {
        throw new Error('Invalid card number length.');
    }

    // Determine brand
    let brand = 'visa';
    if (rawNumber.startsWith('4')) brand = 'visa';
    else if (/^(5[1-5]|2[2-7])/.test(rawNumber)) brand = 'mastercard';
    else if (/^3[47]/.test(rawNumber)) brand = 'amex';
    else if (/^6(?:011|5)/.test(rawNumber)) brand = 'discover';

    const last4 = rawNumber.slice(-4);

    let expMonth = 12;
    let expYear = new Date().getFullYear() + 2;
    if (cardData.expiry) {
        const parts = cardData.expiry.split('/');
        if (parts.length === 2) {
            const m = parseInt(parts[0].trim(), 10);
            let y = parseInt(parts[1].trim(), 10);
            if (!isNaN(m) && m >= 1 && m <= 12) expMonth = m;
            if (!isNaN(y)) {
                if (y < 100) y += 2000;
                expYear = y;
            }
        }
    }

    // Generate safe mock SetupIntent/PaymentMethod token ID
    const randomHex = Math.random().toString(36).substring(2, 10);
    const tokenId = `pm_mock_${brand}_${last4}_${randomHex}`;

    // STRICT PCI-DSS RULE: NEVER return raw card number or CVC!
    return {
        id: tokenId,
        type: 'card',
        brand: brand,
        last4: last4,
        expMonth: expMonth,
        expYear: expYear,
        zip: (cardData.zip || '').trim(),
        tokenized: true,
        createdAt: new Date().toISOString()
    };
}

/**
 * Formats full registration payload for Firestore users collection.
 * Enforces 100 Loyalty Points welcome bonus, vehicle garage registration, and address labeling.
 * @param {Object} params
 * @returns {Object}
 */
export function formatRegistrationUserData({
    uid,
    email,
    personal = {},
    vehicle = {},
    payment = null,
    referralCode = null
}) {
    if (!uid || !email) {
        throw new Error('uid and email are mandatory for user registration payload.');
    }

    const generatedRefCode = referralCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    const phone = (personal.phone || '').trim();
    const name = (personal.name || '').trim() || 'Anonymous User';
    const address = (personal.address || '').trim();
    const glyph = personal.addressGlyph || '🏠';
    const glyphLabel = personal.addressLabel || 'Home';

    // Format vehicle summary string: e.g. "2024 Porsche 911 GT3 (Chalk)"
    const vYear = (vehicle.year || '').toString().trim();
    const vMake = (vehicle.make || '').trim();
    const vModel = (vehicle.model || '').trim();
    const vColor = (vehicle.color || '').trim();

    let vehicleSummary = '';
    if (vYear || vMake || vModel) {
        vehicleSummary = `${vYear} ${vMake} ${vModel}`.trim();
        if (vColor) vehicleSummary += ` (${vColor})`;
    }

    const vehicles = vehicleSummary ? [vehicleSummary] : [];

    const addresses = address ? [
        {
            label: `${glyph} ${glyphLabel}`,
            address: address
        }
    ] : [];

    const garageItem = vehicleSummary ? [
        {
            year: vYear,
            make: vMake,
            model: vModel,
            color: vColor,
            vin: (vehicle.vin || '').trim() || null,
            parkingEnvironment: vehicle.parkingEnvironment || 'Garage Kept',
            windowTint: vehicle.windowTint || 'No Tint',
            modifications: (vehicle.modifications || '').trim() || ''
        }
    ] : [];

    return {
        uid: uid,
        email: email,
        name: name,
        username: name,
        phone: phone,
        contactInfo: {
            phone: phone
        },
        age: personal.age ? (parseInt(personal.age, 10) || personal.age) : null,
        gender: personal.gender || null,
        primaryAddress: address,
        addresses: addresses,
        vehicles: vehicles,
        garage: garageItem,
        paymentSetup: payment ? payment : { status: 'card_later' },
        loyaltyPoints: 100, // MANDATORY 100 points welcome bonus
        bonusAwarded: true,
        sweepstakesEntries: 0,
        membershipLevel: 'free',
        isAdmin: false,
        isBanned: false,
        referralCode: generatedRefCode,
        referralCredits: 0
    };
}
