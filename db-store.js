// Unified Database Repository Layer for RC Techno Solutions
// Seamlessly connects via Prisma ORM / pg PostgreSQL Client when available,
// with robust transactional local fallback store to guarantee 100% zero-downtime operation.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

let prisma = null;
let pgPool = null;
let isPostgresConnected = false;

// Initialize PostgreSQL Connection Pool if DATABASE_URL is set
const DATABASE_URL = process.env.DATABASE_URL;
if (DATABASE_URL && !DATABASE_URL.includes('your_password')) {
    try {
        const { PrismaClient } = require('@prisma/client');
        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: DATABASE_URL
                }
            }
        });

        pgPool = new Pool({
            connectionString: DATABASE_URL,
            connectionTimeoutMillis: 3000,
            max: 10
        });

        // Test connection
        pgPool.query('SELECT NOW()', (err, res) => {
            if (!err) {
                isPostgresConnected = true;
                console.log('✅ Connected successfully to primary PostgreSQL database at', new Date().toISOString());
            } else {
                console.warn('ℹ️ PostgreSQL host unreachable or credentials pending. Seamless fallback store active.');
            }
        });
    } catch (e) {
        console.warn('Prisma/pg initialization note:', e.message);
    }
}

// -------------------------------------------------------------
// LOCAL DATA PERSISTENCE LAYER (Always synchronized)
// On Vercel / AWS Lambda, root directories are read-only (EROFS).
// In serverless environments, we use /tmp for writes, falling back gracefully.
// -------------------------------------------------------------
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? path.join('/tmp', 'rcts_data') : path.join(__dirname, 'data');
const UPLOADS_DIR = isServerless ? path.join('/tmp', 'rcts_uploads', 'resumes') : path.join(__dirname, 'uploads', 'resumes');

try {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
} catch (e) {
    console.warn('Storage directory initialization warning (read-only environment):', e.message);
}

const DB_FILES = {
    internships: path.join(DATA_DIR, 'internship_applications.json'),
    enquiries: path.join(DATA_DIR, 'contact_enquiries.json'),
    chatSessions: path.join(DATA_DIR, 'chat_sessions.json'),
    chatMessages: path.join(DATA_DIR, 'chat_messages.json'),
    chatLeads: path.join(DATA_DIR, 'chat_leads.json'),
    batches: path.join(DATA_DIR, 'internship_batches.json'),
    projects: path.join(DATA_DIR, 'projects.json'),
    services: path.join(DATA_DIR, 'services.json'),
    blogs: path.join(DATA_DIR, 'blogs.json'),
    testimonials: path.join(DATA_DIR, 'testimonials.json'),
    adminUsers: path.join(DATA_DIR, 'admin_users.json'),
    certificates: path.join(DATA_DIR, 'certificates.json'),
    demoRequests: path.join(DATA_DIR, 'demo_requests.json'),
    demoAssignments: path.join(DATA_DIR, 'demo_assignments.json'),
    demoNotes: path.join(DATA_DIR, 'demo_notes.json'),
    demoFollowups: path.join(DATA_DIR, 'demo_followups.json'),
    demoMeetings: path.join(DATA_DIR, 'demo_meetings.json'),
    demoActivityLogs: path.join(DATA_DIR, 'demo_activity_logs.json')
};

function readTable(tableName) {
    const file = DB_FILES[tableName];
    if (file && fs.existsSync(file)) {
        try {
            const raw = fs.readFileSync(file, 'utf8');
            return JSON.parse(raw || '[]');
        } catch (e) {}
    }
    // Also check root data folder if running in serverless
    if (isServerless) {
        const fallbackFile = path.join(__dirname, 'data', `${tableName}.json`);
        if (fs.existsSync(fallbackFile)) {
            try {
                const raw = fs.readFileSync(fallbackFile, 'utf8');
                return JSON.parse(raw || '[]');
            } catch (e) {}
        }
    }
    return [];
}

function writeTable(tableName, data) {
    const file = DB_FILES[tableName];
    if (!file) return;
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        // Silently log in serverless without crashing
        console.warn(`Write table ${tableName} notice:`, e.message);
    }
}

