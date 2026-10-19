# DevFlow - Developer Community & Knowledge Platform
### Elevance Skills Full-Stack Web Development Internship Project Submission

**Live Demo URL:** [https://devflow-community-platform.vercel.app](https://devflow-community-platform.vercel.app)  
**GitHub Repository:** [https://github.com/AmArChOuBeYu2/devflow-community-platform](https://github.com/AmArChOuBeYu2/devflow-community-platform)  
**Developer / Student:** Amar Choubey (sc62970@gmail.com)  

---

## 🚀 Overview

**DevFlow** is a comprehensive, production-grade Developer Community and Q&A Knowledge Platform built upon the core **Stack Overflow Training Project Foundation** and extended with all **6 Internship Extra Task Features** specified by Elevance Skills.

The website is 100% fully responsive across desktop, laptop, tablet, and mobile devices, engineered with modern Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide icons, and jsPDF.

---

## 📋 Comprehensive Feature Implementation Matrix

### 🧱 Training Project Foundation: Stack Overflow Core Engine
* **Questions Engine:** Ask public questions, view detailed questions, upvote/downvote questions, question tags, and view counter.
* **Answers Engine:** Post answers, upvote/downvote answers, and mark accepted answers (author-only privilege).
* **Tagging & Filtering:** Tag taxonomy system (`#react`, `#typescript`, `#nextjs`, `#elevanceskills`, etc.).
* **User Accounts & Profiles:** User profiles with avatars, titles, bios, reputation points, and role badges.

---

### 🌟 Task 1: Community Feed & Social Interaction Platform
* **Post Types:**
  * **Tech Updates:** Plain text updates with optional image URL attachments.
  * **Code Snippets:** Syntax-highlighted code blocks with multi-language selector (TypeScript, JavaScript, Python, Go, Rust) and one-click clipboard copying.
  * **Project Showcases:** Project title, live preview URL, and GitHub repository links.
  * **Learning Achievements:** Milestone celebrations with custom badge titles.
* **Social Engagement:**
  * **Likes & Unlikes:** Real-time engagement counter with red heart feedback.
  * **Threaded Nested Comments:** Comment on any post with support for multi-level nested replies.
  * **Social Share:** Automatic shareable URL generator with one-click clipboard copy.
  * **Bookmarking:** Save posts to personal bookmarks (Free/Bronze: 5 max, Silver/Gold: unlimited).
  * **Post Editing:** Authors can edit their posts anytime, OR users with **100+ reputation points** unlock community post editing privileges.
  * **Post Deletion:** Authors or administrators can delete posts.
* **Following Graph:** Follow and unfollow community creators to switch between **Global Feed** and personalized **Following Feed**.
* **Trending Algorithm:** Top posts ranked dynamically based on engagement score:  
  $$\text{Score} = (\text{Likes} \times 2) + (\text{Comments} \times 3) + (\text{Shares} \times 4)$$
* **Hashtag Discovery:** Clickable hashtags (`#react`, `#webdev`, etc.) to instantly filter feed posts.
* **Notification System:** In-app real-time notification dropdown for likes, comments, mentions (`@username`), and new followers.
* **Reporting & Admin Moderation:**
  * Community members can flag inappropriate posts with custom report reasons.
  * **Admin Moderation Dashboard (`/admin/moderation`):** Review pending reports, remove violating content (-10 reputation penalty to author), and suspend repeat offenders (-50 points penalty).
* **Performance:** Optimized infinite scrolling and server-side pagination simulation.

---

### 🔑 Task 2: Forgot Password & Secure Letters-Only Password Generator
* **Dedicated Route:** Accessible via `/forgot-password`.
* **Dual Recovery Methods:** Reset credentials using either:
  * Registered Email Address
  * Registered Mobile Phone Number
* **Strict Rate Limiter (Once Per Day):**
  * If a user requests password reset a second time on the same calendar day, the system strictly returns the warning:  
    > **“You can use this option only one time per day.”**
* **Strict Password Generator:**
  * Generates random, cryptographically secure passwords that **MUST contain ONLY uppercase and lowercase letters (`[A-Za-z]`)**, with **NO numbers and NO special characters**.
  * Includes one-click copy and "Use This Password" instant applicator.

---

### 💳 Task 3: Subscription & Premium Membership System (Razorpay)
* **Tiered Membership Structure:**
  | Plan | Price | Question Limit | Profile Badge | Key Unlocks |
  | :--- | :--- | :--- | :--- | :--- |
  | **Free** | ₹0 | 1 question / day | Community Member | Basic text search, standard voting |
  | **Bronze** | ₹99 / mo | 5 questions / day | Bronze Supporter | Advanced search filters (tags, status, votes) |
  | **Silver** | ₹299 / mo | 15 questions / day | Silver Champion | Priority support, enhanced visibility, unlimited bookmarks |
  | **Gold** | ₹999 / mo | Unlimited / day | Gold VIP Master | Highest search priority, featured profile, VIP support |
* **Daily Question Limit Enforcement:** The system automatically checks the user's active tier and blocks attempts to post questions once the daily quota is reached.
* **Razorpay Gateway Simulation:** Authentic checkout modal featuring UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and NetBanking.
* **Instant Activation & Unique Invoices:** Successful payments activate the plan instantly, create a unique invoice ID (e.g., `INV-2026-XXXX`), and dispatch in-app notifications.
* **Downloadable Tax Invoices (PDF):** Integrated with `jspdf` to generate and download official, GST-compliant PDF invoices with complete billing breakdowns.

---

### 🏆 Task 4: Reputation & Community Reward System
* **Reputation Point Triggers:**
  * Post an answer: **+5 points**
  * Answer marked as accepted solution: **+10 points**
  * Answer reaches 5 upvotes milestone: **+5 additional points**
  * Question reaches 10+ upvotes milestone: **+2 points**
  * Complete profile with mandatory details: **+10 points (one-time bonus)**
  * Downvote received: **-2 points**
  * Answer deleted by user: **-5 points**
  * Content removed by administrator for violations: **-10 points**
* **Privilege Thresholds:**
  * **50 points:** Comment without restrictions
  * **100 points:** Edit community posts
  * **250 points:** Vote to close questions
  * **500 points:** Report inappropriate content
* **Reputation Transfer System:**
  * Allowed only if sender has **> 50 reputation points**.
  * Transfer limits: **Max 50 points per transaction**, **Max 100 points per day**.
  * Recorded in complete transaction history with sender, receiver, timestamp, and reason.
* **Dedicated Public Activity Ledger:** Transparent log displayed on the public profile (`/users/[id]`) showing every single reputation increase/decrease, reason, and timestamp.

---

### 🌐 Task 5: Multi-Language Functionality with Security Verification
* **6 Supported Languages:** English (`en`), Spanish (`es`), Hindi (`hi`), Portuguese (`pt`), Chinese (`zh`), and French (`fr`).
* **Security Verification Before Language Switch:**
  * **Switch to French:** Verifies user's identity by sending an OTP to their **registered email address**.
  * **Switch to Other Languages (EN, ES, HI, PT, ZH):** Authenticates the user by sending an OTP to their **registered mobile number**.
  * Interactive modal appears requiring 6-digit OTP verification prior to applying the localization state.

---

### 🛡️ Task 6: Advanced Login Security & Device Management
* **Login Telemetry:** Captures Browser, Operating System, Device Type (Desktop/Mobile/Tablet), IP Address, Login Location, and Timestamp for every session.
* **Session Dashboard (`/profile/security`):**
  * View all active sessions with device badges.
  * One-click remote session revocation.
  * "Revoke All Other Sessions" button.
* **Security Alerts:** Simulated email alert dispatched whenever a login is detected from an unrecognized device.
* **Trusted Devices:** "Remember this trusted device" toggle.
* **Configurable Inactivity Expiry:** Auto-expire idle sessions after 15 mins, 30 mins, 1 hr, 24 hrs, or 7 days.
* **Admin Audit Logs:** Dedicated security monitoring table in `/admin/moderation` for platform defense.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router, Server & Client Components)
* **Language:** TypeScript 5 (Strict Mode)
* **Styling:** Tailwind CSS (Fully Responsive, Dark & Light mode compatible)
* **Icons:** Lucide React
* **PDF Invoicing:** jsPDF
* **Deployment Target:** Vercel / Netlify

---

## 🧪 Evaluator & Mentor Testing Accounts

Use the **"Switch User"** pill in the top navigation bar to test different roles and tiers with 1 click:

1. **Amar Choubey** (Bronze Tier • 125 Rep • Admin Role)
   * Email: `sc62970@gmail.com`
   * Mobile: `+91 9876543210`
2. **Sarah Chen** (Gold Tier • 1,480 Rep • Unlimited Questions & VIP Perks)
   * Email: `sarah.chen@techdev.io`
3. **Alex Rivera** (Silver Tier • 630 Rep • 15 Questions / Day)
   * Email: `alex.rivera@devpulse.org`
4. **David Kim** (Free Tier • 40 Rep • 1 Question / Day)
   * Email: `david.kim@learner.net`

---

## 📹 Video Demo Walkthrough Script (2–5 Minutes)

1. **Introduction (0:00 - 0:30):**
   * State your name: Amar Choubey.
   * Mention the training project foundation (Stack Overflow Clone) and how the 6 internship tasks were seamlessly engineered into it.
2. **Core Q&A & Daily Limits (0:30 - 1:15):**
   * Show asking a question and how the daily limit adapts based on the active plan (Free: 1/day, Bronze: 5/day, etc.).
   * Show voting on questions and answers, and marking an accepted answer (+10 reputation).
3. **Community Feed & Social Platform (1:15 - 2:00):**
   * Demonstrate posting a code snippet and project showcase.
   * Like, comment with a nested reply, share, and bookmark.
   * Switch between "Global Feed" and "Following Feed".
4. **Forgot Password & Password Generator (2:00 - 2:45):**
   * Navigate to `/forgot-password`.
   * Trigger password reset and show the 1-per-day warning if re-attempted.
   * Click "Generate Random Password" and highlight that it generates letters only (no numbers, no special characters).
5. **Subscriptions & PDF Invoices (2:45 - 3:30):**
   * Open `/pricing`, select a plan, and open the Razorpay modal.
   * Complete payment, show instant plan activation, and click "Download Invoice (PDF)".
6. **Multi-Language OTP & Security Sessions (3:30 - 4:15):**
   * Switch language to French -> Show Email OTP verification modal.
   * Switch to Hindi/Spanish -> Show Mobile OTP verification modal.
   * Go to `/profile/security`, show active sessions, and demonstrate remote session revocation.
7. **Conclusion (4:15 - 4:45):**
   * Show the Admin Moderation Dashboard with flagged content and audit logs.
   * Thank the mentor and Elevance Skills team!

---

## 🚢 Local Development Instructions

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
