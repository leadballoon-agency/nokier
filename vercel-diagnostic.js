const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n=== VERCEL DIAGNOSTIC REPORT ===\n');

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'playwright-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // Store network logs
  const networkLogs = [];
  page.on('response', async (response) => {
    try {
      networkLogs.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers()
      });
    } catch (e) {
      // Ignore errors
    }
  });

  // 1. Check if https://nokier.co.uk still shows 404
  console.log('1. Testing https://nokier.co.uk for 404 error...');
  try {
    const response = await page.goto('https://nokier.co.uk', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${response.status()}`);
    console.log(`   Status Text: ${response.statusText()}`);
    console.log(`   Final URL: ${response.url()}`);

    // Get page title and content
    const title = await page.title();
    console.log(`   Page Title: ${title}`);

    // Check for error messages
    const bodyText = await page.textContent('body');
    const isVercel404 = bodyText.includes('404') || bodyText.includes('This page could not be found');
    console.log(`   Is 404 Error: ${isVercel404}`);

    if (isVercel404) {
      console.log(`\n   ERROR DETAILS:`);
      console.log(`   ${bodyText.substring(0, 1000)}`);
    }

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'nokier-homepage.png'),
      fullPage: true
    });
    console.log(`   Screenshot saved: nokier-homepage.png`);

  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  console.log('\n');

  // 2. Check response headers to see what Vercel is returning
  console.log('2. Checking response headers from Vercel...');
  try {
    const response = await page.goto('https://nokier.co.uk', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    const headers = response.headers();

    console.log('   Response Headers:');
    Object.keys(headers).sort().forEach(key => {
      console.log(`     ${key}: ${headers[key]}`);
    });

  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  console.log('\n');

  // 3. Try accessing /index.html directly
  console.log('3. Testing https://nokier.co.uk/index.html directly...');
  try {
    const response = await page.goto('https://nokier.co.uk/index.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${response.status()}`);
    console.log(`   Status Text: ${response.statusText()}`);

    const title = await page.title();
    console.log(`   Page Title: ${title}`);

    const bodyText = await page.textContent('body');
    const is404 = bodyText.includes('404') || bodyText.includes('This page could not be found');
    console.log(`   Is 404 Error: ${is404}`);

    await page.screenshot({
      path: path.join(screenshotsDir, 'nokier-index-html.png'),
      fullPage: true
    });
    console.log(`   Screenshot saved: nokier-index-html.png`);

  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  console.log('\n');

  // 4. Test API endpoint to confirm deployment is active
  console.log('4. Testing API endpoint to confirm deployment is active...');
  try {
    const response = await page.goto('https://nokier.co.uk/api/hello', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${response.status()}`);
    const content = await page.textContent('body');
    console.log(`   Response: ${content.substring(0, 200)}`);

  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  console.log('\n');

  // 5. Check for styles.css and script.js
  console.log('5. Testing static file access...');

  const staticFiles = [
    'styles.css',
    'script.js'
  ];

  for (const file of staticFiles) {
    try {
      const response = await page.goto(`https://nokier.co.uk/${file}`, {
        timeout: 15000
      });
      console.log(`   /${file}: Status ${response.status()}`);
    } catch (error) {
      console.log(`   /${file}: ERROR - ${error.message}`);
    }
  }

  console.log('\n');

  // 6. Network logs summary
  console.log('6. Network Logs Summary...');
  console.log(`   Total requests: ${networkLogs.length}`);
  console.log('\n   First 15 requests:');
  networkLogs.slice(0, 15).forEach((log, index) => {
    console.log(`     ${index + 1}. [${log.status}] ${log.url}`);
  });

  console.log('\n=== END OF DIAGNOSTIC REPORT ===\n');

  // Save detailed network logs to file
  const logsFile = path.join(__dirname, 'network-logs.json');
  fs.writeFileSync(logsFile, JSON.stringify(networkLogs, null, 2));
  console.log(`Detailed network logs saved to: network-logs.json`);
  console.log(`Screenshots saved in: ${screenshotsDir}\n`);

  await browser.close();
})();
