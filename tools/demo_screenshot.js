const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const fileUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
    console.log('Opening', fileUrl);
    await page.goto(fileUrl, { waitUntil: 'networkidle2' });

    // choose client mock provider
    await page.select('#providerSelect', 'client-mock');
    // click start
    await page.click('#startBtn');
    await page.waitForSelector('.card .back', { timeout: 2000 });

    // take initial screenshot
    await page.screenshot({ path: 'screenshot-1.png', fullPage: true });

    // click the first card
    await page.click('.card[data-index="0"]');
    await page.waitForSelector('.llm, .error', { timeout: 5000 });
    await page.screenshot({ path: 'screenshot-2.png', fullPage: true });

    // click deep dive
    const deepBtn = await page.$('#deepBtn');
    if (deepBtn) {
        await deepBtn.click();
        await page.waitForSelector('.risks, .llm', { timeout: 5000 });
        await page.screenshot({ path: 'screenshot-3.png', fullPage: true });
    }

    console.log('Screenshots saved: screenshot-1.png, screenshot-2.png, screenshot-3.png');
    await browser.close();
})();
