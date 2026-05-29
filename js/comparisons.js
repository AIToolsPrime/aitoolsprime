(function () {
  'use strict';

  var LANG = window.LANG || 'en';
  var reviews = [];

  var $ = function (sel) { return document.querySelector(sel); };

  var themeToggle = $('#themeToggle');
  var navbar = $('#navbar');
  var scrollTop = $('#scrollTop');
  var container = $('#vsContainer');

  var CATEGORIES = {
    'music': { en: 'AI for Music', es: 'IA para Música', color: '#8b5cf6' },
    'writing': { en: 'AI Writing', es: 'Escritura IA', color: '#3b82f6' },
    'images': { en: 'AI Images', es: 'Imágenes IA', color: '#ec4899' },
    'video': { en: 'AI Video', es: 'Video IA', color: '#f97316' },
    'productivity': { en: 'AI Productivity', es: 'Productividad IA', color: '#10b981' },
    'audio': { en: 'AI Audio', es: 'Audio IA', color: '#06b6d4' },
    'coding': { en: 'AI Coding', es: 'Programación IA', color: '#f43f5e' },
    'marketing': { en: 'AI Marketing', es: 'Marketing IA', color: '#14b8a6' }
  };

  function loadTheme() {
    var saved = localStorage.getItem('ai-reviews-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      themeToggle.textContent = saved === 'dark' ? '🌙' : '☀️';
    } else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      themeToggle.textContent = prefersDark ? '🌙' : '☀️';
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('ai-reviews-theme', next);
  }

  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    scrollTop.classList.toggle('visible', window.scrollY > 400);
  }

  function starsHTML(rating) {
    var full = Math.floor(rating);
    var half = rating % 1 >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function priceLabel(price, type) {
    if (type === 'free') return LANG === 'en' ? 'Free' : 'Gratis';
    if (type === 'freemium') return (LANG === 'en' ? 'Free / ' : 'Gratis / ') + price;
    return price;
  }

  function priceTypeLabel(type) {
    if (type === 'free') return LANG === 'en' ? 'Free' : 'Gratuito';
    if (type === 'freemium') return LANG === 'en' ? 'Freemium' : 'Freemium';
    return LANG === 'en' ? 'Paid' : 'Pago';
  }

  var COMPARISONS = {
    'music': { en: 'AI Music Showdown', es: 'Duelo Musical IA' },
    'writing': { en: 'AI Writing Battle', es: 'Batalla de Escritura IA' },
    'images': { en: 'AI Image Face-Off', es: 'Duelo de Imágenes IA' },
    'video': { en: 'AI Video Clash', es: 'Choque de Video IA' },
    'productivity': { en: 'AI Productivity Showdown', es: 'Duelo de Productividad IA' },
    'audio': { en: 'AI Audio Showdown', es: 'Duelo de Audio IA' },
    'coding': { en: 'AI Coding Showdown', es: 'Duelo de Programación IA' },
    'marketing': { en: 'AI Marketing Showdown', es: 'Duelo de Marketing IA' }
  };

  function buildVsSection(slug, tools) {
    var a = tools[0], b = tools[1];
    var cat = CATEGORIES[slug];
    var catName = cat[LANG] || cat.en;
    var title = COMPARISONS[slug][LANG] || COMPARISONS[slug].en;

    var winner = a.rating > b.rating ? a : (b.rating > a.rating ? b : (a.pros.length >= b.pros.length ? a : b));

    function cardHTML(tool, rank) {
      var logoDomain = tool.logo || tool.id;
      return '<div class="vs-card" data-cat="' + slug + '">'
        + (winner && winner.id === tool.id ? '<span class="vs-winner">' + (LANG === 'en' ? 'Winner' : 'Ganador') + '</span>' : '')
        + '<div class="vs-card-top">'
        + '<div class="vs-logo"><img src="../images/logos/' + logoDomain + '.png" alt="' + tool.name + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><span class="vs-logo-fallback">' + tool.name.charAt(0).toUpperCase() + '</span></div>'
        + '<div class="vs-rank">#' + rank + ' ' + (LANG === 'en' ? 'Top Rated' : 'Mejor Calificado') + '</div>'
        + '<div class="vs-name">' + tool.name + '</div>'
        + '<div class="vs-rating">' + starsHTML(tool.rating) + ' ' + tool.rating + '</div>'
        + '</div>'
        + '<div class="vs-tagline">' + tool.tagline + '</div>'
        + '<div class="vs-price">' + priceLabel(tool.price, tool.price_type) + '</div>'
        + '<span class="vs-type">' + priceTypeLabel(tool.price_type) + '</span>'
        + '<div class="vs-table">'
        + '<div class="vs-table-row"><span class="label">' + (LANG === 'en' ? 'Category' : 'Categoría') + '</span><span class="value">' + catName + '</span></div>'
        + '<div class="vs-table-row"><span class="label">' + (LANG === 'en' ? 'Rating' : 'Puntuación') + '</span><span class="value">' + tool.rating + '/5</span></div>'
        + '<div class="vs-table-row"><span class="label">' + (LANG === 'en' ? 'Price' : 'Precio') + '</span><span class="value">' + priceLabel(tool.price, tool.price_type) + '</span></div>'
        + '</div>'
        + '<div class="vs-pros-cons">'
        + '<ul class="pc-list">' + tool.pros.slice(0, 3).map(function (p) { return '<li class="pc-pro">✓ ' + p + '</li>'; }).join('') + '</ul>'
        + '<ul class="pc-list">' + tool.cons.slice(0, 3).map(function (c) { return '<li class="pc-con">✗ ' + c + '</li>'; }).join('') + '</ul>'
        + '</div>'
        + '<a href="' + tool.url + '" class="vs-btn" target="_blank" rel="noopener">' + (LANG === 'en' ? 'Visit ' : 'Visitar ') + tool.name + '</a>'
        + '</div>';
    }

    return '<div class="vs-section">'
      + '<div class="vs-header">'
      + '<h2>' + title + '</h2>'
      + '<p>' + catName + ' — ' + (LANG === 'en' ? 'Comparing the top 2 tools' : 'Comparando las 2 mejores herramientas') + '</p>'
      + '</div>'
      + '<div class="vs-grid">'
      + cardHTML(a, 1)
      + '<div class="vs-divider"><span>VS</span></div>'
      + cardHTML(b, 2)
      + '</div>'
      + '</div>';
  }

  function render() {
    if (reviews.length === 0) {
      container.innerHTML = '<div class="section"><div class="no-results"><h3>' + (LANG === 'en' ? 'No reviews data found' : 'No se encontraron reseñas') + '</h3></div></div>';
      return;
    }

    // Group by category, sort by rating, pick top 2
    var grouped = {};
    reviews.forEach(function (r) {
      if (!grouped[r.category_slug]) grouped[r.category_slug] = [];
      grouped[r.category_slug].push(r);
    });

    var html = '';
    Object.keys(CATEGORIES).forEach(function (slug) {
      var tools = (grouped[slug] || []).slice().sort(function (a, b) { return b.rating - a.rating; });
      if (tools.length < 2) return;
      html += buildVsSection(slug, tools.slice(0, 2));
    });

    container.innerHTML = html;
  }

  function loadReviews() {
    var url = '../data/reviews-' + LANG + '.json?t=' + Date.now();
    fetch(url)
      .then(function (resp) {
        if (!resp.ok) throw new Error('Not found');
        return resp.json();
      })
      .then(function (data) {
        reviews = data;
        render();
      })
      .catch(function () {
        reviews = [];
        render();
      });
  }

  // Bootstrap
  loadTheme();
  handleScroll();

  themeToggle.addEventListener('click', toggleTheme);
  window.addEventListener('scroll', handleScroll);

  scrollTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  loadReviews();
  initCookieBanner();
})();

