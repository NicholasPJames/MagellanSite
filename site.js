/* ── Magellan shared behaviour ──────────────────────────────────────────
   Injects the floating light/dark theme button and wires up its state.
   Theme is applied early by a small inline script in each page's <head>
   to avoid a flash; this file handles toggling and persistence.       */
(function () {
    'use strict';

    var THEME_KEY = 'magellan-theme';

    // ── Icons ──
    var ICONS = {
        sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="7" y2="7"/><line x1="17" y1="17" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="7" y2="17"/><line x1="17" y1="7" x2="19.1" y2="4.9"/></svg>',
        moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
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
        // Show the icon of the mode you'd switch TO.
        btn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
        var label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        btn.setAttribute('aria-label', label);
        btn.title = label;
    }

    function init() {
        // Keep other open tabs in sync when the theme changes in one of them.
        window.addEventListener('storage', function (e) {
            if (e.key === THEME_KEY && e.newValue) {
                document.documentElement.setAttribute('data-theme', e.newValue);
            }
        });

        var themeBtn = makeButton('themeControl', 'Toggle color theme');
        applyTheme(currentTheme(), themeBtn);
        themeBtn.addEventListener('click', function () {
            applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', themeBtn);
        });

        document.body.appendChild(themeBtn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
