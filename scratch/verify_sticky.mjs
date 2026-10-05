import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9223',
  '--window-size=1280,900',
  'http://localhost:3333/index.html#match'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const tabsRes = await fetch('http://127.0.0.1:9223/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost:3333')) || tabs[0];
  console.log('Connecting to tab:', pageTab.title, pageTab.url);

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

  // Wait for rendering
  await new Promise(r => setTimeout(r, 1500));

  // Switch to match tab if needed
  await send('Runtime.evaluate', {
    expression: `
      if (typeof switchTab === 'function') {
        switchTab('match');
      }
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check initial position of skillGapWidget
  const initialRect = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const el = document.getElementById('skillGapWidget');
        const r = el.getBoundingClientRect();
        return JSON.stringify({
          top: r.top,
          bottom: r.bottom,
          left: r.left,
          width: r.width,
          height: r.height,
          scrollY: window.scrollY,
          position: window.getComputedStyle(el).position
        });
      })()
    `,
    returnByValue: true
  });
  console.log('INITIAL RECT (scrollY = 0):', initialRect.result.value);

  const scrollOffsets = [0, 400, 800, 1200, 1600, 2000];
  console.log('\n--- TESTING MULTI-SCROLL OFFSETS ---');
  for (const s of scrollOffsets) {
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${s});` });
    await new Promise(r => setTimeout(r, 400));
    const res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById('skillGapWidget');
          const r = el.getBoundingClientRect();
          return JSON.stringify({
            scrollY: window.scrollY,
            widgetTop: Math.round(r.top),
            widgetBottom: Math.round(r.bottom),
            isStickyAtTop: Math.round(r.top) === 80
          });
        })()
      `,
      returnByValue: true
    });
    console.log(`ScrollY = ${s}px:`, res.result.value);
  }

  // Take screenshot at scroll 1200px
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 1200);` });
  await new Promise(r => setTimeout(r, 400));
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\sticky_verified.png', Buffer.from(screenshot.data, 'base64'));
  console.log('\nScreenshot saved to scratch\\sticky_verified.png');

  ws.close();
} finally {
  proc.kill();
}
