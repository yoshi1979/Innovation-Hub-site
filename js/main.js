/**
 * Microsoft Israel Innovation Hub — Main JavaScript
 * Vanilla JS, no dependencies required.
 */

'use strict';

/* ============================================================
   1. STICKY NAV
   ============================================================ */

/**
 * Adds `.nav-scrolled` glass-morphism class when page is scrolled > 50px.
 */
function initStickyNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const SCROLL_THRESHOLD = 50;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on init in case page loads mid-scroll
}

/* ============================================================
   2. MOBILE MENU
   ============================================================ */

/**
 * Toggles the mobile navigation drawer.
 * Closes on: ESC key, outside click, nav link click.
 */
function initMobileMenu() {
  const nav        = document.querySelector('.nav');
  const toggle     = document.querySelector('.nav-toggle');
  const navLinks   = document.querySelector('.nav-links');
  if (!nav || !toggle || !navLinks) return;

  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function openMenu() {
    nav.classList.add('nav-open');
    navLinks.classList.add('open');
    backdrop.classList.add('open');
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }

  function closeMenu() {
    nav.classList.remove('nav-open');
    navLinks.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('nav-open');
    isOpen ? closeMenu() : openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('nav-open') && !nav.contains(e.target) && !backdrop.contains(e.target)) {
      closeMenu();
    }
  });

  // Close when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

function initNavigationEnhancements() {
  const navLists = document.querySelectorAll('.nav-links');
  if (!navLists.length) return;

  const canonicalOrder = [
    ['index.html', 'Home'],
    ['programs.html', 'Programs'],
    ['events.html', 'Events'],
    ['collaborate.html', 'Collaborate'],
    ['experts.html', 'Experts'],
    ['success.html', 'Success Stories'],
    ['about.html', 'About'],
    ['apply.html', 'Apply Now']
  ];

  navLists.forEach((list) => {
    const existing = Array.from(list.querySelectorAll('a')).reduce((map, link) => {
      const href = link.getAttribute('href');
      if (href) map.set(href, link);
      return map;
    }, new Map());

    const rebuiltItems = canonicalOrder
      .filter(([href]) => existing.has(href))
      .map(([href, label]) => {
        const link = existing.get(href);
        const item = document.createElement('li');
        const isCta = href === 'apply.html';
        const isActive = link.classList.contains('active');
        item.innerHTML = `<a href="${href}" class="${isCta ? 'nav-link nav-cta btn btn-primary btn-sm' : 'nav-link'}${isActive ? ' active' : ''}">${label}</a>`;
        return item;
      });

    list.innerHTML = '';
    rebuiltItems.forEach((item) => list.appendChild(item));
  });

  document.querySelectorAll('.nav-links a.active').forEach((link) => {
    link.setAttribute('aria-current', 'page');
  });
}

function initMobileQuickActions() {
  if (window.innerWidth > 768 || document.querySelector('.mobile-quick-actions')) return;

  const bodyId = document.body?.id || '';
  const primaryHref = bodyId === 'page-apply' ? 'programs.html' : 'apply.html';
  const primaryLabel = bodyId === 'page-apply' ? 'View Programs' : 'Apply Now';

  const bar = document.createElement('div');
  bar.className = 'mobile-quick-actions';
  bar.innerHTML = `
    <a href="programs.html" class="btn btn-secondary">Programs</a>
    <a href="${primaryHref}" class="btn btn-primary">${primaryLabel}</a>
  `;

  document.body.appendChild(bar);
}


/* ============================================================
   3. MODAL SYSTEM
   ============================================================ */

let activeModal = null;
const focusableSelectors = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

/**
 * Opens a modal by its ID, locks body scroll, and traps focus.
 * @param {string} modalId - The id of the `.modal-overlay` element
 */
function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) {
    console.warn(`Modal not found: #${modalId}`);
    return;
  }

  // Close any already-open modal first
  if (activeModal && activeModal !== overlay) {
    _closeModalElement(activeModal, false);
  }

  overlay.classList.add('open');
  document.body.classList.add('modal-open');
  activeModal = overlay;

  // Focus first focusable element inside modal
  const modal = overlay.querySelector('.modal');
  if (modal) {
    const firstFocusable = modal.querySelector(focusableSelectors);
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 50);
    }
  }

  // Trap focus within the modal
  overlay.addEventListener('keydown', _trapFocus);
}

/**
 * Closes a modal by its ID.
 * @param {string} modalId
 */
function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return;
  _closeModalElement(overlay, true);
}

function _closeModalElement(overlay, restoreFocus = true) {
  overlay.classList.remove('open');
  document.body.classList.remove('modal-open');
  overlay.removeEventListener('keydown', _trapFocus);
  if (activeModal === overlay) activeModal = null;

  if (restoreFocus) {
    // Return focus to the element that triggered the modal
    const trigger = document.querySelector(`[data-modal="${overlay.id}"]`);
    if (trigger) trigger.focus();
  }
}

