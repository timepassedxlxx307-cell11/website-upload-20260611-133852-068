(function () {
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-page-input]');
    var resultsBox = document.querySelector('[data-search-results]');
    var meta = document.querySelector('[data-search-meta]');
    var index = window.MOVIE_SEARCH_INDEX || [];

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function renderCard(movie) {
        return '' +
            '<article class="movie-card">' +
                '<a class="poster" href="' + escapeHtml(movie.url) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'; this.parentElement.classList.add(\'cover-missing\');">' +
                    '<span class="play-dot">▶</span>' +
                '</a>' +
                '<div class="card-body">' +
                    '<div class="meta-line"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
                    '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                '</div>' +
            '</article>';
    }

    function runSearch(query) {
        var q = normalize(query).trim();
        if (input) {
            input.value = query;
        }
        if (!q) {
            resultsBox.innerHTML = '';
            meta.textContent = '请输入关键词开始搜索。';
            return;
        }

        var keywords = q.split(/\s+/).filter(Boolean);
        var matches = index.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' '));
            return keywords.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 120);

        meta.textContent = '找到 ' + matches.length + ' 条结果' + (matches.length === 120 ? '，已显示前 120 条。' : '。');
        resultsBox.innerHTML = matches.map(renderCard).join('');
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input ? input.value.trim() : '';
            var url = new URL(window.location.href);
            if (query) {
                url.searchParams.set('q', query);
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState({}, '', url.toString());
            runSearch(query);
        });
    }

    runSearch(getQuery());
}());
