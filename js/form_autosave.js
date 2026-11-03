/**
 * AUTOLUX Real-Time Form Auto-Save & Smart Combobox Component
 * Manages instant localStorage persistence, 500ms debounced Firestore profile sync,
 * and Smart Saved Garage Vehicles & Addresses dropdown hydration.
 */

import { db } from './auth.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export const STORAGE_KEY_BOOKING = 'autolux_draft_booking';
export const STORAGE_KEY_QUOTE = 'autolux_draft_quote';

let bookingDebounceTimer = null;
let bookingResolvers = [];
let quoteDebounceTimer = null;
let quoteResolvers = [];

/**
 * Returns an appropriate emoji glyph based on an address label
 * @param {string} label 
 * @returns {string}
 */
export function getLocationGlyph(label = '') {
    const l = String(label || '').toLowerCase();
    if (l.includes('home') || l.includes('house') || l.includes('residence')) return '🏠';
    if (l.includes('office') || l.includes('work') || l.includes('hq') || l.includes('corp')) return '🏢';
    if (l.includes('hangar') || l.includes('airport')) return '✈️';
    if (l.includes('garage') || l.includes('studio') || l.includes('shop')) return '🏎️';
    if (l.includes('beach') || l.includes('lake') || l.includes('vacation')) return '🏖️';
    return '📍';
}

/**
 * Persists booking draft immediately to localStorage
 * @param {Object} data 
 */
export function saveBookingDraftToLocal(data) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        const payload = {
            ...data,
            timestamp: Date.now()
        };
        window.localStorage.setItem(STORAGE_KEY_BOOKING, JSON.stringify(payload));
    } catch (err) {
        console.warn('Could not save booking draft to localStorage:', err);
    }
}

/**
 * Retrieves booking draft from localStorage
 * @returns {Object|null}
 */
export function getBookingDraftFromLocal() {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY_BOOKING);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (err) {
        console.warn('Could not parse booking draft from localStorage:', err);
        return null;
    }
}

/**
 * Clears booking draft from localStorage
 */
export function clearBookingDraftFromLocal() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        window.localStorage.removeItem(STORAGE_KEY_BOOKING);
    } catch (err) {
        console.warn('Could not remove booking draft from localStorage:', err);
    }
}

/**
 * 500ms Debounced sync to user's Firestore profile (users/{uid}/draftBooking)
 * @param {string} uid 
 * @param {Object} draftData 
 * @param {number} delay 
 * @returns {Promise<void>}
 */
export function debounceSyncBookingDraft(uid, draftData, delay = 500) {
    if (!uid) return Promise.resolve();

    if (bookingDebounceTimer) {
        clearTimeout(bookingDebounceTimer);
    }

    return new Promise((resolve) => {
        bookingResolvers.push(resolve);
        bookingDebounceTimer = setTimeout(async () => {
            const currentResolvers = [...bookingResolvers];
            bookingResolvers = [];
            try {
                const userRef = doc(db, 'users', uid);
                const syncPayload = {
                    draftBooking: {
                        package: draftData.package || '',
                        addOns: Array.isArray(draftData.addOns) ? draftData.addOns : [],
                        totalPrice: Number(draftData.totalPrice) || 0,
                        vehicle: draftData.vehicle || '',
                        appointmentDate: draftData.appointmentDate || '',
                        address: draftData.address || '',
                        referralCode: draftData.referralCode || '',
                        notes: draftData.notes || '',
                        syncedAt: serverTimestamp()
                    }
                };

                if (draftData.vehicle) {
                    syncPayload.lastSelectedVehicle = draftData.vehicle;
                }
                if (draftData.address) {
                    syncPayload.lastSelectedAddress = draftData.address;
                }

                await setDoc(userRef, syncPayload, { merge: true });
            } catch (err) {
                console.warn('Could not sync booking draft to Firestore:', err);
            } finally {
                currentResolvers.forEach(res => {
                    try { res(); } catch (e) {}
                });
            }
        }, delay);
    });
}

/**
 * Persists custom quote draft immediately to localStorage
 * @param {Object} data 
 */
export function saveQuoteDraftToLocal(data) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        const payload = {
            ...data,
            timestamp: Date.now()
        };
        window.localStorage.setItem(STORAGE_KEY_QUOTE, JSON.stringify(payload));
    } catch (err) {
        console.warn('Could not save quote draft to localStorage:', err);
    }
}

/**
 * Retrieves custom quote draft from localStorage
 * @returns {Object|null}
 */
export function getQuoteDraftFromLocal() {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY_QUOTE);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (err) {
        console.warn('Could not parse quote draft from localStorage:', err);
        return null;
    }
}

/**
 * Clears custom quote draft from localStorage
 */
export function clearQuoteDraftFromLocal() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        window.localStorage.removeItem(STORAGE_KEY_QUOTE);
    } catch (err) {
        console.warn('Could not remove quote draft from localStorage:', err);
    }
}

/**
 * 500ms Debounced sync to user's Firestore profile (users/{uid}/draftQuote)
 * @param {string} uid 
 * @param {Object} draftData 
 * @param {number} delay 
 * @returns {Promise<void>}
 */