function _trapFocus(e) {
  if (e.key !== 'Tab') return;
  const modal = e.currentTarget.querySelector('.modal');
  if (!modal) return;

  const focusables = Array.from(modal.querySelectorAll(focusableSelectors));
  if (!focusables.length) return;

  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

/**
 * Initialises all modal triggers and close buttons on the page.
 */
function initModals() {
  // Open buttons: <button data-modal="myModal">
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      openModal(trigger.dataset.modal);
    });
  });

  // Close buttons inside modals
  document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) _closeModalElement(overlay, true);
    });
  });

  // Backdrop click closes
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) _closeModalElement(overlay, true);
    });
  });

  // ESC key closes active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) {
      _closeModalElement(activeModal, true);
    }
  });
}

/* ============================================================
   4. SMOOTH SCROLL
   ============================================================ */

/**
 * Enables smooth scroll for all internal anchor links `href="#..."`.
 * Accounts for sticky nav height offset.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = document.querySelector('.nav')?.offsetHeight ?? 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
}

/* ============================================================
   5. COUNTER ANIMATION
   ============================================================ */

/**
 * Animates `.stat-number[data-target]` elements from 0 to their target value
 * using an IntersectionObserver. Supports "+" and "B" suffixes.
 */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animateSingleCounter(entry.target);
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
}

function animateSingleCounter(el) {
  const raw     = el.dataset.target ?? '0';
  const suffix  = el.dataset.suffix  ?? raw.replace(/^[\d.]+/, '');
  const prefix  = el.dataset.prefix  ?? '';
  const numStr  = raw.match(/^[\d.]+/)?.[0] ?? '0';
  const target  = parseFloat(numStr) || 0;
  const isDecimal = raw.includes('.');
  const duration = 2000;
  const start    = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const easedVal = easeOutQuart(progress) * target;
    el.textContent = prefix + (isDecimal ? easedVal.toFixed(1) : Math.floor(easedVal)) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ============================================================
   6. FILTER TABS
   ============================================================ */

/**
 * Handles `.filter-tab` clicks: filters `.filterable` items by `data-category`.
 * "All" tab (data-filter="all") shows everything.
 */
function initFilterTabs() {
  document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
    const tabs      = tabGroup.querySelectorAll('.filter-tab');
    const container = tabGroup.closest('section, [data-filter-scope]') ?? document;
    const items     = container.querySelectorAll('.filterable');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active state
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter ?? 'all';

        items.forEach((item, i) => {
          const category = item.dataset.category ?? 'all';
          const show = filter === 'all' || category === filter || category.split(' ').includes(filter);

          if (show) {
            item.classList.remove('hidden-item');
            // Stagger reveal
            item.style.transitionDelay = `${i * 40}ms`;
          } else {
            item.classList.add('hidden-item');
            item.style.transitionDelay = '0ms';
          }
        });
      });
    });
  });
}

/* ============================================================
   7. FORM VALIDATION
   ============================================================ */

/**
 * Validates all required fields in a given step (form panel).
 * Shows inline `.form-error` messages.
 * @param {HTMLElement} panel - The .form-panel element to validate
 * @returns {boolean} - True if all fields are valid
 */
function validatePanel(panel) {
  if (!panel) return true;
  let valid = true;

  // Clear previous errors
  panel.querySelectorAll('.form-error').forEach(el => el.remove());
  panel.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

  // Required fields
  panel.querySelectorAll('[required]').forEach(field => {
    let fieldValid = true;
    const tag = field.tagName.toLowerCase();

    if (tag === 'input' && field.type === 'checkbox') {
      // For a required checkbox group, at least one must be checked
      const name = field.name;
      if (name) {
        const group = panel.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
        const anyChecked = Array.from(group).some(cb => cb.checked);
        if (!anyChecked) {
          fieldValid = false;
          showFieldError(group[group.length - 1], 'Please select at least one option.');
        }
      } else if (!field.checked) {
        fieldValid = false;
        showFieldError(field, 'This field is required.');
      }
    } else if (tag === 'input' || tag === 'select' || tag === 'textarea') {
      const value = field.value.trim();
      if (!value) {
        fieldValid = false;
        showFieldError(field, 'This field is required.');
      } else if (field.type === 'email' && !isValidEmail(value)) {
        fieldValid = false;
        showFieldError(field, 'Please enter a valid email address.');
      } else if (field.type === 'tel' && value.length < 7) {
        fieldValid = false;
        showFieldError(field, 'Please enter a valid phone number.');
      }
    }

    if (!fieldValid) {
      field.classList.add('is-invalid');
      valid = false;
    }
  });

  return valid;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function showFieldError(field, message) {
  // Avoid duplicate error messages
  const existingError = field.parentElement.querySelector('.form-error');
  if (existingError) existingError.remove();

  const error = document.createElement('span');
  error.className = 'form-error';
  error.textContent = message;
  error.setAttribute('role', 'alert');

  const insertAfter = field.closest('.form-check') ?? field;
  insertAfter.insertAdjacentElement('afterend', error);
}

/* ============================================================
   8. MULTI-STEP FORM
   ============================================================ */

/**
 * Initialises multi-step forms. Looks for `.multi-step-form`.
 * Expects step panels as `.form-panel` and step indicators as `.step-item`.
 */
function initMultiStepForm() {
  document.querySelectorAll('.multi-step-form').forEach(form => {
    const panels      = Array.from(form.querySelectorAll('.form-panel'));
    const stepItems   = Array.from(form.querySelectorAll('.step-item'));
    const nextBtns    = form.querySelectorAll('[data-next-step]');
    const backBtns    = form.querySelectorAll('[data-prev-step]');
    const submitBtn   = form.querySelector('[data-submit-form]');
    const successScreen = form.querySelector('.success-screen');

    if (!panels.length) return;

    let currentStep = 0;

    function goToStep(index) {
      panels.forEach((p, i) => p.classList.toggle('active', i === index));
      stepItems.forEach((s, i) => {
        s.classList.toggle('active', i === index);
        s.classList.toggle('complete', i < index);
      });
      currentStep = index;

      // Scroll form into view
      const formTop = form.getBoundingClientRect().top + window.scrollY;
      const navH = document.querySelector('.nav')?.offsetHeight ?? 68;
      window.scrollTo({ top: Math.max(0, formTop - navH - 24), behavior: 'smooth' });
    }

    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = panels[currentStep];
        if (validatePanel(panel) && currentStep < panels.length - 1) {
          goToStep(currentStep + 1);
        }
      });
    });

    backBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 0) goToStep(currentStep - 1);
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const panel = panels[currentStep];
        if (validatePanel(panel)) {
          // Mark all steps complete
          stepItems.forEach(s => s.classList.add('complete'));

          const formContent = form.querySelector('form') ?? form;

          if (formContent) formContent.style.display = 'none';

          if (successScreen) {
            successScreen.classList.add('visible');
          }

          showToast('Application submitted successfully!', 'success');
        }
      });
    }

    // Init — show first panel
    goToStep(0);
  });
}

