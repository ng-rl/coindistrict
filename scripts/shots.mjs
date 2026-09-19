// Visual QA: npm run build && npx vite preview --port 4173 && node scripts/shots.mjs ./shots
// Needs playwright (npm i -D playwright) and a Chromium; the flags below give software WebGL headless.
import { chromium } from 'playwright';
const out = process.argv[2] || '/tmp/shots';
const url = process.argv[3] || 'http://localhost:4173/';
const sizes = [[420, 896, 'phone'], [820, 1180, 'ipad']];
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'],
});
for (const [w, h, name] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${out}/${name}-first.png` });
  // swipe right→left twice (move down the ranking)
  const cx = w / 2, cy = h / 2;
  for (let k = 0; k < 2; k++) {
    await page.mouse.move(cx + 120, cy);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) { await page.mouse.move(cx + 120 - i * 40, cy); await page.waitForTimeout(16); }
    await page.mouse.up();
    await page.waitForTimeout(900);
  }
  await page.screenshot({ path: `${out}/${name}-swiped.png` });
  // jump far via keyboard to an ad plot
  for (let i = 0; i < 5; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(120); }
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${name}-ad.png` });
  // tap focused tower → sheet
  await page.mouse.click(cx - 20, h * 0.62);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${name}-sheet.png` });
  console.log(name, 'errors:', errors.length ? errors : 'none');
  await page.close();
}
await browser.close();
