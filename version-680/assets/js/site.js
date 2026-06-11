(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
            menuButton.textContent = mobilePanel.classList.contains('open') ? '×' : '☰';
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
            }
        });
    });

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var input = filterPanel.querySelector('[data-filter-input]');
        var selects = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-select]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var count = filterPanel.querySelector('[data-filter-count]');

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function applyFilters() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matches = true;
                if (keyword && cardText(card).indexOf(keyword) === -1) {
                    matches = false;
                }
                selects.forEach(function (select) {
                    var field = select.getAttribute('data-filter-select');
                    var value = select.value;
                    if (value && card.getAttribute('data-' + field) !== value) {
                        matches = false;
                    }
                });
                card.classList.toggle('hidden-card', !matches);
                if (matches) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });
    }

    document.querySelectorAll('[data-copy-link]').forEach(function (button) {
        button.addEventListener('click', function () {
            var url = window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(function () {
                    button.textContent = '已复制';
                });
            } else {
                window.prompt('复制链接', url);
            }
        });
    });
}());