/* ============================================================
   9. TAB SWITCHING
   ============================================================ */

/**
 * Generic tab system: `.tab-btn[data-tab]` shows `.tab-panel[data-tab]`.
 */
function initTabs() {
  document.querySelectorAll('.tab-buttons').forEach(tabGroup => {
    const scope     = tabGroup.closest('[data-tab-scope]') ?? tabGroup.parentElement;
    const tabBtns   = tabGroup.querySelectorAll('.tab-btn');
    const tabPanels = scope.querySelectorAll('.tab-panel');

    function activateTab(targetTab) {
      tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === targetTab));
      tabPanels.forEach(panel => panel.classList.toggle('active', panel.dataset.tab === targetTab));
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => activateTab(btn.dataset.tab));
    });

    // Activate first tab by default
    const firstBtn = tabBtns[0];
    if (firstBtn) activateTab(firstBtn.dataset.tab);
  });
}

/* ============================================================
   10. TOAST NOTIFICATIONS
   ============================================================ */

let toastContainer = null;

/**
 * Shows a floating toast notification.
 * @param {string} message  - Text to display
 * @param {'success'|'error'|'info'} type - Toast style
 * @param {number} duration - Auto-dismiss time in ms (default 4000)
 */
function showToast(message, type = 'info', duration = 4000) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] ?? 'ℹ️'}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Dismiss notification">×</button>
  `;

  toastContainer.appendChild(toast);

  const close = toast.querySelector('.toast-close');
  close.addEventListener('click', () => dismissToast(toast));

  // Auto-dismiss
  const timer = setTimeout(() => dismissToast(toast), duration);

  // Cancel auto-dismiss on hover; restart a short timer on leave
  let leaveTimer = null;
  toast.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    clearTimeout(leaveTimer);
  });
  toast.addEventListener('mouseleave', () => {
    leaveTimer = setTimeout(() => dismissToast(toast), 1500);
  });
}

function dismissToast(toast) {
  if (!toast.parentElement) return;
  toast.classList.add('toast-hiding');
  setTimeout(() => toast.remove(), 350);
}

/* ============================================================
   11. FAQ ACCORDION
   ============================================================ */

/**
 * Handles `.faq-question` toggle. Accordion: only one open at a time.
 */
function initFAQ() {
  document.querySelectorAll('.faq-list').forEach(list => {
    const items = list.querySelectorAll('.faq-item');

    items.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.setAttribute('aria-expanded', 'false');

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all others in the same list
        items.forEach(i => {
          i.classList.remove('open');
          const q = i.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });

        // Toggle clicked
        if (!isOpen) {
          item.classList.add('open');
          question.setAttribute('aria-expanded', 'true');
        }
      });

      // Keyboard support
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    });
  });
}

/* ============================================================
   12. INTERSECTION OBSERVER (Scroll animations)
   ============================================================ */

/**
 * Observes `.card`, `.animate`, `.fade-in`, `.slide-up` elements.
 * Adds `.animated` when 20% visible. Staggers grid children.
 */
function initScrollAnimations() {
  const animatables = document.querySelectorAll('.card, .animate, .fade-in, .slide-up, .event-card, .person-card, .program-card');
  if (!animatables.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      // Stagger for items in the same row — derive column count from CSS grid or default to 3
      const parentEl  = entry.target.parentElement;
      const gridCols  = parentEl
        ? Math.round(parentEl.offsetWidth / (entry.target.offsetWidth || 1))
        : 3;
      const clampedCols = Math.max(1, Math.min(gridCols, 6));
      const siblings   = Array.from(parentEl?.children ?? []);
      const sibIdx     = siblings.indexOf(entry.target);
      const delay      = (sibIdx % clampedCols) * 80;

      setTimeout(() => {
        entry.target.classList.add('animated');
      }, delay);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  animatables.forEach(el => {
    // Only animate if not already animated
    if (!el.classList.contains('animated')) {
      observer.observe(el);
    }
  });
}

/* ============================================================
   13. EVENT REGISTRATION FORM
   ============================================================ */

/**
 * Pre-selects an event in the register form if `?event=` URL param is present.
 */
function initRegisterForm() {
  const form = document.getElementById('registerForm') ?? document.getElementById('register-form') ?? document.querySelector('[data-form="register"]');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const eventParam = params.get('event') || window.location.hash.replace('#', '');

  if (eventParam) {
    const normalizedEvent = decodeURIComponent(eventParam).toLowerCase();
    const eventSelect = form.querySelector('select[name="event"], #eventSelect');
    if (eventSelect) {
      const option = Array.from(eventSelect.options).find(opt =>
        opt.value.toLowerCase().includes(normalizedEvent) ||
        opt.textContent.toLowerCase().includes(normalizedEvent)
      );
      if (option) {
        eventSelect.value = option.value;
        eventSelect.dispatchEvent(new Event('change'));
      }
    }

    const eventRadio = form.querySelector(`input[name="event_select"][value="${normalizedEvent}"]`);
    if (eventRadio) {
      eventRadio.checked = true;
      if (typeof window.selectEvent === 'function') {
        window.selectEvent(eventRadio);
      } else {
        eventRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    const hiddenField = form.querySelector('input[name="eventId"]');
    if (hiddenField) hiddenField.value = normalizedEvent;
  }

  // Show/hide conditional sections based on event type selection
  const eventTypeSelect = form.querySelector('select[name="eventType"], #eventTypeSelect');
  if (eventTypeSelect) {
    function handleEventTypeChange() {
      const val = eventTypeSelect.value;
      form.querySelectorAll('[data-show-for]').forEach(el => {
        const showFor = el.dataset.showFor.split(',').map(s => s.trim());
        el.classList.toggle('hidden', !showFor.includes(val) && !showFor.includes('all'));
      });
    }
    eventTypeSelect.addEventListener('change', handleEventTypeChange);
    handleEventTypeChange();
  }
}

/* ============================================================
   14. APPLY FORM
   ============================================================ */

/**
 * Pre-checks a program checkbox if `?program=` URL param is present.
 */
function initApplyForm() {
  const form = document.getElementById('applyForm') ?? document.querySelector('[data-form="apply"]') ?? document.getElementById('apply-form');
  if (!form) return;

  const params         = new URLSearchParams(window.location.search);
  const programParam   = params.get('program');

  if (programParam) {
    const normalizedParam = decodeURIComponent(programParam).toLowerCase();
    const programAliases = {
      'azure-architecture-assessment': 'launchpad',
      'landing-zone-sprint': 'launchpad',
      'ai-feature-sprint': 'ai-lab',
      'founder-office-hours': 'launchpad',
      'investor-arch-review': 'launchpad',
      'azure-saas-assessment': 'scale360',
      'azure-expansion-roadmap': 'scale360',
      'ai-production-sprint': 'ai-lab',
      'executive-arch-review': 'enterprise-bridge',
      'ai-monetization-session': 'ai-lab',
      'saas-modernization': 'isv-excellence',
      'marketplace-packaging': 'isv-excellence',
      'co-sell-acceleration': 'partner-fasttrack',
      'co-product-exploration': 'co-build',
      'executive-ai-realization': 'enterprise-bridge',
      'partner-alignment': 'partner-fasttrack',
      'marketplace-gtm': 'partner-fasttrack',
      'co-sell-activation': 'partner-fasttrack',
      'joint-offer-design': 'partner-fasttrack',
      'copilot-builder-series': 'ai-lab',
      'ai-sdlc-enablement': 'ai-lab',
      'dev-productivity-sprint': 'ai-lab',
      'copilot-isv-modernization': 'isv-excellence',
      'copilot-readiness': 'ai-lab',
      'secure-ai-engineering': 'ai-lab'
    };

    const resolvedProgram = programAliases[normalizedParam] ?? normalizedParam;

    const checkbox = form.querySelector(`input[type="checkbox"][value="${resolvedProgram}"]`) ??
                     form.querySelector(`input[type="checkbox"][value="${normalizedParam}"]`) ??
                     form.querySelector(`input[type="checkbox"][name="${resolvedProgram}"]`);
    if (checkbox) {
      checkbox.checked = true;
    }

    const programSelect = form.querySelector('select[name="program"], #programSelect');
    if (programSelect) {
      const option = Array.from(programSelect.options).find(opt =>
        opt.value.toLowerCase() === normalizedParam || opt.value.toLowerCase() === resolvedProgram
      );
      if (option) programSelect.value = option.value;
    }

    const programName = normalizedParam.replace(/-/g, ' ');
    showToast(`Applying for: ${programName}`, 'info', 5000);
  }
}

/* ============================================================
   15. ACTIVE NAV LINK
   ============================================================ */

/**
 * Sets `.active` class on the nav link that matches the current page URL.
 */
function initActiveNavLink() {
  const currentPath = window.location.pathname;
  // Derive the current file name (e.g. "programs.html") from the path
  const currentFile = currentPath.split('/').pop() || 'index.html';
  const navLinks    = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Match against absolute path, relative filename, or path suffix
    const isActive =
      href === currentPath ||
      href === currentFile ||
      (href !== '/' && href !== 'index.html' && currentPath.endsWith('/' + href));

    link.classList.toggle('active', isActive);
  });

  // Fallback: highlight "home" when on root
  if (currentPath === '/' || currentPath === '/index.html' || currentFile === 'index.html') {
    const homeLink = document.querySelector('.nav-links a[href="/"], .nav-links a[href="index.html"]');
    if (homeLink) homeLink.classList.add('active');
  }
}

/* ============================================================
   16. CALENDAR TOGGLE
   ============================================================ */

/**
 * Switches between `.list-view` and `.calendar-view` containers.
 */
function initCalendarToggle() {
  document.querySelectorAll('.calendar-toggle').forEach(toggle => {
    const scope       = toggle.closest('[data-calendar-scope]') ?? document;
    const listView    = scope.querySelector('.list-view');
    const calendarView = scope.querySelector('.calendar-view');

    toggle.addEventListener('click', () => {
      if (!listView || !calendarView) return;
      const showingList = !listView.classList.contains('hidden');

      if (showingList) {
        listView.classList.add('hidden');
        calendarView.classList.remove('hidden');
        toggle.textContent = 'List View';
        toggle.dataset.view = 'calendar';
      } else {
        calendarView.classList.add('hidden');
        listView.classList.remove('hidden');
        toggle.textContent = 'Calendar View';
        toggle.dataset.view = 'list';
      }
    });
  });

  // View toggle buttons (list/calendar)
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.view-toggle');
      if (!parent) return;
      parent.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view  = btn.dataset.view;
      const scope = btn.closest('[data-calendar-scope]') ?? document;

      scope.querySelectorAll('.list-view, .calendar-view').forEach(el => {
        el.classList.add('hidden');
      });

      const target = scope.querySelector(`.${view}-view`);
      if (target) target.classList.remove('hidden');
    });
  });
}

/* ============================================================
   17. COPY TO CLIPBOARD
   ============================================================ */

/**
 * Copies text to clipboard. Bound to `[data-copy]` elements.
 * Shows a toast on success/failure.
 */
function initCopyToClipboard() {
  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', async () => {
      const text = el.dataset.copy || el.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success', 2500);
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 2000);
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          // execCommand is deprecated but retained as a last-resort fallback for legacy browsers.
          document.execCommand('copy');
          showToast('Copied to clipboard!', 'success', 2500);
        } catch {
          showToast('Unable to copy — please copy manually.', 'error');
        }
        document.body.removeChild(textarea);
      }
    });
  });
}

/* ============================================================
   18. LAZY IMAGE LOADING
   ============================================================ */

/**
 * Sets up native lazy loading and IntersectionObserver fallback for `<img data-src>`.
 */
function initLazyImages() {
  // Native lazy loading
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    // Already handled natively — nothing to do
  });

  // Polyfill for `data-src`
  const lazyImgs = document.querySelectorAll('img[data-src]');
  if (!lazyImgs.length) return;

  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.classList.add('loaded');
        imgObserver.unobserve(img);
      });
    }, { rootMargin: '200px 0px' });

    lazyImgs.forEach(img => imgObserver.observe(img));
  } else {
    // Fallback: load all immediately
    lazyImgs.forEach(img => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    });
  }
}

/* ============================================================
   19. CARD HOVER EFFECTS (JS enhancement)
   ============================================================ */

/**
 * Adds subtle mouse-tracking tilt to cards for a premium feel (optional).
 * Only active on non-touch devices.
 */
function initCardEffects() {
  if (window.matchMedia('(hover: none)').matches) return; // Skip on touch devices

  document.querySelectorAll('.card, .program-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left - rect.width / 2;
      const y      = e.clientY - rect.top  - rect.height / 2;
      const maxTilt = 4;
      const tiltX  = (y / (rect.height / 2)) * maxTilt;
      const tiltY  = -(x / (rect.width / 2))  * maxTilt;
      card.style.transform = `translateY(-4px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ============================================================
   20. INLINE FORM REAL-TIME VALIDATION
   ============================================================ */

/**
 * Clears error state as user types/changes a field.
 */
function initInlineValidation() {
  document.querySelectorAll('input, select, textarea').forEach(field => {
    const clearError = () => {
      field.classList.remove('is-invalid');
      const err = field.parentElement.querySelector('.form-error');
      if (err) err.remove();
    };
    field.addEventListener('input', clearError);
    field.addEventListener('change', clearError);
  });
}

/* ============================================================
   21. UTILITY: HTML ESCAPE
   ============================================================ */

/**
 * Escapes HTML entities to prevent XSS in injected content.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, ch => map[ch]);
}

/* ============================================================
   22. HERO STATS BAR (counter trigger)
   ============================================================ */

/**
 * Handles hero stats bar counters — these use `.hero-stat-num[data-target]`.
 */
function initHeroCounters() {
  const heroStats = document.querySelectorAll('.hero-stat-num[data-target]');
  if (!heroStats.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animateSingleCounter(entry.target);
    });
  }, { threshold: 0.5 });

  heroStats.forEach(el => observer.observe(el));
}

