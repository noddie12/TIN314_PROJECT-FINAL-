import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9236',
  '--window-size=1280,1000',
  'http://localhost:3333/index.html#hub'
]);

await new Promise(r => setTimeout(r, 2000));
try {
  const tabsRes = await fetch('http://127.0.0.1:9236/json');
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

  // Inspect the first 8 cards
  const verification = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.comp-card')).slice(0, 8);
        const results = cards.map((c, i) => {
          const title = c.querySelector('.comp-card-title').textContent.trim();
          const badge = c.querySelector('.match-score-badge');
          const star = c.querySelector('.icon-action-btn');
          const top = c.querySelector('.comp-card-top');
          const bRect = badge.getBoundingClientRect();
          const sRect = star.getBoundingClientRect();
          const topRect = top.getBoundingClientRect();
          
          const sCenterY = sRect.top + sRect.height / 2;
          const bCenterY = bRect.top + bRect.height / 2;
          const diffCenterY = Math.abs(sCenterY - bCenterY);
          
          return {
            index: i + 1,
            title,
            diffCenterY: Math.round(diffCenterY * 100) / 100,
            starAtTopRight: Math.abs(sRect.right - topRect.right) <= 2,
            aligned: diffCenterY <= 1
          };
        });

        // Test clicking the star on the first card
        const firstCard = cards[0];
        const firstStar = firstCard.querySelector('.icon-action-btn');
        const beforeSaved = firstStar.classList.contains('is-saved');
        firstStar.click();
        const afterSaved = firstStar.classList.contains('is-saved');
        // Toggle back
        firstStar.click();
        const finalSaved = firstStar.classList.contains('is-saved');

        return {
          cardAlignments: results,
          clickToggleWorks: (beforeSaved !== afterSaved) && (finalSaved === beforeSaved),
          allAligned: results.every(r => r.aligned),
          allAtTopRight: results.every(r => r.starAtTopRight)
        };
      })()
    `,
    returnByValue: true
  });

  console.log('HUB STAR ALIGNMENT VERIFICATION:\n', JSON.stringify(verification.result.value, null, 2));

  // Scroll to make sure cards are well framed and dismiss any toast
  await send('Runtime.evaluate', {
    expression: `
      document.querySelectorAll('.toast').forEach(t => t.remove());
      window.scrollTo(0, 320);
    `
  });
  await new Promise(r => setTimeout(r, 400));

  // Capture desktop screenshot
  const screenshotDesktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\hub_star_desktop_verified.png', Buffer.from(screenshotDesktop.data, 'base64'));
  console.log('Saved to scratch/hub_star_desktop_verified.png');

  // Test mobile viewport (375x812)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 1,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 400));

  const mobileVerification = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.comp-card')).slice(0, 4);
        return cards.map(c => {
          const badge = c.querySelector('.match-score-badge');
          const star = c.querySelector('.icon-action-btn');
          const bRect = badge.getBoundingClientRect();
          const sRect = star.getBoundingClientRect();
          return {
            diffCenterY: Math.round(Math.abs((sRect.top + sRect.height/2) - (bRect.top + bRect.height/2)) * 100) / 100
          };
        });
      })()
    `,
    returnByValue: true
  });

  console.log('MOBILE ALIGNMENTS:\n', JSON.stringify(mobileVerification.result.value, null, 2));

  const screenshotMobile = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\hub_star_mobile_verified.png', Buffer.from(screenshotMobile.data, 'base64'));
  console.log('Saved to scratch/hub_star_mobile_verified.png');

  ws.close();
} finally {
  proc.kill();
}
