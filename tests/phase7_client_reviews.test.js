import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reviewsHtml = fs.readFileSync(path.resolve(__dirname, '../reviews.html'), 'utf8');
const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('Phase 7: Realistic Client Reviews Overhaul', () => {

    describe('1. Sanitization of Placeholder / Meme Tags', () => {
        test('reviews.html contains zero meme or generational slang references', () => {
            expect(reviewsHtml).not.toMatch(/boomer/i);
            expect(reviewsHtml).not.toMatch(/gen alpha/i);
            expect(reviewsHtml).not.toMatch(/skibidi/i);
            expect(reviewsHtml).not.toMatch(/sigma/i);
            expect(reviewsHtml).not.toMatch(/ohio drip/i);
            expect(reviewsHtml).not.toMatch(/gen z/i);
            expect(reviewsHtml).not.toMatch(/millennial/i);
            expect(reviewsHtml).not.toMatch(/adulting is hard/i);
        });

        test('index.html contains zero meme references', () => {
            expect(indexHtml).not.toMatch(/boomer/i);
            expect(indexHtml).not.toMatch(/skibidi/i);
            expect(indexHtml).not.toMatch(/sigma/i);
            expect(indexHtml).not.toMatch(/ohio/i);
        });
    });

    describe('2. Authentic North Georgia / Buford Client Profiles', () => {
        test('reviews.html includes realistic North Georgia client names with local town/city tags', () => {
            expect(reviewsHtml).toContain('Marcus T. — Buford, GA');
            expect(reviewsHtml).toContain('Elena R. — Suwanee, GA');
            expect(reviewsHtml).toContain('David K. — Lake Lanier, GA');
            expect(reviewsHtml).toContain('Dr. Julian M. — Braselton, GA');
            expect(reviewsHtml).toContain('Victoria S. — Sugar Hill, GA');
            expect(reviewsHtml).toContain('Harrison B. — Johns Creek, GA');
            expect(reviewsHtml).toContain('Rachel & Brian P. — Flowery Branch, GA');
        });

        test('index.html includes matching authentic North Georgia client profiles', () => {
            expect(indexHtml).toContain('Marcus T. — Buford, GA');
            expect(indexHtml).toContain('Elena R. — Suwanee, GA');
            expect(indexHtml).toContain('David K. — Lake Lanier, GA');
            expect(indexHtml).toContain('Dr. Julian M. — Braselton, GA');
            expect(indexHtml).toContain('Victoria S. — Sugar Hill, GA');
            expect(indexHtml).toContain('Harrison B. — Johns Creek, GA');
        });
    });

    describe('3. Verified Vehicle Badges & Conversion Copy', () => {
        test('reviews.html associates verified luxury and exotic vehicle badges', () => {
            expect(reviewsHtml).toContain('2024 BMW X5 M-Sport');
            expect(reviewsHtml).toContain('2023 Porsche 911 Carrera 4S');
            expect(reviewsHtml).toContain('2025 Cadillac Escalade Sport');
            expect(reviewsHtml).toContain('2024 Mercedes-AMG G63');
            expect(reviewsHtml).toContain('2024 Range Rover SV');
            expect(reviewsHtml).toContain('2023 Corvette Z06 (Torch Red)');
        });

        test('reviews highlight interior extraction, ceramic rain shield, and mobile concierge punctuality', () => {
            // Interior steam & leather extraction
            expect(reviewsHtml).toMatch(/interior steam extraction|perforated leather|carpet extraction/i);
            // Ceramic rain shield
            expect(reviewsHtml).toMatch(/ceramic rain shield|hydrophobic ceramic shine|hydrophobic glass/i);
            // Mobile concierge punctuality
            expect(reviewsHtml).toMatch(/prompt arrival|on time|self-contained studio van|punctuality/i);
        });

        test('both index.html and reviews.html render vehicle badges in the DOM safely escaped', () => {
            expect(reviewsHtml).toContain('escapeHTML(r.vehicle)');
            expect(indexHtml).toContain('escapeHTML(r.vehicle)');
        });
    });
});
