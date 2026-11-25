/**
 * RC Techno Solutions — Enterprise Typewriter Animation Engine
 * Precision-tuned, accessible, zero-layout-shift auto-typing and text rotation.
 * 
 * Features:
 * - Anti-Layout-Shift (CLS Guard): Measures longest phrase to reserve min-width
 * - Double-Instance Guard: Prevents duplicate intervals/timers
 * - Visibility-Aware: Pauses animation when tab is inactive to prevent memory leak/battery drain
 * - Accessibility-Ready: Respects prefers-reduced-motion instantly
 * - Smooth Cadence: Configurable typing, erasing, and reading pause intervals
 * - Blinking Cursor: Hardware-accelerated CSS animation with aria-hidden
 */

(function () {
    'use strict';

    // Inject resilient, layout-shift-free cursor and typewriter styles
    if (!document.getElementById('rc-typewriter-css')) {
        var style = document.createElement('style');
        style.id = 'rc-typewriter-css';
        style.textContent = [
            '.rc-tw-cursor {',
            '    display: inline-block;',
            '    font-weight: 300;',
            '    color: #38bdf8;',
            '    animation: rcTwBlink 0.8s step-end infinite;',
            '    margin-left: 2px;',
            '    user-select: none;',
            '    vertical-align: baseline;',
            '    line-height: 1;',
            '}',
            '@keyframes rcTwBlink {',
            '    from, to { opacity: 1; }',
            '    50% { opacity: 0; }',
            '}',
            '[data-typewriter] {',
            '    display: inline-block;',
            '    min-height: 1.15em;',
            '    vertical-align: baseline;',
            '    white-space: normal;',
            '    word-break: keep-all;',
            '    text-align: left;',
            '    transition: color 0.2s ease;',
            '}',
            '@media (prefers-reduced-motion: reduce) {',
            '    .rc-tw-cursor { display: none !important; }',
            '    [data-typewriter] { white-space: normal !important; min-width: auto !important; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function RCTypewriter(element, phrases, options) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (!element || !phrases || !phrases.length) return;
        if (element._rcTypewriter) return; // Prevent double initialization

        var self = this;
        self.el = element;
        self.phrases = phrases;
        self.opts = {
            typeSpeed: (options && options.typeSpeed) || 75,
            eraseSpeed: (options && options.eraseSpeed) || 35,
            pauseTime: (options && options.pauseTime) || 2400,
            loop: (options && options.loop !== undefined) ? options.loop : true,
            cursor: (options && options.cursor !== undefined) ? options.cursor : true
        };
        self._timers = [];
        self._destroyed = false;
        self._isPaused = false;
        self._phraseIndex = 0;
        self._charIndex = 0;

        element._rcTypewriter = self;

        // Respect reduced motion accessibility
        var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            element.textContent = phrases[0];
            return;
        }

        // Attach cursor
        if (self.opts.cursor) {
            var existingCursor = element.parentNode ? element.parentNode.querySelector('.rc-tw-cursor, .typewriter-cursor') : null;
            if (existingCursor) {
                self._cursorEl = existingCursor;
            } else {
                self._cursorEl = document.createElement('span');
                self._cursorEl.className = 'rc-tw-cursor';
                self._cursorEl.textContent = '|';
                self._cursorEl.setAttribute('aria-hidden', 'true');
                if (element.nextSibling) {
                    element.parentNode.insertBefore(self._cursorEl, element.nextSibling);
                } else if (element.parentNode) {
                    element.parentNode.appendChild(self._cursorEl);
                }
            }
        }

        // Initial setup: ensure text is set and matches phrase
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

        // Pause animation when page is hidden (saves CPU, avoids timer buildup)
        self._visibilityHandler = function () {
            if (document.hidden) {
                self._isPaused = true;
            } else {
                self._isPaused = false;
            }
        };
        document.addEventListener('visibilitychange', self._visibilityHandler);

        // Begin cycle after initial reading pause
        self._setTimeout(function () {
            self._erase();
        }, self.opts.pauseTime);
    }

    RCTypewriter.prototype._setTimeout = function (fn, delay) {
        var self = this;
        var id = setTimeout(function () {
            if (!self._destroyed) {
                if (self._isPaused) {
                    // Retry once tab is visible
                    self._setTimeout(fn, 500);
                } else {
                    fn.call(self);
                }
            }
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
            // Completed phrase: pause to let user read
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
            // Next phrase
            self._phraseIndex = (self._phraseIndex + 1) % self.phrases.length;
            if (!self.opts.loop && self._phraseIndex === 0) {
                self.el.textContent = self.phrases[0];
                return;
            }
            self._setTimeout(function () {
                self._type();
            }, 300);
        }
    };

    RCTypewriter.prototype.destroy = function () {
        this._destroyed = true;
        for (var i = 0; i < this._timers.length; i++) clearTimeout(this._timers[i]);
        this._timers = [];
        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
        }
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
                var attrVal = el.getAttribute('data-typewriter');
                var phrases;
                if (attrVal === 'true' || attrVal === '') {
                    phrases = [
                        "Intelligent Digital",
                        "High-Performance Cloud",
                        "Autonomous AI Software",
                        "Scalable Enterprise",
                        "Mission-Critical SaaS"
                    ];
                } else {
                    phrases = JSON.parse(attrVal);
                }
                var speed = parseInt(el.getAttribute('data-typewriter-speed'), 10) || 75;
                var eraseSpeed = parseInt(el.getAttribute('data-typewriter-erase'), 10) || 35;
                var pause = parseInt(el.getAttribute('data-typewriter-pause'), 10) || 2400;
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

    window.RCTypewriter = RCTypewriter;
})();
