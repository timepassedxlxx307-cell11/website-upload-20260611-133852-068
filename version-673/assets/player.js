(function () {
  document.querySelectorAll('.movie-player').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var button = player.querySelector('.player-start');
    if (!video || !cover || !button) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var active = false;
    var start = function () {
      if (active || !stream) {
        return;
      }
      active = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.controls = true;
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          active = false;
          player.classList.remove('is-playing');
        });
      }
    };
    cover.addEventListener('click', start);
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });
    cover.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        start();
      }
    });
    video.addEventListener('click', function () {
      if (!active) {
        start();
      }
    });
  });
})();
