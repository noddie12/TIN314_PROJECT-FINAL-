import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9225',
  '--window-size=1280,1000',
  'http://localhost:3333/index.html#match'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const tabsRes = await fetch('http://127.0.0.1:9225/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost:3333')) || tabs[0];

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => setTimeout(r, 1000));
  await send('Runtime.evaluate', { expression: `switchTab('match');` });
  await new Promise(r => setTimeout(r, 1000));

  // Set profile to match RnD To Startup
  await send('Runtime.evaluate', {
    expression: `
      state.profile.skills = ["Innovation & R&D", "Business Modeling", "Market Research & Validation", "Problem Solving"];
      renderMatchView();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const checkResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.match-item-card'));
        const rndCard = cards.find(c => c.textContent.includes('RnD To Startup'));
        if (!rndCard) return JSON.stringify({ found: false });

        const badges = Array.from(rndCard.querySelectorAll('.match-item-badges .chip')).map(b => b.textContent.trim());
        const catChip = rndCard.querySelector('.comp-cat-chip, .chip-cat');
        const cardRect = rndCard.getBoundingClientRect();
        const catRect = catChip ? catChip.getBoundingClientRect() : null;

        rndCard.scrollIntoView({ block: 'center' });

        return JSON.stringify({
          found: true,
          title: rndCard.querySelector('.match-item-title').textContent.trim(),
          badges,
          cardWidth: Math.round(cardRect.width),
          cardRight: Math.round(cardRect.right),
          catWidth: catRect ? Math.round(catRect.width) : 0,
          catRight: catRect ? Math.round(catRect.right) : 0,
          catEllipsis: catChip ? window.getComputedStyle(catChip).textOverflow : '',
          isContained: catRect ? (catRect.right <= cardRect.right) : false
        });
      })()
    `,
    returnByValue: true
  });
  console.log('RND TO STARTUP CARD MEASUREMENT:');
  console.log(JSON.parse(checkResult.result.value));

  await new Promise(r => setTimeout(r, 600));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\card_overflow_fixed.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved screenshot to scratch\\card_overflow_fixed.png');

  ws.close();
} finally {
  proc.kill();
}
