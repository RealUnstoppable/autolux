/**
 * AUTOLUX Detailing - Client Onboarding & Conversion Funnel Logic
 *
 * Implements the full client onboarding funnel:
 * - Step 1: Vehicle Details, Year/Make/Model/Color & Vehicle Type Classification
 * - Step 2: Wash & Detailing Package Selection with Luxury Add-Ons
 * - Step 3: Detailing Frequency (One-time, Bi-weekly, Monthly Detailing Club, Quarterly)
 * - Step 4: Mobile Service Address & Preferred Arrival Window
 * - Step 5: Client Contact Details & Vehicle Notes
 * - Step 6: Account Creation vs Guest Client Storage (Name + No Email)
 */

import { decodeVinWithNhtsa, isValidVin } from './signup_wizard.js';

export { decodeVinWithNhtsa, isValidVin };

export const VEHICLE_TYPES = {
    sedan: {
        id: 'sedan',
        label: 'Sedan / Coupe',
        icon: '🏎️',
        defaultPackage: 'Luxury Sedan - $150',
        description: 'Standard luxury coupes, sports cars, and sedans'
    },
    suv: {
        id: 'suv',
        label: 'SUV / Crossover',
        icon: '🚙',
        defaultPackage: 'Luxury SUV - $250',
        description: 'Mid-size & full-size luxury SUVs and crossovers'
    },
    truck: {
        id: 'truck',
        label: 'Truck / Pickup',
        icon: '🛻',
        defaultPackage: 'Premium Truck - $280',
        description: 'Full-size pickups, lifted trucks, and heavy-duty utility'
    },
    van: {
        id: 'van',
        label: 'Sprinter / Van',
        icon: '🚐',
        defaultPackage: 'Sprinter Van - $400',
        description: 'Executive passenger vans, Mercedes Sprinters, and commercial fleet'
    },
    exotic: {
        id: 'exotic',
        label: 'Exotic / Supercar',
        icon: '⚡',
        defaultPackage: 'Ceramic Coating (3 to 7 Year Warranty) - $850',
        description: 'Hypercars, track weapons, and ultra-luxury collector vehicles'
    }
};

export const WASH_PACKAGES = [
    {
        id: 'exterior_concierge',
        value: 'Signature Exterior Concierge Detail - $125',
        name: 'Signature Exterior Concierge',
        price: 125,
        badge: 'Express Shine',
        desc: 'Two-bucket safe hand wash, pH-neutral safe foam, wheel iron decontamination, tire satin dressing, and ceramic spray seal.'
    },
    {
        id: 'luxury_sedan',
        value: 'Luxury Sedan - $150',
        name: 'Luxury Sedan Detailing',
        price: 150,
        badge: 'Popular for Sedans',
        desc: 'Complete interior vacuum, dash/console wipe-down, glass cleaning, snow foam hand wash, rim detail & ceramic shine.'
    },
    {
        id: 'interior_restore',
        value: 'Complete Interior Detail & Restoration - $175',
        name: 'Complete Interior Detail & Restoration',
        price: 175,
        badge: 'Interior Deep Clean',
        desc: 'Deep steam extraction, leather deep cleanse & condition, pet hair removal, stain lift, UV protection & ozone odor elimination.'
    },
    {
        id: 'luxury_suv',
        value: 'Luxury SUV - $250',
        name: 'Luxury SUV Detailing',
        price: 250,
        badge: 'Popular for SUVs',
        desc: 'Heavy foam bath, wheel barrel scrub, three-row interior vacuum & steam cleanse, leather conditioning and hydrophobic paint sealant.'
    },
    {
        id: 'premium_truck',
        value: 'Premium Truck - $280',
        name: 'Premium Truck Detailing',
        price: 280,
        badge: 'Heavy-Duty',
        desc: 'Thorough mud/road grime chemical pre-rinse, wheel wells & rim decontam, full truck bed wash, and heavy interior restoration.'
    },
    {
        id: 'sprinter_van',
        value: 'Sprinter Van - $400',
        name: 'Executive Sprinter Van Detail',
        price: 400,
        badge: 'High-Roof Fleet',
        desc: 'Complete high-roof hand wash, multi-row interior steam extraction, captain chair leather therapy, and glass clarity coating.'
    },
    {
        id: 'ceramic_coating',
        value: 'Ceramic Coating (3 to 7 Year Warranty) - $850',
        name: 'Ceramic Coating System (3 to 7 Year)',
        price: 850,
        badge: 'Ultimate Protection',
        desc: 'Multi-stage paint decontamination, single-stage gloss enhancement, and 9H professional ceramic coating across bodywork and glass.'
    }
];

