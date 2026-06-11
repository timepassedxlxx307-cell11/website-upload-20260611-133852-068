document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("is-missing");
            image.removeAttribute("src");
        });
    });

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function activateSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activateSlide(index);
            });
        });

        window.setInterval(function () {
            activateSlide(current + 1);
        }, 5200);
    }

    var filterPanel = document.querySelector("[data-filter-panel]");

    if (filterPanel) {
        var input = filterPanel.querySelector("[data-filter-input]");
        var sortSelect = filterPanel.querySelector("[data-sort-select]");
        var grid = document.querySelector("[data-movie-grid]");
        var emptyState = document.querySelector("[data-empty-state]");
        var originalCards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]")) : [];

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function cardText(card) {
            return [
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags
            ].join(" ").toLowerCase();
        }

        function applyFilter() {
            if (!grid) {
                return;
            }

            var keyword = normalize(input ? input.value : "");
            var sortValue = sortSelect ? sortSelect.value : "year-desc";
            var cards = originalCards.slice();

            cards.sort(function (a, b) {
                if (sortValue === "views-desc") {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                }

                if (sortValue === "title-asc") {
                    return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
                }

                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });

            var visibleCount = 0;
            var fragment = document.createDocumentFragment();

            cards.forEach(function (card) {
                var matched = !keyword || cardText(card).indexOf(keyword) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visibleCount += 1;
                }
                fragment.appendChild(card);
            });

            grid.appendChild(fragment);

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        if (sortSelect) {
            sortSelect.addEventListener("change", applyFilter);
        }

        applyFilter();
    }

    var player = document.querySelector("[data-player]");
    var playTrigger = document.querySelector("[data-play-trigger]");

    if (player && playTrigger) {
        var hlsInstance = null;
        var attached = false;
        var source = player.getAttribute("data-src");

        function hideOverlay() {
            playTrigger.classList.add("is-hidden");
        }

        function playVideo() {
            var promise = player.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function attachAndPlay() {
            hideOverlay();

            if (!source) {
                playVideo();
                return;
            }

            if (attached) {
                playVideo();
                return;
            }

            if (player.canPlayType("application/vnd.apple.mpegurl")) {
                player.src = source;
                attached = true;
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(player);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                attached = true;
                return;
            }

            player.src = source;
            attached = true;
            playVideo();
        }

        playTrigger.addEventListener("click", attachAndPlay);

        player.addEventListener("click", function () {
            if (player.paused) {
                attachAndPlay();
            }
        });

        player.addEventListener("play", hideOverlay);

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    var searchInput = document.getElementById("searchInput");
    var searchButton = document.getElementById("searchButton");
    var searchResults = document.getElementById("searchResults");
    var searchSummary = document.getElementById("searchSummary");

    if (searchInput && searchResults && window.MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get("q") || "";
        searchInput.value = initialKeyword;

        function createResultCard(movie) {
            var card = document.createElement("a");
            card.className = "movie-card";
            card.href = "detail/" + movie.id + ".html";
            card.innerHTML = [
                "<div class="poster-frame">",
                "<img src="" + movie.cover + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">",
                "<span class="poster-year">" + escapeHtml(movie.year) + "</span>",
                "<span class="poster-play">▶</span>",
                "</div>",
                "<div class="movie-card-body">",
                "<div class="movie-meta-row"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
                "<h3>" + escapeHtml(movie.title) + "</h3>",
                "<p>" + escapeHtml(movie.one_line) + "</p>",
                "<div class="movie-card-foot"><span>" + escapeHtml(movie.year) + "</span><span>进入详情</span></div>",
                "</div>"
            ].join("");
            return card;
        }

        function escapeHtml(value) {
            return String(value || "").replace(/[&<>"']/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    """: "&quot;",
                    "'": "&#39;"
                }[char];
            });
        }

        function runSearch() {
            var keyword = searchInput.value.trim().toLowerCase();
            var results = window.MOVIES.filter(function (movie) {
                if (!keyword) {
                    return true;
                }

                return [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.one_line,
                    movie.category
                ].join(" ").toLowerCase().indexOf(keyword) !== -1;
            }).sort(function (a, b) {
                return Number(b.year_num || 0) - Number(a.year_num || 0);
            }).slice(0, 120);

            searchResults.innerHTML = "";

            results.forEach(function (movie) {
                searchResults.appendChild(createResultCard(movie));
            });

            if (searchSummary) {
                searchSummary.textContent = keyword ? "找到 " + results.length + " 条相关结果" : "展示最新推荐影片，可输入关键词继续筛选";
            }

            searchResults.querySelectorAll("img").forEach(function (image) {
                image.addEventListener("error", function () {
                    image.classList.add("is-missing");
                    image.removeAttribute("src");
                });
            });
        }

        if (searchButton) {
            searchButton.addEventListener("click", runSearch);
        }

        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                runSearch();
            }
        });

        runSearch();
    }
});
