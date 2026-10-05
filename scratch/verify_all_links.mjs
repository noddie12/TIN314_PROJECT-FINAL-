import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-links-'));
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--user-data-dir=' + tmpDir,
  '--remote-debugging-port=9248',
  'http://localhost:3333/index.html#hub'
]);

await new Promise(r => setTimeout(r, 2000));
try {
  const tabsRes = await fetch('http://127.0.0.1:9248/json');
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

  // Dismiss onboarding modal
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        sessionStorage.setItem('competemate_onboarding_dismissed', 'true');
        closeAllModals();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 400));

  // TEST 1: Check all rendered cards in DOM for link validity
  const linkCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.comp-card'));
        const issues = [];
        let validLinkCount = 0;
        let safeBtnCount = 0;

        cards.forEach(card => {
          const cid = card.id.replace('card-', '');
          const openLinkEl = card.querySelector('.footer-btn-group a, .footer-btn-group button:last-child');
          if (!openLinkEl) return;

          if (openLinkEl.tagName === 'A') {
            const href = openLinkEl.getAttribute('href');
            if (!href || href === '#' || (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:'))) {
              issues.push({ id: cid, tag: 'A', href, reason: 'Invalid or relative link' });
            } else {
              validLinkCount++;
            }
          } else {
            safeBtnCount++;
          }
        });

        return {
          totalCards: cards.length,
          validLinkCount,
          safeBtnCount,
          issuesCount: issues.length,
          issues
        };
      })()
    `,
    returnByValue: true
  });
  console.log('TEST 1: ALL CARDS LINK AUDIT:\n', JSON.stringify(linkCheck.result.value, null, 2));

  // TEST 2: Check Calliope DNA Modal link (previously had "Không xác định...")
  const calliopeCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        openDnaModal('calliope-2026');
        const modal = document.getElementById('dnaModal');
        const regBtn = modal.querySelector('.modal-footer > div:last-child a, .modal-footer > div:last-child button');
        return {
          id: 'calliope-2026',
          tag: regBtn ? regBtn.tagName : null,
          href: regBtn ? regBtn.getAttribute('href') : null,
          text: regBtn ? regBtn.textContent.trim() : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('TEST 2: CALLIOPE DNA MODAL LINK:\n', JSON.stringify(calliopeCheck.result.value, null, 2));

  // TEST 3: Check Doanh Nhân Tập Sự (previously had "clbkynangdoanhnhan.com/dnts-2026")
  const dntsCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        openDnaModal('doanh-nhan-tap-su-2026-actionftu');
        const modal = document.getElementById('dnaModal');
        const regBtn = modal.querySelector('.modal-footer > div:last-child a, .modal-footer > div:last-child button');
        return {
          id: 'doanh-nhan-tap-su-2026-actionftu',
          tag: regBtn ? regBtn.tagName : null,
          href: regBtn ? regBtn.getAttribute('href') : null,
          text: regBtn ? regBtn.textContent.trim() : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('TEST 3: DOANH NHÂN TẬP SỰ DNA MODAL LINK:\n', JSON.stringify(dntsCheck.result.value, null, 2));

  // TEST 4: Check Test Comp (no link available)
  const testCompCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        openDnaModal('comp-539633');
        const modal = document.getElementById('dnaModal');
        const regBtn = modal.querySelector('.modal-footer > div:last-child a, .modal-footer > div:last-child button');
        return {
          id: 'comp-539633',
          tag: regBtn ? regBtn.tagName : null,
          href: regBtn ? regBtn.getAttribute('href') : null,
          text: regBtn ? regBtn.textContent.trim() : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('TEST 4: TEST COMP DNA MODAL (NO LINK):\n', JSON.stringify(testCompCheck.result.value, null, 2));

  ws.close();
} finally {
  proc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
}
