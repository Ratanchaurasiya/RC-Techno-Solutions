/**
 * RC Techno Solutions — Enterprise Precision Typewriter Engine
 * Zero-Layout-Shift (CLS Guard), Page-Jitter Immune, Screen-Stable Text Rotation
 * 
 * Technical Design:
 * 1. Reserve exact container bounding box: Computes max width and height of all rotating phrases
 *    at runtime using a hidden offscreen clone. Prevents any vertical or horizontal page shaking.
 * 2. Stable baseline alignment: Anchors text without forcing line breaks or displacing surrounding content.
 * 3. Screen shake & scroll prevention: Operates strictly on text nodes without mutating layout dimensions.
 * 4. Visibility & Reduced-Motion: Pauses cleanly when tab is hidden; renders static text for reduced-motion.
 * 5. Single-instance timer safety: Prevents duplicate intervals, racing loops, or timer memory leaks.
 */

(function () {
    'use strict';

    // Inject resilient, zero-jitter cursor and typewriter styles
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
            '    pointer-events: none;',
            '}',
            '@keyframes rcTwBlink {',
            '    from, to { opacity: 1; }',
            '    50% { opacity: 0; }',
            '}',
            '[data-typewriter] {',
            '    display: inline-block;',
            '    vertical-align: baseline;',
            '    text-align: left;',
            '    white-space: nowrap;',
            '    overflow: visible;',
            '    box-sizing: border-box;',
            '    transition: none !important;',
            '}',
            '@media (max-width: 640px) {',
            '    [data-typewriter] {',
            '        white-space: normal;',
            '        word-break: keep-all;',
            '    }',
            '}',
            '@media (prefers-reduced-motion: reduce) {',
            '    .rc-tw-cursor { display: none !important; }',
            '    [data-typewriter] { min-width: auto !important; min-height: auto !important; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    /**
     * Compute max dimensions needed to hold all phrases without expanding or shrinking.
     * Prevents page/parent container from shaking or resizing on every keystroke.
     */
    function measureMaxDimensions(element, phrases) {
        if (!element || !phrases || !phrases.length) return { width: 0, height: 0 };
        var clone = document.createElement('span');
        var computed = window.getComputedStyle(element);

        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.pointerEvents = 'none';
        clone.style.top = '-9999px';
        clone.style.left = '-9999px';
        clone.style.fontFamily = computed.fontFamily;
        clone.style.fontSize = computed.fontSize;
        clone.style.fontWeight = computed.fontWeight;
        clone.style.letterSpacing = computed.letterSpacing;
        clone.style.textTransform = computed.textTransform;
        clone.style.whiteSpace = 'nowrap';
        document.body.appendChild(clone);

        var maxWidth = 0;
        var maxHeight = 0;
        for (var i = 0; i < phrases.length; i++) {
            clone.textContent = phrases[i];
            var w = clone.offsetWidth;
            var h = clone.offsetHeight;
            if (w > maxWidth) maxWidth = w;
            if (h > maxHeight) maxHeight = h;
        }

        document.body.removeChild(clone);
        return { width: maxWidth, height: maxHeight };
    }

    function RCTypewriter(element, phrases, options) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (!element || !phrases || !phrases.length) return;
        if (element._rcTypewriter) return; // Single-instance guard

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

        // Respect reduced motion accessibility: show first phrase statically without blinking cursor
        var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            element.textContent = phrases[0];
            return;
        }

        // Measure & lock min-width / min-height on desktop & tablet to eliminate CLS and jitter
        if (window.innerWidth > 640) {
            var dims = measureMaxDimensions(element, phrases);
            if (dims.width > 0) {
                element.style.minWidth = (dims.width + 4) + 'px';
            }
            if (dims.height > 0) {
                element.style.minHeight = dims.height + 'px';
            }
        }

        // Attach a single managed cursor
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

        // Initial setup
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

        // Pause animation when tab is inactive to prevent timer piling and memory leaks
        self._visibilityHandler = function () {
            if (document.hidden) {
                self._isPaused = true;
            } else {
                self._isPaused = false;
            }
        };
        document.addEventListener('visibilitychange', self._visibilityHandler);

        // Adjust dimensions on window resize
        self._resizeHandler = function () {
            if (window.innerWidth > 640) {
                var d = measureMaxDimensions(self.el, self.phrases);
                if (d.width > 0) self.el.style.minWidth = (d.width + 4) + 'px';
                if (d.height > 0) self.el.style.minHeight = d.height + 'px';
            } else {
                self.el.style.minWidth = 'auto';
                self.el.style.minHeight = 'auto';
            }
        };
        window.addEventListener('resize', self._resizeHandler);

        // Start cycle after initial pause
        self._setTimeout(function () {
            self._erase();
        }, self.opts.pauseTime);
    }

    RCTypewriter.prototype._setTimeout = function (fn, delay) {
        var self = this;
        var id = setTimeout(function () {
            if (!self._destroyed) {
                if (self._isPaused) {
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
            // Phrase complete: hold for user to read
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
            // Move to next phrase
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
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }
        if (this._cursorEl && this._cursorEl.parentNode) {
            this._cursorEl.parentNode.removeChild(this._cursorEl);
        }
        if (this.el) {
            this.el._rcTypewriter = null;
            this.el.style.minWidth = '';
            this.el.style.minHeight = '';
        }
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
                        "Modern Enterprises",
                        "High-Performance Cloud",
                        "Autonomous AI Systems",
                        "Mission-Critical SaaS",
                        "Scalable Platforms"
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
                // Silently ignore
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

