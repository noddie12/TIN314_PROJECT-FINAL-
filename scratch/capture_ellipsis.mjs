import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9243',
  'http://localhost:3333/scratch/test_ellipsis.html'
]);

await new Promise(r => setTimeout(r, 1500));
try {
  const tabsRes = await fetch('http://127.0.0.1:9243/json');
  const tabs = await tabsRes.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
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

  await new Promise(r => setTimeout(r, 500));
  const res = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\test_ellipsis.png', Buffer.from(res.data, 'base64'));
  console.log('Saved test_ellipsis.png');
  ws.close();
} finally {
  proc.kill();
}