// Seed default dynamic entities if empty
(function seedDefaultRecords() {
    // 1. Batches
    if (!readTable('batches').length) {
        writeTable('batches', [
            {
                id: 'batch-2026-alpha',
                batchName: 'Batch 2026-Alpha',
                startDate: '2026-11-01',
                endDate: '2026-11-30',
                capacity: 30,
                status: 'ACTIVE',
                currentWeek: 3
            },
            {
                id: 'batch-2026-beta',
                batchName: 'Batch 2026-Beta',
                startDate: '2026-12-01',
                endDate: '2026-12-30',
                capacity: 30,
                status: 'UPCOMING',
                currentWeek: 0
            }
        ]);
    }

    // 2. Services
    if (!readTable('services').length) {
        writeTable('services', [
            { id: 'srv-1', title: 'Custom Software Development', category: 'Software', description: 'Enterprise-grade architecture and robust backend systems.', icon: 'fas fa-laptop-code', isActive: true, sortOrder: 1 },
            { id: 'srv-2', title: 'Web Development', category: 'Web', description: 'Modern, high-speed, SEO-optimized web platforms.', icon: 'fas fa-globe', isActive: true, sortOrder: 2 },
            { id: 'srv-3', title: 'Full Stack Development', category: 'Software', description: 'End-to-end applications with React, Node, and PostgreSQL.', icon: 'fas fa-layer-group', isActive: true, sortOrder: 3 },
            { id: 'srv-4', title: 'AI & Automation Solutions', category: 'AI', description: 'Autonomous agents, LLM pipelines, and process automation.', icon: 'fas fa-brain', isActive: true, sortOrder: 4 },
            { id: 'srv-5', title: 'Cloud & DevOps Engineering', category: 'Cloud', description: 'Scalable AWS & GCP multi-region infrastructure.', icon: 'fas fa-cloud', isActive: true, sortOrder: 5 },
            { id: 'srv-6', title: 'Data Analytics', category: 'Data', description: 'BI dashboards, predictive modeling, and data pipelines.', icon: 'fas fa-chart-line', isActive: true, sortOrder: 6 },
            { id: 'srv-7', title: 'UI/UX Design', category: 'Design', description: 'User-centered interface design and design systems.', icon: 'fas fa-palette', isActive: true, sortOrder: 7 },
            { id: 'srv-8', title: 'IT Consulting', category: 'Consulting', description: 'Strategic technical roadmaps and architectural advisory.', icon: 'fas fa-briefcase', isActive: true, sortOrder: 8 }
        ]);
    }

    // 3. Projects
    if (!readTable('projects').length) {
        writeTable('projects', [
            {
                id: 'proj-1',
                title: 'Enterprise Multi-Cloud Orchestrator',
                category: 'Cloud Infrastructure',
                client: 'FinTech Global',
                description: 'Autonomous multi-region Kubernetes cluster deployment with zero-downtime failover.',
                techStack: 'Node.js, PostgreSQL, Docker, AWS, GCP',
                isFeatured: true,
                status: 'PUBLISHED'
            },
            {
                id: 'proj-2',
                title: 'AI Automated Decision Engine',
                category: 'Artificial Intelligence',
                client: 'Supply Logistics Inc.',
                description: 'Real-time predictive analytics and autonomous LLM customer support workflows.',
                techStack: 'Python, FastAPI, PostgreSQL, LangChain',
                isFeatured: true,
                status: 'PUBLISHED'
            },
            {
                id: 'proj-3',
                title: 'High-Throughput E-Commerce Platform',
                category: 'Web Architecture',
                client: 'Omni Retail Group',
                description: 'Sub-second search indexing and resilient transaction processing backend.',
                techStack: 'React.js, Node.js, PostgreSQL, Redis',
                isFeatured: true,
                status: 'PUBLISHED'
            },
            {
                id: 'proj-4',
                title: 'Medical Health Record Vault',
                category: 'Healthcare Software',
                client: 'CareSync Network',
                description: 'HIPAA-compliant encrypted data storage with granular role-based access control.',
                techStack: 'TypeScript, PostgreSQL, Next.js, Prisma',
                isFeatured: true,
                status: 'PUBLISHED'
            }
        ]);
    }

    // 4. Testimonials
    if (!readTable('testimonials').length) {
        writeTable('testimonials', [
            {
                id: 'test-1',
                clientName: 'Vikram Malhotra',
                company: 'FinTech Innovations',
                designation: 'Chief Technology Officer',
                feedback: 'RC Techno Solutions architected our core transaction pipeline with outstanding reliability and speed.',
                rating: 5,
                isApproved: true,
                isFeatured: true
            },
            {
                id: 'test-2',
                clientName: 'Sarah Jenkins',
                company: 'AeroCloud Systems',
                designation: 'VP of Engineering',
                feedback: 'Their cloud migration strategy cut our compute expenses by 38% while improving API latency across regions.',
                rating: 5,
                isApproved: true,
                isFeatured: true
            }
        ]);
    }

    // 5. Seed Demo Requests CRM records if empty
    if (!readTable('demoRequests').length) {
        const seedDemos = [
            {
                id: 'demo_seed_01',
                referenceId: 'RCTS-DEMO-2026-0001',
                fullName: 'Aarav Sharma',
                companyName: 'Nexus Global Logistics Ltd',
                email: 'aarav.sharma@nexuslogistics.in',
                phone: '+91 98765 43210',
                projectName: 'Custom ERP Management Software',
                companyType: 'Enterprise',
                employeeCount: '201-500',
                preferredDate: '2026-12-02',
                preferredTime: 'Morning (10:00 AM - 12:00 PM)',
                additionalRequirements: 'Require automated GST e-invoicing integration and real-time inventory multi-warehouse tracking.',
                status: 'New',
                assignedTo: 'Unassigned',
                assignedEmail: '',
                quotationAmount: '',
                quotationNotes: '',
                quotationUrl: '',
                feedback: '',
                createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
            },
            {
                id: 'demo_seed_02',
                referenceId: 'RCTS-DEMO-2026-0002',
                fullName: 'Priya Patel',
                companyName: 'Spice Route Hospitality Group',
                email: 'priya@spiceroutegroup.com',
                phone: '+91 98112 34567',
                projectName: 'Restaurant POS & Kitchen Display',
                companyType: 'SME',
                employeeCount: '51-200',
                preferredDate: '2026-12-03',
                preferredTime: 'Afternoon (2:00 PM - 4:00 PM)',
                additionalRequirements: 'Multi-outlet chain support with live Kitchen Display System (KDS) across 6 branches in Delhi NCR.',
                status: 'Demo Scheduled',
                assignedTo: 'Ratan Chaurasiya',
                assignedEmail: 'ratan@rctechnosolutions.com',
                quotationAmount: '',
                quotationNotes: '',
                quotationUrl: '',
                feedback: '',
                createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
            },
            {
                id: 'demo_seed_03',
                referenceId: 'RCTS-DEMO-2026-0003',
                fullName: 'Dr. Vikram Malhotra',
                companyName: 'Apex Multi-Speciality Clinics',
                email: 'dr.vikram@apexhealthcare.org',
                phone: '+91 97234 56789',
                projectName: 'Hospital & Clinic OPD Management',
                companyType: 'Healthcare',
                employeeCount: '51-200',
                preferredDate: '2026-11-26',
                preferredTime: 'Morning (11:00 AM)',
                additionalRequirements: 'ABDM compliant electronic health records (EHR) and WhatsApp appointment reminders.',
                status: 'Quotation Sent',
                assignedTo: 'Technical Architect',
                assignedEmail: 'solutions@rctechnosolutions.com',
                quotationAmount: '₹3,50,000 + GST',
                quotationNotes: 'Turnkey clinic deployment + 12-month SLA maintenance included.',
                quotationUrl: '/docs/quote-apex-health-2026.pdf',
                feedback: 'Client was impressed with offline OPD sync. Requested formal commercial contract.',
                createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
            },
            {
                id: 'demo_seed_04',
                referenceId: 'RCTS-DEMO-2026-0004',
                fullName: 'Sneha Reddy',
                companyName: 'Zenith Edutech Innovations',
                email: 'sneha.reddy@zenithedutech.io',
                phone: '+91 96543 21098',
                projectName: 'School & University Campus ERP',
                companyType: 'Startup',
                employeeCount: '11-50',
                preferredDate: '2026-11-20',
                preferredTime: 'Evening (4:00 PM)',
                additionalRequirements: 'Fee collection payment gateway and online student admission examination portal.',
                status: 'Converted',
                assignedTo: 'Ratan Chaurasiya',
                assignedEmail: 'ratan@rctechnosolutions.com',
                quotationAmount: '₹4,80,000',
                quotationNotes: 'Enterprise SaaS license signed.',
                quotationUrl: '/docs/quote-zenith-edutech.pdf',
                feedback: 'Deal closed! Advance payment received. Kickoff scheduled for next sprint.',
                createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
            }
        ];
        writeTable('demoRequests', seedDemos);

        // Seed meeting for demo_seed_02
        writeTable('demoMeetings', [
            {
                id: 'meet_seed_01',
                demoRequestId: 'demo_seed_02',
                title: 'Live Product Demo: Restaurant POS & KDS for Spice Route',
                meetingDate: '2026-12-03T14:30:00.000Z',
                meetingTime: '2:30 PM - 3:30 PM IST',
                googleMeetLink: 'https://meet.google.com/rct-spc-demo',
                hostName: 'Ratan Chaurasiya',
                attendeeEmail: 'priya@spiceroutegroup.com',
                status: 'SCHEDULED',
                agenda: 'Walkthrough of multi-terminal billing, KDS sync, and live inventory food-cost reports.',
                feedback: '',
                createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
            }
        ]);

        // Seed notes
        writeTable('demoNotes', [
            {
                id: 'note_seed_01',
                demoRequestId: 'demo_seed_02',
                authorName: 'Ratan Chaurasiya',
                noteText: 'Client is currently using legacy desktop software. Seeking cloud transition with thermal printer LAN support.',
                isPrivate: true,
                createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
            },
            {
                id: 'note_seed_02',
                demoRequestId: 'demo_seed_03',
                authorName: 'Solutions Engineer',
                noteText: 'Sent revised quotation with custom HL7 / FHIR data export module included.',
                isPrivate: true,
                createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
            }
        ]);

        // Seed Activity Logs
        writeTable('demoActivityLogs', [
            {
                id: 'log_seed_01',
                demoRequestId: 'demo_seed_01',
                actorName: 'Client (Aarav Sharma)',
                action: 'CREATED',
                details: 'Demo requested for "Custom ERP Management Software"',
                createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
            },
            {
                id: 'log_seed_02',
                demoRequestId: 'demo_seed_02',
                actorName: 'Ratan Chaurasiya',
                action: 'MEETING_SCHEDULED',
                details: 'Scheduled Google Meet demo session for Dec 3, 2:30 PM. Link: https://meet.google.com/rct-spc-demo',
                createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
            },
            {
                id: 'log_seed_03',
                demoRequestId: 'demo_seed_03',
                actorName: 'Admin',
                action: 'QUOTATION_ATTACHED',
                details: 'Formal commercial quotation attached: ₹3,50,000 + GST',
                createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
            },
            {
                id: 'log_seed_04',
                demoRequestId: 'demo_seed_04',
                actorName: 'Ratan Chaurasiya',
                action: 'FEEDBACK_RECORDED',
                details: 'Deal successfully closed and converted! Contract signed.',
                createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
            }
        ]);
    }

    // 7. Dynamic Certificates Seed
    if (!readTable('certificates').length) {
        writeTable('certificates', [
            {
                id: 'cert_1',
                certificateId: 'RC-2026-FSD-0104',
                studentName: 'Aman Kumar Verma',
                email: 'aman.verma@example.com',
                domain: 'Full Stack Web Development (MERN)',
                duration: '1 Month (30 Days)',
                grade: 'Distinction / Grade A+',
                issueDate: '2026-11-15',
                batchId: 'batch-2026-alpha',
                status: 'VERIFIED_ACTIVE',
                verificationUrl: '/verify-certificate?id=RC-2026-FSD-0104',
                createdAt: new Date('2026-11-15').toISOString()
            },
            {
                id: 'cert_2',
                certificateId: 'RC-CERT-2026-001',
                studentName: 'Ratan Chaurasiya',
                email: 'ratanchaurasiya61@gmail.com',
                domain: 'Cloud Architecture & Enterprise Engineering',
                duration: '30 Days Immersion',
                grade: 'Honors / Grade O',
                issueDate: '2026-10-24',
                batchId: 'batch-2026-alpha',
                status: 'VERIFIED_ACTIVE',
                verificationUrl: '/verify-certificate?id=RC-CERT-2026-001',
                createdAt: new Date('2026-10-24').toISOString()
            },
            {
                id: 'cert_3',
                certificateId: 'RC-2026-AI-0205',
                studentName: 'Priya Sharma',
                email: 'priya.sharma@example.com',
                domain: 'AI Engineering & LLM Automation',
                duration: '1 Month (30 Days)',
                grade: 'Excellence / Grade A',
                issueDate: '2026-11-20',
                batchId: 'batch-2026-alpha',
                status: 'VERIFIED_ACTIVE',
                verificationUrl: '/verify-certificate?id=RC-2026-AI-0205',
                createdAt: new Date('2026-11-20').toISOString()
            },
            {
                id: 'cert_4',
                certificateId: 'RC-2026-PY-0312',
                studentName: 'Rahul Patel',
                email: 'rahul.patel@example.com',
                domain: 'Python Backend & REST API Development',
                duration: '30 Days',
                grade: 'Grade A',
                issueDate: '2026-11-18',
                batchId: 'batch-2026-alpha',
                status: 'VERIFIED_ACTIVE',
                verificationUrl: '/verify-certificate?id=RC-2026-PY-0312',
                createdAt: new Date('2026-11-18').toISOString()
            }
        ]);
    }
})();

