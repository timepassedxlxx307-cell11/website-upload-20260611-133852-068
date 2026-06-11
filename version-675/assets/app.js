(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero-carousel]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function initSearch() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-movie-grid]'));

    grids.forEach(function (grid) {
      var scope = grid.closest('[data-search-scope]') || document;
      var input = scope.querySelector('[data-search-input]');
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
      var empty = scope.querySelector('[data-empty-result]');
      var active = 'all';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;

        Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]')).forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || ''
          ].join(' ').toLowerCase();

          var matchText = !query || haystack.indexOf(query) !== -1;
          var matchFilter = active === 'all' || haystack.indexOf(active.toLowerCase()) !== -1;
          var showCard = matchText && matchFilter;

          card.style.display = showCard ? '' : 'none';

          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          active = button.getAttribute('data-filter') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });
    });
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlays = Array.prototype.slice.call(player.querySelectorAll('[data-play]'));

      if (!video) {
        return;
      }

      function attach(streamUrl, afterAttach) {
        if (!streamUrl) {
          return;
        }

        if (video.getAttribute('data-ready-stream') === streamUrl) {
          afterAttach();
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.setAttribute('data-ready-stream', streamUrl);
          afterAttach();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (video.hlsInstance) {
            video.hlsInstance.destroy();
          }

          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          video.hlsInstance = hls;
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.setAttribute('data-ready-stream', streamUrl);
            afterAttach();
          });
          hls.on(window.Hls.Events.ERROR, function () {
            video.setAttribute('data-ready-stream', streamUrl);
          });
          return;
        }

        video.src = streamUrl;
        video.setAttribute('data-ready-stream', streamUrl);
        afterAttach();
      }

      function playFrom(control) {
        var streamUrl = control.getAttribute('data-stream') || video.getAttribute('data-stream');

        attach(streamUrl, function () {
          player.classList.add('is-playing');
          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        });
      }

      overlays.forEach(function (overlay) {
        overlay.addEventListener('click', function () {
          playFrom(overlay);
        });
      });

      video.addEventListener('click', function () {
        if (!video.getAttribute('data-ready-stream')) {
          playFrom(video);
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();
