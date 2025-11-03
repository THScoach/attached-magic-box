# HITS™ Product Specification
## The Hitting Intelligence Training System

**Last Updated:** January 2025  
**Version:** 1.0

---

## 🎯 EXECUTIVE SUMMARY

HITS™ is a tempo-based baseball swing training platform that uses AI-powered biomechanics analysis to help hitters of all levels improve their swing mechanics. Built on 25+ years of pro baseball coaching experience by Coach Rick Strickland (Texas Rangers AA Hitting Coach, Former Chicago Cubs Coach), the system breaks down swing mechanics into three measurable pillars: Anchor, Engine, and Whip.

**Core Value Proposition:**  
"We don't teach swings. We build hitters." — Simplify the science. Train the sequence.

---

## 💰 PRICING & PRODUCT TIERS

### 1. FREE - HITS Tempo Score
**Price:** FREE  
**Target:** First-time users, trial users  
**Checkout:** App signup (no payment)  
**Swing Limit:** 10 free swing analyses

**Features:**
- ✅ Instant Tempo Score analysis (2.0:1 vs 1.5:1 ratios)
- ✅ Basic Anchor-Engine-Whip breakdown
- ✅ Access to drill library (view only)
- ✅ View sample reports
- ❌ No Coach Rick AI chat
- ❌ No scheduling tools
- ❌ No progress tracking
- ❌ No live coaching access

**User Journey:**
1. Land on homepage → "Get Your Tempo Score Free"
2. Sign up with email/password
3. Upload first swing video
4. View basic analysis report
5. Prompted to upgrade after 10 swings

---

### 2. 7-DAY CHALLENGE
**Price:** $9.97 one-time  
**Target:** Committed athletes looking to test the system  
**Checkout:** https://whop.com/the-hitting-skool/297-b6/  
**Tier Code:** `challenge`

**Features:**
- ✅ Everything in FREE
- ✅ Daily video analysis + feedback (7 days)
- ✅ Personalized 7-day drill progression
- ✅ Coach Rick AI chat access
- ✅ Live Q&A access with Coach Rick
- ✅ Weekly training schedules
- ✅ Basic GRIND Score tracking
- ❌ No unlimited analyses after 7 days

**Results Promise:**  
"+3-5 MPH average gain in just 7 days" • "Over 400 enrolled this month"

**User Journey:**
1. Click "Start Challenge" on Programs page
2. Purchase on Whop ($9.97)
3. Webhook activates 7-day membership
4. Access full platform for 7 days
5. Upsell to DIY membership after completion

---

### 3. HITS MEMBERSHIP (DIY)
**Price:** $29.97/month recurring  
**Target:** Self-directed athletes, committed players  
**Checkout:** https://whop.com/the-hitting-skool/hits-diy-platform/  
**Tier Code:** `diy`

**Features:**
- ✅ Unlimited AI video reviews
- ✅ Full drill library (60+ exercises with videos)
- ✅ Tempo Tracker dashboard
- ✅ Progress tracking over time
- ✅ Weekly training schedules (full access)
- ✅ Community support
- ✅ Coach Rick AI chat (unlimited)
- ✅ Access to live coaching replays
- ✅ Full GRIND Score tracking
- ✅ Session tracking
- ✅ Multi-player management (for coaches)

**User Journey:**
1. Click "Join Now" on Programs page
2. Purchase on Whop ($29.97/mo)
3. Webhook activates membership
4. Full platform access forever (while subscribed)

---

### 4. ELITE - 90-Day Transformation
**Price:** $2,497 one-time  
**Target:** High-commitment athletes, college prospects  
**Checkout:** Schedule consultation call (not direct purchase)  
**Tier Code:** `elite`  
**Capacity Limit:** 15 athletes per quarter

**Features:**
- ✅ Everything in DIY
- ✅ Weekly 1-on-1 video reviews with Coach Rick
- ✅ Custom 90-day periodization plan
- ✅ Priority support (24hr response)
- ✅ Direct access to Coach Rick
- ✅ Bi-weekly progress check-ins
- ✅ Access to coach dashboard features
- ✅ **Performance Guarantee:** +5 MPH Exit Velo or Full Refund

**User Journey:**
1. Click "Book Call" on Programs page
2. Schedule consultation via Calendly
3. Sales call with Coach Rick
4. Manual enrollment + payment plan setup
5. Assigned dedicated support

---

### 5. HITS ULTIMATE (Equipment Package)
**Price:** Call for pricing (estimate $3,000-4,000)  
**Target:** Athletes wanting complete setup  
**Checkout:** Schedule consultation call  
**Status:** Limited availability