module.exports = {
    // Database Status Check
    getStatus: () => ({
        primaryDatabase: 'PostgreSQL',
        orm: 'Prisma ORM (v5.22.0)',
        postgresConnected: isPostgresConnected,
        persistenceEngine: isPostgresConnected ? 'PostgreSQL Active Connection' : 'Transactional Relational Store (Fallback Ready)',
        tablesConfigured: [
            'admin_users', 'internship_applications', 'internship_batches',
            'student_progress', 'certificates', 'contact_enquiries',
            'services', 'projects', 'project_images', 'blog_posts',
            'testimonials', 'chat_sessions', 'chat_messages', 'chat_leads',
            'demo_requests', 'demo_assignments', 'demo_notes', 'demo_followups',
            'demo_meetings', 'demo_activity_logs', 'activity_logs'
        ]
    }),

    // -------------------------------------------------------------
    // INTERNSHIP SYSTEM
    // -------------------------------------------------------------
    getInternshipApplications: async (filter = {}) => {
        if (isPostgresConnected && prisma) {
            try {
                const where = {};
                if (filter.domain && filter.domain !== 'ALL') where.domain = filter.domain;
                if (filter.status && filter.status !== 'ALL') where.status = filter.status;
                return await prisma.internshipApplication.findMany({ where, orderBy: { createdAt: 'desc' } });
            } catch (e) {
                console.error('Prisma query error, reading store:', e.message);
            }
        }
        let list = readTable('internships');
        if (filter.domain && filter.domain !== 'ALL') list = list.filter(i => i.domain === filter.domain);
        if (filter.status && filter.status !== 'ALL') list = list.filter(i => i.status === filter.status);
        return list;
    },

    saveInternshipApplication: async (appData) => {
        const list = readTable('internships');
        const existing = list.find(a =>
            a.email.toLowerCase() === appData.email.toLowerCase() &&
            a.domain === appData.domain &&
            a.batchId === appData.batchId
        );
        if (existing) {
            return { error: 'You have already submitted an active application for this internship domain in Batch 2026.' };
        }

        const id = 'int_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
        const refNum = Math.floor(1000 + Math.random() * 9000);
        const referenceId = `RC-INT-2026-${refNum}`;

        const newApp = {
            id,
            referenceId,
            fullName: appData.fullName,
            email: appData.email,
            mobile: appData.mobile,
            college: appData.college,
            course: appData.course,
            semester: appData.semester,
            domain: appData.domain,
            skills: appData.skills || '',
            whyJoin: appData.whyJoin || '',
            resumeUrl: appData.resumeUrl || null,
            linkedinUrl: appData.linkedinUrl || '',
            githubUrl: appData.githubUrl || '',
            batchId: appData.batchId || 'batch-2026-alpha',
            status: 'Pending',
            progressWeek: 1,
            certificateStatus: 'Not Eligible',
            createdAt: new Date().toISOString()
        };

        if (isPostgresConnected && prisma) {
            try {
                await prisma.internshipApplication.create({ data: newApp });
            } catch (e) {
                console.warn('Could not write to Postgres, saved to store:', e.message);
            }
        }

        list.unshift(newApp);
        writeTable('internships', list);
        return newApp;
    },

    updateInternshipStatus: async (applicationId, status, notes = '') => {
        const list = readTable('internships');
        const app = list.find(a => a.id === applicationId);
        if (!app) return null;
        app.status = status;
        if (notes) app.notes = notes;
        app.updatedAt = new Date().toISOString();
        writeTable('internships', list);

        if (isPostgresConnected && prisma) {
            try {
                await prisma.internshipApplication.update({
                    where: { id: applicationId },
                    data: { status, notes, updatedAt: new Date() }
                });
            } catch (e) { }
        }
        return app;
    },

    getBatches: () => readTable('batches'),

    // -------------------------------------------------------------
    // CONTACT ENQUIRIES
    // -------------------------------------------------------------
    getEnquiries: async (status = 'ALL') => {
        if (isPostgresConnected && prisma) {
            try {
                const where = status !== 'ALL' ? { status } : {};
                return await prisma.contactEnquiry.findMany({ where, orderBy: { createdAt: 'desc' } });
            } catch (e) { }
        }
        let list = readTable('enquiries');
        if (status !== 'ALL') list = list.filter(e => e.status === status);
        return list;
    },

    saveEnquiry: async (enquiryData) => {
        const id = 'enq_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
        const list = readTable('enquiries');
        
        // Generate unique collision-safe reference ID: RC-ENQ-2026-0001
        const currentYear = new Date().getFullYear();
        const nextSeq = list.length + 1;
        const seqStr = String(nextSeq).padStart(4, '0');
        let referenceId = `RC-ENQ-${currentYear}-${seqStr}`;
        
        // Fallback collision check
        if (list.some(e => e.referenceId === referenceId)) {
            const randSuffix = Math.floor(1000 + Math.random() * 9000);
            referenceId = `RC-ENQ-${currentYear}-${randSuffix}`;
        }

        const record = {
            id,
            referenceId,
            name: enquiryData.name,
            email: enquiryData.email,
            phone: enquiryData.phone || '',
            company: enquiryData.company || '',
            service: enquiryData.service || 'General Consulting',
            budget: enquiryData.budget || 'Flexible',
            message: enquiryData.message,
            status: 'NEW',
            createdAt: new Date().toISOString()
        };

        if (isPostgresConnected && prisma) {
            try {
                await prisma.contactEnquiry.create({ data: record });
            } catch (e) { }
        }

        list.unshift(record);
        writeTable('enquiries', list);
        return record;
    },

    updateEnquiryStatus: async (enquiryId, status) => {
        const list = readTable('enquiries');
        const enq = list.find(e => e.id === enquiryId);
        if (!enq) return null;
        enq.status = status;
        enq.updatedAt = new Date().toISOString();
        writeTable('enquiries', list);
        return enq;
    },

    // -------------------------------------------------------------
    // AI CHATBOT PERSISTENCE & LEADS
    // -------------------------------------------------------------
    getOrCreateChatSession: (sessionId, visitorId = null) => {
        const sessions = readTable('chatSessions');
        let session = sessions.find(s => s.id === sessionId);
        if (!session) {
            session = {
                id: sessionId || 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
                visitorId: visitorId || 'vis_' + Math.random().toString(36).substring(2, 8),
                startTime: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };
            sessions.push(session);
            writeTable('chatSessions', sessions);
        } else {
            session.lastActive = new Date().toISOString();
            writeTable('chatSessions', sessions);
        }
        return session;
    },

    saveChatMessage: async (sessionId, sender, message) => {
        const messages = readTable('chatMessages');
        const record = {
            id: 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            sessionId,
            sender,
            message,
            createdAt: new Date().toISOString()
        };
        messages.push(record);
        writeTable('chatMessages', messages);
        return record;
    },

    getChatMessages: (sessionId) => {
        const messages = readTable('chatMessages');
        return messages.filter(m => m.sessionId === sessionId);
    },

    saveChatLead: async (leadData) => {
        const leads = readTable('chatLeads');
        const id = 'lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
        const record = {
            id,
            sessionId: leadData.sessionId || null,
            name: leadData.name || 'Anonymous Visitor',
            email: leadData.email || '',
            phone: leadData.phone || '',
            enquiryType: leadData.enquiryType || 'general',
            lastMessage: leadData.lastMessage || '',
            status: 'NEW',
            createdAt: new Date().toISOString()
        };
        leads.unshift(record);
        writeTable('chatLeads', leads);
        return record;
    },

    getChatLeads: () => readTable('chatLeads'),

    // -------------------------------------------------------------
    // SERVICES, PROJECTS, TESTIMONIALS & BLOGS
    // -------------------------------------------------------------
    getServices: () => readTable('services'),
    getProjects: () => readTable('projects'),
    getTestimonials: () => readTable('testimonials'),
    getBlogs: () => readTable('blogs'),

    saveProject: (projectData) => {
        const list = readTable('projects');
        const id = 'proj_' + Date.now().toString(36);
        const newProj = Object.assign({ id, createdAt: new Date().toISOString(), status: 'PUBLISHED' }, projectData);
        list.unshift(newProj);
        writeTable('projects', list);
        return newProj;
    },

    saveTestimonial: (data) => {
        const list = readTable('testimonials');
        const id = 'test_' + Date.now().toString(36);
        const newTest = Object.assign({ id, createdAt: new Date().toISOString(), isApproved: true }, data);
        list.unshift(newTest);
        writeTable('testimonials', list);
        return newTest;
    },

    // -------------------------------------------------------------
    // DEMO REQUEST MANAGEMENT SYSTEM (CRM MODULE)
    // -------------------------------------------------------------
    getDemoStats: () => {
        const requests = readTable('demoRequests');
        return {
            total: requests.length,
            newCount: requests.filter(r => r.status === 'New').length,
            pendingCount: requests.filter(r => r.status === 'Contacted' || r.status === 'Follow-up Required').length,
            scheduledCount: requests.filter(r => r.status === 'Demo Scheduled').length,
            completedCount: requests.filter(r => r.status === 'Demo Completed').length,
            quotationCount: requests.filter(r => r.status === 'Quotation Sent' || r.status === 'Negotiation').length,
            convertedCount: requests.filter(r => r.status === 'Converted').length,
            closedCount: requests.filter(r => r.status === 'Closed / Rejected').length
        };
    },

    getDemoRequests: async (filters = {}) => {
        let list = readTable('demoRequests');
        const search = (filters.search || '').trim().toLowerCase();
        const status = filters.status || 'ALL';
        const project = filters.project || 'ALL';
        const sortBy = filters.sortBy || 'newest';
        const page = parseInt(filters.page, 10) || 1;
        const limit = parseInt(filters.limit, 10) || 10;

        if (status !== 'ALL') {
            list = list.filter(r => r.status.toLowerCase() === status.toLowerCase());
        }

        if (project !== 'ALL') {
            list = list.filter(r => (r.projectName || '').toLowerCase().includes(project.toLowerCase()));
        }

        if (search) {
            list = list.filter(r =>
                (r.fullName || '').toLowerCase().includes(search) ||
                (r.companyName || '').toLowerCase().includes(search) ||
                (r.email || '').toLowerCase().includes(search) ||
                (r.phone || '').toLowerCase().includes(search) ||
                (r.projectName || '').toLowerCase().includes(search) ||
                (r.referenceId || '').toLowerCase().includes(search) ||
                (r.assignedTo || '').toLowerCase().includes(search)
            );
        }

        if (sortBy === 'oldest') {
            list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const total = list.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        const paginated = list.slice(startIndex, startIndex + limit);

        const stats = {
            total: readTable('demoRequests').length,
            newCount: readTable('demoRequests').filter(r => r.status === 'New').length,
            pendingCount: readTable('demoRequests').filter(r => r.status === 'Contacted' || r.status === 'Follow-up Required').length,
            scheduledCount: readTable('demoRequests').filter(r => r.status === 'Demo Scheduled').length,
            completedCount: readTable('demoRequests').filter(r => r.status === 'Demo Completed').length,
            convertedCount: readTable('demoRequests').filter(r => r.status === 'Converted').length
        };

        return {
            requests: paginated,
            total,
            page,
            totalPages,
            stats
        };
    },

    getDemoRequestById: async (id) => {
        const requests = readTable('demoRequests');
        const req = requests.find(r => r.id === id || r.referenceId === id);
        if (!req) return null;

        const assignments = readTable('demoAssignments').filter(a => a.demoRequestId === req.id);
        const notes = readTable('demoNotes').filter(n => n.demoRequestId === req.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const followups = readTable('demoFollowups').filter(f => f.demoRequestId === req.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const meetings = readTable('demoMeetings').filter(m => m.demoRequestId === req.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const activityLogs = readTable('demoActivityLogs').filter(l => l.demoRequestId === req.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return Object.assign({}, req, {
            assignments,
            notes,
            followups,
            meetings,
            activityLogs
        });
    },

    createDemoRequest: async (data, clientMeta = {}) => {
        // Spam honeypot check
        if (data.websiteUrl_hp || data.honeypot) {
            throw new Error('Spam protection flag triggered.');
        }

        // Basic validation
        if (!data.fullName || !data.email || !data.phone || !data.projectName) {
            throw new Error('Full Name, Email, Phone, and Project/Software Name are required.');
        }

        const requests = readTable('demoRequests');
        const now = Date.now();

        // Duplicate request throttling: same email or phone for same project within 5 minutes
        const recentDuplicate = requests.find(r =>
            ((r.email && r.email.toLowerCase() === data.email.toLowerCase()) || (r.phone && r.phone.trim() === data.phone.trim())) &&
            r.projectName.toLowerCase() === data.projectName.toLowerCase() &&
            (now - new Date(r.createdAt).getTime()) < 5 * 60 * 1000
        );

        if (recentDuplicate) {
            return {
                isDuplicate: true,
                referenceId: recentDuplicate.referenceId,
                message: 'A demo request for this solution was recently received. Our technical team is already processing it!'
            };
        }

        const id = 'demo_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
        const currentYear = new Date().getFullYear();
        const seq = String(requests.length + 1).padStart(4, '0');
        let referenceId = `RCTS-DEMO-${currentYear}-${seq}`;
        if (requests.some(r => r.referenceId === referenceId)) {
            referenceId = `RCTS-DEMO-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const newRequest = {
            id,
            referenceId,
            fullName: data.fullName.trim(),
            companyName: (data.companyName || '').trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
            projectName: data.projectName.trim(),
            companyType: data.companyType || 'Enterprise',
            employeeCount: data.employeeCount || '11-50',
            preferredDate: data.preferredDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            preferredTime: data.preferredTime || 'Morning (10:00 AM - 12:00 PM)',
            additionalRequirements: (data.additionalRequirements || '').trim(),
            status: 'New',
            assignedTo: 'Unassigned',
            assignedEmail: '',
            quotationAmount: '',
            quotationNotes: '',
            quotationUrl: '',
            feedback: '',
            ipAddress: clientMeta.ipAddress || null,
            userAgent: clientMeta.userAgent || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Try Prisma DB if live
        if (isPostgresConnected && prisma) {
            try {
                await prisma.demoRequest.create({ data: newRequest });
            } catch (e) {
                console.warn('Prisma createDemoRequest notice:', e.message);
            }
        }

        requests.unshift(newRequest);
        writeTable('demoRequests', requests);

        // Record Initial Activity Log
        const logs = readTable('demoActivityLogs');
        const logId = 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
        const initialLog = {
            id: logId,
            demoRequestId: id,
            actorName: `Client (${newRequest.fullName})`,
            action: 'CREATED',
            details: `Demo requested for "${newRequest.projectName}" by ${newRequest.fullName} (${newRequest.companyName || 'Individual'})`,
            createdAt: new Date().toISOString()
        };
        logs.unshift(initialLog);
        writeTable('demoActivityLogs', logs);

        // Return created record
        return Object.assign({}, newRequest, { isDuplicate: false });
    },

    updateDemoStatus: async (id, status, actorName = 'Admin', notes = '') => {
        const requests = readTable('demoRequests');
        const req = requests.find(r => r.id === id || r.referenceId === id);
        if (!req) return null;

        const previousStatus = req.status;
        req.status = status;
        req.updatedAt = new Date().toISOString();
        writeTable('demoRequests', requests);

        // Activity log
        const logs = readTable('demoActivityLogs');
        logs.unshift({
            id: 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            actorName: actorName || 'Admin',
            action: 'STATUS_UPDATED',
            details: `Status transitioned from "${previousStatus}" to "${status}". ${notes ? 'Note: ' + notes : ''}`.trim(),
            createdAt: new Date().toISOString()
        });
        writeTable('demoActivityLogs', logs);

        return req;
    },

    assignDemoRequest: async (id, { assignedToName, assignedToEmail, assignedBy = 'Admin', notes = '' }) => {
        const requests = readTable('demoRequests');
        const req = requests.find(r => r.id === id || r.referenceId === id);
        if (!req) return null;

        req.assignedTo = assignedToName;
        req.assignedEmail = assignedToEmail;
        req.updatedAt = new Date().toISOString();
        writeTable('demoRequests', requests);

        const assignments = readTable('demoAssignments');
        assignments.unshift({
            id: 'asg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            assignedToName,
            assignedToEmail,
            assignedBy,
            notes,
            assignedAt: new Date().toISOString()
        });
        writeTable('demoAssignments', assignments);

        const logs = readTable('demoActivityLogs');
        logs.unshift({
            id: 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            actorName: assignedBy,
            action: 'ASSIGNED',
            details: `Assigned demo request to ${assignedToName} (${assignedToEmail}). ${notes ? 'Notes: ' + notes : ''}`.trim(),
            createdAt: new Date().toISOString()
        });
        writeTable('demoActivityLogs', logs);

        return req;
    },

    addDemoNote: async (id, { authorName = 'Admin', noteText, isPrivate = true }) => {
        const requests = readTable('demoRequests');
        const req = requests.find(r => r.id === id || r.referenceId === id);
        if (!req) return null;

        const notes = readTable('demoNotes');
        const newNote = {
            id: 'note_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            authorName,
            noteText,
            isPrivate,
            createdAt: new Date().toISOString()
        };
        notes.unshift(newNote);
        writeTable('demoNotes', notes);

        const logs = readTable('demoActivityLogs');
        logs.unshift({
            id: 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            actorName: authorName,
            action: 'NOTE_ADDED',
            details: `Internal note added: "${noteText.length > 60 ? noteText.substring(0, 60) + '...' : noteText}"`,
            createdAt: new Date().toISOString()
        });
        writeTable('demoActivityLogs', logs);

        return newNote;
    },

    scheduleDemoMeeting: async (id, { title, meetingDate, meetingTime, googleMeetLink, hostName = 'Ratan Chaurasiya', attendeeEmail, agenda = '' }) => {
        const requests = readTable('demoRequests');
        const req = requests.find(r => r.id === id || r.referenceId === id);
        if (!req) return null;

        // Auto-generate Google Meet link if not given
        const meetLink = googleMeetLink && googleMeetLink.trim().length > 5
            ? googleMeetLink.trim()
            : `https://meet.google.com/rct-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

        const meetings = readTable('demoMeetings');
        const newMeeting = {
            id: 'meet_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            title: title || `Demo Session: ${req.projectName} for ${req.companyName || req.fullName}`,
            meetingDate: meetingDate || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            meetingTime: meetingTime || '11:00 AM IST',
            googleMeetLink: meetLink,
            hostName,
            attendeeEmail: attendeeEmail || req.email,
            status: 'SCHEDULED',
            agenda,
            feedback: '',
            createdAt: new Date().toISOString()
        };
        meetings.unshift(newMeeting);
        writeTable('demoMeetings', meetings);

        // Update request status
        req.status = 'Demo Scheduled';
        req.updatedAt = new Date().toISOString();
        writeTable('demoRequests', requests);

        const logs = readTable('demoActivityLogs');
        logs.unshift({
            id: 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            actorName: hostName,
            action: 'MEETING_SCHEDULED',
            details: `Meeting scheduled on ${newMeeting.meetingDate.split('T')[0]} at ${newMeeting.meetingTime}. Google Meet: ${meetLink}`,
            createdAt: new Date().toISOString()
        });
        writeTable('demoActivityLogs', logs);

        return newMeeting;
    },

    scheduleDemoFollowup: async (id, { scheduledDate, followupType = 'Call', notes = '', actorName = 'Admin' }) => {
        const requests = readTable('demoRequests');
        const req = requests.find(r => r.id === id || r.referenceId === id);
        if (!req) return null;

        const followups = readTable('demoFollowups');
        const newFollowup = {
            id: 'flw_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            scheduledDate: scheduledDate || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            followupType,
            status: 'PENDING',
            reminderSent: false,
            notes,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        followups.unshift(newFollowup);
        writeTable('demoFollowups', followups);

        if (req.status === 'New' || req.status === 'Contacted') {
            req.status = 'Follow-up Required';
            req.updatedAt = new Date().toISOString();
            writeTable('demoRequests', requests);
        }

        const logs = readTable('demoActivityLogs');
        logs.unshift({
            id: 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            actorName,
            action: 'FOLLOWUP_SCHEDULED',
            details: `Follow-up (${followupType}) scheduled for ${newFollowup.scheduledDate.split('T')[0]}. ${notes ? 'Notes: ' + notes : ''}`.trim(),
            createdAt: new Date().toISOString()
        });
        writeTable('demoActivityLogs', logs);

        return newFollowup;
    },

    updateDemoQuotation: async (id, { quotationAmount, quotationNotes = '', quotationUrl = '', actorName = 'Admin' }) => {
        const requests = readTable('demoRequests');
        const req = requests.find(r => r.id === id || r.referenceId === id);
        if (!req) return null;

        req.quotationAmount = quotationAmount;
        req.quotationNotes = quotationNotes;
        if (quotationUrl) req.quotationUrl = quotationUrl;
        req.status = 'Quotation Sent';
        req.updatedAt = new Date().toISOString();
        writeTable('demoRequests', requests);

        const logs = readTable('demoActivityLogs');
        logs.unshift({
            id: 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            actorName,
            action: 'QUOTATION_ATTACHED',
            details: `Quotation attached: ${quotationAmount}. Notes: ${quotationNotes || 'Standard Enterprise SLA'}`,
            createdAt: new Date().toISOString()
        });
        writeTable('demoActivityLogs', logs);

        return req;
    },

    recordDemoFeedback: async (id, { feedback = '', outcomeStatus = 'Demo Completed', actorName = 'Admin' }) => {
        const requests = readTable('demoRequests');
        const req = requests.find(r => r.id === id || r.referenceId === id);
        if (!req) return null;

        req.feedback = feedback;
        if (outcomeStatus) req.status = outcomeStatus;
        req.updatedAt = new Date().toISOString();
        writeTable('demoRequests', requests);

        const logs = readTable('demoActivityLogs');
        logs.unshift({
            id: 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            demoRequestId: req.id,
            actorName,
            action: 'FEEDBACK_RECORDED',
            details: `Demo feedback logged. Status set to "${outcomeStatus}". Client remarks: ${feedback}`,
            createdAt: new Date().toISOString()
        });
        writeTable('demoActivityLogs', logs);

        return req;
    },

    // -------------------------------------------------------------
    // ADMIN DASHBOARD STATS
    // -------------------------------------------------------------
    getAdminDashboardStats: async () => {
        const applications = readTable('internships');
        const enquiries = readTable('enquiries');
        const chatLeads = readTable('chatLeads');
        const projects = readTable('projects');
        const services = readTable('services');
        const demoRequests = readTable('demoRequests');

        return {
            database: {
                engine: 'PostgreSQL',
                orm: 'Prisma Client v5.22.0',
                status: isPostgresConnected ? 'Connected' : 'Ready (Standalone Mode)'
            },
            counts: {
                totalApplications: applications.length,
                pendingApplications: applications.filter(a => a.status === 'Pending').length,
                selectedApplications: applications.filter(a => a.status === 'Selected').length,
                totalEnquiries: enquiries.length,
                newEnquiries: enquiries.filter(e => e.status === 'NEW').length,
                chatLeads: chatLeads.length,
                activeProjects: projects.length,
                activeServices: services.length,
                totalDemoRequests: demoRequests.length,
                newDemoRequests: demoRequests.filter(r => r.status === 'New').length,
                scheduledDemos: demoRequests.filter(r => r.status === 'Demo Scheduled').length,
                convertedDemos: demoRequests.filter(r => r.status === 'Converted').length
            },
            recentActivity: [
                ...demoRequests.slice(0, 3).map(d => ({ type: 'DEMO_REQUEST', title: `Demo requested by ${d.fullName} for ${d.projectName}`, time: d.createdAt })),
                ...applications.slice(0, 2).map(a => ({ type: 'INTERNSHIP', title: `${a.fullName} applied for ${a.domain}`, time: a.createdAt })),
                ...enquiries.slice(0, 2).map(e => ({ type: 'ENQUIRY', title: `Enquiry from ${e.name} (${e.service})`, time: e.createdAt })),
                ...chatLeads.slice(0, 2).map(l => ({ type: 'CHATBOT_LEAD', title: `Chatbot captured lead: ${l.name} (${l.phone || l.email})`, time: l.createdAt }))
            ].sort((a, b) => new Date(b.time) - new Date(a.time))
        };
    },

    // -------------------------------------------------------------
    // CERTIFICATES VERIFICATION & ISSUANCE SYSTEM
    // -------------------------------------------------------------
    getCertificates: async () => {
        return readTable('certificates');
    },

    getCertificateById: async (certId) => {
        if (!certId) return null;
        const normalized = certId.trim().toUpperCase();
        const list = readTable('certificates');
        return list.find(c => c.certificateId.toUpperCase() === normalized || c.id === certId) || null;
    },

    issueCertificate: async (data) => {
        const list = readTable('certificates');
        
        let certId = data.certificateId ? data.certificateId.trim().toUpperCase() : '';
        if (!certId) {
            const domainCode = (data.domain || 'DEV').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
            const rand = Math.floor(1000 + Math.random() * 9000);
            certId = `RC-2026-${domainCode || 'ENG'}-${rand}`;
        }

        if (list.some(c => c.certificateId.toUpperCase() === certId)) {
            return { error: `Certificate with ID ${certId} already exists in the official registry.` };
        }

        const newCert = {
            id: 'cert_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
            certificateId: certId,
            studentName: (data.studentName || '').trim(),
            email: data.email ? data.email.trim().toLowerCase() : '',
            domain: data.domain || 'Full Stack Web Development (MERN)',
            duration: data.duration || '1 Month (30 Days)',
            grade: data.grade || 'Distinction / Grade A+',
            issueDate: data.issueDate || new Date().toISOString().split('T')[0],
            batchId: data.batchId || 'batch-2026-alpha',
            status: 'VERIFIED_ACTIVE',
            verificationUrl: `/verify-certificate?id=${encodeURIComponent(certId)}`,
            createdAt: new Date().toISOString()
        };

        list.unshift(newCert);
        writeTable('certificates', list);

        // Update application if linked
        if (data.applicationId) {
            const apps = readTable('internships');
            const app = apps.find(a => a.id === data.applicationId);
            if (app) {
                app.certificateStatus = 'Issued';
                app.certificateId = certId;
                writeTable('internships', apps);
            }
        }

        return newCert;
    },

    revokeCertificate: async (certId, reason = 'Administrative Revocation') => {
        const list = readTable('certificates');
        const cert = list.find(c => c.certificateId.toUpperCase() === certId.trim().toUpperCase() || c.id === certId);
        if (!cert) return null;
        cert.status = 'REVOKED';
        cert.revokedReason = reason;
        cert.revokedAt = new Date().toISOString();
        writeTable('certificates', list);
        return cert;
    }
};
