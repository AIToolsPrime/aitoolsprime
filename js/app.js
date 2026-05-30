(function () {
  'use strict';

  var LANG = window.LANG || 'en';
  var reviews = [];
  var filteredResults = [];

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return document.querySelectorAll(sel); };

  var navbar = $('#navbar');
  var searchInput = $('#searchInput');
  var searchBtn = $('#searchBtn');
  var categoryGrid = $('#categoryGrid');
  var reviewGrid = $('#reviewGrid');
  var resultsSection = $('#results');
  var resultsGrid = $('#resultsGrid');
  var resultsTitle = $('#resultsTitle');
  var resultsCount = $('#resultsCount');
  var filterCategory = $('#filterCategory');
  var filterRating = $('#filterRating');
  var filterPrice = $('#filterPrice');
  var themeToggle = $('#themeToggle');
  var scrollTop = $('#scrollTop');
  var viewAllReviews = $('#viewAllReviews');
  var clearSearch = $('#clearSearch');
  var navSearchLink = $('#navSearchLink');
  var heroCategories = $('#heroCategories');

  var CATEGORIES = {
    'music': { en: 'AI for Music', es: 'IA para Música' },
    'writing': { en: 'AI Writing', es: 'Escritura IA' },
    'images': { en: 'AI Images', es: 'Imágenes IA' },
    'video': { en: 'AI Video', es: 'Video IA' },
    'productivity': { en: 'AI Productivity', es: 'Productividad IA' },
    'audio': { en: 'AI Audio', es: 'Audio IA' },
    'coding': { en: 'AI Coding', es: 'Programación IA' },
    'marketing': { en: 'AI Marketing', es: 'Marketing IA' },
    'assistant': { en: 'AI Assistant', es: 'Asistente IA' }
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
    if (type === 'free') return 'Free';
    if (type === 'freemium') return 'Free / ' + price;
    return price;
  }

  function priceLabelES(price, type) {
    if (type === 'free') return 'Gratis';
    if (type === 'freemium') return 'Gratis / ' + price;
    return price;
  }

  function logoHTML(domain, name) {
    return '<div class="card-logo">'
      + '<img src="../images/logos/' + domain + '.png" alt="' + name + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
      + '<span class="card-logo-fallback">' + name.charAt(0).toUpperCase() + '</span>'
      + '</div>';
  }

  function logoModalHTML(domain, name) {
    return '<div class="modal-logo">'
      + '<img src="../images/logos/' + domain + '.png" alt="' + name + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
      + '<span class="modal-logo-fallback">' + name.charAt(0).toUpperCase() + '</span>'
      + '</div>';
  }

  function renderCategories(p, data) {
    var catMap = {};
    data.forEach(function (r) {
      var slug = r.category_slug;
      if (!catMap[slug]) catMap[slug] = 0;
      catMap[slug]++;
    });

    var totalTools = data.length;
    var allLabel = LANG === 'en' ? 'All Categories' : 'Todas las Categorías';
    var toolsLabel = LANG === 'en' ? 'tools' : 'herramientas';
    var allCard = '<div class="category-card" data-cat="all">'
      + '<div class="cat-inner">'
      + '<div class="name">' + allLabel + '</div>'
      + '<div class="count">' + totalTools + ' ' + toolsLabel + '</div>'
      + '</div></div>';

    categoryGrid.innerHTML = allCard + Object.keys(catMap).map(function (slug) {
      var cat = CATEGORIES[slug];
      if (!cat) return '';
      var name = cat[LANG] || cat.en;
      return '<div class="category-card" data-cat="' + slug + '">'
        + '<div class="cat-inner">'
        + '<div class="name">' + name + '</div>'
        + '<div class="count">' + catMap[slug] + ' ' + toolsLabel + '</div>'
        + '</div></div>';
    }).join('');

    categoryGrid.querySelectorAll('.category-card').forEach(function (el) {
      el.addEventListener('click', function () {
        filterCategory.value = this.dataset.cat;
        applyFilters();
        scrollToReviews();
      });
    });
  }

  function renderReviews(data) {
    if (!data || data.length === 0) {
      reviewGrid.innerHTML = '<div class="no-results"><h3>' + (LANG === 'en' ? 'No reviews found' : 'No se encontraron reseñas') + '</h3><p>' + (LANG === 'en' ? 'Try adjusting your filters' : 'Ajusta los filtros') + '</p></div>';
      return;
    }

    reviewGrid.innerHTML = data.map(function (r, i) {
      var catName = CATEGORIES[r.category_slug] ? CATEGORIES[r.category_slug][LANG] || CATEGORIES[r.category_slug].en : r.category_en;
      return '<div class="review-card" data-cat="' + r.category_slug + '" data-index="' + i + '">'
        + '<div class="card-image">'
        + logoHTML(r.logo, r.name)
        + '<span class="category-badge">' + catName + '</span>'
        + '<span class="rating-badge">' + starsHTML(r.rating) + ' ' + r.rating + '</span>'
        + '</div>'
        + '<div class="card-body">'
        + '<div class="tool-name">' + highlightMatch(r.name) + '</div>'
        + '<div class="tool-tagline">' + r.tagline + '</div>'
        + '<div class="excerpt">' + r.excerpt + '</div>'
        + '<div class="pros-cons">'
        + '<ul class="pros">' + r.pros.slice(0, 3).map(function (p) { return '<li>✓ ' + p + '</li>'; }).join('') + '</ul>'
        + '<ul class="cons">' + r.cons.slice(0, 3).map(function (c) { return '<li>✗ ' + c + '</li>'; }).join('') + '</ul>'
        + '</div>'
        + '<div class="meta">'
        + '<span class="price' + (r.price_type === 'free' ? ' free' : '') + '">' + (LANG === 'en' ? priceLabel(r.price, r.price_type) : priceLabelES(r.price, r.price_type)) + '</span>'
        + '<span class="read-more">' + (LANG === 'en' ? 'Read review' : 'Leer reseña') + '</span>'
        + '</div>'
        + '</div></div>';
    }).join('');

    reviewGrid.querySelectorAll('.review-card').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(this.dataset.index);
        openModal(data[idx]);
      });
    });
  }

  function renderResults(data) {
    if (!data || data.length === 0) {
      resultsGrid.innerHTML = '<div class="no-results"><h3>' + (LANG === 'en' ? 'No results found' : 'Sin resultados') + '</h3><p>' + (LANG === 'en' ? 'Try different search terms or filters' : 'Prueba otros términos o filtros') + '</p></div>';
      return;
    }

    resultsGrid.innerHTML = data.map(function (r, i) {
      var catName = CATEGORIES[r.category_slug] ? CATEGORIES[r.category_slug][LANG] || CATEGORIES[r.category_slug].en : r.category_en;
      return '<div class="review-card" data-cat="' + r.category_slug + '" data-result-index="' + i + '">'
        + '<div class="card-image">'
        + logoHTML(r.logo, r.name)
        + '<span class="category-badge">' + catName + '</span>'
        + '<span class="rating-badge">' + starsHTML(r.rating) + ' ' + r.rating + '</span>'
        + '</div>'
        + '<div class="card-body">'
        + '<div class="tool-name">' + highlightMatch(r.name) + '</div>'
        + '<div class="tool-tagline">' + highlightMatch(r.tagline) + '</div>'
        + '<div class="excerpt">' + highlightMatch(r.excerpt) + '</div>'
        + '<div class="meta">'
        + '<span class="price' + (r.price_type === 'free' ? ' free' : '') + '">' + (LANG === 'en' ? priceLabel(r.price, r.price_type) : priceLabelES(r.price, r.price_type)) + '</span>'
        + '<span class="read-more">' + (LANG === 'en' ? 'Read review' : 'Leer reseña') + '</span>'
        + '</div>'
        + '</div></div>';
    }).join('');

    resultsGrid.querySelectorAll('.review-card').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(this.dataset.resultIndex);
        openModal(data[idx]);
      });
    });
  }

  var currentQuery = '';

  function highlightMatch(text) {
    if (!text || !currentQuery) return text || '';
    var words = currentQuery.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return text;
    var pattern = words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
    try {
      return text.replace(new RegExp('(' + pattern + ')', 'gi'), '<mark style="background:var(--accent-subtle);color:var(--accent);border-radius:2px;padding:0 2px">$1</mark>');
    } catch (e) {
      return text;
    }
  }

  function applyFilters() {
    var cat = filterCategory.value;
    var rating = parseFloat(filterRating.value);
    var price = filterPrice.value;

    var filtered = reviews.filter(function (r) {
      if (cat !== 'all' && r.category_slug !== cat) return false;
      if (!isNaN(rating) && r.rating < rating) return false;
      if (price !== 'all' && r.price_type !== price) return false;
      return true;
    });

    filteredResults = filtered;
    renderReviews(filtered);
  }

  function scrollToReviews() {
    var el = document.getElementById('reviews');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function doSearch(query) {
    currentQuery = query || '';
    var q = (query || '').trim().toLowerCase();
    var searchSection = document.getElementById('results');

    if (!q) {
      searchSection.style.display = 'none';
      return;
    }

    var results = reviews.filter(function (r) {
      var searchText = (r.name + ' ' + r.tagline + ' ' + r.excerpt + ' ' + (r.category || '') + ' ' + (r.category_slug || '') + ' ' + r.pros.join(' ') + ' ' + r.cons.join(' ')).toLowerCase();
      var words = q.split(/\s+/).filter(Boolean);
      return words.every(function (w) { return searchText.indexOf(w) !== -1; });
    });

    document.getElementById('hero').style.display = 'none';
    document.getElementById('categories').style.display = 'none';
    document.getElementById('reviews').style.display = 'none';
    var catLink = document.querySelector('.nav-links a[href="#categories"]');
    if (catLink) { catLink.textContent = LANG === 'en' ? 'Home' : 'Inicio'; catLink.href = './'; }
    searchSection.style.display = 'block';
    resultsTitle.textContent = LANG === 'en' ? 'Results for "' + query + '"' : 'Resultados para "' + query + '"';
    resultsCount.textContent = results.length + (LANG === 'en' ? ' tools found' : ' herramientas encontradas');
    renderResults(results);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openModal(r) {
    if (!r) return;
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    var priceTxt = (LANG === 'en' ? priceLabel(r.price, r.price_type) : priceLabelES(r.price, r.price_type));
    var catName = CATEGORIES[r.category_slug] ? CATEGORIES[r.category_slug][LANG] || CATEGORIES[r.category_slug].en : r.category_en;

    overlay.innerHTML = '<div class="modal-content">'
      + '<button class="modal-close">✕</button>'
      + '<div class="modal-header">'
      + logoModalHTML(r.logo, r.name)
      + '<div class="modal-header-right">'
      + '<span class="modal-category" data-cat="' + r.category_slug + '">' + catName + '</span>'
      + '<span class="modal-rating">' + starsHTML(r.rating) + ' ' + r.rating + '</span>'
      + '</div>'
      + '</div>'
      + '<h2 class="modal-title">' + r.name + '</h2>'
      + '<p class="modal-tagline">' + r.tagline + '</p>'
      + '<div class="modal-price">' + priceTxt + '</div>'
      + '<p class="modal-desc">' + r.excerpt + '</p>'
      + '<div class="pros-cons">'
      + '<ul class="pros">' + r.pros.map(function (p) { return '<li>✓ ' + p + '</li>'; }).join('') + '</ul>'
      + '<ul class="cons">' + r.cons.map(function (c) { return '<li>✗ ' + c + '</li>'; }).join('') + '</ul>'
      + '</div>'
      + '<a href="' + r.url + '" class="modal-btn" target="_blank" rel="noopener">' + (LANG === 'en' ? 'Visit Website' : 'Visitar Sitio') + '</a>'
      + '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    setTimeout(function () { overlay.classList.add('active'); }, 10);

    overlay.querySelector('.modal-close').addEventListener('click', function () { closeModal(overlay); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(overlay); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { closeModal(overlay); document.removeEventListener('keydown', esc); }
    });
  }

  function closeModal(overlay) {
    overlay.classList.remove('active');
    setTimeout(function () {
      overlay.remove();
      document.body.style.overflow = '';
    }, 200);
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
        init();
      })
      .catch(function () {
        reviews = [];
        init();
      });
  }

  function initFilters() {
    filterCategory.innerHTML = '<option value="all">' + (LANG === 'en' ? 'All Categories' : 'Todas las Categorías') + '</option>';
    Object.keys(CATEGORIES).forEach(function (slug) {
      var opt = document.createElement('option');
      opt.value = slug;
      opt.textContent = CATEGORIES[slug][LANG] || CATEGORIES[slug].en;
      filterCategory.appendChild(opt);
    });
  }

  function init() {
    if (reviews.length === 0) return;

    initFilters();
    renderCategories(LANG, reviews);

    var sorted = reviews.slice().sort(function (a, b) {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.date) - new Date(a.date);
    });
    filteredResults = sorted;
    renderReviews(sorted);

    themeToggle.addEventListener('click', toggleTheme);

    searchBtn.addEventListener('click', function () {
      doSearch(searchInput.value.trim());
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        doSearch(searchInput.value.trim());
      }
    });

    if (clearSearch) {
      clearSearch.addEventListener('click', function (e) {
        e.preventDefault();
        searchInput.value = '';
        resultsSection.style.display = 'none';
        document.getElementById('hero').style.display = '';
        document.getElementById('categories').style.display = '';
        document.getElementById('reviews').style.display = '';
        var catLink = document.querySelector('.nav-links a[href="#categories"]');
        if (catLink) { catLink.textContent = LANG === 'en' ? 'Categories' : 'Categorías'; catLink.href = '#categories'; }
        var sorted = reviews.slice().sort(function (a, b) {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.date) - new Date(a.date);
        });
        renderReviews(sorted);
        scrollToReviews();
      });
    }

    if (viewAllReviews) {
      viewAllReviews.addEventListener('click', function (e) {
        e.preventDefault();
        scrollToReviews();
      });
    }

    if (navSearchLink) {
      navSearchLink.addEventListener('click', function (e) {
        e.preventDefault();
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth' });
      });
    }

    filterCategory.addEventListener('change', applyFilters);
    filterRating.addEventListener('change', applyFilters);
    filterPrice.addEventListener('change', applyFilters);

    scrollTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', handleScroll);

    if (heroCategories) {
      heroCategories.addEventListener('click', function (e) {
        var cat = e.target.dataset.cat;
        if (cat) {
          filterCategory.value = cat;
          applyFilters();
          scrollToReviews();
        }
      });
    }

    if (window.location.hash === '#reviews') {
      var hero = document.getElementById('hero');
      var cats = document.getElementById('categories');
      if (hero) hero.style.display = 'none';
      if (cats) cats.style.display = 'none';
      var catLink = document.querySelector('.nav-links a[href="#categories"]');
      if (catLink) { catLink.textContent = 'Home'; catLink.href = './'; }
      scrollToReviews();
      window.scrollTo({ top: 0 });
      history.replaceState(null, '', window.location.pathname);
    }
  }

  loadTheme();
  handleScroll();
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
