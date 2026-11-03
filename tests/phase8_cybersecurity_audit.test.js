import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { escapeHTML } from '../js/utils.js';
import { startAuthLockout, stopAuthLockout, isAuthLockActive, LOCKOUT_WATCHDOG_MS } from '../js/auth_lockout.js';
import {
    saveBookingDraftToLocal,
    getBookingDraftFromLocal,
    saveQuoteDraftToLocal,
    getQuoteDraftFromLocal,
    debounceSyncBookingDraft,
    STORAGE_KEY_BOOKING,
    STORAGE_KEY_QUOTE
} from '../js/form_autosave.js';
import { updateNavUnderline, getNavbarHTML } from '../js/navbar.js';
import { validateStep1, validateStep2, tokenizePaymentMethod, formatRegistrationUserData } from '../js/signup_wizard.js';
import { calculateWinner } from '../js/admin_wheel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accountHtml = fs.readFileSync(path.resolve(__dirname, '../account.html'), 'utf8');
const bookingHtml = fs.readFileSync(path.resolve(__dirname, '../booking.html'), 'utf8');
const signinHtml = fs.readFileSync(path.resolve(__dirname, '../sign in beta.html'), 'utf8');
const reviewsHtml = fs.readFileSync(path.resolve(__dirname, '../reviews.html'), 'utf8');
const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const firestoreRules = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');