/* ============================================================
   23. PROGRAM/EVENT CARD "READ MORE" TOGGLE
   ============================================================ */

/**
 * Truncates long card descriptions and adds a "Read more" toggle.
 */
function initReadMore() {
  const CHAR_LIMIT = 160;

  document.querySelectorAll('.card-desc, .event-desc').forEach(desc => {
    const fullText = desc.textContent.trim();
    if (fullText.length <= CHAR_LIMIT) return;

    const truncated = fullText.slice(0, CHAR_LIMIT).trim() + '…';

    desc.textContent = truncated;
    desc.dataset.full = fullText;
    desc.dataset.truncated = truncated;

    const toggle = document.createElement('button');
    toggle.className = 'btn-link text-blue text-sm font-medium';
    toggle.textContent = 'Read more';
    toggle.style.cssText = 'display:block;margin-top:4px;background:none;border:none;cursor:pointer;padding:0;font-family:inherit;';

    let expanded = false;
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      expanded = !expanded;
      desc.textContent = expanded ? fullText : truncated;
      toggle.textContent = expanded ? 'Read less' : 'Read more';
      desc.insertAdjacentElement('afterend', toggle);
    });

    desc.insertAdjacentElement('afterend', toggle);
  });
}

/* ============================================================
   24. STICKY SECTION HEADERS
   ============================================================ */

