const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
  const browser = await chromium.launch({
    args: ['--allow-file-access-from-files']
  });
  const page = await browser.newPage();

  page.on('console', msg => {
      if (msg.text().startsWith('TEST_FAIL:') || msg.text().startsWith('TEST_PASS:')) {
          console.log(msg.text());
      }
  });

  const htmlPath = path.resolve(__dirname, 'test_runner.html');
  await page.goto('file://' + htmlPath);

  await page.waitForTimeout(1000); // Wait for modules to load and run

  const testResults = await page.evaluate(() => {
      return window.testResults || { failed: true, total: 0, passed: 0, error: 'Tests did not complete' };
  });

  if (testResults.error) {
      console.error(testResults.error);
  } else {
      console.log('\nTest Summary: ' + testResults.passed + '/' + testResults.total + ' passed.');
  }

  await browser.close();
  return testResults.failed ? 1 : 0;
}

runTests().then(code => process.exit(code)).catch(err => {
    console.error(err);
    process.exit(1);
});
