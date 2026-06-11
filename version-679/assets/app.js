function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function setupMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    if (!toggle) {
        return;
    }
    toggle.addEventListener('click', function () {
        var open = document.body.classList.toggle('menu-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    selectAll('.mobile-link').forEach(function (link) {
        link.addEventListener('click', function () {
            document.body.classList.remove('menu-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

function setupHeroSlider() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    if (slides.length < 2) {
        return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }
    function start() {
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }
    function restart() {
        if (timer) {
            window.clearInterval(timer);
        }
        start();
    }
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
            show(index);
            restart();
        });
    });
    start();
}

function setupSearchAndFilters() {
    var input = document.getElementById('site-search');
    var chips = selectAll('.filter-chip');
    var cards = selectAll('.movie-card');
    if (!input && chips.length === 0) {
        return;
    }
    var activeFilter = 'all';
    function matchCard(card, query, filter) {
        var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
        ].join(' ').toLowerCase();
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var filterMatch = filter === 'all' || haystack.indexOf(filter.toLowerCase()) !== -1;
        return queryMatch && filterMatch;
    }
    function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
            card.classList.toggle('is-hidden-card', !matchCard(card, query, activeFilter));
        });
    }
    if (input) {
        input.addEventListener('input', apply);
    }
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            chips.forEach(function (item) {
                item.classList.remove('active');
            });
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-filter') || 'all';
            apply();
        });
    });
    apply();
}

function bindMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var mask = document.getElementById(options.maskId);
    var button = document.getElementById(options.buttonId);
    if (!video || !options.src) {
        return;
    }
    var ready = false;
    var hls = null;
    function load() {
        if (ready) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = options.src;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hls.loadSource(options.src);
            hls.attachMedia(video);
        } else {
            video.src = options.src;
        }
        ready = true;
    }
    function play() {
        load();
        if (mask) {
            mask.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (mask) {
                    mask.classList.remove('is-hidden');
                }
            });
        }
    }
    if (mask) {
        mask.addEventListener('click', play);
    }
    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            play();
        });
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        if (mask) {
            mask.classList.add('is-hidden');
        }
    });
    video.addEventListener('pause', function () {
        if (video.currentTime === 0 && mask) {
            mask.classList.remove('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupSearchAndFilters();
});
