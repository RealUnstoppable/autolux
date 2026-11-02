import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { matchVehicle, VEHICLE_IMAGE_CATALOG } from '../js/vehicle_images.js';
import { calculateProtectionScore, generateMonthData } from '../js/maintenance_calendar.js';
import { AUTOLUX_STRIPE_PACKAGES, getPackageStripeUrl } from '../js/stripe_config.js';

describe('The Garage: Luxury Dashboard & Vehicle Showcase Suite', () => {
    const accountHtml = fs.readFileSync(path.resolve(process.cwd(), 'account.html'), 'utf8');
    const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
    const bookingHtml = fs.readFileSync(path.resolve(process.cwd(), 'booking.html'), 'utf8');

    test('account.html contains The Garage hero banner and clear coat health gauge', () => {
        expect(accountHtml).toContain('The Garage');
        expect(accountHtml).toContain('Client Showroom');
        expect(accountHtml).toContain('Clear Coat Index');
        expect(accountHtml).toContain('id="hero-health-val"');
    });

    test('account.html contains Flo-inspired automotive maintenance calendar structure', () => {
        expect(accountHtml).toContain('id="maintenance-calendar-section"');
        expect(accountHtml).toContain('Automotive Maintenance Calendar');
        expect(accountHtml).toContain('id="cal-protection-score"');
        expect(accountHtml).toContain('id="calendar-grid"');
        expect(accountHtml).toContain('id="calendar-day-inspector"');
        expect(accountHtml).toContain('Detailed Past');
        expect(accountHtml).toContain('Wash Window');
    });

    test('account.html contains dynamic vehicle showcase with high-res photography', () => {
        expect(accountHtml).toContain('id="vehicles-list"');
        expect(accountHtml).toContain('vehicle-image-wrapper');
        expect(accountHtml).toContain('2024 Porsche 911 GT3');
        expect(accountHtml).toContain('Exotic Track Weapon');
        expect(accountHtml).toContain('Paint Protection');
        expect(accountHtml).toContain('id="add-vehicle-form"');
        expect(accountHtml).toContain('id="new-vehicle"');
        expect(accountHtml).toContain('suggest-chip');
    });

    test('account.html contains Service Media Showcase ("Most Recent Clean") with video and before/after', () => {
        expect(accountHtml).toContain('id="service-gallery-card"');
        expect(accountHtml).toContain('Most Recent Clean');
        expect(accountHtml).toContain('4K Studio Reel');
        expect(accountHtml).toContain('media-video-player');
        expect(accountHtml).toContain('Before &amp; After Inspection');
        expect(accountHtml).toContain('98.6 GU');
        expect(accountHtml).toContain('96% Removed');
        expect(accountHtml).toContain('112° Beading');
    });

    test('Vehicle image matcher resolves diverse luxury car makes & models', () => {
        const porsche = matchVehicle('2024 Porsche 911 GT3');
        expect(porsche.make).toBe('Porsche');
        expect(porsche.model).toBe('911 GT3');
        expect(porsche.imageUrl).toContain('images.unsplash.com');

        const gWagon = matchVehicle('2023 Mercedes G63 AMG');
        expect(gWagon.make).toBe('Mercedes-AMG');

        const bmw = matchVehicle('BMW M4 Competition');
        expect(bmw.make).toBe('BMW M');

        const tesla = matchVehicle('Tesla Model S Plaid');
        expect(tesla.make).toBe('Tesla');

        const rover = matchVehicle('Range Rover SV');
        expect(rover.make).toBe('Range Rover');
    });

    test('Maintenance calendar computes cyclical recommended wash intervals', () => {
        const monthData = generateMonthData(2026, 10, {
            historicalEvents: [{ date: '2026-11-05T10:00:00Z', service: 'Signature Detail' }],
            washIntervalDays: 14
        });

        const recommended = monthData.days.filter(d => d.event && d.event.type === 'recommended');
        expect(recommended.length).toBeGreaterThan(0);
        expect(recommended[0].event.badge).toContain('Recommended Wash');
    });

    test('Pricing tiers in index.html, booking.html, and stripe_config.js synchronize 100%', () => {
        // Core Packages
        expect(indexHtml).toContain('Luxury Sedan');
        expect(indexHtml).toContain('From $150');
        expect(indexHtml).toContain('https://buy.stripe.com/fZu28q3Ucf4jcVJgFT9AA02');

        expect(indexHtml).toContain('Luxury SUV');
        expect(indexHtml).toContain('From $250');
        expect(indexHtml).toContain('https://buy.stripe.com/00w3cucqI2hxaNB1KZ9AA03');

        expect(indexHtml).toContain('Premium Truck');
        expect(indexHtml).toContain('From $280');
        expect(indexHtml).toContain('https://buy.stripe.com/cNieVc3Uc6xN8Ft1KZ9AA04');

        expect(indexHtml).toContain('Sprinter Van');
        expect(indexHtml).toContain('From $400');
        expect(indexHtml).toContain('https://buy.stripe.com/9B628q76o4pF6xlexL9AA05');

        // Specialty Corrections & Coatings
        expect(indexHtml).toContain('Multi-Stage Paint Correction');
        expect(indexHtml).toContain('$500.00');
        expect(indexHtml).toContain('https://buy.stripe.com/5kQ5kC3Uc3lB2h5dtH9AA06');

        expect(indexHtml).toContain('Ceramic Coating (3 to 7 Yr)');
        expect(indexHtml).toContain('$850.00');
        expect(indexHtml).toContain('https://buy.stripe.com/00w28q76o9JZ3l9ahv9AA07');

        expect(indexHtml).toContain('Complete Interior Detail');
        expect(indexHtml).toContain('$175.00');
        expect(indexHtml).toContain('https://buy.stripe.com/14A9ASgGY09p5thgFT9AA08');

        expect(indexHtml).toContain('Signature Exterior Detail');
        expect(indexHtml).toContain('$125.00');
        expect(indexHtml).toContain('https://buy.stripe.com/aFa4gygGY7BRbRFcpD9AA09');

        // Detailing Club
        expect(indexHtml).toContain('The AutoLux Detailing Club');
        expect(indexHtml).toContain('$129');
        expect(indexHtml).toContain('/ month');
        expect(indexHtml).toContain('Annual Pass ($1,290/yr)');
        expect(indexHtml).toContain('https://buy.stripe.com/aFa6oG0I07BRf3R3T79AA0f');
        expect(indexHtml).toContain('https://buy.stripe.com/5kQaEW4Yg09p6xldtH9AA0g');

        // Booking HTML prefill & Stripe price IDs
        expect(bookingHtml).toContain('urlParams.get(\'vehicle\')');
        expect(bookingHtml).toContain('urlParams.get(\'date\')');
        expect(bookingHtml).toContain('stripePkg?.stripePriceId');
        expect(bookingHtml).toContain('stripePkg?.paymentLinkUrl');
    });
});
