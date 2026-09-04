(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal-item');
  const links = [...document.querySelectorAll('[data-nav-link]')];
  const sections = document.querySelectorAll('[data-section]');
  const progressLine = document.querySelector('[data-path-progress]');
  const trajectory = document.querySelector('#trajectory');
  const dialog = document.querySelector('[data-command-dialog]');
  let pendingG = false;
  let pendingTimer;

  if ('IntersectionObserver' in window && !reduced) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach((item) => revealObserver.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add('visible'));
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.toggle('active', link.hash === `#${visible.target.id}`));
    }, { threshold: [0.2, 0.45, 0.7], rootMargin: '-15% 0px -55% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const updateSignals = () => {
    const range = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    document.documentElement.style.setProperty('--scroll-signal', Math.min(Math.max(window.scrollY / range, 0), 1).toFixed(3));
    if (trajectory && progressLine) {
      const rect = trajectory.getBoundingClientRect();
      const value = Math.min(Math.max((window.innerHeight * 0.55 - rect.top) / Math.max(rect.height - window.innerHeight * 0.45, 1), 0), 1);
      progressLine.style.setProperty('--path-progress', `${(value * 100).toFixed(1)}%`);
    }
  };

  if (!reduced) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) window.requestAnimationFrame(() => { updateSignals(); ticking = false; });
      ticking = true;
    }, { passive: true });
    updateSignals();
  } else if (progressLine) {
    progressLine.style.setProperty('--path-progress', '100%');
  }

  const copy = {
    specs: '12,000+ specification nodes provide the source material—and plenty of chances to retrieve the wrong passage.',
    graph: 'The knowledge graph keeps the links among specifications, device requirements, and test evidence intact.',
    req: '606 device requirements turn broad specifications into claims an engineer can inspect.',
    tests: '728 test cases show how each requirement is verified, not merely where it is mentioned.',
    retrieve: 'Search follows both text relevance and relationships; a plausible excerpt is not enough if its evidence trail is missing.',
    reason: 'The model receives the relevant requirement, source specification, and test links instead of a pile of disconnected excerpts.',
    workflow: 'Engineers get a shorter path from a question to the requirement and evidence behind the answer.'
  };

  document.querySelectorAll('[data-architecture]').forEach((architecture) => {
    const nodes = architecture.querySelectorAll('[data-arch-node]');
    const edges = architecture.querySelectorAll('[data-edge]');
    const readout = architecture.querySelector('[data-arch-readout]');
    const activate = (node) => {
      const key = node.dataset.archNode;
      nodes.forEach((item) => item.classList.toggle('active', item === node));
      edges.forEach((edge) => edge.classList.toggle('active', edge.dataset.edge.split(' ').includes(key)));
      if (readout) readout.textContent = copy[key];
    };
    nodes.forEach((node) => {
      node.addEventListener('mouseenter', () => activate(node));
      node.addEventListener('focus', () => activate(node));
      node.addEventListener('click', () => activate(node));
    });
  });

  const openDialog = () => { if (dialog && !dialog.open) dialog.showModal(); };
  document.querySelector('[data-command-open]')?.addEventListener('click', openDialog);
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.querySelectorAll('[data-command-link]').forEach((link) => link.addEventListener('click', () => dialog?.close()));

  const shortcuts = { p: '#trajectory', s: '#systems', x: '#spectrace', a: '#about', c: '#contact' };
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) return;
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault(); openDialog(); return;
    }
    if (event.key.toLowerCase() === 'g') {
      pendingG = true; window.clearTimeout(pendingTimer);
      pendingTimer = window.setTimeout(() => { pendingG = false; }, 900); return;
    }
    const route = shortcuts[event.key.toLowerCase()];
    if (pendingG && route) {
      pendingG = false; window.clearTimeout(pendingTimer);
      document.querySelector(route)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    }
  });
})();
