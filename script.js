// JS-gated styles (e.g. reveal animations) only apply when scripting runs
document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Mobile navigation ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      navLinks.classList.toggle('is-open', !isExpanded);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('is-open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
      navToggle.focus();
    }
  });

  /* ---------- Smooth anchor scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Header: transparent -> floating glass pill ---------- */
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const syncHeader = () => {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  /* ---------- Blur-and-rise reveals ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay, 10) || 0;
        setTimeout(() => entry.target.classList.add('reveal-in'), delay);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => {
      // Reveal anything already in view without waiting for a scroll
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const delay = parseInt(el.dataset.delay, 10) || 0;
        setTimeout(() => el.classList.add('reveal-in'), delay);
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    revealEls.forEach(el => el.classList.add('reveal-in'));
  }

  /* ---------- Spotlight hover on cards ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.spot');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--sx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--sy', `${e.clientY - rect.top}px`);
    }, { passive: true });
  }

  /* ---------- Stat number ticker ---------- */
  const statNumbers = document.querySelectorAll('.stats-number[data-count]');
  const tickUp = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    if (prefersReducedMotion) { el.textContent = target; return; }
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = Math.round(target * eased);
      if (t < 1) el._tickRaf = requestAnimationFrame(step);
    };
    el._tickRaf = requestAnimationFrame(step);
  };

  if (statNumbers.length) {
    const statsSection = document.querySelector('.stats');
    let statsAnimated = false;
    const runTicker = () => {
      if (statsAnimated) return;
      statsAnimated = true;
      statNumbers.forEach((stat, i) => setTimeout(() => tickUp(stat), i * 90));
    };

    if (statsSection) {
      const statsObserver = new IntersectionObserver((entries) => {
        if (entries.some(en => en.isIntersecting)) { runTicker(); statsObserver.disconnect(); }
      }, { threshold: 0.3 });
      statsObserver.observe(statsSection);
      // Deterministic initial state
      const rect = statsSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) runTicker();
    } else {
      runTicker();
    }
  }

  /* ---------- Background music (click-only, never surprise audio) ---------- */
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');

  if (audio && musicBtn) {
    audio.volume = 0.35;

    musicBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => {});
        musicBtn.classList.add('playing');
        musicBtn.setAttribute('aria-pressed', 'true');
      } else {
        audio.pause();
        musicBtn.classList.remove('playing');
        musicBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /* ---------- Back-to-top chibi ---------- */
  const chibiTop = document.getElementById('chibi-top');
  const hero = document.querySelector('.hero');

  if (chibiTop && hero) {
    const syncChibi = () => {
      chibiTop.hidden = hero.getBoundingClientRect().bottom > 80;
    };

    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        chibiTop.hidden = entry.isIntersecting;
      });
    }, { threshold: 0.15 });
    heroObserver.observe(hero);

    syncChibi();
    window.addEventListener('scroll', syncChibi, { passive: true });

    chibiTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Popsicle easter egg ---------- */
  document.querySelectorAll('.popsicle-img').forEach(popsicle => {
    popsicle.addEventListener('click', () => {
      popsicle.classList.remove('popsicle-wobble');
      void popsicle.offsetWidth; // restart the animation on rapid clicks
      popsicle.classList.add('popsicle-wobble');
    });
    popsicle.addEventListener('animationend', () => {
      popsicle.classList.remove('popsicle-wobble');
    });
  });

  /* ---------- GitHub API ---------- */
  const GITHUB_USERNAME = 'xdfkenny';

  const languageColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Shell: '#89e051'
  };

  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  }

  async function fetchRepos() {
    try {
      const [reposResponse, userResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`),
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`)
      ]);
      if (!reposResponse.ok) throw new Error('Failed to fetch repos');
      const repos = await reposResponse.json();
      const user = userResponse.ok ? await userResponse.json() : null;
      renderRepos(repos);
      updateStats(repos, user);
    } catch (error) {
      console.error('Error fetching repos:', error);
      const loading = document.getElementById('project-loading');
      if (loading) {
        loading.innerHTML = '<p>Could not load projects. <a href="https://github.com/xdfkenny" target="_blank" rel="noopener noreferrer">View on GitHub →</a></p>';
      }
    }
  }

  function renderRepos(repos) {
    const grid = document.getElementById('project-grid');
    const loading = document.getElementById('project-loading');
    if (loading) loading.remove();

    repos.slice(0, 9).forEach((repo, index) => {
      const card = document.createElement('article');
      card.className = `project-card spot${index === 0 ? ' project-card--featured' : ''}`;

      const lang = repo.language || 'Other';
      const langColor = languageColors[lang] || '#09F';
      const homepage = (repo.homepage || '').trim();

      const header = document.createElement('div');
      header.className = 'project-card-header';

      const langPill = document.createElement('span');
      langPill.className = 'project-lang';
      const langDot = document.createElement('span');
      langDot.className = 'lang-dot';
      langDot.setAttribute('aria-hidden', 'true');
      langDot.style.background = langColor;
      langPill.appendChild(langDot);
      langPill.appendChild(document.createTextNode(lang));
      header.appendChild(langPill);

      const updated = document.createElement('span');
      updated.className = 'project-updated';
      updated.textContent = `Updated ${timeAgo(repo.updated_at)}`;
      header.appendChild(updated);

      const link = document.createElement('a');
      link.href = repo.html_url;
      link.className = 'project-card-link';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${repo.name} on GitHub`);

      const title = document.createElement('h3');
      title.className = 'project-title';
      title.textContent = repo.name;

      const desc = document.createElement('p');
      desc.className = 'project-desc';
      desc.textContent = (repo.description || 'No description provided.').replace(/[—–]/g, '-');

      link.appendChild(title);
      link.appendChild(desc);

      const footer = document.createElement('div');
      footer.className = 'project-card-footer';

      const repoLink = document.createElement('a');
      repoLink.className = 'project-repo';
      repoLink.href = repo.html_url;
      repoLink.target = '_blank';
      repoLink.rel = 'noopener noreferrer';
      repoLink.textContent = 'View on GitHub';
      const repoArrow = document.createElement('span');
      repoArrow.className = 'project-repo-arrow';
      repoArrow.setAttribute('aria-hidden', 'true');
      repoArrow.textContent = '↗';
      repoLink.appendChild(repoArrow);
      footer.appendChild(repoLink);

      if (homepage) {
        const liveLink = document.createElement('a');
        liveLink.className = 'project-live';
        liveLink.href = homepage;
        liveLink.target = '_blank';
        liveLink.rel = 'noopener noreferrer';
        liveLink.textContent = 'Open site ↗';
        liveLink.setAttribute('aria-label', `Open ${repo.name} live site`);
        footer.appendChild(liveLink);
      }

      card.appendChild(header);
      card.appendChild(link);
      card.appendChild(footer);
      grid.appendChild(card);

      // Gentle staggered entrance for freshly-rendered cards
      if (!prefersReducedMotion) {
        card.style.opacity = '0';
        card.style.translate = '0 16px';
        requestAnimationFrame(() => {
          setTimeout(() => {
            card.style.transition = 'opacity 600ms cubic-bezier(0.22,1,0.36,1), translate 600ms cubic-bezier(0.22,1,0.36,1)';
            card.style.opacity = '1';
            card.style.translate = '0 0';
          }, 60 + index * 60);
        });
      }
    });
  }

  function updateStats(repos, user) {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    const statNumbers = document.querySelectorAll('.stats-number');
    const apply = (el, value) => {
      if (!el) return;
      if (el._tickRaf) cancelAnimationFrame(el._tickRaf); // stop an in-flight ticker
      el.dataset.count = value;   // ticker picks this up if it hasn't run yet
      el.textContent = value;     // instant fallback if ticker already fired
    };
    apply(statNumbers[0], user ? user.public_repos : repos.length);
    apply(statNumbers[1], totalStars);
    if (user) {
      apply(statNumbers[2], user.followers);
      apply(statNumbers[3], user.following);
    }
  }

  fetchRepos();
});
