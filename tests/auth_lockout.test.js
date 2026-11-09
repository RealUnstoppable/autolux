import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Phase 1: Firebase Reconnection, Auth Lockout Guard & Latency Optimization', () => {

    describe('Firebase Configuration & Session Persistence', () => {
        test('firebaseConfig is exported from js/auth.js with canonical values', async () => {
            const { firebaseConfig } = await import('../js/auth.js');
            expect(firebaseConfig).toBeDefined();
            expect(firebaseConfig.apiKey).toBe("AIzaSyBgrI9HwJPSc5b4pu2Egsv4DE7shNwptSw");
            expect(firebaseConfig.authDomain).toBe("dts-hub-website.firebaseapp.com");
            expect(firebaseConfig.projectId).toBe("dts-hub-website");
            expect(firebaseConfig.storageBucket).toBe("dts-hub-website.firebasestorage.app");
            expect(firebaseConfig.messagingSenderId).toBe("48345990988");
            expect(firebaseConfig.appId).toBe("1:48345990988:web:e3662c9b508168546471e9");
            expect(firebaseConfig.measurementId).toBe("G-ZN3YJPHVGX");
        });

        test('env.js defines mandatory Firebase configuration matching dts-hub-website', () => {
            const envContent = fs.readFileSync(path.resolve(process.cwd(), 'env.js'), 'utf8');
            expect(envContent).toContain('FIREBASE_API_KEY: "AIzaSyBgrI9HwJPSc5b4pu2Egsv4DE7shNwptSw"');
            expect(envContent).toContain('FIREBASE_AUTH_DOMAIN: "autolux-detailing.firebaseapp.com"');
            expect(envContent).toContain('FIREBASE_PROJECT_ID: "dts-hub-website"');
            expect(envContent).toContain('FIREBASE_STORAGE_BUCKET: "dts-hub-website.firebasestorage.app"');
            expect(envContent).toContain('FIREBASE_MESSAGING_SENDER_ID: "48345990988"');
            expect(envContent).toContain('FIREBASE_APP_ID: "1:48345990988:web:e3662c9b508168546471e9"');
            expect(envContent).toContain('FIREBASE_MEASUREMENT_ID: "G-ZN3YJPHVGX"');
        });

        test('HTML pages define window.ENV with dts-hub-website config', () => {
            const pages = [
                'index.html',
                'sign in beta.html',
                'account.html',
                'booking.html',
                'donate.html'
            ];

            for (const page of pages) {
                const content = fs.readFileSync(path.resolve(process.cwd(), page), 'utf8');
                expect(content).toContain('FIREBASE_AUTH_DOMAIN: "autolux-detailing.firebaseapp.com"');
                expect(content).toContain('FIREBASE_PROJECT_ID: "dts-hub-website"');
            }
        });

        test('donate.html binds Firebase Auth (onAuthStateChanged)', () => {
            const donateHtml = fs.readFileSync(path.resolve(process.cwd(), 'donate.html'), 'utf8');
            expect(donateHtml).toContain('onAuthStateChanged');
            expect(donateHtml).toContain('authenticatedUser');
            expect(donateHtml).toContain('userId: authenticatedUser ? authenticatedUser.uid : null');
        });
    });

    describe('Latency & Non-Blocking Parallel Firestore Queries', () => {
        test('account.html queries relational collections concurrently via Promise.allSettled', () => {
            const accountHtml = fs.readFileSync(path.resolve(process.cwd(), 'account.html'), 'utf8');
            expect(accountHtml).toMatch(/Promise\.allSettled\(\s*\[[\s\S]*?getDocs\(appointmentsQuery\)[\s\S]*?getDocs\(notificationsQuery\)[\s\S]*?loadTickets\(user\)[\s\S]*?fetchUserServiceLogs\(user\.uid\)/);
        });

        test('reviews.html utilizes sessionStorage caching for static review payloads', () => {
            const reviewsHtml = fs.readFileSync(path.resolve(process.cwd(), 'reviews.html'), 'utf8');
            expect(reviewsHtml).toContain('REVIEWS_SESSION_CACHE_KEY');
            expect(reviewsHtml).toContain('safeGetSessionStorage');
            expect(reviewsHtml).toContain('safeSetSessionStorage');
        });

        test('js/auth.js executes user document writes in parallel using Promise.all', () => {
            const authJs = fs.readFileSync(path.resolve(process.cwd(), 'js/auth.js'), 'utf8');
            expect(authJs).toContain('await Promise.all(writeOps)');
            expect(authJs).toContain('await Promise.all(backgroundOps)');
        });
    });

    describe('Auth Lockout & Interaction Lock Guard', () => {
        let originalDocument;
        let originalWindow;
        let elementsMap;
        let eventListeners;

        beforeEach(() => {
            originalDocument = global.document;
            originalWindow = global.window;
            elementsMap = new Map();
            eventListeners = { window: {}, document: {} };

            const createMockElement = (tag, id = '', className = '') => {
                const attrs = {};
                const classes = new Set(className ? className.split(' ') : []);
                const el = {
                    tagName: tag.toUpperCase(),
                    id,
                    className,
                    classList: {
                        add: jest.fn((c) => { classes.add(c); el.className = Array.from(classes).join(' '); }),
                        remove: jest.fn((c) => { classes.delete(c); el.className = Array.from(classes).join(' '); }),
                        contains: jest.fn((c) => classes.has(c))
                    },
                    style: {},
                    setAttribute: jest.fn((k, v) => { attrs[k] = String(v); }),
                    getAttribute: jest.fn((k) => attrs[k] !== undefined ? attrs[k] : null),
                    removeAttribute: jest.fn((k) => { delete attrs[k]; }),
                    addEventListener: jest.fn(),
                    innerHTML: '',
                    children: []
                };
                if (id) elementsMap.set(id, el);
                return el;
            };

            const bodyEl = createMockElement('body', 'body');
            const submitBtnEl = createMockElement('button', 'submit-btn');
            const navbarEl = createMockElement('nav', 'global-navbar');
            const link1 = createMockElement('a', 'link-1');
            const link2 = createMockElement('a', 'link-2');

            global.document = {
                body: bodyEl,
                createElement: jest.fn((tag) => createMockElement(tag)),
                getElementById: jest.fn((id) => elementsMap.get(id) || null),
                querySelector: jest.fn((sel) => {
                    if (sel === '#submit-btn') return submitBtnEl;
                    if (sel === '#global-navbar' || sel === '.site-navbar') return navbarEl;
                    if (sel === '#auth-card' || sel === '.auth-card') return bodyEl;
                    return null;
                }),
                querySelectorAll: jest.fn((sel) => {
                    if (sel.includes('a')) return [link1, link2];
                    return [];
                })
            };

            global.window = {
                addEventListener: jest.fn((event, handler) => {
                    if (!eventListeners.window[event]) eventListeners.window[event] = [];
                    eventListeners.window[event].push(handler);
                }),
                removeEventListener: jest.fn((event, handler) => {
                    if (eventListeners.window[event]) {
                        eventListeners.window[event] = eventListeners.window[event].filter(h => h !== handler);
                    }
                }),
                history: {
                    length: 2,
                    back: jest.fn(),
                    pushState: jest.fn()
                },
                location: { href: 'http://localhost/sign%20in%20beta.html' },
                confirm: jest.fn(() => false)
            };
        });

        afterEach(() => {
            global.document = originalDocument;
            global.window = originalWindow;
        });

        test('startAuthLockout disables clicks on submit button, navbar, and links', async () => {
            const { startAuthLockout, stopAuthLockout, isAuthLockActive } = await import('../js/auth_lockout.js');

            startAuthLockout();

            expect(isAuthLockActive()).toBe(true);
            expect(global.document.body.classList.add).toHaveBeenCalledWith('auth-interaction-locked');

            const submitBtn = global.document.getElementById('submit-btn');
            expect(submitBtn.style.pointerEvents).toBe('none');
            expect(submitBtn.setAttribute).toHaveBeenCalledWith('aria-disabled', 'true');

            const navbar = global.document.getElementById('global-navbar');
            expect(navbar.style.pointerEvents).toBe('none');
            expect(navbar.setAttribute).toHaveBeenCalledWith('aria-disabled', 'true');

            const link1 = global.document.getElementById('link-1');
            expect(link1.style.pointerEvents).toBe('none');
            expect(link1.setAttribute).toHaveBeenCalledWith('aria-disabled', 'true');

            stopAuthLockout();
            expect(isAuthLockActive()).toBe(false);
            expect(global.document.body.classList.remove).toHaveBeenCalledWith('auth-interaction-locked');
            expect(submitBtn.removeAttribute).toHaveBeenCalledWith('aria-disabled');
            expect(navbar.removeAttribute).toHaveBeenCalledWith('aria-disabled');
        });

        test('startAuthLockout attaches beforeunload and popstate guards', async () => {
            const { startAuthLockout, stopAuthLockout } = await import('../js/auth_lockout.js');

            startAuthLockout();

            expect(global.window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
            expect(global.window.addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
            expect(global.window.history.pushState).toHaveBeenCalled();

            // Verify beforeunload behavior
            const beforeUnloadHandlers = eventListeners.window['beforeunload'] || [];
            expect(beforeUnloadHandlers.length).toBeGreaterThan(0);
            const mockEvent = { preventDefault: jest.fn(), returnValue: '' };
            const returnedMsg = beforeUnloadHandlers[0](mockEvent);
            expect(returnedMsg).toContain('Are you sure you want to reload or leave this page while authentication is in progress?');
            expect(mockEvent.preventDefault).toHaveBeenCalled();

            // Verify popstate behavior with cancel confirmation
            const popStateHandlers = eventListeners.window['popstate'] || [];
            expect(popStateHandlers.length).toBeGreaterThan(0);
            popStateHandlers[0]({});
            expect(global.window.confirm).toHaveBeenCalledWith(expect.stringContaining('Are you sure you want to reload or leave this page while authentication is in progress?'));
            expect(global.window.history.pushState).toHaveBeenCalledTimes(2); // Initial + cancel repush

            stopAuthLockout();
            expect(global.window.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
            expect(global.window.removeEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
        });

        test('45-Second Watchdog Timer triggers timeout callback and renders fallback UI', async () => {
            jest.useFakeTimers();
            const { startAuthLockout, stopAuthLockout, isAuthLockActive, renderTimeoutCard } = await import('../js/auth_lockout.js');

            const container = global.document.createElement('div');
            container.id = 'auth-card';
            elementsMap.set('auth-card', container);

            const onTimeoutMock = jest.fn();

            startAuthLockout({
                container,
                onTimeout: onTimeoutMock,
                timeoutMs: 45000
            });

            expect(isAuthLockActive()).toBe(true);

            // Fast-forward 45 seconds
            jest.advanceTimersByTime(45000);

            expect(isAuthLockActive()).toBe(false);
            expect(onTimeoutMock).toHaveBeenCalled();

            // Test renderTimeoutCard output
            renderTimeoutCard(container);
            expect(container.innerHTML).toContain('Experiencing network or authentication issues.');
            expect(container.innerHTML).toContain('Return to Previous Page');
            expect(container.innerHTML).toContain('timeout-return-btn');

            stopAuthLockout();
            jest.useRealTimers();
        });

        test('handleReturnNavigation navigates back if history exists or redirects to index.html', async () => {
            const { handleReturnNavigation } = await import('../js/auth_lockout.js');

            global.window.history.length = 2;
            handleReturnNavigation();
            expect(global.window.history.back).toHaveBeenCalled();

            global.window.history.length = 1;
            handleReturnNavigation();
            expect(global.window.location.href).toBe('index.html');
        });
    });

    describe('Global Styles for Interaction Lock and Timeout Fallback', () => {
        test('global.css defines .auth-interaction-locked, .auth-timeout-card, and .btn-timeout-return', () => {
            const css = fs.readFileSync(path.resolve(process.cwd(), 'css/global.css'), 'utf8');
            expect(css).toContain('.auth-interaction-locked');
            expect(css).toContain('pointer-events: none !important');
            expect(css).toContain('.auth-timeout-card');
            expect(css).toContain('.btn-timeout-return');
            expect(css).toContain('pointer-events: auto !important');
        });
    });
});
