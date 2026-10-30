import fs from 'fs';
import path from 'path';

function assert(cond, msg) {
    if (!cond) {
        console.error(`FAIL: ${msg}`);
        process.exit(1);
    }
    console.log(`PASS: ${msg}`);
}

const cwd = process.cwd();

// 1. index.html checks
const indexHtml = fs.readFileSync(path.join(cwd, 'index.html'), 'utf8');
assert(indexHtml.includes('The AutoLux Detailing Club'), 'index.html includes Detailing Club');
assert(indexHtml.includes('$129'), 'index.html includes $129');
assert(indexHtml.includes('/ month'), 'index.html includes / month');
assert(indexHtml.includes('booking.html?package=club'), 'index.html includes booking.html?package=club');
assert(indexHtml.includes('realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1'), 'index.html includes store checkout');
assert(indexHtml.includes('Annual Pass ($1,290/yr)'), 'index.html includes Annual Pass');
assert(indexHtml.includes('15% Member Discount'), 'index.html includes 15% discount');
assert(indexHtml.includes('Detailing Club Plan ($129/mo)'), 'index.html includes Club Plan ($129/mo)');

// 2. booking.html checks
const bookingHtml = fs.readFileSync(path.join(cwd, 'booking.html'), 'utf8');
assert(bookingHtml.includes('AutoLux Detailing Club Plan - $129/mo'), 'booking.html includes Detailing Club Plan');
assert(bookingHtml.includes('AutoLux Detailing Club Annual - $1,290/yr'), 'booking.html includes Detailing Club Annual');
assert(bookingHtml.includes('id="club-perks-banner"'), 'booking.html includes club perks banner');
assert(bookingHtml.includes('realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1'), 'booking.html includes store checkout');
assert(bookingHtml.includes('Detailing Club Plan ($129/mo)'), 'booking.html includes Club Plan ($129/mo)');

// 3. account.html checks
const accountHtml = fs.readFileSync(path.join(cwd, 'account.html'), 'utf8');
assert(accountHtml.includes('AutoLux VIP Club'), 'account.html includes AutoLux VIP Club');
assert(accountHtml.includes('$129 / mo'), 'account.html includes $129 / mo');
assert(accountHtml.includes('Join AutoLux Club ($129/mo)'), 'account.html includes Join Club');
assert(accountHtml.includes('realunstoppable.store/checkout.html?productId=autolux-detailing-club&quantity=1'), 'account.html includes store checkout');
assert(accountHtml.includes('Detailing Club Plan ($129/mo)'), 'account.html includes Club Plan ($129/mo)');

// 4. firestore.rules checks
const rules = fs.readFileSync(path.join(cwd, 'firestore.rules'), 'utf8');
assert(rules.includes('match /products/{productId}'), 'firestore.rules includes /products');
assert(rules.includes('allow read: if true;'), 'firestore.rules allows public read of products');
assert(rules.includes('allow write: if isAdmin();'), 'firestore.rules restricts product writes');

// 5. functions/index.js checks
const funcs = fs.readFileSync(path.join(cwd, 'functions/index.js'), 'utf8');
assert(funcs.includes('exports.createProduct'), 'functions includes createProduct');
assert(funcs.includes('exports.subscribeToClub'), 'functions includes subscribeToClub');
assert(funcs.includes('exports.stripeWebhook'), 'functions includes stripeWebhook');
assert(funcs.includes('x-unstoppable-api-key'), 'functions includes api key header check');
assert(funcs.includes('STORE_API_KEY'), 'functions includes STORE_API_KEY');

console.log('\n=== ALL UI & CONTENT REGRESSION VERIFICATIONS PASSED (100%) ===\n');
