import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9227',
  '--window-size=1280,1000',
  'http://localhost:3333/index.html#match'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const tabsRes = await fetch('http://127.0.0.1:9227/json');
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
  await new Promise(r => setTimeout(r, 800));

  // Insert the exact #8 Best Fit card from the user screenshot into topMatchesList
  const cardTestResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const list = document.getElementById('topMatchesList');
        const testCard = document.createElement('div');
        testCard.className = 'match-item-card';
        testCard.id = 'testRnDCard';
        testCard.innerHTML = \`
          <div class="match-item-top">
            <div style="min-width: 0; flex: 1;">
              <div class="match-item-badges">
                <span class="chip chip-count">#8 Best Fit</span>
                <span class="chip chip-cat comp-cat-chip" title="Lĩnh vực: Khởi nghiệp & Đổi mới sáng tạo (8 nhóm lĩnh vực: Y tế & sức khỏe, Nông nghiệp & thực phẩm, Môi trường & phát triển bền vững, Công nghiệp/kỹ thuật/robotics, Giáo dục, Tài chính & kinh tế số, Văn hóa/sáng tạo/xã hội, Công nghệ thông tin & chuyển đổi số)">Khởi nghiệp & Đổi mới sáng tạo (8 nhóm lĩnh vực: Y tế & sức khỏe, Nông nghiệp & thực phẩm, Môi trường & phát triển bền vững, Công nghiệp/kỹ thuật/robotics, Giáo dục, Tài chính & kinh tế số, Văn hóa/sáng tạo/xã hội, Công nghệ thông tin & chuyển đổi số)</span>
                <span class="chip">2026</span>
              </div>
              <h4 class="match-item-title">Cuộc thi Khởi nghiệp Sáng tạo ĐHQGHN – RnD To Startup 2026</h4>
              <div style="font-size: 12px; color: var(--color-muted); font-family: var(--font-body); margin-top: 2px;">Tổ chức: Vườn ươm Khởi nghiệp Đổi mới Sáng tạo ĐHQGHN (VISI)</div>
            </div>
            <div class="match-score-big" style="color: #059669;">85<span>%</span></div>
          </div>
        \`;
        list.prepend(testCard);

        const cardRect = testCard.getBoundingClientRect();
        const chip = testCard.querySelector('.comp-cat-chip');
        const chipRect = chip.getBoundingClientRect();
        const style = window.getComputedStyle(chip);

        return JSON.stringify({
          cardWidth: Math.round(cardRect.width),
          cardRight: Math.round(cardRect.right),
          chipWidth: Math.round(chipRect.width),
          chipRight: Math.round(chipRect.right),
          textOverflow: style.textOverflow,
          overflow: style.overflow,
          isStrictlyContained: chipRect.right <= cardRect.right
        });
      })()
    `,
    returnByValue: true
  });

  console.log('EXACT RND TO STARTUP TEST RESULT:', cardTestResult.result.value);

  // Take screenshot of the exact test card
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\card_overflow_exact_fixed.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved to scratch\\card_overflow_exact_fixed.png');

  ws.close();
} finally {
  proc.kill();
}
