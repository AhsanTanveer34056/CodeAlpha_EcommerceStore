const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(__dirname, 'public', 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Helper to check if server is responsive
function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(BASE_URL, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.end();
  });
}

// Helper to sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  let serverProcess = null;
  const isAlreadyRunning = await checkServer();

  if (!isAlreadyRunning) {
    console.log('Server is not running. Starting Express server...');
    serverProcess = spawn('node', ['server/app.js'], {
      stdio: 'inherit',
      shell: true,
    });

    // Wait for server to become ready
    let attempts = 0;
    while (attempts < 20) {
      await sleep(1000);
      const ready = await checkServer();
      if (ready) {
        console.log('Server is ready!');
        break;
      }
      attempts++;
    }

    if (attempts >= 20) {
      console.error('Timeout waiting for Express server to start.');
      process.exit(1);
    }
  } else {
    console.log('Express server is already running.');
  }

  console.log('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // -------------------------------------------------------------
    // 1. Homepage with featured products and category grid
    // -------------------------------------------------------------
    console.log('Capturing Homepage...');
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle2' });
    
    // Wait for featured product grid to load (replace skeleton loader)
    await page.waitForSelector('.product-card', { timeout: 10000 });
    await sleep(1000); // Allow image lazy-loading and layout to settle
    
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'homepage.png'),
    });
    console.log('✓ Saved homepage.png');

    // -------------------------------------------------------------
    // 2. Product listing page with skeleton loaders
    // -------------------------------------------------------------
    console.log('Capturing Product Listing with Skeleton Loaders...');
    await page.setViewport({ width: 1280, height: 900 });
    // Go to products page with 10 second artificial delay
    await page.goto(`${BASE_URL}/products.html?delay=10000`);
    
    // Wait for skeleton grid cards to appear
    await page.waitForSelector('.skeleton-card', { timeout: 5000 });
    await sleep(500); // Wait for potential animations to start/settle
    
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'products-skeleton.png'),
    });
    console.log('✓ Saved products-skeleton.png');

    // -------------------------------------------------------------
    // 3. Slide-in cart drawer with quantity controls
    // -------------------------------------------------------------
    console.log('Capturing Slide-in Cart Drawer...');
    await page.setViewport({ width: 1280, height: 900 });
    // Load products page without delay
    await page.goto(`${BASE_URL}/products.html`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.product-card', { timeout: 10000 });
    
    // Interact with page context to seed cart and open drawer
    await page.evaluate(() => {
      // Clear existing cart items
      clearCart();
      
      // Select the first two products on the page and add them to cart
      // We do this by calling addToCart programmatically since we have all helper functions global
      const products = [];
      const cards = document.querySelectorAll('.product-card');
      
      // Let's scrape product details from first two cards and add them to cart
      cards.forEach((card, index) => {
        if (index < 2) {
          // Parse product details or add sample data
          // We can call click on the Add to Cart button which works perfectly
          const btn = card.querySelector('button.btn-primary');
          if (btn) btn.click();
        }
      });
      
      // Open the cart drawer
      openCartDrawer();
    });

    // Wait for sliding drawer transition (300ms in CSS)
    await sleep(800);

    // Double check drawer is open and take screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'cart-drawer.png'),
    });
    console.log('✓ Saved cart-drawer.png');

    // -------------------------------------------------------------
    // 4. Mobile view with hamburger navigation
    // -------------------------------------------------------------
    console.log('Capturing Mobile View with Hamburger Nav...');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.product-card', { timeout: 10000 });

    // Open mobile navigation menu
    await page.evaluate(() => {
      const hamburger = document.getElementById('hamburger');
      if (hamburger) hamburger.click();
    });

    // Wait for transition
    await sleep(600);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-menu.png'),
    });
    console.log('✓ Saved mobile-menu.png');

  } catch (err) {
    console.error('An error occurred during screenshot generation:', err);
  } finally {
    console.log('Closing browser...');
    await browser.close();

    if (serverProcess) {
      console.log('Stopping Express server...');
      serverProcess.kill('SIGINT');
    }
    console.log('Done!');
  }
}

main();
