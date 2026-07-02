/* ── Magellan shared behaviour ──────────────────────────────────────────
   Injects the floating audio + theme buttons and wires up their state.
   Theme is applied early by a small inline script in each page's <head>
   to avoid a flash; this file handles toggling and persistence.       */
(function () {
    'use strict';

    var THEME_KEY = 'magellan-theme';
    var AUDIO_KEY = 'magellan-audio';
    var POS_KEY = 'magellan-audio-pos';

    // ── Icons ──
    var ICONS = {
        sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="7" y2="7"/><line x1="17" y1="17" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="7" y2="17"/><line x1="17" y1="7" x2="19.1" y2="4.9"/></svg>',
        moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
        soundOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="4 9 8 9 13 5 13 19 8 15 4 15" fill="currentColor" stroke="none"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
        soundOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="4 9 8 9 13 5 13 19 8 15 4 15" fill="currentColor" stroke="none"/><line x1="17" y1="9" x2="22" y2="14"/><line x1="22" y1="9" x2="17" y2="14"/></svg>'
    };

    function makeButton(id, label) {
        var b = document.createElement('button');
        b.id = id;
        b.className = 'site-control';
        b.type = 'button';
        b.setAttribute('aria-label', label);
        b.title = label;
        return b;
    }

    // ── Theme ──
    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function applyTheme(theme, btn) {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
        // Push the change straight into the framed page. This works over
        // http/https AND file://, unlike storage events which don't fire
        // for local files.
        var frame = document.getElementById('viewFrame');
        if (frame && frame.contentWindow) {
            try { frame.contentWindow.postMessage({ type: 'magellan-theme', theme: theme }, '*'); } catch (e) {}
        }
        // Show the icon of the mode you'd switch TO.
        btn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
        var label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        btn.setAttribute('aria-label', label);
        btn.title = label;
    }

    // ── Audio ──
    function setupAudio(btn) {
        var audio = new Audio('music/ambient.m4a');
        audio.loop = true;
        // Preload so the track is cached and starts instantly, with no
        // download delay on the first click or on resume.
        audio.preload = 'auto';

        // Remember how far into the track we are, so the next page can pick
        // up where this one left off instead of restarting from zero.
        var savedPos = 0;
        try { savedPos = parseFloat(localStorage.getItem(POS_KEY)) || 0; } catch (e) {}

        function savePos() {
            try { localStorage.setItem(POS_KEY, String(audio.currentTime)); } catch (e) {}
        }

        // currentTime can only be set once the track length is known.
        audio.addEventListener('loadedmetadata', function () {
            if (savedPos > 0 && isFinite(audio.duration) && savedPos < audio.duration) {
                try { audio.currentTime = savedPos; } catch (e) {}
            }
        });

        var lastWrite = 0;
        audio.addEventListener('timeupdate', function () {
            var now = Date.now();
            if (now - lastWrite > 1000) { lastWrite = now; savePos(); }
        });
        // Capture the position right before the page unloads / is hidden.
        window.addEventListener('pagehide', savePos);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) savePos();
        });

        function setIcon(on) {
            btn.innerHTML = on ? ICONS.soundOn : ICONS.soundOff;
            var label = on ? 'Sound off' : 'Sound on';
            btn.setAttribute('aria-label', label);
            btn.title = label;
        }

        audio.addEventListener('play', function () { setIcon(true); });
        audio.addEventListener('pause', function () { setIcon(false); });

        function start() {
            return audio.play().then(function () {
                try { localStorage.setItem(AUDIO_KEY, 'on'); } catch (e) {}
            });
        }

        btn.addEventListener('click', function () {
            if (audio.paused) {
                start().catch(function () { setIcon(false); });
            } else {
                audio.pause();
                savePos();
                try { localStorage.setItem(AUDIO_KEY, 'off'); } catch (e) {}
            }
        });

        setIcon(false);

        // If music was playing when the visitor left the last page, resume it.
        // Browsers block auto-play on a fresh page until the visitor interacts,
        // so if the immediate attempt is blocked we retry on the first click or
        // keypress — making playback feel continuous across pages.
        var pref;
        try { pref = localStorage.getItem(AUDIO_KEY); } catch (e) {}
        if (pref === 'on') {
            start().catch(function () {
                var resumeOnce = function () {
                    start().catch(function () {});
                    document.removeEventListener('pointerdown', resumeOnce);
                    document.removeEventListener('keydown', resumeOnce);
                };
                document.addEventListener('pointerdown', resumeOnce);
                document.addEventListener('keydown', resumeOnce);
            });
        }
    }

    function init() {
        // Keep every same-origin document (the shell and the framed pages) in
        // sync when the theme changes in another one.
        window.addEventListener('storage', function (e) {
            if (e.key === THEME_KEY && e.newValue) {
                document.documentElement.setAttribute('data-theme', e.newValue);
            }
        });

        // The shell pushes theme changes to the framed page this way (works
        // even under file://, where storage events don't fire).
        window.addEventListener('message', function (e) {
            var d = e.data;
            if (d && d.type === 'magellan-theme' && (d.theme === 'dark' || d.theme === 'light')) {
                document.documentElement.setAttribute('data-theme', d.theme);
            }
        });

        // Inside the iframe shell, the outer frame owns the controls and the
        // audio (so it plays continuously across page changes). The framed
        // pages just render content and follow the theme.
        if (window.self !== window.top) return;

        var themeBtn = makeButton('themeControl', 'Toggle color theme');
        applyTheme(currentTheme(), themeBtn);
        themeBtn.addEventListener('click', function () {
            applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', themeBtn);
        });

        var audioBtn = makeButton('audioControl', 'Sound off');
        setupAudio(audioBtn);

        document.body.appendChild(audioBtn);
        document.body.appendChild(themeBtn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
