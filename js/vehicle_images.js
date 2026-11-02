/**
 * AutoLux Luxury Automotive Image Database & Vehicle Classifier
 * Provides verified high-resolution photography for luxury, exotic, and performance vehicles
 */

export const VEHICLE_IMAGE_CATALOG = {
    // Porsche
    porsche_911_gt3: {
        matches: ['porsche 911 gt3', '911 gt3', 'gt3 rs', 'porsche gt3'],
        make: 'Porsche',
        model: '911 GT3',
        category: 'Exotic Track Weapon',
        imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14, // days
        recommendedService: 'Ceramic Coating + Paint Correction'
    },
    porsche_911: {
        matches: ['porsche 911', 'porsche carrera', 'carrera 4s', '911 turbo', '911'],
        make: 'Porsche',
        model: '911',
        category: 'Luxury Sports Car',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Signature Exterior + Ceramic Spray'
    },
    porsche_taycan: {
        matches: ['porsche taycan', 'taycan'],
        make: 'Porsche',
        model: 'Taycan',
        category: 'Electric Super-Sedan',
        imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Executive Ceramic Detail'
    },
    porsche_suv: {
        matches: ['porsche cayenne', 'porsche macan', 'cayenne', 'macan'],
        make: 'Porsche',
        model: 'Cayenne / Macan',
        category: 'Luxury Performance SUV',
        imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 21,
        recommendedService: 'Luxury SUV Package'
    },

    // Mercedes-Benz
    mercedes_g_wagon: {
        matches: ['g wagon', 'g-wagon', 'g63', 'g 63', 'mercedes g', 'gelandewagen'],
        make: 'Mercedes-AMG',
        model: 'G 63',
        category: 'Luxury Iconic SUV',
        imageUrl: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Luxury SUV Package + Ceramic Shield'
    },
    mercedes_amg_gt: {
        matches: ['amg gt', 'mercedes amg gt', 'amg-gt', 'mercedes-amg gt'],
        make: 'Mercedes-AMG',
        model: 'GT Coupe',
        category: 'Grand Tourer Supercar',
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Multi-Stage Paint Correction'
    },
    mercedes_s_class: {
        matches: ['mercedes s', 's-class', 's580', 'maybach', 'mercedes benz s', 'mercedes s-class'],
        make: 'Mercedes-Benz',
        model: 'S-Class / Maybach',
        category: 'Executive Flagship Sedan',
        imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Complete Interior Detail & Restoration'
    },
    mercedes_sprinter: {
        matches: ['sprinter', 'sprinter van', 'executive sprinter', 'mercedes sprinter'],
        make: 'Mercedes-Benz',
        model: 'Sprinter Executive Van',
        category: 'Executive Transport',
        imageUrl: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 30,
        recommendedService: 'Executive Sprinter Van Detail'
    },

    // BMW
    bmw_m4_m3: {
        matches: ['bmw m3', 'bmw m4', 'm3 competition', 'm4 competition', 'bmw m'],
        make: 'BMW M',
        model: 'M3 / M4 Competition',
        category: 'High-Performance Sports Coupe',
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Multi-Stage Paint Correction'
    },
    bmw_sedan: {
        matches: ['bmw 5', 'bmw 7', 'bmw 3', 'bmw 8', 'bmw i7', 'bmw'],
        make: 'BMW',
        model: 'Executive Sedan',
        category: 'Luxury Sedan',
        imageUrl: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 21,
        recommendedService: 'Luxury Sedan Detail'
    },
    bmw_suv: {
        matches: ['bmw x5', 'bmw x6', 'bmw x7', 'x5 m', 'x6 m', 'bmw xm'],
        make: 'BMW',
        model: 'X5 / X7 M',
        category: 'Luxury Performance SUV',
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 21,
        recommendedService: 'Luxury SUV Package'
    },

    // Tesla
    tesla_model_s: {
        matches: ['tesla model s', 'model s plaid', 'model s', 'tesla plaid'],
        make: 'Tesla',
        model: 'Model S Plaid',
        category: 'Electric Hyper-Sedan',
        imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Ceramic Coating (3 to 7 Year)'
    },
    tesla_cybertruck: {
        matches: ['cybertruck', 'cyber truck', 'tesla truck'],
        make: 'Tesla',
        model: 'Cybertruck',
        category: 'Stainless Steel Utility',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 21,
        recommendedService: 'Stainless Decontamination & Glass Seal'
    },
    tesla_general: {
        matches: ['tesla', 'model 3', 'model y', 'model x'],
        make: 'Tesla',
        model: 'Model 3 / Model Y',
        category: 'Modern Electric',
        imageUrl: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 21,
        recommendedService: 'Luxury Sedan Detail'
    },

    // Audi
    audi_rs: {
        matches: ['audi rs6', 'rs6 avant', 'audi r8', 'audi rs7', 'rs5', 'audi rs', 'e-tron gt'],
        make: 'Audi Sport',
        model: 'RS6 Avant / R8',
        category: 'Performance Wagon / Supercar',
        imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Paint Correction + Ceramic Coating'
    },
    audi_general: {
        matches: ['audi', 'audi a6', 'audi a8', 'audi q7', 'audi q8'],
        make: 'Audi',
        model: 'Luxury Vehicle',
        category: 'Executive Luxury',
        imageUrl: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 21,
        recommendedService: 'Luxury Sedan Detail'
    },

    // Ferrari / Lamborghini Exotics
    ferrari: {
        matches: ['ferrari', 'f8', '488', '296', 'sf90', 'roma', '812'],
        make: 'Ferrari',
        model: 'Supercar',
        category: 'Maranello Exotic',
        imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Concierge Multi-Stage Correction'
    },
    lamborghini: {
        matches: ['lamborghini', 'huracan', 'urus', 'revuelto', 'aventador', 'lambo'],
        make: 'Lamborghini',
        model: 'Exotic V10/V12',
        category: 'Italian Exotic Supercar',
        imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Ceramic Coating + Leather Shield'
    },

    // Corvette
    corvette: {
        matches: ['corvette', 'c8', 'z06', 'chevy corvette', 'corvette z06'],
        make: 'Chevrolet',
        model: 'Corvette C8 / Z06',
        category: 'American Mid-Engine Supercar',
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Signature Exterior + Ceramic Spray'
    },

    // Land Rover / Range Rover
    range_rover: {
        matches: ['range rover', 'land rover', 'defender', 'range rover sport', 'rover'],
        make: 'Range Rover',
        model: 'SV / Autobiography',
        category: 'Ultra-Luxury British SUV',
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 21,
        recommendedService: 'Luxury SUV Package + Leather Shield'
    },

    // Trucks
    luxury_truck: {
        matches: ['raptor', 'f-150', 'f150', 'ford raptor', 'ram trx', 'trx', 'sierra', 'silverado', 'tundra', 'truck'],
        make: 'Performance Truck',
        model: 'Raptor / TRX / Heavy-Duty',
        category: 'Premium Performance Truck',
        imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80', // Fallback or truck photo
        thumbUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 21,
        recommendedService: 'Premium Truck Detail'
    },

    // Rolls-Royce / Bentley
    ultra_luxury: {
        matches: ['rolls-royce', 'rolls royce', 'ghost', 'cullinan', 'phantom', 'bentley', 'continental gt', 'bentayga'],
        make: 'Bespoke Luxury',
        model: 'Pinnacle Coachwork',
        category: 'Ultra-Luxury Coachwork',
        imageUrl: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 14,
        recommendedService: 'Concierge Multi-Stage Correction + 7-Yr Ceramic'
    },

    // Default Luxury Showcase
    default_luxury: {
        matches: [],
        make: 'Luxury Vehicle',
        model: 'Precision Detailed',
        category: 'Showroom Vehicle',
        imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80',
        thumbUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=400&q=75',
        recommendedWashInterval: 21,
        recommendedService: 'Luxury Sedan Detail'
    }
};

