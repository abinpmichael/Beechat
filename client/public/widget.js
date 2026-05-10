(function() {
    var script = document.currentScript || (function() {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    var apiKey = script.getAttribute('data-api-key');

    if (!apiKey) {
        console.warn('[BeeChat] No data-api-key attribute found on script tag.');
        return;
    }

    var baseUrl = 'http://localhost:5173'; // Change to production URL when deploying

    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.src = baseUrl + '/widget?apiKey=' + encodeURIComponent(apiKey);
    iframe.id  = 'bee-chat-widget-iframe';

    // ── Styles: start as just the bubble size ──────────────────────────
    iframe.style.position        = 'fixed';
    iframe.style.bottom          = '10px';
    iframe.style.right           = '10px';
    iframe.style.border          = 'none';
    iframe.style.zIndex          = '2147483647';
    iframe.style.colorScheme     = 'light';
    iframe.style.background      = 'transparent';
    iframe.style.overflow        = 'hidden';
    iframe.style.transition      = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    iframe.setAttribute('allowTransparency', 'true');
    iframe.setAttribute('allow', 'autoplay');

    // Start small — only the bubble (100x100 to allow for shadows)
    iframe.style.width  = '100px';
    iframe.style.height = '100px';

    document.body.appendChild(iframe);

    // ── Listen for postMessage from the widget ─────────────────────────
    window.addEventListener('message', function(e) {
        if (e.origin !== baseUrl) return;

        var data = e.data;
        if (!data || data.source !== 'bee-chat-widget') return;

        if (data.type === 'open') {
            var isMobile = window.innerWidth < 480;
            iframe.style.width  = isMobile ? '100%' : '420px';
            iframe.style.height = isMobile ? '100%' : '700px';
            if (isMobile) {
                iframe.style.bottom = '0';
                iframe.style.right  = '0';
            }
        }

        if (data.type === 'close') {
            iframe.style.width  = '100px';
            iframe.style.height = '100px';
            iframe.style.bottom = '10px';
            iframe.style.right  = '10px';
        }
    });
})();
