const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Wait a bit for Monaco editor to load
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: '/home/z/my-project/download/virtual-ide-screenshot.png',
    fullPage: false
  });
  
  console.log('Screenshot saved to /home/z/my-project/download/virtual-ide-screenshot.png');
  
  await browser.close();
})();
