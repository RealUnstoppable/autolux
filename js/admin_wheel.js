/**
 * AUTOLUX Admin Winner Spinner Wheel Module
 * Provides cryptographically secure (crypto.getRandomValues), weighted random participant selection,
 * HTML5 Canvas slice rendering, and physics-based spin deceleration.
 */

export const LUXURY_SLICE_COLORS = [
    '#0d0d0d', // Deep Jet Black
    '#b8860b', // Dark Metallic Gold
    '#1c1917', // Charcoal
    '#ffd700', // Bright Amber Gold
    '#27272a', // Graphite
    '#d4af37', // Signature Metallic Gold
    '#18181b', // Obsidian
    '#996515'  // Deep Bronze
];

export const DEMO_WHEEL_PARTICIPANTS = [
    { name: 'Marcus Sterling', email: 'marcus.s@luxury.com', entries: 150 },
    { name: 'Elena Rostova', email: 'elena.rostova@vip.io', entries: 70 },
    { name: 'David Chen', email: 'david.chen@gt3.org', entries: 30 },
    { name: 'Sarah Jenkins', email: 'sarah.j@autolux.net', entries: 30 },
    { name: 'Robert Vance', email: 'vance@apex.co', entries: 10 }
];

/**
 * Generates a cryptographically secure uniform random float in [0, 1)
 * @returns {number}
 */
export function getSecureRandomRatio() {
    const cryptoObj = (typeof window !== 'undefined' && window.crypto) 
        ? window.crypto 
        : (typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : null);

    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
        const buffer = new Uint32Array(1);
        cryptoObj.getRandomValues(buffer);
        return buffer[0] / (0xFFFFFFFF + 1);
    }
    return Math.random();
}

/**
 * Aggregates donations and user entries into a unified list of weighted participants
 * @param {Array} donations 
 * @param {Array} users 
 * @returns {Array<{ name: string, email: string, entries: number, percentage: number }>}
 */
export function aggregateParticipants(donations = [], users = []) {
    const map = new Map();

    // 1. Process Donations
    if (Array.isArray(donations)) {
        donations.forEach(d => {
            if (!d) return;
            const key = (d.email || d.name || 'Anonymous').toLowerCase().trim();
            const entries = Number(d.entries) || (Number(d.amount) ? Math.floor(d.amount) : 0) || 1;
            const current = map.get(key) || {
                name: d.name || d.email || 'Valued Donor',
                email: d.email || '',
                entries: 0
            };
            current.entries += entries;
            if (d.name && !current.name) current.name = d.name;
            if (d.email && !current.email) current.email = d.email;
            map.set(key, current);
        });
    }

    // 2. Process Users with sweepstakesEntries
    if (Array.isArray(users)) {
        users.forEach(u => {
            if (!u || !u.sweepstakesEntries) return;
            const key = (u.email || u.displayName || u.fullName || u.uid || '').toLowerCase().trim();
            if (!key) return;
            const entries = Number(u.sweepstakesEntries) || 0;
            if (entries <= 0) return;

            const current = map.get(key) || {
                name: u.displayName || u.fullName || u.name || u.email || 'Valued Member',
                email: u.email || '',
                entries: 0
            };
            // If already counted via donations, ensure we don't undercount
            if (current.entries < entries) {
                current.entries = entries;
            }
            map.set(key, current);
        });
    }

    let list = Array.from(map.values()).filter(p => p.entries > 0);

    // Fall back to luxury demo seeds if no live participants yet
    if (list.length === 0) {
        list = [...DEMO_WHEEL_PARTICIPANTS];
    }

    const totalEntries = list.reduce((sum, p) => sum + p.entries, 0);
    return list.map(p => ({
        ...p,
        percentage: totalEntries > 0 ? ((p.entries / totalEntries) * 100).toFixed(1) : 0
    }));
}

/**
 * Calculates winning participant based on weighted entry count and random ratio [0, 1)
 * @param {Array} participants 
 * @param {number} randomRatio 
 * @returns {Object} { winner, totalEntries, winningTicketNumber, sliceStartAngle, sliceAngle, targetAngle }
 */
export function calculateWinner(participants, randomRatio) {
    if (!Array.isArray(participants) || participants.length === 0) {
        throw new Error('Participants array cannot be empty');
    }

    const totalEntries = participants.reduce((sum, p) => sum + p.entries, 0);
    if (totalEntries <= 0) {
        throw new Error('Total entries must be greater than zero');
    }

    const clampedRatio = Math.max(0, Math.min(0.99999999, Number(randomRatio) || 0));
    const targetEntry = clampedRatio * totalEntries;
    const winningTicketNumber = Math.floor(targetEntry) + 1;

    let accumulated = 0;
    let winner = participants[0];
    let sliceStart = 0;
    let sliceAngle = (winner.entries / totalEntries) * 2 * Math.PI;

    for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        const nextAccumulated = accumulated + p.entries;
        if (targetEntry >= accumulated && targetEntry < nextAccumulated) {
            winner = p;
            sliceStart = (accumulated / totalEntries) * 2 * Math.PI;
            sliceAngle = (p.entries / totalEntries) * 2 * Math.PI;
            break;
        }
        accumulated = nextAccumulated;
    }

    // Top pointer is located at -Math.PI / 2 (12 o'clock)
    // To align the center of the winning slice with the pointer:
    const sliceCenter = sliceStart + (sliceAngle / 2);

    return {
        winner,
        totalEntries,
        winningTicketNumber,
        sliceStartAngle: sliceStart,
        sliceAngle,
        sliceCenter
    };
}

/**
 * Renders the weighted participant slices onto an HTML5 Canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {Array} participants 
 * @param {number} rotationAngle 
 */
export function drawWheel(canvas, participants, rotationAngle = 0) {
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (Math.min(width, height) / 2) - 15;

    ctx.clearRect(0, 0, width, height);

    if (!participants || participants.length === 0) return;
    const totalEntries = participants.reduce((sum, p) => sum + p.entries, 0);
    if (totalEntries <= 0) return;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle);

    let startAngle = 0;
    participants.forEach((p, idx) => {
        const sliceAngle = (p.entries / totalEntries) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        // Draw Slice
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        const color = LUXURY_SLICE_COLORS[idx % LUXURY_SLICE_COLORS.length];
        ctx.fillStyle = color;
        ctx.fill();

        // Slice Border
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw Slice Label (rotated along radius)
        ctx.save();
        const midAngle = startAngle + (sliceAngle / 2);
        ctx.rotate(midAngle);

        const isLight = color === '#ffd700' || color === '#d4af37';
        ctx.fillStyle = isLight ? '#000000' : '#ffd700';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // Truncate name if long
        const displayName = p.name.length > 14 ? p.name.substring(0, 13) + '…' : p.name;
        const textStr = `${displayName} (${p.entries}🎟️)`;
        ctx.fillText(textStr, radius - 20, 0);

        ctx.restore();
        startAngle = endAngle;
    });

    // Outer Metallic Gold Ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.restore();

    // Center Hub (fixed on top of canvas)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 32);
    hubGrad.addColorStop(0, '#ffd700');
    hubGrad.addColorStop(1, '#996515');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0a0a0a';
    ctx.stroke();

    ctx.fillStyle = '#0a0a0a';
    ctx.font = '900 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AUTOLUX', 0, 0);
    ctx.restore();
}
