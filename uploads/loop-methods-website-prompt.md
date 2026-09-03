# Loop Methods — Website Build Prompt

Use this as the master prompt in Claude Code. It covers visual direction, page structure, and section-by-section content/sequence.

---

## Visual Direction (from reference screenshots)

Build a **dark, premium SaaS/consultancy aesthetic**:

- **Background:** near-black (#050608 / #0A0B0F), with a faint dot/grid pattern visible in content sections (see "Six practice areas" screenshot)
- **Accent color:** electric blue (#4FA8FF–#7DC4FF range) for highlights, links, numbered step circles, icon strokes, and CTA buttons
- **Hero:** full-bleed dark background with a large, soft abstract 3D shape/orb (blue-to-purple gradient, glassy/glossy render) positioned bottom-right, bleeding off-canvas — mirrors the reference hero exactly in mood (not literal shape)
- **Hero video:** the user has an existing hero video treatment started in Claude Code — reuse that exact video/motion background as-is; do not redesign it. Layer the headline, eyebrow, subtext, and CTA on top with a dark gradient overlay for legibility, same as the reference.
- **Cards:** dark glass/frosted cards (`rgba(255,255,255,0.03–0.06)` fill, 1px subtle border `rgba(255,255,255,0.08)`, soft rounded corners ~16-20px), used for stat bars, service cards, "why us" cards, and project cards
- **Typography:** large, bold, tight-tracking sans-serif for headlines (weight 600-700), muted gray (#9AA0AC-ish) for body copy, uppercase small-caps tracked-out labels for eyebrows ("WHAT WE DO", "THE TEAM", "FEATURED CASES")
- **Numbered process steps:** circular outlined badges (01–04) connected by a thin horizontal line — only use this treatment for the actual sequential process (Discovery → Build → Governance → Delivery), not decoratively elsewhere
- **Images:** desaturated, moody, dark-toned photography for project cards (as in "Built for real outcomes" screenshot) with a category pill tag (top-left) over the image
- **Team cards:** black-and-white photography, name + role stacked bottom-left, LinkedIn icon top-right, horizontal scroll/carousel with dot pagination + arrow nav
- **Buttons:** pill-shaped, solid blue fill for primary CTA ("Get in Touch →"), outlined/ghost style for nav-adjacent secondary buttons
- **Nav:** floating pill-shaped nav bar, dark with rounded full corners, active item shown as a filled light pill

Match the polish level of the reference screenshots exactly — this is the target fidelity bar, not a rough approximation.

---

## Site Structure

1. Home (`/`)
2. About (`/about`)
3. Services (`/services`) + individual service pages (`/services/[slug]`)
4. Case Studies (`/case-studies`)
5. Career (`/career`) — new, matches reference nav
6. Contact (`/contact`)

**Nav bar:** Home | About | Services | Projects | Career | Contact — with "Get in Touch →" pill button on the far right (matches reference nav exactly, using "Projects" as the label linking to Case Studies).

---

## 1. HOME PAGE — Section by Section

**1. Hero**
- Reuse existing hero video background from Claude Code (do not rebuild)
- Eyebrow: "YOUR PARTNER IN"
- Headline: "Enterprise Technology, Delivered." (blue accent on last word/line)
- Subtext: "Loop Methods engineers scalable AI, cloud, and mobile technology that turns enterprise challenges into measurable outcomes."
- CTA: "Get in Touch →"

**2. Stats Bar** (single dark glass card, 4 columns)
- 20+ Years · 4 Continents · 10+ Industries Served · 15+ Countries

**3. What We Do** (eyebrow: "WHAT WE DO")
- Headline: "Nine practices, one delivery model."
- Subtext: from brochure — "Every engagement is staffed by engineers who own the outcome end to end — from architecture and build through to deployment and run."
- Grid of service cards grouped into 4 categories (Build / Automate / Grow / Run), each card = icon + name + 1-line description + "Learn more →" (links to service detail page)
- Cap the homepage grid at 6 cards (2 rows of 3) with a "View all services →" link below, rather than all 9 — keeps homepage lighter, full list lives on `/services`

**4. How We Build** (numbered 01–04 process, connected line — matches reference)
- Headline: "A clear path from idea to production."
- 01 Discover & Document — "A dedicated business analyst maps the problem first — BRD, feasibility study, and estimation — before a single line is written."
- 02 AI-Accelerated Build — "Engineers work spec-in-hand with AI coding tools handling boilerplate, tests, and repetitive implementation."
- 03 Human Governance Gate — "Every AI-generated module passes a documented review and approval gate — architecture, security, and correctness."
- 04 Verified Delivery — "Every feature is demonstrated and screenshot-verified before hand-off. No black-box delivery."

**5. Why Loop Methods** (eyebrow: "WHY LOOP")
- Headline: "Senior teams. Measurable outcomes."
- Subtext: "We're a multi-industry partner, not a fixed-scope studio. Our senior team turns complex challenges into scalable, secure solutions."
- 4 glass cards (2x2 grid): AI-Accelerated Delivery, Engineer-Governed Quality, Fixed-Scope Clarity, Built to Scale With You (use icons: lightning, shield-check, checklist, bar-chart — matching reference icon style)

**6. HYRIX AI Teaser**
- Distinct section, own gradient background (pink-to-purple, breaking from the site's blue theme intentionally — signals a different product)
- Badge: "AN IN-HOUSE PRODUCT BY LOOP METHODS"
- HYRIX AI logo
- Headline: "Introducing HYRIX AI" / "Hire Smarter. Hire Faster. Hire Better."
- Description: "An AI-native recruiting platform that automates sourcing, screening, and interviewing — while keeping a human in control at every stage. 10x faster hiring, 90% less manual work."
- Mini candidate pipeline bar visual (Sourced 140 → Screened 60 → Interviewed 30 → Shortlisted 9 → Offers sent 3)
- CTA: "Explore HYRIX AI →" — opens `https://www.hyrixai.com` in a new tab

**7. Featured Cases** (eyebrow: "FEATURED CASES")
- Headline: "Built for real outcomes." + "All projects →" link (top-right, matches reference)
- 2x2 (or 4-across) grid of project cards with category pill + desaturated image + title + 1-2 line description + "Know more →"
  - LED360 — AUTOMOTIVE — "A vehicle assistance platform connecting drivers with towing, repairs, and car washes in one place."
  - Trustin Digital Escrow — FINTECH — "A blockchain-powered escrow platform built on Hyperledger Fabric for secure, transparent high-value transactions."
  - WLOG — DISASTER RESPONSE — "A real-time forecasting platform helping government teams monitor river levels and respond faster to floods."
  - Poshan Sathi — HEALTHCARE — "A digital child nutrition platform used by field health teams to flag malnutrition early and manage nutrition camps."

**8. Our Team** (eyebrow: "THE TEAM")
- Headline: "The senior people behind the work."
- Subtext: "Loop Methods is a team of senior engineers, architects, and strategists who've shipped across regulated and emerging industries. Diverse by design and distributed worldwide."
- Horizontal carousel of B&W team photo cards: [Full Name] + role, LinkedIn icon top-right, dot pagination + prev/next arrows below (exact pattern from reference)
- Placeholder roles until real data provided: CEO, CTO, Full Stack Developer, UI/UX Designer, Business Analyst, DevOps Lead

**9. Contact CTA Banner**
- Headline: "Let's Build What's Next."
- Subtext: short line + "Get in Touch →" button

**10. Footer**
- Logo + tagline
- Nav columns: Company (About, Career, Contact) / Services (link to all 9) / Products (HYRIX AI)
- Contact: sales@loopmethods.com · 9811780575
- Offices: Dubai, UAE (Al Karama) · Noida, India (Sector-127)
- Social icons + © 2026 Loop Methods. All rights reserved.

---

## 2. ABOUT PAGE

1. **Header** — "20+ Years of Global Technology Delivery" + intro paragraph
2. **Stats Bar** — 20+ Years · 4 Continents · 10+ Industries Served
3. **Team/Office Image** — dark-toned photo, meeting room scene
4. **Our Legacy** — paragraph (offshore teams, platform upgrades, reliable software)
5. **Our Commitment** — paragraph (outcomes over headcount, API-first, cloud-native)
6. **Our Team (full grid)** — same visual system as Home carousel, but expanded to a full grid (not carousel) with all team members, bios optional
7. **Contact CTA banner**

---

## 3. SERVICES PAGE

1. **Header** — "Solving Enterprise Problems With AI, Cloud & Mobile" + intro
2. **Full Services Grid** — all 9, grouped by category:
   - **Build:** UI/UX Design, AI-Accelerated Development, Mobile App Development
   - **Automate:** AI Agents & Automation, AI Code Governance & Audits
   - **Grow:** SEO & CRO
   - **Run:** Cloud & DevOps, Managed Support & Maintenance, Dedicated Team Pods
3. **Also Delivered** — smaller text list: Data Engineering & BI Dashboards · Web3 & Blockchain Solutions · Accessibility (WCAG) Consulting
4. **How We Build** — reuse the 01-04 process section
5. **CTA** — "Talk to us about your project →"

### Service Detail Page Template (`/services/[slug]`, ×9)
1. Header — icon + name + tagline
2. What It Includes — 3-5 bullets
3. Who It's For — short paragraph
4. Our Approach — 2-3 step mini-process
5. Related Case Study — 1 project card
6. CTA — "Talk to us about [Service Name] →"

---

## 4. CASE STUDIES / PROJECTS PAGE

1. **Header** — "Built for real outcomes." + intro
2. **Filter tags (optional)** — Automotive, Fintech, Healthcare, Web3, IoT, Disaster Response
3. **Full Project Grid** — same card style as Home's Featured Cases, all 5 projects:
   - LED360 (Automotive)
   - Trustin Digital Escrow (Fintech)
   - WLOG: Water Level Management (Disaster Response)
   - Aquira Access (Accessibility)
   - Poshan Sathi (Healthcare)
4. **CTA** — "Want results like these? Let's talk. →"

---

## 5. CAREER PAGE

1. **Header** — "Build With Us." + short intro on culture/team
2. **Why Join** — 3-4 cards (Senior-led teams, AI-accelerated workflow, Global clients, Flexible/remote-friendly)
3. **Open Roles** — list/table (placeholder if none currently open: "No open roles right now — send us your resume anyway")
4. **CTA** — mailto or form → careers@loopmethods.com

---

## 6. CONTACT PAGE

1. **Header** — "Let's Build What's Next."
2. **Two Contact Tracks:**
   - For Custom Solutions & Services — sales@loopmethods.com · 9811780575
   - For HYRIX AI — info@hyrixai.com · www.hyrixai.com
3. **Contact Form** — Name, Email, Company, Project Brief/Message, Submit
4. **Response Note** — "We'll get back to you within 24 hours to schedule your walkthrough."
5. **Office Locations** — Dubai, UAE (Al Karama) · Noida, India (Sector-127) — map embed if feasible
6. **Footer**

---

## SEO Requirements (apply across all pages)

- Unique `<title>` and meta description per page (see prior SEO copy plan)
- One `<h1>` per page matching the section headline
- Alt text on every image, especially project thumbnails and team photos
- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<footer>`)
- Internal links: Home→Services, Home→Case Studies, Service cards→Service detail pages, Project cards→Case study details
- `rel="noopener noreferrer" target="_blank"` on the HYRIX AI external link
- Mobile-first responsive layout, especially the team carousel (must remain swipeable) and the 2x2 project/service grids (stack to 1 column)
- Respect `prefers-reduced-motion` for hero video/orb animation and carousel transitions

---

## Build Notes for Claude Code

- Keep the hero video exactly as already built — only adjust the overlay content (headline/CTA) to match this content plan
- Use the numbered-step treatment (01-04) only for the "How We Build" process — do not reuse it decoratively elsewhere
- Team carousel on Home = preview (5-6 cards, scrollable); About page = full static grid, not a carousel
- Service and Case Study cards share one component (image/pill + title + description + "Know more/Learn more →"), reused across Home, Services, and Case Studies pages for consistency
- HYRIX AI section is the only place the pink/purple gradient appears — keep it isolated so it reads as a distinct product spotlight, not a theme shift