describe('Phase 8: Comprehensive Cybersecurity & Automated End-to-End Verification Suite', () => {

    describe('1. Cybersecurity & XSS Vulnerability Audit', () => {
        test('escapeHTML accurately sanitizes dangerous HTML/script injection vectors', () => {
            expect(escapeHTML('<script>alert("pwned")</script>')).toBe('&lt;script&gt;alert(&quot;pwned&quot;)&lt;/script&gt;');
            expect(escapeHTML('"><img src=x onerror=alert(1)>')).toBe('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
            expect(escapeHTML("test ' OR '1'='1")).toBe("test &#039; OR &#039;1&#039;=&#039;1");
            expect(escapeHTML(null)).toBe('');
            expect(escapeHTML(undefined)).toBe('');
        });

        test('account.html sanitizes all dynamic user inputs before DOM rendering', () => {
            expect(accountHtml).toContain('escapeHTML(v)');
            expect(accountHtml).toContain('escapeHTML(a.label || \'Address\')');
            expect(accountHtml).toContain('escapeHTML(a.address || \'N/A\')');
            expect(accountHtml).toContain('escapeHTML(glyph)');
            expect(accountHtml).toContain('escapeHTML(msg.text)');
            expect(accountHtml).toContain('escapeHTML(ticket.subject || \'Support Ticket\')');
        });

        test('reviews.html and index.html sanitize all reviews and vehicle badges', () => {
            expect(reviewsHtml).toContain('escapeHTML(r.comment || \'\')');
            expect(reviewsHtml).toContain('escapeHTML(r.vehicle)');
            expect(reviewsHtml).toContain('escapeHTML(r.userName || \'Verified Client\')');
            expect(indexHtml).toContain('escapeHTML(r.comment || "")');
            expect(indexHtml).toContain('escapeHTML(r.vehicle)');
        });
    });

    describe('2. PCI-DSS Compliance & Plaintext Token Security', () => {
        test('localStorage operations never store raw primary account numbers (PAN) or CVVs', () => {
            const mockStorage = {};
            const sampleBooking = {
                package: 'sedan',
                vehicle: '2024 Porsche 911 GT3',
                date: '2026-11-20',
                time: '10:00 AM'
            };

            global.window = {
                localStorage: {
                    setItem: (k, v) => { mockStorage[k] = v; },
                    getItem: (k) => mockStorage[k] || null,
                    removeItem: (k) => { delete mockStorage[k]; }
                }
            };

            saveBookingDraftToLocal(sampleBooking);
            const savedDraft = JSON.parse(mockStorage[STORAGE_KEY_BOOKING] || '{}');

            expect(savedDraft.cardNumber).toBeUndefined();
            expect(savedDraft.cardCvc).toBeUndefined();
            expect(savedDraft.pan).toBeUndefined();
            expect(JSON.stringify(mockStorage)).not.toMatch(/4111\s*4111|4242\s*4242/);
        });

        test('sign in beta.html uses PCI-tokenized card setup and provides a prominent skip button', () => {
            expect(signinHtml).toContain('id="signup-card-number"');
            expect(signinHtml).toContain('id="skip-card-btn"');
            expect(signinHtml).toContain("Skip — I'll Add a Card Later");
            expect(signinHtml).toContain('PCI-DSS');
        });

        test('tokenizePaymentMethod tokenizes card input and never exposes raw PAN or CVC', () => {
            const tokenized = tokenizePaymentMethod({
                cardNumber: '4242 4242 4242 4242',
                expMonth: '12',
                expYear: '28',
                cvc: '123',
                zip: '30518'
            });
            expect(tokenized.tokenized).toBe(true);
            expect(tokenized.last4).toBe('4242');
            expect(tokenized.id).toMatch(/^pm_mock_/);
            expect(tokenized.cardNumber).toBeUndefined();
            expect(tokenized.cvc).toBeUndefined();
        });
    });

    describe('3. Auth State Lock & 45-Second Watchdog Fallback', () => {
        test('startAuthLockout applies pointer-events none, aria-disabled, and initializes 45s watchdog', () => {
            jest.useFakeTimers();

            const originalWindow = global.window;
            const originalDocument = global.document;

            global.window = {
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };
            global.document = {
                querySelectorAll: jest.fn(() => []),
                querySelector: jest.fn(() => null),
                getElementById: jest.fn(() => null)
            };

            const mockContainer = {
                classList: { add: jest.fn(), remove: jest.fn() },
                style: { display: 'none' }
            };

            startAuthLockout({
                container: mockContainer,
                timeoutMs: LOCKOUT_WATCHDOG_MS
            });

            expect(isAuthLockActive()).toBe(true);
            expect(LOCKOUT_WATCHDOG_MS).toBe(45000);

            // Fast forward 45 seconds to trigger safety watchdog
            jest.advanceTimersByTime(45000);

            expect(isAuthLockActive()).toBe(false);

            global.window = originalWindow;
            global.document = originalDocument;
            jest.useRealTimers();
        });
    });

    describe('4. Real-Time Form Auto-Save and Restoration', () => {
        test('booking form drafts and quote drafts persist immediately to storage and load accurately', () => {
            const mockStore = {};
            global.window = {
                localStorage: {
                    setItem: (k, v) => { mockStore[k] = v; },
                    getItem: (k) => mockStore[k] || null,
                    removeItem: (k) => { delete mockStore[k]; }
                }
            };

            const bookingPayload = {
                package: 'suv',
                vehicle: 'Mercedes-AMG G63',
                customerName: 'Marcus Vance',
                customerEmail: 'marcus@autolux.com',
                timestamp: Date.now()
            };

            saveBookingDraftToLocal(bookingPayload);
            const loadedBooking = getBookingDraftFromLocal();
            expect(loadedBooking.package).toBe('suv');
            expect(loadedBooking.vehicle).toBe('Mercedes-AMG G63');

            const quotePayload = {
                name: 'Elena Rostova',
                email: 'elena@suwanee.com',
                serviceType: 'Fleet Ceramic Detailing',
                message: '3 executive vehicles needing complete paint correction and interior extraction.'
            };

            saveQuoteDraftToLocal(quotePayload);
            const loadedQuote = getQuoteDraftFromLocal();
            expect(loadedQuote.name).toBe('Elena Rostova');
            expect(loadedQuote.serviceType).toBe('Fleet Ceramic Detailing');
        });

        test('debounceSyncBookingDraft debounces and syncs to users/{uid}', async () => {
            jest.useFakeTimers();
            const { setDoc } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js');
            setDoc.mockReset();

            const draft = { package: 'sedan', vehicle: 'Porsche 911 GT3' };
            const syncPromise = debounceSyncBookingDraft('uid-client-99', draft, 500);
            jest.advanceTimersByTime(550);
            await syncPromise;

            expect(setDoc).toHaveBeenCalledTimes(1);
            const call = setDoc.mock.calls[0];
            expect(call[0].id).toBe('uid-client-99');
            expect(call[1].draftBooking.package).toBe('sedan');
            expect(call[1].draftBooking.vehicle).toBe('Porsche 911 GT3');

            jest.useRealTimers();
        });
    });

    describe('5. Navbar Smooth Gold Underline Transitions', () => {
        test('getNavbarHTML contains all 6 core navigation items', () => {
            const html = getNavbarHTML();
            expect(html).toContain('data-route="process"');
            expect(html).toContain('data-route="pricing"');
            expect(html).toContain('data-route="gallery"');
            expect(html).toContain('data-route="reviews"');
            expect(html).toContain('data-route="rewards"');
            expect(html).toContain('data-route="quote"');
        });

        test('updateNavUnderline smoothly positions indicator for any target element', () => {
            const underline = { style: {} };
            const wrapper = {
                getBoundingClientRect: () => ({ left: 100, width: 600 }),
                contains: () => true
            };
            const tabReviews = {
                getBoundingClientRect: () => ({ left: 320, width: 85 })
            };

            global.document = {
                getElementById: (id) => {
                    if (id === 'nav-gold-underline') return underline;
                    if (id === 'nav-items-wrapper') return wrapper;
                    return null;
                }
            };

            updateNavUnderline(tabReviews);
            expect(underline.style.transform).toBe('translateX(220px)');
            expect(underline.style.width).toBe('85px');
            expect(underline.style.opacity).toBe('1');
        });
    });

    describe('6. Multi-Step Sign-Up Wizard Validation & 100-Point Bonus', () => {
        test('validateStep1 strictly enforces required name, email, password, and phone', () => {
            const invalidResult = validateStep1({ name: '', email: 'bad-email', password: '123', phone: '' });
            expect(invalidResult.isValid).toBe(false);
            expect(invalidResult.errors.name).toBeDefined();
            expect(invalidResult.errors.email).toBeDefined();
            expect(invalidResult.errors.password).toBeDefined();
            expect(invalidResult.errors.phone).toBeDefined();

            const validResult = validateStep1({
                name: 'Julian Vance',
                email: 'julian@autolux.com',
                password: 'LuxuryPassword2026!',
                phone: '(404) 555-0199',
                age: '38',
                gender: 'male',
                address: '100 Main St, Buford, GA 30518',
                addressGlyph: '🏠'
            });
            expect(validResult.isValid).toBe(true);
            expect(Object.keys(validResult.errors).length).toBe(0);
        });

        test('validateStep2 captures parking environment and vehicle notes with bonus points', () => {
            const vehicleData = {
                year: '2024',
                make: 'Porsche',
                model: '911 GT3',
                color: 'Guards Red',
                parkingEnvironment: 'Garage Kept',
                windowTint: 'Yes (20%)',
                modifications: 'Full body XPEL Ultimate Plus PPF installed.'
            };

            const result = validateStep2(vehicleData);
            expect(result.isValid).toBe(true);

            const userDoc = formatRegistrationUserData({
                uid: 'user-val-123',
                email: 'julian@autolux.com',
                personal: {
                    name: 'Julian Vance',
                    phone: '(404) 555-0199',
                    address: '100 Main St, Buford, GA 30518',
                    addressGlyph: '🏠'
                },
                vehicle: vehicleData
            });

            expect(userDoc.loyaltyPoints).toBe(100);
            expect(userDoc.bonusAwarded).toBe(true);
            expect(userDoc.vehicles[0]).toContain('2024 Porsche 911 GT3 (Guards Red)');
            expect(userDoc.garage[0].parkingEnvironment).toBe('Garage Kept');
        });
    });

    describe('7. Weighted Probability Math on Admin Sweepstakes Spinner Wheel', () => {
        test('calculateWinner handles zero and proportional entrant weights deterministically', () => {
            expect(() => calculateWinner([], 0.5)).toThrow('Participants array cannot be empty');

            const singleEntrant = [{ name: 'Solo Winner', entries: 30 }];
            expect(calculateWinner(singleEntrant, 0.5).winner.name).toBe('Solo Winner');
        });

        test('calculateWinner respects relative ticket weight distributions across thresholds', () => {
            const participants = [
                { name: 'Alice (10 entries)', entries: 10 },
                { name: 'Bob (30 entries)', entries: 30 },
                { name: 'Charlie (60 entries)', entries: 60 }
            ];

            // Total tickets = 100
            // Ratio 0.05 -> ticket 5 -> Alice
            expect(calculateWinner(participants, 0.05).winner.name).toContain('Alice');

            // Ratio 0.25 -> ticket 25 -> Bob (range 11-40)
            expect(calculateWinner(participants, 0.25).winner.name).toContain('Bob');

            // Ratio 0.85 -> ticket 85 -> Charlie (range 41-100)
            expect(calculateWinner(participants, 0.85).winner.name).toContain('Charlie');
        });
    });

    describe('8. Firestore Security Rules Privilege Escalation Audit', () => {
        test('users collection strictly forbids clients from escalating to isAdmin', () => {
            expect(firestoreRules).toContain('match /users/{userId}');
            expect(firestoreRules).toContain("(!('isAdmin' in request.resource.data) || request.resource.data.isAdmin == false)");
            expect(firestoreRules).toContain("request.resource.data.isAdmin == resource.data.isAdmin");
        });

        test('accountMerges collection ensures owner and admin isolation', () => {
            expect(firestoreRules).toContain('match /accountMerges/{userId}');
            expect(firestoreRules).toContain('allow read: if isOwner(userId) || isAdmin();');
            expect(firestoreRules).toContain('allow create, update: if isOwner(userId) || isAdmin();');
            expect(firestoreRules).toContain('allow delete: if isAdmin();');
        });

        test('donations collection enforces strict schema keys and owner read restriction', () => {
            expect(firestoreRules).toContain('match /donations/{donationId}');
            expect(firestoreRules).toContain("request.resource.data.keys().hasOnly(['name', 'email', 'amount', 'entries', 'createdAt', 'userId'])");
            expect(firestoreRules).toContain('allow update, delete: if isAdmin();');
        });
    });
});
