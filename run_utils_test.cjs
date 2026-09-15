const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'test_utils.html' : req.url);

  let extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js': contentType = 'text/javascript'; break;
    case '.css': contentType = 'text/css'; break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if(err.code == 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(3000, async () => {
  console.log('Server running at http://localhost:3000/');

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    let testsFinished = false;
    let passes = 0;
    let failures = 0;
    let errorMsg = null;

    page.on('console', msg => {
      const text = msg.text();
      console.log('PAGE LOG:', text);

      if (text.startsWith('__TEST_RESULT__=')) {
        const resultJson = text.substring('__TEST_RESULT__='.length);
        const result = JSON.parse(resultJson);
        passes = result.passes;
        failures = result.failures;
        testsFinished = true;
      } else if (text.startsWith('__TEST_ERROR__=')) {
        errorMsg = text.substring('__TEST_ERROR__='.length);
        testsFinished = true;
      }
    });

    page.on('pageerror', err => {
      console.error('PAGE ERROR:', err);
      errorMsg = err.message;
      testsFinished = true;
    });

    await page.goto('http://localhost:3000/test_utils.html');

    let attempts = 0;
    while (!testsFinished && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    if (!testsFinished) {
      console.error('Timeout waiting for tests to complete');
      await browser.close();
      server.close();
      process.exit(1);
    }

    if (errorMsg) {
      console.error('Test execution error!', errorMsg);
      await browser.close();
      server.close();
      process.exit(1);
    }

    if (failures > 0) {
      console.error(`Tests failed! Passes: ${passes}, Failures: ${failures}`);
      await browser.close();
      server.close();
      process.exit(1);
    } else {
      console.log(`All tests passed! Passes: ${passes}`);
    }

    await browser.close();
    server.close();
    process.exit(0);
  } catch(e) {
    console.error("Runner error:", e);
    server.close();
    process.exit(1);
  }
});
