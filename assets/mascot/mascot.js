/**
 * CompeteMate Page Mascot — Pure Vanilla JS implementation
 * Based on Page Mascot (D:\page-mascot) sprite-sheet mathematics
 * Zero dependencies, accessible, 60fps tracking with dead-zone & hysteresis.
 */
(function (global) {
  'use strict';

  const DIRECTIONS = [
    'up-left',
    'up',
    'up-right',
    'left',
    'center',
    'right',
    'down-left',
    'down',
    'down-right',
  ];

  const REACTIONS = [
    'blink',
    'heart',
    'sparkle',
    'surprised',
    'wink',
    'bashful',
    'sleepy',
    'dizzy',
    'delighted',
  ];

  // Clockwise from the right, matching Math.atan2 with y pointing down
  const CLOCKWISE = [
    'right',
    'down-right',
    'down',
    'down-left',
    'left',
    'up-left',
    'up',
    'up-right',
  ];

  const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
  const HYSTERESIS = 0.12;
  const DEAD_ZONE = 60;

  const PAYOFFS = ['heart', 'sparkle', 'delighted'];
  const BOOP_PAYOFF = 120;
  const BOOP_END = 560;
  const SQUASH_MS = 420;
  const DIZZY_AFTER = 4;
  const DIZZY_WINDOW = 1600;
  const DIZZY_END = 1100;

  const SQUASH = [
    { transform: 'scale(1, 1)', easing: 'ease-in' },
    { transform: 'scale(1.10, 0.86)', offset: 0.18, easing: 'ease-out' },
    { transform: 'scale(0.95, 1.08)', offset: 0.45, easing: 'ease-in-out' },
    { transform: 'scale(1.03, 0.97)', offset: 0.72, easing: 'ease-in-out' },
    { transform: 'scale(1, 1)' },
  ];

  function cellPosition(index) {
    return `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%`;
  }

  function wrap(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  function createMascot(options) {
    const {
      container,
      directions = 'assets/mascot/fox-directions.webp',
      reactions = 'assets/mascot/fox-reactions.webp',
      size = 110,
      label = 'Cáo CompeteMate',
      quotes = [],
      quoteElement = null,
    } = options || {};

    const host = typeof container === 'string' ? document.querySelector(container) : container;
    if (!host) {
      console.warn('CompeteMate Mascot: Container element not found', container);
      return null;
    }

    host.innerHTML = '';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cm-mascot-btn';
    button.setAttribute('aria-label', `Tương tác với ${label}`);
    button.title = `Nhấp vào để tương tác cùng ${label}`;
    Object.assign(button.style, {
      position: 'relative',
      display: 'block',
      flexShrink: '0',
      width: `${size}px`,
      height: `${size}px`,
      padding: '0',
      border: '0',
      background: 'transparent',
      appearance: 'none',
      cursor: 'pointer',
      userSelect: 'none',
      outline: 'none',
      webkitTapHighlightColor: 'transparent',
    });

    const squashSpan = document.createElement('span');
    squashSpan.className = 'cm-mascot-squash';
    Object.assign(squashSpan.style, {
      position: 'relative',
      display: 'block',
      width: '100%',
      height: '100%',
      transformOrigin: '50% 78%',
    });

    const layerStyle = {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      width: '100%',
      height: '100%',
      backgroundSize: '300% 300%',
      backgroundRepeat: 'no-repeat',
      transition: 'opacity 0.12s ease',
    };

    const directionsLayer = document.createElement('span');
    directionsLayer.className = 'cm-mascot-layer cm-mascot-directions';
    Object.assign(directionsLayer.style, layerStyle);
    directionsLayer.style.backgroundPosition = cellPosition(DIRECTIONS.indexOf('center'));

    const reactionsLayer = document.createElement('span');
    reactionsLayer.className = 'cm-mascot-layer cm-mascot-reactions';
    Object.assign(reactionsLayer.style, layerStyle);
    reactionsLayer.style.backgroundPosition = cellPosition(REACTIONS.indexOf('blink'));
    reactionsLayer.style.opacity = '0';

    let isReactionsReady = false;

    // Resilient Image Preloader & Smart Fallback
    const setupImageLayer = (layer, url, fallbackUrl, onReady) => {
      layer.style.backgroundImage = `url("${url}")`;

      const img = new Image();
      img.onload = () => {
        if (onReady) onReady();
      };
      img.onerror = () => {
        console.warn(`[CompeteMate Mascot] Không thể tải ảnh tại "${url}". Đang thử đường dẫn dự phòng...`);
        // Nếu có query string (ví dụ trên file:/// không nhận ?v=), thử đường dẫn thuần
        if (url.includes('?')) {
          const plain = url.split('?')[0];
          layer.style.backgroundImage = `url("${plain}")`;
          const retryImg = new Image();
          retryImg.onload = () => { if (onReady) onReady(); };
          retryImg.src = plain;
          return;
        }
        // Thử ảnh dự phòng nếu có
        if (fallbackUrl) {
          layer.style.backgroundImage = `url("${fallbackUrl}")`;
          const fallbackImg = new Image();
          fallbackImg.onload = () => { if (onReady) onReady(); };
          fallbackImg.src = fallbackUrl;
        }
      };
      img.src = url;
    };

    setupImageLayer(directionsLayer, directions, 'assets/mascot/fox-directions.webp');
    setupImageLayer(reactionsLayer, reactions, 'assets/mascot/fox-reactions.webp', () => {
      isReactionsReady = true;
    });

    squashSpan.appendChild(directionsLayer);
    squashSpan.appendChild(reactionsLayer);
    button.appendChild(squashSpan);
    host.appendChild(button);

    let sector = -1;
    let pointer = null;
    let currentDirection = 'center';
    let currentReaction = null;
    let timers = [];
    let boopCount = 0;
    let boopAt = 0;
    let quoteIndex = 0;

    const setDirection = (dir) => {
      if (currentDirection === dir) return;
      currentDirection = dir;
      const idx = DIRECTIONS.indexOf(dir);
      if (idx !== -1) {
        directionsLayer.style.backgroundPosition = cellPosition(idx);
      }
    };

    const setReaction = (react) => {
      currentReaction = react;
      if (react) {
        const idx = REACTIONS.indexOf(react);
        if (idx !== -1) {
          reactionsLayer.style.backgroundPosition = cellPosition(idx);
        }
        reactionsLayer.style.opacity = '1';
        // Tránh hiện tượng trống hình: giữ directionsLayer hiển thị nếu reactions chưa tải xong
        if (isReactionsReady) {
          directionsLayer.style.opacity = '0';
        }
      } else {
        directionsLayer.style.opacity = '1';
        reactionsLayer.style.opacity = '0';
      }
    };

    const updateQuote = (index) => {
      if (!quotes || !quotes.length) return;
      const quoteTarget = typeof quoteElement === 'string' ? document.querySelector(quoteElement) : quoteElement;
      if (!quoteTarget) return;

      const qIdx = (index !== undefined ? index : quoteIndex) % quotes.length;
      quoteIndex = (qIdx + 1) % quotes.length;

      quoteTarget.style.opacity = '0';
      setTimeout(() => {
        quoteTarget.textContent = `"${quotes[qIdx]}"`;
        quoteTarget.style.opacity = '1';
      }, 140);
    };

    const aim = () => {
      if (!pointer) return;
      const box = button.getBoundingClientRect();
      const dx = pointer.x - (box.left + box.width / 2);
      const dy = pointer.y - (box.top + box.height / 2);

      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        sector = -1;
        setDirection('center');
        return;
      }

      const angle = Math.atan2(dy, dx);
      if (sector !== -1 && Math.abs(wrap(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS) {
        return;
      }

      sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
      setDirection(CLOCKWISE[sector]);
    };

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      window.addEventListener('pointermove', (e) => {
        pointer = { x: e.clientX, y: e.clientY };
        aim();
      }, { passive: true });

      window.addEventListener('scroll', aim, { passive: true });
    }

    const later = (ms, next) => {
      const id = window.setTimeout(() => setReaction(next), ms);
      timers.push(id);
    };

    let reactionSequenceIndex = 0;

    const boop = () => {
      timers.forEach(window.clearTimeout);
      timers = [];

      // Xuất hiện lần lượt từng biểu cảm trong đủ 9 biểu cảm với mỗi lần bấm
      const currentIdx = reactionSequenceIndex % REACTIONS.length;
      const selectedReaction = REACTIONS[currentIdx];
      reactionSequenceIndex++;

      setReaction(selectedReaction);
      // Giữ biểu cảm trong 1.1s để người dùng ngắm rõ, sau đó tự quay lại dõi theo con trỏ chuột
      later(1100, null);

      updateQuote(currentIdx);

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && squashSpan.animate) {
        squashSpan.animate(SQUASH, { duration: SQUASH_MS, easing: 'linear' });
      }
    };

    button.addEventListener('click', boop);

    return {
      boop,
      destroy() {
        timers.forEach(window.clearTimeout);
        button.remove();
      }
    };
  }

  global.CompeteMascot = {
    init: createMascot
  };
})(window);
