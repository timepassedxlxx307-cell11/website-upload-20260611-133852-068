import { H as Hls } from './hls-vendor-dru42stk.js';

function initPlayer(playerBox) {
    var video = playerBox.querySelector('video');
    var startButton = playerBox.querySelector('[data-player-start]');
    var message = playerBox.querySelector('[data-player-message]');
    var source = playerBox.getAttribute('data-src');
    var hlsInstance = null;
    var initialized = false;

    function setMessage(text) {
        if (message) {
            message.textContent = text;
        }
    }

    function attachSource() {
        if (!video || !source || initialized) {
            return;
        }

        initialized = true;
        setMessage('正在加载播放源...');

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                setMessage('播放源已就绪。');
                video.play().catch(function () {
                    setMessage('播放源已加载，请再次点击视频播放。');
                });
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setMessage('网络加载异常，正在尝试恢复...');
                    hlsInstance.startLoad();
                    return;
                }
                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setMessage('媒体解码异常，正在尝试恢复...');
                    hlsInstance.recoverMediaError();
                    return;
                }
                setMessage('当前浏览器无法播放该视频源。');
                hlsInstance.destroy();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setMessage('播放源已就绪。');
                video.play().catch(function () {
                    setMessage('播放源已加载，请再次点击视频播放。');
                });
            }, { once: true });
        } else {
            setMessage('当前浏览器不支持 HLS 播放。');
        }
    }

    if (startButton) {
        startButton.addEventListener('click', function () {
            startButton.classList.add('hidden');
            attachSource();
        });
    }

    if (video) {
        video.addEventListener('play', attachSource, { once: true });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.querySelectorAll('[data-player]').forEach(initPlayer);
