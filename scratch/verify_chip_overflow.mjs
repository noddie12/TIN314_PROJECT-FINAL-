import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-verify-'));
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--user-data-dir=' + tmpDir,
  '--remote-debugging-port=9246',
  '--window-size=1280,900',
  'http://localhost:3333/index.html#hub'
]);

await new Promise(r => setTimeout(r, 2000));
try {
  const tabsRes = await fetch('http://127.0.0.1:9246/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost:3333')) || tabs[0];
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(res => ws.onopen = res);

  let msgId = 1;
  const send = (method, params = {}) => new Promise(res => {
    const id = msgId++;
    const h = evt => {
      const d = JSON.parse(evt.data);
      if (d.id === id) { ws.removeEventListener('message', h); res(d.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await new Promise(r => setTimeout(r, 1200));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        sessionStorage.setItem('competemate_onboarding_dismissed', 'true');
        closeAllModals();
        const modal = document.getElementById('profileModal');
        if (modal) modal.classList.remove('is-active', 'active', 'show', 'is-open');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 400));

  // Find HUIT STARTUP card
  const result = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.comp-card'));
        const huitCard = cards.find(c => c.textContent.includes('HUIT STARTUP'));
        if (!huitCard) return { error: 'Card not found' };

        const stageChip = huitCard.querySelector('.comp-stage-chip');
        const starBtn = huitCard.querySelector('.icon-action-btn');
        const cardTop = huitCard.querySelector('.comp-card-top');

        const cardRect = huitCard.getBoundingClientRect();
        const stageRect = stageChip.getBoundingClientRect();
        const starRect = starBtn.getBoundingClientRect();
        const topRect = cardTop.getBoundingClientRect();

        return {
          cardWidth: Math.round(cardRect.width),
          cardRight: Math.round(cardRect.right),
          stageChipWidth: Math.round(stageRect.width),
          stageChipRight: Math.round(stageRect.right),
          stageChipLeft: Math.round(stageRect.left),
          stageChipText: stageChip.textContent.trim(),
          stageChipClass: stageChip.className,
          starBtnLeft: Math.round(starRect.left),
          // Verification checks:
          // 1. Stage chip right must be less than or equal to card's inner right boundary
          fitsInsideCard: stageRect.right <= cardRect.right - 10,
          // 2. Stage chip must not overflow horizontally
          marginToCardRight: Math.round(cardRect.right - stageRect.right),
          // 3. Check computed text-overflow and overflow
          computedOverflow: window.getComputedStyle(stageChip).overflow,
          computedTextOverflow: window.getComputedStyle(stageChip).textOverflow,
          computedDisplay: window.getComputedStyle(stageChip).display
        };
      })()
    `,
    returnByValue: true
  });

  console.log('CHIP OVERFLOW VERIFICATION RESULT:\n', JSON.stringify(result.result.value, null, 2));

  // Scroll to card and take screenshot
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.comp-card'));
        const huitCard = cards.find(c => c.textContent.includes('HUIT STARTUP'));
        if (huitCard) huitCard.scrollIntoView({ block: 'center' });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 400));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\huit_card_fixed.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved scratch/huit_card_fixed.png');

  // TEST MOBILE VIEW (390px)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 400));

  const mobileResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.comp-card'));
        const huitCard = cards.find(c => c.textContent.includes('HUIT STARTUP'));
        if (!huitCard) return null;
        const stageChip = huitCard.querySelector('.comp-stage-chip');
        const cardRect = huitCard.getBoundingClientRect();
        const stageRect = stageChip.getBoundingClientRect();
        return {
          cardWidth: Math.round(cardRect.width),
          stageChipWidth: Math.round(stageRect.width),
          fitsInsideCard: stageRect.right <= cardRect.right,
          marginToCardRight: Math.round(cardRect.right - stageRect.right)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('MOBILE OVERFLOW TEST:\n', JSON.stringify(mobileResult.result.value, null, 2));

  const mobileScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\huit_card_mobile.png', Buffer.from(mobileScreenshot.data, 'base64'));
  console.log('Saved scratch/huit_card_mobile.png');

  ws.close();
} finally {
  proc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
}
