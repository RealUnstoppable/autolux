/**
 * AutoLux Global Gold Loading Bar
 * Premium top-of-page progress bar (NProgress style) for route changes and heavy data operations.
 * Features a metallic gold gradient, trickle animation, and graceful fade-out.
 */

let loaderEl = null;
let progressBarEl = null;
let currentProgress = null;
let trickleTimer = null;
let isInitialized = false;

/**
 * Creates or retrieves the global loader DOM element.
 * @returns {HTMLElement}
 */
export function getOrCreateLoader() {
    if (typeof document === 'undefined') return null;

    if (!loaderEl || !document.body.contains(loaderEl)) {
        let existing = document.getElementById('global-gold-loader');
        if (existing) {
            loaderEl = existing;
            progressBarEl = existing.querySelector('.gold-progress-bar');
        } else {
            loaderEl = document.createElement('div');
            loaderEl.id = 'global-gold-loader';
            loaderEl.className = 'hidden';
            loaderEl.setAttribute('role', 'progressbar');
            loaderEl.setAttribute('aria-valuemin', '0');
            loaderEl.setAttribute('aria-valuemax', '100');
            loaderEl.setAttribute('aria-valuenow', '0');

            progressBarEl = document.createElement('div');
            progressBarEl.className = 'gold-progress-bar';

            const peg = document.createElement('div');
            peg.className = 'gold-progress-peg';
            progressBarEl.appendChild(peg);

            loaderEl.appendChild(progressBarEl);
            document.body.appendChild(loaderEl);
        }
    }
    return loaderEl;
}

/**
 * Sets the progress bar to a specific value between 0 and 1.
 * @param {number} n - Progress fraction (0 to 1)
 */
export function setLoadingBarProgress(n) {
    getOrCreateLoader();
    if (!progressBarEl || !loaderEl) return;

    const clamped = Math.max(0, Math.min(1, n));
    currentProgress = clamped;

    loaderEl.classList.remove('hidden');
    loaderEl.setAttribute('aria-valuenow', Math.round(clamped * 100));
    progressBarEl.style.width = `${clamped * 100}%`;
}

/**
 * Starts the gold loading bar with a smooth trickle animation.
 */
export function startLoadingBar() {
    getOrCreateLoader();
    if (!progressBarEl || !loaderEl) return;

    if (trickleTimer) {
        clearInterval(trickleTimer);
        trickleTimer = null;
    }

    // Initial jump
    setLoadingBarProgress(0.18);

    // Trickle forward towards 90%
    trickleTimer = setInterval(() => {
        if (currentProgress === null || currentProgress >= 0.90) {
            return;
        }
        // Diminishing step size as it nears 90%
        const delta = (0.90 - currentProgress) * 0.12 + Math.random() * 0.04;
        setLoadingBarProgress(currentProgress + delta);
    }, 220);
}

/**
 * Completes the loading bar: jumps to 100% and smoothly fades out.
 */
export function stopLoadingBar() {
    if (trickleTimer) {
        clearInterval(trickleTimer);
        trickleTimer = null;
    }

    if (!loaderEl || !progressBarEl || currentProgress === null) {
        return;
    }

    // Complete to 100%
    setLoadingBarProgress(1.0);

    // Fade out after completion
    setTimeout(() => {
        if (loaderEl) {
            loaderEl.classList.add('hidden');
        }
        setTimeout(() => {
            if (progressBarEl) {
                progressBarEl.style.width = '0%';
            }
            currentProgress = null;
        }, 350);
    }, 250);
}

/**
 * Intercepts internal link clicks to trigger the global loading bar on route changes.
 */
export function attachNavigationListeners() {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip anchors, javascript, telephone, mailto
        if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('tel:') || href.startsWith('mailto:')) {
            return;
        }

        // Skip modified clicks (new tab, etc.)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
            return;
        }

        // Skip explicit new-window targets
        if (link.target === '_blank' || link.target === '_parent' || link.target === '_top') {
            return;
        }

        // Skip external origins
        try {
            const url = new URL(href, window.location.href);
            if (url.origin !== window.location.origin) {
                return;
            }
            // If same page with just hash or query change on same file
            if (url.pathname === window.location.pathname && url.search === window.location.search) {
                return;
            }
        } catch (err) {
            return;
        }

        // Valid route change triggered
        startLoadingBar();
    }, true);

    // Also trigger on browser page navigation/unload
    window.addEventListener('beforeunload', () => {
        startLoadingBar();
    });

    // Reset when navigating back through history (bfcache)
    window.addEventListener('pageshow', () => {
        stopLoadingBar();
    });
}

/**
 * Initializes the global gold loading bar system.
 */
export function initLoadingBar() {
    if (isInitialized || typeof window === 'undefined') return;
    isInitialized = true;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            getOrCreateLoader();
            attachNavigationListeners();
        });
    } else {
        getOrCreateLoader();
        attachNavigationListeners();
    }
}

// Global exposure for standalone scripts / onclick handlers
if (typeof window !== 'undefined') {
    window.AutoLuxLoader = {
        start: startLoadingBar,
        stop: stopLoadingBar,
        set: setLoadingBarProgress,
        init: initLoadingBar
    };
    initLoadingBar();
}
