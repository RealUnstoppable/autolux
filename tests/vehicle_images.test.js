import { describe, test, expect } from '@jest/globals';
import { matchVehicle, VEHICLE_IMAGE_CATALOG } from '../js/vehicle_images.js';

describe('Vehicle Matching & Dynamic Luxury Image Resolution', () => {
    test('matches 2024 Porsche 911 GT3 to Porsche GT3 photography', () => {
        const result = matchVehicle('2024 Porsche 911 GT3');
        expect(result.make).toBe('Porsche');
        expect(result.model).toBe('911 GT3');
        expect(result.imageUrl).toContain('images.unsplash.com');
        expect(result.recommendedWashInterval).toBe(14);
        expect(result.category).toContain('Exotic');
    });

    test('matches Mercedes-AMG G-Wagon correctly', () => {
        const result = matchVehicle('Mercedes G63 AMG');
        expect(result.make).toBe('Mercedes-AMG');
        expect(result.imageUrl).toBeTruthy();
        expect(result.recommendedService).toContain('Luxury SUV');
    });

    test('matches BMW M4 Competition to high performance sports coupe', () => {
        const result = matchVehicle('2023 BMW M4 Competition');
        expect(result.make).toBe('BMW M');
        expect(result.imageUrl).toBeTruthy();
    });

    test('matches Tesla Model S Plaid to electric hyper-sedan', () => {
        const result = matchVehicle('Tesla Model S Plaid');
        expect(result.make).toBe('Tesla');
        expect(result.category).toContain('Electric');
    });

    test('falls back gracefully on unknown luxury vehicle without errors', () => {
        const result = matchVehicle('Aston Martin Vanquish');
        expect(result.imageUrl).toBeTruthy();
        expect(result.rawName).toBe('Aston Martin Vanquish');
    });

    test('handles empty or null vehicle string safely', () => {
        const result = matchVehicle('');
        expect(result.imageUrl).toBeTruthy();
        expect(result.rawName).toBeTruthy();
    });
});
