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
 * Generates calendar month data structure with tagged days
 */
export function generateMonthData(year, month, { historicalEvents = [], upcomingEvents = [], washIntervalDays = 14 } = {}) {
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Map events by 'YYYY-MM-DD'
    const eventMap = new Map();

    // Historical detailing dates
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
                badge: '✦ Detailed',
                badgeColor: '#16A34A',
                dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            });
        }
    });

    // Upcoming appointments
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
                badgeColor: '#D4AF37',
                dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            });
        }
    });

    // Calculate predictive recommended washes based on last historical event or today
    let referenceDate = new Date();
    if (historicalEvents.length > 0) {
        const latestHist = new Date(Math.max(...historicalEvents.map(e => new Date(e.date).getTime())));
        if (!isNaN(latestHist.getTime())) {
            referenceDate = latestHist;
        }
    }

    // Project forward 3 cycles of recommended washes
    for (let cycle = 1; cycle <= 4; cycle++) {
        const projected = new Date(referenceDate);
        projected.setDate(projected.getDate() + (washIntervalDays * cycle));
        const key = projected.toISOString().split('T')[0];
        if (!eventMap.has(key)) {
            eventMap.set(key, {
                type: 'recommended',
                label: 'Recommended Maintenance Wash',
                service: 'Bi-Weekly Maintenance Foam Wash',
                badge: '○ Recommended Wash',
                badgeColor: '#38BDF8',
                notes: 'Ideal interval to remove brake dust & road film before clear coat bonding.',
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
        eventMap
    };
}
