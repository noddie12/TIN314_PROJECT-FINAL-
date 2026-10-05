import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9229',
  '--window-size=1280,900',
  'http://localhost:3333/index.html#playbook'
]);

await new Promise(r => setTimeout(r, 2000));
try {
  const tabsRes = await fetch('http://127.0.0.1:9229/json');
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

  await new Promise(r => setTimeout(r, 1000));
  await send('Runtime.evaluate', { expression: `switchTab('playbook');` });
  await new Promise(r => setTimeout(r, 800));

  const checkRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('.playbook-card button'));
        const dnaBtn = btns.find(b => b.textContent.includes('Xem DNA') || b.textContent.includes('DNA'));
        
        // Test clicking the first competition title
        const firstTitle = document.querySelector('.playbook-card .playbook-comp-name');
        if (firstTitle) firstTitle.click();
        const modal = document.getElementById('dnaModal');
        const isModalOpen = modal && (modal.classList.contains('is-open') || modal.style.display === 'flex' || window.getComputedStyle(modal).display !== 'none');

        return JSON.stringify({
          hasDnaButton: !!dnaBtn,
          titleClickOpensModal: isModalOpen
        });
      })()
    `,
    returnByValue: true
  });
  console.log('PLAYBOOK VERIFICATION RESULT:', checkRes.result.value);

  // Close modal before screenshot
  await send('Runtime.evaluate', { expression: `closeAllModals();` });
  await new Promise(r => setTimeout(r, 400));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\playbook_no_dna_btn.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Playbook screenshot saved to scratch/playbook_no_dna_btn.png');
  ws.close();
} finally {
  proc.kill();
}
