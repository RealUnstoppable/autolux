import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('account.html - Loading, Dummy Assets, and None Found States', () => {
    let htmlContent;

    beforeAll(() => {
        const filePath = path.resolve(process.cwd(), 'account.html');
        htmlContent = fs.readFileSync(filePath, 'utf-8');
    });

    describe('Static HTML Quality Checks', () => {
        it('does not contain hardcoded "Loading..." strings in user-facing content panels', () => {
            // User-facing sections that previously had "Loading..."
            expect(htmlContent).not.toMatch(/id="tickets-list"[^>]*>Loading/i);
            expect(htmlContent).not.toMatch(/id="notifications-list"[^>]*>Loading/i);
            expect(htmlContent).not.toMatch(/id="appointments-list"[^>]*>Loading/i);
            expect(htmlContent).not.toMatch(/id="service-logs-list"[^>]*>Loading/i);
            expect(htmlContent).not.toMatch(/id="referrals-history-container"[^>]*>Loading/i);
        });

        it('contains 1 pre-rendered dummy asset for each required section in static HTML', () => {
            // 1. Client Profile & Referral Code
            expect(htmlContent).toContain('id="user-referral-code"');
            expect(htmlContent).toMatch(/value="ALX-VIP2026"/);
            expect(htmlContent).toMatch(/\$50/);

            // 2. Support Tickets
            expect(htmlContent).toContain('Welcome to AutoLux Concierge');
            expect(htmlContent).toContain('General Questions');
            expect(htmlContent).toContain('dummy-ticket-1');

            // 3. Alerts & Notifications
            expect(htmlContent).toContain('VIP Membership Activated');
            expect(htmlContent).toContain('dummy-notif-1');

            // 4. My Appointments
            expect(htmlContent).toContain('Executive Ceramic Detail');
            expect(htmlContent).toContain('2024 Porsche 911 GT3');

            // 5. Service History & Gallery
            expect(htmlContent).toContain('Signature Paint Correction &amp; Ceramic Coating');
            expect(htmlContent).toContain('5-year hydrophobic ceramic coating applied');

            // 6. Registered Vehicles
            expect(htmlContent).toMatch(/2024 Porsche 911 GT3/);

            // 7. Service Addresses
            expect(htmlContent).toContain('Home (Primary)');
            expect(htmlContent).toContain('100 Ocean Drive, Suite 400, Miami, FL 33139');
        });
    });

    describe('JavaScript Empty State & None Found Logic', () => {
        it('defines DUMMY_ASSETS with entries for all required portal sections', () => {
            expect(htmlContent).toContain('DUMMY_ASSETS = {');
            expect(htmlContent).toContain('code: \'ALX-VIP2026\'');
            expect(htmlContent).toContain('id: \'dummy-ticket-1\'');
            expect(htmlContent).toContain('id: \'dummy-notif-1\'');
            expect(htmlContent).toContain('id: \'dummy-booking-1\'');
            expect(htmlContent).toContain('id: \'dummy-log-1\'');
            expect(htmlContent).toContain('vehicle: \'2024 Porsche 911 GT3\'');
            expect(htmlContent).toContain('100 Ocean Drive, Suite 400, Miami, FL 33139');
        });

        it('replaces empty lists with "None found" across all section renderers', () => {
            // Check that every render function has "None found" fallback
            expect(htmlContent).toContain('None found');
            expect(htmlContent).toMatch(/renderTicketsList[\s\S]*?None found/);
            expect(htmlContent).toMatch(/renderNotifications[\s\S]*?None found/);
            expect(htmlContent).toMatch(/renderBookings[\s\S]*?None found/);
            expect(htmlContent).toMatch(/renderAddresses[\s\S]*?None found/);
            expect(htmlContent).toMatch(/renderServiceLogs[\s\S]*?None found/);
            expect(htmlContent).toMatch(/renderVehicles[\s\S]*?None found/);
            expect(htmlContent).toMatch(/loadReferralsHistory[\s\S]*?None found/);
        });

        it('uses "N/A" for missing scalar client profile values', () => {
            expect(htmlContent).toMatch(/userEmailEl\.textContent = [^;]*'N\/A'/);
            expect(htmlContent).toMatch(/referralCodeEl\.value = [^;]*'N\/A'/);
        });

        it('includes safety timeout ensureFallbackOrEmptyStates to guard against freeze', () => {
            expect(htmlContent).toContain('ensureFallbackOrEmptyStates()');
            expect(htmlContent).toMatch(/setTimeout\(\(\) => \{[\s\S]*?ensureFallbackOrEmptyStates\(\);/);
        });
    });
});
