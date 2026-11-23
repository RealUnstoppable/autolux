import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import {
    BODY_TYPES,
    COLOR_PALETTE,
    POPULAR_MAKES,
    POPULAR_NICKNAMES,
    PRESET_VEHICLES,
    generateCarSvg,
    soundFx,
    triggerCelebration,
    ChickFilACarSelector
} from '../js/car_selector.js';

describe('Chick-fil-A Inspired Gamified Car Selector Suite', () => {
    const rootDir = process.cwd();
    const accountHtml = fs.readFileSync(path.join(rootDir, 'account.html'), 'utf8');
    const globalCss = fs.readFileSync(path.join(rootDir, 'css/global.css'), 'utf8');

    describe('1. Data Models & Catalog Structure', () => {
        it('exports all 5 key luxury body styles with complete metadata', () => {
            const keys = Object.keys(BODY_TYPES);
            expect(keys).toEqual(expect.arrayContaining(['coupe', 'sedan', 'suv', 'truck', 'van']));

            keys.forEach(k => {
                const b = BODY_TYPES[k];
                expect(b.id).toBe(k);
                expect(b.name).toBeTruthy();
                expect(b.icon).toBeTruthy();
                expect(b.category).toBeTruthy();
                expect(b.recommendedService).toBeTruthy();
                expect(b.recommendedWashInterval).toBeGreaterThan(0);
            });
        });

        it('defines a luxury 12-color palette with hex codes and names', () => {
            expect(COLOR_PALETTE.length).toBe(12);
            const red = COLOR_PALETTE.find(c => c.id === 'red');
            expect(red).toBeDefined();
            expect(red.hex).toBe('#dc2626');
            expect(red.name).toBe('Guards Red');

            const gold = COLOR_PALETTE.find(c => c.id === 'gold');
            expect(gold).toBeDefined();
            expect(gold.hex).toBe('#d4af37');
        });

        it('provides popular luxury makes, nicknames, and presets', () => {
            expect(POPULAR_MAKES).toContain('Porsche');
            expect(POPULAR_MAKES).toContain('BMW M');
            expect(POPULAR_MAKES).toContain('Mercedes-AMG');
            expect(POPULAR_MAKES).toContain('Tesla');

            expect(POPULAR_NICKNAMES).toContain('The Daily');
            expect(POPULAR_NICKNAMES).toContain('Track Weapon');

            expect(PRESET_VEHICLES.length).toBeGreaterThanOrEqual(5);
        });
    });

    describe('2. Stylized SVG Car Avatar Generator', () => {
        it('generates SVG illustrations for all vehicle body types', () => {
            ['coupe', 'sedan', 'suv', 'truck', 'van'].forEach(type => {
                const svg = generateCarSvg(type, '#dc2626', {
                    headlights: true,
                    underglow: true,
                    ceramicGloss: true
                });
                expect(svg).toContain('<svg');
                expect(svg).toContain('chickfila-car-svg');
                expect(svg).toContain('car-chassis-group');
                expect(svg).toContain('car-wheel');
                expect(svg).toContain('</svg>');
            });
        });

        it('injects dynamic metallic paint gradients, headlights flare, and ceramic gloss', () => {
            const svgWithGlow = generateCarSvg('coupe', '#0284c7', {
                headlights: true,
                underglow: true,
                ceramicGloss: true,
                isAnimating: true
            });

            expect(svgWithGlow).toContain('car-underglow-beam');
            expect(svgWithGlow).toContain('headlight-beam');
            expect(svgWithGlow).toContain('ceramic-gloss-layer');
            expect(svgWithGlow).toContain('car-bounce');
        });

        it('toggles off features when requested', () => {
            const minimalSvg = generateCarSvg('sedan', '#111317', {
                headlights: false,
                underglow: false,
                ceramicGloss: false
            });

            expect(minimalSvg).not.toContain('car-underglow-beam');
            expect(minimalSvg).not.toContain('headlight-beam');
            expect(minimalSvg).not.toContain('ceramic-gloss-layer');
        });
    });

    describe('3. Web Audio Synthesis & Celebration FX', () => {
        it('soundFx handles click, rev, honk, and victory safely without throwing', () => {
            expect(() => {
                soundFx.play('click');
                soundFx.play('rev');
                soundFx.play('honk');
                soundFx.play('victory');
            }).not.toThrow();
        });
    });

    describe('4. ChickFilACarSelector Component & Gamification Engine', () => {
        let originalDocument;
        let originalWindow;
        let mockElements;

        function createMockElement(tag = 'div', id = '', className = '') {
            const listeners = {};
            const classes = new Set(className ? className.trim().split(/\s+/) : []);
            const attrs = {};
            if (id) attrs['id'] = id;

            const el = {
                tagName: tag.toUpperCase(),
                id,
                className,
                classList: {
                    add: (c) => { classes.add(c); el.className = Array.from(classes).join(' '); },
                    remove: (c) => { classes.delete(c); el.className = Array.from(classes).join(' '); },
                    toggle: (c, force) => {
                        const has = force !== undefined ? force : !classes.has(c);
                        if (has) classes.add(c); else classes.delete(c);
                        el.className = Array.from(classes).join(' ');
                        return has;
                    },
                    contains: (c) => classes.has(c)
                },
                attributes: attrs,
                getAttribute: (k) => attrs[k] !== undefined ? attrs[k] : null,
                setAttribute: (k, v) => { attrs[k] = String(v); },
                style: {},
                children: [],
                textContent: '',
                value: '',
                addEventListener: (evt, fn) => {
                    if (!listeners[evt]) listeners[evt] = [];
                    listeners[evt].push(fn);
                },
                click: () => {
                    if (listeners['click']) {
                        listeners['click'].forEach(fn => fn({ target: el, preventDefault: () => {} }));
                    }
                },
                dispatchEvent: (evt) => {
                    if (listeners[evt.type]) {
                        listeners[evt.type].forEach(fn => fn(evt));
                    }
                },
                querySelector: (sel) => queryElement(el, sel),
                querySelectorAll: (sel) => queryAllElements(el, sel)
            };

            let _innerHTML = '';
            Object.defineProperty(el, 'innerHTML', {
                get() { return _innerHTML; },
                set(html) {
                    _innerHTML = html;
                    el.children = parseHtmlToMock(html);
                }
            });

            return el;
        }

        function parseHtmlToMock(html) {
            const results = [];
            // Basic regex parsing to create mock interactive elements
            const tagRegex = /<([a-zA-Z0-9]+)([^>]*)>([\s\S]*?)<\/\1>|<([a-zA-Z0-9]+)([^>]*)\/>/g;
            let match;
            while ((match = tagRegex.exec(html)) !== null) {
                const tag = match[1] || match[4];
                const rawAttrs = match[2] || match[5] || '';
                const inner = match[3] || '';

                const idMatch = rawAttrs.match(/id=["']([^"']+)["']/);
                const classMatch = rawAttrs.match(/class=["']([^"']+)["']/);

                const childEl = createMockElement(tag, idMatch ? idMatch[1] : '', classMatch ? classMatch[1] : '');

                // Parse data attributes
                const dataAttrRegex = /(data-[a-zA-Z0-9-]+)=["']([^"']+)["']/g;
                let dataMatch;
                while ((dataMatch = dataAttrRegex.exec(rawAttrs)) !== null) {
                    childEl.setAttribute(dataMatch[1], dataMatch[2]);
                }

                // If input or value present
                const valMatch = rawAttrs.match(/value=["']([^"']+)["']/);
                if (valMatch) childEl.value = valMatch[1];

                childEl.textContent = inner.replace(/<[^>]+>/g, '').trim();
                childEl.innerHTML = inner;

                results.push(childEl);
            }
            return results;
        }

        function queryElement(parent, sel) {
            const all = queryAllElements(parent, sel);
            return all.length > 0 ? all[0] : null;
        }

        function queryAllElements(parent, sel) {
            const matches = [];
            function walk(node) {
                if (!node || !node.children) return;
                for (const child of node.children) {
                    if (sel.startsWith('#') && child.id === sel.slice(1)) {
                        matches.push(child);
                    } else if (sel.startsWith('.') && child.classList.contains(sel.slice(1))) {
                        matches.push(child);
                    } else if (child.tagName.toLowerCase() === sel.toLowerCase()) {
                        matches.push(child);
                    }
                    walk(child);
                }
            }
            walk(parent);
            return matches;
        }

        beforeEach(() => {
            originalDocument = global.document;
            originalWindow = global.window;
            mockElements = new Map();

            global.window = {
                innerWidth: 1024,
                innerHeight: 768
            };

            global.document = {
                createElement: jest.fn((tag) => createMockElement(tag)),
                getElementById: jest.fn((id) => mockElements.get(id) || null),
                querySelector: jest.fn(),
                querySelectorAll: jest.fn(() => []),
                body: createMockElement('body')
            };
        });

        afterEach(() => {
            global.document = originalDocument;
            global.window = originalWindow;
        });

        it('parses initial vehicle strings and calculates showroom readiness', () => {
            const mount = createMockElement('div', 'cfa-car-selector-container');
            const selector = new ChickFilACarSelector(mount, {
                initialVehicle: 'Mercedes-AMG G63'
            });

            expect(selector.state.bodyType).toBe('suv');
            expect(selector.state.make).toBe('Mercedes-AMG');
            expect(selector.state.specProgress).toBe(100);
        });

        it('updates body style when setBodyType is invoked and updates metadata', () => {
            const mount = createMockElement('div', 'cfa-car-selector-container');
            const changeSpy = jest.fn();
            const selector = new ChickFilACarSelector(mount, {
                initialVehicle: '2024 Porsche 911 GT3',
                onVehicleChange: changeSpy
            });

            selector.setBodyType('truck');
            expect(selector.state.bodyType).toBe('truck');
            expect(selector.getFullName()).toContain('Ford F-150 Raptor');
            expect(changeSpy).toHaveBeenCalledWith(expect.objectContaining({
                bodyType: 'truck',
                category: 'Premium Performance Truck'
            }));
        });

        it('updates color and paint swatch when setColor is called', () => {
            const mount = createMockElement('div', 'cfa-car-selector-container');
            const changeSpy = jest.fn();
            const selector = new ChickFilACarSelector(mount, {
                onVehicleChange: changeSpy
            });

            selector.setColor('gold', '#d4af37', 'AutoLux Gold');
            expect(selector.state.color).toBe('gold');
            expect(selector.state.colorHex).toBe('#d4af37');
            expect(changeSpy).toHaveBeenCalledWith(expect.objectContaining({
                color: 'gold',
                colorHex: '#d4af37',
                colorName: 'AutoLux Gold'
            }));
        });

        it('triggers onAddVehicle callback with XP and vehicle spec when park button clicked', () => {
            const mount = createMockElement('div', 'cfa-car-selector-container');
            const addSpy = jest.fn();
            const selector = new ChickFilACarSelector(mount, {
                initialVehicle: '2024 BMW M4 Competition',
                onAddVehicle: addSpy
            });

            const dummyBtn = createMockElement('button');
            selector.handleParkVehicle(dummyBtn);

            expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
                make: 'BMW M',
                model: 'M4 Competition',
                fullName: expect.stringContaining('BMW M4 Competition'),
                recommendedService: expect.any(String),
                recommendedWashInterval: expect.any(Number)
            }));
        });

        it('randomizes build when surprise me is called', () => {
            const mount = createMockElement('div', 'cfa-car-selector-container');
            const selector = new ChickFilACarSelector(mount, {
                initialVehicle: '2024 Porsche 911 GT3'
            });

            selector.randomize();

            expect(selector.state.bodyType).toBeDefined();
            expect(selector.state.color).toBeDefined();
            expect(selector.state.make).toBeDefined();
            expect(selector.state.specProgress).toBe(100);
        });

        it('switches between steps 1, 2, and 3 seamlessly', () => {
            const mount = createMockElement('div', 'cfa-car-selector-container');
            const selector = new ChickFilACarSelector(mount);

            selector.setActiveStep(2);
            expect(selector.state.activeStep).toBe(2);

            selector.setActiveStep(3);
            expect(selector.state.activeStep).toBe(3);
        });
    });

    describe('5. HTML & CSS Integration in account.html and global.css', () => {
        it('account.html mounts the #cfa-car-selector-container inside #garage-vehicles-section', () => {
            expect(accountHtml).toContain('id="cfa-car-selector-container"');
            expect(accountHtml).toContain('id="garage-vehicles-section"');
            expect(accountHtml).toContain('./js/car_selector.js');
            expect(accountHtml).toContain('ChickFilACarSelector');
            expect(accountHtml).toContain('rel="modulepreload" href="./js/car_selector.js"');
        });

        it('account.html retains compatibility with #add-vehicle-form, #new-vehicle, and live visualizer', () => {
            expect(accountHtml).toContain('id="add-vehicle-form"');
            expect(accountHtml).toContain('id="new-vehicle"');
            expect(accountHtml).toContain('id="vehicle-visualizer-preview"');
            expect(accountHtml).toContain('class="vehicle-suggest-chips"');
        });

        it('global.css includes all required gamified car selector style rules', () => {
            expect(globalCss).toContain('.cfa-car-selector-card');
            expect(globalCss).toContain('.chickfila-car-svg');
            expect(globalCss).toContain('cfaCarBounce');
            expect(globalCss).toContain('.cfa-progress-meter');
            expect(globalCss).toContain('.cfa-body-card');
            expect(globalCss).toContain('.cfa-swatch-btn');
            expect(globalCss).toContain('.cfa-step-tab');
            expect(globalCss).toContain('.cfa-save-btn');
            expect(globalCss).toContain('.cfa-xp-pill');
        });
    });
});
