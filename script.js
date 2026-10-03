// JS-gated styles (e.g. reveal animations) only apply when scripting runs
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('is-open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('is-open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
      navToggle.focus();
    }
  });

  // Stat counter animation on scroll
  const statsNumbers = document.querySelectorAll('.stats-number');
  const statsSection = document.querySelector('.stats');
  let statsAnimated = false;

  const animateStats = () => {
    if (statsAnimated) return;
    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      statsAnimated = true;
      statsNumbers.forEach(stat => {
        const target = parseInt(stat.textContent, 10);
        if (isNaN(target)) return;
        let current = 0;
        const increment = target / 30;
        const duration = 600;
        const stepTime = duration / 30;
        const counter = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.textContent = target;
            clearInterval(counter);
          } else {
            stat.textContent = Math.floor(current);
          }
        }, stepTime);
      });
    }
  };

  window.addEventListener('scroll', animateStats, { passive: true });
  animateStats();

  // Background Music Toggle (click-only: never hijack the user's first interaction with surprise audio)
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

  // Back-to-top chibi: appears once the hero has scrolled away
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

    // Deterministic initial state (IntersectionObserver fires async)
    syncChibi();
    window.addEventListener('scroll', syncChibi, { passive: true });

    chibiTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Popsicle easter egg: click for a frosty wobble
  document.querySelectorAll('.popsicle-img').forEach(popsicle => {
    popsicle.addEventListener('click', () => {
      popsicle.classList.remove('popsicle-wobble');
      // Restart the animation on rapid clicks
      void popsicle.offsetWidth;
      popsicle.classList.add('popsicle-wobble');
    });
    popsicle.addEventListener('animationend', () => {
      popsicle.classList.remove('popsicle-wobble');
    });
  });

  // GitHub API Integration
  const GITHUB_USERNAME = 'xdfkenny';

  // Language color mapping
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

  // Format relative time
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

  // Fetch GitHub repos + user profile
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

      // Update stats with real data
      updateStats(repos, user);
    } catch (error) {
      console.error('Error fetching repos:', error);
      // Fall back to static link if API fails
      const loading = document.getElementById('project-loading');
      if (loading) {
        loading.innerHTML = '<p>Could not load projects. <a href="https://github.com/xdfkenny" target="_blank" rel="noopener noreferrer">View on GitHub →</a></p>';
      }
    }
  }

  // Render repos
  function renderRepos(repos) {
    const grid = document.getElementById('project-grid');
    const loading = document.getElementById('project-loading');
    if (loading) loading.remove();

    repos.slice(0, 9).forEach((repo, index) => {
      const card = document.createElement('article');
      card.className = `project-card ${index === 0 ? 'project-card--featured' : ''}`;

      const lang = repo.language || 'Other';
      const langColor = languageColors[lang] || '#7EC8E3';
      const homepage = (repo.homepage || '').trim();

      // Header row (kept outside the main link so footer actions stay clickable)
      const header = document.createElement('div');
      header.className = 'project-card-header';

      const langPill = document.createElement('span');
      langPill.className = 'project-lang';
      langPill.style.borderColor = `${langColor}55`;
      // Darken the language color for readable text on the frost pill
      langPill.style.color = `color-mix(in oklab, ${langColor} 38%, #16324F)`;
      langPill.textContent = lang;
      header.appendChild(langPill);

      const updated = document.createElement('span');
      updated.className = 'project-updated';
      updated.textContent = `Updated ${timeAgo(repo.updated_at)}`;
      header.appendChild(updated);

      // Main link covers title and description
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

      // Footer actions pinned to the card bottom
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
    });
  }

  // Update stats
  function updateStats(repos, user) {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    const statNumbers = document.querySelectorAll('.stats-number');
    if (statNumbers[0]) statNumbers[0].textContent = user ? user.public_repos : repos.length;
    if (statNumbers[1]) statNumbers[1].textContent = totalStars;

    if (user) {
      if (statNumbers[2]) statNumbers[2].textContent = user.followers;
      if (statNumbers[3]) statNumbers[3].textContent = user.following;
    }
  }

  // About section stagger entrance (also used by Live Sites cards)
  const staggerEls = document.querySelectorAll('.about-stagger, .about-card-stagger, .site-card');
  if (staggerEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => entry.target.classList.add('visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    staggerEls.forEach(el => observer.observe(el));

    // Reveal elements already in view at load without waiting for the observer
    staggerEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const delay = parseInt(el.dataset.delay) || 0;
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }

  // Initialize
  fetchRepos();
});
