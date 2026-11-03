import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import {
    getSecureRandomRatio,
    aggregateParticipants,
    calculateWinner,
    drawWheel,
    LUXURY_SLICE_COLORS,
    DEMO_WHEEL_PARTICIPANTS
} from '../js/admin_wheel.js';

describe('Phase 4 Verification: Jet-Black & Gold Sweepstakes & Admin Winner Wheel', () => {

    // 1. Homepage (index.html) Top Sweepstakes Placement & Styling
    test('index.html positions Sweepstakes section at the top of homepage before #process', () => {
        const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');

        const heroIndex = indexHtml.indexOf('class="hero"');
        const sweepIndex = indexHtml.indexOf('id="sweepstakes"');
        const processIndex = indexHtml.indexOf('id="process"');

        expect(heroIndex).toBeGreaterThan(-1);
        expect(sweepIndex).toBeGreaterThan(-1);
        expect(processIndex).toBeGreaterThan(-1);

        // Sweepstakes must be placed directly after hero and BEFORE process
        expect(sweepIndex).toBeGreaterThan(heroIndex);
        expect(sweepIndex).toBeLessThan(processIndex);
    });

    test('index.html features jet-black/gold styling, animated metallic gold progress bar, and $20k ceramic milestone', () => {
        const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');

        // Jet-black background & brushed gold gradients
        expect(indexHtml).toContain('#0a0a0a');
        expect(indexHtml).toContain('rgba(212, 175, 55');
        expect(indexHtml).toContain('goldShimmer');

        // Progress text
        expect(indexHtml).toContain('$1,500 / $100,000 Raised!');
        expect(indexHtml).toContain('id="home-sweep-fill"');

        // $20k milestone updated from Paint Correction to Full Exterior & Interior Ceramic Overhaul
        expect(indexHtml).toContain('$20k');
        expect(indexHtml).toContain('Full Exterior & Interior Ceramic Overhaul');
        expect(indexHtml).not.toContain('Ceramic Shield Upgrade');
    });

    // 2. donate.html Redesign & 4 Interactive Tiers
    test('donate.html features jet-black/gold luxury theme and all 4 Sweepstakes donation tiers', () => {
        const donateHtml = fs.readFileSync(path.join(process.cwd(), 'donate.html'), 'utf8');

        // Theme checks
        expect(donateHtml).toContain('#0a0a0a');
        expect(donateHtml).toContain('#0d0d0d');
        expect(donateHtml).toContain('#ffd700');
        expect(donateHtml).toContain('$1,500 / $100,000 Raised!');

        // 4 Donation tiers
        expect(donateHtml).toContain('data-amount="10" data-entries="10"');
        expect(donateHtml).toContain('data-amount="25" data-entries="30"');
        expect(donateHtml).toContain('data-amount="50" data-entries="70"');
        expect(donateHtml).toContain('data-amount="100" data-entries="150"');

        // Most Popular badge on $25 tier
        expect(donateHtml).toContain('Most Popular');
        expect(donateHtml).toContain('id="selected-summary"');
        expect(donateHtml).toContain('id="open-stripe-btn"');

        // User sweepstakesEntries tracking logic on donation submission
        expect(donateHtml).toContain('sweepstakesEntries');
        expect(donateHtml).toContain('currentEntries + selectedEntries');
    });

    // 3. User Profile Entry Counter on account.html
    test('account.html displays prominent Sweepstakes Entries card and hero stat badge', () => {
        const accountHtml = fs.readFileSync(path.join(process.cwd(), 'account.html'), 'utf8');

        // Hero badge
        expect(accountHtml).toContain('id="hero-entries-badge"');
        expect(accountHtml).toContain('id="hero-entries-val"');
        expect(accountHtml).toContain('Sweepstakes Entries');

        // Prominent Gold Profile Card
        expect(accountHtml).toContain('id="user-sweepstakes-entries"');
        expect(accountHtml).toContain('🎟️ Your Sweepstakes Entries');
        expect(accountHtml).toContain('Weighted odds in the $100k Winner Wheel');

        // Script bindings
        expect(accountHtml).toContain('userData?.sweepstakesEntries');
        expect(accountHtml).toContain('sweepstakesEntriesEl.textContent = entries.toLocaleString()');
    });

    // 4. Admin Wheel Math & Cryptographically Secure Selection
    test('getSecureRandomRatio returns values strictly in [0, 1) and utilizes crypto.getRandomValues', () => {
        // Verify crypto.getRandomValues is used
        const mockGetRandomValues = jest.fn((array) => {
            array[0] = 2147483648; // Exactly half of 2^32
            return array;
        });

        const origCrypto = globalThis.crypto;
        globalThis.crypto = { getRandomValues: mockGetRandomValues };

        const ratio = getSecureRandomRatio();
        expect(mockGetRandomValues).toHaveBeenCalled();
        expect(ratio).toBeCloseTo(0.5, 4);

        globalThis.crypto = origCrypto;
    });

    test('aggregateParticipants combines donor entries and assigns odds percentage', () => {
        const mockDonations = [
            { name: 'Bruce Wayne', email: 'bruce@wayne.com', entries: 100 },
            { name: 'Bruce Wayne', email: 'bruce@wayne.com', entries: 50 }, // same donor, 150 total
            { name: 'Diana Prince', email: 'diana@themyscira.gov', entries: 50 }
        ];

        const mockUsers = [
            { email: 'diana@themyscira.gov', sweepstakesEntries: 70 }, // larger than 50 -> 70
            { email: 'clark@dailyplanet.com', displayName: 'Clark Kent', sweepstakesEntries: 80 }
        ];

        const aggregated = aggregateParticipants(mockDonations, mockUsers);
        expect(aggregated.length).toBe(3);

        const bruce = aggregated.find(p => p.email === 'bruce@wayne.com');
        expect(bruce.entries).toBe(150);

        const diana = aggregated.find(p => p.email === 'diana@themyscira.gov');
        expect(diana.entries).toBe(70);

        const clark = aggregated.find(p => p.email === 'clark@dailyplanet.com');
        expect(clark.entries).toBe(80);

        // Total = 150 + 70 + 80 = 300
        expect(bruce.percentage).toBe('50.0');
        expect(diana.percentage).toBe('23.3');
        expect(clark.percentage).toBe('26.7');
    });

    test('calculateWinner accurately selects winning participant proportional to entries', () => {
        const participants = [
            { name: 'Alice', entries: 10 },  // tickets 1 - 10 (10%)
            { name: 'Bob', entries: 30 },    // tickets 11 - 40 (30%)
            { name: 'Charlie', entries: 60 } // tickets 41 - 100 (60%)
        ];

        // Ratio 0.05 (5%) -> Alice (ticket 6 out of 10)
        const winAlice = calculateWinner(participants, 0.05);
        expect(winAlice.winner.name).toBe('Alice');
        expect(winAlice.winningTicketNumber).toBe(6);

        // Ratio 0.25 (25%) -> Bob (ticket 26 out of 40)
        const winBob = calculateWinner(participants, 0.25);
        expect(winBob.winner.name).toBe('Bob');
        expect(winBob.winningTicketNumber).toBe(26);

        // Ratio 0.85 (85%) -> Charlie (ticket 86 out of 100)
        const winCharlie = calculateWinner(participants, 0.85);
        expect(winCharlie.winner.name).toBe('Charlie');
        expect(winCharlie.winningTicketNumber).toBe(86);
        expect(winCharlie.sliceStartAngle).toBeCloseTo(0.4 * 2 * Math.PI, 4);
        expect(winCharlie.sliceAngle).toBeCloseTo(0.6 * 2 * Math.PI, 4);
    });

    test('drawWheel renders slice arcs and labels without throwing errors', () => {
        const mockCtx = {
            clearRect: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            arc: jest.fn(),
            closePath: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            fillText: jest.fn(),
            createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() }))
        };

        const mockCanvas = {
            width: 500,
            height: 500,
            getContext: jest.fn(() => mockCtx)
        };

        expect(() => {
            drawWheel(mockCanvas, DEMO_WHEEL_PARTICIPANTS, 0);
        }).not.toThrow();

        expect(mockCtx.arc).toHaveBeenCalled();
        expect(mockCtx.fillText).toHaveBeenCalled();
    });

    // 5. admin.html Wheel Section & Modal
    test('admin.html contains Winner Wheel section, Canvas, Spin Button, and Winner Celebration Modal', () => {
        const adminHtml = fs.readFileSync(path.join(process.cwd(), 'admin.html'), 'utf8');

        // Sidebar link
        expect(adminHtml).toContain('href="#sweepstakes-admin"');
        expect(adminHtml).toContain('Winner Wheel');

        // Main section
        expect(adminHtml).toContain('id="sweepstakes-admin"');
        expect(adminHtml).toContain('id="winner-wheel-canvas"');
        expect(adminHtml).toContain('id="spin-wheel-btn"');
        expect(adminHtml).toContain('id="wheel-participants-tbody"');
        expect(adminHtml).toContain('crypto.getRandomValues');

        // Winner Modal
        expect(adminHtml).toContain('id="winner-modal"');
        expect(adminHtml).toContain('id="winner-name-display"');
        expect(adminHtml).toContain('id="winner-ticket-num"');
        expect(adminHtml).toContain('id="notify-winner-btn"');

        // Module import
        expect(adminHtml).toContain("from './js/admin_wheel.js'");
        expect(adminHtml).toContain('initAdminWheelSection');
    });
});
