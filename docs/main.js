// Rigged African Elephant for Blender: project page behaviour (no dependencies).
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero clip: respect reduced motion.
  const hero = document.getElementById('hero-video');
  if (hero && reduceMotion) { hero.removeAttribute('autoplay'); hero.pause(); hero.controls = true; }

  // Animation tabs: one shared player, a text panel per clip.
  const player = document.getElementById('anim-video');
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    player.poster = tab.dataset.poster;
    player.src = tab.dataset.src;
    if (!reduceMotion) player.play().catch(() => {});
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      select(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });
  if (player) {
    if (reduceMotion) player.controls = true;
    // Load and play the clip only when the section scrolls into view.
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !reduceMotion) player.play().catch(() => {});
        else if (!en.isIntersecting) player.pause();
      });
    }, { threshold: 0.35 }).observe(player);
  }

  // Sketchfab: load the heavy 3D viewer only on click.
  const viewer = document.getElementById('sketchfab');
  viewer?.querySelector('.play').addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.title = 'African Elephant Bull, rigged and animated: interactive 3D viewer on Sketchfab';
    iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking';
    iframe.allowFullscreen = true;
    iframe.src = `https://sketchfab.com/models/${viewer.dataset.uid}/embed?autostart=1&preload=1&ui_theme=dark&dnt=1`;
    viewer.replaceChildren(iframe);
  });

  // Lightbox for the rig images.
  const box = document.getElementById('lightbox');
  if (box?.showModal) {
    const img = box.querySelector('img');
    const cap = box.querySelector('p');
    document.querySelectorAll('.shot').forEach((btn) => {
      btn.addEventListener('click', () => {
        img.src = btn.dataset.full;
        img.alt = btn.querySelector('img').alt;
        cap.textContent = btn.dataset.caption || '';
        box.showModal();
      });
    });
    box.querySelector('.lb-close').addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  }

  // Copy the credit line.
  const copy = document.getElementById('copy-credit');
  copy?.addEventListener('click', async () => {
    const text = document.getElementById('credit-text').textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = 'Copied ✓';
    } catch {
      const r = document.createRange();
      r.selectNodeContents(document.getElementById('credit-text'));
      getSelection().removeAllRanges();
      getSelection().addRange(r);
      copy.textContent = 'Press Ctrl+C';
    }
    setTimeout(() => { copy.textContent = 'Copy credit'; }, 2200);
  });
})();
