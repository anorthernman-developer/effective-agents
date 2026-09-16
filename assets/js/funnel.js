/**
 * Effective Agents — /start/ challenge funnel (typeform-style).
 * Answers in sessionStorage; rules → capability recommendation.
 */
(function () {
  const STORAGE_KEY = 'ea-funnel-v1';
  const CAPS = {
    grc: {
      id: 'grc',
      title: 'Governance, Risk & Compliance',
      href: '../capabilities/grc/',
      blurb: 'Identity, Purview, audit, and kill-switches so agents scale without shadow risk.',
    },
    'licence-value': {
      id: 'licence-value',
      title: 'Licence & Value Optimisation',
      href: '../capabilities/licence-value/',
      blurb: 'Activation vs shelfware, consumption hygiene, and assisted-value stories finance trusts.',
    },
    processes: {
      id: 'processes',
      title: 'Effective Processes',
      href: '../capabilities/processes/',
      blurb: 'Map work, pick augment / automate / leave-be, then wire agents into real flows.',
    },
    agents: {
      id: 'agents',
      title: 'Building Effective Agents',
      href: '../capabilities/agents/',
      blurb: 'Intent → Governance composition on Copilot Studio, Agent Builder, SharePoint agents.',
    },
    roi: {
      id: 'roi',
      title: 'Maximising ROI',
      href: '../capabilities/roi/',
      blurb: 'Board packs, evidence gates, and anti-gaming so renewals survive scrutiny.',
    },
  };

  const STEPS = [
    {
      id: 'challenges',
      q: 'What challenges do you have with AI / Copilot / agents today?',
      hint: 'Select all that bite. Use keys 1–9 or click.',
      multi: true,
      options: [
        { id: 'chat-theatre', label: 'Lots of chat, little finished work', tags: ['agents', 'processes'] },
        { id: 'shelfware', label: 'Licences bought, activation lagging', tags: ['licence-value', 'roi'] },
        { id: 'shadow', label: 'Shadow agents / unclear ownership', tags: ['grc'] },
        { id: 'grounding', label: 'Grounding, permissions, or hallucination risk', tags: ['grc', 'agents'] },
        { id: 'proof', label: 'Cannot prove value to the board', tags: ['roi', 'licence-value'] },
        { id: 'process-fog', label: 'Do not know which processes to touch', tags: ['processes'] },
        { id: 'build-chaos', label: 'Building agents without a shared method', tags: ['agents', 'processes'] },
        { id: 'cost-burn', label: 'Consumption / credit burn without control', tags: ['licence-value', 'roi'] },
      ],
      allowOther: true,
    },
    {
      id: 'ninety',
      q: 'What problems do you need to solve in the next 90 days?',
      hint: 'Pick the urgencies that would make the quarter a success.',
      multi: true,
      options: [
        { id: 'renew', label: 'Defend or renew Copilot / agent spend', tags: ['roi', 'licence-value'] },
        { id: 'pilot-scale', label: 'Move pilots into production agents', tags: ['agents', 'processes'] },
        { id: 'gov-pack', label: 'Stand up governance / risk controls', tags: ['grc'] },
        { id: 'use-cases', label: 'Prioritise a short list of use cases', tags: ['processes', 'agents'] },
        { id: 'hygiene', label: 'Clean licence and activation hygiene', tags: ['licence-value'] },
        { id: 'board-pack', label: 'Ship a credible board measurement pack', tags: ['roi'] },
        { id: 'preference', label: 'Wire feedback / preference loops', tags: ['agents', 'grc'] },
      ],
      allowOther: true,
    },
    {
      id: 'stuck',
      q: 'Where are you stuck?',
      hint: 'One primary friction helps us route you. Secondary optional.',
      multi: true,
      max: 2,
      options: [
        { id: 'people', label: 'People — skills, change, sponsorship', tags: ['processes', 'licence-value'] },
        { id: 'process', label: 'Process — workflows unclear or contested', tags: ['processes'] },
        { id: 'tech', label: 'Tech — stack, connectors, grounding', tags: ['agents'] },
        { id: 'governance', label: 'Governance — policy, audit, risk appetite', tags: ['grc'] },
        { id: 'value', label: 'Value proof — metrics and narrative', tags: ['roi', 'licence-value'] },
      ],
    },
    {
      id: 'outcomes',
      q: 'Which outcomes matter most?',
      hint: 'Optional. Skip if you are unsure — we will still recommend a path.',
      multi: true,
      optional: true,
      options: [
        { id: 'finish-work', label: 'Agents that finish work, not chat', tags: ['agents', 'processes'] },
        { id: 'safe-scale', label: 'Safe scale under Purview / Foundry / Scout', tags: ['grc'] },
        { id: 'licence-roi', label: 'Licence net positive vs shelfware', tags: ['licence-value'] },
        { id: 'cycle-time', label: 'Faster cycle time on priority flows', tags: ['processes', 'roi'] },
        { id: 'board-trust', label: 'Board-trusted ROI and risk pane', tags: ['roi'] },
        { id: 'preference-loop', label: 'Human preference improving agents weekly', tags: ['agents'] },
      ],
    },
  ];

  function load() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }
  function save(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function scoreAnswers(answers) {
    const scores = { grc: 0, 'licence-value': 0, processes: 0, agents: 0, roi: 0 };
    STEPS.forEach((step) => {
      const sel = (answers[step.id] && answers[step.id].ids) || [];
      sel.forEach((oid) => {
        const opt = step.options.find((o) => o.id === oid);
        if (!opt) return;
        const weight = step.id === 'stuck' ? 2.2 : step.id === 'ninety' ? 1.6 : 1.2;
        (opt.tags || []).forEach((t, i) => {
          scores[t] = (scores[t] || 0) + weight * (i === 0 ? 1 : 0.65);
        });
      });
    });
    const ranked = Object.keys(scores)
      .map((id) => ({ id, n: scores[id] }))
      .sort((a, b) => b.n - a.n);
    if (ranked[0].n === 0) {
      return { primary: CAPS.processes, secondary: CAPS.agents, scores };
    }
    return {
      primary: CAPS[ranked[0].id],
      secondary: CAPS[ranked[1].id],
      scores,
    };
  }

  function mount(root) {
    if (!root) return;
    const state = {
      step: 0,
      answers: load(),
      phase: 'questions', // questions | result
    };

    root.innerHTML =
      '<div class="funnel-shell" id="funnelApp">' +
      '<div class="funnel-progress" aria-hidden="true"><div class="funnel-progress__bar" id="funnelBar"></div></div>' +
      '<div id="funnelBody"></div>' +
      '</div>';

    const body = root.querySelector('#funnelBody');
    const bar = root.querySelector('#funnelBar');

    function currentSelection(step) {
      const a = state.answers[step.id] || { ids: [], other: '' };
      return a;
    }

    function setSelection(step, ids, other) {
      state.answers[step.id] = { ids: ids.slice(), other: other || '' };
      save(state.answers);
    }

    function renderResult() {
      state.phase = 'result';
      bar.style.width = '100%';
      const rec = scoreAnswers(state.answers);
      state.answers._rec = { primary: rec.primary.id, secondary: rec.secondary.id, at: new Date().toISOString() };
      save(state.answers);

      const lines = [];
      lines.push('Effective Agents — challenge summary');
      lines.push('Ship Outcomes, Not Chat');
      lines.push('');
      STEPS.forEach((s) => {
        const a = state.answers[s.id] || { ids: [], other: '' };
        const labels = a.ids
          .map((id) => {
            const o = s.options.find((x) => x.id === id);
            return o ? o.label : id;
          })
          .concat(a.other ? ['Other: ' + a.other] : []);
        lines.push(s.q);
        lines.push(labels.length ? '  - ' + labels.join('\n  - ') : '  (skipped)');
        lines.push('');
      });
      lines.push('Recommended path: ' + rec.primary.title);
      lines.push('Also consider: ' + rec.secondary.title);
      lines.push('');
      lines.push('https://effectiveagents.work' + rec.primary.href.replace('..', ''));
      const exportText = lines.join('\n');

      body.innerHTML =
        '<div class="funnel-result is-live">' +
        '<p class="funnel-step-label">Your path</p>' +
        '<div class="funnel-card">' +
        '<p class="primary-path">Primary capability</p>' +
        '<h2>' +
        escape(rec.primary.title) +
        '</h2>' +
        '<p>' +
        escape(rec.primary.blurb) +
        '</p>' +
        '<p style="margin-top:1rem;color:var(--muted)"><strong>Also strong:</strong> ' +
        escape(rec.secondary.title) +
        ' — ' +
        escape(rec.secondary.blurb) +
        '</p>' +
        '<ul>' +
        '<li>Read the capability lens, then book a conversation or tip if useful.</li>' +
        '<li>Cross-check with <a href="../insights/">Insights</a>, <a href="../choice/">Choice</a>, <a href="../measurements/">Measurements</a>, or try <a href="../game/v2/">Game V2</a>.</li>' +
        '</ul>' +
        '<div class="actions">' +
        '<a class="chip chip--active" href="' +
        rec.primary.href +
        '">Open ' +
        escape(rec.primary.title) +
        '</a>' +
        '<a class="chip" href="' +
        rec.secondary.href +
        '">Secondary: ' +
        escape(shortTitle(rec.secondary.title)) +
        '</a>' +
        '<a class="chip chip--ghost" href="../capabilities/">All capabilities</a>' +
        '<a class="chip chip--ghost" data-tip-cta href="../legal/#tip">Tip / contact</a>' +
        '<button type="button" class="chip chip--ghost" id="funnelRestart">Start again</button>' +
        '<button type="button" class="chip chip--ghost" id="funnelCopy">Copy summary</button>' +
        '</div>' +
        '<label class="funnel-step-label" for="funnelExport" style="display:block;margin-top:1.25rem">Shareable summary</label>' +
        '<textarea class="funnel-export" id="funnelExport" readonly>' +
        escape(exportText) +
        '</textarea>' +
        '</div></div>';

      body.querySelector('#funnelRestart').addEventListener('click', () => {
        state.step = 0;
        state.phase = 'questions';
        state.answers = {};
        save(state.answers);
        render();
      });
      body.querySelector('#funnelCopy').addEventListener('click', () => {
        const ta = body.querySelector('#funnelExport');
        ta.select();
        try {
          navigator.clipboard.writeText(ta.value);
        } catch (_) {
          document.execCommand('copy');
        }
      });
      if (window.EASite || window.EA_CONFIG) {
        /* tip buttons refreshed on next site.js cycle; trigger manually */
        document.querySelectorAll('[data-tip-cta]').forEach(function () {});
      }
      // re-apply tip URL if site.js already ran
      try {
        const cfg = window.EA_CONFIG || {};
        const tip = (cfg.TIP_URL || '').trim();
        body.querySelectorAll('[data-tip-cta]').forEach((el) => {
          if (tip) {
            el.setAttribute('href', tip);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
          }
        });
      } catch (_) {}
    }

    function shortTitle(t) {
      return t.replace(/^Building /, '').replace(/^Maximising /, 'ROI · ');
    }

    function escape(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function canAdvance(step) {
      if (step.optional) return true;
      const a = currentSelection(step);
      return (a.ids && a.ids.length > 0) || (a.other && a.other.trim());
    }

    function render() {
      if (state.phase === 'result' || state.step >= STEPS.length) {
        renderResult();
        return;
      }
      const step = STEPS[state.step];
      const sel = currentSelection(step);
      const pct = ((state.step + 0.15) / STEPS.length) * 100;
      bar.style.width = pct + '%';

      let optsHtml = '<div class="funnel-options" role="group" aria-label="Options">';
      step.options.forEach((o, i) => {
        const on = sel.ids.indexOf(o.id) >= 0;
        optsHtml +=
          '<button type="button" class="funnel-opt' +
          (on ? ' is-selected' : '') +
          '" data-opt="' +
          o.id +
          '" aria-pressed="' +
          (on ? 'true' : 'false') +
          '"><span class="key">' +
          (i + 1) +
          '</span><span class="lab">' +
          escape(o.label) +
          '</span></button>';
      });
      optsHtml += '</div>';
      if (step.allowOther) {
        optsHtml +=
          '<label class="funnel-step-label" for="funnelOther">Other (optional)</label>' +
          '<textarea class="funnel-other" id="funnelOther" placeholder="Anything we missed…">' +
          escape(sel.other || '') +
          '</textarea>';
      }

      body.innerHTML =
        '<p class="funnel-step-label">Question ' +
        (state.step + 1) +
        ' of ' +
        STEPS.length +
        (step.optional ? ' · optional' : '') +
        '</p>' +
        '<h1 class="funnel-q">' +
        escape(step.q) +
        '</h1>' +
        '<p class="funnel-hint">' +
        escape(step.hint || '') +
        '</p>' +
        optsHtml +
        '<div class="funnel-nav">' +
        '<button type="button" class="chip chip--ghost" id="funnelBack"' +
        (state.step === 0 ? ' disabled' : '') +
        '>Back</button>' +
        (step.optional
          ? '<button type="button" class="chip chip--ghost" id="funnelSkip">Skip</button>'
          : '') +
        '<button type="button" class="chip chip--active" id="funnelNext">' +
        (state.step === STEPS.length - 1 ? 'See my path' : 'Next') +
        '</button>' +
        '<span class="funnel-kbd">↑↓ / 1–9 · Enter next · Esc back</span>' +
        '</div>';

      body.querySelectorAll('[data-opt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-opt');
          let ids = (currentSelection(step).ids || []).slice();
          const idx = ids.indexOf(id);
          if (step.multi) {
            if (idx >= 0) ids.splice(idx, 1);
            else {
              ids.push(id);
              if (step.max && ids.length > step.max) ids = ids.slice(-step.max);
            }
          } else {
            ids = [id];
          }
          const otherEl = body.querySelector('#funnelOther');
          setSelection(step, ids, otherEl ? otherEl.value : '');
          render();
        });
      });
      const other = body.querySelector('#funnelOther');
      if (other) {
        other.addEventListener('input', () => {
          setSelection(step, currentSelection(step).ids || [], other.value);
        });
      }
      body.querySelector('#funnelBack').addEventListener('click', () => {
        if (state.step > 0) {
          state.step -= 1;
          render();
        }
      });
      const skip = body.querySelector('#funnelSkip');
      if (skip) {
        skip.addEventListener('click', () => {
          state.step += 1;
          if (state.step >= STEPS.length) renderResult();
          else render();
        });
      }
      body.querySelector('#funnelNext').addEventListener('click', () => {
        if (!canAdvance(step)) {
          body.querySelector('.funnel-hint').textContent =
            'Select at least one option (or add Other) to continue.';
          return;
        }
        if (other) setSelection(step, currentSelection(step).ids || [], other.value);
        state.step += 1;
        if (state.step >= STEPS.length) renderResult();
        else render();
      });
    }

    document.addEventListener('keydown', function onKey(e) {
      if (!root.contains(document.activeElement) && document.activeElement !== document.body) {
        /* still allow when focus in funnel */
      }
      if (!document.getElementById('funnelApp')) return;
      if (state.phase === 'result') return;
      const step = STEPS[state.step];
      if (!step) return;
      if (e.key === 'Enter' && !(e.target && e.target.tagName === 'TEXTAREA')) {
        e.preventDefault();
        const n = body.querySelector('#funnelNext');
        if (n) n.click();
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        if (e.target && e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        const b = body.querySelector('#funnelBack');
        if (b && !b.disabled) b.click();
      } else if (/^[1-9]$/.test(e.key)) {
        if (e.target && e.target.tagName === 'TEXTAREA') return;
        const i = parseInt(e.key, 10) - 1;
        const btns = body.querySelectorAll('[data-opt]');
        if (btns[i]) btns[i].click();
      }
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    mount(document.getElementById('ea-funnel'));
  });
})();
