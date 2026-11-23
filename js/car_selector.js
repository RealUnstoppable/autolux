/**
 * AutoLux Gamified Chick-fil-A Inspired Car Selector & Garage Configurator
 * Delivers an interactive, animated, gamified vehicle builder for the AutoLux Garage portal.
 */

export const BODY_TYPES = {
    coupe: {
        id: 'coupe',
        name: 'Sports Coupe',
        icon: '🏎️',
        label: 'Coupe / Exotic',
        defaultMake: 'Porsche',
        defaultModel: '911 GT3',
        desc: 'Aerodynamic exotic & track performance',
        category: 'Exotic Track Weapon',
        recommendedWashInterval: 14,
        recommendedService: 'Ceramic Coating + Paint Correction'
    },
    sedan: {
        id: 'sedan',
        name: 'Luxury Sedan',
        icon: '🚗',
        label: 'Executive Sedan',
        defaultMake: 'BMW M',
        defaultModel: 'M3 Competition',
        desc: 'Executive luxury & daily elegance',
        category: 'High-Performance Sports Coupe',
        recommendedWashInterval: 14,
        recommendedService: 'Signature Exterior + Ceramic Spray'
    },
    suv: {
        id: 'suv',
        name: 'Performance SUV',
        icon: '🚙',
        label: 'Luxury SUV',
        defaultMake: 'Mercedes-AMG',
        defaultModel: 'G 63',
        desc: 'Commanding luxury & all-terrain presence',
        category: 'Luxury Iconic SUV',
        recommendedWashInterval: 14,
        recommendedService: 'Luxury SUV Package + Ceramic Shield'
    },
    truck: {
        id: 'truck',
        name: 'Performance Truck',
        icon: '🛻',
        label: 'Super Truck',
        defaultMake: 'Ford',
        defaultModel: 'F-150 Raptor',
        desc: 'Wide-body desert runner & heavy duty',
        category: 'Premium Performance Truck',
        recommendedWashInterval: 21,
        recommendedService: 'Premium Truck Detail'
    },
    van: {
        id: 'van',
        name: 'Executive Van',
        icon: '🚐',
        label: 'VIP Sprinter',
        defaultMake: 'Mercedes-Benz',
        defaultModel: 'Sprinter VIP',
        desc: 'Bespoke mobile office & touring lounge',
        category: 'Executive Transport',
        recommendedWashInterval: 30,
        recommendedService: 'Executive Sprinter Van Detail'
    }
};

export const COLOR_PALETTE = [
    { id: 'black', name: 'Obsidian Black', hex: '#111317', secondary: '#242933', isDark: true },
    { id: 'white', name: 'Alpine White', hex: '#f8fafc', secondary: '#cbd5e1', isDark: false },
    { id: 'red', name: 'Guards Red', hex: '#dc2626', secondary: '#991b1b', isDark: true },
    { id: 'blue', name: 'Miami Blue', hex: '#0284c7', secondary: '#0369a1', isDark: false },
    { id: 'silver', name: 'GT Silver', hex: '#94a3b8', secondary: '#64748b', isDark: false },
    { id: 'grey', name: 'Nardo Grey', hex: '#64748b', secondary: '#475569', isDark: false },
    { id: 'green', name: 'British Racing Green', hex: '#15803d', secondary: '#14532d', isDark: true },
    { id: 'yellow', name: 'Speed Yellow', hex: '#eab308', secondary: '#ca8a04', isDark: false },
    { id: 'gold', name: 'AutoLux Gold', hex: '#d4af37', secondary: '#b89628', isDark: false },
    { id: 'orange', name: 'Lava Orange', hex: '#ea580c', secondary: '#c2410c', isDark: true },
    { id: 'purple', name: 'Viola Metallic', hex: '#7e22ce', secondary: '#581c87', isDark: true },
    { id: 'rosegold', name: 'Frozen Rose', hex: '#e0a899', secondary: '#be7d6c', isDark: false }
];

export const POPULAR_MAKES = [
    'Porsche', 'Mercedes-AMG', 'BMW M', 'Tesla', 'Range Rover', 'Audi', 'Ferrari', 'Lamborghini', 'Corvette', 'Ford'
];

export const POPULAR_NICKNAMES = [
    'The Daily', 'Track Weapon', 'Weekend Toy', 'Showroom Queen', 'Midnight Beast', 'Silver Bullet', 'Batmobile'
];

export const PRESET_VEHICLES = [
    { name: '2024 Porsche 911 GT3', bodyType: 'coupe', color: 'red', make: 'Porsche', model: '911 GT3', year: '2024', nickname: 'Track Weapon' },
    { name: 'Mercedes-AMG G63', bodyType: 'suv', color: 'black', make: 'Mercedes-AMG', model: 'G 63', year: '2024', nickname: 'Midnight Beast' },
    { name: 'BMW M4 Competition', bodyType: 'coupe', color: 'green', make: 'BMW M', model: 'M4 Competition', year: '2024', nickname: 'The Daily' },
    { name: 'Tesla Model S Plaid', bodyType: 'sedan', color: 'white', make: 'Tesla', model: 'Model S Plaid', year: '2024', nickname: 'Spaceship' },
    { name: 'Range Rover SV', bodyType: 'suv', color: 'silver', make: 'Range Rover', model: 'SV Autobiography', year: '2024', nickname: 'Showroom Queen' },
    { name: 'Ford F-150 Raptor', bodyType: 'truck', color: 'orange', make: 'Ford', model: 'F-150 Raptor', year: '2024', nickname: 'Dune Runner' }
];

