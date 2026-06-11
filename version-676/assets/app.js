(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var type = document.querySelector("[data-filter-type]");
    var region = document.querySelector("[data-filter-region]");
    var year = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".video-card"));
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }
    function apply() {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre")
        ].join(" "));
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (typeValue && normalize(card.getAttribute("data-type")).indexOf(typeValue) === -1) {
          ok = false;
        }
        if (regionValue && normalize(card.getAttribute("data-region")).indexOf(regionValue) === -1) {
          ok = false;
        }
        if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      document.body.classList.toggle("has-no-results", visible === 0);
    }
    [input, type, region, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initPlayer() {
    var panel = document.querySelector("[data-player]");
    if (!panel) {
      return;
    }
    var video = panel.querySelector("video");
    var overlay = panel.querySelector(".play-overlay");
    if (!video || !overlay) {
      return;
    }
    var source = video.getAttribute("data-hls");
    var hls = null;
    function begin() {
      if (!source) {
        return;
      }
      if (video.getAttribute("data-ready") !== "true") {
        video.setAttribute("data-ready", "true");
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
        }
      }
      overlay.classList.add("is-hidden");
      window.setTimeout(function () {
        video.play().catch(function () {});
      }, 120);
    }
    overlay.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (video.getAttribute("data-ready") !== "true") {
        begin();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
