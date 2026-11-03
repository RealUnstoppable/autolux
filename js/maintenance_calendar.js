/**
 * AutoLux Automotive Maintenance Calendar
 * Flo-inspired cycle & health tracker for luxury mobile car detailing
 * Tracks historical washes, upcoming scheduled appointments, and predictive maintenance intervals
 */

/**
 * Calculates a vehicle's Paint & Protection Health Score (0 - 100%)
 * based on days since last detail and service type
 */
export function calculateProtectionScore(lastDetailDate, serviceType = 'Ceramic Coating') {
    if (!lastDetailDate) {
        return {
            score: 72,
            status: 'Maintenance Due',
            statusClass: 'status-warning',
            daysSince: 28,
            coatHealth: '65%',
            glossRetention: '78%',
            interiorSanitization: '70%',
            recommendedAction: 'Schedule a Bi-Weekly Maintenance Foam Wash'
        };
    }

    const last = new Date(lastDetailDate);
    const now = new Date();
    const diffTime = Math.abs(now - last);
    const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Scores decline gently based on days since wash
    let score = 100;
    if (daysSince <= 7) {
        score = 98;
    } else if (daysSince <= 14) {
        score = 94;
    } else if (daysSince <= 21) {
        score = 88;
    } else if (daysSince <= 30) {
        score = 80;
    } else if (daysSince <= 45) {
        score = 68;
    } else {
        score = Math.max(45, 100 - daysSince);
    }

    let status = 'Peak Showroom Finish';
    let statusClass = 'status-excellent';
    let recommendedAction = 'Paint is slick and fully protected. Next maintenance wash suggested in 7-10 days.';

    if (score < 75) {
        status = 'Decontamination Recommended';
        statusClass = 'status-warning';
        recommendedAction = 'Paint protection requires maintenance wash & SiO2 booster.';
    } else if (score < 90) {
        status = 'Optimal Protection';
        statusClass = 'status-good';
        recommendedAction = 'Maintenance foam bath recommended this week.';
    }

    return {
        score,
        status,
        statusClass,
        daysSince,
        coatHealth: `${Math.min(99, Math.max(50, score + 2))}%`,
        glossRetention: `${Math.min(99, Math.max(55, score + 1))}%`,
        interiorSanitization: `${Math.min(99, Math.max(40, score - 5))}%`,
        recommendedAction
    };
}

/**
 * Calculates AI-Predicted Next Detail Date based on user wash intervals and parking environment.
 * Outside vehicles experience accelerated fallout bonding and UV breakdown requiring shorter intervals.
 *
 * @param {Object} options
 * @param {string|Date} [options.lastDetailDate]
 * @param {string} [options.parkingEnvironment='Garage Kept']
 * @param {number} [options.washIntervalDays=14]
 * @returns {Object}
 */
export function calculateAiPredictedDetailDate({
    lastDetailDate = new Date(),
    parkingEnvironment = 'Garage Kept',
    washIntervalDays = 14
} = {}) {
    const lastDate = new Date(lastDetailDate);
    const validLast = isNaN(lastDate.getTime()) ? new Date() : lastDate;
    const baseInterval = Number(washIntervalDays) || 14;

    const isOutside = (parkingEnvironment || '').toLowerCase().includes('outside');
    // Outside parking reduces cycle by ~30% due to rain, pollen, and UV degradation
    const adjustedInterval = isOutside ? Math.max(7, Math.round(baseInterval * 0.72)) : baseInterval;

    const predicted = new Date(validLast);
    predicted.setDate(predicted.getDate() + adjustedInterval);

    const predictedKey = predicted.toISOString().split('T')[0];

    return {
        predictedDateKey: predictedKey,
        predictedDateStr: predicted.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        intervalDays: adjustedInterval,
        parkingEnvironment: isOutside ? 'Parked Outside' : 'Garage Kept',
        environmentalImpact: isOutside
            ? 'Sun exposure, pollen fallout, and acid rain accelerate clear coat oxidation.'
            : 'Controlled garage humidity & shade maintain hydrophobic ceramic coating longer.',
        colorCode: '#38BDF8', // Electric Blue / Purple Pulse
        colorClass: 'day-electric-pulse'
    };
}

/**
 * Generates an empathetic retention notification when a vehicle is overdue for car care (21-30+ days)
 *
 * @param {Object} options
 * @param {string|Date} [options.lastDetailDate]
 * @param {string} [options.vehicleName='Your Luxury Vehicle']
 * @returns {Object}
 */
export function getRetentionSpaNotification({
    lastDetailDate = null,
    vehicleName = 'Your Vehicle'
} = {}) {
    if (!lastDetailDate) {
        return {
            shouldNotify: true,
            daysSince: 28,
            vehicleName,
            message: `✨ Your ${vehicleName} is craving a spa day! It's been 28 days since its last detail—schedule today to protect your finish.`,
            ctaUrl: 'booking.html?package=sedan&reason=retention_spa',
            urgency: 'high'
        };
    }

    const last = new Date(lastDetailDate);
    const now = new Date();
    const diffTime = Math.abs(now - last);
    const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (daysSince >= 21) {
        return {
            shouldNotify: true,
            daysSince,
            vehicleName,
            message: `✨ Your ${vehicleName} is craving a spa day! It's been ${daysSince} days since its last detail—schedule today to protect your finish.`,
            ctaUrl: 'booking.html?package=sedan&reason=retention_spa',
            urgency: daysSince >= 35 ? 'critical' : (daysSince >= 28 ? 'high' : 'medium')
        };
    }

    return {
        shouldNotify: false,
        daysSince,
        vehicleName
    };
}

