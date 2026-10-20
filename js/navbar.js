/**
 * AUTOLUX Global Navigation & Persistent Layout Component
 * Standardizes mobile drawer, active states, cross-page smooth anchors, and auth state
 */

import { getAuthStatePromise, ensureUserDocument } from './auth.js';

export function getNavbarHTML(activeRoute = '') {
    return `
    <nav class="site-navbar" id="global-navbar" aria-label="Main Navigation">
        <div class="nav-container">
            <a href="index.html" class="logo" aria-label="AutoLux Detailing Home">
                <span class="logo-text">AUTOLUX</span>
                <svg class="checker-flag" viewBox="0 0 24 18" width="1.1em" height="0.85em" aria-label="Checker Flag" aria-hidden="true">
                    <rect width="24" height="18" fill="#FFFFFF" rx="2"/>
                    <rect x="0" y="0" width="6" height="4.5" fill="#000000"/>
                    <rect x="12" y="0" width="6" height="4.5" fill="#000000"/>
                    <rect x="6" y="4.5" width="6" height="4.5" fill="#000000"/>
                    <rect x="18" y="4.5" width="6" height="4.5" fill="#000000"/>
                    <rect x="0" y="9" width="6" height="4.5" fill="#000000"/>
                    <rect x="12" y="9" width="6" height="4.5" fill="#000000"/>
                    <rect x="6" y="13.5" width="6" height="4.5" fill="#000000"/>
                    <rect x="18" y="13.5" width="6" height="4.5" fill="#000000"/>
                    <rect x="0" y="0" width="24" height="18" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" rx="2"/>
                </svg>
            </a>

            <!-- Mobile Menu Toggle Button -->
            <button class="menu-toggle" id="mobile-menu-btn" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-links">
                <span class="hamburger-bar"></span>
                <span class="hamburger-bar"></span>
                <span class="hamburger-bar"></span>
            </button>

            <!-- Navigation Links -->
            <div class="nav-links" id="nav-links">
                <a href="index.html" class="nav-link ${activeRoute === 'home' ? 'active' : ''}" data-route="home">Home</a>
                <a href="index.html#process" class="nav-link ${activeRoute === 'process' ? 'active' : ''}" data-route="process">Process</a>
                <a href="index.html#pricing" class="nav-link ${activeRoute === 'pricing' ? 'active' : ''}" data-route="pricing">Pricing</a>
                <a href="index.html#gallery" class="nav-link ${activeRoute === 'gallery' ? 'active' : ''}" data-route="gallery">Gallery</a>
                <a href="reviews.html" class="nav-link ${activeRoute === 'reviews' ? 'active' : ''}" data-route="reviews">Reviews</a>
                <a href="rewards.html" class="nav-link ${activeRoute === 'rewards' ? 'active' : ''}" data-route="rewards">Rewards</a>
                <a href="quote.html" class="nav-link ${activeRoute === 'quote' ? 'active' : ''}" data-route="quote">Custom Quote</a>
                <div class="nav-actions">
                    <a href="booking.html" class="nav-cta btn-gold ${activeRoute === 'booking' ? 'active' : ''}" data-route="booking">Book Now</a>
                    <a href="sign in beta.html" class="auth-btn nav-auth-link ${activeRoute === 'account' ? 'active' : ''}" id="nav-auth-btn" aria-label="Sign in to your account">Sign In</a>
                </div>
            </div>
        </div>
    </nav>
    `;
}

