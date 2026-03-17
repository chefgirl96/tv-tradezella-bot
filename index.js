import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true
  });
  const page = await context.newPage();

  try {
    // LOGIN TradingView
    await page.goto('https://www.tradingview.com/accounts/signin/');
    await page.fill('input[name="username"]', process.env.TV_EMAIL);
    await page.fill('input[name="password"]', process.env.TV_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    // Go to trading panel
    await page.goto('https://www.tradingview.com/chart/');
    await page.waitForTimeout(8000);

    // Open trading panel (bottom)
    await page.keyboard.press('Alt+T');
    await page.waitForTimeout(3000);

    // Click "List of Trades"
    await page.click('text=List of Trades');
    await page.waitForTimeout(2000);

    // Export CSV
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Export')
    ]);

    const filePath = './trades.csv';
    await download.saveAs(filePath);

    // LOGIN TradeZella
    await page.goto('https://app.tradezella.com/login');
    await page.fill('input[type="email"]', process.env.TZ_EMAIL);
    await page.fill('input[type="password"]', process.env.TZ_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    // Go to import page
    await page.goto('https://app.tradezella.com/trades/import');
    await page.waitForTimeout(5000);

    // Upload file
    await page.setInputFiles('input[type="file"]', filePath);
    await page.waitForTimeout(5000);

    console.log('✅ Upload complete');

  } catch (err) {
    console.error('❌ Error:', err);
  }

  await browser.close();
})();
