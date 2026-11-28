const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const dbStore = require('./db-store');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.xml': 'application/xml; charset=UTF-8',
    '.txt': 'text/plain; charset=UTF-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline' https: http: data: blob:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; media-src 'self' data: https: blob:; connect-src 'self' https: http: ws:;"
};

// Route aliases mapping for all 35 pages
const ROUTE_ALIASES = {
    '/': '/index.html',
    '/work': '/portfolio.html',
    '/portfolio': '/portfolio.html',
    '/architecture': '/architecture.html',
    '/nda': '/nda.html',
    '/services': '/services.html',
    '/about': '/about.html',
    '/gallery': '/gallery.html',
    '/internship': '/internship.html',
    '/admin': '/admin.html',
    '/faq': '/faq.html',
    '/contact': '/contact.html',
    '/team': '/team.html',
    '/testimonials': '/testimonials.html',
    '/privacy': '/privacy.html',
    '/terms': '/terms.html',
    '/404': '/404.html',
    '/verify-certificate': '/verify-certificate.html',
    '/service-website-development': '/service-website-development.html',
    '/service-web-app-development': '/service-web-app-development.html',
    '/service-custom-software': '/service-custom-software.html',
    '/service-enterprise-systems': '/service-enterprise-systems.html',
    '/service-ecommerce': '/service-ecommerce.html',
    '/service-ai-applications': '/service-ai-applications.html',
    '/service-ai-agents': '/service-ai-agents.html',
    '/service-data-analytics': '/service-data-analytics.html',
    '/service-cloud-consulting': '/service-cloud-consulting.html',
    '/service-cloud-deployment': '/service-cloud-deployment.html',
    '/service-devops': '/service-devops.html',
    '/service-database-design': '/service-database-design.html',
    '/service-api-integration': '/service-api-integration.html',
    '/service-business-systems': '/service-business-systems.html',
    '/service-ui-ux': '/service-ui-ux.html',
    '/service-security': '/service-security.html',
    '/service-performance': '/service-performance.html',
    '/service-website-maintenance': '/service-website-maintenance.html'
};

function send404(res) {
    const errorPagePath = path.join(__dirname, '404.html');
    fs.readFile(errorPagePath, (err, data) => {
        if (!err && data) {
            const headers = Object.assign({}, SECURITY_HEADERS, {
                'Content-Type': 'text/html; charset=UTF-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            });
            res.writeHead(404, headers);
            res.end(data);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h1>404 - Page Not Found</h1><p>The requested resource could not be found.</p><a href="/">Return to Home</a></body></html>');
        }
    });
}

function parseJsonBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
        if (body.length > 5e6) { // 5MB limit
            req.connection.destroy();
        }
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body || '{}');
            callback(null, data);
        } catch (e) {
            callback(e, null);
        }
    });
}

// Multipart parser for Internship Application with PDF resume
function parseMultipartForm(req, callback) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
        return parseJsonBody(req, callback);
    }

    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) {
        return callback(new Error('No multipart boundary found'), null);
    }
    const boundary = boundaryMatch[1] || boundaryMatch[2];

    const chunks = [];
    req.on('data', chunk => {
        chunks.push(chunk);
    });

    req.on('end', () => {
        try {
            const buffer = Buffer.concat(chunks);
            const boundaryBuffer = Buffer.from('--' + boundary);
            const fields = {};
            let fileInfo = null;

            let start = 0;
            while (start < buffer.length) {
                const bIndex = buffer.indexOf(boundaryBuffer, start);
                if (bIndex === -1) break;

                const nextBIndex = buffer.indexOf(boundaryBuffer, bIndex + boundaryBuffer.length);
                if (nextBIndex === -1) break;

                const part = buffer.slice(bIndex + boundaryBuffer.length, nextBIndex);
                const headerEnd = part.indexOf('\r\n\r\n');
                if (headerEnd !== -1) {
                    const headerStr = part.slice(0, headerEnd).toString('utf8');
                    const body = part.slice(headerEnd + 4, part.length - 2); // strip trailing \r\n

                    const nameMatch = headerStr.match(/name="([^"]+)"/i);
                    const filenameMatch = headerStr.match(/filename="([^"]+)"/i);

                    if (nameMatch) {
                        const fieldName = nameMatch[1];
                        if (filenameMatch && filenameMatch[1]) {
                            const originalName = filenameMatch[1];
                            const ext = path.extname(originalName).toLowerCase();
                            const safeFilename = 'resume_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + ext;
                            const savePath = path.join(__dirname, 'uploads', 'resumes', safeFilename);

                            fs.writeFileSync(savePath, body);
                            fileInfo = {
                                originalName,
                                filename: safeFilename,
                                url: '/uploads/resumes/' + safeFilename,
                                size: body.length
                            };
                            fields[fieldName] = fileInfo.url;
                        } else {
                            fields[fieldName] = body.toString('utf8').trim();
                        }
                    }
                }
                start = nextBIndex;
            }

            if (fileInfo) {
                fields.resumeFile = fileInfo;
            }
            callback(null, fields);
        } catch (e) {
            callback(e, null);
        }
    });
}