export function getFooterHTML() {
    return `
    <footer class="site-footer" id="site-footer">
        <div class="footer-container">
            <div class="footer-brand">
                <a href="index.html" class="logo" aria-label="AutoLux Detailing Home">
                    <span class="logo-text">AUTOLUX</span>
                    <svg class="checker-flag" viewBox="0 0 24 18" width="1.1em" height="0.85em" aria-label="Checker Flag" aria-hidden="true">
                        <rect width="24" height="18" fill="#FFFFFF" rx="2"/>
                        <rect x="0" y="0" width="6" height="4.5" fill="#000000"/>
                        <rect x="12" y="0" width="6" height="4.5" fill="#000000"/>
                        <rect x="6" y="4.5" width="6" height="4.5" fill="#000000"/>
                        <rect x="18" y="4.5" width="6" height="4.5" fill="#000000"/>
                        <rect x="0" y="9" width="6" height="4.5" fill="#000000"/>
                        <rect x="12" y="9" width="6" height="4.5" fill="#000000"/>
                        <rect x="6" y="13.5" width="6" height="4.5" fill="#000000"/>
                        <rect x="18" y="13.5" width="6" height="4.5" fill="#000000"/>
                        <rect x="0" y="0" width="24" height="18" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" rx="2"/>
                    </svg>
                </a>
                <p>Buford's premier luxury mobile detailing studio. We bring the showroom back to your driveway with precision craftsmanship, pH-neutral safe foam, and ceramic protection.</p>
            </div>

            <div class="footer-col">
                <h4>Navigation</h4>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="index.html#process">Our Process</a></li>
                    <li><a href="index.html#pricing">Packages & Pricing</a></li>
                    <li><a href="index.html#gallery">Recent Gallery</a></li>
                    <li><a href="reviews.html">Client Reviews</a></li>
                    <li><a href="rewards.html">Loyalty Rewards</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>Services</h4>
                <ul>
                    <li><a href="booking.html?package=sedan">Luxury Sedan Detail</a></li>
                    <li><a href="booking.html?package=suv">Luxury SUV Package</a></li>
                    <li><a href="booking.html?package=truck">Heavy-Duty Truck</a></li>
                    <li><a href="booking.html?package=van">Executive Sprinter Van</a></li>
                    <li><a href="booking.html?package=club">Detailing Club Plan ($129/mo)</a></li>
                    <li><a href="quote.html">Custom Fleet / PPF Quote</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>Concierge</h4>
                <div class="footer-contact-item">
                    <span>📞</span>
                    <a href="tel:+15551234567">(555) 123-4567</a>
                </div>
                <div class="footer-contact-item">
                    <span>✉️</span>
                    <a href="mailto:booking@autolux.com">booking@autolux.com</a>
                </div>
                <div class="footer-contact-item">
                    <span>📍</span>
                    <span>Buford, GA & Surrounding 30-Mile Area</span>
                </div>
                <div style="margin-top: 15px;">
                    <a href="donate.html" class="nav-link" style="padding: 6px 0; color: var(--gold); display: inline-flex; align-items: center; gap: 6px;">
                        <span>🏆</span> Community Sweepstakes
                    </a>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <div>&copy; 2026 Unstoppable Detailing Services / AUTOLUX. All rights reserved. Buford, GA.</div>
            <div class="footer-social-links">
                <a href="#" aria-label="Instagram">Instagram</a>
                <span>&bull;</span>
                <a href="#" aria-label="Facebook">Facebook</a>
                <span>&bull;</span>
                <a href="#" aria-label="YouTube">YouTube</a>
            </div>
        </div>
    </footer>
    `;
}

/**
 * Initializes the mobile menu, active navigation routes, smooth hash links, and auth state.
 */
export function initNavbar() {
    const nav = document.getElementById('global-navbar');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const authBtn = document.getElementById('nav-auth-btn');

    if (!menuBtn || !navLinks) return;

    // Mobile Menu Toggle
    menuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    const closeMobileMenu = () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    };

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMobileMenu();
            menuBtn.focus();
        }
    });

    // Add scroll header border effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav?.classList.add('scrolled');
        } else {
            nav?.classList.remove('scrolled');
        }
    }, { passive: true });

    // Handle Active Route highlighting
    const currentPath = window.location.pathname.toLowerCase();
    const links = navLinks.querySelectorAll('a');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Smart click handler for anchor links
        link.addEventListener('click', (e) => {
            closeMobileMenu();

            // If it's a hash link on the current page
            if (href.startsWith('#') || (href.startsWith('index.html#') && (currentPath.endsWith('index.html') || currentPath === '/' || currentPath === ''))) {
                const targetId = href.split('#')[1];
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                    history.pushState(null, null, `#${targetId}`);
                }
            }
        });

        // Match current route
        if (
            (href === 'booking.html' && currentPath.endsWith('booking.html')) ||
            (href === 'quote.html' && currentPath.endsWith('quote.html')) ||
            (href === 'reviews.html' && currentPath.endsWith('reviews.html')) ||
            (href === 'rewards.html' && currentPath.endsWith('rewards.html')) ||
            (href === 'donate.html' && currentPath.endsWith('donate.html')) ||
            (href === 'index.html' && (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === ''))
        ) {
            link.classList.add('active');
        }
    });

    // Populate Dynamic Auth State
    hydrateNavAuth(authBtn);
}

/**
 * Hydrates authentication state into the navbar button across all pages
 */
async function hydrateNavAuth(authBtn) {
    if (!authBtn) return;

    try {
        const user = await getAuthStatePromise();
        if (user) {
            authBtn.textContent = 'My Account';
            authBtn.classList.remove('btn-gold');
            authBtn.classList.add('auth-btn');

            let isAdmin = false;
            try {
                const userData = await ensureUserDocument(user);
                if (userData && userData.isAdmin) {
                    isAdmin = true;
                }
            } catch (err) {
                console.warn('Could not determine admin status in navbar:', err);
            }

            const currentPath = window.location.pathname.toLowerCase();
            if (currentPath.endsWith('account.html') || currentPath.endsWith('admin.html')) {
                authBtn.classList.add('active');
            }

            authBtn.href = isAdmin ? 'admin.html' : 'account.html';
        } else {
            authBtn.textContent = 'Sign In';
            authBtn.href = 'sign in beta.html';
            authBtn.classList.remove('active');
        }
    } catch (err) {
        console.warn('Error hydrating nav auth:', err);
    }
}

// Auto-initialize when loaded as module if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}