/**
 * Intelligent Vehicle Matcher
 * Parses user input (e.g., "2024 Porsche 911 GT3") and returns full metadata with photography
 */
export function matchVehicle(vehicleString = '') {
    if (!vehicleString || typeof vehicleString !== 'string') {
        return {
            ...VEHICLE_IMAGE_CATALOG.default_luxury,
            year: '',
            rawName: 'Registered Luxury Vehicle'
        };
    }

    const cleanInput = vehicleString.trim();
    const lowerInput = cleanInput.toLowerCase();

    // Extract year if present (e.g. 2024, 2021)
    const yearMatch = cleanInput.match(/\b(19\d\d|20\d\d)\b/);
    const year = yearMatch ? yearMatch[1] : '';

    // Search catalog by matches
    for (const [key, item] of Object.entries(VEHICLE_IMAGE_CATALOG)) {
        if (key === 'default_luxury') continue;
        for (const pattern of item.matches) {
            if (lowerInput.includes(pattern)) {
                return {
                    ...item,
                    year: year || '2024',
                    rawName: cleanInput,
                    displayName: cleanInput
                };
            }
        }
    }

    // Heuristics based on general keywords
    if (lowerInput.includes('truck') || lowerInput.includes('f-150') || lowerInput.includes('silverado')) {
        return { ...VEHICLE_IMAGE_CATALOG.luxury_truck, year: year || '2024', rawName: cleanInput, displayName: cleanInput };
    }
    if (lowerInput.includes('suv') || lowerInput.includes('tahoe') || lowerInput.includes('escalade')) {
        return { ...VEHICLE_IMAGE_CATALOG.mercedes_g_wagon, make: 'Luxury SUV', model: cleanInput, category: 'Luxury Full-Size SUV', year: year || '2024', rawName: cleanInput, displayName: cleanInput };
    }
    if (lowerInput.includes('van') || lowerInput.includes('transit') || lowerInput.includes('sprinter')) {
        return { ...VEHICLE_IMAGE_CATALOG.mercedes_sprinter, year: year || '2024', rawName: cleanInput, displayName: cleanInput };
    }

    // Default luxury vehicle presentation
    return {
        ...VEHICLE_IMAGE_CATALOG.default_luxury,
        year: year || '2024',
        rawName: cleanInput,
        displayName: cleanInput,
        make: cleanInput.split(' ')[0] || 'Luxury',
        model: cleanInput.split(' ').slice(1).join(' ') || 'Vehicle'
    };
}
