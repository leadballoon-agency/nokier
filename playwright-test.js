const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n=== INVESTIGATION REPORT ===\n');

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'playwright-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // 1. Test main website
  console.log('1. Testing https://nokier.co.uk ...');
  try {
    const response = await page.goto('https://nokier.co.uk', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${response.status()}`);
    console.log(`   Status Text: ${response.statusText()}`);
    console.log(`   URL: ${response.url()}`);

    // Get page title and content
    const title = await page.title();
    console.log(`   Page Title: ${title}`);

    // Check for Vercel error page
    const bodyText = await page.textContent('body');
    const isVercelError = bodyText.includes('404') || bodyText.includes('This page could not be found');
    console.log(`   Is Vercel 404 page: ${isVercelError}`);

    if (isVercelError) {
      console.log(`   Error message found on page`);
      console.log(`   First 500 chars of body: ${bodyText.substring(0, 500)}`);
    }

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, '1-main-site.png'),
      fullPage: true
    });
    console.log(`   Screenshot saved: 1-main-site.png`);

  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  console.log('\n');

  // 2. Test API endpoint: /api/hello
  console.log('2. Testing https://nokier.co.uk/api/hello ...');
  try {
    await page.goto('https://nokier.co.uk/api/hello', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const content = await page.textContent('body');
    console.log(`   Response: ${content}`);

    await page.screenshot({
      path: path.join(screenshotsDir, '2-api-hello.png'),
      fullPage: true
    });
    console.log(`   Screenshot saved: 2-api-hello.png`);

  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  console.log('\n');

  // 3. Test API endpoint: /api/count
  console.log('3. Testing https://nokier.co.uk/api/count ...');
  try {
    await page.goto('https://nokier.co.uk/api/count', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const content = await page.textContent('body');
    console.log(`   Response: ${content}`);

    await page.screenshot({
      path: path.join(screenshotsDir, '3-api-count.png'),
      fullPage: true
    });
    console.log(`   Screenshot saved: 3-api-count.png`);

  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  console.log('\n');

  // 4. Check for Vercel deployment URL
  console.log('4. Checking for Vercel deployment information...');
  try {
    await page.goto('https://nokier.co.uk', { timeout: 30000 });

    // Check response headers for Vercel info
    const response = await page.goto('https://nokier.co.uk', { timeout: 30000 });
    const headers = response.headers();

    console.log('   Response Headers:');
    if (headers['x-vercel-id']) console.log(`     x-vercel-id: ${headers['x-vercel-id']}`);
    if (headers['x-vercel-cache']) console.log(`     x-vercel-cache: ${headers['x-vercel-cache']}`);
    if (headers['server']) console.log(`     server: ${headers['server']}`);

    // Check HTML for vercel references
    const htmlContent = await page.content();
    const vercelMatches = htmlContent.match(/vercel\.app/gi);
    if (vercelMatches) {
      console.log(`   Found ${vercelMatches.length} references to vercel.app in HTML`);
    }

  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  console.log('\n');

  // 5. Try accessing index.html explicitly
  console.log('5. Testing https://nokier.co.uk/index.html explicitly...');
  try {
    const response = await page.goto('https://nokier.co.uk/index.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${response.status()}`);
    console.log(`   Status Text: ${response.statusText()}`);

    await page.screenshot({
      path: path.join(screenshotsDir, '4-index-html.png'),
      fullPage: true
    });
    console.log(`   Screenshot saved: 4-index-html.png`);

  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  console.log('\n');

  // 6. Check network requests
  console.log('6. Checking network requests to main site...');
  try {
    const requests = [];
    page.on('request', request => requests.push(request.url()));

    await page.goto('https://nokier.co.uk', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Total requests made: ${requests.length}`);
    console.log(`   Requests:`);
    requests.slice(0, 10).forEach(url => console.log(`     - ${url}`));

  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  console.log('\n=== END OF REPORT ===\n');
  console.log(`Screenshots saved in: ${screenshotsDir}`);

  await browser.close();
})();
