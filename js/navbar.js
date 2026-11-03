/**
 * AUTOLUX Global Navigation & Persistent Layout Component
 * Standardizes mobile drawer, active states, cross-page smooth anchors, animated gold underline, and auth state
 */

import { getAuthStatePromise, ensureUserDocument } from './auth.js';
import './loading_bar.js';

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

            <!-- 6 Core Navigation Links with Animated Gold Underline -->
            <div class="nav-links" id="nav-links">
                <div class="nav-items-wrapper" id="nav-items-wrapper">
                    <a href="index.html#process" class="nav-link ${activeRoute === 'process' ? 'active' : ''}" data-route="process" id="nav-item-process">Process</a>
                    <a href="index.html#pricing" class="nav-link ${activeRoute === 'pricing' ? 'active' : ''}" data-route="pricing" id="nav-item-pricing">Pricing</a>
                    <a href="index.html#gallery" class="nav-link ${activeRoute === 'gallery' ? 'active' : ''}" data-route="gallery" id="nav-item-gallery">Gallery</a>
                    <a href="reviews.html" class="nav-link ${activeRoute === 'reviews' ? 'active' : ''}" data-route="reviews" id="nav-item-reviews">Reviews</a>
                    <a href="rewards.html" class="nav-link ${activeRoute === 'rewards' ? 'active' : ''}" data-route="rewards" id="nav-item-rewards">Rewards</a>
                    <a href="quote.html" class="nav-link ${activeRoute === 'quote' ? 'active' : ''}" data-route="quote" id="nav-item-quote">Custom Quote</a>
                    <div class="nav-gold-underline" id="nav-gold-underline" aria-hidden="true"></div>
                </div>
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
                    <li><a href="index.html#process">Our Process</a></li>
                    <li><a href="index.html#pricing">Packages & Pricing</a></li>
                    <li><a href="index.html#gallery">Recent Gallery</a></li>
                    <li><a href="reviews.html">Client Reviews</a></li>
                    <li><a href="rewards.html">Loyalty Rewards</a></li>
                    <li><a href="quote.html">Custom Fleet / PPF Quote</a></li>
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
                    <a href="tel:4045422712">(404) 542-2712</a>
                </div>
                <div class="footer-contact-item">
                    <span>✉️</span>
                    <a href="mailto:coiner.double0y@icloud.com">coiner.double0y@icloud.com</a>
                </div>
                <div class="footer-contact-item">
                    <span>📍</span>
                    <span>Buford, GA & 30-Mile Vicinity</span>
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
                <a href="https://www.instagram.com/autoluxdetailing" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
                <span>&bull;</span>
                <a href="https://www.tiktok.com/@autoluxdetailing" target="_blank" rel="noopener noreferrer" aria-label="TikTok">TikTok</a>
                <span>&bull;</span>
                <a href="https://www.youtube.com/@autoluxdetailing" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YouTube</a>
            </div>
        </div>
    </footer>
    `;
}

/**
 * Updates the position and width of the smooth animated gold underline indicator.
 * Works seamlessly in both left-to-right and right-to-left directions.
 * @param {HTMLElement} targetLink - The navigation anchor to align the underline under
 */
export function updateNavUnderline(targetLink) {
    if (typeof document === 'undefined') return;
    const underline = document.getElementById('nav-gold-underline');
    const wrapper = document.getElementById('nav-items-wrapper');
    if (!underline || !wrapper) return;

    if (!targetLink || !wrapper.contains(targetLink)) {
        underline.style.opacity = '0';
        return;
    }

    const wrapperRect = typeof wrapper.getBoundingClientRect === 'function' ? wrapper.getBoundingClientRect() : { left: 0 };
    const linkRect = typeof targetLink.getBoundingClientRect === 'function' ? targetLink.getBoundingClientRect() : { left: 0, width: 80 };

    if (linkRect.width === 0) {
        underline.style.opacity = '0';
        return;
    }

    const left = linkRect.left - wrapperRect.left;
    const width = linkRect.width;

    underline.style.opacity = '1';
    underline.style.width = `${width}px`;
    underline.style.transform = `translateX(${left}px)`;
}

/**
 * Initializes the mobile menu, active navigation routes, smooth hash links, animated gold underline, and auth state.
 */
export function initNavbar() {
    if (typeof document === 'undefined') return;
    const nav = document.getElementById('global-navbar');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const authBtn = document.getElementById('nav-auth-btn');
    const wrapper = document.getElementById('nav-items-wrapper');

    if (!menuBtn || !navLinks) return;

    // Mobile Menu Toggle
    menuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (typeof document.body !== 'undefined' && document.body.style) {
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }
    });

    const closeMobileMenu = () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
            if (typeof document.body !== 'undefined' && document.body.style) {
                document.body.style.overflow = '';
            }
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
            if (typeof menuBtn.focus === 'function') menuBtn.focus();
        }
    });

    // Add scroll header border effect
    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                nav?.classList.add('scrolled');
            } else {
                nav?.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // Handle Active Route highlighting
    const currentPath = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
    const currentHash = typeof window !== 'undefined' ? (window.location.hash || '').toLowerCase() : '';
    const links = wrapper ? wrapper.querySelectorAll('.nav-link') : navLinks.querySelectorAll('a');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Smart click handler for anchor links
        link.addEventListener('click', (e) => {
            closeMobileMenu();

            // Set active class and glide underline
            if (wrapper) {
                wrapper.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            }
            link.classList.add('active');
            updateNavUnderline(link);

            // If it's a hash link on the current page
            if (href.startsWith('#') || (href.startsWith('index.html#') && (currentPath.endsWith('index.html') || currentPath === '/' || currentPath === ''))) {
                const targetId = href.split('#')[1];
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    e.preventDefault();
                    if (typeof targetEl.scrollIntoView === 'function') {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                    if (window.history && typeof window.history.pushState === 'function') {
                        window.history.pushState(null, null, `#${targetId}`);
                    }
                }
            }
        });

        // Match current route and hash
        if (
            (href === 'booking.html' && currentPath.endsWith('booking.html')) ||
            (href === 'quote.html' && currentPath.endsWith('quote.html')) ||
            (href === 'reviews.html' && currentPath.endsWith('reviews.html')) ||
            (href === 'rewards.html' && currentPath.endsWith('rewards.html')) ||
            (href === 'donate.html' && currentPath.endsWith('donate.html')) ||
            (href.endsWith(currentHash) && currentHash && (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '')) ||
            (!currentHash && href === 'index.html#process' && (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === ''))
        ) {
            link.classList.add('active');
        }
    });

    // Detect section on scroll on index.html across all 6 core sections
    const isIndex = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
    if (isIndex && typeof window !== 'undefined') {
        const sectionMappings = [
            { id: 'process', linkSelector: '[data-route="process"]' },
            { id: 'pricing', linkSelector: '[data-route="pricing"]' },
            { id: 'gallery', linkSelector: '[data-route="gallery"]' },
            { id: 'reviews', linkSelector: '[data-route="reviews"]' },
            { id: 'sweepstakes', linkSelector: '[data-route="rewards"]' },
            { id: 'contact', linkSelector: '[data-route="quote"]' }
        ];

        const handleScrollSection = () => {
            const scrollPos = window.scrollY + 140;
            let matched = null;

            for (const item of sectionMappings) {
                const secEl = document.getElementById(item.id);
                if (secEl) {
                    const top = secEl.offsetTop;
                    const height = secEl.offsetHeight;
                    if (scrollPos >= top && scrollPos < top + height) {
                        matched = item;
                        break;
                    }
                }
            }

            if (matched) {
                const activeLink = wrapper ? wrapper.querySelector(matched.linkSelector) : document.querySelector(matched.linkSelector);
                if (activeLink && !activeLink.classList.contains('active')) {
                    if (wrapper) {
                        wrapper.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    }
                    activeLink.classList.add('active');
                    updateNavUnderline(activeLink);
                }
            }
        };

        window.addEventListener('scroll', handleScrollSection, { passive: true });
    }

    // Initialize underline position on current active tab
    if (wrapper) {
        const initialActive = wrapper.querySelector('.nav-link.active') || wrapper.querySelector('.nav-link');
        if (initialActive) {
            initialActive.classList.add('active');
            setTimeout(() => updateNavUnderline(initialActive), 40);
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => {
                const currentActive = wrapper.querySelector('.nav-link.active');
                if (currentActive) updateNavUnderline(currentActive);
            }, { passive: true });
        }
    }

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

            const currentPath = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
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
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
}
