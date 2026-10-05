import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9235',
  '--window-size=1280,1000',
  'http://localhost:3333/index.html#hub'
]);

await new Promise(r => setTimeout(r, 2000));
try {
  const tabsRes = await fetch('http://127.0.0.1:9235/json');
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

  // Apply styling experiment
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        let style = document.getElementById('test-star-style');
        if (!style) {
          style = document.createElement('style');
          style.id = 'test-star-style';
          document.head.appendChild(style);
        }
        style.textContent = \`
          .comp-card {
            position: relative;
          }
          .comp-card-top {
            position: relative;
            padding-right: 36px;
            margin-bottom: var(--space-2);
            min-width: 0;
            display: block;
          }
          .comp-badges-left {
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 0;
            flex-wrap: wrap;
          }
          .match-score-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-family: var(--font-display);
            font-size: 13.5px;
            font-weight: 700;
            color: var(--color-primary);
            height: 30px;
            line-height: 1;
          }
          .comp-card .icon-action-btn {
            position: absolute;
            top: 0;
            right: 0;
            margin: 0;
          }
        \`;
      })()
    `
  });
  await new Promise(r => setTimeout(r, 500));

  const metrics = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.comp-card'));
        const uebCard = cards.find(c => c.textContent.includes('UEB Business Challenges')) || cards[0];
        const card = uebCard;
        const badge = card.querySelector('.match-score-badge');
        const star = card.querySelector('.icon-action-btn');
        const bRect = badge.getBoundingClientRect();
        const sRect = star.getBoundingClientRect();
        return {
          cardTitle: card.querySelector('.comp-card-title').textContent.trim(),
          badgeTop: bRect.top,
          badgeHeight: bRect.height,
          badgeCenterY: bRect.top + bRect.height / 2,
          starTop: sRect.top,
          starHeight: sRect.height,
          starCenterY: sRect.top + sRect.height / 2,
          diffCenterY: (sRect.top + sRect.height / 2) - (bRect.top + bRect.height / 2)
        };
      })()
    `,
    returnByValue: true
  });

  console.log('ALIGNMENT METRICS:\n', JSON.stringify(metrics.result.value, null, 2));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.comp-card'));
        const uebCard = cards.find(c => c.textContent.includes('UEB Business Challenges')) || cards[0];
        uebCard.scrollIntoView({ block: 'center' });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\ueb_card_aligned.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved to scratch/ueb_card_aligned.png');

  ws.close();
} finally {
  proc.kill();
}
