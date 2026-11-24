/**
 * RC Techno Solutions — Enterprise Typewriter Animation Engine
 * Smooth, accessible, layout-shift-free typewriter effect for headings and accents.
 * 
 * Features:
 * - Zero flash of unstyled/blank content: preserves initial text on page load
 * - Smooth cadence: 65ms typing, 35ms erasing, 2200ms reading pause
 * - Accessible: respects prefers-reduced-motion
 * - Auto-initializes on [data-typewriter] elements
 */

(function () {
    'use strict';

    // Inject minimal, non-disruptive cursor styling
    if (!document.getElementById('rc-typewriter-css')) {
        var style = document.createElement('style');
        style.id = 'rc-typewriter-css';
        style.textContent = [
            '.rc-tw-cursor {',
            '    display: inline;',
            '    font-weight: 300;',
            '    color: #0084ff;',
            '    animation: rcTwBlink 0.75s step-end infinite;',
            '    margin-left: 2px;',
            '    user-select: none;',
            '    vertical-align: baseline;',
            '}',
            '@keyframes rcTwBlink {',
            '    from, to { opacity: 1; }',
            '    50% { opacity: 0; }',
            '}',
            '[data-typewriter] {',
            '    display: inline;',
            '    transition: color 0.2s ease;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function RCTypewriter(element, phrases, options) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (!element || !phrases || !phrases.length) return;
        if (element._rcTypewriter) return; // prevent duplicate instances

        var self = this;
        self.el = element;
        self.phrases = phrases;
        self.opts = {
            typeSpeed: (options && options.typeSpeed) || 65,
            eraseSpeed: (options && options.eraseSpeed) || 32,
            pauseTime: (options && options.pauseTime) || 2200,
            loop: (options && options.loop !== undefined) ? options.loop : true,
            cursor: (options && options.cursor !== undefined) ? options.cursor : true
        };
        self._timers = [];
        self._destroyed = false;
        self._phraseIndex = 0;

        element._rcTypewriter = self;

        // Respect prefers-reduced-motion
        var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            element.textContent = phrases[0];
            return;
        }

        // Attach cursor directly after element
        if (self.opts.cursor) {
            self._cursorEl = document.createElement('span');
            self._cursorEl.className = 'rc-tw-cursor';
            self._cursorEl.textContent = '|';
            self._cursorEl.setAttribute('aria-hidden', 'true');
            if (element.nextSibling) {
                element.parentNode.insertBefore(self._cursorEl, element.nextSibling);
            } else {
                element.parentNode.appendChild(self._cursorEl);
            }
        }

        // Keep initial text visible on screen for initial reading pause
        var initialText = element.textContent.trim();
        var matchIdx = phrases.indexOf(initialText);
        if (matchIdx !== -1) {
            self._phraseIndex = matchIdx;
            self._charIndex = initialText.length;
        } else {
            element.textContent = phrases[0];
            self._phraseIndex = 0;
            self._charIndex = phrases[0].length;
        }

        // Wait initial reading pause before first erase
        self._setTimeout(function () {
            self._erase();
        }, self.opts.pauseTime);
    }

    RCTypewriter.prototype._setTimeout = function (fn, delay) {
        var self = this;
        var id = setTimeout(function () {
            if (!self._destroyed) fn.call(self);
        }, delay);
        self._timers.push(id);
        return id;
    };

    RCTypewriter.prototype._type = function () {
        var self = this;
        if (self._destroyed) return;
        var phrase = self.phrases[self._phraseIndex];

        if (self._charIndex <= phrase.length) {
            self.el.textContent = phrase.substring(0, self._charIndex);
            self._charIndex++;
            self._setTimeout(function () { self._type(); }, self.opts.typeSpeed);
        } else {
            // Full phrase typed: pause for reading
            self._setTimeout(function () { self._erase(); }, self.opts.pauseTime);
        }
    };

    RCTypewriter.prototype._erase = function () {
        var self = this;
        if (self._destroyed) return;
        var phrase = self.phrases[self._phraseIndex];

        if (self._charIndex > 0) {
            self._charIndex--;
            self.el.textContent = phrase.substring(0, self._charIndex);
            self._setTimeout(function () { self._erase(); }, self.opts.eraseSpeed);
        } else {
            // Reached empty: move to next phrase
            self._phraseIndex = (self._phraseIndex + 1) % self.phrases.length;
            if (!self.opts.loop && self._phraseIndex === 0) {
                self.el.textContent = self.phrases[0];
                return;
            }
            // Small pause before typing next word
            self._setTimeout(function () {
                self._type();
            }, 300);
        }
    };

    RCTypewriter.prototype.destroy = function () {
        this._destroyed = true;
        for (var i = 0; i < this._timers.length; i++) clearTimeout(this._timers[i]);
        this._timers = [];
        if (this._cursorEl && this._cursorEl.parentNode) {
            this._cursorEl.parentNode.removeChild(this._cursorEl);
        }
        if (this.el) this.el._rcTypewriter = null;
    };

    // Auto-initialize from data attributes
    function autoInit() {
        var elements = document.querySelectorAll('[data-typewriter]');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (el._rcTypewriter) continue;
            try {
                var phrases = JSON.parse(el.getAttribute('data-typewriter'));
                var speed = parseInt(el.getAttribute('data-typewriter-speed'), 10) || 65;
                var eraseSpeed = parseInt(el.getAttribute('data-typewriter-erase'), 10) || 32;
                var pause = parseInt(el.getAttribute('data-typewriter-pause'), 10) || 2200;
                new RCTypewriter(el, phrases, {
                    typeSpeed: speed,
                    eraseSpeed: eraseSpeed,
                    pauseTime: pause
                });
            } catch (e) {
                // Silently ignore malformed attributes
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // Expose globally
    window.RCTypewriter = RCTypewriter;
})();
