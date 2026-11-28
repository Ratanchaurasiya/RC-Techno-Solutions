/**
 * RC Techno Solutions - Demo Request Management System (CRM Module)
 * Universal Client-Side Integration & Modal Handler
 */

(function () {
    'use strict';

    // 1. Ensure CSS is loaded
    function injectStyles() {
        if (!document.getElementById('demo-modal-css')) {
            const link = document.createElement('link');
            link.id = 'demo-modal-css';
            link.rel = 'stylesheet';
            link.href = '/css/demo-modal.css';
            document.head.appendChild(link);
        }
    }

    // Default enterprise projects & software catalog for dropdown
    const DEMO_PROJECT_CATALOG = [
        'Custom ERP Management Software',
        'Restaurant POS & Kitchen Display (KDS)',
        'Hospital & Clinic OPD Management',
        'School & University Campus ERP',
        'Logistics & Fleet Telematics Management',
        'Construction & Infra Project Platform',
        'Real Estate CRM & Property Portal',
        'FinTech Multi-Tenant Core Banking System',
        'AI Autonomous Agent Decision Engine',
        'E-Commerce Multi-Vendor Marketplace',
        'Custom Enterprise Web Application'
    ];

    // Page-specific auto-detection mapping
    function detectPageProject() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('service-custom-software')) return 'Custom Software Development';
        if (path.includes('service-enterprise-systems')) return 'Custom ERP Management Software';
        if (path.includes('service-ecommerce')) return 'E-Commerce Multi-Vendor Marketplace';
        if (path.includes('service-ai-agents') || path.includes('service-ai-applications')) return 'AI Autonomous Agent Decision Engine';
        if (path.includes('service-business-systems')) return 'Custom ERP Management Software';
        if (path.includes('service-web-app')) return 'Custom Enterprise Web Application';
        if (path.includes('service-database-design')) return 'Enterprise Database & Cloud Architecture';
        if (path.includes('service-api-integration')) return 'High-Concurrency API Gateway & Integration';
        if (path.includes('service-cloud')) return 'Cloud Infrastructure & DevOps Solution';
        return '';
    }

    // 2. Build Modal Markup
    function buildModalHtml() {
        if (document.getElementById('demoRequestModal')) return;

        const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];

        const optionsHtml = DEMO_PROJECT_CATALOG.map(p => `<option value="${p}">${p}</option>`).join('\n');

        const modalDiv = document.createElement('div');
        modalDiv.id = 'demoRequestModal';
        modalDiv.setAttribute('role', 'dialog');
        modalDiv.setAttribute('aria-modal', 'true');
        modalDiv.setAttribute('aria-labelledby', 'demoModalTitle');

        modalDiv.innerHTML = `
            <div class="demo-modal-card">
                <div class="demo-modal-header">
                    <div class="demo-modal-header-info">
                        <div class="demo-badge-pill"><i class="fas fa-play-circle"></i> Live Interactive Walkthrough</div>
                        <h3 class="demo-modal-title" id="demoModalTitle">Schedule a <span>Live Demo</span></h3>
                        <p class="demo-modal-subtitle">Experience our enterprise architecture firsthand. Our solutions team will provide a 1-on-1 personalized technical demo session.</p>
                    </div>
                    <button type="button" class="demo-modal-close" id="btnDemoModalClose" aria-label="Close dialog">&times;</button>
                </div>

                <div class="demo-modal-body" id="demoModalBody">
                    <div id="demoFormAlert" style="display: none; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 14px;"></div>

                    <form id="demoRequestForm" novalidate>
                        <!-- Anti-spam Honeypot -->
                        <input type="text" name="websiteUrl_hp" id="demo_websiteUrl_hp" style="display:none !important;" tabindex="-1" autocomplete="off" />

                        <div class="demo-form-grid">
                            <!-- Full Name -->
                            <div class="demo-form-group">
                                <label class="demo-form-label" for="demoFullName">Your Full Name <span class="req">*</span></label>
                                <div class="demo-input-wrap">
                                    <i class="fas fa-user prefix-icon"></i>
                                    <input type="text" id="demoFullName" class="demo-input" placeholder="e.g. Ratan Chaurasiya" required />
                                </div>
                            </div>

                            <!-- Company Name -->
                            <div class="demo-form-group">
                                <label class="demo-form-label" for="demoCompanyName">Company / Organization <span class="req">*</span></label>
                                <div class="demo-input-wrap">
                                    <i class="fas fa-building prefix-icon"></i>
                                    <input type="text" id="demoCompanyName" class="demo-input" placeholder="e.g. Nexus Tech Ltd" required />
                                </div>
                            </div>

                            <!-- Business Email -->
                            <div class="demo-form-group">
                                <label class="demo-form-label" for="demoEmail">Business Email <span class="req">*</span></label>
                                <div class="demo-input-wrap">
                                    <i class="fas fa-envelope prefix-icon"></i>
                                    <input type="email" id="demoEmail" class="demo-input" placeholder="name@company.com" required />
                                </div>
                            </div>

                            <!-- Direct Phone / WhatsApp -->
                            <div class="demo-form-group">
                                <label class="demo-form-label" for="demoPhone">Phone / WhatsApp Number <span class="req">*</span></label>
                                <div class="demo-input-wrap">
                                    <i class="fas fa-phone-alt prefix-icon"></i>
                                    <input type="tel" id="demoPhone" class="demo-input" placeholder="+91 98765 43210" required />
                                </div>
                            </div>

                            <!-- Project / Software Selection (Auto Pre-selected) -->
                            <div class="demo-form-group demo-form-col-2">
                                <label class="demo-form-label" for="demoProjectSelect">Project / Software Solution <span class="req">*</span></label>
                                <div class="demo-input-wrap">
                                    <i class="fas fa-cubes prefix-icon"></i>
                                    <select id="demoProjectSelect" class="demo-select" required>
                                        <option value="" disabled selected>-- Select Solution to Demo --</option>
                                        ${optionsHtml}
                                        <option value="Other / Custom Solution">Other / Custom Enterprise Solution</option>
                                    </select>
                                </div>
                                <span class="demo-field-hint">Automatically pre-selected based on the solution you are reviewing.</span>
                            </div>

                            <!-- Company Type -->
                            <div class="demo-form-group">
                                <label class="demo-form-label" for="demoCompanyType">Company Category</label>
                                <div class="demo-input-wrap">
                                    <i class="fas fa-industry prefix-icon"></i>
                                    <select id="demoCompanyType" class="demo-select">
                                        <option value="Enterprise">Enterprise (500+ employees)</option>
                                        <option value="SME / Mid-Market">SME / Mid-Market</option>
                                        <option value="Funded Startup">Growing / Funded Startup</option>
                                        <option value="Healthcare / Clinic">Healthcare / Clinic</option>
                                        <option value="Restaurant / Hospitality">Restaurant / Hospitality</option>
                                        <option value="Educational Institution">Educational Institution</option>
                                        <option value="Logistics & Freight">Logistics & Supply Chain</option>
                                        <option value="Consulting / IT Services">Consulting / IT Services</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Employee Count -->
                            <div class="demo-form-group">
                                <label class="demo-form-label" for="demoEmployeeCount">Company Size</label>
                                <div class="demo-input-wrap">
                                    <i class="fas fa-users prefix-icon"></i>
                                    <select id="demoEmployeeCount" class="demo-select">
                                        <option value="1-10">1 - 10 Employees</option>
                                        <option value="11-50" selected>11 - 50 Employees</option>
                                        <option value="51-200">51 - 200 Employees</option>
                                        <option value="201-500">201 - 500 Employees</option>
                                        <option value="500+">500+ Employees</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Preferred Demo Date -->
                            <div class="demo-form-group">
                                <label class="demo-form-label" for="demoPreferredDate">Preferred Demo Date</label>
                                <div class="demo-input-wrap">
                                    <i class="fas fa-calendar-alt prefix-icon"></i>
                                    <input type="date" id="demoPreferredDate" class="demo-input" min="${tomorrow}" value="${tomorrow}" />
                                </div>
                            </div>

                            <!-- Preferred Time Slot -->
                            <div class="demo-form-group">
                                <label class="demo-form-label" for="demoPreferredTime">Preferred Time Slot</label>
                                <div class="demo-input-wrap">
                                    <i class="fas fa-clock prefix-icon"></i>
                                    <select id="demoPreferredTime" class="demo-select">
                                        <option value="Morning (10:00 AM - 12:00 PM IST)" selected>Morning (10:00 AM - 12:00 PM IST)</option>
                                        <option value="Afternoon (2:00 PM - 4:00 PM IST)">Afternoon (2:00 PM - 4:00 PM IST)</option>
                                        <option value="Evening (4:00 PM - 6:00 PM IST)">Evening (4:00 PM - 6:00 PM IST)</option>
                                        <option value="Custom Time (Specified in Notes)">Custom Time (Specified in Notes)</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Additional Requirements -->
                            <div class="demo-form-group demo-form-col-2">
                                <label class="demo-form-label" for="demoRequirements">Specific Technical Requirements / Current Pain Points</label>
                                <textarea id="demoRequirements" class="demo-textarea" placeholder="Tell us about your active workflows, deployment preferences (Cloud/On-premise), or specific integrations needed..."></textarea>
                            </div>
                        </div>

                        <!-- Security & Trust Indicators -->
                        <div class="demo-trust-strip">
                            <div class="demo-trust-item"><i class="fas fa-lock"></i> Bilateral Mutual NDA Available</div>
                            <div class="demo-trust-item"><i class="fas fa-video"></i> Direct Google Meet Session</div>
                            <div class="demo-trust-item"><i class="fas fa-shield-alt"></i> Zero Technical Debt Guarantee</div>
                        </div>

                        <div class="demo-modal-footer" style="padding: 16px 0 0 0; border: none; margin-top: 14px;">
                            <div style="font-size: 0.72rem; color: #64748b;">
                                <i class="fas fa-info-circle"></i> No credit card required. Confirmation sent via Email &amp; WhatsApp.
                            </div>
                            <button type="submit" class="demo-btn-submit" id="btnSubmitDemo">
                                <span>Request Live Demo</span>
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);

        // Bind events
        document.getElementById('btnDemoModalClose').addEventListener('click', window.closeDemoModal);
        modalDiv.addEventListener('click', function (e) {
            if (e.target === modalDiv) window.closeDemoModal();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modalDiv.classList.contains('active')) {
                window.closeDemoModal();
            }
        });

        // Form Submit Handler
        document.getElementById('demoRequestForm').addEventListener('submit', handleDemoSubmit);
    }

    // 3. Open Demo Modal
    window.openDemoModal = function (projectName = '', options = {}) {
        injectStyles();
        buildModalHtml();

        const modal = document.getElementById('demoRequestModal');
        const select = document.getElementById('demoProjectSelect');

        // Resolve Project Name: parameter > detected page
        let targetProject = projectName || detectPageProject();

        if (targetProject && select) {
            let matched = false;
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value.toLowerCase().includes(targetProject.toLowerCase()) ||
                    targetProject.toLowerCase().includes(select.options[i].value.toLowerCase())) {
                    select.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                // Add dynamically as custom option
                const customOpt = document.createElement('option');
                customOpt.value = targetProject;
                customOpt.textContent = targetProject;
                customOpt.selected = true;
                select.appendChild(customOpt);
            }
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const firstInput = document.getElementById('demoFullName');
            if (firstInput) firstInput.focus();
        }, 100);
    };

    // 4. Close Demo Modal
    window.closeDemoModal = function () {
        const modal = document.getElementById('demoRequestModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // 5. Form Submission Handler
    async function handleDemoSubmit(e) {
        e.preventDefault();

        const alertBox = document.getElementById('demoFormAlert');
        const submitBtn = document.getElementById('btnSubmitDemo');
        const hp = document.getElementById('demo_websiteUrl_hp').value;

        // Anti-spam honeypot
        if (hp) {
            window.closeDemoModal();
            return;
        }

        const fullName = document.getElementById('demoFullName').value.trim();
        const companyName = document.getElementById('demoCompanyName').value.trim();
        const email = document.getElementById('demoEmail').value.trim();
        const phone = document.getElementById('demoPhone').value.trim();
        const projectName = document.getElementById('demoProjectSelect').value;
        const companyType = document.getElementById('demoCompanyType').value;
        const employeeCount = document.getElementById('demoEmployeeCount').value;
        const preferredDate = document.getElementById('demoPreferredDate').value;
        const preferredTime = document.getElementById('demoPreferredTime').value;
        const additionalRequirements = document.getElementById('demoRequirements').value.trim();

        // Client-side validations
        if (!fullName || fullName.length < 2) {
            showAlert('Please enter your full name.', 'error');
            document.getElementById('demoFullName').focus();
            return;
        }
        if (!companyName) {
            showAlert('Please enter your company or organization name.', 'error');
            document.getElementById('demoCompanyName').focus();
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            showAlert('Please enter a valid business email address.', 'error');
            document.getElementById('demoEmail').focus();
            return;
        }
        if (!phone || phone.replace(/\D/g, '').length < 8) {
            showAlert('Please enter a valid contact phone or WhatsApp number.', 'error');
            document.getElementById('demoPhone').focus();
            return;
        }
        if (!projectName) {
            showAlert('Please choose the project or solution you wish to demo.', 'error');
            document.getElementById('demoProjectSelect').focus();
            return;
        }

        // UI state: loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering Schedule...';
        alertBox.style.display = 'none';

        try {
            const response = await fetch('/api/demo/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName,
                    companyName,
                    email,
                    phone,
                    projectName,
                    companyType,
                    employeeCount,
                    preferredDate,
                    preferredTime,
                    additionalRequirements
                })
            });

            const result = await response.json();

            if (result.success) {
                renderSuccessState(result.referenceId || 'RCTS-DEMO-2026', fullName, projectName, preferredDate, preferredTime);
            } else {
                showAlert(result.error || 'Failed to submit demo request. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Request Live Demo</span> <i class="fas fa-arrow-right"></i>';
            }
        } catch (err) {
            console.error('Demo submission error:', err);
            showAlert('Network error. Please check your connection and try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Request Live Demo</span> <i class="fas fa-arrow-right"></i>';
        }
    }

    function showAlert(msg, type) {
        const alertBox = document.getElementById('demoFormAlert');
        if (!alertBox) return;
        alertBox.textContent = msg;
        alertBox.style.display = 'block';
        if (type === 'error') {
            alertBox.style.background = '#fee2e2';
            alertBox.style.color = '#b91c1c';
            alertBox.style.border = '1px solid #fca5a5';
        } else {
            alertBox.style.background = '#dcfce7';
            alertBox.style.color = '#15803d';
            alertBox.style.border = '1px solid #86efac';
        }
    }

    function renderSuccessState(refId, fullName, projectName, date, time) {
        const body = document.getElementById('demoModalBody');
        body.innerHTML = `
            <div class="demo-success-view">
                <div class="demo-success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <h3 class="demo-success-title">Demo Request Confirmed!</h3>
                <p style="font-size: 0.88rem; color: #64748b; max-width: 480px; margin: 0 auto 18px; line-height: 1.5;">
                    Thank you, <strong>${fullName}</strong>. Our solutions team has received your demo booking for <strong>${projectName}</strong>.
                </p>

                <div class="demo-success-ref-card">
                    <div>
                        <div style="font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">Reference Number</div>
                        <div class="demo-ref-val" id="dispDemoRef">${refId}</div>
                    </div>
                    <button type="button" class="demo-copy-btn" id="btnCopyDemoRef">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>

                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px; max-width: 440px; margin: 0 auto 24px; text-align: left; font-size: 0.82rem; color: #1e3a8a;">
                    <div style="display: flex; gap: 8px; margin-bottom: 6px;">
                        <i class="fas fa-calendar-check" style="color: #0084ff; margin-top: 2px;"></i>
                        <div><strong>Requested Slot:</strong> ${date || 'Upcoming Business Day'} &bull; ${time}</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <i class="fas fa-video" style="color: #0084ff; margin-top: 2px;"></i>
                        <div>A personalized <strong>Google Meet</strong> calendar invitation will be dispatched to your email.</div>
                    </div>
                </div>

                <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                    <a href="https://wa.me/916390035039?text=Hi%20Ratan,%20I%20have%20scheduled%20a%20demo%20for%20${encodeURIComponent(projectName)}%20(Ref:%20${encodeURIComponent(refId)})." target="_blank" rel="noopener" class="demo-btn-submit" style="text-decoration: none; background: #25d366;">
                        <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                    </a>
                    <button type="button" class="demo-copy-btn" style="padding: 12px 20px; font-size: 0.85rem;" onclick="window.closeDemoModal()">
                        Done / Close
                    </button>
                </div>
            </div>
        `;

        document.getElementById('btnCopyDemoRef').addEventListener('click', function () {
            navigator.clipboard.writeText(refId).then(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            });
        });
    }

    // 6. Global Click Delegation for Demo Buttons
    document.addEventListener('click', function (e) {
        const trigger = e.target.closest('[data-demo-project], .btn-request-demo, [data-open-demo]');
        if (trigger) {
            e.preventDefault();
            const project = trigger.getAttribute('data-demo-project') ||
                trigger.getAttribute('data-project-name') ||
                trigger.closest('.portfolio-card')?.querySelector('.portfolio-card-title')?.textContent?.trim() ||
                '';
            window.openDemoModal(project);
        }
    });

    // Auto initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }
})();
