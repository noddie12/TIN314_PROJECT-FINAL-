import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9239',
  '--window-size=1280,850',
  'http://localhost:3333/index.html#hub'
]);

await new Promise(r => setTimeout(r, 2000));
try {
  const tabsRes = await fetch('http://127.0.0.1:9239/json');
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

  // Reset to unconfigured state for testing header and modal
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        localStorage.removeItem('competemate_profile_configured');
        sessionStorage.removeItem('competemate_onboarding_dismissed');
        state.profileConfigured = false;
        closeAllModals();
        updateHeaderCounters();
        renderHub();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 500));

  // TEST 1: Header layout and profile button clipping check
  const headerCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const searchBtn = document.getElementById('headerSearchBtn');
        const profileBtn = document.getElementById('headerProfileBtn');
        const headerInner = document.querySelector('.header-inner');
        const badge = document.querySelector('.header-profile-unconfigured-badge');

        const sRect = searchBtn.getBoundingClientRect();
        const pRect = profileBtn.getBoundingClientRect();
        const hRect = headerInner.getBoundingClientRect();

        return {
          searchBtnWidth: Math.round(sRect.width),
          searchBtnHasText: searchBtn.textContent.trim().length > 0,
          searchBtnIsIconOnly: searchBtn.textContent.trim() === '' && searchBtn.querySelector('svg') !== null,
          profileBtnWidth: Math.round(pRect.width),
          profileBtnRight: Math.round(pRect.right),
          headerInnerRight: Math.round(hRect.right),
          profileBtnFitsInsideHeader: pRect.right <= hRect.right + 2,
          hasUnconfiguredBadge: !!badge,
          badgeText: badge ? badge.textContent.trim() : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('ISSUE 1 - HEADER VERIFICATION:\n', JSON.stringify(headerCheck.result.value, null, 2));

  // Capture header screenshot
  const headerScreenshot = await send('Page.captureScreenshot', {
    clip: { x: 0, y: 0, width: 1280, height: 120, scale: 1 }
  });
  fs.writeFileSync('d:\\HA\\scratch\\fixed_header_search_icon.png', Buffer.from(headerScreenshot.data, 'base64'));
  console.log('Saved scratch/fixed_header_search_icon.png');

  // TEST 2: Open quick onboarding modal and verify footer visibility without scrolling
  await send('Runtime.evaluate', { expression: `openProfileOnboardingModal();` });
  await new Promise(r => setTimeout(r, 400));

  const modalCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('profileModal');
        const modalBox = modal.querySelector('.modal-box');
        const modalHeader = modal.querySelector('.modal-header');
        const modalBody = modal.querySelector('.modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        const submitBtn = modal.querySelector('button[type="submit"]');

        const boxRect = modalBox.getBoundingClientRect();
        const footerRect = modalFooter.getBoundingClientRect();
        const submitRect = submitBtn.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        return {
          windowHeight,
          modalBoxHeight: Math.round(boxRect.height),
          modalBoxTop: Math.round(boxRect.top),
          modalBoxBottom: Math.round(boxRect.bottom),
          footerTop: Math.round(footerRect.top),
          footerBottom: Math.round(footerRect.bottom),
          submitBtnTop: Math.round(submitRect.top),
          submitBtnBottom: Math.round(submitRect.bottom),
          // Check if footer and submit button are completely within the viewport bounds
          footerFullyVisibleWithoutScroll: footerRect.bottom <= windowHeight,
          submitBtnFullyVisibleWithoutScroll: submitRect.bottom <= windowHeight,
          submitBtnText: submitBtn.textContent.trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('ISSUE 2 - MODAL FOOTER VISIBILITY VERIFICATION:\n', JSON.stringify(modalCheck.result.value, null, 2));

  // Capture modal screenshot at 850px height
  const modalScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\fixed_modal_footer_visible.png', Buffer.from(modalScreenshot.data, 'base64'));
  console.log('Saved scratch/fixed_modal_footer_visible.png');

  // Test at a shorter laptop screen height (720px) to verify responsive sticky footer
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 400));

  const shortScreenCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('profileModal');
        const modalFooter = modal.querySelector('.modal-footer');
        const submitBtn = modal.querySelector('button[type="submit"]');
        const footerRect = modalFooter.getBoundingClientRect();
        const submitRect = submitBtn.getBoundingClientRect();
        return {
          windowHeight: window.innerHeight,
          footerBottom: Math.round(footerRect.bottom),
          submitBtnBottom: Math.round(submitRect.bottom),
          footerFullyVisibleOn720p: footerRect.bottom <= 720,
          submitBtnFullyVisibleOn720p: submitRect.bottom <= 720
        };
      })()
    `,
    returnByValue: true
  });
  console.log('ISSUE 2 - 720P SHORT SCREEN TEST:\n', JSON.stringify(shortScreenCheck.result.value, null, 2));

  const shortScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\fixed_modal_720p_screen.png', Buffer.from(shortScreenshot.data, 'base64'));
  console.log('Saved scratch/fixed_modal_720p_screen.png');

  ws.close();
} finally {
  proc.kill();
}
