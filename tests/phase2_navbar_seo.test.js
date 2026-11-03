import { describe, test, expect, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { updateNavUnderline } from '../js/navbar.js';

describe('Phase 2 Verification: Navbar Underline, Concierge Contact, Paint Correction & SEO', () => {
    const HTML_FILES = [
        'index.html',
        'booking.html',
        'account.html',
        'quote.html',
        'reviews.html',
        'rewards.html',
        'sign in beta.html',
        'donate.html'
    ];

    test('All 8 pages contain standard 6-item nav structure with gold underline indicator', () => {
        HTML_FILES.forEach(filename => {
            const content = fs.readFileSync(path.join(process.cwd(), filename), 'utf8');

            expect(content).toContain('nav-items-wrapper');
            expect(content).toContain('nav-gold-underline');
            expect(content).toContain('data-route="process"');
            expect(content).toContain('data-route="pricing"');
            expect(content).toContain('data-route="gallery"');
            expect(content).toContain('data-route="reviews"');
            expect(content).toContain('data-route="rewards"');
            expect(content).toContain('data-route="quote"');
        });
    });

    test('global.css defines animated gold underline with exact 0.35s cubic-bezier transition', () => {
        const css = fs.readFileSync(path.join(process.cwd(), 'css/global.css'), 'utf8');

        expect(css).toContain('.nav-gold-underline');
        expect(css).toMatch(/transition:\s*transform 0\.35s cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\),\s*width 0\.35s cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\)/);
        expect(css).toContain('.nav-items-wrapper .nav-link:nth-child(n+4)');
    });

    test('updateNavUnderline glides underline smoothly across tabs in both directions (LTR and RTL)', () => {
        // Set up DOM mock elements
        const underline = {
            style: {
                opacity: '0',
                width: '0px',
                transform: 'translateX(0px)'
            }
        };

        const wrapper = {
            getBoundingClientRect: () => ({ left: 100, width: 600 }),
            contains: (el) => true
        };

        const tabProcess = {
            getBoundingClientRect: () => ({ left: 100, width: 75 })
        };

        const tabReviews = {
            getBoundingClientRect: () => ({ left: 320, width: 85 })
        };

        const tabQuote = {
            getBoundingClientRect: () => ({ left: 510, width: 110 })
        };

        global.document = {
            getElementById: (id) => {
                if (id === 'nav-gold-underline') return underline;
                if (id === 'nav-items-wrapper') return wrapper;
                return null;
            }
        };

        // 1. Move to Tab 1 (Process)
        updateNavUnderline(tabProcess);
        expect(underline.style.opacity).toBe('1');
        expect(underline.style.width).toBe('75px');
        expect(underline.style.transform).toBe('translateX(0px)');

        // 2. Glide Left-to-Right to Tab 4 (Reviews)
        updateNavUnderline(tabReviews);
        expect(underline.style.opacity).toBe('1');
        expect(underline.style.width).toBe('85px');
        expect(underline.style.transform).toBe('translateX(220px)'); // 320 - 100

        // 3. Glide Left-to-Right to Tab 6 (Quote)
        updateNavUnderline(tabQuote);
        expect(underline.style.opacity).toBe('1');
        expect(underline.style.width).toBe('110px');
        expect(underline.style.transform).toBe('translateX(410px)'); // 510 - 100

        // 4. Glide Right-to-Left back to Tab 1 (Process)
        updateNavUnderline(tabProcess);
        expect(underline.style.opacity).toBe('1');
        expect(underline.style.width).toBe('75px');
        expect(underline.style.transform).toBe('translateX(0px)');

        // 5. Calling with null or outside wrapper hides underline
        updateNavUnderline(null);
        expect(underline.style.opacity).toBe('0');
    });

    test('Paint Correction is removed from active offerings and explicitly badged as Future Specialty Service', () => {
        const indexContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
        const bookingContent = fs.readFileSync(path.join(process.cwd(), 'booking.html'), 'utf8');
        const quoteContent = fs.readFileSync(path.join(process.cwd(), 'quote.html'), 'utf8');

        // index.html badging
        expect(indexContent).toContain('Future Specialty Service — Coming Soon at Additional Fee');
        expect(indexContent).toContain('Coming Soon (Specialty Service)');
        expect(indexContent).not.toContain('<span class="milestone-reward">Paint Correction</span>');

        // booking.html disabled package option
        expect(bookingContent).toMatch(/<option value="Multi-Stage Paint Correction - \$500" disabled[^>]*>.*Future Specialty Service/i);

        // quote.html disabled service option
        expect(quoteContent).toMatch(/<option value="Paint Correction" disabled[^>]*>.*Future Specialty Service/i);
    });

    test('Concierge contact info is updated sitewide with phone (404) 542-2712, coiner.double0y@icloud.com, and Buford location', () => {
        HTML_FILES.forEach(filename => {
            const content = fs.readFileSync(path.join(process.cwd(), filename), 'utf8');

            expect(content).toContain('(404) 542-2712');
            expect(content).toContain('href="tel:4045422712"');
            expect(content).toContain('coiner.double0y@icloud.com');
            expect(content).toContain('href="mailto:coiner.double0y@icloud.com"');
            expect(content).toContain('Buford, GA & 30-Mile Vicinity');

            // Confirm no old placeholder info exists
            expect(content).not.toContain('(555) 123-4567');
            expect(content).not.toContain('booking@autolux.com');
        });
    });

    test('Unstoppable Store checkout link is accompanied by sleek gold ✦ x2 POINTS badge', () => {
        const storePages = ['index.html', 'booking.html', 'account.html'];

        storePages.forEach(filename => {
            const content = fs.readFileSync(path.join(process.cwd(), filename), 'utf8');

            expect(content).toContain('realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1');
            expect(content).toContain('badge-x2-points');
            expect(content).toContain('✦ x2 POINTS');
        });
    });

    test('Footers replace Facebook with TikTok link and all 8 pages have JSON-LD AutoWash/LocalBusiness schema', () => {
        HTML_FILES.forEach(filename => {
            const content = fs.readFileSync(path.join(process.cwd(), filename), 'utf8');

            // Footer Social
            expect(content).toContain('https://www.tiktok.com/@autoluxdetailing');
            expect(content).toContain('aria-label="TikTok"');
            expect(content).not.toContain('aria-label="Facebook"');

            // SEO Metadata
            expect(content).toContain('name="description"');
            expect(content).toContain('property="og:title"');
            expect(content).toContain('name="twitter:card"');
            expect(content).toContain('rel="canonical"');

            // JSON-LD Schema
            expect(content).toContain('application/ld+json');
            expect(content).toContain('"@type": ["AutoWash", "LocalBusiness"]');
            expect(content).toContain('"telephone": "(404) 542-2712"');
            expect(content).toContain('"email": "coiner.double0y@icloud.com"');
            expect(content).toContain('"addressLocality": "Buford"');
        });
    });
});
