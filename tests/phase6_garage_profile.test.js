import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    calculateAiPredictedDetailDate,
    getRetentionSpaNotification,
    generateMonthData,
    calculateProtectionScore
} from '../js/maintenance_calendar.js';
import { matchVehicle } from '../js/vehicle_images.js';
import { linkUnAccount, supportUndoAccountMerge } from '../js/utils.js';
import { getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accountHtml = fs.readFileSync(path.resolve(__dirname, '../account.html'), 'utf8');
const firestoreRules = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');

describe('Phase 6: Personalized Mobile-First Profile ("The Garage", Flo Calendar & Retention)', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('1. Dynamic Vehicle Visualizer ("The Garage")', () => {
        test('account.html includes the #vehicle-visualizer-preview container with all required child elements', () => {
            expect(accountHtml).toContain('id="vehicle-visualizer-preview"');
            expect(accountHtml).toContain('id="viz-car-image"');
            expect(accountHtml).toContain('id="viz-color-swatch"');
            expect(accountHtml).toContain('id="viz-category-badge"');
            expect(accountHtml).toContain('id="viz-color-badge"');
            expect(accountHtml).toContain('id="viz-title"');
            expect(accountHtml).toContain('id="viz-recommended"');
        });

        test('matchVehicle properly matches various luxury/exotic vehicle trims', () => {
            const porsche = matchVehicle('2024 Porsche 911 GT3');
            expect(porsche.category).toMatch(/Exotic|Track|Sports/i);
            expect(porsche.imageUrl).toContain('images.unsplash.com');
            expect(porsche.recommendedWashInterval).toBe(14);

            const gWagon = matchVehicle('Mercedes-AMG G63');
            expect(gWagon.category).toMatch(/SUV|Luxury/i);
            expect(gWagon.recommendedWashInterval).toBe(14);

            const truck = matchVehicle('Ford F-150 Raptor');
            expect(truck.category).toMatch(/Truck/i);
        });

        test('account.html contains vehicle suggestion chips for fast mobile entry', () => {
            expect(accountHtml).toContain('class="vehicle-suggest-chips"');
            expect(accountHtml).toContain('data-name="2024 Porsche 911 GT3"');
            expect(accountHtml).toContain('data-name="Mercedes-AMG G63"');
            expect(accountHtml).toContain('data-name="BMW M4 Competition"');
        });
    });

    describe('2. Saved Addresses with Custom Glyphs', () => {
        test('account.html provides 4 custom address glyph chips: Home, Office, Work, Shop', () => {
            expect(accountHtml).toContain('id="address-glyph-chips"');
            expect(accountHtml).toContain('data-glyph="🏠"');
            expect(accountHtml).toContain('data-glyph="🏢"');
            expect(accountHtml).toContain('data-glyph="💼"');
            expect(accountHtml).toContain('data-glyph="🔧"');
            expect(accountHtml).toContain('id="selected-address-glyph"');
        });

        test('account.html address list template includes address glyph support', () => {
            expect(accountHtml).toContain("const glyph = a.glyph || '🏠'");
            expect(accountHtml).toContain("selectedAddressGlyphInput?.value || '🏠'");
        });
    });

    describe('3. Flo-Inspired Car Care & AI Prediction Calendar', () => {
        test('generateMonthData assigns Flo color coding: Metallic Gold for past, Emerald for scheduled, Electric Blue for AI wash windows', () => {
            const sampleHist = [{
                date: '2026-11-05',
                service: 'Signature Ceramic Detail',
                vehicle: '2024 Porsche 911 GT3',
                notes: 'Showroom multi-stage paint correction applied.'
            }];

            const sampleUpcom = [{
                date: '2026-11-20',
                service: 'Maintenance Foam Wash',
                vehicle: '2024 Porsche 911 GT3'
            }];

            const monthData = generateMonthData(2026, 10, {
                historicalEvents: sampleHist,
                upcomingEvents: sampleUpcom,
                washIntervalDays: 14,
                parkingEnvironment: 'Garage Kept'
            });

            expect(monthData.monthName).toContain('November 2026');

            // Find historical event day
            const histDay = monthData.days.find(d => d.dateKey === '2026-11-05');
            expect(histDay).toBeDefined();
            expect(histDay.event.type).toBe('historical');
            expect(histDay.event.badgeColor).toBe('#D4AF37'); // Metallic Gold
            expect(histDay.event.dotClass).toBe('hist');
            expect(histDay.event.hasMediaGallery).toBe(true);

            // Find upcoming event day
            const upcomDay = monthData.days.find(d => d.dateKey === '2026-11-20');
            expect(upcomDay).toBeDefined();
            expect(upcomDay.event.type).toBe('upcoming');
            expect(upcomDay.event.badgeColor).toBe('#10B981'); // Emerald Green
            expect(upcomDay.event.dotClass).toBe('upcom');

            // Find AI predicted recommendation day
            const recDay = monthData.days.find(d => d.event && d.event.type === 'recommended');
            expect(recDay).toBeDefined();
            expect(recDay.event.badgeColor).toBe('#38BDF8'); // Electric Blue
            expect(recDay.event.dotClass).toBe('recom');
        });

        test('calculateAiPredictedDetailDate adjusts wash intervals for Outside vehicles vs Garage Kept', () => {
            const garageCalc = calculateAiPredictedDetailDate({
                lastDetailDate: '2026-11-01',
                parkingEnvironment: 'Garage Kept',
                washIntervalDays: 14
            });

            const outsideCalc = calculateAiPredictedDetailDate({
                lastDetailDate: '2026-11-01',
                parkingEnvironment: 'Parked Outside',
                washIntervalDays: 14
            });

            expect(garageCalc.intervalDays).toBe(14);
            // Parked outside experiences accelerated fallout, shortening recommended interval (~10 days)
            expect(outsideCalc.intervalDays).toBeLessThan(14);
            expect(outsideCalc.parkingEnvironment).toBe('Parked Outside');
            expect(outsideCalc.environmentalImpact).toMatch(/sun exposure|pollen|acid rain/i);
        });

        test('getRetentionSpaNotification accurately flags vehicles overdue >= 21-30 days', () => {
            const today = new Date();
            const recentDate = new Date(today);
            recentDate.setDate(recentDate.getDate() - 10);

            const overdue28Date = new Date(today);
            overdue28Date.setDate(overdue28Date.getDate() - 28);

            const recentNotif = getRetentionSpaNotification({
                lastDetailDate: recentDate,
                vehicleName: '2024 Porsche 911 GT3'
            });
            expect(recentNotif.shouldNotify).toBe(false);

            const overdueNotif = getRetentionSpaNotification({
                lastDetailDate: overdue28Date,
                vehicleName: '2024 Porsche 911 GT3'
            });
            expect(overdueNotif.shouldNotify).toBe(true);
            expect(overdueNotif.daysSince).toBe(28);
            expect(overdueNotif.message).toMatch(/craving a spa day/i);
            expect(overdueNotif.message).toContain('28 days');
            expect(overdueNotif.ctaUrl).toContain('retention_spa');
        });

        test('account.html contains the Empathetic Retention Spa Banner and recurring care toggles', () => {
            expect(accountHtml).toContain('id="retention-spa-banner"');
            expect(accountHtml).toContain('id="retention-spa-title"');
            expect(accountHtml).toContain('id="retention-spa-message"');
            expect(accountHtml).toContain('id="retention-spa-cta"');
            expect(accountHtml).toContain('id="dismiss-retention-btn"');

            // Recurring Care Schedule Toggle
            expect(accountHtml).toContain('id="toggle-biweekly"');
            expect(accountHtml).toContain('id="toggle-monthly"');
            expect(accountHtml).toContain('id="current-schedule-label"');
        });

        test('account.html includes the Service Media Showcase Modal (#service-media-modal)', () => {
            expect(accountHtml).toContain('id="service-media-modal"');
            expect(accountHtml).toContain('id="media-modal-close-btn"');
            expect(accountHtml).toContain('id="media-modal-title"');
            expect(accountHtml).toContain('id="media-modal-vehicle"');
            expect(accountHtml).toContain('id="media-modal-notes"');
            expect(accountHtml).toContain('id="media-modal-gloss"');
            expect(accountHtml).toContain('id="media-modal-swirl"');
            expect(accountHtml).toContain('id="media-modal-hydro"');
            expect(accountHtml).toContain('id="media-modal-before-img"');
            expect(accountHtml).toContain('id="media-modal-after-img"');
        });
    });

    describe('4. Referral Button Contrast & Share Action', () => {
        test('account.html styles #share-referral-btn with high-contrast gold/white and SVG icon', () => {
            expect(accountHtml).toContain('id="share-referral-btn"');
            expect(accountHtml).toContain('viewBox="0 0 24 24"');
            expect(accountHtml).toContain('title="Share Referral Link"');
        });
    });

    describe('5. "Merge with Unstoppable" High-Friction Guard & Support Undo Snapshot', () => {
        test('account.html contains high friction warning banner and mandatory confirmation checkbox', () => {
            expect(accountHtml).toContain('class="merge-friction-box"');
            expect(accountHtml).toContain('PERMANENT ACCOUNT MERGE WARNING');
            expect(accountHtml).toContain('id="un-confirm-permanent-check"');
            expect(accountHtml).toContain('I understand this account integration is permanent.');
        });

        test('linkUnAccount captures preMergeData snapshot into accountMerges collection with canSupportUndo: true', async () => {
            const mockDb = {};
            const mockUid = 'test-client-uid-123';

            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({
                    email: 'client@autolux.com',
                    name: 'Alex Mercer',
                    loyaltyPoints: 350
                })
            });

            const result = await linkUnAccount(mockDb, mockUid, {
                unAccountEmail: 'alex@realunstoppable.store',
                currentLoyaltyPoints: 350,
                existingUnBalance: 1200
            });

            expect(result.success).toBe(true);
            expect(result.totalUnBalance).toBe(1550);
            expect(setDoc).toHaveBeenCalledWith(
                expect.objectContaining({ col: 'accountMerges', id: mockUid }),
                expect.objectContaining({
                    canSupportUndo: true,
                    status: 'merged'
                }),
                { merge: true }
            );
        });

        test('supportUndoAccountMerge successfully restores user preMergeData snapshot and resets unLinked: false', async () => {
            const mockDb = {};
            const mockUid = 'test-client-uid-123';

            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({
                    userId: mockUid,
                    canSupportUndo: true,
                    preMergeData: {
                        loyaltyPoints: 350,
                        unLinked: false,
                        membershipLevel: 'vip',
                        name: 'Alex Mercer'
                    }
                })
            });

            const result = await supportUndoAccountMerge(mockDb, mockUid);

            expect(result.success).toBe(true);
            expect(result.restoredPoints).toBe(350);
            expect(updateDoc).toHaveBeenCalledWith(
                expect.objectContaining({ col: 'users', id: mockUid }),
                expect.objectContaining({
                    unLinked: false,
                    loyaltyPoints: 350
                })
            );
            expect(updateDoc).toHaveBeenCalledWith(
                expect.objectContaining({ col: 'accountMerges', id: mockUid }),
                expect.objectContaining({
                    canSupportUndo: false,
                    status: 'undone'
                })
            );
        });

        test('firestore.rules enforces strict user and admin security for accountMerges/{userId}', () => {
            expect(firestoreRules).toContain('match /accountMerges/{userId}');
            expect(firestoreRules).toContain('isOwner(userId)');
            expect(firestoreRules).toContain('isAdmin()');
        });
    });
});
