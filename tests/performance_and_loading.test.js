import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('AutoLux Performance Optimization & Responsive Loading Feedback', () => {

    describe('Phase 1: Database & Query Optimization', () => {
        test('firestore.indexes.json exists and is configured in firebase.json', () => {
            const firebaseJsonPath = path.resolve(process.cwd(), 'firebase.json');
            const indexesJsonPath = path.resolve(process.cwd(), 'firestore.indexes.json');

            expect(fs.existsSync(indexesJsonPath)).toBe(true);
            const firebaseConfig = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
            expect(firebaseConfig.firestore.indexes).toBe('firestore.indexes.json');

            const indexesConfig = JSON.parse(fs.readFileSync(indexesJsonPath, 'utf8'));
            expect(Array.isArray(indexesConfig.indexes)).toBe(true);

            // Verify compound indexes for optimized queries
            const collections = indexesConfig.indexes.map(idx => idx.collectionGroup);
            expect(collections).toContain('reviews');
            expect(collections).toContain('user_rewards');
            expect(collections).toContain('bookings');
            expect(collections).toContain('notifications');
            expect(collections).toContain('support_tickets');
            expect(collections).toContain('referrals');
        });

        test('index.html optimizes reviews payload with query limit', () => {
            const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
            expect(indexHtml).toMatch(/query\(\s*collection\(db,\s*["']reviews["']\),\s*where\(["']status["'],\s*["']==["'],\s*["']approved["']\),\s*limit\(\d+\)\s*\)/);
        });

        test('reviews.html implements pagination with limit and startAfter cursor', () => {
            const reviewsHtml = fs.readFileSync(path.resolve(process.cwd(), 'reviews.html'), 'utf8');
            expect(reviewsHtml).toContain('limit(');
            expect(reviewsHtml).toContain('startAfter(');
            expect(reviewsHtml).toContain('load-more-reviews-btn');
            expect(reviewsHtml).toContain('pagination-status');
        });

        test('account.html optimizes initial load by limiting relational collections', () => {
            const accountHtml = fs.readFileSync(path.resolve(process.cwd(), 'account.html'), 'utf8');
            // Bookings query uses limit
            expect(accountHtml).toMatch(/query\(\s*collection\(db,\s*["']bookings["']\)[\s\S]*?limit\(\d+\)/);
            // Notifications query uses limit
            expect(accountHtml).toMatch(/query\(\s*collection\(db,\s*["']notifications["']\)[\s\S]*?limit\(\d+\)/);
            // Tickets query uses limit
            expect(accountHtml).toMatch(/query\(\s*collection\(db,\s*["']support_tickets["']\)[\s\S]*?limit\(\d+\)/);
            // Referrals query uses limit
            expect(accountHtml).toMatch(/query\(\s*collection\(db,\s*['"]referrals['"]\)[\s\S]*?limit\(\d+\)/);
        });

        test('js/rewards.js applies limits to rewards, user_rewards and transfers queries', () => {
            const rewardsJs = fs.readFileSync(path.resolve(process.cwd(), 'js/rewards.js'), 'utf8');
            expect(rewardsJs).toMatch(/query\(rewardsRef,\s*orderBy\(["']cost["'],\s*["']asc["']\),\s*limit\(\d+\)\)/);
            expect(rewardsJs).toMatch(/query\(userRewardsRef,\s*where\([^)]*\),\s*orderBy\(["']redeemedAt["'],\s*["']desc["']\),\s*limit\(\d+\)\)/);
            expect(rewardsJs).toMatch(/query\(notifRef,\s*where\([^)]*\),\s*limit\(\d+\)\)/);
        });
    });

    describe('Phase 2: Global Loading UI (The Gold Bar)', () => {
        let originalDocument;
        let originalWindow;
        let mockElements;

        beforeEach(() => {
            originalDocument = global.document;
            originalWindow = global.window;
            mockElements = new Map();

            const createMockElement = (tag) => {
                const el = {
                    tagName: tag.toUpperCase(),
                    id: '',
                    className: '',
                    classList: {
                        classes: new Set(),
                        add(c) { this.classes.add(c); el.className = Array.from(this.classes).join(' '); },
                        remove(c) { this.classes.delete(c); el.className = Array.from(this.classes).join(' '); },
                        contains(c) { return this.classes.has(c); }
                    },
                    attributes: {},
                    setAttribute(k, v) { this.attributes[k] = String(v); },
                    getAttribute(k) { return this.attributes[k] || null; },
                    removeAttribute(k) { delete this.attributes[k]; },
                    style: {},
                    children: [],
                    appendChild(child) {
                        this.children.push(child);
                        if (child.id) mockElements.set(child.id, child);
                        return child;
                    },
                    querySelector(sel) {
                        if (sel === '.gold-progress-bar') {
                            return this.children.find(c => c.className === 'gold-progress-bar');
                        }
                        return null;
                    }
                };
                return el;
            };

            global.document = {
                createElement: jest.fn(createMockElement),
                getElementById: jest.fn((id) => mockElements.get(id) || null),
                body: {
                    children: [],
                    appendChild: jest.fn((child) => {
                        if (child.id) mockElements.set(child.id, child);
                        return child;
                    }),
                    contains: jest.fn((el) => el && mockElements.has(el.id))
                },
                addEventListener: jest.fn(),
                readyState: 'complete'
            };

            global.window = {
                location: { origin: 'http://localhost', href: 'http://localhost/', pathname: '/', search: '' },
                addEventListener: jest.fn()
            };
        });

        afterEach(() => {
            global.document = originalDocument;
            global.window = originalWindow;
        });

        test('global.css defines #global-gold-loader with sleek metallic gold gradient and transitions', () => {
            const css = fs.readFileSync(path.resolve(process.cwd(), 'css/global.css'), 'utf8');
            expect(css).toContain('#global-gold-loader');
            expect(css).toContain('.gold-progress-bar');
            expect(css).toContain('.gold-progress-peg');
            expect(css).toContain('#global-gold-loader.hidden');
            // Check metallic gold linear-gradient
            expect(css).toMatch(/linear-gradient\(90deg,[\s\S]*?#D4AF37[\s\S]*?#FFE885[\s\S]*?\)/);
            // Check transition
            expect(css).toMatch(/transition:\s*width[^;]*opacity/);
        });

        test('js/loading_bar.js exports startLoadingBar, stopLoadingBar, and navigation interceptors', async () => {
            const { startLoadingBar, stopLoadingBar, setLoadingBarProgress, getOrCreateLoader, attachNavigationListeners } = await import('../js/loading_bar.js');

            expect(typeof startLoadingBar).toBe('function');
            expect(typeof stopLoadingBar).toBe('function');
            expect(typeof setLoadingBarProgress).toBe('function');
            expect(typeof getOrCreateLoader).toBe('function');
            expect(typeof attachNavigationListeners).toBe('function');
        });

        test('loading bar triggers and manipulates DOM progress state', async () => {
            const { startLoadingBar, stopLoadingBar, setLoadingBarProgress } = await import('../js/loading_bar.js');

            startLoadingBar();
            const loader = global.document.getElementById('global-gold-loader');
            expect(loader).not.toBeNull();
            expect(loader.classList.contains('hidden')).toBe(false);

            const progressBar = loader.querySelector('.gold-progress-bar');
            expect(progressBar).not.toBeNull();
            expect(parseFloat(progressBar.style.width)).toBeGreaterThan(0);

            // Manual progress set
            setLoadingBarProgress(0.5);
            expect(progressBar.style.width).toBe('50%');

            // Complete loading
            stopLoadingBar();
            expect(progressBar.style.width).toBe('100%');
        });

        test('attachNavigationListeners registers click, beforeunload, and pageshow events', async () => {
            const { attachNavigationListeners } = await import('../js/loading_bar.js');

            attachNavigationListeners();

            expect(global.document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), true);
            expect(global.window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
            expect(global.window.addEventListener).toHaveBeenCalledWith('pageshow', expect.any(Function));
        });

        test('navbar.js imports loading_bar.js for automatic sitewide coverage', () => {
            const navbarJs = fs.readFileSync(path.resolve(process.cwd(), 'js/navbar.js'), 'utf8');
            expect(navbarJs).toContain('./loading_bar.js');
        });

        test('admin.html imports loading_bar.js', () => {
            const adminHtml = fs.readFileSync(path.resolve(process.cwd(), 'admin.html'), 'utf8');
            expect(adminHtml).toContain('loading_bar.js');
        });
    });

    describe('Phase 3: Form Submission State Management (No Guessing)', () => {
        test('global.css defines .btn-loading and .gold-spinner with gold accents and spin animation', () => {
            const css = fs.readFileSync(path.resolve(process.cwd(), 'css/global.css'), 'utf8');
            expect(css).toContain('.btn-loading');
            expect(css).toContain('cursor: not-allowed');
            expect(css).toContain('.gold-spinner');
            expect(css).toContain('animation: goldSpin');
            expect(css).toContain('border-top-color: var(--gold, #D4AF37)');
        });

        test('Adding an Address form in account.html implements strict isLoading and re-enables on failure', () => {
            const accountHtml = fs.readFileSync(path.resolve(process.cwd(), 'account.html'), 'utf8');
            // Strict loading state guard
            expect(accountHtml).toContain('isAddressSubmitting');
            expect(accountHtml).toContain("btn.classList.add('btn-loading')");
            expect(accountHtml).toContain('gold-spinner');
            expect(accountHtml).toContain('Adding Address...');
            // Re-enables in finally block
            expect(accountHtml).toMatch(/finally\s*\{[\s\S]*?btn\.disabled\s*=\s*false[\s\S]*?btn\.classList\.remove\(['"]btn-loading['"]\)[\s\S]*?isAddressSubmitting\s*=\s*false/);
        });

        test('Adding a Vehicle form in account.html implements strict isLoading and re-enables on failure', () => {
            const accountHtml = fs.readFileSync(path.resolve(process.cwd(), 'account.html'), 'utf8');
            // Strict loading state guard
            expect(accountHtml).toContain('isVehicleSubmitting');
            expect(accountHtml).toContain("btn.classList.add('btn-loading')");
            expect(accountHtml).toContain('gold-spinner');
            expect(accountHtml).toContain('Adding Vehicle...');
            // Re-enables in finally block
            expect(accountHtml).toMatch(/finally\s*\{[\s\S]*?btn\.disabled\s*=\s*false[\s\S]*?btn\.classList\.remove\(['"]btn-loading['"]\)[\s\S]*?isVehicleSubmitting\s*=\s*false/);
        });

        test('Submitting a Reply in account.html implements strict isLoading and re-enables on failure', () => {
            const accountHtml = fs.readFileSync(path.resolve(process.cwd(), 'account.html'), 'utf8');
            expect(accountHtml).toContain("btn.classList.add('btn-loading')");
            expect(accountHtml).toContain('gold-spinner');
            expect(accountHtml).toContain('Sending...');
            // Re-enables in finally block
            expect(accountHtml).toMatch(/finally\s*\{[\s\S]*?btn\.disabled\s*=\s*false[\s\S]*?btn\.classList\.remove\(['"]btn-loading['"]\)/);
        });

        test('Booking an Appointment form in booking.html implements strict isLoading and re-enables on failure', () => {
            const bookingHtml = fs.readFileSync(path.resolve(process.cwd(), 'booking.html'), 'utf8');
            // Strict loading guard
            expect(bookingHtml).toContain('isBookingSubmitting');
            expect(bookingHtml).toContain("submitBtn.classList.add('btn-loading')");
            expect(bookingHtml).toContain('gold-spinner');
            expect(bookingHtml).toContain('Booking Appointment...');
            // Re-enables in finally block
            expect(bookingHtml).toMatch(/finally\s*\{[\s\S]*?submitBtn\.disabled\s*=\s*false[\s\S]*?submitBtn\.classList\.remove\(['"]btn-loading['"]\)[\s\S]*?isBookingSubmitting\s*=\s*false/);
        });

        test('Sign-in form in sign in beta.html implements strict loading state and re-enables on auth error', () => {
            const signInHtml = fs.readFileSync(path.resolve(process.cwd(), 'sign in beta.html'), 'utf8');
            expect(signInHtml).toContain("submitBtn.classList.add('btn-loading')");
            expect(signInHtml).toContain('gold-spinner');
            expect(signInHtml).toContain('startLoadingBar()');
            // Re-enables in catch block
            expect(signInHtml).toMatch(/catch\s*\(error\)\s*\{[\s\S]*?stopLoadingBar\(\)[\s\S]*?submitBtn\.disabled\s*=\s*false[\s\S]*?submitBtn\.classList\.remove\(['"]btn-loading['"]\)/);
        });
    });
});
