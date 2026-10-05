import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9230',
  '--window-size=1280,1000',
  'http://localhost:3333/index.html#compare'
]);

await new Promise(r => setTimeout(r, 2000));
try {
  const tabsRes = await fetch('http://127.0.0.1:9230/json');
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
  await send('Runtime.evaluate', { expression: `switchTab('compare');` });
  await new Promise(r => setTimeout(r, 800));

  // Run tests
  const testResults = await send('Runtime.evaluate', {
    expression: `
      (() => {
        try {
          const results = {};
          
          // 1. Selector panel presence
          const panel = document.getElementById('compareSelectorPanel');
          results.hasSelectorPanel = !!panel;
          const slotsGrid = document.querySelector('.compare-slots-grid');
          results.hasSlotsGrid = !!slotsGrid;
          const slotCards = document.querySelectorAll('.compare-slot-card');
          results.slotCardsCount = slotCards.length;

          // 2. Search input
          const searchInput = document.getElementById('compareSearchInput');
          results.hasSearchInput = !!searchInput;

          // Test search
          handleCompareSearchInput('Kawai');
          const searchResults = document.getElementById('compareSearchResults');
          results.searchShowsResults = searchResults && searchResults.style.display !== 'none';
          const searchItems = searchResults ? searchResults.querySelectorAll('.compare-search-item') : [];
          results.searchItemsCount = searchItems.length;

          // 3. Clear all and test adding up to 3 competitions directly from compare
          clearAllCompare();
          results.afterClearCount = state.compareList.length;

          // Add 1st competition
          const comp1 = state.competitions[0];
          addCompareFromSelect(comp1.id);
          results.countAfterAdd1 = state.compareList.length;

          // Add 2nd competition
          const comp2 = state.competitions[1];
          addCompareFromSelect(comp2.id);
          results.countAfterAdd2 = state.compareList.length;

          // Add 3rd competition
          const comp3 = state.competitions[2];
          addCompareFromSelect(comp3.id);
          results.countAfterAdd3 = state.compareList.length;

          // Try adding 4th (should be blocked at max 3)
          const comp4 = state.competitions[3];
          addCompareFromSelect(comp4.id);
          results.countAfterAdd4Blocked = state.compareList.length;

          // Check table render with 3 competitions
          const table = document.querySelector('.compare-table');
          results.hasTable = !!table;
          const thCols = table ? table.querySelectorAll('thead th') : [];
          results.tableHeaderCols = thCols.length; // 1 label th + 3 comp th = 4

          // Test slot change (change slot 1 to comp4)
          changeCompareSlot(1, comp4.id);
          results.slot1ChangedToComp4 = (state.compareList[1] === comp4.id);

          return JSON.stringify(results, null, 2);
        } catch (e) {
          return 'ERROR: ' + e.message + '\\n' + e.stack;
        }
      })()
    `,
    returnByValue: true
  });

  console.log('COMPARE SELECTION TEST RESULTS:\n', testResults.result.value);

  // Set up exactly 2 competitions and test
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        clearAllCompare();
        // Remove existing toast DOM elements so screenshot is clean
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(t => t.remove());

        const c1 = state.competitions.find(c => c.name.includes('Kawai')) || state.competitions[0];
        const c2 = state.competitions.find(c => c.name.includes('CALLIOPE')) || state.competitions[1];
        addCompareFromSelect(c1.id);
        addCompareFromSelect(c2.id);

        // Remove toasts again
        const toastsAfter = document.querySelectorAll('.toast');
        toastsAfter.forEach(t => t.remove());
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  const screenshot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\compare_picker_2items.png', Buffer.from(screenshot2.data, 'base64'));
  console.log('Compare 2 items screenshot saved to scratch/compare_picker_2items.png');

  ws.close();
} finally {
  proc.kill();
}

