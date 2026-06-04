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

    // Dynamically get the base URL from the script source
    var scriptUrl = new URL(script.src);
    var baseUrl = scriptUrl.origin;

    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.src = baseUrl + '/widget?apiKey=' + encodeURIComponent(apiKey);
    iframe.id  = 'bee-chat-widget-iframe';

    var isOpen = false;
    var widgetPos = 'right';
    var widgetX = '20px';
    var widgetY = '20px';

    // ── Styles: start as just the bubble size ──────────────────────────
    iframe.style.position        = 'fixed';
    iframe.style.bottom          = widgetY;
    iframe.style.right           = widgetX;
    iframe.style.border          = 'none';
    iframe.style.zIndex          = '2147483647';
    iframe.style.colorScheme     = 'light';
    iframe.style.background      = 'transparent';
    iframe.style.overflow        = 'hidden';
    iframe.style.transition      = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    iframe.setAttribute('allowTransparency', 'true');
    iframe.setAttribute('allow', 'autoplay');

    // Start small — only the bubble (95x95)
    iframe.style.width  = '95px';
    iframe.style.height = '95px';
    iframe.style.maxHeight = '95px';
    iframe.style.maxWidth = '95px';

    document.body.appendChild(iframe);

    function updateIframeStyles() {
        var isMobile = window.innerWidth < 480;
        if (isOpen) {
            iframe.style.width  = isMobile ? '100%' : '420px';
            iframe.style.height = isMobile ? '100%' : '720px';
            iframe.style.maxHeight = isMobile ? '100%' : 'calc(100vh - 40px)';
            iframe.style.maxWidth  = isMobile ? '100%' : 'calc(100vw - 40px)';
            if (isMobile) {
                iframe.style.bottom = '0';
                iframe.style.right  = '0';
                iframe.style.left   = '0';
                iframe.style.borderRadius = '0';
            } else {
                iframe.style.bottom = widgetY;
                if (widgetPos === 'left') {
                    iframe.style.left = widgetX;
                    iframe.style.right = 'auto';
                } else {
                    iframe.style.right = widgetX;
                    iframe.style.left = 'auto';
                }
                iframe.style.borderRadius = '';
            }
        } else {
            iframe.style.width  = '95px';
            iframe.style.height = '95px';
            iframe.style.maxHeight = '95px';
            iframe.style.maxWidth = '95px';
            iframe.style.bottom = widgetY;
            if (widgetPos === 'left') {
                iframe.style.left = widgetX;
                iframe.style.right = 'auto';
            } else {
                iframe.style.right = widgetX;
                iframe.style.left = 'auto';
            }
            iframe.style.borderRadius = '';
        }
    }

    // Handle screen resize dynamically when widget is open
    window.addEventListener('resize', function() {
        updateIframeStyles();
    });

    // ── Listen for postMessage from the widget ─────────────────────────
    window.addEventListener('message', function(e) {
        if (e.origin !== baseUrl) return;

        var data = e.data;
        if (!data || data.source !== 'bee-chat-widget') return;

        if (data.type === 'init_position') {
            widgetPos = data.position || 'right';
            widgetX = (data.offsetX !== undefined ? data.offsetX : 20) + 'px';
            widgetY = (data.offsetY !== undefined ? data.offsetY : 20) + 'px';
            updateIframeStyles();
        }

        if (data.type === 'open') {
            isOpen = true;
            updateIframeStyles();
        }

        if (data.type === 'close') {
            isOpen = false;
            updateIframeStyles();
        }
    });
})();