/**
 * Web Audio Synthesizer for tactile feedback & gamified celebration
 */
class SoundFx {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            } catch {
                this.ctx = null;
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    play(type) {
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;

            if (type === 'click') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'rev') {
                const osc1 = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc1.type = 'sawtooth';
                osc2.type = 'triangle';

                // Pitch sweep mimicking an engine rev: idle -> rev up -> settle
                osc1.frequency.setValueAtTime(75, now);
                osc1.frequency.linearRampToValueAtTime(190, now + 0.22);
                osc1.frequency.exponentialRampToValueAtTime(85, now + 0.6);

                osc2.frequency.setValueAtTime(77, now);
                osc2.frequency.linearRampToValueAtTime(195, now + 0.22);
                osc2.frequency.exponentialRampToValueAtTime(87, now + 0.6);

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.linearRampToValueAtTime(0.16, now + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(this.ctx.destination);

                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 0.6);
                osc2.stop(now + 0.6);
            } else if (type === 'honk') {
                const o1 = this.ctx.createOscillator();
                const o2 = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                o1.type = 'triangle';
                o2.type = 'triangle';
                o1.frequency.setValueAtTime(440, now);
                o2.frequency.setValueAtTime(554.37, now);
                g.gain.setValueAtTime(0.1, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                o1.connect(g);
                o2.connect(g);
                g.connect(this.ctx.destination);
                o1.start(now);
                o2.start(now);
                o1.stop(now + 0.18);
                o2.stop(now + 0.18);
            } else if (type === 'victory') {
                // Ascending bright luxury arpeggio
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const startT = now + idx * 0.08;
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, startT);
                    gain.gain.setValueAtTime(0.12, startT);
                    gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.25);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(startT);
                    osc.stop(startT + 0.25);
                });
            }
        } catch {
            // Audio context policy safe ignore
        }
    }
}

export const soundFx = new SoundFx();

/**
 * Confetti celebration burst
 */
