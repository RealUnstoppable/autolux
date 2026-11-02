import { describe, test, expect } from '@jest/globals';
import { calculateProtectionScore, generateMonthData } from '../js/maintenance_calendar.js';

describe('Flo-Inspired Maintenance Calendar Logic', () => {
    test('calculateProtectionScore returns high score for recent detail', () => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const scoreObj = calculateProtectionScore(threeDaysAgo.toISOString(), 'Ceramic Coating');
        expect(scoreObj.score).toBeGreaterThanOrEqual(95);
        expect(scoreObj.status).toBe('Peak Showroom Finish');
        expect(scoreObj.daysSince).toBe(3);
        expect(scoreObj.coatHealth).toBeTruthy();
    });

    test('calculateProtectionScore alerts when maintenance is past due (>35 days)', () => {
        const fortyDaysAgo = new Date();
        fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

        const scoreObj = calculateProtectionScore(fortyDaysAgo.toISOString());
        expect(scoreObj.score).toBeLessThan(75);
        expect(scoreObj.status).toBe('Decontamination Recommended');
    });

    test('generateMonthData generates grid cells and identifies historical, upcoming, and recommended washes', () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const historicalDate = new Date(year, month, 5);
        const upcomingDate = new Date(year, month, 20);

        const monthData = generateMonthData(year, month, {
            historicalEvents: [{
                date: historicalDate.toISOString(),
                service: 'Signature Paint Correction & Ceramic Coating',
                vehicle: '2024 Porsche 911 GT3'
            }],
            upcomingEvents: [{
                date: upcomingDate.toISOString(),
                service: 'Executive Ceramic Detail',
                vehicle: '2024 Porsche 911 GT3'
            }],
            washIntervalDays: 14
        });

        expect(monthData.days.length).toBeGreaterThanOrEqual(28);
        expect(monthData.monthName).toBeTruthy();

        // Check that historical event is mapped
        const histKey = historicalDate.toISOString().split('T')[0];
        const histDay = monthData.days.find(d => d.dateKey === histKey);
        expect(histDay).toBeDefined();
        expect(histDay.event).toBeDefined();
        expect(histDay.event.type).toBe('historical');
        expect(histDay.event.service).toContain('Paint Correction');

        // Check that upcoming event is mapped
        const upcomingKey = upcomingDate.toISOString().split('T')[0];
        const upcomingDay = monthData.days.find(d => d.dateKey === upcomingKey);
        expect(upcomingDay).toBeDefined();
        expect(upcomingDay.event).toBeDefined();
        expect(upcomingDay.event.type).toBe('upcoming');

        // Check that predictive recommended washes exist
        const recommendedDays = monthData.days.filter(d => d.event && d.event.type === 'recommended');
        expect(recommendedDays.length).toBeGreaterThan(0);
    });
});
