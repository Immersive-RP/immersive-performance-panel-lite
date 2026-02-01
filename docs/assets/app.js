(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Copy buttons
  $$('.copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = btn.getAttribute('data-copy');
      const el = $(target);
      if(!el) return;
      const text = el.innerText.replace(/\n$/, '');
      try{
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => { btn.textContent = prev; }, 900);
      }catch(e){
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
      }
    });
  });

  // Active nav link on scroll
  const links = $$('.link[data-target]');
  const sections = links
    .map(a => document.getElementById(a.getAttribute('data-target')))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('data-target') === id));
  };

  const pickActive = () => {
    const y = window.innerHeight * 0.32;
    let active = sections[0]?.id || '';
    for(const s of sections){
      const r = s.getBoundingClientRect();
      if(r.top <= y && r.bottom >= y){
        active = s.id;
        break;
      }
      if(r.top < y) active = s.id;
    }
    if(active) setActive(active);
  };

  let raf = 0;
  const onScroll = () => {
    if(raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      pickActive();
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // Smooth scroll for nav
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('data-target');
      const el = document.getElementById(id);
      if(!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    });
  });

  // Initial state
  const hash = (location.hash || '').replace('#','');
  if(hash && document.getElementById(hash)){
    setTimeout(() => {
      document.getElementById(hash).scrollIntoView({ behavior: 'smooth', block: 'start' });
      pickActive();
    }, 40);
  }else{
    pickActive();
  }
})();