**Includes:**
- ✅ Everything from 90-Day Elite program
- ✅ Blast Motion sensor (shipped)
- ✅ Stack Bat training system (shipped)
- ✅ Premium training equipment (~$800+ value)
- ✅ White-glove setup + support
- ✅ Equipment shipped to your door

**User Journey:**
1. Click "Schedule Call" on Programs page
2. Consultation call
3. Custom quote based on equipment needs
4. Manual enrollment + equipment shipment

---

### 6. COACHES & TEAMS
**Price:** Custom bulk licensing  
**Target:** High school teams, travel orgs, academies  
**Checkout:** Request demo → sales call  
**Features:** Roster management, seat licensing, promo codes

**Coach Features:**
- ✅ Manage multiple athletes (roster view)
- ✅ Batch video uploads
- ✅ Team performance tracking
- ✅ Generate promo codes for team members
- ✅ Seat allocation management
- ✅ Performance alerts
- ✅ Communication tools
- ✅ Content library management

**User Journey:**
1. Click "Request Demo" on Programs page
2. Fill out team info form
3. Sales call to discuss needs
4. Custom pricing based on seat count
5. Manual coach account creation
6. Coach generates promo codes for athletes

---

## 🎯 CORE FEATURES

### The Three Pillars System

**1. ANCHOR (Blue)**
- Ground force & stability
- Rear leg stability timing
- Connection point detection
- Score: 0-100

**2. ENGINE (Red)**
- Rotational power
- Pelvis-to-torso coil timing
- Hip rotation velocity
- Score: 0-100

**3. WHIP (Orange)**
- Kinetic release
- Hand path efficiency
- Lag acceleration
- Score: 0-100

### AI-Powered Analysis
- **Technology:** MediaPipe Pose Detection + TensorFlow.js
- **Analysis Time:** 30-60 seconds per swing
- **Output:** Tempo ratios, phase breakdowns, MLB comparisons
- **Storage:** Supabase (Lovable Cloud)

### Coach Rick AI Chat
- **Model:** Google Gemini 2.5 Flash (via Lovable AI Gateway)
- **Context:** Knows user's swing data, drill history, GRIND score
- **Capabilities:** 
  - Answer technique questions
  - Explain drill progressions
  - Provide motivation
  - Suggest training adjustments
- **Access:** Challenge, DIY, Elite tiers only

### GRIND Score System
- **Definition:** Reliability score based on task completion
- **Formula:** (Completion % × On-Time %) / 100
- **Range:** 0-100
- **Tracks:**
  - Current score
  - Current streak (days)
  - Longest streak
  - Tasks completed / assigned

### Training Scheduler
- **Access Levels:**
  - Free: None
  - Challenge: Weekly plans
  - DIY: Full scheduling
  - Elite: Full + custom periodization
- **Features:**
  - Daily drill assignments
  - Rest day recommendations
  - Progress tracking
  - Check-in system

### Video Analysis Features
- Upload from device
- Record in-app (front/rear camera)
- Dual-camera sync recording
- Batch upload (coaches)
- Tag videos (drill vs analysis)
- Session tracking
- Progress comparisons

---

## 🔄 USER FLOWS

### Primary User Journey (Athlete - Free → Paid)

**1. Discovery & Lead Capture**
- Land on homepage → see "Get Your Tempo Score Free"
- Alternative: See sample report → enter email
- Click CTA → redirected to /auth

**2. Sign Up & Onboarding**
- Create account (email/password)
- Auto-confirm email (no email verification needed)
- Redirect to /dashboard
- **ISSUE DETECTED:** Equipment onboarding modal shows but blocks access - should be skippable
- Select/create first player profile

**3. First Analysis**
- Navigate to /analyze
- Upload or record swing video
- AI processes video (30-60s)
- View results on /analysis-result
- See Three Pillars breakdown
- View tempo ratio
- See upgrade prompts for locked features

**4. Upgrade Decision Point**
- After 10 free swings OR
- When trying to access Coach Rick chat OR
- When trying to use scheduler
- Click "Upgrade" → redirected to Programs page
- Choose tier → checkout on Whop
- Webhook activates membership
- Immediate access to paid features

**5. Ongoing Engagement**
- Daily: Check dashboard, complete assigned drills
- Weekly: Review progress, analyze new swings
- Monthly: Track GRIND score, streaks

### Coach User Journey

**1. Account Creation**
- Request demo on website
- Manual account creation (admin)
- Role assigned: `coach`
- Access coach dashboard

