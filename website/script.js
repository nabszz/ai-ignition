/* ============================================================
   THE 2AM SHOPPERS — Presentation Website JS
   ============================================================ */

/* ---------- Nav: scroll shadow + mobile toggle ---------- */
const nav       = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
  const spans = navToggle.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach((s) => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.querySelectorAll('span').forEach((s) => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

/* ---------- Active nav link on scroll ---------- */
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.querySelectorAll('a').forEach((a) => {
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach((s) => navObserver.observe(s));

const activeStyle = document.createElement('style');
activeStyle.textContent = `.nav-links a.active { color: #ff8fa3 !important; }`;
document.head.appendChild(activeStyle);

/* ---------- Scroll fade-in for all key elements ---------- */
const ANIMATE_SELECTORS = [
  '.pain-card', '.step-card', '.approach-card', '.metric-card',
  '.view-card', '.inspo-chip', '.notif-bubble', '.journey-step',
  '.proc-step', '.scope-col', '.section-title', '.section-desc',
  '.example-block', '.simple-example', '.team-connection',
  '.pilot-note', '.demo-focus',
];

ANIMATE_SELECTORS.forEach((sel) => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${i * 55}ms`;
  });
});

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach((el) => fadeObserver.observe(el));

/* ---------- Typewriter on hero subtitle ---------- */
const heroSub = document.querySelector('.hero-sub');
if (heroSub) {
  const text = heroSub.textContent;
  heroSub.textContent = '';
  heroSub.style.borderRight = '2px solid #ff8fa3';
  let i = 0;
  setTimeout(() => {
    const t = setInterval(() => {
      heroSub.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(t);
        setTimeout(() => { heroSub.style.borderRight = 'none'; }, 500);
      }
    }, 30);
  }, 500);
}

/* ---------- Notification bubbles — staggered entrance ---------- */
const notifBubbles = document.querySelectorAll('.notif-bubble');
const notifObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    notifBubbles.forEach((b, i) => {
      setTimeout(() => {
        b.style.opacity   = '1';
        b.style.transform = 'translateX(0)';
      }, i * 220);
    });
    notifObserver.disconnect();
  }
}, { threshold: 0.3 });

notifBubbles.forEach((b) => {
  b.style.opacity   = '0';
  b.style.transform = 'translateX(-20px)';
  b.style.transition = 'opacity .45s ease, transform .45s ease';
});
if (notifBubbles.length) notifObserver.observe(notifBubbles[0].parentElement);

/* ---------- Journey steps — sequential highlight on scroll ---------- */
const journeySteps = document.querySelectorAll('.journey-step');
const journeyObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    journeySteps.forEach((step, i) => {
      setTimeout(() => step.classList.add('visible'), i * 80);
    });
    journeyObserver.disconnect();
  }
}, { threshold: 0.1 });

if (journeySteps.length) journeyObserver.observe(journeySteps[0].closest('.journey-timeline'));

/* ---------- Smooth scroll with nav offset ---------- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* ---------- Process steps — click to tick ---------- */
document.querySelectorAll('.proc-step').forEach((step) => {
  step.style.cursor = 'pointer';
  step.title = 'Click to mark done';
  step.addEventListener('click', () => {
    const done = step.classList.toggle('step-done');
    step.style.opacity          = done ? '0.45' : '';
    step.style.textDecoration   = done ? 'line-through' : '';
    step.style.borderLeftColor  = done ? 'var(--green-light)' : '';
    step.style.borderLeftWidth  = done ? '3px' : '';
    step.style.paddingLeft      = done ? '15px' : '';
  });
});

/* ---------- Logo scroll to top ---------- */
document.querySelector('.nav-logo')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- Approach cards — interactive response demo ---------- */
// Map each response in the adaptation table to a colour signal
const approachCards = document.querySelectorAll('.approach-card');
approachCards.forEach((card) => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 0 0 1px rgba(240,78,110,.4), 0 8px 24px rgba(240,78,110,.12)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '';
  });
});

/* ---------- Inspirations: hover glow ---------- */
document.querySelectorAll('.inspo-chip').forEach((chip) => {
  chip.addEventListener('mouseenter', () => {
    chip.style.background = 'rgba(240,78,110,.08)';
  });
  chip.addEventListener('mouseleave', () => {
    chip.style.background = '';
  });
});
