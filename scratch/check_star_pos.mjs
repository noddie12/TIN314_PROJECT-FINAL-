import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9233',
  '--window-size=1280,900',
  'http://localhost:3333/index.html#hub'
]);

await new Promise(r => setTimeout(r, 2000));
try {
  const tabsRes = await fetch('http://127.0.0.1:9233/json');
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
        document.querySelectorAll('.comp-card .comp-card-top').forEach(t => {
          t.style.alignItems = 'flex-start';
        });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 400));

  const info = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.comp-card'));
        const uebCard = cards.find(c => c.textContent.includes('UEB Business Challenges')) || cards[0];
        const card = uebCard;
        const badge = card.querySelector('.match-score-badge');
        const star = card.querySelector('.icon-action-btn');
        const top = card.querySelector('.comp-card-top');
        const bRect = badge.getBoundingClientRect();
        const sRect = star.getBoundingClientRect();
        return {
          cardTitle: card.querySelector('.comp-card-title').textContent.trim(),
          topHTML: top.outerHTML,
          topComputedAlign: window.getComputedStyle(top).alignItems,
          starParentTag: star.parentElement.tagName + '.' + star.parentElement.className,
          starComputedAlignSelf: window.getComputedStyle(star).alignSelf,
          badgeTop: bRect.top,
          badgeHeight: bRect.height,
          starTop: sRect.top,
          starHeight: sRect.height
        };
      })()
    `,
    returnByValue: true
  });

  console.log('ALIGN-ITEMS FLEX-START METRICS:', JSON.stringify(info.result.value, null, 2));

  // Capture screenshot of the UEB card
  const screenshot = await send('Page.captureScreenshot', {
    clip: {
      x: 30,
      y: 350,
      width: 450,
      height: 400,
      scale: 1
    }
  });
  fs.writeFileSync('d:\\HA\\scratch\\test_card_star_flex_start.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved to scratch/test_card_star_flex_start.png');

  ws.close();
} finally {
  proc.kill();
}