**2. Team Setup**
- Navigate to /coach-dashboard
- Generate promo codes with seat allocation
- Share codes with athletes
- Athletes redeem codes → auto-added to roster

**3. Team Management**
- View roster on /coach-roster
- Batch upload player videos
- Review player analyses
- Send messages/feedback
- Track team performance

---

## ⚠️ ISSUES DETECTED

### Critical Issues

1. **Lead Capture Flow Broken**
   - **Issue:** User enters email on landing page → redirected to auth → THEN to demo report
   - **Expected:** Should send lead email immediately after form submission
   - **Current Error:** 429 rate limit + invalid Resend API key
   - **Fix Required:** Update RESEND_API_KEY, add rate limiting handling

2. **Equipment Onboarding Blocks Access**
   - **Issue:** Modal appears immediately after signup, no way to skip
   - **Impact:** New users can't explore app until completing onboarding
   - **Fix Required:** Make modal dismissible or move to profile

3. **Free Tier Limit Confusion**
   - **Code says:** 10 free swings (line 313 in Analyze.tsx)
   - **Old comment says:** 2 swings
   - **Database function says:** 10 swings
   - **Fix Required:** Consistent messaging everywhere

4. **Player Selection Required Before Upload**
   - **Issue:** Must create/select player before analyzing first swing
   - **Impact:** Extra friction for new users
   - **Fix Required:** Auto-create "Me" player on first analysis

### Medium Priority Issues

5. **Inconsistent Whop Links**
   - Multiple hardcoded Whop URLs in different files
   - Should use environment variables
   - Some products missing links

6. **Coach Rick Chat Upgrade Link Wrong**
   - Line 1066 in AnalysisResult.tsx: `window.open("https://whop.com/your-product", "_blank")`
   - Not a real product URL

7. **No Clear Path from Challenge → DIY**
   - 7-Day Challenge ends → no prompt to continue with DIY membership

8. **GRIND Score Not Visible to Free Users**
   - Feature is powerful for retention but hidden behind paywall
   - Should show with locked state + upgrade prompt

### Low Priority Issues

9. **Missing Video Explainer**
   - Landing page has placeholder "System Explainer Video - Coming Soon"
   - Should have actual content

10. **No Analytics Dashboard for Coaches**
    - Coaches can see roster but no aggregate team analytics
    - Missing: team avg tempo, improvement rates, etc.

---

## 🎨 DESIGN SYSTEM

### Brand Colors
- **Primary:** Silver/Chrome (`--primary`)
- **Secondary:** Used for pillars (Blue, Red, Orange)
- **Background:** Black (`--background`)
- **Foreground:** White (`--foreground`)

### Typography
- **Headings:** Font-black, uppercase, tight tracking
- **Body:** Inter, regular weight
- **UI:** Font-semibold for buttons/labels

### Component Library
- **Framework:** React 18 + TypeScript
- **UI:** shadcn/ui components
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts

---

## 🔧 TECHNICAL STACK

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Routing:** React Router v6
- **State:** React hooks + TanStack Query
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS

### Backend (Lovable Cloud / Supabase)
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (swing-videos bucket)
- **Edge Functions:** Deno-based serverless
- **Realtime:** Supabase Realtime

### AI & Analysis
- **Pose Detection:** MediaPipe Pose + TensorFlow.js
- **AI Chat:** Google Gemini 2.5 Flash (Lovable AI Gateway)
- **Video Processing:** Canvas API + frame extraction

### Payments
- **Platform:** Whop
- **Integration:** Webhook-based membership activation
- **Webhook Secret:** `WHOP_WEBHOOK_SECRET`

### Email
- **Provider:** Resend
- **API Key:** `RESEND_API_KEY`
- **Sender:** onboarding@resend.dev (update in production)

---

## 📊 KEY METRICS TO TRACK

### Product Metrics
- Free-to-paid conversion rate
- Challenge-to-DIY conversion rate
- Churn rate by tier
- Average swings per user per month
- GRIND score distribution

### Engagement Metrics
- Daily active users (DAU)
- Weekly active users (WAU)
- Average session duration
- Video uploads per week
- Coach Rick chat usage

### Revenue Metrics
- MRR (Monthly Recurring Revenue)
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value by tier)
- Coach/team account penetration

---

## 🚀 PRE-LAUNCH CHECKLIST

### Must Fix Before Launch