/**
 * Generates calendar month data structure with tagged days
 * Flo-style color coding:
 * - Metallic Gold (#D4AF37): Completed historical details (click opens Service Media Gallery)
 * - Emerald Green (#10B981): Upcoming scheduled or recurring membership washes
 * - Electric Blue / Purple Pulse (#38BDF8): AI-Predicted Next Detail Days
 */
export function generateMonthData(year, month, {
    historicalEvents = [],
    upcomingEvents = [],
    washIntervalDays = 14,
    parkingEnvironment = 'Garage Kept'
} = {}) {
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Map events by 'YYYY-MM-DD'
    const eventMap = new Map();

    // 1. Historical detailing dates (METALLIC GOLD)
    historicalEvents.forEach(evt => {
        const d = new Date(evt.date);
        if (!isNaN(d.getTime())) {
            const key = d.toISOString().split('T')[0];
            eventMap.set(key, {
                type: 'historical',
                label: 'Showroom Detail Completed',
                service: evt.service || 'Signature Detail',
                vehicle: evt.vehicle || 'Vehicle',
                notes: evt.notes || 'Full vehicle decontamination and ceramic gloss enhancement.',
                badge: '✦ Detailed (Past)',
                badgeColor: '#D4AF37', // Metallic Gold
                themeClass: 'day-gold',
                dotClass: 'hist',
                hasMediaGallery: true,
                media: {
                    beforeImageUrl: evt.beforeImageUrl || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=600&auto=format',
                    afterImageUrl: evt.afterImageUrl || 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=600&auto=format',
                    videoUrl: evt.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-car-wash-in-a-detail-shop-40114-large.mp4',
                    glossLevel: evt.glossLevel || '98.6 GU',
                    swirlRemoval: evt.swirlRemoval || '96%',
                    hydrophobicAngle: evt.hydrophobicAngle || '112°'
                },
                dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            });
        }
    });

    // 2. Upcoming appointments (EMERALD GREEN)
    upcomingEvents.forEach(evt => {
        const d = new Date(evt.date);
        if (!isNaN(d.getTime())) {
            const key = d.toISOString().split('T')[0];
            eventMap.set(key, {
                type: 'upcoming',
                label: 'Upcoming Detail Appointment',
                service: evt.service || evt.package || 'Executive Detail',
                vehicle: evt.vehicle || 'Vehicle',
                time: evt.time || '10:00 AM',
                badge: '⚡ Scheduled',
                badgeColor: '#10B981', // Emerald Green
                themeClass: 'day-emerald',
                dotClass: 'upcom',
                dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            });
        }
    });

    // 3. AI-Predicted Next Detail Days (ELECTRIC BLUE / PURPLE PULSE)
    let referenceDate = new Date();
    if (historicalEvents.length > 0) {
        const latestHist = new Date(Math.max(...historicalEvents.map(e => new Date(e.date).getTime())));
        if (!isNaN(latestHist.getTime())) {
            referenceDate = latestHist;
        }
    }

    const aiPlan = calculateAiPredictedDetailDate({
        lastDetailDate: referenceDate,
        parkingEnvironment,
        washIntervalDays
    });

    // Project forward cycles of recommended washes using adjusted interval
    for (let cycle = 1; cycle <= 4; cycle++) {
        const projected = new Date(referenceDate);
        projected.setDate(projected.getDate() + (aiPlan.intervalDays * cycle));
        const key = projected.toISOString().split('T')[0];
        if (!eventMap.has(key)) {
            eventMap.set(key, {
                type: 'recommended',
                label: 'AI-Predicted Wash Window',
                service: 'Recommended Maintenance Foam Wash',
                badge: '○ Recommended Wash',
                badgeColor: '#38BDF8', // Electric Blue Pulse
                themeClass: 'day-electric-pulse',
                dotClass: 'recom',
                notes: `AI-computed for ${aiPlan.parkingEnvironment}: ${aiPlan.environmentalImpact}`,
                dateStr: projected.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
                bookUrl: `booking.html?package=club&date=${key}`
            });
        }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const days = [];

    // Previous month padding days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        const prevMonthDate = new Date(year, month - 1, dayNum);
        const key = prevMonthDate.toISOString().split('T')[0];
        days.push({
            dayNumber: dayNum,
            isCurrentMonth: false,
            dateKey: key,
            isToday: key === todayStr,
            event: eventMap.get(key) || null
        });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const key = currentDate.toISOString().split('T')[0];
        days.push({
            dayNumber: day,
            isCurrentMonth: true,
            dateKey: key,
            isToday: key === todayStr,
            event: eventMap.get(key) || null
        });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
        const nextMonthDate = new Date(year, month + 1, nextDay);
        const key = nextMonthDate.toISOString().split('T')[0];
        days.push({
            dayNumber: nextDay,
            isCurrentMonth: false,
            dateKey: key,
            isToday: key === todayStr,
            event: eventMap.get(key) || null
        });
    }

    return {
        year,
        month,
        monthName: new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        days,
        eventMap,
        aiPlan
    };
}
