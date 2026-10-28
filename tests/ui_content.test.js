import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('UI Content & Transaction Flow Verification', () => {
    test('index.html contains AutoLux Club price tag ($129/mo), benefits, and store checkout link', () => {
        const content = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');

        expect(content).toContain('The AutoLux Detailing Club');
        expect(content).toContain('$129');
        expect(content).toContain('/ month');
        expect(content).toContain('booking.html?package=club');
        expect(content).toContain('realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1');
        expect(content).toContain('Annual Pass ($1,290/yr)');
        expect(content).toContain('15% Member Discount');
        expect(content).toContain('Detailing Club Plan ($129/mo)');
    });

    test('booking.html contains updated package options and dynamic VIP Club banner', () => {
        const content = fs.readFileSync(path.join(process.cwd(), 'booking.html'), 'utf8');

        expect(content).toContain('AutoLux Detailing Club Plan - $129/mo');
        expect(content).toContain('AutoLux Detailing Club Annual - $1,290/yr');
        expect(content).toContain('id="club-perks-banner"');
        expect(content).toContain('realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1');
        expect(content).toContain('Detailing Club Plan ($129/mo)');
    });

    test('account.html contains updated AutoLux VIP Club card with $129/mo and store checkout link', () => {
        const content = fs.readFileSync(path.join(process.cwd(), 'account.html'), 'utf8');

        expect(content).toContain('AutoLux VIP Club');
        expect(content).toContain('$129 / mo');
        expect(content).toContain('Join AutoLux Club ($129/mo)');
        expect(content).toContain('realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1');
        expect(content).toContain('Detailing Club Plan ($129/mo)');
    });

    test('js/navbar.js contains Detailing Club Plan ($129/mo)', () => {
        const content = fs.readFileSync(path.join(process.cwd(), 'js/navbar.js'), 'utf8');

        expect(content).toContain('Detailing Club Plan ($129/mo)');
    });

    test('firestore.rules contains /products collection rules', () => {
        const content = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf8');

        expect(content).toContain('match /products/{productId}');
        expect(content).toContain('allow read: if true;');
        expect(content).toContain('allow write: if isAdmin();');
    });

    test('functions/index.js contains createProduct, subscribeToClub and handles store syncing', () => {
        const content = fs.readFileSync(path.join(process.cwd(), 'functions/index.js'), 'utf8');

        expect(content).toContain('exports.createProduct');
        expect(content).toContain('exports.subscribeToClub');
        expect(content).toContain('x-unstoppable-api-key');
        expect(content).toContain('STORE_API_KEY');
        expect(content).toContain('autolux-detailing-club');
    });

    test('Favicon assets exist and are linked across all main HTML pages', () => {
        const requiredAssets = [
            'favicon.ico',
            'favicon.png',
            'favicon-32x32.png',
            'favicon-16x16.png',
            'favicon-48x48.png',
            'apple-touch-icon.png',
            'site.webmanifest'
        ];

        for (const asset of requiredAssets) {
            expect(fs.existsSync(path.join(process.cwd(), asset))).toBe(true);
        }

        const pages = [
            'index.html',
            'booking.html',
            'account.html',
            'admin.html',
            'quote.html',
            'reviews.html',
            'rewards.html',
            'sign in beta.html',
            'donate.html'
        ];

        for (const page of pages) {
            const html = fs.readFileSync(path.join(process.cwd(), page), 'utf8');
            expect(html).toContain('rel="icon"');
            expect(html).toContain('href="favicon.ico"');
            expect(html).toContain('href="favicon-32x32.png"');
        }
    });
});
