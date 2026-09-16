/**
 * Quiet industrial ambient via Web Audio.
 * User-start only (gesture). Mute persists in localStorage.
 */
(function () {
  const KEY = 'ea-ambient-muted';
  let ctx = null;
  let master = null;
  let nodes = [];
  let started = false;
  let muted = localStorage.getItem(KEY) === '1';

  function createNoiseBuffer(ac) {
    const len = ac.sampleRate * 2;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
    return buf;
  }

  function start() {
    if (started) {
      if (ctx && ctx.state === 'suspended') ctx.resume();
      return;
    }
    started = true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.045;
    master.connect(ctx.destination);

    // Soft low drone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55;
    const g1 = ctx.createGain();
    g1.gain.value = 0.35;
    osc1.connect(g1);
    g1.connect(master);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 82.5;
    const g2 = ctx.createGain();
    g2.gain.value = 0.12;
    osc2.connect(g2);
    g2.connect(master);

    // Filtered noise bed
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 380;
    filter.Q.value = 0.7;
    const gn = ctx.createGain();
    gn.gain.value = 0.18;
    noise.connect(filter);
    filter.connect(gn);
    gn.connect(master);

    // Slow LFO on filter
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.start();
    osc2.start();
    noise.start();
    lfo.start();
    nodes = [osc1, osc2, noise, lfo];
  }

  function setMuted(m) {
    muted = !!m;
    localStorage.setItem(KEY, muted ? '1' : '0');
    if (master) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.linearRampToValueAtTime(muted ? 0 : 0.045, t + 0.15);
    }
    document.querySelectorAll('[data-ambient-mute]').forEach((el) => {
      el.textContent = muted ? 'Unmute' : 'Mute';
      el.setAttribute('aria-pressed', muted ? 'true' : 'false');
    });
  }

  function toggleMute() {
    if (!started) start();
    setMuted(!muted);
  }

  window.EAAmbient = {
    start,
    toggleMute,
    isMuted: () => muted,
    isStarted: () => started,
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-ambient-start]').forEach((el) => {
      el.addEventListener('click', () => {
        start();
        el.textContent = 'Ambient on';
      });
    });
    document.querySelectorAll('[data-ambient-mute]').forEach((el) => {
      el.textContent = muted ? 'Unmute' : 'Mute';
      el.setAttribute('aria-pressed', muted ? 'true' : 'false');
      el.addEventListener('click', toggleMute);
    });
  });
})();