/**
 * Makes `.section-sticky-header` elements sticky beneath the nav.
 */
function initStickyHeaders() {
  const nav = document.querySelector('.nav');
  document.querySelectorAll('.section-sticky-header').forEach(header => {
    const navH = nav?.offsetHeight ?? 68;
    header.style.top = `${navH}px`;
  });
}

/* ============================================================
   25. BACK TO TOP BUTTON
   ============================================================ */

/**
 * Creates and manages a "back to top" floating button.
 */
function initBackToTop() {
  let btn = document.querySelector('#backToTop');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'backToTop';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '↑';
    document.body.appendChild(btn);
  }

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   26. PAGE DETECTION & CONDITIONAL INIT
   ============================================================ */

/**
 * Detects the current page and runs page-specific initialisation.
 */
function detectPageAndInit() {
  const bodyId = document.body.id;

  // These run on every page — they safely no-op if the required elements are absent
  initFilterTabs();
  initCalendarToggle();
  initRegisterForm();
  initApplyForm();
  initMultiStepForm();
  initHeroCounters();

  // Page-specific extras (currently reserved for future use)
  if (bodyId === 'page-about' || document.querySelector('[data-page="about"]')) {
    // nothing page-specific yet
  }
}

/* ============================================================
   27. FORM SUBMIT HANDLER (generic)
   ============================================================ */

