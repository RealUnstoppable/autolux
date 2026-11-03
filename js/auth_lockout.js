/**
 * AUTOLUX Authentication Interaction Lock & 45-Second Watchdog
 * Prevents double-clicks, back-button/swipe navigation, and reload interrupts
 * during authentication checks and login/signup transitions.
 */

let isAuthLocked = false;
let watchdogTimer = null;
let boundBeforeUnloadHandler = null;
let boundPopStateHandler = null;
let lockedElements = [];

/**
 * Checks if the authentication interaction lock is currently active.
 * @returns {boolean}
 */
export function isAuthLockActive() {
    return isAuthLocked;
}

/**
 * Handles the fallback return navigation when the timeout button is clicked.
 */
export function handleReturnNavigation() {
    if (typeof window === 'undefined') return;
    try {
        if (window.history && window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    } catch (e) {
        window.location.href = 'index.html';
    }
}

/**
 * Renders the clean luxury fallback modal/card when auth times out after 45s.
 * @param {HTMLElement|string} container - Element or selector where card should render
 * @param {Function} [onReturn] - Optional custom return handler
 */
export function renderTimeoutCard(container, onReturn = null) {
    if (typeof document === 'undefined') return;

    let targetEl = null;
    if (typeof container === 'string') {
        targetEl = document.querySelector(container);
    } else if (container && container.nodeType === 1) {
        targetEl = container;
    } else {
        targetEl = document.getElementById('auth-card') || document.querySelector('.auth-card') || document.getElementById('loading-overlay') || document.body;
    }

    if (!targetEl) return;

    targetEl.innerHTML = `
        <div class="auth-timeout-card" id="auth-timeout-card" role="alert" aria-live="assertive">
            <span class="auth-timeout-icon" aria-hidden="true">⚠️</span>
            <h2 class="auth-timeout-title">Experiencing network or authentication issues.</h2>
            <p class="auth-timeout-desc">The authentication process timed out after 45 seconds. Please check your connection and try again.</p>
            <button type="button" class="btn-timeout-return timeout-allow-click" id="timeout-return-btn" aria-label="Return to previous page">
                <span>&larr; Return to Previous Page</span>
            </button>
        </div>
    `;

    const returnBtn = document.getElementById('timeout-return-btn');
    if (returnBtn) {
        returnBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof onReturn === 'function') {
                onReturn();
            } else {
                handleReturnNavigation();
            }
        });
    }
}

/**
 * Starts the authentication interaction lock and 45-second watchdog timer.
 * @param {Object} [options={}]
 * @param {HTMLElement} [options.submitBtn] - Form submit button to disable
 * @param {HTMLElement|string} [options.container] - Container for timeout card
 * @param {Function} [options.onTimeout] - Custom timeout callback
 * @param {number} [options.timeoutMs=45000] - Watchdog duration in ms (default 45000)
 */
export function startAuthLockout(options = {}) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Clear any previous active lockout
    stopAuthLockout();

    isAuthLocked = true;
    lockedElements = [];

    const timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : 45000;

    // 1. Lock clicks across the page
    if (document.body) {
        document.body.classList.add('auth-interaction-locked');
    }

    // Disable Submit Button
    const submitBtn = options.submitBtn || document.getElementById('submit-btn');
    if (submitBtn) {
        lockedElements.push({
            el: submitBtn,
            prevPointerEvents: submitBtn.style?.pointerEvents || '',
            prevAriaDisabled: submitBtn.getAttribute('aria-disabled')
        });
        submitBtn.style.pointerEvents = 'none';
        submitBtn.setAttribute('aria-disabled', 'true');
    }

    // Disable Navbar
    const navbar = document.getElementById('global-navbar') || document.querySelector('.site-navbar');
    if (navbar) {
        lockedElements.push({
            el: navbar,
            prevPointerEvents: navbar.style?.pointerEvents || '',
            prevAriaDisabled: navbar.getAttribute('aria-disabled')
        });
        navbar.style.pointerEvents = 'none';
        navbar.setAttribute('aria-disabled', 'true');
    }

    // Disable all redirect links
    const links = document.querySelectorAll('a:not(.timeout-allow-click)');
    links.forEach(link => {
        lockedElements.push({
            el: link,
            prevPointerEvents: link.style?.pointerEvents || '',
            prevAriaDisabled: link.getAttribute('aria-disabled')
        });
        link.style.pointerEvents = 'none';
        link.setAttribute('aria-disabled', 'true');
    });

    // 2. Navigation / Reload Guard
    boundBeforeUnloadHandler = (e) => {
        if (!isAuthLocked) return;
        const msg = "Are you sure you want to reload or leave this page while authentication is in progress?";
        e.preventDefault();
        e.returnValue = msg;
        return msg;
    };
    window.addEventListener('beforeunload', boundBeforeUnloadHandler);

    boundPopStateHandler = (e) => {
        if (!isAuthLocked) return;
        const confirmed = typeof window.confirm === 'function'
            ? window.confirm("Are you sure you want to reload or leave this page while authentication is in progress?")
            : false;

        if (!confirmed) {
            try {
                window.history.pushState({ authLock: true }, document.title, window.location.href);
            } catch (err) {}
        } else {
            stopAuthLockout();
            try {
                window.history.back();
            } catch (err) {}
        }
    };
    window.addEventListener('popstate', boundPopStateHandler);

    // Push initial history state to trap back button
    try {
        window.history.pushState({ authLock: true }, document.title, window.location.href);
    } catch (err) {}

    // 3. 45-Second Watchdog Timer
    watchdogTimer = setTimeout(() => {
        if (!isAuthLocked) return;
        stopAuthLockout();

        if (typeof options.onTimeout === 'function') {
            options.onTimeout();
        } else {
            renderTimeoutCard(options.container);
        }
    }, timeoutMs);
}

/**
 * Stops the authentication interaction lock, releases event listeners, and restores pointer events.
 */
export function stopAuthLockout() {
    isAuthLocked = false;

    if (watchdogTimer) {
        clearTimeout(watchdogTimer);
        watchdogTimer = null;
    }

    if (typeof window !== 'undefined') {
        if (boundBeforeUnloadHandler) {
            window.removeEventListener('beforeunload', boundBeforeUnloadHandler);
            boundBeforeUnloadHandler = null;
        }
        if (boundPopStateHandler) {
            window.removeEventListener('popstate', boundPopStateHandler);
            boundPopStateHandler = null;
        }
    }

    if (typeof document !== 'undefined') {
        if (document.body) {
            document.body.classList.remove('auth-interaction-locked');
        }

        lockedElements.forEach(({ el, prevPointerEvents, prevAriaDisabled }) => {
            if (el && el.style) {
                el.style.pointerEvents = prevPointerEvents;
                if (prevAriaDisabled === null) {
                    el.removeAttribute('aria-disabled');
                } else {
                    el.setAttribute('aria-disabled', prevAriaDisabled);
                }
            }
        });
        lockedElements = [];
    }
}
