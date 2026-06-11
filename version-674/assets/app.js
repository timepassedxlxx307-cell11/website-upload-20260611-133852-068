(function () {
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      searchPanel.classList.toggle('is-open');
      var input = searchPanel.querySelector('input');
      if (input && searchPanel.classList.contains('is-open')) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-index]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-index')) || 0);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(input) {
    var targetId = input.getAttribute('data-filter-target');
    var target = targetId ? document.getElementById(targetId) : null;
    if (!target) {
      return;
    }
    var keyword = normalize(input.value);
    var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region')
      ].join(' '));
      card.hidden = keyword && text.indexOf(keyword) === -1;
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.catalog-filter')).forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards(input);
    });
  });

  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    var query = new URLSearchParams(window.location.search).get('q') || '';
    if (query) {
      searchInput.value = query;
      filterCards(searchInput);
    }
    Array.prototype.slice.call(document.querySelectorAll('[data-quick-filter]')).forEach(function (button) {
      button.addEventListener('click', function () {
        searchInput.value = button.getAttribute('data-quick-filter') || '';
        filterCards(searchInput);
        searchInput.focus();
      });
    });
  }

  var video = document.getElementById('movie-video');
  var playButton = document.querySelector('[data-play-button]');
  var playbackUrl = window.__playbackUrl;

  if (video && playButton && playbackUrl) {
    var prepared = false;
    var hlsInstance = null;

    function prepareVideo() {
      if (prepared) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playbackUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(playbackUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playbackUrl;
      }
      prepared = true;
    }

    function startVideo() {
      prepareVideo();
      playButton.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    playButton.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
    video.addEventListener('play', function () {
      playButton.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }
})();