export const ONBOARDING_ADDONS = [
    {
        key: 'addon_engine_bay',
        name: 'Engine Bay Deep Clean & Dressing',
        price: 75,
        icon: '⚙️'
    },
    {
        key: 'addon_headlight_restoration',
        name: 'Headlight Ceramic Restoration',
        price: 95,
        icon: '💡'
    },
    {
        key: 'addon_ozone_odor',
        name: 'Ozone Odor & Allergen Elimination',
        price: 60,
        icon: '💨'
    },
    {
        key: 'addon_glass_coating',
        name: 'Glass Ceramic Hydrophobic Rain Shield',
        price: 80,
        icon: '🌧️'
    },
    {
        key: 'addon_leather_shield',
        name: 'Leather Shield Ceramic Conditioning',
        price: 150,
        icon: '🪑'
    }
];

export const FREQUENCIES = {
    one_time: {
        id: 'one_time',
        label: 'One-Time Service',
        interval: 'once',
        badge: 'Single Appointment',
        discountPercent: 0,
        description: 'Standard single mobile detail appointment with zero ongoing commitment.'
    },
    bi_weekly: {
        id: 'bi_weekly',
        label: 'Bi-Weekly Detailing',
        interval: 'bi-weekly',
        badge: 'Save 10% Every Visit',
        discountPercent: 10,
        description: 'Our mobile studio arrives every two weeks to keep your vehicle in spotless showroom condition.'
    },
    monthly_club: {
        id: 'monthly_club',
        label: 'AutoLux Detailing Club (Monthly)',
        interval: 'monthly',
        badge: '★ Best Value (15% Off)',
        discountPercent: 15,
        clubPrice: 129,
        description: '$129/mo VIP Club: Monthly detail included, 15% discount on all services & priority weekend scheduling.'
    },
    quarterly: {
        id: 'quarterly',
        label: 'Quarterly Seasonal Refresh',
        interval: 'quarterly',
        badge: 'Save 5%',
        discountPercent: 5,
        description: 'Every 3 months seasonal overhaul: paint decontamination, deep interior extraction, and sealant refresh.'
    }
};

/**
 * Calculates investment breakdown based on package, add-ons, and frequency
 */
export function calculateOnboardingInvestment({
    packagePrice = 150,
    addOnsTotal = 0,
    frequencyId = 'one_time'
}) {
    const pkgPriceNum = Number(packagePrice) || 0;
    const addOnsNum = Number(addOnsTotal) || 0;
    const freq = FREQUENCIES[frequencyId] || FREQUENCIES.one_time;

    let discount = 0;
    let basePrice = pkgPriceNum;

    if (freq.id === 'monthly_club') {
        // If club monthly, base is club rate or 15% discount on chosen package
        discount = Math.round(basePrice * 0.15);
    } else if (freq.discountPercent > 0) {
        discount = Math.round(basePrice * (freq.discountPercent / 100));
    }

    const subtotal = basePrice + addOnsNum;
    const finalTotal = Math.max(0, subtotal - discount);

    return {
        basePrice,
        addOnsTotal: addOnsNum,
        discountPercent: freq.discountPercent,
        discountAmount: discount,
        subtotal,
        finalTotal,
        frequencyLabel: freq.label
    };
}

/**
 * Validates Step 1: Vehicle & Vehicle Type
 */
