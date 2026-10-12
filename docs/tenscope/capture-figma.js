// Capture a frame of Tenscope's view-only Figma board as screenshot tiles.
//
// The Figma connector needs edit access, which GPOD does not have, but the
// public viewer renders the canvas in headless Chromium. Loading a node URL
// zooms the viewer to that node; ctrl+wheel zooms; each plain wheel event pans
// about 120 screen px however large its delta, so pans are sent in bursts.
// Keyboard shortcuts (Shift+1, Shift+2) do not reach the canvas.
//
// Usage: node capture-figma.js <node-id like 61-1646> <name> [zoomSteps=9] [tiles=9]
// Output: ./shots/<name>-fit.png and ./shots/<name>-00.png … (crop to the frame after)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [,, node, name, zoomSteps = '9', tiles = '9'] = process.argv;
const FILE = 'https://www.figma.com/design/0ACOl1BWpqZ4SppRvtCVeb/GPOD---Review?node-id=';
const W = 1400, H = 1300;

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--ssl-version-max=tls1.2', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
    proxy: { server: process.env.HTTPS_PROXY },
  });
  const ctx = await browser.newContext({ viewport: { width: W, height: H },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' });
  const page = await ctx.newPage();
  await page.goto(FILE + node, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(28000); // the canvas takes ~25s to render under swiftshader
  const zoom = () => page.evaluate(() => (document.body.innerText.match(/\b(\d+)%/) || [])[1]);
  console.log('fit zoom', await zoom());
  await page.screenshot({ path: `shots/${name}-fit.png` });

  // Zoom in around the top centre so the frame stays horizontally centred.
  await page.mouse.move(W / 2, 60);
  await page.keyboard.down('Control');
  for (let i = 0; i < +zoomSteps; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(120); }
  await page.keyboard.up('Control');
  await page.waitForTimeout(3000);
  console.log('zoom now', await zoom());

  for (let i = 0; i < +tiles; i++) {
    await page.screenshot({ path: `shots/${name}-${String(i).padStart(2, '0')}.png` });
    for (let k = 0; k < 8; k++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(90); }
    await page.waitForTimeout(2200);
  }
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
