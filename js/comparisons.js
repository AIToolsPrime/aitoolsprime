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
  var stored = localStorage.getItem('aitoolsdash-cookies');
  if (stored) return;

  var lang = typeof LANG !== 'undefined' ? LANG : 'en';
  var texts = {
    en: {
      msg: 'We use cookies to improve your experience and analyze site traffic.',
      accept: 'Accept All', reject: 'Reject All', prefs: 'Preferences',
      link: 'Learn more', href: './privacy.html', title: 'Cookie Preferences',
      essential: 'Essential cookies', essentialDesc: 'Required for basic site functionality',
      analytics: 'Analytics cookies', analyticsDesc: 'Help us understand how visitors use our site',
      preferences: 'Preference cookies', preferencesDesc: 'Remember your settings (like dark/light mode)',
      save: 'Save Preferences', cancel: 'Cancel'
    },
    es: {
      msg: 'Usamos cookies para mejorar tu experiencia y analizar el tráfico del sitio.',
      accept: 'Aceptar Todas', reject: 'Rechazar Todas', prefs: 'Preferencias',
      link: 'Más información', href: './privacidad.html', title: 'Preferencias de Cookies',
      essential: 'Cookies esenciales', essentialDesc: 'Necesarias para el funcionamiento básico del sitio',
      analytics: 'Cookies analíticas', analyticsDesc: 'Nos ayudan a entender cómo los visitantes usan el sitio',
      preferences: 'Cookies de preferencias', preferencesDesc: 'Recuerdan tus ajustes (como modo oscuro/claro)',
      save: 'Guardar Preferencias', cancel: 'Cancelar'
    }
  };
  var t = texts[lang] || texts.en;

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = '<p>' + t.msg + ' <a href="' + t.href + '">' + t.link + '</a></p>'
    + '<div class="cookie-btns">'
    + '<button class="cookie-btn prefs" id="cookie-prefs">' + t.prefs + '</button>'
    + '<button class="cookie-btn reject" id="cookie-reject">' + t.reject + '</button>'
    + '<button class="cookie-btn accept" id="cookie-accept">' + t.accept + '</button>'
    + '</div>';

  document.body.appendChild(banner);
  setTimeout(function () { banner.classList.add('show'); }, 100);

  function saveAndDismiss(prefs) {
    localStorage.setItem('aitoolsdash-cookies', JSON.stringify(prefs));
    banner.classList.remove('show');
    setTimeout(function () { banner.remove(); }, 300);
  }

  document.getElementById('cookie-accept').addEventListener('click', function () {
    saveAndDismiss({ essential: true, analytics: true, preferences: true });
  });
  document.getElementById('cookie-reject').addEventListener('click', function () {
    saveAndDismiss({ essential: true, analytics: false, preferences: false });
  });
  document.getElementById('cookie-prefs').addEventListener('click', function () {
    showPrefsModal(t, saveAndDismiss);
  });
}

function showPrefsModal(t, saveAndDismiss) {
  var overlay = document.createElement('div');
  overlay.className = 'cookie-modal-overlay';
  overlay.innerHTML = '<div class="cookie-modal">'
    + '<h3>' + t.title + '</h3>'
    + '<div class="cookie-option"><div class="cookie-option-info"><strong>' + t.essential + '</strong><span>' + t.essentialDesc + '</span></div><label class="cookie-toggle disabled"><input type="checkbox" checked disabled><span class="slider"></span></label></div>'
    + '<div class="cookie-option"><div class="cookie-option-info"><strong>' + t.analytics + '</strong><span>' + t.analyticsDesc + '</span></div><label class="cookie-toggle"><input type="checkbox" id="ck-analytics" checked><span class="slider"></span></label></div>'
    + '<div class="cookie-option"><div class="cookie-option-info"><strong>' + t.preferences + '</strong><span>' + t.preferencesDesc + '</span></div><label class="cookie-toggle"><input type="checkbox" id="ck-preferences" checked><span class="slider"></span></label></div>'
    + '<div class="cookie-modal-btns">'
    + '<button class="cookie-modal-btn secondary" id="ck-cancel">' + t.cancel + '</button>'
    + '<button class="cookie-modal-btn primary" id="ck-save">' + t.save + '</button>'
    + '</div></div>';

  document.body.appendChild(overlay);
  setTimeout(function () { overlay.classList.add('active'); }, 10);

  document.getElementById('ck-cancel').addEventListener('click', function () {
    overlay.classList.remove('active');
    setTimeout(function () { overlay.remove(); }, 200);
  });
  document.getElementById('ck-save').addEventListener('click', function () {
    saveAndDismiss({ essential: true, analytics: document.getElementById('ck-analytics').checked, preferences: document.getElementById('ck-preferences').checked });
    overlay.classList.remove('active');
    setTimeout(function () { overlay.remove(); }, 200);
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      setTimeout(function () { overlay.remove(); }, 200);
    }
  });
}
