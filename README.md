# DevFlow - Developer Community & Knowledge Platform
### Elevance Skills Full-Stack Web Development Internship Project Submission

**Live Production URL:** [https://devflow-community-platform.vercel.app](https://devflow-community-platform.vercel.app)  
**GitHub Repository:** [https://github.com/AmArChOuBeYu2/devflow-community-platform](https://github.com/AmArChOuBeYu2/devflow-community-platform)  
**Admin Moderation Route:** [https://devflow-community-platform.vercel.app/admin/moderation](https://devflow-community-platform.vercel.app/admin/moderation)  
**Student / Intern:** Amar Choubey ([sc62970@gmail.com](mailto:sc62970@gmail.com))  
**Master Audit Matrix:** [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md)  
**End-to-End Test Report:** [`TEST_REPORT.md`](./TEST_REPORT.md)  
**Environment Variables Template:** [`.env.example`](./.env.example)

---

## 🚀 Project Overview

**DevFlow** is a full-featured Developer Knowledge and Community Platform inspired by **Stack Overflow**, engineered as the final internship project for Elevance Skills. Built on top of the foundational developer Q&A training project, DevFlow incorporates all **six mandatory internship modules**:

1. **Community Feed & Social Platform** (Updates, code snippets, project showcases, achievements, hashtags, mentions, threaded comments, replies, sharing, bookmarks, reporting, and admin moderation).
2. **Forgot Password & Letters-Only Password Generator** (Dual recovery via registered email or mobile phone, strict 1 request per calendar day rate limiting, 6-digit challenge code verification, and cryptographic password generator containing strictly uppercase and lowercase letters `[A-Za-z]`).
3. **Subscriptions & Premium Membership** (Free, Bronze @ ₹99/mo, Silver @ ₹299/mo, Gold @ ₹999/mo tiers with daily question quotas, advanced search privileges, bookmark quotas, simulated Razorpay checkout with evaluation sandbox notice, and downloadable demo receipts).
4. **Reputation Engine & Community Transfers** (Comprehensive reward rules: +5 answer posting, +10 accepted solution, +2 for 10 question upvotes [idempotent], +5 for 5 answer upvotes [idempotent], -2 downvotes, -5 answer deletion, -10 admin guideline violation removal; privilege thresholds at 50, 100, 250, and 500 reputation points; peer-to-peer reputation transfers with strict guards: >50 balance, ≤50/tx, ≤100/day).
5. **Multi-Language Support with Security Verification** (English, Spanish, Hindi, Portuguese, Chinese, French; French requires Email OTP challenge; other five languages require Mobile OTP challenge; language switch applied only upon verified challenge).
6. **Advanced Login Security, Session Management & Device Telemetry** (Multi-device session tracking, real client header detection via `/api/auth/session`, remote session revocation, session timeout management, and administrator moderation and suspension center).

---

## 🧪 Evaluator Demo Credentials

Use the **"Switch User"** pill in the top navigation bar or log in manually at `/login`:

| User Name | Role | Email | Phone | Password | Tier | Initial Rep |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Amar Choubey** | Administrator | `sc62970@gmail.com` | `+91 9876543210` | `DevFlow2026` | Bronze | 125 |
| **Sarah Chen** | Senior Contributor | `sarah.chen@elevance.edu` | `+91 9811223344` | `DevFlow2026` | Silver | 640 |
| **Alex Rivera** | VIP Master | `alex.rivera@techflow.dev` | `+91 9877001122` | `DevFlow2026` | Gold | 1,420 |
| **Priya Patel** | New Contributor | `priya.patel@devflow.org` | `+91 9766554433` | `DevFlow2026` | Free | 45 |

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 15.5.28 (App Router, Server & Client Components)
- **Language:** TypeScript 5 (Strict Mode, 100% Type-Safe)
- **Styling:** Tailwind CSS 4 (Responsive on Mobile, Tablet & Desktop)
- **Icons:** Lucide React
- **PDF Generation:** jsPDF (Itemized GST Invoices)
- **Hosting:** Vercel Production (`https://devflow-community-platform.vercel.app`)

---

## 📋 Requirements & Features Breakdown

### 🧱 Training Foundation: Stack Overflow Q&A Engine
- **Top Questions Feed:** Displayed immediately at the top of the homepage with tabs for *Newest*, *Most Voted*, and *Unanswered*.
- **Question Lifecycle:** Detailed question view, answers list, view counters, tags taxonomy.
- **Fair-Play Safeguards:** Self-voting on questions or answers is strictly disallowed; question authors cannot earn self-reputation by accepting their own answers; closed questions are barred from receiving new answers.
- **Idempotent Milestones:** Question reaching 10 upvotes awards +2 points strictly once; answer reaching 5 upvotes awards +5 points strictly once.

### 🌟 Task 1: Community Feed & Social Platform
- **4 Post Types:** Technical updates, syntax-highlighted code snippets, project showcases (live URL + GitHub), learning achievements.
- **Interactions:** Likes, threaded comments, nested replies, social share with URL copy, bookmarks.
- **Trending Posts Algorithm:** $\text{Score} = (\text{Likes} \times 2) + (\text{Comments} \times 3) + (\text{Shares} \times 4)$.
- **Server-Side Paginated API:** `/api/community/posts?page=1&limit=10&sort=trending`.
- **Reporting & Moderation:** Members with 500+ reputation points can flag violating content. Administrators review reports in `/admin/moderation` with options to resolve/delete (-10 rep penalty) or suspend repeat offenders (-50 rep penalty, `isSuspended: true`).

### 🔑 Task 2: Forgot Password & Letters-Only Password Generator
- **Dedicated Route:** `/forgot-password`.
- **Dual Channels:** Account lookup and recovery via registered Email or Mobile Number.
- **Strict 1-Per-Day Rate Limiting:** Enforces maximum 1 request per calendar day. Repeated requests within the same day return the exact required message:
  > **“You can use this option only one time per day.”**
- **6-Digit Challenge Verification:** Requires code challenge verification before presenting the password reset input.
- **Letters-Only Password Generator:** Cryptographically generates passwords containing **ONLY uppercase and lowercase letters (`[A-Za-z]`)**, strictly verified by regex `^[A-Za-z]+$` with zero numbers and zero special characters.

### 💳 Task 3: Subscription & Premium Membership System
- **Tier Structure:**
  | Plan | Price | Question Limit | Profile Badge | Features Unlocked |
  | :--- | :--- | :--- | :--- | :--- |
  | **Free** | ₹0 | 1 / day | Community Member | Basic text search, standard voting, 5 bookmarks |
  | **Bronze** | ₹99 / mo | 5 / day | Bronze Supporter | Advanced search filters (tags, status, votes) |
  | **Silver** | ₹299 / mo | 15 / day | Silver Champion | Priority support, enhanced visibility, unlimited bookmarks |
  | **Gold** | ₹999 / mo | Unlimited | Gold VIP Master | Top search priority, featured profile, VIP support |
- **Razorpay Checkout:** Realistic gateway modal supporting UPI (Google Pay, PhonePe, Paytm), Cards, and NetBanking in evaluation sandbox mode (clearly labeled as DEMO CHECKOUT; no real charge).
- **Downloadable PDF Demo Receipts:** Itemized demo receipts generated via `jspdf` featuring subtotal, 18% IGST calculation breakdown, GSTIN, and clear DEMO RECEIPT notice.

### 🏆 Task 4: Reputation Points System & Transfers
- **Point Triggers:**
  - Post an answer: **+5 points**
  - Accepted solution: **+10 points**
  - Answer reaches 5 upvotes milestone: **+5 points (one-time)**
  - Question reaches 10+ upvotes milestone: **+2 points (one-time)**
  - Complete profile: **+10 points (one-time)**
  - Downvote received: **-2 points**
  - Answer deleted by author: **-5 points**
  - Content removed by administrator for violations: **-10 points**
- **Privilege Thresholds:** 50 pts (Comment freely), 100 pts (Edit community posts), 250 pts (Vote to close questions), 500 pts (Report content).
- **Reputation Transfers:** Peer-to-peer transfers requiring >50 points sender balance, max 50 points per transaction, max 100 points per day, with self-transfers barred.
- **Public Reputation Activity Ledger:** Displayed at `/profile` and `/users/[id]` with timestamped records for every point change.

### 🌐 Task 5: Multi-Language OTP Verification
- **6 Supported Languages:** English (`en`), Spanish (`es`), Hindi (`hi`), Portuguese (`pt`), Chinese (`zh`), French (`fr`).
- **Channel Routing Rule:**
  - Switching to **French** requires verification via the user's **registered email address** (demo OTP generated locally; no external email sent).
  - Switching to any of the **other 5 languages** requires verification via the user's **registered mobile phone number** (demo OTP generated locally; no external SMS sent).
- **Security Guard:** The target language is applied and persisted only after the 6-digit OTP challenge is verified.

### 🛡️ Task 6: Login Sessions & Device Management
- **Device Telemetry:** Client-side UA detection and Next.js Route Handler `/api/auth/session` request inspection. IP and location fields are explicitly labeled with `(simulated)` where mock/fallback values apply.
- **Session Management (`/profile/security`):** Active sessions list, individual remote session revocation, and "Revoke All Other Sessions" button.
- **Inactivity Timeout:** Configurable session expiry (15m, 30m, 1h, 24h, 7d).
- **Account Suspension Guard:** Suspended accounts are barred from asking questions, posting answers, creating feed posts, commenting, reacting, and voting.

---

## ⚡ Environment Variables & Production Integration

See [`.env.example`](./.env.example) for configuration:

```env
# Production Razorpay Keys (Leave empty for simulated evaluation sandbox mode)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email Dispatcher (SMTP / Resend)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=

# SMS Dispatcher (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

> **Evaluation Sandbox Notice:** When external API keys are not provided, DevFlow runs in an evaluation sandbox mode that simulates checkout, OTP delivery, and session detection with transparent UI labeling, allowing mentors and evaluators to test all flows without incurring transaction charges or requiring SMS gateway credits.

---

## 🧪 Running the Verification Suite

Run the automated test suite locally:

```bash
# Run unit & boundary verification test suite
node scripts/verify-requirements.mjs

# Run production Next.js build
npm run build
```

---

## 📹 Video Demo Walkthrough Guide (2–5 Minutes)

1. **Introduction (0:00 - 0:30):** State your name (Amar Choubey) and introduce DevFlow as the Elevance Skills internship submission built upon the Stack Overflow training foundation.
2. **Core Q&A & Daily Quotas (0:30 - 1:15):** Show the homepage Top Questions feed, upvoting, answering (+5 rep), and how daily question limits adapt based on tier (Free: 1/day, Bronze: 5/day).
3. **Community Feed & Moderation (1:15 - 2:00):** Show posting a snippet/showcase, liking, commenting, and reporting content (500+ rep privilege). Show admin moderation at `/admin/moderation`.
4. **Forgot Password (2:00 - 2:45):** Demonstrate `/forgot-password`, trigger the 1-per-day rate limit warning (*"You can use this option only one time per day."*), verify OTP, and click "Generate Random Password" highlighting letters-only `[A-Za-z]`.
5. **Subscriptions & Demo Receipts (2:45 - 3:30):** Open `/pricing`, select Silver plan, complete simulated checkout in evaluation sandbox mode, and download the demo receipt PDF with 18% IGST calculation breakdown.
6. **Multi-Language OTP & Security (3:30 - 4:15):** Switch to French (triggers Email OTP) vs Hindi/Spanish (triggers Mobile OTP). Open `/profile/security` to show active sessions and revoke remote sessions.
7. **Conclusion (4:15 - 4:45):** Summarize the verified logic checks (23/23 logic tests passed), clean production build (22 routes), and thank the Elevance Skills team!

---

## 👨‍💻 Developer & Student Information

- **Name:** Amar Choubey
- **Email:** sc62970@gmail.com
- **GitHub:** [https://github.com/AmArChOuBeYu2](https://github.com/AmArChOuBeYu2)
- **Internship Organization:** Elevance Skills