/**
 * Handles `.ajax-form` submissions with client-side validation.
 * Shows toast on success/error.
 */
function initGenericForms() {
  document.querySelectorAll('form.ajax-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const mockPanel = form; // form has querySelectorAll; validatePanel accepts any element
      if (!validatePanel(form)) {
        showToast('Please fix the highlighted errors.', 'error');
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting…';
      }

      try {
        const action  = form.action || window.location.href;
        const method  = (form.method || 'POST').toUpperCase();
        const data    = new FormData(form);

        const response = await fetch(action, { method, body: data });

        if (response.ok) {
          showToast('Form submitted successfully!', 'success');
          form.reset();
          const successEl = form.querySelector('.success-screen');
          if (successEl) {
            form.style.display = 'none';
            successEl.classList.add('visible');
          }
        } else {
          throw new Error(`Server responded with ${response.status}`);
        }
      } catch (err) {
        showToast('Submission failed. Please try again.', 'error');
        console.error('Form submission error:', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText ?? 'Submit';
        }
      }
    });
  });
}

/* ============================================================
   28. TESTIMONIAL CAROUSEL (simple auto-scroll)
   ============================================================ */

/**
 * Auto-advances testimonial cards inside `.testimonial-carousel` every 5s.
 * Pauses on hover/focus.
 */
function initTestimonialCarousel() {
  document.querySelectorAll('.testimonial-carousel').forEach(carousel => {
    const track   = carousel.querySelector('.carousel-track');
    const items   = track ? Array.from(track.children) : [];
    const dots    = Array.from(carousel.querySelectorAll('.carousel-dot'));
    if (items.length <= 1) return;

    let current  = 0;
    let interval = null;
    let paused   = false;

    function goTo(idx) {
      items.forEach((item, i) => item.classList.toggle('active', i === idx));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      current = idx;
    }

    function next() {
      if (!paused) goTo((current + 1) % items.length);
    }

    function startAuto() {
      interval = setInterval(next, 5000);
    }

    function stopAuto() {
      clearInterval(interval);
    }

    goTo(0);
    startAuto();

    carousel.addEventListener('mouseenter', () => { paused = true; stopAuto(); });
    carousel.addEventListener('mouseleave', () => { paused = false; startAuto(); });
    carousel.addEventListener('focusin',    () => { paused = true; stopAuto(); });
    carousel.addEventListener('focusout',   () => { paused = false; startAuto(); });

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    if (prevBtn) prevBtn.addEventListener('click', () => goTo((current - 1 + items.length) % items.length));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo((current + 1) % items.length));
  });
}