export function debounceSyncQuoteDraft(uid, draftData, delay = 500) {
    if (!uid) return Promise.resolve();

    if (quoteDebounceTimer) {
        clearTimeout(quoteDebounceTimer);
    }

    return new Promise((resolve) => {
        quoteResolvers.push(resolve);
        quoteDebounceTimer = setTimeout(async () => {
            const currentResolvers = [...quoteResolvers];
            quoteResolvers = [];
            try {
                const userRef = doc(db, 'users', uid);
                await setDoc(userRef, {
                    draftQuote: {
                        name: draftData.name || '',
                        email: draftData.email || '',
                        phone: draftData.phone || '',
                        details: draftData.details || '',
                        serviceRequested: draftData.serviceRequested || '',
                        additionalNotes: draftData.additionalNotes || '',
                        syncedAt: serverTimestamp()
                    }
                }, { merge: true });
            } catch (err) {
                console.warn('Could not sync quote draft to Firestore:', err);
            } finally {
                currentResolvers.forEach(res => {
                    try { res(); } catch (e) {}
                });
            }
        }, delay);
    });
}

/**
 * Initializes and populates Smart Saved Dropdowns for Vehicles and Addresses
 * @param {Object} options
 * @param {Object} options.userData
 * @param {HTMLSelectElement} options.vehicleSelect
 * @param {HTMLInputElement} options.vehicleInput
 * @param {HTMLSelectElement} options.addressSelect
 * @param {HTMLInputElement} options.addressInput
 * @param {Function} options.onSelectionChange
 */
export function setupSmartSavedDropdowns({
    userData,
    vehicleSelect,
    vehicleInput,
    addressSelect,
    addressInput,
    onSelectionChange
}) {
    if (!userData) return;

    const createOption = (val, text) => {
        if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = text;
            return opt;
        }
        return { tagName: 'OPTION', value: val, textContent: text };
    };

    // 1. Vehicle Dropdown Setup
    const vehicles = Array.isArray(userData.vehicles) ? userData.vehicles.filter(Boolean) : [];
    if (vehicleSelect && vehicleInput && vehicles.length > 0) {
        vehicleSelect.innerHTML = '';

        const defaultOpt = createOption('', '-- Choose from Your Garage (or Add New) --');
        vehicleSelect.appendChild(defaultOpt);

        vehicles.forEach(v => {
            const opt = createOption(v, `🚗 ${v}`);
            vehicleSelect.appendChild(opt);
        });

        const customOpt = createOption('__custom__', '➕ + Add New Vehicle');
        vehicleSelect.appendChild(customOpt);

        vehicleSelect.style.display = 'block';

        // If the input already has a value matching one of the saved vehicles, select it
        const currentVal = vehicleInput.value.trim();
        if (currentVal && vehicles.includes(currentVal)) {
            vehicleSelect.value = currentVal;
            vehicleInput.style.display = 'none';
        } else if (currentVal) {
            vehicleSelect.value = '__custom__';
            vehicleInput.style.display = 'block';
        }

        vehicleSelect.addEventListener('change', () => {
            const val = vehicleSelect.value;
            if (val === '__custom__') {
                vehicleInput.style.display = 'block';
                vehicleInput.value = '';
                vehicleInput.focus();
            } else if (val) {
                vehicleInput.value = val;
                vehicleInput.style.display = 'none';
            } else {
                vehicleInput.style.display = 'block';
            }
            if (typeof onSelectionChange === 'function') onSelectionChange();
        });
    }

    // 2. Address Dropdown Setup
    const addresses = Array.isArray(userData.addresses) ? userData.addresses.filter(Boolean) : [];
    if (addressSelect && addressInput && addresses.length > 0) {
        addressSelect.innerHTML = '';

        const defaultOpt = createOption('', '-- Choose a Saved Address (or Add New) --');
        addressSelect.appendChild(defaultOpt);

        addresses.forEach(a => {
            const addrStr = typeof a === 'object' ? (a.address || '') : String(a);
            const labelStr = typeof a === 'object' ? (a.label || 'Saved') : 'Saved';
            const glyph = getLocationGlyph(labelStr);

            const opt = createOption(addrStr, `${glyph} ${labelStr}: ${addrStr}`);
            addressSelect.appendChild(opt);
        });

        const customOpt = createOption('__custom__', '➕ + Add New Address');
        addressSelect.appendChild(customOpt);

        addressSelect.style.display = 'block';

        // If the input already has a value matching one of the saved addresses, select it
        const currentAddr = addressInput.value.trim();
        const matchedAddr = addresses.find(a => (typeof a === 'object' ? a.address : a) === currentAddr);
        if (currentAddr && matchedAddr) {
            addressSelect.value = currentAddr;
            addressInput.style.display = 'none';
        } else if (currentAddr) {
            addressSelect.value = '__custom__';
            addressInput.style.display = 'block';
        }

        addressSelect.addEventListener('change', () => {
            const val = addressSelect.value;
            if (val === '__custom__') {
                addressInput.style.display = 'block';
                addressInput.value = '';
                addressInput.focus();
            } else if (val) {
                addressInput.value = val;
                addressInput.style.display = 'none';
            } else {
                addressInput.style.display = 'block';
            }
            if (typeof onSelectionChange === 'function') onSelectionChange();
        });
    }
}
