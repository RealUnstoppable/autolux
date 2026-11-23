import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import {
    VEHICLE_TYPES,
    WASH_PACKAGES,
    FREQUENCIES,
    calculateOnboardingInvestment,
    validateVehicleStep,
    validateServiceStep,
    validateFrequencyStep,
    validateAddressStep,
    validateContactStep,
    validateAccountCreationStep,
    formatOnboardingUserPayload,
    formatOnboardingBookingPayload
} from '../js/onboarding.js';

describe('Client Onboarding & Conversion Funnel Verification', () => {

    const onboardingHtml = fs.readFileSync(path.join(process.cwd(), 'onboarding.html'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    const bookingHtml = fs.readFileSync(path.join(process.cwd(), 'booking.html'), 'utf8');
    const signinHtml = fs.readFileSync(path.join(process.cwd(), 'sign in beta.html'), 'utf8');

    // =========================================================================
    // 1. Homepage & Sitewide Inbound CTAs
    // =========================================================================
    test('Homepage contains prominent hero CTA directing visitors into the onboarding funnel', () => {
        expect(indexHtml).toContain('id="hero-onboarding-cta"');
        expect(indexHtml).toContain('href="onboarding.html"');
        expect(indexHtml).toContain('Start Onboarding');
        expect(indexHtml).toContain('Select Vehicle &amp; Class');
        expect(indexHtml).toContain('60-Sec Client Onboarding');
    });

    test('Booking and Sign In pages link seamlessly into the client onboarding funnel', () => {
        // booking.html
        expect(bookingHtml).toContain('href="onboarding.html"');
        expect(bookingHtml).toContain('60-Second Client Onboarding Funnel');
        expect(bookingHtml).toContain("window.location.replace('onboarding.html'");

        // sign in beta.html
        expect(signinHtml).toContain('href="onboarding.html"');
        expect(signinHtml).toContain('Start Client Onboarding (Guest Option Available)');
    });

    // =========================================================================
    // 2. Onboarding Page Structure & Visual Progress
    // =========================================================================
    test('onboarding.html contains the full 6-step progress track and panels', () => {
        expect(onboardingHtml).toContain('id="funnel-progress-fill"');
        expect(onboardingHtml).toContain('id="node-1"');
        expect(onboardingHtml).toContain('id="node-2"');
        expect(onboardingHtml).toContain('id="node-3"');
        expect(onboardingHtml).toContain('id="node-4"');
        expect(onboardingHtml).toContain('id="node-5"');
        expect(onboardingHtml).toContain('id="node-6"');

        // Step 1: Vehicle & Classification
        expect(onboardingHtml).toContain('id="step-1"');
        expect(onboardingHtml).toContain('id="vehicle-year"');
        expect(onboardingHtml).toContain('id="vehicle-make"');
        expect(onboardingHtml).toContain('id="vehicle-model"');
        expect(onboardingHtml).toContain('id="vehicle-color"');
        expect(onboardingHtml).toContain('id="vehicle-type-cards"');
        expect(onboardingHtml).toContain('data-type="sedan"');
        expect(onboardingHtml).toContain('data-type="suv"');
        expect(onboardingHtml).toContain('data-type="truck"');
        expect(onboardingHtml).toContain('data-type="van"');
        expect(onboardingHtml).toContain('data-type="exotic"');
        expect(onboardingHtml).toContain('id="vin-decode-btn"');

        // Step 2: Wash Packages & Add-ons
        expect(onboardingHtml).toContain('id="step-2"');
        expect(onboardingHtml).toContain('id="packages-cards-grid"');
        expect(onboardingHtml).toContain('Signature Exterior Concierge Detail - $125');
        expect(onboardingHtml).toContain('Luxury Sedan - $150');
        expect(onboardingHtml).toContain('Complete Interior Detail & Restoration - $175');
        expect(onboardingHtml).toContain('Luxury SUV - $250');
        expect(onboardingHtml).toContain('Premium Truck - $280');
        expect(onboardingHtml).toContain('Sprinter Van - $400');
        expect(onboardingHtml).toContain('Ceramic Coating (3 to 7 Year Warranty) - $850');
        expect(onboardingHtml).toContain('data-key="addon_engine_bay"');
        expect(onboardingHtml).toContain('data-key="addon_headlight_restoration"');
        expect(onboardingHtml).toContain('data-key="addon_ozone_odor"');
        expect(onboardingHtml).toContain('data-key="addon_glass_coating"');
        expect(onboardingHtml).toContain('data-key="addon_leather_shield"');

        // Step 3: Frequency
        expect(onboardingHtml).toContain('id="step-3"');
        expect(onboardingHtml).toContain('data-freq="one_time"');
        expect(onboardingHtml).toContain('data-freq="bi_weekly"');
        expect(onboardingHtml).toContain('data-freq="monthly_club"');
        expect(onboardingHtml).toContain('data-freq="quarterly"');
        expect(onboardingHtml).toContain('id="club-perks-callout"');

        // Step 4: Service Address & Location
        expect(onboardingHtml).toContain('id="step-4"');
        expect(onboardingHtml).toContain('id="service-address"');
        expect(onboardingHtml).toContain('id="service-city"');
        expect(onboardingHtml).toContain('id="service-state"');
        expect(onboardingHtml).toContain('id="service-zip"');
        expect(onboardingHtml).toContain('id="address-type-chips"');
        expect(onboardingHtml).toContain('id="preferred-window"');

        // Step 5: Contact
        expect(onboardingHtml).toContain('id="step-5"');
        expect(onboardingHtml).toContain('id="client-name"');
        expect(onboardingHtml).toContain('id="client-phone"');
        expect(onboardingHtml).toContain('id="client-notes"');

        // Step 6: Confirmation & Account Choices
        expect(onboardingHtml).toContain('id="step-6"');
        expect(onboardingHtml).toContain('id="create-account-box"');
        expect(onboardingHtml).toContain('id="btn-create-account-complete"');
        expect(onboardingHtml).toContain('id="guest-account-box"');
        expect(onboardingHtml).toContain('id="btn-guest-complete"');
        expect(onboardingHtml).toContain('Continue as Guest Client');
        expect(onboardingHtml).toContain('id="confirmation-view"');
    });

    test('onboarding.html adheres to standard brand navigation, footer, and JSON-LD schema', () => {
        expect(onboardingHtml).toContain('site-navbar');
        expect(onboardingHtml).toContain('nav-items-wrapper');
        expect(onboardingHtml).toContain('nav-gold-underline');
        expect(onboardingHtml).toContain('(404) 542-2712');
        expect(onboardingHtml).toContain('coiner.double0y@icloud.com');
        expect(onboardingHtml).toContain('Buford, GA & 30-Mile Vicinity');
        expect(onboardingHtml).toContain('https://www.tiktok.com/@autoluxdetailing');
        expect(onboardingHtml).toContain('"@type": ["AutoWash", "LocalBusiness"]');
    });

    // =========================================================================
    // 3. Investment Calculation & Frequency Discounts
    // =========================================================================
    test('calculateOnboardingInvestment computes correct totals and discounts', () => {
        // One-time service: no discount
        const single = calculateOnboardingInvestment({
            packagePrice: 150,
            addOnsTotal: 75,
            frequencyId: 'one_time'
        });
        expect(single.basePrice).toBe(150);
        expect(single.addOnsTotal).toBe(75);
        expect(single.discountAmount).toBe(0);
        expect(single.finalTotal).toBe(225);

        // Bi-weekly service: 10% discount on package
        const biweekly = calculateOnboardingInvestment({
            packagePrice: 200,
            addOnsTotal: 50,
            frequencyId: 'bi_weekly'
        });
        expect(biweekly.discountPercent).toBe(10);
        expect(biweekly.discountAmount).toBe(20);
        expect(biweekly.finalTotal).toBe(230); // 200 + 50 - 20

        // Monthly Detailing Club: 15% discount
        const club = calculateOnboardingInvestment({
            packagePrice: 250,
            addOnsTotal: 0,
            frequencyId: 'monthly_club'
        });
        expect(club.discountPercent).toBe(15);
        expect(club.discountAmount).toBe(38); // Math.round(250 * 0.15)
        expect(club.finalTotal).toBe(212); // 250 - 38

        // Quarterly: 5% discount
        const quarterly = calculateOnboardingInvestment({
            packagePrice: 100,
            addOnsTotal: 60,
            frequencyId: 'quarterly'
        });
        expect(quarterly.discountPercent).toBe(5);
        expect(quarterly.discountAmount).toBe(5);
        expect(quarterly.finalTotal).toBe(155);
    });

    // =========================================================================
    // 4. Step Validations
    // =========================================================================
    test('validateVehicleStep enforces vehicle fields and valid year', () => {
        const invalid = validateVehicleStep({});
        expect(invalid.isValid).toBe(false);
        expect(invalid.errors.year).toBeDefined();
        expect(invalid.errors.make).toBeDefined();
        expect(invalid.errors.model).toBeDefined();
        expect(invalid.errors.color).toBeDefined();
        expect(invalid.errors.vehicleType).toBeDefined();

        const valid = validateVehicleStep({
            year: '2024',
            make: 'Porsche',
            model: '911 GT3',
            color: 'Chalk',
            vehicleType: 'sedan'
        });
        expect(valid.isValid).toBe(true);
        expect(valid.errors).toEqual({});
    });

    test('validateServiceStep and validateFrequencyStep check valid selections', () => {
        expect(validateServiceStep({}).isValid).toBe(false);
        expect(validateServiceStep({ washPackage: 'Luxury Sedan - $150' }).isValid).toBe(true);

        expect(validateFrequencyStep({}).isValid).toBe(false);
        expect(validateFrequencyStep({ frequency: 'invalid_freq' }).isValid).toBe(false);
        expect(validateFrequencyStep({ frequency: 'monthly_club' }).isValid).toBe(true);
    });

    test('validateAddressStep and validateContactStep enforce address and 10-digit phone', () => {
        const addrInvalid = validateAddressStep({ address: '', city: '', zip: 'abc' });
        expect(addrInvalid.isValid).toBe(false);
        expect(addrInvalid.errors.address).toBeDefined();
        expect(addrInvalid.errors.city).toBeDefined();
        expect(addrInvalid.errors.zip).toBeDefined();

        const addrValid = validateAddressStep({
            address: '1000 Luxury Lane',
            city: 'Buford',
            zip: '30518'
        });
        expect(addrValid.isValid).toBe(true);

        const contactInvalid = validateContactStep({ name: '', phone: '123' });
        expect(contactInvalid.isValid).toBe(false);
        expect(contactInvalid.errors.name).toBeDefined();
        expect(contactInvalid.errors.phone).toBeDefined();

        const contactValid = validateContactStep({
            name: 'Sterling Archer',
            phone: '(404) 542-2712'
        });
        expect(contactValid.isValid).toBe(true);
    });

    test('validateAccountCreationStep supports both registered and guest mode', () => {
        // When creating an account: requires valid email and password >= 6
        const reqAcctInvalid = validateAccountCreationStep({ email: 'bad', password: '123' }, true);
        expect(reqAcctInvalid.isValid).toBe(false);
        expect(reqAcctInvalid.errors.email).toBeDefined();
        expect(reqAcctInvalid.errors.password).toBeDefined();

        const reqAcctValid = validateAccountCreationStep({
            email: 'client@autolux.com',
            password: 'secretPassword123'
        }, true);
        expect(reqAcctValid.isValid).toBe(true);

        // When guest client: NO email or password required!
        const guestResult = validateAccountCreationStep({}, false);
        expect(guestResult.isValid).toBe(true);
        expect(guestResult.errors).toEqual({});
    });

    // =========================================================================
    // 5. User Payload Construction: Registered VS Guest Client
    // =========================================================================
    test('formatOnboardingUserPayload generates complete registered user payload with 100 points', () => {
        const payload = formatOnboardingUserPayload({
            uid: 'user_reg_12345',
            name: 'Sterling Archer',
            email: 'sterling@isis.org',
            phone: '(404) 555-0199',
            vehicleData: {
                year: '2024',
                make: 'Porsche',
                model: '911 GT3',
                color: 'Chalk',
                vehicleType: 'sedan',
                parkingEnvironment: 'Garage Kept'
            },
            serviceData: {
                washPackage: 'Luxury Sedan - $150',
                addOns: [{ key: 'addon_engine_bay', price: 75 }]
            },
            frequencyData: {
                frequency: 'monthly_club'
            },
            addressData: {
                address: '1000 Luxury Lane',
                city: 'Buford',
                state: 'GA',
                zip: '30518',
                glyph: '🏠',
                glyphLabel: 'Home'
            },
            isGuest: false
        });

        expect(payload.uid).toBe('user_reg_12345');
        expect(payload.name).toBe('Sterling Archer');
        expect(payload.email).toBe('sterling@isis.org');
        expect(payload.phone).toBe('(404) 555-0199');
        expect(payload.isGuest).toBe(false);
        expect(payload.loyaltyPoints).toBe(100);
        expect(payload.bonusAwarded).toBe(true);
        expect(payload.membershipLevel).toBe('club');
        expect(payload.vehicles).toEqual(['2024 Porsche 911 GT3 (Chalk)']);
        expect(payload.primaryAddress).toBe('1000 Luxury Lane, Buford, GA, 30518');
        expect(payload.onboardingProfile.vehicleType).toBe('sedan');
        expect(payload.onboardingProfile.frequency).toBe('monthly_club');
    });

    test('formatOnboardingUserPayload stores guest client with name and NO email', () => {
        const guestPayload = formatOnboardingUserPayload({
            uid: 'guest_client_998877',
            name: 'Arthur Dent',
            email: null, // User chose NOT to make an account
            phone: '(404) 555-4242',
            vehicleData: {
                year: '2023',
                make: 'Ford',
                model: 'F-150 Lightning',
                color: 'Antimatter Blue',
                vehicleType: 'truck'
            },
            serviceData: {
                washPackage: 'Premium Truck - $280'
            },
            frequencyData: {
                frequency: 'bi_weekly'
            },
            addressData: {
                address: '42 Hitchhiker Rd',
                city: 'Buford',
                state: 'GA',
                zip: '30518'
            },
            isGuest: true
        });

        // Crucial User Request Invariant:
        // "if they choose not to make a account we will just store them as a user with their name and no email."
        expect(guestPayload.uid).toBe('guest_client_998877');
        expect(guestPayload.name).toBe('Arthur Dent');
        expect(guestPayload.username).toBe('Arthur Dent');
        expect(guestPayload.email).toBeNull();
        expect(guestPayload.phone).toBe('(404) 555-4242');
        expect(guestPayload.isGuest).toBe(true);
        expect(guestPayload.isAnonymous).toBe(true);
        expect(guestPayload.vehicles).toEqual(['2023 Ford F-150 Lightning (Antimatter Blue)']);
        expect(guestPayload.onboardingProfile.vehicleType).toBe('truck');
        expect(guestPayload.onboardingProfile.frequency).toBe('bi_weekly');
        expect(guestPayload.loyaltyPoints).toBe(0); // Only registered accounts get the 100 pt bonus
    });

    // =========================================================================
    // 6. Booking Payload Creation
    // =========================================================================
    test('formatOnboardingBookingPayload constructs proper booking record', () => {
        const booking = formatOnboardingBookingPayload({
            userId: 'user_123',
            customerName: 'Bruce Wayne',
            customerEmail: 'bruce@wayne.com',
            customerPhone: '(404) 555-0100',
            vehicleSummary: '2025 Batmobile (Matte Black)',
            servicePackage: 'Ceramic Coating (3 to 7 Year Warranty) - $850',
            addOns: ['addon_engine_bay'],
            frequency: 'monthly_club',
            address: '1007 Mountain Drive, Buford, GA 30518',
            preferredWindow: 'Morning (8am-12pm)',
            notes: 'Leave keys with Alfred',
            totalAmount: 850
        });

        expect(booking.userId).toBe('user_123');
        expect(booking.customerName).toBe('Bruce Wayne');
        expect(booking.customerEmail).toBe('bruce@wayne.com');
        expect(booking.customerPhone).toBe('(404) 555-0100');
        expect(booking.vehicle).toBe('2025 Batmobile (Matte Black)');
        expect(booking.service).toBe('Ceramic Coating (3 to 7 Year Warranty) - $850');
        expect(booking.totalAmount).toBe(850);
        expect(booking.status).toBe('pending');
        expect(booking.notes).toContain('Leave keys with Alfred');
        expect(booking.notes).toContain('Preferred Window: Morning (8am-12pm)');
    });
});
