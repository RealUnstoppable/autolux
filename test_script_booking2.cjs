const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log('Navigating to booking.html...');
  await page.goto('http://localhost:8000/booking.html');
  await page.waitForTimeout(2000);

  console.log('Current URL: ', page.url());

  await browser.close();
})();