- [ ] **Fix lead capture email flow** (Resend API key + rate limiting)
- [ ] **Make equipment onboarding skippable**
- [ ] **Fix Coach Rick upgrade link** (use correct Whop URL)
- [ ] **Add clear upgrade prompts** at 5 swings and 9 swings (warn before limit)
- [ ] **Auto-create default player** on first analysis
- [ ] **Add Challenge → DIY upsell flow** (email sequence + in-app prompt)
- [ ] **Consistent free tier messaging** (10 swings everywhere)
- [ ] **Test Whop webhook integration** thoroughly
- [ ] **Update Resend sender email** to branded domain
- [ ] **Add error handling** for all edge functions

### Should Fix Soon

- [ ] Record system explainer video
- [ ] Add coach team analytics dashboard
- [ ] Build email nurture sequences
- [ ] Add progress export (PDF reports)
- [ ] Build mobile app (Capacitor setup exists)
- [ ] Add social proof (testimonials, before/after)
- [ ] SEO optimization (meta tags, structured data)
- [ ] Add referral program

### Nice to Have

- [ ] Compare with MLB players feature
- [ ] Community forum
- [ ] Leaderboards
- [ ] Challenges/competitions
- [ ] Integration with Blast Motion, HitTrax, etc.
- [ ] Parent dashboard (for youth players)

---

## 💡 MARKETING POSITIONING

### Target Audiences

**1. Youth Players (13-18)**
- Pain: Confusing advice from multiple coaches
- Goal: Get recruited, improve quickly
- Message: "Train like the pros with proven science"

**2. College Players (18-22)**
- Pain: Plateau in development, need edge
- Goal: Pro aspirations, stand out
- Message: "The same system used by MLB organizations"

**3. Adult Rec Players (22+)**
- Pain: Want to improve, limited time
- Goal: Stay competitive, enjoy game more
- Message: "Get better in just 15 minutes a day"

**4. Coaches & Teams**
- Pain: Managing many players, inconsistent development
- Goal: Track progress, save time, improve results
- Message: "Develop your entire roster with data-driven training"

### Key Differentiators

1. **Tempo-Based vs. Position-Based**
   - Most systems: "Get your hands here"
   - HITS: "Sequence your movements properly"

2. **MLB-Proven Methodology**
   - Coach Rick's 25+ years in pro baseball
   - Used by Cubs, Rangers, Cardinals organizations

3. **AI-Powered + Human Coaching**
   - Instant feedback from AI
   - Optional human coaching at higher tiers

4. **Measurable Progress**
   - Tempo ratios, pillar scores, GRIND scores
   - Track improvement over time

5. **Affordable Access to Pro Knowledge**
   - Free tier = access to pro-level analysis
   - $9.97 = week of daily pro coaching
   - $30/mo = unlimited pro-level training

---

## 📱 DISTRIBUTION CHANNELS

### Owned Channels
- Website: thehittingskool.com (assumed)
- App: Web app (mobile responsive)
- Email: Lead nurture, retention

### Partnership Channels
- Technology partners: Reboot Motion, Blast Motion, etc.
- Team partnerships: High school/travel teams
- Academy partnerships: Training facilities

### Content Marketing
- YouTube: Swing breakdowns, drill tutorials
- Instagram: Progress clips, before/afters
- TikTok: Quick tips, success stories
- Podcast: Coach Rick interviews

### Paid Acquisition
- Facebook/Instagram Ads → 7-Day Challenge
- Google Search Ads → "baseball swing analysis"
- YouTube Pre-roll → System explainer

---

## 📈 GROWTH STRATEGY

### Phase 1: Launch (Months 1-3)
- **Goal:** 1,000 free users, 100 paid users
- **Focus:** Product-market fit, user feedback
- **Channels:** Organic social, referrals, Coach Rick's network

### Phase 2: Scale (Months 4-6)
- **Goal:** 5,000 free users, 500 paid users
- **Focus:** Paid acquisition, content marketing
- **Channels:** FB/IG ads, YouTube channel, partnerships

### Phase 3: Expand (Months 7-12)
- **Goal:** 20,000 free users, 2,000 paid users
- **Focus:** Team accounts, enterprise sales
- **Channels:** Outbound sales, team partnerships, events

---

## 🎬 CONCLUSION

HITS™ is a complete, market-ready product with proven methodology, strong technical foundation, and clear monetization strategy. The core product is solid, but needs several critical bug fixes and UX improvements before aggressive marketing.

**Recommended Next Steps:**
1. Fix the 10 critical/medium issues (1-2 weeks)
2. Run closed beta with 50 users (2 weeks)
3. Soft launch to Coach Rick's network (1 week)
4. Full public launch with paid acquisition

**Estimated Time to Launch:** 4-6 weeks with focused development

---

*This specification is a living document. Update as features are added or changed.*
