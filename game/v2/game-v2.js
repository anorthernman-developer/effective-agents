/**
 * Effective Agents — Game V2
 * Round 1 Invaders → Round 2 Magnetic poetry → Round 3 Animal triage → SVG export
 */
(function () {
  const strip = (s) =>
    window.EASite && EASite.stripHtml
      ? EASite.stripHtml(s)
      : String(s || '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
  const esc = (s) =>
    window.EASite && EASite.escapeHtml
      ? EASite.escapeHtml(s)
      : String(s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

  const LB_KEY = 'ea-game-v2-leaderboard';
  const SOUND_KEY = 'ea-game-v2-sound';

  const state = {
    items: [],
    survivors: [],
    categories: { now: [], later: [] },
    buckets: { comms: [], change: [], review: [] },
    score: 0,
    combo: 0,
    sound: false,
    startedAt: 0,
    elapsed: 0,
    round: 0,
    audioCtx: null,
  };

  const hudRound = document.getElementById('hudRound');
  const hudScore = document.getElementById('hudScore');
  const hudCombo = document.getElementById('hudCombo');
  const hudTime = document.getElementById('hudTime');
  const soundToggle = document.getElementById('soundToggle');

  let timerId = null;

  function syncHud() {
    hudRound.textContent = String(state.round);
    hudScore.textContent = String(state.score);
    hudCombo.textContent = String(state.combo);
    if (state.startedAt) {
      state.elapsed = (performance.now() - state.startedAt) / 1000;
    }
    hudTime.textContent = state.elapsed.toFixed(1);
  }

  function showPanel(n) {
    document.querySelectorAll('.round-panel').forEach((p) => p.classList.remove('is-active'));
    const el = document.getElementById('panel' + n);
    if (el) el.classList.add('is-active');
    state.round = n === 0 ? 0 : n;
    syncHud();
  }

  function blip(freq = 440, dur = 0.06, type = 'square') {
    if (!state.sound) return;
    try {
      const ctx = state.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      state.audioCtx = ctx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.stop(ctx.currentTime + dur);
    } catch (_) {}
  }

  try {
    state.sound = localStorage.getItem(SOUND_KEY) === '1';
  } catch (_) {}
  soundToggle.textContent = state.sound ? 'Sound on' : 'Sound off';
  soundToggle.addEventListener('click', () => {
    state.sound = !state.sound;
    try {
      localStorage.setItem(SOUND_KEY, state.sound ? '1' : '0');
    } catch (_) {}
    soundToggle.textContent = state.sound ? 'Sound on' : 'Sound off';
    if (state.sound) blip(660, 0.08);
  });

  function startTimer() {
    state.startedAt = performance.now();
    if (timerId) clearInterval(timerId);
    timerId = setInterval(syncHud, 100);
  }

  /* ——— Round 1: Invaders ——— */
  const canvas = document.getElementById('cv');
  const ctx = canvas.getContext('2d');
  const r1Status = document.getElementById('r1Status');
  const btnR1Done = document.getElementById('btnR1Done');

  let ships = [];
  let bullets = [];
  let player = { x: 400, y: 440, w: 36, h: 14 };
  let keys = {};
  let r1Running = false;
  let r1Raf = 0;
  let lastShot = 0;

  function resizeCanvas() {
    const box = document.getElementById('invaders');
    const w = box.clientWidth || 800;
    const h = box.clientHeight || 480;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    player.y = h - 40;
    player.x = Math.min(player.x, w - player.w);
    return { w, h };
  }

  function spawnShips(items) {
    const { w } = resizeCanvas();
    const take = items.slice(0, Math.min(12, items.length));
    ships = take.map((it, i) => ({
      id: it.id,
      title: strip(it.title).slice(0, 42),
      item: it,
      x: 40 + (i % 4) * ((w - 80) / 4),
      y: 20 + Math.floor(i / 4) * 56,
      w: Math.min(140, (w - 100) / 4),
      h: 36,
      vy: 0.15 + Math.random() * 0.25,
      alive: true,
    }));
    bullets = [];
    player.x = w / 2 - player.w / 2;
  }

  function drawR1(w, h) {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);
    // scanlines
    ctx.fillStyle = 'rgba(225,6,0,0.04)';
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);

    ships.forEach((s) => {
      if (!s.alive) return;
      ctx.fillStyle = '#1a0808';
      ctx.strokeStyle = '#E10600';
      ctx.lineWidth = 2;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = '#F5F2EB';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(s.title.slice(0, 18), s.x + 6, s.y + 14);
      ctx.fillStyle = '#A8A29A';
      ctx.fillText(s.title.slice(18, 36), s.x + 6, s.y + 26);
    });

    bullets.forEach((b) => {
      ctx.fillStyle = '#E10600';
      ctx.fillRect(b.x, b.y, 3, 10);
    });

    ctx.fillStyle = '#F5F2EB';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#E10600';
    ctx.fillRect(player.x + player.w / 2 - 2, player.y - 6, 4, 6);
  }

  function stepR1() {
    if (!r1Running) return;
    const { w, h } = resizeCanvas();
    const speed = 4.2;
    if (keys.ArrowLeft || keys.a) player.x -= speed;
    if (keys.ArrowRight || keys.d) player.x += speed;
    player.x = Math.max(8, Math.min(w - player.w - 8, player.x));

    ships.forEach((s) => {
      if (!s.alive) return;
      s.y += s.vy;
      if (s.y + s.h > player.y - 8) {
        // bounced interest — keep as survivor, float back a bit
        s.y = Math.max(10, s.y - 40);
        s.vy = Math.max(0.08, s.vy * 0.5);
      }
    });

    bullets.forEach((b) => {
      b.y -= 7;
    });
    bullets = bullets.filter((b) => b.y > -20);

    bullets.forEach((b) => {
      ships.forEach((s) => {
        if (!s.alive) return;
        if (b.x > s.x && b.x < s.x + s.w && b.y > s.y && b.y < s.y + s.h) {
          s.alive = false;
          b.y = -99;
          state.combo += 1;
          state.score += 10 * Math.max(1, state.combo);
          blip(220 + state.combo * 40, 0.05);
        }
      });
    });

    const alive = ships.filter((s) => s.alive).length;
    const dead = ships.length - alive;
    r1Status.textContent = `${alive} survivors · ${dead} shot down · shoot what you do NOT want`;
    if (alive <= Math.max(2, Math.floor(ships.length * 0.35)) || dead >= ships.length - 2) {
      btnR1Done.disabled = false;
    }

    drawR1(w, h);
    r1Raf = requestAnimationFrame(stepR1);
  }

  function shoot() {
    const now = performance.now();
    if (now - lastShot < 220) return;
    lastShot = now;
    bullets.push({ x: player.x + player.w / 2 - 1.5, y: player.y - 8 });
    blip(880, 0.04, 'triangle');
  }

  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && r1Running) {
      e.preventDefault();
      shoot();
    }
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  const invBox = document.getElementById('invaders');
  invBox.addEventListener('pointermove', (e) => {
    if (!r1Running) return;
    const r = invBox.getBoundingClientRect();
    player.x = e.clientX - r.left - player.w / 2;
  });
  invBox.addEventListener('pointerdown', () => {
    if (r1Running) shoot();
  });

  function finishR1() {
    r1Running = false;
    cancelAnimationFrame(r1Raf);
    state.survivors = ships.filter((s) => s.alive).map((s) => s.item);
    if (!state.survivors.length) {
      // keep at least 3 random if player shot everything
      state.survivors = shuffle(state.items).slice(0, 3);
      state.score += 5;
    }
    state.combo = 0;
    syncHud();
    startRound2();
  }

  btnR1Done.addEventListener('click', finishR1);

  /* ——— Round 2 ——— */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function tileEl(item) {
    const d = document.createElement('div');
    d.className = 'mag-tile';
    d.draggable = true;
    d.dataset.id = item.id;
    const title = strip(item.title);
    const link = item.link || `https://www.microsoft.com/microsoft-365/roadmap?id=${item.id}`;
    d.innerHTML = `<strong>${esc(title)}</strong><a href="${esc(link)}" target="_blank" rel="noopener">Roadmap ${esc(String(item.id))} ↗</a>`;
    d.querySelector('a').addEventListener('click', (e) => e.stopPropagation());

    d.addEventListener('dragstart', (e) => {
      d.classList.add('dragging');
      e.dataTransfer.setData('text/plain', item.id);
      e.dataTransfer.effectAllowed = 'move';
    });
    d.addEventListener('dragend', () => d.classList.remove('dragging'));

    // touch fallback: tap cycles bins
    let touchMoved = false;
    d.addEventListener(
      'touchstart',
      () => {
        touchMoved = false;
      },
      { passive: true }
    );
    d.addEventListener(
      'touchmove',
      () => {
        touchMoved = true;
      },
      { passive: true }
    );
    d.addEventListener('touchend', (e) => {
      if (touchMoved) return;
      e.preventDefault();
      const parent = d.parentElement;
      const order = ['pool', 'now', 'later', 'triage', 'comms', 'change', 'review'];
      const cur = parent && parent.dataset.bin;
      const next = order[(order.indexOf(cur) + 1) % order.length];
      const target =
        document.querySelector(`[data-bin="${next}"]`) ||
        document.getElementById('pool');
      if (target) target.appendChild(d);
      blip(520, 0.04);
      state.score += 2;
      syncHud();
      refreshExportGate();
    });

    return d;
  }

  function bindDrop(el) {
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      el.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      const tile = document.querySelector(`.mag-tile[data-id="${CSS.escape(id)}"]`);
      if (tile) {
        el.appendChild(tile);
        blip(500, 0.05);
        state.score += 3;
        state.combo += 1;
        syncHud();
        refreshExportGate();
      }
    });
  }

  function startRound2() {
    showPanel(2);
    const pool = document.getElementById('pool');
    pool.replaceChildren();
    document.getElementById('colNow').querySelectorAll('.mag-tile').forEach((n) => n.remove());
    document.getElementById('colLater').querySelectorAll('.mag-tile').forEach((n) => n.remove());
    // keep headers
    ['colNow', 'colLater'].forEach((id) => {
      const bin = document.getElementById(id);
      [...bin.querySelectorAll('.mag-tile')].forEach((t) => t.remove());
    });
    state.survivors.forEach((it) => pool.appendChild(tileEl(it)));
    bindDrop(pool);
    bindDrop(document.getElementById('colNow'));
    bindDrop(document.getElementById('colLater'));
  }

  document.getElementById('btnR2Done').addEventListener('click', () => {
    const now = [...document.getElementById('colNow').querySelectorAll('.mag-tile')].map(
      (t) => t.dataset.id
    );
    const later = [...document.getElementById('colLater').querySelectorAll('.mag-tile')].map(
      (t) => t.dataset.id
    );
    const poolIds = [...document.getElementById('pool').querySelectorAll('.mag-tile')].map(
      (t) => t.dataset.id
    );
    // uncategorised pool items join "later"
    state.categories.now = state.survivors.filter((i) => now.includes(String(i.id)));
    state.categories.later = state.survivors.filter(
      (i) => later.includes(String(i.id)) || poolIds.includes(String(i.id))
    );
    startRound3();
  });

  /* ——— Round 3 ——— */
  function findItem(id) {
    return state.survivors.find((i) => String(i.id) === String(id));
  }

  function startRound3() {
    showPanel(3);
    state.buckets = { comms: [], change: [], review: [] };
    const pool = document.getElementById('triagePool');
    pool.replaceChildren();
    ['fedComms', 'fedChange', 'fedReview'].forEach((id) => {
      document.getElementById(id).replaceChildren();
    });
    const remaining = [...state.categories.now, ...state.categories.later];
    // dedupe
    const seen = new Set();
    remaining.forEach((it) => {
      if (seen.has(it.id)) return;
      seen.add(it.id);
      pool.appendChild(tileEl(it));
    });
    bindDrop(pool);
    document.querySelectorAll('.animal').forEach((an) => {
      bindDrop(an);
      // also allow drop on .fed child by bubbling — tiles append to animal; move into .fed
      an.addEventListener('drop', () => {
        const fed = an.querySelector('.fed');
        [...an.querySelectorAll(':scope > .mag-tile')].forEach((t) => fed.appendChild(t));
        refreshExportGate();
      });
    });
    refreshExportGate();
  }

  function collectBuckets() {
    const map = { comms: 'fedComms', change: 'fedChange', review: 'fedReview' };
    const out = { comms: [], change: [], review: [] };
    Object.keys(map).forEach((k) => {
      out[k] = [...document.getElementById(map[k]).querySelectorAll('.mag-tile')]
        .map((t) => findItem(t.dataset.id))
        .filter(Boolean);
    });
    // leftover in triage pool → review
    const leftover = [...document.getElementById('triagePool').querySelectorAll('.mag-tile')]
      .map((t) => findItem(t.dataset.id))
      .filter(Boolean);
    out.review = out.review.concat(leftover);
    state.buckets = out;
    return out;
  }

  function refreshExportGate() {
    const any =
      document.querySelectorAll('#fedComms .mag-tile, #fedChange .mag-tile, #fedReview .mag-tile, #triagePool .mag-tile')
        .length > 0;
    document.getElementById('btnExport').disabled = !any;
  }

  function buildSvg() {
    const b = collectBuckets();
    syncHud();
    const lines = [];
    const pushGroup = (label, arr, y0) => {
      lines.push(
        `<text x="48" y="${y0}" fill="#E10600" font-family="JetBrains Mono, monospace" font-size="14" letter-spacing="2">${esc(label).toUpperCase()}</text>`
      );
      arr.slice(0, 8).forEach((it, i) => {
        const t = strip(it.title).slice(0, 64);
        lines.push(
          `<text x="48" y="${y0 + 22 + i * 18}" fill="#F5F2EB" font-family="IBM Plex Sans, sans-serif" font-size="13">${esc(t)}</text>`
        );
      });
      if (!arr.length) {
        lines.push(
          `<text x="48" y="${y0 + 22}" fill="#6B6560" font-family="IBM Plex Sans, sans-serif" font-size="13">(none)</text>`
        );
      }
      return y0 + 22 + Math.max(arr.length, 1) * 18 + 28;
    };
    let y = 160;
    y = pushGroup('Needs Communication', b.comms, y);
    y = pushGroup('Needs Change Management', b.change, y);
    y = pushGroup('Needs Review', b.review, y);
    const h = Math.max(630, y + 80);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${h}" viewBox="0 0 1200 ${h}" role="img" aria-label="Effective Agents triage report">
  <rect width="1200" height="${h}" fill="#0A0A0A"/>
  <rect x="0" y="0" width="8" height="${h}" fill="#E10600"/>
  <text x="48" y="56" fill="#A8A29A" font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="3">EFFECTIVE AGENTS · GAME V2</text>
  <text x="48" y="92" fill="#E10600" font-family="Inter, sans-serif" font-size="22" font-weight="700">SHIP OUTCOMES, NOT CHAT</text>
  <text x="48" y="124" fill="#F5F2EB" font-family="IBM Plex Sans, sans-serif" font-size="16">Score ${state.score} · Time ${state.elapsed.toFixed(1)}s · Survivors ${state.survivors.length}</text>
  ${lines.join('\n  ')}
  <text x="48" y="${h - 36}" fill="#6B6560" font-family="JetBrains Mono, monospace" font-size="11">Humour + personal triage only · Verify roadmap · No recommendations without human review</text>
</svg>`;
    return svg;
  }

  function saveLeaderboard() {
    let board = [];
    try {
      board = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
    } catch {
      board = [];
    }
    board.push({
      score: state.score,
      time: Number(state.elapsed.toFixed(1)),
      at: new Date().toISOString(),
    });
    board.sort((a, b) => b.score - a.score || a.time - b.time);
    board = board.slice(0, 8);
    try {
      localStorage.setItem(LB_KEY, JSON.stringify(board));
    } catch (_) {}
    renderBoard(board);
  }

  function renderBoard(board) {
    const el = document.getElementById('leaderboard');
    if (!board || !board.length) {
      el.innerHTML = '<p>No local times yet — finish a run to populate the leaderboard (localStorage).</p>';
      return;
    }
    el.innerHTML =
      '<p><strong style="color:var(--fg-strong)">Local leaderboard</strong></p><ol>' +
      board
        .map(
          (r) =>
            `<li>Score ${r.score} · ${r.time}s · ${new Date(r.at).toLocaleString('en-GB')}</li>`
        )
        .join('') +
      '</ol>';
  }

  document.getElementById('btnExport').addEventListener('click', () => {
    const svg = buildSvg();
    const prev = document.getElementById('svgPreview');
    prev.hidden = false;
    prev.innerHTML = svg;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'effective-agents-triage.svg';
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById('btnShare').disabled = false;
    state.score += 25;
    syncHud();
    blip(740, 0.12, 'sine');
    saveLeaderboard();
  });

  document.getElementById('btnShare').addEventListener('click', async () => {
    const text = `Effective Agents V2 — score ${state.score} in ${state.elapsed.toFixed(1)}s. Ship Outcomes, Not Chat.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Effective Agents Game V2', text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert('End card copied to clipboard.');
      } else {
        prompt('Copy share text:', text);
      }
    } catch (_) {}
  });

  document.getElementById('btnRestart').addEventListener('click', () => {
    location.reload();
  });

  document.getElementById('btnStart').addEventListener('click', () => {
    if (!state.items.length) return;
    showPanel(1);
    startTimer();
    spawnShips(shuffle(state.items));
    r1Running = true;
    btnR1Done.disabled = true;
    cancelAnimationFrame(r1Raf);
    r1Raf = requestAnimationFrame(stepR1);
    blip(330, 0.1);
  });

  try {
    renderBoard(JSON.parse(localStorage.getItem(LB_KEY) || '[]'));
  } catch {
    renderBoard([]);
  }

  fetch('../../data/roadmap-ai.json')
    .then((r) => r.json())
    .then((data) => {
      state.items = (data.items || []).map((it) => ({
        ...it,
        title: strip(it.title),
        description: strip(it.description),
      }));
      r1Status.textContent = `${state.items.length} roadmap ships ready. Press Start.`;
    })
    .catch(() => {
      r1Status.textContent = 'Could not load data/roadmap-ai.json';
    });
})();