/* ============================================================
   29. SEARCH / LIVE FILTER
   ============================================================ */

/**
 * Live-filters a list of items as the user types in a `[data-search-input]` field.
 * Targets `[data-search-item]` elements within `[data-search-scope]`.
 */
function initSearch() {
  document.querySelectorAll('[data-search-input]').forEach(input => {
    const scope = document.querySelector(input.dataset.searchInput) ?? document;

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      const items = scope.querySelectorAll('[data-search-item]');
      let visibleCount = 0;

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matches = !query || text.includes(query);
        item.classList.toggle('hidden-item', !matches);
        if (matches) visibleCount++;
      });

      // Show/hide empty state
      const emptyState = scope.querySelector('[data-empty-state]');
      if (emptyState) {
        emptyState.classList.toggle('hidden', visibleCount > 0);
      }
    });
  });
}

function initInlineTabs() {
  document.querySelectorAll('.inline-tabs').forEach(tabBar => {
    const buttons = Array.from(tabBar.querySelectorAll('.inline-tab'));
    if (!buttons.length) return;

    const scope = tabBar.parentElement;
    const panels = scope ? Array.from(scope.querySelectorAll('.inline-tab-panel')) : [];

    function activateTab(tabId) {
      buttons.forEach((button) => {
        const isActive = button.dataset.tab === tabId;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach((panel) => {
        const panelId = panel.id.replace(/^tab-/, '');
        panel.classList.toggle('active', panelId === tabId);
      });
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => activateTab(button.dataset.tab));
    });

    activateTab(buttons.find((button) => button.classList.contains('active'))?.dataset.tab || buttons[0].dataset.tab);
  });
}

function initContextualLinks() {
  document.querySelectorAll('.event-card').forEach((card) => {
    const title = card.querySelector('.event-title')?.textContent?.trim();
    if (!title) return;

    const eventSlug = title
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    card.querySelectorAll('a[href="register.html"]').forEach((link) => {
      link.href = `register.html?event=${encodeURIComponent(eventSlug)}`;
    });
  });
}

function initEditorialImages() {
  const eventImageMap = {
    'Azure AI Summit Israel 2026': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&h=400&fit=crop&crop=center',
    'Founder Office Hours': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=400&fit=crop&crop=center',
    'CTO Circle Dinner Q2': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&h=400&fit=crop&crop=center',
    'Spring Demo Day 2026': 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=900&h=400&fit=crop&crop=center',
    'ISV Deep Dive: AI Integration': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=400&fit=crop&crop=center',
    'Marketplace GTM Bootcamp': 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&h=400&fit=crop&crop=center'
  };

  document.querySelectorAll('.event-card').forEach((card) => {
    if (card.querySelector('.event-card-img')) return;
    const title = card.querySelector('.event-title')?.textContent?.trim();
    const src = eventImageMap[title];
    if (!src) return;

    const body = card.querySelector('.event-body');
    if (!body) return;

    const img = document.createElement('img');
    img.className = 'event-card-img';
    img.src = src;
    img.alt = title;
    img.loading = 'lazy';
    body.insertBefore(img, body.firstChild);
  });
}

/* ============================================================
   31. HERO AMBIENT PARTICLE ANIMATION
   ============================================================ */

/**
 * Creates subtle floating particles in hero backgrounds for ambience.
 * Respects prefers-reduced-motion.
 */
function initHeroParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.hero, .page-hero').forEach(hero => {
    const container = document.createElement('div');
    container.className = 'hero-particles';
    container.setAttribute('aria-hidden', 'true');

    const PARTICLE_COUNT = 10;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('span');
      p.className = 'hero-particle';
      const size    = (Math.random() * 2.5 + 1).toFixed(1);
      const left    = (Math.random() * 100).toFixed(1);
      const bottom  = (Math.random() * 40).toFixed(1);
      const dur     = (Math.random() * 9 + 7).toFixed(1);
      const delay   = -(Math.random() * 12).toFixed(1);
      const opacity = (Math.random() * 0.35 + 0.2).toFixed(2);

      p.style.cssText =
        `width:${size}px;height:${size}px;left:${left}%;bottom:${bottom}%;` +
        `animation-duration:${dur}s;animation-delay:${delay}s;opacity:${opacity};`;
      container.appendChild(p);
    }

    hero.appendChild(container);
  });
}

/* ============================================================
   32. BUTTON RIPPLE EFFECT
   ============================================================ */

/**
 * Adds a CSS ripple effect to .btn elements on pointer-down.
 */
function initButtonRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointerdown', function (e) {
      const rect  = btn.getBoundingClientRect();
      const x     = e.clientX - rect.left;
      const y     = e.clientY - rect.top;
      const size  = Math.max(rect.width, rect.height) * 1.6;

      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.cssText =
        `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px;`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });
}

