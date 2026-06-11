document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".menu-toggle");
    var navigation = document.querySelector(".site-nav");

    if (menuButton && navigation) {
        menuButton.addEventListener("click", function () {
            var open = navigation.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll("[data-slider]").forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startSlider() {
            if (slides.length <= 1) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute("data-slide-dot")) || 0);
                startSlider();
            });
        });

        showSlide(0);
        startSlider();
    });

    document.querySelectorAll("[data-filters]").forEach(function (filters) {
        var panel = filters.closest(".filter-panel") || document;
        var cards = Array.prototype.slice.call(panel.querySelectorAll("[data-card]"));
        var search = filters.querySelector(".filter-search");
        var category = filters.querySelector(".filter-category");
        var type = filters.querySelector(".filter-type");
        var region = filters.querySelector(".filter-region");
        var year = filters.querySelector(".filter-year");
        var empty = panel.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(search ? search.value : "");
            var categoryValue = normalize(category ? category.value : "");
            var typeValue = normalize(type ? type.value : "");
            var regionValue = normalize(region ? region.value : "");
            var yearValue = normalize(year ? year.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (categoryValue && cardCategory !== categoryValue) {
                    matched = false;
                }
                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }
                if (regionValue && cardRegion !== regionValue) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [search, category, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });

    document.querySelectorAll("[data-player]").forEach(function (shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector(".play-button");
        var loaded = false;
        var hlsInstance = null;

        function loadVideo() {
            if (!video || loaded) {
                return;
            }

            var streamUrl = video.getAttribute("data-stream");
            if (!streamUrl) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            loaded = true;
        }

        function playVideo() {
            loadVideo();
            shell.classList.add("is-playing");
            if (video) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove("is-playing");
                }
            });
            video.addEventListener("ended", function () {
                shell.classList.remove("is-playing");
            });
        }
    });
});
