document.addEventListener('DOMContentLoaded', () => {

    /* --- Preloader --- */
    const preloader = document.getElementById('preloader');
    function hidePreloader() {
        if (!preloader || preloader.style.display === 'none') return;
        preloader.style.transition = 'opacity 0.3s ease';
        preloader.style.opacity = '0';
        setTimeout(() => {
            if (preloader) preloader.style.display = 'none';
        }, 300);
    }
    if (document.readyState === 'complete') {
        setTimeout(hidePreloader, 50);
    } else {
        window.addEventListener('load', hidePreloader);
        setTimeout(hidePreloader, 600);
    }
    setTimeout(hidePreloader, 1200);

    /* --- Universal Back to Top Auto-Injection & Handler --- */
    let backToTop = document.getElementById('backToTop');
    if (!backToTop) {
        backToTop = document.createElement('button');
        backToTop.id = 'backToTop';
        backToTop.className = 'back-to-top';
        backToTop.setAttribute('aria-label', 'Scroll back to top');
        backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(backToTop);
    }
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* --- Sticky Header & Back to Top --- */
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }

        if (backToTop) {
            if (window.scrollY > 500) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        }
    });

    /* --- Mobile Hamburger Menu --- */
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when any nav link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });

        // Close menu when clicking outside of navMenu and hamburger
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    /* --- Scroll Reveal Animations (High Reliability for Mobile & Desktop) --- */
    const reveals = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.05,
            rootMargin: '0px 0px 50px 0px'
        });

        reveals.forEach(el => revealObserver.observe(el));
    } else {
        const revealOnScroll = () => {
            const windowHeight = window.innerHeight;
            reveals.forEach(reveal => {
                const elementTop = reveal.getBoundingClientRect().top;
                if (elementTop < windowHeight - 40) {
                    reveal.classList.add('active');
                }
            });
        };
        window.addEventListener('scroll', revealOnScroll, { passive: true });
        revealOnScroll();
    }

    /* --- Active Navigation Link on Scroll (In-Page Anchor Hash Links Only) --- */
    const sections = document.querySelectorAll('section[id]');
    
    if (sections.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.pageYOffset >= (sectionTop - 300)) {
                    current = section.getAttribute('id');
                }
            });

            if (current) {
                navLinks.forEach(link => {
                    const href = link.getAttribute('href') || '';
                    if (href.startsWith('#')) {
                        if (href === `#${current}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    }
                });
            }
        }, { passive: true });
    }

    /* --- Smooth Scrolling for Anchor Links --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                     top: offsetPosition,
                     behavior: "smooth"
                });
            }
        });
    });

    /* --- FAQ Accordion --- */
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const answer = question.nextElementSibling;
            const isCurrentlyActive = question.classList.contains('active');

            if (isCurrentlyActive) {
                question.classList.remove('active');
                if (faqItem) faqItem.classList.remove('active');
                if (answer) {
                    answer.style.maxHeight = null;
                }
            } else {
                question.classList.add('active');
                if (faqItem) faqItem.classList.add('active');
                if (answer) {
                    answer.style.maxHeight = (answer.scrollHeight + 30) + "px";
                }
            }
        });
    });

    /* --- Testimonial Slider --- */
    const testimonials = [
        {
            name: "Sarah Jenkins",
            role: "CTO, FinSphere Global",
            photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
            rating: 5,
            text: "RC Techno Solution completely transformed our digital architecture. Their full-stack engineers delivered our fintech platform ahead of schedule with flawless security."
        },
        {
            name: "Michael Vance",
            role: "Founder & CEO, NexaRetail",
            photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            rating: 5,
            text: "The e-commerce and AI chatbot solutions they integrated doubled our checkout conversions in 60 days. Their communication and code quality are second to none."
        },
        {
            name: "Rajesh Kulkarni",
            role: "Head of Digital, MediPulse Healthcare",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
            rating: 5,
            text: "Exceptional cloud engineering and responsive UI. The real-time patient analytics dashboard was intuitive, fast, and HIPAA-compliant. Highly recommend RC Techno!"
        }
    ];

    const testimonialContainer = document.getElementById('testimonialContainer');
    const sliderDots = document.getElementById('sliderDots');

    if (testimonialContainer && sliderDots) {
        // Generate HTML for slides
        testimonials.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.classList.add('testimonial-slide');
            
            // Generate stars
            let stars = '';
            for(let i=0; i<item.rating; i++) stars += '<i class="fas fa-star"></i>';

            slide.innerHTML = `
                <img src="${item.photo}" alt="${item.name}" class="client-photo">
                <div class="rating">${stars}</div>
                <p class="testimonial-text">"${item.text}"</p>
                <h4>${item.name}</h4>
                <span style="color: var(--clr-primary); font-size: 0.9rem;">${item.role}</span>
            `;
            testimonialContainer.appendChild(slide);

            // Generate Dots
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            sliderDots.appendChild(dot);
        });

        let currentSlide = 0;
        const allDots = document.querySelectorAll('.dot');

        function goToSlide(index) {
            currentSlide = index;
            testimonialContainer.style.transform = `translateX(-${index * 100}%)`;
            
            allDots.forEach(d => d.classList.remove('active'));
            allDots[index].classList.add('active');
        }

        // Auto slide every 5 seconds
        setInterval(() => {
            currentSlide = (currentSlide + 1) % testimonials.length;
            goToSlide(currentSlide);
        }, 5000);
    }



    /* --- Portfolio Category Filter & Load More Logic --- */
    const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    const loadMoreBtn = document.getElementById('loadMoreProjectsBtn');
    const loadMoreContainer = document.querySelector('.portfolio-load-more');

    const INITIAL_ITEMS = 4;
    let currentLimit = INITIAL_ITEMS;
    let currentFilter = 'all';

    function updatePortfolioDisplay() {
        let matchingCount = 0;
        let visibleCount = 0;

        portfolioCards.forEach(card => {
            const category = card.getAttribute('data-category') || '';
            const matches = (currentFilter === 'all' || category === currentFilter || category.includes(currentFilter));

            if (matches) {
                matchingCount++;
                if (matchingCount <= currentLimit) {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 30);
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                    card.style.display = 'none';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px)';
                }
            } else {
                card.classList.add('hidden');
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
            }
        });

        // Toggle Load More button visibility and count
        if (loadMoreContainer) {
            const remaining = matchingCount - visibleCount;
            if (remaining > 0) {
                loadMoreContainer.style.display = 'flex';
                if (loadMoreBtn) {
                    loadMoreBtn.innerHTML = `<span>Load More Projects (${remaining} more)</span> <i class="fas fa-chevron-down"></i>`;
                }
            } else {
                loadMoreContainer.style.display = 'none';
            }
        }
    }

    if (portfolioCards.length > 0) {
        updatePortfolioDisplay();

        if (filterButtons.length > 0) {
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    currentFilter = btn.getAttribute('data-filter') || 'all';
                    currentLimit = INITIAL_ITEMS; // Reset to initial count on category change
                    updatePortfolioDisplay();
                });
            });
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                currentLimit += INITIAL_ITEMS;
                updatePortfolioDisplay();
            });
        }
    }

    /* --- Modern Toast Notification Helper --- */
    function showToast(message, iconClass = 'fas fa-check-circle') {
        let toast = document.getElementById('rc-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'rc-toast';
            toast.className = 'rc-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }
    window.showRCToast = showToast;

    /* --- Production Contact Form Submission Handler & Validation --- */
    const contactForm = document.getElementById('contactForm') || document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.removeAttribute('onsubmit');
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('contactName') || contactForm.querySelector('input[name="name"], input[placeholder*="Name"]');
            const emailInput = document.getElementById('contactEmail') || contactForm.querySelector('input[name="email"], input[placeholder*="Email"]');
            const phoneInput = document.getElementById('contactPhone') || contactForm.querySelector('input[name="phone"], input[type="tel"]');
            const companyInput = document.getElementById('contactCompany') || contactForm.querySelector('input[name="company"]');
            const serviceSelect = document.getElementById('contactService') || contactForm.querySelector('select[name="service"]');
            const budgetSelect = document.getElementById('contactBudget') || contactForm.querySelector('select[name="budget"]');
            const messageInput = document.getElementById('contactMessage') || contactForm.querySelector('textarea[name="message"]');
            const trapInput = contactForm.querySelector('input[name="website_trap"]');
            const statusBox = document.getElementById('contactFormStatus');
            const submitBtn = document.getElementById('contactSubmitBtn') || contactForm.querySelector('button[type="submit"]');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const company = companyInput ? companyInput.value.trim() : '';
            const service = serviceSelect ? serviceSelect.value.trim() : '';
            const budget = budgetSelect ? budgetSelect.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';
            const trap = trapInput ? trapInput.value.trim() : '';

            // Reset field error borders
            [nameInput, emailInput, phoneInput, serviceSelect, messageInput].forEach(inp => {
                if (inp) inp.style.borderColor = '';
            });

            function showFormError(msg, targetInput) {
                if (statusBox) {
                    statusBox.style.display = 'block';
                    statusBox.style.background = '#fef2f2';
                    statusBox.style.color = '#991b1b';
                    statusBox.style.border = '1px solid #fecaca';
                    statusBox.innerHTML = `<i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i> ${msg}`;
                } else {
                    window.showRCToast?.(msg, 'fas fa-exclamation-circle');
                }
                if (targetInput) {
                    targetInput.style.borderColor = '#ef4444';
                    targetInput.focus();
                }
            }

            // 1. Validate Name
            if (!name || name.length < 2) {
                showFormError('Please enter your full name (minimum 2 characters).', nameInput);
                return;
            }

            // 2. Validate Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!email || !emailRegex.test(email)) {
                showFormError('Please enter a valid business or personal email address.', emailInput);
                return;
            }

            // 3. Validate Phone (if entered, check Indian mobile 10-digits or valid international format)
            if (phone) {
                const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
                const indianMobileRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
                const intlPhoneRegex = /^\+?[1-9]\d{7,14}$/;
                if (!indianMobileRegex.test(cleanPhone) && !intlPhoneRegex.test(cleanPhone)) {
                    showFormError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210) or international format (+1...).', phoneInput);
                    return;
                }
            }

            // 4. Validate Service selection
            if (!service) {
                showFormError('Please select the primary service required for your project.', serviceSelect);
                return;
            }

            // 5. Validate Message
            if (!message || message.length < 10) {
                showFormError('Please provide a brief project description (at least 10 characters).', messageInput);
                return;
            }

            // 6. UI Loading State
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Enquiry';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i> Submitting Enquiry...';
            }
            if (statusBox) {
                statusBox.style.display = 'block';
                statusBox.style.background = '#eff6ff';
                statusBox.style.color = '#1d4ed8';
                statusBox.style.border = '1px solid #bfdbfe';
                statusBox.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i> Transmitting your requirements securely to our senior engineering team...';
            }

            try {
                const resp = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        company,
                        service,
                        budget,
                        message,
                        website_trap: trap
                    })
                });

                const data = await resp.json();

                if (resp.ok && data.success) {
                    const refId = data.referenceId || data.inquiryId || data.enquiryId || (data.data && data.data.referenceId) || 'RC-ENQ-2026-CONFIRMED';
                    
                    if (statusBox) {
                        statusBox.style.background = '#f0fdf4';
                        statusBox.style.color = '#166534';
                        statusBox.style.border = '1px solid #bbf7d0';
                        statusBox.innerHTML = `
                            <div style="display: flex; align-items: flex-start; gap: 12px;">
                                <i class="fas fa-check-circle" style="font-size: 1.4rem; color: #16a34a; margin-top: 2px;"></i>
                                <div style="flex: 1;">
                                    <strong style="display: block; font-size: 1.05rem; margin-bottom: 4px;">Enquiry Registered Successfully!</strong>
                                    <p style="margin: 0 0 10px 0; font-size: 0.92rem; line-height: 1.5;">${data.message || 'Your consultation enquiry has been recorded.'}</p>
                                    <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                                        <span style="font-family: monospace; background: #dcfce7; color: #15803d; padding: 5px 12px; border-radius: 6px; font-weight: 800; font-size: 0.88rem; border: 1px solid #86efac; letter-spacing: 0.5px;">Reference: ${refId}</span>
                                        <button type="button" onclick="navigator.clipboard.writeText('${refId}'); this.innerHTML='<i class=\\'fas fa-check\\'></i> Copied!'; setTimeout(() => this.innerHTML='<i class=\\'fas fa-copy\\'></i> Copy Ref', 2000);" style="display: inline-flex; align-items: center; gap: 5px; background: #ffffff; color: #15803d; border: 1px solid #86efac; padding: 5px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                                            <i class="fas fa-copy"></i> Copy Ref
                                        </button>
                                        <a href="https://wa.me/916390035039?text=${encodeURIComponent(`Hi RC Techno, I submitted enquiry Ref: ${refId} regarding ${service}. Looking forward to discussing next steps.`)}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 6px; background: #25d366; color: #ffffff; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 600;">
                                            <i class="fab fa-whatsapp"></i> Also Discuss on WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    window.showRCToast?.(`Enquiry submitted! Ref: ${refId}`);
                    contactForm.reset();
                } else {
                    showFormError(data.error || 'Submission failed. Please check your inputs and try again.');
                }
            } catch (err) {
                console.error('Contact form network error:', err);
                showFormError('Network error connecting to the server. Please check your connection or contact us directly via WhatsApp.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    /* --- Services Load More --- */
    const servicesGrids = document.querySelectorAll('.bento-services-grid, .services-grid');
    
    servicesGrids.forEach(grid => {
        const items = grid.querySelectorAll('.bento-service-card, .service-card');
        const loadMoreBtn = grid.nextElementSibling?.querySelector('.load-more-services-btn');
        let currentItem = 6;

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                for (let i = currentItem; i < currentItem + 3 && i < items.length; i++) {
                    items[i].classList.add('show');
                }
                currentItem += 3;
                if (currentItem >= items.length) {
                    loadMoreBtn.style.display = 'none';
                }
            });
            
            // If less than or equal to 6 items, hide the button initially
            if(items.length <= 6) {
                loadMoreBtn.style.display = 'none';
            }
        }
    });

    /* --- Tech Stack & Why Choose Pillars Load More / Show Less --- */
    function setupLoadMoreToggle(btnId, gridId, itemClass, showText, hideText) {
        const btn = document.getElementById(btnId);
        const grid = document.getElementById(gridId);
        if (!btn || !grid) return;

        btn.addEventListener('click', () => {
            const extraItems = grid.querySelectorAll('.' + itemClass);
            const isExpanded = btn.classList.contains('expanded');
            const btnText = btn.querySelector('.btn-text');

            if (isExpanded) {
                extraItems.forEach(item => item.classList.remove('show-item'));
                btn.classList.remove('expanded');
                if (btnText) btnText.textContent = showText;
                grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                extraItems.forEach(item => item.classList.add('show-item'));
                btn.classList.add('expanded');
                if (btnText) btnText.textContent = hideText;
            }
        });
    }

    setupLoadMoreToggle('loadMoreArchBtn', 'archDomainsGrid', 'arch-extra-item', 'Load More Technical Domains (6 more)', 'Show Less');
    setupLoadMoreToggle('loadMoreAllServicesBtn', 'allServicesGrid', 'service-extra-item', 'Load More Services (8 more)', 'Show Less');
    setupLoadMoreToggle('loadMoreServicesBtn', 'techServicesGrid', 'service-extra-item', 'Load More Services', 'Show Less');
    setupLoadMoreToggle('loadMoreTechBtn', 'techStackGrid', 'tech-extra-item', 'Load More Technologies', 'Show Less');
    setupLoadMoreToggle('loadMoreWhyBtn', 'whyPillarsGrid', 'why-extra-item', 'Load More Advantages', 'Show Less');

    /* --- Gallery Lightbox and Load More --- */
    // Create Lightbox Elements
    const lightboxHTML = `
        <div id="lightbox" class="lightbox">
            <span class="lightbox-close">&times;</span>
            <span class="lightbox-prev">&#10094;</span>
            <span class="lightbox-next">&#10095;</span>
            <img class="lightbox-content" id="lightboxImg">
            <div class="lightbox-caption" id="lightboxCaption"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeLightbox = document.querySelector('.lightbox-close');
    const prevLightbox = document.querySelector('.lightbox-prev');
    const nextLightbox = document.querySelector('.lightbox-next');

    // State for gallery
    let currentGalleryImages = [];
    let currentImageIndex = 0;

    // Attach click events for all gallery grids (in case there are multiple on the page)
    const galleryGrids = document.querySelectorAll('.gallery-grid');
    
    galleryGrids.forEach(grid => {
        // Load More Logic
        const items = grid.querySelectorAll('.gallery-item');
        const loadMoreBtn = grid.nextElementSibling?.querySelector('.load-more-btn');
        let currentItem = 3;

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                for (let i = currentItem; i < currentItem + 3 && i < items.length; i++) {
                    items[i].classList.add('show');
                }
                currentItem += 3;
                if (currentItem >= items.length) {
                    loadMoreBtn.style.display = 'none';
                }
            });
        }

        // Lightbox Logic for this grid
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                // Populate current gallery images list when opening
                currentGalleryImages = Array.from(grid.querySelectorAll('.gallery-item'))
                                            .map(el => ({
                                                src: el.querySelector('img').src,
                                                alt: el.querySelector('img').alt
                                            }));
                currentImageIndex = index;
                openLightbox(currentGalleryImages[currentImageIndex]);
            });
        });
    });

    function openLightbox(imgData) {
        lightbox.classList.add('active');
        lightboxImg.src = imgData.src;
        lightboxCaption.textContent = imgData.alt;
        document.body.style.overflow = 'hidden'; // prevent scrolling
    }

    function closeLightboxFunc() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closeLightbox.addEventListener('click', closeLightboxFunc);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightboxFunc();
        }
    });

    function showImage(index) {
        if (index >= currentGalleryImages.length) {
            currentImageIndex = 0;
        } else if (index < 0) {
            currentImageIndex = currentGalleryImages.length - 1;
        } else {
            currentImageIndex = index;
        }
        openLightbox(currentGalleryImages[currentImageIndex]);
    }

    nextLightbox.addEventListener('click', () => showImage(currentImageIndex + 1));
    prevLightbox.addEventListener('click', () => showImage(currentImageIndex - 1));

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') showImage(currentImageIndex + 1);
        if (e.key === 'ArrowLeft') showImage(currentImageIndex - 1);
        if (e.key === 'Escape') closeLightboxFunc();
    });

    /* --- Interactive Canvas Particle Background --- */
    const canvas = document.getElementById('hero-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let numParticles = window.innerWidth < 768 ? 20 : 60; // Optimized count
        
        let mouse = { x: null, y: null, radius: 120 };

        window.addEventListener('mousemove', (e) => {
            if (window.innerWidth >= 768) {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            }
        });
        window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 20) + 1;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

                if (mouse.x != null && window.innerWidth >= 768) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;

                    if (distance < maxDistance) {
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(79, 70, 229, 0.4)';
                ctx.fill();
            }
        }

        function initCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            numParticles = window.innerWidth < 768 ? 20 : 60;
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(79, 70, 229, ${0.15 - distance/800})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', initCanvas);
        initCanvas();
        animate();
    }

    /* --- Accessibility Read Aloud (TTS) --- */
    let isTTSMode = false;
    let currentSpeech = null;
    let currentlyHighlighted = null;
    
    const enableTTSBtn = document.getElementById('enableTTSBtn');
    const ttsControlPanel = document.getElementById('ttsControlPanel');
    const closeTTSBtn = document.getElementById('closeTTSBtn');
    const ttsPauseBtn = document.getElementById('ttsPauseBtn');
    const ttsResumeBtn = document.getElementById('ttsResumeBtn');
    const ttsStopBtn = document.getElementById('ttsStopBtn');
    const ttsVoiceSelect = document.getElementById('ttsVoice');
    const ttsRateInput = document.getElementById('ttsRate');
    
    let voices = [];
    
    function populateVoices() {
        if (!window.speechSynthesis) return;
        voices = window.speechSynthesis.getVoices();
        if (ttsVoiceSelect) {
            ttsVoiceSelect.innerHTML = '';
            voices.forEach((voice, i) => {
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.value = i;
                ttsVoiceSelect.appendChild(option);
            });
        }
    }
    
    populateVoices();
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }
    
    if (enableTTSBtn) {
        enableTTSBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isTTSMode = true;
            document.body.classList.add('tts-mode-active');
            ttsControlPanel.classList.add('show');
        });
    }
    
    if (closeTTSBtn) {
        closeTTSBtn.addEventListener('click', () => {
            isTTSMode = false;
            document.body.classList.remove('tts-mode-active');
            ttsControlPanel.classList.remove('show');
            window.speechSynthesis.cancel();
            removeHighlight();
        });
    }
    
    function removeHighlight() {
        if (currentlyHighlighted) {
            currentlyHighlighted.classList.remove('tts-highlight');
            currentlyHighlighted = null;
        }
    }
    
    let hoverTimeout;
    
    document.addEventListener('mouseover', (e) => {
        if (!isTTSMode) return;
        
        if (ttsControlPanel.contains(e.target) || (enableTTSBtn && enableTTSBtn.contains(e.target))) return;
        
        const validTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'SPAN', 'LI', 'LABEL'];
        let targetElement = e.target;
        
        // If they hovered an icon or inner element, try to find the closest valid tag
        if (!validTags.includes(targetElement.tagName)) {
             targetElement = targetElement.closest(validTags.join(','));
        }
        
        if (!targetElement) return;
        
        const textToSpeak = targetElement.innerText || targetElement.textContent;
        if (!textToSpeak || !textToSpeak.trim()) return;
        
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            window.speechSynthesis.cancel();
            removeHighlight();
            
            currentSpeech = new SpeechSynthesisUtterance(textToSpeak);
            
            const selectedVoice = voices[ttsVoiceSelect.value];
            if (selectedVoice) currentSpeech.voice = selectedVoice;
            currentSpeech.rate = parseFloat(ttsRateInput.value) || 1;
            
            currentSpeech.onstart = () => {
                targetElement.classList.add('tts-highlight');
                currentlyHighlighted = targetElement;
                ttsPauseBtn.style.display = 'block';
                ttsResumeBtn.style.display = 'none';
            };
            
            currentSpeech.onend = () => removeHighlight();
            currentSpeech.onerror = () => removeHighlight();
            
            window.speechSynthesis.speak(currentSpeech);
        }, 300); // 300ms delay to prevent spamming while moving mouse
    });
    
    document.addEventListener('mouseout', (e) => {
        if (!isTTSMode) return;
        clearTimeout(hoverTimeout);
    }); 
    
    if (ttsPauseBtn) {
        ttsPauseBtn.addEventListener('click', () => {
            window.speechSynthesis.pause();
            ttsPauseBtn.style.display = 'none';
            ttsResumeBtn.style.display = 'block';
        });
    }
    
    if (ttsResumeBtn) {
        ttsResumeBtn.addEventListener('click', () => {
            window.speechSynthesis.resume();
            ttsPauseBtn.style.display = 'block';
            ttsResumeBtn.style.display = 'none';
        });
    }
    
        if (ttsStopBtn) {
        ttsStopBtn.addEventListener('click', () => {
            window.speechSynthesis.cancel();
            removeHighlight();
        });
    }

    /* --- Enterprise Light / White Theme Mode Enforcement --- */
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('rc_theme', 'light');

    /* --- 1-Click Discovery Call Modal --- */
    const callModal = document.getElementById('callModal');
    const openCallBtns = document.querySelectorAll('.open-call-modal-btn');
    const closeCallBtn = document.getElementById('closeCallModal');
    const callSlotCards = document.querySelectorAll('.call-slot-card');
    const confirmCallBtn = document.getElementById('confirmCallBtn');
    let selectedSlot = 'Tomorrow at 3:00 PM IST (US East: 5:30 AM)';

    if (callModal) {
        openCallBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                callModal.classList.add('open');
            });
        });

        if (closeCallBtn) {
            closeCallBtn.addEventListener('click', () => callModal.classList.remove('open'));
        }

        callModal.addEventListener('click', (e) => {
            if (e.target === callModal) callModal.classList.remove('open');
        });

        callSlotCards.forEach(card => {
            card.addEventListener('click', () => {
                callSlotCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedSlot = card.getAttribute('data-slot') || card.innerText;
            });
        });

        if (confirmCallBtn) {
            confirmCallBtn.addEventListener('click', async () => {
                const name = document.getElementById('callName')?.value.trim() || 'Client';
                const topic = document.getElementById('callTopic')?.value.trim() || 'Project Architecture';
                const waMsg = encodeURIComponent(
                    `*Discovery Call Request - RC Techno Solution*\n\n` +
                    `*Name:* ${name}\n` +
                    `*Requested Slot:* ${selectedSlot}\n` +
                    `*Discussion Topic:* ${topic}`
                );
                callModal.classList.remove('open');
                window.showRCToast?.("Discovery call slot reserved! Registering with engineering team...");

                // Register with backend API
                try {
                    await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: name,
                            email: 'discovery-call@rctechnosolutions.com',
                            phone: '',
                            service: 'Technical Discovery Consultation',
                            subject: `Discovery Call Slot: ${selectedSlot}`,
                            message: `Scheduled Slot: ${selectedSlot}. Discussion Focus: ${topic}`
                        })
                    });
                } catch (e) {
                    console.warn('Discovery call log error:', e);
                }

                setTimeout(() => {
                    window.open(`https://wa.me/916390035039?text=${waMsg}`, '_blank');
                }, 900);
            });
        }
    }

    /* --- Top Glow Scroll Reading Progress Bar --- */
    const scrollProgressBar = document.getElementById('scrollProgressBar');
    if (scrollProgressBar) {
        window.addEventListener('scroll', () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll > 0) {
                const pct = (window.scrollY / maxScroll) * 100;
                scrollProgressBar.style.width = Math.min(Math.max(pct, 0), 100) + '%';
            }
        }, { passive: true });
    }

    /* --- Free 24-Hour Digital Health & Security Audit Handler --- */
    const auditForm = document.getElementById('freeAuditForm');
    if (auditForm) {
        auditForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const urlInput = document.getElementById('auditUrl');
            const emailInput = document.getElementById('auditEmail');
            const submitBtn = auditForm.querySelector('button[type="submit"]');
            const url = urlInput?.value.trim();
            const email = emailInput?.value.trim();
            if (!url) return;

            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Running Diagnostic Scan...';
            }

            window.showRCToast?.("🔍 Analyzing SSL/TLS, Core Web Vitals, and security headers...");

            setTimeout(() => {
                window.showRCToast?.("📊 Diagnostic completed! Launching WhatsApp with audit findings...");
            }, 900);

            setTimeout(() => {
                const waMsg = encodeURIComponent(
                    `*Free 24-Hour Digital Health & Security Audit Request*\n\n` +
                    `*Target Website URL:* ${url}\n` +
                    `*Report Recipient Email:* ${email || 'Direct WhatsApp Delivery'}\n` +
                    `*Parameters:* SSL Certificate, Core Web Vitals (LCP/CLS), Cloud Latency, OWASP Top 10 Guardrails.`
                );

                window.open(`https://wa.me/916390035039?text=${waMsg}`, '_blank');
                auditForm.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }, 1800);
        });
    }

    /* --- Interactive FAQ Category, Live Search & View More Handler --- */
    const faqSearchInput = document.getElementById('faqSearchInput');
    const faqItems = document.querySelectorAll('.faq-item');
    const faqCategoryBtns = document.querySelectorAll('.faq-category-btn');
    const faqToggleMoreBtn = document.getElementById('faqToggleMoreBtn');
    let currentFaqCategory = 'all';
    let isFaqExpanded = false;

    function filterFaqs() {
        const query = faqSearchInput ? faqSearchInput.value.toLowerCase().trim() : '';
        const isFiltering = (currentFaqCategory !== 'all' || query.length > 0);

        faqItems.forEach(item => {
            const category = item.getAttribute('data-category') || '';
            const matchesCategory = (currentFaqCategory === 'all' || category === currentFaqCategory);
            const questionText = item.querySelector('.faq-question h3')?.innerText.toLowerCase() || '';
            const answerText = item.querySelector('.faq-answer p')?.innerText.toLowerCase() || '';
            const matchesQuery = (!query || questionText.includes(query) || answerText.includes(query));
            const isExtra = item.classList.contains('faq-extra');

            if (matchesCategory && matchesQuery) {
                if (!isFiltering && isExtra && !isFaqExpanded) {
                    item.style.display = 'none';
                    item.classList.remove('show');
                } else {
                    item.style.display = 'block';
                    if (isExtra) item.classList.add('show');
                }
            } else {
                item.style.display = 'none';
                item.classList.remove('show');
            }
        });

        // Hide toggle button if currently filtering or searching
        if (faqToggleMoreBtn && faqToggleMoreBtn.parentElement) {
            if (isFiltering) {
                faqToggleMoreBtn.parentElement.style.display = 'none';
            } else {
                faqToggleMoreBtn.parentElement.style.display = 'block';
                faqToggleMoreBtn.innerHTML = isFaqExpanded
                    ? '<i class="fas fa-chevron-up"></i> Show Fewer Questions'
                    : '<i class="fas fa-chevron-down"></i> View More Questions';
            }
        }
    }

    if (faqToggleMoreBtn) {
        faqToggleMoreBtn.addEventListener('click', () => {
            isFaqExpanded = !isFaqExpanded;
            filterFaqs();
        });
    }

    if (faqCategoryBtns.length > 0) {
        faqCategoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                faqCategoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFaqCategory = btn.getAttribute('data-filter') || 'all';
                filterFaqs();
            });
        });
    }

    if (faqSearchInput && faqItems.length > 0) {
        faqSearchInput.addEventListener('input', filterFaqs);
    }

    if (faqItems.length > 0) {
        filterFaqs();
    }

    /* --- Executive Hero Title Full Typing Animation --- */
    const typePart1 = document.getElementById('heroTypePart1');
    const typePart2 = document.getElementById('heroTypePart2');

    // Only run if not handled by the standardized RCTypewriter system
    if (typePart1 && typePart2 && !typePart2.hasAttribute('data-typewriter')) {
        const fullPart1 = "Architecting Resilient Digital Platforms &";
        const accentWords = [
            "Intelligent Systems",
            "Enterprise Cloud Architecture",
            "Mission-Critical SaaS",
            "Autonomous AI Workflows"
        ];

        // Retain original HTML structure if already populated
        if (!typePart1.children.length) {
            typePart1.textContent = fullPart1;
        }
        typePart2.textContent = accentWords[0];

        let idx2 = accentWords[0].length;
        let wordIdx = 0;
        let isDeleting = false;

        // Step 2: Rotate second line accent words with the gradient accent
        function typeLine2() {
            const currentWord = accentWords[wordIdx];

            if (isDeleting) {
                idx2--;
                typePart2.textContent = currentWord.substring(0, idx2);
            } else {
                idx2++;
                typePart2.textContent = currentWord.substring(0, idx2);
            }

            if (!isDeleting && idx2 === currentWord.length) {
                isDeleting = true;
                setTimeout(typeLine2, 3500);
                return;
            } else if (isDeleting && idx2 === 0) {
                isDeleting = false;
                wordIdx = (wordIdx + 1) % accentWords.length;
                setTimeout(typeLine2, 350);
                return;
            }

            const speed = isDeleting ? 38 : 70;
            setTimeout(typeLine2, speed);
        }

        // Pause 2.5s for initial reading before beginning live rotation
        setTimeout(() => {
            isDeleting = true;
            typeLine2();
        }, 2500);
    }

    /* --- Live Animated Impact Metric Counters --- */
    const counterElements = document.querySelectorAll('.hero-counter-num');
    if (counterElements.length > 0 && 'IntersectionObserver' in window) {
        let countersAnimated = false;
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    countersAnimated = true;
                    counterElements.forEach(counter => {
                        const target = parseFloat(counter.getAttribute('data-target'));
                        const suffix = counter.getAttribute('data-suffix') || '';
                        const decimal = parseInt(counter.getAttribute('data-decimal') || '0', 10);
                        const duration = 1800; // ms
                        const startTime = performance.now();

                        function updateCount(currentTime) {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            // Ease-out cubic curve
                            const easeProgress = 1 - Math.pow(1 - progress, 3);
                            const currentVal = (target * easeProgress).toFixed(decimal);
                            counter.textContent = currentVal + suffix;

                            if (progress < 1) {
                                requestAnimationFrame(updateCount);
                            } else {
                                counter.textContent = (decimal > 0 ? target.toFixed(decimal) : target) + suffix;
                            }
                        }

                        requestAnimationFrame(updateCount);
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.15 });

        const metricsBar = document.querySelector('.hero-metrics-bar');
        if (metricsBar) {
            counterObserver.observe(metricsBar);
        }
    }

    /* --- Executive Pillar Cards Subtle 3D Mouse Tilt --- */
    const pillarCards = document.querySelectorAll('.pillar-card');
    pillarCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;
            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* --- Background Video Audio & Universal Voice Assistant Controller --- */
    const heroSection = document.getElementById('home');
    const heroBgVideo = document.getElementById('heroBgVideo') || document.querySelector('.hero-bg-video');
    const soundToggle = document.getElementById('heroSoundToggle');

    if (soundToggle) {
        const soundIcon = soundToggle.querySelector('.sound-icon');
        const soundText = soundToggle.querySelector('.sound-text');
        const soundWave = soundToggle.querySelector('.sound-wave-anim');
        let isVoiceActive = false;

        function updateSoundUI(isActive) {
            if (!isActive) {
                soundToggle.classList.add('muted');
                if (soundIcon) soundIcon.className = 'fas fa-volume-mute sound-icon';
                if (soundText) soundText.textContent = 'Voice: OFF';
                if (soundWave) soundWave.classList.remove('active');
            } else {
                soundToggle.classList.remove('muted');
                if (soundIcon) soundIcon.className = 'fas fa-volume-up sound-icon';
                if (soundText) soundText.textContent = 'Voice: ON';
                if (soundWave) soundWave.classList.add('active');
            }
        }

        if (heroBgVideo) {
            let userWantsSound = false;
            let isScrolledAway = false;

            // Video Initialization (Muted Autoplay for 100% Mobile & Desktop Support)
            function startHeroVideo() {
                if (isScrolledAway) return;
                heroBgVideo.muted = true;
                updateSoundUI(false);

                const playPromise = heroBgVideo.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        heroBgVideo.muted = true;
                        heroBgVideo.play().catch(() => {});
                    });
                }

                ['loadeddata', 'canplay', 'loadedmetadata'].forEach(evt => {
                    heroBgVideo.addEventListener(evt, () => {
                        if (heroBgVideo.paused && !isScrolledAway) {
                            heroBgVideo.play().catch(() => {});
                        }
                    }, { once: true });
                });
            }

            startHeroVideo();

            // Toggle Video Audio
            soundToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (heroBgVideo.muted) {
                    userWantsSound = true;
                    heroBgVideo.muted = false;
                    heroBgVideo.volume = 1.0;
                    heroBgVideo.play().then(() => {
                        updateSoundUI(true);
                        if (window.rcTechChatbot) window.rcTechChatbot.isVoiceMuted = false;
                        window.showRCToast?.("🔊 Video Voice: ON");
                    }).catch((err) => {
                        console.warn('Unmute error:', err);
                        heroBgVideo.muted = true;
                        updateSoundUI(false);
                    });
                } else {
                    userWantsSound = false;
                    heroBgVideo.muted = true;
                    updateSoundUI(false);
                    if (window.rcTechChatbot) window.rcTechChatbot.isVoiceMuted = true;
                    window.showRCToast?.("🔇 Video Voice: OFF");
                }
            });

            // Automatically mute/pause video when user scrolls away from Home section
            function handleHeroVisibility(inView) {
                if (inView) {
                    isScrolledAway = false;
                    heroBgVideo.play().catch(() => {});
                    if (userWantsSound) {
                        heroBgVideo.muted = false;
                        heroBgVideo.volume = 1.0;
                        updateSoundUI(true);
                    } else {
                        heroBgVideo.muted = true;
                        updateSoundUI(false);
                    }
                } else {
                    if (window.scrollY > 200) {
                        isScrolledAway = true;
                        heroBgVideo.pause();
                        heroBgVideo.muted = true;
                        updateSoundUI(false);
                    }
                }
            }

            if (heroSection && 'IntersectionObserver' in window) {
                const heroObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            handleHeroVisibility(true);
                        } else if (window.scrollY > 200) {
                            handleHeroVisibility(false);
                        }
                    });
                }, { threshold: [0, 0.1, 0.5] });
                heroObserver.observe(heroSection);
            }

            window.addEventListener('scroll', () => {
                if (!heroSection) return;
                const heroRect = heroSection.getBoundingClientRect();
                if (heroRect.bottom <= 50 && window.scrollY > 200 && !isScrolledAway) {
                    handleHeroVisibility(false);
                } else if (heroRect.bottom > 50 && isScrolledAway) {
                    handleHeroVisibility(true);
                }
            }, { passive: true });

        } else {
            // Subpages without video: Toggle Speech Synthesis Voice Assistant
            updateSoundUI(false);
            soundToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                isVoiceActive = !isVoiceActive;
                updateSoundUI(isVoiceActive);

                if (window.rcTechChatbot) {
                    window.rcTechChatbot.isVoiceMuted = !isVoiceActive;
                }

                if (isVoiceActive) {
                    window.showRCToast?.("🔊 Voice Assistant: ON");
                    if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const pageTitle = document.title.split('|')[0].trim();
                        const utterance = new SpeechSynthesisUtterance(`Voice assistance enabled for ${pageTitle} at RC Techno Solutions.`);
                        utterance.rate = 1.05;
                        window.speechSynthesis.speak(utterance);
                    }
                } else {
                    window.showRCToast?.("🔇 Voice Assistant: OFF");
                    if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                    }
                }
            });
        }
    }

    /* --- Feature 1: Interactive System Architecture Studio Controller --- */
    const archSection = document.getElementById('architecture');
    if (archSection) {
        let currentArch = {
            workload: 'saas',
            workloadTitle: 'Next.js 15 + FastAPI SaaS',
            cloud: 'aws',
            cloudTitle: 'Amazon Web Services (ECS Fargate)',
            db: 'postgres-redis',
            dbTitle: 'PostgreSQL with In-Memory Redis Cache',
            security: ['oauth', 'waf', 'vault']
        };

        const workloadCards = archSection.querySelectorAll('[data-arch-group="workload"] .arch-card');
        const cloudCards = archSection.querySelectorAll('[data-arch-group="cloud"] .arch-card');
        const dbCards = archSection.querySelectorAll('[data-arch-group="db"] .arch-card');
        const secChecks = archSection.querySelectorAll('.arch-checkbox-grid input');

        const statusText = document.getElementById('archStatusText');
        const specWorkload = document.getElementById('specWorkload');
        const specCloud = document.getElementById('specCloud');
        const specDb = document.getElementById('specDb');
        const specSecurity = document.getElementById('specSecurity');
        const canvasComputeTitle = document.getElementById('canvasComputeTitle');
        const canvasComputeSub = document.getElementById('canvasComputeSub');
        const canvasCacheTitle = document.getElementById('canvasCacheTitle');
        const canvasDbTitle = document.getElementById('canvasDbTitle');
        const copyBlueprintBtn = document.getElementById('copyArchBlueprintBtn');
        const sendWhatsAppBtn = document.getElementById('sendArchWhatsAppBtn');

        function updateArchUI() {
            // Update summary specs
            if (specWorkload) specWorkload.textContent = currentArch.workloadTitle;
            if (specCloud) specCloud.textContent = currentArch.cloudTitle;
            if (specDb) specDb.textContent = currentArch.dbTitle;

            const secNames = [];
            secChecks.forEach(ch => {
                if (ch.checked) {
                    const label = ch.closest('.arch-check-item');
                    label?.classList.add('checked');
                    const secVal = ch.getAttribute('data-sec');
                    secNames.push(secVal === 'oauth' ? 'OAuth2 / RBAC' : secVal === 'waf' ? 'Edge WAF' : secVal === 'vault' ? 'Secret Vault' : 'SOC2 / OWASP');
                } else {
                    const label = ch.closest('.arch-check-item');
                    label?.classList.remove('checked');
                }
            });
            if (specSecurity) {
                specSecurity.textContent = secNames.length > 0 ? secNames.join(', ') : 'Standard HTTPS';
            }

            // Update Canvas Nodes
            if (canvasComputeTitle) {
                if (currentArch.cloud === 'aws') {
                    canvasComputeTitle.textContent = 'AWS ECS Fargate Cluster';
                    if (canvasComputeSub) canvasComputeSub.textContent = 'Dockerized Microservices';
                } else if (currentArch.cloud === 'gcp') {
                    canvasComputeTitle.textContent = 'Google Cloud Run';
                    if (canvasComputeSub) canvasComputeSub.textContent = 'Auto-Scaling Serverless Containers';
                } else {
                    canvasComputeTitle.textContent = 'Kubernetes (K8s)';
                    if (canvasComputeSub) canvasComputeSub.textContent = 'Multi-Node Self-Healing Pods';
                }
            }

            if (canvasDbTitle && canvasCacheTitle) {
                if (currentArch.db === 'postgres-redis') {
                    canvasCacheTitle.textContent = 'Redis Cache';
                    canvasDbTitle.textContent = 'PostgreSQL Cluster';
                } else if (currentArch.db === 'mongo-vector') {
                    canvasCacheTitle.textContent = 'Pinecone Vector DB';
                    canvasDbTitle.textContent = 'MongoDB Atlas';
                } else {
                    canvasCacheTitle.textContent = 'Edge Cache Hit';
                    canvasDbTitle.textContent = 'Global Read Replicas';
                }
            }

            if (statusText) {
                statusText.textContent = `Live Topology: ${currentArch.workloadTitle} on ${currentArch.cloudTitle}`;
            }

            // Sync WhatsApp link
            if (sendWhatsAppBtn) {
                const waText = encodeURIComponent(
                    `*New Architecture Blueprint Configuration*\n\n` +
                    `*Workload:* ${currentArch.workloadTitle}\n` +
                    `*Cloud Infrastructure:* ${currentArch.cloudTitle}\n` +
                    `*Data & Cache Layer:* ${currentArch.dbTitle}\n` +
                    `*Active Guardrails:* ${secNames.join(', ') || 'Standard'}\n\n` +
                    `Hello RC Techno Solution team, I configured this technical architecture blueprint and would like to discuss next engineering steps.`
                );
                sendWhatsAppBtn.href = `https://wa.me/916390035039?text=${waText}`;
            }
        }

        function handleGroupClick(cards, propKey, titleKey) {
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    cards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    currentArch[propKey] = card.getAttribute('data-val');
                    currentArch[titleKey] = card.getAttribute('data-title') || card.querySelector('h5')?.innerText;
                    updateArchUI();
                });
            });
        }

        handleGroupClick(workloadCards, 'workload', 'workloadTitle');
        handleGroupClick(cloudCards, 'cloud', 'cloudTitle');
        handleGroupClick(dbCards, 'db', 'dbTitle');

        secChecks.forEach(ch => ch.addEventListener('change', updateArchUI));

        if (copyBlueprintBtn) {
            copyBlueprintBtn.addEventListener('click', () => {
                const secSummary = Array.from(secChecks).filter(c => c.checked).map(c => c.getAttribute('data-sec').toUpperCase()).join(', ');
                const blueprintText = 
                    `=== RC TECHNO SOLUTION ARCHITECTURE BLUEPRINT ===\n` +
                    `Workload Architecture: ${currentArch.workloadTitle}\n` +
                    `Cloud Platform: ${currentArch.cloudTitle}\n` +
                    `Database & Cache: ${currentArch.dbTitle}\n` +
                    `Security Policies: ${secSummary || 'Standard Zero-Trust'}\n` +
                    `Status: 99.99% Target SLA | Sub-45ms Latency\n` +
                    `Contact: ratanchaurasiya61@gmail.com | +91 63900 35039\n` +
                    `=================================================`;
                navigator.clipboard?.writeText(blueprintText).then(() => {
                    window.showRCToast?.("📋 Architecture blueprint copied to clipboard!");
                }).catch(() => {
                    window.showRCToast?.("Blueprint ready!");
                });
            });
        }

        updateArchUI();
    }

    /* --- Feature 2: "Before vs After" Evolution Slider Controller --- */
    const evoWrapper = document.getElementById('evolutionSliderWrapper');
    const evoBeforeLayer = document.getElementById('evolutionBeforeLayer');
    const evoHandle = document.getElementById('evolutionHandle');
    const evoBtns = document.querySelectorAll('.evolution-quick-toggles .evo-btn');

    if (evoWrapper && evoBeforeLayer && evoHandle) {
        let isDraggingEvo = false;

        function setEvoPosition(percent) {
            const clamped = Math.max(0, Math.min(100, percent));
            evoBeforeLayer.style.width = `${clamped}%`;
            evoHandle.style.left = `${clamped}%`;
        }

        function handleMove(clientX) {
            const rect = evoWrapper.getBoundingClientRect();
            const offset = clientX - rect.left;
            const percent = (offset / rect.width) * 100;
            setEvoPosition(percent);
        }

        evoWrapper.addEventListener('mousedown', (e) => {
            isDraggingEvo = true;
            handleMove(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDraggingEvo) return;
            handleMove(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            isDraggingEvo = false;
        });

        // Touch support for mobile devices
        evoWrapper.addEventListener('touchstart', (e) => {
            isDraggingEvo = true;
            if (e.touches[0]) handleMove(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDraggingEvo || !e.touches[0]) return;
            handleMove(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isDraggingEvo = false;
        });

        // Quick Preset buttons
        evoBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                evoBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const mode = btn.getAttribute('data-evo');
                if (mode === 'before') {
                    setEvoPosition(92);
                } else if (mode === 'after') {
                    setEvoPosition(8);
                } else {
                    setEvoPosition(50);
                }
            });
        });
    }

    /* --- Feature 3: 1-Click Mutual NDA Generator Controller --- */
    const ndaModal = document.getElementById('ndaModal');
    const openNdaBtns = document.querySelectorAll('.open-nda-modal-btn');
    const closeNdaBtn = document.getElementById('closeNdaModal');
    const ndaClientInput = document.getElementById('ndaClientName');
    const ndaCompanyInput = document.getElementById('ndaCompanyName');
    const ndaPartySpan = document.getElementById('ndaPartySpan');
    const ndaSigNameSpan = document.getElementById('ndaSigNameSpan');
    const ndaSigCompanySpan = document.getElementById('ndaSigCompanySpan');
    const printNdaBtn = document.getElementById('printNdaBtn');
    const confirmNdaWhatsAppBtn = document.getElementById('confirmNdaWhatsAppBtn');

    if (ndaModal) {
        openNdaBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                ndaModal.classList.add('show');
            });
        });

        if (closeNdaBtn) {
            closeNdaBtn.addEventListener('click', () => {
                ndaModal.classList.remove('show');
            });
        }

        ndaModal.addEventListener('click', (e) => {
            if (e.target === ndaModal) ndaModal.classList.remove('show');
        });

        function updateNdaPreview() {
            const clientName = ndaClientInput?.value.trim() || '[Client Legal Signatory]';
            const companyName = ndaCompanyInput?.value.trim() || '[Client Organization / Individual]';
            if (ndaPartySpan) ndaPartySpan.textContent = `${companyName} (represented by ${clientName})`;
            if (ndaSigNameSpan) ndaSigNameSpan.textContent = clientName;
            if (ndaSigCompanySpan) ndaSigCompanySpan.textContent = companyName;
        }

        if (ndaClientInput) ndaClientInput.addEventListener('input', updateNdaPreview);
        if (ndaCompanyInput) ndaCompanyInput.addEventListener('input', updateNdaPreview);

        if (printNdaBtn) {
            printNdaBtn.addEventListener('click', () => {
                const sheet = document.getElementById('ndaPreviewSheet');
                if (!sheet) return;
                const printWindow = window.open('', '_blank');
                if (!printWindow) {
                    window.showRCToast?.("Please allow popups to print/save NDA document");
                    return;
                }
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Mutual Non-Disclosure Agreement - RC Techno Solution</title>
                        <style>
                            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                            h2 { text-align: center; margin-bottom: 20px; }
                            .nda-sheet-header { border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; }
                            .nda-sheet-brand strong { font-size: 1.2rem; display: block; }
                            .nda-sheet-title { text-align: center; font-weight: bold; font-size: 1.1rem; margin: 20px 0 14px 0; }
                            .nda-sheet-parties { background: #f4f4f5; padding: 14px 18px; border-radius: 6px; margin-bottom: 18px; }
                            .nda-clauses p { margin: 12px 0; font-size: 0.95rem; }
                            .nda-signatures-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; border-top: 1px dashed #666; padding-top: 20px; }
                            .nda-sig-box { border-top: 2px solid #111; padding-top: 8px; }
                            .sig-seal { color: #059669; font-weight: bold; margin-top: 6px; font-size: 0.85rem; }
                        </style>
                    </head>
                    <body>
                        ${sheet.innerHTML}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                }, 350);
            });
        }

        if (confirmNdaWhatsAppBtn) {
            confirmNdaWhatsAppBtn.addEventListener('click', () => {
                const client = ndaClientInput?.value.trim() || 'Client Legal Signatory';
                const company = ndaCompanyInput?.value.trim() || 'Client Organization';
                const waMsg = encodeURIComponent(
                    `*Mutual Non-Disclosure Agreement (MNDA) Request*\n\n` +
                    `*Client Signatory:* ${client}\n` +
                    `*Company Name:* ${company}\n` +
                    `*Terms Verified:* 100% Client IP Retention, Mutual Confidentiality, 2-Year Term.\n\n` +
                    `Hello RC Techno Solution, I generated this mutual NDA and would like to confirm countersigning for our upcoming technical discovery.`
                );
                window.open(`https://wa.me/916390035039?text=${waMsg}`, '_blank');
                ndaModal.classList.remove('show');
                window.showRCToast?.("🛡️ NDA confirmation sent to WhatsApp!");
            });
        }
    }

});


    // Enterprise Guarantee Modal Logic
    const guaranteeModal = document.getElementById('guaranteeModal');
    const closeGuaranteeModal = document.getElementById('closeGuaranteeModal');
    const guaranteeModalTitle = document.getElementById('guaranteeModalTitle');
    const guaranteeModalBody = document.getElementById('guaranteeModalBody');
    const trustItems = document.querySelectorAll('.trust-item[data-guarantee]');

    const GUARANTEE_DETAILS = {
        ip: {
            title: '<i class="fas fa-shield-alt" style="color: #0084ff; margin-right: 8px;"></i> 100% Client IP Ownership',
            content: `
                <div style="padding: 4px 0;">
                    <div style="background: #eff6ff; border-left: 4px solid #0084ff; padding: 12px 14px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
                        <strong style="color: #1e40af; font-size: 0.92rem; display: block; margin-bottom: 4px;">Contractual Source Code & Patent Assignment</strong>
                        <p style="margin: 0; font-size: 0.85rem; color: #334155; line-height: 1.5;">Every line of frontend code, backend services, database schemas, DevOps scripts, and architecture blueprints authored by RC Techno Solutions becomes 100% your property upon milestone clearance.</p>
                    </div>
                    <ul style="font-size: 0.84rem; color: #475569; line-height: 1.6; padding-left: 20px; margin-bottom: 18px;">
                        <li><strong>Complete Repository Transfer:</strong> Full administrative rights to GitHub/GitLab repositories.</li>
                        <li><strong>Zero Proprietary Lock-In:</strong> Built with open-source, battle-tested modern standards.</li>
                        <li><strong>Worldwide Commercial Rights:</strong> Unlimited freedom to deploy, commercialize, or patent.</li>
                    </ul>
                    <a href="/nda" class="btn btn-primary" style="display: block; text-align: center; padding: 10px; border-radius: 8px; text-decoration: none;">Execute Instant Bilateral NDA</a>
                </div>
            `
        },
        sla: {
            title: '<i class="fas fa-award" style="color: #0084ff; margin-right: 8px;"></i> 60-Day Zero-Defect SLA Warranty',
            content: `
                <div style="padding: 4px 0;">
                    <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 14px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
                        <strong style="color: #15803d; font-size: 0.92rem; display: block; margin-bottom: 4px;">60-Day Post-Launch Technical Triage Pod</strong>
                        <p style="margin: 0; font-size: 0.85rem; color: #334155; line-height: 1.5;">Every release is backed by a contractual 60-calendar-day warranty. If any functional bug, edge-case failure, or performance regression appears, our senior team triages and patches it at zero cost.</p>
                    </div>
                    <ul style="font-size: 0.84rem; color: #475569; line-height: 1.6; padding-left: 20px; margin-bottom: 18px;">
                        <li><strong>Sub-Hour Critical Triage:</strong> Priority severity 1 issue escalation.</li>
                        <li><strong>Automated Regression Testing:</strong> Validated builds before production hotfixes.</li>
                        <li><strong>Direct Founder Oversight:</strong> Ratan Chaurasiya reviews and signs off on every production release.</li>
                    </ul>
                    <button type="button" class="btn btn-primary open-call-modal-btn" style="width: 100%; padding: 10px; border-radius: 8px;">Schedule Discovery Call</button>
                </div>
            `
        },
        nda: {
            title: '<i class="fas fa-file-shield" style="color: #0084ff; margin-right: 8px;"></i> Bilateral Mutual NDA Protection',
            content: `
                <div style="padding: 4px 0;">
                    <div style="background: #eff6ff; border-left: 4px solid #0084ff; padding: 12px 14px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
                        <strong style="color: #1e40af; font-size: 0.92rem; display: block; margin-bottom: 4px;">Immediate Legal Confidentiality</strong>
                        <p style="margin: 0; font-size: 0.85rem; color: #334155; line-height: 1.5;">Before any proprietary architecture, system data, or workflow requirements are exchanged, we execute an ironclad bilateral NDA protecting your trade secrets from day one.</p>
                    </div>
                    <ul style="font-size: 0.84rem; color: #475569; line-height: 1.6; padding-left: 20px; margin-bottom: 18px;">
                        <li><strong>Enterprise Compliance:</strong> Strict SOC2 & GDPR privacy protocols.</li>
                        <li><strong>Instant Digital Execution:</strong> Sign online in under 60 seconds with instant PDF download.</li>
                        <li><strong>Non-Disclosure & Non-Compete:</strong> Strict protection for confidential business logic.</li>
                    </ul>
                    <a href="/nda" class="btn btn-primary" style="display: block; text-align: center; padding: 10px; border-radius: 8px; text-decoration: none;">Sign Instant Online NDA</a>
                </div>
            `
        },
        support: {
            title: '<i class="fas fa-headset" style="color: #0084ff; margin-right: 8px;"></i> 24/7 Dedicated SLA Support',
            content: `
                <div style="padding: 4px 0;">
                    <div style="background: #faf5ff; border-left: 4px solid #9333ea; padding: 12px 14px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
                        <strong style="color: #7e22ce; font-size: 0.92rem; display: block; margin-bottom: 4px;">Dedicated Technical Engineering Pods</strong>
                        <p style="margin: 0; font-size: 0.85rem; color: #334155; line-height: 1.5;">Our engineering infrastructure pods provide 24/7 monitoring, automated telemetry alerts, and rapid disaster recovery to ensure 99.99% system availability.</p>
                    </div>
                    <ul style="font-size: 0.84rem; color: #475569; line-height: 1.6; padding-left: 20px; margin-bottom: 18px;">
                        <li><strong>Live System Health Telemetry:</strong> Real-time latency and uptime monitoring.</li>
                        <li><strong>Dedicated Architect Contact:</strong> Direct WhatsApp & phone escalation to technical leadership.</li>
                        <li><strong>Automated Backups & Failover:</strong> Multi-region cloud disaster recovery ready.</li>
                    </ul>
                    <a href="https://wa.me/916390035039?text=Hi%20Ratan,%20I'd%20like%20to%20discuss%20enterprise%20support" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: block; text-align: center; padding: 10px; border-radius: 8px; text-decoration: none; background: #25d366; border-color: #25d366;">Connect via Direct WhatsApp</a>
                </div>
            `
        }
    };

    if (guaranteeModal && trustItems.length) {
        trustItems.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.getAttribute('data-guarantee');
                const info = GUARANTEE_DETAILS[type];
                if (info && guaranteeModalTitle && guaranteeModalBody) {
                    guaranteeModalTitle.innerHTML = info.title;
                    guaranteeModalBody.innerHTML = info.content;
                    guaranteeModal.classList.add('open');
                    
                    // Wire any open-call-modal-btn inside dynamic body
                    guaranteeModalBody.querySelectorAll('.open-call-modal-btn').forEach(b => {
                        b.addEventListener('click', () => {
                            guaranteeModal.classList.remove('open');
                            const cm = document.getElementById('callModal');
                            if (cm) cm.classList.add('open');
                        });
                    });
                }
            });
        });

        if (closeGuaranteeModal) {
            closeGuaranteeModal.addEventListener('click', () => guaranteeModal.classList.remove('open'));
        }

        guaranteeModal.addEventListener('click', (e) => {
            if (e.target === guaranteeModal) guaranteeModal.classList.remove('open');
        });
    }

    // Dynamic Counter Animation for Metrics Bar
    const counterElements = document.querySelectorAll('.counter-val');
    if (counterElements.length && 'IntersectionObserver' in window) {
        let hasAnimated = false;
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    counterElements.forEach(counter => {
                        const target = parseFloat(counter.getAttribute('data-target') || '0');
                        const suffix = counter.getAttribute('data-suffix') || '';
                        const isDecimal = target % 1 !== 0;
                        const duration = 1200;
                        const startTime = performance.now();

                        function updateCount(currentTime) {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            // Ease out quad
                            const easeProgress = 1 - (1 - progress) * (1 - progress);
                            const currentVal = target * easeProgress;

                            counter.innerText = (isDecimal ? currentVal.toFixed(1) : Math.round(currentVal)) + suffix;

                            if (progress < 1) {
                                requestAnimationFrame(updateCount);
                            } else {
                                counter.innerText = (isDecimal ? target.toFixed(1) : target) + suffix;
                            }
                        }
                        requestAnimationFrame(updateCount);
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        const metricsSection = document.querySelector('.home-metrics-bar');
        if (metricsSection) counterObserver.observe(metricsSection);
    }