/* ============================================================
   33. ENHANCED DIRECTIONAL SCROLL REVEAL
   ============================================================ */

/**
 * Observes additional elements not covered by initScrollAnimations.
 * Supports .reveal-left, .reveal-right, .reveal-scale and common
 * section elements. Applies auto-stagger to sibling groups.
 */
function initEnhancedScrollReveal() {
  const SELECTOR = [
    '.reveal-left', '.reveal-right', '.reveal-scale',
    '.diff-item', '.diff-strip-item',
    '.stat-item', '.proof-item',
    '.segment-card', '.collab-card',
    '.story-card', '.story-featured',
    '.testimonial-card', '.person-card',
    '.journey-track', '.timeline-item',
    '.reg-event-card', '.trust-box',
    '.section-header'
  ].join(', ');

  const elements = document.querySelectorAll(SELECTOR);
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const el     = entry.target;
      const parent = el.parentElement;

      // Derive stagger delay from sibling position within the same parent
      if (parent) {
        const allKids = Array.from(parent.children);
        const idx = allKids.indexOf(el);
        const elW      = el.offsetWidth;
        const parentW  = parent.offsetWidth;
        const MIN_ELEMENT_WIDTH = 10; // px threshold to treat element as a grid cell
        const STAGGER_DELAY_MS  = 90; // ms per grid column for stagger effect
        const rawCols  = (parentW > 0 && elW > MIN_ELEMENT_WIDTH)
          ? Math.round(parentW / elW)
          : 3;
        const gridCols = Math.max(1, Math.min(rawCols, 6));
        const col      = idx % gridCols;
        if (!el.style.transitionDelay) {
          el.style.transitionDelay = `${col * STAGGER_DELAY_MS}ms`;
        }
      }

      el.classList.add('animated');
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  elements.forEach(el => {
    if (!el.classList.contains('animated')) {
      observer.observe(el);
    }
  });
}

/* ============================================================
   34. PAGE LOAD ENTRANCE SEQUENCE
   ============================================================ */

/**
 * Staggers hero child elements on first page load for a polished entrance.
 * Respects prefers-reduced-motion.
 */
function initPageLoadAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroContent = document.querySelector('.hero-content, .page-hero-inner, .page-hero .container');
  if (!heroContent) return;

  Array.from(heroContent.children).forEach((child, idx) => {
    if (child.classList.contains('hero-particles')) return;
    child.classList.add('hero-child-reveal');
    child.style.animationDelay = `${0.1 + idx * 0.12}s`;
  });
}

/* ============================================================
   35. SUBTLE HERO PARALLAX ON SCROLL
   ============================================================ */

/**
 * Applies a very subtle parallax shift to the hero section content.
 * Max shift: 28px. Skipped on touch / reduced-motion devices.
 */
function initHeroParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const hero    = document.querySelector('.hero');
  if (!hero) return;
  const content = hero.querySelector('.hero-content, .container');
  if (!content) return;

  const MAX_SHIFT = 28;

  function onScroll() {
    const heroH   = hero.offsetHeight;
    const scrollY = window.scrollY;
    if (heroH <= 0 || scrollY > heroH) return;
    const shift = (scrollY / heroH) * MAX_SHIFT;
    content.style.transform = `translateY(${shift.toFixed(1)}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ============================================================
   36. READING PROGRESS BAR
   ============================================================ */

function initReadingProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'reading-progress-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Page reading progress');
  bar.setAttribute('aria-valuenow', '0');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  document.body.insertBefore(bar, document.body.firstChild);

  let ticking = false;

  function updateBar() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    bar.style.width = progress + '%';
    bar.setAttribute('aria-valuenow', progress);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateBar);
      ticking = true;
    }
  }, { passive: true });
}

/* ============================================================
   37. MAIN INIT — DOMContentLoaded
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Global (every page)
  initStickyNav();
  initMobileMenu();
  initModals();
  initSmoothScroll();
  initActiveNavLink();
  initNavigationEnhancements();
  initMobileQuickActions();
  initScrollAnimations();
  initFAQ();
  initTabs();
  initCounters();
  initCopyToClipboard();
  initLazyImages();
  initInlineValidation();
  initBackToTop();
  initSearch();
  initGenericForms();
  initTestimonialCarousel();
  initStickyHeaders();
  initReadMore();
  initInlineTabs();
  initContextualLinks();
  initEditorialImages();

  // Card effects — only on non-touch devices
  if (!('ontouchstart' in window)) {
    initCardEffects();
  }

  // detectPageAndInit handles all page-specific features (filter tabs, forms,
  // calendar, hero counters) — it also runs them on every page so they work
  // regardless of body id, while still allowing early-exit optimisations.
  detectPageAndInit();

  initReadingProgressBar();

  // UI Enhancement Layer — premium animations and interactions
  initHeroParticles();
  initButtonRipple();
  initEnhancedScrollReveal();
  initPageLoadAnimation();
  initHeroParallax();

  console.info('🚀 Microsoft Israel Innovation Hub — JS initialised');
});
