function initMoviePlayer(videoUrl) {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('.player-cover');
    var button = document.getElementById('player-start');
    var attached = false;
    var hlsInstance = null;

    if (!video || !videoUrl) {
        return;
    }

    function attachMedia() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = videoUrl;
    }

    function startPlayback() {
        attachMedia();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    if (button) {
        button.addEventListener('click', startPlayback);
    }

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (!attached) {
            startPlayback();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
