/**
 * RC Techno Solutions - Premium Corporate Workspace Gallery & Fullscreen Lightbox
 * Modern Responsive Grid, Touch Swipe, Keyboard Navigation & Incremental Pagination
 */

(function () {
    'use strict';

    function initCorporateGallery() {
        const grid = document.querySelector('.corporate-gallery-grid, #officeGalleryGrid');
        if (!grid) return;

        // Ensure grid has class corporate-gallery-grid
        grid.classList.add('corporate-gallery-grid');

        const cards = Array.from(grid.querySelectorAll('.corporate-photo-card, .gallery-item'));
        if (!cards.length) return;

        // Ensure cards have proper class
        cards.forEach((card, index) => {
            card.classList.add('corporate-photo-card');
            card.setAttribute('data-gallery-idx', index);
        });

        const filterBtns = document.querySelectorAll('.gallery-category-bar .gallery-cat-btn');
        let loadMoreBtn = document.getElementById('galleryLoadMoreBtn') || document.querySelector('.btn-corporate-load-more');
        let allLoadedBadge = document.getElementById('galleryAllLoadedMsg') || document.querySelector('.corporate-all-loaded-badge');
        let loadMoreText = document.getElementById('galleryLoadText');
        let loadMoreIcon = document.getElementById('galleryLoadIcon');
        let loadMoreSpinner = document.getElementById('galleryLoadSpinner');
        let allLoadedText = document.getElementById('galleryAllLoadedText');

        const PAGE_SIZE = 4;
        let visibleCount = PAGE_SIZE;
        let activeCategory = 'all';

        // Extract structured metadata for all cards
        function getCardData(card) {
            const img = card.querySelector('img');
            const titleEl = card.querySelector('.corporate-caption-title, .gallery-card-title');
            const descEl = card.querySelector('.corporate-caption-desc, .gallery-card-desc');
            const badgeEl = card.querySelector('.corporate-cat-pill, .gallery-category-pill, .gallery-space-badge');
            const category = card.getAttribute('data-category') || 'overview';

            const src = img ? (img.getAttribute('data-full-src') || img.getAttribute('src')) : '';
            const alt = img ? (img.getAttribute('alt') || 'RC Techno Solutions Workspace') : 'Workspace';
            const title = titleEl ? titleEl.textContent.trim() : alt;
            const desc = descEl ? descEl.textContent.trim() : '';
            const badge = badgeEl ? badgeEl.textContent.trim().replace(/^.*?\s+/, '') : 'Office Environment';

            return {
                card,
                src,
                alt,
                title,
                desc,
                badge: badge || 'Workspace Space',
                category
            };
        }

        const allItems = cards.map(getCardData);

        function getFilteredItems() {
            if (activeCategory === 'all') return allItems;
            return allItems.filter(item => item.category === activeCategory);
        }

        function renderGrid() {
            const filtered = getFilteredItems();
            const total = filtered.length;

            allItems.forEach(item => {
                const isMatching = (activeCategory === 'all' || item.category === activeCategory);
                if (!isMatching) {
                    item.card.style.setProperty('display', 'none', 'important');
                    item.card.classList.remove('is-visible');
                }
            });

            filtered.forEach((item, index) => {
                if (index < visibleCount) {
                    item.card.style.removeProperty('display');
                    item.card.classList.add('is-visible');
                } else {
                    item.card.style.setProperty('display', 'none', 'important');
                    item.card.classList.remove('is-visible');
                }
            });

            // Update Load More Controls
            const remaining = total - visibleCount;

            if (loadMoreBtn && allLoadedBadge) {
                if (remaining > 0) {
                    loadMoreBtn.style.setProperty('display', 'inline-flex', 'important');
                    allLoadedBadge.style.setProperty('display', 'none', 'important');
                    if (loadMoreText) {
                        loadMoreText.textContent = `Load More Workspaces (${remaining} Remaining)`;
                    }
                } else {
                    loadMoreBtn.style.setProperty('display', 'none', 'important');
                    allLoadedBadge.style.setProperty('display', 'inline-flex', 'important');
                    if (allLoadedText) {
                        const activeBtn = document.querySelector('.gallery-category-bar .gallery-cat-btn.active');
                        const label = activeBtn && activeCategory !== 'all' ? activeBtn.textContent.trim() : 'Workspaces';
                        allLoadedText.textContent = `All ${total} ${label} Displayed`;
                    }
                }
            }
        }

        // Category Filtering
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                activeCategory = this.getAttribute('data-cat') || 'all';
                visibleCount = PAGE_SIZE; // reset to 4 on tab switch
                renderGrid();
            });
        });

        // Load More button handler
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (loadMoreSpinner && loadMoreIcon) {
                    loadMoreSpinner.style.setProperty('display', 'inline-block', 'important');
                    loadMoreIcon.style.setProperty('display', 'none', 'important');
                }
                loadMoreBtn.disabled = true;

                setTimeout(() => {
                    visibleCount += PAGE_SIZE;
                    renderGrid();
                    if (loadMoreSpinner && loadMoreIcon) {
                        loadMoreSpinner.style.setProperty('display', 'none', 'important');
                        loadMoreIcon.style.removeProperty('display');
                    }
                    loadMoreBtn.disabled = false;
                }, 160);
            });
        }

        // -------------------------------------------------------------
        // FULLSCREEN LIGHTBOX CONTROLLER
        // -------------------------------------------------------------
        let lightbox = document.getElementById('corporateLightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'corporateLightbox';
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-modal', 'true');
            lightbox.setAttribute('aria-label', 'Office Workspace Photo Viewer');
            lightbox.innerHTML = `
                <div class="lightbox-topbar">
                    <div class="lightbox-meta-wrap">
                        <span class="lightbox-badge" id="corporateLightboxBadge">Office Overview</span>
                        <h3 class="lightbox-heading" id="corporateLightboxHeading">Modern Open-Concept Development Floor</h3>
                    </div>
                    <div class="lightbox-actions">
                        <span class="lightbox-counter" id="corporateLightboxCounter">1 of 12</span>
                        <button type="button" class="lightbox-btn-icon lightbox-btn-close" id="corporateLightboxClose" aria-label="Close Lightbox (Esc)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="lightbox-stage" id="corporateLightboxStage">
                    <button type="button" class="lightbox-arrow lightbox-arrow-prev" id="corporateLightboxPrev" aria-label="Previous Photo (Left Arrow)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="lightbox-image-container" id="corporateLightboxImgContainer">
                        <img class="lightbox-img" id="corporateLightboxImg" src="" alt="Office Photo" />
                    </div>
                    <button type="button" class="lightbox-arrow lightbox-arrow-next" id="corporateLightboxNext" aria-label="Next Photo (Right Arrow)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div class="lightbox-footer">
                    <p class="lightbox-desc" id="corporateLightboxDesc">A transparent look into our workspace and development environment.</p>
                    <div class="lightbox-hints">
                        <span><kbd>←</kbd> <kbd>→</kbd> Navigate</span>
                        <span><kbd>ESC</kbd> Close</span>
                        <span>Swipe on Mobile</span>
                    </div>
                </div>
            `;
            document.body.appendChild(lightbox);
        }

        const lbBadge = document.getElementById('corporateLightboxBadge');
        const lbHeading = document.getElementById('corporateLightboxHeading');
        const lbCounter = document.getElementById('corporateLightboxCounter');
        const lbImg = document.getElementById('corporateLightboxImg');
        const lbDesc = document.getElementById('corporateLightboxDesc');
        const lbClose = document.getElementById('corporateLightboxClose');
        const lbPrev = document.getElementById('corporateLightboxPrev');
        const lbNext = document.getElementById('corporateLightboxNext');
        const lbStage = document.getElementById('corporateLightboxStage');

        let currentActiveList = [];
        let currentLbIndex = 0;

        function updateLightboxView(index) {
            if (!currentActiveList.length) return;
            if (index < 0) index = currentActiveList.length - 1;
            if (index >= currentActiveList.length) index = 0;
            currentLbIndex = index;

            const item = currentActiveList[currentLbIndex];

            // Smooth image swap with subtle opacity fade
            lbImg.style.opacity = '0.3';
            lbImg.src = item.src;
            lbImg.alt = item.alt;

            lbImg.onload = () => {
                lbImg.style.opacity = '1';
            };

            if (lbBadge) lbBadge.textContent = item.badge;
            if (lbHeading) lbHeading.textContent = item.title;
            if (lbDesc) lbDesc.textContent = item.desc || item.title;
            if (lbCounter) lbCounter.textContent = `${currentLbIndex + 1} of ${currentActiveList.length}`;
        }

        function openLightbox(itemIndexInFiltered) {
            currentActiveList = getFilteredItems();
            if (!currentActiveList.length) return;

            updateLightboxView(itemIndexInFiltered);
            lightbox.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('is-open');
            document.body.style.removeProperty('overflow');
        }

        // Attach Card Click Event to Open Lightbox
        allItems.forEach(item => {
            item.card.addEventListener('click', function (e) {
                // If clicked an anchor tag inside, let it navigate
                if (e.target.closest('a')) return;

                const filtered = getFilteredItems();
                const idxInFiltered = filtered.findIndex(f => f.card === item.card);
                if (idxInFiltered !== -1) {
                    openLightbox(idxInFiltered);
                } else {
                    openLightbox(0);
                }
            });
        });

        // Navigation button events
        if (lbPrev) {
            lbPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                updateLightboxView(currentLbIndex - 1);
            });
        }

        if (lbNext) {
            lbNext.addEventListener('click', (e) => {
                e.stopPropagation();
                updateLightboxView(currentLbIndex + 1);
            });
        }

        if (lbClose) {
            lbClose.addEventListener('click', (e) => {
                e.stopPropagation();
                closeLightbox();
            });
        }

        // Click on background overlay/stage to close (outside image and buttons)
        if (lbStage) {
            lbStage.addEventListener('click', (e) => {
                if (e.target === lbStage || e.target.id === 'corporateLightboxImgContainer') {
                    closeLightbox();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                updateLightboxView(currentLbIndex - 1);
            } else if (e.key === 'ArrowRight') {
                updateLightboxView(currentLbIndex + 1);
            }
        });

        // Touch Swipe Navigation for Mobile Devices
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        if (lbStage) {
            lbStage.addEventListener('touchstart', (e) => {
                if (!e.touches.length) return;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            lbStage.addEventListener('touchend', (e) => {
                if (!e.changedTouches.length) return;
                touchEndX = e.changedTouches[0].clientX;
                touchEndY = e.changedTouches[0].clientY;
                handleSwipeGesture();
            }, { passive: true });
        }

        function handleSwipeGesture() {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 40;

            // Ensure horizontal swipe is dominant
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX < 0) {
                    // Swiped Left -> Next image
                    updateLightboxView(currentLbIndex + 1);
                } else {
                    // Swiped Right -> Previous image
                    updateLightboxView(currentLbIndex - 1);
                }
            }
        }

        // Initial Grid Render
        renderGrid();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCorporateGallery);
    } else {
        initCorporateGallery();
    }
})();
