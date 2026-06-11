(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var index = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }

            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === index);
            });
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                showSlide(position);
            });
        });

        showSlide(0);
        window.setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }

    function applyFilters(scope) {
        var keywordInput = scope.querySelector('[data-filter-keyword]');
        var typeSelect = scope.querySelector('[data-filter-type]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var categorySelect = scope.querySelector('[data-filter-category]');
        var cardRoot = scope.nextElementSibling;

        while (cardRoot && !cardRoot.matches('[data-card-list]')) {
            cardRoot = cardRoot.nextElementSibling;
        }

        if (!cardRoot) {
            cardRoot = document;
        }

        var cards = Array.prototype.slice.call(cardRoot.querySelectorAll('.movie-card, .rank-item'));
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var category = categorySelect ? categorySelect.value : '';

        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var matchKeyword = !keyword || haystack.indexOf(keyword) > -1 || title.indexOf(keyword) > -1;
            var matchType = !type || card.getAttribute('data-type') === type;
            var matchYear = !year || card.getAttribute('data-year') === year;
            var matchCategory = !category || card.getAttribute('data-category') === category;
            card.classList.toggle('is-hidden', !(matchKeyword && matchType && matchYear && matchCategory));
        });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var keywordInput = scope.querySelector('[data-filter-keyword]');
        var controls = scope.querySelectorAll('input, select');

        if (keywordInput && query) {
            keywordInput.value = query;
        }

        controls.forEach(function (control) {
            control.addEventListener('input', function () {
                applyFilters(scope);
            });
            control.addEventListener('change', function () {
                applyFilters(scope);
            });
        });

        applyFilters(scope);
    });
})();
