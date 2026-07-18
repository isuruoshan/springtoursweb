document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Sticky header ---------------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    scrollTopBtn.classList.toggle('is-visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Mobile menu ---------------- */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  hamburger.addEventListener('click', () => {
    const open = mainNav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.has-dropdown > a').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.innerWidth <= 980) {
        e.preventDefault();
        a.parentElement.classList.toggle('is-open');
      }
    });
  });
  // Close mobile menu after choosing a link
  mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 980 && !a.parentElement.classList.contains('has-dropdown')) {
        mainNav.classList.remove('is-open');
      }
    });
  });

  /* ---------------- Language switcher (demo) ---------------- */
  const langSwitcher = document.querySelector('.lang-switcher');
  const langCurrent = document.getElementById('langCurrent');
  const langDropdown = document.getElementById('langDropdown');
  langCurrent.addEventListener('click', () => {
    const open = langSwitcher.classList.toggle('is-open');
    langCurrent.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', (e) => {
    if (!langSwitcher.contains(e.target)) langSwitcher.classList.remove('is-open');
  });
  const flagMap = { en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷', ru: '🇷🇺' };
  langDropdown.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      const code = li.dataset.lang;
      langCurrent.innerHTML = `<span class="flag">${flagMap[code]}</span> ${code.toUpperCase()} <span class="caret">▾</span>`;
      langSwitcher.classList.remove('is-open');
      // Full translation strings would be wired here (data-i18n lookups).
    });
  });

  /* ---------------- Hero Ken Burns slideshow ---------------- */
  const slides = document.querySelectorAll('.hero-slide');
  let slideIndex = 0;
  setInterval(() => {
    slides[slideIndex].classList.remove('is-active');
    void slides[slideIndex].offsetWidth; // restart animation
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add('is-active');
  }, 6000);

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------------- Scroll to top ---------------- */
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------------- Multi-step booking form ---------------- */
  const form = document.getElementById('bookingForm');
  const panels = [...form.querySelectorAll('.form-panel')];
  const steps = [...form.querySelectorAll('.step')];
  const backBtn = document.getElementById('formBack');
  const nextBtn = document.getElementById('formNext');
  const submitBtn = document.getElementById('formSubmit');
  const statusEl = document.getElementById('formStatus');
  let current = 0;

  function renderStep() {
    panels.forEach((p, i) => p.classList.toggle('is-active', i === current));
    steps.forEach((s, i) => s.classList.toggle('is-active', i === current));
    backBtn.disabled = current === 0;
    nextBtn.hidden = current === panels.length - 1;
    submitBtn.hidden = current !== panels.length - 1;
  }

  function validatePanel(index) {
    const inputs = panels[index].querySelectorAll('input[required], select[required]');
    for (const input of inputs) {
      if (!input.reportValidity()) return false;
    }
    return true;
  }

  nextBtn.addEventListener('click', () => {
    if (!validatePanel(current)) return;
    current = Math.min(current + 1, panels.length - 1);
    renderStep();
  });
  backBtn.addEventListener('click', () => {
    current = Math.max(current - 1, 0);
    renderStep();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validatePanel(current)) return;
    statusEl.textContent = 'Sending your inquiry...';
    statusEl.className = 'form-status';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form)
      });
      const data = await res.json().catch(() => ({ success: res.ok }));
      if (res.ok && data.success !== false) {
        statusEl.textContent = 'Thank you! Your inquiry has been sent — we will reply within 24 hours.';
        statusEl.className = 'form-status ok';
        form.reset();
        current = 0;
        renderStep();
      } else {
        throw new Error(data.message || 'Server error');
      }
    } catch (err) {
      statusEl.textContent = 'Could not send inquiry. Please WhatsApp us instead: +94 71 777 3690';
      statusEl.className = 'form-status err';
    }
  });

  renderStep();

  /* ---------------- Spring AI chat widget ---------------- */
  const aiToggleBtn = document.getElementById('aiToggleBtn');
  const openAiFromTransport = document.getElementById('openAiFromTransport');
  const aiCloseBtn = document.getElementById('aiCloseBtn');
  const aiChat = document.getElementById('aiChat');
  const aiChatBody = document.getElementById('aiChatBody');
  const aiChatForm = document.getElementById('aiChatForm');
  const aiChatInput = document.getElementById('aiChatInput');

  function openAiChat() {
    aiChat.classList.add('is-open');
    aiChat.setAttribute('aria-hidden', 'false');
    aiChatInput.focus();
  }
  function closeAiChat() {
    aiChat.classList.remove('is-open');
    aiChat.setAttribute('aria-hidden', 'true');
  }
  aiToggleBtn.addEventListener('click', () => {
    aiChat.classList.contains('is-open') ? closeAiChat() : openAiChat();
  });
  openAiFromTransport.addEventListener('click', openAiChat);
  aiCloseBtn.addEventListener('click', closeAiChat);

  const SEDAN_RATE = 170; // LKR per KM

  function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = `ai-msg ${who}`;
    div.textContent = text;
    aiChatBody.appendChild(div);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
  }

  function springAiReply(raw) {
    const msg = raw.toLowerCase();

    // Transport cost calculator: look for a number followed by km, or "distance 40"
    const kmMatch = msg.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers?|kilometres?)?/);
    if (msg.includes('km') || msg.includes('distance') || msg.includes('cost') || msg.includes('price')) {
      if (kmMatch) {
        const km = parseFloat(kmMatch[1]);
        if (!isNaN(km) && km > 0) {
          const total = Math.round(km * SEDAN_RATE);
          return `For a sedan car, the approximate cost is ${km} KM × ${SEDAN_RATE} LKR = around LKR ${total.toLocaleString()}. Larger vehicles (SUV, van, coaster) cost more — ask our team on WhatsApp for an exact quote.`;
        }
      }
      return `I can estimate sedan transport costs at ${SEDAN_RATE} LKR per KM. Just tell me the distance, e.g. "distance 45 km".`;
    }

    if (msg.includes('vehicle') || msg.includes('car') || msg.includes('van') || msg.includes('suv')) {
      return `For 1–2 people a Sedan is perfect. Families of up to 6 usually pick a Mini Van, and groups over 10 go for a Coaster. For a honeymoon or VIP trip, our Luxury Van is the most comfortable choice.`;
    }

    if (msg.includes('weather') || msg.includes('rain') || msg.includes('season')) {
      return `Sri Lanka has two monsoons: the west/south coast and hill country are driest from December–March, while the east coast (Trincomalee, Arugam Bay) is best from May–September. Tell me which region and month and I can advise further.`;
    }

    if (msg.includes('place') || msg.includes('visit') || msg.includes('see') || msg.includes('attraction')) {
      return `Popular picks: Sigiriya Rock, Kandy's Temple of the Tooth, Ella's Nine Arch Bridge, Yala for safari, and Mirissa for whale watching. Want a plan built around a specific number of days?`;
    }

    if (msg.includes('plan') || msg.includes('itinerary') || msg.includes('day')) {
      return `We have ready-made 3, 5, 7, 10 and 12-day packages, and can fully customise any of them. Head to the Tour Packages section, or tell me how many days you have and what interests you most (culture, wildlife, beaches, adventure).`;
    }

    if (msg.includes('bike') || msg.includes('scooter') || msg.includes('motorbike')) {
      return `We rent Scooters, Adventure Bikes and Premium Bikes — helmet included. Let us know your riding experience and route and we'll suggest the right bike.`;
    }

    if (msg.includes('whatsapp') || msg.includes('contact') || msg.includes('human') || msg.includes('talk to someone')) {
      return `You can reach our team directly on WhatsApp: +94 71 777 3690, or fill in the booking form below and we'll reply within 24 hours.`;
    }

    if (msg.includes('hi') || msg.includes('hello') || msg.includes('ayubowan')) {
      return `Ayubowan! Ask me about places to visit, tour plans, vehicle suggestions, weather, or say something like "distance 60 km" for a transport estimate.`;
    }

    return `I can help with places to visit, tour itineraries, vehicle suggestions, weather advice and transport cost estimates (try "distance 40 km"). Could you rephrase, or WhatsApp our team at +94 71 777 3690 for anything more specific?`;
  }

  aiChatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = aiChatInput.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    aiChatInput.value = '';
    setTimeout(() => addMsg(springAiReply(text), 'bot'), 400);
  });

  document.querySelectorAll('.ai-quick-replies button').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      addMsg(q, 'user');
      setTimeout(() => addMsg(springAiReply(q), 'bot'), 400);
      openAiChat();
    });
  });

});