export function validateVehicleStep(data = {}) {
    const errors = {};
    const year = (data.year || '').toString().trim();
    const make = (data.make || '').trim();
    const model = (data.model || '').trim();
    const color = (data.color || '').trim();
    const type = (data.vehicleType || '').trim();

    const currentYear = new Date().getFullYear();
    const numYear = parseInt(year, 10);

    if (!year) {
        errors.year = 'Vehicle year is required.';
    } else if (isNaN(numYear) || numYear < 1920 || numYear > currentYear + 2) {
        errors.year = `Please enter a valid model year (1920-${currentYear + 1}).`;
    }

    if (!make) {
        errors.make = 'Vehicle make is required (e.g. Porsche, BMW, Ford).';
    }

    if (!model) {
        errors.model = 'Vehicle model is required (e.g. 911 GT3, M4, F-150).';
    }

    if (!color) {
        errors.color = 'Vehicle color is required.';
    }

    if (!type || !VEHICLE_TYPES[type]) {
        errors.vehicleType = 'Please select your vehicle category.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates Step 2: Wash / Service Package
 */
export function validateServiceStep(data = {}) {
    const errors = {};
    const selectedPackage = (data.washPackage || '').trim();

    if (!selectedPackage) {
        errors.washPackage = 'Please select a detailing package.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates Step 3: Frequency
 */
export function validateFrequencyStep(data = {}) {
    const errors = {};
    const frequency = (data.frequency || '').trim();

    if (!frequency || !FREQUENCIES[frequency]) {
        errors.frequency = 'Please choose how regularly you would like your vehicle detailed.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates Step 4: Service Address & Location
 */
export function validateAddressStep(data = {}) {
    const errors = {};
    const address = (data.address || '').trim();
    const city = (data.city || '').trim();
    const zip = (data.zip || '').trim();

    if (!address) {
        errors.address = 'Service street address is required for our mobile studio to arrive.';
    }

    if (!city) {
        errors.city = 'City is required (e.g. Buford, Suwanee, Atlanta).';
    }

    if (!zip) {
        errors.zip = 'ZIP code is required.';
    } else if (!/^\d{5}(-\d{4})?$/.test(zip)) {
        errors.zip = 'Please enter a valid 5-digit ZIP code.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates Step 5: Contact Info
 */
export function validateContactStep(data = {}) {
    const errors = {};
    const name = (data.name || '').trim();
    const phone = (data.phone || '').trim();
    const phoneDigits = phone.replace(/\D/g, '');

    if (!name) {
        errors.name = 'Your full name is required.';
    }

    if (!phone) {
        errors.phone = 'Phone number is required for dispatch arrival SMS.';
    } else if (phoneDigits.length < 10) {
        errors.phone = 'Please enter a valid 10-digit phone number.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates Step 6: Account Creation (if user chooses to create an account)
 */
export function validateAccountCreationStep(data = {}, isCreatingAccount = true) {
    if (!isCreatingAccount) {
        // Guest mode: no email or password needed!
        return { isValid: true, errors: {} };
    }

    const errors = {};
    const email = (data.email || '').trim();
    const password = data.password || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        errors.email = 'Email address is required to create your account.';
    } else if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
        errors.password = 'Password is required.';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Formats full user payload for storing in Firestore `users/{userId}`.
 * Supports both standard registered accounts AND guest clients with their name and no email.
 *
 * @param {Object} params
 * @returns {Object}
 */
export function formatOnboardingUserPayload({
    uid,
    name,
    email = null,
    phone,
    vehicleData = {},
    serviceData = {},
    frequencyData = {},
    addressData = {},
    isGuest = false,
    referralCode = null
}) {
    if (!uid) {
        throw new Error('uid is required to construct client profile payload.');
    }

    const cleanName = (name || '').trim() || 'Valued Client';
    const cleanEmail = email ? email.trim() : null; // explicitly null if guest!
    const cleanPhone = (phone || '').trim();

    const vYear = (vehicleData.year || '').toString().trim();
    const vMake = (vehicleData.make || '').trim();
    const vModel = (vehicleData.model || '').trim();
    const vColor = (vehicleData.color || '').trim();
    const vType = (vehicleData.vehicleType || 'sedan').trim();

    let vehicleSummary = '';
    if (vYear || vMake || vModel) {
        vehicleSummary = `${vYear} ${vMake} ${vModel}`.trim();
        if (vColor) vehicleSummary += ` (${vColor})`;
    }

    const vehicles = vehicleSummary ? [vehicleSummary] : [];

    const fullStreet = (addressData.address || '').trim();
    const fullCity = (addressData.city || '').trim();
    const fullState = (addressData.state || 'GA').trim();
    const fullZip = (addressData.zip || '').trim();
    const formattedAddress = [fullStreet, fullCity, fullState, fullZip].filter(Boolean).join(', ');

    const glyph = addressData.glyph || '🏠';
    const glyphLabel = addressData.glyphLabel || 'Home';

    const addresses = formattedAddress ? [
        {
            label: `${glyph} ${glyphLabel}`,
            address: formattedAddress,
            street: fullStreet,
            city: fullCity,
            state: fullState,
            zip: fullZip,
            gateCode: (addressData.gateCode || '').trim() || null
        }
    ] : [];

    const garageItem = vehicleSummary ? [
        {
            year: vYear,
            make: vMake,
            model: vModel,
            color: vColor,
            vehicleType: vType,
            vin: (vehicleData.vin || '').trim() || null,
            parkingEnvironment: vehicleData.parkingEnvironment || 'Garage Kept',
            notes: (vehicleData.notes || '').trim() || ''
        }
    ] : [];

    const generatedRefCode = referralCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    const freqKey = frequencyData.frequency || 'one_time';
    const isClub = freqKey === 'monthly_club';

    return {
        uid: uid,
        name: cleanName,
        username: cleanName,
        email: cleanEmail, // if guest: null!
        phone: cleanPhone,
        contactInfo: {
            phone: cleanPhone
        },
        isGuest: Boolean(isGuest),
        isAnonymous: Boolean(isGuest),
        primaryAddress: formattedAddress,
        addresses: addresses,
        vehicles: vehicles,
        garage: garageItem,
        membershipLevel: isClub ? 'club' : 'free',
        loyaltyPoints: isGuest ? 0 : 100, // 100 welcome bonus for registered accounts
        bonusAwarded: !isGuest,
        sweepstakesEntries: 0,
        isAdmin: false,
        isBanned: false,
        referralCode: generatedRefCode,
        referralCredits: 0,
        onboardingProfile: {
            vehicleSummary,
            vehicleType: vType,
            washPackage: serviceData.washPackage || '',
            addOns: serviceData.addOns || [],
            frequency: freqKey,
            frequencyLabel: FREQUENCIES[freqKey]?.label || 'One-Time',
            preferredWindow: addressData.preferredWindow || 'Morning (8am-12pm)',
            specialNotes: (serviceData.notes || '').trim() || '',
            completedAt: new Date().toISOString()
        }
    };
}

/**
 * Formats a booking document for Firestore `bookings` or `detailingPlans` collection
 */
export function formatOnboardingBookingPayload({
    userId,
    customerName,
    customerEmail = '',
    customerPhone,
    vehicleSummary,
    servicePackage,
    addOns = [],
    frequency = 'one_time',
    address,
    preferredDate = '',
    preferredWindow = 'Morning (8am-12pm)',
    notes = '',
    totalAmount = 0
}) {
    return {
        userId,
        customerName: (customerName || '').trim(),
        customerEmail: customerEmail || '',
        customerPhone: (customerPhone || '').trim(),
        package: servicePackage,
        service: servicePackage,
        vehicle: vehicleSummary,
        address,
        frequency,
        addOns,
        totalAmount,
        notes: [
            preferredWindow ? `Preferred Window: ${preferredWindow}` : '',
            frequency ? `Frequency: ${FREQUENCIES[frequency]?.label || frequency}` : '',
            notes ? `Client Notes: ${notes}` : ''
        ].filter(Boolean).join(' | '),
        status: 'pending'
    };
}

// Local Storage Draft Persistence
const ONBOARDING_DRAFT_KEY = 'autolux_onboarding_draft';

export function saveOnboardingDraft(draft) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        window.localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
        console.warn('Could not save onboarding draft:', e);
    }
}

export function getOnboardingDraft() {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
        const item = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.warn('Could not read onboarding draft:', e);
        return null;
    }
}

export function clearOnboardingDraft() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
    } catch (e) {
        console.warn('Could not clear onboarding draft:', e);
    }
}
