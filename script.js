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

  // Fetch GitHub repos
  async function fetchRepos() {
    try {
      const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=9`);
      if (!response.ok) throw new Error('Failed to fetch repos');
      const repos = await response.json();
      renderRepos(repos);
      
      // Update stats with real data
      updateStats(repos);
    } catch (error) {
      console.error('Error fetching repos:', error);
      // Fall back to static data if API fails
      document.getElementById('project-loading').innerHTML = '<p>Could not load projects. <a href="https://github.com/xdfkenny" target="_blank" rel="noopener noreferrer">View on GitHub →</a></p>';
    }
  }

  // Render repos
  function renderRepos(repos) {
    const grid = document.getElementById('project-grid');
    const loading = document.getElementById('project-loading');
    if (loading) loading.remove();

    repos.forEach((repo, index) => {
      const card = document.createElement('article');
      card.className = `project-card ${index === 0 ? 'project-card--featured' : ''}`;
      
      const lang = repo.language || 'Other';
      const langColor = languageColors[lang] || '#7EC8E3';
      
      card.innerHTML = `
        <a href="${repo.html_url}" class="project-card-link" target="_blank" rel="noopener noreferrer">
          <div class="project-card-header">
            <span class="project-lang" style="border-color: ${langColor}33; color: ${langColor}">${lang}</span>
            <span class="project-updated">Updated ${timeAgo(repo.updated_at)}</span>
          </div>
          <h3 class="project-title">${repo.name}</h3>
          <p class="project-desc">${repo.description || 'No description provided.'}</p>
          <span class="project-arrow" aria-hidden="true">→</span>
        </a>
      `;
      
      grid.appendChild(card);
    });
  }

  // Update stats
  function updateStats(repos) {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    
    // Update the stats numbers
    const statNumbers = document.querySelectorAll('.stats-number');
    if (statNumbers[0]) statNumbers[0].textContent = repos.length; // Repos
    if (statNumbers[1]) statNumbers[1].textContent = totalStars; // Stars
    
    // Fetch user data for followers/following
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`)
      .then(res => res.json())
      .then(user => {
        if (statNumbers[2]) statNumbers[2].textContent = user.followers;
        if (statNumbers[3]) statNumbers[3].textContent = user.following;
      })
      .catch(err => console.error('Error fetching user:', err));
  }

  // Generate GitHub Activity Heatmap (53 weeks × 7 days = 371 squares)
  async function generateHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;

    try {
      // Fetch all pages of events to get maximum data
      let allEvents = [];
      for (let page = 1; page <= 3; page++) {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100&page=${page}`);
        if (!response.ok) break;
        const events = await response.json();
        if (events.length === 0) break;
        allEvents = allEvents.concat(events);
      }

      // Group events by date
      const activityMap = {};
      allEvents.forEach(event => {
        const dateStr = event.created_at.split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      });

      grid.innerHTML = '';

      // Build 53 columns (weeks) × 7 rows (Sun=0, Sat=6)
      const today = new Date();
      // Most recent Sunday (or today if Sunday)
      const lastSunday = new Date(today);
      lastSunday.setDate(today.getDate() - today.getDay());
      // First Sunday = 52 weeks before last Sunday
      const firstSunday = new Date(lastSunday);
      firstSunday.setDate(firstSunday.getDate() - 52 * 7);

      // Generate all 371 cells aligned to day-of-week rows
      const maxActivity = Math.max(...Object.values(activityMap), 1);

      for (let week = 0; week < 53; week++) {
        for (let day = 0; day < 7; day++) {
          const cellDate = new Date(firstSunday);
          cellDate.setDate(firstSunday.getDate() + week * 7 + day);

          // Skip future dates (beyond today)
          if (cellDate > today) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell heatmap-none';
            grid.appendChild(cell);
            continue;
          }

          const dateStr = cellDate.toISOString().split('T')[0];
          const count = activityMap[dateStr] || 0;

          const intensity = count === 0 ? 'none' : 
                           count < maxActivity * 0.25 ? 'low' :
                           count < maxActivity * 0.6 ? 'med' : 'high';

          const cell = document.createElement('div');
          cell.className = `heatmap-cell heatmap-${intensity}`;
          cell.title = `${dateStr}: ${count} contribution${count !== 1 ? 's' : ''}`;
          grid.appendChild(cell);
        }
      }
    } catch (error) {
      console.error('Error generating heatmap:', error);
      generateFallbackHeatmap(grid);
    }
  }

  function generateFallbackHeatmap(grid) {
    grid.innerHTML = '';
    const patterns = ['none', 'none', 'none', 'low', 'low', 'med', 'med', 'high'];
    const totalCells = 53 * 7; // 371 squares

    for (let i = 0; i < totalCells; i++) {
      const intensity = patterns[Math.floor(Math.random() * patterns.length)];
      const cell = document.createElement('div');
      cell.className = `heatmap-cell heatmap-${intensity}`;
      grid.appendChild(cell);
    }
  }

  // Initialize
  fetchRepos();
  generateHeatmap();
});