export function triggerCelebration(originEl) {
    if (typeof document === 'undefined') return;

    const colors = ['#d4af37', '#ffffff', '#ef4444', '#38bdf8', '#22c55e', '#fbbf24'];
    const count = 45;
    const container = document.createElement('div');
    container.className = 'car-confetti-container';
    container.style = 'position: fixed; inset: 0; pointer-events: none; z-index: 9999; overflow: hidden;';
    document.body.appendChild(container);

    const rect = originEl && originEl.getBoundingClientRect ? originEl.getBoundingClientRect() : {
        left: window.innerWidth / 2,
        top: window.innerHeight / 2,
        width: 0,
        height: 0
    };
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        const color = colors[i % colors.length];
        const size = Math.random() * 8 + 6;
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const distance = Math.random() * 260 + 80;
        const destX = Math.cos(angle) * distance;
        const destY = Math.sin(angle) * distance - 80; // slightly upward bias
        const rot = Math.random() * 720 - 360;

        p.style = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            width: ${size}px;
            height: ${size * (Math.random() > 0.5 ? 1 : 0.4)}px;
            background: ${color};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            transform: translate(-50%, -50%) translate(0, 0) rotate(0deg);
            opacity: 1;
            transition: transform 1.2s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1.2s ease-out;
        `;
        container.appendChild(p);

        requestAnimationFrame(() => {
            p.style.transform = `translate(-50%, -50%) translate(${destX}px, ${destY}px) rotate(${rot}deg)`;
            p.style.opacity = '0';
        });
    }

    setTimeout(() => {
        container.remove();
    }, 1400);
}

/**
 * Generate stylized dynamic SVG Car Avatar for any body type & color
 */
export function generateCarSvg(bodyType = 'coupe', colorHex = '#dc2626', options = {}) {
    const {
        headlights = true,
        underglow = true,
        ceramicGloss = true,
        isAnimating = false
    } = options;

    const baseColor = colorHex;
    // Derive a highlight tone and shadow tone
    const highlightColor = '#ffffff';

    // SVG paths depending on bodyType
    let bodyPath = '';
    let windowPath = '';
    let cabinRoof = '';
    let spoilerPath = '';
    let wheelBaseF = 380;
    let wheelBaseR = 120;
    let chassisHeight = 90;

    switch (bodyType) {
        case 'sedan':
            // 4-door executive silhouette
            bodyPath = 'M 60,140 Q 80,105 150,102 L 205,68 Q 235,55 315,55 L 360,56 Q 380,62 405,102 L 460,108 Q 475,116 470,140 L 460,152 Q 440,155 420,155 L 340,155 Q 320,125 280,125 Q 240,125 220,155 L 180,155 Q 160,125 120,125 Q 80,125 60,155 Z';
            windowPath = 'M 215,70 L 310,70 Q 320,70 330,74 L 390,102 L 220,102 Z';
            cabinRoof = '<line x1="305" y1="70" x2="305" y2="102" stroke="#111" stroke-width="3" />';
            wheelBaseF = 380;
            wheelBaseR = 120;
            break;

        case 'suv':
            // Commanding luxury SUV silhouette (G-Wagon / Urus hybrid)
            bodyPath = 'M 50,145 L 55,75 Q 60,65 75,65 L 340,65 Q 365,65 385,85 L 430,95 Q 460,100 465,135 L 460,150 L 430,150 Q 410,120 370,120 Q 330,120 310,150 L 210,150 Q 190,120 150,120 Q 110,120 90,150 Z';
            windowPath = 'M 75,75 L 335,75 Q 345,75 355,85 L 385,96 L 75,96 Z';
            cabinRoof = '<line x1="200" y1="75" x2="200" y2="96" stroke="#111" stroke-width="3" /><line x1="280" y1="75" x2="280" y2="96" stroke="#111" stroke-width="3" />';
            wheelBaseF = 370;
            wheelBaseR = 150;
            break;

        case 'truck':
            // Wide-stance performance truck (Raptor)
            bodyPath = 'M 40,155 L 45,95 L 190,95 L 210,65 Q 225,55 260,55 L 360,55 Q 380,62 400,95 L 460,98 Q 475,105 475,145 L 470,160 L 435,160 Q 415,125 375,125 Q 335,125 315,160 L 225,160 Q 205,125 165,125 Q 125,125 105,160 Z';
            windowPath = 'M 220,67 L 350,67 Q 362,67 372,77 L 392,95 L 220,95 Z';
            cabinRoof = '<line x1="310" y1="67" x2="310" y2="95" stroke="#111" stroke-width="3" />';
            wheelBaseF = 375;
            wheelBaseR = 165;
            break;

        case 'van':
            // High-roof Executive Touring Van (Sprinter VIP)
            bodyPath = 'M 50,155 L 50,45 Q 55,35 75,35 L 350,35 Q 375,40 395,75 L 450,105 Q 465,115 465,150 L 460,160 L 420,160 Q 400,125 365,125 Q 330,125 310,160 L 200,160 Q 180,125 145,125 Q 110,125 90,160 Z';
            windowPath = 'M 75,50 L 340,50 Q 355,55 365,75 L 390,95 L 75,95 Z';
            cabinRoof = '<line x1="160" y1="50" x2="160" y2="95" stroke="#111" stroke-width="3" /><line x1="250" y1="50" x2="250" y2="95" stroke="#111" stroke-width="3" />';
            wheelBaseF = 365;
            wheelBaseR = 145;
            break;

        case 'coupe':
        default:
            // Sleek aerodynamic sports car (911 GT3 style)
            bodyPath = 'M 55,145 Q 60,105 130,100 L 195,65 Q 240,48 310,50 L 345,55 Q 380,68 410,105 L 465,112 Q 478,120 472,145 L 455,155 Q 435,155 415,155 L 335,155 Q 315,122 275,122 Q 235,122 215,155 L 175,155 Q 155,122 115,122 Q 75,122 55,155 Z';
            windowPath = 'M 205,66 L 305,58 Q 325,60 340,70 L 395,104 L 210,102 Z';
            cabinRoof = '';
            spoilerPath = '<path d="M 45,95 L 60,95 L 65,110 L 50,110 Z" fill="#111" stroke="#333" stroke-width="1" /><path d="M 35,92 Q 55,88 75,92 L 72,96 Q 55,92 35,96 Z" fill="#222" />';
            wheelBaseF = 375;
            wheelBaseR = 115;
            break;
    }

    // Dynamic gradient ID to prevent clash
    const gradId = `car-grad-${Math.abs(hashString(baseColor + bodyType))}`;
    const glossId = `gloss-grad-${Math.abs(hashString(baseColor + bodyType))}`;

    return `
    <svg viewBox="0 0 520 220" class="chickfila-car-svg ${isAnimating ? 'car-bounce' : ''}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dynamic ${bodyType} car illustration">
        <defs>
            <!-- Metallic Paint Gradient -->
            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${baseColor}" stop-opacity="1"/>
                <stop offset="35%" stop-color="${lightenColor(baseColor, 25)}" stop-opacity="1"/>
                <stop offset="70%" stop-color="${baseColor}" stop-opacity="1"/>
                <stop offset="100%" stop-color="${darkenColor(baseColor, 35)}" stop-opacity="1"/>
            </linearGradient>

            <!-- Ceramic High-Gloss Reflection -->
            <linearGradient id="${glossId}" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
                <stop offset="25%" stop-color="#ffffff" stop-opacity="0.1"/>
                <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0.25"/>
            </linearGradient>

            <!-- Headlight Ray Filter -->
            <filter id="headlight-glow" x="-20%" y="-20%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>

            <!-- Underglow Filter -->
            <filter id="underglow-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="10"/>
            </filter>
        </defs>

        <!-- Turntable Studio Shadow -->
        <ellipse cx="260" cy="180" rx="210" ry="18" fill="rgba(0, 0, 0, 0.65)" />
        <ellipse cx="260" cy="180" rx="170" ry="12" fill="rgba(0, 0, 0, 0.45)" />

        <!-- Neon Underglow -->
        ${underglow ? `
        <ellipse cx="260" cy="172" rx="160" ry="14" fill="${baseColor}" opacity="0.65" filter="url(#underglow-filter)" class="car-underglow-beam" />
        ` : ''}

        <!-- Headlight Beam Flare (Forward Beam) -->
        ${headlights ? `
        <polygon points="465,120 520,95 520,175 465,140" fill="url(#beam-gradient)" opacity="0.4" class="headlight-beam" />
        <linearGradient id="beam-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#fef08a" stop-opacity="0"/>
        </linearGradient>
        ` : ''}

        <!-- Main Car Body -->
        <g class="car-chassis-group">
            ${spoilerPath}
            <path d="${bodyPath}" fill="url(#${gradId})" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />

            <!-- Ceramic Mirror Specular Flare -->
            ${ceramicGloss ? `
            <path d="${bodyPath}" fill="url(#${glossId})" pointer-events="none" class="ceramic-gloss-layer" />
            <line x1="80" y1="105" x2="440" y2="108" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-dasharray="120 180" class="gloss-streak" />
            ` : ''}

            <!-- Windows & Cabin -->
            <path d="${windowPath}" fill="#0f172a" opacity="0.9" stroke="#334155" stroke-width="1.5" />
            <!-- Interior Silhouette hint -->
            <circle cx="280" cy="85" r="10" fill="#1e293b" opacity="0.8"/>
            <rect x="276" y="93" width="18" height="9" rx="3" fill="#1e293b" opacity="0.8"/>
            ${cabinRoof}

            <!-- Door Line & Details -->
            <path d="M 220,105 L 220,150" stroke="rgba(0,0,0,0.4)" stroke-width="1.5" />
            <path d="M 330,105 L 330,150" stroke="rgba(0,0,0,0.4)" stroke-width="1.5" />
            <!-- Door Handle -->
            <rect x="235" y="112" width="16" height="3" rx="1.5" fill="#111" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" />

            <!-- Front Headlight Fixture -->
            <polygon points="450,118 472,124 466,134 445,128" fill="${headlights ? '#fef08a' : '#94a3b8'}" filter="${headlights ? 'url(#headlight-glow)' : 'none'}" />
            ${headlights ? `<circle cx="462" cy="126" r="3" fill="#ffffff" />` : ''}

            <!-- Rear Taillight -->
            <path d="M 54,120 L 64,121 L 62,130 L 52,128 Z" fill="#ef4444" filter="${headlights ? 'url(#headlight-glow)' : 'none'}" />

            <!-- AutoLux Emblem Badge on hood -->
            <circle cx="435" cy="115" r="3" fill="#d4af37" stroke="#fff" stroke-width="0.5" />
        </g>

        <!-- Wheels & Tires -->
        <!-- Rear Wheel -->
        <g transform="translate(${wheelBaseR}, 160)" class="car-wheel">
            <!-- Tire Rubber -->
            <circle cx="0" cy="0" r="28" fill="#111827" stroke="#374151" stroke-width="2" />
            <circle cx="0" cy="0" r="21" fill="#1f2937" />
            <!-- Gold Ceramic Brake Caliper -->
            <rect x="-8" y="-18" width="16" height="8" rx="2" fill="#d4af37" />
            <!-- Multi-spoke Alloy Rim -->
            <circle cx="0" cy="0" r="17" fill="#0b0f19" stroke="#94a3b8" stroke-width="1.5" />
            <!-- Spokes -->
            <line x1="0" y1="-15" x2="0" y2="15" stroke="#cbd5e1" stroke-width="2.5" />
            <line x1="-15" y1="0" x2="15" y2="0" stroke="#cbd5e1" stroke-width="2.5" />
            <line x1="-11" y1="-11" x2="11" y2="11" stroke="#94a3b8" stroke-width="2" />
            <line x1="-11" y1="11" x2="11" y2="-11" stroke="#94a3b8" stroke-width="2" />
            <!-- Center Lug -->
            <circle cx="0" cy="0" r="5" fill="#d4af37" />
        </g>

        <!-- Front Wheel -->
        <g transform="translate(${wheelBaseF}, 160)" class="car-wheel">
            <!-- Tire Rubber -->
            <circle cx="0" cy="0" r="28" fill="#111827" stroke="#374151" stroke-width="2" />
            <circle cx="0" cy="0" r="21" fill="#1f2937" />
            <!-- Gold Ceramic Brake Caliper -->
            <rect x="-8" y="-18" width="16" height="8" rx="2" fill="#d4af37" />
            <!-- Multi-spoke Alloy Rim -->
            <circle cx="0" cy="0" r="17" fill="#0b0f19" stroke="#94a3b8" stroke-width="1.5" />
            <!-- Spokes -->
            <line x1="0" y1="-15" x2="0" y2="15" stroke="#cbd5e1" stroke-width="2.5" />
            <line x1="-15" y1="0" x2="15" y2="0" stroke="#cbd5e1" stroke-width="2.5" />
            <line x1="-11" y1="-11" x2="11" y2="11" stroke="#94a3b8" stroke-width="2" />
            <line x1="-11" y1="11" x2="11" y2="-11" stroke="#94a3b8" stroke-width="2" />
            <!-- Center Lug -->
            <circle cx="0" cy="0" r="5" fill="#d4af37" />
        </g>
    </svg>
    `;
}

// Helpers for color manipulation
function hashString(str = '') {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function lightenColor(col, amt) {
    let usePound = false;
    if (col[0] === '#') {
        col = col.slice(1);
        usePound = true;
    }
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let b = ((num >> 8) & 0x00FF) + amt;
    let g = (num & 0x0000FF) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

function darkenColor(col, amt) {
    return lightenColor(col, -amt);
}

/**
 * Main Gamified Car Selector Controller
 */
export class ChickFilACarSelector {
    constructor(containerEl, options = {}) {
        this.container = containerEl;
        this.options = options;

        // Internal State
        this.state = {
            bodyType: 'coupe',
            color: 'red',
            colorHex: '#dc2626',
            colorName: 'Guards Red',
            make: 'Porsche',
            model: '911 GT3',
            year: '2024',
            nickname: 'Track Weapon',
            finish: 'metallic',
            headlights: true,
            underglow: true,
            ceramicGloss: true,
            activeStep: 1, // 1: Chassis, 2: Paint, 3: Spec & Badges
            specProgress: 100
        };

        if (options.initialVehicle) {
            this.parseAndSetVehicle(options.initialVehicle);
        }

        this.init();
    }

    parseAndSetVehicle(input) {
        if (!input || typeof input !== 'string') return;
        const lower = input.toLowerCase();

        // Check year
        const yearMatch = input.match(/\b(19\d\d|20\d\d)\b/);
        if (yearMatch) this.state.year = yearMatch[1];

        // Check body type
        if (lower.includes('suv') || lower.includes('g63') || lower.includes('cayenne') || lower.includes('rover') || lower.includes('escalade')) {
            this.state.bodyType = 'suv';
        } else if (lower.includes('truck') || lower.includes('raptor') || lower.includes('f-150') || lower.includes('silverado')) {
            this.state.bodyType = 'truck';
        } else if (lower.includes('van') || lower.includes('sprinter')) {
            this.state.bodyType = 'van';
        } else if (lower.includes('sedan') || lower.includes('model s') || lower.includes('m3') || lower.includes('s-class') || lower.includes('maybach')) {
            this.state.bodyType = 'sedan';
        } else if (lower.includes('gt3') || lower.includes('911') || lower.includes('corvette') || lower.includes('amg gt') || lower.includes('coupe')) {
            this.state.bodyType = 'coupe';
        }

        // Check color
        for (const c of COLOR_PALETTE) {
            if (lower.includes(c.id) || lower.includes(c.name.toLowerCase())) {
                this.state.color = c.id;
                this.state.colorHex = c.hex;
                this.state.colorName = c.name;
                break;
            }
        }

        // Clean name
        const cleanName = input.replace(/\b(19\d\d|20\d\d)\b/, '').trim();
        const parts = cleanName.split(' ');
        if (parts[0]) this.state.make = parts[0];
        if (parts.length > 1) this.state.model = parts.slice(1).join(' ');
    }

    init() {
        if (!this.container) return;
        this.render();
        this.attachEventListeners();
        this.calculateProgress();
    }

    calculateProgress() {
        let score = 0;
        if (this.state.bodyType) score += 25;
        if (this.state.color) score += 25;
        if (this.state.make && this.state.model) score += 25;
        if (this.state.nickname || this.state.ceramicGloss) score += 25;
        this.state.specProgress = score;

        const meterEl = this.container.querySelector('#cfa-progress-meter');
        const scoreLabel = this.container.querySelector('#cfa-progress-score');
        const badgeEl = this.container.querySelector('#cfa-spec-level-badge');

        if (meterEl) meterEl.style.width = `${score}%`;
        if (scoreLabel) scoreLabel.textContent = `${score}% Showroom Ready`;
        if (badgeEl) {
            if (score >= 100) {
                badgeEl.textContent = '🏆 100% Showroom Spec • +150 XP Ready';
                badgeEl.style.background = 'rgba(212, 175, 55, 0.2)';
                badgeEl.style.color = 'var(--gold)';
            } else {
                badgeEl.textContent = `⚡ Custom Spec In Progress (${score}%)`;
                badgeEl.style.background = 'rgba(56, 189, 248, 0.15)';
                badgeEl.style.color = '#38bdf8';
            }
        }
    }

    getFullName() {
        const yr = this.state.year ? `${this.state.year} ` : '';
        const mk = this.state.make ? `${this.state.make} ` : '';
        const md = this.state.model || 'Custom Build';
        return `${yr}${mk}${md}`.trim();
    }

    render() {
        const currentBody = BODY_TYPES[this.state.bodyType] || BODY_TYPES.coupe;
        const fullName = this.getFullName();

        this.container.innerHTML = `
            <div class="cfa-car-selector-card" id="cfa-selector-root">
                <!-- Header with Chick-fil-A Inspired Gamification Bar -->
                <div class="cfa-selector-header">
                    <div class="cfa-header-title-box">
                        <span class="cfa-subhead">🚗 Studio Garage Configurator</span>
                        <h3 class="cfa-title">Select Your Ride</h3>
                    </div>
                    <div class="cfa-hud-badges">
                        <span class="cfa-badge" id="cfa-spec-level-badge">🏆 100% Showroom Spec • +150 XP Ready</span>
                        <button type="button" class="cfa-sound-btn" id="cfa-rev-btn" title="Rev Engine & Test Exhaust">
                            🔊 Rev Engine
                        </button>
                        <button type="button" class="cfa-randomize-btn" id="cfa-random-btn" title="Surprise Me with an Exotic Spec">
                            🎲 Surprise Me
                        </button>
                    </div>
                </div>

                <!-- Showroom Readiness Gamified Progress Track -->
                <div class="cfa-progress-container">
                    <div class="cfa-progress-info">
                        <span class="cfa-progress-title">Build Readiness</span>
                        <span class="cfa-progress-score" id="cfa-progress-score">100% Showroom Ready</span>
                    </div>
                    <div class="cfa-progress-track">
                        <div class="cfa-progress-meter" id="cfa-progress-meter" style="width: ${this.state.specProgress}%;"></div>
                    </div>
                </div>

                <!-- Interactive 3D Turntable / Car Avatar Stage -->
                <div class="cfa-stage-wrapper">
                    <div class="cfa-stage-glass" id="cfa-stage-glass">
                        <!-- Dynamic SVG Car Avatar -->
                        <div class="cfa-car-avatar-box" id="cfa-svg-holder">
                            ${generateCarSvg(this.state.bodyType, this.state.colorHex, {
                                headlights: this.state.headlights,
                                underglow: this.state.underglow,
                                ceramicGloss: this.state.ceramicGloss,
                                isAnimating: false
                            })}
                        </div>

                        <!-- Stage Interactive Quick Toggles -->
                        <div class="cfa-stage-toggles">
                            <button type="button" class="cfa-toggle-chip ${this.state.ceramicGloss ? 'active' : ''}" id="cfa-toggle-ceramic" title="Toggle 5-Year Ceramic Gloss Sheen">
                                ✨ Ceramic Gloss
                            </button>
                            <button type="button" class="cfa-toggle-chip ${this.state.headlights ? 'active' : ''}" id="cfa-toggle-lights" title="Toggle LED Xenon Headlights">
                                💡 Headlights &amp; Glow
                            </button>
                            <button type="button" class="cfa-toggle-chip" id="cfa-toggle-horn" title="Honk Horn">
                                🎺 Beep Horn
                            </button>
                        </div>

                        <!-- Live Spec Pill Overlay -->
                        <div class="cfa-live-spec-tag">
                            <span class="cfa-tag-icon">${currentBody.icon}</span>
                            <span class="cfa-tag-name" id="cfa-display-name">${escapeHtml(fullName)}</span>
                            <span class="cfa-tag-color" id="cfa-display-color" style="border-left: 3px solid ${this.state.colorHex};">
                                ${escapeHtml(this.state.colorName)}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Chick-fil-A Step Navigation Tabs -->
                <div class="cfa-steps-tabs" role="tablist">
                    <button type="button" class="cfa-step-tab ${this.state.activeStep === 1 ? 'active' : ''}" data-step="1">
                        <span class="step-num">1</span>
                        <span class="step-text">Chassis / Body</span>
                    </button>
                    <button type="button" class="cfa-step-tab ${this.state.activeStep === 2 ? 'active' : ''}" data-step="2">
                        <span class="step-num">2</span>
                        <span class="step-text">Paint &amp; Finish</span>
                    </button>
                    <button type="button" class="cfa-step-tab ${this.state.activeStep === 3 ? 'active' : ''}" data-step="3">
                        <span class="step-num">3</span>
                        <span class="step-text">Make, Model &amp; Trim</span>
                    </button>
                </div>

                <!-- Step 1: Chassis / Body Style Selector -->
                <div class="cfa-step-content ${this.state.activeStep === 1 ? 'active' : ''}" id="cfa-step-1-pane">
                    <div class="cfa-body-grid">
                        ${Object.values(BODY_TYPES).map(b => `
                            <button type="button" class="cfa-body-card ${this.state.bodyType === b.id ? 'selected' : ''}" data-body="${b.id}">
                                <span class="cfa-body-icon">${b.icon}</span>
                                <span class="cfa-body-name">${b.name}</span>
                                <span class="cfa-body-desc">${b.desc}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Step 2: Paint Swatches & Finish -->
                <div class="cfa-step-content ${this.state.activeStep === 2 ? 'active' : ''}" id="cfa-step-2-pane">
                    <div class="cfa-paint-section">
                        <div class="cfa-palette-grid">
                            ${COLOR_PALETTE.map(c => `
                                <button type="button" class="cfa-swatch-btn ${this.state.color === c.id ? 'selected' : ''}" data-color-id="${c.id}" data-color-hex="${c.hex}" data-color-name="${c.name}" title="${c.name}">
                                    <span class="cfa-swatch-circle" style="background: ${c.hex}; ${c.id === 'white' ? 'border: 1px solid #94a3b8;' : ''}"></span>
                                    <span class="cfa-swatch-label">${c.name}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Step 3: Make, Model & Badges -->
                <div class="cfa-step-content ${this.state.activeStep === 3 ? 'active' : ''}" id="cfa-step-3-pane">
                    <div class="cfa-spec-section">
                        <!-- Quick Make Selector -->
                        <span class="cfa-input-label">Select Brand / Make</span>
                        <div class="cfa-makes-pills">
                            ${POPULAR_MAKES.map(m => `
                                <button type="button" class="cfa-pill-btn ${this.state.make.toLowerCase() === m.toLowerCase() ? 'selected' : ''}" data-make="${m}">
                                    ${m}
                                </button>
                            `).join('')}
                        </div>

                        <!-- Model, Year & Nickname Input Fields -->
                        <div class="cfa-fields-row">
                            <div class="cfa-field-group">
                                <label for="cfa-year-input">Year</label>
                                <input type="text" id="cfa-year-input" value="${escapeHtml(this.state.year)}" placeholder="2024" maxlength="4" />
                            </div>
                            <div class="cfa-field-group" style="flex: 2;">
                                <label for="cfa-model-input">Model / Trim</label>
                                <input type="text" id="cfa-model-input" value="${escapeHtml(this.state.model)}" placeholder="e.g. 911 GT3, M4 Competition, G63" />
                            </div>
                            <div class="cfa-field-group" style="flex: 2;">
                                <label for="cfa-nick-input">Nickname / Tag</label>
                                <input type="text" id="cfa-nick-input" value="${escapeHtml(this.state.nickname)}" placeholder="e.g. Track Weapon, The Daily" />
                            </div>
                        </div>

                        <!-- Nickname Preset Suggestions -->
                        <div class="cfa-nick-chips">
                            <span style="font-size: 0.72rem; color: var(--text-muted); align-self: center;">Popular tags:</span>
                            ${POPULAR_NICKNAMES.map(n => `
                                <button type="button" class="cfa-nick-chip" data-nick="${n}">${n}</button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Footer Action Bar & Gamified Confirmation Button -->
                <div class="cfa-footer-bar">
                    <div class="cfa-footer-meta">
                        <span class="cfa-meta-title">${escapeHtml(fullName)}</span>
                        <span class="cfa-meta-desc">Includes ${currentBody.recommendedService} inspection</span>
                    </div>
                    <button type="button" class="cfa-save-btn" id="cfa-park-vehicle-btn">
                        <span>⚡ Park in Garage</span>
                        <span class="cfa-xp-pill">+150 XP</span>
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (!this.container) return;

        // Step tabs
        this.container.querySelectorAll('.cfa-step-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const step = parseInt(tab.getAttribute('data-step'), 10);
                this.setActiveStep(step);
                soundFx.play('click');
            });
        });

        // Body type selector
        this.container.querySelectorAll('.cfa-body-card').forEach(card => {
            card.addEventListener('click', () => {
                const bId = card.getAttribute('data-body');
                this.setBodyType(bId);
                soundFx.play('click');
            });
        });

        // Color swatches
        this.container.querySelectorAll('.cfa-swatch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cId = btn.getAttribute('data-color-id');
                const cHex = btn.getAttribute('data-color-hex');
                const cName = btn.getAttribute('data-color-name');
                this.setColor(cId, cHex, cName);
                soundFx.play('click');
            });
        });

        // Make pills
        this.container.querySelectorAll('.cfa-pill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mk = btn.getAttribute('data-make');
                this.setMake(mk);
                soundFx.play('click');
            });
        });

        // Nickname chips
        this.container.querySelectorAll('.cfa-nick-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const nick = chip.getAttribute('data-nick');
                const input = this.container.querySelector('#cfa-nick-input');
                if (input) {
                    input.value = nick;
                    this.state.nickname = nick;
                    this.notifyChange();
                    soundFx.play('click');
                }
            });
        });

        // Form inputs
        const yearInput = this.container.querySelector('#cfa-year-input');
        const modelInput = this.container.querySelector('#cfa-model-input');
        const nickInput = this.container.querySelector('#cfa-nick-input');

        yearInput?.addEventListener('input', (e) => {
            this.state.year = e.target.value.trim();
            this.updateLabels();
            this.notifyChange();
        });

        modelInput?.addEventListener('input', (e) => {
            this.state.model = e.target.value.trim();
            this.updateLabels();
            this.notifyChange();
        });

        nickInput?.addEventListener('input', (e) => {
            this.state.nickname = e.target.value.trim();
            this.notifyChange();
        });

        // Interactive stage toggles
        const toggleCeramic = this.container.querySelector('#cfa-toggle-ceramic');
        toggleCeramic?.addEventListener('click', () => {
            this.state.ceramicGloss = !this.state.ceramicGloss;
            toggleCeramic.classList.toggle('active', this.state.ceramicGloss);
            this.refreshCarSvg();
            soundFx.play('click');
        });

        const toggleLights = this.container.querySelector('#cfa-toggle-lights');
        toggleLights?.addEventListener('click', () => {
            this.state.headlights = !this.state.headlights;
            this.state.underglow = !this.state.underglow;
            toggleLights.classList.toggle('active', this.state.headlights);
            this.refreshCarSvg();
            soundFx.play('click');
        });

        const toggleHorn = this.container.querySelector('#cfa-toggle-horn');
        toggleHorn?.addEventListener('click', () => {
            soundFx.play('honk');
            this.bounceCar();
        });

        // Rev button
        const revBtn = this.container.querySelector('#cfa-rev-btn');
        revBtn?.addEventListener('click', () => {
            soundFx.play('rev');
            this.bounceCar();
        });

        // Randomize button
        const randomBtn = this.container.querySelector('#cfa-random-btn');
        randomBtn?.addEventListener('click', () => {
            this.randomize();
            soundFx.play('rev');
            this.bounceCar();
            triggerCelebration(randomBtn);
        });

        // Park in Garage CTA
        const parkBtn = this.container.querySelector('#cfa-park-vehicle-btn');
        parkBtn?.addEventListener('click', () => {
            this.handleParkVehicle(parkBtn);
        });
    }

    setActiveStep(step) {
        this.state.activeStep = step;
        this.container.querySelectorAll('.cfa-step-tab').forEach(t => {
            t.classList.toggle('active', parseInt(t.getAttribute('data-step'), 10) === step);
        });
        this.container.querySelectorAll('.cfa-step-content').forEach((p, idx) => {
            p.classList.toggle('active', idx + 1 === step);
        });
    }

    setBodyType(bodyId) {
        if (!BODY_TYPES[bodyId]) return;
        this.state.bodyType = bodyId;
        const b = BODY_TYPES[bodyId];

        // Update default model if unset or generic
        if (!this.state.model || this.state.model === 'Custom Build') {
            this.state.make = b.defaultMake;
            this.state.model = b.defaultModel;
            const yInput = this.container.querySelector('#cfa-year-input');
            const mInput = this.container.querySelector('#cfa-model-input');
            if (mInput) mInput.value = b.defaultModel;
            if (yInput && !yInput.value) yInput.value = '2024';
        }

        // Highlight card
        this.container.querySelectorAll('.cfa-body-card').forEach(c => {
            c.classList.toggle('selected', c.getAttribute('data-body') === bodyId);
        });

        this.refreshCarSvg(true);
        this.updateLabels();
        this.calculateProgress();
        this.notifyChange();
    }

    setColor(colorId, colorHex, colorName) {
        this.state.color = colorId;
        this.state.colorHex = colorHex;
        this.state.colorName = colorName;

        this.container.querySelectorAll('.cfa-swatch-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.getAttribute('data-color-id') === colorId);
        });

        this.refreshCarSvg(false);
        this.updateLabels();
        this.calculateProgress();
        this.notifyChange();
    }

    setMake(make) {
        this.state.make = make;
        this.container.querySelectorAll('.cfa-pill-btn').forEach(b => {
            b.classList.toggle('selected', b.getAttribute('data-make').toLowerCase() === make.toLowerCase());
        });
        this.updateLabels();
        this.calculateProgress();
        this.notifyChange();
    }

    updateLabels() {
        const fullName = this.getFullName();
        const dispName = this.container.querySelector('#cfa-display-name');
        const dispColor = this.container.querySelector('#cfa-display-color');
        const footerTitle = this.container.querySelector('.cfa-meta-title');
        const currentBody = BODY_TYPES[this.state.bodyType] || BODY_TYPES.coupe;
        const footerDesc = this.container.querySelector('.cfa-meta-desc');

        if (dispName) dispName.textContent = fullName;
        if (dispColor) {
            dispColor.textContent = this.state.colorName;
            dispColor.style.borderLeftColor = this.state.colorHex;
        }
        if (footerTitle) footerTitle.textContent = fullName;
        if (footerDesc) footerDesc.textContent = `Includes ${currentBody.recommendedService} inspection`;
    }

    refreshCarSvg(withBounce = false) {
        const holder = this.container.querySelector('#cfa-svg-holder');
        if (!holder) return;

        holder.innerHTML = generateCarSvg(this.state.bodyType, this.state.colorHex, {
            headlights: this.state.headlights,
            underglow: this.state.underglow,
            ceramicGloss: this.state.ceramicGloss,
            isAnimating: withBounce
        });

        if (withBounce) {
            this.bounceCar();
        }
    }

    bounceCar() {
        const svg = this.container.querySelector('.chickfila-car-svg');
        if (!svg) return;
        svg.classList.remove('car-bounce');
        void svg.offsetWidth; // Trigger reflow
        svg.classList.add('car-bounce');
    }

    randomize() {
        const bodyKeys = Object.keys(BODY_TYPES);
        const randomBody = bodyKeys[Math.floor(Math.random() * bodyKeys.length)];
        const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
        const randomMake = POPULAR_MAKES[Math.floor(Math.random() * POPULAR_MAKES.length)];
        const randomNick = POPULAR_NICKNAMES[Math.floor(Math.random() * POPULAR_NICKNAMES.length)];

        this.state.bodyType = randomBody;
        this.state.color = randomColor.id;
        this.state.colorHex = randomColor.hex;
        this.state.colorName = randomColor.name;
        this.state.make = randomMake;
        this.state.model = BODY_TYPES[randomBody].defaultModel;
        this.state.year = '2024';
        this.state.nickname = randomNick;

        // Update inputs
        const yInput = this.container.querySelector('#cfa-year-input');
        const mInput = this.container.querySelector('#cfa-model-input');
        const nInput = this.container.querySelector('#cfa-nick-input');
        if (yInput) yInput.value = this.state.year;
        if (mInput) mInput.value = this.state.model;
        if (nInput) nInput.value = this.state.nickname;

        // Update selected cards
        this.container.querySelectorAll('.cfa-body-card').forEach(c => {
            c.classList.toggle('selected', c.getAttribute('data-body') === randomBody);
        });
        this.container.querySelectorAll('.cfa-swatch-btn').forEach(b => {
            b.classList.toggle('selected', b.getAttribute('data-color-id') === randomColor.id);
        });
        this.container.querySelectorAll('.cfa-pill-btn').forEach(b => {
            b.classList.toggle('selected', b.getAttribute('data-make').toLowerCase() === randomMake.toLowerCase());
        });

        this.refreshCarSvg(true);
        this.updateLabels();
        this.calculateProgress();
        this.notifyChange();
    }

    notifyChange() {
        if (typeof this.options.onVehicleChange === 'function') {
            this.options.onVehicleChange({
                fullName: this.getFullName(),
                formattedName: `${this.getFullName()}${this.state.colorName ? ` (${this.state.colorName})` : ''}`,
                bodyType: this.state.bodyType,
                color: this.state.color,
                colorHex: this.state.colorHex,
                colorName: this.state.colorName,
                make: this.state.make,
                model: this.state.model,
                year: this.state.year,
                nickname: this.state.nickname,
                category: BODY_TYPES[this.state.bodyType]?.category || 'Luxury Vehicle'
            });
        }
    }

    handleParkVehicle(btn) {
        soundFx.play('victory');
        triggerCelebration(btn);
        this.bounceCar();

        const vehiclePayload = {
            fullName: this.getFullName(),
            formattedName: `${this.getFullName()}`,
            bodyType: this.state.bodyType,
            color: this.state.color,
            colorHex: this.state.colorHex,
            colorName: this.state.colorName,
            make: this.state.make,
            model: this.state.model,
            year: this.state.year,
            nickname: this.state.nickname,
            category: BODY_TYPES[this.state.bodyType]?.category || 'Luxury Vehicle',
            recommendedService: BODY_TYPES[this.state.bodyType]?.recommendedService || 'Executive Detail',
            recommendedWashInterval: BODY_TYPES[this.state.bodyType]?.recommendedWashInterval || 14
        };

        if (typeof this.options.onAddVehicle === 'function') {
            this.options.onAddVehicle(vehiclePayload);
        }
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
