(() => {
  'use strict';

  const resource = (typeof GetParentResourceName === 'function') ? GetParentResourceName() : 'Immersive_Performance_Panel';

  const post = (name, payload) => fetch(`https://${resource}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload || {})
  });

  const el = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const sliders = [
    { id: 'pedDensity', key: 'pedDensity', min: 0, max: 100 },
    { id: 'scenarioDensity', key: 'scenarioDensity', min: 0, max: 100 },
    { id: 'lodScale', key: 'lodScale', min: 10, max: 100 }
  ];

  const toggles = [
    { id: 'disableDecals', key: 'disableDecals', inverted: true },
    { id: 'disableScreenBlur', key: 'disableScreenBlur', inverted: true },
    { id: 'artificialLightsOff', key: 'artificialLightsOff', inverted: true }
  ];

  const sliderToValue = (key, raw) => (key === 'lodScale')
    ? clamp(raw / 100, 0.1, 1.0)
    : clamp(raw / 100, 0.0, 1.0);

  const valueToSlider = (key, v) => (key === 'lodScale')
    ? Math.round(clamp(v, 0.1, 1.0) * 100)
    : Math.round(clamp(v, 0.0, 1.0) * 100);

  const setPct = (id, raw) => {
    const out = el(`${id}Val`);
    if (out) out.textContent = `${Math.round(raw)}%`;
  };

  let rafPaint = 0;
  const paintRange = (input) => {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const v = Number(input.value || 0);
    const p = (v - min) / (max - min);
    input.style.setProperty('--p', String(Math.round(p * 100)));
  };

  const schedulePaint = (input) => {
    if (rafPaint) cancelAnimationFrame(rafPaint);
    rafPaint = requestAnimationFrame(() => paintRange(input));
  };

  const repaintAllSliders = () => {
    sliders.forEach(s => {
      const input = el(s.id);
      if (input) paintRange(input);
    });
  };

  let activeDragKey = null;
  let ignoreStateUntil = 0;

  const commitSetting = (key, value) => {
    ignoreStateUntil = Date.now() + 200;
    post('set', { key, value });
  };

  const applyScale = () => {
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 720;
    const base = Math.min(w, h);
    const s = clamp(base / 950, 0.78, 1.0);
    document.documentElement.style.setProperty('--uiScale', String(s));
  };

  const tooltip = (() => {
    const tip = el('ippTooltip');
    const panel = el('panel');
    if (!tip || !panel) return { show: () => {}, hide: () => {}, reposition: () => {} };

    let active = null;
    let pinned = false;
    let hideTimer = 0;

    const hide = (force) => {
      if (!force && pinned) return;
      if (hideTimer) clearTimeout(hideTimer);
      tip.classList.remove('isOn', 'posTop', 'posBottom');
      tip.setAttribute('aria-hidden', 'true');
      hideTimer = window.setTimeout(() => {
        if (!tip.classList.contains('isOn')) tip.style.display = 'none';
      }, 140);
      active = null;
      pinned = false;
    };

    const position = (target) => {
      const pr = panel.getBoundingClientRect();
      const tr = target.getBoundingClientRect();

      const pad = 12;
      const offset = 10;

      const avail = Math.max(140, Math.floor(pr.width - (pad * 2)));
      tip.style.maxWidth = `${Math.min(360, avail)}px`;

      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;

      const centerX = ((tr.left + tr.right) * 0.5) - pr.left;

      const spaceAbove = (tr.top - pr.top);
      const spaceBelow = (pr.bottom - tr.bottom);

      let pos = 'top';
      let top = (tr.top - pr.top) - th - offset;

      if (top < pad || (spaceBelow > spaceAbove && spaceBelow >= th + offset + pad)) {
        pos = 'bottom';
        top = (tr.bottom - pr.top) + offset;
      }

      if (pos === 'bottom' && (top + th) > (pr.height - pad)) {
        pos = 'top';
        top = (tr.top - pr.top) - th - offset;
      }

      top = clamp(top, pad, pr.height - pad - th);

      let left = centerX - (tw * 0.5);
      left = clamp(left, pad, pr.width - pad - tw);

      const arrowX = clamp(centerX - left, 14, tw - 14);

      tip.style.left = `${Math.round(left)}px`;
      tip.style.top = `${Math.round(top)}px`;
      tip.style.setProperty('--ax', `${Math.round(arrowX)}px`);

      tip.classList.remove('posTop', 'posBottom');
      tip.classList.add(pos === 'top' ? 'posTop' : 'posBottom');
    };

    const show = (target, pin) => {
      const text = target.getAttribute('data-tip');
      if (!text) return;

      if (hideTimer) clearTimeout(hideTimer);

      tip.textContent = text;
      tip.style.display = 'block';
      tip.setAttribute('aria-hidden', 'false');

      position(target);

      requestAnimationFrame(() => tip.classList.add('isOn'));

      active = target;
      pinned = !!pin;
    };

    const reposition = () => {
      if (!active) return;
      tip.textContent = active.getAttribute('data-tip') || '';
      position(active);
    };

    document.addEventListener('pointerenter', (e) => {
      const t = e.target && e.target.closest && e.target.closest('[data-tip]');
      if (!t) return;
      if (pinned && active && active !== t) return;
      show(t, pinned && active === t);
    }, true);

    document.addEventListener('pointerleave', (e) => {
      const t = e.target && e.target.closest && e.target.closest('[data-tip]');
      if (!t) return;
      if (pinned) return;
      hide(false);
    }, true);

    document.addEventListener('focusin', (e) => {
      const t = e.target && e.target.closest && e.target.closest('[data-tip]');
      if (!t) return;
      show(t, pinned && active === t);
    }, true);

    document.addEventListener('focusout', (e) => {
      const t = e.target && e.target.closest && e.target.closest('[data-tip]');
      if (!t) return;
      if (pinned) return;
      hide(false);
    }, true);

    document.addEventListener('pointerdown', (e) => {
      const t = e.target && e.target.closest && e.target.closest('[data-tip]');
      if (!t) {
        if (pinned) hide(true);
        return;
      }
      if (active === t && pinned) {
        hide(true);
        return;
      }
      show(t, true);
    }, true);

    window.addEventListener('resize', () => reposition());

    return { show, hide: () => hide(true), reposition };
  })();

  const showUI = () => {
    applyScale();
    document.body.style.display = 'block';
    repaintAllSliders();
    tooltip.hide();
  };

  const hideUI = () => {
    document.body.style.display = 'none';
    tooltip.hide();
  };

  window.addEventListener('resize', applyScale);

  sliders.forEach(s => {
    const input = el(s.id);
    if (!input) return;

    const sanitize = () => {
      const raw = clamp(Number(input.value), s.min, s.max);
      input.value = String(raw);
      return raw;
    };

    const sync = () => {
      const raw = Number(input.value);
      setPct(s.id, raw);
      schedulePaint(input);
    };

    input.addEventListener('input', () => {
      activeDragKey = s.key;
      sanitize();
      sync();
    });

    const commit = () => {
      const raw = sanitize();
      sync();
      commitSetting(s.key, sliderToValue(s.key, raw));
      activeDragKey = null;
    };

    input.addEventListener('change', commit);
    input.addEventListener('pointerup', commit);
    input.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') commit();
    });

    sync();
  });

  toggles.forEach(t => {
    const input = el(t.id);
    if (!input) return;

    input.addEventListener('change', () => {
      const enabled = !!input.checked;
      const v = t.inverted ? (enabled ? 0.0 : 1.0) : (enabled ? 1.0 : 0.0);
      commitSetting(t.key, v);
    });
  });

  const close = () => post('close');

  const closeBtn = el('closeBtn');
  if (closeBtn) closeBtn.addEventListener('click', close);

  const restoreBtn = el('restoreBtn');
  if (restoreBtn) restoreBtn.addEventListener('click', () => post('restore'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  window.addEventListener('message', (e) => {
    const d = e.data || {};

    if (typeof d.show === 'boolean') {
      if (d.show) showUI();
      else hideUI();
      return;
    }

    if (d.action === 'show') {
      showUI();
      return;
    }

    if (d.action === 'hide') {
      hideUI();
      return;
    }

    if (d.action === 'fps') {
      const v = (d.value === null || d.value === undefined) ? 'FPS' : `FPS ${Math.round(d.value)}`;
      const chip = el('fpsChip');
      if (chip) chip.textContent = v;
      return;
    }

    if (d.action === 'delta') {
      const key = d.key;
      const value = d.value;
      if (typeof key !== 'string') return;

      const s = sliders.find(x => x.key === key);
      if (s) {
        if (activeDragKey === key) return;
        const raw = valueToSlider(key, Number(value));
        const input = el(s.id);
        if (!input) return;
        input.value = String(raw);
        setPct(s.id, raw);
        schedulePaint(input);
        return;
      }

      const t = toggles.find(x => x.key === key);
      if (t) {
        const disabled = (typeof value === 'number') ? (value >= 0.5) : !!value;
        const input = el(t.id);
        if (input) input.checked = !disabled;
      }
      return;
    }

    if (d.action === 'state' && d.state) {
      const now = Date.now();
      if (now < ignoreStateUntil) return;

      sliders.forEach(s => {
        if (activeDragKey === s.key) return;
        const v = d.state[s.key];
        if (typeof v !== 'number') return;
        const raw = valueToSlider(s.key, v);
        const input = el(s.id);
        if (!input) return;
        input.value = String(raw);
        setPct(s.id, raw);
        schedulePaint(input);
      });

      toggles.forEach(t => {
        const v = d.state[t.key];
        const disabled = (typeof v === 'number') ? (v >= 0.5) : !!v;
        const input = el(t.id);
        if (input) input.checked = !disabled;
      });

      repaintAllSliders();
      tooltip.reposition();
    }
  });
})();