function initCookieBanner() {
  var consented = localStorage.getItem('aitoolsdash-cookies');
  if (consented) return;

  var lang = typeof LANG !== 'undefined' ? LANG : 'en';
  var text = lang === 'en'
    ? { msg: 'We use cookies to improve your experience and analyze site traffic.', accept: 'Accept All', reject: 'Reject All', link: 'Learn more', href: './privacy.html' }
    : { msg: 'Usamos cookies para mejorar tu experiencia y analizar el tráfico del sitio.', accept: 'Aceptar Todas', reject: 'Rechazar Todas', link: 'Más información', href: './privacidad.html' };

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = '<p>' + text.msg + ' <a href="' + text.href + '">' + text.link + '</a></p>'
    + '<div class="cookie-btns">'
    + '<button class="cookie-btn reject" id="cookie-reject">' + text.reject + '</button>'
    + '<button class="cookie-btn accept" id="cookie-accept">' + text.accept + '</button>'
    + '</div>';

  document.body.appendChild(banner);
  setTimeout(function () { banner.classList.add('show'); }, 100);

  document.getElementById('cookie-accept').addEventListener('click', function () {
    localStorage.setItem('aitoolsdash-cookies', 'accepted');
    banner.classList.remove('show');
    setTimeout(function () { banner.remove(); }, 300);
  });

  document.getElementById('cookie-reject').addEventListener('click', function () {
    localStorage.setItem('aitoolsdash-cookies', 'rejected');
    banner.classList.remove('show');
    setTimeout(function () { banner.remove(); }, 300);
  });
}
