/**
 * SREE HARI SARADHA VIDHYALAYA MATRICULATION SCHOOL (S.H.S.V.M)
 * Main Interactive Scripts - Clean, Robust & Fast
 */

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  initTypewriter();
  initHeaderScroll();
  initMobileDrawer();
  initCalendarWidget();
  initTestimonialsSlider();
  initEnquiryModal();
  initScrollAnimations();
  initWhatsAppWidget();
});

/* ==========================================================================
   1. LANGUAGE SWITCHER (EN <-> தமிழ்)
   ========================================================================== */
let currentLang = localStorage.getItem('shsvm_lang') || 'en';

function initLanguageSwitcher() {
  const toggleBtns = document.querySelectorAll('.js-lang-toggle');
  
  // Set initial state
  applyLanguage(currentLang);

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ta' : 'en';
      localStorage.setItem('shsvm_lang', currentLang);
      applyLanguage(currentLang);
    });
  });
}

function applyLanguage(lang) {
  document.body.classList.toggle('lang-ta', lang === 'ta');
  document.documentElement.lang = lang;

  const dict = translations[lang];
  if (!dict) return;

  // Update elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        el.innerHTML = dict[key];
      }
    }
  });

  // Update toggle button text
  document.querySelectorAll('.js-lang-toggle-text').forEach(span => {
    span.textContent = lang === 'en' ? 'தமிழ்' : 'English';
  });

  // Restart typewriter with language phrases
  if (window.shsvmRestartTypewriter) {
    window.shsvmRestartTypewriter(dict.heroTypewords);
  }
}

/* ==========================================================================
   2. HERO TYPEWRITER WITH CURSOR
   ========================================================================== */
function initTypewriter() {
  const target = document.querySelector('.js-typewriter-text');
  if (!target) return;

  let words = (translations[currentLang] && translations[currentLang].heroTypewords) || [
    "Smile, Study, Serve",
    "Lead With Integrity",
    "Excel in Board Exams",
    "Build Great Character"
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeoutId = null;

  function type() {
    const currentWord = words[wordIndex % words.length];
    
    if (isDeleting) {
      charIndex--;
      target.textContent = currentWord.substring(0, charIndex);
    } else {
      charIndex++;
      target.textContent = currentWord.substring(0, charIndex);
    }

    let delay = isDeleting ? 45 : 90;

    if (!isDeleting && charIndex === currentWord.length) {
      delay = 2400; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex++;
      delay = 400; // Pause before typing next word
    }

    timeoutId = setTimeout(type, delay);
  }

  type();

  window.shsvmRestartTypewriter = function(newWords) {
    clearTimeout(timeoutId);
    words = newWords;
    wordIndex = 0;
    charIndex = 0;
    isDeleting = false;
    type();
  };
}

/* ==========================================================================
   3. STICKY HEADER SCROLL EFFECT
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ==========================================================================
   4. MOBILE NAV DRAWER
   ========================================================================== */
function initMobileDrawer() {
  const hamburgerBtn = document.querySelector('.js-hamburger-btn');
  const closeBtn = document.querySelector('.js-drawer-close');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');

  if (!drawer || !hamburgerBtn) return;

  function openDrawer() {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ==========================================================================
   5. INTERACTIVE MINI CALENDAR WIDGET
   ========================================================================== */
function initCalendarWidget() {
  const dates = document.querySelectorAll('.cal-date[data-event]');
  const eventPreview = document.querySelector('.js-cal-event-text');
  if (!dates.length || !eventPreview) return;

  dates.forEach(d => {
    d.addEventListener('click', () => {
      dates.forEach(el => el.classList.remove('active-event'));
      d.classList.add('active-event');
      const eventDetails = d.getAttribute('data-event');
      eventPreview.textContent = eventDetails;
    });
  });
}

/* ==========================================================================
   6. TESTIMONIALS SLIDER / ARROWS
   ========================================================================== */
function initTestimonialsSlider() {
  const prevBtn = document.querySelector('.js-testimonial-prev');
  const nextBtn = document.querySelector('.js-testimonial-next');
  const cards = document.querySelectorAll('.testimonial-card');
  if (!cards.length || !prevBtn || !nextBtn) return;

  let current = 0;

  function show(index) {
    cards.forEach((card, i) => {
      card.style.display = (i === index || (window.innerWidth > 868 && i === (index + 1) % cards.length)) ? 'flex' : 'none';
    });
  }

  nextBtn.addEventListener('click', () => {
    current = (current + 1) % cards.length;
    show(current);
  });

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + cards.length) % cards.length;
    show(current);
  });
}

/* ==========================================================================
   7. ENQUIRY MODAL (<dialog>)
   ========================================================================== */
function initEnquiryModal() {
  const modal = document.querySelector('#enquiryModal');
  const openBtns = document.querySelectorAll('.js-open-enquiry');
  const closeBtn = document.querySelector('.js-close-enquiry');
  const form = document.querySelector('#enquiryForm');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.showModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.close();
    });
  }

  // Light dismiss: click outside dialog box
  modal.addEventListener('click', (e) => {
    const dialogDimensions = modal.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      modal.close();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = currentLang === 'ta' ? 'அனுப்பப்படுகிறது...' : 'Submitting...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = currentLang === 'ta' ? '✓ பதிவு செய்யப்பட்டது!' : '✓ Enquiry Received!';
        submitBtn.style.backgroundColor = 'var(--color-amber)';
        submitBtn.style.color = '#000';
        setTimeout(() => {
          modal.close();
          form.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.backgroundColor = '';
          submitBtn.style.color = '';
          alert(currentLang === 'ta' ? 'நன்றி! உங்கள் சேர்க்கை விசாரணை பதிவு செய்யப்பட்டது. விரைவில் எமது அலுவலகத்திலிருந்து தொடர்புகொள்வோம்.' : 'Thank you! Your enquiry has been received. Our admissions counselor will contact you shortly.');
        }, 1200);
      }, 800);
    });
  }
}

/* ==========================================================================
   8. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   9. WHATSAPP CHAT POPUP
   ========================================================================== */
function initWhatsAppWidget() {
  const waBtn = document.querySelector('.floating-whatsapp');
  if (!waBtn) return;

  waBtn.addEventListener('click', () => {
    const message = encodeURIComponent("Vanakkam! I would like to enquire about admissions at Sree Hari Saradha Vidhyalaya Matriculation School (SHSVM).");
    const waUrl = `https://wa.me/919443319990?text=${message}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}
