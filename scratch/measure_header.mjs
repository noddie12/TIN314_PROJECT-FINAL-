import { spawn } from 'node:child_process';

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

  const dims = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const brand = document.querySelector('.header-brand');
        const nav = document.querySelector('.nav-links');
        const actions = document.querySelector('.header-actions');
        const inner = document.querySelector('.header-inner');
        const dateBtn = document.getElementById('dateRefBtn');
        const profileBtn = document.getElementById('headerProfileBtn');
        const searchBtn = document.getElementById('headerSearchBtn');
        return {
          innerClientWidth: inner.clientWidth,
          brandWidth: brand.offsetWidth,
          navWidth: nav.offsetWidth,
          actionsWidth: actions.offsetWidth,
          actionsChildren: {
            searchWidth: searchBtn.offsetWidth,
            dateWidth: dateBtn.offsetWidth,
            profileWidth: profileBtn.offsetWidth
          },
          navLinksPadding: window.getComputedStyle(document.querySelector('.nav-link')).padding,
          totalNeeded: brand.offsetWidth + nav.offsetWidth + actions.offsetWidth + 32
        };
      })()
    `,
    returnByValue: true
  });

  console.log('HEADER MEASUREMENTS:\n', JSON.stringify(dims.result.value, null, 2));
  ws.close();
} finally {
  proc.kill();
}
