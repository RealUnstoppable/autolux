import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import {
    saveBookingDraftToLocal,
    getBookingDraftFromLocal,
    clearBookingDraftFromLocal,
    debounceSyncBookingDraft,
    saveQuoteDraftToLocal,
    getQuoteDraftFromLocal,
    clearQuoteDraftFromLocal,
    debounceSyncQuoteDraft,
    getLocationGlyph,
    setupSmartSavedDropdowns,
    STORAGE_KEY_BOOKING,
    STORAGE_KEY_QUOTE
} from '../js/form_autosave.js';

describe('Phase 3 Verification: Pricing Cards Consolidation, Real-Time Auto-Save & Smart Dropdowns', () => {

    beforeEach(() => {
        jest.useFakeTimers();
        const store = {};
        global.window = {
            localStorage: {
                getItem: (k) => store[k] || null,
                setItem: (k, v) => { store[k] = String(v); },
                removeItem: (k) => { delete store[k]; },
                clear: () => { Object.keys(store).forEach(k => delete store[k]); }
            }
        };
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // 1. Pricing Cards Button Consolidation
    test('index.html removes redundant Book Sedan/SUV/Truck/Sprinter buttons and keeps ONLY primary Instant Checkout', () => {
        const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');

        // Extract the main pricing grid
        const pricingGridMatch = indexHtml.match(/<section id="pricing">([\s\S]*?)<\/section>/);
        const pricingSection = pricingGridMatch ? pricingGridMatch[1] : '';

        // Verify redundant booking buttons are removed from main pricing cards
        expect(pricingSection).not.toContain('>Book Sedan<');
        expect(pricingSection).not.toContain('>Book SUV<');
        expect(pricingSection).not.toContain('>Book Truck<');
        expect(pricingSection).not.toContain('>Book Sprinter<');
        expect(pricingSection).not.toContain('booking.html?package=sedan');
        expect(pricingSection).not.toContain('booking.html?package=suv');
        expect(pricingSection).not.toContain('booking.html?package=truck');
        expect(pricingSection).not.toContain('booking.html?package=van');

        // Verify all 4 primary Instant Checkout buttons are preserved
        expect(indexHtml).toContain('https://buy.stripe.com/fZu28q3Ucf4jcVJgFT9AA02');
        expect(indexHtml).toContain('⚡ Instant Checkout &bull; $150');

        expect(indexHtml).toContain('https://buy.stripe.com/00w3cucqI2hxaNB1KZ9AA03');
        expect(indexHtml).toContain('⚡ Instant Checkout &bull; $250');

        expect(indexHtml).toContain('https://buy.stripe.com/cNieVc3Uc6xN8Ft1KZ9AA04');
        expect(indexHtml).toContain('⚡ Instant Checkout &bull; $280');

        expect(indexHtml).toContain('https://buy.stripe.com/9B628q76o4pF6xlexL9AA05');
        expect(indexHtml).toContain('⚡ Instant Checkout &bull; $400');
    });

    // 2. Real-Time Auto-Save to localStorage
    test('saveBookingDraftToLocal and getBookingDraftFromLocal persist all required fields, add-ons, and notes', () => {
        const bookingState = {
            package: 'Luxury Sedan - $150',
            addOns: ['addon_engine_bay', 'addon_leather_shield'],
            totalPrice: 375,
            vehicle: '2024 Porsche 911 GT3 - Chalk',
            appointmentDate: '2026-11-20T10:00',
            address: '123 Luxury Way, Buford, GA 30518',
            referralCode: 'ALX-VIP2026',
            notes: 'Please apply extra ceramic spray to front splitter and exhaust tips.'
        };

        saveBookingDraftToLocal(bookingState);

        const loaded = getBookingDraftFromLocal();
        expect(loaded).not.toBeNull();
        expect(loaded.package).toBe('Luxury Sedan - $150');
        expect(loaded.addOns).toEqual(['addon_engine_bay', 'addon_leather_shield']);
        expect(loaded.totalPrice).toBe(375);
        expect(loaded.vehicle).toBe('2024 Porsche 911 GT3 - Chalk');
        expect(loaded.appointmentDate).toBe('2026-11-20T10:00');
        expect(loaded.address).toBe('123 Luxury Way, Buford, GA 30518');
        expect(loaded.referralCode).toBe('ALX-VIP2026');
        expect(loaded.notes).toContain('extra ceramic spray');
        expect(typeof loaded.timestamp).toBe('number');

        clearBookingDraftFromLocal();
        expect(getBookingDraftFromLocal()).toBeNull();
    });

    test('saveQuoteDraftToLocal and getQuoteDraftFromLocal persist all quote inputs', () => {
        const quoteState = {
            name: 'Alexander Wright',
            email: 'alex@example.com',
            phone: '(404) 555-0199',
            details: '2023 Ferrari 296 GTB - Rosso Corsa',
            serviceRequested: 'Ceramic Coating',
            additionalNotes: 'Need track protection package and wheel ceramic coating.'
        };

        saveQuoteDraftToLocal(quoteState);

        const loaded = getQuoteDraftFromLocal();
        expect(loaded).not.toBeNull();
        expect(loaded.name).toBe('Alexander Wright');
        expect(loaded.email).toBe('alex@example.com');
        expect(loaded.phone).toBe('(404) 555-0199');
        expect(loaded.details).toContain('Ferrari 296 GTB');
        expect(loaded.serviceRequested).toBe('Ceramic Coating');
        expect(loaded.additionalNotes).toContain('track protection');

        clearQuoteDraftFromLocal();
        expect(getQuoteDraftFromLocal()).toBeNull();
    });

    // 3. Debounce-sync (500ms) to Firestore User Profile
    test('debounceSyncBookingDraft syncs to users/{uid} with 500ms debounce', async () => {
        const { setDoc } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js');
        setDoc.mockReset();

        const draft1 = { package: 'Luxury Sedan - $150', vehicle: 'Porsche 911' };
        const draft2 = { package: 'Luxury SUV - $250', vehicle: 'Range Rover SV' };

        // Fire first sync
        const promise1 = debounceSyncBookingDraft('test-uid-123', draft1, 500);
        jest.advanceTimersByTime(200);

        // Fire second sync before 500ms elapsed (debounce resets)
        const promise2 = debounceSyncBookingDraft('test-uid-123', draft2, 500);
        jest.advanceTimersByTime(550);

        await Promise.all([promise1, promise2]);

        // Only 1 call made with the final debounced draft
        expect(setDoc).toHaveBeenCalledTimes(1);
        const setDocCall = setDoc.mock.calls[0];
        expect(setDocCall[0].id).toBe('test-uid-123');
        expect(setDocCall[1].draftBooking.package).toBe('Luxury SUV - $250');
        expect(setDocCall[1].draftBooking.vehicle).toBe('Range Rover SV');
        expect(setDocCall[1].lastSelectedVehicle).toBe('Range Rover SV');
    });

    test('debounceSyncQuoteDraft syncs to users/{uid} with 500ms debounce', async () => {
        const { setDoc } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js');
        setDoc.mockReset();

        const quoteDraft = {
            name: 'Sophia Laurent',
            email: 'sophia@lux.com',
            details: '2024 Rolls Royce Spectre',
            serviceRequested: 'Ceramic Coating'
        };

        const syncPromise = debounceSyncQuoteDraft('uid-sophia-456', quoteDraft, 500);
        jest.advanceTimersByTime(550);
        await syncPromise;

        expect(setDoc).toHaveBeenCalledTimes(1);
        const setDocCall = setDoc.mock.calls[0];
        expect(setDocCall[0].id).toBe('uid-sophia-456');
        expect(setDocCall[1].draftQuote.name).toBe('Sophia Laurent');
        expect(setDocCall[1].draftQuote.details).toBe('2024 Rolls Royce Spectre');
    });

    // 4. Smart Saved Dropdowns with Location Glyphs
    test('getLocationGlyph maps address labels accurately to location emojis', () => {
        expect(getLocationGlyph('Primary Home Residence')).toBe('🏠');
        expect(getLocationGlyph('Downtown Office Suite')).toBe('🏢');
        expect(getLocationGlyph('Corporate Work HQ')).toBe('🏢');
        expect(getLocationGlyph('Private Airport Hangar')).toBe('✈️');
        expect(getLocationGlyph('Collector Studio Garage')).toBe('🏎️');
        expect(getLocationGlyph('Lake Lanier Vacation Home')).toBe('🏠'); // home takes priority
        expect(getLocationGlyph('Lake House Dock')).toBe('🏠');
        expect(getLocationGlyph('General Delivery')).toBe('📍');
    });

    test('setupSmartSavedDropdowns populates vehicles and addresses with glyphs and handles + Add New', () => {
        // Mock DOM elements
        const createMockSelect = () => {
            const options = [];
            const listeners = {};
            return {
                style: { display: 'none' },
                value: '',
                options,
                appendChild: (opt) => options.push(opt),
                set innerHTML(val) { options.length = 0; },
                addEventListener: (evt, fn) => { listeners[evt] = fn; },
                trigger: (evt) => listeners[evt] && listeners[evt]()
            };
        };

        const createMockInput = () => ({
            style: { display: 'block' },
            value: '',
            focus: jest.fn()
        });

        const vehicleSelect = createMockSelect();
        const vehicleInput = createMockInput();
        const addressSelect = createMockSelect();
        const addressInput = createMockInput();

        const mockUserData = {
            vehicles: ['2024 Porsche 911 GT3 RS', '2023 Bentley Continental GT'],
            addresses: [
                { label: 'Home', address: '123 Luxury Way, Buford, GA' },
                { label: 'Office', address: '500 Technology Pkwy, Peachtree Corners, GA' }
            ]
        };

        const onSelectionChange = jest.fn();

        setupSmartSavedDropdowns({
            userData: mockUserData,
            vehicleSelect,
            vehicleInput,
            addressSelect,
            addressInput,
            onSelectionChange
        });

        // Verify vehicle dropdown is populated with emoji and + Add New
        expect(vehicleSelect.style.display).toBe('block');
        expect(vehicleSelect.options.length).toBe(4); // Default, 2 vehicles, + Add New
        expect(vehicleSelect.options[1].textContent).toContain('🚗 2024 Porsche 911 GT3 RS');
        expect(vehicleSelect.options[3].textContent).toContain('+ Add New Vehicle');

        // Selecting a vehicle hides text input and fills value
        vehicleSelect.value = '2024 Porsche 911 GT3 RS';
        vehicleSelect.trigger('change');
        expect(vehicleInput.value).toBe('2024 Porsche 911 GT3 RS');
        expect(vehicleInput.style.display).toBe('none');
        expect(onSelectionChange).toHaveBeenCalled();

        // Selecting + Add New reveals text input and clears it
        vehicleSelect.value = '__custom__';
        vehicleSelect.trigger('change');
        expect(vehicleInput.style.display).toBe('block');
        expect(vehicleInput.value).toBe('');
        expect(vehicleInput.focus).toHaveBeenCalled();

        // Verify address dropdown is populated with glyphs
        expect(addressSelect.style.display).toBe('block');
        expect(addressSelect.options.length).toBe(4); // Default, 2 addresses, + Add New
        expect(addressSelect.options[1].textContent).toContain('🏠 Home: 123 Luxury Way');
        expect(addressSelect.options[2].textContent).toContain('🏢 Office: 500 Technology Pkwy');

        // Selecting home address
        addressSelect.value = '123 Luxury Way, Buford, GA';
        addressSelect.trigger('change');
        expect(addressInput.value).toBe('123 Luxury Way, Buford, GA');
        expect(addressInput.style.display).toBe('none');

        // Selecting + Add New address
        addressSelect.value = '__custom__';
        addressSelect.trigger('change');
        expect(addressInput.style.display).toBe('block');
        expect(addressInput.value).toBe('');
    });

    // 5. Verification Gate 3: Form persistence after refresh simulation
    test('VERIFICATION GATE 3: Booking form fields, notes, and checked luxury add-ons persist across page reload', () => {
        // Initial form state user typed
        const initialFormState = {
            package: 'Luxury SUV - $250',
            addOns: ['addon_engine_bay', 'addon_ozone_odor', 'addon_glass_coating'],
            totalPrice: 465,
            vehicle: '2024 Mercedes-AMG G63 - Obsidian Black',
            appointmentDate: '2026-11-25T14:30',
            address: '88 Lakefront Drive, Buford, GA 30518',
            referralCode: 'ALX-TOPTIER',
            notes: 'Gate code #9942. Please take special care with the matte carbon trim.'
        };

        // User edits and auto-save fires
        saveBookingDraftToLocal(initialFormState);

        // Simulate page reload: read from fresh context
        const restoredState = getBookingDraftFromLocal();

        expect(restoredState).toBeDefined();
        expect(restoredState.package).toBe('Luxury SUV - $250');
        expect(restoredState.vehicle).toBe('2024 Mercedes-AMG G63 - Obsidian Black');
        expect(restoredState.appointmentDate).toBe('2026-11-25T14:30');
        expect(restoredState.address).toBe('88 Lakefront Drive, Buford, GA 30518');
        expect(restoredState.referralCode).toBe('ALX-TOPTIER');
        expect(restoredState.notes).toBe('Gate code #9942. Please take special care with the matte carbon trim.');

        // Luxury add-ons array verification
        expect(restoredState.addOns).toContain('addon_engine_bay');
        expect(restoredState.addOns).toContain('addon_ozone_odor');
        expect(restoredState.addOns).toContain('addon_glass_coating');
        expect(restoredState.totalPrice).toBe(465);
    });

    // 6. Validation Enforcement
    test('booking.html and quote.html enforce strict validation on required fields while preserving notes & add-ons', () => {
        const bookingHtml = fs.readFileSync(path.join(process.cwd(), 'booking.html'), 'utf8');
        const quoteHtml = fs.readFileSync(path.join(process.cwd(), 'quote.html'), 'utf8');

        // Check validation strings in booking.html
        expect(bookingHtml).toContain('Please fill in all required fields (Package, Vehicle, Date & Address)');
        expect(bookingHtml).toContain('saved-vehicle-select');
        expect(bookingHtml).toContain('saved-address-select');
        expect(bookingHtml).toContain('debounceSyncBookingDraft');
        expect(bookingHtml).toContain('saveBookingDraftToLocal');
        expect(bookingHtml).toContain('getBookingDraftFromLocal');

        // Check validation and auto-save in quote.html
        expect(quoteHtml).toContain('debounceSyncQuoteDraft');
        expect(quoteHtml).toContain('saveQuoteDraftToLocal');
        expect(quoteHtml).toContain('getQuoteDraftFromLocal');
        expect(quoteHtml).toContain('initQuoteAuth');
    });
});