const server = http.createServer((req, res) => {
    const cleanUrl = req.url.split('?')[0];

    // Helper send JSON
    const sendJson = (statusCode, data) => {
        res.writeHead(statusCode, Object.assign({}, SECURITY_HEADERS, { 'Content-Type': 'application/json' }));
        res.end(JSON.stringify(data));
    };

    // Helper auth check
    const checkAuth = () => {
        const auth = req.headers['authorization'] || '';
        if (auth.startsWith('Bearer ') && auth.length > 10) {
            return true;
        }
        return false;
    };

    // ------------------------------------------------------------------
    // API ENDPOINTS
    // ------------------------------------------------------------------

    // 1. Internship Application Submission
    if (req.method === 'POST' && req.url === '/api/internship/apply') {
        parseMultipartForm(req, async (err, data) => {
            if (err || !data) {
                return sendJson(400, { success: false, error: 'Invalid form submission or corrupted file upload.' });
            }

            // Anti-spam Honeypot
            if (data.student_trap) {
                return sendJson(200, { success: true, message: 'Application received.' });
            }

            const sanitize = str => String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').trim();
            const fullName = sanitize(data.fullName);
            const email = sanitize(data.email).toLowerCase();
            const mobile = sanitize(data.mobile).replace(/[\s\-\(\)\+]/g, '');
            const college = sanitize(data.college);
            const course = sanitize(data.course);
            const semester = sanitize(data.semester);
            const domain = sanitize(data.domain);
            const skills = sanitize(data.skills);
            const whyJoin = sanitize(data.whyJoin);
            const linkedin = sanitize(data.linkedinUrl || data.linkedin);
            const github = sanitize(data.githubUrl || data.github);
            const resumeUrl = data.resumeFile ? data.resumeFile.url : (data.resume || null);

            // Validations
            if (!fullName || fullName.length < 2) {
                return sendJson(400, { success: false, error: 'Please enter your full name.' });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!email || !emailRegex.test(email)) {
                return sendJson(400, { success: false, error: 'Please enter a valid email address.' });
            }

            let cleanPhone = mobile;
            if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
                cleanPhone = cleanPhone.substring(2);
            }
            if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
                return sendJson(400, { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' });
            }

            if (!college || !course || !semester || !domain) {
                return sendJson(400, { success: false, error: 'Please fill in all mandatory academic and domain fields.' });
            }

            const result = await dbStore.saveInternshipApplication({
                fullName,
                email,
                mobile: cleanPhone,
                college,
                course,
                semester,
                domain,
                skills,
                whyJoin,
                resumeUrl,
                resumeFilename: data.resumeFile ? data.resumeFile.originalName : null,
                linkedinUrl: linkedin,
                githubUrl: github,
                batchId: data.batchId || 'batch-2026-beta'
            });

            if (result.error) {
                return sendJson(409, { success: false, error: result.error });
            }

            return sendJson(200, {
                success: true,
                referenceId: result.referenceId,
                domain: result.domain,
                email: result.email,
                message: 'Your internship application has been successfully submitted and stored.'
            });
        });
        return;
    }

    // 2. Chatbot Message & Lead Storage Integration + Server-Side AI Brain
    if (req.method === 'POST' && req.url === '/api/chatbot/message') {
        parseJsonBody(req, async (err, data) => {
            if (err || !data) return sendJson(400, { success: false, error: 'Invalid payload' });

            const sessionId = data.sessionId || 'session_' + Date.now();
            dbStore.getOrCreateChatSession(sessionId, req.socket.remoteAddress);

            const userMsg = data.message ? String(data.message).trim() : '';

            if (data.sender && userMsg) {
                await dbStore.saveChatMessage(sessionId, data.sender, userMsg);
            }

            // Lead capture trigger if name/email/phone found in data
            let leadCaptured = false;
            if (data.lead) {
                await dbStore.saveChatLead({
                    sessionId,
                    name: data.lead.name,
                    email: data.lead.email,
                    phone: data.lead.phone,
                    enquiryType: data.lead.enquiryType || 'Chatbot Consultation',
                    lastMessage: userMsg
                });
                leadCaptured = true;
            }

            // If request asked for an AI response from server
            let aiReply = null;
            if (data.generateAiReply) {
                const lower = userMsg.toLowerCase();
                const services = dbStore.getServices();
                const projects = dbStore.getProjects();

                if (lower.includes('service') || lower.includes('solution') || lower.includes('what do you do')) {
                    const sList = services.slice(0, 5).map(s => `• **${s.title}**: ${s.description}`).join('\n');
                    aiReply = `Here are some of the primary technology capabilities we offer at **RC Techno Solutions**:\n\n${sList}\n\n👉 [Explore All Services & Architectures](/services)`;
                } else if (lower.includes('project quote') || lower.includes('quote') || lower.includes('pricing') || lower.includes('cost') || lower.includes('hire') || lower.includes('consultation')) {
                    aiReply = `💼 **Request a Project Quote & Consultation**:\n\nWe provide tailored architectural scoping and transparent milestone estimates for full-stack platforms, cloud scaling, and AI automations.\n\n• Free 15-minute engineering discovery call\n• Customized architectural blueprint\n• Fixed-scope or dedicated team engagement\n\n👉 [Submit Your Project Scope & Request a Quote](/contact)`;
                } else if (lower.includes('project') || lower.includes('portfolio') || lower.includes('work') || lower.includes('case stud')) {
                    const pList = projects.slice(0, 3).map(p => `• **${p.title}** (${p.category}) — *${p.techStack}*:\n  ${p.description}`).join('\n');
                    aiReply = `Here are recent enterprise projects built by our engineering team:\n\n${pList}\n\n👉 [View Complete Portfolio & Case Studies](/portfolio)`;
                } else if (lower.includes('intern') || lower.includes('student') || lower.includes('fresher') || lower.includes('training')) {
                    aiReply = `🎓 **1-Month Practical Internship Program (Batch 2026)**:\n\n• **Duration**: 30 Days (Practical Skill-Based)\n• **Eligibility**: B.Tech, BCA, MCA, Diploma students & Freshers\n• **Domains**: Web Development, Python, Full Stack, Data Analytics, UI/UX, SEO\n• **Certification**: Verified Industry Completion Certificate\n\n👉 [Click here to View Program & Apply Now](/internship)`;
                } else if (lower.includes('contact') || lower.includes('reach out') || lower.includes('team') || lower.includes('email') || lower.includes('phone')) {
                    aiReply = `📞 **Contact Our Engineering Team**:\n\n• **Headquarters**: Vastral, Ahmedabad, Gujarat, India\n• **Phone / WhatsApp**: +91 63900 35039\n• **Email**: ratanchaurasiya61@gmail.com\n\n👉 [Open Contact & Consultation Page](/contact)`;
                } else if (lower.includes('founder') || lower.includes('about') || lower.includes('company')) {
                    aiReply = `🏢 **About RC Techno Solutions**:\n\nRC Techno Solutions is an enterprise software engineering, AI, and cloud technology provider delivering custom SaaS architectures, multi-region cloud infrastructures, and AI automations for startups and global enterprises.`;
                } else {
                    aiReply = `Thank you for reaching out! I can assist you with our **Services**, **Projects**, **1-Month Internship Program**, or help you **Request a Project Quote**.\n\nCould you please let me know what specific solution or domain you are interested in?`;
                }

                // Persist bot reply to PostgreSQL / Database
                await dbStore.saveChatMessage(sessionId, 'bot', aiReply);
            }

            return sendJson(200, {
                success: true,
                sessionId,
                reply: aiReply,
                leadCaptured
            });
        });
        return;
    }

    // 3. Contact Enquiry Submission
    if (req.method === 'POST' && req.url === '/api/contact') {
        parseJsonBody(req, async (err, data) => {
            if (err || !data) return sendJson(400, { success: false, error: 'Invalid payload' });
            if (data.trap || data.website_trap) return sendJson(200, { success: true, message: 'Enquiry received.' });

            const sanitize = str => String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').trim();
            const name = sanitize(data.name);
            const email = sanitize(data.email).toLowerCase();
            const phone = sanitize(data.phone);
            const company = sanitize(data.company);
            const service = sanitize(data.service);
            const budget = sanitize(data.budget);
            const message = sanitize(data.message);

            if (!name || name.length < 2) return sendJson(400, { success: false, error: 'Please enter a valid full name.' });
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return sendJson(400, { success: false, error: 'Please enter a valid email.' });

            try {
                const record = await dbStore.saveEnquiry({ name, email, phone, company, service, budget, message });
                const ref = record.referenceId || record.id;

                // Feature 6: Instant Lead Notification Dispatch (Webhook/Telegram/WhatsApp Bridge)
                try {
                    const leadAlertText = `🚨 *New Enterprise Lead Alert - RC Techno*\n\n*Ref:* ${ref}\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone || 'N/A'}\n*Service:* ${service || 'General'}\n*Budget:* ${budget || 'N/A'}\n*Message:* ${message || 'N/A'}`;
                    console.log(`[LEAD DISPATCH] ${leadAlertText.replace(/\n/g, ' ')}`);

                    // If optional WEBHOOK_URL or TELEGRAM_BOT_TOKEN is configured in env, notify automatically
                    if (process.env.LEAD_WEBHOOK_URL) {
                        const https = require('https');
                        const url = new URL(process.env.LEAD_WEBHOOK_URL);
                        const postData = JSON.stringify({ content: leadAlertText, text: leadAlertText });
                        const alertReq = https.request(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
                        });
                        alertReq.on('error', () => {});
                        alertReq.write(postData);
                        alertReq.end();
                    }
                } catch (notifyErr) {
                    // Non-blocking notification failure
                }

                return sendJson(200, {
                    success: true,
                    referenceId: ref,
                    inquiryId: ref,
                    enquiryId: ref,
                    data: { referenceId: ref, id: record.id },
                    message: 'Your consultation enquiry has been recorded.'
                });
            } catch (saveErr) {
                console.error('Error saving enquiry:', saveErr);
                return sendJson(500, { success: false, error: 'Failed to record enquiry. Please try again.' });
            }
        });
        return;
    }

    // 4. Admin Login
    if (req.method === 'POST' && req.url === '/api/admin/login') {
        parseJsonBody(req, (err, data) => {
            if (err || !data) return sendJson(400, { success: false, error: 'Invalid login payload' });

            const username = (data.username || '').trim();
            const password = (data.password || '').trim();

            if (username === 'admin@rctechnosolutions.com' && password === 'Admin@RC2026!') {
                const token = 'rcts_adm_' + Buffer.from(username + ':' + Date.now()).toString('base64');
                return sendJson(200, { success: true, token, user: { name: 'Ratan Chaurasiya', role: 'SUPER_ADMIN' } });
            } else {
                return sendJson(401, { success: false, error: 'Invalid administrator email or password.' });
            }
        });
        return;
    }

    // 5. Admin API - Get All Internships
    if (req.method === 'GET' && req.url.startsWith('/api/admin/internships')) {
        if (!checkAuth()) return sendJson(401, { success: false, error: 'Unauthorized admin session' });
        dbStore.getInternshipApplications().then(apps => {
            return sendJson(200, { success: true, applications: apps });
        }).catch(err => {
            return sendJson(500, { success: false, error: err.message });
        });
        return;
    }

    // 6. Admin API - Update Internship Status
    if (req.method === 'PATCH' && req.url.match(/^\/api\/admin\/internships\/([^\/]+)\/status$/)) {
        if (!checkAuth()) return sendJson(401, { success: false, error: 'Unauthorized admin session' });
        const match = req.url.match(/^\/api\/admin\/internships\/([^\/]+)\/status$/);
        const appId = match[1];

        parseJsonBody(req, async (err, data) => {
            if (err || !data || !data.status) return sendJson(400, { success: false, error: 'Missing status' });
            const resUpdate = await dbStore.updateInternshipStatus(appId, data.status, data.notes);
            if (!resUpdate) return sendJson(404, { success: false, error: 'Application not found' });
            return sendJson(200, { success: true, application: resUpdate });
        });
        return;
    }

    // 7. Admin API - Get Enquiries
    if (req.method === 'GET' && req.url === '/api/admin/enquiries') {
        if (!checkAuth()) return sendJson(401, { success: false, error: 'Unauthorized admin session' });
        dbStore.getEnquiries().then(list => {
            return sendJson(200, { success: true, enquiries: list });
        }).catch(err => {
            return sendJson(500, { success: false, error: err.message });
        });
        return;
    }

    // 8. Admin API - Get Chat Leads
    if (req.method === 'GET' && req.url === '/api/admin/chatleads') {
        if (!checkAuth()) return sendJson(401, { success: false, error: 'Unauthorized admin session' });
        const leads = dbStore.getChatLeads();
        return sendJson(200, { success: true, leads });
    }

    // 8B. Database Health & Status Endpoint
    if (req.method === 'GET' && req.url === '/api/database/status') {
        return sendJson(200, { success: true, status: dbStore.getStatus() });
    }

    // 8C. Dynamic Public Data Endpoints (Services, Projects, Testimonials)
    if (req.method === 'GET' && req.url === '/api/services') {
        return sendJson(200, { success: true, services: dbStore.getServices() });
    }
    if (req.method === 'GET' && req.url === '/api/projects') {
        return sendJson(200, { success: true, projects: dbStore.getProjects() });
    }
    if (req.method === 'GET' && req.url === '/api/testimonials') {
        return sendJson(200, { success: true, testimonials: dbStore.getTestimonials() });
    }

    // 8D. Admin Dashboard Aggregate Stats Endpoint
    if (req.method === 'GET' && req.url === '/api/admin/stats') {
        if (!checkAuth()) return sendJson(401, { success: false, error: 'Unauthorized admin session' });
        dbStore.getAdminDashboardStats().then(stats => {
            return sendJson(200, { success: true, stats });
        }).catch(err => {
            return sendJson(500, { success: false, error: err.message });
        });
        return;
    }

    // 9. Existing NDA API
    if (req.method === 'POST' && req.url === '/api/nda') {
        parseJsonBody(req, (err, data) => {
            if (err || !data) return sendJson(400, { success: false, error: 'Invalid JSON payload.' });
            const sanitize = str => String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').trim();
            const clientName = sanitize(data.clientName || 'Authorized Signatory');
            const companyName = sanitize(data.companyName || 'Enterprise Client');
            const signatoryRole = sanitize(data.signatoryRole || data.title || 'Director / Executive');
            const purpose = sanitize(data.purpose || 'Technical Architecture Evaluation & Cloud Software Engineering');
            const agreementId = 'NDA-RC-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

            const record = {
                agreementId,
                clientName,
                companyName,
                signatoryRole,
                purpose,
                status: 'EXECUTED_BILATERAL',
                timestamp: new Date().toISOString(),
                ip: req.socket.remoteAddress || '127.0.0.1'
            };

            try {
                const ndaFile = process.env.VERCEL ? path.join('/tmp', 'nda_records.json') : path.join(__dirname, 'nda_records.json');
                let ndaList = [];
                if (fs.existsSync(ndaFile)) ndaList = JSON.parse(fs.readFileSync(ndaFile, 'utf8') || '[]');
                ndaList.push(record);
                fs.writeFileSync(ndaFile, JSON.stringify(ndaList, null, 2));
            } catch (e) { }

            return sendJson(200, {
                success: true,
                agreementId: record.agreementId,
                clientName: record.clientName,
                companyName: record.companyName,
                status: record.status,
                timestamp: record.timestamp
            });
        });
        return;
    }

    // ------------------------------------------------------------------
    // STATIC ROUTING & CLEAN URL HANDLING
    // ------------------------------------------------------------------
    let target = ROUTE_ALIASES[cleanUrl] || cleanUrl;
    let filePath = path.resolve(__dirname, target.replace(/^\//, ''));

    // Prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('Access Denied');
        return;
    }

    // Helper to send compressed or raw content with optimal caching
    function sendWithCompression(statusCode, baseHeaders, data) {
        const acceptEncoding = (req.headers['accept-encoding'] || '').toLowerCase();
        const contentType = baseHeaders['Content-Type'] || '';
        const isCompressible = /text|javascript|json|xml|svg/i.test(contentType);

        if (isCompressible && acceptEncoding.includes('gzip')) {
            zlib.gzip(data, (zErr, compressed) => {
                if (!zErr && compressed) {
                    const headers = Object.assign({}, baseHeaders, {
                        'Content-Encoding': 'gzip',
                        'Vary': 'Accept-Encoding'
                    });
                    res.writeHead(statusCode, headers);
                    res.end(compressed);
                } else {
                    res.writeHead(statusCode, baseHeaders);
                    res.end(data);
                }
            });
        } else {
            res.writeHead(statusCode, baseHeaders);
            res.end(data);
        }
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            if (!path.extname(cleanUrl)) {
                const htmlAttempt = filePath + '.html';
                fs.stat(htmlAttempt, (hErr, hStats) => {
                    if (!hErr && hStats.isFile()) {
                        fs.readFile(htmlAttempt, (readErr, htmlData) => {
                            if (!readErr) {
                                const headers = Object.assign({}, SECURITY_HEADERS, {
                                    'Content-Type': 'text/html; charset=UTF-8',
                                    'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400'
                                });
                                sendWithCompression(200, headers, htmlData);
                                return;
                            }
                            send404(res);
                        });
                        return;
                    }
                    send404(res);
                });
                return;
            }
            send404(res);
            return;
        }

        fs.readFile(filePath, (readErr, data) => {
            if (readErr) {
                send404(res);
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            
            // Static assets (images, fonts, CSS, JS) get aggressive caching
            let cacheControl = 'public, max-age=86400';
            if (ext === '.html') {
                cacheControl = 'public, max-age=300, stale-while-revalidate=86400';
            } else if (/\.(jpg|jpeg|png|webp|svg|ico|woff|woff2|ttf)$/i.test(ext)) {
                cacheControl = 'public, max-age=2592000, immutable'; // 30 days for images & fonts
            } else if (/\.(css|js)$/i.test(ext)) {
                cacheControl = 'public, max-age=86400'; // 1 day for CSS & JS
            }

            const headers = Object.assign({}, SECURITY_HEADERS, {
                'Content-Type': contentType,
                'Cache-Control': cacheControl
            });
            sendWithCompression(200, headers, data);
        });
    });
});

// Export request listener for Vercel Serverless Function deployment
module.exports = server;

// Only start standalone HTTP listener when executed directly (e.g. node server.js)
if (require.main === module) {
    let currentPort = parseInt(PORT, 10) || 3000;

    function startListening(port) {
        currentPort = port;
        server.listen(port, () => {
            console.log(`RC Techno Solutions server is running at http://localhost:${port}/`);
        });
    }

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            const nextPort = currentPort + 1;
            console.log(`⚠️ Port ${currentPort} is currently in use. Trying port ${nextPort}...`);
            setTimeout(() => {
                server.close();
                startListening(nextPort);
            }, 200);
        } else {
            console.error('Server error:', err);
        }
    });

    startListening(currentPort);
}
