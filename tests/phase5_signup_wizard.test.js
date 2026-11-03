import { describe, test, expect, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import {
    isValidVin,
    decodeVinWithNhtsa,
    validateStep1,
    validateStep2,
    tokenizePaymentMethod,
    formatRegistrationUserData
} from '../js/signup_wizard.js';

describe('Phase 5 Verification: Expanded Multi-Step Sign-Up Wizard & NHTSA VIN Decoding', () => {

    const signInHtml = fs.readFileSync(path.join(process.cwd(), 'sign in beta.html'), 'utf8');

    // =========================================================================
    // 1. DOM & Visual Structure Verification
    // =========================================================================
    test('sign in beta.html contains the 3-step progress wizard markup and elements', () => {
        // Wizard header & progress bar
        expect(signInHtml).toContain('id="wizard-header"');
        expect(signInHtml).toContain('id="wizard-progress-track"');
        expect(signInHtml).toContain('id="wizard-progress-fill"');
        expect(signInHtml).toContain('id="wizard-node-1"');
        expect(signInHtml).toContain('id="wizard-node-2"');
        expect(signInHtml).toContain('id="wizard-node-3"');

        // Step 1: Personal & Account Info
        expect(signInHtml).toContain('id="wizard-step-1"');
        expect(signInHtml).toContain('id="signup-name"');
        expect(signInHtml).toContain('id="signup-email"');
        expect(signInHtml).toContain('id="signup-password"');
        expect(signInHtml).toContain('id="signup-phone"');
        expect(signInHtml).toContain('id="signup-age"');
        expect(signInHtml).toContain('id="signup-gender"');
        expect(signInHtml).toContain('id="signup-address"');
        expect(signInHtml).toContain('id="glyph-chip-group"');
        expect(signInHtml).toContain('data-glyph="🏠"');
        expect(signInHtml).toContain('data-glyph="🏢"');
        expect(signInHtml).toContain('data-glyph="🛠️"');
        expect(signInHtml).toContain('id="step1-next-btn"');

        // Step 2: Vehicle ("Add to Garage")
        expect(signInHtml).toContain('id="wizard-step-2"');
        expect(signInHtml).toContain('id="signup-vin"');
        expect(signInHtml).toContain('id="decode-vin-btn"');
        expect(signInHtml).toContain('id="vin-status"');
        expect(signInHtml).toContain('id="signup-year"');
        expect(signInHtml).toContain('id="signup-make"');
        expect(signInHtml).toContain('id="signup-model"');
        expect(signInHtml).toContain('id="signup-color"');
        expect(signInHtml).toContain('id="parking-chip-group"');
        expect(signInHtml).toContain('data-env="Garage Kept"');
        expect(signInHtml).toContain('data-env="Parked Outside"');
        expect(signInHtml).toContain('id="signup-tint"');
        expect(signInHtml).toContain('id="signup-mods"');
        expect(signInHtml).toContain('id="step2-back-btn"');
        expect(signInHtml).toContain('id="step2-next-btn"');

        // Step 3: Payment Setup (Optional)
        expect(signInHtml).toContain('id="wizard-step-3"');
        expect(signInHtml).toContain('id="signup-card-number"');
        expect(signInHtml).toContain('id="signup-card-expiry"');
        expect(signInHtml).toContain('id="signup-card-cvc"');
        expect(signInHtml).toContain('id="signup-card-zip"');
        expect(signInHtml).toContain('id="skip-card-btn"');
        expect(signInHtml).toContain('Skip — I\'ll Add a Card Later');
        expect(signInHtml).toContain('id="signup-finish-btn"');
        expect(signInHtml).toContain('⚡ Complete Sign-Up & Claim 100 Pts');
        expect(signInHtml).toContain('id="step3-back-btn"');
    });

    test('sign in beta.html maintains PCI-DSS notice and gold metallic styling', () => {
        expect(signInHtml).toContain('PCI-DSS');
        expect(signInHtml).toContain('linear-gradient(90deg, #b8860b, #ffd700, #f5d77f)');
        expect(signInHtml).toContain('100 points welcome bonus');
    });

    // =========================================================================
    // 2. Step 1 Validation
    // =========================================================================
    test('validateStep1 enforces required personal fields and formats', () => {
        // Missing all
        const emptyResult = validateStep1({});
        expect(emptyResult.isValid).toBe(false);
        expect(emptyResult.errors.name).toBeDefined();
        expect(emptyResult.errors.email).toBeDefined();
        expect(emptyResult.errors.password).toBeDefined();
        expect(emptyResult.errors.phone).toBeDefined();
        expect(emptyResult.errors.address).toBeDefined();

        // Weak password (< 6 chars)
        const weakPass = validateStep1({
            name: 'John Doe',
            email: 'john@example.com',
            password: '123',
            phone: '4045550199',
            address: '123 Main St, Buford, GA'
        });
        expect(weakPass.isValid).toBe(false);
        expect(weakPass.errors.password).toContain('at least 6 characters');

        // Invalid email
        const badEmail = validateStep1({
            name: 'John Doe',
            email: 'not-an-email',
            password: 'secretPassword123',
            phone: '4045550199',
            address: '123 Main St, Buford, GA'
        });
        expect(badEmail.isValid).toBe(false);
        expect(badEmail.errors.email).toContain('valid email');

        // Short phone number (< 10 digits)
        const badPhone = validateStep1({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'secretPassword123',
            phone: '12345',
            address: '123 Main St, Buford, GA'
        });
        expect(badPhone.isValid).toBe(false);
        expect(badPhone.errors.phone).toContain('10-digit');

        // Valid Step 1
        const valid = validateStep1({
            name: 'Catalin Andrian',
            email: 'catalin@autolux.com',
            password: 'securePass2026',
            phone: '(404) 542-2712',
            address: '123 Luxury Way, Buford, GA 30518'
        });
        expect(valid.isValid).toBe(true);
        expect(Object.keys(valid.errors).length).toBe(0);
    });

    // =========================================================================
    // 3. Step 2 Validation & NHTSA VIN Decoding
    // =========================================================================
    test('validateStep2 enforces required vehicle specifications', () => {
        const emptyVehicle = validateStep2({});
        expect(emptyVehicle.isValid).toBe(false);
        expect(emptyVehicle.errors.year).toBeDefined();
        expect(emptyVehicle.errors.make).toBeDefined();
        expect(emptyVehicle.errors.model).toBeDefined();
        expect(emptyVehicle.errors.color).toBeDefined();

        // Invalid year
        const badYear = validateStep2({
            year: '1800',
            make: 'Porsche',
            model: '911',
            color: 'Black'
        });
        expect(badYear.isValid).toBe(false);
        expect(badYear.errors.year).toContain('valid model year');

        // Valid vehicle
        const validVehicle = validateStep2({
            year: '2024',
            make: 'Porsche',
            model: '911 GT3 RS',
            color: 'Chalk'
        });
        expect(validVehicle.isValid).toBe(true);
    });

    test('isValidVin validates standard 11-17 character VIN format', () => {
        expect(isValidVin('WP0AB2A91MS261234')).toBe(true);
        expect(isValidVin('1HGCR2F83HA123456')).toBe(true);
        expect(isValidVin('SHORT')).toBe(false);
        expect(isValidVin('')).toBe(false);
        expect(isValidVin(null)).toBe(false);
    });

    test('decodeVinWithNhtsa calls NHTSA VPIC API and parses Year, Make, Model', async () => {
        const mockResponse = {
            Count: 1,
            Message: 'Results returned successfully',
            Results: [
                {
                    ModelYear: '2021',
                    Make: 'PORSCHE',
                    Model: '911',
                    BodyClass: 'Coupe',
                    DriveType: 'RWD/Rear-Wheel Drive'
                }
            ]
        };

        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockResponse
        });

        const result = await decodeVinWithNhtsa('WP0AB2A91MS261234', mockFetch);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch.mock.calls[0][0]).toContain('https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/WP0AB2A91MS261234?format=json');
        expect(result.success).toBe(true);
        expect(result.year).toBe('2021');
        expect(result.make).toBe('PORSCHE');
        expect(result.model).toBe('911');
        expect(result.bodyClass).toBe('Coupe');
    });

    test('decodeVinWithNhtsa handles network failures gracefully', async () => {
        const mockFailFetch = jest.fn().mockRejectedValue(new Error('Network offline'));
        const result = await decodeVinWithNhtsa('WP0AB2A91MS261234', mockFailFetch);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Network offline');
    });

    // =========================================================================
    // 4. PCI-DSS Card Tokenization & Skip Card Option
    // =========================================================================
    test('tokenizePaymentMethod tokenizes card without saving raw card number or CVC (PCI-DSS compliance)', () => {
        const rawCard = {
            cardNumber: '4242 4242 4242 4242',
            expiry: '08/28',
            cvc: '123',
            zip: '30518'
        };

        const tokenResult = tokenizePaymentMethod(rawCard);

        expect(tokenResult).toBeDefined();
        expect(tokenResult.tokenized).toBe(true);
        expect(tokenResult.brand).toBe('visa');
        expect(tokenResult.last4).toBe('4242');
        expect(tokenResult.expMonth).toBe(8);
        expect(tokenResult.expYear).toBe(2028);
        expect(tokenResult.zip).toBe('30518');
        expect(tokenResult.id).toMatch(/^pm_mock_visa_4242_/);

        // STRICT SECURITY ASSERTIONS: NO RAW CARD OR CVC PRESENT
        expect(tokenResult.cardNumber).toBeUndefined();
        expect(tokenResult.cvc).toBeUndefined();
        expect(JSON.stringify(tokenResult)).not.toContain('4242424242424242');
        expect(JSON.stringify(tokenResult)).not.toContain('123');
    });

    test('tokenizePaymentMethod returns null when no card details are provided', () => {
        expect(tokenizePaymentMethod({})).toBeNull();
        expect(tokenizePaymentMethod({ cardNumber: '' })).toBeNull();
    });

    // =========================================================================
    // 5. Full Registration Payload & 100 Points Welcome Bonus
    // =========================================================================
    test('formatRegistrationUserData generates complete profile with 100 loyalty points and proper data structures', () => {
        const payload = formatRegistrationUserData({
            uid: 'user_autolux_999',
            email: 'vip.client@autolux.com',
            personal: {
                name: 'Sterling Archer',
                phone: '(404) 555-0199',
                age: '36',
                gender: 'male',
                address: '1000 Luxury Lane, Buford, GA 30518',
                addressGlyph: '🏠',
                addressLabel: 'Home'
            },
            vehicle: {
                year: '2024',
                make: 'Porsche',
                model: '911 GT3 RS',
                color: 'Chalk',
                vin: 'WP0AB2A91MS261234',
                parkingEnvironment: 'Garage Kept',
                windowTint: 'Dark (20%)',
                modifications: 'Ceramic Pro 9H + Full SunTek PPF'
            },
            payment: {
                id: 'pm_mock_visa_4242_abc123',
                brand: 'visa',
                last4: '4242',
                tokenized: true
            },
            referralCode: 'ARCHER26'
        });

        // 1. Core Profile
        expect(payload.uid).toBe('user_autolux_999');
        expect(payload.email).toBe('vip.client@autolux.com');
        expect(payload.name).toBe('Sterling Archer');
        expect(payload.phone).toBe('(404) 555-0199');
        expect(payload.age).toBe(36);
        expect(payload.gender).toBe('male');
        expect(payload.isAdmin).toBe(false);

        // 2. Mandatory 100 Points Welcome Bonus
        expect(payload.loyaltyPoints).toBe(100);
        expect(payload.bonusAwarded).toBe(true);

        // 3. Vehicles Array (for account.html & form dropdown compatibility)
        expect(payload.vehicles).toEqual(['2024 Porsche 911 GT3 RS (Chalk)']);

        // 4. Garage Detailed Records
        expect(payload.garage).toHaveLength(1);
        expect(payload.garage[0]).toEqual({
            year: '2024',
            make: 'Porsche',
            model: '911 GT3 RS',
            color: 'Chalk',
            vin: 'WP0AB2A91MS261234',
            parkingEnvironment: 'Garage Kept',
            windowTint: 'Dark (20%)',
            modifications: 'Ceramic Pro 9H + Full SunTek PPF'
        });

        // 5. Addresses Array with Glyph
        expect(payload.addresses).toEqual([
            {
                label: '🏠 Home',
                address: '1000 Luxury Lane, Buford, GA 30518'
            }
        ]);

        // 6. Payment method representation
        expect(payload.paymentSetup.tokenized).toBe(true);
        expect(payload.paymentSetup.last4).toBe('4242');

        // 7. Security: Zero raw card info in entire payload JSON
        expect(JSON.stringify(payload)).not.toContain('cardNumber');
        expect(JSON.stringify(payload)).not.toContain('cvc');
    });

    test('formatRegistrationUserData cleanly supports "Skip — I\'ll Add a Card Later"', () => {
        const payload = formatRegistrationUserData({
            uid: 'user_skip_card_123',
            email: 'skip.card@autolux.com',
            personal: {
                name: 'Jane Doe',
                phone: '(404) 555-0188',
                address: '500 Peachtree St, Atlanta, GA'
            },
            vehicle: {
                year: '2023',
                make: 'BMW',
                model: 'M4 Competition',
                color: 'Isle of Man Green'
            },
            payment: null // User skipped card entry
        });

        expect(payload.paymentSetup).toEqual({ status: 'card_later' });
        expect(payload.loyaltyPoints).toBe(100);
        expect(payload.bonusAwarded).toBe(true);
        expect(payload.vehicles).toEqual(['2023 BMW M4 Competition (Isle of Man Green)']);
    });
});
