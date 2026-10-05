import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9238',
  '--window-size=1280,1000',
  'http://localhost:3333/index.html#hub'
]);

await new Promise(r => setTimeout(r, 2000));
try {
  const tabsRes = await fetch('http://127.0.0.1:9238/json');
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

  // Step 1: Clear configured flag to simulate brand-new visitor
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        localStorage.removeItem('competemate_profile_configured');
        sessionStorage.removeItem('competemate_onboarding_dismissed');
        state.profileConfigured = false;
        updateHeaderCounters();
        renderHub();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Check initial unconfigured state
  const step1 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const headerBadge = document.querySelector('.header-profile-unconfigured-badge');
        const banner = document.querySelector('.profile-activation-banner');
        const isConfiguredBanner = banner && banner.classList.contains('is-configured');
        const bannerTitle = banner ? banner.querySelector('.pab-title').textContent.trim() : null;

        return {
          hasHeaderUnconfiguredBadge: !!headerBadge,
          headerBadgeText: headerBadge ? headerBadge.textContent.trim() : null,
          hasBanner: !!banner,
          isConfiguredBanner,
          bannerTitle
        };
      })()
    `,
    returnByValue: true
  });
  console.log('STEP 1 - UNCONFIGURED STATE:', JSON.stringify(step1.result.value, null, 2));

  // Step 2: Open modal and capture screenshot
  await send('Runtime.evaluate', { expression: `openProfileOnboardingModal();` });
  await new Promise(r => setTimeout(r, 400));

  const modalCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.getElementById('profileModal');
        const isOpen = modal && modal.classList.contains('is-open');
        const pills = document.querySelectorAll('#skillsCloud .quick-skill-pill');
        const nameInput = document.getElementById('profileNameInput');
        const levelSelect = document.getElementById('profileLevelSelect');

        return {
          modalIsOpen: isOpen,
          quickSkillsCount: pills.length,
          hasNameInput: !!nameInput,
          hasLevelSelect: !!levelSelect
        };
      })()
    `,
    returnByValue: true
  });
  console.log('STEP 2 - MODAL OPEN:', JSON.stringify(modalCheck.result.value, null, 2));

  // Screenshot of the open onboarding modal
  const screenshot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\onboarding_modal_open.png', Buffer.from(screenshot1.data, 'base64'));
  console.log('Saved scratch/onboarding_modal_open.png');

  // Step 3: Fill out the modal and save
  const saveResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nameInput = document.getElementById('profileNameInput');
        const levelSelect = document.getElementById('profileLevelSelect');
        if (nameInput) nameInput.value = 'Bùi Đăng Hoàng';
        if (levelSelect) levelSelect.value = 'Advanced';

        // Toggle first 4 skills
        const pills = Array.from(document.querySelectorAll('#skillsCloud .quick-skill-pill'));
        pills.forEach((p, idx) => {
          if (idx < 4) p.classList.add('is-active');
          else p.classList.remove('is-active');
        });

        // Trigger save
        saveProfileFromModal();

        return {
          profileConfigured: state.profileConfigured,
          userName: state.profile.name,
          userLevel: state.profile.level,
          skillsCount: state.profile.skills.length,
          storageVal: localStorage.getItem('competemate_profile_configured')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('STEP 3 - SAVE RESULT:', JSON.stringify(saveResult.result.value, null, 2));

  // Step 4: Verify post-save UI state
  await new Promise(r => setTimeout(r, 600));
  const step4 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const headerBadge = document.querySelector('.header-profile-unconfigured-badge');
        const headerName = document.getElementById('headerProfileName');
        const banner = document.querySelector('.profile-activation-banner');
        const isConfiguredBanner = banner && banner.classList.contains('is-configured');
        const modal = document.getElementById('profileModal');
        const modalIsOpen = modal && modal.classList.contains('is-open');

        // Dismiss toasts for clean screenshot
        document.querySelectorAll('.toast').forEach(t => t.remove());

        return {
          headerBadgeRemoved: !headerBadge,
          headerNameText: headerName ? headerName.textContent.trim() : null,
          bannerIsConfigured: isConfiguredBanner,
          modalIsClosed: !modalIsOpen
        };
      })()
    `,
    returnByValue: true
  });
  console.log('STEP 4 - CONFIGURED UI STATE:', JSON.stringify(step4.result.value, null, 2));

  // Screenshot of Hub with configured banner
  const screenshot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('d:\\HA\\scratch\\onboarding_hub_activated.png', Buffer.from(screenshot2.data, 'base64'));
  console.log('Saved scratch/onboarding_hub_activated.png');

  ws.close();
} finally {
  proc.kill();
}
