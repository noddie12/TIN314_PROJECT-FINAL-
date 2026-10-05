import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9242',
  '--window-size=1280,850',
  'http://localhost:3333/index.html#hub'
]);

await new Promise(r => setTimeout(r, 2000));
try {
  const tabsRes = await fetch('http://127.0.0.1:9242/json');
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

  // Find HUIT Startup card
  const cardData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Search for HUIT STARTUP
        const cards = Array.from(document.querySelectorAll('.comp-card'));
        const huitCard = cards.find(c => c.textContent.includes('HUIT STARTUP'));
        if (!huitCard) return { error: 'HUIT STARTUP not found in cards' };

        const badgesLeft = huitCard.querySelector('.comp-badges-left');
        const chips = Array.from(badgesLeft.querySelectorAll('.chip, .match-score-badge'));

        const cardRect = huitCard.getBoundingClientRect();

        return {
          id: huitCard.id,
          cardRect: { width: cardRect.width, right: cardRect.right },
          chips: chips.map(c => {
            const r = c.getBoundingClientRect();
            return {
              text: c.textContent.trim(),
              className: c.className,
              rect: { width: r.width, left: r.left, right: r.right },
              scrollWidth: c.scrollWidth,
              clientWidth: c.clientWidth,
              textOverflows: c.scrollWidth > c.clientWidth,
              exceedsCard: r.right > cardRect.right
            };
          })
        };
      })()
    `,
    returnByValue: true
  });

  console.log('HUIT Card analysis:\n', JSON.stringify(cardData.result.value, null, 2));

  // Capture screenshot of HUIT card
  const huitClip = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.comp-card'));
        const huitCard = cards.find(c => c.textContent.includes('HUIT STARTUP'));
        if (!huitCard) return null;
        huitCard.scrollIntoView({ block: 'center' });
        const r = huitCard.getBoundingClientRect();
        return { x: r.x - 10, y: r.y - 10, width: r.width + 20, height: r.height + 20 };
      })()
    `,
    returnByValue: true
  });

  if (huitClip.result.value) {
    await new Promise(r => setTimeout(r, 300));
    // re-measure after scroll
    const reClip = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = Array.from(document.querySelectorAll('.comp-card'));
          const huitCard = cards.find(c => c.textContent.includes('HUIT STARTUP'));
          const r = huitCard.getBoundingClientRect();
          return { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: r.width + 20, height: r.height + 20, scale: 1 };
        })()
      `,
      returnByValue: true
    });
    const clip = reClip.result.value;
    const screenshot = await send('Page.captureScreenshot', { clip });
    fs.writeFileSync('d:\\HA\\scratch\\huit_card_current.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved scratch/huit_card_current.png');
  }

  ws.close();
} finally {
  proc.kill();
}
