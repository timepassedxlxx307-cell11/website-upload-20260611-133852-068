(function () {
  var toggle = document.querySelector('.mobile-menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });
    setInterval(function () {
      showSlide((current + 1) % slides.length);
    }, 5600);
  }

  document.querySelectorAll('[data-filter-page]').forEach(function (page) {
    var query = page.querySelector('#filterQuery');
    var type = page.querySelector('#filterType');
    var year = page.querySelector('#filterYear');
    var sort = page.querySelector('#sortSelect');
    var grid = page.querySelector('.filter-grid');
    var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));
    var run = function () {
      var q = query ? query.value.trim().toLowerCase() : '';
      var t = type ? type.value : '';
      var y = year ? year.value : '';
      var mode = sort ? sort.value : 'year';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-keywords') || '').toLowerCase();
        var matchQuery = !q || text.indexOf(q) !== -1;
        var matchType = !t || card.getAttribute('data-type') === t;
        var matchYear = !y || card.getAttribute('data-year') === y;
        card.style.display = matchQuery && matchType && matchYear ? '' : 'none';
      });
      var ordered = cards.slice().sort(function (a, b) {
        if (mode === 'views') {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        }
        if (mode === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });
      ordered.forEach(function (card) {
        grid.appendChild(card);
      });
    };
    [query, type, year, sort].forEach(function (control) {
      if (control) {
        control.addEventListener('input', run);
        control.addEventListener('change', run);
      }
    });
    run();
  });

  var searchInput = document.querySelector('#searchInput');
  var searchResults = document.querySelector('#searchResults');
  var searchSummary = document.querySelector('#searchSummary');
  if (searchInput && searchResults && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      searchInput.value = initial;
    }
    var cardHtml = function (movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card movie-card-grid">' +
        '<a class="poster-link" href="movies/' + movie.file + '">' +
        '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
        '<h3><a href="movies/' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '<div class="card-foot"><span>' + formatViews(movie.views) + '观看</span><a href="movies/' + movie.file + '">立即观看</a></div>' +
        '</div>' +
        '</article>';
    };
    var render = function () {
      var q = searchInput.value.trim().toLowerCase();
      var pool = window.MOVIE_SEARCH_INDEX;
      var result = q ? pool.filter(function (movie) {
        return movie.tokens.toLowerCase().indexOf(q) !== -1;
      }) : pool.slice().sort(function (a, b) {
        return b.views - a.views;
      }).slice(0, 24);
      searchResults.innerHTML = result.slice(0, 120).map(cardHtml).join('');
      searchSummary.textContent = q ? '搜索结果：' + result.length + ' 个相关内容' : '热门内容推荐';
    };
    searchInput.addEventListener('input', render);
    render();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatViews(value) {
    var number = Number(value) || 0;
    if (number >= 10000) {
      return (number / 10000).toFixed(1) + '万';
    }
    return String(number);
  }
})();
