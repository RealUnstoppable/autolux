import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Mobile Optimization & Screen Real Estate Verification', () => {
    const rootDir = process.cwd();
    const globalCss = fs.readFileSync(path.join(rootDir, 'css/global.css'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const accountHtml = fs.readFileSync(path.join(rootDir, 'account.html'), 'utf8');
    const donateHtml = fs.readFileSync(path.join(rootDir, 'donate.html'), 'utf8');
    const reviewsHtml = fs.readFileSync(path.join(rootDir, 'reviews.html'), 'utf8');
    const rewardsHtml = fs.readFileSync(path.join(rootDir, 'rewards.html'), 'utf8');
    const bookingHtml = fs.readFileSync(path.join(rootDir, 'booking.html'), 'utf8');
    const quoteHtml = fs.readFileSync(path.join(rootDir, 'quote.html'), 'utf8');
    const signinHtml = fs.readFileSync(path.join(rootDir, 'sign in beta.html'), 'utf8');

    test('1. Viewport meta tag is defined on all active customer pages', () => {
        const pages = [indexHtml, accountHtml, donateHtml, reviewsHtml, rewardsHtml, bookingHtml, quoteHtml, signinHtml];
        pages.forEach(html => {
            expect(html).toContain('name="viewport"');
            expect(html).toContain('width=device-width');
        });
    });

    test('2. Global CSS enforces flex child width constraints and word wrapping', () => {
        expect(globalCss).toContain('body > *');
        expect(globalCss).toContain('max-width: 100%');
        expect(globalCss).toContain('min-width: 0');
        expect(globalCss).toContain('overflow-wrap: break-word');
        expect(globalCss).toContain('min-height: 100dvh');
    });

    test('3. Mobile buttons wrap gracefully on small screens (< 768px)', () => {
        expect(globalCss).toContain('@media (max-width: 767px)');
        expect(globalCss).toContain('white-space: normal');
    });

    test('4. Mobile drawer stacks nav items vertically without gold underline collision', () => {
        expect(globalCss).toContain('@media (max-width: 1023px)');
        expect(globalCss).toContain('.nav-items-wrapper');
        expect(globalCss).toContain('flex-direction: column');
        expect(globalCss).toContain('.nav-gold-underline');
        expect(globalCss).toContain('display: none !important');
    });

    test('5. Garage vehicle grid uses responsive minmax down to 280px on mobile', () => {
        expect(globalCss).toContain('.vehicle-grid');
        expect(globalCss).toContain('minmax(min(100%, 280px), 1fr)');
    });

    test('6. Calendar grid adapts to compact mobile screens with reduced padding and text', () => {
        expect(globalCss).toContain('.calendar-grid');
        expect(globalCss).toContain('@media (max-width: 640px)');
        expect(globalCss).toContain('.calendar-day-cell');
        expect(globalCss).toContain('.calendar-weekday');
    });

    test('7. index.html contains mobile real estate optimizations for hero, sweepstakes and grids', () => {
        expect(indexHtml).toContain('@media (max-width: 767px)');
        expect(indexHtml).toContain('.hero');
        expect(indexHtml).toContain('.sweepstakes-section');
        expect(indexHtml).toContain('.milestones-grid');
        expect(indexHtml).toContain('grid-template-columns: repeat(2, 1fr)');
    });

    test('8. account.html enforces dashboard grid column safety and mobile card padding', () => {
        expect(accountHtml).toContain('.dashboard-grid');
        expect(accountHtml).toContain('minmax(0, 1fr)');
        expect(accountHtml).toContain('.dashboard-grid > *');
        expect(accountHtml).toContain('@media (max-width: 640px)');
    });

    test('9. donate.html and reviews.html prevent button and grid horizontal overflow', () => {
        expect(donateHtml).toContain('#open-stripe-btn');
        expect(donateHtml).toContain('white-space: normal');
        expect(reviewsHtml).toContain('.reviews-grid');
        expect(reviewsHtml).toContain('minmax(min(100%, 280px), 1fr)');
    });
});
