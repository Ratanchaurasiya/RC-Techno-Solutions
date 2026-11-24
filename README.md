<div align="center">

# 🚀 RC Techno Solutions
### Enterprise Software Engineering &bull; Cloud Architecture &bull; AI Automation

[![Live Website](https://img.shields.io/badge/Live-Website-0084ff?style=for-the-badge&logo=google-chrome&logoColor=white)](https://rc-techno-solutionshhh.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20App-7c3aed?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/explore/progressive-web-apps)
[![Uptime](https://img.shields.io/badge/Uptime-99.9%25-10b981?style=for-the-badge&logo=render&logoColor=white)](https://rc-techno-solutionshhh.onrender.com/)

<p align="center">
  <strong>RC Techno Solutions</strong> is a production-grade enterprise software consultancy and technology training platform engineered for high concurrency, zero-downtime persistence, and end-to-end commercial solutions.
</p>

[Explore Services](https://rc-techno-solutionshhh.onrender.com/services) &bull;
[Interactive Cost Estimator](https://rc-techno-solutionshhh.onrender.com/#estimator) &bull;
[30-Day Internship](https://rc-techno-solutionshhh.onrender.com/internship) &bull;
[Verify Certificate](https://rc-techno-solutionshhh.onrender.com/verify-certificate) &bull;
[Admin Dashboard](https://rc-techno-solutionshhh.onrender.com/admin)

</div>

---

## 🌟 Key Features & Innovations

### 1. 🧮 Interactive Project Cost & Timeline Estimator
- Instant client pricing engine allowing prospective clients to dynamically calculate project budgets and delivery timelines across Web Apps, E-Commerce, AI Agents, and DevOps stacks.
- 1-Click direct WhatsApp proposal bridge with full scope prefilled.

### 2. 🎓 30-Day Student Internship & Capstone Platform
- Tailored for B.Tech, BCA, MCA, Diploma students, and freshers across **6 core technology domains**.
- **Interactive Sample Offer Letter:** Instant preview of official company letterhead, college TPO-approved format, and authorized seal.
- **LocalStorage Form Auto-Save:** Eliminates data loss during mobile application filling.
- **2-Column Responsive Grid:** Optimized mobile viewport UX.

### 3. 🔍 Live Certificate Verification Portal (`/verify-certificate`)
- Instant authentication of completion certificates and training credentials.
- Cryptographically verified badge display with candidate name, specialization domain, grade, and issued timestamp.

### 4. 📑 1-Click Admin Offer Letter & CSV Export Suite (`/admin`)
- **Instant Offer Letter Generator:** Render personalized candidate offer letters and dispatch via WhatsApp or save as PDF in 1 click.
- **Excel/CSV Export:** One-click data export of all registered internship applicants and client inquiries.
- **Enterprise Status Management:** Shortlist, Select, or Update candidate statuses in real time.

### 5. ⚡ Performance & Core Web Vitals Optimization
- **HTTP Gzip Dynamic Compression:** Gzip stream compression enabled on all HTML, CSS, JS, and JSON payloads.
- **Next-Gen WebP Imagery:** 3D hero visual compressed from 564 KB to 44 KB (92% reduction).
- **Aggressive Browser Caching:** Immutable 30-day static asset headers and `stale-while-revalidate` HTML delivery.
- **Progressive Web App (PWA):** `manifest.json` configured for desktop and mobile home-screen app installation.

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    Client[User / Client / Student] -->|HTTPS Requests| CloudServer[Node.js Engine on Render / Vercel]
    CloudServer -->|Gzip & Cache Headers| Client
    
    subgraph Storage Layer [Dual-Layer Zero-Downtime Store]
        CloudServer -->|Primary ORM| Postgres[Cloud PostgreSQL via Prisma]
        CloudServer -.->|Fail-Safe Sync| LocalJSON[(Local Data Store /data/*.json)]
    end
    
    subgraph Lead Dispatch Bridge
        CloudServer -->|Instant Alert| TerminalLog[Terminal Logger]
        CloudServer -.->|Webhook / Bot| MobileAlert[WhatsApp / Telegram Dispatch]
    end
```

---

## 📂 Project Directory Structure

```plaintext
RC-Tech-Solution-main/
├── data/                           # Fallback zero-downtime data persistence layer
│   ├── contact_enquiries.json      # Client consultation enquiries with Ref IDs
│   ├── internship_applications.json# Student internship registrations
│   ├── chat_leads.json             # AI Chatbot captured leads
│   └── chat_messages.json          # Multi-turn conversational logs
├── prisma/                         # Prisma ORM Schema & Migrations
│   └── schema.prisma               # Models: ContactEnquiry, InternshipApplication, etc.
├── views / static pages:
│   ├── index.html                  # Main Enterprise Homepage & Cost Estimator
│   ├── services.html               # 19 Commercial Development Services
│   ├── work.html                   # Enterprise Case Studies & Portfolios
│   ├── internship.html             # 30-Day Internship Program & Sample Offer Letter
│   ├── verify-certificate.html     # Public Credential Verification Portal
│   ├── admin.html                  # Admin Dashboard with CSV Export & Offer Generator
│   ├── architecture.html           # Cloud & Security Blueprints
│   ├── about.html                  # Leadership & Corporate Profile
│   ├── faq.html                    # Interactive Question & Answer Directory
│   └── nda.html                    # Fast-Track Mutual Non-Disclosure Agreement
├── assets & styles:
│   ├── style.css                   # Global Layout & Design System
│   ├── modern-tech-home.css        # Interactive Hero & Metric Animations
│   ├── responsive-core.css         # Universal Viewport Media Queries
│   ├── rc_3d_cloud_ai_hero_v3.webp # High-performance Next-Gen 3D Hero
│   └── manifest.json               # Progressive Web App Configuration
├── scripts:
│   ├── server.js                   # Node.js HTTP Server, Router & Compression
│   ├── db-store.js                 # Unified Database Repository (Postgres + Fallback)
│   ├── script.js                   # Frontend Interactions, Modals & Speed-Dial
│   └── chatbot.js                  # Speech-Enabled AI Assistant Widget
└── README.md                       # Interactive Project Documentation
```

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v8.0.0 or higher
- **PostgreSQL (Optional):** Local or Cloud instance (e.g. Supabase, Render, Neon)

### 2. Installation
Clone the repository and enter the workspace:
```bash
git clone https://github.com/Ratanchaurasiya/RC-Techno-Solutions.git
cd RC-Techno-Solutions
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/rctechno?schema=public"
LEAD_WEBHOOK_URL="" # Optional: WhatsApp / Telegram webhook URL for instant lead alerts
```

### 4. Database Setup (Prisma)
Generate the Prisma Client:
```bash
npx prisma generate
```

### 5. Launch the Server
```bash
npm start
# or for development:
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Compliance
- **Content-Security-Policy (CSP):** Strict script, style, and media resource allowlisting.
- **Sanitization:** All contact and internship inputs are scrubbed against XSS injection.
- **Rate-Limiting & Honeypots:** Bot honeypot traps (`website_trap`, `trap`) prevent spam.
- **Mutual NDA:** Integrated automated client NDA generator with verifiable reference IDs.

---

## 👨‍💻 Founder & Leadership
**RC Techno Solutions** is founded and led by:
- **Ratan Chaurasiya** &mdash; *Principal Architect & Director*
- **Portfolio:** [LinkedIn](https://www.linkedin.com/in/ratan-codespace) &bull; [GitHub](https://github.com/Ratanchaurasiya)
- **Direct WhatsApp:** [+91 63900 35039](https://wa.me/916390035039)
- **Headquarters:** Vastral Gam, Ahmedabad, Gujarat, India

---

<div align="center">
  <p>&copy; 2026 RC Techno Solutions. All Rights Reserved.</p>
  <p><em>Built with Passion, Scaled with Precision.</em></p>
</div>